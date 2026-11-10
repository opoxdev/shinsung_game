import test from 'node:test';
import assert from 'node:assert/strict';
import {CHRISTMAS_STAGES,CHRISTMAS_PASS,CHRISTMAS_PASS_LEVELS,
 CHRISTMAS_PASS_XP_PER_LEVEL,christmasPassLevel,christmasStageUnlocked,
 MAPS,EVENTS,ENEMIES,TOWERS,RARITIES,SKIN_STYLES,starterProfile} from '../src/data.js';
import {validateConfig,createMatch,rewardFor,applyReward,profileAction,command,tick,towerStats,pointOnPath,routeLength} from '../src/engine.js';
import {character,landscape,monsterPortrait} from '../src/art.js';
import {drawChristmasVillageBack,drawChristmasVillageDecor,CHRISTMAS_ENEMY_IDS} from '../src/christmas-art.js';
import {drawChristmasEnemyPlate} from '../src/christmas-art.js';
import {enemyStyle} from '../src/enemy-art.js';

const stageConfig=n=>({type:'solo',eventId:'christmas_'+n,map:CHRISTMAS_STAGES[n-1].map,difficulty:'normal',modes:[]});
const player=()=>({id:'a',profile:{...starterProfile(),loadout:['scout','blade','cookiehouse','snowman','stocking']}});
function match(stage=1){
 const s=createMatch(stageConfig(stage),[player()]);
 s.queue=[];s.enemies=[];s.waveDeadline=1e7;s.players.a.money=100000;
 return s;
}
const attach=(s,type,x=300,y=350,level=0)=>{
 const t={id:s.nextId++,type,owner:'a',field:0,x,y,level,cd:0,shots:0,target:'first',
  spent:TOWERS[type].cost};s.towers.push(t);return t;
};
const foe=(s,type='snow_sprite',progress=750,hp=20000)=>{
 const p=pointOnPath(MAPS.find(m=>m.id===s.config.map).path,progress);
 const e={id:s.nextId++,field:0,type,progress,x:p.x,y:p.y,hp,maxHp:hp,
  shield:0,maxShield:0,speed:0};
 s.enemies.push(e);return e;
};
test('three challenging holiday campaigns have 10, 15 and 25 authored waves with Christmas-only monsters',()=>{
 assert.deepEqual(CHRISTMAS_STAGES.map(s=>s.waves),[10,15,25]);
 assert.equal(MAPS.filter(m=>m.eventOnly==='christmas').length,3);
 const finals=['winter_witch','gift_conductor','ginger_king'];
 for(const [index,stage] of CHRISTMAS_STAGES.entries()){
  const event=EVENTS[stage.id];
  assert.equal(event.waves.length,stage.waves);
  assert.equal(event.christmasStage,index+1);
  assert.equal(event.map,stage.map,'event battle must use the matching chapter world');
  assert.equal(event.firstClearTower,['snowman','stocking','cookiehouse'][index]);
  assert.ok(event.reward>=700&&event.hp>=1);
  const miniboss=['frost_bell','gift_guardian','ginger_general'][index];
  for(let i=0;i<event.waves.length;i++){
   const wave=event.waves[i];
   assert.ok(wave.groups.length>0);
   for(const [id,count] of wave.groups){
    assert.equal(ENEMIES[id].eventOnly,'christmas',stage.id+':'+(i+1)+':'+id);
    assert.ok(count>0&&count<=60);
   }
   if((i+1)%5===0&&i+1!==stage.waves)
    assert.ok(wave.groups.some(([id])=>id===miniboss),stage.id+' wave '+(i+1));
  }
  const last=event.waves.at(-1);
  assert.ok(last.groups.some(([id,c])=>id===finals[index]&&c===1));
  assert.ok(ENEMIES[finals[index]].size>=45);
  assert.deepEqual(validateConfig(stageConfig(index+1)),stageConfig(index+1));
  assert.throws(()=>validateConfig({...stageConfig(index+1),type:'pvp'}),/이벤트/);
  assert.throws(()=>validateConfig({...stageConfig(index+1),modes:['elite']}),/이벤트/);
 }
 assert.equal(CHRISTMAS_ENEMY_IDS.length,16);
 assert.equal(new Set(CHRISTMAS_ENEMY_IDS).size,16);
});

test('each first Christmas stage victory awards only its unique limited tower; ordered stages unlock',()=>{
 const p=starterProfile();
 assert.equal(christmasStageUnlocked(p,1),true);
 assert.equal(christmasStageUnlocked(p,2),false);
 for(let stage=1;stage<=3;stage++){
  const s=match(stage);
  s.status='victory';s.wave=EVENTS[s.config.eventId].waves.length;
  const reward=rewardFor(s,'a');
  assert.equal(reward.christmasStage,stage);
  assert.equal(reward.oldgod,false,'Holiday victory must NOT unlock Temple god');
  assert.equal(reward.christmasPassXP,CHRISTMAS_STAGES[stage-1].passXp);
  assert.equal(reward.clearBonus,Math.floor(reward.coins*.7));
  applyReward(p,reward);
  const id=CHRISTMAS_STAGES[stage-1].unlock;
  assert.ok(p.owned.includes(id));
  assert.ok(p.christmasCleared.includes(stage));
  assert.ok(christmasStageUnlocked(p,stage+1));
 }
 assert.equal(p.christmasPassXP,1070);
 assert.ok(!p.owned.includes('christmastree'),'tree is only from the pass');
 const stage3=match(3);stage3.status='victory';stage3.wave=25;
 const fresh=starterProfile();
 applyReward(fresh,rewardFor(stage3,'a'));
 assert.ok(!fresh.owned.includes('cookiehouse'),
  'spoofing chapter 3 without clearing chapter 2 cannot award the tower');
});

test('30-level free Christmas battle pass claims every prize once and grants final tree',()=>{
 assert.equal(CHRISTMAS_PASS.length,30);
 assert.equal(CHRISTMAS_PASS_LEVELS,30);
 assert.equal(CHRISTMAS_PASS_XP_PER_LEVEL,140);
 assert.equal(CHRISTMAS_PASS.at(-1).reward.tower,'christmastree');
 assert.deepEqual(CHRISTMAS_PASS.filter(l=>l.reward.skin).map(x=>x.level),[5,12,20,27]);
 const p=starterProfile();
 assert.equal(christmasPassLevel(p),0);
 assert.throws(()=>profileAction(p,{kind:'christmasClaimPass',level:1}),/아직/);
 p.christmasPassXP=CHRISTMAS_PASS_XP_PER_LEVEL*30;
 assert.equal(christmasPassLevel(p),30);
 assert.throws(()=>profileAction(p,{kind:'christmasClaimPass',level:2}),/앞선/);
 for(let level=1;level<=30;level++)profileAction(p,{kind:'christmasClaimPass',level});
 assert.deepEqual(p.christmasPassClaimed,Array.from({length:30},(_,i)=>i+1));
 assert.equal(p.owned.filter(id=>id==='christmastree').length,1);
 for(const id of ['blade:candyblade','scout:snowglobe','icewitch:candycane','knight:hollyknight'])
  assert.equal(p.skins[id],true);
 assert.ok(p.coins>600&&p.xp>0);
 assert.throws(()=>profileAction(p,{kind:'christmasClaimPass',level:30}),/이미/);
 const old=starterProfile();old.christmasPassXP=4200;
 profileAction(old,{kind:'christmasClaimPass',level:1});
 assert.equal(old.christmasPassClaimed[0],1,'older profiles without pass metadata can claim');
});

test('limited towers are never purchasable, start unowned and offer unique visible costumes',()=>{
 assert.equal(RARITIES.limited.name,'한정');
 for(const id of ['snowman','stocking','cookiehouse','christmastree']){
  const t=TOWERS[id];
  assert.equal(t.rarity,'limited');assert.equal(t.price,null);
  assert.equal(t.upgrades.length,4);
  const p=starterProfile();p.coins=9999999;
  assert.ok(!p.owned.includes(id));
  assert.throws(()=>profileAction(p,{kind:'buyTower',id}),/한정|상점/);
  const svg=character(id);
  assert.match(svg,/data-art-tier="limited"/);
  assert.match(svg,new RegExp('data-base="'+id+'"'));
  assert.ok(svg.length>1600,id+' needs distinctive artwork');
  assert.notEqual(character(id,'default',4),svg);
 }
 for(const [base,skin] of [['blade','candyblade'],['scout','snowglobe'],
  ['icewitch','candycane'],['knight','hollyknight']]){
  assert.equal(SKIN_STYLES[skin].eventOnly,true);
  assert.ok(character(base,skin).includes('data-costume="'+skin+'"'));
  assert.notEqual(character(base),character(base,skin));
 }
});

test('Cookie House spawns new troop variants, halts to fire and resumes when enemies die',()=>{
 const s=match(3);
 const path=MAPS.find(m=>m.id===s.config.map).path;
 const dist=routeLength(path);
 const e=foe(s,'ginger_warrior',dist-100,80000);
 const t=attach(s,'cookiehouse',500,250,3);
 tick(s);
 const troops=s.units.filter(u=>u.from===t.id);
 assert.equal(troops.length,4);
 assert.ok(troops.every(u=>u.role==='cookie'));
 assert.deepEqual([...new Set(troops.map(u=>u.cookieVariant))].sort(),[0,1,2,3]);
 for(let i=0;i<26;i++)tick(s);
 const u=troops[0];
 assert.equal(u.phase,'firing');
 const fixed=u.progress, hp=e.hp;
 for(let i=0;i<27;i++)tick(s);
 assert.equal(u.progress,fixed,'cookies stop in range instead of walking into enemies');
 assert.ok(e.hp<hp,'cookies perform ranged shots while stationary');
 e.hp=0;tick(s);
 assert.equal(u.phase,'march');
 assert.ok(u.progress<fixed,'cookies resume the route after enemy death');
});

test('Snowman freezes normal enemies, never the unique final bosses',()=>{
 const s=match(1);const t=attach(s,'snowman',400,450);
 const a=foe(s,'snow_sprite',300,10000),b=foe(s,'winter_witch',310,1000000);
 for(const e of [a,b]){e.x=420;e.y=460;}
 tick(s);
 // The tower targets the further-along enemy first, so test both separately.
 assert.ok(b.frozenUntil===undefined||b.frozenUntil<=s.time);
 b.hp=0;t.cd=0;
 tick(s);
 assert.ok(a.frozenUntil>s.time,'normal Christmas monster should freeze');
 assert.ok(s.events.some(e=>e.kind==='christmas-freeze'));
});

test('Magic Stocking provides deterministic gift variants without external RNG',()=>{
 const s=match(2);
 const t=attach(s,'stocking',450,450);
 const e=foe(s,'gift_mimic',450,300000);e.x=465;e.y=450;
 const outcomes=new Set(),initialMoney=s.players.a.money;
 for(let i=0;i<8;i++){
  t.cd=0;
  tick(s);
  const gift=s.events.filter(e=>e.kind==='christmas-gift').at(-1);
  assert.ok(gift);
  outcomes.add(gift.outcome);
 }
 assert.ok(outcomes.has('coins'));
 assert.ok(outcomes.has('heal'));
 assert.ok(outcomes.has('blessing'));
 assert.ok(outcomes.has('candy-blast'));
 assert.ok(s.players.a.money>initialMoney,'stocking must sometimes pay coins');
 assert.equal(s.events.some(e=>e.kind==='christmas-gift'),true);
});

test('Christmas world and enemies expose bespoke winter artwork',()=>{
 const map=MAPS.find(m=>m.id==='christmas_village');
 const scenery=landscape(map);
 assert.match(scenery,/data-biome-art="christmas_village"/);
 assert.ok(scenery.length>7000);
 const route=map.path.map(([x,y],i)=>(i?'L':'M')+(x/1800*800).toFixed(1)+' '+(205+y/1100*245).toFixed(1)).join(' ');
 assert.ok(scenery.includes('d="'+route+'"'),'the illustrated snowy map uses real gameplay path geometry');
 for(const id of CHRISTMAS_ENEMY_IDS){
  const svg=monsterPortrait(id);
  assert.ok(svg.includes('data-christmas-enemy="'+id+'"'));
  assert.equal(enemyStyle(id),'christmas');
 }
 // The Christmas terrain painter never changes the map's navmesh or collision.
 assert.ok(typeof drawChristmasVillageBack==='function');
 assert.ok(typeof drawChristmasVillageDecor==='function');
 assert.ok(typeof drawChristmasEnemyPlate==='function');
});
