import test from 'node:test';
import assert from 'node:assert/strict';
import {MAPS,WORLD,starterProfile} from '../src/data.js';
import {createMatch,command,tick,pointOnPath,routeLength,pathDistance} from '../src/engine.js';
import {landscape} from '../src/art.js';
import {NEW_MAP_IDS,drawNewMapBackdrop,drawNewMapDecor,newMapLandscape} from '../src/new-map-art.js';
import {makeTerrain} from '../src/terrain.js';

const fresh=map=>createMatch({type:'solo',map,difficulty:'easy',modes:[]},
 [{id:'a',profile:starterProfile()}]);
function spyCanvas(){
 const calls=[];
 const ctx=new Proxy({},{
  get(obj,key){if(key in obj)return obj[key];
   if(typeof key==='symbol')return undefined;
   return (...args)=>{calls.push([String(key),...args]);};
  },set(obj,key,value){obj[key]=value;return true;}
 });
 return {ctx,calls};
}
test('four novel, unlocked maps have named biomes and unique, playable roads',()=>{
 assert.deepEqual(NEW_MAP_IDS,['sakura','moonlake','skyisles','stardune']);
 assert.equal(MAPS.filter(m=>!m.eventOnly).length,9);
 assert.equal(MAPS.filter(m=>m.eventOnly).length,1,'Temple is still a separate challenge');
 const roads=new Set();
 for(const id of NEW_MAP_IDS){
  const map=MAPS.find(m=>m.id===id);
  assert.ok(map&&!map.eventOnly,id+' must be selectable without unlocks');
  assert.ok(map.name.length>=4&&map.desc.length>=35,id+' needs authored copy');
  assert.ok(map.color.startsWith('#')&&map.ground&&map.roadColor);
  assert.ok(map.path.length>=8,id+' should have a meaningful tactical path');
  for(const [x,y] of map.path)assert.ok(x>=0&&y>=0&&x<=WORLD.width&&y<=WORLD.height,id);
  for(let i=1;i<map.path.length;i++){
   const [x,y]=map.path[i],[X,Y]=map.path[i-1];
   assert.ok(Math.hypot(x-X,y-Y)>100,id+' no degenerate path segments');
  }
  const entry=map.path[0],exit=map.path.at(-1);
  const onBoundary=([x,y])=>x===0||x===WORLD.width||y===0||y===WORLD.height;
  assert.ok(onBoundary(entry),'start on world boundary: '+id);
  assert.ok(onBoundary(exit),'exit on world boundary: '+id);
  assert.ok(routeLength(map.path)>1850&&routeLength(map.path)<5800,id);
  assert.equal(pointOnPath(map.path,routeLength(map.path)+100).end,true);
  roads.add(JSON.stringify(map.path));
 }
 assert.equal(roads.size,NEW_MAP_IDS.length);
});
test('four fully authored cinema SVG thumbnails follow the exact battle road',()=>{
 const art=new Set();
 for(const id of NEW_MAP_IDS){
  const map=MAPS.find(m=>m.id===id);
  const svg=landscape(map),direct=newMapLandscape(map);
  assert.equal(svg,direct);
  assert.equal(landscape(map),svg,'cache: repeated lobby renders');
  assert.match(svg,new RegExp('data-biome-art="'+id+'"'));
  assert.match(svg,/viewBox="0 0 800 480"/);
  const route=map.path.map(([x,y],i)=>(i?'L':'M')+(x/1800*800).toFixed(1)+' '+(205+y/1100*245).toFixed(1)).join(' ');
  assert.ok(svg.includes('d="'+route+'"'),'thumbnail path matches actual route');
  assert.ok(svg.length>1600,'authored preview has layered scenery');
  art.add(svg);
 }
 assert.equal(art.size,4);
 assert.equal(newMapLandscape(MAPS.find(m=>m.id==='plains')),null);
});
test('each biome has original underlay, roadside decoration, and deterministic baking',()=>{
 const ops=new Map();
 for(const id of NEW_MAP_IDS){
  const map=MAPS.find(m=>m.id===id),a=spyCanvas(),b=spyCanvas();
  assert.equal(drawNewMapBackdrop(a.ctx,map),true);
  assert.equal(drawNewMapDecor(a.ctx,map,pathDistance),true);
  drawNewMapBackdrop(b.ctx,map);
  drawNewMapDecor(b.ctx,map,pathDistance);
  assert.deepEqual(a.calls,b.calls,id+' visual elements should never be randomly repositioned');
  assert.ok(a.calls.length>120,id+' should contain more than a recolored background');
  assert.ok(a.calls.some(x=>x[0]==='ellipse'));
  assert.ok(a.calls.some(x=>x[0]==='fill'));
  ops.set(id,a.calls.length);
 }
 assert.equal(drawNewMapBackdrop(spyCanvas().ctx,MAPS.find(m=>m.id==='plains')),false);
 assert.equal(drawNewMapDecor(spyCanvas().ctx,MAPS.find(m=>m.id==='plains'),pathDistance),false);
 assert.ok(Math.min(...ops.values())>120);
});
test('new environments are actually baked by the game terrain Canvas, without network assets',()=>{
 const orig=globalThis.document;
 const made=[];
 try{
  globalThis.document={createElement(kind){
   assert.equal(kind,'canvas');const {ctx,calls}=spyCanvas();
   const canvas={width:0,height:0,getContext(){return ctx;}};
   made.push({canvas,calls});return canvas;
  }};
  for(const id of NEW_MAP_IDS){
   const map=MAPS.find(m=>m.id===id),canvas=makeTerrain(map);
   const c=made.at(-1);
   assert.strictEqual(canvas,c.canvas);
   assert.equal(canvas.width,WORLD.width+840);
   assert.equal(canvas.height,WORLD.height+840);
   assert.ok(c.calls.length>1000,id+' should have detailed baked art');
   assert.ok(c.calls.some(x=>x[0]==='setLineDash'),'decorative lanes should be engraved');
  }
 }finally{
  if(orig===undefined)delete globalThis.document;
  else globalThis.document=orig;
 }
});
test('all new routes support enemy movement, reverse-marching summons and tower placement',()=>{
 for(const id of NEW_MAP_IDS){
  const s=fresh(id);s.players.a.money=200000;
  s.players.a.loadout=['scout','summoner'];
  const enemyCountBefore=s.enemies.length;
  for(let i=0;i<120&&s.status==='playing';i++)tick(s);
  assert.ok(s.enemies.length>enemyCountBefore||s.kills>0,id+' enemies actually spawn');
  const map=MAPS.find(m=>m.id===id);
  let placed=null;
  for(let y=110;y<WORLD.height-100&&!placed;y+=110)
   for(let x=110;x<WORLD.width-100&&!placed;x+=110)
    if(pathDistance(map.path,x,y)>110){
      const result=command(s,'a',{kind:'place',type:'scout',x,y});
      if(result.ok)placed=s.towers.at(-1);
    }
  assert.ok(placed,id+' needs valid buildable ground');
  assert.equal(command(s,'a',{kind:'place',type:'scout',x:map.path[0][0],y:map.path[0][1]}).ok,false);
  assert.equal(s.config.map,id);
 }
});
