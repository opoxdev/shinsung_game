import test from 'node:test';
import assert from 'node:assert/strict';
import { CRATES, SKIN_STYLES, RARITIES, starterProfile } from '../src/data.js';
import { profileAction } from '../src/engine.js';

const prices={forest:400,wardrobe:1000,winter:1500,cyber:3000,astral:5000};

test('all five themed boxes have the requested prices and valid rarity pools',()=>{
 assert.equal(Object.keys(CRATES).length,5);
 for(const [id,price] of Object.entries(prices)){
   const box=CRATES[id];
   assert.ok(box,id);
   assert.equal(box.price,price,id);
   assert.equal(Object.values(box.odds).reduce((a,b)=>a+b,0),100,id);
   for(const style of box.styles)assert.ok(RARITIES[SKIN_STYLES[style].rarity],id+':'+style);
 }
});
test('the server charges each selected box price, preserving its theme and item rarity',()=>{
 for(const [id,price] of Object.entries(prices)){
   const p=starterProfile();
   p.coins=price+1000;
   const before=p.coins;
   profileAction(p,{kind:'openCrate',id,count:1});
   assert.equal(p.lastCrate.crate,id);
   assert.equal(p.lastCrate.price,price);
   assert.equal(p.lastCrate.rolls.length,1);
   assert.ok(p.coins<=before&&p.coins>=before-price,id);
   for(const roll of p.lastCrate.rolls){
     assert.ok(CRATES[id].styles.includes(roll.style));
     assert.equal(roll.rarity,SKIN_STYLES[roll.style].rarity);
   }
 }
});
test('box opening rejects insufficient funds for 1x and 10x and keeps the wallet unchanged',()=>{
 for(const [id,price] of Object.entries(prices)){
   const single=starterProfile();single.coins=price-1;
   assert.throws(()=>profileAction(single,{kind:'openCrate',id,count:1}),/코인/);
   assert.equal(single.coins,price-1);
   const ten=starterProfile();ten.coins=price*10-1;
   assert.throws(()=>profileAction(ten,{kind:'openCrate',id,count:10}),/코인/);
   assert.equal(ten.coins,price*10-1);
 }
});
