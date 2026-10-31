import { EVOLUTIONS } from './evolutions.js';
export const VERSION = '0.5.0';
export const WORLD = { width: 1800, height: 1100, road: 76 };
export const RARITIES = {
  common: { name: '일반', color: '#a8b8b0' }, rare: { name: '희귀', color: '#65c8f3' },
  epic: { name: '에픽', color: '#b08aff' }, legendary: { name: '전설', color: '#ffc558' }, mythic: { name: '신화', color: '#fa6b80' }, immortal: { name: '불멸', color: '#55f5ce' }
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
  sonic: { name: '소닉', role: '초고속 · 광역', rarity: 'mythic', cost: 1800, price: null, color: '#f784cb', damage: 45, interval: .22, range: 240, splash: 45, kind: 'splash', cap: 2, upgrades: [1900,3800,7000], desc: '익스트림 이상 + 슈퍼소닉 모드 클리어 보상. 음파로 적의 대열을 분쇄한다.' },
  archer: {name:'숲의 궁수', role:'정밀 · 원거리', rarity:'common',cost:190,price:400,color:'#a4e56d',damage:13,interval:1.05,range:275,kind:'ranged',cap:12,upgrades:[200,440,850],desc:'나뭇잎 망토를 두른 방랑자. 넓은 사거리로 선두 적을 정확히 추적한다.'},
  chef: {name:'도넛 요리사',role:'광역 · 폭발',rarity:'common',cost:270,price:600,color:'#ffb6bc',damage:17,interval:1.5,range:175,splash:58,kind:'splash',cap:10,upgrades:[270,540,1100],desc:'설탕 폭탄을 튀기는 요리사. 밀집된 적을 단숨에 밀어낸다.'},
  chemist: {name:'연금술사',role:'독 · 지속 피해',rarity:'rare',cost:360,price:1050,color:'#98eb70',damage:7,interval:1.2,range:205,kind:'ranged',dot:12,dotTime:3,cap:8,upgrades:[360,780,1500],desc:'초록색 약병을 던져 중독시키는 연구자. 독은 방어력이 높아도 지속적으로 작용한다.'},
  icewitch: {name:'얼음 마녀',role:'빙결 · 감속',rarity:'rare',cost:400,price:1400,color:'#7fddff',damage:16,interval:1.1,range:220,kind:'ranged',slow:.48,slowTime:2.5,cap:7,upgrades:[400,850,1750],desc:'서리 나비와 함께 다니는 마녀. 적을 얼려 방어 시간을 벌어준다.'},
  spirit: {name:'등불 유령',role:'영혼 · 소환',rarity:'rare',cost:420,price:1450,color:'#b6f2ff',damage:26,interval:3.1,range:220,kind:'summon',summons:2,unitSpeed:290,unitLife:7,cap:6,upgrades:[440,900,1800],desc:'등불에서 작고 귀여운 영혼 둘을 불러 적을 쫓는다.'},
  firefly: {name:'불꽃 요정',role:'화염 · 광역',rarity:'epic',cost:570,price:2200,color:'#ff925b',damage:28,interval:1.65,range:225,splash:72,kind:'splash',dot:10,dotTime:2.5,cap:6,upgrades:[600,1250,2600],desc:'불씨 날개를 펼치며 타오르는 꽃가루를 퍼뜨린다.'},
  knight: {name:'달빛 기사',role:'근접 · 광역 검격',rarity:'epic',cost:680,price:2600,color:'#c7c1ff',damage:86,interval:1.45,range:123,kind:'melee',cleave:5,pierce:true,cap:5,upgrades:[650,1350,2750],desc:'은빛 대검으로 한 번에 다섯 적을 베어내는 달의 수호자.'},
  drone: {name:'장난감 기술자',role:'연쇄 · 전기',rarity:'epic',cost:640,price:2850,color:'#89f8e9',damage:30,interval:.9,range:230,kind:'chain',chain:3,chainRange:120,cap:6,upgrades:[680,1350,2900],desc:'작은 로봇의 전기 번개가 옆의 적에게 차례로 튄다.'},
  clockmaker: {name:'시계 장인',role:'지원 · 공속',rarity:'epic',cost:720,price:3200,color:'#ffd079',damage:0,interval:1,range:230,kind:'buff',haste:.18,cap:3,upgrades:[720,1450,2900],desc:'톱니바퀴가 아군의 시간을 빠르게 돌린다. 공속 오라는 중첩되지 않는다.'},
  banker: {name:'황금 슬라임',role:'경제 · 수입',rarity:'epic',cost:850,price:3600,color:'#f4d46d',damage:0,interval:15,range:0,kind:'income',income:120,cap:3,upgrades:[750,1600,3200],desc:'반짝이는 젤리 주머니에서 일정 시간마다 전투 자금을 만들어 낸다.'},
  mermaid: {name:'산호 연주자',role:'지원 · 강화',rarity:'epic',cost:950,price:3900,color:'#79e6e1',damage:0,interval:1,range:260,kind:'buff',power:.32,cap:3,upgrades:[950,1900,3900],desc:'산호 하프를 연주해 근처 아군의 공격력을 강화한다.'},
  prism: {name:'프리즘 마법사',role:'광선 · 연쇄',rarity:'legendary',cost:1450,price:6800,color:'#b49fff',damage:125,interval:1.65,range:350,kind:'chain',chain:4,chainRange:165,pierce:true,cap:3,upgrades:[1400,2800,5600],desc:'유리 조각이 만든 빛의 굴절로 여러 대상을 관통한다.'},
  reaper: {name:'낫 든 토끼',role:'처형 · 근접',rarity:'legendary',cost:1250,price:6100,color:'#eaaaff',damage:210,interval:2.1,range:145,kind:'melee',cleave:2,execute:.35,executeBonus:2.5,cap:4,upgrades:[1350,2650,5300],desc:'귀여운 토끼 가면과 거대한 낫. 빈사 상태의 적에게 치명적인 일격을 가한다.'},
  storm: {name:'폭풍 사제',role:'폭풍 · 광역 감속',rarity:'legendary',cost:1600,price:7600,color:'#87b2ff',damage:100,interval:2.1,range:310,splash:105,kind:'splash',slow:.65,slowTime:1.7,cap:3,upgrades:[1600,3150,6100],desc:'작은 구름의 지휘자. 주변을 둔하게 만드는 번개 폭풍을 부른다.'},
  phoenix: {name:'불사조 조련사',role:'소환 · 불꽃',rarity:'mythic',cost:2600,price:11500,color:'#ff697c',damage:300,interval:4.4,range:350,kind:'summon',summons:2,unitSpeed:370,unitLife:9,dot:25,dotTime:3,cap:2,upgrades:[2500,5000,9500],desc:'붉은 깃털 두 장을 던지면 작은 불사조들이 목표를 향해 날아간다.'},
  aurora: {name:'오로라 정령',role:'불멸 · 성운 연쇄',rarity:'immortal',cost:3200,price:null,color:'#60fbd7',damage:260,interval:1.3,range:390,kind:'chain',chain:6,chainRange:210,pierce:true,slow:.6,slowTime:2,cap:1,upgrades:[3400,6900,13500],desc:'파멸 난이도의 수호자. 오로라의 빛줄기가 적 사이를 춤추며 흐른다.'},
};
// Evolution costs are authoritative and belong to each installed tower instance.
for(const [id,def] of Object.entries(TOWERS)) {
  if(!EVOLUTIONS[id])throw Error('타워 진화 데이터 누락: '+id);
  def.upgrades=EVOLUTIONS[id].map(step=>step.cost);
}
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
  apocalypse: { name: '파멸의 핵', hp: 180000, speed: 30, color: '#ff476a', armor: .35, leak: 100, size: 44 },
  swarm:{name:'무리 좀비',hp:12,speed:78,color:'#b9e278',leak:1,size:9},
  sprinter:{name:'바람 주자',hp:42,speed:150,color:'#d8ee78',leak:2,size:11},
  shieldling:{name:'방패병',hp:190,shield:120,speed:46,color:'#9fc8c2',armor:.12,leak:4,size:16},
  medic:{name:'치유사',hp:260,speed:55,color:'#f4cdb5',heal:14,healRange:105,leak:5,size:13},
  splitter:{name:'분열체',hp:380,speed:47,color:'#d59fe9',onDeath:[['swarm',3]],leak:5,size:16},
  ghost:{name:'안개 유령',hp:460,speed:96,color:'#c3c5fc',leak:6,size:14},
  bloater:{name:'팽창 좀비',hp:890,speed:34,color:'#c78f85',onDeath:[['runner',2]],leak:9,size:22},
  ember:{name:'잿불 망령',hp:1250,speed:72,color:'#ff886d',regen:8,leak:10,size:16},
  frostling:{name:'빙결 병사',hp:1750,speed:58,color:'#98e7f9',shield:400,leak:12,size:18},
  harpy:{name:'날개 괴수',hp:2300,speed:120,color:'#ddafee',leak:14,size:18},
  sentinel:{name:'철갑 파수꾼',hp:3500,speed:36,color:'#8babb7',shield:700,armor:.32,leak:22,size:24},
  warlock:{name:'심연 주술사',hp:4300,speed:60,color:'#d28af0',heal:65,healRange:155,leak:24,size:18},
  juggernaut:{name:'돌격 거인',hp:7500,speed:44,color:'#ca9478',armor:.38,leak:34,size:29},
  warden:{name:'황혼 감시자',hp:14000,speed:64,color:'#a39def',shield:5000,leak:45,size:28},
  behemoth:{name:'고대 베히모스',hp:22000,speed:29,color:'#db898f',armor:.2,regen:110,leak:55,size:33},
  overload:{name:'과부하 MK7',hp:28000,speed:78,color:'#60f5e0',shield:7500,armor:.23,leak:66,size:32},
  abyss:{name:'심연 집행자',hp:42000,speed:69,color:'#7d77d5',armor:.22,leak:75,size:34},
  phantom:{name:'사념의 망령',hp:56000,speed:115,color:'#b19fe9',shield:9000,leak:85,size:32},
  nemesis:{name:'네메시스',hp:115000,speed:36,color:'#ec729a',shield:32000,armor:.3,regen:150,leak:100,size:40},
  colossus:{name:'고대 콜로서스',hp:235000,speed:25,color:'#eca36a',shield:50000,armor:.4,leak:100,size:48},
  oblivion:{name:'소멸의 군주',hp:380000,speed:34,color:'#f4528e',shield:95000,armor:.4,regen:260,leak:100,size:52},
};
export const PACKS = {
  basic: { name: '일반 좀비들', price: 0, monsters: [['zombie',60,4],['runner',100,6],['heavy',230,10],['boss',850,25],['fastboss',1200,30],['tank',2400,45]] },
  lab: { name: '연구소 강화 실험체', price: 3000, monsters: [['mk1',400,12],['mk2',450,12],['chain',1100,24],['mecha',3500,55],['doom',12000,90]] },
  twilight:{name:'황혼의 습격',price:4200,monsters:[['ghost',500,10],['shieldling',660,14],['splitter',950,22],['harpy',1650,35],['warlock',3200,48],['warden',7200,80]]},
  elements:{name:'원소의 폭주',price:5800,monsters:[['sprinter',210,7],['ember',650,15],['frostling',950,20],['sentinel',1800,35],['overload',5500,60],['phantom',10000,90]]},
  apocalypse:{name:'종말의 심연',price:9500,monsters:[['bloater',580,12],['juggernaut',1900,25],['behemoth',5200,60],['abyss',9000,80],['nemesis',20000,110],['colossus',35000,150]]}
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
// Authored wave lists. A wave recipe is "enemy:count,enemy:count".
// Unlike generated scaling, every wave has a deliberate formation and escalation.
const WAVE_SCRIPTS = {
  easy:`zombie:6|zombie:9,swarm:3|runner:5,zombie:8|shieldling:2,zombie:10|runner:10,swarm:9|heavy:5,shieldling:4|medic:2,runner:12|splitter:3,heavy:5|boss:1,runner:12,shieldling:4|boss:1,heavy:9,splitter:5`,
  normal:`zombie:12,swarm:5|runner:8,zombie:12|shieldling:3,runner:6|heavy:5,swarm:14|splitter:3,runner:12|boss:1,heavy:5|medic:4,shieldling:6|mk1:5,runner:12|ghost:5,heavy:10|splitter:6,mk1:8|fastboss:1,runner:12|frostling:5,heavy:9|tank:1,mk1:12|warlock:2,shieldling:12|fastboss:2,mk2:14|tank:1,fastboss:1,mk1:16`,
  hard:`runner:12,swarm:14|shieldling:8,heavy:8|mk1:9,sprinter:7|splitter:6,heavy:12|ghost:10,runner:20|boss:2,mk1:8|frostling:8,mk2:10|fastboss:2,shieldling:8|medic:8,mk1:18|bloater:8,runner:20|tank:1,ghost:18|harpy:10,frostling:10|sentinel:5,mk2:18|warlock:4,heavy:22|tank:2,chain:6|ember:12,harpy:12|juggernaut:3,frostling:10|mecha:1,mk1:22|warden:3,ghost:20|fastboss:3,tank:3|mecha:2,overload:1,chain:10|mecha:1,juggernaut:4,sentinel:6`,
  extreme:`heavy:15,runner:20|mk1:16,shieldling:12|mk2:18,ghost:14|frostling:14,splitter:12|tank:2,runner:25|chain:12,ember:13|harpy:22,sentinel:5|mecha:1,mk2:20|warlock:8,chain:16|juggernaut:5,bloater:16|warden:5,harpy:15|overload:2,mk1:25|tank:4,frostling:20|behemoth:2,chain:14|mecha:2,warlock:8|doom:1,heavy:22|sentinel:12,mk2:20|phantom:4,ghost:25|juggernaut:10,harpy:20|warden:6,overload:4|mecha:3,splitter:20|behemoth:4,sentinel:15|abyss:2,chain:22|doom:1,warden:6|phantom:7,overload:6|nemesis:1,mecha:4|doom:2,behemoth:5|doom:1,abyss:3,overload:6`,
  hell:`mk2:20,heavy:20|chain:16,runner:26|ghost:24,frostling:15|harpy:22,mk1:25|sentinel:10,splitter:15|tank:5,warlock:8|juggernaut:7,ember:22|mecha:3,ghost:24|warden:8,mk2:25|overload:4,chain:25|behemoth:4,harpy:25|doom:1,warlock:10|phantom:6,shieldling:35|abyss:3,sentinel:15|juggernaut:12,overload:7|mecha:5,warden:10|nemesis:1,ghost:30|behemoth:8,chain:30|doom:2,harpy:30|abyss:5,phantom:10|colossus:1,overload:7|warden:16,mk2:32|nemesis:2,behemoth:8|mecha:8,sentinel:30|doom:3,overload:10|abyss:8,phantom:12|colossus:1,warlock:15|nemesis:2,warden:20|doom:4,behemoth:10|colossus:2,abyss:9|nemesis:3,phantom:15|doom:5,overload:14|colossus:2,nemesis:2,behemoth:12|oblivion:1,doom:2,phantom:15`,
  ruin:`chain:18,harpy:24|sentinel:12,ghost:30|warden:8,mk2:30|overload:5,warlock:10|behemoth:5,sprinter:35|mecha:5,phantom:8|abyss:4,chain:28|doom:1,warden:10|juggernaut:12,harpy:35|nemesis:1,warlock:14|overload:10,frostling:24|colossus:1,ghost:30|behemoth:10,sentinel:20|abyss:7,phantom:12|doom:2,overload:12|warden:15,warlock:20|nemesis:2,mecha:8|colossus:2,harpy:40|oblivion:1,chain:34|abyss:8,behemoth:13|phantom:16,overload:13|doom:4,warden:20|nemesis:3,warlock:20|colossus:2,behemoth:18|oblivion:1,phantom:20|abyss:12,mecha:12|doom:5,overload:17|nemesis:4,warden:25|colossus:3,sentinel:35|oblivion:2,behemoth:18|phantom:25,overload:22|doom:6,abyss:16|nemesis:5,warlock:25|colossus:4,warden:30|oblivion:2,phantom:25|behemoth:24,overload:25|doom:7,nemesis:6|colossus:5,abyss:18|oblivion:3,nemesis:5|oblivion:1,apocalypse:1,colossus:4`
};
const WAVE_THEMES = ['전초 탐색','빠른 발자국','강화 방어선','불길한 신호','거대한 그림자','폭주하는 군단','전장의 전환','끝없는 행렬','종말의 그림자','최후 방어'];
const compileWaves=(script,pace,spacing,bonus)=>{
  const lines=script.split('|');
  return lines.map((line,i)=>{
    const groups=line.split(',').map(spec=>{
      const [type,raw]=spec.trim().split(':');const count=Number(raw);
      if(!Object.hasOwn(ENEMIES,type)||!Number.isSafeInteger(count)||count<1||count>60)throw Error('웨이브 편성 오류: '+spec);
      return [type,count];
    });
    const boss=groups.find(([id])=>ENEMIES[id].size>=30);
    const tier=Math.floor(i/Math.max(1,Math.ceil(lines.length/10)));
    return {title:i===lines.length-1?'최후의 결전':boss?ENEMIES[boss[0]].name+' 출현':WAVE_THEMES[Math.min(9,tier)],
      duration:pace+(i%5)*4+Math.floor(i/10)*2,bonus:bonus+i*(12+Math.round(bonus/30)),
      spacing:Math.max(.27,spacing-i*.006),groups};
  });
};
export const DIFFICULTIES = [
  {id:'easy',name:'쉬움',color:'#9ac985',reward:180,hp:1,waves:compileWaves(WAVE_SCRIPTS.easy,45,1.18,75)},
  {id:'normal',name:'기본',color:'#6bc4e3',reward:350,hp:1.05,waves:compileWaves(WAVE_SCRIPTS.normal,48,1.0,95)},
  {id:'hard',name:'어려움',color:'#e8bd6b',reward:650,hp:1.15,waves:compileWaves(WAVE_SCRIPTS.hard,51,.9,125)},
  {id:'extreme',name:'익스트림',color:'#ed8c67',reward:1100,hp:1.25,waves:compileWaves(WAVE_SCRIPTS.extreme,55,.78,160)},
  {id:'hell',name:'지옥',color:'#f47f9b',reward:1800,hp:1.5,waves:compileWaves(WAVE_SCRIPTS.hell,58,.68,210)},
  {id:'ruin',name:'파멸',color:'#b491ea',reward:3000,hp:1.8,waves:compileWaves(WAVE_SCRIPTS.ruin,60,.58,270)}
];
export function starterProfile(name='새로운 모험가') {
  return { name, coins:600, xp:0, wins:0, owned:['scout','blade'], loadout:['scout','blade'], packs:['basic'], pack:'basic', skins:{}, equippedSkins:{}, schema:1 };
}
