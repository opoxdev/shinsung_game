import {Core} from '../dist/cloudflare/core.js';
export async function getProfile(db,user){
  // Most requests are for existing accounts. Avoid writing an INSERT OR IGNORE
  // SQL statement on every authenticated API call: read first, create only once.
  let row=await db.prepare('SELECT profile_json,version FROM profiles WHERE uid=?').bind(user.uid).first();
  if(!row){
    await db.prepare('INSERT OR IGNORE INTO profiles (uid,profile_json,version,updated_at) VALUES (?,?,0,?)')
      .bind(user.uid,JSON.stringify(Core.starterProfile(user.name)),Date.now()).run();
    row=await db.prepare('SELECT profile_json,version FROM profiles WHERE uid=?').bind(user.uid).first();
  }
  if(!row)throw Error('프로필 읽기 실패');
  return {value:JSON.parse(row.profile_json),version:row.version};
}
export async function updateProfile(db,user,change){
  for(let tries=0;tries<5;tries++){
    const row=await getProfile(db,user);
    const before=JSON.stringify(row.value);
    const next=await change(row.value);
    if(JSON.stringify(next)===before)return next;
    const changed=await db.prepare('UPDATE profiles SET profile_json=?,version=version+1,updated_at=? WHERE uid=? AND version=?')
      .bind(JSON.stringify(next),Date.now(),user.uid,row.version).run();
    if(changed.meta?.changes===1)return next;
  }
  throw Error('프로필 동시 변경 충돌입니다. 다시 시도하세요.');
}
export async function claimProfile(db,user,code,reward){
  return updateProfile(db,user,p=>{
    // The claimed-room ledger is kept with the wallet in the same CAS write.
    // Room codes expire; retaining 1024 entries easily covers a small class's active rooms.
    p.claimedRooms=p.claimedRooms||[];
    if(p.claimedRooms.includes(code))return p;
    if(p.claimedRooms.length>=1024)throw Error('정산 기록 한도입니다. 관리자에게 문의하세요.');
    Core.applyReward(p,reward);
    p.claimedRooms.push(code);
    return p;
  });
}

// One-time migration from the v0.9.8 client-only account storage.
// Never overwrite server account moderation, room membership or claim ledger.
export async function importV098Profile(db,user,local){
  if(!local||typeof local!=='object'||Array.isArray(local))throw Error('이전 기기 진행도가 올바르지 않습니다.');
  if(![1,2].includes(local.schema))throw Error('지원하지 않는 진행도 버전입니다.');
  if(!Number.isSafeInteger(local.coins)||local.coins<0||local.coins>1000000000||
     !Number.isSafeInteger(local.xp)||local.xp<0||local.xp>1000000000||
     !Number.isSafeInteger(local.wins)||local.wins<0||local.wins>1000000000)
    throw Error('진행도 수치가 올바르지 않습니다.');
  if(!Array.isArray(local.owned)||local.owned.length>Object.keys(Core.TOWERS).length||
     local.owned.some(id=>typeof id!=='string'||!Object.hasOwn(Core.TOWERS,id))||
     !Array.isArray(local.packs)||local.packs.length>Object.keys(Core.PACKS).length||
     local.packs.some(id=>typeof id!=='string'||!Object.hasOwn(Core.PACKS,id)))
    throw Error('타워 또는 팩 데이터가 올바르지 않습니다.');
  return updateProfile(db,user,p=>{
    if(p.importedV098)return p;
    if(p.activeRoom)throw Error('진행도 이전은 멀티플레이 방에서 나간 뒤 진행하세요.');
    p.coins=Math.max(p.coins,local.coins);
    p.xp=Math.max(p.xp,local.xp);
    p.wins=Math.max(p.wins||0,local.wins||0);
    p.owned=[...new Set([...p.owned,...local.owned])];
    p.packs=[...new Set([...p.packs,...local.packs])];
    if(Array.isArray(local.loadout)&&local.loadout.length>0&&local.loadout.length<=5&&
       local.loadout.every(id=>p.owned.includes(id)))p.loadout=[...new Set(local.loadout)];
    if(typeof local.pack==='string'&&p.packs.includes(local.pack))p.pack=local.pack;
    if(local.skins&&typeof local.skins==='object'&&!Array.isArray(local.skins)){
      p.skins=p.skins||{};
      for(const key of Object.keys(local.skins)){
        const [id,style]=key.split(':');
        if(local.skins[key]===true&&Object.hasOwn(Core.TOWERS,id)&&Object.hasOwn(Core.SKIN_STYLES,style))
          p.skins[key]=true;
      }
    }
    if(local.equippedSkins&&typeof local.equippedSkins==='object'&&!Array.isArray(local.equippedSkins)){
      p.equippedSkins=p.equippedSkins||{};
      for(const [id,style] of Object.entries(local.equippedSkins)){
        if(p.owned.includes(id)&&(style==='default'||p.skins?.[id+':'+style]))p.equippedSkins[id]=style;
      }
    }
    p.importedV098=true;
    return p;
  });
}

export async function claimSoloProfile(db,user,runId,reward){
  if(typeof runId!=='string'||!/^[-a-f0-9]{36}$/.test(runId))throw Error('잘못된 솔로 플레이 기록입니다.');
  return updateProfile(db,user,p=>{
    if(p.activeRoom)throw Error('멀티플레이 진행 중에는 솔로 보상을 정산할 수 없습니다.');
    p.claimedSoloRuns=Array.isArray(p.claimedSoloRuns)?p.claimedSoloRuns:[];
    if(p.claimedSoloRuns.includes(runId))return p; // D1 CAS: duplicate retries cannot duplicate rewards.
    Core.applyReward(p,reward);
    p.claimedSoloRuns.push(runId);
    if(p.claimedSoloRuns.length>256)p.claimedSoloRuns.splice(0,p.claimedSoloRuns.length-256);
    return p;
  });
}
