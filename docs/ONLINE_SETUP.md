# 신성 디펜스: 브라우저만 이용하는 무료 배포

**로컬 Node.js 설치, PowerShell, wrangler login 불필요.**

## 0. 먼저 소스 업로드

1. 이전 대화에서 받은 `Shinsung_Defense_v0.3_Cloudflare_Free_Patch.zip` 다운로드.
2. [GitHub ZIP 업로드 폴더](https://github.com/opoxdev/shinsung_game/upload/main/uploads)에서 해당 ZIP 한 번 업로드하고 **Commit changes**.
3. 저장소의 **Actions → Shinsung game**에서 `Import ZIP`, `Build and test`가 성공인지 확인.
4. `src/`, `cloudflare/`, `server/`, `tests/` 등이 생겨야 합니다. 실패한 경우 **Settings → Actions → General → Workflow permissions → Read and write permissions**를 확인하세요.

한 번 소스를 가져온 뒤에는 ZIP을 매번 다시 올릴 필요가 없습니다. ChatGPT의 GitHub 연결을 통해 소스 파일을 직접 수정할 수 있습니다.

## 1. Firebase 무료 로그인 (Spark)

1. https://console.firebase.google.com/ → 프로젝트 만들기 → **Spark(무료)** 유지.
2. **Authentication → Sign-in method → Email/Password** 활성화.
3. **프로젝트 설정 → 일반 → 내 앱 → 웹 앱** 등록.
4. 웹 구성 `firebaseConfig`의 `apiKey`, `authDomain`, `projectId`, `appId`를 확인.
5. Firebase Authentication → Settings → Authorized domains에 `opoxdev.github.io` 추가(웹 게임을 GitHub Pages에서 테스트할 경우).

이는 브라우저용 공개 설정이며 **서비스 계정 JSON과 전혀 다릅니다**. 개인키는 사용하지 않습니다.

## 2. Cloudflare 무료 DB (D1)

1. https://dash.cloudflare.com/ → Free 계정 준비.
2. **Storage & databases → D1 SQL Database → Create**에서 데이터베이스 이름을 `shinsung-profiles`로 생성.
3. 생성된 데이터베이스의 **Console**에서 GitHub에 있는 `cloudflare/schema.sql`의 SQL 내용을 실행(테이블 생성).
4. D1 세부 정보에서 `Database ID` (UUID) 복사.

## 3. GitHub에서 Cloudflare 설정 파일 수정

GitHub의 `cloudflare/wrangler.toml` 파일에서 **Edit(연필 아이콘)**:
- `FIREBASE_PROJECT_ID = "REPLACE_WITH_FIREBASE_PROJECT_ID"` → Firebase `projectId`로 교체
- `database_id = "REPLACE_WITH_D1_DATABASE_ID"` → D1 Database ID로 교체

이 두 값은 공개 식별자입니다. API 토큰이나 비밀번호가 아닙니다.

## 4. Cloudflare GitHub 자동 배포 (API 토큰 불필요)

1. Cloudflare **Workers & Pages → Create application → GitHub로 연결**.
2. `opoxdev/shinsung_game` 선택하고 main 브랜치 연결.
3. 구성에서 **Repository root = /**, **Build command = `npm run build`**, **Deploy command = `npx wrangler deploy --config cloudflare/wrangler.toml`**로 설정.
4. 저장 및 배포. Worker 주소 `https://shinsung-defense.<account>.workers.dev`를 확인.
5. Worker URL의 `/health`를 브라우저에서 열어 `"ok":true` 확인. 이것만으로 실제 멀티플레이까지 검증된 것은 아닙니다.

위 경로와 메뉴 이름은 Cloudflare 콘솔 개편에 따라 조금 달라질 수 있습니다. 배포 로그에서 `D1` 권한과 Durable Object 마이그레이션 성공을 확인해야 합니다.

문서: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/ 및 https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

## 5. GitHub Pages: 자동 업데이트 테스트 사이트 (권장)

Google Apps Script 원본 호스팅은 유지할 수 있지만, **GAS 배포는 웹 편집기에서 코드를 다시 반영해야** 합니다. 자주 업데이트하는 테스트 빌드는 GitHub Pages가 더 간단합니다.

1. GitHub **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables → New repository variable**에 아래 추가:
   - `ENABLE_GITHUB_PAGES` = `true`
   - `FIREBASE_WEB_CONFIG` = Firebase **공개 웹 설정 전체를 JSON 객체 한 줄**로 입력
   - `CLOUDFLARE_API` = `https://....workers.dev` (끝에 / 없이)
3. **Actions → Shinsung game → Run workflow**를 누르면 테스트가 통과한 뒤 GitHub Pages 빌드 및 배포.
4. 주소: https://opoxdev.github.io/shinsung_game/

이 세 값은 공개 구성 정보입니다. 비밀번호나 Cloudflare API 토큰을 넣으면 안 됩니다.

## 6. Google Apps Script 호스팅이 꼭 필요하면

1. GitHub Actions 빌드 결과의 `dist/apps-script/`에는 `Code.gs`, `Index.html`, `appsscript.json`가 생성됩니다.
2. https://script.google.com/ → 웹 앱 프로젝트 생성.
3. `Code.gs`, `Index.html`, `appsscript.json`을 추가.
4. 스크립트 속성에 `FIREBASE_CONFIG` (공개 웹 설정 JSON) 및 `CLOUDFLARE_API` (Worker URL) 설정.
5. **배포 → 새 배포 → 웹 앱**. GAS는 게임 화면 호스트이며 실시간 게임 통신은 Worker와 WebSocket으로 직접 처리합니다.

GAS 앱을 업데이트할 때는 `Index.html` 재배포가 필요합니다. 따라서 개발 중에는 **GitHub Pages 테스트 URL**을 사용하는 것이 더 효율적입니다.

## 보안·운영 체크

- **Free / Spark만 유지**: Blaze 업그레이드 및 카드 등록은 금지.
- Firebase 서비스 계정 개인키, Cloudflare API 토큰, 비밀번호는 **채팅이나 공개 GitHub에 붙여넣지 않습니다.**
- Github / Cloudflare 무료 사용량을 모니터링하고 한도 초과 시 유료 과금보다 서비스 제한을 허용합니다.
- 최초 두 계정 로그인 → 방 참가 → PvP/협동전 동기화, D1 진행도 유지 테스트를 실제 브라우저에서 별도 수행합니다.
- 20명 매일 장시간 운영은 실제 부하 테스트 전까지 보장하지 않습니다.
