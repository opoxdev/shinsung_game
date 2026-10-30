# v0.3.0 — 무료 장시간 멀티플레이 전환 패치

- GAS에서 2초마다 Firebase REST를 호출하던 서버 구조 제거.
- Firebase Realtime Database 제거. Firebase Spark는 이메일·비밀번호 **인증만** 사용.
- Firebase ID 토큰을 Google 공개 JWK(RS256)로 검증하는 Cloudflare Worker API 추가.
- Durable Objects SQLite 백엔드 WebSocket 방 서비스 추가. 30초 만료·일회용 접속 티켓, 재연결, 참가자/방장 검증.
- 기존 게임 엔진에서 공통 전투 코드를 빌드하여 Cloudflare 서버에서만 명령 처리 및 웨이브 계산.
- D1 프로필 저장, 동시 갱신 버전 검사, 같은 전투 보상 중복 수령 방지.
- GAS 호스팅은 HTML 및 공개 Firebase 설정 + 공개 Worker URL만 제공하며 서비스 계정 개인키와 UrlFetch 할당량 의존성 제거.
- **주의:** 실제 배포 계정·비밀키 사용 없이 로컬 단위 테스트로 검증한 배포 후보. 무료 한도에 맞는 실전 PvP 안정성과 대규모 부하는 검증 전.
