# 신성 디펜스 v0.3.0 — 무료 Cloudflare + Firebase Auth + GAS 연결

> 현재 코드는 무료 플랜에 맞춰 준비한 **배포 후보**입니다. 실제 Cloudflare와 Firebase 프로젝트는 개발자가 대신 생성하지 않았습니다. 두 브라우저에서 실제 온라인 플레이 검증이 필요합니다. API 키/비밀번호를 채팅으로 보낼 필요가 없습니다.

## 운영 구조

- **GAS**: 정적 HTML/CSS/JS 제공. 전투를 진행하는 반복 `UrlFetchApp` 호출 없음. GAS 서버용 서비스 계정 JSON 키도 없음.
- **Firebase Authentication**: Spark 무료 요금제, Email/Password 로그인에 한정. Realtime Database나 Firestore는 사용하지 않음.
- **Cloudflare Workers Free**: Firebase ID 토큰의 **RS256 서명을 Google 공개 JWK로 검증**하고 API를 제공.
- **Cloudflare Durable Objects (SQLite backend)**: 각 방의 서버 권위 전투 상태, WebSocket 연결, 명령 처리, 웨이브 진행. 클라이언트 좌표/피해량을 신뢰하지 않음.
- **Cloudflare D1**: 계정 코인, 경험치, 보유 타워, 장착 정보, 방 참조, 정산 중복 방지 장부 저장.

## 1) 준비물 (모두 무료)

1. Node.js LTS + npm (https://nodejs.org/)
2. Cloudflare 무료 계정 (https://dash.cloudflare.com/) — Workers **Free** 유지.
3. Firebase 무료 Spark 프로젝트 (https://console.firebase.google.com/) — **Blaze 업그레이드/결제수단 등록하지 않음**.
4. Google Apps Script (https://script.google.com/)

기존 Firebase 프로젝트가 있으면 **Authentication만 재사용**할 수 있습니다. 기존 Realtime Database 데이터는 D1으로 자동 이관되지 않으므로, 이전 온라인 계정 데이터가 있다면 별도로 이전해야 합니다. 아직 기존 Firebase 계정을 만들지 않았다면 새로 시작하면 됩니다.

## 2) Firebase Email/Password 인증

1. Firebase Console > 프로젝트 만들기 > **Spark 무료** 확인.
2. **Authentication > Sign-in method > Email/Password** 활성화. 전화 SMS 인증은 사용하지 않음.
3. 프로젝트 설정(톱니바퀴) > 일반 > 내 앱 > 웹 앱 추가 (`</>`).
4. 웹 구성 객체 `firebaseConfig`에서 `apiKey`, `authDomain`, `projectId`, `appId` 값을 복사해 보관합니다. 이것들은 **브라우저 공개 설정 값**이며 서비스 계정 비공개 키가 아닙니다.
5. Cloudflare 설정의 `FIREBASE_PROJECT_ID`에는 위 `projectId`를 입력해야 합니다.

**절대 요청하지 않는 것:** Firebase 서비스 계정 JSON / `private_key`, Cloudflare API 토큰, 실제 계정 비밀번호.

## 3) Cloudflare D1 만들기

Windows PowerShell에서 ZIP 압축을 푼 프로젝트 폴더에서 다음을 실행합니다.

```powershell
cd "C:\Users\Minseo11\Downloads\Shinsung_Defense"
npm run build
npx wrangler login
cd cloudflare
npx wrangler d1 create shinsung-profiles
```

출력된 `database_id = "..."` 값(UUID)을 `cloudflare/wrangler.toml`의 `REPLACE_WITH_D1_DATABASE_ID`로 바꿉니다. 같은 파일의 `REPLACE_WITH_FIREBASE_PROJECT_ID`도 Firebase 프로젝트 ID로 바꿉니다.

```powershell
npx wrangler d1 execute shinsung-profiles --remote --file=./schema.sql
```

D1에 `profiles` 테이블이 생성됩니다. `--remote`를 빼면 로컬 테스트 DB만 만들어지니 주의하세요.

## 4) Cloudflare Worker / Durable Object 배포

```powershell
# 현재 폴더: Shinsung_Defense\cloudflare
npx wrangler deploy
```

첫 배포에서는 Durable Objects의 **SQLite 새 네임스페이스**를 `wrangler.toml`의 `new_sqlite_classes` 마이그레이션으로 생성합니다. 무료 플랜에서 SQLite 저장소를 사용할 수 있습니다.

결과로 나온 주소를 적어둡니다. 예:

`https://shinsung-defense.사용자-서브도메인.workers.dev`

브라우저에서 `https://...workers.dev/health`를 열어 `"ok":true`가 출력되는지 확인합니다. 이 API는 로그인 없이 서버 부팅만 검사합니다.

**주의:** 실제 계정이 준비되지 않았으므로, `/health`만 통과해도 PvP가 검증된 것은 아닙니다.

## 5) Apps Script 연결

1. 프로젝트 루트로 돌아가 `npm run build` 실행. `dist/apps-script`의 `Code.gs`, `Index.html`, `appsscript.json` 세 파일이 배포용입니다. `Core.gs`는 더 이상 사용하지 않습니다.
2. Apps Script에서 새 프로젝트를 만듭니다. 파일 이름을 정확히 맞춥니다.
3. 프로젝트 설정 > 스크립트 속성에 두 값을 추가합니다.

   **속성 `FIREBASE_CONFIG`** = Firebase 공개 웹 설정 JSON 전체 (예제: `firebase/config.example.json`; 본인 값으로 교체)

   **속성 `CLOUDFLARE_API`** = Cloudflare 배포 주소 (`https://....workers.dev`, 마지막 `/` 없이)

4. 배포 > 새 배포 > 웹 앱 > 실행 사용자 **나**, 접근 **모든 사용자**(학교 Workspace 정책에 따라 제한될 수 있음)로 배포.
5. 새 배포의 `/exec` 주소를 사용해 온라인 계정을 만들어 접속합니다. `Start-Game.cmd`는 **오프라인 로컬 체험** 전용입니다.
6. 게임의 계정 관리 > **연결 상태 점검**을 눌러 Firebase 인증, Worker, D1 연결을 확인합니다.

**이 패치는 Firebase 서비스 계정 키가 필요 없습니다.** GAS의 `UrlFetchApp` OAuth scope도 제거되어 있습니다.

## 6) 게임 플레이 검증 체크리스트

- 계정 A의 로그인 / 타워 구매 / 장착 후 브라우저 새로고침: D1 계정 데이터 유지.
- 두 계정 A, B를 각자 다른 브라우저에서 로그인: A가 방 생성, B는 6자리 코드로 참가.
- PvP는 2명, 협동은 2~4명: 방장 시작, 두 화면의 타워 배치/자금/소환 결과 동일.
- WebSocket이 끊겼다가 다시 연결되면 사용자의 **1회용 입장 티켓**으로 자동 재접속.
- 방장이 나가면 PvP 기권 승패 결정. 게임 완료 후 클리어 보상을 여러 번 청구해도 D1에서 중복 지급 차단.
- 로비에서 20명 동시 접속, 여러 경기방 진행 테스트. Cloudflare Analytics에서 Workers/DO/D1 사용량 확인.

## 7) 무료 한도와 운영 보호

- Workers Free: 100,000 요청/일, 호출당 CPU 10ms 제한.
- Durable Objects Free: 100,000 요청/일, 13,000GB-s 실행량/일, SQLite SQL 쓰기 100,000행/일 등 독립 한도.
- D1 Free: 5백만 행 읽기/일, 10만 행 쓰기/일, 전체 5GB 저장(데이터베이스 하나당 최대 500MB).
- Free 요금제는 한도 초과 작업이 실패하며, **유료 전환 없이** 무료만 사용해야 함.

핵심 최적화: 방장만 2초마다 WebSocket `pulse`; GAS API는 호출하지 않음. 서버는 짧은 간격의 전투만 결정론적으로 계산하며, 클라이언트가 그 사이 적 이동/이펙트를 렌더링. 클라이언트가 전송하는 피해량/코인 정보는 무시함. 더 오래 접속하지 않은 방은 무제한 따라잡기 대신 서버 진행이 일시 중단됨.

**주의: 실제 20명 × 매일 4시간 운영을 보장하는 것은 아닙니다.** 큰 웨이브에서 CPU 10ms 제한, WebSocket 메시지량, 재접속/스냅샷 처리, D1 가용성을 확인해야 합니다. 배포 전 스트레스 테스트가 필요하고, 무료 한도에 도달하면 접속/전투가 제한됩니다. 특히 방이 많을 때 DO 호출과 실행량을 확인하세요.

공식 문서: https://developers.cloudflare.com/workers/platform/pricing/ · https://developers.cloudflare.com/durable-objects/platform/pricing/ · https://developers.cloudflare.com/d1/platform/pricing/ · https://firebase.google.com/docs/auth

## 8) 장애 해결

- `FIREBASE_CONFIG` 설정 실패: `apiKey`, `projectId` 등이 JSON 문자열 안에 있는지 확인.
- `FIREBASE_PROJECT_ID` 오류: `cloudflare/wrangler.toml`과 Firebase 앱 설정의 `projectId`가 같은지 확인.
- D1 `no such table profiles`: **3단계의 `--remote` SQL 실행 여부** 확인.
- API 400 / JWT 오류: Firebase 로그인 후 새로고침하여 토큰 갱신, Worker의 프로젝트 ID 확인.
- WebSocket 실패: HTTPS Worker 주소로 연결하는지, 브라우저 네트워크의 WebSocket 차단 여부 확인.
- 방 진행이 잠시 멈춤: 방장 연결 상태를 확인. 참가자가 6초 후 이어받을 수 있도록 설계.
- Cloudflare 100k 제한: Workers/Durable Objects 무료 사용량 확인. 유료로 전환하지 말고 방 수·명령량을 최적화.
