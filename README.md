# 신성 디펜스 (Shinsung Defense)

2D 전략 타워디펜스 게임. 기존 **v0.3 Cloudflare + Firebase Auth** 소스를 이 저장소에서 관리합니다.

> **현재 상태:** GitHub 자동화 준비. 게임 본체는 아직 반입 전입니다. `uploads/`에 v0.3 ZIP을 **한 번만** 올리면 GitHub Actions가 안전하게 압축을 풀고 테스트한 뒤 저장소에 반영하도록 설정되어 있습니다.

## Node.js 없이 최초 소스 등록

1. 이전 대화의 `Shinsung_Defense_v0.3_Cloudflare_Free_Patch.zip`을 다운로드합니다.
2. 이 저장소의 **Add file → Upload files**를 선택합니다.
3. ZIP을 `uploads/` 경로로 업로드합니다. (먼저 `uploads/README.md`에서 경로를 확인할 수 있습니다.)
4. 커밋 후 **Actions → Shinsung game → 최근 작업**에서 테스트와 소스 반입을 확인합니다.

업데이트 시에는 `src/`, `cloudflare/`, `tests/`를 수정해 저장하면 자동 테스트가 실행됩니다. Node.js가 필요한 작업은 GitHub 서버가 수행합니다.

## 무료 서버 구성

- **Firebase Spark Authentication:** 로그인만 담당, 비밀 서비스 계정 키 불필요
- **Cloudflare Workers Free + Durable Objects:** PvP/협동전 WebSocket, 전투 명령 검증
- **Cloudflare D1:** 계정 진행도 및 보상
- **Google Apps Script:** 원래의 웹 앱 호스트, 정적 게임 본체 배포는 별도 구성

모든 유료 요금제 및 결제 수단 등록은 제외합니다.

자세한 콘솔 설정은 [온라인 연결 안내](docs/ONLINE_SETUP.md)를 참조하세요. 비밀키/Cloudflare API 토큰을 GitHub 코드나 채팅에 올리지 마세요.

## 주의 사항

프로젝트 소스가 반입되어도 Firebase/Cloudflare 실제 연결과 20명 동시 접속은 별도 검증 대상입니다. 무료 한도를 넘으면 일부 기능이 중단될 수 있습니다.
