import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, command, advance, tick, bounty, canPlace, requiredVotes, rewardFor, profileAction, applyReward } from '../src/engine.js';
import { MAPS, TOWERS, DIFFICULTIES, COMBAT_SCALE, starterProfile } from '../src/data.js';
const config=(extra={})=>({map:'plains',difficulty:'easy',type:'solo',modes:[],...extra});
const player=(id='a')=>({id,profile:{...starterProfile(),owned:Object.keys(TOWERS),loadout:Object.keys(TOWERS)}});
const match=(extra={},ids=['a'])=>createMatch(config(extra),ids.map(player));
test('starting cash, legal placement and rejection have exact economy',()=>{const s=match();assert.equal(s.players.a.money,500);assert.equal(command(s,'a',{kind:'place',type:'scout',x:300,y:560}).ok,false);assert.equal(s.players.a.money,500);assert.equal(command(s,'a',{kind:'place',type:'scout',x:240,y:400}).ok,true);assert.equal(s.players.a.money,350);assert.equal(command(s,'a',{kind:'place',type:'scout',x:240,y:400}).ok,false);assert.equal(s.towers.length,1);assert.equal(command(s,'a',{kind:'place',type:'scout',x:NaN,y:10}).ok,false);});
test('starting cash rises with campaign difficulty for solo, co-op, and PvP alike',()=>{
  const expected={easy:500,normal:650,hard:850,extreme:1100,hell:1400,ruin:1800};
  assert.deepEqual(Object.fromEntries(DIFFICULTIES.map(d=>[d.id,d.startMoney])),expected);
  for(const [difficulty,money] of Object.entries(expected)){
    for(const type of ['solo','coop','pvp']){
      const ids=type==='solo'?['a']:['a','b'];
      const s=match({difficulty,type},ids);
      for(const id of ids)assert.equal(s.players[id].money,money,difficulty+' '+type+' '+id);
      const costs=type==='pvp'?0:TOWERS.scout.cost;
      assert.ok(money>=costs);
    }
  }
});
test('ownership, loadout, replay and target inputs are checked',()=>{const s=match({type:'coop'},['a','b']);command(s,'a',{kind:'place',type:'scout',x:240,y:400,seq:1});assert.equal(command(s,'a',{kind:'place',type:'scout',x:400,y:400,seq:1}).ok,false);assert.equal(command(s,'b',{kind:'sell',id:s.towers[0].id}).ok,false);assert.equal(command(s,'a',{kind:'target',id:s.towers[0].id,target:'bad'}).ok,false);s.players.a.loadout=['blade'];assert.equal(command(s,'a',{kind:'place',type:'rail',x:700,y:700}).ok,false);});
test('upgrade and sell return 70% of total expenditure',()=>{const s=match();s.players.a.money=10000;command(s,'a',{kind:'place',type:'scout',x:240,y:400});const id=s.towers[0].id;command(s,'a',{kind:'upgrade',id});assert.equal(s.towers[0].level,1);command(s,'a',{kind:'sell',id});assert.equal(s.players.a.money,10000-330+231);});
test('tower cap is shared by coop players; mode and strong tower caps enforced',()=>{const s=match({type:'coop',modes:['shortage']},['a','b']);Object.values(s.players).forEach(p=>p.money=1e6);for(let i=0;i<5;i++)assert.equal(command(s,i%2?'a':'b',{kind:'place',type:'scout',x:100+i*80,y:100}).ok,true);assert.equal(command(s,'a',{kind:'place',type:'scout',x:700,y:100}).ok,false);const t=match();t.players.a.money=1e6;for(let i=0;i<3;i++)assert.equal(command(t,'a',{kind:'place',type:'rail',x:100+i*80,y:100}).ok,true);assert.equal(command(t,'a',{kind:'place',type:'rail',x:700,y:100}).ok,false);});
test('bounty matches reference anchors, increases sublinearly',()=>{assert.equal(bounty(10),5);assert.equal(bounty(5000),500);assert.equal(bounty(80000),2000);assert.ok(bounty(160000)<4000);assert.equal(bounty(NaN),0);});
test('solo skip keeps enemies and pending spawns; vote thresholds and duplicates',()=>{const s=match();assert.equal(command(s,'a',{kind:'skip'}).ok,false);advance(s,8.1);const alive=s.enemies.length,pending=s.queue.length;command(s,'a',{kind:'skip'});assert.equal(s.wave,2);assert.equal(s.enemies.length,alive);assert.ok(s.queue.length>pending);for(const n of [2,3,4]){const t=match({type:'coop'},Array.from({length:n},(_,i)=>String(i)));assert.equal(requiredVotes(t),n===4?3:2);advance(t,8.1);command(t,'0',{kind:'skip'});command(t,'0',{kind:'skip'});assert.equal(t.wave,1);command(t,'1',{kind:'skip'});if(n===4){assert.equal(t.wave,1);command(t,'2',{kind:'skip'});}assert.equal(t.wave,2);}});
test('PvP sends to opponent, validates money and cooldown',()=>{const s=match({type:'pvp'},['a','b']);assert.equal(command(s,'a',{kind:'send',type:'zombie'}).ok,true);assert.equal(s.enemies[0].field,1);assert.equal(s.players.a.money,440);assert.equal(command(s,'a',{kind:'send',type:'zombie'}).ok,false);assert.equal(command(s,'a',{kind:'send',type:'doom'}).ok,false);advance(s,4.1);assert.equal(command(s,'a',{kind:'send',type:'zombie'}).ok,true);});
test('PvP wave can advance when only one field is clear',()=>{const s=match({type:'pvp'},['a','b']);advance(s,10);s.queue=s.queue.filter(e=>e.field===1);s.enemies=s.enemies.filter(e=>e.field===1);assert.ok(s.enemies.length);tick(s);assert.equal(s.wave,2);});
test('coop kill income is divided among participants without money duplication',()=>{const s=match({type:'coop'},['a','b']);s.queue=[];s.enemies=[{id:999,type:'zombie',field:0,hp:1/COMBAT_SCALE,maxHp:10/COMBAT_SCALE,x:200,y:200,progress:10,speed:0}];s.towers=[{id:1000,type:'scout',field:0,owner:'a',x:200,y:120,level:0,cd:0,target:'first'}];s.wave=10;tick(s);assert.equal(s.players.a.money,502.5);assert.equal(s.players.b.money,502.5);});
test('six campaigns have distinct wave compositions, lengths and rewards; five valid maps',()=>{assert.equal(new Set(DIFFICULTIES.map(d=>d.waves.length)).size,6);assert.equal(new Set(DIFFICULTIES.map(d=>JSON.stringify(d.waves))).size,6);for(const m of MAPS){const s=match({map:m.id});assert.ok(m.path.length>=5);assert.ok(Number.isFinite(m.path[0][0]));advance(s,5);assert.ok(s.enemies.length>0);}});
test('shop ownership, prototype IDs, capacity and crate-only cosmetic ownership',()=>{
 const p=starterProfile();
 assert.throws(()=>profileAction(p,{kind:'buyTower',id:'rail'}));
 assert.throws(()=>profileAction(p,{kind:'buyTower',id:'__proto__'}));
 assert.throws(()=>profileAction(p,{kind:'buyTower',id:'scout'}));
 assert.throws(()=>profileAction(p,{kind:'skin',id:'scout',skin:'arctic'}),/상자/);
 assert.equal(p.coins,600);
 profileAction(p,{kind:'skin',id:'scout',skin:'default'});
 p.skins['scout:arctic']=true;
 profileAction(p,{kind:'skin',id:'scout',skin:'arctic'});
 assert.equal(p.equippedSkins.scout,'arctic');
 assert.equal(p.coins,600);
 assert.throws(()=>profileAction(p,{kind:'skin',id:'sonic',skin:'arctic'}));
});
test('clear reward and Sonic unlock are conditional; PvP has no currency payout',()=>{const s=match({difficulty:'extreme',modes:['supersonic']});s.status='victory';s.winner=0;const r=rewardFor(s,'a');assert.equal(r.coins,2200);assert.equal(r.sonic,true);const p=starterProfile();applyReward(p,r);assert.ok(p.owned.includes('sonic'));s.status='defeat';const partial=rewardFor(s,'a');assert.equal(partial.coins,Math.floor((2200-Math.floor(2200*.2))*.5/DIFFICULTIES.find(d=>d.id==='extreme').waves.length));assert.equal(partial.clearBonus,0);assert.equal(partial.sonic,false);const v=match({type:'pvp'},['a','b']);v.status='complete';v.winner=0;assert.equal(rewardFor(v,'a').coins,0);});
test('fixed-step simulation survives serialization and remains deterministic',()=>{const s=match();command(s,'a',{kind:'place',type:'scout',x:240,y:400});advance(s,10);const copy=JSON.parse(JSON.stringify(s));advance(s,20);advance(copy,20);assert.deepEqual(s,copy);assert.throws(()=>tick(s,100));});
test('final wave requires queued and living enemies to be cleared',()=>{const s=match();s.wave=10;s.queue=[];s.enemies=[];tick(s);assert.equal(s.status,'victory');const v=match();v.wave=10;v.queue=[{type:'boss',field:0,at:100}];v.enemies=[];tick(v);assert.equal(v.status,'playing');});

