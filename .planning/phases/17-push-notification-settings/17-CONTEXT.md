# Phase 17: Push Notification Settings - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

PWA 푸시 알림 인프라 구축 + 설정 페이지 알림 토글 UI + Cloudflare Workers Cron 기반 알림 발송. 사용자가 알림 유형별로 구독/해제할 수 있고, 서버가 Cron으로 자동 발송한다.

</domain>

<decisions>
## Implementation Decisions

### iOS 호환성
- **D-01:** iOS 26+ 타겟으로 업데이트 — PWA 푸시 알림 완전 지원, fallback 불필요

### 알림 유형 (6종)
- **D-02:** 금일 점검 일정 알림 — Cron #1 (08:45 KST) 발송
- **D-03:** 전일 미완료 점검 알림 — Cron #1 (08:45 KST) 발송
- **D-04:** 미조치 항목 알림 — Cron #1 (08:45 KST) 발송
- **D-05:** 교육 D-30 알림 — Cron #1 (08:45 KST) 발송
- **D-06:** 행사 15분전 알림 — Cron #2 (*/5 매 5분) 발송
- **D-07:** 행사 5분전 알림 — Cron #2 (*/5 매 5분) 발송

### Cron 구성
- **D-08:** Cron 2개 사용 — #1: 매일 08:45 (점검+미조치+교육), #2: */5 (행사 임박)
- **D-09:** Cloudflare Workers 무료 플랜 Cron Trigger 한도 (최대 5개) 내 운용, 여유 3개

### 구독 UX
- **D-10:** 알림 토글 ON 시 브라우저 권한 요청 자동 트리거 → 허용 시 자동 구독
- **D-11:** 브라우저 권한 차단 시 토글 비활성화(회색) + 탭하면 "브라우저 설정에서 알림을 허용해주세요" 안내

### 토글 배치 (설정 페이지)
- **D-12:** 그룹 분리 배치 — 점검 그룹(금일 점검/미완료/미조치) | 일정 그룹(행사/교육 D-30)
- **D-13:** 기존 SettingsPanel의 알림 섹션 스타일(Row + Toggle 컴포넌트) 유지

### 푸시 인프라
- **D-14:** Web Push API + VAPID 키 사용 — Cloudflare Workers에서 web-push 발송
- **D-15:** D1에 push_subscriptions 테이블 생성 (staff_id, endpoint, p256dh, auth, notification_preferences JSON)
- **D-16:** notification_preferences에 알림 유형별 on/off 저장 (서버사이드, 구독 시 기본 전체 ON)

### Claude's Discretion
- VAPID 키 생성 및 환경변수 관리 방식
- push_subscriptions 테이블 상세 스키마
- Cron Worker 내부 로직 구조
- 푸시 메시지 본문 포맷
- Service Worker push event handler 구현 상세

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 설정 페이지 (Phase 16 산출물)
- `cha-bio-safety/src/components/SettingsPanel.tsx` — 현재 알림 토글 UI (Toggle, Row 컴포넌트), 비밀번호/이름 변경 폼
- `cha-bio-safety/src/App.tsx` — SettingsPanel import, settingsOpen 상태

### PWA 설정
- `cha-bio-safety/vite.config.ts` — VitePWA 설정, workbox 캐싱 전략, manifest

### 인증/API
- `cha-bio-safety/src/stores/authStore.ts` — staff 상태, logout, JWT 관리
- `cha-bio-safety/src/utils/api.ts` — API 클라이언트 패턴, authApi
- `cha-bio-safety/functions/_middleware.ts` — JWT 미들웨어, 공개 라우트 목록

### 데이터 소스 (알림 대상 조회)
- `cha-bio-safety/functions/api/schedule/index.ts` — 점검 일정 데이터
- `cha-bio-safety/functions/api/remediation/index.ts` — 미조치 항목 데이터
- `cha-bio-safety/functions/api/education/index.ts` — 교육 일정 데이터

### Cloudflare 설정
- `wrangler.toml` — Workers 바인딩, D1, R2 설정

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SettingsPanel.tsx` Toggle 컴포넌트: 38x21 토글 버튼 — 알림 토글에 그대로 사용
- `SettingsPanel.tsx` Row 컴포넌트: label + sub + children 레이아웃 — 알림 행에 활용
- `authStore.ts`: staff.id로 push subscription을 staff에 연결
- `api.ts` req() 패턴: 새 pushApi 네임스페이스 추가 가능

### Established Patterns
- 인라인 스타일 + CSS 변수 (var(--bg3), var(--t1) 등)
- React Query mutation으로 API 호출
- toast 알림 (react-hot-toast)
- D1 마이그레이션 파일 (migrations/ 디렉터리)

### Integration Points
- SettingsPanel.tsx 알림 섹션: 더미 토글 → 실제 구독/해제 로직으로 교체
- vite.config.ts: Service Worker에 push event handler 추가 필요
- wrangler.toml: Cron Trigger 2개 추가, VAPID 환경변수 추가
- functions/: 새 API 엔드포인트 (push subscribe/unsubscribe, preferences)
- functions/_scheduled.ts (또는 유사): Cron handler 신규 생성

</code_context>

<specifics>
## Specific Ideas

- 기존 SettingsPanel의 더미 "승강기 점검 D-7 알림" 토글은 제거
- Cron 최대 5개 한도 준수 — 현재 2개 사용, 향후 확장 여유 3개
- 08:45 KST Cron 1개에서 점검/미완료/미조치/교육 4가지 알림을 모두 처리
- 행사 알림은 */5 Cron으로 매 5분마다 체크 → 15분전/5분전 임박 행사 감지 시 발송

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-push-notification-settings*
*Context gathered: 2026-04-07*
