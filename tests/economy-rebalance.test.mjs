import test from 'node:test';
import assert from 'node:assert/strict';
import {COMBAT_SCALE,TOWERS,ENEMIES,DIFFICULTIES,WAVE_FORMATIONS,evolveWaveGroups,starterProfile} from '../src/data.js';
import {DAMAGE_CASH_FACTOR,bounty,createMatch,tick,command} from '../src/engine.js';
import {EVOLUTIONS} from '../src/evolutions.js';

const previousInstallCosts={
 scout:150,soldier:260,blade:230,cannon:450,summoner:570,workshop:610,
 rail:850,oldgod:8500,voidwalker:1350,sonic:720,archer:780,chef:270,
 chemist:980,icewitch:290,spirit:1480,firefly:960,knight:900,
 drone:1250,clockmaker:390,banker:340,mermaid:790,prism:1090,
 reaper:2200,storm:1900,phoenix:2800,aurora:3200,starseed:145,
 hunter:2200,scrap:1450,lullaby:195,papercrane:320,pulsekeeper:750,
 duskarcher:940,crystalspider:1650,marker:680
};
const make=(difficulty='easy')=>createMatch(
 {type:'solo',map:'plains',difficulty,modes:[]},
 [{id:'a',profile:{...starterProfile(),loadout:Object.keys(TOWERS)}}]
);
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,
 `expected ${expected} but got ${actual}`);

test('all 35 battlefield placement prices increase, without sorting towers by rarity',()=>{
 assert.deepEqual(Object.keys(TOWERS).sort(),Object.keys(previousInstallCosts).sort());
 let minFactor=Infinity,maxFactor=-Infinity;
 for(const [id,previous] of Object.entries(previousInstallCosts)){
  const {cost}=TOWERS[id];
  assert.ok(Number.isSafeInteger(cost)&&cost%10===0,id);
  const factor=cost/previous;
  minFactor=Math.min(minFactor,factor);maxFactor=Math.max(maxFactor,factor);
  assert.ok(factor>=1.3,id+' must cost meaningfully more, not merely 1-2 coins');
  assert.ok(factor<=2.1,id+' should not become an inaccessible trap purchase');
 }
 assert.ok(maxFactor>=1.8&&minFactor<=1.45,'cheap and powerful towers get different premiums');
 assert.ok(TOWERS.scout.cost<=500,'the opening wallet can buy a basic defender');
 assert.ok(TOWERS.blade.cost<=500,'a different low-cost opener remains viable');
 assert.ok(TOWERS.starseed.cost<TOWERS.scout.cost,'rare designs remain independent of rarity prices');
 assert.ok(TOWERS.hunter.cost>TOWERS.rail.cost);
 assert.ok(TOWERS.banker.cost/previousInstallCosts.banker>1.7,'money generators cost extra');
});

test('all curated upgrade steps cost markedly more and later levels require deeper investment',()=>{
 const oldFirst={scout:180,soldier:350,blade:260,cannon:480,
  rail:1300,oldgod:10500,voidwalker:750,sonic:1900};
 const oldLast={scout:3000,soldier:2800,blade:2500,cannon:2200,
  rail:5200,oldgod:33000,voidwalker:7200,sonic:7000};
 for(const [id,tower] of Object.entries(TOWERS)){
  const upgrades=tower.upgrades;
  assert.ok(upgrades.length>=2,id);
  assert.deepEqual(upgrades,EVOLUTIONS[id].map(stage=>stage.cost));
  assert.ok(upgrades.every(cost=>Number.isSafeInteger(cost)&&cost%10===0));
  assert.ok(upgrades.every((cost,i)=>i===0||cost>upgrades[i-1]),id);
  assert.ok(upgrades.at(-1)>tower.cost,
   id+' last evolution should cost more than base placement');
 }
 for(const [id,previous] of Object.entries(oldFirst))
  assert.ok(TOWERS[id].upgrades[0]>=previous*1.65,id+' first cost');
 for(const [id,previous] of Object.entries(oldLast))
  assert.ok(TOWERS[id].upgrades.at(-1)>=previous*2.15,id+' final cost');
});

test('beginner funds still permit initial defense; new economy blocks premature max-level spam',()=>{
 const s=make();
 assert.equal(s.players.a.money,500);
 const placed=command(s,'a',{kind:'place',type:'scout',x:240,y:400});
 assert.equal(placed.ok,true,JSON.stringify(placed));
 assert.equal(s.players.a.money,500-TOWERS.scout.cost);
 const own=s.towers[0];
 const level1=command(s,'a',{kind:'upgrade',id:own.id});
 assert.equal(level1.ok,s.players.a.money>=TOWERS.scout.upgrades[0]);
 const before=s.players.a.money;
 assert.equal(command(s,'a',{kind:'upgrade',id:own.id}).ok,false,
  'the early wallet should not instantly buy multiple free evolutions');
 assert.equal(s.players.a.money,before);
});

test('tiered waves escalate through stronger monsters, never a per-type HP or speed multiplier',()=>{
 const tiers=['easy','normal','hard','extreme','hell','ruin'];
 assert.deepEqual(Object.keys(WAVE_FORMATIONS),tiers);
 const lateBodies=[];
 for(const d of DIFFICULTIES){
  const settings=WAVE_FORMATIONS[d.id];
  const start=d.waves[0],last=d.waves.at(-1);
  assert.ok(settings.pool.length>=3);
  assert.ok(settings.escorts>=1);
  const draft=[['heavy',18],['runner',12]];
  assert.deepEqual(evolveWaveGroups(draft,1,d.waves.length,d.id),draft);
  const final=evolveWaveGroups(draft,d.waves.length,d.waves.length,d.id);
  assert.ok(final.some(([type])=>!draft.some(([before])=>before===type)),
   d.id+' must deploy stronger named species by the finale');
  assert.ok(last.groups.length>start.groups.length,
   d.id+' needs more diverse wave formations late');
  assert.ok(last.groups.some(([type])=>settings.pool.includes(type)));
  lateBodies.push(final);
 }
 assert.ok(lateBodies[3].length>=lateBodies[0].length);
 assert.ok(WAVE_FORMATIONS.extreme.escorts>WAVE_FORMATIONS.hard.escorts);
 assert.ok(WAVE_FORMATIONS.ruin.escorts>WAVE_FORMATIONS.hell.escorts);
});

test('every wave uses fixed per-species HP, speed and damage payout, not an inflated bar',()=>{
 assert.ok(DAMAGE_CASH_FACTOR<.7&&DAMAGE_CASH_FACTOR>.4);
 for(const difficulty of ['easy','normal','hard','extreme','hell','ruin']){
  const d=DIFFICULTIES.find(x=>x.id===difficulty);
  const values=[];
  for(const wave of [1,Math.ceil(d.waves.length/2),d.waves.length]){
   const s=make(difficulty);
   s.queue=[{type:'heavy',field:0,at:0}];s.enemies=[];s.wave=wave;
   tick(s);
   const foe=s.enemies.find(e=>e.type==='heavy');
   assert.ok(foe,difficulty+' enemy needs to spawn');
   near(foe.maxHp,ENEMIES.heavy.hp*d.hp);
   near(foe.speed,ENEMIES.heavy.speed);
   near(foe.rewardHpBase,foe.maxHp);
   s.queue=[];s.players.a.money=0;
   foe.x=200;foe.y=200;
   s.towers=[{id:9000,owner:'a',field:0,type:'scout',x:200,y:120,level:0,cd:0,target:'first'}];
   const initialHp=foe.hp;
   tick(s);
   const lost=initialHp-foe.hp;
   assert.ok(lost>0,difficulty+' tower must hit');
   near(s.players.a.money,lost/foe.maxHp*bounty(foe.maxHp*COMBAT_SCALE)*DAMAGE_CASH_FACTOR);
   values.push([foe.maxHp,foe.speed,foe.damageCashRate]);
  }
  for(const v of values.slice(1))for(let j=0;j<3;j++)
   near(v[j],values[0][j]);
 }
});
