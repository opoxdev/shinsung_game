// Individual battle-unit evolution paths. Multipliers are absolute against the
// tower's base statistics; nothing here changes other instances of the same type.
// Visual "look" names are consumed by art.js for level-specific equipment.
const v=(name,cost,damageMult,rateMult,rangeMult,look,desc,traits={})=>
  ({name,cost,damageMult,rateMult,rangeMult,look,desc,...traits});
export const EVOLUTIONS = {
  scout:[
    v('단단한 자갈',180,1.5,1.05,1.05,'bandanna','돌멩이를 연마해 더욱 강하게 발사한다.'),
    v('특제 고무줄',380,2.05,1.35,1.14,'goggles','새총이 더 빠르게 당겨져 연속 사격한다.'),
    v('선글라스 사수',760,2.6,1.35,1.3,'shades','멋진 선글라스를 쓰고 두 적을 동시에 겨냥한다.',{multi:2}),
    v('별똥별 탄환',1450,3.8,1.6,1.38,'star','별빛 탄환이 명중 지점 주변에 폭발한다.',{kind:'splash',splash:65}),
    v('천재 저격소년',3000,6.2,2.1,1.65,'crown','황금 조준경을 장착하고 폭발 범위를 넓힌다.',{kind:'splash',splash:98,pierce:true})],
  soldier:[
    v('전기 배터리',350,1.5,1.15,1.1,'goggles','더 큰 배터리로 전격 출력을 높인다.'),
    v('쌍둥이 충전기',700,2,1.45,1.2,'antenna','감전 탄환이 두 명의 적을 연속 추적한다.',{multi:2}),
    v('연쇄 회로',1450,3.15,1.5,1.25,'gear','전격이 적 셋을 건너뛰며 연쇄된다.',{kind:'chain',chain:3,chainRange:115}),
    v('번개의 왕관',2800,4.6,1.95,1.42,'crown','전기 폭풍이 다섯 대상까지 이어진다.',{kind:'chain',chain:5,chainRange:145})],
  blade:[
    v('수련의 붉은 띠',260,1.6,1.12,1.06,'bandanna','검격의 무게를 강화한다.',{cleave:3}),
    v('이중 검술',600,2.3,1.35,1.17,'double','두 자루의 검으로 다섯 명까지 베어낸다.',{cleave:5}),
    v('달빛 가면',1200,3.6,1.52,1.25,'mask','달빛을 두른 검격이 장갑을 관통한다.',{cleave:6,pierce:true}),
    v('붉은 낙화',2500,5.4,1.8,1.4,'aura','넓은 원형 검무가 한꺼번에 여러 적을 처치한다.',{kind:'splash',splash:94,pierce:true})],
  cannon:[
    v('두꺼운 화약',480,1.65,1.08,1.06,'flame','화약을 늘려 폭발 충격파를 키운다.',{splash:103}),
    v('불꽃 모자',1000,2.5,1.3,1.15,'crown','불씨가 남아 적을 지속적으로 태운다.',{splash:113,dot:13,dotTime:2.6}),
    v('초신성 폭탄',2200,4.5,1.4,1.3,'star','거대한 화염 폭발이 넓은 구역을 뒤덮는다.',{splash:155,dot:25,dotTime:3.2})],
  summoner:[
    v('고블린 친구',550,1.4,1.12,1.08,'orb','고블린을 조금 더 자주 소환한다.',{summons:1,unitSpeed:235}),
    v('쌍둥이 소환',1200,1.9,1.18,1.18,'double','한 번에 두 고블린을 전장에 부른다.',{summons:2,unitSpeed:245}),
    v('정글 지팡이',2400,2.9,1.3,1.28,'thorns','세 마리의 전투 고블린이 사냥을 돕는다.',{summons:3,unitSpeed:270,unitLife:10}),
    v('고블린 대행진',5200,4.2,1.4,1.44,'crown','네 마리의 정예 소환수가 적을 집요하게 추격한다.',{summons:4,unitSpeed:335,unitLife:12})],
  workshop:[
    v('영양 포자',450,1,1,1.13,'thorns','주변 타워 공격력 강화가 30%로 상승한다.',{power:.3}),
    v('무지개 버섯',900,1,1,1.28,'crystal','다채로운 포자가 공격력 40% 강화 효과를 만든다.',{power:.4}),
    v('생명의 숲',1900,1,1,1.45,'aura','숲의 축복으로 공격력 55%를 제공한다.',{power:.55})],
  rail:[
    v('빛나는 망원경',1300,1.75,1.12,1.14,'goggles','정확한 별빛이 더욱 먼 적에게 닿는다.',{pierce:true}),
    v('쌍성 마법진',2600,2.6,1.2,1.26,'star','두 개의 별이 서로 다른 적을 포착한다.',{multi:2,pierce:true}),
    v('은하수 심판',5200,4.3,1.4,1.45,'halo','별빛이 인접한 적들을 따라 굴절된다.',{kind:'chain',chain:4,chainRange:160,pierce:true})],
  sonic:[
    v('진동 증폭기',1900,1.55,1.18,1.08,'antenna','더 빠르게 퍼지는 파동을 방출한다.',{splash:58}),
    v('서브 우퍼',3800,2.4,1.4,1.18,'gear','저음을 키워 적을 잠깐 느리게 한다.',{splash:70,slow:.72,slowTime:1.5}),
    v('무지개 비트',7000,3.5,1.65,1.3,'wings','거대한 충격파로 적의 속도를 절반으로 줄인다.',{splash:87,slow:.52,slowTime:2}),
    v('궁극의 콘서트',14000,5.1,2,1.43,'halo','전장 가득 울리는 초고속 음파의 절정.',{splash:116,slow:.44,slowTime:2.5})],
  archer:[
    v('두꺼운 화살',210,1.6,1.1,1.05,'bandanna','나무 활의 탄력을 높인다.'),
    v('독화살 깃',480,2.3,1.3,1.14,'thorns','나뭇잎 독이 적의 체력을 지속적으로 깎는다.',{dot:9,dotTime:3}),
    v('숲의 명사수',950,3.5,1.5,1.28,'halo','아름다운 독화살이 두 적을 동시 타격한다.',{multi:2,dot:18,dotTime:3.3})],
  chef:[
    v('카라멜 폭탄',300,1.8,1.15,1.14,'flame','더 큰 도넛이 넓게 터진다.',{splash:86}),
    v('무지개 제빵사',950,3.5,1.4,1.25,'crown','설탕 폭풍이 적을 끈적하게 감속시킨다.',{splash:120,slow:.72,slowTime:2.5})],
  chemist:[
    v('맹독 조제법',360,1.35,1.12,1.09,'goggles','약병을 개량하여 독의 피해를 높인다.',{dot:18,dotTime:3}),
    v('산성 연무',780,2.1,1.2,1.15,'flame','독성 안개가 주변 적에게도 퍼진다.',{kind:'splash',splash:66,dot:20,dotTime:3}),
    v('독버섯 연구',1500,3.2,1.42,1.24,'thorns','넓은 독구름이 지속적으로 체력을 깎는다.',{kind:'splash',splash:94,dot:35,dotTime:4}),
    v('황금 연금술',3100,4.9,1.7,1.37,'halo','방어력을 무시하는 최고의 산성 폭풍.',{kind:'splash',splash:115,dot:52,dotTime:4.5,pierce:true})],
  icewitch:[
    v('서리 지팡이',400,1.5,1.14,1.13,'crystal','차가운 서리로 적의 발을 둔하게 만든다.',{slow:.42,slowTime:3}),
    v('얼음 나비',850,2.4,1.3,1.26,'wings','얼음 화살 두 발을 서로 다른 목표에 날린다.',{multi:2,slow:.4,slowTime:3.2}),
    v('빙하 여왕',1750,3.9,1.5,1.42,'crown','얼음 폭풍이 넓은 지역에 감속을 적용한다.',{kind:'splash',splash:104,slow:.33,slowTime:4})],
  spirit:[
    v('빛나는 등불',440,1.6,1.14,1.11,'orb','혼령들이 더 빨리 목표를 찾는다.',{summons:2,unitSpeed:315}),
    v('세 번째 친구',900,2.2,1.23,1.2,'double','세 유령이 각자 목표를 찾아 날아간다.',{summons:3,unitSpeed:335}),
    v('유령의 축제',1800,3.2,1.38,1.3,'wings','혼령 넷이 하늘에서 추격한다.',{summons:4,unitSpeed:365,unitLife:10}),
    v('백야의 등불',3700,4.6,1.52,1.48,'halo','빛으로 덮인 혼령 다섯이 빠르게 사냥한다.',{summons:5,unitSpeed:400,unitLife:12})],
  firefly:[
    v('불씨 날개',600,1.65,1.12,1.08,'wings','불꽃 파편의 범위와 피해를 높인다.',{splash:85,dot:13,dotTime:2.8}),
    v('작열의 꽃',1250,2.7,1.33,1.2,'flame','작열 꽃가루가 오랫동안 적을 태운다.',{splash:104,dot:24,dotTime:3.5}),
    v('태양의 요정',2600,4.35,1.55,1.33,'halo','태양빛 폭발과 불꽃 궤적을 남긴다.',{splash:134,dot:38,dotTime:4})],
  knight:[
    v('은빛 검술',650,1.65,1.14,1.1,'cape','검의 잔상이 여섯 적을 베어낸다.',{cleave:6,pierce:true}),
    v('반달의 기사',1350,2.7,1.28,1.24,'crown','전장의 폭이 넓어져 일곱 명을 공격한다.',{cleave:7,pierce:true}),
    v('월광의 심판',2750,4.4,1.43,1.43,'halo','검광이 주변 적을 원형으로 휩쓴다.',{kind:'splash',splash:111,pierce:true})],
  drone:[
    v('확장 안테나',680,1.5,1.16,1.09,'antenna','번개가 네 목표까지 이어진다.',{chain:4,chainRange:130}),
    v('로봇 조립 키트',1350,2.35,1.32,1.2,'gear','다섯 적을 찾아 이동하는 향상된 회로.',{chain:5,chainRange:145}),
    v('초전도 합금',2900,3.6,1.5,1.33,'double','번개가 장갑을 관통하며 넓게 이어진다.',{chain:6,chainRange:165,pierce:true}),
    v('폭풍 제조기',5700,5.4,1.75,1.45,'halo','여덟 대상을 관통하는 천둥의 기계.',{chain:8,chainRange:195,pierce:true})],
  clockmaker:[
    v('구리 톱니',750,1,1,1.17,'gear','시계 오라가 공격 속도를 28% 가속한다.',{haste:.28}),
    v('시간의 사제',1650,1,1,1.32,'halo','시계의 가호로 공격 속도 42%를 제공한다.',{haste:.42})],
  banker:[
    v('반짝이는 동전',750,1,1.15,1,'gold','수입이 더 자주 들어오며 양도 증가한다.',{income:180}),
    v('저금통 친구',1600,1,1.33,1,'orb','황금 젤리의 수입이 270으로 커진다.',{income:270}),
    v('황금 왕관',3200,1,1.55,1,'crown','왕관을 쓰면 수입이 380으로 증가한다.',{income:380}),
    v('신성한 금고',6700,1,1.82,1,'halo','기지 경제를 지탱하는 황금의 원천.',{income:580})],
  mermaid:[
    v('맑은 선율',950,1,1,1.15,'coral','산호 하프의 증폭 효과가 42%로 오른다.',{power:.42}),
    v('깊은 바다의 노래',1900,1,1,1.26,'wings','물결의 힘이 공격력을 52% 높인다.',{power:.52}),
    v('해저 왕실 연주',3900,1,1,1.43,'crown','고귀한 물결이 공격력을 68% 강화한다.',{power:.68})],
  prism:[
    v('유리 세공',1400,1.65,1.14,1.1,'crystal','광선 다섯 줄기가 여러 적 사이를 움직인다.',{chain:5,chainRange:175,pierce:true}),
    v('쌍광 프리즘',2800,2.5,1.32,1.23,'double','여섯 명을 추적하는 굴절 광선.',{chain:6,chainRange:188,pierce:true}),
    v('칠색 무지개',5600,3.9,1.5,1.36,'wings','빛이 여덟 적을 연속 타격한다.',{chain:8,chainRange:210,pierce:true}),
    v('천상의 광휘',11200,5.8,1.78,1.5,'halo','무지개 광선이 열 대상까지 이어진다.',{chain:10,chainRange:240,pierce:true})],
  reaper:[
    v('작은 낫날',1350,1.6,1.12,1.1,'mask','빈사 대상에게 더 큰 피해를 준다.',{execute:.4,executeBonus:2.8,cleave:2}),
    v('달그림자 토끼',2650,2.6,1.3,1.24,'cape','세 적을 가르고 처형 범위가 넓어진다.',{execute:.45,executeBonus:3,cleave:3}),
    v('죽음의 무도',5300,4.25,1.45,1.42,'halo','넓은 사신의 검무가 강한 적을 베어낸다.',{kind:'splash',splash:105,execute:.48,executeBonus:3.3,pierce:true})],
  storm:[
    v('먹구름 부적',1600,1.6,1.15,1.12,'orb','먹구름을 넓혀 감속 강도를 높인다.',{splash:130,slow:.58,slowTime:2}),
    v('벼락의 주술',3150,2.5,1.3,1.25,'antenna','천둥이 더 오래 적을 붙잡는다.',{splash:150,slow:.48,slowTime:2.5}),
    v('성운의 전류',6100,3.85,1.48,1.37,'wings','번개가 적 진영을 뒤흔든다.',{splash:180,slow:.42,slowTime:3.1}),
    v('태풍의 중심',12500,5.7,1.73,1.5,'halo','광범위 낙뢰가 적을 묶어둔다.',{splash:215,slow:.35,slowTime:3.8})],
  phoenix:[
    v('첫 번째 깃털',2500,1.5,1.13,1.08,'flame','불사조가 더욱 빠르게 날아간다.',{summons:2,unitSpeed:405,dot:30,dotTime:3}),
    v('세 개의 불씨',5000,2.25,1.21,1.17,'wings','세 마리의 불사조가 적을 추격한다.',{summons:3,unitSpeed:450,dot:42,dotTime:3.5}),
    v('붉은 왕관',9500,3.3,1.37,1.27,'crown','화염 조련사의 왕관이 소환수 넷을 부른다.',{summons:4,unitSpeed:480,dot:60,dotTime:4}),
    v('되살아나는 태양',17000,4.7,1.52,1.42,'halo','다섯 불사조가 장시간 날아다닌다.',{summons:5,unitSpeed:520,unitLife:12,dot:80,dotTime:4}),
    v('영원한 불꽃',29000,6.4,1.8,1.55,'star','여섯 불사조가 불멸의 화염을 뿌린다.',{summons:6,unitSpeed:570,unitLife:14,dot:105,dotTime:5})],
  aurora:[
    v('초록 성운',3400,1.52,1.12,1.11,'crystal','우주 광선의 도약 거리가 길어진다.',{chain:7,chainRange:230,slow:.55,slowTime:2.2}),
    v('푸른 파동',6900,2.25,1.27,1.22,'wings','오로라가 여덟 적을 관통한다.',{chain:8,chainRange:255,slow:.5,slowTime:2.5}),
    v('무한의 나선',13500,3.4,1.44,1.35,'gear','성운의 나선이 열 대상을 찾아 이동한다.',{chain:10,chainRange:280,slow:.45,slowTime:3}),
    v('생명의 유전자',26000,4.9,1.65,1.46,'crown','빛의 사슬이 열두 적을 묶는다.',{chain:12,chainRange:300,slow:.4,slowTime:3.4}),
    v('영원의 오로라',51000,7.2,1.9,1.62,'halo','푸른빛과 초록빛이 열네 목표를 휘감는다.',{chain:14,chainRange:330,slow:.32,slowTime:4,pierce:true})],
  starseed:[
    v('반짝이는 새싹',165,1.6,1.08,1.05,'star','가벼운 별가루가 조금 더 넓은 무리에 튄다.',{splash:56}),
    v('별꽃의 만개',395,2.4,1.2,1.12,'wings','작은 별꽃이 퍼져 초반 다수 적을 묶어 둔다.',{splash:72,slow:.84,slowTime:1.2}),
    v('밤하늘 씨앗',920,3.5,1.4,1.22,'halo','가벼운 별꽃 폭발을 연달아 터뜨린다.',{splash:95,slow:.77,slowTime:1.5})],
  hunter:[
    v('그림자 조준경',1800,1.55,1.08,1.1,'goggles','세 번째 탄환이 강화되어 보스 체력을 깊이 깎는다.',{chargeEvery:3,chargeBonus:2.8}),
    v('절명의 탄환',3900,2.5,1.22,1.2,'shades','강화탄의 위력이 상승하고 빈사 보스에게 치명타를 준다.',{chargeEvery:3,chargeBonus:3.1,execute:.25,executeBonus:1.7}),
    v('심야의 저격왕',8200,4.4,1.4,1.35,'crown','두 발마다 강력한 저격탄을 장전한다.',{chargeEvery:2,chargeBonus:3.6,execute:.35,executeBonus:2,pierce:true})],
  scrap:[
    v('두꺼운 포탄',1200,1.6,1.08,1.07,'gear','고철 포탄의 파편이 인근 적을 함께 타격한다.',{splash:92}),
    v('철갑 분쇄기',2800,2.65,1.18,1.14,'double','낡은 부품을 모아 강화장갑을 관통한다.',{splash:115,pierce:true}),
    v('폐허의 심장',6000,4.2,1.32,1.26,'flame','거대한 고철탄이 주변 적에게 폭발 피해를 준다.',{splash:150,pierce:true})],
  lullaby:[
    v('작은 오르골',180,1,1,1.14,'orb','작은 음악으로 주변 타워 공격속도를 14% 높인다.',{haste:.14}),
    v('파란 자장가',420,1,1,1.3,'wings','음악의 범위와 공격속도 보조 효과가 향상된다.',{haste:.21}),
    v('꿈의 합창',990,1,1,1.52,'halo','이웃 타워의 공격속도를 30% 높인다.',{haste:.3})],
  papercrane:[
    v('바람 접기',300,1.5,1.1,1.05,'wings','종이학의 날갯짓이 더 빨라진다.',{summons:1,unitSpeed:365,unitLife:7}),
    v('두 마리의 학',750,2.2,1.16,1.13,'double','접은 종이학 두 마리가 빠르게 적을 추격한다.',{summons:2,unitSpeed:390,unitLife:7}),
    v('천 마리의 소원',1750,3.2,1.31,1.24,'star','세 마리의 종이학이 출구까지 적을 쫓는다.',{summons:3,unitSpeed:430,unitLife:9}),
    v('종이비행 폭풍',3900,4.55,1.48,1.35,'halo','네 마리의 종이학이 지칠 때까지 전장을 누빈다.',{summons:4,unitSpeed:475,unitLife:11})],
  marker:[
    v('달무리 잉크',540,1.45,1.08,1.1,'crystal','명중한 적에게 28% 추가 피해 표식을 남긴다.',{markAmp:1.28,markTime:4}),
    v('이중 낙인',1250,2.1,1.22,1.18,'double','두 적에게 동시에 표식을 각인한다.',{markAmp:1.32,markTime:4.4,multi:2}),
    v('안개의 인장',2550,3,1.38,1.3,'aura','폭발형 잉크가 한 번에 여러 적을 표식 대상으로 바꾼다.',{kind:'splash',splash:76,markAmp:1.4,markTime:5}),
    v('밤의 계약',5200,4.5,1.62,1.43,'halo','넓은 표식 지대가 아군 화력을 집중시키며 방어를 무너뜨린다.',{kind:'splash',splash:110,markAmp:1.55,markTime:6})],

};
export const evolutionAt=(type,level)=>level>0?EVOLUTIONS[type]?.[level-1]||null:null;
