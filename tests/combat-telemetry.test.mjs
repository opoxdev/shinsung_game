import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWERS, ENEMIES, DIFFICULTIES, COMBAT_SCALE, starterProfile } from '../src/data.js';
import { createMatch, tick, towerStats, rewardFor, bounty } from '../src/engine.js';
import { enemyUnderCursor } from '../src/render.js';

const cfg=(extra={})=>({type:'solo',map:'plains',difficulty:'easy',modes:[],...extra});
const player=()=>[{id:'p',profile:{...starterProfile(),loadout:Object.keys(TOWERS)}}];
const make=()=>{const s=createMatch(cfg(),player());s.queue=[];s.enemies=[];return s;};
const putEnemy=(s,type='heavy',extra={})=>{
  const d=ENEMIES[type];
  const e={id:s.nextId++,type,field:0,hp:d.hp,maxHp:d.hp,shield:d.shield||0,
    maxShield:d.shield||0,x:240,y:560,progress:240,speed:0,...extra};
  s.enemies.push(e);return e;
};
const putTower=(s,type='scout',extra={})=>{
  const t={id:s.nextId++,type,field:0,owner:'p',x:240,y:400,level:0,cd:0,shots:0,target:'first',...extra};
  s.towers.push(t);return t;
};
test('all combat numbers are six times smaller, preserving attack-to-health proportions',()=>{
  assert.equal(COMBAT_SCALE,6);
  assert.equal(TOWERS.scout.damage,1);
  assert.equal(TOWERS.soldier.damage,1.5);
  assert.equal(TOWERS.hunter.damage,620/6);
  assert.equal(TOWERS.workshop.damage,0);
  assert.equal(ENEMIES.zombie.hp,3);
  assert.equal(ENEMIES.runner.hp,28/6);
  assert.equal(ENEMIES.tank.hp,5000/6);
  assert.equal(ENEMIES.shieldling.shield,120/6);
  assert.equal(ENEMIES.medic.heal,14/6);
  assert.equal(ENEMIES.behemoth.regen,110/6);
  assert.ok(Math.abs(TOWERS.scout.damage/ENEMIES.zombie.hp-6/18)<1e-12);
  assert.equal(towerStats({type:'chemist',level:3}).dot,35/6);
  assert.equal(bounty(5000),500,'Combat income curve remains unchanged');
});
test('authoritative per-hit float label equals actual HP damage',()=>{
  const s=make(),e=putEnemy(s);
  putTower(s);
  const old=e.hp;tick(s);
  const pop=s.events.find(x=>x.kind==='damage');
  assert.ok(pop);
  assert.equal(pop.field,0);
  assert.equal(pop.amount,old-e.hp);
  assert.equal(pop.amount,1);
});
test('shield damage pops reflect absorbed damage and do not pierce HP by accident',()=>{
  const s=make(),e=putEnemy(s,'shieldling');
  putTower(s);
  const oldShield=e.shield,oldHp=e.hp;
  tick(s);
  const pop=s.events.find(x=>x.kind==='damage');
  assert.ok(pop?.shield);
  assert.equal(pop.amount,oldShield-e.shield);
  assert.equal(e.hp,oldHp);
});
test('DOT pop events are aggregated rather than emitted every engine tick',()=>{
  const s=make(),e=putEnemy(s,'heavy',{hp:10000,maxHp:10000});
  const chemist=putTower(s,'chemist');
  tick(s);
  chemist.cd=100;
  for(let i=0;i<12;i++)tick(s);
  const pop=s.events.filter(x=>x.kind==='damage'&&x.dot);
  assert.ok(pop.length>=1&&pop.length<=4,'Only a few aggregate pops per 600ms');
  assert.ok(pop.every(x=>x.amount>0));
  assert.ok(e.hp<10000);
});
test('enemy hover hit testing respects real position, target size and PvP field offset',()=>{
  const a={id:1,type:'zombie',field:0,x:100,y:100,hp:3,maxHp:3};
  const b={id:2,type:'boss',field:1,x:100,y:100,hp:100,maxHp:100};
  assert.equal(enemyUnderCursor([a,b],{x:100,y:100}),a);
  assert.equal(enemyUnderCursor([a,b],{x:2200,y:100}),b);
  assert.equal(enemyUnderCursor([a,b],{x:400,y:400}),null);
  assert.equal(enemyUnderCursor([{...a,hp:0}],{x:100,y:100}),null);
  assert.equal(enemyUnderCursor([a],{x:0,y:0},2),null);
});
test('defeat pays half progress-weighted non-clear rewards without unique unlocks',()=>{
  for(const d of DIFFICULTIES){
    const s=createMatch(cfg({difficulty:d.id}),player());
    const max=d.waves.length;
    for(const wave of [0,1,Math.floor(max/2),max]){
      s.wave=wave;s.status='defeat';
      const reward=rewardFor(s,'p');
      const clear=Math.floor(d.reward*.2);
      const expected=Math.floor((d.reward-clear)*.5*wave/max);
      assert.equal(reward.coins,expected,d.id+':'+wave);
      assert.equal(reward.clearBonus,0);
      assert.equal(reward.sonic,false);
      assert.equal(reward.aurora,false);
    }
    s.status='victory';
    const win=rewardFor(s,'p');
    assert.equal(win.coins,d.reward,d.id);
    assert.equal(win.clearBonus,Math.floor(d.reward*.2));
  }
  const mod=createMatch(cfg({difficulty:'hard',modes:['elite']}),player());
  mod.status='defeat';mod.wave=11;
  const d=DIFFICULTIES.find(d=>d.id==='hard');
  const base=Math.floor(d.reward*1.5);
  assert.equal(rewardFor(mod,'p').coins,Math.floor((base-Math.floor(base*.2))*.5*11/d.waves.length));
  const pvp=createMatch(cfg({type:'pvp'}),[{id:'p',profile:starterProfile()},{id:'other',profile:starterProfile()}]);
  pvp.status='complete';pvp.winner=1;
  assert.equal(rewardFor(pvp,'p').coins,0,'No intentional-loss currency farming in PvP');
});
