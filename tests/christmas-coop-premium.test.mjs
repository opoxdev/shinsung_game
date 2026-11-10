import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHRISTMAS_STAGES,EVENTS,TOWERS,SKIN_STYLES,starterProfile} from '../src/data.js';
import {validateConfig,createMatch,rewardFor,applyReward,towerStats} from '../src/engine.js';
import {matchmakingMarkup,matchmakingCards} from '../src/matchmaking.js';
import {character} from '../src/art.js';

const coopStage=n=>({type:'coop',eventId:CHRISTMAS_STAGES[n-1].id,
  map:CHRISTMAS_STAGES[n-1].map,difficulty:'normal',modes:[]});
const member=id=>({id,profile:{...starterProfile(),name:id}});

test('every Christmas chapter runs 2-4 player co-op with individually awarded progression',()=>{
  for(let i=1;i<=3;i++){
    const config=coopStage(i);
    assert.deepEqual(validateConfig(config),config);
    const s=createMatch(config,[member('alice'),member('bob')]);
    assert.equal(Object.keys(s.players).length,2);
    assert.equal(s.fields.length,1,'all members share a cooperative battlefield');
    s.status='victory';s.wave=EVENTS[config.eventId].waves.length;
    const a=rewardFor(s,'alice'),b=rewardFor(s,'bob');
    assert.equal(a.christmasStage,i);assert.equal(b.christmasStage,i);
    assert.equal(a.christmasPassXP,CHRISTMAS_STAGES[i-1].passXp);
    const ap=starterProfile(),bp=starterProfile();
    for(const p of [ap,bp])p.christmasCleared=Array.from({length:i-1},(_,index)=>index+1);
    applyReward(ap,a);applyReward(bp,b);
    assert.ok(ap.owned.includes(CHRISTMAS_STAGES[i-1].unlock));
    assert.ok(bp.owned.includes(CHRISTMAS_STAGES[i-1].unlock));
    assert.ok(ap.christmasCleared.includes(i)&&bp.christmasCleared.includes(i));
    assert.throws(()=>validateConfig({...config,type:'pvp'}),/이벤트/);
  }
});
test('the Christmas co-op lobby selects the correct chapter and room controls',()=>{
  for(let i=1;i<=3;i++){
    const cfg=coopStage(i);
    const html=matchmakingMarkup('coop',cfg,{loggedIn:true,enabled:true});
    assert.match(html,/christmas-mm/);
    assert.ok(html.includes('data-event-id="'+cfg.eventId+'"'));
    assert.match(html,/data-action="createRoom"/);
    assert.match(html,/data-action="joinPrompt"/);
    assert.match(html,/data-mode="coop"/);
    assert.match(html,/data-action="christmas"/);
  }
  const src=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(src,/data-action="christmasStageCoop"/);
  assert.ok(src.includes("eventId:id,map:stage.map,difficulty:'normal',type:'coop',modes:[]"));
  assert.ok(src.includes('(r.eventId||null)===(config.eventId||null)'));
  const cards=matchmakingCards([{code:'ABC123',type:'coop',map:'christmas_village',
    eventId:'christmas_1',count:2,capacity:4,players:['A','B'],name:'A',difficulty:'normal'}],'coop',true);
  assert.match(cards,/눈 내리는 첫 번째 밤/);
});
test('server verifies Christmas chapter ownership and live season on join and room start',()=>{
  const worker=readFileSync(new URL('../cloudflare/worker.js',import.meta.url),'utf8');
  const room=readFileSync(new URL('../cloudflare/room.js',import.meta.url),'utf8');
  assert.ok(worker.includes('Core.christmasStageUnlocked(stored,christmasStage)'));
  assert.ok(room.includes('Core.christmasStageUnlocked(p.profile,christmasStage)'));
  for(const name of ['join','start','reward'])assert.ok(room.includes("name==='"+name+"'"));
  assert.ok((room.match(/readSiteSettings\(this\.env\.DB\)/g)||[]).length>=3);
});
test('four limited towers retain collectible identity and receive meaningful base and final buffs',()=>{
  for(const id of ['cookiehouse','christmastree','snowman','stocking']){
    const tower=TOWERS[id];
    assert.equal(tower.rarity,'limited');assert.equal(tower.price,null);
    assert.equal(tower.upgrades.length,4);
    const base=towerStats({type:id,level:0}),max=towerStats({type:id,level:4});
    assert.ok(max.range>base.range);
    assert.ok(max.interval<base.interval);
    if(id==='cookiehouse'){assert.ok(base.summonHp>=430&&max.summonHp>=2000);assert.equal(max.summons,5);}
    if(id==='christmastree'){assert.ok(base.income>=340&&max.income>=1200);assert.ok(max.power>=.5);}
    if(id==='snowman'){assert.ok(base.freezeTime>=2.6&&max.freezeTime>=5);assert.ok(base.damage>=20);}
    if(id==='stocking'){assert.ok(base.income>=235&&max.income>=900);}
  }
});
test('all four limited battle pass costumes have premium distinct SVG artwork and a showcase',()=>{
  const pairs=[['blade','candyblade'],['scout','snowglobe'],['icewitch','candycane'],['knight','hollyknight']];
  const art=pairs.map(([id,skin])=>{
    assert.equal(SKIN_STYLES[skin].eventOnly,true);
    const svg=character(id,skin);
    assert.match(svg,/data-festival-spark="true"/);
    if(skin!=='candyblade')assert.ok(svg.includes('data-festival-model="'+skin+'"'));
    assert.ok(svg.length>1500,skin+' needs layered festive gear');
    return svg;
  });
  assert.equal(new Set(art).size,4);
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/christmas-skin-showcase/);
  assert.match(main,/data-festival-skin/);
});
