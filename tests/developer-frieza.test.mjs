import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TOWERS,EVOLUTIONS,starterProfile,MAPS} from '../src/data.js';
import {createMatch,command,tick,towerStats} from '../src/engine.js';
import {character} from '../src/art.js';
import {EFFECT_TYPES,isTowerAttackEffect} from '../src/combat-fx.js';
import {roomLoadout,developerScopedProfile} from '../cloudflare/worker.js';
import {adminAction,ADMIN_EMAIL,isAdmin} from '../cloudflare/admin.js';
import {importV098Profile} from '../cloudflare/profile.js';

const admin={uid:'dev-owner',email:ADMIN_EMAIL,emailVerified:true,name:'Operator'};
const ordinary={uid:'player',email:'player@example.invalid',emailVerified:true,name:'Player'};
const rogue=()=>({...starterProfile(),owned:['scout','blade','frieza'],loadout:['frieza','scout']});
const config={type:'solo',map:'plains',difficulty:'easy',modes:[]};
const enemy=(s,hp=990000)=>({id:s.nextId++,type:'heavy',field:0,hp,maxHp:hp,
  shield:30000,maxShield:30000,x:340,y:400,progress:100,speed:0});

test('Frieza remains a single unobtainable developer-only definition with four authored evolutions',()=>{
  assert.equal(TOWERS.frieza.developerOnly,true);
  assert.equal(TOWERS.frieza.price,null);
  assert.equal(TOWERS.frieza.cap,1);
  assert.equal(TOWERS.frieza.kind,'emperor');
  assert.equal(EVOLUTIONS.frieza.length,4);
  assert.equal(TOWERS.frieza.upgrades.length,4);
  assert.ok(TOWERS.frieza.damage>1e5);
  const base=towerStats({type:'frieza',level:0});
  const top=towerStats({type:'frieza',level:4});
  assert.ok(top.damage>base.damage*6);
  assert.ok(top.interval<base.interval*.5);
  assert.ok(top.bossBonus>base.bossBonus);
  assert.equal(Object.values(TOWERS).filter(t=>!t.developerOnly).length,42);
});
test('verified developer identity alone unlocks Frieza; stale inventory cannot leak to regular players',()=>{
  assert.equal(isAdmin(admin),true);
  assert.equal(isAdmin({...admin,emailVerified:false}),false);
  const copied=developerScopedProfile(rogue(),ordinary);
  assert.equal(copied.developer,false);
  assert.ok(!copied.owned.includes('frieza'));
  assert.ok(!copied.loadout.includes('frieza'));
  assert.deepEqual(copied.owned,['scout','blade']);
  const legit=developerScopedProfile(rogue(),admin);
  assert.equal(legit.developer,true);
  assert.ok(legit.loadout.includes('frieza'));
  assert.throws(()=>roomLoadout(rogue(),{loadout:['frieza'],pack:'basic'},ordinary),/보유한 타워/);
  const room=roomLoadout(rogue(),{loadout:['frieza'],pack:'basic'},admin);
  assert.equal(room.developer,true);
  assert.deepEqual(room.loadout,['frieza']);
  assert.equal(roomLoadout(rogue(),null,ordinary).developer,false);
});
test('ordinary player cannot place even manually equipped Frieza in deterministic battle',()=>{
  const s=createMatch(config,[{id:'player',profile:rogue()}]);
  s.queue=[];s.enemies=[];s.players.player.money=10000;
  const res=command(s,'player',{kind:'place',type:'frieza',x:240,y:400});
  assert.equal(res.ok,false);
  assert.match(res.error,/개발자 전용/);
  assert.equal(s.towers.length,0);
});
test('authorized developer Frieza annihilates enemies across its field with one FX event',()=>{
  const p={...rogue(),developer:true};
  const s=createMatch(config,[{id:'dev',profile:p}]);
  s.queue=[];s.enemies=[];s.players.dev.money=100000;
  const result=command(s,'dev',{kind:'place',type:'frieza',x:240,y:400});
  assert.equal(result.ok,true,JSON.stringify(result));
  const distant=enemy(s,500000);distant.x=1500;distant.y=850;
  const near=enemy(s,280000);near.x=500;near.y=500;
  s.enemies.push(distant,near);
  tick(s);
  assert.ok(distant.hp<=0&&near.hp<=0,'Full-field attack covers near and distant enemies');
  const events=s.events.filter(e=>e.kind==='emperor'&&e.type==='frieza');
  assert.equal(events.length,1,'Only one network event per massive area attack');
  assert.equal(events[0].targets,2);
  assert.equal(isTowerAttackEffect(events[0]),true);
});
test('Frieza artwork matches the supplied violet armored character silhouette and evolves',()=>{
  const svg=character('frieza');
  assert.match(svg,/data-design="developer-emperor"/);
  assert.match(svg,/data-art-tier="developer"/);
  assert.match(svg,/data-base="frieza"/);
  assert.ok(svg.includes('f-violet')&&svg.includes('f-ivory'));
  assert.ok(svg.length>5000);
  assert.ok(EFFECT_TYPES.includes('frieza'));
  for(let lvl=1;lvl<=4;lvl++){
    const form=character('frieza','default',lvl);
    assert.ok(form.includes('data-frieza-stage="'+lvl+'"'));
    assert.notEqual(form,svg);
  }
  const css=readFileSync(new URL('../src/game.css',import.meta.url),'utf8');
  assert.match(css,/tower-card\.tower-developer/);
  assert.match(css,/frieza-card-glow/);
});
test('public collections, imports and administrative grants cannot distribute Frieza',async()=>{
  const client=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(client,/const developerAccess=/);
  assert.match(client,/const visibleTowerIds=/);
  assert.match(client,/!TOWERS\[id\]\.developerOnly\|\|developerAccess\(\)/);
  const worker=readFileSync(new URL('../cloudflare/worker.js',import.meta.url),'utf8');
  assert.match(worker,/Core\.TOWERS\[p\.id\]\?\.developerOnly/);
  assert.match(worker,/roomLoadout\(stored,p\.loadout,user\)/);
  await assert.rejects(adminAction({},admin,'adminChange',{
    uid:'player',operation:'grantTower',tower:'frieza'
  }),/개발자 전용/);
  await assert.rejects(importV098Profile({},ordinary,{
    schema:2,coins:500,xp:0,wins:0,owned:['scout','frieza'],packs:['basic']
  }),/타워 또는 팩/);
});
