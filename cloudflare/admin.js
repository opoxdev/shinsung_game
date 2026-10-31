import {Core} from '../dist/cloudflare/core.js';
import {getProfile,updateProfile} from './profile.js';

// This is a server-side authorization rule, not a UI or request-body flag.
// Firebase ID token signature/audience/issuer are validated by authenticate().
export const ADMIN_EMAIL = 'joehw0405@gmail.com';
export function isAdmin(user){
  return !!user && user.emailVerified===true &&
    typeof user.email==='string' && user.email.toLowerCase()===ADMIN_EMAIL;
}
export function requireAdmin(user){
  if(!isAdmin(user))throw Error('관리자 권한이 없습니다. 관리자 이메일 인증을 확인하세요.');
}
const validUid=uid=>{
  if(typeof uid!=='string'||uid.length<1||uid.length>128||/[\u0000-\u001f]/.test(uid))throw Error('올바르지 않은 사용자 ID입니다.');
  return uid;
};
const int=(n,min,max)=>{
  if(!Number.isSafeInteger(n)||n<min||n>max)throw Error('허용되지 않는 정수 값입니다.');
  return n;
};
function publicProfile(row){
  const p=typeof row.profile_json==='string'?JSON.parse(row.profile_json):row.value;
  return {uid:row.uid,name:String(p.name||'모험가').slice(0,30),
    coins:Number(p.coins)||0,xp:Number(p.xp)||0,wins:Number(p.wins)||0,
    owned:Array.isArray(p.owned)?p.owned.filter(x=>Object.hasOwn(Core.TOWERS,x)):[],
    loadout:Array.isArray(p.loadout)?p.loadout:[],pack:p.pack||'basic',
    banned:p.banned===true,banReason:String(p.banReason||'').slice(0,160),
    activeRoom:typeof p.activeRoom==='string'?p.activeRoom:null,
    updatedAt:row.updated_at||null,version:row.version||0};
}
async function auditReady(db){
  // Old deployments have only 'profiles'. Create this table on first admin use
  // so Git -> Cloudflare deploy needs no manual D1 migration.
  await db.prepare('CREATE TABLE IF NOT EXISTS admin_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, actor_uid TEXT NOT NULL, target_uid TEXT NOT NULL, operation TEXT NOT NULL, detail TEXT NOT NULL, created_at INTEGER NOT NULL)').run();
}
async function audit(db,actor,target,operation,detail){
  await auditReady(db);
  await db.prepare('INSERT INTO admin_audit (actor_uid,target_uid,operation,detail,created_at) VALUES (?,?,?,?,?)')
    .bind(actor,target,operation,JSON.stringify(detail),Date.now()).run();
}
async function existingProfile(db,uid){
  const row=await db.prepare('SELECT uid,profile_json,version,updated_at FROM profiles WHERE uid=?').bind(uid).first();
  if(!row)throw Error('해당 사용자 프로필이 없습니다. 게임에 로그인한 계정만 관리할 수 있습니다.');
  return row;
}
export async function assertActiveProfile(db,user){
  const p=(await getProfile(db,user)).value;
  if(p.banned===true)throw Error('이 계정은 이용이 제한되었습니다.'+(p.banReason?' 사유: '+String(p.banReason).slice(0,100):''));
  return p;
}
export async function adminAction(db,user,action,p={},helpers={}){
  requireAdmin(user);
  if(action==='adminOverview'){
    const row=await db.prepare("SELECT COUNT(*) AS users, COALESCE(SUM(CASE WHEN json_extract(profile_json,'$.banned')=1 THEN 1 ELSE 0 END),0) AS banned, COALESCE(SUM(CAST(json_extract(profile_json,'$.coins') AS INTEGER)),0) AS coins FROM profiles").first();
    return {users:row?.users||0,banned:row?.banned||0,coins:row?.coins||0,
      version:Core.VERSION,serverTime:new Date().toISOString()};
  }
  if(action==='adminUsers'){
    const search=String(p.search||'').trim().slice(0,60);
    const offset=int(p.offset??0,0,100000);
    const limit=20,where=search?" WHERE uid LIKE ? OR json_extract(profile_json,'$.name') LIKE ?":'';
    // Bound parameters: no caller-provided SQL.
    const terms=search?['%'+search+'%','%'+search+'%']:[];
    const count=await db.prepare('SELECT COUNT(*) AS n FROM profiles'+where).bind(...terms).first();
    const query=db.prepare('SELECT uid,profile_json,version,updated_at FROM profiles'+where+' ORDER BY updated_at DESC LIMIT ? OFFSET ?');
    const rows=await query.bind(...terms,limit,offset).all();
    return {items:(rows.results||[]).map(publicProfile),total:count?.n||0,offset,limit};
  }
  if(action==='adminUser'){
    const row=await existingProfile(db,validUid(p.uid));
    return publicProfile(row);
  }
  if(action==='adminAudit'){
    await auditReady(db);
    const rows=await db.prepare('SELECT id,actor_uid,target_uid,operation,detail,created_at FROM admin_audit ORDER BY id DESC LIMIT 30').all();
    return (rows.results||[]).map(row=>({...row,detail:JSON.parse(row.detail||'{}')}));
  }
  if(action==='adminDiagnostics'){
    const profileCount=(await db.prepare('SELECT COUNT(*) AS n FROM profiles').first())?.n||0;
    const result={version:Core.VERSION,time:new Date().toISOString(),
      profiles:profileCount,towerDefinitions:Object.keys(Core.TOWERS).length,
      maps:Core.MAPS.length,difficulties:Core.DIFFICULTIES.length,
      worker:'ok',database:'ok'};
    try{
      const rooms=await helpers.listRooms?.();
      result.openRooms=Array.isArray(rooms)?rooms.length:null;
      result.rooms='ok';
    }catch(e){result.rooms='error';result.roomError=String(e.message).slice(0,100);}
    return result;
  }
  if(action!=='adminChange')throw Error('지원하지 않는 관리 요청입니다.');
  const uid=validUid(p.uid),operation=String(p.operation||'');
  const allowed=['coins','xp','grantTower','revokeTower','grantAllSelf','ban','unban'];
  if(!allowed.includes(operation))throw Error('허용되지 않은 관리 작업입니다.');
  if((operation==='ban'||operation==='unban')&&uid===user.uid)throw Error('자기 자신을 제재할 수 없습니다.');
  if(operation==='grantAllSelf'&&uid!==user.uid)throw Error('전체 해금 테스트는 관리자 본인 계정에서만 사용할 수 있습니다.');
  const amount=['coins','xp'].includes(operation)?int(p.amount,-10000000,10000000):0;
  if(['coins','xp'].includes(operation)&&amount===0)throw Error('변경할 값을 입력하세요.');
  const tower=['grantTower','revokeTower'].includes(operation)?String(p.tower||''):'';
  if(['grantTower','revokeTower'].includes(operation)&&!Object.hasOwn(Core.TOWERS,tower))throw Error('존재하지 않는 타워입니다.');
  const reason=String(p.reason||'').trim().slice(0,120);
  // Must exist already: administrative actions never silently create accounts.
  await existingProfile(db,uid);
  const target={uid,name:'admin-target'};
  const updated=await updateProfile(db,target,profile=>{
    if(!Array.isArray(profile.owned)||!Array.isArray(profile.loadout))throw Error('계정 보유 데이터가 잘못되었습니다.');
    if(operation==='coins'||operation==='xp'){
      const current=Number(profile[operation]);
      if(!Number.isSafeInteger(current)||current<0)throw Error('계정 수치를 확인하세요.');
      const value=current+amount;
      if(!Number.isSafeInteger(value)||value<0||value>1000000000)throw Error('변경 후 값은 0~10억이어야 합니다.');
      profile[operation]=value;
    }else if(operation==='grantTower'){
      if(!profile.owned.includes(tower))profile.owned.push(tower);
    }else if(operation==='revokeTower'){
      if(profile.owned.includes(tower)){
        if(profile.owned.length<=1)throw Error('마지막 타워는 회수할 수 없습니다.');
        profile.owned=profile.owned.filter(x=>x!==tower);
        profile.loadout=profile.loadout.filter(x=>x!==tower);
        if(!profile.loadout.length)profile.loadout=[profile.owned[0]];
      }
    }else if(operation==='grantAllSelf'){
      profile.owned=Array.from(new Set([...profile.owned,...Object.keys(Core.TOWERS)]));
    }else if(operation==='ban'){
      profile.banned=true;profile.banReason=reason||'운영 정책 위반';
    }else if(operation==='unban'){
      profile.banned=false;delete profile.banReason;
    }
    return profile;
  });
  const detail={};
  if(['coins','xp'].includes(operation))detail.amount=amount;
  if(tower)detail.tower=tower;
  if(operation==='ban')detail.reason=reason||'운영 정책 위반';
  let auditWarning=null;
  try{await audit(db,user.uid,uid,operation,detail);}
  catch(e){auditWarning='감사 기록 저장에 실패했습니다. 운영 로그를 확인하세요.';console.error('Admin audit failed',e);}
  let kickWarning=null;
  if(operation==='ban'&&updated.activeRoom&&helpers.kick){
    try{await helpers.kick(updated.activeRoom,uid);}
    catch(e){kickWarning='현재 게임방에서 강제 퇴장에 실패했습니다. 재접속은 제한됩니다.';console.error('Admin kick failed',e);}
  }
  return {profile:publicProfile({uid,value:updated}),auditWarning,kickWarning};
}
