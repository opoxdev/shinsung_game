import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GUEST_PROFILE_KEY,profileKey,loadClientProfile,saveClientProfile,
  validProfile,multiplayerLoadout} from '../src/client-profile.js';
import {starterProfile,TOWERS} from '../src/data.js';
import {profileAction,createMatch,advance,rewardFor,applyReward} from '../src/engine.js';
import {roomLoadout} from '../cloudflare/worker.js';
const store=()=>{const m=new Map();return {m,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
const cfg={map:'plains',difficulty:'easy',type:'solo',modes:[]};

test('signed-in and guest profiles keep separate local wallets and loadouts without requests',()=>{
  const s=store(),guest=loadClientProfile(s),first=loadClientProfile(s,'uid-1',{seed:guest,name:'Alice'});
  assert.equal(validProfile(guest),true);
  assert.equal(validProfile(first),true);
  assert.equal(profileKey(null),GUEST_PROFILE_KEY);
  assert.notEqual(profileKey('uid-1'),profileKey('uid-2'));
  first.coins=9800;
  profileAction(first,{kind:'buyTower',id:'soldier'});
  saveClientProfile(s,'uid-1',first);
  assert.equal(s.m.size,1);
  assert.equal(loadClientProfile(s,'uid-1').coins,9050);
  assert.ok(loadClientProfile(s,'uid-1').owned.includes('soldier'));
  const another=loadClientProfile(s,'uid-2',{seed:guest,name:'Bob'});
  assert.equal(another.coins,600);
  assert.equal(loadClientProfile(s).coins,600);
  assert.equal(loadClientProfile(s,'uid-1').coins,9050);
});
test('offline local solo executes the same combat engine even if player is logged in',()=>{
  const s=store(),account=loadClientProfile(s,'uid-1');
  const match=createMatch(cfg,[{id:'local',profile:account}]);
  const before=match.time;
  advance(match,3);
  assert.ok(match.time>before);
  const reward=rewardFor(match,'local');
  applyReward(account,reward);
  saveClientProfile(s,'uid-1',account);
  assert.equal(loadClientProfile(s,'uid-1').coins,account.coins);
});
test('multiplayer sends equipment, no wallet or stored inventory',()=>{
  const p=starterProfile('Player');
  p.coins=150000;
  p.owned.push('rail');
  p.loadout.push('rail');
  p.skins={'scout:arctic':true};
  p.equippedSkins={scout:'arctic'};
  const sent=multiplayerLoadout(p);
  assert.deepEqual(Object.keys(sent).sort(),['equippedSkins','loadout','pack'].sort());
  assert.equal(sent.coins,undefined);
  assert.equal(sent.owned,undefined);
  assert.deepEqual(sent.loadout,['scout','blade','rail']);
  assert.equal(sent.equippedSkins.scout,'arctic');
  const sanitized=roomLoadout(starterProfile('Stored'),sent);
  assert.deepEqual(sanitized.loadout,sent.loadout);
  assert.equal(sanitized.coins,600);
  assert.deepEqual(sanitized.equippedSkins,{scout:'arctic'});
  for(const loadout of [[],['__proto__'],['scout','scout'],Array(7).fill('scout')])
    assert.throws(()=>roomLoadout(p,{loadout,pack:'basic'}),/장착 타워/);
});
test('cloud solo is disabled: main solo entry, store actions and auth callback avoid Cloudflare',()=>{
  const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const standalone=source.split("function startLocal(type='solo'){")[1]?.split('function beginGame()')[0];
  assert.ok(standalone);
  assert.doesNotMatch(standalone,/online\.call|apiCall|openRoom/);
  const store=source.split('async function mutate(a,reveal=false){')[1]?.split('function account()')[0];
  assert.ok(store);
  assert.doesNotMatch(store,/online\.call|apiCall|fetch\(/);
  assert.match(store,/profileAction\(profile,a\);saveLocal\(\)/);
  assert.match(source,/start\(\)\{startLocal\('solo'\);\}/);
  const cb=source.split('online.init(async user=>{')[1];
  assert.ok(cb);
  assert.doesNotMatch(cb,/online\.call\('profile'\)/);
  assert.match(cb,/online\.call\('adminStatus'\)/);
});
test('old v2 browser profiles can load intact; broken values cannot overwrite a valid account',()=>{
  const s=store(),p=starterProfile('Existing');
  p.coins=4321;p.xp=100;p.owned.push('rail');
  s.setItem(profileKey('account'),JSON.stringify(p));
  const loaded=loadClientProfile(s,'account');
  assert.equal(loaded.coins,4321);
  assert.ok(loaded.owned.includes('rail'));
  assert.equal(validProfile({...p,owned:['__proto__']}),false);
  assert.equal(validProfile({...p,loadout:[]}),false);
  assert.equal(validProfile({...p,coins:-20}),false);
});
