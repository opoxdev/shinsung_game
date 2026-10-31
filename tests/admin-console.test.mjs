import test from 'node:test';
import assert from 'node:assert/strict';
import {isAdmin,requireAdmin,adminAction,assertActiveProfile} from '../cloudflare/admin.js';
import {adminPageMarkup} from '../src/admin-panel.js';
import {Core} from '../dist/cloudflare/core.js';

const admin={uid:'admin',email:'joehw0405@gmail.com',emailVerified:true,name:'Operator'};
const normal={uid:'user-1',email:'user@example.com',emailVerified:true,name:'Player'};
function mockD1(){
  const rows=new Map([
    ['admin',{value:Core.starterProfile('Operator'),version:0,updated_at:1}],
    ['user-1',{value:Core.starterProfile('Player'),version:0,updated_at:2}]
  ]),audit=[];
  const db={prepare(sql){
    let args=[];
    const q={bind(...values){args=values;return q;},
      async first(){
        if(sql.startsWith('SELECT uid,profile_json'))return rows.has(args[0])?{uid:args[0],profile_json:JSON.stringify(rows.get(args[0]).value),version:rows.get(args[0]).version,updated_at:rows.get(args[0]).updated_at}:null;
        if(sql.startsWith('SELECT profile_json'))return rows.has(args[0])?{profile_json:JSON.stringify(rows.get(args[0]).value),version:rows.get(args[0]).version}:null;
        if(sql.includes('COUNT(*) AS users'))return {users:rows.size,banned:[...rows.values()].filter(x=>x.value.banned).length,coins:[...rows.values()].reduce((n,x)=>n+x.value.coins,0)};
        if(sql.includes('COUNT(*) AS n'))return {n:rows.size};
        return null;
      },
      async all(){
        if(sql.includes('FROM admin_audit'))return {results:audit.slice(-30).reverse().map((x,i)=>({id:i+1,...x}))};
        return {results:[...rows].map(([uid,v])=>({uid,profile_json:JSON.stringify(v.value),version:v.version,updated_at:v.updated_at}))};
      },
      async run(){
        if(sql.startsWith('INSERT OR IGNORE')){if(!rows.has(args[0]))rows.set(args[0],{value:JSON.parse(args[1]),version:0,updated_at:args[2]});return {meta:{changes:0}};}
        if(sql.startsWith('UPDATE profiles')){
          const row=rows.get(args[2]);if(!row||row.version!==args[3])return {meta:{changes:0}};
          row.value=JSON.parse(args[0]);row.version++;row.updated_at=args[1];return {meta:{changes:1}};
        }
        if(sql.startsWith('INSERT INTO admin_audit'))audit.push({actor_uid:args[0],target_uid:args[1],operation:args[2],detail:args[3],created_at:args[4]});
        return {meta:{changes:1}};
      }
    };return q;
  }};
  return {db,rows,audit};
}
test('admin permission requires exact verified Firebase email, not a client-controlled role',()=>{
  assert.equal(isAdmin(admin),true);
  assert.equal(isAdmin({...admin,emailVerified:false}),false);
  assert.equal(isAdmin({...admin,email:'attacker@gmail.com'}),false);
  assert.equal(isAdmin({...admin,email:'JOEHW0405@GMAIL.COM'}),true);
  assert.throws(()=>requireAdmin({...normal,admin:true}),/관리자 권한/);
});
test('only privileged admin can inspect and change D1 user assets',async()=>{
  const {db,rows,audit}=mockD1();
  await assert.rejects(adminAction(db,normal,'adminUsers'),/관리자 권한/);
  await assert.rejects(adminAction(db,normal,'adminChange',{uid:'user-1',operation:'coins',amount:100000}),/관리자 권한/);
  const before=rows.get('user-1').value.coins;
  const result=await adminAction(db,admin,'adminChange',{uid:'user-1',operation:'coins',amount:2000});
  assert.equal(result.profile.coins,before+2000);
  assert.equal(audit.length,1);
  assert.equal(audit[0].target_uid,'user-1');
  await assert.rejects(adminAction(db,admin,'adminChange',{uid:'user-1',operation:'coins',amount:-999999}),/변경 후 값/);
  await assert.rejects(adminAction(db,admin,'adminChange',{uid:'phantom',operation:'coins',amount:1}),/없습니다/);
  await assert.rejects(adminAction(db,admin,'adminChange',{uid:'user-1',operation:'grantTower',tower:'__proto__'}),/존재하지 않는/);
});
test('admin can grant and revoke a tower and run self-only development unlock',async()=>{
  const {db,rows}=mockD1(),owned=rows.get('user-1').value.owned;
  assert.equal(owned.includes('rail'),false);
  await adminAction(db,admin,'adminChange',{uid:'user-1',operation:'grantTower',tower:'rail'});
  assert.equal(rows.get('user-1').value.owned.includes('rail'),true);
  await adminAction(db,admin,'adminChange',{uid:'user-1',operation:'revokeTower',tower:'rail'});
  assert.equal(rows.get('user-1').value.owned.includes('rail'),false);
  await assert.rejects(adminAction(db,admin,'adminChange',{uid:'user-1',operation:'grantAllSelf'}),/관리자 본인/);
  await adminAction(db,admin,'adminChange',{uid:'admin',operation:'grantAllSelf'});
  assert.equal(rows.get('admin').value.owned.length,Object.keys(Core.TOWERS).length);
});
test('admin ban denies API access and kicks an active room; unban restores access',async()=>{
  const {db,rows,audit}=mockD1();
  rows.get('user-1').value.activeRoom='FIGHT1';
  const calls=[];
  const changed=await adminAction(db,admin,'adminChange',{uid:'user-1',operation:'ban',reason:'Test rule violation'},{
    kick:async(code,uid)=>calls.push({code,uid})
  });
  assert.equal(changed.profile.banned,true);
  assert.deepEqual(calls,[{code:'FIGHT1',uid:'user-1'}]);
  await assert.rejects(assertActiveProfile(db,normal),/이용이 제한/);
  await assert.rejects(adminAction(db,admin,'adminChange',{uid:'admin',operation:'ban',reason:'self'}),/자기 자신/);
  await adminAction(db,admin,'adminChange',{uid:'user-1',operation:'unban'});
  assert.equal(rows.get('user-1').value.banned,false);
  assert.equal(audit.length,2);
  await assertActiveProfile(db,normal);
});
test('dashboard hides unsafe HTML from profile names and includes all operator actions',()=>{
  const html=adminPageMarkup({summary:{users:2,banned:0,coins:500,version:'0.9.4'},
    listing:{items:[{uid:'user-1',name:'<img src=x>',coins:500,banned:false}],total:1,offset:0},
    selected:{uid:'user-1',name:'<img src=x>',coins:500,owned:[],loadout:[],xp:0,wins:0,banned:false},
    audit:[],diagnostics:null});
  assert.doesNotMatch(html,/<img src=x>/);
  assert.match(html,/&lt;img src=x&gt;/);
  assert.match(html,/admin-balance-form/);
  assert.match(html,/admin-tower-form/);
  assert.match(html,/adminBan/);
  assert.match(html,/adminQuickTowers/);
  assert.match(html,/adminDiagnostics/);
});
