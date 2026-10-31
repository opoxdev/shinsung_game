import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom} from '../cloudflare/room.js';
import {Core} from '../dist/cloudflare/core.js';
import {Online} from '../src/online.js';

const alice={uid:'a',name:'Alice'},bob={uid:'b',name:'Bob'};
function room(){
  const store=new Map(),sockets=[];
  const storage={get:async k=>structuredClone(store.get(k)),put:async(k,v)=>{store.set(k,structuredClone(v));},
    delete:async k=>{store.delete(k)}};
  const ctx={storage,blockConcurrencyWhile:fn=>fn(),getWebSockets:()=>sockets,acceptWebSocket:s=>sockets.push(s)};
  return new GameRoom(ctx,{});
}
test('authoritative game progresses on sub-second online heartbeat, not 2s server stalls',async()=>{
  const r=room();await new Promise(done=>setImmediate(done));
  const cfg={map:'plains',difficulty:'easy',type:'pvp',modes:[]};
  await r.action('create',{code:'FIGHT1',config:cfg,profile:Core.starterProfile('Alice')},alice);
  await r.action('join',{code:'FIGHT1',profile:Core.starterProfile('Bob')},bob);
  await r.action('start',{},alice);
  r.room.lastPulse=Date.now()-1050;
  const reply=await r.action('pulse',{},alice);
  assert.equal(reply.updated,true);
  assert.ok(r.room.state.time>=0.95,'at least 950ms of game time advanced');
  const prior=r.room.state.time;
  const early=await r.action('pulse',{},alice);
  assert.equal(early.updated,false,'avoid redundant snapshots before cadence threshold');
  assert.equal(r.room.state.time,prior);
});

test('independent WebSocket heartbeat runs without Canvas animation frames and stops on leave',async()=>{
  const client=new Online(),messages=[],saved=globalThis.WebSocket;
  globalThis.WebSocket={OPEN:1};
  client.user={uid:'owner'};
  client.connect=async()=>{
    client.socket={readyState:1,send:message=>messages.push(JSON.parse(message)),close:()=>{}};
    client.matchStatus='playing';client.hostId='owner';
  };
  try{
    await client.watch('FIGHT1',()=>{});
    await new Promise(resolve=>setTimeout(resolve,990));
    assert.ok(messages.some(m=>m.type==='pulse'),'heartbeat must be scheduled without requestAnimationFrame');
    client.stop();
    const count=messages.length;
    await new Promise(resolve=>setTimeout(resolve,950));
    assert.equal(messages.length,count,'leaving a room must clear the heartbeat timer');
  }finally{client.stop();globalThis.WebSocket=saved;}
});
