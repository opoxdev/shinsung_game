export const VERSION = '0.3.0';
export const WORLD = { width: 1800, height: 1100, road: 76 };
export const RARITIES = {
  common: { name: '일반', color: '#a8b8b0' }, rare: { name: '희귀', color: '#65c8f3' },
  epic: { name: '에픽', color: '#b08aff' }, legendary: { name: '전설', color: '#ffc558' }, mythic: { name: '신화', color: '#fa6b80' }
};
// Attack classifications share rules; presentation is chosen independently by each tower's id.
export const TOWERS = {
  scout: { name: '새총소년', role: '원거리', rarity: 'common', cost: 150, price: 0, color: '#ffb74e', damage: 6, interval: .7, range: 175, kind: 'ranged', cap: 20, upgrades: [180,380,760], desc: '빨간 스카프와 주머니 가득한 돌멩이. 작은 새총으로 커다란 적도 쓰러뜨린다.' },
  soldier: { name: '스파크', role: '전기 · 연사', rarity: 'rare', cost: 320, price: 750, color: '#62e7f4', damage: 9, interval: .35, range: 195, kind: 'ranged', cap: 12, upgrades: [350,700,1500], desc: '토끼 이어셋, 롤러스케이트, 양손 전기총. 쉬지 않고 전격을 퍼붓는 발명가.' },
  blade: { name: '가면검객', role: '근접 · 관통', rarity: 'rare', cost: 230, price: 0, color: '#ff6a92', damage: 25, interval: .9, range: 100, kind: 'melee', cap: 10, upgrades: [260,600,1200], desc: '여우 가면 뒤의 정체는 비밀. 휘날리는 붉은 천과 함께 적 최대 3기를 베어낸다.' },
  cannon: { name: '폭탄광', role: '폭발 · 광역', rarity: 'epic', cost: 450, price: 1800, color: '#ff9b54', damage: 35, interval: 2, range: 235, splash: 85, kind: 'splash', cap: 6, upgrades: [480,1000,2200], desc: '작고 둥글지만 폭발은 거대하다. 터질 듯한 폭탄을 적 한가운데 던진다.' },
  summoner: { name: '고블린 소환사', role: '소환', rarity: 'epic', cost: 500, price: 2200, color: '#a4e68b', damage: 65, interval: 4, range: 260, kind: 'summon', cap: 4, upgrades: [550,1200,2400], desc: '고블린을 소환해 적을 추격한다. 소환수는 목표에 도달하면 공격하고 사라진다.' },
  workshop: { name: '버섯 정원', role: '지원 · 버프', rarity: 'epic', cost: 400, price: 1500, color: '#ff88a8', damage: 0, interval: 1, range: 210, kind: 'buff', cap: 3, upgrades: [450,900,1800], desc: '빛나는 포자로 아군 공격력을 20% 강화하는 작은 버섯집. 여러 정원의 효과는 중첩되지 않는다.' },
  rail: { name: '별술사', role: '별빛 · 장거리', rarity: 'legendary', cost: 1200, price: 5000, color: '#a6d8ff', damage: 170, interval: 2.8, range: 420, kind: 'ranged', cap: 3, upgrades: [1300,2600,5200], desc: '커다란 모자 아래 반짝이는 두 눈. 멀리 있는 적에게 장갑을 꿰뚫는 별빛을 떨어뜨린다.', pierce: true },
  sonic: { name: '소닉', role: '초고속 · 광역', rarity: 'mythic', cost: 1800, price: null, color: '#f784cb', damage: 45, interval: .22, range: 240, splash: 45, kind: 'splash', cap: 2, upgrades: [1900,3800,7000], desc: '익스트림 이상 + 슈퍼소닉 모드 클리어 보상. 음파로 적의 대열을 분쇄한다.' }
};
export const ENEMIES = {
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
export const PACKS = {
  basic: { name: '일반 좀비들', price: 0, monsters: [['zombie',60,4],['runner',100,6],['heavy',230,10],['boss',850,25],['fastboss',1200,30],['tank',2400,45]] },
  lab: { name: '연구소 강화 실험체', price: 3000, monsters: [['mk1',400,12],['mk2',450,12],['chain',1100,24],['mecha',3500,55],['doom',12000,90]] }
};
export const MODES = {
  tank: { name: '탱크', reward: 1.3, hp: 1.5, speed: 1, desc: '적 체력 ×1.5' },
  elite: { name: '엘리트', reward: 1.5, hp: 1.5, speed: 1.5, desc: '적 체력·속도 ×1.5' },
  sonic: { name: '소닉', reward: 1.1, hp: 1, speed: 1.5, desc: '적 이동속도 ×1.5' },
  shortage: { name: '군사부족', reward: 2, hp: 1, speed: 1, cap: 5, desc: '전체 타워 최대 5개' },
  supersonic: { name: '슈퍼소닉', reward: 2, hp: 1, speed: 2.5, desc: '적 속도 ×2.5 · 특수 타워 도전' }
};
export const MAPS = [
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
export const DIFFICULTIES = [
  { id:'easy', name:'쉬움', color:'#9ac985', reward:180, hp:1, waves:campaign(10,['zombie','runner','heavy'],'boss',1.2,{5:'heavy'},45) },
  { id:'normal', name:'기본', color:'#6bc4e3', reward:350, hp:1.05, waves:campaign(16,['zombie','runner','heavy','mk1'],'tank',.95,{6:'boss',12:'fastboss'},48) },
  { id:'hard', name:'어려움', color:'#e8bd6b', reward:650, hp:1.15, waves:campaign(22,['runner','heavy','mk1','mk2'],'mecha',.8,{7:'boss',14:'tank',20:'fastboss'},50) },
  { id:'extreme', name:'익스트림', color:'#ed8c67', reward:1100, hp:1.25, waves:campaign(28,['zombie','heavy','mk2','chain'],'doom',.7,{8:'tank',16:'mecha',24:'mecha'},55) },
  { id:'hell', name:'지옥', color:'#f47f9b', reward:1800, hp:1.5, waves:campaign(34,['runner','mk1','chain','tank'],'doom',.6,{6:'boss',12:'mecha',22:'mecha',30:'doom'},58) },
  { id:'ruin', name:'파멸', color:'#b491ea', reward:3000, hp:1.8, waves:campaign(40,['heavy','mk2','chain','mecha'],'apocalypse',.55,{8:'tank',18:'mecha',28:'doom',36:'doom'},60) }
];
export function starterProfile(name='새로운 모험가') {
  return { name, coins:600, xp:0, wins:0, owned:['scout','blade'], loadout:['scout','blade'], packs:['basic'], pack:'basic', skins:{}, equippedSkins:{}, schema:1 };
}
