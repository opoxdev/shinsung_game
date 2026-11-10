// Christmas Expedition: immutable event stages and a server-validated 30-tier
// battle pass. The event has no paid currency, real-world payment or randomness.
export const CHRISTMAS_STAGES=Object.freeze([
 Object.freeze({id:'christmas_1',name:'눈 내리는 첫 번째 밤',subtitle:'FROSTBOUND EVE',waves:10,unlock:'snowman',passXp:190,
  description:'설원 마을을 덮친 눈사람 군단. 5웨이브의 중간보스와 마지막 설원 마녀를 격파하라.'}),
 Object.freeze({id:'christmas_2',name:'잃어버린 선물 열차',subtitle:'GIFT TRAIN SIEGE',waves:15,unlock:'stocking',passXp:320,
  description:'장난감 병사와 뒤틀린 선물 상자가 몰려온다. 5·10웨이브 정예 지휘관과 열차 기관장을 막아라.'}),
 Object.freeze({id:'christmas_3',name:'진저브레드의 마지막 왕국',subtitle:'GINGERBREAD FINALE',waves:25,unlock:'cookiehouse',passXp:560,
  description:'쿠키의 왕이 마을 전체를 침공한다. 5웨이브 간격의 정예 보스를 넘어 마지막 과자 왕을 물리쳐라.'})
]);
export const CHRISTMAS_PASS_LEVELS=30;
export const CHRISTMAS_PASS_XP_PER_LEVEL=140;
const skinTiers={5:['blade','candyblade'],12:['scout','snowglobe'],
  20:['icewitch','candycane'],27:['knight','hollyknight']};
export const CHRISTMAS_PASS=Object.freeze(Array.from({length:CHRISTMAS_PASS_LEVELS},(_,i)=>{
 const level=i+1;
 const reward=level===30?{tower:'christmastree'}:skinTiers[level]
  ?{skin:skinTiers[level]}:level%5===0
   ?{coins:level*180,xp:level*45}
   :level%3===0?{xp:level*32,coins:180+level*24}
   :{coins:240+level*76};
 return Object.freeze({level,xp:level*CHRISTMAS_PASS_XP_PER_LEVEL,
  name:reward.tower?'영원한 크리스마스 트리':reward.skin?'크리스마스 한정 스킨':
    reward.xp?'눈송이 보급 상자':'성탄 축제 주화',
  reward:Object.freeze(reward)});
}));
export const christmasPassLevel=p=>Math.min(CHRISTMAS_PASS_LEVELS,
 Math.floor(Math.max(0,Number(p?.christmasPassXP)||0)/CHRISTMAS_PASS_XP_PER_LEVEL));
export const christmasStageUnlocked=(p,stage)=>stage===1||
 Array.isArray(p?.christmasCleared)&&p.christmasCleared.includes(stage-1);
export function christmasClaimPass(profile,level){
 const tier=CHRISTMAS_PASS.find(p=>p.level===level);
 if(!tier||!Number.isSafeInteger(level))throw Error('존재하지 않는 배틀패스 레벨입니다.');
 if(christmasPassLevel(profile)<level)throw Error('아직 도달하지 않은 배틀패스 보상입니다.');
 const claimed=Array.isArray(profile.christmasPassClaimed)?profile.christmasPassClaimed:[];
 if(claimed.includes(level))throw Error('이미 수령한 크리스마스 보상입니다.');
 // Claim sequentially, preventing gaps and duplicate concurrent submissions.
 if(level!==claimed.length+1)throw Error('앞선 레벨의 보상을 먼저 수령하세요.');
 const prize=tier.reward;
 if(prize.coins)profile.coins+=prize.coins;
 if(prize.xp)profile.xp+=prize.xp;
 if(prize.tower&&!profile.owned.includes(prize.tower))profile.owned.push(prize.tower);
 if(prize.skin){profile.skins=profile.skins||{};profile.skins[prize.skin.join(':')]=true;}
 profile.christmasPassClaimed=[...claimed,level];
 return profile;
}
