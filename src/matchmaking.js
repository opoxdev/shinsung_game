import {MAPS, DIFFICULTIES, EVENTS} from './data.js';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const option=(item,current)=>'<option value="'+escapeHTML(item.id)+'"'+(item.id===current?' selected':'')+'>'+escapeHTML(item.name)+'</option>';

// Inspired by clear arcade match-selection panels: only user-created rooms
// appear, and a PvP page never contains cooperative rooms (or vice versa).
export function matchmakingMarkup(type,config,{loggedIn=false,activeRoom=null,enabled=false}={}){
  const pvp=type==='pvp',capacity=pvp?2:4;
  const modeName=pvp?'대전 · PvP':'협동전 · MULTIPLAYER';
  const text=pvp?'서로 다른 필드를 방어하며 상대에게 몬스터를 보냅니다. 2명이 모이면 대전할 수 있습니다.':'같은 전장을 2~4명의 플레이어가 함께 방어합니다. 최소 2명부터 시작할 수 있습니다.';
  const auth=loggedIn?'<span class="mm-status online"><i></i> 계정 연결됨 · 온라인 준비</span>':
    '<span class="mm-status"><i></i> 둘러보기 가능 · 방 생성과 참가에는 로그인 필요</span>';
  const active=activeRoom?'<button class="mm-resume" data-action="resumeRoom">진행 중인 방 '+escapeHTML(activeRoom)+' 재접속</button>':'';
  const startLabel=loggedIn?'＋ 공개 방 만들기':'계정 연결 후 방 만들기';
  const mapOptions=MAPS.filter(m=>!m.eventOnly).map(m=>option(m,config.map)).join('');
  const diffOptions=DIFFICULTIES.map(d=>option(d,config.difficulty)).join('');
  return '<div class="matchmaking-page" data-type="'+type+'">'+
    '<div class="mm-overline"><span class="mm-light"></span>'+(pvp?'VERSUS ARENA':'CO-OP OPERATIONS')+' <span class="mm-capacity">최대 '+capacity+'명</span></div>'+
    '<h2>'+modeName+'</h2>'+
    '<p class="mm-intro">'+text+'</p>'+
    '<div class="mm-account">'+auth+
      (loggedIn?'':enabled?'<button data-action="lobbyLogin" class="mm-signin">로그인 / 회원가입</button>':'<button data-action="account" class="mm-signin">서버 설정 확인</button>')+
    '</div>'+
    '<div class="mm-section-label">내가 만들 방의 설정</div>'+
    '<div class="mm-config">'+
      '<label>전장 선택<select id="lobby-map">'+mapOptions+'</select></label>'+
      '<label>난이도<select id="lobby-difficulty">'+diffOptions+'</select></label>'+
      '<div class="mm-form-help">만든 방만 목록에 표시됩니다. 방장은 인원이 모이면 직접 시작합니다.</div>'+
    '</div>'+
    '<div class="mm-actions"><button class="mm-create" data-action="createRoom">'+startLabel+'</button>'+
      '<button class="mm-join-code" data-action="joinPrompt">⌗ 코드로 참가</button></div>'+active+
    '<div class="mm-list-head"><div><span class="mm-section-label">'+(pvp?'PvP':'협동전')+' 공개 방 목록</span>'+
      '<h3>참가 가능한 방 <span id="room-count">—</span></h3></div>'+
      '<button data-action="refreshRooms" class="mm-refresh" type="button">↻ 새로고침</button></div>'+
    '<div id="public-room-list" class="public-room-list mm-room-grid" data-mode="'+type+'" aria-live="polite">'+
      '<div class="mm-state"><span class="mm-spinner"></span><b>공개 방을 확인하는 중</b><small>일정 시간이 지나면 다시 시도할 수 있습니다.</small></div></div>'+
    '<p class="mm-footnote">대기 중인 사용자 생성 방만 표시 · 자동 갱신 · 가득 찬 방과 시작된 방은 목록에서 제외</p>'+
    (pvp?'<button class="mm-practice" data-action="trainingPvp">⚔ 혼자 연습하기 · 로컬 PvP 봇전</button>':'')+
  '</div>';
}

export function matchmakingCards(rooms,type,loggedIn=false){
  if(!rooms.length)return '<div class="mm-state mm-empty"><span class="mm-empty-icon">◇</span>'+
    '<b>아직 열린 방이 없습니다</b><p>첫 번째 '+(type==='pvp'?'PvP':'협동전')+' 방을 만들어 다른 플레이어를 초대하세요.</p></div>';
  const capacity=type==='pvp'?2:4;
  return rooms.map(room=>{
    const code=String(room.code||'').toUpperCase();
    if(!/^[A-Z0-9]{6}$/.test(code))return '';
    const names=Array.isArray(room.players)?room.players.slice(0,capacity):[room.name||'방장'];
    const count=Math.max(1,Math.min(capacity,Number(room.count)||1));
    const map=MAPS.find(m=>m.id===room.map),diff=room.eventId?EVENTS[room.eventId]:DIFFICULTIES.find(d=>d.id===room.difficulty);
    const slotCount=Math.min(count,names.length);
    const slots=Array.from({length:capacity},(_,i)=>
      '<span class="mm-player '+(i<slotCount?'occupied':'')+'">'+
        '<span class="mm-player-icon">'+(i<slotCount?'●':'＋')+'</span>'+
        '<span>'+(i<slotCount?escapeHTML(names[i]):'빈 자리')+'</span></span>').join('');
    return '<article class="mm-room-card" data-room-type="'+type+'">'+
      '<div class="mm-room-top"><span class="mm-card-mode">'+(type==='pvp'?'VERSUS 1V1':'CO-OP '+capacity+'P')+'</span>'+
      '<span class="mm-occupancy">'+count+' / '+capacity+' PLAYERS</span></div>'+
      '<h4>'+escapeHTML(room.name||'모험가')+'의 방</h4>'+
      '<p class="mm-room-map">'+escapeHTML(map?.name||room.map)+' · '+escapeHTML(diff?.name||room.difficulty)+'</p>'+
      '<div class="mm-player-grid">'+slots+'</div>'+
      '<div class="mm-card-bottom"><code>#'+escapeHTML(code)+'</code>'+
      '<button class="mm-join" data-action="joinListedRoom" data-id="'+escapeHTML(code)+'">'+
      (loggedIn?'JOIN →':'로그인 후 JOIN →')+'</button></div></article>';
  }).join('');
}

export function waitingRoomMarkup(code,room,uid){
  const pvp=room.config.type==='pvp',capacity=pvp?2:4;
  const names=Object.values(room.names||{}),host=room.host===uid;
  const canStart=host&&names.length>=2;
  const slots=Array.from({length:capacity},(_,i)=>
    '<div class="mm-wait-player '+(i<names.length?'ready':'')+'">'+
      '<span>'+(i<names.length?'●':'＋')+'</span>'+
      '<b>'+(i<names.length?escapeHTML(names[i]):'플레이어 대기 중')+'</b>'+
      (i===0?'<small>HOST</small>':'')+'</div>').join('');
  return '<div class="matchmaking-page mm-waiting" data-type="'+room.config.type+'">'+
    '<div class="mm-overline">LIVE LOBBY · '+(pvp?'VERSUS':'CO-OP')+'</div>'+
    '<h2>'+ (pvp?'PvP 대전 대기실':'협동전 대기실') +'</h2>'+
    '<div class="mm-room-share"><div><small>친구에게 공유할 방 코드</small><strong>'+escapeHTML(code)+'</strong></div>'+
      '<button data-action="copyRoomCode">코드 복사</button></div>'+
    '<div class="mm-wait-settings">'+escapeHTML(MAPS.find(m=>m.id===room.config.map)?.name||room.config.map)+' · '+
      escapeHTML((room.config.eventId?EVENTS[room.config.eventId]:DIFFICULTIES.find(d=>d.id===room.config.difficulty))?.name||room.config.difficulty)+
      ' <b>'+names.length+' / '+capacity+'명</b></div>'+
    '<div class="mm-wait-list">'+slots+'</div>'+
    '<p class="mm-footnote">방장이 시작하기 전까지 다른 플레이어가 공개 목록 또는 코드로 참가할 수 있습니다.</p>'+
    '<button class="mm-create" data-action="startRoom" '+(canStart?'':'disabled')+'>'+
      (host?canStart?'▶ 게임 시작':'다른 플레이어를 기다리는 중':'방장이 게임을 시작할 때까지 대기')+'</button>'+
    '<button class="mm-practice" data-action="leaveRoom">대기실 나가기</button>'+
    '</div>';
}
