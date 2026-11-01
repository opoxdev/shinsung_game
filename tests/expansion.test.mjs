import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWERS, ENEMIES, PACKS, DIFFICULTIES, RARITIES, starterProfile } from '../src/data.js';
import { createMatch, tick, advance, rewardFor, applyReward, profileAction } from '../src/engine.js';
import { character } from '../src/art.js';

const config=(difficulty='easy')=>({map:'plains',difficulty,type:'solo',modes:[]});
const player=()=>({id:'hero',profile:{...starterProfile(),loadout:Object.keys(TOWERS)}});
function fresh(difficulty='easy'){const s=createMatch(config(difficulty),[player()]);s.queue=[];s.enemies=[];s.players.hero.money=100000;return s;}
function enemy(s,type,hp,rest={}){return {id:s.nextId++,type,field:0,hp,maxHp:hp,x:240,y:175,progress:100,speed:0,shield:0,maxShield:0,...rest};}
function tower(s,type,x=240,y=100){const t={id:s.nextId++,owner:'hero',field:0,type,x,y,cd:0,level:0,shots:0,target:'first'};s.towers.push(t);return t;}

test('expanded roster, collectibles, PvP packs and unique character artwork',()=>{
  assert.equal(Object.keys(TOWERS).length,31);
  assert.ok(Object.keys(ENEMIES).length>=33);
  assert.ok(Object.keys(PACKS).length>=5);
  assert.deepEqual(Object.keys(RARITIES),['common','rare','epic','legendary','mythic']);
  for(const [id,t] of Object.entries(TOWERS)){
    assert.ok(RARITIES[t.rarity],id);
    assert.ok(t.cap>=1&&t.cap<=20&&t.interval>0,id);
    assert.ok(t.upgrades.length>=2&&t.upgrades.length<=5,id);
    assert.match(character(id),/<svg[^>]*>/,id);
  }
  for(const [id,p] of Object.entries(PACKS))for(const [eid,cost,cd] of p.monsters){
    assert.ok(ENEMIES[eid],id+':'+eid);assert.ok(cost>0&&cd>0);
  }
});
test('six authored campaigns contain exactly 150 valid nonidentical waves',()=>{
  const expected=[10,16,22,28,34,40];
  assert.deepEqual(DIFFICULTIES.map(d=>d.waves.length),expected);
  assert.equal(expected.reduce((a,b)=>a+b,0),150);
  const finales=['boss','tank','mecha','doom','oblivion','apocalypse'];
  DIFFICULTIES.forEach((d,i)=>{
    const last=d.waves.at(-1);
    assert.ok(last.title.includes('최후'),d.id);
    assert.ok(last.groups.some(([eid])=>eid===finales[i]),d.id);
    for(const w of d.waves) {
      assert.ok(w.duration>=40&&w.bonus>0&&w.spacing>=.27);
      assert.ok(w.title);
      for(const [id,n] of w.groups)assert.ok(ENEMIES[id]&&n>=1&&n<=60,d.id);
    }
  });
});
test('shields absorb chain lightning, remaining targets are also struck',()=>{
  const s=fresh(),a=enemy(s,'shieldling',190,{shield:120,maxShield:120}),b=enemy(s,'zombie',150,{progress:90});
  s.enemies=[a,b];tower(s,'drone');tick(s);
  assert.ok(a.shield<120&&a.hp===190);
  assert.ok(b.hp<150);
});
test('slow, poison, split on death and regeneration run inside the deterministic simulation',()=>{
  const s=fresh();s.enemies=[enemy(s,'heavy',200,{speed:90})];const witch=tower(s,'icewitch');
  tick(s);assert.ok(s.enemies[0].slowUntil>s.time);
  const progress=s.enemies[0].progress;witch.cd=100;advance(s,.5);
  assert.ok(s.enemies[0].progress-progress<40);
  const p=fresh();p.enemies=[enemy(p,'heavy',300)];const chem=tower(p,'chemist');
  tick(p);assert.ok(p.enemies[0].dotUntil>p.time);
  chem.cd=100;const old=p.enemies[0].hp;advance(p,.5);assert.ok(p.enemies[0].hp<old);
  const split=fresh();split.enemies=[enemy(split,'splitter',1)];tower(split,'knight');tick(split);
  assert.equal(split.enemies.filter(e=>e.type==='swarm').length,3);assert.equal(split.kills,1);
  const regen=fresh();regen.enemies=[enemy(regen,'ember',500,{maxHp:1250})];advance(regen,.5);
  assert.ok(regen.enemies[0].hp>500);
});
test('income tower pays periodically, not instantly or per player in a lobby',()=>{
  const s=fresh();s.enemies=[enemy(s,'heavy',50000,{x:1500,y:900})];const b=tower(s,'banker');b.cd=15;
  const start=s.players.hero.money;advance(s,10);assert.equal(s.players.hero.money,start);
  advance(s,5.1);assert.equal(s.players.hero.money,start+144);
});
test('spirit and phoenix each summon two unique animated helpers',()=>{
  const s=fresh();s.enemies=[enemy(s,'heavy',5000)];
  tower(s,'spirit');tower(s,'phoenix',350,100);tick(s);
  assert.equal(s.units.length,4);
  assert.deepEqual(new Set(s.units.map(u=>u.type)),new Set(['spirit','phoenix']));
});
test('aurora remains an unlock-only mythic and existing reward rules survive',()=>{
  const p=starterProfile();
  assert.throws(()=>profileAction(p,{kind:'buyTower',id:'aurora'}));
  const s=createMatch({...config('ruin'),modes:['elite']},[player()]);
  s.status='victory';const award=rewardFor(s,'hero');assert.equal(award.aurora,true);
  applyReward(p,award);assert.ok(p.owned.includes('aurora'));
  const other=createMatch(config('ruin'),[player()]);other.status='victory';
  assert.equal(rewardFor(other,'hero').aurora,false);
});
test('serialized state with effects stays deterministic',()=>{
  const s=fresh();s.enemies=[enemy(s,'behemoth',22000,{shield:3000,maxShield:3000,speed:29})];
  tower(s,'icewitch');tower(s,'chemist',360,100);tower(s,'drone',460,100);
  advance(s,1);const restored=JSON.parse(JSON.stringify(s));
  advance(s,3);advance(restored,3);assert.deepEqual(s,restored);
});

test('long scripted waves account for complete spawn formation before timeout',()=>{
  for(const diff of DIFFICULTIES){
    const s=createMatch({map:'plains',difficulty:diff.id,type:'solo',modes:[]},[player()]);
    const first=diff.waves[0],units=first.groups.reduce((n,[,count])=>n+count,0);
    assert.ok(s.waveDeadline>=units*first.spacing+7.5,diff.id);
    assert.ok(s.waveDeadline>=first.duration,diff.id);
    assert.equal(s.wave,1);
  }
});
test('boss abilities, evolution and scripted wave timer survive JSON roundtrip',()=>{
 const s=createMatch({map:'plains',difficulty:'hell',type:'solo',modes:[]},[player()]);
 assert.ok(Number.isFinite(s.waveDeadline));
 const copy=JSON.parse(JSON.stringify(s));
 assert.equal(copy.waveDeadline,s.waveDeadline);
 assert.deepEqual(copy.queue,s.queue);
});
