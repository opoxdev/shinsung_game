import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TOWERS,MODES,ENEMIES,DIFFICULTIES,MAPS,starterProfile} from '../src/data.js';
import {createMatch,tick,command,rewardFor,towerStats,validateConfig,modifiers,pointOnPath} from '../src/engine.js';
import {EVOLUTIONS} from '../src/evolutions.js';
import {character} from '../src/art.js';
import {EFFECT_TYPES,isTowerAttackEffect} from '../src/combat-fx.js';
import {visualPrediction} from '../src/online-prediction.js';
import {MotionView} from '../src/presentation.js';

const make=(over={})=>createMatch({type:'solo',map:'plains',difficulty:'easy',modes:[],...over},
 [{id:'a',profile:{...starterProfile(),loadout:Object.keys(TOWERS)}}]);
const enemy=(id,x,y,progress)=>({
 id,type:'heavy',field:0,x,y,progress,hp:10000,maxHp:10000,shield:0,
 maxShield:0,speed:0
});
const place=(s,type,x=200,y=240)=>{const t={id:s.nextId++,type,owner:'a',field:0,x,y,
 level:0,cd:0,shots:0,target:'first'};s.towers.push(t);return t;};

test('all six clear rewards become 8x coins and 3x XP, with completion bonuses separated',()=>{
 for(const d of DIFFICULTIES){
  const s=make({difficulty:d.id});s.status='victory';s.winner=0;
  s.wave=d.waves.length;
  const r=rewardFor(s,'a');
  assert.equal(r.coins,d.reward*8);
  assert.equal(r.xp,d.waves.length*60);
  assert.equal(r.clearBonus,Math.floor(r.coins*.70));
  assert.equal(r.win,true);
  s.status='defeat';const partial=rewardFor(s,'a');
  assert.ok(partial.coins<d.reward,'failed full-run rewards remain small');
  assert.equal(partial.clearBonus,0);
 }
 const s=make({difficulty:'extreme',modes:['elite']});s.status='victory';
 assert.equal(rewardFor(s,'a').coins,Math.floor(1100*MODES.elite.reward)*8);
 const pvp=createMatch({type:'pvp',map:'plains',difficulty:'normal',modes:[]},
  [{id:'a',profile:starterProfile()},{id:'b',profile:starterProfile()}]);
 pvp.status='complete';pvp.winner=0;
 assert.equal(rewardFor(pvp,'a').coins,0);
});

test('defeat yields zero money and XP before halfway, then only a small graduated stipend',()=>{
 for(const d of DIFFICULTIES){
  for(const modes of [[],['elite','eclipse','laststand']]){
   const match=make({difficulty:d.id,modes});
   match.status='defeat';
   const minimum=Math.ceil(d.waves.length/2);
   for(const wave of [0,1,Math.max(1,minimum-1)]){
    match.wave=wave;
    const result=rewardFor(match,'a');
    assert.equal(result.coins,0,d.id+' wave '+wave+' should never farm coins');
    assert.equal(result.xp,0,d.id+' wave '+wave+' should never farm XP');
    assert.equal(result.clearBonus,0);
   }
   match.wave=minimum;
   const midpoint=rewardFor(match,'a');
   assert.ok(midpoint.coins>=0&&midpoint.coins<d.reward,
    d.id+' reaching the midpoint should only grant a minimal stipend');
   assert.ok(midpoint.xp>0,'the midpoint unlocks participation XP');
   match.wave=d.waves.length;
   const finalLoss=rewardFor(match,'a');
   assert.ok(finalLoss.coins>=midpoint.coins);
   assert.ok(finalLoss.coins<rewardFor({...match,status:'victory'},'a').coins);
  }
 }
 const raid=createMatch({type:'solo',map:'temple_ruin',difficulty:'normal',
  modes:[],eventId:'temple_of_ruin'},[{id:'a',profile:starterProfile()}]);
 raid.status='defeat';raid.wave=Math.ceil(30/2)-1;
 assert.equal(rewardFor(raid,'a').coins,0);
 assert.equal(rewardFor(raid,'a').xp,0);
});

test('solar lance pierces the complete line but does not damage off-axis targets',()=>{
 const s=make();s.queue=[];
 const direct=enemy(8001,300,240,300),behind=enemy(8002,380,241,250),
  outside=enemy(8003,305,318,180);
 s.enemies=[direct,behind,outside];place(s,'sunlancer');
 tick(s);
 assert.ok(direct.hp<10000&&behind.hp<10000,'beam must hit multiple enemies in its line');
 assert.equal(outside.hp,10000,'beam must not arbitrarily hit nearby targets outside width');
 assert.ok(s.events.some(e=>e.kind==='beam'&&e.type==='sunlancer'));
 for(let i=0;i<=4;i++){
  const stats=towerStats({type:'sunlancer',level:i});
  assert.ok(stats.beamWidth>=48&&stats.beamTargets>=7);
 }
});

test('gravity mage chains slow and venom gardener applies splash, poison and slow',()=>{
 const s=make();s.queue=[];s.enemies=[enemy(9001,300,240,300),enemy(9002,390,240,200)];
 place(s,'graviturge');
 tick(s);
 assert.ok(s.enemies.every(e=>e.hp<10000&&e.slowUntil>s.time));
 assert.ok(s.events.some(e=>e.kind==='chain'&&e.type==='graviturge'));
 const a=make();a.queue=[];a.enemies=[enemy(9101,300,240,300),enemy(9102,330,265,250)];
 place(a,'thornkeeper');tick(a);
 assert.ok(a.enemies.every(e=>e.hp<10000&&e.dotUntil>a.time&&e.slowUntil>a.time));
 assert.ok(a.events.some(e=>e.kind==='splash'&&e.type==='thornkeeper'));
});

test('new roster contains three independently illustrated specialists with four evolutions',()=>{
 const ids=['sunlancer','graviturge','thornkeeper'];
 assert.equal(Object.keys(TOWERS).length,42);
 for(const id of ids){
  assert.equal(EVOLUTIONS[id].length,4);
  assert.equal(TOWERS[id].upgrades.length,4);
  assert.ok(TOWERS[id].cost>=800&&TOWERS[id].price>0);
  assert.match(character(id),new RegExp('data-base="'+id+'"'));
  assert.notEqual(character(id,'default',4),character(id,'default',0));
  assert.ok(EFFECT_TYPES.includes(id));
  assert.ok(towerStats({type:id,level:4}).damage>towerStats({type:id,level:0}).damage*3);
 }
 assert.equal(isTowerAttackEffect({kind:'beam',type:'sunlancer'}),true);
});

test('eclipse mode brings added spectral enemies every 4 waves and preserves regular mode mixing',()=>{
 assert.ok(Object.hasOwn(MODES,'eclipse')&&Object.hasOwn(MODES,'laststand'));
 assert.deepEqual(validateConfig({type:'solo',map:'plains',difficulty:'hard',
  modes:['eclipse','laststand','darkenergy','rift']}).modes,
  ['eclipse','laststand','darkenergy','rift']);
 const basic=make(),eclipse=make({modes:['eclipse']});
 for(const s of [basic,eclipse]){
  s.wave=3;s.queue=[];s.enemies=[];s.waveDeadline=0;
  tick(s);assert.equal(s.wave,4);
 }
 const extra=eclipse.queue.length-basic.queue.length;
 assert.equal(extra,2);
 assert.ok(eclipse.queue.some(e=>e.type==='ghost'));
 assert.equal(eclipse.events.some(e=>e.kind==='eclipse'),true);
 const end=make({difficulty:'ruin',modes:['eclipse']});
 end.wave=31;end.queue=[];end.enemies=[];end.waveDeadline=0;
 tick(end);assert.equal(end.wave,32);
 assert.ok(end.queue.some(e=>e.type==='phantom'));
});

test('Last Stand begins at 55 HP in solo, coop and both PvP fields',()=>{
 for(const type of ['solo','coop','pvp']){
  const players=type==='solo'?[{id:'a',profile:starterProfile()}]:
   [{id:'a',profile:starterProfile()},{id:'b',profile:starterProfile()}];
  const s=createMatch({type,map:'plains',difficulty:'easy',modes:['laststand']},players);
  assert.deepEqual(s.fields,type==='pvp'?[55,55]:[55]);
  assert.ok(modifiers(s.config).reward>2);
 }
 assert.deepEqual(make().fields,[100]);
});

test('multiplayer prediction limits full simulation ticks per display frame, including dense fights',()=>{
 const s=make();s.waveDeadline=10000;s.queue=[];
 const first=visualPrediction(s,3);
 assert.ok(first.state.time<=.21&&first.state.time>=.19);
 s.enemies=Array.from({length:170},(_,i)=>enemy(5000+i,300+i%6*20,240+i%3*25,i));
 const dense=visualPrediction(s,3);
 assert.ok(dense.state.time<=.11&&dense.state.time>=.09,
  'crowded co-op fights cannot burst 12 CPU-heavy ticks in one animation frame');
 assert.equal(s.time,0,'display prediction must not mutate server state');
 const source=readFileSync(new URL('../src/render.js',import.meta.url),'utf8');
 assert.match(source,/offset\+WORLD\.width\+TERRAIN_MARGIN<this\.camera\.x-viewHalfWidth/,
  'opponent PvP world must be culled when offscreen');
});

test('multiplayer lane summons extrapolate along authored path instead of leaping toward targets',()=>{
 const s=make();s.queue=[];s.enemies=[];
 const path=MAPS.find(m=>m.id==='plains').path;
 const start=pointOnPath(path,1050);
 s.units=[{id:9100,role:'lane',type:'summoner',field:0,from:1,progress:1050,
  speed:115,x:start.x,y:start.y,life:40,hp:80,maxHp:80,target:9999}];
 const view=new MotionView();
 for(let i=0;i<30;i++)view.sample(s,path,{online:true,ahead:1,dt:.1});
 const expected=pointOnPath(path,935),v=view.view.units[0];
 assert.ok(Math.hypot(v.x-expected.x,v.y-expected.y)<1.5,
  'allied march interpolation must follow the road, even without a visible enemy');
});
