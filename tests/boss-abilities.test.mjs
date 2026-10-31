import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_ABILITIES, ENEMIES, starterProfile } from '../src/data.js';
import { createMatch, advance } from '../src/engine.js';
const create=()=>{const p=starterProfile();const s=createMatch({map:'plains',difficulty:'easy',type:'solo',modes:[]},[{id:'p',profile:p}]);s.queue=[];s.enemies=[];return s;};
function boss(s,type){const def=ENEMIES[type];const e={id:s.nextId++,type,field:0,hp:def.hp,maxHp:def.hp,shield:def.shield||0,maxShield:def.shield||0,progress:40,x:130,y:220,speed:0};s.enemies.push(e);return e;}
test('all authored boss mechanics have valid telegraphs and capped cooldowns',()=>{
 assert.ok(Object.keys(BOSS_ABILITIES).length>=12);
 for(const [type,b] of Object.entries(BOSS_ABILITIES)){
   assert.ok(ENEMIES[type],type);assert.ok(['rush','shield','jam'].includes(b.kind));
   assert.ok(b.cooldown>=10&&b.cooldown<=25);
   assert.ok(b.name.length>=4);
 }
});
test('rush increases movement after skill triggers',()=>{
 const s=create();const e=boss(s,'fastboss');e.speed=60;
 e.castReady=s.time+.1;
 advance(s,.15);
 assert.ok(e.rushUntil>s.time);
 const before=e.progress;
 advance(s,.5);
 assert.ok(e.progress-before>30);
 assert.ok(s.events.some(x=>x.kind==='boss-skill'&&x.skill==='rush'));
});
test('shield regeneration adds a limited amount even for depleted boss shields',()=>{
 const s=create(),e=boss(s,'warden');e.shield=0;e.castReady=s.time+.1;
 advance(s,.15);assert.ok(e.shield>0);
 assert.ok(e.shield<=e.maxShield+e.maxHp*BOSS_ABILITIES.warden.power);
 assert.ok(s.events.some(x=>x.kind==='boss-skill'&&x.skill==='shield'));
});
test('boss electromagnetic pulse only jams nearby towers on same battlefield',()=>{
 const s=create(),e=boss(s,'mecha');e.castReady=s.time+.1;
 s.towers=[{id:21,owner:'p',type:'scout',field:0,x:130,y:220,level:0,cd:0,spent:150},
 {id:22,owner:'p',type:'scout',field:0,x:1300,y:900,level:0,cd:0,spent:150}];
 advance(s,.15);
 assert.ok(s.towers[0].jammedUntil>s.time);
 assert.equal(s.towers[1].jammedUntil,undefined);
 assert.ok(s.events.some(x=>x.kind==='boss-skill'&&x.skill==='jam'));
});
test('boss skill timers remain deterministic after JSON serialization',()=>{
 const s=create();boss(s,'fastboss').castReady=.1;boss(s,'warden').castReady=.1;boss(s,'mecha').castReady=.1;
 advance(s,.5);
 const other=JSON.parse(JSON.stringify(s));
 advance(s,2);advance(other,2);
 assert.deepEqual(s,other);
});
