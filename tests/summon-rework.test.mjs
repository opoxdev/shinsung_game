import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWERS,MAPS,starterProfile} from '../src/data.js';
import {EVOLUTIONS} from '../src/evolutions.js';
import {createMatch,tick,towerStats,pointOnPath,routeLength,command} from '../src/engine.js';
import {character} from '../src/art.js';
import {Renderer} from '../src/render.js';

const config={type:'solo',map:'plains',difficulty:'normal',modes:[]};
function match(){const s=createMatch(config,[{id:'a',profile:starterProfile()}]);s.queue=[];s.enemies=[];s.players.a.money=10000000;return s;}
function enemy(s,progress=300,hp=5000,type='heavy'){
 const pos=pointOnPath(MAPS.find(m=>m.id===s.config.map).path,progress);
 const e={id:s.nextId++,type,field:0,progress,x:pos.x,y:pos.y,hp,maxHp:hp,shield:0,maxShield:0,speed:0};
 s.enemies.push(e);return e;
}
function tower(s,type,x=270,y=470,level=0){
 const t={id:s.nextId++,type,owner:'a',field:0,x,y,level,cd:0,shots:0,target:'first',angle:0,spent:TOWERS[type].cost};
 s.towers.push(t);return t;
}
const run=(s,n)=>{for(let i=0;i<n&&s.status==='playing';i++)tick(s);};

test('drone pilot becomes legendary with five full combat/equipment evolutions',()=>{
 assert.equal(TOWERS.spirit.rarity,'legendary');
 assert.equal(TOWERS.spirit.name,'드론 조종사');
 for(const id of ['spirit','phoenix']){
  const base=TOWERS[id];assert.equal(base.summonStyle,'orbit',id);
  assert.ok(base.orbitShotInterval>0&&base.orbitExplosionMult>1&&base.orbitSplash>=50);
  assert.ok(base.unitLife>=6);
  const growth=EVOLUTIONS[id];
  assert.equal(growth.length,5);
  assert.ok(growth.every(x=>x.orbitShotInterval>0&&x.orbitExplosionMult>1));
  assert.ok(towerStats({type:id,level:5}).damage>towerStats({type:id,level:0}).damage*3);
  assert.ok(towerStats({type:id,level:5}).summons>base.summons);
 }
});

test('orbiting drones fire continuously, crash into enemies and auto-relaunch after expiration',()=>{
 const s=match();const e=enemy(s,300,100000);
 const t=tower(s,'spirit');tick(s);
 assert.equal(s.units.length,2);
 assert.ok(s.units.every(u=>u.role==='orbit'&&u.from===t.id&&u.phase==='launch'));
 assert.equal(s.events.some(e=>e.kind==='summon-launch'),true);
 assert.ok(e.hp===100000,'initial launch cannot instantly collide or deal damage');
 run(s,40);
 assert.ok(e.hp<100000,'the orbiting gunship must actually shoot');
 assert.ok(s.units.some(u=>u.phase==='orbit'));
 assert.ok(s.events.some(e=>e.kind==='summon-shot'&&e.type==='spirit'));
 const ids=s.units.map(u=>u.id);
 run(s,180);
 assert.ok(s.events.some(e=>e.kind==='summon-crash'&&e.type==='spirit'),'drones must terminate in an explosion');
 assert.ok(s.units.some(u=>!ids.includes(u.id)),'the controller should re-launch after a crash');
 assert.ok(s.units.filter(u=>u.from===t.id).length<=towerStats(t).summons,'active squad is capped');
});

test('Phoenixes orbit, burn, splash and return as new birds after the final dive',()=>{
 const s=match(),e=enemy(s,300,100000);
 const nearby=enemy(s,340,100000);
 const t=tower(s,'phoenix',340,470);
 tick(s);
 assert.equal(s.units.length,2);
 assert.ok(s.units.every(u=>u.role==='orbit'&&u.type==='phoenix'));
 run(s,60);
 assert.ok(e.hp<100000||nearby.hp<100000,'Phoenix fireballs must deal continuing damage');
 assert.ok([e,nearby].some(v=>v.dotUntil>s.time),'fireballs must apply burning status');
 const old=s.units.map(u=>u.id);
 run(s,180);
 assert.ok(s.events.some(e=>e.kind==='summon-crash'&&e.type==='phoenix'),'firebirds must finish in a blast');
 assert.ok(s.units.some(u=>!old.includes(u.id)),'firebirds must be reborn');
 assert.ok(s.units.filter(u=>u.from===t.id).length<=towerStats(t).summons);
});

test('goblins, paper cranes and crystal spiders spawn at allied base and march backward along the road',()=>{
 for(const id of ['summoner','papercrane','crystalspider']){
  const s=match();enemy(s,300,100000);const t=tower(s,id);
  tick(s);
  const path=MAPS.find(m=>m.id===s.config.map).path;
  const end=routeLength(path);
  const troops=s.units.filter(u=>u.from===t.id);
  assert.equal(troops.length,towerStats(t).summons,id);
  for(const u of troops){
   assert.equal(u.role,'lane',id);
   assert.ok(u.hp>0&&u.hp===u.maxHp,id);
   assert.ok(u.progress<=end&&u.progress>=end-100,id);
   const pos=pointOnPath(path,u.progress);
   assert.ok(Math.hypot(pos.x-u.x,pos.y-u.y)<1e-8,id);
  }
  const first=troops[0],previous=first.progress;
  tick(s);
  assert.ok(first.progress<previous,id+' must move from allied base to enemy portal');
  assert.ok(s.events.some(x=>x.kind==='summon-march'&&x.type===id));
 }
});

test('friendly HP collision: weaker enemy dies while stronger goblin survives with health lost',()=>{
 const s=match(),e=enemy(s,300,50,'heavy');
 const t=tower(s,'summoner');tick(s);
 const u=s.units.find(u=>u.from===t.id),initial=u.hp;
 let collided=false;
 for(let i=0;i<400&&!collided;i++){
  tick(s);collided=s.events.some(x=>x.kind==='summon-clash'&&x.from===u.id);
  // clash metadata uses enemy coordinates and tower type; identify by unit survival
  if(s.events.some(x=>x.kind==='summon-clash'&&x.type==='summoner'))collided=true;
 }
 assert.ok(collided,'goblin must meet the enemy on the road');
 assert.ok(!s.enemies.some(v=>v.id===e.id),'the weaker enemy should be killed');
 assert.ok(u.hp>0&&u.hp<initial,'soldier survives but loses health');
 assert.ok(s.units.includes(u),'surviving soldier continues its campaign');
});

test('friendly HP collision: stronger enemy survives but consumes the weaker unit',()=>{
 const s=match(),e=enemy(s,300,25000,'heavy');const t=tower(s,'summoner');tick(s);
 const u=s.units.find(x=>x.from===t.id);
 let collided=false;
 for(let i=0;i<400&&!collided;i++){
  tick(s);
  collided=s.events.some(ev=>ev.kind==='summon-clash'&&ev.type==='summoner');
 }
 assert.ok(collided);
 assert.ok(e.hp<25000&&e.hp>0,'enemy must lose the ally current HP');
 assert.ok(!s.units.some(x=>x.id===u.id),'weaker soldier dies in the impact');
});

test('all five summon portraits gain distinct reworked equipment at each stage',()=>{
 const names=['summoner','spirit','phoenix','papercrane','crystalspider'];
 const silhouettes=new Set();
 for(const id of names){
  const base=character(id),max=EVOLUTIONS[id].length;
  assert.match(base,/data-summon-model="rework"/,id);
  assert.match(base,new RegExp('data-base="'+id+'"'));
  assert.ok(base.length>1400,id);
  silhouettes.add(base);
  let previous=base;
  for(let level=1;level<=max;level++){
   const current=character(id,'default',level);
   assert.ok(current.includes('data-stage="'+level+'"'),id);
   assert.match(current,/data-upgrade="summon-rework"/);
   assert.notEqual(current,previous,id+' needs a visible upgrade at '+level);
   previous=current;
  }
 }
 assert.equal(silhouettes.size,names.length);
 assert.equal(character('spirit','hologram').includes('data-costume-shape="hologram"'),true);
 assert.equal(character('phoenix','celestial').includes('data-costume-shape="celestial"'),true);
});

test('summoned battalions stay deterministic after JSON snapshot restoration',()=>{
 const a=match();enemy(a,300,1000000);tower(a,'spirit');tower(a,'phoenix',350,470);tower(a,'summoner',380,400);
 run(a,24);
 const b=JSON.parse(JSON.stringify(a));
 run(a,70);run(b,70);
 assert.deepEqual(a,b);
});

test('selling a tower removes its active summons and respects per-tower active cap',()=>{
 const s=match();enemy(s,300,1000000);
 const t=tower(s,'spirit');tick(s);
 assert.equal(s.units.filter(u=>u.from===t.id).length,2);
 assert.equal(command(s,'a',{kind:'sell',id:t.id}).ok,true);
 assert.equal(s.units.filter(u=>u.from===t.id).length,0);
});

test('reworked summons render with rank-specific distinct shapes in Canvas',()=>{
 const ctx=new Proxy({globalAlpha:1,shadowBlur:0},{get(obj,key){
  if(key in obj)return obj[key];
  return (...args)=>{ctx.calls.push(String(key));};
 }});
 ctx.calls=[];
 const renderer={reducedEffects:false,summonReworked:Renderer.prototype.summonReworked};
 for(const id of ['summoner','spirit','phoenix','papercrane','crystalspider']){
  const from=ctx.calls.length;
  Renderer.prototype.summonReworked.call(renderer,ctx,{id:19,type:id,role:id==='spirit'||id==='phoenix'?'orbit':'lane',x:100,y:100,life:6,level:3,hp:240,maxHp:300},2.5);
  assert.ok(ctx.calls.length>from,id+' needs battle model rendering');
  assert.ok(ctx.calls.includes('fill')&&ctx.calls.includes('stroke'),id);
 }
});
