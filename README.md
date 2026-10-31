# 신성 디펜스 — Shinsung Defense v0.9.8

학교/군대 테마가 아닌 2D 타워 디펜스 게임. 평야, 어두운 산맥, 수정 동굴, 용암 협곡, 눈꽃 숲 5개 맵과 6개 난이도, 5개 모드, 타워 수집/장착, PvP 몬스터 소환, 2~4인 협동전을 포함합니다.

**서버 변경(v0.3):** 기존 Firebase RTDB + GAS 2초 폴링 방식 제거. Firebase Spark는 계정 로그인에만 사용하고, Cloudflare Workers Free + Durable Objects(WebSocket) + D1(SQL)로 방/전투/보상 서버를 이전했습니다. 서버는 클라이언트가 보내는 피해·코인 수치를 신뢰하지 않습니다.

## 최종 배포 방향 (GAS 유지)

**공식 게임 주소는 Google Apps Script의 /exec 입니다.** Firebase 로그인, Cloudflare PvP 서버, D1 DB, 게임 콘텐츠는 그대로 유지합니다. 별도 Node.js 설치 없이 한 번 [GAS 공식 배포 안내](docs/GAS_SETUP.md)를 따라 연결하면 됩니다. 이후 평소 업데이트는 GitHub → Cloudflare로 자동 적용되고 GAS 주소는 유지됩니다.

## 시작

- 오프라인 체험: Windows에서 `Start-Game.cmd` 실행.
- 온라인 배포: 반드시 [`DEPLOY.md`](DEPLOY.md)를 차례로 실행하세요.
- 빌드: `npm run build` (외부 패키지 설치 없이 작동)
- 자동 테스트: `npm test` (브라우저/실제 Cloudflare 통합 테스트는 별도)

## 파일

- `src/`: 브라우저 게임 소스, 화면과 전투 시뮬레이션.
- `cloudflare/`: Worker API, Durable Object 방 서버, Firebase ID 토큰 검증, D1 스키마와 설정.
- `server/`: GAS HTML 웹 호스팅(코드만, 비공개 키 없음).
- `dist/apps-script/`: GAS 배포용 3개 파일.
- `dist/cloudflare/core.js`: 게임 엔진의 Cloudflare용 빌드 출력.
- `firebase/config.example.json`: 공개 웹 로그인 설정 예제.

## 중요한 점

Cloudflare/Firebase 계정 연동 전에는 온라인 모드가 활성화되지 않습니다. 기존 RTDB 데이터의 자동 이전은 포함되지 않습니다. 무료 서비스라도 제한에 도달하면 실패할 수 있습니다. 운영 서비스에서 20명 동접/장시간 플레이와 부정행위 차단은 실제 검증이 필요합니다.
