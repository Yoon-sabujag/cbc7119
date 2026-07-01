# 화재수신반 미러링 + 경보 푸시 — 핸드오프

> **한 줄 요약:** 방재실 화재수신반을 캡처보드로 맥미니에 미러링하고, 색(빨강=화재/초록=설비) 기반 rising-edge 감지로 근무 중 직원에게 경보 푸시를 보내며, PWA에서 라이브뷰·경보 ACK·점검모드를 조작하는 무인 원격감시 시스템. 추가 비용 $0(기존 Cloudflare + 보유 맥미니), 다크테마, 3-트랙(디자인·데이터·에이전트) 병렬 개발.

## 트랙별 담당 경로

| 트랙 | 담당 경로 | 역할 | 배포 방식 |
|---|---|---|---|
| **cbc7119-design** | `~/Documents/cbc7119-design` | 시각 전용(시안→TSX). 모바일·데스크톱 UI/컴포넌트 | `main` push → **cbc7119-preview 자동배포만** (wrangler 금지) |
| **cbc7119-data** | `~/Documents/cbc7119-data` | 백엔드(D1 스키마·Worker 엔드포인트·DO 에스컬레이션·cron 자동화) | staging Pages+D1+R2 (prod 영향 0) → 검증 후 prod 콘솔이 별도 적용 |
| **맥 에이전트** | 맥미니 `~/panel-agent/` | 캡처·감지·업로드 standalone (repo 밖) | launchd 상시 구동. `AGENT_BASE` staging → prod 전환 |
| **prod** | `~/Documents/20260328` (`cha-bio-safety`) | staging 검증 완료 후 동일 변경 적용 | `production-sync.md` 게이트. migration은 `main` push=원격 즉시 적용 |

---

## 0. 개요 · 목표 · 제약

### 목표
방재실이 무인일 때에도 화재수신반의 상태를 원격에서 실시간 감시하고, 경보 발생 시 근무 중인 방재팀 직원 폰으로 즉시 푸시가 도달하도록 한다. 근무자는 어디서든 라이브뷰로 수신반 화면을 확인하고, 경보를 ACK 처리하며, 비화재보(오작동) 자동초안을 보완·저장할 수 있다.

### 핵심 동작 개념
- **미러링:** 맥미니에 연결된 캡처보드(USB3 Video)가 수신반 화면을 받아, 에이전트가 1~2초마다 최신 프레임을 R2에 덮어쓰기 업로드 → PWA가 `<img>`로 라이브 표시.
- **감지:** 에이전트가 HSV 색 비율(빨강=화재, 초록=설비동작)로 2-class 분류 + 히스테리시스/디바운스 rising-edge 상태머신. **정상→경보 전이 시 1회만** 서버에 `trigger`.
- **경보/푸시:** 서버가 dedupe·자동초안 생성·근무자 푸시·에스컬레이션(화재 20초×3)을 authoritative 하게 관리. 에이전트는 상태 전이 신호만 보냄.
- **점검모드:** 소방점검일에는 자동 ON → 신규 push·경보칩·자동초안·자동저장 억제(라이브뷰·이벤트 이력 조회는 유지).

### 제약
- **비용 $0:** 기존 Cloudflare 유료 플랜(Pages+D1+R2+Workers) + 보유 맥미니(M1)만 사용. 신규 유료 서비스 없음.
- **다크테마:** 앱 `tokens.css` 다크 토큰 준수. 경보 빨강 `--danger-bar #ef4444`, 설비 초록 `--safe-bar #22c55e`, 점검 회색 `--t2/--t3`.
- **3-트랙 병렬:** 디자인(시각)·데이터(백엔드)·맥 에이전트는 상단 표의 경로에서 격리 진행. 공통 인터페이스는 **1번 API 계약**이 SSOT. 계약 확정 후 세 트랙 동시 착수 가능.
- **기존 규약 준수:** 응답 `{ success, data?, error? }`, 컬럼 스네이크케이스, 시각은 KST 벽시계 문자열 `'YYYY-MM-DD HH:MM:SS'`, R2 바인딩 `STORAGE`(버킷 `cha-bio-storage`), D1 `DB`.

---

## 1. API 계약 (v1) — SSOT

> 세 트랙 모두 이 계약을 기준으로 렌더/구현/전송한다. 시각 트랙의 mock·하드코딩 문구, 에이전트의 로컬 상태는 절대 계약을 대체하지 않는다.

**공통 규약:** 응답 `{ success:boolean, data?:T, error?:string }`, 컬럼 스네이크, 시각은 **KST 벽시계 문자열 `'YYYY-MM-DD HH:MM:SS'`**(`fire_alarm_records.occurred_at`와 동일), R2 바인딩 `STORAGE`(버킷 `cha-bio-storage`), D1 `DB`. 신규 env: **`AGENT_KEY`**(에이전트 공유시크릿), `VAPID_*`.

### 1.0 인증 · 미들웨어 변경 (백엔드 선행)
- `functions/_middleware.ts` `PUBLIC`에 추가: `/api/panel/frame`, `/api/alarm/trigger`, `/api/alarm/clear`, `/api/alarm/heartbeat`. 이 4개는 JWT 아님 → 핸들러 첫 줄에서 헤더 **`X-Agent-Key === env.AGENT_KEY`** 검증, 불일치 시 `401 {success:false,error:'agent unauthorized'}`.
- 라이브 프레임은 `<img>`가 Authorization 헤더를 못 실으므로 **공개**: 기존 `PUBLIC_PREFIX`의 `/api/public/` 하위로 서빙.
- CORS `Access-Control-Allow-Headers`에 `X-Agent-Key,X-Frame-Key,X-Frame-Ts` 추가.
- 나머지 `/api/alarm/*`, `/api/panel/maint`, `/api/panel/status`는 **기존 JWT** 보호.

### 1.1 라이브뷰 프레임

| 엔드포인트 | 인증 | 설명 |
|---|---|---|
| `POST /api/panel/frame` | X-Agent-Key | 에이전트가 1~2초마다 최신 프레임 업로드. body=raw JPEG. 헤더 `X-Frame-Key`(기본 `latest`, 경보 스냅샷은 `alarms/<clientId>`), `X-Frame-Ts`(KST). R2 key `panel/<X-Frame-Key>.jpg` **덮어쓰기** + `panel_agent_status.frame_updated_at` 갱신. → `{success,data:{key,updatedAt}}` |
| `GET /api/public/panel/latest.jpg` | 공개 | Worker 프록시. R2 `panel/latest.jpg` 스트림, `Content-Type:image/jpeg`, **`Cache-Control:no-store`**. PWA는 `?t=<updatedAt>` 쿼리로 캐시무효화(SW/브라우저). 없으면 204. |
| `GET /api/public/panel/alarms/<id>.jpg` | 공개 | 경보 순간 스냅샷(썸네일/줌 뷰어용). |
| `GET /api/panel/status` | JWT | 프레시니스+요약. → `{success,data:{ frameUpdatedAt, agentOnline:boolean, lastHeartbeatAt, activeAlarm:AlarmSummary|null, maint:MaintState }}` |

**서빙 방식:** R2 공개 URL 대신 **Worker 프록시** 채택(버킷 비공개 유지 + no-store 강제). 프레시니스는 `status.frameUpdatedAt` vs now 차이로 표시(예: `방금`/`Ns 전`, 임계 초과 시 "지연"). `agentOnline`=`now - lastHeartbeatAt < 180s`.

### 1.2 경보 인입 (맥 → Worker, X-Agent-Key)

**rising-edge 상태머신:** 에이전트는 정상→경보 **전이 시 1회** trigger, 리셋(경보→정상) 시 clear. 지속 경보를 매 프레임 재전송 금지.

| 엔드포인트 | 설명 |
|---|---|
| `POST /api/alarm/trigger` | 경보 시작. 아래 body. 서버: 동일 `type` **active 경보 존재 시 그 행 반환(멱등 dedupe)**; 없으면 `panel_alarms` 생성(status=`active`) → 점검모드 OFF일 때만 자동초안(`fire_alarm_records`, type=`non_fire`) 생성해 `draft_record_id` 연결 → 해당시간 근무자에게 1차 push. fire면 에스컬레이션 무장(§1.4). → `{success,data:{alarmId, draftRecordId, escalation:{maxCount,intervalSec}}}` |
| `POST /api/alarm/clear` | 수신반 리셋(경보→정상) 감지. body `{type?, at}`. active 경보를 `status=cleared, cleared_reason='agent_reset'`, 에스컬레이션 중지 → **재무장**. → `{success}` |
| `POST /api/alarm/heartbeat` | 1분 연결 감시. body `{at, agentVersion?, frameTs?}`. `panel_agent_status.last_seen_at` 갱신. 미수신 지속 시 스케줄러가 "모니터링 중단" push(§1.4). → `{success}` |

**trigger body**
```json
{
  "type": "fire | equip",            // fire=빨강(긴급), equip=초록(설비동작)
  "detectedAt": "2026-06-30 12:50:35", // KST
  "source": "visual | audio",
  "snapshotKey": "alarms/abc123",     // §1.1에서 먼저 업로드한 R2 key (선택)
  "confidence": 0.94,                  // 0~1 (선택)
  "redRatio": 0.31, "greenRatio": 0.02,// 감지 지표 (선택)
  "clientId": "abc123"                 // 에이전트측 dedupe 키 (선택)
}
```

### 1.3 PWA 조회/조작 (JWT)

| 엔드포인트 | 요청 | 응답 data |
|---|---|---|
| `GET /api/alarm/active` | — | `Alarm \| null` (status `active`/`acked`인 최신 1건, 칩·풀스크린용) |
| `GET /api/alarm/events?hours=48` | 쿼리 `hours`(기본48) | `Alarm[]` (detected_at DESC) — **점검모드에서도 조회 가능** |
| `POST /api/alarm/:id/ack` | `{}` | `Alarm` — status→`acked`, `acked_by`(=JWT staffId), `acked_at`. **에스컬레이션 즉시 중지.** 이미 acked/cleared면 멱등. |
| `GET /api/panel/maint` | — | `MaintState` |
| `PUT /api/panel/maint` | `{ enabled:boolean, reason?:string, confirmAlarm?:boolean }` | `MaintState` — 수동 override(§1.5) |

ACK는 근무자 누구나 가능(당직 한정 아님). `active`가 여러 type 공존 가능하나 UI 칩은 fire 우선.

### 1.4 에스컬레이션 규칙 (서버 상태관리)
- **대상:** 경보 `detected_at` 시각의 **근무 중 직원 전원**(cron-worker `getWorkingStaffIds` 재사용 — `비/휴/연차` 제외). 전체 4명 에스컬레이션 **없음**.
- **fire:** ACK까지 **20초 간격 × 최대 3회(≈60초)** 재발송. 근무자 중 누구든 `ack`/점검모드 ON/`clear` 시 중지.
- **equip:** **단발**(재발송 없음).
- **연결 감시:** v1 = 조회 응답에 `lastSeenAt` 포함 → PWA 온디맨드 표시(`now - last_seen_at > 180s`면 "수신반 모니터링 중단 · 마지막 신호 N분 전"). **프로액티브 push 는 prod `cbc-cron-worker` 로 이연**(staging 새 Worker 회피).
- **상태 필드**(`panel_alarms`): `push_count`, `next_push_at`(UTC epoch, 완료 시 null), `acked_at`. 서버가 `next_push_at<=now && status='active' && type='fire' && push_count<3`인 행을 처리·재발송·증가.
- **스케줄러 = 에이전트-티커 (Option B, 2026-07-01):** DO/cron 대신 **맥 에이전트가 경보 지속+미ACK 동안 20초마다 `POST /api/alarm/renotify {alarmId}`** → Worker 가 위 상태필드(`push_count<3`·`next_push_at`·status) 보고 재발송·증가. Pages+D1 완결, 새 Worker 0. 계약은 상태필드+`ack`/`clear` 중지만 고정하므로 프론트 무관.
- push payload: `{ kind:'panel_alarm', alarmType, alarmId, location, detectedAt, url:'/fire-alarm' }`. iOS는 푸시 탭→경보 풀스크린(ACK), OS 기본음+진동만 가능(커스텀 대음량 불가).

### 1.5 점검모드 계약

`MaintState = { enabled, source:'auto'|'manual', reason, autoOffAt, turnedOnAt, turnedOnBy }`

- **자동 ON/OFF = 온디맨드 계산 (Option B):** 스케줄러 토글 대신 조회·`trigger` 시점에 `enabled = (오늘 소방점검일 && 현재 일과시작~[야간일정 없으면 17:30 / 있으면 21:00] 사이) || 수동override유효` 계산. `source`는 결과에 따라 auto/manual, `autoOffAt`은 계산값. **cron 불필요·드리프트 없음.** 수동 override(on/off+만료)만 D1 저장.
- **억제(ON 동안):** 신규 push·경보 chip·자동초안·이벤트 자동저장 **전부 중지**. `trigger`는 200 받되 `panel_alarms` status=`suppressed`로만 기록(무통지). **라이브뷰 + `events` 이력 조회는 계속 가능**. 수기 기록 폼만 프론트에서 숨김.
- **엣지 — 경보 중 점검모드 ON** (`PUT /api/panel/maint {enabled:true}`): active 경보 존재 시 서버가 `confirmAlarm:true` 없으면 `409 {success:false,error:'active_alarm_requires_confirm'}` 반환(프론트가 확인 팝업). `confirmAlarm:true`면 → 에스컬레이션 중지 + active 경보 `status=cleared, cleared_reason='maint'` + **자동초안 폐기**(`draft_record_id` 미저장 삭제) + 점검모드 전환. 자동복구(17:30/21:00) 그대로.

### 1.6 데이터 형상

**`panel_alarms`** (신규 D1 테이블 = 경보 레코드 겸 이벤트 로그)
```
id TEXT PK
type TEXT CHECK(type IN ('fire','equip'))
status TEXT CHECK(status IN ('active','acked','cleared','suppressed'))
detected_at TEXT NOT NULL          -- KST 'YYYY-MM-DD HH:MM:SS'
source TEXT CHECK(source IN ('visual','audio'))
confidence REAL                    -- nullable
red_ratio REAL, green_ratio REAL   -- nullable
snapshot_key TEXT                  -- R2 key (nullable)
acked_by TEXT, acked_at TEXT       -- nullable
push_count INTEGER NOT NULL DEFAULT 0
next_push_at INTEGER               -- UTC epoch, nullable
cleared_at TEXT
cleared_reason TEXT CHECK(cleared_reason IN ('agent_reset','ack','maint','record_saved')) -- nullable
draft_record_id TEXT               -- FK fire_alarm_records.id (nullable)
created_at TEXT NOT NULL DEFAULT (datetime('now'))
-- INDEX(status), INDEX(detected_at)
```

**Alarm (JSON, camelCase 매핑):** `{ id,type,status,detectedAt,source,confidence,snapshotUrl,ackedBy,ackedAt,clearedReason,draftRecordId }` (`snapshotUrl`=`/api/public/panel/<snapshot_key>.jpg`).

**AlarmSummary** (status용): `{ id,type,detectedAt,location }`.

**`panel_agent_status`** (싱글턴 row id=`'agent'`): `{ last_seen_at, frame_updated_at, agent_version }` (+ 백엔드는 연결 감시 중복 억제용 `watchdog_notified_at` 추가 — §3①).

**점검모드 상태:** `app_settings` 키 `panel_maint`(JSON) 또는 단일행 `panel_maint_mode(enabled INTEGER, source TEXT, reason TEXT, auto_off_at TEXT, turned_on_at TEXT, turned_on_by TEXT, updated_at TEXT)`. → 데이터 트랙은 후자(단일행) 채택(§3①).

**자동초안**은 기존 **`fire_alarm_records`** 재사용(type=`non_fire` 기본, `location`/`cause`/`action` 근무자 보완, `created_by='panel-agent'`). 신규 컬럼 불필요.

### 1.7 관련 파일(prod, 절대경로)
- 미들웨어 `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/functions/_middleware.ts`
- 기존 화재수신반 API `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/functions/api/fire-alarm/index.ts`
- 기존 테이블 `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/migrations/0032_fire_alarm_records.sql`
- 근무자 필터 로직 `/Users/jongyupyoon/Documents/20260328/cbc-cron-worker/src/index.ts` (`getWorkingStaffIds`)

---

## 2. cbc7119-design 작업지시 — 수신반 원격감시·경보 UI (시각 전용)

> 담당 콘솔: `~/Documents/cbc7119-design`. 이 트랙은 **시각(시안→TSX)만**. 표시 로직·라벨·상태 전이는 전부 **1번 API 계약** 기준으로 렌더.

### 2.0 착수 방법 (GSD 필수, wrangler 금지)
- 이 콘솔은 순수 시각(시안→TSX)만. `wrangler` 명령 절대 금지 → `main` push 시 cbc7119-preview 자동배포만.
- 진입: 모바일·데스크톱 각 페이지를 `/gsd:sketch` 로 시안 확정 → `/gsd:ui-phase` 로 UI-SPEC 뽑고 TSX 변환. ad-hoc PLAN/SUMMARY 직접 작성 금지.
- 참고 시안(개념용, repo 무관): 모바일 `~/Desktop/수신반-미리보기/index.html`, 데스크톱 `~/Desktop/수신반-미리보기/desktop.html`. **시안 CSS 정의는 grep 추출해 verbatim 인용**(추측 토큰명 금지).

### 2.0b 푸시 딥링크 — Service Worker 업데이트 (필수, 2026-07-01 추가)
현재 `src/sw.ts` push 핸들러는 `{title,body,type}`만 읽고 `notificationclick`이 항상 `/`를 연다(`data.url` 무시). 백엔드는 §1.4 superset payload(`{kind,alarmType,alarmId,location,detectedAt,url:'/fire-alarm'}`)를 보내지만(forward-compatible), **"푸시 탭→경보 풀스크린" 실동작을 위해 SW가 `data.url`을 읽고 해당 라우트를 열도록 업데이트** 필요. 화재=경보 풀스크린 라우트, 설비=화재수신반 페이지. 블로커 아님(백엔드·나머지 UI와 독립).

### 2.1 구현할 화면/컴포넌트

#### 모바일
1. **대시보드(DashboardPage)** — '오늘 점검 대상' 카드 **바로 아래** 순수 16:9 **수신반 화면 카드**(상태줄·LIVE점·버튼 전부 없음, 탭→화재수신반 페이지). '오늘 점검 대상' 카드 **우측 정렬 영역** = 현재 경보 전용.
   - *평상시:* 우측 비움 / 화면 카드 = `normal.jpg`.
   - *경보중:* 우측 **빨강 경보칩**(blink, 탭→화재수신반) / 화면 카드만 `fire.png`(빨강)로 교체, 추가 chrome 0.
   - *점검모드:* 우측 **회색 점검칩**(무점멸) / 상단 배너·화면 배지 없음.
2. **화재수신반 페이지** (일반점검>화재수신반) — 헤더 **점검모드 토글**(단일 조작점) / 라이브 카드(탭→줌 뷰어) / 최근 이벤트(48h) / 수기 기록 폼.
   - *평상시:* 라이브 정상 + 비화재보 기본선택 폼.
   - *경보중:* 라이브 빨강 + **비화재보 자동초안 카드**(발생일시 자동, 장소/원인/조치 보완) + 하단 '조치완료 후 저장'.
   - *점검모드:* 헤더 토글 아래 **자동화 안내문 1개** + 라이브뷰·이벤트 이력은 유지, **수기폼/저장바 숨김**.
3. **경보 풀스크린**(라우트 `/fire-alarm`, 푸시 탭 목적지) — 빨강(화재)/초록(설비) takeover + '확인'(ACK) 버튼. 화재=재발송 경고 문구, 설비=단발.
4. **전체화면 줌 뷰어** — 라이브 16:9 상세, **더블탭+핀치 줌**(도면 점검 방식).
5. **iOS 푸시·연결 감시** — OS 잠금화면 렌더 개념도. **TSX 대상 아님**. 확인용: 화재푸시→경보 풀스크린 딥링크, 연결 감시=' 모니터링 중단' 푸시. 딥링크 목적지(3번)만 실제 구현.

#### 데스크톱
1. **대시보드** — 기존 사이드바 280px+2열 레이아웃 유지. **우측 컬럼 최상단 수신반 라이브 위젯**(클릭→일반점검, 더블클릭→줌 오버레이). 상태별 라이브 정상/빨강, 캡션 정상/화재.
2. **일반 점검(화재수신반) 3분할** — 사이드바 | 항목 카드 그리드(50%) | **화재수신반 상세 pane(50%, 세로 스택)**. 상세 pane = 라이브뷰 → (경보중)비화재보 초안 안내+폼 → 최근 이벤트 → (평상시)수기폼.
   - **상세 헤더에 점검모드 토글**을 두되 **'정상 라이브' pill 제거·'전체화면' 버튼 제거**(토글이 그 자리). 일반점검 master 헤더엔 토글 없음.
   - **헤더 아래 빨강 경보 배너 제거** — 경보 표현은 라이브 빨강 + 초안 안내로만.
   - 점검모드 안내문은 **라이브 화면 위 배너**로.
   - 줌 오버레이 '핀치 투 줌' 텍스트 표시 제거(동작 유지).

### 2.2 시안→TSX 변환 필수 룰
- **아이콘 = lucide-react 통일, 이모지 0** ([[feedback_tsx_wave_emoji_dot_gap]]). 시안 이모지/인라인 SVG는 전부 플레이스홀더:
  - 🔕 점검모드 → `BellOff` · 🔴 화재 → `Flame` · ⚠️ 초안보완/연결 감시 → `AlertTriangle` · ⚙️ 자동화 안내 → `RefreshCw` · ⤢ 전체화면 → `Maximize2` · ⚙️ 설비동작 kind → `Settings` · 화재수신반 타이틀 종모양 → `BellRing` · 그 외 인라인 SVG(햄버거→`Menu`, 뒤로→`ChevronLeft`, 톱니→`Settings`, QR→`QrCode` 등)도 기존 페이지 컨벤션대로 lucide 컴포넌트로.
  - **LIVE·정상·화재 상태 점은 아이콘 아님 → dot span**(애니메이션 유지). 🟢 정상 = green dot span.
  - lucide는 `size={N}` prop 패턴 ([[feedback_tailwind_token_class_pattern]]).
- **다크 토큰 준수:** 시안 `:root` 값 = 앱 `tokens.css`. 경보 빨강 `--danger-bar #ef4444`, 설비 초록 `--safe-bar #22c55e`, 점검 회색 `--t2/--t3`. tokens.css에 없는 hex는 `text-[#hex]` arbitrary fallback.
- **헤더 크롬 룰 4종** ([[feedback_header_chrome_unification_rules]]): 컨테이너 h-12(48) / 헤더 안 모든 버튼·토글 32px 영역 / 타이틀 18·600. ⚠️ **tailwind override 함정: w-8=48px, w-7=32px** ([[feedback_tailwind_w8_h8_is_48px]]) — 32짜리 버튼은 `w-7/h-7`. 작은 칩·토글 텍스트는 `leading-none` ([[feedback_text_caption_leading_none]]).
- **풀스크린/줌 오버레이 스크롤락:** `body.position:fixed` 금지(iOS safe-area 깨짐) → `overflow:hidden`+touchmove 차단 패턴 ([[feedback_body_scroll_lock_safe_area]]).
- 운영 소스는 redesign(Tailwind) 미도달 페이지일 수 있음 → old_string은 **운영 inline-style 기준**으로 재패치 ([[feedback_handoff_diff_prod_inline_vs_design_tailwind]]).

### 2.3 표시 분기 룰 (색 = 의미 고정)
- **경보=빨강 / 설비=초록 / 점검모드=회색.** 화재 빨강(danger)은 기존 fire(주황·미조치)와 구분.
- 경보칩(대시보드 우측)은 **경보 해제 또는 화재수신반 기록 조치완료+저장 시 소멸**.
- 자동초안 구분 기본값 = **비화재보**(대부분 오작동). 실화재면 근무자가 화재보로 변경. (→ 서버 자동초안은 1번 계약 §1.2의 `fire_alarm_records` type=`non_fire` 기본과 일치.)
- 점검모드: 신규 push·경보칩·자동초안·자동저장 전부 중지. **라이브뷰+이벤트 이력 조회는 계속**, 수기폼만 숨김.

### 2.4 주의 (계약 참조 매핑)
- **시안은 개념 참고용.** 표시 로직·라벨(정상/경보/설비/점검, 시각·장소 문구)·상태 전이는 전부 **1번 API 계약·백엔드 응답 기준**으로 렌더. 시안의 mock 데이터/하드코딩 문구를 그대로 박지 말 것 ([[feedback_sketch_realistic_data]]).
- 라이브 이미지 = `GET /api/public/panel/latest.jpg?t=<updatedAt>` (**1번 §1.1**, no-store, 없으면 204→placeholder). 스냅샷 = `/api/public/panel/<key>.jpg`.
- 상태 소스: `GET /api/panel/status`(frameUpdatedAt·agentOnline·activeAlarm·maint), 경보칩=`GET /api/alarm/active`, 이벤트=`GET /api/alarm/events?hours=48`, ACK=`POST /api/alarm/:id/ack`, 점검모드=`GET/PUT /api/panel/maint`(경보 중 ON은 **1번 §1.5**의 `confirmAlarm` 확인 팝업→409 처리). 프레시니스는 frameUpdatedAt vs now로 '방금/N초 전/지연' 표기.
- 데이터/백엔드는 별도 트랙(3번) — 이 콘솔은 시각만. 배포 언급=cbc7119-preview 자동배포뿐.

---

## 3. cbc7119-data 작업지시 — 수신반 원격감시·경보 백엔드 (staging)

> 담당 콘솔: `~/Documents/cbc7119-data/` (staging Pages+D1+R2, prod 영향 0). **prod 파일은 참조용**: `cha-bio-safety/functions/_middleware.ts`, `functions/api/fire-alarm/index.ts`, `migrations/0032_fire_alarm_records.sql`, `cbc-cron-worker/src/index.ts`(`getWorkingStaffIds`/`sendPush`). staging의 동일 트리에 구현 → staging 도메인 검증 → prod 콘솔이 별도 적용. 모든 엔드포인트·스키마는 **1번 API 계약**을 구현한 것.

> ### ★ 아키텍처 확정 (2026-07-01) — Option B: Pages+D1+R2 유지, 새 Worker 0
> DO/cron 은 Pages 안에 못 들어감(BLOCKER 1·2, staging 콘솔 확인). **새 staging Worker 를 만들지 않고** 아래로 재설계 확정(사용자 승인):
> - **에스컬레이션 (§3③ 폐기 → 에이전트-티커):** 맥 에이전트가 경보 지속(빨강)+미ACK 동안 **20초마다 재-POST** `POST /api/alarm/renotify {alarmId}` → Worker 가 `panel_alarms` 상태필드(`push_count<3`·`acked_at`·status) 보고 재발송·증가. **DO 불필요.** `ack`/점검모드 ON/`clear`/3회 도달 시 중지.
> - **점검모드 자동화 (§3④ 폐기 → 온디맨드 계산):** 스케줄러 토글 대신 `GET/PUT maint`·`trigger` 시점에 `enabled = (오늘 소방점검일 && 현재 일과시작~[야간일정 없으면 17:30 / 있으면 21:00] 사이) || 수동override유효` 계산. **cron 불필요**, 드리프트 없음. 수동 override(on/off+만료시각)만 D1 저장.
> - **연결 감시 (§3⑤ 축소):** v1 = 조회 응답에 `lastSeenAt` 포함 → **PWA 온디맨드 표시**('모니터링 중단 · 마지막 신호 N분 전'). **프로액티브 push 는 prod `cbc-cron-worker` 로 이연**(staging 검증 대상 아님, 새 Worker 회피).
> → 아래 **§3③④⑤ 는 이 박스로 대체.** §3①·②·⑥은 유효하되 — ②에 `POST /api/alarm/renotify` 추가, DO 바인딩/cron/`scheduled()` 관련은 전부 제거. `next_push_at`·`push_count` 상태필드는 유지(에이전트-티커가 이걸로 판단).
> - **`POST /api/alarm/:id/resolve` 추가 (계약 갭 보완, 2026-07-01 승인):** §1.6 `cleared_reason='record_saved'` + §2.3 "저장 시 칩 소멸"을 실제 동작시키는 엔드포인트가 §3② 표에 없었음 → **자동초안 in-place UPDATE**(발생장소/원인/조치 보완) + `fire_alarm_record` 확정 + `panel_alarm status=cleared, cleared_reason='record_saved'`(칩 소멸). ★**design 트랙: 화재수신반 자동초안 '저장' 버튼은 신규 `POST /api/fire-alarm` 이 아니라 이 `resolve` 를 호출**해야 칩이 사라짐.

### 3.① D1 스키마 (다음 순번 migration, 모두 IF NOT EXISTS)

`ls migrations | tail` 로 최신 번호 확인 후 그 다음(≥0088). 3개 테이블:

```sql
CREATE TABLE IF NOT EXISTS panel_alarms (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('fire','equip')),
  status TEXT NOT NULL CHECK(status IN ('active','acked','cleared','suppressed')),
  detected_at TEXT NOT NULL,              -- KST 'YYYY-MM-DD HH:MM:SS'
  source TEXT CHECK(source IN ('visual','audio')),
  confidence REAL, red_ratio REAL, green_ratio REAL,
  snapshot_key TEXT,
  acked_by TEXT, acked_at TEXT,
  push_count INTEGER NOT NULL DEFAULT 0,
  next_push_at INTEGER,                   -- UTC epoch ms, null=완료
  cleared_at TEXT,
  cleared_reason TEXT CHECK(cleared_reason IN ('agent_reset','ack','maint','record_saved')),
  draft_record_id TEXT,                   -- FK fire_alarm_records.id
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_panel_alarms_status ON panel_alarms(status);
CREATE INDEX IF NOT EXISTS idx_panel_alarms_detected ON panel_alarms(detected_at);

CREATE TABLE IF NOT EXISTS panel_agent_status (
  id TEXT PRIMARY KEY DEFAULT 'agent',
  last_seen_at TEXT, frame_updated_at TEXT, agent_version TEXT,
  watchdog_notified_at TEXT               -- 중복 '중단' push 억제용
);
INSERT OR IGNORE INTO panel_agent_status (id) VALUES ('agent');

CREATE TABLE IF NOT EXISTS panel_maint_mode (
  id TEXT PRIMARY KEY DEFAULT 'maint',
  enabled INTEGER NOT NULL DEFAULT 0,
  source TEXT, reason TEXT, auto_off_at TEXT,
  turned_on_at TEXT, turned_on_by TEXT, updated_at TEXT
);
INSERT OR IGNORE INTO panel_maint_mode (id) VALUES ('maint');
```

> **주의: `next_push_at` 단위 표기 불일치 해소** — 1번 계약 §1.4 본문은 "UTC epoch", §1.6 스키마 주석은 "UTC epoch"였고 여기 migration 주석은 "UTC epoch ms". **구현 시 ms 기준으로 통일**(DO `setAlarm`이 ms 사용). 계약서상 "UTC epoch"은 ms 밀리초 값을 의미하는 것으로 확정.

**batch atomic 아님 주의** ([[feedback_wrangler_d1_batch_not_atomic]]) — 이 파일은 CREATE만이라 IF NOT EXISTS로 재실행 안전. `deploy.yml`이 main push 시 `--remote` 적용하므로 staging에서 먼저 ([[feedback_d1_create_index_idempotency]], [[reference_deploy_yml_main_to_cbc7119]]).

### 3.② Worker 엔드포인트 (`functions/api/{panel,alarm}/…`)

**미들웨어 선행** (`_middleware.ts`) — 1번 §1.0 구현:
- `PUBLIC`에 `/api/alarm/trigger`, `/api/alarm/clear`, `/api/alarm/heartbeat` 추가(프레임은 `/api/panel/frame`도). `/api/public/`는 이미 `PUBLIC_PREFIX` → 프레임 서빙 커버.
- CORS `Access-Control-Allow-Headers`에 `,X-Agent-Key,X-Frame-Key,X-Frame-Ts` 추가.
- `Env`에 `AGENT_KEY:string`, `VAPID_*` 추가. 위 4개 핸들러 첫 줄: `if (request.headers.get('X-Agent-Key')!==env.AGENT_KEY) return Response.json({success:false,error:'agent unauthorized'},{status:401})`.

| 엔드포인트 | 처리 |
|---|---|
| `POST /api/panel/frame` | body=raw JPEG → `STORAGE.put('panel/'+frameKey+'.jpg', body,{httpMetadata:{contentType:'image/jpeg'}})`, `panel_agent_status.frame_updated_at=X-Frame-Ts`. → `{key,updatedAt}` |
| `GET /api/public/panel/latest.jpg` (+`alarms/<id>.jpg`) | `STORAGE.get(key)` → 없으면 204; 있으면 스트림 `Content-Type:image/jpeg`, **`Cache-Control:no-store`** |
| `GET /api/panel/status` (JWT) | `frameUpdatedAt`, `agentOnline = now-last_seen_at<180s`, `lastHeartbeatAt`, `activeAlarm`(AlarmSummary\|null), `maint` |
| `POST /api/alarm/trigger` | 아래 상세 |
| `POST /api/alarm/clear` | active 행 → `status=cleared,cleared_reason='agent_reset',cleared_at`, escalation 중지(DO cancel) |
| `POST /api/alarm/heartbeat` | `last_seen_at=at`, `agent_version`; `watchdog_notified_at` 리셋 |
| `GET /api/alarm/active` (JWT) | `status IN('active','acked')` 최신 1건 매핑 |
| `GET /api/alarm/events?hours=48` (JWT) | `detected_at DESC`, **점검모드도 조회 가능** |
| `POST /api/alarm/:id/ack` (JWT) | `status='acked',acked_by=staffId,acked_at`; escalation 즉시 중지; 이미 acked/cleared면 멱등 |
| `GET/PUT /api/panel/maint` (JWT) | §3④·1번 §1.5 |

**trigger 로직** (멱등 dedupe → 초안 → 1차 push → 에스컬레이션 무장):
1. `panel_maint_mode.enabled=1`이면 `panel_alarms status='suppressed'`만 INSERT하고 200(무통지) 종료.
2. 동일 `type` active/acked 존재 시 그 행 반환(멱등).
3. 없으면 INSERT(`status='active'`). fire면 `fire_alarm_records`에 초안 INSERT(`type='non_fire'`, `created_by='panel-agent'`, `occurred_at=detectedAt`) → `draft_record_id` 연결. equip은 초안 생략(설비=단발).
4. `getWorkingStaffIds(env, kstNow, dateStr)` 대상 1차 push. **`sendPush`/`getWorkingStaffIds`를 `functions/_lib/push.ts`로 추출**(cron-worker 코드 복붙, `@block65/webcrypto-web-push` 의존 추가). VAPID 키가 Pages env에 있는지 확인.
5. fire면 escalation 무장(`push_count=1,next_push_at=now+20s`), DO 알람 set. → `{alarmId,draftRecordId,escalation:{maxCount:3,intervalSec:20}}`.

### 3.③ 에스컬레이션 엔진 — **Durable Object alarm 채택**

**이유:** cron 최소 1분 → 20초 불가. 에이전트 re-POST는 화재 시 에이전트 프리즈=재발송 중단(가장 위험한 순간에 의존) → 부적합. DO는 20초 정밀 + 서버 authoritative + `ack`/`clear`/`maint`가 `storage.deleteAlarm()` 한 줄로 취소, 재무장 무료. Pages Functions는 DO 바인딩 지원, 단일 인스턴스(`idFromName('panel')`).

`wrangler.toml`에 DO 바인딩 + `[[migrations]] new_sqlite_classes`. `alarm()` 핸들러:
```
행 조회: status='active' AND type='fire' AND push_count<3 AND next_push_at<=now
→ 근무자 재push, push_count++, next_push_at = push_count<3 ? now+20s : null
→ 남은 행 있으면 setAlarm(next_push_at)
```
equip은 무장 안 함(단발). ack/clear/maint-confirm 시 해당 행 종료 + `deleteAlarm()`. (→ 1번 §1.4의 상태필드 계약만 고정, 구현 방식은 자유. 프론트 무관.)

### 3.④ 점검모드 자동화 (cbc-cron-worker에 핸들러 추가)

`cbc-cron-worker/src/index.ts` `scheduled` switch에 신규 cron 추가(staging cron-worker에 먼저; 자동 발송 로직은 형제 디렉토리 cron-worker에 있음 — [[reference_cron_worker]]):
- **자동 ON — 일과 시작(예 `0 23 * * *`=KST 08:00):** `schedule_items`에서 오늘 `inspection_category` 소방 계열 존재 확인. 있으면 `panel_maint_mode`: `enabled=1,source='auto'`, `auto_off_at` = 야간 일정(오늘 `category='event'` 또는 야간 표식) 있으면 `21:00` else `17:30`.
- **자동 OFF — `30 8 * * *`(17:30) + `0 12 * * *`(21:00):** `source='auto'`이고 `now>=auto_off_at`면 `enabled=0`. 수동 override(`source='manual'`)는 자동 OFF가 건드리지 않음(단 다음날 자동 ON은 정상). *(cron은 UTC. KST-9h 환산 정확히.)*

**엣지 — 경보 중 `PUT /api/panel/maint {enabled:true}`** (1번 §1.5): active 경보 존재 & `confirmAlarm` 미포함 → `409 {error:'active_alarm_requires_confirm'}`. `confirmAlarm:true`면 escalation 중지(DO cancel) + active 경보 `status=cleared,cleared_reason='maint'` + 미저장 `draft_record_id` 삭제 + 점검모드 ON. 자동복구 그대로.

### 3.⑤ 연결 감시

기존 `handleEventNotifications`(`*/5 * * * *`)에 append 또는 신규 5분 cron: `panel_agent_status` 조회, `now-last_seen_at>180s` AND `watchdog_notified_at` 미설정(또는 마지막 알림 후 재stale)이면 `getWorkingStaffIds` 대상 "수신반 모니터링 중단" push 1회 + `watchdog_notified_at=now`. heartbeat 수신 시 `watchdog_notified_at=NULL` 리셋(재무장). push payload `{kind:'panel_alarm'...}` 규약 유지(단 watchdog는 `kind:'panel_watchdog'`).

### 3.⑥ staging-first 절차 · 검증
1. GSD(`/gsd:quick` 또는 phase)로 시작. **서브에이전트 wrangler/deploy 금지** ([[feedback_subagent_production_deploy_forbidden]]) — cron/D1 원격은 사용자 동석 턴에서만.
2. staging에 migration → `wrangler d1 execute <staging-db> --file` (batch 비원자 주의, 위 파일은 안전) → 로컬 `--local`로 스키마 확인.
3. staging Pages에 `AGENT_KEY`, VAPID 시크릿 세팅. 엔드포인트 배포.
4. **검증 항목:** (a) `X-Agent-Key` 불일치→401, 일치→200. (b) `frame` 업로드 후 `/api/public/panel/latest.jpg` no-store 스트림 + 없을 때 204. (c) `trigger(fire)` → panel_alarms active + fire_alarm_records 초안 + 근무자 push 1차 도달(폰). (d) 20초×3 재발송 후 정지, `ack`/`clear`/DO 취소 확인. (e) equip 단발. (f) 멱등: 동일 type 재trigger→동일 alarmId. (g) 점검모드 ON 중 trigger→`suppressed`만, push 0, 라이브뷰·events 조회 유지. (h) 경보 중 maint ON→409, `confirmAlarm`→초안 폐기+cleared. (i) 자동 ON/OFF cron(소방점검일 시뮬 schedule_items 주입). (j) heartbeat 끊고 180s 경과→중단 push 1회, 재개 시 재무장.
5. **에이전트(4번)를 staging 엔드포인트로 test-mode 강제발화 실검증.** OK 시 사용자 컨펌 → **prod 콘솔**이 `production-sync.md` 게이트 따라 동일 변경 적용(migration은 main push=원격 즉시 적용 인지).

**주의:** telemetry_events에 `panel-trigger`/`panel-watchdog` 이벤트 로깅 추가 권장(cron tail 소실 대비 — [[reference_telemetry_events]]). push 대상은 항상 `getWorkingStaffIds`(비/휴/연차 제외) — 전체 4명 아님.

---

## 4. 맥미니 로컬 에이전트 사양 (v1)

> 콘솔/리포 밖 standalone. `~/panel-agent/agent.py` (Python 3.11, `opencv-python numpy requests`) + `ffmpeg`(brew 8.1.2) + launchd. staging(`AGENT_BASE`) 먼저 → prod 전환. 모든 POST 스키마는 **1번 API 계약** 준수.

### 4.0 설정 (`~/panel-agent/config.env`, 600 권한)
```
AGENT_BASE=https://<staging|prod>.pages.dev
AGENT_KEY=<AGENT_KEY 시크릿>
VIDEO_NAME=USB3 Video          # 이름 매칭 (인덱스 가변)
FRAME_INTERVAL=1.5             # 뷰 업로드/감지 주기(초)
RED_ON=0.06  RED_OFF=0.02      # 히스테리시스 임계 (샘플로 튜닝)
GREEN_ON=0.05 GREEN_OFF=0.02
DEBOUNCE_ON=3  DEBOUNCE_OFF=4  # 연속 프레임 디바운스
AGENT_VERSION=1.0.0
```
KST 벽시계 문자열 헬퍼: `datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d %H:%M:%S")` (→ 1번 계약 시각 규약과 동일).

### 4.1 캡처 — ffmpeg avfoundation, 이름 매칭
장치 인덱스는 연결 순서로 바뀌므로 **매 부팅 시 이름→인덱스 해석**:
```bash
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -i "USB3 Video"
# 예: [AVFoundation ... ] [0] USB3 Video   → 인덱스 0
```
```python
def resolve_index(name):
    out = subprocess.run(["ffmpeg","-f","avfoundation","-list_devices","true",
        "-i",""], capture_output=True, text=True).stderr
    for line in out.splitlines():
        m = re.search(r"\[(\d+)\]\s+"+re.escape(name), line)
        if m: return m.group(1)
    raise SystemExit(f"device '{name}' not found")
```
지속 파이프로 초당 1프레임 MJPEG를 stdout으로 받아 디코드(장치 재오픈 회피):
```python
idx = resolve_index(VIDEO_NAME)
proc = subprocess.Popen(["ffmpeg","-f","avfoundation","-framerate","5",
    "-video_size","1280x720","-i", f"{idx}:none",
    "-vf", f"fps={1/FRAME_INTERVAL:.3f}", "-f","image2pipe","-vcodec","mjpeg",
    "-q:v","4","-"], stdout=subprocess.PIPE, bufsize=10**7)
# stdout에서 JPEG SOI(ffd8)~EOI(ffd9) 경계로 프레임 분리 → cv2.imdecode
```
파이프가 죽으면(캡처 프리즈) 재해석+재spawn. 수신반은 거의 정지화면이라 1~2초면 충분하고, 경보는 리셋 전까지 지속되므로 놓칠 수 없음.

### 4.2 감지 = 색 2-class + rising-edge 상태머신
HSV 빨강(화재)/초록(설비) 픽셀 비율. 평상시 화면은 베이지/파랑이라 두 비율 ≈ 0 → 분리 깔끔. **깨끗한 디지털 영상 기준**(샘플 사진의 글레어 없음).
```python
def ratios(bgr):
    h,w = bgr.shape[:2]
    roi = bgr                       # 옵션: 중앙 팝업+우상단 상태박스만 크롭
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    red = cv2.inRange(hsv,(0,120,80),(10,255,255)) | \
          cv2.inRange(hsv,(170,120,80),(180,255,255))
    green = cv2.inRange(hsv,(40,90,80),(85,255,255))
    n = roi.shape[0]*roi.shape[1]
    return red.sum()/255/n, green.sum()/255/n
```
상태머신 (fire 우선, 히스테리시스 + 디바운스로 오경보 억제):
```python
state="NORMAL"; on=off=0
def step(rr, gr):
    global state,on,off
    fire  = rr>RED_ON
    equip = gr>GREEN_ON and rr<=RED_OFF
    clear = rr<RED_OFF and gr<GREEN_OFF
    if state=="NORMAL":
        target = "FIRE" if fire else ("EQUIP" if equip else None)
        on = on+1 if target else 0
        if target and on>=DEBOUNCE_ON:
            fire_trigger(target); state=target; off=0     # 전이 시 1회만
    else:                                                   # FIRE/EQUIP 지속
        if state=="EQUIP" and fire and on:=on+1>=DEBOUNCE_ON:
            fire_trigger("FIRE"); state="FIRE"             # 설비→화재 승격
        off = off+1 if clear else 0
        if off>=DEBOUNCE_OFF:
            send_clear(state); state="NORMAL"; on=0        # 리셋=재무장
```
- **rising-edge:** `NORMAL→경보` 전이에서만 `trigger` 1회. 지속 경보를 매 프레임 재전송 금지. 수신반 수동 리셋으로 `NORMAL` 복귀해야 `clear` 발송 + 재무장.
- fire 갱신은 `push_count`/에스컬레이션을 **서버**가 관리(1번 계약 §1.4). 에이전트는 상태 전이 신호만 보냄.

### 4.3 업로드 — 최신 프레임 R2 (고정 key 덮어쓰기)
매 사이클 프레임을 JPEG 인코딩해 `latest` key로 덮어씀. 경보 순간엔 스냅샷을 먼저 별도 key로 올려 `trigger`에 연결.
```python
def upload_frame(jpeg, key="latest"):
    r = requests.post(f"{BASE}/api/panel/frame", data=jpeg, timeout=8,
        headers={"X-Agent-Key":KEY,"Content-Type":"image/jpeg",
                 "X-Frame-Key":key,"X-Frame-Ts":now_kst()})
    r.raise_for_status()
```
경보 시: `cid=uuid4().hex[:8]` → `upload_frame(snap, f"alarms/{cid}")` 후 trigger에 `snapshotKey="alarms/"+cid`, `clientId=cid`. (→ 1번 §1.1의 `X-Frame-Key`/스냅샷 key 규약.)

### 4.4 경보 / 하트비트 POST (X-Agent-Key, 계약 스키마)
```python
def post(path, body):
    return requests.post(f"{BASE}{path}", json=body, timeout=8,
        headers={"X-Agent-Key":KEY}).json()

def fire_trigger(kind):
    cid = uuid4().hex[:8]; ts = now_kst()
    upload_frame(last_jpeg, f"alarms/{cid}")
    post("/api/alarm/trigger", {
        "type": "fire" if kind=="FIRE" else "equip",
        "detectedAt": ts, "source":"visual",
        "snapshotKey": f"alarms/{cid}", "clientId": cid,
        "confidence": round(conf,2), "redRatio": round(rr,3),
        "greenRatio": round(gr,3)})              # 서버가 dedupe/초안/push 처리

def send_clear(kind):
    post("/api/alarm/clear", {
        "type":"fire" if kind=="FIRE" else "equip", "at": now_kst()})
```
**하트비트**(별도 60초 타이머 스레드) — 서버 연결 감시(1번 §1.4 / 3⑤)이 `now-last_seen>180s`면 근무자에게 "모니터링 중단" push:
```python
post("/api/alarm/heartbeat",
    {"at":now_kst(),"agentVersion":AGENT_VERSION,"frameTs":last_frame_ts})
```
전송 실패는 지수백오프 재시도(최대 5회) 후 로그. trigger는 서버가 멱등 dedupe하므로 재시도 안전.

### 4.5 상시 구동 — launchd + 로깅
`~/Library/LaunchAgents/com.chabio.panelagent.plist`:
```xml
<key>ProgramArguments</key><array>
  <string>/opt/homebrew/bin/python3.11</string>
  <string>/Users/USER/panel-agent/agent.py</string></array>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>          <!-- 크래시/종료 자동 재시작 -->
<key>ThrottleInterval</key><integer>10</integer>
<key>StandardOutPath</key><string>/Users/USER/panel-agent/agent.log</string>
<key>StandardErrorPath</key><string>/Users/USER/panel-agent/agent.err</string>
<key>EnvironmentVariables</key><dict><key>PATH</key>
  <string>/opt/homebrew/bin:/usr/bin:/bin</string></dict>
```
`launchctl load -w ...plist`. 로그는 회전(`logging.handlers.RotatingFileHandler`, 5MB×3): 프레임 카운트/비율/상태전이/HTTP결과. macOS 카메라·화면 권한 최초 1회 승인 필요. 맥미니 절전/자동로그인 해제.

### 4.6 테스트 모드 (`agent.py --test`, 실제 화재 없이 검증)
① **오프라인 분류** — 보유 실경보 사진을 감지기에 직접 먹여 라벨 검증:
```bash
python3 agent.py --classify "화재 발생.png" "설비 동작.jpeg" ~/panel-agent/normal.jpg
# 기대: 화재→FIRE(rr↑), 설비→EQUIP(gr↑), normal→NORMAL(무반응)
```
→ 임계(`RED_ON/GREEN_ON`)를 이 3장의 실측 비율 사이로 튜닝. (샘플: `~/Desktop/수신반-미리보기/fire.png`, `equip.jpeg`, `normal.jpg`.)
② **파이프라인 강제 발화** — 실제 감지 없이 서버 계약 검증(푸시 도달·ACK·20초×3 에스컬레이션·연결 감시):
```bash
python3 agent.py --fire fire      # 강제 fire_trigger 1회 → 폰 push/풀스크린 확인
python3 agent.py --fire equip     # 설비 단발
python3 agent.py --clear fire     # clear → 에스컬레이션 중지·재무장
python3 agent.py --no-heartbeat 200  # 200초 무전송 → "모니터링 중단" push 확인
```
③ **라이브뷰** — 실제 캡처 프레임이 PWA에 표시되는지 `/api/public/panel/latest.jpg?t=<ts>`로 확인. 테스트는 staging `AGENT_BASE`로만. (→ 3⑥ (c)~(j) 검증과 짝을 이룸.)

### 4.7 오디오 — 2단계 (추후)
맥미니(M1) 내장 마이크 없음. 캡처보드 HDMI 오디오(`USB3 Digital Audio`)엔 부저가 안 실릴 가능성 높음. 2단계에서 **USB 마이크** 설치 후 avfoundation 오디오 입력 RMS 급증을 2차 신호로 추가(캡처 프리즈 대비 영상 감지 보완). 1단계는 영상 빨강/초록 단독으로 완결 — 마이크 없이 완전 동작.

---

## 5. 착수 순서 · 참고

### 5.1 착수 순서
1. **계약 확정** (완료) — 1번 API 계약(v1)이 SSOT. 세 트랙 모두 이 문서 기준. *변경 시 이 HANDOFF의 1번 섹션을 먼저 갱신하고 세 트랙에 전파.*
2. **design · data · 에이전트 병렬 착수** — 계약이 인터페이스를 고정하므로 세 트랙 동시 진행 가능.
   - **design**(`~/Documents/cbc7119-design`): `/gsd:sketch` → `/gsd:ui-phase` (2번). 시안은 개념 참고, 렌더는 계약 기준.
   - **data**(`~/Documents/cbc7119-data`): GSD → migration + Worker + DO + cron (3번). staging Pages+D1+R2에만.
   - **에이전트**(맥미니 `~/panel-agent`): `agent.py` + config + plist (4번). `AGENT_BASE`=staging.
3. **staging 검증** — data 트랙 3⑥ 검증 (a)~(j) + 에이전트 4.6 test-mode를 **staging 엔드포인트**로 실검증(강제 발화 → 폰 push 도달 → ACK → 20초×3 → 연결 감시). design은 cbc7119-preview에서 시각 확인.
4. **prod 적용** — staging OK + 사용자 컨펌 후:
   - **백엔드/스키마**: prod 콘솔(`~/Documents/20260328`)이 `.planning/production-sync.md` 게이트 따라 동일 변경 적용. migration은 `main` push = 원격 D1 즉시 적용임을 인지 ([[reference_deploy_yml_main_to_cbc7119]]).
   - **UI**: design `main` 머지 → 직원 도메인(cbc7119) 반영은 별도 sync 절차.
   - **에이전트**: `config.env`의 `AGENT_BASE`를 prod로 전환 + `AGENT_KEY`/VAPID를 prod 값으로.
   - 배포 시 `--branch production` 필수 ([[feedback_deploy_branch]]), 서브에이전트 자율 wrangler 금지 ([[feedback_subagent_production_deploy_forbidden]]).

### 5.2 참고 — 시안 파일 경로 (절대경로)
- 모바일 시안: `/Users/jongyupyoon/Desktop/수신반-미리보기/index.html`
- 데스크톱 시안: `/Users/jongyupyoon/Desktop/수신반-미리보기/desktop.html`
- 샘플 이미지(감지 튜닝·상태별 카드): `fire.png`(화재), `equip.jpeg`(설비), `normal.jpg`(정상) — 모두 `/Users/jongyupyoon/Desktop/수신반-미리보기/`
- 확정 설계 노트: `/Users/jongyupyoon/.claude/projects/-Users-jongyupyoon-Documents-20260328/memory/project_cctv_idea.md`
- 에이전트 파일 예정 경로: `/Users/USER/panel-agent/agent.py`, `config.env`, `com.chabio.panelagent.plist`

### 5.3 참고 — prod 소스 파일 (절대경로)
- 미들웨어: `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/functions/_middleware.ts`
- 기존 화재수신반 API: `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/functions/api/fire-alarm/index.ts`
- 기존 테이블(자동초안 재사용): `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/migrations/0032_fire_alarm_records.sql`
- 근무자 필터·푸시: `/Users/jongyupyoon/Documents/20260328/cbc-cron-worker/src/index.ts` (`getWorkingStaffIds`, `sendPush`)

### 5.4 참고 — 관련 메모리 노트
- `[[reference_cron_worker]]` — 자동 발송 로직은 형제 디렉토리 cbc-cron-worker
- `[[reference_deploy_yml_main_to_cbc7119]]` — main push → cbc7119 자동배포 + D1 migration 원격 즉시 적용
- `[[feedback_wrangler_d1_batch_not_atomic]]` / `[[feedback_d1_create_index_idempotency]]` — migration IF NOT EXISTS 강제
- `[[feedback_subagent_production_deploy_forbidden]]` / `[[feedback_deploy_branch]]` — prod 배포 룰
- `[[reference_telemetry_events]]` — cron tail 소실 대비 이벤트 로깅
- 디자인 트랙 룰: `[[feedback_tsx_wave_emoji_dot_gap]]`, `[[feedback_tailwind_token_class_pattern]]`, `[[feedback_tailwind_w8_h8_is_48px]]`, `[[feedback_header_chrome_unification_rules]]`, `[[feedback_text_caption_leading_none]]`, `[[feedback_body_scroll_lock_safe_area]]`, `[[feedback_handoff_diff_prod_inline_vs_design_tailwind]]`, `[[feedback_sketch_realistic_data]]`
- staging 인프라: `[[project_cbc7119_data_staging]]`, `[[feedback_production_sync_protocol]]`
