import {starterProfile,TOWERS,PACKS,SKIN_STYLES} from './data.js';

// Guest and authenticated accounts each get separate browser-only progress.
// No fetch, Firebase database, D1 or Cloudflare request occurs here.
export const GUEST_PROFILE_KEY='shinsung.profile.v1';
export const profileKey=uid=>uid?'shinsung.profile.account.v2.'+encodeURIComponent(uid):GUEST_PROFILE_KEY;
const clone=x=>JSON.parse(JSON.stringify(x));
export function validProfile(value){
  return !!value&&value.schema===1&&
    Number.isSafeInteger(value.coins)&&value.coins>=0&&
    Number.isSafeInteger(value.xp)&&value.xp>=0&&
    Array.isArray(value.owned)&&Array.isArray(value.loadout)&&value.loadout.length>=1&&value.loadout.length<=5&&
    value.owned.every(id=>Object.hasOwn(TOWERS,id))&&value.loadout.every(id=>value.owned.includes(id))&&
    Array.isArray(value.packs)&&value.packs.every(id=>Object.hasOwn(PACKS,id));
}
export function loadClientProfile(storage,uid=null,{name='',seed=null}={}){
  const saved=storage?.getItem(profileKey(uid));
  if(saved){
    try{const p=JSON.parse(saved);if(validProfile(p))return p;}catch{}
  }
  const base=seed&&validProfile(seed)?clone(seed):starterProfile(name||'모험가');
  if(name&&base.name==='모험가')base.name=name.slice(0,20);
  return base;
}
export function saveClientProfile(storage,uid,profile){
  if(!validProfile(profile))throw Error('저장할 프로필 데이터가 올바르지 않습니다.');
  storage?.setItem(profileKey(uid),JSON.stringify(profile));
  return profile;
}
// Send only the PvP/co-op loadout, never the wallet or skin inventory.
export function multiplayerLoadout(profile){
  const owned=[...new Set(profile.owned.filter(id=>Object.hasOwn(TOWERS,id)))];
  const loadout=[...new Set(profile.loadout.filter(id=>owned.includes(id)))].slice(0,5);
  if(!loadout.length)throw Error('멀티플레이에 장착할 타워가 없습니다.');
  const packs=profile.packs.filter(id=>Object.hasOwn(PACKS,id));
  const pack=packs.includes(profile.pack)?profile.pack:'basic';
  const equippedSkins={};
  for(const id of loadout){
    const skin=profile.equippedSkins?.[id];
    if(skin==='default'||(Object.hasOwn(SKIN_STYLES,skin)&&profile.skins?.[id+':'+skin]))
      equippedSkins[id]=skin;
  }
  return {loadout,pack,equippedSkins};
}
