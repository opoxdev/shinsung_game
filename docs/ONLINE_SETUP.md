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
4. **완료:** `firebase/config.json`에 Firebase 웹 설정을 등록했습니다. GitHub Pages 빌드는 이를 자동으로 읽습니다.
5. Firebase Authentication → Settings → Authorized domains에 `opoxdev.github.io` 추가(웹 게임을 GitHub Pages에서 테스트할 경우).

이는 브라우저용 공개 설정이며 **서비스 계정 JSON과 전혀 다릅니다**. 개인키는 사용하지 않습니다.

## 2. Cloudflare 무료 DB (D1)

1. https://dash.cloudflare.com/ → Free 계정 준비.
2. **Storage & databases → D1 SQL Database → Create**에서 데이터베이스 이름을 `shinsung-profiles`로 생성.
3. 생성된 데이터베이스의 **Console**에서 GitHub에 있는 `cloudflare/schema.sql`의 SQL 내용을 실행(테이블 생성).
4. **완료:** D1 Database ID `f78d40e3-b555-453a-b75c-b172fa7594d4`가 GitHub에 반영되어 있습니다. 데이터베이스 이름이 `shinsung-profiles`인지 확인하세요.

## 3. Cloudflare Workers: 연결 완료

- **프로덕션 Worker 이름:** `shinsung-game`
- **공개 서버 주소:** https://shinsung-game.joehw0405.workers.dev
- **정상 동작 확인:** `/health` 응답 `{"ok":true,"service":"shinsung-cloudflare","version":"0.3.0"}`
- GitHub의 `cloudflare/wrangler.toml` 및 `wrangler.toml`의 `name`을 실제 Worker 이름으로 통일했습니다.
- Cloudflare 배포 명령 `npx wrangler deploy --config cloudflare/wrangler.toml`은 그대로 유지해도 됩니다.

이 확인은 HTTP 서버 접근만 검증합니다. Firebase Auth, D1 읽기/쓰기 및 PvP 웹소켓은 두 계정으로 별도 테스트해야 합니다.

## 4. GitHub Pages: 게임 화면 자동 배포

이제 GitHub에서 **한 번만** Pages를 활성화하면 됩니다.

1. https://github.com/opoxdev/shinsung_game/settings/pages 를 엽니다.
2. `Build and deployment` → `Source`에서 **GitHub Actions**를 선택합니다.
3. 기존 `.github/workflows/game.yml` 워크플로가 게임 HTML을 빌드하고 배포합니다.
4. https://github.com/opoxdev/shinsung_game/actions 에서 **Shinsung game**의 최신 실행을 확인합니다. Pages가 활성화되기 전 최초 배포는 실패할 수 있으니, 이후 **Re-run jobs**를 실행하면 됩니다.
5. 게임 테스트 주소: https://opoxdev.github.io/shinsung_game/

**Firebase 공개 구성은 `firebase/config.json`을 통해, Cloudflare Worker URL은 GitHub Actions 기본값을 통해 이미 연결됩니다.** `ENABLE_GITHUB_PAGES`나 `CLOUDFLARE_API` 저장소 변수를 직접 만들 필요가 없습니다.

GitHub Actions로 자동 배포된 이후에는 소스코드를 수정하면 게임 화면도 자동으로 갱신됩니다.

## 5. 첫 온라인 게임 테스트

1. Firebase Authentication에서 Email/Password 로그인 제공자를 활성화합니다.
2. GitHub Pages 게임 주소에서 서로 다른 이메일 계정 2개로 회원가입합니다.
3. 서로 다른 브라우저 두 개로 방 생성·입장·전투를 확인합니다.
4. D1 프로필이 저장되는지와 WebSocket 재접속, 승리 보상 중복 지급 여부를 확인합니다.
5. 이 테스트 전에는 실시간 대전 및 계정 저장이 검증되었다고 간주하지 않습니다.

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
