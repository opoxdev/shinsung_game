import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {starterProfile,TOWERS,DIFFICULTIES} from '../src/data.js';
import {roomLoadout,applyAction} from '../cloudflare/worker.js';
import {claimSoloProfile,importV098Profile} from '../cloudflare/profile.js';
import {loadClientProfile,saveClientProfile,exportSave,importSave} from '../src/client-profile.js';

const user={uid:'student-1',name:'Student',email:'student@example.test',emailVerified:true};
function mock(){
  let value=starterProfile('Student'),version=0,updated=0;
  const calls={reads:0,writes:0};
  const db={prepare(sql){
    let args=[];
    const stmt={
      bind(...x){args=x;return stmt;},
      async first(){
        calls.reads++;
        if(sql.startsWith('SELECT profile_json'))return {profile_json:JSON.stringify(value),version};
        throw Error('Unexpected D1 read '+sql);
      },
      async run(){
        if(sql.startsWith('UPDATE profiles')){
          if(version!==args[3])return {meta:{changes:0}};
          value=JSON.parse(args[0]);version++;updated=args[1];calls.writes++;
          return {meta:{changes:1}};
        }
        if(sql.startsWith('INSERT'))return {meta:{changes:0}};
        throw Error('Unexpected D1 write '+sql);
      }
    };
    return stmt;
  }};
  return {db,calls,get:()=>value};
}
const run=()=> '3fb7280a-6769-4946-a9ed-a9a3e279c235';
test('signed-in account purchases use D1 CAS while preserving collection across later reads',async()=>{
  const {db,calls,get}=mock();
  const env={DB:db};
  const original=get().coins;
  const profile=await applyAction(env,'profileAction',{kind:'buyTower',id:'archer'},user);
  assert.equal(profile.coins,original-TOWERS.archer.price);
  assert.ok(profile.owned.includes('archer'));
  assert.equal(calls.writes,1);
  const loaded=await applyAction(env,'profile',{},user);
  assert.deepEqual(loaded,profile);
  const equipped=await applyAction(env,'profileAction',{kind:'equip',id:'archer'},user);
  assert.ok(equipped.loadout.includes('archer'));
  assert.ok(calls.writes>=2);
});
test('solo is locally simulated but end-of-match payout is one D1 write, even on retry',async()=>{
  const {db,calls,get}=mock(),env={DB:db};
  const config={type:'solo',map:'plains',difficulty:'easy',modes:[]};
  const payload={runId:run(),config,wave:DIFFICULTIES[0].waves.length,win:true};
  const prior=get().coins;
  const a=await applyAction(env,'soloReward',payload,user);
  assert.ok(a.coins>prior);
  assert.equal(calls.writes,1);
  const b=await applyAction(env,'soloReward',payload,user);
  assert.equal(b.coins,a.coins);
  assert.equal(calls.writes,1,'idempotent reward: exactly one actual D1 update');
  assert.deepEqual(get().claimedSoloRuns,[run()]);
  await assert.rejects(applyAction(env,'soloReward',{...payload,wave:1},user),/마지막 웨이브/);
  await assert.rejects(applyAction(env,'soloReward',{...payload,config:{...config,type:'pvp'}},user),/솔로/);
  await assert.rejects(applyAction(env,'soloReward',{...payload,runId:'invalid'},user),/솔로 플레이 기록/);
  assert.equal(calls.writes,1);
});
test('loss reward is derived from canonical difficulty and actual wave, not supplied coins',async()=>{
  const {db,calls,get}=mock();
  const a=await applyAction({DB:db},'soloReward',{
    runId:run(),config:{type:'solo',map:'plains',difficulty:'easy',modes:[]},
    wave:3,win:false,coins:999999999,xp:999999999
  },user);
  assert.ok(a.coins<999999999);
  assert.ok(a.xp<999999999);
  assert.equal(calls.writes,1);
});
test('existing v0.9.8 device progress migrates exactly once into existing D1 profile',async()=>{
  const {db,get,calls}=mock();
  const old=starterProfile('Old Student');old.coins=12400;old.xp=370;old.wins=8;
  old.owned.push('rail');old.loadout.push('rail');
  const migrated=await importV098Profile(db,user,old);
  assert.equal(migrated.coins,12400);
  assert.ok(migrated.owned.includes('rail'));
  assert.equal(migrated.importedV098,true);
  assert.equal(calls.writes,1);
  old.coins=90000000;
  const again=await importV098Profile(db,user,old);
  assert.equal(again.coins,12400);
  assert.equal(calls.writes,1);
  assert.equal(get().coins,12400);
});
test('multiplayer only accepts equipped towers and packs genuinely owned in D1',()=>{
  const p=starterProfile('Student');
  assert.deepEqual(roomLoadout(p,{loadout:['scout'],pack:'basic'}).loadout,['scout']);
  assert.throws(()=>roomLoadout(p,{loadout:['rail'],pack:'basic'}),/보유한 타워/);
  assert.throws(()=>roomLoadout(p,{loadout:['scout'],pack:'ghost'}),/몬스터 팩/);
  assert.throws(()=>roomLoadout(p,{loadout:['scout','scout'],pack:'basic'}),/보유한 타워/);
  assert.equal(roomLoadout(p,null),p);
});
test('signed-in solo entry has no room, WebSocket, pulse or periodic worker calls',()=>{
  const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const start=source.split("function startLocal(type='solo'){")[1]?.split('function beginGame()')[0];
  assert.ok(start);assert.doesNotMatch(start,/online\.call|fetch\(|openRoom|online\.watch/);
  assert.match(start,/createMatch\(config,players\)/);
  const finish=source.split('async function finish(){')[1]?.split('const maxWaves=')[0];
  assert.match(finish,/online\.call\('soloReward'/);
  assert.doesNotMatch(finish,/online\.call\('createRoom'|online\.call\('start'|online\.watch|pulse/);
  const mutation=source.split('async function mutate(a,reveal=false){')[1]?.split('function account()')[0];
  assert.match(mutation,/online\.call\('profileAction',a\)/);
  assert.match(source,/await switchAccountProfile\(user\)/);
  assert.doesNotMatch(source,/saveClientProfile\(playerStorage,currentUid\(\),profile\)/);
});
test('guest profile and JSON backup still work without changing D1 accounts',()=>{
  const local={getItem:k=>local.value??null,setItem:(k,v)=>{local.value=v;},value:null};
  const guest=loadClientProfile(local);
  guest.coins=450;
  saveClientProfile(local,null,guest);
  assert.equal(loadClientProfile(local).coins,450);
  assert.equal(importSave(exportSave(guest)).coins,450);
});
