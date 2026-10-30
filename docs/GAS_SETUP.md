# 신성 디펜스 공식 Google Apps Script 배포

## 지금까지 만든 것 유지
- Firebase Spark: 이메일 로그인
- Cloudflare Worker `shinsung-game`: 게임 API 및 WebSocket
- Cloudflare D1: 플레이어 데이터
- Durable Objects: PvP/협동전 전투 서버
- GitHub: 전체 소스코드, 자동 빌드 및 테스트

**바뀐 것은 최종 접속 주소뿐입니다.** 게임 소스/맵/캐릭터/DB는 교체하지 않습니다.

## 최종 공식 접속 주소 만들기 (한 번만)
1. Cloudflare 빌드가 완료된 뒤 아래 주소에서 CSS/JS 텍스트가 보이는지 확인합니다.
   - https://shinsung-game.joehw0405.workers.dev/game.js
   - https://shinsung-game.joehw0405.workers.dev/game.css
2. https://script.google.com/ 에서 **새 프로젝트** 생성.
3. `Code.gs` 파일의 전체 내용을 [server/Code.gs](https://github.com/opoxdev/shinsung_game/blob/main/server/Code.gs)와 동일하게 복사.
4. **+ → HTML**을 클릭해 이름이 `Index`인 파일을 만든 후 [server/Index.html](https://github.com/opoxdev/shinsung_game/blob/main/server/Index.html) 내용 전체를 복사.
5. **배포 → 새 배포 → 웹 앱**: 실행 사용자 `나`, 접근 가능 사용자 `모든 사용자` 선택 후 배포.
6. 생성된 `https://script.google.com/macros/s/.../exec` 주소가 **공식 게임 링크**입니다.

Firebase 공개 구성 및 Cloudflare Worker 주소는 Code.gs에 이미 작성되어 있으므로 API 키 추가 입력이 필요하지 않습니다.

## 앞으로 업데이트
GitHub 게임 코드 수정 → Cloudflare가 수정된 게임 JS/CSS를 빌드 및 게시 → 친구들이 동일한 **GAS /exec** 주소에서 새 버전 사용.

GAS의 `Code.gs`나 `Index.html` 자체를 수정한 경우에만 GAS를 다시 배포해야 합니다. 게임 로직/그래픽 수정은 GAS 재배포가 필요 없습니다.

기존 Cloudflare 빌드 설정은 그대로 사용: `npm run build` 및 `npx wrangler deploy --config cloudflare/wrangler.toml`.

## 검증 사항
- 현재 확인된 `/health` 성공은 기본 Worker 접근만 확인한 것입니다.
- 반드시 새 `/game.js`, `/game.css`가 보이는지 확인한 뒤 GAS를 열어야 합니다.
- GAS HTML의 iframe 제한 때문에 브라우저 로그인·WebSocket 기능을 실제 2계정으로 테스트해야 합니다.
- 운영은 무료 Spark/Free 요금제만 사용하며 유료 전환은 하지 않습니다.
