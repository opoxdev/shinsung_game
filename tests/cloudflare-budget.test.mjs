import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom,ROOM_PULSE_MS,ROOM_FAILOVER_MS,ROOM_SAVE_MS,EFFECT_WINDOW} from '../cloudflare/room.js';
import {Core} from '../dist/cloudflare/core.js';
import {visualPrediction} from '../src/online-prediction.js';

const alice={uid:'alice',name:'Alice'},bob={uid:'bob',name:'Bob'};
async function setup(){
  const map=new Map(),sockets=[],counters={writes:0,reads:0,sends:0};
  const storage={
    async get(k){counters.reads++;return structuredClone(map.get(k));},
    async put(k,v){counters.writes++;map.set(k,structuredClone(v));},
    async delete(k){map.delete(k)}
  };
  const ctx={storage,blockConcurrencyWhile:fn=>fn(),getWebSockets:()=>sockets,acceptWebSocket:s=>sockets.push(s)};
  const game=new GameRoom(ctx,{});
  await new Promise(resolve=>setImmediate(resolve));
  const config={map:'plains',difficulty:'easy',modes:[],type:'pvp'};
  const profile=name=>Core.starterProfile(name);
  await game.action('create',{code:'DUEL12',config,profile:profile('Alice')},alice);
  await game.action('join',{code:'DUEL12',profile:profile('Bob')},bob);
  await game.action('start',{},alice);
  sockets.push({send:()=>counters.sends++});
  return {game,storage,map,counters};
}
test('free tier heartbeat budget reduces room updates by over 65% compared with 900ms protocol',async()=>{
  assert.ok(ROOM_PULSE_MS>=2700);
  assert.ok(ROOM_FAILOVER_MS>ROOM_PULSE_MS*2);
  const oldPerHour=3600000/900,actual=3600000/3000;
  assert.ok(actual/oldPerHour<=.35);
  const {game,counters}=await setup();
  game.room.lastPulse=Date.now()-3100;
  const oldWrites=counters.writes,oldSends=counters.sends;
  const result=await game.action('pulse',{},alice);
  assert.equal(result.updated,true);
  assert.equal(counters.sends,oldSends+1,'one snapshot per room, not per connected player');
  assert.ok(counters.writes-oldWrites<=1,'do not persist every simulation heartbeat');
  assert.equal((await game.action('pulse',{},alice)).updated,false,'reject unnecessary rapid pulses');
});
test('obsolete combat effects are pruned before full snapshot broadcast and persistence',async()=>{
  const {game}=await setup();
  game.room.state.events=Array.from({length:140},(_,i)=>({
    id:10000+i,time:game.room.state.time-6,kind:'ranged',x:100,y:100,tx:200,ty:150,field:0,type:'scout'
  }));
  const before=JSON.stringify(game.view()).length;
  game.room.lastPulse=Date.now()-3100;
  await game.action('pulse',{},alice);
  const after=JSON.stringify(game.view()).length;
  assert.ok(game.room.state.events.every(e=>game.room.state.time-e.time<=EFFECT_WINDOW));
  assert.ok(after<before*.5,'wire snapshot should discard large obsolete effects');
  console.log('Snapshot old/new bytes (140 obsolete effects):',before,after,'saved:',Math.round((1-after/before)*100)+'%');
  assert.ok(game.room.state.events.length<140,'serialized Durable Object state is smaller');
});
test('guest only becomes authoritative if host disappears, never doubles simulation',async()=>{
  const {game}=await setup();
  game.room.lastPulse=Date.now()-3200;
  const startTime=game.room.state.time;
  assert.equal((await game.action('pulse',{},bob)).updated,false);
  assert.equal(game.room.state.time,startTime);
  assert.equal(game.room.host,'alice');
  game.room.lastPulse=Date.now()-ROOM_FAILOVER_MS-200;
  assert.equal((await game.action('pulse',{},bob)).updated,true);
  assert.equal(game.room.host,'bob');
});
test('client prediction faithfully replicates 3-second server interval without changing server state',async()=>{
  const {game}=await setup();
  const server=JSON.parse(JSON.stringify(game.room.state));
  let previous=null,source=null;
  for(let t=0;t<3.0;t+=.05){
    const next=visualPrediction(server,t,previous,source);
    previous=next.state;source=next.source;
  }
  assert.ok(previous.time>=2.9);
  assert.equal(server.time,0,'client display prediction must not modify authoritative state');
  const expected=JSON.parse(JSON.stringify(server));
  Core.advance(expected,previous.time);
  assert.deepEqual(previous,expected,'clients use the same deterministic engine as DO server');
});
test('room storage writes are throttled while command responses remain immediate',async()=>{
  assert.ok(ROOM_SAVE_MS>=12000);
  const {game,counters}=await setup();
  const before=counters.writes;
  game.room.lastSavedWave=game.room.state.wave;
  for(let i=0;i<4;i++){
    game.room.lastPulse=Date.now()-3100;
    await game.action('pulse',{},alice);
  }
  assert.equal(counters.writes,before,'no repeated DO storage writes during same wave and save window');
  const response=await game.action('command',{command:{kind:'place',type:'scout',x:250,y:440,seq:1}},alice);
  assert.equal(response.ok,true);
  assert.ok(counters.writes>before,'mutating commands must be persisted immediately');
});

test('public WebSocket room payload never leaks persistence metadata or membership IDs',async()=>{
  const {game}=await setup();
  const wire=game.view();
  assert.equal(wire.host,'alice');
  assert.deepEqual(Object.keys(wire).sort(),['code','config','host','names','stateJson','status'].sort());
  assert.equal(wire.members,undefined);
  assert.equal(wire.profiles,undefined);
  assert.equal(wire.lastSavedAt,undefined);
});

test('D1 existing profiles are read without repeated INSERT statements',async()=>{
  const {getProfile}=await import('../cloudflare/profile.js');
  const {Core}=await import('../dist/cloudflare/core.js');
  const record=Core.starterProfile('Alice');
  const counters={selects:0,inserts:0};
  const db={prepare(sql){
    return {
      bind(){return this;},
      async first(){counters.selects++;return {profile_json:JSON.stringify(record),version:0};},
      async run(){counters.inserts++;return {meta:{changes:0}};}
    };
  }};
  for(let i=0;i<5;i++)assert.equal((await getProfile(db,alice)).value.name,record.name);
  assert.equal(counters.selects,5);
  assert.equal(counters.inserts,0,'a known user should not spend D1 write queries on each authenticated call');
});

test('DO cold restart reconstructs deterministic progress from saved checkpoint for live WebSockets',async()=>{
  const saved=new Map(),sockets=[{send:()=>{}}],state={
    get:async key=>structuredClone(saved.get(key)),
    put:async(key,value)=>saved.set(key,structuredClone(value)),
    delete:async key=>saved.delete(key)
  };
  const ctx={storage:state,blockConcurrencyWhile:fn=>fn(),getWebSockets:()=>sockets,acceptWebSocket:s=>sockets.push(s)};
  const original=new GameRoom(ctx,{});
  await new Promise(resolve=>setImmediate(resolve));
  await original.action('create',{code:'COLD12',config:{type:'pvp',map:'plains',difficulty:'easy',modes:[]},
    profile:Core.starterProfile('Alice')},alice);
  await original.action('join',{code:'COLD12',profile:Core.starterProfile('Bob')},bob);
  await original.action('start',{},alice);
  const checkpoint=JSON.parse(JSON.stringify(original.room.state));
  original.room.lastPulse=Date.now()-10100;
  await original.persist();
  const restored=new GameRoom(ctx,{});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(restored.recovering,true);
  assert.equal(restored.advance(),true);
  const expected=JSON.parse(JSON.stringify(checkpoint));
  Core.advance(expected,restored.room.state.time-checkpoint.time);
  assert.deepEqual(restored.room.state.enemies,expected.enemies);
  assert.ok(restored.room.state.time>=10,'active hibernated clients must not lose unsaved battle time');
});
