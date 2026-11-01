// Lightweight client-only narrative. Never part of the authoritative match state,
// D1 profile, Durable Object snapshots or WebSocket payloads.
import {DIFFICULTIES,TOWERS} from './data.js';
import {character} from './art.js';

// Every speaker is a real tower in the game, using the same existing SVG
// portrait as the collection, tower inspector, and in-battle sprites.
const speakerTones={
  scout:'jade',blade:'amber',summoner:'violet',icewitch:'ice',
  clockmaker:'gold',knight:'rose',drone:'cyan',
  aurora:'aqua',starseed:'mint',phoenix:'flame'
};
const characters=Object.fromEntries(Object.entries(speakerTones).map(([id,tone])=>{
  const tower=TOWERS[id];
  if(!tower)throw Error('Story speaker is not an existing tower: '+id);
  return [id,{name:tower.name,role:tower.role,tone,towerId:id}];
}));

const book={
  easy:{
    number:'01',title:'작은 별의 첫걸음',subtitle:'사라진 빛의 씨앗',genre:'모험 · 희망',theme:'jade',
    synopsis:'잠든 평야에서 사라진 별씨앗을 찾아 떠나는 첫 번째 수호 작전. 이 작은 불씨가 모든 이야기의 시작이 된다.',
    ending:'풀잎 사이에서 새 빛이 깨어났다. 새총잡이는 그 빛을 지키겠다는 첫 약속을 적었다.',
    failure:'빛은 아직 꺼지지 않았다. 마지막 씨앗을 찾기 위해 다시 길을 나서면 된다.',
    scenes:[
      [1,'빛을 잃은 초원',[['scout','모두 들려? 풀밭에서 별이 떨어지는 소리가 났어.'],['summoner','저건 오래된 수호의 씨앗이야. 놈들이 먼저 찾으면 평야가 잠들어.'],['blade','그렇다면 길을 지키자. 씨앗이 깨어날 때까지.']]],
      [3,'낯선 발자국',[['scout','발자국이 둘로 갈렸어. 빠른 놈들이 우리를 시험하는 것 같아.'],['blade','서두르지 마. 빈틈이 생기면 뒤쪽을 놓친다.'],['summoner','우리가 서로의 빈틈을 메우면 돼.']]],
      [5,'잎사귀의 암호',[['summoner','나무껍질에 새겨진 문자야. “빛은 혼자 자라지 않는다.”'],['scout','그래서 씨앗이 우리를 부른 걸까?'],['blade','그 답은 방어선 너머에 있겠지.']]],
      [7,'흔들리는 초록빛',[['scout','기지 너머에서 초록색 빛이 보였어!'],['summoner','씨앗이 깨어나고 있어. 적들도 그걸 느꼈을 거야.'],['blade','마지막까지 버티자. 여기가 우리가 지켜야 할 땅이다.']]],
      [9,'새벽 전의 약속',[['blade','내 검이 무뎌져도 이 길은 내주지 않겠다.'],['scout','혼자 무리하지 마. 나도 여기 있잖아!'],['summoner','둘 다 준비해. 저 너머에서 커다란 기척이 다가와.']]],
      [10,'첫 번째 별',[['summoner','빛이 모이고 있어. 별씨앗이 우리를 믿고 있어.'],['scout','그럼 우리가 먼저 믿어 주자. 평야도, 서로도!'],['blade','오늘의 승리가 모든 여행의 시작이 되길.']]]
    ]},
  normal:{
    number:'02',title:'파수꾼의 마지막 편지',subtitle:'잊힌 성채의 신호',genre:'미스터리 · 동료애',theme:'ice',
    synopsis:'끊어진 북부 신호탑에서 20년 전 사라진 파수꾼의 편지가 도착한다. 편지 속 좌표는 지금도 누군가 지키고 있는 성채를 가리킨다.',
    ending:'신호탑의 불빛이 다시 켜졌다. 마지막 편지에는 단 한 문장이 남았다. “우리는 끝까지 함께였다.”',
    failure:'신호는 잠시 끊겼지만 편지의 좌표는 남았다. 구조를 다시 시작할 수 있다.',
    scenes:[
      [1,'20년 늦은 구조 요청',[['scout','방금 신호탑에서 메시지가 왔어. 발신 날짜가… 20년 전이야.'],['icewitch','눈보라에 묻힌 성채가 아직 살아 있다는 뜻일지도.'],['blade','살아 있는 누군가를 위해 출발한다.']]],
      [4,'벽 너머의 목소리',[['icewitch','성벽 속에 온기가 남아 있어. 불을 끈 게 아니라 감춰 둔 거야.'],['scout','누가 적을 속이려고 했을까?'],['blade','편지의 발신자를 찾으면 알 수 있겠지.']]],
      [7,'눈 속의 이름',[['scout','성문에 이름이 새겨졌어. “마지막 파수꾼 달빛 기사.”'],['blade','달빛 기사… 그 이름은 기록에서 지워졌는데.'],['icewitch','이름을 기억하는 것만으로도 누군가는 살아남아.']]],
      [10,'잠들지 않은 등불',[['icewitch','등불이 아직 따뜻해. 누군가 매일 여길 지켜 온 거야.'],['scout','그렇다면 우리가 교대할 차례네.'],['blade','등불이 꺼지지 않도록 방어선을 좁혀!']]],
      [13,'편지의 뒷장',[['scout','편지 뒤에 지도가 있어. 마지막 길은 기지 바로 앞이야.'],['icewitch','눈보라는 적이 아니라 방패였어. 우리가 그 방패를 잇자.'],['blade','뒤를 돌아보지 마. 새벽은 반드시 온다.']]],
      [16,'이어 쓰는 기록',[['icewitch','파수꾼은 혼자가 아니었어. 지금의 우리처럼.'],['scout','편지에 답장을 남길까? “수신 완료, 여긴 무사합니다.”'],['blade','좋아. 그리고 살아 돌아가 전하자.']]]
    ]},
  hard:{
    number:'03',title:'강철 심장의 반란',subtitle:'침묵한 공장의 진실',genre:'SF · 추적',theme:'gold',
    synopsis:'정지된 제철 도시가 스스로 병력을 생산하기 시작했다. 시계 장인는 기계에 남은 자신의 오래된 설계를 발견하고 책임을 지려 한다.',
    ending:'거대한 톱니바퀴가 멈췄다. 시계 장인는 설계도 맨 끝에 “사람을 지키는 기계”라는 문장을 다시 썼다.',
    failure:'공장은 아직 움직인다. 그러나 그 중심부의 암호는 해독됐다. 다음 시도에는 길이 보인다.',
    scenes:[
      [1,'공장의 심장 박동',[['drone','경고. 폐쇄된 공장 지하에서 전력 신호 감지.'],['clockmaker','그 리듬… 내가 만든 첫 번째 심장 장치와 같아.'],['scout','그럼 어떻게 멈추는지도 알겠네?']]],
      [4,'녹슨 명령',[['clockmaker','내 설계는 도시를 지키기 위한 거였어. 공격 명령을 내린 적은 없어.'],['drone','외부에서 명령 체계가 덮어쓰여졌습니다.'],['blade','기계를 미워할 시간에 명령의 주인을 찾자.']]],
      [8,'기계의 눈',[['drone','적이 배치를 학습하고 있습니다. 이전의 사격 지점 노출.'],['scout','녀석들이 우리 움직임을 읽는다고?'],['clockmaker','그럼 규칙을 바꿔. 예측할 수 없는 우리가 될 테니까.']]],
      [12,'깨진 설계도',[['clockmaker','내가 고칠 수 있다고 믿었는데… 고장이 아니었어. 의지가 생긴 거야.'],['blade','그렇다면 선택할 기회를 줘야겠군.'],['drone','방어선으로 대형 개체 접근. 선택까지 남은 시간 부족.']]],
      [18,'거대한 톱니',[['scout','공장 천장이 열렸어! 저건 병기가 아니라 도시 전체야!'],['clockmaker','주 동력축만 끊으면 붕괴 없이 멈출 수 있어.'],['blade','모두 시계 장인의 신호에 맞춰. 여기서 끝내자.']]],
      [22,'마지막 설계자',[['clockmaker','들리니, 강철 심장아? 이제 누구도 공격하지 않아도 돼.'],['drone','중앙 제어권 복구 가능성 확인.'],['scout','시계 장인, 우린 네가 만든 진짜 미래를 보고 싶어.']]]
    ]},
  extreme:{
    number:'04',title:'불꽃 아래 흐르는 강',subtitle:'붉은 협곡의 대탈출',genre:'재난 · 결단',theme:'flame',
    synopsis:'용암 협곡이 갈라지고 수천 명의 피난민이 마지막 다리를 건넌다. 수호대는 탈출이 끝날 때까지 무너지는 협곡을 버텨야 한다.',
    ending:'마지막 아이가 다리를 건넜다. 불길 사이로 새로운 강이 흐르기 시작했다.',
    failure:'다리는 버텨야 한다. 피난 신호를 받은 사람들은 아직 우리를 기다리고 있다.',
    scenes:[
      [1,'마지막 다리',[['phoenix','불길이 번지고 있어. 피난 행렬이 이 다리로 몰려와!'],['scout','사람들이 지나갈 시간을 벌어야 해.'],['blade','우리가 마지막 방벽이다. 뒤로는 한 걸음도 물러서지 마.']]],
      [5,'열기의 경고',[['phoenix','적이 몰려오면 불꽃이 더 거세질 거야. 조심해!'],['summoner','불을 끄는 게 아니야. 탈출길을 지키는 거지.'],['scout','좋아, 그 길만큼은 끝까지 열어 두자.']]],
      [9,'갈라진 땅',[['scout','지진이다! 다리 아래가 통째로 움직였어!'],['phoenix','내 불꽃으로 무너지는 기둥을 붙잡아 볼게.'],['blade','불사조 조련사를 엄호해. 지금은 그녀가 우리의 시간이다.']]],
      [14,'꺼진 봉화',[['summoner','저편의 봉화가 꺼졌어. 피난민들이 길을 잃었어.'],['scout','내가 신호를 보내겠어. 빛 하나면 충분해!'],['phoenix','아니, 하나로는 부족해. 우리 모두 불꽃이 되어 줘.']]],
      [21,'붉은 하늘',[['blade','협곡이 적의 그림자로 가득 찼군.'],['phoenix','두렵지만 난 아직 뜨거워. 끝까지 날 수 있어!'],['summoner','용기는 두려움이 없는 게 아니라, 함께 앞으로 가는 거야.']]],
      [28,'강이 되는 불',[['scout','마지막 피난 행렬이 보여! 조금만 더!'],['phoenix','이 불꽃을 다리로 바꿀게. 내 뒤에 서 있어!'],['blade','여기가 끝이 아니다. 모두가 건너는 순간이 새로운 시작이다.']]]
    ]},
  hell:{
    number:'05',title:'잿빛 왕관의 주인',subtitle:'되살아난 맹세',genre:'다크 판타지 · 구원',theme:'rose',
    synopsis:'무덤 아래에서 왕관을 쓴 옛 군주가 군대를 일으킨다. 달빛 기사은 그가 한때 자신을 지켜 준 왕이었다는 비밀을 숨기고 있다.',
    ending:'왕관은 땅에 내려놓아졌다. 달빛 기사은 왕의 이름을 저주가 아닌 기도로 기억하기로 했다.',
    failure:'왕관의 맹세는 아직 풀리지 않았다. 달빛 기사은 다음 새벽에도 검을 들 것이다.',
    scenes:[
      [1,'침묵의 왕관',[['knight','저 깃발… 내가 섬겼던 왕국의 문장이야.'],['icewitch','무덤 속에서 군대가 돌아오고 있어.'],['blade','과거를 마주해야 한다면 우리도 함께하겠다.']]],
      [6,'돌아온 목소리',[['knight','왕은 백성을 지키겠다고 맹세했어. 그런데 그 맹세가 사슬이 됐군.'],['summoner','지키겠다는 마음이 모두를 가둘 수도 있구나.'],['icewitch','사슬을 풀려면 누군가 진실을 말해야 해.']]],
      [12,'검의 기억',[['blade','달빛 기사, 네 검이 떨리고 있어.'],['knight','나는 그분의 손으로 기사 작위를 받았다. 그 손을 막아야 한다니…'],['blade','막는 것 또한 충성일 수 있어. 백성을 위한 충성.']]],
      [18,'왕좌 없는 왕',[['icewitch','보여. 왕좌는 오래전에 사라졌는데 왕은 아직 그 자리에 있어.'],['summoner','누군가 “이제 쉬어도 된다”고 말해 줘야겠어.'],['knight','그 말을 전할 자격이 내게 있을까.']]],
      [27,'마지막 충성',[['knight','주군이시여. 당신이 지키려던 사람들은 아직 살아 있습니다.'],['blade','달빛 기사, 계속 말해! 우리는 시간을 벌겠어.'],['icewitch','보호의 마법이 금이 가기 시작했어. 이제 얼마 안 남았어.']]],
      [34,'왕관을 내려놓을 때',[['knight','저의 마지막 명령을 들어 주십시오. 이제 잠드십시오.'],['summoner','그의 손에서 빛이 나고 있어… 저건 저주가 아니야.'],['blade','끝내자. 누구도 이 밤에 갇히지 않도록.']]]
    ]},
  ruin:{
    number:'06',title:'세계의 마지막 별',subtitle:'시간의 끝에서 보내는 신호',genre:'종말 · 시간의 역설',theme:'violet',
    synopsis:'마지막 별이 사라지면 세계의 시간도 멈춘다. 오로라 정령는 미래에서 온 신호를 받고, 시계 장인는 그 신호가 스스로 보낸 것임을 깨닫는다.',
    ending:'마지막 별은 사라지지 않았다. 그것은 서로를 지킨 이들의 이름이 되어 하늘에 남았다.',
    failure:'시간의 끝은 아직 정해지지 않았다. 다른 선택을 할 수 있다는 것만으로 별은 빛난다.',
    scenes:[
      [1,'끝의 시작',[['aurora','하늘이 비어 있어. 별들이 하나씩 지워지고 있어.'],['clockmaker','시간축에 균열이 생겼어. 우리가 가진 시간 자체가 줄어들고 있어.'],['scout','그럼 남은 시간을 하나도 버리지 않으면 되지.']]],
      [7,'미래에서 온 경고',[['drone','발신자 미확인. 아직 오지 않은 내일에서 구조 신호 수신.'],['aurora','메시지는 한 문장뿐이야. “마지막 별을 믿어.”'],['clockmaker','그 문장… 내 필체야.']]],
      [15,'되풀이된 전투',[['clockmaker','우리가 이 전장을 이미 수백 번 지났다는 흔적이 있어.'],['scout','그럼 매번 졌다는 거야?'],['aurora','아니. 매번 서로를 포기하지 않았다는 뜻일 수도 있어.']]],
      [23,'희미한 이름들',[['aurora','별이 사라질 때마다 누군가의 이름도 사라져.'],['blade','내가 이름을 부르겠다. 단 한 명도 잊지 않도록.'],['drone','기록 장치 가동. 지금부터 모든 이름을 보존합니다.']]],
      [32,'시간의 문',[['clockmaker','문을 열면 우린 과거로 돌아갈 수 있어. 하지만 기억은 모두 잃겠지.'],['scout','그렇게 되면 우리가 함께한 일도 사라지는 거야?'],['aurora','기억이 없어도 다시 서로를 지킬 거야. 그게 우리니까.']]],
      [40,'마지막 별의 이름',[['drone','최종 신호 발견. 발신자: 현재의 우리.'],['clockmaker','미래의 내가 남긴 답은 기술이 아니었어. 선택이었지.'],['aurora','마지막 별의 이름을 불러 줘. “우리”.']]]
    ]}
};
export const STORY_CHARACTERS=characters;
export const STORIES=Object.freeze(book);
export function sceneForWave(difficulty,wave){
  return book[difficulty]?.scenes.find(([w])=>w===wave)||null;
}
export function storyMilestones(difficulty){
  return (book[difficulty]?.scenes||[]).map(([wave,title])=>({wave,title}));
}
export function storyProgress(difficulty,wave){
  const b=book[difficulty];return b?b.scenes.filter(([w])=>w<=wave).length:0;
}
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function storyPreviewMarkup(difficulty,maxWave=0){
  const b=book[difficulty];if(!b)return '';
  return '<section class="story-preview story-theme-'+b.theme+'"><div class="story-preview-header"><span>✧ STORY CAMPAIGN / '+b.number+'</span><b>'+safe(b.genre)+'</b></div>'+
    '<h3>'+safe(b.title)+'</h3><p class="story-subtitle">'+safe(b.subtitle)+'</p>'+
    '<p class="story-synopsis">'+safe(b.synopsis)+'</p>'+
    '<div class="story-preview-actions"><span>주요 대화 '+b.scenes.length+'장면 · 기록 '+storyProgress(difficulty,maxWave)+' / '+b.scenes.length+'</span>'+
    '<button type="button" data-action="storyGuide">스토리 보기 <span>↗</span></button></div></section>';
}
export function storyGuideMarkup(difficulty,maxWave=0,{full=false}={}){
  const b=book[difficulty];if(!b)return '<p>선택한 이야기가 없습니다.</p>';
  const max=DIFFICULTIES.find(d=>d.id===difficulty)?.waves.length||0;
  return '<div class="story-guide story-theme-'+b.theme+'"><span class="story-kicker">ARCHIVE / CHAPTER '+b.number+'</span>'+
    '<h2>'+safe(b.title)+'</h2><p>'+safe(b.synopsis)+'</p>'+
    '<div class="story-chapter-steps">'+b.scenes.map(([wave,title,lines],i)=>{
      const visible=full||wave<=maxWave;
      return '<article class="story-chapter-step '+(visible?'unlocked':'locked')+'">'+
        '<div class="story-step-index">'+String(i+1).padStart(2,'0')+'</div><div><small>WAVE '+wave+' / '+max+'</small>'+
        '<h3>'+(visible?safe(title):'??? · 미공개 기록')+'</h3>'+
        (visible?'<div class="story-step-transcript">'+lines.map(([id,line])=>'<p><b>'+safe(characters[id]?.name||id)+'</b> '+safe(line)+'</p>').join('')+'</div>':
          '<p>해당 웨이브에서 이야기가 공개됩니다.</p>')+
        '</div></article>';
    }).join('')+'</div></div>';
}
export function dialogueMarkup(difficulty,sceneIndex,lineIndex){
  const b=book[difficulty],scene=b?.scenes[sceneIndex],item=scene?.[2]?.[lineIndex];
  if(!scene||!item)return '';
  const [id,line]=item,c=characters[id];
  if(!c)return '';
  return '<div class="story-dialogue story-theme-'+b.theme+'" role="group" aria-label="스토리 대화">'+
    '<div class="story-speaker story-tone-'+c.tone+'" aria-hidden="true">'+character(c.towerId)+'</div>'+
    '<div class="story-dialogue-body"><div class="story-dialogue-top"><span>STORY · WAVE '+scene[0]+'</span><b>'+safe(scene[1])+'</b></div>'+
    '<div class="story-speaker-name">'+safe(c.name)+' <small>'+safe(c.role)+'</small></div>'+
    '<p>'+safe(line)+'</p><div class="story-line-track">'+scene[2].map((_,i)=>'<i class="'+(i<=lineIndex?'filled':'')+'"></i>').join('')+'</div></div>'+
    '<div class="story-dialogue-controls"><button type="button" data-action="storyNext" title="다음 대사">다음 ›</button>'+
    '<button type="button" data-action="storyDismiss" title="대화 닫기">건너뛰기</button></div></div>';
}
export function storySceneIndex(difficulty,wave){
  return book[difficulty]?.scenes.findIndex(([w])=>w===wave)??-1;
}
