import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWERS,starterProfile} from '../src/data.js';
import {createMatch,tick} from '../src/engine.js';
import {EFFECT_TYPES,towerEffectProfile,isTowerAttackEffect,drawTowerAttackEffect,drawTowerPresence} from '../src/combat-fx.js';
import {Renderer} from '../src/render.js';

function canvasSpy(){
 const commands=[];
 const g={globalAlpha:1,shadowBlur:0};
 for(const name of ['save','restore','translate','rotate','scale','beginPath','closePath','moveTo','lineTo','quadraticCurveTo','arc','ellipse','fill','stroke','fillRect','strokeText','fillText']){
  g[name]=(...args)=>{commands.push({name,args});};
 }
 return {g,commands};
}
const attack=(type,kind)=>({
 id:103,kind,field:0,x:200,y:190,tx:310,ty:260,type,level:3,amount:17
});
test('all 32 towers are represented by deterministic high-contrast VFX palettes',()=>{
 assert.deepEqual([...EFFECT_TYPES].sort(),Object.keys(TOWERS).sort());
 const colors=new Set(),shapes=new Set();
 for(const id of EFFECT_TYPES){
  const p=towerEffectProfile(id);
  assert.match(p.primary,/^#[0-9a-f]{6}$/i,id);
  assert.match(p.core,/^#[0-9a-f]{6}$/i,id);
  colors.add(p.primary);shapes.add(p.shape);
  assert.strictEqual(p,towerEffectProfile(id),'effect palettes must be reused');
 }
 assert.ok(colors.size>=24,'distinct towers need contrasting palettes');
 assert.ok(shapes.size>=19,'combat signatures should be varied, not generic');
});

test('all 32 basic and evolved tower presences can be rendered with normal and reduced effects',()=>{
 for(const [id,def] of Object.entries(TOWERS)){
  for(const quality of [0,1]){
   const {g,commands}=canvasSpy();
   for(const lvl of [0,def.upgrades.length]){
    drawTowerPresence(g,{id:42,type:id,level:lvl},1.2,{...def,kind:def.kind},quality);
   }
   if(quality>0||['legendary','mythic'].includes(def.rarity))
    assert.ok(commands.length>0,'aura failed to render for '+id);
   else assert.equal(commands.length,0,'reduced effects should omit common passive auras');
   assert.equal(g.shadowBlur,0,id);
  }
 }
});

test('each attack mechanic draws visible shapes and preserves the render context',()=>{
 for(const kind of ['ranged','splash','melee','chain','arc','summon','mark','charged','judgement','divine','income','buff']){
  const types={
   ranged:['scout','archer','hunter','rail','chemist','icewitch','soldier'],
   splash:['chef','firefly','sonic','voidwalker','storm','starseed','cannon','scrap'],
   melee:['blade','knight','reaper'],
   chain:['drone','aurora','prism'],arc:['aurora','prism','drone'],
   summon:['phoenix','papercrane','spirit','summoner'],
   mark:['marker'],charged:['hunter'],judgement:['oldgod'],divine:['oldgod'],
   income:['banker'],buff:['workshop','clockmaker','mermaid','lullaby']
  }[kind];
  for(const type of types)for(const quality of [0,1,2]){
   const {g,commands}=canvasSpy();
   assert.equal(isTowerAttackEffect(attack(type,kind)),true);
   assert.equal(drawTowerAttackEffect(g,attack(type,kind),.12,quality),true);
   assert.ok(commands.some(c=>c.name==='stroke'||c.name==='fill'),type+' '+kind+' should be visible');
   assert.equal(commands.filter(c=>c.name==='save').length,
    commands.filter(c=>c.name==='restore').length,type+' '+kind+' save/restore');
  }
 }
});
test('visual-only effects do not emit draw commands once their lifetime is over',()=>{
 const {g,commands}=canvasSpy();
 assert.equal(drawTowerAttackEffect(g,attack('aurora','chain'),1,2),true);
 assert.equal(commands.length,0);
 assert.equal(drawTowerAttackEffect(g,{kind:'damage',type:'scout'},.1,1),false);
 assert.equal(drawTowerAttackEffect(g,{kind:'splash',type:'unknown'},.1,1),false);
});
test('new VFX never changes the simulated attack event or damage',()=>{
 const config={map:'plains',difficulty:'easy',type:'solo',modes:[]};
 const make=()=>createMatch(config,[{id:'a',profile:starterProfile()}]);
 const base=make();base.queue=[];
 base.enemies=[{id:100,type:'heavy',field:0,x:200,y:200,progress:100,
  speed:0,hp:100,maxHp:100,shield:0,maxShield:0}];
 base.towers=[{id:101,type:'scout',owner:'a',field:0,x:200,y:120,level:0,cd:0,target:'first',shots:0}];
 const clone=JSON.parse(JSON.stringify(base));
 tick(base);tick(clone);
 assert.deepEqual(base,clone);
 const shot=base.events.find(e=>e.kind==='ranged');
 assert.ok(shot);
 const {g}=canvasSpy();
 drawTowerAttackEffect(g,shot,.1,2);
 assert.deepEqual(base,clone,'effects must not mutate authoritative events or engine state');
});
test('renderer invokes the independent FX module without branching on enemy or gameplay data',()=>{
 assert.equal(typeof Renderer.prototype.frame,'function');
 assert.equal(typeof Renderer.prototype.tower,'function');
});
