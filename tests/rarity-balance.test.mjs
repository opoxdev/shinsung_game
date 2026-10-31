import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWERS, RARITIES, starterProfile } from '../src/data.js';
import { createMatch, command, tick, towerStats, advance } from '../src/engine.js';
import { EVOLUTIONS } from '../src/evolutions.js';
import { character } from '../src/art.js';

const NEW=['starseed','hunter','scrap','lullaby','papercrane','marker'];
const match=()=>{
 const p=starterProfile();
 p.loadout=Object.keys(TOWERS);
 const s=createMatch({type:'solo',difficulty:'easy',map:'plains',modes:[]},[{id:'p',profile:p}]);
 s.queue=[];s.enemies=[];s.players.p.money=250000;
 return s;
};
function target(s,hp=100000){
 const e={id:s.nextId++,type:'heavy',field:0,hp,maxHp:hp,shield:0,maxShield:0,x:240,y:150,progress:10,speed:0};
 s.enemies.push(e);return e;
}
test('only five rarity tiers remain; no tower uses discontinued immortal tier',()=>{
 assert.deepEqual(Object.keys(RARITIES),['common','rare','epic','legendary','mythic']);
 assert.equal(Object.keys(TOWERS).length,30);
 assert.equal(TOWERS.aurora.rarity,'mythic');
 assert.ok(Object.values(TOWERS).every(t=>Object.hasOwn(RARITIES,t.rarity)));
});
test('rarity never dictates battlefield price or early/late role',()=>{
 assert.equal(TOWERS.starseed.rarity,'mythic');
 assert.ok(TOWERS.starseed.cost<TOWERS.scout.cost);
 assert.equal(TOWERS.hunter.rarity,'rare');
 assert.ok(TOWERS.hunter.cost>TOWERS.rail.cost);
 assert.equal(TOWERS.scrap.rarity,'common');
 assert.ok(TOWERS.scrap.cost>TOWERS.sonic.cost);
 assert.equal(TOWERS.papercrane.rarity,'legendary');
 assert.ok(TOWERS.papercrane.cost<TOWERS.drone.cost);
 assert.ok(TOWERS.lullaby.cost<TOWERS.firefly.cost);
});
test('six new unique towers have independent art, mechanics and evolution',()=>{
 for(const id of NEW){
   assert.ok(TOWERS[id],id);
   assert.ok(EVOLUTIONS[id].length>=2,id);
   const art=character(id);
   assert.match(art,/<svg[^>]*>/,id);
   assert.notEqual(art,character('scout'),id);
   assert.notEqual(character(id,'default',1),art,id);
 }
 assert.equal(new Set(NEW.map(id=>character(id))).size,6);
});
test('cheap mythic and legendary towers can be deployed at the starting wallet amount',()=>{
 const s=match();s.players.p.money=500;
 assert.equal(command(s,'p',{kind:'place',type:'starseed',x:240,y:100}).ok,true);
 assert.equal(command(s,'p',{kind:'place',type:'papercrane',x:340,y:100}).ok,true);
 assert.equal(s.players.p.money,500-TOWERS.starseed.cost-TOWERS.papercrane.cost);
});
test('rare late-game sniper fires a deterministic third-shot charged projectile',()=>{
 const s=match();const e=target(s,100000);
 const result=command(s,'p',{kind:'place',type:'hunter',x:240,y:100});
 assert.equal(result.ok,true,JSON.stringify(result));
 const t=s.towers[0],hits=[];
 for(let i=0;i<3;i++){
   t.cd=0;const before=e.hp;tick(s);hits.push(before-e.hp);
 }
 assert.ok(Math.abs(hits[0]-hits[1])<1e-7);
 assert.ok(hits[2]>hits[0]*2);
 assert.ok(s.events.some(e=>e.kind==='charged'));
});
test('rare marks amplify ally damage only while active and survive save/restore',()=>{
 const s=match();const e=target(s,100000);
 const mark={id:s.nextId++,owner:'p',field:0,type:'marker',x:240,y:100,level:0,cd:0,shots:0,target:'first'};
 s.towers.push(mark);
 tick(s);
 assert.ok(e.markUntil>s.time);
 assert.equal(e.markAmp,TOWERS.marker.markAmp);
 assert.ok(s.events.some(e=>e.kind==='mark'));
 mark.cd=100;
 const scout={id:s.nextId++,owner:'p',field:0,type:'scout',x:300,y:100,level:0,cd:0,shots:0,target:'first'};
 s.towers.push(scout);
 const before=e.hp;tick(s);
 assert.ok(before-e.hp>TOWERS.scout.damage);
 const restored=JSON.parse(JSON.stringify(s));
 advance(s,.5);advance(restored,.5);
 assert.deepEqual(s,restored);
});
test('new evolutions unlock additional gameplay rather than only scaling stats',()=>{
 assert.ok(towerStats({type:'marker',level:4}).markAmp>towerStats({type:'marker',level:0}).markAmp);
 assert.equal(towerStats({type:'marker',level:3}).kind,'splash');
 assert.equal(towerStats({type:'hunter',level:3}).chargeEvery,2);
 assert.equal(towerStats({type:'papercrane',level:4}).summons,4);
 assert.equal(towerStats({type:'lullaby',level:3}).haste,.3);
 assert.ok(towerStats({type:'scrap',level:3}).pierce);
 assert.ok(towerStats({type:'starseed',level:3}).splash>TOWERS.starseed.splash);
});
