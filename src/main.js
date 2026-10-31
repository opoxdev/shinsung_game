import { MAPS, TOWERS, ENEMIES, DIFFICULTIES, MODES, PACKS, RARITIES, SKIN_STYLES, CRATES, BOSS_ABILITIES, starterProfile, skinCandidates, skinOdds } from './data.js';
import { evolutionAt } from './evolutions.js';
import { createMatch, tick, command, modifiers, towerStats, requiredVotes, rewardFor, applyReward, profileAction, pointOnPath, STEP } from './engine.js';
import { Renderer, portrait, landscape } from './render.js';
import { monsterPortrait } from './art.js';
import { Online } from './online.js';
import { MotionView } from './presentation.js';
import { matchmakingMarkup, matchmakingCards, waitingRoomMarkup } from './matchmaking.js';
import {adminPageMarkup} from './admin-panel.js';
const $=s=>document.querySelector(s), app=$('#app'), online=new Online();
const fmt=n=>Math.floor(n).toLocaleString('ko-KR');
const fmtHp=n=>Number.isFinite(n)?Number(Math.max(0,n).toFixed(Math.abs(n)<10?1:0)).toLocaleString('ko-KR'):'0';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={home:'⌂',towers:'▥',shop:'◇',pvp:'⚔',coop:'♟',events:'✧'};
let localProfile;
try{const raw=JSON.parse(localStorage.getItem('shinsung.profile.v1'));localProfile=raw?.schema===1&&Array.isArray(raw.owned)&&Array.isArray(raw.loadout)&&raw.loadout.length?raw:starterProfile();}catch{localProfile=starterProfile();}
let profile=localProfile,page='home',selectedTower='scout',shopTab='towers',filter='',rarityFilter='all';
let collectionTab='towers',selectedPack=null;
let isAdminSession=false;
let adminData={summary:null,listing:null,selected:null,audit:null,diagnostics:null,search:'',offset:0,busy:false,error:'',status:''};
let openCrateBusy=false,roomListBusy=false,roomListNext=0,hoverVisual=null;
let motion=new MotionView(),placementRevision=0;
function resetRenderer(){renderer?.dispose();renderer=null;}
function setText(selector,value){const el=$(selector);if(el&&el.textContent!==value)el.textContent=value;}
let config={map:'plains',difficulty:'easy',type:'solo',modes:[]};
let renderer,state=null,playerId='local',placement=null,paused=false,resultShown=false,accumulator=0,lastTime=0,lastHud=0;
let isOnlineMatch=false,room=null,onlineBusy=false,lastPulse=0,lastSnapshot=0,seenSnapshot=-1,seq=0,botClock=0,claimAfter=0;
function saveLocal(){try{localStorage.setItem('shinsung.profile.v1',JSON.stringify(localProfile));}catch{toast('브라우저 저장 공간을 사용할 수 없습니다.');}}
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function modal(content){renderer?.keys.clear();$('#modal-root').innerHTML=`<div class="scrim"><section class="modal" role="dialog" aria-modal="true"><button class="close" data-action="close" aria-label="닫기">×</button>${content}</section></div>`;$('#modal-root').querySelector('input,button:not(.close)')?.focus({preventScroll:true});}
function closeModal(){if(room&&!state)return;$('#modal-root').innerHTML='';if(!isOnlineMatch)paused=false;}
// Keep both the viewport and nested scroll areas steady when a tab, tower,
// filter or purchase re-renders its markup. Never resurrect focus-induced jumps.
function preserveScroll(){
  const selectors=['.content','.briefing','.tower-groups','.tower-detail','.shop-scroll','.pack-config-screen','.collection-list','.admin-user-list'];
  const positions=selectors.map(selector=>[selector,$(selector)?.scrollTop??0]);
  const x=window.scrollX,y=window.scrollY;
  return ()=>{
    for(const [selector,top] of positions){const el=$(selector);if(el)el.scrollTop=top;}
    if(window.scrollX!==x||window.scrollY!==y)window.scrollTo(x,y);
  };
}
function profileBar(){return `<div class="identity"><div class="insignia">S<span>D</span></div><div><b>${esc(profile.name)}</b><small>LV. ${Math.floor(profile.xp/400)+1} · ${online.user?'연결된 계정':'로컬 모험가'}</small></div></div><div class="wallet"><span class="coin">◈</span> ${fmt(profile.coins)} <small>COINS</small></div><button class="account" data-action="account">${online.user?'계정 관리':'계정 연결'} <span>↗</span></button>`;}
function loadout(inGame=false){return Array.from({length:5},(_,i)=>{const id=(inGame?state.players[playerId].loadout:profile.loadout)[i];return id?`<button class="loadout-slot ${placement===id?'selected':''}" data-action="${inGame?'selectPlace':'inspect'}" data-id="${id}" style="--rarity:${RARITIES[TOWERS[id].rarity].color}"><span class="slot-number">0${i+1}</span>${portrait(id,profile.equippedSkins[id])}<span class="slot-name">${TOWERS[id].name}</span><strong>₩ ${TOWERS[id].cost}</strong></button>`:`<button class="loadout-slot empty" data-action="${inGame?'noop':'nav'}" data-id="towers"><span class="slot-number">0${i+1}</span><span>＋</span><small>빈 슬롯</small></button>`;}).join('');}
function shell(){
  const restore=preserveScroll();
  app.innerHTML=`<div class="shell"><header class="topbar"><a class="brand" href="#" data-action="nav" data-id="home"><span class="brand-symbol">S</span><div>신성 디펜스<small>SHINSUNG DEFENSE</small></div></a><div class="build-label">ALPHA <span>01</span></div><div class="profilebar">${profileBar()}</div></header><aside class="sidebar"><div class="nav-caption">PLAY</div>${['home','towers','shop'].map(id=>`<button class="nav-item ${page===id?'active':''}" data-action="nav" data-id="${id}"><span>${icons[id]}</span>${{home:'로비',towers:'타워 구성',shop:'상점'}[id]}<i>›</i></button>`).join('')}<div class="nav-caption second">친구들과 더 재미있게</div><button class="nav-item" data-action="pvp"><span>⚔</span>대전 · PVP<i>›</i></button><button class="nav-item" data-action="coop"><span>♟</span>친구와 함께<i>›</i></button><button class="nav-item" data-action="events"><span>✧</span>도전 과제<i>›</i></button>${isAdminSession?`<div class="nav-caption second">ADMIN</div><button class="nav-item ${page==='admin'?'active':''}" data-action="adminOpen"><span>⚙</span>관리자 패널<i>›</i></button>`:''}<div class="sidebar-bottom"><span class="status-dot"></span>${online.user?'ONLINE ACCOUNT':'LOCAL PLAY'}<small>모으고, 키우고,<br>함께 지켜내자!</small><button data-action="help">조작 안내 <span>?</span></button></div></aside><main class="content" id="content"></main><footer class="loadout-bar"><div class="loadout-label"><span>MY TEAM</span><b>내 팀</b><small>${profile.loadout.length} / 5 SLOTS</small></div><div class="loadout-slots">${loadout()}</div><div class="footer-note">${online.user?'서버 계정 진행도':'진행도는 이 브라우저에 저장됩니다.'}<br><span>BUILD 0.9.4 · PLAY WITH FRIENDS</span></div></footer></div>`;
  if(page==='home')home();else if(page==='towers')collection();else if(page==='admin'&&isAdminSession)adminRender();else shop();
  restore();
}

function adminRender(){
  if(!isAdminSession){page='home';shell();return;}
  const target=$('#content');if(!target)return;
  const saved=preserveScroll();
  target.innerHTML=adminPageMarkup(adminData);
  saved();
}
async function adminLoad({selected=true}={}){
  if(!isAdminSession||!online.user)return;
  adminData.busy=true;adminData.error='';adminRender();
  try{
    const [summary,listing,audit]=await Promise.all([
      online.call('adminOverview'),
      online.call('adminUsers',{search:adminData.search,offset:adminData.offset}),
      online.call('adminAudit')
    ]);
    adminData.summary=summary;adminData.listing=listing;adminData.audit=audit;
    if(selected&&adminData.selected){
      const match=listing.items.find(u=>u.uid===adminData.selected.uid);
      adminData.selected=match?await online.call('adminUser',{uid:match.uid}):null;
    }
  }catch(e){adminData.error='관리자 정보 조회 실패: '+e.message;}
  finally{adminData.busy=false;adminRender();}
}
async function adminSelect(uid){
  if(adminData.busy||!isAdminSession)return;
  try{adminData.selected=await online.call('adminUser',{uid});adminData.error='';adminRender();}
  catch(e){adminData.error=e.message;adminRender();}
}
async function adminChange(operation,details={},uid=adminData.selected?.uid){
  if(!isAdminSession||adminData.busy||!uid)return;
  const labels={coins:'코인 변경',xp:'경험치 변경',grantTower:'타워 지급',revokeTower:'타워 회수',grantAllSelf:'전체 타워 테스트 해금',ban:'계정 제재',unban:'제재 해제'};
  const target=adminData.selected?.uid===uid?adminData.selected.name:uid;
  if(!window.confirm(target+' 계정에 '+labels[operation]+' 작업을 실행합니까?'))return;
  adminData.busy=true;adminData.error='';adminData.status='';adminRender();
  try{
    const result=await online.call('adminChange',{uid,operation,...details});
    adminData.selected=result.profile;
    adminData.status=labels[operation]+' 완료'+(result.auditWarning?' · '+result.auditWarning:'')+(result.kickWarning?' · '+result.kickWarning:'');
    if(uid===online.user?.uid)profile=await online.call('profile');
    const [summary,listing,audit]=await Promise.all([
      online.call('adminOverview'),
      online.call('adminUsers',{search:adminData.search,offset:adminData.offset}),
      online.call('adminAudit')
    ]);
    Object.assign(adminData,{summary,listing,audit});
  }catch(e){adminData.error=labels[operation]+' 실패: '+e.message;}
  finally{adminData.busy=false;adminRender();}
}

function home(){
  const restore=preserveScroll();
  const map=MAPS.find(m=>m.id===config.map),diff=DIFFICULTIES.find(d=>d.id===config.difficulty),mods=modifiers(config);
  $('#content').innerHTML=`<div class="page-heading lobby-heading"><div><span class="eyebrow">모험을 떠날 시간!</span><h1>어디부터 지켜볼까?</h1></div><div class="edition">5개의 세계 · 6개의 난이도<b>너만의 최강 팀을 만들어봐!</b></div></div><div class="mission-layout"><section class="map-stage"><div class="world-art">${landscape(map)}</div><div class="floating-motes"><i></i><i></i><i></i><i></i><i></i></div><div class="hero-team"><div>${portrait('summoner')}</div><div>${portrait('blade')}</div><div>${portrait('scout')}</div></div><div class="stage-top"><span class="tag">${config.type==='solo'?'★ 모험 모드':config.type==='pvp'?'⚔ 대전':'친구와 함께'}</span><button class="stage-index" data-action="mapPreview">실제 맵 보기 ↗</button></div><div class="map-copy"><span class="eyebrow">${map.tag}</span><h2>${map.name}</h2><p>${map.desc}</p></div><div class="map-picker">${MAPS.map((m,i)=>`<button class="map-pick ${m.id===map.id?'selected':''}" style="--map:${m.color}" data-action="map" data-id="${m.id}"><span>0${i+1}</span><div class="map-mini">${landscape(m)}</div><b>${m.name}</b></button>`).join('')}</div></section><section class="briefing"><div class="panel-title"><span>⚑ 도전 준비!</span><span>★</span></div><h2>게임 설정</h2><div class="field-label">01 <b>난이도</b><span>${diff.waves.length} WAVES</span></div><div class="difficulties">${DIFFICULTIES.map(d=>`<button class="difficulty ${d.id===diff.id?'selected':''}" style="--diff:${d.color}" data-action="difficulty" data-id="${d.id}" title="시작 자금 ₩ ${fmt(d.startMoney)}">${d.name}<span>${'Ⅰ'.repeat(Math.min(3,DIFFICULTIES.indexOf(d)+1))}</span></button>`).join('')}</div><div class="field-label">02 <b>추가 모드</b><span>중복 선택 가능</span></div><div class="modes">${Object.entries(MODES).map(([id,m])=>`<button title="${m.desc}" class="mode ${config.modes.includes(id)?'selected':''}" data-action="mode" data-id="${id}"><span class="checkbox">${config.modes.includes(id)?'✓':''}</span>${m.name}<b>×${m.reward}</b></button>`).join('')}</div><div class="reward-preview"><span>클리어 보상<small>모드 배수 ×${mods.reward.toFixed(2)}</small></span><b><i>◈</i> ${fmt(diff.reward*mods.reward)}</b></div><p class="defeat-reward-note">방어 실패 시 클리어 보너스를 제외한 보상 × 50% × 도달 웨이브 비율 지급</p><button class="deploy" data-action="start">게임 시작 <span>→</span></button><div class="deploy-note">${online.user?'서버 검증 솔로':'로컬 플레이'} · 시작 자금 ₩ ${fmt(diff.startMoney)} · 최대 ${mods.cap}기</div></section></div>`;
  resetRenderer();
  restore();
}
function towerCard(id){const t=TOWERS[id],owned=profile.owned.includes(id);return `<button class="tower-card ${id===selectedTower?'selected':''} ${owned?'':'locked'} ${t.rarity}" style="--rarity:${RARITIES[t.rarity].color}" data-action="inspect" data-id="${id}"><div class="card-top"><span>${owned?profile.loadout.includes(id)?'장착 중':'보유':'미보유'}</span><b>${owned?'◇':'⊘'}</b></div>${portrait(id,profile.equippedSkins[id])}<b class="card-name">${t.name}</b><small>${t.role} · 설치 ₩ ${fmt(t.cost)}</small><div class="card-line"></div></button>`;}
function collectionHeader(){
  return `<div class="page-heading"><div><span class="eyebrow">TEAM / LOADOUT</span><h1>타워 구성</h1></div><div class="edition">COLLECTED <b>${profile.owned.length} / ${Object.keys(TOWERS).length}</b></div></div>
    <div class="collection-switch" role="group" aria-label="타워 구성 종류">
      <button type="button" class="${collectionTab==='towers'?'selected':''}" data-action="setCollectionTab" data-id="towers" aria-pressed="${collectionTab==='towers'}">✦ 타워 컬렉션 <small>${profile.loadout.length}/5 장착</small></button>
      <button type="button" class="${collectionTab==='packs'?'selected':''}" data-action="setCollectionTab" data-id="packs" aria-pressed="${collectionTab==='packs'}">☣ 몬스터 팩 <small>${PACKS[profile.pack]?.name||PACKS.basic.name}</small></button>
    </div>`;
}
function collection(){
  const restore=preserveScroll();
  if(rarityFilter!=='all'&&!Object.hasOwn(RARITIES,rarityFilter))rarityFilter='all';
  resetRenderer();
  if(collectionTab==='packs'){
    $('#content').innerHTML=collectionHeader()+packLoadout();
    restore();
    return;
  }
  const t=TOWERS[selectedTower],owned=profile.owned.includes(selectedTower);
  $('#content').innerHTML=collectionHeader()+`<div class="collection-layout"><section class="collection-list"><div class="collection-toolbar"><input id="tower-search" placeholder="타워 이름으로 검색" value="${esc(filter)}" aria-label="타워 검색"><select id="rarity-filter" aria-label="등급 필터"><option value="all">모든 등급</option>${Object.entries(RARITIES).map(([id,r])=>`<option value="${id}" ${id===rarityFilter?'selected':''}>${r.name}</option>`).join('')}</select><span>장착 ${profile.loadout.length}/5</span></div><div class="tower-groups">${Object.entries(RARITIES).map(([r,v])=>{const ids=Object.keys(TOWERS).filter(id=>TOWERS[id].rarity===r&&(rarityFilter==='all'||rarityFilter===r)&&TOWERS[id].name.includes(filter));return ids.length?`<div class="rarity-title" style="color:${v.color}">${v.name}<span></span><small>${ids.length}</small></div><div class="tower-grid">${ids.map(towerCard).join('')}</div>`:'';}).join('')||'<p class="empty-message">검색 결과가 없습니다.</p>'}</div></section><section class="tower-detail tier-${t.rarity}" style="--rarity:${RARITIES[t.rarity].color}"><span class="eyebrow">${RARITIES[t.rarity].name} / ${t.role}</span><h2>${t.name}</h2><div class="detail-art">${portrait(selectedTower,profile.equippedSkins[selectedTower])}<span class="art-ring"></span></div><div class="stat-grid"><div>배치 비용<b>₩ ${t.cost}</b></div><div>피해량<b>${t.damage||(t.income?'수입 +'+t.income:'지원')}</b></div><div>공격 간격<b>${t.interval}s</b></div><div>사거리<b>${t.range}</b></div></div><p>${t.desc}</p><p class="tier-hint">등급은 배치 비용이나 사용 시기를 결정하지 않습니다. 각 타워의 역할과 강화 경로를 확인하세요.</p><div class="detail-actions"><button class="primary" data-action="equip" data-id="${selectedTower}" ${owned?'':'disabled'}>${profile.loadout.includes(selectedTower)?'장착 해제':'장착하기'}</button><button data-action="skin" data-id="${selectedTower}" ${owned?'':'disabled'}>스킨</button></div>${!owned?`<small class="unlock-note">${t.price===null?(selectedTower==='aurora'?'파멸 + 엘리트 모드 클리어로 획득':'익스트림 이상 + 슈퍼소닉 클리어로 획득'):'상점에서 '+fmt(t.price)+' 코인으로 획득'}</small>`:''}</section></div>`;
  restore();
}
function monsterList(p){return `<div class="monster-roster">${p.monsters.map(([id,cost,cd])=>{const e=ENEMIES[id],tags=[e.shield?'방패':null,e.heal?'치유':null,e.regen?'재생':null,e.onDeath?'분열':null,e.speed>=110?'속공':null,e.hp>=10000?'보스':null].filter(Boolean);return `<div class="monster-portrait" title="${esc(e.name)}"><div class="monster-art">${monsterPortrait(id)}</div><b>${esc(e.name)}</b><small>₩ ${fmt(cost)} / ${cd}s</small><span>${tags.join(' · ')||'기본'}</span></div>`}).join('')}</div>`;}
const PACK_DESCRIPTIONS={
  basic:'가장 기본적인 좀비 조합. 빠른 적과 튼튼한 적을 균형 있게 활용합니다.',
  lab:'강화 실험체와 기계형 적으로 구성된 고압박 몬스터 팩입니다.',
  twilight:'유령·방패·분열·지원형 적을 조합해 상대의 대응을 흔듭니다.',
  elements:'초고속 적과 원소 특성 적을 조합한 전격전 몬스터 팩입니다.',
  apocalypse:'거대 보스와 고내구 적을 집중적으로 보내는 최상위 몬스터 팩입니다.'
};
function packRole(id){
  const e=ENEMIES[id];
  if(e.heal)return '지원';
  if(e.onDeath)return '분열';
  if(e.shield)return '방패';
  if(e.speed>=100)return '속공';
  if(e.hp>=1000||e.size>=21)return '보스';
  if(e.armor||e.hp>=120)return '탱커';
  return '기본';
}
function packLoadout(){
  const id=selectedPack&&Object.hasOwn(PACKS,selectedPack)?selectedPack:profile.pack;
  const selected=Object.hasOwn(PACKS,id)?id:'basic',p=PACKS[selected];
  const owned=profile.packs.includes(selected),equipped=profile.pack===selected;
  const packButtons=Object.entries(PACKS).map(([key,value])=>{
    const has=profile.packs.includes(key),active=selected===key;
    return `<button type="button" class="pack-choice ${active?'selected':''} ${profile.pack===key?'is-equipped':''}" data-action="previewPack" data-id="${key}" aria-pressed="${active}">
      <span class="pack-choice-art">${value.monsters.slice(0,3).map(([enemy])=>monsterPortrait(enemy)).join('')}</span>
      <span class="pack-choice-copy"><strong>${value.name}</strong><small>${profile.pack===key?'✓ 장착 중':has?'보유 중':'🔒 미보유'}</small></span>
    </button>`}).join('');
  return `<section class="pack-config-screen" aria-label="PvP 몬스터 팩 구성">
    <div class="pack-config-title"><div><span class="eyebrow">PVP MONSTER LOADOUT</span><h2>몬스터 팩 구성</h2><p>상점에서 구매하고, 이 화면에서 장착하세요. 팩을 눌러 몬스터를 미리 볼 수 있습니다.</p></div><span class="pack-selected-label">현재 장착 · ${PACKS[profile.pack]?.name||PACKS.basic.name}</span></div>
    <div class="pack-choice-panel"><h3>몬스터 팩 선택 <small>${profile.packs.length} / ${Object.keys(PACKS).length} 보유</small></h3><div class="pack-choice-list">${packButtons}</div></div>
    <div class="pack-detail-panel">
      <div class="pack-detail-art">${p.monsters.slice(0,3).map(([enemy])=>monsterPortrait(enemy)).join('')}</div>
      <div class="pack-detail-copy"><span class="eyebrow">${owned?'OWNED PACK':'LOCKED PACK'}</span><h3>${p.name}</h3><p>${PACK_DESCRIPTIONS[selected]}</p>
        <div class="pack-detail-action">${equipped?'<span class="pack-equipped-badge">✓ 현재 장착 중</span>':owned?`<button type="button" class="primary" data-action="pack" data-id="${selected}">이 팩 장착하기</button>`:`<button type="button" class="primary" data-action="visitPackShop" data-id="${selected}">상점에서 구매 · ◈ ${fmt(p.price)}</button>`}</div>
      </div>
      <dl class="pack-detail-metrics"><div><dt>몬스터 종류</dt><dd>${p.monsters.length}종</dd></div><div><dt>등장 역할</dt><dd>${[...new Set(p.monsters.map(([enemy])=>packRole(enemy)))].slice(0,4).join(' · ')}</dd></div><div><dt>팩 상태</dt><dd>${equipped?'장착 중':owned?'장착 가능':'미보유'}</dd></div></dl>
    </div>
    <div class="pack-monster-heading"><h3>${p.name} · 몬스터 목록</h3><small>상대에게 소환하는 적 · 비용과 대기시간</small></div>
    <div class="pack-monster-grid">${p.monsters.map(([enemy,cost,cooldown])=>{
      const e=ENEMIES[enemy],role=packRole(enemy);
      return `<article class="pack-monster-card"><div class="pack-monster-art">${monsterPortrait(enemy)}</div><b>${e.name}</b><span class="pack-monster-role">${role}</span><div class="pack-monster-meta"><span>◈ ${fmt(cost)}</span><span>◷ ${cooldown}s</span></div></article>`;
    }).join('')}</div>
  </section>`;
}
function crateView(){
  return `<div class="crate-catalog">${Object.entries(CRATES).map(([id,c])=>{
    const odds=skinOdds(c,profile.owned),chance=Object.fromEntries(odds.map(x=>[x.style,x.percent]));
    const possible=c.styles.reduce((n,style)=>n+skinCandidates(style,profile.owned).length,0);
    const owned=c.styles.reduce((n,style)=>n+skinCandidates(style,profile.owned).filter(t=>profile.skins?.[t+':'+style]).length,0);
    const pity=profile.cratePities?.[id]||0,openable=odds.length>0;
    return `<article class="crate-offer" style="--crate-color:${c.color}">
      <div class="crate-offer-head"><span class="crate-offer-icon">${c.icon}</span><div><span class="eyebrow">${c.theme} · THEMED SKIN CRATE</span><h2>${c.name}</h2><p>${c.description}</p></div></div>
      <div class="crate-offer-odds">${c.styles.map(style=>{
        const spec=SKIN_STYLES[style],idPreview=skinCandidates(style,profile.owned)[0]||spec.targets[0];
        const rate=chance[style]||0;
        return `<div class="crate-cosmetic-choice ${rate?'':'skin-locked'}" style="--rarity:${spec.color}">
          <div class="crate-skin-preview">${portrait(idPreview,style)}</div>
          <div class="crate-cosmetic-copy"><b>${spec.name}</b><small>${RARITIES[spec.rarity].name} · ${rate.toFixed(1)}%</small>
          <span title="${spec.targets.map(t=>TOWERS[t].name).join(', ')}">${spec.targets.map(t=>TOWERS[t].name).join(' · ')}</span>
          ${rate?'':'<em>해당 타워 영입 시 등장</em>'}</div>
        </div>`;
      }).join('')}</div>
      <div class="crate-offer-info"><strong>◈ ${fmt(c.price)} <small>/ 1회</small></strong><span>내 타워의 보유 스킨 ${owned}/${possible} · 중복 ${pity}/10</span></div>
      <div class="crate-actions"><button class="buy" data-action="openCrate" data-id="${id}:1" ${!openable||profile.coins<c.price?'disabled':''}>1회 열기 · ◈ ${fmt(c.price)}</button><button class="buy primary" data-action="openCrate" data-id="${id}:10" ${!openable||profile.coins<c.price*10?'disabled':''}>10회 열기 · ◈ ${fmt(c.price*10)}</button></div>
      ${!openable?'<p class="crate-eligibility">이 상자 전용 스킨을 사용할 타워를 먼저 영입하세요.</p>':''}
    </article>`;
  }).join('')}</div><p class="crate-catalog-note">표시 확률은 현재 보유 타워 기준의 일반 개봉 확률입니다. 타워를 영입하면 출현 대상과 확률이 달라지며, 10연속 중복 보장 발동 시 미보유 스킨 대상으로 별도 재계산됩니다. 전투 성능은 변하지 않습니다.</p>`;
}
function shop(){const restore=preserveScroll();resetRenderer();$('#content').innerHTML=`<div class="page-heading"><div><span class="eyebrow">SHOP</span><h1>어떤 친구를 데려갈까?<span>.</span></h1></div><div class="edition">EARN. COLLECT. DEFEND.<b>플레이로 얻는 보급품</b></div></div><div class="shop-tabs">${[['towers','타워'],['packs','몬스터 팩'],['crates','스킨 상자']].map(([id,name])=>`<button class="${shopTab===id?'selected':''}" data-action="shopTab" data-id="${id}">${name}</button>`).join('')}<span>등급 ≠ 설치 가격 · 역할별 선택</span></div><div class="shop-scroll">${shopTab==='towers'?`<div class="featured">${['starseed','hunter'].map(id=>{const t=TOWERS[id];return `<article class="feature-card" style="--rarity:${RARITIES[t.rarity].color}"><div><span class="eyebrow">${id==='starseed'?'신화지만 초반부터 활약':'희귀지만 후반 보스 저격'}</span><h2>${t.name}</h2><p>${t.desc}</p><p class="battle-cost">전투 배치 ₩ ${fmt(t.cost)} · ${RARITIES[t.rarity].name}</p><button class="buy" data-action="buyTower" data-id="${id}" ${profile.owned.includes(id)?'disabled':''}>${profile.owned.includes(id)?'보유 중':'◈ '+fmt(t.price)+' · 영입'}</button></div>${portrait(id)}</article>`;}).join('')}</div><div class="shop-grid">${Object.entries(TOWERS).filter(([id,t])=>!['starseed','hunter'].includes(id)&&t.price>0).map(([id,t])=>`<article class="supply-card" style="--rarity:${RARITIES[t.rarity].color}">${portrait(id)}<div><small>${RARITIES[t.rarity].name}</small><h3>${t.name}</h3><p>${t.role} · 설치 ₩ ${fmt(t.cost)}</p><button class="buy" data-action="buyTower" data-id="${id}" ${profile.owned.includes(id)?'disabled':''}>${profile.owned.includes(id)?'보유 중':'◈ '+fmt(t.price)}</button></div></article>`).join('')}</div>`:shopTab==='packs'?`<div class="pack-grid">${Object.entries(PACKS).map(([id,p])=>`<article class="pack-card"><span class="eyebrow">PVP MONSTER PACK</span><h2>${p.name}</h2>${monsterList(p)}<button class="buy" data-action="buyPack" data-id="${id}" ${profile.packs.includes(id)?'disabled':''}>${profile.packs.includes(id)?'✓ 보유 · 구성탭에서 장착':'◈ '+fmt(p.price)+' · 구매'}</button></article>`).join('')}</div>`:crateView()}</div>`;restore();}
async function mutate(a,reveal=false){try{if(online.user){profile=await online.call('profileAction',a);}else{profileAction(profile,a);saveLocal();}shell();if(reveal&&profile.lastCrate){const rolls=profile.lastCrate.rolls;const opened=profile.lastCrate.crate;modal(`<span class="eyebrow">CRATE REVEAL</span><h2>✦ 상자 개봉 결과 ✦</h2><div class="crate-results">${rolls.map((r,i)=>`<div class="crate-result" style="--rarity:${SKIN_STYLES[r.style].color};animation-delay:${i*.075}s"><span>${portrait(r.id,r.style)}</span><b>${TOWERS[r.id].name}</b><small>${RARITIES[SKIN_STYLES[r.style].rarity].name} · ${SKIN_STYLES[r.style].name} 스킨</small><strong>${r.duplicate?'중복 · +◈'+fmt(r.refund):r.guaranteed?'보장 획득':'NEW 획득!'}</strong></div>`).join('')}</div><p>획득한 스킨은 타워 구성 → 스킨에서 장착할 수 있습니다.</p><div class="crate-actions"><button class="primary" data-action="openCrate" data-id="${opened}:1">같은 상자 한 번 더 열기</button><button data-action="close">확인</button></div>`);}}catch(e){toast(e.message);}}
function account(){if(online.user){modal(`<span class="eyebrow">CONNECTED ACCOUNT</span><h2>${esc(profile.name)}</h2><p>${esc(online.user.email)}</p><p>계정 코인과 타워는 Cloudflare D1에 저장됩니다. 로컬 훈련 기록은 별도로 유지됩니다.</p>${profile.activeRoom?`<button class="primary wide" data-action="resumeRoom">참가 중인 방 재접속 · ${esc(profile.activeRoom)}</button><button class="wide secondary" data-action="abandonRoom">만료되거나 중단된 방 정리</button>`:''}<button class="wide secondary" data-action="diagnostic">연결 상태 점검</button><button class="wide secondary" data-action="logout">로그아웃</button>`);return;}
  if(!online.enabled){modal('<span class="eyebrow">OFFLINE BUILD</span><h2>계정 서버 연결 준비</h2><p>현재는 로컬 플레이 버전입니다. 이메일 계정·협동·온라인 PvP를 사용하려면 Firebase 로그인과 무료 Cloudflare Worker를 연결해야 합니다.</p><p>프로젝트의 <b>DEPLOY.md</b>에 설정 순서가 있습니다. 배포 파일은 <b>dist/apps-script</b>에 생성됩니다.</p><button class="primary" data-action="close">로컬 플레이 계속</button>');return;}
  modal('<span class="eyebrow">SHINSUNG ACCOUNT</span><h2>모험가 계정 연결</h2><form id="auth-form"><label>이메일<input name="email" type="email" autocomplete="email" required></label><label>비밀번호<input name="password" type="password" minlength="8" autocomplete="current-password" required></label><div class="detail-actions"><button class="primary" type="submit" name="mode" value="login">로그인</button><button type="submit" name="mode" value="signup">회원가입</button></div><p id="auth-error" role="alert"></p></form>');}
function help(){modal('<span class="eyebrow">FIELD MANUAL</span><h2>모험가 조작 안내</h2><div class="help-grid"><b>W A S D</b><span>카메라 이동</span><b>마우스 휠</b><span>줌 인 / 아웃</span><b>1 ~ 5</b><span>장착 타워 선택</span><b>클릭</b><span>타워 설치 / 배치된 타워 선택</span><b>Q / 우클릭</b><span>설치 취소</span><b>Space</b><span>웨이브 스킵 / 투표</span><b>Esc</b><span>전투 메뉴</span></div><p>도로 위에는 설치할 수 없습니다. 협동 플레이의 타워 한도는 필드 전체 기준입니다. 스킵해도 남아 있는 적은 사라지지 않습니다.</p>');}

let pendingLobbyMode=null,pendingJoinCode=null;
function special(type){
  if(!['pvp','coop'].includes(type))return;
  config.type=type;
  modal(matchmakingMarkup(type,config,{loggedIn:!!online.user,activeRoom:profile.activeRoom,enabled:online.enabled}));
  roomListNext=0;
  void refreshRooms();
}
async function refreshRooms(){
  const target=$('#public-room-list');
  if(!target||roomListBusy)return;
  const mode=target.dataset.mode;
  if(!['pvp','coop'].includes(mode))return;
  roomListBusy=true;
  roomListNext=performance.now()+8500;
  const refreshButton=document.querySelector('.mm-refresh');
  if(refreshButton)refreshButton.disabled=true;
  try{
    const rooms=await online.publicRooms(mode);
    if($('#public-room-list')!==target)return;
    // A room must be user-created, still waiting and belong to this tab.
    const list=rooms.filter(r=>r.type===mode&&r.count>0&&r.count<r.capacity);
    target.innerHTML=matchmakingCards(list,mode,!!online.user);
    setText('#room-count',String(list.length));
  }catch(e){
    if($('#public-room-list')===target){
      target.innerHTML='<div class="mm-state mm-error"><b>방 목록에 연결하지 못했습니다</b><p>'+esc(e.message)+'</p><button type="button" data-action="refreshRooms">다시 시도 ↻</button></div>';
      setText('#room-count','!');
    }
  }finally{
    roomListBusy=false;
    if(refreshButton?.isConnected)refreshButton.disabled=false;
  }
}
function startLocal(type='solo'){
  online.stop();room=null;isOnlineMatch=false;profile=localProfile;playerId='local';config.type=type;
  const players=[{id:'local',profile}];if(type==='pvp')players.push({id:'bot',profile:{...starterProfile('훈련 상대'),loadout:['scout','blade','soldier'],pack:'basic'}});
  state=createMatch(config,players);beginGame();
}
function beginGame(){motion=new MotionView();placementRevision++;placement=null;resultShown=false;paused=false;accumulator=0;botClock=0;claimAfter=0;previousWave=0;$('#modal-root').innerHTML='';gameUI();}
function gameUI(){
  const p=state.players[playerId];app.innerHTML=`<div class="battle"><canvas id="battlefield" aria-label="타워 디펜스 전장"></canvas><div class="enemy-tooltip" id="enemy-tooltip" role="status" aria-live="off"></div><div class="battle-top"><button class="battle-brand" data-action="battleMenu">S<span>신성 디펜스</span>☰</button><div class="battle-stats"><div><small>기지 내구도</small><b id="base-hp"></b></div>${state.config.type==='pvp'?'<div><small>상대 내구도</small><b id="opponent-hp"></b></div>':''}<div><small>전투 자금</small><b class="gold" id="cash"></b></div><div><small>배치 타워</small><b id="tower-count"></b></div></div><div class="wave-panel"><small>${DIFFICULTIES.find(d=>d.id===state.config.difficulty).name} · ${isOnlineMatch?'SERVER':'LOCAL'}</small><b id="wave-label"></b><span id="wave-intel" class="wave-intel"></span><span id="wave-clock"></span></div></div><div class="battle-hints"><span>WASD 이동</span><span>E 확대 · R 축소 · 휠 줌</span><span>1–5 배치</span><span>Q 취소</span>${state.config.type==='pvp'?'<button data-action="field">필드 전환 ⇄</button>':''}<span id="connection-status"></span></div><div class="wave-notice" id="wave-notice"></div><aside id="tower-inspector" class="battle-inspector"></aside>${state.config.type==='pvp'?`<div class="monster-tray"><span>상대에게 보내기 / ${PACKS[p.pack].name}</span>${PACKS[p.pack].monsters.map(([id,cost])=>`<button data-action="send" data-id="${id}" id="send-${id}" style="--enemy:${ENEMIES[id].color}"><i>▣</i><b>${ENEMIES[id].name}</b><small>₩ ${cost}</small></button>`).join('')}</div>`:''}<div class="battle-bottom"><div class="battle-tools"><button data-action="zoomOut" aria-label="축소">−</button><button data-action="zoomReset" aria-label="카메라 초기화">⌾</button><button data-action="zoomIn" aria-label="확대">＋</button><button data-action="cancelPlace" aria-label="배치 취소">취소</button></div><div class="loadout-slots">${loadout(true)}</div><button class="skip-button" data-action="skip" id="skip">웨이브 스킵</button></div><div class="placement-hint" id="placement-hint"></div></div>`;
  resetRenderer();renderer=new Renderer($('#battlefield'));renderer.camera.x=900+p.field*2100;renderer.camera.zoom=1.18;
  const c=$('#battlefield');c.addEventListener('wheel',e=>{e.preventDefault();renderer.zoomBy(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.002));},{passive:false});
  // One-finger drag pans the field when not deploying; taps still select a tower.
  let drag=null,ignoreTap=false;
  c.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch')return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    c.setPointerCapture?.(e.pointerId);
  });
  c.addEventListener('pointermove',e=>{
    if(drag&&e.pointerId===drag.id&&!placement){
      const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;
      if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>12)drag.moved=true;
      if(drag.moved){
        renderer.camera.x-=dx/(renderer.scale||1);
        renderer.camera.y-=dy/(renderer.scale||1);
        renderer.camera.x=Math.max(0,Math.min(state.config.type==='pvp'?4200:1800,renderer.camera.x));
        renderer.camera.y=Math.max(0,Math.min(1100,renderer.camera.y));
      }
      drag.lastX=e.clientX;drag.lastY=e.clientY;
    }
    const r=c.getBoundingClientRect();renderer.pointerScreen={x:e.clientX-r.left,y:e.clientY-r.top};renderer.pointer=renderer.screenToWorld(renderer.pointerScreen.x,renderer.pointerScreen.y);
    renderer.hoverScreen=e.pointerType==='mouse'||e.pointerType==='pen'?{x:e.clientX-r.left,y:e.clientY-r.top}:null;
  });
  c.addEventListener('pointerleave',()=>{renderer.hoverScreen=null;const el=$('#enemy-tooltip');if(el)el.classList.remove('visible');});
  c.addEventListener('pointerup',e=>{if(drag&&drag.id===e.pointerId){ignoreTap=drag.moved;drag=null;}});
  c.addEventListener('pointercancel',()=>{drag=null;});
  c.addEventListener('click',async e=>{if(ignoreTap){ignoreTap=false;return;}const r=c.getBoundingClientRect(),point=renderer.screenToWorld(e.clientX-r.left,e.clientY-r.top);if(placement){const revision=placementRevision;const ok=await sendCommand({kind:'place',type:placement,x:Math.round(point.x-p.field*2100),y:Math.round(point.y)});if(ok&&state&&renderer&&revision===placementRevision)selectPlacement(null);}else{const f=Math.floor(point.x/2100);const t=state.towers.find(t=>t.field===f&&Math.hypot(t.x+f*2100-point.x,t.y-point.y)<32);renderer.selected=t?.id;inspector();}});
  c.addEventListener('contextmenu',e=>{e.preventDefault();selectPlacement(null);});updateHud();
}
function updateEnemyTooltip(visual){
  const tip=$('#enemy-tooltip'),r=renderer;
  if(!tip||!r?.hoverScreen||!visual?.enemies?.length||placement||$('#modal-root')?.innerHTML){
    if(tip)tip.classList.remove('visible');return;
  }
  const e=r.enemyAt(visual,r.hoverScreen);
  if(!e){tip.classList.remove('visible');return;}
  const d=ENEMIES[e.type],hp=Math.max(0,e.hp),max=Math.max(.001,e.maxHp);
  const percent=Math.max(0,Math.min(100,100*hp/max));
  tip.innerHTML=`<strong>${esc(d.name)}</strong><span class="enemy-hover-type">${d.size>=25?'대형 · ':''}${d.armor?'장갑 '+Math.round(d.armor*100)+'% · ':''}이동 ${fmt(d.speed)}</span>
    <div class="enemy-hover-bar"><i style="width:${percent}%"></i></div>
    <b>체력 ${fmtHp(hp)} / ${fmtHp(e.maxHp)}</b>
    ${e.maxShield?'<span>보호막 '+fmtHp(e.shield)+' / '+fmtHp(e.maxShield)+'</span>':''}
    ${d.heal?'<span>주변 적 회복 · '+fmtHp(d.heal)+'/초</span>':''}
    ${d.regen?'<span>체력 재생 · '+fmtHp(d.regen)+'/초</span>':''}
    ${e.slowUntil>visual.time?'<span>감속 효과 적용 중</span>':''}`;
  const x=r.hoverScreen.x+19,y=r.hoverScreen.y+20;
  tip.style.left=Math.max(8,Math.min(r.width-210,x))+'px';
  tip.style.top=Math.max(8,Math.min(r.height-144,y))+'px';
  tip.classList.add('visible');
}
function selectPlacement(id){placementRevision++;placement=id;renderer.preview=id;renderer.selected=null;inspector();document.querySelectorAll('.loadout-slot').forEach(el=>el.classList.toggle('selected',!!id&&el.dataset.id===id));$('#placement-hint').textContent=id?`${TOWERS[id].name} 배치 · 클릭으로 설치 · Q / 우클릭 취소`:'';}
async function sendCommand(c){
  if(!state||paused||state.status!=='playing')return false;
  if(isOnlineMatch&&onlineBusy){toast('이전 명령 처리 중입니다.');return false;}
  const remote=isOnlineMatch;
  try{
    let result;
    if(remote){onlineBusy=true;result=await online.call('command',{code:room.code,command:{...c,seq:++seq}});}
    else result=command(state,playerId,c);
    if(!result.ok)toast(result.error);
    if(state&&renderer){inspector();updateHud();}
    return !!result.ok;
  }catch(e){toast(e.message);return false;}
  finally{if(remote)onlineBusy=false;}
}
function evolutionItem(look){
  const assets={
    shades:['#26374f','<path d="M13 35h31l-4 20H19Z M56 35h31l-6 20H61Z" fill="#1e304c" stroke="#f8e5b3" stroke-width="4"/><path d="M44 41h12" stroke="#f8e5b3" stroke-width="5"/><path d="M19 40h13m30 0h13" stroke="#8be1ff" stroke-width="3"/>'],
    goggles:['#7ceadf','<circle cx="33" cy="45" r="17" fill="#3c7795" stroke="#b9fff3" stroke-width="6"/><circle cx="69" cy="45" r="17" fill="#3c7795" stroke="#b9fff3" stroke-width="6"/><path d="M50 45h5" stroke="#e7ffff" stroke-width="6"/>'],
    crown:['#ffe18a','<path d="M16 68 12 27 33 44 49 14 66 44 88 25 84 68Z" fill="#ffe08d" stroke="#be8e51" stroke-width="5"/><path d="M20 65h60v12H20Z" fill="#fff2bc"/><circle cx="49" cy="52" r="7" fill="#95e9ff"/>'],
    halo:['#b3ffe0','<ellipse cx="50" cy="40" rx="36" ry="15" fill="none" stroke="#ffe6ad" stroke-width="10"/><ellipse cx="50" cy="40" rx="25" ry="8" fill="none" stroke="#95f3ff" stroke-width="4"/>'],
    star:['#ffda8c','<path d="M50 10 62 36 90 40 69 60 74 88 50 74 25 88 30 60 9 40 38 36Z" fill="#ffe498" stroke="#dc9463" stroke-width="5"/>'],
    gear:['#8cebf0','<circle cx="50" cy="50" r="29" fill="#89d9de" stroke="#4e82a7" stroke-width="9"/><circle cx="50" cy="50" r="13" fill="#f4e6aa"/><path d="M50 4v17m0 59v16M4 50h17m59 0h16" stroke="#baf6f7" stroke-width="9"/>'],
    flame:['#ffb27d','<path d="M26 84Q5 56 31 18q1 32 22 26Q63 16 64 8q37 48 8 76Z" fill="#ff946c" stroke="#ffcc81" stroke-width="5"/><path d="M43 84Q32 63 52 42q20 29 8 42" fill="#ffeaa2"/>'],
    double:['#a7e8ff','<path d="M21 13v70m58-70v70" stroke="#b9e7ff" stroke-width="11"/><path d="M10 27h23m35 0h23" stroke="#ffdcaa" stroke-width="9"/>']
  };
  const fallback={orb:'◉',bandanna:'〰',thorns:'❧',crystal:'◆',wings:'✧',cape:'♜',antenna:'⚡',gold:'◈',coral:'♧',mask:'◈',aura:'✺'};
  if(!assets[look])return `<span class="evo-item-symbol">${fallback[look]||'✦'}</span>`;
  const [color,paths]=assets[look];return `<svg viewBox="0 0 100 100" aria-hidden="true" style="--item-color:${color}">${paths}</svg>`;
}
function waveAdvice(wave){
  if(!wave)return '';
  const boss=wave.groups.map(([id])=>({id,ability:BOSS_ABILITIES[id]})).find(x=>x.ability);
  if(!boss)return '';
  const b=boss.ability;
  const strategy=b.kind==='jam'?'타워를 여러 위치에 분산하면 교란 피해를 줄일 수 있어요.':b.kind==='shield'?'장갑 관통·연쇄 공격으로 추가 보호막에 대응하세요.':'감속 타워를 배치하고 출구 주변의 방어를 강화하세요.';
  return ' ⚠ '+ENEMIES[boss.id].name+' · '+b.name+' — '+strategy;
}
function inspector(){
  if(!$('#tower-inspector')||!renderer||!state)return;
  const inspectorScroll=$('#tower-inspector').scrollTop;
  const t=state.towers.find(t=>t.id===renderer.selected);
  if(!t){$('#tower-inspector').innerHTML='';return;}
  const d=TOWERS[t.type],stats=towerStats(t),next=evolutionAt(t.type,t.level+1);
  const cost=d.upgrades[t.level],own=t.owner===playerId,max=d.upgrades.length;
  const cash=state.players[playerId]?.money||0;
  const nextStats=next?towerStats({...t,level:t.level+1}):null;
  const names={ranged:'원거리 사격',melee:'근접 검격',splash:'범위 폭발',chain:'연쇄 공격',summon:'소환술',buff:'지원 오라',income:'주기적 수입',mark:'약점 표식'};
  const kind=names[stats.kind]||d.role;
  const future=nextStats?(stats.kind!==nextStats.kind?' · '+kind+' → '+(names[nextStats.kind]||'특수 공격'):''):'';
  const compare=(now,after,unit='')=>`<strong>${typeof now==='number'&&unit!=='s'?fmt(now):Number(now).toFixed(2)}${unit}</strong>${after!==undefined?` <span class="evo-delta">→ ${unit==='s'?Number(after).toFixed(2):fmt(after)}${unit}</span>`:''}`;
  const info=next?`<section class="evo-next"><div class="evo-upgrade-layout"><div class="evo-item-art" role="img" aria-label="${esc(next.look)} 장비">${evolutionItem(next.look)}</div><div><div class="evo-next-header"><small>다음 진화 / LEVEL ${t.level+2}</small><b>${esc(next.name)}</b></div><p>${esc(next.desc)}</p><span class="evo-effect">${esc(future||'새 장비·특수 효과를 획득합니다')}</span></div></div></section>`
    :'<section class="evo-next max"><b>✦ 최종 진화 달성</b><p>이 개체는 더 이상 업그레이드할 수 없습니다.</p></section>';
  $('#tower-inspector').dataset.evolutionKey=t.id+':'+t.level;
  $('#tower-inspector').innerHTML=`<span class="eyebrow">${esc(state.players[t.owner].name)} / ${t.level+1} / ${max+1} 단계</span>
    <h2>${d.name}</h2><div class="evo-stage">${esc(stats.stageName)}</div>
    <div class="inspector-art evolved">${portrait(t.type,t.skin,t.level)}<span class="evo-sparks">✦</span></div>
    <div class="evo-progression">${Array.from({length:max+1},(_,i)=>`<i class="${i<=t.level?'reached':''} ${i===t.level?'active':''}" title="LEVEL ${i+1}"></i>`).join('')}</div>
    <div class="stat-grid"><div>피해량${compare(stats.damage,nextStats?.damage)}</div>
      <div>공격 간격${compare(stats.interval,nextStats?.interval,'s')}</div>
      <div>사거리${compare(stats.range,nextStats?.range)}</div>
      <div>공격 방식<b>${kind}</b></div></div>
    ${stats.kind==='income'?`<p class="evo-extra">수입: +${fmt(stats.income)} / ${stats.interval.toFixed(1)}초</p>`:''}
    ${stats.kind==='summon'?`<p class="evo-extra">소환수 ${stats.summons||1}마리 · 이동 속도 ${stats.unitSpeed||210}</p>`:''}
    ${stats.kind==='chain'?`<p class="evo-extra">연쇄 타겟 ${stats.chain||3}명 · 도약 범위 ${stats.chainRange||120}</p>`:''}
    ${stats.markAmp?`<p class="evo-extra">표식이 남은 적은 피해량 +${Math.round((stats.markAmp-1)*100)}% · ${stats.markTime||3}초</p>`:''}
    ${stats.chargeEvery?`<p class="evo-extra">${stats.chargeEvery}발마다 충전탄 ×${stats.chargeBonus||2} 피해 · 보스 집중 사격</p>`:''}
    ${info}
    <button class="primary wide" data-action="upgrade" ${cost!==undefined&&own&&cash>=cost?'':'disabled'}>
      ${cost===undefined?'MAX · 진화 완료':!own?'다른 플레이어의 타워':cash<cost?'자금 부족 · ₩ '+fmt(cost):'진화 · ₩ '+fmt(cost)}</button>
    <button class="wide" data-action="target" ${own?'':'disabled'}>우선 공격: ${{first:'선두',strong:'강한 적',near:'가까운 적'}[t.target]} ⇄</button>
    <button class="sell wide" data-action="sell" ${own?'':'disabled'}>판매 · ₩ ${fmt(Math.floor(t.spent*7/10))}</button>`;
  $('#tower-inspector').scrollTop=inspectorScroll;
}
let previousWave=0;function updateHud(){if(!state||!$('#cash'))return;const p=state.players[playerId],d=DIFFICULTIES.find(d=>d.id===state.config.difficulty);setText('#base-hp',`${state.fields[p.field]} / 100`);if(state.config.type==='pvp')setText('#opponent-hp',`${state.fields[1-p.field]} / 100`);setText('#cash','₩ '+fmt(p.money));setText('#tower-count',state.towers.filter(t=>t.field===p.field).length+' / '+modifiers(state.config).cap);setText('#wave-label',`WAVE ${String(state.wave).padStart(2,'0')} / ${d.waves.length}`);const wave=d.waves[state.wave-1];const next=d.waves[state.wave];const intel=$('#wave-intel');if(intel)setText('#wave-intel',wave.title+' · '+wave.groups.map(([id,n])=>ENEMIES[id].name+' '+n).join(' / ')+(next?' · 다음: '+next.groups.slice(0,2).map(([id])=>ENEMIES[id].name).join('·'):'')+waveAdvice(wave));setText('#wave-clock',`${Math.max(0,Math.ceil((state.waveDeadline??d.waves[state.wave-1].duration)-state.waveTime))}s · 적 ${state.enemies.length}`);const skip=$('#skip');skip.disabled=state.waveTime<8||state.wave===d.waves.length||state.votes.includes(playerId);const skipHtml=state.waveTime<8?`스킵 가능까지 ${Math.ceil(8-state.waveTime)}초`:`웨이브 스킵 <span>${state.votes.length} / ${requiredVotes(state)}</span>`;if(skip.innerHTML!==skipHtml)skip.innerHTML=skipHtml;
  // Keep the per-instance evolution button in sync with earned combat money.
  const selected=renderer&&state.towers.find(t=>t.id===renderer.selected);
  const pane=$('#tower-inspector');
  if(pane){
    if(selected&&pane.dataset.evolutionKey!==selected.id+':'+selected.level)inspector();
    else if(!selected&&pane.dataset.evolutionKey){pane.replaceChildren();delete pane.dataset.evolutionKey;}
    if(selected){
      const upgrade=pane.querySelector('[data-action="upgrade"]'),cost=TOWERS[selected.type].upgrades[selected.level];
      if(upgrade){
        const own=selected.owner===playerId;
        upgrade.disabled=cost===undefined||!own||p.money<cost;
        upgrade.textContent=cost===undefined?'MAX · 진화 완료':!own?'다른 플레이어의 타워':p.money<cost?'자금 부족 · ₩ '+fmt(cost):'진화 · ₩ '+fmt(cost);
      }
    }
  }
  if(state.wave!==previousWave){previousWave=state.wave;$('#wave-notice').textContent=`WAVE ${String(state.wave).padStart(2,'0')} · ${d.waves[state.wave-1].title}`;$('#wave-notice').classList.remove('animate');void $('#wave-notice').offsetWidth;$('#wave-notice').classList.add('animate');}
  if(isOnlineMatch)setText('#connection-status',online.socket?.readyState!==WebSocket.OPEN?'재연결 중':performance.now()-lastSnapshot>7000?'동기화 대기 · 연결 확인 중':'Cloudflare 실시간 동기화');
  if(state.config.type==='pvp')PACKS[p.pack].monsters.forEach(([id,cost])=>{const b=$('#send-'+id),left=Math.max(0,(p.cooldowns[id]||0)-state.time);b.disabled=left>0||p.money<cost;b.querySelector('small').textContent=left>0?Math.ceil(left)+'s':'₩ '+cost;});
}
function bot(){if(!state.players.bot)return;botClock+=STEP;if(botClock<2)return;botClock=0;const p=state.players.bot;const points=[[250,440],[390,450],[400,370],[650,370],[820,450],[1120,650],[1270,570],[1380,520]];const t=state.towers.filter(t=>t.owner==='bot');if(t.length<points.length){const [x,y]=points[t.length];command(state,'bot',{kind:'place',type:t.length%3===2?'blade':'scout',x,y});}else{const u=t.find(t=>TOWERS[t.type].upgrades[t.level]!==undefined&&TOWERS[t.type].upgrades[t.level]<p.money);if(u)command(state,'bot',{kind:'upgrade',id:u.id});}if(state.wave>2&&p.money>500)command(state,'bot',{kind:'send',type:'runner'});if(state.votes.includes('local'))command(state,'bot',{kind:'skip'});}
async function finish(){if(resultShown||performance.now()<claimAfter)return;resultShown=true;const reward=rewardFor(state,playerId);try{if(isOnlineMatch)profile=await online.call('claim',{code:room.code});else{applyReward(localProfile,reward);saveLocal();}}catch(e){toast('보상 정산 대기: '+e.message);claimAfter=performance.now()+5000;resultShown=false;return;}
  const maxWaves=DIFFICULTIES.find(d=>d.id===state.config.difficulty).waves.length;
  const rewardText=state.config.type==='pvp'?'비랭크 PvP에는 계정 코인 보상이 없습니다.':
    reward.win?'클리어 보너스 ◈ '+fmt(reward.clearBonus)+' 포함':
      '진행률 '+Math.round(100*state.wave/maxWaves)+'% · 클리어 보너스 제외 · 기본 보상의 50% × 진행률';
  modal(`<span class="eyebrow">OPERATION COMPLETE</span><h2>${reward.win?'방어 성공':state.config.type==='pvp'&&state.winner===null?'무승부':'방어선 붕괴'}</h2><p>${state.wave} 웨이브 · 처치 ${state.kills} · ${Math.floor(state.time/60)}분 ${Math.floor(state.time%60)}초</p><div class="result-reward">◈ ${fmt(reward.coins)} <small>COINS</small> <span>+${reward.xp} XP</span></div><p class="result-reward-info">${esc(rewardText)}</p>${reward.sonic?'<p>신화 타워 「소닉」 획득!</p>':''}${reward.aurora?'<p>신화 타워 「오로라 정령」 획득!</p>':''}<button class="primary wide" data-action="leave">로비로</button>`);}
function battleMenu(){if(!isOnlineMatch)paused=true;modal(`<span class="eyebrow">FIELD PLAY</span><h2>${isOnlineMatch?'전투는 계속 진행됩니다':'일시 정지'}</h2><p>전투에서 나가면 클리어 보상을 받을 수 없습니다.${isOnlineMatch?' 방장은 참가자가 이어서 동기화를 요청할 수 있습니다.':''}</p><button class="primary wide" data-action="close">전투 계속</button><button class="wide secondary" data-action="leave">본부로 돌아가기</button>`);}
async function leave(){
  if(isOnlineMatch&&room){try{await online.call('leave',{code:room.code});}catch(e){toast(e.message);return;}}
  online.stop();room=null;state=null;isOnlineMatch=false;resetRenderer();placement=null;paused=false;$('#modal-root').innerHTML='';config.type='solo';page='home';if(online.user)try{profile=await online.call('profile');}catch{}else profile=localProfile;shell();
}

async function openRoom(code){
  seenSnapshot=-1;
  room={code};
  modal('<div class="matchmaking-page mm-waiting"><div class="mm-overline">CONNECTING TO GAME ROOM</div><h2>대기실 연결 중</h2><div class="mm-state"><span class="mm-spinner"></span><b>실시간 서버에 접속하고 있습니다</b><small>연결이 되지 않으면 나갔다가 다시 참가할 수 있습니다.</small></div><button class="mm-practice" data-action="leaveRoom">대기실 나가기</button></div>');
  await online.watch(code,r=>{
    if(!r){toast('방이 종료되었습니다.');return;}
    room={...r,code};
    if(r.stateJson){
      playerId=online.user.uid;isOnlineMatch=true;lastSnapshot=performance.now();
      state=JSON.parse(r.stateJson);seenSnapshot=state.time;
      seq=Math.max(seq,state.players[playerId]?.seq||0);
      if(!$('#battlefield'))beginGame();
      else{updateHud();inspector();}
    }else modal(waitingRoomMarkup(code,r,online.user.uid));
  },e=>{
    toast('실시간 연결: '+e.message);
    const status=$('.mm-waiting .mm-state');
    if(status)status.innerHTML='<b>실시간 서버 연결을 확인해 주세요</b><p>'+esc(e.message)+'</p><button data-action="resumeRoom">다시 연결 ↻</button>';
  });
}
async function pulse(now){if(!isOnlineMatch||!room||onlineBusy||now-lastPulse<2000||state?.status!=='playing')return;if(room.host!==playerId&&now-lastSnapshot<6500)return;lastPulse=now;onlineBusy=true;try{await online.call('pulse',{code:room.code});}catch(e){toast('동기화: '+e.message);}finally{onlineBusy=false;}}
const actions={
  noop(){},close(){if(room&&!state)return actions.leaveRoom();if(!state)resetRenderer();closeModal();},account,help,
  async adminOpen(){if(!isAdminSession)return;page='admin';shell();await adminLoad({selected:false});},
  async adminReload(){await adminLoad();},
  async adminSelect(uid){await adminSelect(uid);},
  async adminPrev(){adminData.offset=Math.max(0,adminData.offset-20);await adminLoad({selected:false});},
  async adminNext(){adminData.offset+=20;await adminLoad({selected:false});},
  async adminQuickCoins(){await adminChange('coins',{amount:50000},online.user?.uid);},
  async adminQuickTowers(){await adminChange('grantAllSelf',{},online.user?.uid);},
  async adminDiagnostics(){try{adminData.diagnostics=await online.call('adminDiagnostics');adminData.error='';}catch(e){adminData.error=e.message;}adminRender();},
  async adminBan(){const reason=$('#admin-ban-reason')?.value.trim();if(!reason){adminData.error='제재 사유를 입력하세요.';adminRender();return;}await adminChange('ban',{reason});},
  async adminUnban(){await adminChange('unban');},
  mapPreview(){modal('<h2>'+MAPS.find(m=>m.id===config.map).name+'</h2><canvas id="world" class="terrain-preview" aria-label="실제 전투 맵"></canvas><p>빛나는 분홍 입구에서 시작해 파란 출구로 향합니다.</p>');resetRenderer();renderer=new Renderer($('#world'));},
  nav(id){page=id;config.type='solo';shell();},setCollectionTab(id){if(!['towers','packs'].includes(id))return;collectionTab=id;collection();},previewPack(id){if(!Object.hasOwn(PACKS,id))return;selectedPack=id;collection();},visitPackShop(id){if(!Object.hasOwn(PACKS,id))return;shopTab='packs';page='shop';shell();},map(id){config.map=id;home();},difficulty(id){config.difficulty=id;home();},mode(id){config.modes=config.modes.includes(id)?config.modes.filter(x=>x!==id):[...config.modes,id];home();},
  inspect(id){selectedTower=id;page='towers';collectionTab='towers';shell();},equip(id){mutate({kind:'equip',id});},shopTab(id){shopTab=id;shop();},buyTower(id){mutate({kind:'buyTower',id});},buyPack(id){mutate({kind:'buyPack',id});},pack(id){mutate({kind:'pack',id});},
  skin(id){
    const styles=['default',...Object.keys(SKIN_STYLES).filter(style=>SKIN_STYLES[style].targets.includes(id)||profile.skins?.[id+':'+style])];
    const options=styles.map(style=>{
      const owned=style==='default'||profile.skins?.[id+':'+style];
      const label=style==='default'?'기본 지급 외형':SKIN_STYLES[style].name;
      const rank=style==='default'?'기본':RARITIES[SKIN_STYLES[style].rarity].name;
      return `<button class="skin-wardrobe-item ${owned?'owned':'unowned'}" data-action="setSkin" data-id="${id}|${style}" ${owned?'':'disabled'} style="--skin-accent:${SKIN_STYLES[style]?.color||'#b4c4d7'}">
        ${portrait(id,style)}
        <b>${label}</b><small>${rank} · ${owned?profile.equippedSkins[id]===style?'장착 중':'보유':'미보유'}</small>
      </button>`;
    }).join('');
    modal(`<span class="eyebrow">AUTHORED CHARACTER SKINS</span><h2>${TOWERS[id].name} · 전용 스킨</h2><div class="skin-options">${options}</div><p>선별된 타워에만 제작한 전용 의상입니다. 단순 색상 변경이 아니라 무장·헬멧·복장과 실루엣을 교체합니다. 기존에 보유한 스킨은 계속 사용할 수 있습니다.</p><button data-action="visitCrates">전용 스킨 상자 보러 가기</button>`);
  },
  setSkin(key){const [id,style]=key.split('|');closeModal();mutate({kind:'skin',id,skin:style});},
  setDefault(id){closeModal();mutate({kind:'skin',id,skin:'default'});},setArctic(id){closeModal();mutate({kind:'skin',id,skin:'arctic'});},
  visitCrates(){closeModal();page='shop';shopTab='crates';shell();},
  async openCrate(request){const [id,number]=String(request).split(':');const n=Number(number);if(!Object.hasOwn(CRATES,id)||![1,10].includes(n)||openCrateBusy)return;
    openCrateBusy=true;
    const buttons=[...document.querySelectorAll('[data-action="openCrate"]')];
    buttons.forEach(b=>{b.disabled=true;b.dataset.pending='true';});
    try{await mutate({kind:'openCrate',id,count:n},true);}
    finally{openCrateBusy=false;buttons.forEach(b=>{b.disabled=false;delete b.dataset.pending;});}
  },
  pvp(){special('pvp');},coop(){special('coop');},events(){modal('<span class="eyebrow">PERMANENT CHALLENGE / 01</span><h2>음속을 넘어서</h2><div class="challenge-art">'+portrait('sonic')+'</div><p>익스트림 이상의 난이도에서 「슈퍼소닉」 모드를 적용해 클리어하세요.</p><p>보상: 신화 타워 <b>소닉</b> · 최초 클리어 시 영구 획득</p><button class="primary wide" data-action="challenge">도전 설정 적용</button>');},challenge(){config.difficulty='extreme';config.modes=['supersonic'];config.type='solo';closeModal();page='home';shell();},
  async start(){if(online.user){try{config.type='solo';const r=await online.call('createRoom',{config});await online.call('start',{code:r.code});await openRoom(r.code);}catch(e){toast(e.message);}}else startLocal();},trainingPvp(){startLocal('pvp');},
  selectPlace:selectPlacement,cancelPlace(){selectPlacement(null);},skip(){sendCommand({kind:'skip'});},send(id){sendCommand({kind:'send',type:id});},upgrade(){sendCommand({kind:'upgrade',id:renderer.selected});},sell(){sendCommand({kind:'sell',id:renderer.selected});},target(){const t=state.towers.find(t=>t.id===renderer.selected),targets=['first','strong','near'];if(t)sendCommand({kind:'target',id:t.id,target:targets[(targets.indexOf(t.target)+1)%3]});},battleMenu,leave,
  zoomIn(){renderer.zoomBy(1.2);},zoomOut(){renderer.zoomBy(1/1.2);},zoomReset(){renderer.camera={x:900+state.players[playerId].field*2100,y:550,zoom:1.18};},field(){renderer.camera.x=renderer.camera.x<1800?3000:900;},
  async diagnostic(){try{const result=await online.call('diagnostic');modal(`<span class="eyebrow">ONLINE CHECK</span><h2>서버 연결 정상</h2><p>Firebase 인증 ✓ · Cloudflare Worker 통신 ✓ · D1 프로필 읽기 ✓</p><p>계정: ${esc(result.name)} · 서버 시간: ${esc(result.serverTime)}</p><p>실시간 대전 확인은 별도 계정 두 개로 방에 입장해 점검하세요.</p><button class="primary wide" data-action="close">확인</button>`);}catch(e){toast('연결 진단 실패: '+e.message);}},
  async logout(){await online.signOut();isAdminSession=false;adminData.selected=null;profile=localProfile;closeModal();page='home';shell();},
  async resumeRoom(){await openRoom(profile.activeRoom);},async abandonRoom(){try{await online.call('leave',{code:profile.activeRoom});profile=await online.call('profile');closeModal();shell();}catch(e){toast(e.message);}},

  refreshRooms(){roomListNext=0;return refreshRooms();},
  lobbyLogin(){pendingLobbyMode=config.type;account();},
  async joinListedRoom(code){
    if(!/^[A-Z0-9]{6}$/.test(code||''))return;
    if(!online.user){pendingLobbyMode=config.type;pendingJoinCode=code;account();return;}
    try{
      await online.call('join',{code});
      profile.activeRoom=code;
      await openRoom(code);
    }catch(e){toast('방 참가 실패: '+e.message);if($('#public-room-list'))await refreshRooms();}
  },
  async createRoom(){
    if(!online.user){pendingLobbyMode=config.type;account();return;}
    if(profile.activeRoom){toast('이미 참가 중인 방이 있습니다. 먼저 재접속하거나 나가세요.');return;}
    const createButton=document.querySelector('[data-action="createRoom"]');
    if(createButton?.disabled)return;
    if(createButton){createButton.disabled=true;createButton.textContent='방 생성 중…';}
    try{
      const r=await online.call('createRoom',{config});
      profile.activeRoom=r.code;
      await openRoom(r.code);
    }catch(e){
      toast('방 생성 실패: '+e.message);
      if(createButton?.isConnected){createButton.disabled=false;createButton.textContent='＋ 다시 방 만들기';}
    }
  },
  joinPrompt(){
    if(!online.user){pendingLobbyMode=config.type;account();return;}
    modal('<div class="mm-code-dialog"><span class="mm-overline">JOIN BY CODE</span><h2>'+ (config.type==='pvp'?'PvP':'협동전') +' 방 코드 참가</h2><p>친구에게 받은 6자리 코드를 입력하세요.</p><form id="join-form"><label>참가 코드<input name="code" minlength="6" maxlength="6" pattern="[A-Za-z0-9]{6}" placeholder="ABC123" required autocomplete="off"></label><button class="mm-create" type="submit">코드로 참가 →</button></form><button class="mm-practice" data-action="returnLobby">방 목록으로 돌아가기</button></div>');
  },
  returnLobby(){special(config.type);},
  async copyRoomCode(){
    if(!room?.code)return;
    try{await navigator.clipboard.writeText(room.code);toast('방 코드가 복사되었습니다.');}
    catch{toast('방 코드를 선택해 직접 복사하세요: '+room.code);}
  },
  async startRoom(){try{await online.call('start',{code:room.code});}catch(e){toast('게임 시작 실패: '+e.message);}},
  async leaveRoom(){
    try{
      await online.call('leave',{code:room.code});
      online.stop();room=null;profile.activeRoom=null;closeModal();
      profile=await online.call('profile');shell();
    }catch(e){toast('방 나가기 실패: '+e.message);}
  }
};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;e.preventDefault();try{await actions[b.dataset.action]?.(b.dataset.id);}catch(err){toast(err.message);}});
document.addEventListener('input',e=>{if(e.target.id==='tower-search'){const pos=e.target.selectionStart;filter=e.target.value;collection();$('#tower-search').focus({preventScroll:true});$('#tower-search').setSelectionRange(pos,pos);}});
document.addEventListener('change',e=>{if(e.target.id==='rarity-filter'){rarityFilter=e.target.value;collection();}else if(e.target.id==='lobby-map'&&MAPS.some(m=>m.id===e.target.value)){config.map=e.target.value;}else if(e.target.id==='lobby-difficulty'&&DIFFICULTIES.some(d=>d.id===e.target.value)){config.difficulty=e.target.value;}});
document.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);if(e.target.id==='auth-form'){const buttons=e.target.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);try{await online.signIn(f.get('email'),f.get('password'),e.submitter?.value==='signup');profile=await online.call('profile');closeModal();if(pendingLobbyMode){const mode=pendingLobbyMode,code=pendingJoinCode;pendingLobbyMode=null;pendingJoinCode=null;special(mode);if(code)await actions.joinListedRoom(code);}}catch(err){$('#auth-error').textContent=err.message;}finally{buttons.forEach(b=>b.disabled=false);}}else if(e.target.id==='join-form'){try{const code=f.get('code').toUpperCase();await online.call('join',{code});profile.activeRoom=code;await openRoom(code);}catch(err){toast('방 참가 실패: '+err.message);}}else if(e.target.id==='admin-search-form'){
  adminData.search=String(f.get('search')||'');adminData.offset=0;adminData.selected=null;await adminLoad({selected:false});
}else if(e.target.id==='admin-balance-form'){
  await adminChange(String(f.get('field')),{amount:Number(f.get('amount'))});
}else if(e.target.id==='admin-tower-form'){
  await adminChange(String(f.get('operation')),{tower:String(f.get('tower'))});
}});
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const key=e.key.toLowerCase();if(state){if(e.code==='Space'||key==='e'||key==='r')e.preventDefault();if(renderer&&!$('#modal-root').innerHTML)renderer.keys.add(key);if(e.repeat)return;if(key==='escape'){if($('#modal-root').innerHTML)closeModal();else battleMenu();}else if(!$('#modal-root').innerHTML){if(key==='q')selectPlacement(null);if('12345'.includes(key)){const id=state.players[playerId].loadout[Number(key)-1];if(id)selectPlacement(id);}if(e.code==='Space')sendCommand({kind:'skip'});}}});
document.addEventListener('keyup',e=>renderer?.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>renderer?.keys.clear());
document.addEventListener('visibilitychange',()=>{lastTime=0;renderer?.keys.clear();});
function frame(now){
  const dt=Math.min(.1,(now-(lastTime||now))/1000);lastTime=now;
  if(state){
    if(!paused&&state.status==='playing'){
      if(!isOnlineMatch){
        accumulator+=dt;
        while(accumulator>=STEP){motion.capture(state);tick(state);bot();accumulator-=STEP;}
      }else pulse(now);
    }
    const path=MAPS.find(m=>m.id===state.config.map).path;
    const visual=motion.sample(state,path,{online:isOnlineMatch,ahead:(now-lastSnapshot)/1000,alpha:accumulator/STEP,dt,paused});
    renderer?.frame(visual,state.config.map,playerId,dt,now/1000);
    hoverVisual=visual;updateEnemyTooltip(visual);
    if(now-lastHud>150){updateHud();lastHud=now;}
    if(state.status!=='playing'&&!resultShown&&!onlineBusy)finish();
  }else{
    if(renderer)renderer.frame(null,config.map,playerId,dt,now/1000,true);
    if($('#public-room-list')&&now>=roomListNext&&!roomListBusy)void refreshRooms();
  }
  requestAnimationFrame(frame);
}
shell();requestAnimationFrame(frame);online.onError=e=>toast(e.message);
online.init(async user=>{
  if(user){
    const isCandidate=user.email?.toLowerCase()==='joehw0405@gmail.com';
    const [updated,admin]=await Promise.all([
      online.call('profile'),
      isCandidate?online.call('adminStatus').catch(()=>({admin:false})):Promise.resolve({admin:false})
    ]);
    profile=updated;isAdminSession=admin.admin===true;
    if(page==='admin'&&!isAdminSession)page='home';
    if(!state)shell();
  }else{
    isAdminSession=false;adminData.selected=null;profile=localProfile;
    if(page==='admin')page='home';if(!state)shell();
  }
}).catch(e=>toast('계정 서비스: '+e.message));

