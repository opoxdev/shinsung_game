import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWERS,ENEMIES,MAPS,COMBAT_SCALE,starterProfile} from '../src/data.js';
import {towerStats,pointOnPath,createMatch,tick} from '../src/engine.js';
import {enemyStyle} from '../src/enemy-art.js';
test('damage buffs preserve costs and enemy health; god receives a modest sustained nerf',()=>{
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
 near(TOWERS.scout.damage/TOWERS.scout.interval,(6/.7)/COMBAT_SCALE*1.35/.92);
 near(TOWERS.blade.damage/TOWERS.blade.interval,(25/.9)/COMBAT_SCALE*1.45/.92);
 near(TOWERS.oldgod.damage/TOWERS.oldgod.interval,(1950/3.5)/COMBAT_SCALE*.88/1.04);
 near(TOWERS.workshop.power,.24);near(TOWERS.banker.income,144);
 assert.equal(TOWERS.scout.cost,150);assert.equal(TOWERS.oldgod.cost,8500);near(ENEMIES.zombie.hp,18/COMBAT_SCALE);
 for(const [id,d] of Object.entries(TOWERS))for(let level=0;level<=d.upgrades.length;level++){
  const stats=towerStats({type:id,level});assert.ok(Number.isFinite(stats.damage)&&stats.damage>=0);assert.ok(stats.interval>0);
  assert.ok(Object.isFrozen(stats));assert.strictEqual(stats,towerStats({type:id,level}));
 }
});
test('cached route lookup agrees with segment walking at corners and throughout every map',()=>{
 const reference=(path,d)=>{for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=len)return {x:a[0]+(b[0]-a[0])*d/len,y:a[1]+(b[1]-a[1])*d/len};d-=len;}return {x:path.at(-1)[0],y:path.at(-1)[1],end:true};};
 for(const m of MAPS){let distance=0;const samples=[-1,0,1e7];m.path.slice(1).forEach((p,i)=>{distance+=Math.hypot(p[0]-m.path[i][0],p[1]-m.path[i][1]);samples.push(distance,distance-.001,distance+.001);});for(let d=0;d<distance;d+=17.3)samples.push(d);
  for(const d of samples){const a=pointOnPath(m.path,d),b=reference(m.path,d);assert.ok(Math.abs(a.x-b.x)<1e-7&&Math.abs(a.y-b.y)<1e-7);}
 }
});
test('linear target selection keeps first, strongest and nearest targeting semantics',()=>{
 for(const target of ['first','strong','near']){
  const s=createMatch({map:'plains',difficulty:'easy',type:'solo',modes:[]},[{id:'a',profile:starterProfile()}]);s.queue=[];
  s.enemies=[{id:101,progress:10,hp:100,x:300,y:300},{id:102,progress:30,hp:10,x:310,y:300},{id:103,progress:20,hp:40,x:290,y:300}].map(e=>({...e,type:'heavy',field:0,maxHp:e.hp,speed:0}));
  s.towers=[{id:1,type:'scout',owner:'a',field:0,x:280,y:300,level:0,cd:0,target}];tick(s);
  const shot=s.events.find(e=>e.kind==='ranged');assert.equal(shot.tx,{first:310,strong:300,near:290}[target]);
 }
});
test('all species use a defined visual family including every temple enemy',()=>{
 const styles=new Set();for(const [id,d] of Object.entries(ENEMIES)){const style=enemyStyle(id);styles.add(style);assert.ok(style);if(d.eventOnly)assert.equal(style,'temple');}assert.equal(styles.size,7);
});
