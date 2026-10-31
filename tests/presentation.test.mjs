import test from 'node:test';
import assert from 'node:assert/strict';
import { constrainCamera, TERRAIN_MARGIN, MotionView, predictedProgress } from '../src/presentation.js';

test('zoom and pan never expose a void, across aspect ratios and PvP fields',()=>{
  for(const [w,h] of [[1848,950],[1366,768],[390,844],[2560,1080],[844,390]])for(const fields of [1,2]){
    for(const zoom of [.01,.55,1,3.3,10])for(const position of [-1e5,900,1e5]){
      const c={x:position,y:position,zoom},scale=constrainCamera(c,w,h,fields),epsilon=1e-6;
      assert.ok(c.x-w/(2*scale)>=-TERRAIN_MARGIN-epsilon);
      assert.ok(c.x+w/(2*scale)<=1800+(fields-1)*2100+TERRAIN_MARGIN+epsilon);
      assert.ok(c.y-h/(2*scale)>=-TERRAIN_MARGIN-epsilon);
      assert.ok(c.y+h/(2*scale)<=1100+TERRAIN_MARGIN+epsilon);
      assert.ok(c.zoom<=3.3);
    }
  }
});
const path=[[0,0],[100,0],[100,200]];
const enemy=progress=>({id:1,type:'zombie',progress,speed:100,x:progress,y:0});
const state=progress=>({status:'playing',time:1,enemies:[enemy(progress)],units:[{id:2,x:0,y:0}],towers:[],events:[]});
test('local movement interpolates along corners without changing simulation data',()=>{
  const motion=new MotionView(),s=state(90);motion.capture(s);
  Object.assign(s.enemies[0],{progress:110,x:100,y:10});s.units[0].x=20;
  const before=structuredClone(s);
  let view=motion.sample(s,path,{alpha:.25,dt:1/60});
  assert.equal(view.enemies[0].x,95);assert.equal(view.enemies[0].y,0);assert.equal(view.units[0].x,5);
  view=motion.sample(s,path,{alpha:.75,dt:1/60});
  assert.equal(view.enemies[0].x,100);assert.equal(view.enemies[0].y,5);
  assert.deepEqual(s,before);
});
test('online snapshot correction is gradual and settles without an instant backward jump',()=>{
  const motion=new MotionView();motion.sample(state(40),path,{online:true,dt:1/60});
  const next=state(20);
  const first=motion.sample(next,path,{online:true,dt:1/60}).enemies[0].progress;
  assert.ok(first>35&&first<40);
  for(let i=0;i<60;i++)motion.sample(next,path,{online:true,dt:1/60});
  assert.ok(Math.abs(motion.enemies.get(1).progress-20)<.001);
});
test('network prediction respects expiring slow and rush effects and stale-snapshot cap',()=>{
  const e={...enemy(0),slowUntil:1.5,slowFactor:.5,rushUntil:2,rushPower:2};
  assert.equal(predictedProgress(e,1,2),250);
  const view=new MotionView().sample(state(0),path,{online:true,ahead:60});
  assert.ok(Math.abs(view.enemies[0].progress-220)<1e-9);
});
test('paused/finished movement freezes at authoritative positions and removed entities are released',()=>{
  const motion=new MotionView(),s=state(10);motion.capture(s);s.enemies[0].progress=30;
  assert.equal(motion.sample(s,path,{alpha:0,paused:true}).enemies[0].progress,30);
  s.status='won';assert.equal(motion.sample(s,path,{online:true,ahead:2}).enemies[0].progress,30);
  s.enemies=[];s.units=[];motion.sample(s,path);assert.equal(motion.enemies.size,0);assert.equal(motion.units.size,0);
});
