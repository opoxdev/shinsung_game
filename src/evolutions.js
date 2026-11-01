// Individual battle-unit evolution paths. Multipliers are absolute against the
// tower's base statistics; nothing here changes other instances of the same type.
// Visual "look" names are consumed by art.js for level-specific equipment.
const v=(name,cost,damageMult,rateMult,rangeMult,look,desc,traits={})=>
  ({name,cost,damageMult,rateMult,rangeMult,look,desc,...traits});
export const EVOLUTIONS = {
  oldgod:[
    v('찬란한 후광',10500,1.65,1.08,1.1,'halo','거신의 빛이 더 넓은 전장을 비추고 신벌 폭발이 커진다.',{kind:'judgement',splash:195,bossBonus:2.3}),
    v('붉은 오염의 심장',19500,2.8,1.18,1.2,'aura','가슴의 붉은 핵이 맥동하며 거대한 신벌 파동을 일으킨다.',{kind:'judgement',splash:235,bossBonus:2.6}),
    v('종말을 초월한 신',33000,4.6,1.35,1.34,'crown','황금빛 천벌이 신전의 거신까지 무너뜨린다.',{kind:'judgement',splash:285,bossBonus:3.1})],

  scout:[
    v('기본 탄약 개량',180,1.5,1.05,1.05,'bandanna','탄약과 장전을 개량해 더욱 강하게 사격한다.'),
    v('고속 급탄 장치',380,2.05,1.35,1.14,'goggles','급탄 장치 개량으로 빠르게 연속 사격한다.'),
    v('이중 조준기',760,2.6,1.35,1.3,'shades','조준 모듈을 추가해 두 적을 동시에 타격한다.',{multi:2}),
    v('파편 탄환',1450,3.8,1.6,1.38,'star','파편 탄두가 명중 지점 주변에서 폭발한다.',{kind:'splash',splash:65}),
    v('관통 탄두',3000,6.2,2.1,1.65,'crown','강화 조준경과 관통 탄두를 장착한다.',{kind:'splash',splash:98,pierce:true})],
  soldier:[
    v('전기 배터리',350,1.5,1.15,1.1,'goggles','더 큰 배터리로 전격 출력을 높인다.'),
    v('이중 코일 장치',700,2,1.45,1.2,'antenna','감전 탄환이 두 명의 적을 연속 추적한다.',{multi:2}),
    v('연쇄 회로',1450,3.15,1.5,1.25,'gear','전격이 적 셋을 건너뛰며 연쇄된다.',{kind:'chain',chain:3,chainRange:115}),
    v('고전압 변압기',2800,4.6,1.95,1.42,'crown','고전압 방전이 다섯 대상까지 연속 전달된다.',{kind:'chain',chain:5,chainRange:145})],
  blade:[
    v('합금 검날',260,1.6,1.12,1.06,'bandanna','날을 강화해 타격 범위와 위력을 높인다.',{cleave:3}),
    v('쌍검 훈련',600,2.3,1.35,1.17,'double','두 자루의 검으로 다섯 명까지 베어낸다.',{cleave:5}),
    v('장갑 파쇄검',1200,3.6,1.52,1.25,'mask','고강도 검날로 장갑을 관통한다.',{cleave:6,pierce:true}),
    v('회전 검격',2500,5.4,1.8,1.4,'aura','넓은 회전 검격으로 여러 적을 동시에 베어낸다.',{kind:'splash',splash:94,pierce:true})],
  cannon:[
    v('두꺼운 화약',480,1.65,1.08,1.06,'flame','화약을 늘려 폭발 충격파를 키운다.',{splash:103}),
    v('연소 유탄',1000,2.5,1.3,1.15,'crown','연소탄이 적에게 잔불 피해를 남긴다.',{splash:113,dot:13,dotTime:2.6}),
    v('초고폭 유탄',2200,4.5,1.4,1.3,'star','거대한 화염 폭발이 넓은 구역을 뒤덮는다.',{splash:155,dot:25,dotTime:3.2})],
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
    v('강화 석궁',210,1.6,1.1,1.05,'bandanna','장력과 발사 기구를 강화한다.'),
    v('독성 볼트',480,2.3,1.3,1.14,'thorns','독성 볼트가 적에게 지속 피해를 남긴다.',{dot:9,dotTime:3}),
    v('다중 조준 사수',950,3.5,1.5,1.28,'halo','다중 표적 시스템으로 두 적을 동시에 타격한다.',{multi:2,dot:18,dotTime:3.3})],
  chef:[
    v('고폭 수류탄',300,1.8,1.15,1.14,'flame','파편 개량으로 폭발 범위가 증가한다.',{splash:86}),
    v('점착 유탄',950,3.5,1.4,1.25,'crown','점착 수류탄으로 피해와 함께 감속 효과를 부여한다.',{splash:120,slow:.72,slowTime:2.5})],
  chemist:[
    v('맹독 조제법',360,1.35,1.12,1.09,'goggles','약병을 개량하여 독의 피해를 높인다.',{dot:18,dotTime:3}),
    v('산성 연무',780,2.1,1.2,1.15,'flame','독성 안개가 주변 적에게도 퍼진다.',{kind:'splash',splash:66,dot:20,dotTime:3}),
    v('광역 독성탄',1500,3.2,1.42,1.24,'thorns','넓은 독성 연무로 지속 피해를 준다.',{kind:'splash',splash:94,dot:35,dotTime:4}),
    v('고농도 부식탄',3100,4.9,1.7,1.37,'halo','고농도 부식탄이 방어력을 무시한다.',{kind:'splash',splash:115,dot:52,dotTime:4.5,pierce:true})],
  icewitch:[
    v('냉각 노즐',400,1.5,1.14,1.13,'crystal','차가운 서리로 적의 발을 둔하게 만든다.',{slow:.42,slowTime:3}),
    v('이중 냉각기',850,2.4,1.3,1.26,'wings','냉각탄 두 발을 서로 다른 목표에 발사한다.',{multi:2,slow:.4,slowTime:3.2}),
    v('빙결 폭풍 장치',1750,3.9,1.5,1.42,'crown','초저온 폭풍 장치가 넓은 지역을 둔화시킨다.',{kind:'splash',splash:104,slow:.33,slowTime:4})],
  spirit:[
    v('드론 추진기',440,1.6,1.14,1.11,'orb','개량된 추진기로 드론이 더 빨리 목표를 추적한다.',{summons:2,unitSpeed:315}),
    v('삼중 드론 편대',900,2.2,1.23,1.2,'double','정찰 드론 세 기가 각자 목표를 찾아 비행한다.',{summons:3,unitSpeed:335}),
    v('드론 전술 편대',1800,3.2,1.38,1.3,'wings','전술 드론 네 기가 적을 추격한다.',{summons:4,unitSpeed:365,unitLife:10}),
    v('고속 추적 편대',3700,4.6,1.52,1.48,'halo','고속 드론 다섯 기가 정밀 추적한다.',{summons:5,unitSpeed:400,unitLife:12})],
  firefly:[
    v('확산형 분사구',600,1.65,1.12,1.08,'wings','불꽃 파편의 범위와 피해를 높인다.',{splash:85,dot:13,dotTime:2.8}),
    v('장시간 연소',1250,2.7,1.33,1.2,'flame','분사된 화염이 적에게 오래 남아 피해를 준다.',{splash:104,dot:24,dotTime:3.5}),
    v('고열 화염 폭풍',2600,4.35,1.55,1.33,'halo','태양빛 폭발과 불꽃 궤적을 남긴다.',{splash:134,dot:38,dotTime:4})],
  knight:[
    v('은빛 검술',650,1.65,1.14,1.1,'cape','검의 잔상이 여섯 적을 베어낸다.',{cleave:6,pierce:true}),
    v('반달의 기사',1350,2.7,1.28,1.24,'crown','전장의 폭이 넓어져 일곱 명을 공격한다.',{cleave:7,pierce:true}),
    v('월광의 심판',2750,4.4,1.43,1.43,'halo','검광이 주변 적을 원형으로 휩쓴다.',{kind:'splash',splash:111,pierce:true})],
  drone:[
    v('확장 안테나',680,1.5,1.16,1.09,'antenna','번개가 네 목표까지 이어진다.',{chain:4,chainRange:130}),
    v('연쇄 회로 개선',1350,2.35,1.32,1.2,'gear','다섯 적을 찾아 이동하는 향상된 회로.',{chain:5,chainRange:145}),
    v('초전도 합금',2900,3.6,1.5,1.33,'double','번개가 장갑을 관통하며 넓게 이어진다.',{chain:6,chainRange:165,pierce:true}),
    v('전력망 증폭기',5700,5.4,1.75,1.45,'halo','여덟 대상을 관통하는 천둥의 기계.',{chain:8,chainRange:195,pierce:true})],
  clockmaker:[
    v('구리 톱니',750,1,1,1.17,'gear','시계 오라가 공격 속도를 28% 가속한다.',{haste:.28}),
    v('시간의 사제',1650,1,1,1.32,'halo','시계의 가호로 공격 속도 42%를 제공한다.',{haste:.42})],
  banker:[
    v('자동 보급 모듈',750,1,1.15,1,'gold','자동 보급 주기가 짧아지고 생산량이 증가한다.',{income:180}),
    v('추가 보급 시스템',1600,1,1.33,1,'orb','추가 보급 장비로 수입이 270으로 증가한다.',{income:270}),
    v('고급 보급 장치',3200,1,1.55,1,'crown','고급 지급 장치로 수입이 380으로 증가한다.',{income:380}),
    v('중앙 보급실',6700,1,1.82,1,'halo','중앙 보급 시스템이 기지 경제를 유지한다.',{income:580})],
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
    v('장거리 조준경',1800,1.55,1.08,1.1,'goggles','세 번째 탄환이 강화되어 보스 체력을 깊이 깎는다.',{chargeEvery:3,chargeBonus:2.8}),
    v('급소 파괴탄',3900,2.5,1.22,1.2,'shades','강화탄의 위력이 상승하고 빈사 보스에게 치명타를 준다.',{chargeEvery:3,chargeBonus:3.1,execute:.25,executeBonus:1.7}),
    v('특수 저격 교본',8200,4.4,1.4,1.35,'crown','두 발마다 강력한 저격탄을 장전한다.',{chargeEvery:2,chargeBonus:3.6,execute:.35,executeBonus:2,pierce:true})],
  scrap:[
    v('두꺼운 포탄',1200,1.6,1.08,1.07,'gear','고철 포탄의 파편이 인근 적을 함께 타격한다.',{splash:92}),
    v('철갑 분쇄기',2800,2.65,1.18,1.14,'double','철갑 관통 포탄으로 강화 장갑을 무너뜨린다.',{splash:115,pierce:true}),
    v('초중량 포격',6000,4.2,1.32,1.26,'flame','초중량 유탄이 주변 적에게 폭발 피해를 준다.',{splash:150,pierce:true})],
  lullaby:[
    v('휴대 증폭기',180,1,1,1.14,'orb','전술 신호로 주변 타워 공격속도를 14% 높인다.',{haste:.14}),
    v('동조 신호',420,1,1,1.3,'wings','증폭 신호 범위와 공격속도 지원 효과가 향상된다.',{haste:.21}),
    v('전술 방송망',990,1,1,1.52,'halo','집중 전술 방송으로 인접 타워 공격속도를 30% 높인다.',{haste:.3})],
  papercrane:[
    v('바람 접기',300,1.5,1.1,1.05,'wings','종이학의 날갯짓이 더 빨라진다.',{summons:1,unitSpeed:365,unitLife:7}),
    v('두 마리의 학',750,2.2,1.16,1.13,'double','접은 종이학 두 마리가 빠르게 적을 추격한다.',{summons:2,unitSpeed:390,unitLife:7}),
    v('천 마리의 소원',1750,3.2,1.31,1.24,'star','세 마리의 종이학이 출구까지 적을 쫓는다.',{summons:3,unitSpeed:430,unitLife:9}),
    v('종이비행 폭풍',3900,4.55,1.48,1.35,'halo','네 마리의 종이학이 지칠 때까지 전장을 누빈다.',{summons:4,unitSpeed:475,unitLife:11})],
  marker:[
    v('표적 레이저',540,1.45,1.08,1.1,'crystal','조준 레이저가 맞힌 적에게 28% 추가 피해 표식을 남긴다.',{markAmp:1.28,markTime:4}),
    v('다중 표식',1250,2.1,1.22,1.18,'double','두 적에게 동시에 표식을 각인한다.',{markAmp:1.32,markTime:4.4,multi:2}),
    v('광역 표적 지정',2550,3,1.38,1.3,'aura','광역 표적 장비로 여러 적을 동시에 지정한다.',{kind:'splash',splash:76,markAmp:1.4,markTime:5}),
    v('전장 표적망',5200,4.5,1.62,1.43,'halo','넓은 표식 지대가 아군 화력을 집중시키며 방어를 무너뜨린다.',{kind:'splash',splash:110,markAmp:1.55,markTime:6})],

};
export const evolutionAt=(type,level)=>level>0?EVOLUTIONS[type]?.[level-1]||null:null;
