import test from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, WORLD, TOWERS, starterProfile } from '../src/data.js';
import { pointOnPath, createMatch, tick } from '../src/engine.js';
import { drawMelee } from '../src/render.js';
import { landscape } from '../src/art.js';
const length=path=>path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0);
test('maps have distinct travel lengths, traversable routes, and matching previews',()=>{
  const lengths=MAPS.map(m=>length(m.path)).sort((a,b)=>a-b);
  assert.ok(lengths.at(-1)/lengths[0]>2.4);
  for(let i=1;i<lengths.length;i++)assert.ok(lengths[i]-lengths[i-1]>200);
  for(const map of MAPS){
    for(const [x,y] of map.path)assert.ok(x>=0&&x<=WORLD.width&&y>=0&&y<=WORLD.height);
    for(let i=1;i<map.path.length;i++)assert.ok(Math.hypot(map.path[i][0]-map.path[i-1][0],map.path[i][1]-map.path[i-1][1])>100);
    const end=pointOnPath(map.path,length(map.path)+1);
    assert.equal(end.end,true);assert.deepEqual([end.x,end.y],map.path.at(-1));
    const route=map.path.map(([x,y],i)=>`${i?'L':'M'}${(x/1800*800).toFixed(1)} ${(205+y/1100*245).toFixed(1)}`).join(' ');
    assert.ok(landscape(map).includes(`d="${route}"`));
  }
});
test('all melee tower slashes point toward targets in every quadrant, including zero coordinates',()=>{
  for(const type of Object.keys(TOWERS).filter(id=>TOWERS[id].kind==='melee')){
    for(const [tx,ty] of [[200,100],[0,100],[100,0],[100,200],[0,0],[200,200]]){
      let arc;const g={beginPath(){},stroke(){},arc(...args){arc=args;}};
      drawMelee(g,{type,x:100,y:100,tx,ty},.28);
      const angle=(arc[3]+arc[4])/2,dx=tx-100,dy=ty-100;
      assert.ok(Math.abs(Math.cos(angle)*Math.hypot(dx,dy)-dx)<1e-7);
      assert.ok(Math.abs(Math.sin(angle)*Math.hypot(dx,dy)-dy)<1e-7);
      assert.ok(Math.abs(arc[2]-Math.hypot(dx,dy))<1e-7);
    }
  }
});
test('summon impact preserves its approach direction instead of using the target as origin',()=>{
  const s=createMatch({map:'plains',type:'solo',difficulty:'easy',modes:[]},[{id:'a',profile:starterProfile()}]);
  s.queue=[];
  s.enemies=[{id:900,type:'zombie',x:100,y:100,field:0,progress:0,speed:0,hp:100,maxHp:100}];
  s.units=[{id:901,type:'summoner',x:112,y:100,field:0,target:900,life:2,speed:210,damage:1}];
  tick(s);const hit=s.events.find(e=>e.kind==='melee');assert.ok(hit);
  assert.equal(hit.x,112);assert.equal(hit.tx,100);assert.equal(hit.y,hit.ty);
});
