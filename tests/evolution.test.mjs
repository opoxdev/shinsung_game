import test from 'node:test';
import assert from 'node:assert/strict';
import { EVOLUTIONS, evolutionAt } from '../src/evolutions.js';
import { TOWERS, ENEMIES, starterProfile } from '../src/data.js';
import { createMatch, command, towerStats, tick, advance } from '../src/engine.js';
import { character } from '../src/art.js';

const config=(type='solo')=>({map:'plains',difficulty:'easy',type,modes:[]});
const player=(id='a')=>({id,profile:{...starterProfile(id),owned:Object.keys(TOWERS),loadout:Object.keys(TOWERS)}});
const match=(type='solo')=>createMatch(config(type),type==='coop'?[player('a'),player('b')]:[player()]);
const grant=s=>Object.values(s.players).forEach(p=>p.money=250000);
const summonTarget=(s,id,hp=5000,x=240,y=140)=>({
  id:s.nextId++,type:id,field:0,hp,maxHp:hp,progress:100,x,y,speed:0,shield:0,maxShield:0
});
const install=(s,type,x=240,y=100,owner='a')=>{
  const result=command(s,owner,{kind:'place',type,x,y});
  assert.equal(result.ok,true,JSON.stringify({type,x,y,result}));
  return s.towers.at(-1);
};
test('all 30 towers have curated 2–5 stage paths and distinct price scaling',()=>{
  assert.deepEqual(Object.keys(EVOLUTIONS).sort(),Object.keys(TOWERS).sort());
  assert.ok(new Set(Object.values(EVOLUTIONS).map(v=>v.length)).size>=4);
  for(const [id,path] of Object.entries(EVOLUTIONS)){
    assert.ok(path.length>=2&&path.length<=5,id);
    assert.deepEqual(path.map(s=>s.cost),TOWERS[id].upgrades);
    let price=0,damage=1,rate=1,range=1;
    for(const stage of path){
      assert.ok(stage.name.length>=3&&stage.desc.length>=12&&stage.look.length>=3,id);
      assert.ok(stage.cost>price&&Number.isSafeInteger(stage.cost),id);
      assert.ok(stage.damageMult>=damage&&stage.rateMult>=rate&&stage.rangeMult>=range,id);
      price=stage.cost;damage=stage.damageMult;rate=stage.rateMult;range=stage.rangeMult;
    }
    assert.equal(evolutionAt(id,path.length+1),null);
  }
});
test('five same-type placed units upgrade independently; each has its own spent, stats and look',()=>{
  const s=match();grant(s);
  const towers=Array.from({length:5},(_,i)=>install(s,'scout',120+75*i,100));
  const money=s.players.a.money;
  const id=towers[2].id;
  assert.equal(command(s,'a',{kind:'upgrade',id}).ok,true);
  assert.equal(towers[2].level,1);
  assert.equal(towers[2].spent,150+180);
  assert.equal(s.players.a.money,money-180);
  assert.ok(towerStats(towers[2]).damage>towerStats(towers[1]).damage);
  assert.notEqual(character('scout','default',1),character('scout','default',0));
  for(const other of towers.filter(t=>t.id!==id)){
    assert.equal(other.level,0);assert.equal(other.spent,150);
    assert.equal(towerStats(other).stageName,'기본 장비');
  }
  for(let i=1;i<TOWERS.scout.upgrades.length;i++)assert.equal(command(s,'a',{kind:'upgrade',id}).ok,true);
  assert.equal(towers[2].level,5);
  const wallet=s.players.a.money;
  const fail=command(s,'a',{kind:'upgrade',id});
  assert.equal(fail.ok,false);assert.match(fail.error,/최대/);
  assert.equal(s.players.a.money,wallet);
  assert.equal(command(s,'a',{kind:'upgrade',id:towers[0].id}).ok,true);
  assert.equal(towers[0].level,1);
  assert.equal(towers[3].level,0);
});
test('upgrades are ownership-guarded across coop and charged only for one instance',()=>{
  const s=match('coop');grant(s);
  const a=install(s,'cannon',200,100,'a'),b=install(s,'cannon',300,100,'b');
  const money=s.players.b.money;
  assert.equal(command(s,'b',{kind:'upgrade',id:a.id}).ok,false);
  assert.equal(command(s,'a',{kind:'upgrade',id:b.id}).ok,false);
  assert.equal(s.players.b.money,money);
  assert.equal(command(s,'b',{kind:'upgrade',id:b.id}).ok,true);
  assert.equal(a.level,0);assert.equal(b.level,1);
});
test('evolution switches scout ranged attack to two-target and then splash',()=>{
  const normal=match();grant(normal);normal.queue=[];
  const base=install(normal,'scout');
  normal.enemies=[summonTarget(normal,'heavy',5000,240,150),summonTarget(normal,'heavy',5000,280,150)];
  tick(normal);
  assert.ok(normal.enemies.filter(e=>e.hp<5000).length===1);
  const double=match();grant(double);double.queue=[];
  const twice=install(double,'scout');twice.level=3;
  assert.equal(towerStats(twice).kind,'ranged');
  assert.equal(towerStats(twice).multi,2);
  double.enemies=[summonTarget(double,'heavy',5000,240,150),summonTarget(double,'heavy',5000,280,150)];
  tick(double);
  assert.equal(double.enemies.filter(e=>e.hp<5000).length,2);
  const bomb=match();grant(bomb);bomb.queue=[];
  const splash=install(bomb,'scout');splash.level=4;
  assert.equal(towerStats(splash).kind,'splash');
  assert.ok(towerStats(splash).splash>0);
  bomb.enemies=[summonTarget(bomb,'heavy',5000,240,150),summonTarget(bomb,'heavy',5000,280,150)];
  tick(bomb);
  assert.equal(bomb.enemies.filter(e=>e.hp<5000).length,2);
});
test('chain and summon progression change actual target count without mutating siblings',()=>{
  const s=match();grant(s);s.queue=[];
  const basic=install(s,'soldier'),up=install(s,'soldier',340,100);
  up.level=3;
  assert.equal(towerStats(basic).kind,'ranged');
  assert.equal(towerStats(up).kind,'chain');
  assert.equal(towerStats(up).chain,3);
  const spawn=match();grant(spawn);spawn.queue=[];
  const a=install(spawn,'summoner'),b=install(spawn,'summoner',370,100);
  b.level=4;
  spawn.enemies=[summonTarget(spawn,'tank',100000,280,145)];
  tick(spawn);
  assert.equal(spawn.units.filter(u=>u.type==='summoner').length,5);
  assert.equal(a.level,0);assert.equal(b.level,4);
});
test('income evolution changes only that unit and old tower data remains unmodified',()=>{
  const s=match();grant(s);s.queue=[];
  const base=install(s,'banker'),gold=install(s,'banker',330,100);
  gold.level=2;
  assert.equal(towerStats(base).income,120);
  assert.equal(towerStats(gold).income,270);
  assert.ok(towerStats(gold).interval<towerStats(base).interval);
  // No shared mutation even after an authoritative tick and JSON round-trip.
  s.enemies=[summonTarget(s,'tank',100000,1550,900)];
  advance(s,1);
  const copy=JSON.parse(JSON.stringify(s));
  assert.deepEqual(copy.towers.map(t=>t.level),[0,2]);
  assert.equal(towerStats(copy.towers[0]).income,120);
});
test('all upgraded SVG costumes are nonempty and distinct from base portraits',()=>{
  for(const [id,path] of Object.entries(EVOLUTIONS)){
    const base=character(id);
    let previous=base;
    for(let i=1;i<=path.length;i++){
      const svg=character(id,'default',i);
      assert.match(svg,/<svg/);
      assert.ok(svg.includes('</svg>'));
      assert.notEqual(svg,base,id+' lvl '+i);
      assert.notEqual(svg,previous,id+' repeated lvl '+i);
      previous=svg;
    }
  }
});
