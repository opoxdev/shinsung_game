import test from 'node:test';
import assert from 'node:assert/strict';
import {EVENTS,MAPS,DIFFICULTIES,ENEMIES,TOWERS,starterProfile,campaignOf} from '../src/data.js';
import {validateConfig,createMatch,advance,command,rewardFor,applyReward,achievementRun} from '../src/engine.js';
import {character} from '../src/art.js';
import {Core} from '../dist/cloudflare/core.js';
import {roomLoadout,applyAction} from '../cloudflare/worker.js';
import {matchmakingMarkup,waitingRoomMarkup} from '../src/matchmaking.js';
import {readFileSync} from 'node:fs';

const event=EVENTS.temple_of_ruin;
const solo={type:'solo',map:event.map,difficulty:'normal',modes:[],eventId:event.id};
const coop={...solo,type:'coop'};
const student={uid:'temple-player',name:'Temple',email:'temple@example.test'};
function fakeDb(){
  let value=starterProfile('Temple'),version=0,writes=0;
  return {db:{prepare(sql){let args=[];return {bind(...a){args=a;return this;},
    async first(){return {profile_json:JSON.stringify(value),version};},
    async run(){if(sql.startsWith('INSERT'))return {meta:{changes:0}};
      if(!sql.startsWith('UPDATE profiles'))throw Error('SQL unexpected '+sql);
      if(args[3]!==version)return {meta:{changes:0}};
      value=JSON.parse(args[0]);version++;writes++;return {meta:{changes:1}};}
  };}},get:()=>value,writes:()=>writes};
}
test('event remains independent of six difficulties and five extra modes',()=>{
  assert.equal(DIFFICULTIES.length,6);assert.equal(Object.keys(EVENTS).length,1);
  assert.equal(event.waves.length,30);
  assert.equal(event.map,'temple_ruin');
  assert.equal(event.firstClearTower,'oldgod');
  assert.equal(event.startMoney,4200);
  assert.equal(campaignOf(solo),event);
  assert.deepEqual(validateConfig(solo),solo);
  assert.deepEqual(validateConfig(coop),coop);
});
test('normal maps and PvP cannot start an event or select its map or enemies',()=>{
  const standard={type:'solo',map:'plains',difficulty:'easy',modes:[]};
  assert.deepEqual(validateConfig(standard),standard);
  assert.throws(()=>validateConfig({...solo,type:'pvp'}),/이벤트/);
  assert.throws(()=>validateConfig({...solo,modes:['elite']}),/이벤트/);
  assert.throws(()=>validateConfig({...solo,map:'plains'}),/이벤트/);
  assert.throws(()=>validateConfig({...solo,eventId:'unknown'}),/이벤트/);
  assert.throws(()=>validateConfig({...standard,map:'temple_ruin'}),/맵/);
  assert.equal(MAPS.filter(m=>m.eventOnly).length,1);
  const exclusive=Object.entries(ENEMIES).filter(([,v])=>v.eventOnly===event.id).map(([id])=>id);
  assert.equal(exclusive.length,8);
  for(const w of event.waves)for(const [id,count] of w.groups){
    assert.ok(exclusive.includes(id),'normal monster in event: '+id);
    assert.ok(count>0&&count<=60);
  }
  assert.ok(event.waves[29].groups.some(([id])=>id==='temple_deity'));
});
test('event map is a long folded combat lane with neighboring tower-range lanes',()=>{
  const map=MAPS.find(m=>m.id===event.map);
  const length=map.path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-map.path[i][0],p[1]-map.path[i][1]),0);
  assert.ok(length>9700);
  assert.ok(map.path.length>=10);
  assert.ok(map.path.every(([x,y])=>x>=0&&x<=1800&&y>=0&&y<=1100));
  assert.ok(map.biome==='temple');
});
test('solo event uses local core and 30 authored waves with generous starting funds',()=>{
  const profile=starterProfile();
  const state=createMatch(solo,[{id:'local',profile}]);
  assert.equal(state.players.local.money,4200);
  assert.equal(state.wave,1);
  assert.ok(state.queue.every(item=>ENEMIES[item.type].eventOnly===event.id));
  assert.ok(state.queue.length>=16);
  advance(state,1.5);
  assert.ok(state.enemies.length>0);
  assert.equal(Core.validateConfig(solo).eventId,event.id);
  assert.equal(Core.createMatch(solo,[{id:'local',profile}]).players.local.money,4200);
  assert.equal(Core.campaignOf(solo).waves.length,30);
});
test('two-to-four player event coop shares the same map and waves without PvP',()=>{
  const p=starterProfile();
  const match=createMatch(coop,[{id:'a',profile:p},{id:'b',profile:p}]);
  assert.equal(match.fields.length,1);
  assert.equal(match.players.a.field,0);
  assert.equal(match.players.b.field,0);
  assert.equal(match.wave,1);
  assert.throws(()=>createMatch({...solo,type:'pvp'},[{id:'a',profile:p},{id:'b',profile:p}]),/이벤트/);
  assert.match(matchmakingMarkup('coop',coop,{loggedIn:true}),/파멸의 신전 · 협동 공략/);
  assert.match(matchmakingMarkup('coop',coop,{loggedIn:true}),/data-event-id="temple_of_ruin"/);
  assert.doesNotMatch(matchmakingMarkup('coop',coop,{loggedIn:true}),/lobby-difficulty|lobby-map/);
  const waiting=waitingRoomMarkup('ABC123',{config:coop,names:{a:'A',b:'B'},host:'a'},'a');
  assert.match(waiting,/파멸의 신전/);
});
test('Ancient God is permanently unlocked once; combat has divine judgement mechanics',()=>{
  const tower=TOWERS.oldgod;
  assert.equal(tower.rarity,'mythic');
  assert.equal(tower.price,null);
  assert.equal(tower.kind,'judgement');
  assert.ok(tower.splash>=140&&tower.range>=500&&tower.bossBonus>1);
  assert.ok(tower.cost>=8000);
  const portrait=character('oldgod');
  for(const word of ['god-halo','god-core','god-flesh','고대의 신'])assert.match(portrait,new RegExp(word));
  assert.match(portrait,/data-base="oldgod"/);
  const p=starterProfile();
  const s=createMatch(solo,[{id:'local',profile:p}]);
  s.wave=30;s.status='victory';
  const reward=rewardFor(s,'local');
  assert.equal(reward.oldgod,true);
  const before=p.owned.length;
  applyReward(p,reward);
  assert.equal(p.owned.length,before+1);
  assert.ok(p.owned.includes('oldgod'));
  const loss={...s,status:'defeat'};
  assert.equal(rewardFor(loss,'local').oldgod,false);
  const normal=createMatch({type:'solo',map:'plains',difficulty:'easy',modes:[]},[{id:'local',profile:p}]);
  normal.status='victory';normal.wave=10;
  assert.equal(rewardFor(normal,'local').oldgod,false);
});
test('signed-in local Temple completion settles server reward in one D1 CAS, retries are idempotent',async()=>{
  const f=fakeDb(),id='9eb83cb3-b958-48f0-bfa0-9a513a0f6fc1';
  const data={runId:id,config:solo,wave:30,win:true,achievementRun:{kills:180,places:21,upgrades:15,flawless:false}};
  const a=await applyAction({DB:f.db},'soloReward',data,student);
  assert.equal(f.writes(),1);
  assert.ok(a.owned.includes('oldgod'));
  assert.ok(a.coins>600);
  const b=await applyAction({DB:f.db},'soloReward',data,student);
  assert.equal(f.writes(),1);
  assert.deepEqual(b.owned.filter(id=>id==='oldgod'),['oldgod']);
  await assert.rejects(applyAction({DB:f.db},'soloReward',{...data,wave:29},student),/마지막 웨이브/);
});
test('Temple event is separate in UI and visible to player without additional server polling',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/function templePage\(/);
  assert.match(main,/templeSolo\(\)/);
  assert.match(main,/templeCoop\(\)/);
  assert.match(main,/oldgod/);
  assert.match(main,/const list=rooms\.filter\(r=>r\.type===mode/);
  const render=readFileSync(new URL('../src/render.js',import.meta.url),'utf8');
  assert.match(render,/e\.kind==='divine'/);
  assert.match(render,/d\.eventOnly==='temple_of_ruin'/);
  const terrain=readFileSync(new URL('../src/terrain.js',import.meta.url),'utf8');
  assert.match(terrain,/map\.biome==='temple'/);
});
