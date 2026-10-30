export const Core = (()=>{
'use strict';
const VERSION = '0.3.0';
const WORLD = { width: 1800, height: 1100, road: 76 };
const RARITIES = {
  common: { name: '일반', color: '#a8b8b0' }, rare: { name: '희귀', color: '#65c8f3' },
  epic: { name: '에픽', color: '#b08aff' }, legendary: { name: '전설', color: '#ffc558' }, mythic: { name: '신화', color: '#fa6b80' }
};
// Attack classifications share rules; presentation is chosen independently by each tower's id.
const TOWERS = {
  scout: { name: '새총소년', role: '원거리', rarity: 'common', cost: 150, price: 0, color: '#ffb74e', damage: 6, interval: .7, range: 175, kind: 'ranged', cap: 20, upgrades: [180,380,760], desc: '빨간 스카프와 주머니 가득한 돌멩이. 작은 새총으로 커다란 적도 쓰러뜨린다.' },
  soldier: { name: '스파크', role: '전기 · 연사', rarity: 'rare', cost: 320, price: 750, color: '#62e7f4', damage: 9, interval: .35, range: 195, kind: 'ranged', cap: 12, upgrades: [350,700,1500], desc: '토끼 이어셋, 롤러스케이트, 양손 전기총. 쉬지 않고 전격을 퍼붓는 발명가.' },
  blade: { name: '가면검객', role: '근접 · 관통', rarity: 'rare', cost: 230, price: 0, color: '#ff6a92', damage: 25, interval: .9, range: 100, kind: 'melee', cap: 10, upgrades: [260,600,1200], desc: '여우 가면 뒤의 정체는 비밀. 휘날리는 붉은 천과 함께 적 최대 3기를 베어낸다.' },
  cannon: { name: '폭탄광', role: '폭발 · 광역', rarity: 'epic', cost: 450, price: 1800, color: '#ff9b54', damage: 35, interval: 2, range: 235, splash: 85, kind: 'splash', cap: 6, upgrades: [480,1000,2200], desc: '작고 둥글지만 폭발은 거대하다. 터질 듯한 폭탄을 적 한가운데 던진다.' },
  summoner: { name: '고블린 소환사', role: '소환', rarity: 'epic', cost: 500, price: 2200, color: '#a4e68b', damage: 65, interval: 4, range: 260, kind: 'summon', cap: 4, upgrades: [550,1200,2400], desc: '고블린을 소환해 적을 추격한다. 소환수는 목표에 도달하면 공격하고 사라진다.' },
  workshop: { name: '버섯 정원', role: '지원 · 버프', rarity: 'epic', cost: 400, price: 1500, color: '#ff88a8', damage: 0, interval: 1, range: 210, kind: 'buff', cap: 3, upgrades: [450,900,1800], desc: '빛나는 포자로 아군 공격력을 20% 강화하는 작은 버섯집. 여러 정원의 효과는 중첩되지 않는다.' },
  rail: { name: '별술사', role: '별빛 · 장거리', rarity: 'legendary', cost: 1200, price: 5000, color: '#a6d8ff', damage: 170, interval: 2.8, range: 420, kind: 'ranged', cap: 3, upgrades: [1300,2600,5200], desc: '커다란 모자 아래 반짝이는 두 눈. 멀리 있는 적에게 장갑을 꿰뚫는 별빛을 떨어뜨린다.', pierce: true },
  sonic: { name: '소닉', role: '초고속 · 광역', rarity: 'mythic', cost: 1800, price: null, color: '#f784cb', damage: 45, interval: .22, range: 240, splash: 45, kind: 'splash', cap: 2, upgrades: [1900,3800,7000], desc: '익스트림 이상 + 슈퍼소닉 모드 클리어 보상. 음파로 적의 대열을 분쇄한다.' }
};
const ENEMIES = {
  zombie: { name: '좀비', hp: 18, speed: 48, color: '#8eae7d', leak: 1 },
  runner: { name: '빠른 좀비', hp: 28, speed: 90, color: '#d5bd64', leak: 1 },
  heavy: { name: '강한 좀비', hp: 150, speed: 38, color: '#a08772', leak: 3 },
  boss: { name: '보스 좀비', hp: 1000, speed: 32, color: '#e18b69', leak: 15, size: 22 },
  fastboss: { name: '질주 보스', hp: 1700, speed: 74, color: '#eaaf51', leak: 18, size: 21 },
  tank: { name: '탱크 좀비', hp: 5000, speed: 26, color: '#9eaaae', armor: .25, leak: 30, size: 26 },
  mk1: { name: 'MK1 강화체', hp: 420, speed: 56, color: '#77d8d0', armor: .15, leak: 5 },
  mk2: { name: 'MK2 초고속', hp: 280, speed: 125, color: '#a7f4e8', leak: 4 },
  chain: { name: 'MK5 쇠사슬', hp: 2200, speed: 38, color: '#9c8cba', armor: .35, leak: 12 },
  mecha: { name: 'MKX 메카', hp: 12000, speed: 32, color: '#b1a7df', armor: .3, leak: 55, size: 30 },
  doom: { name: '아마겟돈', hp: 80000, speed: 24, color: '#f17182', armor: .2, leak: 100, size: 38 },
  apocalypse: { name: '파멸의 핵', hp: 180000, speed: 30, color: '#ff476a', armor: .35, leak: 100, size: 44 }
};
const PACKS = {
  basic: { name: '일반 좀비들', price: 0, monsters: [['zombie',60,4],['runner',100,6],['heavy',230,10],['boss',850,25],['fastboss',1200,30],['tank',2400,45]] },
  lab: { name: '연구소 강화 실험체', price: 3000, monsters: [['mk1',400,12],['mk2',450,12],['chain',1100,24],['mecha',3500,55],['doom',12000,90]] }
};
const MODES = {
  tank: { name: '탱크', reward: 1.3, hp: 1.5, speed: 1, desc: '적 체력 ×1.5' },
  elite: { name: '엘리트', reward: 1.5, hp: 1.5, speed: 1.5, desc: '적 체력·속도 ×1.5' },
  sonic: { name: '소닉', reward: 1.1, hp: 1, speed: 1.5, desc: '적 이동속도 ×1.5' },
  shortage: { name: '군사부족', reward: 2, hp: 1, speed: 1, cap: 5, desc: '전체 타워 최대 5개' },
  supersonic: { name: '슈퍼소닉', reward: 2, hp: 1, speed: 2.5, desc: '적 속도 ×2.5 · 특수 타워 도전' }
};
const MAPS = [
  { id: 'plains', name: '평야', tag: 'GREEN MEADOWS', biome: 'plains', color: '#93ed76', ground: '#68b965', roadColor: '#e7c694', desc: '푸른 들판, 굽이치는 오솔길. 첫 모험이 시작되는 곳!', path: [[0,560],[320,560],[320,280],[740,280],[740,820],[1200,820],[1200,430],[1800,430]] },
  { id: 'mountains', name: '어두운 산맥', tag: 'SHADOW PEAKS', biome: 'mountains', color: '#b49bfc', ground: '#444362', roadColor: '#87809d', desc: '보랏빛 안개와 날카로운 봉우리 너머에서 적들이 몰려온다.', path: [[0,760],[280,760],[470,460],[470,200],[910,200],[1080,520],[920,850],[1440,850],[1550,480],[1800,480]] },
  { id: 'crystal', name: '수정 동굴', tag: 'CRYSTAL CAVERNS', biome: 'crystal', color: '#8be9ff', ground: '#45396d', roadColor: '#a48dc8', desc: '빛나는 수정 사이로 울려 퍼지는 발소리. 아름답지만 위험하다.', path: [[0,400],[330,400],[480,780],[850,780],[1030,480],[810,200],[1270,200],[1470,630],[1800,630]] },
  { id: 'volcano', name: '용암 협곡', tag: 'EMBER CANYON', biome: 'volcano', color: '#ff9863', ground: '#62414c', roadColor: '#a77065', desc: '갈라진 대지와 붉은 용암. 좁은 협곡의 마지막 방어전.', path: [[0,250],[450,250],[600,530],[340,850],[840,850],[1060,300],[1400,300],[1530,800],[1800,800]] },
  { id: 'snow', name: '눈꽃 숲', tag: 'FROSTWOOD', biome: 'snow', color: '#d0f5ff', ground: '#a3d0df', roadColor: '#eaf8ff', desc: '소복한 눈 아래 숨은 오솔길. 차가운 숲을 따뜻하게 지켜라.', path: [[0,250],[350,250],[350,700],[700,700],[700,400],[1100,400],[1100,850],[1500,850],[1500,400],[1800,400]] }
];
// Separate campaign recipes: different lengths, formations, boss schedules and timers.
const campaign = (count, roster, finale, cadence, bosses, pace) => Array.from({ length: count }, (_, i) => ({
  duration: pace + (i % 4) * 5, bonus: 75 + i * 15, spacing: Math.max(.28, cadence - i * .012),
  groups: i === count - 1 ? [[finale,1],[roster[roster.length-1],8]] : [
    [roster[Math.min(roster.length-1, Math.floor(i * roster.length / count))], 7 + i * 2],
    ...(i > 2 ? [[roster[i % roster.length], 3 + Math.floor(i / 3)]] : []),
    ...(bosses[i+1] ? [[bosses[i+1],1]] : [])
  ]
}));
const DIFFICULTIES = [
  { id:'easy', name:'쉬움', color:'#9ac985', reward:180, hp:1, waves:campaign(10,['zombie','runner','heavy'],'boss',1.2,{5:'heavy'},45) },
  { id:'normal', name:'기본', color:'#6bc4e3', reward:350, hp:1.05, waves:campaign(16,['zombie','runner','heavy','mk1'],'tank',.95,{6:'boss',12:'fastboss'},48) },
  { id:'hard', name:'어려움', color:'#e8bd6b', reward:650, hp:1.15, waves:campaign(22,['runner','heavy','mk1','mk2'],'mecha',.8,{7:'boss',14:'tank',20:'fastboss'},50) },
  { id:'extreme', name:'익스트림', color:'#ed8c67', reward:1100, hp:1.25, waves:campaign(28,['zombie','heavy','mk2','chain'],'doom',.7,{8:'tank',16:'mecha',24:'mecha'},55) },
  { id:'hell', name:'지옥', color:'#f47f9b', reward:1800, hp:1.5, waves:campaign(34,['runner','mk1','chain','tank'],'doom',.6,{6:'boss',12:'mecha',22:'mecha',30:'doom'},58) },
  { id:'ruin', name:'파멸', color:'#b491ea', reward:3000, hp:1.8, waves:campaign(40,['heavy','mk2','chain','mecha'],'apocalypse',.55,{8:'tank',18:'mecha',28:'doom',36:'doom'},60) }
];
function starterProfile(name='새로운 모험가') {
  return { name, coins:600, xp:0, wins:0, owned:['scout','blade'], loadout:['scout','blade'], packs:['basic'], pack:'basic', skins:{}, equippedSkins:{}, schema:1 };
}


const STEP = .05;
function bounty(hp) {
  if (!Number.isFinite(hp) || hp <= 0) return 0;
  if (hp <= 10) return Math.max(1, Math.round(hp / 2));
  if (hp <= 5000) return Math.round(5 * (hp / 10) ** (Math.log(100) / Math.log(500)));
  return Math.round(500 * Math.sqrt(hp / 5000));
}
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
function mapOf(s) { return MAPS.find(m=>m.id===s.config.map); }
function pointOnPath(path, distance) {
  for (let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(distance<=len) return {x:a[0]+(b[0]-a[0])*distance/len,y:a[1]+(b[1]-a[1])*distance/len};
    distance-=len;
  }
  const end=path[path.length-1]; return {x:end[0],y:end[1],end:true};
}
function pathDistance(path,x,y) {
  let min=Infinity;
  for(let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
    min=Math.min(min,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  }
  return min;
}
function modifiers(config) {
  return (config.modes||[]).reduce((a,id)=>{const m=MODES[id];a.hp*=m.hp;a.speed*=m.speed;a.reward*=m.reward;a.cap=Math.min(a.cap,m.cap||20);return a;},{hp:1,speed:1,reward:1,cap:20});
}
function validateConfig(config) {
  if(!config || !MAPS.some(m=>m.id===config.map) || !DIFFICULTIES.some(d=>d.id===config.difficulty)) throw Error('맵 또는 난이도가 올바르지 않습니다.');
  if(!['solo','coop','pvp'].includes(config.type)) throw Error('잘못된 게임 유형입니다.');
  if(!Array.isArray(config.modes)||config.modes.length>5||new Set(config.modes).size!==config.modes.length||config.modes.some(id=>!Object.hasOwn(MODES,id))) throw Error('잘못된 모드 구성입니다.');
  return { map:config.map,difficulty:config.difficulty,type:config.type,modes:[...config.modes] };
}
function createMatch(config, players) {
  config=validateConfig(config);
  if(!Array.isArray(players)||players.length<1||players.length>4||new Set(players.map(p=>p.id)).size!==players.length) throw Error('참가 인원이 올바르지 않습니다.');
  if(config.type==='pvp'&&players.length!==2||config.type==='solo'&&players.length!==1) throw Error('PvP는 2명, 솔로는 1명이 필요합니다.');
  const s={version:1,config,players:{},fields:config.type==='pvp'?[100,100]:[100],towers:[],enemies:[],units:[],queue:[],events:[],wave:0,time:0,waveTime:0,spawnClock:0,nextId:1,status:'playing',votes:[],kills:0,winner:null};
  players.forEach((p,i)=>{
    const profile=p.profile||starterProfile();
    s.players[p.id]={id:p.id,name:String(profile.name).slice(0,20),field:config.type==='pvp'?i:0,money:500,loadout:[...profile.loadout],pack:profile.pack,cooldowns:{},seq:0,skins:profile.equippedSkins||{}};
  });
  nextWave(s); return s;
}
function towerStats(t) {
  const d=TOWERS[t.type],l=t.level;
  return {damage:d.damage*(1+l*.8+l*l*.15),interval:d.interval/(1+l*.13),range:d.range*(1+l*.10),splash:(d.splash||0)*(1+l*.1)};
}
function canPlace(s,field,x,y) {
  return Number.isFinite(x)&&Number.isFinite(y)&&x>=45&&y>=45&&x<=WORLD.width-45&&y<=WORLD.height-45&&pathDistance(mapOf(s).path,x,y)>WORLD.road/2+22&&!s.towers.some(t=>t.field===field&&Math.hypot(t.x-x,t.y-y)<50);
}
function requiredVotes(s) {const n=Object.keys(s.players).length;return n===1?1:Math.max(2,Math.floor(n/2)+1);}
function event(s,e) {s.events.push({...e,id:s.nextId++,time:s.time});if(s.events.length>70)s.events.shift();}
function spawn(s,type,field,source='wave') {
  const d=ENEMIES[type],mods=modifiers(s.config),diff=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  const hp=d.hp*mods.hp*diff.hp;
  s.enemies.push({id:s.nextId++,type,field,hp,maxHp:hp,progress:0,x:mapOf(s).path[0][0],y:mapOf(s).path[0][1],speed:d.speed*mods.speed,source});
}
function nextWave(s) {
  const d=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  if(s.wave>=d.waves.length)return;
  s.wave++;s.waveTime=0;s.votes=[];
  const w=d.waves[s.wave-1];
  Object.values(s.players).forEach(p=>{if(s.wave>1)p.money+=w.bonus;});
  let delay=0;
  // Keep old queued enemies when skipping. A skip cannot erase unspawned enemies.
  for(const [type,count] of w.groups)for(let i=0;i<count;i++) {
    s.fields.forEach((_,field)=>s.queue.push({type,field,at:s.time+delay}));delay+=w.spacing;
  }
  event(s,{kind:'wave',wave:s.wave});
}
function command(s,playerId,c) {
  if(s.status!=='playing')return {ok:false,error:'전투가 종료되었습니다.'};
  const p=s.players[playerId];if(!p)return {ok:false,error:'참가자가 아닙니다.'};
  if(!c||typeof c!=='object')return {ok:false,error:'잘못된 명령입니다.'};
  if(c.seq!==undefined) {
    if(!Number.isSafeInteger(c.seq)||c.seq<=p.seq)return {ok:false,error:'이미 처리한 명령입니다.'};
    p.seq=c.seq;
  }
  const fail=error=>({ok:false,error});
  if(c.kind==='place') {
    const d=Object.hasOwn(TOWERS,c.type)?TOWERS[c.type]:null;
    if(!d||!p.loadout.includes(c.type))return fail('장착한 타워만 배치할 수 있습니다.');
    if(s.towers.filter(t=>t.field===p.field).length>=modifiers(s.config).cap)return fail('필드 전체 타워 한도에 도달했습니다.');
    if(s.towers.filter(t=>t.field===p.field&&t.type===c.type).length>=d.cap)return fail('이 타워의 배치 한도에 도달했습니다.');
    if(p.money<d.cost)return fail('전투 자금이 부족합니다.');
    if(!canPlace(s,p.field,c.x,c.y))return fail('도로와 다른 타워를 피해 배치하세요.');
    p.money-=d.cost;s.towers.push({id:s.nextId++,owner:playerId,field:p.field,type:c.type,x:c.x,y:c.y,level:0,cd:0,spent:d.cost,target:'first',skin:p.skins[c.type]||'default'});
  } else if(['upgrade','sell','target'].includes(c.kind)) {
    const t=s.towers.find(t=>t.id===c.id);if(!t||t.owner!==playerId)return fail('자신의 타워를 선택하세요.');
    if(c.kind==='upgrade') {
      const cost=TOWERS[t.type].upgrades[t.level];if(cost===undefined)return fail('최대 레벨입니다.');if(p.money<cost)return fail('전투 자금이 부족합니다.');
      p.money-=cost;t.level++;t.spent+=cost;event(s,{kind:'upgrade',x:t.x,y:t.y,field:t.field});
    } else if(c.kind==='sell') {p.money+=Math.floor(t.spent*7/10);s.towers=s.towers.filter(a=>a.id!==t.id);}
    else {if(!['first','strong','near'].includes(c.target))return fail('잘못된 타겟입니다.');t.target=c.target;}
  } else if(c.kind==='skip') {
    if(s.waveTime<8)return fail('웨이브 시작 8초 후 스킵할 수 있습니다.');
    if(s.wave>=DIFFICULTIES.find(d=>d.id===s.config.difficulty).waves.length)return fail('마지막 웨이브입니다.');
    if(s.queue.length>=900)return fail('대기 중인 적이 너무 많습니다. 현재 적을 먼저 처치하세요.');
    if(!s.votes.includes(playerId))s.votes.push(playerId);
    if(s.votes.length>=requiredVotes(s))nextWave(s);
  } else if(c.kind==='send') {
    if(s.config.type!=='pvp')return fail('PvP에서만 소환할 수 있습니다.');
    const entry=PACKS[p.pack]?.monsters.find(m=>m[0]===c.type);
    if(!entry)return fail('장착한 팩에 없는 몬스터입니다.');
    if((p.cooldowns[c.type]||0)>s.time)return fail('소환 재사용 대기 중입니다.');
    if(p.money<entry[1])return fail('전투 자금이 부족합니다.');
    if(s.enemies.length+s.queue.length>=500)return fail('현재 전장 수용 한도입니다.');
    p.money-=entry[1];p.cooldowns[c.type]=s.time+entry[2];spawn(s,c.type,1-p.field,'pvp');
  } else return fail('알 수 없는 명령입니다.');
  return {ok:true};
}
function damage(s,e,n,t) {
  if(e.hp<=0)return;
  e.hp-=n*(TOWERS[t.type].pierce?1:1-(ENEMIES[e.type].armor||0));
  if(e.hp<=0) {
    const team=Object.values(s.players).filter(p=>p.field===e.field);
    const reward=bounty(e.maxHp)/team.length;
    team.forEach(p=>p.money+=reward);s.kills++;
    event(s,{kind:'kill',x:e.x,y:e.y,field:e.field,color:ENEMIES[e.type].color});
  }
}
function tick(s,dt=STEP) {
  if(s.status!=='playing')return;
  if(!Number.isFinite(dt)||dt<=0||dt>.1)throw Error('고정 스텝은 0~0.1초여야 합니다.');
  s.time+=dt;s.waveTime+=dt;
  const ready=s.queue.filter(q=>q.at<=s.time).slice(0,Math.max(0,350-s.enemies.length));
  const set=new Set(ready);s.queue=s.queue.filter(q=>!set.has(q));ready.forEach(q=>spawn(s,q.type,q.field));
  for(const t of s.towers) {
    const d=TOWERS[t.type];if(d.kind==='buff')continue;
    t.cd-=dt;if(t.cd>0)continue;
    const stats=towerStats(t),candidates=s.enemies.filter(e=>e.field===t.field&&e.hp>0&&dist(t,e)<=stats.range);
    candidates.sort(t.target==='strong'?(a,b)=>b.hp-a.hp:t.target==='near'?(a,b)=>dist(a,t)-dist(b,t):(a,b)=>b.progress-a.progress);
    const e=candidates[0];if(!e)continue;
    const buff=s.towers.filter(b=>b.field===t.field&&TOWERS[b.type].kind==='buff'&&dist(b,t)<=towerStats(b).range).reduce((a,b)=>Math.max(a,1.2+b.level*.1),1);
    t.cd=stats.interval;t.angle=Math.atan2(e.y-t.y,e.x-t.x);
    event(s,{kind:d.kind,from:t.id,x:t.x,y:t.y,tx:e.x,ty:e.y,field:t.field,type:t.type});
    if(d.kind==='summon')s.units.push({id:s.nextId++,x:t.x,y:t.y,field:t.field,target:e.id,damage:stats.damage*buff,type:t.type,life:8});
    else if(d.kind==='splash')s.enemies.filter(a=>a.field===t.field&&dist(a,e)<=stats.splash).forEach(a=>damage(s,a,stats.damage*buff,t));
    else if(d.kind==='melee')candidates.slice(0,3).forEach(a=>damage(s,a,stats.damage*buff,t));
    else damage(s,e,stats.damage*buff,t);
  }
  for(const u of s.units) {
    u.life-=dt;let e=s.enemies.find(e=>e.id===u.target&&e.hp>0);
    if(!e){e=s.enemies.find(e=>e.field===u.field&&e.hp>0);if(e)u.target=e.id;}
    if(!e)continue;
    const distance=dist(u,e),move=210*dt;
    if(distance<=move+10){damage(s,e,u.damage,u);u.life=0;event(s,{kind:'melee',x:e.x,y:e.y,tx:e.x,ty:e.y,field:e.field,type:u.type});}
    else {u.x+=(e.x-u.x)*move/distance;u.y+=(e.y-u.y)*move/distance;}
  }
  s.units=s.units.filter(u=>u.life>0);
  s.enemies=s.enemies.filter(e=>e.hp>0);
  for(const e of s.enemies) {
    e.progress+=e.speed*dt;const pos=pointOnPath(mapOf(s).path,e.progress);e.x=pos.x;e.y=pos.y;
    if(pos.end){s.fields[e.field]=Math.max(0,s.fields[e.field]-ENEMIES[e.type].leak);e.hp=0;event(s,{kind:'leak',x:e.x,y:e.y,field:e.field});}
  }
  s.enemies=s.enemies.filter(e=>e.hp>0);
  const dead=s.fields.findIndex(h=>h<=0);
  if(dead>=0){s.status=s.config.type==='pvp'?'complete':'defeat';s.winner=s.config.type==='pvp'?1-dead:null;return;}
  const d=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  const clear=s.fields.map((_,i)=>!s.enemies.some(e=>e.field===i)&&!s.queue.some(e=>e.field===i));
  if(s.wave===d.waves.length) {
    if(clear.every(Boolean)){s.status='victory';s.winner=s.config.type==='pvp'?(s.fields[0]===s.fields[1]?null:s.fields[0]>s.fields[1]?0:1):0;}
  } else if((s.config.type==='pvp'?clear.some(Boolean):clear.every(Boolean))||s.waveTime>=d.waves[s.wave-1].duration) {
    // Backpressure keeps pathological skip/timeout combinations bounded without deleting enemies.
    if(s.queue.length<900)nextWave(s);
  }
}
function advance(s,seconds) {let n=Math.min(1200,Math.floor(seconds/STEP+1e-8));while(n-->0&&s.status==='playing')tick(s);return s;}
function rewardFor(s,id) {
  const p=s.players[id];if(!p||s.status==='playing')return {coins:0,xp:0,sonic:false,win:false};
  const win=s.config.type==='pvp'?s.winner===p.field:s.status==='victory';
  const d=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  // PvP opponents must not be usable as a repeatable currency faucet in this alpha.
  const coins=s.config.type==='pvp'?0:win?Math.floor(d.reward*modifiers(s.config).reward):0;
  return {coins,xp:s.config.type==='pvp'?0:win?d.waves.length*20:0,sonic:win&&s.config.type!=='pvp'&&DIFFICULTIES.indexOf(d)>=3&&s.config.modes.includes('supersonic'),win};
}
function applyReward(profile,reward) {
  profile.coins+=reward.coins;profile.xp+=reward.xp;if(reward.win)profile.wins++;
  if(reward.sonic&&!profile.owned.includes('sonic'))profile.owned.push('sonic');return profile;
}
function profileAction(profile,a) {
  if(!a||typeof a!=='object')throw Error('잘못된 요청입니다.');
  if(a.kind==='equip') {
    if(!profile.owned.includes(a.id))throw Error('보유하지 않은 타워입니다.');
    if(profile.loadout.includes(a.id)){if(profile.loadout.length===1)throw Error('타워를 최소 1개 장착하세요.');profile.loadout=profile.loadout.filter(x=>x!==a.id);}
    else {if(profile.loadout.length>=5)throw Error('최대 5개까지 장착할 수 있습니다.');profile.loadout.push(a.id);}
  } else if(a.kind==='buyTower') {
    const t=Object.hasOwn(TOWERS,a.id)?TOWERS[a.id]:null;
    if(!t||t.price===null)throw Error('상점에서 구매할 수 없습니다.');
    if(profile.owned.includes(a.id))throw Error('이미 보유한 타워입니다.');
    if(profile.coins<t.price)throw Error('코인이 부족합니다.');profile.coins-=t.price;profile.owned.push(a.id);
  } else if(a.kind==='buyPack') {
    const p=Object.hasOwn(PACKS,a.id)?PACKS[a.id]:null;
    if(!p)throw Error('잘못된 팩입니다.');if(profile.packs.includes(a.id))throw Error('이미 보유한 팩입니다.');
    if(profile.coins<p.price)throw Error('코인이 부족합니다.');profile.coins-=p.price;profile.packs.push(a.id);
  } else if(a.kind==='pack') {if(!profile.packs.includes(a.id))throw Error('보유한 팩을 선택하세요.');profile.pack=a.id;}
  else if(a.kind==='skin') {
    if(!profile.owned.includes(a.id)||!['default','arctic'].includes(a.skin))throw Error('사용할 수 없는 스킨입니다.');
    const key=a.id+':arctic';if(a.skin==='arctic'&&!profile.skins[key]){if(profile.coins<300)throw Error('코인이 부족합니다.');profile.coins-=300;profile.skins[key]=true;}
    profile.equippedSkins[a.id]=a.skin;
  } else throw Error('지원하지 않는 요청입니다.');
  return profile;
}

return {VERSION,WORLD,RARITIES,TOWERS,ENEMIES,PACKS,MODES,MAPS,DIFFICULTIES,starterProfile,STEP,bounty,mapOf,pointOnPath,pathDistance,modifiers,validateConfig,createMatch,towerStats,canPlace,requiredVotes,command,tick,advance,rewardFor,applyReward,profileAction};
})();
