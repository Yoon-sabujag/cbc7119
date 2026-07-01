# Phase 25 — CONTEXT (화재수신반 원격감시·경보 UI)

> Substitutes discuss-phase. All decisions below are **LOCKED** — the UI researcher should render/contract against them, not re-ask. Track: **cbc7119-design (시각 전용)** · `main` push → cbc7119-preview 자동배포만 · **wrangler 금지**.

## Sources (SSOT)
- **설계·룰 SSOT**: `.planning/phases/25-panel-monitoring/25-HANDOFF.md` §2 (cbc7119-design 작업지시) + §1 (API 계약, 렌더 기준) + §2.2/§2.3 (변환 룰).
- **시안 (개념 참고, verbatim CSS 추출 대상)**: `sketches/mobile-sketch.html`, `sketches/desktop-sketch.html`. 원본은 `~/Desktop/수신반-미리보기/{index,desktop}.html`. 샘플 이미지(`fire.png`/`equip.jpeg`/`normal.jpg`)는 같은 Desktop 폴더 — repo 밖.
- **코드 통합점**: `.planning/phases/25-panel-monitoring/25-INTEGRATION-MAP.md` (line-verified). 렌더 대상 파일·삽입 지점·재사용 컴포넌트·토큰·리스크 전부 여기.

## Scope — surfaces to contract (this phase = UI-SPEC only)
**모바일 (4 TSX 표면):**
1. **대시보드 카드+칩** (`DashboardPage.tsx` 모바일 트리) — '오늘 점검 대상' 바로 아래 순수 16:9 수신반 화면 카드(chrome 0, 탭→화재수신반) + 배너 우측 경보 전용 칩.
2. **화재수신반 페이지** — 기존 `FireAlarmModal`(InspectionPage) **확장**: 헤더 점검모드 토글 + 라이브 카드(탭→줌 뷰어) + 최근 이벤트(48h) + 수기폼(기존 5필드).
3. **경보 풀스크린** — 새 라우트 `/fire-alarm` (푸시 탭 목적지), 빨강/초록 takeover + '확인'(ACK).
4. **전체화면 줌 뷰어** — 라이브 16:9 + 더블탭/핀치 (FloorPlanPage 패턴).

**데스크톱 (2 TSX 표면):**
5. **대시보드 라이브 위젯** (`DashboardPage.tsx` 데스크톱 트리) — 우측 컬럼 최상단, 클릭→일반점검 / 더블클릭→줌 오버레이.
6. **일반점검 3분할 상세 pane** (`DesktopInspectionView`) — 화재수신반 선택 시 상세 pane = 라이브→(경보중)비화재보 초안+폼→최근 이벤트→(평상시)수기폼. + 화면 내 경보 takeover modal + 줌 오버레이.

**각 표면 3상태**: 평상시 / 경보중 / 점검모드.

**추가 (비시각 클라이언트, 이 트랙 범위 — HANDOFF §2.0b):**
7. **Service Worker 딥링크** (`src/sw.ts`) — push 핸들러가 payload `url` 포워드 + `notificationclick`이 `data.url` 읽어 실제 라우팅. 화재→경보 풀스크린(`/fire-alarm`), 설비→화재수신반 페이지. (UI-SPEC 시각 계약 대상은 아니지만 phase 범위 · plan/execute에서 구현.)

## Non-goals (out of scope)
- **iOS 푸시·연결 감시 view (시안 뷰5)** = 개념도, **TSX 대상 아님**. 딥링크 목적지(경보 풀스크린)만 실제 구현.
- 백엔드·D1·Worker 엔드포인트·맥 에이전트 = **별도 트랙(cbc7119-data)**. 이 콘솔은 UI만.
- wrangler/배포 명령 일절 금지. main push 자동 preview만.

## LOCKED user decisions (이 세션)
- **세션 범위 = UI-SPEC까지** (gsd-ui-checker 6차원 검증 후 멈춤·리뷰 게이트). plan/execute는 다음 세션.
- **모바일 화재수신반 = 기존 `FireAlarmModal` 확장** (새 라우트 승격 X). 진입점·라우팅 그대로, 리스크 최소. 데스크톱은 3분할 상세 pane과 폼 로직 공유.

## LOCKED design rules (HANDOFF §2.2/§2.3 + integration map)
### 아이콘 = lucide-react 통일 · 이모지 0
시안의 이모지·인라인 SVG는 전부 플레이스홀더:
| 시안 | lucide |
|---|---|
| 🔕 점검모드 | `BellOff` |
| 🔴 화재 (아이콘 문맥) | `Flame` |
| ⚠️ 초안보완/연결 감시 | `AlertTriangle` |
| ⚙️ 자동화 안내 | `RefreshCw` |
| ⤢ 전체화면 | `Maximize2` |
| ⚙️ 설비동작 kind | `Settings` |
| 화재수신반 타이틀 종모양 | `BellRing` |
| 햄버거/뒤로/톱니/QR/닫기 | `Menu` / `ChevronLeft` / `Settings` / `QrCode` / `X` (기존 페이지 컨벤션) |
- **LIVE·정상·화재 상태 점 = 아이콘 아님 → dot span** (애니메이션 유지). 🟢 정상 = green dot span.
- lucide는 `size={N}` prop.

### 다크 토큰 (시안 :root == 앱 tokens.css — 검증 완료)
- 경보 빨강 `--danger-bar #ef4444` / 설비 초록 `--safe-bar #22c55e` / 점검 회색 `--t2 #adb6c0` `--t3 #8b949e`.
- 화재 빨강(danger)은 기존 fire(주황·미조치 `#f97316`)와 **구분**.
- Tailwind 클래스 = full semantic names (`bg-surface-raised`, `text-text-primary`, `border-border-default`, `text-danger-bar`, `text-safe-bar`, `bg-danger-bg`, `bg-safe-bg`). 짧은 alias(`--t1/--fire/--acl`)는 CSS var 전용 → 데이터 구동 색만 인라인 `style`. tokens.css에 없는 hex만 `text-[#hex]` arbitrary.

### 헤더 크롬 룰 4종
- 컨테이너 `h-12`(48) / 헤더 안 모든 버튼·토글 32px 영역 = **`w-7 h-7`** (⚠️ tailwind override: `w-8`=48px, `w-7`=32px) / 타이틀 `text-title font-semibold`(18·600, font-semibold load-bearing) / 백버튼 옆 좌측.
- 작은 칩·토글 텍스트 = `leading-none` 명시.
- 헤더 통일 시 헤더 안 **모든** 버튼 종류 같이 32 (일부만 바꾸면 좌우 크기 어긋남).

### 풀스크린/줌 스크롤락
- `body.position:fixed` **금지** (iOS safe-area 깨짐) → `overflow:hidden` + touchmove 차단 (SideMenu 패턴).
- viewport: `IS_ANDROID?100svh:100dvh`; 오버레이 `top:var(--sat)/bottom:calc(54px+var(--sab))`.

## 표시 분기 룰 (색 = 의미 고정)
- **경보=빨강(danger) / 설비=초록(safe) / 점검모드=회색.**
- **경보칩**(대시보드 우측)은 경보 해제 또는 화재수신반 기록 조치완료+저장 시 **소멸**.
- **자동초안 구분 기본값 = 비화재보(non_fire)** (대부분 오작동). 실화재면 근무자가 화재보로 변경. (기존 `FireAlarmModal` default와 일치.)
- **점검모드**: 신규 push·경보칩·자동초안·자동저장 전부 중지. **라이브뷰+이벤트 이력 조회는 계속**, 수기폼만 숨김.
- **데스크톱 경보 표현**: 헤더 아래 빨강 배너 **제거** — 라이브 화면 빨강 + 초안 안내로만. 점검모드 안내문 = 라이브 화면 위 배너. 상세 헤더 점검모드 토글은 '정상 라이브' pill·'전체화면' 버튼 **제거**하고 그 자리. 줌 오버레이 '핀치 투 줌' 텍스트 표시 제거(동작 유지).

## 데이터 = API 계약 기준 렌더 (시안 mock 하드코딩 금지)
표시 로직·라벨·상태 전이는 전부 **HANDOFF §1 계약·백엔드 응답 기준**. 시안 더미(B1F-2(DIV), 12:50:35 등)를 그대로 박지 말 것.
- 라이브 이미지 = `GET /api/public/panel/latest.jpg?t=<updatedAt>` (no-store, 없으면 204→**placeholder**). 스냅샷 = `/api/public/panel/<key>.jpg`.
- 상태 = `GET /api/panel/status` (frameUpdatedAt·agentOnline·activeAlarm·maint). 프레시니스 = frameUpdatedAt vs now → '방금 / N초 전 / 지연'.
- 경보칩 = `GET /api/alarm/active`; 이벤트(48h) = `GET /api/alarm/events?hours=48` (점검모드에서도 조회); ACK = `POST /api/alarm/:id/ack`; 점검모드 = `GET/PUT /api/panel/maint`.
- **경보 중 점검모드 ON** → 서버 409 `active_alarm_requires_confirm` → 프론트 확인 팝업 → `confirmAlarm:true` 재요청 (HANDOFF §1.5).
- 수기 기록 저장 = 기존 `fireAlarmApi.create` 그대로. **저장 후 `invalidateQueries(['fire-alarm-recent'])` 추가** (현재 누락된 갭).
- **엔드포인트 미배포(this repo에 panel/alarm 라우트 없음) 시 graceful**: 라이브 204→placeholder, 상태/이벤트/active 실패→빈/평상시 폴백, 토글은 낙관적. UI가 500/404로 깨지면 안 됨.

## Service Worker 딥링크 (HANDOFF §2.0b · 이 트랙 범위)
현재 `src/sw.ts`:
- `push` 핸들러(`:34-50`) = `{title,body,type}`만 읽고 `data:{type}` 저장 — payload `url` **드롭**.
- `notificationclick`(`:53-64`) = `data.url` **무시**, 기존 창은 `focus()`만(내비게이션 없음)·없으면 `openWindow('/')`. 항상 루트.

**변경 (blocker 아님, 백엔드·나머지 UI와 독립):**
- push 핸들러: payload superset(`{kind,alarmType,alarmId,location,detectedAt,url}` — §1.4) 중 `url`(+필요 시 `alarmType`)을 `notification.data`로 포워드.
- `notificationclick`: `data.url` 읽어 **실제 라우팅** — 기존 WindowClient면 `client.navigate(url)`+`focus()`, 없으면 `openWindow(url)`. `data.url` 없을 때 폴백 매핑: 화재(`fire`)→`/fire-alarm`(경보 풀스크린), 설비(`equip`)→화재수신반 페이지(모바일 = `/inspection` + FireAlarmModal 오픈 상태). 백엔드가 per-type `url` 보내면 그대로 존중(forward-compat).
- 시각 계약(UI-SPEC) 대상 아님 → plan/execute 단계 구현. UI-SPEC은 딥링크 **목적지**(경보 풀스크린 라우트 존재)만 보장.

## 재사용 (신규 작성 대신)
- `useIsDesktop` (분기), `Donut`/`DutyChip`/`RoleLabel`/`CatBar`/`StatusBadge` (`ui/index.tsx`), `ui/icons.tsx` 커스텀 SVG, `GlobalHeader` 크롬, `FireAlarmModal` 폼(확장), `fireAlarmApi`, FloorPlanPage 핀치줌, SideMenu 스크롤락. 상세는 25-INTEGRATION-MAP.md.

## Open questions
**없음.** 모든 시각·상호작용·데이터 계약이 위에서 확정됨. 시안에서 손볼 건 시각 디자인뿐(표시 분기·라벨 룰은 코드/계약 그대로).
