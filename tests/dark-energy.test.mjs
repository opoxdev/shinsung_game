import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWERS,MODES,DIFFICULTIES,starterProfile} from '../src/data.js';
import {character} from '../src/art.js';
import {createMatch,tick,rewardFor,applyReward} from '../src/engine.js';

const cfg=(over={})=>({map:'plains',difficulty:'extreme',type:'solo',modes:['darkenergy'],...over});
const make=(over={})=>createMatch(cfg(over),[{id:'a',profile:{...starterProfile(),loadout:['scout']}}]);
const enemy=(id,maxHp,hp,field=0,progress=20)=>({id,type:'zombie',field,maxHp,hp,shield:0,maxShield:0,x:200,y:200,progress,speed:0});

test('Dark Energy mode is selectable and mythic character has original self-contained artwork',()=>{
 assert.ok(MODES.darkenergy);assert.ok(MODES.darkenergy.reward>1);
 assert.equal(TOWERS.voidwalker.rarity,'mythic');
 assert.equal(TOWERS.voidwalker.price,null);
 assert.match(character('voidwalker'),/data-base="voidwalker"/);
 assert.match(character('voidwalker'),/vw-flame/);
 assert.ok(TOWERS.voidwalker.upgrades.length>=3);
});

test('a death redistributes original max HP equally, overfills survivors, and emits one bounded effect',()=>{
 const s=make();
 s.queue=[];s.enemies=[enemy(101,12,.5,0,100),enemy(102,4,4),enemy(103,6,6)];
 s.towers=[{id:201,type:'scout',field:0,owner:'a',x:200,y:120,level:0,cd:0,shots:0,target:'first'}];
 tick(s);
 assert.equal(s.kills,1);
 assert.equal(s.enemies.length,2);
 assert.equal(s.enemies[0].hp,10);
 assert.equal(s.enemies[1].hp,12);
 assert.ok(s.enemies.every(e=>e.hp>e.maxHp),'Surplus health must not be capped');
 const transfer=s.events.filter(e=>e.kind==='dark-transfer');
 assert.equal(transfer.length,1);
 assert.equal(transfer[0].amount,6);
 assert.equal(transfer[0].count,2);
 assert.equal(transfer[0].targets.length,2);
 // Healing/regen tick must preserve the extra life granted by the mode.
 tick(s);
 assert.equal(s.enemies[0].hp,10);
 assert.equal(s.enemies[1].hp,12);
});

test('minimum one HP per living recipient and no transfer on field leakage or empty field',()=>{
 const s=make();s.queue=[];s.enemies=[enemy(101,1,.1,0,100),enemy(102,10,10),enemy(103,20,20)];
 s.towers=[{id:201,type:'scout',field:0,owner:'a',x:200,y:120,level:0,cd:0,target:'first'}];tick(s);
 assert.deepEqual(s.enemies.map(e=>e.hp),[11,21]);
 assert.equal(s.events.find(e=>e.kind==='dark-transfer').amount,1);
 const leak=make();leak.queue=[];leak.enemies=[enemy(111,1,1,0,1e9),enemy(112,3,3,0,0)];tick(leak);
 assert.equal(leak.events.some(e=>e.kind==='dark-transfer'),false,'Escaped enemies do not redistribute');
});

test('reward only unlocks the unit for actual wins at extreme or higher with the mode',()=>{
 const p=starterProfile();
 for(const difficulty of ['easy','normal','hard','extreme','hell','ruin']){
  const s=make({difficulty});s.status='victory';
  const reward=rewardFor(s,'a');assert.equal(reward.voidwalker,DIFFICULTIES.findIndex(d=>d.id===difficulty)>=3,difficulty);
 }
 const success=make();success.status='victory';const prize=rewardFor(success,'a');
 applyReward(p,prize);applyReward(p,prize);
 assert.equal(p.owned.filter(id=>id==='voidwalker').length,1);
 const loss=make();loss.status='defeat';assert.equal(rewardFor(loss,'a').voidwalker,false);
 const noMode=make({modes:[]});noMode.status='victory';assert.equal(rewardFor(noMode,'a').voidwalker,false);
 const event=make({eventId:'temple_of_ruin',map:'temple_ruin',difficulty:'normal',modes:[]});event.status='victory';
 assert.equal(rewardFor(event,'a').voidwalker,false);
});
