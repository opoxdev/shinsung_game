import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWERS, RARITIES, SKIN_STYLES, CRATES, starterProfile, skinCandidates, availableCrateStyles, skinOdds } from '../src/data.js';
import { CHARACTER_DESIGNS, COSTUME_SCHEMES } from '../src/visual-design.js';
import { character } from '../src/art.js';
import { profileAction } from '../src/engine.js';

const pathGeometry=svg=>Array.from(svg.matchAll(/<path d="([^"]+)"/g),m=>m[1]).join('|');

test('all thirty baseline characters have unique v2 tactical or advanced silhouettes',()=>{
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
    assert.ok((plain.match(/<(path|rect|ellipse|circle)\\b/g)||[]).length>=7,id);
    portraits.add(pathGeometry(plain));
  }
  assert.equal(portraits.size,ids.length,'Different towers must have distinct body/weapon geometry');
});
test('low tier identities are practical defenders, preserving their roster keys',()=>{
  assert.equal(TOWERS.scout.name,'정찰병');
  assert.equal(TOWERS.blade.name,'검술병');
  assert.equal(TOWERS.chef.name,'수류탄병');
  assert.equal(TOWERS.archer.name,'정밀 사수');
  assert.equal(TOWERS.icewitch.name,'냉각병');
  assert.equal(TOWERS.spirit.name,'드론 운용병');
  assert.equal(TOWERS.scrap.name,'중화기병');
  assert.equal(TOWERS.banker.name,'보급 기지');
  assert.equal(TOWERS.blade.rarity,'rare');
  assert.equal(TOWERS.chef.rarity,'common');
  assert.ok(!character('blade').includes('data-costume="kitsune"'));
  assert.ok(!character('chef').includes('data-costume="donut"'));
  for(const id of Object.keys(TOWERS).filter(t=>['common','rare'].includes(TOWERS[t].rarity))){
    const evolved=character(id,'default',TOWERS[id].upgrades.length);
    assert.ok(!evolved.includes('#ffe3a1'),'Early-tier upgrade must not get the high-tier gold crown: '+id);
    assert.notEqual(evolved,character(id),id);
  }
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
