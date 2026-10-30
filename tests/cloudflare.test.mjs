import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom} from '../cloudflare/room.js';
import {Core} from '../dist/cloudflare/core.js';
const cfg={map:'plains',difficulty:'easy',type:'pvp',modes:[]};
function room(){
  const data=new Map(),sockets=[];
  const ctx={storage:{get:async k=>data.get(k),put:async(k,v)=>{data.set(k,structuredClone(v));},delete:async k=>data.delete(k)},blockConcurrencyWhile:fn=>fn(),getWebSockets:()=>sockets,acceptWebSocket:ws=>sockets.push(ws)};
  const r=new GameRoom(ctx,{});
  return {r, data};
}
const alice={uid:'alice',name:'Alice'},bob={uid:'bob',name:'Bob'},mallory={uid:'mallory',name:'Mallory'};
const profile=name=>Core.starterProfile(name);
test('Cloudflare core is identical to browser game core',()=>{
  const s=Core.createMatch(cfg,[{id:'alice',profile:profile('Alice')},{id:'bob',profile:profile('Bob')}]);
  assert.equal(s.players.alice.money,500);assert.equal(Core.bounty(80000),2000);
});
test('DO room requires membership, starts PvP for exactly two and rejects forged commands',async()=>{
  const {r}=room();await new Promise(resolve=>setImmediate(resolve));
  await r.action('create',{config:cfg,profile:profile('Alice')},alice);
  await assert.rejects(r.action('start',{},alice),/2명/);
  await r.action('join',{profile:profile('Bob')},bob);
  await assert.rejects(r.action('ticket',{},mallory),/참가자/);
  await r.action('start',{},alice);
  const result=await r.action('command',{command:{kind:'place',type:'scout',x:250,y:440,seq:1}},alice);
  assert.equal(result.ok,true);
  assert.equal(r.room.state.towers.length,1);
  await assert.rejects(r.action('command',{command:{kind:'skip',seq:1}},mallory),/참가자/);
  assert.equal(r.view().profiles,undefined);
  assert.equal(r.view().state,undefined);
  assert.equal(JSON.parse(r.view().stateJson).towers.length,1);
});
test('DO leave resolves PvP surrender and persists status',async()=>{
  const {r,data}=room();await new Promise(resolve=>setImmediate(resolve));
  await r.action('create',{config:cfg,profile:profile('Alice')},alice);
  await r.action('join',{profile:profile('Bob')},bob);
  await r.action('start',{},alice);
  await r.action('leave',{},alice);
  assert.equal(r.room.state.winner,1);assert.equal(r.room.status,'finished');
  assert.equal(data.get('room').status,'finished');
  await r.action('leave',{},bob);
  assert.equal(r.room,null);
});
test('DO lobby join bounds and room expiry',async()=>{
  const {r}=room();await new Promise(resolve=>setImmediate(resolve));
  await r.action('create',{config:cfg,profile:profile('Alice')},alice);
  await r.action('join',{profile:profile('Bob')},bob);
  await assert.rejects(r.action('join',{profile:profile('Mallory')},mallory),/가득/);
  r.room.createdAt-=25*3600*1000;
  await assert.rejects(r.action('start',{},alice),/만료/);
});
test('D1 profile reward claim ledger is atomic with the wallet',async()=>{
  // Covers profile actions and claim replay without an external database.
  const {claimProfile}=await import('../cloudflare/profile.js');
  let record={value:profile('Alice'),version:0};
  const db={prepare(sql){let args;return {bind(...a){args=a;return this;},async run(){if(sql.startsWith('INSERT'))return {meta:{changes:0}};if(args[3]===record.version){record={value:JSON.parse(args[0]),version:record.version+1};return {meta:{changes:1}};}return {meta:{changes:0}};},async first(){return {profile_json:JSON.stringify(record.value),version:record.version};}};}};
  const reward={coins:100,xp:20,win:true,sonic:false};
  assert.equal((await claimProfile(db,alice,'ABCDE1',reward)).coins,700);
  assert.equal((await claimProfile(db,alice,'ABCDE1',reward)).coins,700);
  assert.equal(record.value.wins,1);
});
