// Shared browser + Cloudflare achievement rules. No timers, fetches, or
// background writes. D1 stores only compact counters and claimed IDs.
import {TOWERS,MODES,DIFFICULTIES} from './data.js';

export const ACHIEVEMENT_CATEGORIES=Object.freeze([
  {id:'journey',name:'여정',icon:'✦',description:'난이도를 정복하고 새로운 세계를 개척하세요'},
  {id:'battle',name:'전투',icon:'⚔',description:'끈기와 전술로 전장을 지키세요'},
  {id:'strategy',name:'전략',icon:'♜',description:'다양한 작전으로 전장의 기록을 세우세요'},
  {id:'collection',name:'수집',icon:'◇',description:'새로운 타워와 스킨을 모으세요'},
  {id:'friends',name:'멀티플레이',icon:'♟',description:'친구들과 함께 싸우거나 승부하세요'}
]);
const achievement=(id,category,grade,title,description,goal,metric,reward={coins:0,xp:0})=>
  Object.freeze({id,category,grade,title,description,goal,metric,reward});
export const ACHIEVEMENTS=Object.freeze([
  achievement('first_clear','journey','common','첫 번째 방어선','아무 난이도에서 승리 1회',1,'wins',{coins:100,xp:20}),
  achievement('veteran_5','journey','rare','베테랑 수호자','누적 승리 5회',5,'wins',{coins:350,xp:80}),
  achievement('veteran_20','journey','epic','백전의 동료','누적 승리 20회',20,'wins',{coins:1250,xp:240}),
  achievement('veteran_50','journey','legendary','불굴의 방패','누적 승리 50회',50,'wins',{coins:3000,xp:600}),
  achievement('clear_easy','journey','common','평야의 새벽','쉬움 난이도 클리어',1,'clears.easy',{coins:100,xp:25}),
  achievement('clear_normal','journey','rare','첫 번째 파수꾼','기본 난이도 클리어',1,'clears.normal',{coins:200,xp:50}),
  achievement('clear_hard','journey','epic','강철에 맞서다','어려움 난이도 클리어',1,'clears.hard',{coins:400,xp:100}),
  achievement('clear_extreme','journey','epic','불길을 넘어','익스트림 난이도 클리어',1,'clears.extreme',{coins:750,xp:150}),
  achievement('clear_hell','journey','legendary','왕관의 저주','지옥 난이도 클리어',1,'clears.hell',{coins:1300,xp:240}),
  achievement('clear_ruin','journey','mythic','마지막 별의 증인','파멸 난이도 클리어',1,'clears.ruin',{coins:2400,xp:450}),
  achievement('explorer_3','journey','rare','세계를 거닐다','서로 다른 맵 3곳에서 승리',3,'uniqueMaps',{coins:450,xp:100}),
  achievement('explorer_all','journey','legendary','세계의 길잡이','모든 맵 5곳에서 승리',5,'uniqueMaps',{coins:1300,xp:300}),
  achievement('kills_100','battle','common','적을 막아라','몬스터 100마리 처치',100,'kills',{coins:120,xp:30}),
  achievement('kills_1000','battle','rare','천 명의 침입자','몬스터 1,000마리 처치',1000,'kills',{coins:650,xp:120}),
  achievement('kills_10000','battle','legendary','전장의 전설','몬스터 10,000마리 처치',10000,'kills',{coins:2200,xp:420}),
  achievement('place_50','battle','common','든든한 배치','타워 누적 50회 설치',50,'places',{coins:160,xp:30}),
  achievement('place_500','battle','epic','방어선 건축가','타워 누적 500회 설치',500,'places',{coins:1000,xp:200}),
  achievement('upgrade_30','strategy','rare','성장의 시작','타워 누적 30회 업그레이드',30,'upgrades',{coins:230,xp:50}),
  achievement('upgrade_300','strategy','epic','진화의 장인','타워 누적 300회 업그레이드',300,'upgrades',{coins:1200,xp:230}),
  achievement('flawless','strategy','epic','상처 없는 승리','기지 체력 100으로 승리',1,'flawlessWins',{coins:500,xp:100}),
  achievement('tank_mode','strategy','rare','거대한 상대','탱크 모드에서 승리',1,'modeWins.tank',{coins:350,xp:70}),
  achievement('elite_mode','strategy','epic','정예를 넘어','엘리트 모드에서 승리',1,'modeWins.elite',{coins:650,xp:140}),
  achievement('shortage_mode','strategy','legendary','최후의 다섯 기','군사부족 모드에서 승리',1,'modeWins.shortage',{coins:900,xp:180}),
  achievement('sonic_trial','strategy','mythic','음속을 넘어서','익스트림 이상에서 슈퍼소닉 모드 클리어',1,'special.sonic',{tower:'sonic'}),
  achievement('aurora_trial','strategy','mythic','끝에서 빛나다','파멸에서 엘리트 모드 클리어',1,'special.aurora',{tower:'aurora'}),
  achievement('towers_5','collection','common','동료 모집','타워 5종 보유',5,'ownedTowers',{coins:180,xp:30}),
  achievement('towers_15','collection','epic','개성 넘치는 군단','타워 15종 보유',15,'ownedTowers',{coins:900,xp:200}),
  achievement('towers_25','collection','legendary','영웅의 전당','타워 25종 보유',25,'ownedTowers',{coins:1700,xp:350}),
  achievement('skins_3','collection','rare','새로운 옷장','스킨 3개 수집',3,'ownedSkins',{coins:300,xp:50}),
  achievement('skins_10','collection','epic','패션의 수호자','스킨 10개 수집',10,'ownedSkins',{coins:800,xp:180}),
  achievement('packs_2','collection','rare','적의 기록','몬스터 팩 2종 보유',2,'ownedPacks',{coins:220,xp:50}),
  achievement('coop_1','friends','rare','어깨를 나란히','협동전 1회 승리',1,'coopWins',{coins:300,xp:80}),
  achievement('coop_5','friends','epic','믿음직한 파트너','협동전 5회 승리',5,'coopWins',{coins:1000,xp:200}),
  achievement('pvp_1','friends','rare','첫 번째 대결','PvP에서 1회 승리',1,'pvpWins',{coins:350,xp:80}),
  achievement('pvp_5','friends','epic','경쟁의 달인','PvP에서 5회 승리',5,'pvpWins',{coins:1100,xp:220})
]);
export const ACHIEVEMENT_BY_ID=Object.freeze(Object.fromEntries(ACHIEVEMENTS.map(a=>[a.id,a])));
const nonneg=n=>Number.isSafeInteger(n)&&n>=0?n:0;
const stats=p=>p.achievementStats&&typeof p.achievementStats==='object'&&!Array.isArray(p.achievementStats)?p.achievementStats:{};
export function achievementProgress(p,a){
  const s=stats(p);
  if(a.reward.tower&&p.owned?.includes(a.reward.tower))return a.goal; // legacy Sonic/Aurora
  switch(a.metric){
    case 'uniqueMaps':return Object.values(s.maps||{}).filter(x=>x>0).length;
    case 'ownedTowers':return p.owned?.filter(id=>Object.hasOwn(TOWERS,id)).length||0;
    case 'ownedSkins':return Object.keys(p.skins||{}).filter(id=>p.skins[id]===true).length;
    case 'ownedPacks':return p.packs?.length||0;
    case 'wins':return Math.max(nonneg(s.wins),nonneg(p.wins)); // backfill old accounts
  }
  let value=s;
  for(const key of a.metric.split('.'))value=value?.[key];
  return nonneg(value);
}
export function achievementView(p){
  const claimed=Array.isArray(p.claimedAchievements)?p.claimedAchievements:[];
  return ACHIEVEMENTS.map(a=>{
    const progress=Math.min(a.goal,achievementProgress(p,a));
    const earned=progress>=a.goal,already=claimed.includes(a.id)||!!(a.reward.tower&&p.owned?.includes(a.reward.tower));
    return {...a,progress,earned,claimed:already,status:already?'claimed':earned?'ready':'locked'};
  });
}
export function recordAchievementRun(p,run){
  if(!run||!['solo','coop','pvp'].includes(run.type))return p;
  const s={...stats(p)};
  s.wins=Math.max(nonneg(s.wins),nonneg(p.wins));
  s.kills=nonneg(s.kills)+Math.min(50000,nonneg(run.kills));
  s.places=nonneg(s.places)+Math.min(2000,nonneg(run.places));
  s.upgrades=nonneg(s.upgrades)+Math.min(2000,nonneg(run.upgrades));
  if(run.win){
    s.wins++;
    const field=run.type==='solo'?'soloWins':run.type==='coop'?'coopWins':'pvpWins';
    s[field]=nonneg(s[field])+1;
    if(run.type!=='pvp'){
      s.clears={...(s.clears||{})};
      if(DIFFICULTIES.some(d=>d.id===run.difficulty))
        s.clears[run.difficulty]=nonneg(s.clears[run.difficulty])+1;
      s.maps={...(s.maps||{})};
      if(typeof run.map==='string')s.maps[run.map]=nonneg(s.maps[run.map])+1;
      if(run.flawless)s.flawlessWins=nonneg(s.flawlessWins)+1;
      s.modeWins={...(s.modeWins||{})};
      for(const mode of [...new Set(Array.isArray(run.modes)?run.modes:[])])
        if(Object.hasOwn(MODES,mode))s.modeWins[mode]=nonneg(s.modeWins[mode])+1;
      s.special={...(s.special||{})};
      const rank=DIFFICULTIES.findIndex(d=>d.id===run.difficulty);
      if(rank>=3&&run.modes?.includes('supersonic'))s.special.sonic=1;
      if(run.difficulty==='ruin'&&run.modes?.includes('elite'))s.special.aurora=1;
    }
  }
  p.achievementStats=s;
  return p;
}
export function claimAchievementReward(p,id){
  const a=ACHIEVEMENT_BY_ID[id];
  if(!a)throw Error('존재하지 않는 도전과제입니다.');
  const claimed=Array.isArray(p.claimedAchievements)?p.claimedAchievements:[];
  if(claimed.includes(id)||(a.reward.tower&&p.owned?.includes(a.reward.tower)))throw Error('이미 수령한 도전과제입니다.');
  if(achievementProgress(p,a)<a.goal)throw Error('도전과제 달성 조건을 채우지 못했습니다.');
  if(a.reward.coins)p.coins+=a.reward.coins;
  if(a.reward.xp)p.xp+=a.reward.xp;
  if(a.reward.tower&&!p.owned.includes(a.reward.tower))p.owned.push(a.reward.tower);
  p.claimedAchievements=[...claimed,id];
  return p;
}
export function achievementSummary(p){
  const list=achievementView(p);
  return {total:list.length,done:list.filter(a=>a.status==='claimed').length,
    ready:list.filter(a=>a.status==='ready').length,progress:list.filter(a=>a.earned).length};
}
