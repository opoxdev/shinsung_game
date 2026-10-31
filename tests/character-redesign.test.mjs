import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWERS, RARITIES, SKIN_STYLES, CRATES, starterProfile, skinCandidates, availableCrateStyles, skinOdds } from '../src/data.js';
import { CHARACTER_DESIGNS, COSTUME_SCHEMES, BASE_ART_TIERS } from '../src/visual-design.js';
import { character } from '../src/art.js';
import { profileAction } from '../src/engine.js';

const pathGeometry=svg=>Array.from(svg.matchAll(/<path d="([^"]+)"/g),m=>m[1]).join('|');

test('all thirty baseline characters have unique silhouettes across five rarity tiers',()=>{
  const ids=Object.keys(TOWERS);
  assert.equal(ids.length,30);
  assert.deepEqual(Object.keys(CHARACTER_DESIGNS).sort(),ids.sort());
  const portraits=new Set();
  for(const id of ids){
    const plain=character(id);
    assert.match(plain,/data-design="v2"/,id);
    assert.match(plain,/<svg[^>]+viewBox="0 0 180 210"/,id);
    assert.ok(plain.includes('data-base="'+id+'"'),id);
    assert.ok(plain.includes('</svg>'),id);
    assert.ok(!plain.includes('style="filter:'),'No recolor filter allowed: '+id);
    assert.ok((plain.match(/<(path|rect|ellipse|circle)\b/g)||[]).length>=7,id);
    portraits.add(pathGeometry(plain));
  }
  assert.equal(portraits.size,ids.length,'Different towers must have distinct body/weapon geometry');
});
test('common and rare are modest, profession-specific characters rather than elite-looking heroes',()=>{
  const baseline={
    scout:'새총잡이',archer:'궁수',chef:'투척병',scrap:'포수',
    soldier:'전기공',blade:'검객',chemist:'약제사',icewitch:'서리 견습생',
    spirit:'드론 조작원',hunter:'사냥꾼',marker:'관측원'
  };
  for(const [id,name] of Object.entries(baseline)){
    assert.equal(TOWERS[id].name,name,id);
    const rarity=TOWERS[id].rarity,portrait=character(id);
    assert.ok(['common','rare'].includes(rarity),id);
    assert.equal(CHARACTER_DESIGNS[id].helmet,'none',id+' should not have a premium helmet');
    assert.ok(portrait.includes('data-art-tier="'+BASE_ART_TIERS[rarity]+'"'),id);
    assert.ok(!portrait.includes('data-upgrade="practical"'),id);
    assert.ok(!portrait.includes('data-costume="kitsune"'),id);
    assert.ok(!portrait.includes('<filter'),id);
    const maxLevel=TOWERS[id].upgrades.length;
    const evolved=character(id,'default',maxLevel);
    assert.ok(evolved.includes('data-upgrade="practical"'),id);
    assert.ok(!evolved.includes('#ffe3a1'),'No generic gold crown for '+id);
    assert.notEqual(evolved,portrait,id);
  }
  assert.equal(TOWERS.banker.name,'황금 공방');
  assert.equal(TOWERS.drone.name,'번개 발명가');
  assert.equal(TOWERS.lullaby.name,'음향 조율사');
});
test('prestige art is explicitly different by rarity even if a mythic is inexpensive to deploy',()=>{
  assert.deepEqual(BASE_ART_TIERS,{
    common:'everyday',rare:'craft',epic:'specialist',legendary:'iconic',mythic:'myth'
  });
  for(const [id,tower] of Object.entries(TOWERS)){
    const svg=character(id);
    assert.ok(svg.includes('data-art-tier="'+BASE_ART_TIERS[tower.rarity]+'"'),id);
    if(tower.rarity==='legendary'||tower.rarity==='mythic'){
      assert.ok(!svg.includes('data-upgrade="practical"'),id);
      assert.ok(svg.length>1000,id+' needs a fully authored prestige design');
    }
  }
  assert.equal(TOWERS.starseed.rarity,'mythic');
  assert.ok(TOWERS.starseed.cost<TOWERS.scout.cost,'Rarity is not in-battle deployment price');
  assert.ok(character('scout','solstice').includes('data-art-tier="costume"'));
  assert.ok(character('blade','kitsune').includes('data-art-tier="costume"'));
  assert.ok(character('chef','donut').includes('data-art-tier="costume"'));
});
test('only explicitly supported towers have newly obtainable skins',()=>{
  assert.equal(Object.keys(SKIN_STYLES).length,15);
  assert.deepEqual(Object.keys(COSTUME_SCHEMES).sort(),Object.keys(SKIN_STYLES).sort());
  for(const [skin,style] of Object.entries(SKIN_STYLES)){
    assert.ok(style.targets.length>=1&&style.targets.length<=6,skin);
    assert.ok(style.targets.length<Object.keys(TOWERS).length,'Not every tower can wear '+skin);
    assert.equal(new Set(style.targets).size,style.targets.length,skin);
    assert.ok(RARITIES[style.rarity],skin);
    for(const id of style.targets){
      assert.ok(TOWERS[id],skin+':'+id);
      assert.deepEqual(skinCandidates(skin,[id]),[id]);
    }
    const chosen=style.targets[0];
    const baseline=character(chosen),costume=character(chosen,skin);
    assert.notEqual(pathGeometry(costume),pathGeometry(baseline),'Costume must change physical silhouette: '+skin);
    assert.ok(costume.includes('data-costume="'+skin+'"'));
    assert.ok(!costume.includes('style="filter:'),'A cosmetic must be an authored outfit: '+skin);
  }
  assert.deepEqual(SKIN_STYLES.donut.targets,['chef']);
  assert.equal(SKIN_STYLES.donut.rarity,'legendary');
  assert.deepEqual(SKIN_STYLES.kitsune.targets,['blade']);
  assert.equal(SKIN_STYLES.kitsune.rarity,'mythic');
  assert.notEqual(pathGeometry(character('chef','donut')),pathGeometry(character('chef')));
  assert.notEqual(pathGeometry(character('blade','kitsune')),pathGeometry(character('blade')));
});
test('shop can report the actual obtainable per-account crate odds',()=>{
  const p=starterProfile();
  for(const [id,crate] of Object.entries(CRATES)){
    const selectable=availableCrateStyles(crate,p.owned);
    assert.ok(selectable.length>0,id+' must work with starters');
    const rates=skinOdds(crate,p.owned);
    assert.deepEqual(rates.map(r=>r.style),selectable);
    assert.ok(Math.abs(rates.reduce((a,b)=>a+b.percent,0)-100)<1e-8,id);
    assert.ok(rates.every(r=>r.percent>0&&r.percent<=100),id);
    assert.ok(rates.every(r=>skinCandidates(r.style,p.owned).length>0),id);
    assert.equal(Object.values(crate.odds).reduce((a,b)=>a+b,0),100,id);
  }
  assert.ok(!availableCrateStyles(CRATES.wardrobe,['banker']).length);
});
test('authoritative crate drops are limited to real owned tower costumes',()=>{
  const profile=starterProfile();
  profile.coins=1000000;
  for(const [box,crate] of Object.entries(CRATES)){
    profileAction(profile,{kind:'openCrate',id:box,count:10});
    assert.equal(profile.lastCrate.crate,box);
    assert.equal(profile.lastCrate.rolls.length,10);
    for(const roll of profile.lastCrate.rolls){
      assert.ok(crate.styles.includes(roll.style));
      assert.ok(SKIN_STYLES[roll.style].targets.includes(roll.id),'Unsupported pair: '+roll.id+':'+roll.style);
      assert.ok(profile.owned.includes(roll.id));
      assert.equal(roll.rarity,SKIN_STYLES[roll.style].rarity);
    }
  }
});
test('legacy cosmetics outside current limited pools remain wearable',()=>{
  const p=starterProfile();
  p.skins['scout:royal']=true;  // An old account bought this before per-tower restrictions.
  profileAction(p,{kind:'skin',id:'scout',skin:'royal'});
  assert.equal(p.equippedSkins.scout,'royal');
  assert.ok(character('scout','royal').includes('data-costume="royal"'));
  assert.deepEqual(skinCandidates('royal',['scout']),[]);
});
