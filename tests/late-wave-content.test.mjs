import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWERS,MODES,DIFFICULTIES,regularWavePressure,starterProfile} from '../src/data.js';
import {createMatch,command,tick,validateConfig,towerStats,modifiers} from '../src/engine.js';
import {EVOLUTIONS} from '../src/evolutions.js';
import {character} from '../src/art.js';
import {EFFECT_TYPES,drawTowerAttackEffect} from '../src/combat-fx.js';
import {combatEventsToRender} from '../src/render.js';
const conf=(over={})=>({map:'plains',difficulty:'normal',type:'solo',modes:[],...over});
const match=over=>createMatch(conf(over),[{id:'a',profile:starterProfile()}]);

test('Dark Energy combines with every offered mode, up to the entire set',()=>{
 const ids=Object.keys(MODES);
 assert.ok(ids.length>=7,'Rift mode is selectable');
 for(const id of ids.filter(id=>id!=='darkenergy')){
  const config=conf({modes:['darkenergy',id]});
  assert.deepEqual(validateConfig(config).modes,config.modes);
  assert.equal(match({modes:config.modes}).config.modes.length,2);
 }
 assert.deepEqual(validateConfig(conf({modes:ids})).modes,ids);
 assert.throws(()=>validateConfig(conf({modes:['darkenergy','darkenergy']})),/잘못된/);
 assert.throws(()=>validateConfig(conf({modes:['darkenergy','__proto__']})),/잘못된/);
 assert.throws(()=>validateConfig(conf({modes:[...ids,'invalid']})),/잘못된/);
});

test('every campaign retains its opening pressure but gains the same late-wave ramp',()=>{
 const ids=new Set();
 for(const diff of DIFFICULTIES){
  ids.add(diff.id);
  const last=diff.waves.length;
  assert.deepEqual(regularWavePressure(1,last),{hp:1,speed:1});
  assert.ok(Math.abs(regularWavePressure(last,last).hp-1.3)<1e-12);
  assert.ok(Math.abs(regularWavePressure(last,last).speed-1.06)<1e-12);
  for(let wave=2;wave<=last;wave++){
   const earlier=regularWavePressure(wave-1,last);
   const later=regularWavePressure(wave,last);
   assert.ok(later.hp>=earlier.hp&&later.speed>=earlier.speed);
  }
  assert.ok(regularWavePressure(Math.ceil(last*.25),last).hp<1.06,'opening must remain accessible');
  const s=match({difficulty:diff.id});
  s.wave=last;s.queue=[{type:'zombie',field:0,at:0}];s.enemies=[];
  tick(s);
  assert.ok(s.enemies.length>0);
  const expected=(18/6)*diff.hp*1.3;
  assert.ok(Math.abs(s.enemies[0].maxHp-expected)<1e-8,diff.id+' late-wave HP');
 }
 assert.equal(ids.size,6);
});

test('Rift Reinforcements adds controlled recurring mobs via standard wave queue',()=>{
 const rift=match({modes:['rift']});
 const basic=match();
 for(const s of [rift,basic]){
  s.wave=2;s.waveTime=8;s.queue=[];s.enemies=[];s.votes=[];
  assert.equal(command(s,'a',{kind:'skip'}).ok,true);
  assert.equal(s.wave,3);
 }
 const extra=rift.queue.length-basic.queue.length;
 assert.equal(extra,2,'third-wave rift introduces two additional speedy enemies');
 assert.equal(rift.events.filter(e=>e.kind==='rift').length,1);
 assert.ok(rift.waveDeadline>=basic.waveDeadline);
 assert.ok(modifiers(rift.config).reward>modifiers(basic.config).reward);
});

test('three new towers have four real evolutions, unique vector art and correctly priced unlocks',()=>{
 const ids=['pulsekeeper','duskarcher','crystalspider'],arts=[];
 for(const id of ids){
  const t=TOWERS[id];assert.ok(t,id);
  assert.ok(t.price>0&&t.cost>100&&t.cap>=5,id);
  assert.equal(EVOLUTIONS[id].length,4);
  const p=character(id);
  assert.match(p,new RegExp('data-base="'+id+'"'));
  assert.match(p,/data-design="v2"/);
  assert.ok(p.length>1700,id+' requires its own detailed art');
  assert.notEqual(character(id,'default',1),p);
  assert.ok(towerStats({type:id,level:4}).damage>towerStats({type:id,level:0}).damage);
  assert.ok(EFFECT_TYPES.includes(id),id+' needs a combat VFX palette');
  arts.push(p);
 }
 assert.equal(new Set(arts).size,3);
 const fx={kind:'pulse',type:'pulsekeeper',x:200,y:200,tx:250,ty:200,time:0};
 const commands=[];const ctx=new Proxy({globalAlpha:1,save(){},restore(){}},{get(obj,key){
  if(key in obj)return obj[key];
  return (...args)=>{commands.push(String(key));};
 }});
 assert.equal(drawTowerAttackEffect(ctx,fx,.15,1),true);
 assert.ok(commands.includes('arc')&&commands.includes('stroke'),'radial pulse requires drawn rings');
});

test('pulse tower hits all nearby enemies while leaving distant enemies untouched',()=>{
 const s=match();s.queue=[];s.enemies=[];
 const enemy=(id,x,y)=>({id,type:'zombie',field:0,x,y,hp:100,maxHp:100,shield:0,maxShield:0,progress:100,speed:0});
 s.enemies=[enemy(100,230,180),enemy(101,260,200),enemy(102,1600,900)];
 s.towers=[{id:200,type:'pulsekeeper',field:0,owner:'a',x:200,y:200,level:0,cd:0,shots:0,target:'first'}];
 tick(s);
 assert.ok(s.enemies[0].hp<100&&s.enemies[1].hp<100);
 assert.equal(s.enemies[2].hp,100);
 assert.ok(s.enemies[0].slowUntil>s.time&&s.enemies[1].slowUntil>s.time);
 assert.ok(s.events.some(e=>e.kind==='pulse'&&e.type==='pulsekeeper'));
});

test('recent on-screen damage always survives older/off-screen numbers and quality caps',()=>{
 const events=[];
 for(let i=0;i<100;i++)events.push({id:i,kind:'damage',field:0,time:2,x:1000,y:0,amount:100});
 for(let i=100;i<145;i++)events.push({id:i,kind:'damage',field:0,time:10,x:20,y:20,amount:100});
 for(let i=145;i<180;i++)events.push({id:i,kind:'damage',field:0,time:8,x:20,y:20,amount:100});
 const got=[...combatEventsToRender(events,10.12,0,e=>e.x<500,false)];
 assert.equal(got.length,32);
 assert.equal(got[0].id,144,'newest visible number should be drawn first');
 assert.equal(got.at(-1).id,113,'older visible hits cannot consume the quota');
 assert.equal([...combatEventsToRender(events,10.12,0,e=>e.x<500,true)].length,0);
 assert.equal([...combatEventsToRender(events,10.12,1,()=>true,false)].length,0);
});
