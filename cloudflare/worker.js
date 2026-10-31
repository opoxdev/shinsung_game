import {authenticate} from './auth.js';
import {getProfile,updateProfile,claimProfile} from './profile.js';
import {GameRoom} from './room.js';
import {Core} from '../dist/cloudflare/core.js';
export {GameRoom};
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
const cors={'access-control-allow-origin':'*','access-control-allow-methods':'POST,GET,OPTIONS','access-control-allow-headers':'authorization,content-type','access-control-max-age':'600'};
const validCode=code=>{if(typeof code!=='string'||!/^[A-Z0-9]{6}$/.test(code))throw Error('6자리 방 코드를 입력하세요.');return code;};
const stubFor=(env,code)=>env.ROOMS.get(env.ROOMS.idFromName(validCode(code)));
async function callRoom(env,code,action,payload,user){
  const r=await stubFor(env,code).fetch('https://room/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,payload,user})});
  const result=await r.json();if(!result.ok)throw Error(result.error||'게임방 오류');return result.data;
}
async function applyAction(env,action,p,user){
  const db=env.DB;
  if(action==='profile')return (await getProfile(db,user)).value;
  if(action==='diagnostic')return {name:(await getProfile(db,user)).value.name,serverTime:new Date().toISOString(),services:['Firebase Auth','Cloudflare Worker','D1','Durable Objects']};
  if(action==='profileAction'){
    return updateProfile(db,user,profile=>{
      if(profile.activeRoom)throw Error('게임방에서 나간 뒤 컬렉션을 변경하세요.');
      Core.profileAction(profile,p);return profile;
    });
  }
  if(action==='createRoom'){
    const profile=(await getProfile(db,user)).value;
    if(profile.activeRoom)throw Error('기존 방을 먼저 나가세요.');
    Core.validateConfig(p.config);
    for(let attempt=0;attempt<4;attempt++){
      const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
      try{
        await callRoom(env,code,'create',{config:p.config,profile},user);
        await updateProfile(db,user,v=>{v.activeRoom=code;return v;});
        return {code};
      }catch(e){if(!String(e.message).includes('이미 사용'))throw e;}
    }
    throw Error('방 코드 생성 실패');
  }
  if(action==='join'){
    const code=validCode(p.code),profile=(await getProfile(db,user)).value;
    if(profile.activeRoom&&profile.activeRoom!==code)throw Error('기존 방을 먼저 나가세요.');
    await callRoom(env,code,'join',{profile},user);
    await updateProfile(db,user,v=>{v.activeRoom=code;return v;});
    return {code};
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
    if(url.pathname==='/health')return response({ok:true,service:'shinsung-cloudflare',version:'0.8.0'});
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
