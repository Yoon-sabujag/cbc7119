# CHA Bio Complex Fire Safety Management (cha-bio-safety)

차바이오컴플렉스 방재팀 소방안전 통합관리 PWA (Cloudflare Pages + D1 + R2).

## 푸시 알림 테스트

관리자(admin) 계정으로 본인 브라우저/기기에 테스트 푸시가 실제로 도달하는지 확인할 수 있다.

1. admin 계정으로 로그인한다.
2. 설정(우상단 ⚙️) → 알림 → "푸시 알림" 토글을 ON.
3. 브라우저가 알림 권한을 묻는다 → 허용.
4. 같은 알림 섹션 내 "🔔 테스트 푸시 보내기" 버튼을 클릭.
5. 기기에 **제목: 테스트 푸시 / 본문: 수신 확인용** 알림이 뜨면 OK.
6. 성공/실패 건수가 토스트로 표시된다 (예: `테스트 푸시 발송: 1/1 성공`).

만료된 구독(HTTP 410/404)은 자동으로 DB에서 삭제된다.

### VAPID 키 설정 (최초 1회)

Worker와 Pages **양쪽에 동일한 VAPID 공개/비밀 키** 쌍을 등록해야 한다.

```bash
# Worker (cbc-cron-worker) — 기존에 이미 등록되어 있을 수 있음. `npx wrangler secret list`로 확인.
cd cbc-cron-worker
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY

# Pages (cha-bio-safety) — 위와 동일한 값을 사용할 것
cd ../cha-bio-safety
npx wrangler pages secret put VAPID_PUBLIC_KEY --project-name cbc7119
npx wrangler pages secret put VAPID_PRIVATE_KEY --project-name cbc7119
```

`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`가 Pages에 없으면 테스트 버튼 클릭 시 500
`VAPID 키가 서버에 설정되지 않았습니다` 에러가 반환된다 — 등록 누락 진단용 신호.

### 권한 정책

- `POST /api/push/test`는 admin 전용 (assistant는 403).
- 발송 대상은 **호출자 본인의 구독만** (다른 사용자 기기로 발송하지 않는다).

## 배포

```bash
cd cha-bio-safety
npm run deploy          # 프로덕션에 배포하려면 반드시 --branch production 사용하는 script인지 확인
```

※ 직접 `wrangler pages deploy`를 쓸 경우 **`--branch production` 누락 시 Preview 환경으로 배포된다.**
