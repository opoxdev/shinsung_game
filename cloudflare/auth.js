// Verify Firebase ID tokens with Google's public signing keys, not by decoding claims alone.
const keyUrl = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const decode = input => {
  const value = input.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(value.padEnd(Math.ceil(value.length/4)*4,'=')), c=>c.charCodeAt(0));
};
const jsonPart = input => JSON.parse(new TextDecoder().decode(decode(input)));
let keyCache = {expires:0, keys:[]};
export async function authenticate(request, env) {
  const header = request.headers.get('authorization') || '';
  if (!/^Bearer [\w.-]+$/.test(header) || header.length > 6500) throw Error('로그인이 필요합니다.');
  const jwt = header.slice(7), parts = jwt.split('.');
  if(parts.length!==3)throw Error('잘못된 인증 토큰입니다.');
  const head=jsonPart(parts[0]), p=jsonPart(parts[1]);
  const now=Math.floor(Date.now()/1000),project=env.FIREBASE_PROJECT_ID;
  if(!project || head.alg!=='RS256'||typeof head.kid!=='string'||
     p.aud!==project||p.iss!==`https://securetoken.google.com/${project}`||
     typeof p.sub!=='string'||p.sub.length>128||!p.sub||
     !Number.isFinite(p.iat)||p.iat>now+60||
     !Number.isFinite(p.exp)||p.exp<=now||
     !Number.isFinite(p.auth_time)||p.auth_time>now+60) throw Error('로그인이 만료되었거나 잘못되었습니다.');
  if(Date.now()>keyCache.expires){
    const r=await fetch(keyUrl);
    if(!r.ok) throw Error('인증키 조회 실패');
    const data=await r.json();
    const cacheControl=r.headers.get('cache-control')||'';
    const maxAge=Math.max(60,Math.min(3600,Number(/max-age=(\d+)/.exec(cacheControl)?.[1]||600)));
    keyCache={keys:data.keys||[],expires:Date.now()+maxAge*1000};
  }
  const key=keyCache.keys.find(k=>k.kid===head.kid&&k.kty==='RSA');
  if(!key)throw Error('인증 토큰 서명키를 찾을 수 없습니다.');
  const imported=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',imported,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('서명이 올바르지 않습니다.');
  const name=String(p.name || p.email?.split('@')[0] || '모험가').replace(/[<>\u0000-\u001f]/g,'').slice(0,20);
  // Email is trustworthy only after full Firebase RS256 verification above.
  return {uid:p.sub,name,email:typeof p.email==='string'?p.email.toLowerCase():'',emailVerified:p.email_verified===true};
}
