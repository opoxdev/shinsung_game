import {ACHIEVEMENT_CATEGORIES,achievementView,achievementSummary} from './achievements.js';
import {TOWERS,RARITIES} from './data.js';
import {character} from './art.js';

const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rewardText=a=>a.reward.tower?'신화 타워 · '+TOWERS[a.reward.tower].name:
  [a.reward.coins?'◈ '+fmt(a.reward.coins):'',a.reward.xp?'+'+fmt(a.reward.xp)+' XP':''].filter(Boolean).join(' · ');
function questCard(a){
  const color=RARITIES[a.grade]?.color||'#9ce8ce';
  const ready=a.status==='ready',done=a.status==='claimed';
  const pct=Math.round(a.progress/a.goal*100);
  const progress=a.goal>=1000?fmt(a.progress)+' / '+fmt(a.goal):a.progress+' / '+a.goal;
  const award=a.reward.tower?'<div class="achievement-tower">'+character(a.reward.tower)+'</div>':'<span class="achievement-emblem" aria-hidden="true">'+
    (ACHIEVEMENT_CATEGORIES.find(c=>c.id===a.category)?.icon||'✦')+'</span>';
  return '<article class="achievement-card '+a.status+'" style="--achievement-color:'+color+'">'+
    '<div class="achievement-card-illustration">'+award+'</div>'+
    '<div class="achievement-card-info"><div class="achievement-card-eyebrow"><span>'+escape(RARITIES[a.grade]?.name||a.grade)+'</span><span>'+
      (done?'✓ 수령 완료':ready?'✦ 달성 완료':'진행 중')+'</span></div>'+
    '<h3>'+escape(a.title)+'</h3><p>'+escape(a.description)+'</p>'+
    '<div class="achievement-card-progress"><div class="achievement-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+a.goal+'" aria-valuenow="'+a.progress+'" aria-label="'+escape(a.title)+' 진행률"><i style="width:'+pct+'%"></i></div><small>'+progress+'</small></div>'+
    '<div class="achievement-card-bottom"><span class="achievement-reward">'+escape(rewardText(a))+'</span>'+
    (done?'<span class="achievement-received">수령함 ✓</span>':ready?
    '<button class="achievement-claim" data-action="achievementClaim" data-id="'+a.id+'">보상 받기</button>':
    a.reward.tower?'<button class="achievement-prepare" data-action="achievementPrepare" data-id="'+a.id+'">도전하기 ↗</button>':'')+
    '</div></div></article>';
}
export function achievementPageMarkup(profile,filter='all'){
  const list=achievementView(profile),summary=achievementSummary(profile);
  const valid=['all','ready',...ACHIEVEMENT_CATEGORIES.map(c=>c.id)];
  if(!valid.includes(filter))filter='all';
  const display=list.filter(a=>filter==='all'||(filter==='ready'?a.status==='ready':a.category===filter));
  const ratio=Math.round(summary.progress/Math.max(1,summary.total)*100);
  return '<section class="achievement-page">'+
    '<header class="achievement-hero"><div><span class="eyebrow">ACHIEVEMENT RECORDS · 영구 도전</span><h1>수호자의 기록 <span>✦</span></h1>'+
    '<p>전투와 수집의 발자취를 남기고, 달성한 도전과제의 보상을 수령하세요. 진행도와 보상은 계정에 저장됩니다.</p>'+
    '<div class="achievement-hero-actions"><button data-action="achievementFilter" data-id="ready">받을 보상 '+summary.ready+'개 확인</button><button data-action="achievementFilter" data-id="all">전체 보기</button></div></div>'+
    '<div class="achievement-hero-stats"><strong>'+summary.progress+'<small> / '+summary.total+'</small></strong><span>달성한 도전과제</span>'+
    '<div class="achievement-progress-bar hero" role="progressbar" aria-valuemin="0" aria-valuemax="'+summary.total+'" aria-valuenow="'+summary.progress+'"><i style="width:'+ratio+'%"></i></div>'+
    '<span>보상 수령 '+summary.done+'개 · 수령 가능 '+summary.ready+'개</span></div></header>'+
    '<nav class="achievement-tabs" aria-label="도전과제 분류">'+
    [['all','전체','★'],['ready','수령 가능','◈'],...ACHIEVEMENT_CATEGORIES.map(c=>[c.id,c.name,c.icon])]
      .map(([id,name,icon])=>'<button type="button" class="'+(filter===id?'selected':'')+'" data-action="achievementFilter" data-id="'+id+'"><span>'+icon+'</span>'+name+
      '<small>'+(id==='all'?list.length:id==='ready'?summary.ready:list.filter(a=>a.category===id).length)+'</small></button>').join('')+'</nav>'+
    '<div class="achievement-section-heading"><div><span class="eyebrow">'+escape(filter==='all'?'ALL CHALLENGES':filter==='ready'?'CLAIMABLE REWARDS':ACHIEVEMENT_CATEGORIES.find(c=>c.id===filter)?.description||'')+'</span>'+
    '<h2>'+escape(filter==='all'?'전체 도전과제':filter==='ready'?'보상 수령 대기':ACHIEVEMENT_CATEGORIES.find(c=>c.id===filter)?.name||'도전과제')+'</h2></div>'+
    '<span>'+display.length+'개 표시</span></div>'+
    (display.length?'<div class="achievement-grid">'+display.map(questCard).join('')+'</div>':
      '<div class="achievement-empty"><strong>현재 수령 가능한 보상이 없습니다.</strong><p>다른 도전과제에 도전해 새로운 보상을 획득해 보세요.</p><button data-action="achievementFilter" data-id="all">전체 도전과제 보기</button></div>')+
    '<p class="achievement-note">기존 소닉·오로라 보유 기록과 누적 승리 기록도 반영됩니다. 솔로 전투는 서버와 실시간 통신하지 않고, 종료 시 결과와 도전 기록을 함께 정산합니다.</p></section>';
}
