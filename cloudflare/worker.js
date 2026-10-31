import {authenticate} from './auth.js';
import {getProfile,updateProfile,claimProfile,claimSoloProfile,importV098Profile} from './profile.js';
import {GameRoom} from './room.js';
import {Core} from '../dist/cloudflare/core.js';
import {isAdmin,adminAction,assertActiveProfile} from './admin.js';
export {GameRoom};
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
const cors={'access-control-allow-origin':'*','access-control-allow-methods':'POST,GET,OPTIONS','access-control-allow-headers':'authorization,content-type','access-control-max-age':'600'};
const validCode=code=>{if(typeof code!=='string'||!/^[A-Z0-9]{6}$/.test(code))throw Error('6자리 방 코드를 입력하세요.');return code;};
const stubFor=(env,code)=>env.ROOMS.get(env.ROOMS.idFromName(validCode(code)));
const directoryStub=env=>env.ROOMS.get(env.ROOMS.idFromName('PUBLIC_ROOM_DIRECTORY_V1'));
export async function listRooms(env){
  const r=await directoryStub(env).fetch('https://directory/action',{method:'POST',
    headers:{'content-type':'application/json'},body:JSON.stringify({action:'directoryList',payload:{}})});
  const result=await r.json();if(!result.ok)throw Error(result.error||'공개 방 목록을 불러올 수 없습니다.');
  return result.data;
}
async function callRoom(env,code,action,payload,user){
  const r=await stubFor(env,code).fetch('https://room/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,payload,user})});
  const result=await r.json();if(!result.ok)throw Error(result.error||'게임방 오류');return result.data;
}

export function roomLoadout(stored,requested){
  // D1 is the authoritative collection. Client may select owned equipment only.
  if(!requested)return stored;
  if(typeof requested!=='object'||Array.isArray(requested))throw Error('잘못된 타워 구성입니다.');
  const ids=requested.loadout;
  if(!Array.isArray(ids)||!ids.length||ids.length>5||new Set(ids).size!==ids.length||
     ids.some(id=>typeof id!=='string'||!stored.owned.includes(id)))throw Error('서버에 보유한 타워만 장착할 수 있습니다.');
  if(typeof requested.pack!=='string'||!stored.packs.includes(requested.pack))throw Error('서버에 보유한 몬스터 팩만 사용할 수 있습니다.');
  const equippedSkins={};
  for(const id of ids){
    const skin=requested.equippedSkins?.[id];
    if(skin==='default'||(typeof skin==='string'&&stored.skins?.[id+':'+skin]))equippedSkins[id]=skin;
  }
  return {...stored,loadout:ids,pack:requested.pack,equippedSkins};
}

export async function applyAction(env,action,p,user){
  const db=env.DB;
  if(action==='adminStatus')return {admin:isAdmin(user),emailVerified:user.emailVerified===true};
  if(action.startsWith('admin')){
    return adminAction(db,user,action,p,{
      listRooms:()=>listRooms(env),
      kick:(code,uid)=>callRoom(env,code,'adminKick',{uid},{uid:user.uid,admin:true})
    });
  }
  // A ban applies to all regular HTTP APIs (including reward claims, room
  // creation and tickets). Existing WebSockets are removed by adminKick.
  await assertActiveProfile(db,user);
  if(action==='profile')return (await getProfile(db,user)).value;
  if(action==='listRooms')return listRooms(env);
  if(action==='diagnostic')return {name:(await getProfile(db,user)).value.name,serverTime:new Date().toISOString(),services:['Firebase Auth','Cloudflare Worker','D1','Durable Objects']};
  if(action==='profileAction'){
    return updateProfile(db,user,profile=>{
      if(profile.activeRoom)throw Error('게임방에서 나간 뒤 컬렉션을 변경하세요.');
      Core.profileAction(profile,p);return profile;
    });
  }
  if(action==='soloReward'){
    const cfg=Core.validateConfig(p.config);
    if(cfg.type!=='solo')throw Error('솔로 전투 보상만 정산할 수 있습니다.');
    const diff=Core.DIFFICULTIES.find(d=>d.id===cfg.difficulty);
    if(!Number.isSafeInteger(p.wave)||p.wave<1||p.wave>diff.waves.length||typeof p.win!=='boolean')
      throw Error('웨이브 결과가 올바르지 않습니다.');
    if(p.win&&p.wave!==diff.waves.length)throw Error('마지막 웨이브를 클리어해야 승리 보상을 받을 수 있습니다.');
    // The browser runs the battle; the Worker computes rewards from game data,
    // not client-submitted coins/XP, without creating a Durable Object.
    const match={config:cfg,players:{[user.uid]:{field:0}},
      wave:p.wave,status:p.win?'victory':'defeat'};
    return claimSoloProfile(db,user,p.runId,Core.rewardFor(match,user.uid));
  }
  if(action==='importV098')return importV098Profile(db,user,p.profile);
  if(action==='createRoom'){
    const stored=(await getProfile(db,user)).value;
    if(stored.activeRoom)throw Error('기존 서버 방을 먼저 나가세요. 이전 버전에서 남은 방이라면 계정 메뉴에서 서버 방 정리를 실행하세요.');
    const cfg=Core.validateConfig(p.config);
    if(!['pvp','coop'].includes(cfg.type))throw Error('솔로 전투는 브라우저에서만 실행됩니다.');
    const profile=roomLoadout(stored,p.loadout);
    for(let attempt=0;attempt<4;attempt++){
      const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
      try{
        await callRoom(env,code,'create',{config:p.config,profile,code},user);
        await updateProfile(db,user,v=>{v.activeRoom=code;return v;});
        return {code};
      }catch(e){if(!String(e.message).includes('이미 사용'))throw e;}
    }
    throw Error('방 코드 생성 실패');
  }
  if(action==='join'){
    const code=validCode(p.code),stored=(await getProfile(db,user)).value;
    if(stored.activeRoom&&stored.activeRoom!==code)throw Error('기존 서버 방을 먼저 나가세요. 이전 버전에서 남은 방이라면 계정 메뉴에서 서버 방 정리를 실행하세요.');
    const profile=roomLoadout(stored,p.loadout);
    await callRoom(env,code,'join',{profile,code},user);
    await updateProfile(db,user,v=>{v.activeRoom=code;return v;});
    return {code};
  }
  if(action==='clearLegacyRoom'){
    // Only for explicit multiplayer room cleanup, never during solo play.
    const stored=(await getProfile(db,user)).value;
    if(!stored.activeRoom)return {cleared:true};
    try{await callRoom(env,stored.activeRoom,'leave',{},user);}
    catch(e){if(!String(e.message).includes('존재하지 않거나 만료'))throw e;}
    await updateProfile(db,user,v=>{delete v.activeRoom;return v;});
    return {cleared:true};
  }
  if(action==='leave'){
    const code=validCode(p.code);
    let res;try{res=await callRoom(env,code,'leave',{},user);}catch(e){if(!String(e.message).includes('존재하지 않거나 만료'))throw e;res={left:true,stale:true};}
    await updateProfile(db,user,v=>{if(v.activeRoom===code)delete v.activeRoom;return v;});
    return res;
  }
  if(action==='claim'){
    const code=validCode(p.code);
    const reward=await callRoom(env,code,'reward',{},user);
    return claimProfile(db,user,code,reward);
  }
  if(action==='ticket'){
    const code=validCode(p.code);
    return {...await callRoom(env,code,'ticket',{},user),code};
  }
  if(['start','command','pulse'].includes(action))return callRoom(env,p.code,action,p,user);
  throw Error('지원하지 않는 요청입니다.');
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/health')return response({ok:true,service:'shinsung-cloudflare',version:'0.9.9'});
    // Browsing rooms is public; mutating a lobby still requires Firebase auth.
    if(url.pathname==='/rooms'&&request.method==='GET'){
      const mode=url.searchParams.get('mode');
      if(!['pvp','coop'].includes(mode))return response({ok:false,error:'PvP 또는 협동전 유형을 선택하세요.'},400);
      try{
        const rooms=await listRooms(env);
        const available=rooms.filter(r=>r?.type===mode&&r.count>0&&r.count<r.capacity)
          .map(r=>({code:r.code,name:r.name,type:r.type,map:r.map,
            difficulty:r.difficulty,count:r.count,capacity:r.capacity,
            players:Array.isArray(r.players)?r.players.slice(0,r.capacity):[],
            createdAt:r.createdAt}));
        return response({ok:true,data:available});
      }catch(e){
        console.error('Public room directory unavailable:',e);
        return response({ok:false,error:'방 목록 서버 연결에 실패했습니다. 다시 시도해 주세요.'},503);
      }
    }
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(url.pathname==='/socket'){
      try{
        if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')throw Error('WebSocket 연결 요청이 아닙니다.');
        const code=validCode(url.searchParams.get('code'));
        if(!/^[a-f0-9-]{36}$/.test(url.searchParams.get('ticket')||''))throw Error('잘못된 티켓입니다.');
        return await stubFor(env,code).fetch(request);
      }catch{return response({ok:false,error:'접속 권한이 없습니다.'},403);}
    }
    if(url.pathname!=='/api'||request.method!=='POST')return response({ok:false,error:'경로 없음'},404);
    try{
      if(Number(request.headers.get('content-length')||0)>8192)throw Error('요청이 너무 큽니다.');
      const user=await authenticate(request,env);
      const input=await request.json();
      if(JSON.stringify(input).length>8192||typeof input.action!=='string')throw Error('잘못된 요청입니다.');
      return response({ok:true,data:await applyAction(env,input.action,input.payload||{},user)});
    }catch(e){return new Response(JSON.stringify({ok:false,error:String(e.message||'서버 오류').slice(0,200)}),{status:400,headers:{'content-type':'application/json',...cors}});}
  }
};
