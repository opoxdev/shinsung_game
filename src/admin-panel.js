import {TOWERS} from './data.js';

const escAdmin=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtAdmin=n=>Math.floor(Number(n)||0).toLocaleString('ko-KR');
const dateAdmin=t=>t?new Date(t).toLocaleString('ko-KR'):'—';
export const adminTowerOptions=()=>Object.entries(TOWERS)
  .map(([id,t])=>'<option value="'+escAdmin(id)+'">'+escAdmin(t.name)+' ('+escAdmin(id)+')</option>').join('');

export function adminPageMarkup(data){
  const {summary,listing,selected,audit,diagnostics,search='',busy=false,error='',status=''}=data;
  const users=listing?.items||[],total=listing?.total||0,offset=listing?.offset||0;
  const stats=[
    ['등록 프로필',summary?.users,'users'],
    ['이용 제한 계정',summary?.banned,'banned'],
    ['전체 보유 코인',summary?.coins,'coins'],
    ['서버 버전',summary?.version,'version']
  ];
  return '<div class="admin-console">'+
    '<header class="admin-hero"><div><span class="admin-kicker">OPERATIONS / VERIFIED ADMIN</span>'+
      '<h1>관리자 패널 <span>⚙</span></h1>'+
      '<p>로그인 계정의 코인·타워·진행도는 서버 D1에 저장됩니다. 솔로 전투 계산만 클라이언트에서 진행합니다.</p></div>'+
      '<button class="admin-refresh" data-action="adminReload" '+(busy?'disabled':'')+'>↻ 새로고침</button></header>'+
    (error?'<div class="admin-message danger" role="alert">'+escAdmin(error)+'</div>':'')+
    (status?'<div class="admin-message" role="status">'+escAdmin(status)+'</div>':'')+
    '<section class="admin-stats">'+stats.map(([title,value,type])=>'<article><small>'+title+'</small><strong>'+
      (value===undefined||value===null?'—':type==='version'?escAdmin(value):fmtAdmin(value))+'</strong></article>').join('')+'</section>'+
    '<section class="admin-utilities"><div><h2>개발 · 점검 도구</h2><p>내 계정 테스트 자금 지급, 전체 타워 해금, 서버 상태 점검</p></div>'+
      '<div class="admin-tool-buttons"><button data-action="adminQuickCoins">＋ 내 코인 50,000</button>'+
      '<button data-action="adminQuickTowers">✦ 내 타워 전체 해금</button>'+
      '<button data-action="adminDiagnostics">⚡ 연결 점검</button></div>'+
      (diagnostics?'<div class="admin-diagnostics"><b>점검 결과</b><span>Worker '+escAdmin(diagnostics.worker)+' · D1 '+escAdmin(diagnostics.database)+' · 방 목록 '+escAdmin(diagnostics.rooms)+
        ' · 등록 프로필 '+fmtAdmin(diagnostics.profiles)+' · 타워 '+fmtAdmin(diagnostics.towerDefinitions)+
        ' · 공개 방 '+escAdmin(diagnostics.openRooms??'—')+'</span>'+
        (diagnostics.roomError?'<small>'+escAdmin(diagnostics.roomError)+'</small>':'')+'</div>':'')+
    '</section>'+
    '<div class="admin-workspace"><section class="admin-users"><div class="admin-section-header"><div><span>USER MANAGEMENT</span><h2>유저 관리 <small>'+fmtAdmin(total)+'명</small></h2></div></div>'+
      '<form id="admin-search-form" class="admin-search"><input name="search" maxlength="60" placeholder="닉네임 또는 UID로 검색" value="'+escAdmin(search)+'" aria-label="유저 검색"/>'+
      '<button type="submit" '+(busy?'disabled':'')+'>검색</button></form>'+
      '<div class="admin-user-list">'+(users.length?users.map(u=>
        '<button type="button" class="admin-user-item '+(selected?.uid===u.uid?'selected':'')+'" data-action="adminSelect" data-id="'+escAdmin(u.uid)+'">'+
          '<div class="admin-user-avatar">'+escAdmin((u.name||'?').charAt(0))+'</div>'+
          '<span><b>'+escAdmin(u.name)+'</b><small>'+escAdmin(u.uid)+'</small></span>'+
          '<i class="'+(u.banned?'banned':'')+'">'+(u.banned?'제재':'정상')+'</i>'+
          '<em>◈ '+fmtAdmin(u.coins)+'</em></button>').join(''):
        '<div class="admin-empty">조회된 프로필이 없습니다.</div>')+'</div>'+
      '<div class="admin-paging"><button data-action="adminPrev" '+(offset===0||busy?'disabled':'')+'>← 이전</button>'+
      '<span>'+fmtAdmin(total?offset+1:0)+'–'+fmtAdmin(Math.min(total,offset+users.length))+' / '+fmtAdmin(total)+'</span>'+
      '<button data-action="adminNext" '+(offset+users.length>=total||busy?'disabled':'')+'>다음 →</button></div></section>'+
      '<section class="admin-detail">'+(selected?adminUserDetailMarkup(selected,busy):
        '<div class="admin-empty detail-empty"><strong>유저를 선택하세요</strong><p>좌측 목록에서 계정을 선택하면 보유 재화, 타워, 제재 상태를 관리할 수 있습니다.</p></div>')+
      '</section></div>'+
    '<section class="admin-audit"><div class="admin-section-header"><div><span>CHANGE HISTORY</span><h2>최근 관리 기록</h2></div></div>'+
      '<div class="admin-audit-list">'+(audit?.length?audit.map(row=>
        '<article><b>'+escAdmin(row.operation)+'</b><span>'+escAdmin(row.target_uid)+'</span>'+
        '<small>'+dateAdmin(row.created_at)+'</small></article>').join(''):
      '<div class="admin-empty">아직 관리 기록이 없습니다.</div>')+'</div></section>'+
    '</div>';
}
function adminUserDetailMarkup(u,busy){
  return '<div class="admin-section-header"><div><span>PROFILE INSPECTOR</span><h2>'+escAdmin(u.name)+'</h2></div>'+
    '<span class="admin-user-status '+(u.banned?'danger':'')+'">'+(u.banned?'이용 제한':'정상 계정')+'</span></div>'+
    '<div class="admin-detail-uid"><small>Firebase UID</small><code>'+escAdmin(u.uid)+'</code></div>'+
    '<div class="admin-detail-stats">'+
      '<span>코인 <b>◈ '+fmtAdmin(u.coins)+'</b></span>'+
      '<span>경험치 <b>'+fmtAdmin(u.xp)+'</b></span>'+
      '<span>승리 <b>'+fmtAdmin(u.wins)+'</b></span>'+
      '<span>보유 타워 <b>'+fmtAdmin(u.owned?.length)+'</b></span></div>'+
    (u.activeRoom?'<p class="admin-room-notice">진행 중인 방: '+escAdmin(u.activeRoom)+'</p>':'')+
    (u.banned?'<p class="admin-room-notice danger">제재 사유: '+escAdmin(u.banReason||'운영 정책 위반')+'</p>':'')+
    '<p class="admin-owned">보유 중: '+escAdmin((u.owned||[]).map(id=>TOWERS[id]?.name||id).join(', ')||'없음')+'</p>'+
    '<div class="admin-control-title">재화 조정 <small>증감값을 입력 (음수 가능)</small></div>'+
    '<form id="admin-balance-form" class="admin-edit-row"><select name="field" aria-label="수정할 재화"><option value="coins">코인</option><option value="xp">경험치</option></select>'+
      '<input name="amount" type="number" required step="1" min="-10000000" max="10000000" placeholder="예: 1000" aria-label="증감 수량">'+
      '<button type="submit" '+(busy?'disabled':'')+'>적용</button></form>'+
    '<div class="admin-control-title">타워 지급 · 회수</div>'+
    '<form id="admin-tower-form" class="admin-edit-row"><select name="operation" aria-label="타워 작업"><option value="grantTower">지급</option><option value="revokeTower">회수</option></select>'+
      '<select name="tower" aria-label="타워 선택">'+adminTowerOptions()+'</select>'+
      '<button type="submit" '+(busy?'disabled':'')+'>적용</button></form>'+
    '<div class="admin-control-title">계정 제재</div>'+
    (u.banned?
      '<button class="admin-ban-control unban" data-action="adminUnban" '+(busy?'disabled':'')+'>이용 제한 해제</button>':
      '<label class="admin-reason-label">제재 사유<input id="admin-ban-reason" maxlength="120" placeholder="제재 사유를 입력하세요"></label>'+
      '<button class="admin-ban-control" data-action="adminBan" '+(busy?'disabled':'')+'>계정 이용 제한</button>')+
    '<p class="admin-note">변경은 서버 프로필에 저장됩니다. 진행 중인 경기의 타워 구성은 소급 변경되지 않습니다. 제재 시 서버 접속과 게임방 이용이 제한됩니다.</p>'+
    '<div id="admin-confirm"></div>';
}
