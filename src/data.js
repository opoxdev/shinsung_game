import { EVOLUTIONS } from './evolutions.js';
export const VERSION = '0.12.0';
// All combat health and damage numbers use a 1/6 display scale. Economy, ranges,
// movement and relative time-to-kill are deliberately unchanged.
export const COMBAT_SCALE = 6;
export const WORLD = { width: 1800, height: 1100, road: 76 };
export const RARITIES = {
  common: { name: '일반', color: '#a8b8b0' }, rare: { name: '희귀', color: '#65c8f3' },
  epic: { name: '에픽', color: '#b08aff' }, legendary: { name: '전설', color: '#ffc558' }, mythic: { name: '신화', color: '#fa6b80' }
};
// Attack classifications share rules; presentation is chosen independently by each tower's id.
export const TOWERS = {
  scout: { name:'새총잡이', role: '원거리', rarity: 'common', cost: 150, price: 0, color: '#ffb74e', damage: 6, interval: .7, range: 175, kind: 'ranged', cap: 20, upgrades: [180,380,760], desc:'평범한 여행용 조끼와 낡은 새총을 가진 초보 방어자. 초반에 부담 없이 배치한다.' },
  soldier: { name:'전기공', role: '전기 · 연사', rarity: 'rare', cost: 260, price: 750, color: '#62e7f4', damage: 9, interval: .35, range: 195, kind: 'ranged', cap: 12, upgrades: [350,700,1500], desc:'공구 벨트와 작은 전지팩을 갖춘 전기 수리공. 저렴한 코일 충격기로 빠르게 공격한다.' },
  blade: { name:'검객', role: '근접 · 관통', rarity: 'rare', cost: 230, price: 0, color: '#ff6a92', damage: 25, interval: .9, range: 100, kind: 'melee', cap: 10, upgrades: [260,600,1200], desc:'무명 도복과 연습용 칼집을 가진 떠돌이 검객. 화려한 가면은 특별 스킨의 몫이다.' },
  cannon: { name:'폭파 전문가', role: '폭발 · 광역', rarity: 'epic', cost: 450, price: 1800, color: '#ff9b54', damage: 35, interval: 2, range: 235, splash: 85, kind: 'splash', cap: 6, upgrades: [480,1000,2200], desc:'유탄 발사기와 탄약 배낭을 장착한 폭발물 전문가. 광역 폭발로 적 진형을 무너뜨린다.' },
  summoner: { name: '고블린 소환사', role: '소환', rarity: 'epic', cost: 500, price: 2200, color: '#a4e68b', damage: 65, interval: 4, range: 260, kind: 'summon', cap: 4, upgrades: [550,1200,2400], desc: '고블린을 소환해 적을 추격한다. 소환수는 목표에 도달하면 공격하고 사라진다.' },
  workshop: { name: '버섯 정원', role: '지원 · 버프', rarity: 'epic', cost: 610, price: 1500, color: '#ff88a8', damage: 0, interval: 1, range: 210, kind: 'buff', power:.2, cap: 3, upgrades: [450,900,1800], desc: '빛나는 포자로 아군 공격력을 24% 강화하는 작은 버섯집. 여러 정원의 효과는 중첩되지 않는다.' },
  rail: { name: '별술사', role: '별빛 · 장거리', rarity: 'legendary', cost: 850, price: 5000, color: '#a6d8ff', damage: 170, interval: 2.8, range: 420, kind: 'ranged', cap: 3, upgrades: [1300,2600,5200], desc: '커다란 모자 아래 반짝이는 두 눈. 멀리 있는 적에게 장갑을 꿰뚫는 별빛을 떨어뜨린다.', pierce: true },
  oldgod: { name:'고대의 신',role:'신벌 · 종말의 심판',rarity:'mythic',cost:8500,price:null,color:'#ffd45d',damage:1950,interval:3.5,range:560,splash:170,kind:'judgement',pierce:true,bossBonus:2.2,cap:1,upgrades:[10500,19500,33000],desc:'파멸의 신전 30웨이브 최초 클리어 보상. 후광을 두른 거대한 백색 신체와 황금의 팔, 붉은 오염된 육체가 공명한다. 신벌의 빛으로 광역을 초토화하며 보스에게 추가 피해를 준다.' },
  sonic: { name: '소닉', role: '중반 · 초고속 광역', rarity: 'mythic', cost: 720, price: null, color: '#f784cb', damage: 26, interval: .22, range: 240, splash: 45, kind: 'splash', cap: 2, upgrades: [1900,3800,7000], desc: '익스트림 이상 + 슈퍼소닉 모드 클리어 보상. 음파로 적의 대열을 분쇄한다.' },
  archer: {name:'궁수', role:'후반 · 장거리 정밀', rarity:'common',cost:780,price:400,color:'#a4e56d',damage:74,interval:1.75,range:345,kind:'ranged',cap:12,upgrades:[200,440,850],desc:'가죽 팔토시와 나무 활을 사용하는 궁수. 외형은 소박하지만 사거리와 후반 가격이 높은 사수다.'},
  chef: {name:'투척병',role:'광역 · 폭발',rarity:'common',cost:270,price:600,color:'#ffb6bc',damage:17,interval:1.5,range:175,splash:58,kind:'splash',cap:10,upgrades:[270,540,1100],desc:'작은 폭약 주머니와 수류탄을 든 투척수. 군용 특수장비 없이 광역 공격을 담당한다.'},
  chemist: {name:'약제사',role:'후반 · 독 지속 피해',rarity:'rare',cost:980,price:1050,color:'#98eb70',damage:21,interval:1.2,range:250,kind:'ranged',dot:36,dotTime:3,cap:8,upgrades:[360,780,1500],desc:'앞치마와 약병 가방을 든 약제사. 작은 병을 던져 적을 중독시킨다.'},
  icewitch: {name:'서리 견습생',role:'빙결 · 감속',rarity:'rare',cost:290,price:1400,color:'#7fddff',damage:16,interval:1.1,range:220,kind:'ranged',slow:.48,slowTime:2.5,cap:7,upgrades:[400,850,1750],desc:'목도리와 작고 낡은 냉기 지팡이를 가진 견습생. 적을 잠시 느리게 한다.'},
  spirit: {name:'드론 조작원',role:'정찰 드론 · 추격 소환',rarity:'rare',cost:280,price:1450,color:'#b6f2ff',damage:26,interval:3.1,range:220,kind:'summon',summons:2,unitSpeed:290,unitLife:7,cap:6,upgrades:[440,900,1800],desc:'보급형 조종기와 작은 프로펠러 드론을 조작하는 초보 운용자. 비싼 전술 장갑을 입지 않는다.'},
  firefly: {name:'화염술사',role:'화염 · 광역',rarity:'epic',cost:960,price:2200,color:'#ff925b',damage:48,interval:1.65,range:225,splash:72,kind:'splash',dot:10,dotTime:2.5,cap:6,upgrades:[600,1250,2600],desc:'고열 분사 장치를 조작하는 화염술사. 광역 화염과 잔불 피해로 적을 태운다.'},
  knight: {name:'달빛 기사',role:'근접 · 광역 검격',rarity:'epic',cost:900,price:2600,color:'#c7c1ff',damage:86,interval:1.45,range:123,kind:'melee',cleave:5,pierce:true,cap:5,upgrades:[650,1350,2750],desc:'은빛 대검으로 한 번에 다섯 적을 베어내는 달의 수호자.'},
  drone: {name:'번개 발명가',role:'후반 · 연쇄 전기',rarity:'epic',cost:1250,price:2850,color:'#89f8e9',damage:67,interval:.9,range:230,kind:'chain',chain:3,chainRange:120,cap:6,upgrades:[680,1350,2900],desc:'코일과 방전봉을 직접 제작한 발명가. 일반 전기공보다 훨씬 큰 연쇄 장치가 특징이다.'},
  clockmaker: {name:'시계 장인',role:'지원 · 공속',rarity:'epic',cost:390,price:3200,color:'#ffd079',damage:0,interval:1,range:230,kind:'buff',haste:.18,cap:3,upgrades:[720,1450,2900],desc:'톱니바퀴가 아군의 시간을 빠르게 돌린다. 공속 오라는 중첩되지 않는다.'},
  banker: {name:'황금 공방',role:'경제 · 수입',rarity:'epic',cost:340,price:3600,color:'#f4d46d',damage:0,interval:15,range:0,kind:'income',income:120,cap:3,upgrades:[750,1600,3200],desc:'금속 톱니와 자동 주화 장치로 자금을 생산하는 작은 공방. 공격하지 않는 경제 타워.'},
  mermaid: {name:'산호 연주자',role:'지원 · 강화',rarity:'epic',cost:790,price:3900,color:'#79e6e1',damage:0,interval:1,range:260,kind:'buff',power:.32,cap:3,upgrades:[950,1900,3900],desc:'산호 하프를 연주해 근처 아군의 공격력을 강화한다.'},
  prism: {name:'프리즘 마법사',role:'광선 · 연쇄',rarity:'legendary',cost:1090,price:6800,color:'#b49fff',damage:125,interval:1.65,range:350,kind:'chain',chain:4,chainRange:165,pierce:true,cap:3,upgrades:[1400,2800,5600],desc:'유리 조각이 만든 빛의 굴절로 여러 대상을 관통한다.'},
  reaper: {name:'낫 든 토끼',role:'처형 · 근접',rarity:'legendary',cost:2200,price:6100,color:'#eaaaff',damage:210,interval:2.1,range:145,kind:'melee',cleave:2,execute:.35,executeBonus:2.5,cap:4,upgrades:[1350,2650,5300],desc:'귀여운 토끼 가면과 거대한 낫. 빈사 상태의 적에게 치명적인 일격을 가한다.'},
  storm: {name:'폭풍 사제',role:'폭풍 · 광역 감속',rarity:'legendary',cost:1900,price:7600,color:'#87b2ff',damage:100,interval:2.1,range:310,splash:105,kind:'splash',slow:.65,slowTime:1.7,cap:3,upgrades:[1600,3150,6100],desc:'작은 구름의 지휘자. 주변을 둔하게 만드는 번개 폭풍을 부른다.'},
  phoenix: {name:'불사조 조련사',role:'소환 · 불꽃',rarity:'mythic',cost:2600,price:11500,color:'#ff697c',damage:300,interval:4.4,range:350,kind:'summon',summons:2,unitSpeed:370,unitLife:9,dot:25,dotTime:3,cap:2,upgrades:[2500,5000,9500],desc:'붉은 깃털 두 장을 던지면 작은 불사조들이 목표를 향해 날아간다.'},
  aurora: {name:'오로라 정령',role:'신화 · 성운 연쇄',rarity:'mythic',cost:3200,price:null,color:'#60fbd7',damage:260,interval:1.3,range:390,kind:'chain',chain:6,chainRange:210,pierce:true,slow:.6,slowTime:2,cap:1,upgrades:[3400,6900,13500],desc:'파멸 난이도의 수호자. 오로라의 빛줄기가 적 사이를 춤추며 흐른다.'},

  starseed: {name:'별씨앗',role:'초반 · 소규모 광역',rarity:'mythic',cost:145,price:6500,color:'#ffa2be',damage:5,interval:.64,range:125,splash:48,kind:'splash',cap:4,upgrades:[],desc:'신화라고 무조건 비싸지는 않다! 작은 별씨앗이 초반 무리를 쏙쏙 터뜨린다. 후반 단일 보스에는 취약하다.'},
  hunter: {name:'사냥꾼',role:'후반 · 보스 저격',rarity:'rare',cost:2200,price:1300,color:'#84a5ff',damage:620,interval:4.5,range:440,kind:'ranged',pierce:true,chargeEvery:3,chargeBonus:2.2,cap:2,upgrades:[],desc:'낡은 긴 총과 튼튼한 외투를 갖춘 산지 사냥꾼. 고가의 후반 타워지만 외형은 소박하다.'},
  scrap: {name:'포수',role:'후반 · 중장갑 폭격',rarity:'common',cost:1450,price:550,color:'#9fb9ae',damage:150,interval:2.4,range:220,splash:74,kind:'splash',cap:3,upgrades:[],desc:'커다란 낡은 포를 직접 끌고 다니는 포수. 비싼 후반형이지만 영웅처럼 장식되지는 않는다.'},
  lullaby: {name:'음향 조율사',role:'초반 · 공격속도 지원',rarity:'epic',cost:195,price:1100,color:'#a1b8ff',damage:0,interval:1,range:145,kind:'buff',haste:.1,cap:3,upgrades:[],desc:'진동 장치를 운용하는 조율사. 기계식 스피커와 공명판으로 주변 타워를 가속한다.'},
  papercrane: {name:'종이학 조련사',role:'초반 · 기동 소환',rarity:'legendary',cost:295,price:4900,color:'#ffdaaf',damage:22,interval:2.75,range:195,kind:'summon',summons:1,unitSpeed:320,unitLife:6,cap:4,upgrades:[],desc:'전설이지만 값싼 종이학으로 초반 빈 공간을 메운다. 짧은 수명이 약점인 기동 소환수.'},
  marker: {name:'관측원',role:'중후반 · 표식 지원',rarity:'rare',cost:680,price:1700,color:'#c7a4f2',damage:20,interval:1.75,range:260,kind:'mark',markAmp:1.22,markTime:3.5,cap:4,upgrades:[],desc:'망원경과 표식 깃발을 지닌 평범한 관측원. 적의 약점을 찾아 아군 집중 공격을 돕는다.'},
};
// Evolution costs are authoritative and belong to each installed tower instance.
for(const [id,def] of Object.entries(TOWERS)) {
  if(!EVOLUTIONS[id])throw Error('타워 진화 데이터 누락: '+id);
  def.upgrades=EVOLUTIONS[id].map(step=>step.cost);
  // v0.12: buff tower output, not enemy HP or campaign composition.
  const attackBuff=id==='oldgod'?.88:def.kind==='melee'?1.45:1.35;
  def.damage*=attackBuff;
  def.interval*=id==='oldgod'?1.04:def.kind==='buff'||def.kind==='income'?1:.92;
  if(id!=='oldgod'){
    def.range*=def.kind==='melee'?1.12:1.08;
    for(const key of ['income','power','haste'])if(def[key])def[key]*=1.2;
    for(const step of EVOLUTIONS[id])for(const key of ['income','power','haste'])if(step[key])step[key]*=1.2;
  }
  if(def.dot)def.dot*=attackBuff;
  for(const step of EVOLUTIONS[id])if(step.dot)step.dot*=attackBuff;
  def.damage/=COMBAT_SCALE;
  if(def.dot)def.dot/=COMBAT_SCALE;
  // Evolution DoT traits are absolute DPS values; multipliers are unitless.
  for(const step of EVOLUTIONS[id])if(step.dot)step.dot/=COMBAT_SCALE;
}
export const ENEMIES = {
  temple_acolyte: {name:'신전 추종자',hp:2100,speed:68,color:'#bfa58a',leak:2,size:13,eventOnly:'temple_of_ruin'},
  temple_knight: {name:'타락한 성전병',hp:9500,speed:42,color:'#b6aa9d',armor:.26,shield:650,leak:7,size:20,eventOnly:'temple_of_ruin'},
  temple_spore: {name:'제단 감염체',hp:6000,speed:58,color:'#c36c87',onDeath:[['temple_acolyte',2]],leak:5,size:19,eventOnly:'temple_of_ruin'},
  temple_priest: {name:'붉은 주술 사제',hp:14500,speed:53,color:'#e16780',heal:170,healRange:150,leak:10,size:21,eventOnly:'temple_of_ruin'},
  temple_guardian: {name:'고대 수호체',hp:85000,speed:35,color:'#e6b66a',armor:.38,shield:18500,leak:30,size:37,eventOnly:'temple_of_ruin'},
  temple_colossus: {name:'파멸의 거수',hp:175000,speed:30,color:'#a36c81',armor:.35,regen:360,leak:48,size:43,eventOnly:'temple_of_ruin'},
  temple_oracle: {name:'심연의 신관',hp:42000,speed:77,color:'#a886f1',shield:11000,heal:230,healRange:175,leak:22,size:27,eventOnly:'temple_of_ruin'},
  temple_deity: {name:'신전의 파멸신',hp:1800000,speed:25,color:'#ffb34a',armor:.42,shield:350000,regen:1800,leak:100,size:61,eventOnly:'temple_of_ruin'},
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
// Keep exact fractions (e.g. 28 HP -> 4.666…) rather than rounding them to
// whole integers: that would change the balance between basic waves and bosses.
for(const def of Object.values(ENEMIES)){
  for(const key of ['hp','shield','heal','regen'])if(def[key]!==undefined)def[key]/=COMBAT_SCALE;
}
// Distinct boss mechanics, readable telegraphs and limited-frequency effects.
export const BOSS_ABILITIES={
  temple_guardian:{name:'성역의 방벽',kind:'shield',cooldown:15,power:.25},
  temple_colossus:{name:'파멸의 전율',kind:'jam',cooldown:20,power:2.4,radius:195},
  temple_deity:{name:'심판의 태양',kind:'jam',cooldown:17,power:3.3,radius:245},
 boss:{name:'분노의 돌진',kind:'rush',cooldown:12,power:1.5,duration:3},
 fastboss:{name:'전력 질주',kind:'rush',cooldown:10,power:1.85,duration:2.4},
 tank:{name:'강철 방벽',kind:'shield',cooldown:15,power:.18},
 mecha:{name:'전자기 교란',kind:'jam',cooldown:16,power:2.2,radius:175},
 doom:{name:'아마겟돈 파동',kind:'jam',cooldown:17,power:3,radius:220},
 apocalypse:{name:'심판의 보호막',kind:'shield',cooldown:16,power:.2},
 warden:{name:'황혼의 방벽',kind:'shield',cooldown:14,power:.15},
 behemoth:{name:'대지의 발구름',kind:'jam',cooldown:19,power:2,radius:160},
 overload:{name:'과부하 신호',kind:'rush',cooldown:11,power:1.65,duration:3},
 abyss:{name:'심연의 속박',kind:'jam',cooldown:17,power:2.6,radius:180},
 phantom:{name:'유령 질주',kind:'rush',cooldown:12,power:1.7,duration:2.6},
 nemesis:{name:'네메시스 결계',kind:'shield',cooldown:13,power:.12},
 colossus:{name:'거인의 충격파',kind:'jam',cooldown:20,power:3.5,radius:230},
 oblivion:{name:'소멸의 심판',kind:'jam',cooldown:18,power:4,radius:240}
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
  { id:'temple_ruin',name:'파멸의 신전',tag:'TEMPLE OF RUIN',biome:'temple',eventOnly:'temple_of_ruin',color:'#e8b45f',ground:'#352c40',roadColor:'#b79a73',desc:'붉은 균열과 금빛 제단이 공존하는 신전. 서로 이웃한 긴 통로가 광역·장거리 타워에 유리하다.',path:[[0,100],[1650,100],[1650,245],[190,245],[190,390],[1650,390],[1650,535],[190,535],[190,680],[1650,680],[1650,825],[190,825],[190,970],[1800,970]] },
  { id: 'plains', name: '평야', tag: 'GREEN MEADOWS', biome: 'plains', color: '#93ed76', ground: '#68b965', roadColor: '#e7c694', desc: '완만한 S자 오솔길과 넓은 배치 공간. 기본기를 익히기 좋은 평야.', path: [[0,560],[430,560],[630,180],[1100,180],[1320,820],[1800,820]] },
  { id: 'mountains', name: '어두운 산맥', tag: 'SHADOW PEAKS', biome: 'mountains', color: '#b49bfc', ground: '#444362', roadColor: '#87809d', desc: '봉우리를 오르내리는 사선 고갯길. 굽이마다 교차 사격을 준비하라.', path: [[0,820],[220,820],[520,590],[260,310],[650,140],[1040,420],[800,740],[1260,920],[1550,620],[1800,620]] },
  { id: 'crystal', name: '수정 동굴', tag: 'CRYSTAL CAVERNS', biome: 'crystal', color: '#8be9ff', ground: '#45396d', roadColor: '#a48dc8', desc: '북쪽 입구에서 동굴 중심부로 감기는 나선 통로. 안쪽 수정핵을 지켜라.', path: [[900,0],[900,160],[1480,160],[1480,850],[300,850],[300,330],[1160,330],[1160,620],[700,620]] },
  { id: 'volcano', name: '용암 협곡', tag: 'EMBER CANYON', biome: 'volcano', color: '#ff9863', ground: '#62414c', roadColor: '#a77065', desc: '가장 짧은 대각선 협곡. 적이 빠르게 돌파하니 초반 화력이 중요하다.', path: [[0,180],[460,340],[900,320],[1260,650],[1800,920]] },
  { id: 'snow', name: '눈꽃 숲', tag: 'FROSTWOOD', biome: 'snow', color: '#d0f5ff', ground: '#a3d0df', roadColor: '#eaf8ff', desc: '숲을 세 번 가로지르는 긴 왕복길. 나란한 통로를 함께 노려라.', path: [[0,200],[1450,200],[1450,440],[350,440],[350,710],[1450,710],[1450,930],[900,930],[900,1100]] }
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
  {id:'easy',name:'쉬움',color:'#9ac985',reward:180,startMoney:500,hp:1,waves:compileWaves(WAVE_SCRIPTS.easy,45,1.18,75)},
  {id:'normal',name:'기본',color:'#6bc4e3',reward:350,startMoney:850,hp:1.05,waves:compileWaves(WAVE_SCRIPTS.normal,48,1.0,95)},
  {id:'hard',name:'어려움',color:'#e8bd6b',reward:650,startMoney:2200,hp:1.15,waves:compileWaves(WAVE_SCRIPTS.hard,51,.9,125)},
  {id:'extreme',name:'익스트림',color:'#ed8c67',reward:1100,startMoney:4500,hp:1.25,waves:compileWaves(WAVE_SCRIPTS.extreme,55,.78,160)},
  {id:'hell',name:'지옥',color:'#f47f9b',reward:1800,startMoney:9000,hp:1.5,waves:compileWaves(WAVE_SCRIPTS.hell,58,.68,210)},
  {id:'ruin',name:'파멸',color:'#b491ea',reward:3000,startMoney:16000,hp:1.8,waves:compileWaves(WAVE_SCRIPTS.ruin,60,.58,270)}
];
// Independent event, deliberately NOT a difficulty, mode, or regular map.
export const EVENTS={
  temple_of_ruin:{
    id:'temple_of_ruin',name:'파멸의 신전',map:'temple_ruin',startMoney:4200,hp:1,
    reward:2300,firstClearTower:'oldgod',
    description:'봉인된 제단에서 파멸의 군세가 깨어난다. 길고 접힌 신전 회랑을 이용해 최후의 30웨이브를 버텨라.',
    waves:compileWaves(`temple_acolyte:16|temple_acolyte:24,temple_knight:3|temple_acolyte:26,temple_spore:6|temple_knight:9,temple_acolyte:18|temple_spore:10,temple_priest:2,temple_acolyte:18|temple_knight:13,temple_spore:12|temple_priest:6,temple_acolyte:28|temple_knight:16,temple_spore:15,temple_priest:3|temple_oracle:2,temple_acolyte:35|temple_guardian:1,temple_knight:12,temple_priest:4|temple_acolyte:40,temple_oracle:4|temple_spore:20,temple_knight:22|temple_priest:8,temple_oracle:7|temple_guardian:2,temple_spore:20|temple_knight:26,temple_oracle:9,temple_priest:9|temple_colossus:1,temple_acolyte:42|temple_oracle:13,temple_knight:29|temple_guardian:3,temple_priest:12,temple_spore:20|temple_colossus:2,temple_oracle:10|temple_colossus:2,temple_guardian:3,temple_priest:14|temple_knight:36,temple_oracle:20|temple_guardian:4,temple_spore:32,temple_priest:15|temple_colossus:3,temple_knight:31|temple_guardian:5,temple_oracle:23|temple_colossus:4,temple_priest:18,temple_knight:30|temple_colossus:4,temple_guardian:5,temple_oracle:20|temple_spore:50,temple_priest:22,temple_guardian:6|temple_colossus:5,temple_oracle:26,temple_guardian:7|temple_colossus:6,temple_guardian:8,temple_priest:24|temple_deity:1,temple_colossus:2,temple_oracle:12`,61,.74,380)
  }
};
export const eventOf=config=>config?.eventId?EVENTS[config.eventId]:null;
export const campaignOf=config=>eventOf(config)||DIFFICULTIES.find(d=>d.id===config?.difficulty);
// Cosmetic rarity is independent from tower rarity and gameplay strength.
// Probabilities belong to each crate, NOT to a global style pool.
export const SKIN_RARITIES={
  common:{name:'일반',color:'#c3d3cc'},
  rare:{name:'희귀',color:'#65c8f3'},
  epic:{name:'에픽',color:'#bf94ff'},
  legendary:{name:'전설',color:'#ffc558'},
  mythic:{name:'신화',color:'#ff6484'}
};
export const SKIN_STYLES={
  meadow:{name:'초록 산책',rarity:'common',color:'#9ae69e',refund:30,targets:['scout','archer','chef','hunter']},
  arctic:{name:'눈꽃',rarity:'rare',color:'#a6edff',refund:90,targets:['scout','soldier','icewitch','scrap','hunter']},
  bloom:{name:'벚꽃',rarity:'rare',color:'#ffa6ca',refund:90,targets:['blade','chef','firefly','mermaid']},
  circuit:{name:'회로',rarity:'rare',color:'#85f6ce',refund:95,targets:['scout','soldier','spirit','drone','marker']},
  neon:{name:'네온',rarity:'epic',color:'#f79eff',refund:170,targets:['blade','soldier','drone','sonic','clockmaker']},
  frostfire:{name:'서리불꽃',rarity:'epic',color:'#8cbbff',refund:175,targets:['icewitch','firefly','storm','phoenix']},
  starlight:{name:'별무리',rarity:'epic',color:'#cfadff',refund:185,targets:['blade','rail','starseed','prism','papercrane']},
  royal:{name:'왕실',rarity:'legendary',color:'#ffe19a',refund:320,targets:['blade','knight','rail','reaper']},
  solstice:{name:'숲의 수호자',rarity:'legendary',color:'#b8ed86',refund:280,targets:['scout','archer','summoner','workshop']},
  hologram:{name:'홀로그램',rarity:'legendary',color:'#7dfaff',refund:335,targets:['scout','spirit','drone','prism','aurora']},
  glacier:{name:'영원한 빙하',rarity:'mythic',color:'#a6efff',refund:440,targets:['scout','icewitch','hunter','storm']},
  void:{name:'디지털 심연',rarity:'mythic',color:'#dc7aff',refund:540,targets:['blade','marker','prism','reaper','aurora']},
  celestial:{name:'천상의 성운',rarity:'mythic',color:'#ffb7dc',refund:680,targets:['blade','rail','starseed','phoenix','aurora']},
  donut:{name:'도넛 요리사',rarity:'legendary',color:'#ffba9e',refund:320,targets:['chef']},
  kitsune:{name:'구미호 가면검객',rarity:'mythic',color:'#ff8cba',refund:650,targets:['blade']}
};
// All 5 boxes use game-earned coins only. odds sum to exactly 100 for each.
// A box chooses a style by its own published probability, then uniformly
// chooses an owned tower. Skins never modify combat stats.
export const CRATES={
  wardrobe:{name:'반짝 의상 상자',theme:'종합',price:1000,icon:'🎁',color:'#c2b6ff',description:'클래식한 눈꽃·네온·왕실 의상을 만나는 기본 상자.',odds:{arctic:60,neon:25,royal:9,donut:6}},
  forest:{name:'비밀의 숲 상자',theme:'자연',price:400,icon:'🌿',color:'#9ce4a5',description:'싱그러운 초록빛부터 오래된 숲의 수호자까지.',odds:{meadow:70,bloom:25,solstice:5}},
  winter:{name:'빙설 궁전 상자',theme:'눈과 얼음',price:1500,icon:'❄️',color:'#9ce3ff',description:'차가운 눈꽃, 푸른 서리불꽃, 영원한 빙하.',odds:{arctic:65,frostfire:30,glacier:5}},
  cyber:{name:'네온 연구소 상자',theme:'사이버',price:3000,icon:'⚡',color:'#f4a5ff',description:'전기 회로와 홀로그램, 초희귀 디지털 심연.',odds:{circuit:55,neon:32,hologram:11,void:2}},
  astral:{name:'천상의 별빛 상자',theme:'우주·왕실',price:5000,icon:'🌌',color:'#ffd38e',description:'별빛 의상과 왕실 장식, 천상의 신화 스킨.',odds:{starlight:52,royal:28,celestial:13,void:2,kitsune:5}}
};
for(const [id,crate] of Object.entries(CRATES)){
  crate.styles=Object.keys(crate.odds);
  if(Object.values(crate.odds).reduce((a,b)=>a+b,0)!==100)throw Error('상자 확률 합계 오류: '+id);
  for(const style of crate.styles)if(!Object.hasOwn(SKIN_STYLES,style))throw Error('상자 스킨 미등록: '+style);
}
// Publish only applicable, fully redesigned costumes for each unit.
export function skinCandidates(style,owned){
  const spec=SKIN_STYLES[style];
  return spec?owned.filter(id=>spec.targets.includes(id)&&Object.hasOwn(TOWERS,id)):[];
}
export function availableCrateStyles(crate,owned){
  return crate.styles.filter(style=>skinCandidates(style,owned).length>0);
}
export function skinOdds(crate,owned){
  const styles=availableCrateStyles(crate,owned);
  const total=styles.reduce((sum,id)=>sum+crate.odds[id],0);
  return styles.map(style=>({style,percent:crate.odds[style]*100/total}));
}

export function starterProfile(name='새로운 모험가') {
  return { name, coins:600, xp:0, wins:0, owned:['scout','blade'], loadout:['scout','blade'], packs:['basic'], pack:'basic', skins:{}, equippedSkins:{}, cratePity:0, cratePities:{wardrobe:0,forest:0,winter:0,cyber:0,astral:0}, lastCrate:null, schema:2 };
}
