import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_SITE_SETTINGS,readSiteSettings,writeSiteSettings,validateSiteSettings} from '../cloudflare/site-settings.js';
import {adminAction} from '../cloudflare/admin.js';
import worker,{applyAction} from '../cloudflare/worker.js';
import {Core} from '../dist/cloudflare/core.js';
import {adminPageMarkup} from '../src/admin-panel.js';
const admin={uid:'operator',email:'joehw0405@gmail.com',emailVerified:true,name:'Operator'};
const player={uid:'ordinary',email:'player@example.org',emailVerified:true,name:'Player'};
function mockDb(){
 let settings=null,version=0,updatedAt=null,created=false;
 const audit=[],p=Core.starterProfile('Ordinary player');
 p.christmasPassXP=9999;p.coins=999999;
 const db={prepare(sql){
   let args=[];
   const query={
     bind(...values){args=values;return query;},
     async first(){
       if(sql.includes('FROM site_settings')){if(!created)throw Error('D1_ERROR: no such table: site_settings');return settings===null?null:{json:JSON.stringify(settings),updated_at:updatedAt};}
       if(sql.startsWith('SELECT profile_json'))return {profile_json:JSON.stringify(p),version};
       return null;
     },
     async all(){return {results:[]};},
     async run(){
       if(sql.startsWith('CREATE TABLE')){created=true;return {meta:{changes:0}};}
       if(sql.startsWith('INSERT INTO site_settings')){
         if(settings&&settings.version!==args[2])return {meta:{changes:0}};
         settings=JSON.parse(args[0]);updatedAt=args[1];return {meta:{changes:1}};
       }
       if(sql.startsWith('INSERT INTO admin_audit')){
         audit.push({actor_uid:args[0],target_uid:args[1],operation:args[2],detail:JSON.parse(args[3])});
         return {meta:{changes:1}};
       }
       if(sql.startsWith('UPDATE profiles')){version++;Object.assign(p,JSON.parse(args[0]));return {meta:{changes:1}};}
       return {meta:{changes:1}};
     }
   };return query;
 }};
 return {db,audit,playerProfile:p,hasTable:()=>created,getSettings:()=>settings};
}
test('public site settings default to one global event/theme but do not change any profile',async()=>{
 const q=mockDb(),before=JSON.stringify(q.playerProfile);
 assert.deepEqual(await readSiteSettings(q.db),DEFAULT_SITE_SETTINGS);
 assert.equal(q.hasTable(),true);
 assert.equal(q.getSettings(),null);
 assert.equal(JSON.stringify(q.playerProfile),before);
});
test('only verified admin can close/reopen Christmas and change site-wide theme with audit history',async()=>{
 const q=mockDb(),before=JSON.stringify(q.playerProfile);
 const open=await adminAction(q.db,admin,'adminSiteSettings');
 assert.equal(open.christmasEnabled,true);
 assert.equal(open.theme,'christmas');
 await assert.rejects(adminAction(q.db,player,'adminSiteSettings'),/관리자 권한/);
 await assert.rejects(adminAction(q.db,{...admin,emailVerified:false},
   'adminUpdateSiteSettings',{christmasEnabled:false,theme:'classic',version:0}),/관리자 권한/);
 const off=await adminAction(q.db,admin,'adminUpdateSiteSettings',{
  christmasEnabled:false,theme:'classic',version:0
 });
 assert.equal(off.christmasEnabled,false);
 assert.equal(off.theme,'classic');
 assert.equal(off.version,1);
 assert.ok(off.updatedAt>0);
 assert.equal(q.audit.length,1);
 assert.equal(q.audit[0].operation,'siteSettings');
 assert.deepEqual(q.audit[0].detail.before,{christmasEnabled:true,theme:'christmas'});
 assert.deepEqual(q.audit[0].detail.after,{christmasEnabled:false,theme:'classic'});
 const on=await adminAction(q.db,admin,'adminUpdateSiteSettings',{
  christmasEnabled:true,theme:'christmas',version:1
 });
 assert.equal(on.christmasEnabled,true);
 assert.equal(on.version,2);
 assert.equal(JSON.stringify(q.playerProfile),before,
  'event activation and theme must never destroy player item/skin/battle-pass data');
});
test('global setting rejects malformed types, arbitrary fields and stale concurrent admin writes',async()=>{
 const q=mockDb();
 for(const request of [
  {christmasEnabled:'false',theme:'classic',version:0},
  {christmasEnabled:false,theme:'fake',version:0},
  {christmasEnabled:false,theme:'__proto__',version:0},
  {christmasEnabled:false,theme:'classic',version:-1},
  {christmasEnabled:false,theme:'classic',version:0,force:true},
  ['christmas',false],null
 ])await assert.rejects(writeSiteSettings(q.db,request),/운영 설정|이벤트 활성화|전체 테마/);
 const off=await writeSiteSettings(q.db,{christmasEnabled:false,theme:'classic',version:0});
 assert.equal(off.version,1);
 await assert.rejects(writeSiteSettings(q.db,{christmasEnabled:true,theme:'christmas',version:0}),
  /다른 관리자/);
 assert.equal((await readSiteSettings(q.db)).christmasEnabled,false);
});
test('anonymous read-only public endpoint exposes same global policy, including after a relaunch',async()=>{
 const q=mockDb(),env={DB:q.db};
 const get=()=>worker.fetch(new Request('https://test.invalid/settings',{method:'GET'}),env);
 let response=await get(),body=await response.json();
 assert.equal(response.status,200);
 assert.equal(body.data.christmasEnabled,true);
 assert.equal(body.data.theme,'christmas');
 assert.equal(response.headers.get('cache-control'),'no-store');
 await writeSiteSettings(q.db,{christmasEnabled:false,theme:'classic',version:0});
 response=await get();body=await response.json();
 assert.equal(body.data.christmasEnabled,false);
 assert.equal(body.data.theme,'classic');
 response=await worker.fetch(new Request('https://test.invalid/settings',{method:'POST'}),env);
 assert.equal(response.status,404);
});
test('server rejects obsolete holiday claims even when client forges event-on status',async()=>{
 const q=mockDb(),env={DB:q.db};
 await writeSiteSettings(q.db,{christmasEnabled:false,theme:'classic',version:0});
 await assert.rejects(applyAction(env,'profileAction',{kind:'christmasClaimPass',level:1},player),
  /이벤트가 종료/);
 const config={type:'solo',eventId:'christmas_1',map:'christmas_village',difficulty:'normal',modes:[]};
 await assert.rejects(applyAction(env,'soloReward',{config,wave:10,win:true,runId:'abc'},player),
  /이벤트가 종료/);
 // Ordinary collection actions are unaffected.
 const result=await applyAction(env,'profileAction',{kind:'buyTower',id:'soldier'},player);
 assert.ok(result.owned.includes('soldier'));
 assert.equal(q.playerProfile.christmasPassXP,9999);
});
test('Admin controls show a global form, preserve state and collapse audit history by default',()=>{
 const html=adminPageMarkup({siteSettings:{
  christmasEnabled:false,theme:'classic',version:4,updatedAt:123
 },summary:{users:1,banned:0,coins:300,version:'v1'},listing:{items:[],total:0,offset:0},
 audit:[{operation:'siteSettings',target_uid:'GLOBAL',created_at:123}]});
 assert.match(html,/admin-site-settings-form/);
 assert.match(html,/name="christmasEnabled"/);
 assert.match(html,/name="theme"/);
 assert.match(html,/admin-site-save/);
 assert.match(html,/<details class="admin-audit"><summary>/);
 assert.doesNotMatch(html,/<details[^>]*open/);
 assert.doesNotMatch(html,/christmasToggle|themeCycle|themeSelect/);
 assert.match(html,/보유 타워, 스킨, 배틀패스 경험치/);
});
