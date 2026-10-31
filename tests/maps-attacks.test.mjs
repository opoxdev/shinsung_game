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
test('all melee waves rotate continuously toward real target positions, not four sprite directions',()=>{
  const angles=Array.from({length:33},(_,i)=>-Math.PI+i*Math.PI/16);
  const targets=[
    ...angles.map(a=>[100+85*Math.cos(a),100+85*Math.sin(a)]),
    [0,100],[100,0],[0,0],[200,200],[100,100]
  ];
  for(const type of Object.keys(TOWERS).filter(id=>TOWERS[id].kind==='melee')){
    for(const [tx,ty] of targets){
      const calls={curves:[]};
      const g={
        save(){},restore(){},beginPath(){},closePath(){},fill(){},stroke(){},
        translate(x,y){calls.origin=[x,y];},
        rotate(a){calls.rotation=a;},
        moveTo(){},
        quadraticCurveTo(...args){calls.curves.push(args);}
      };
      drawMelee(g,{type,x:100,y:100,tx,ty},.28);
      const angle=Math.atan2(ty-100,tx-100);
      assert.deepEqual(calls.origin,[100,100]);
      assert.ok(Math.abs(calls.rotation-angle)<1e-10,`${type}: ${tx},${ty}`);
      assert.ok(calls.curves.length>=4,'Sword wave needs an elongated directional shape');
      const tip=calls.curves[0],distance=Math.hypot(tx-100,ty-100);
      assert.ok(tip[2]>=Math.max(24,distance),'Slash must reach toward target');
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
