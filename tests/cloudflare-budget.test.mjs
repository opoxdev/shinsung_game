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
  assert.ok(ROOM_SAVE_MS>=15000);
  const {game,counters}=await setup();
  const before=counters.writes;
  game.room.lastSavedWave=game.room.state.wave;
  for(let i=0;i<4;i++){
    game.room.lastPulse=Date.now()-3100;
    await game.action('pulse',{},alice);
  }
  assert.equal(counters.writes,before,'no repeated DO storage writes during same wave and save window');
  const response=await game.action('command',{command:{kind:'skip',seq:1}},alice);
  assert.equal(response.ok,true);
  assert.ok(counters.writes>before,'mutating commands must be persisted immediately');
});
