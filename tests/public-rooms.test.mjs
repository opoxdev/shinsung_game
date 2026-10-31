import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../cloudflare/room.js';
import { listRooms } from '../cloudflare/worker.js';
import { Core } from '../dist/cloudflare/core.js';

const alice={uid:'alice',name:'Alice'},bob={uid:'bob',name:'Bob'};
const cfg=type=>({type,map:'plains',difficulty:'easy',modes:[]});
function server(){
  const objects=new Map();
  const env={ROOMS:{
    idFromName:name=>name,
    get(name){
      if(!objects.has(name)){
        const store=new Map(),sockets=[];
        const ctx={
          storage:{
            async get(k){return structuredClone(store.get(k));},
            async put(k,v){store.set(k,structuredClone(v));},
            async delete(k){store.delete(k);}
          },
          blockConcurrencyWhile:fn=>fn(),
          getWebSockets:()=>sockets,
          acceptWebSocket:s=>sockets.push(s)
        };
        objects.set(name,new GameRoom(ctx,env));
      }
      const instance=objects.get(name);
      return {fetch:(url,options)=>instance.fetch(new Request(url,options))};
    }
  }};
  return {env,room:code=>objects.get(code)};
}
async function create(env,code,type,user=alice){
  const stub=env.ROOMS.get(code);
  await new Promise(resolve=>setImmediate(resolve));
  const res=await stub.fetch('https://room/action',{method:'POST',body:JSON.stringify({
    action:'create',payload:{code,config:cfg(type),profile:Core.starterProfile(user.name)},user
  })});
  const data=await res.json();assert.equal(data.ok,true,JSON.stringify(data));return stub;
}
async function action(stub,name,payload,user=alice){
  const response=await stub.fetch('https://room/action',{method:'POST',body:JSON.stringify({action:name,payload,user})});
  const result=await response.json();
  if(!result.ok)throw Error(result.error);
  return result.data;
}
test('created PvP and co-op rooms appear with accurate map, occupancy and no private data',async()=>{
  const {env}=server();
  await create(env,'LOBBY1','pvp');
  await create(env,'LOBBY2','coop');
  await create(env,'SOLO11','solo');
  const rooms=await listRooms(env);
  assert.deepEqual(rooms.map(r=>r.code),['LOBBY2','LOBBY1']);
  assert.deepEqual(rooms.map(r=>r.type),['coop','pvp']);
  for(const r of rooms){
    assert.equal(r.name,'Alice');
    assert.equal(r.map,'plains');
    assert.equal(r.difficulty,'easy');
    assert.equal(r.count,1);
    assert.equal(r.capacity,r.type==='pvp'?2:4);
    assert.equal(r.members,undefined);
    assert.equal(r.profiles,undefined);
  }
});
test('joining, starting and leaving update public list while full rooms cannot be joined',async()=>{
  const {env}=server();
  const pvp=await create(env,'FIGHT1','pvp');
  await action(pvp,'join',{code:'FIGHT1',profile:Core.starterProfile('Bob')},bob);
  assert.equal((await listRooms(env)).length,0,'A full 2/2 PvP room is not joinable');
  await action(pvp,'leave',{},bob);
  let rooms=await listRooms(env);
  assert.equal(rooms.length,1);
  assert.equal(rooms[0].count,1);
  await action(pvp,'join',{code:'FIGHT1',profile:Core.starterProfile('Bob')},bob);
  await action(pvp,'start',{});
  assert.equal((await listRooms(env)).length,0,'Started matches leave the public list');
  await assert.rejects(action(pvp,'join',{code:'FIGHT1',profile:Core.starterProfile('Bob')},bob),/참가할 수 없는/);
});
test('co-op rooms show changing occupancy and disappear when the host exits',async()=>{
  const {env}=server(),lobby=await create(env,'COOP11','coop');
  await action(lobby,'join',{code:'COOP11',profile:Core.starterProfile('Bob')},bob);
  assert.equal((await listRooms(env))[0].count,2);
  await action(lobby,'leave',{},bob);
  assert.equal((await listRooms(env))[0].count,1);
  await action(lobby,'leave',{},alice);
  assert.equal((await listRooms(env)).length,0);
});
test('stale listings are evicted and cannot remain indefinitely',async()=>{
  const {env}=server();
  await create(env,'STALE1','pvp');
  const stub=env.ROOMS.get('PUBLIC_ROOM_DIRECTORY_V1');
  const response=await stub.fetch('https://directory/action',{method:'POST',body:JSON.stringify({
    action:'directorySync',payload:{code:'STALE1',entry:{
      code:'STALE1',name:'Alice',type:'pvp',map:'plains',difficulty:'easy',
      count:1,capacity:2,createdAt:Date.now()-3*3600*1000
    }}
  })});
  assert.equal((await response.json()).ok,true);
  assert.equal((await listRooms(env)).length,0);
});
