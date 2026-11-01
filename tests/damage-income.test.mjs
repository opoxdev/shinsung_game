import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,tick,bounty} from '../src/engine.js';
import {COMBAT_SCALE,starterProfile} from '../src/data.js';

const config=(over={})=>({map:'plains',difficulty:'easy',type:'solo',modes:[],...over});
function make(over={},ids=['a']){
 const type=over.type||'solo';
 const s=createMatch(config(over),ids.map(id=>({id,profile:{...starterProfile(),loadout:['scout']}})));
 s.queue=[];s.enemies=[];
 // Final wave prevents normal wave-advance bonuses from obscuring combat income.
 s.wave=10;
 Object.values(s.players).forEach(p=>p.money=0);
 return s;
}
const foe=(id,hp,maxHp=hp,shield=0)=>({
 id,type:'zombie',field:0,x:200,y:200,progress:50,speed:0,
 hp,maxHp,shield,maxShield:shield
});
const scout=s=>s.towers=[{id:1000,owner:'a',field:0,type:'scout',x:200,y:120,level:0,cd:0,target:'first'}];
const near=(got,want)=>assert.ok(Math.abs(got-want)<1e-8,`got ${got}, expected ${want}`);

test('partial hit earns immediate cash proportional to real HP lost',()=>{
 const s=make();s.enemies=[foe(101,10)];scout(s);
 tick(s);
 const lost=10-s.enemies[0].hp;
 assert.ok(lost>0&&lost<10);
 near(s.players.a.money,.85*bounty(10*COMBAT_SCALE)*lost/10);
 assert.equal(s.kills,0,'Enemy is not dead but money was earned');
});

test('a lethal overkill is rewarded for remaining HP only, with no extra kill cash',()=>{
 const s=make();s.enemies=[foe(101,.2,10)];scout(s);
 tick(s);
 near(s.players.a.money,.85*bounty(10*COMBAT_SCALE)*.2/10);
 assert.equal(s.kills,1);
});

test('shield-only damage yields no HP income, and healing cannot refill a paid-out reward budget',()=>{
 const s=make();s.enemies=[foe(101,10,10,100)];scout(s);
 tick(s);near(s.players.a.money,0);
 assert.ok(s.enemies[0].shield<100);
 const restore=make();restore.enemies=[foe(102,10)];restore.enemies[0].paidDamage=10;scout(restore);
 tick(restore);near(restore.players.a.money,0);
});

test('dark redistribution adds payable health budget without multiplying the minimum-1 gift',()=>{
 const s=make({modes:['darkenergy']});
 const donor=foe(101,.2,.5),receiver=foe(102,10,10);
 donor.progress=100;receiver.progress=20;
 s.enemies=[donor,receiver];scout(s);tick(s);
 assert.equal(receiver.hp,11);
 near(receiver.bonusDamageBudget,.5);
 // The extra one HP is real, but its damage income budget increases by .5 only.
 receiver.paidDamage=10;receiver.hp=1;receiver.progress=50;receiver.x=200;receiver.y=200;
 s.towers[0].cd=0;tick(s);
 near(s.players.a.money,.85*bounty(.5*COMBAT_SCALE)*(.2/.5)+.85*bounty(10*COMBAT_SCALE)*(.5/10));
});

test('PvP enemy damage pays only defenders in that field',()=>{
 const s=make({type:'pvp'},['a','b']);s.enemies=[foe(101,10)];scout(s);
 tick(s);
 assert.ok(s.players.a.money>0);
 near(s.players.b.money,0);
});
