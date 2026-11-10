import test from 'node:test';
import assert from 'node:assert/strict';
import {MAPS,WORLD,EVENTS,ENEMIES,CHRISTMAS_STAGES,starterProfile} from '../src/data.js';
import {validateConfig,createMatch,tick,pointOnPath,routeLength,mapOf} from '../src/engine.js';
import {landscape} from '../src/art.js';
import {makeTerrain} from '../src/terrain.js';
import {HOLIDAY_EXTRA_MAPS,drawHolidayMapBack,drawHolidayMapDecor,holidayMapPreview} from '../src/christmas-map-expansion.js';

const EXPECTED=['christmas_village','christmas_station','christmas_kingdom'];
const get=id=>MAPS.find(m=>m.id===id);
const routeMarkup=map=>map.path.map(([x,y],i)=>(i?'L':'M')+(x/1800*800).toFixed(1)+' '+(205+y/1100*245).toFixed(1)).join(' ');
function crosses(a,b,c,d){
 const orientation=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
 return orientation(a,b,c)*orientation(a,b,d)<0&&orientation(c,d,a)*orientation(c,d,b)<0;
}
test('all Christmas stages now have independent names, biomes and real playable roads',()=>{
 assert.deepEqual(CHRISTMAS_STAGES.map(s=>s.map),EXPECTED);
 assert.deepEqual(HOLIDAY_EXTRA_MAPS,EXPECTED.slice(1));
 const geometries=new Set(),lengths=[];
 for(const [i,id] of EXPECTED.entries()){
  const map=get(id),event=EVENTS[CHRISTMAS_STAGES[i].id];
  assert.ok(map);
  assert.equal(map.eventOnly,'christmas');
  assert.equal(event.map,id);
  assert.ok(map.name.length>=5&&map.desc.length>=50);
  assert.ok(map.color&&map.roadColor&&map.ground);
  assert.ok(map.path.length>=15);
  assert.deepEqual(map.path[0][0],0,'roads enter from the left boundary');
  assert.deepEqual(map.path.at(-1)[0],WORLD.width,'roads exit on the right boundary');
  const length=routeLength(map.path);
  assert.ok(length>=3200&&length<=5500,id+': '+length);
  lengths.push(length);
  for(const [x,y] of map.path)assert.ok(x>=0&&y>=0&&x<=WORLD.width&&y<=WORLD.height);
  for(let a=1;a<map.path.length;a++){
   const start=map.path[a-1],end=map.path[a];
   assert.ok(Math.hypot(start[0]-end[0],start[1]-end[1])>110);
   for(let b=a+2;b<map.path.length;b++)
    assert.equal(crosses(start,end,map.path[b-1],map.path[b]),false,
     'Self-intersecting roads break tower strategy: '+id+' '+a+':'+b);
  }
  const middle=pointOnPath(map.path,length/2);
  assert.ok(middle.x>0&&middle.x<WORLD.width&&middle.y>0&&middle.y<WORLD.height);
  assert.equal(pointOnPath(map.path,length+1).end,true);
  geometries.add(JSON.stringify(map.path));
  const config={type:'solo',eventId:event.id,map:id,difficulty:'normal',modes:[]};
  assert.deepEqual(validateConfig(config),config);
  assert.throws(()=>validateConfig({...config,map:EXPECTED[(i+1)%3]}),/이벤트/);
  assert.throws(()=>validateConfig({type:'solo',map:id,difficulty:'easy',modes:[]}),/맵/);
 }
 assert.equal(geometries.size,3);
 assert.notEqual(Math.round(lengths[0]),Math.round(lengths[1]));
 assert.notEqual(Math.round(lengths[1]),Math.round(lengths[2]));
});
test('winter station and cookie kingdom SVGs are unique, richly layered and depict actual battle paths',()=>{
 const images=new Set();
 for(const id of EXPECTED){
  const map=get(id),svg=landscape(map);
  assert.match(svg,new RegExp('data-biome-art="'+id+'"'));
  assert.match(svg,/viewBox="0 0 800 480"/);
  assert.ok(svg.includes('d="'+routeMarkup(map)+'"'),id+' preview route must match simulation geometry');
  assert.ok(svg.length>6000,id+' detailed scenic artwork');
  assert.equal(landscape(map),svg,'memoized SVGs avoid rerender churn');
  images.add(svg);
  if(id!=='christmas_village')assert.equal(holidayMapPreview(map),svg);
 }
 assert.equal(images.size,3);
 assert.equal(holidayMapPreview(get('plains')),null);
 assert.match(landscape(get('christmas_station')),/station|holiday-christmas_station|ffe0a5/i);
 assert.match(landscape(get('christmas_kingdom')),/holiday-christmas_kingdom|fff8e|#a76d4f/i);
});
test('chapter 2 and 3 worlds each bake hundreds of distinct scene details and are isolated from ordinary worlds',()=>{
 const createSpy=()=>{
  const properties=new Map(),calls=[];
  const g=new Proxy({},{
   get(_,name){if(typeof name==='symbol')return undefined;
    if(properties.has(name))return properties.get(name);
    return (...args)=>{calls.push([String(name),...args]);};},
   set(_,name,value){properties.set(name,value);return true;}
  });
  return {g,calls,properties};
 };
 for(const id of HOLIDAY_EXTRA_MAPS){
  const map=get(id),back=createSpy(),decor=createSpy();
  assert.equal(drawHolidayMapBack(back.g,map),true);
  assert.equal(drawHolidayMapDecor(decor.g,map,()=>10000),true);
  assert.ok(back.calls.length>=500,id+' backdrop has icy/chocolate geography and texture');
  assert.ok(decor.calls.length>=300,id+' decorations contain distinctive architecture and props');
  const world=createSpy();
  const previous=globalThis.document;
  globalThis.document={createElement(tag){
   assert.equal(tag,'canvas');
   return {width:0,height:0,getContext:()=>world.g};
  }};
  try{
   const canvas=makeTerrain(map);
   assert.ok(canvas.width>=WORLD.width&&canvas.height>=WORLD.height);
   assert.ok(world.calls.length>=back.calls.length+decor.calls.length,
    id+' terrain must paint BOTH background and scenery in the actual game');
  }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
 }
 assert.equal(drawHolidayMapBack(createSpy().g,get('plains')),false);
 assert.equal(drawHolidayMapDecor(createSpy().g,get('plains'),()=>100),false);
});
test('stage 2 and stage 3 enemies truly spawn on their corresponding map routes',()=>{
 for(let stage=2;stage<=3;stage++){
  const id=CHRISTMAS_STAGES[stage-1].id;
  const config={type:'solo',eventId:id,map:CHRISTMAS_STAGES[stage-1].map,difficulty:'normal',modes:[]};
  const s=createMatch(config,[{id:'a',profile:starterProfile()}]);
  assert.equal(mapOf(s).id,CHRISTMAS_STAGES[stage-1].map);
  assert.equal(s.wave,1);
  for(let i=0;i<30;i++)tick(s);
  assert.ok(s.enemies.length>0,config.map+' must actually spawn enemies');
  const first=s.enemies[0],map=get(config.map);
  assert.equal(ENEMIES[first.type].eventOnly,'christmas');
  const pt=pointOnPath(map.path,first.progress);
  assert.ok(Math.hypot(pt.x-first.x,pt.y-first.y)<1e-6,'monster moves along chapter road');
  assert.notDeepEqual(map.path,get('christmas_village').path);
 }
});
