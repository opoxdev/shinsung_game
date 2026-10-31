import test from 'node:test';
import assert from 'node:assert/strict';
import { starterProfile, TOWERS, PACKS, SKIN_STYLES, CRATES } from '../src/data.js';
import { profileAction } from '../src/engine.js';
import { monsterPortrait, character } from '../src/art.js';
test('purchased packs stay in the collection until explicitly equipped',()=>{
 const p=starterProfile();p.coins=10000;
 profileAction(p,{kind:'buyPack',id:'twilight'});
 assert.ok(p.packs.includes('twilight'));
 assert.equal(p.pack,'basic');
 profileAction(p,{kind:'pack',id:'twilight'});
 assert.equal(p.pack,'twilight');
 assert.throws(()=>profileAction(p,{kind:'pack',id:'__proto__'}));
});
test('skin crate uses honest odds, charges the right price, and reveals server-defined items',()=>{
 const p=starterProfile();p.coins=5000;
 assert.equal(Object.values(SKIN_STYLES).reduce((sum,v)=>sum+v.weight,0),100);
 assert.throws(()=>profileAction(p,{kind:'openCrate',id:'wardrobe',count:11}));
 assert.throws(()=>profileAction(p,{kind:'openCrate',id:'__proto__',count:1}));
 const before=p.coins;
 profileAction(p,{kind:'openCrate',id:'wardrobe',count:10});
 assert.equal(p.lastCrate.rolls.length,10);
 assert.ok(p.coins<=before);
 assert.ok(p.coins>=before-CRATES.wardrobe.price*10);
 assert.ok(p.lastCrate.rolls.every(r=>p.owned.includes(r.id)&&Object.hasOwn(SKIN_STYLES,r.style)));
 for(const r of p.lastCrate.rolls)assert.equal(p.skins[r.id+':'+r.style],true);
});
test('ten consecutive duplicates guarantee a missing cosmetic where available',()=>{
 const p=starterProfile();p.coins=10000;p.cratePity=9;
 p.skins['scout:arctic']=true;p.skins['blade:arctic']=true;
 const missingBefore=p.owned.flatMap(id=>['arctic','neon','royal'].filter(k=>!p.skins[id+':'+k]));
 assert.ok(missingBefore.length);
 profileAction(p,{kind:'openCrate',id:'wardrobe',count:1});
 assert.equal(p.lastCrate.rolls[0].guaranteed,true);
 assert.equal(p.lastCrate.rolls[0].duplicate,false);
 assert.equal(p.cratePity,0);
});
test('owned styles remain cosmetic only with distinctive art',()=>{
 for(const skin of Object.keys(SKIN_STYLES)){
   assert.notEqual(character('scout',skin),character('scout','default'));
   assert.notEqual(character('archer',skin),character('archer','default'));
 }
});
test('each PvP pack has actual enemy portrait artwork, not generic colored squares',()=>{
 for(const p of Object.values(PACKS))for(const [id] of p.monsters){
   const svg=monsterPortrait(id);
   assert.match(svg,/<svg/);
   assert.match(svg,/<path/);
   assert.ok(svg.includes('</svg>'));
 }
});

test('existing account profiles migrate safely when cosmetic fields are absent',()=>{
 const p=starterProfile();p.coins=1000;delete p.skins;delete p.equippedSkins;delete p.cratePity;
 profileAction(p,{kind:'openCrate',id:'wardrobe',count:1});
 assert.equal(typeof p.skins,'object');
 assert.equal(typeof p.equippedSkins,'object');
 assert.ok(Number.isSafeInteger(p.cratePity));
 assert.equal(p.lastCrate.rolls.length,1);
});
test('a full 10-pull never exceeds available coins and gives exactly ten outcomes',()=>{
 const p=starterProfile();p.coins=2400;
 profileAction(p,{kind:'openCrate',id:'wardrobe',count:10});
 assert.equal(p.lastCrate.rolls.length,10);
 assert.ok(p.coins>=0);
 assert.throws(()=>profileAction(p,{kind:'openCrate',id:'wardrobe',count:10}),/코인/);
});
test('invalid or prototype tower entries cannot be selected as crate rewards',()=>{
 const p=starterProfile();p.owned=['__proto__','scout'];p.coins=1000;
 profileAction(p,{kind:'openCrate',id:'wardrobe',count:1});
 assert.equal(p.lastCrate.rolls[0].id,'scout');
});
