import {Core} from '../dist/cloudflare/core.js';
export async function getProfile(db,user){
  await db.prepare('INSERT OR IGNORE INTO profiles (uid,profile_json,version,updated_at) VALUES (?,?,0,?)')
    .bind(user.uid,JSON.stringify(Core.starterProfile(user.name)),Date.now()).run();
  const row=await db.prepare('SELECT profile_json,version FROM profiles WHERE uid=?').bind(user.uid).first();
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
