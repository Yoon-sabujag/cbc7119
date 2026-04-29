# Phase 24: 소화기 자산-위치 분리 - Research

**Researched:** 2026-04-30
**Domain:** D1 schema migration · React 페이지 신설 · 도면 마커 ↔ 자산 분리 · 5월 법정점검 임박 운영 데이터 모델 변경
**Confidence:** HIGH (코드/마이그레이션 직접 검증) · MEDIUM (운영 D1 실제 컬럼 상태는 코드 추론)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**도메인 분리 모델**
- 위치(불변): `floor_plan_markers` + `check_points` 의 위치 필드 — `id`, `qr_code`, `floor`, `zone`, `mgmt_no`
- 위치(가변): `location` (개소명) — 마커 수정으로 변경 가능
- 자산(extinguishers): `id`, `type`, `prefix_code`, `seal_no`, `serial_no`, `approval_no`, `manufactured_at`, `manufacturer`
- 자산 신규 컬럼: `check_point_id` (nullable, 현재 매핑 위치) — *이미 있을 가능성 — 확인 필요*
- 자산 신규 컬럼: `status` ('active' / '폐기', default 'active')
- 점검 기록 신규 컬럼: `check_records.extinguisher_id` (nullable, 점검 시점 소화기 스냅샷)

**마이그레이션 정책**
- 기존 1:1 매핑은 그대로 보존 (`extinguishers.check_point_id` 그대로 유지)
- 기존 행 모두 `status='active'`
- 기존 `check_records.extinguisher_id` 는 가능하면 추론해서 채움 (현재 매핑된 ext) — 또는 NULL 유지

**신규 페이지 / UX**
- 라우트 `/extinguishers` (또는 적절한 경로)
- 필터: 매핑 상태(전체 / 미배치 / 매핑 / 폐기) + zone + floor + type + 검색어
- 헤더 「+ 새로 등록」 버튼
- 신규 등록 폼: 종류·접두문자·증지번호·제조번호·형식승인·제조년월·제조업체
- 안내 배너: *"등록 후 한 번에 최대 3개 필드만 수정 가능합니다."*
- 「저장」 → 미배치 상태로 등록. (마커 동행 시) 「저장」 → 동행 마커에 자동 매핑
- 카드 상세 모드 (카드 클릭 토글):
  - 미매핑 + 미점검: 「정보 수정」·「소화기 배치」·**「삭제」** (hard delete)
  - 미매핑 + 점검 기록 있음: 「정보 수정」·「소화기 배치」·**「폐기」** (soft, status='폐기')
  - 매핑됨: 「정보 수정」·**「소화기 분리」**
  - 폐기됨: 조회만
- 정보 수정 모달: **한 번에 최대 3개 필드** 변경 (4개 이상이면 카운터 빨강·저장 비활성·*"4개 이상 변경하려면 폐기+재등록을 사용하세요"*) — **백엔드도 동일 검증**
- 변경 수 실시간 표시 (예: `변경: 2 / 3`)

**도면 페이지(소화기/소화전 plan type) 변경**
- 마커 추가 모달(편집 모드): 입력 = 개소명(구 라벨칸) + 구역(필수). 층은 도면 페이지의 선택된 층 자동 사용. 매핑은 옵션(빈 마커 ❓ 도 가능) — 매핑은 「소화기 배치」 흐름으로 별도. **❌ 제거**: 소화기 종류 선택 / 기존 개소 연결.
- 마커 수정 모달(편집 모드): 개소명 변경 / 「소화기 배치」(리스트 페이지로 이동, 마커 동행) / 「소화기 분리」(미배치 상태로, 폐기 X — 마커는 ❓ 로 전환). **❌ 제거**: 소화기 종류 / 점검 개소 연결.
- 마커 클릭(점검 모드): 매핑된 마커 → 기존 점검 흐름 그대로 / ❓ 마커 → "소화기 미배치" 안내 + 「소화기 배치하기」 버튼 / 점검 기록 입력 모달의 소화기 정보 카드에는 「정보 수정」(≤3) · 「소화기 분리」 버튼 추가.
- 빈 마커(미배치) 표시: 색 빨강 (`#ef4444` / `var(--danger)`), 모양 ❓ (물음표). **범례 status row 에 「미배치」 항목 추가** (status row 일관성 유지).

**InspectionPage 일반점검 > 소화기 페이지**
- 헤더 「+ 새로 등록」 버튼 추가 → 리스트 페이지로 이동
- 소화기 정보 카드에 액션 버튼(매핑됨 상태): 「정보 수정」(≤3) · 「소화기 분리」
- 동일한 모달/폼 컴포넌트 재사용

**통합 동선 (양방향)**
- 도면 마커 수정 → 「소화기 배치」 → 리스트(마커 동행):
  - 매핑된 다른 소화기 클릭 → "X 위치 소화기. 서로 바꿀까요?" → 위치 스왑 (양쪽 동시 변경)
  - 미배치 소화기 클릭 → 동행 마커에 매핑
  - 「+ 새로 등록」 후 저장 → 동행 마커에 자동 매핑
- 리스트 미배치 카드 → 「소화기 배치」 → 도면 페이지:
  - 도면 페이지로 이동(소화기 ID + zone 동행), 소화기에 zone/floor 정보 있으면 자동 layer 이동, 없으면 사용자가 층 선택
  - 빈 ❓ 마커 클릭 → "여기에 배치할까요?" 확인 → 매핑
  - 리스트로 자동 복귀

**신규 API 엔드포인트**
| 엔드포인트 | 메소드 | 설명 |
|---|---|---|
| `/api/extinguishers/:id` | PUT | 정보 수정 (변경 필드 ≤ 3 검증) |
| `/api/extinguishers/:id/assign` | POST | 위치 매핑 (`{ check_point_id }`) |
| `/api/extinguishers/:id/unassign` | POST | 위치 분리 (status='active' 유지) |
| `/api/extinguishers/:id/swap` | POST | 위치 스왑 (`{ other_extinguisher_id }`) |
| `/api/extinguishers/:id/dispose` | POST | 폐기 처리 (status='폐기' + check_point_id=NULL) |
| `/api/extinguishers/:id` | DELETE | hard delete (미매핑+미점검 한정) |

기존 유지: `GET /api/extinguishers/:checkPointId`, `GET /api/extinguishers`, `POST /api/extinguishers/create`

### Claude's Discretion
- 라우트 정확한 경로(`/extinguishers` vs `/inspection/extinguishers/list` 등)
- API 핸들러 파일 구조 (`functions/api/extinguishers/[id].ts` 동적 라우트 vs 액션별 파일)
- 카드/모달 디자인 디테일(spacing, color) — 단, **「디자인 변경 전 상의 필수」** 메모리 룰: 레이아웃 구조/표시 방식 변경 부분은 sketch 먼저
- 변경 카운트 비교 알고리즘(빈 문자열 vs null 정규화)
- 백엔드 트랜잭션 경계 (assign/swap 의 D1 batch 구성)
- 마이그레이션 백필 — `check_records.extinguisher_id` 를 *현재 매핑된 ext_id 로 추정 채움* vs *NULL* 정책 (CONTEXT 가 둘 다 허용)

### Deferred Ideas (OUT OF SCOPE)
- 폐기 소화기 복원 UI
- 소화기 이력 타임라인 페이지
- 자동 폐기(연한 초과 시)
- 일괄 import / CSV export (있는 ExtinguisherListOverlay 의 출력 기능 추가)
- 자산 ID QR 인쇄 (현재 위치 QR 만 있음)
- 권한 분리(현재는 admin/assistant 동일 권한이라 가정)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXT-04 (TBD) | 소화기 자산-위치 분리 (`extinguishers.status` + `check_records.extinguisher_id` 추가) | §데이터 모델 현황, §마이그레이션 SQL 초안 |
| EXT-05 (TBD) | 신규 소화기 리스트 페이지에서 등록·매핑·분리·스왑·폐기 가능 | §신규 페이지 요구사항, §통합 동선, §API 엔드포인트 매핑 |

**REQUIREMENTS.md 에는 EXT-04/05 가 아직 등록되지 않음** (현재 v1.4 의 DOC/WORKLOG 만 등록). Phase 24 는 5월 법정점검 준비로 ROADMAP backlog 에 추가된 상태. 플래너는 EXT-04/05 정의를 추가하거나 phase-level success-criteria 만으로 진행할지 사용자와 확인 필요.
</phase_requirements>

## Project Constraints (from CLAUDE.md)

`./CLAUDE.md` 의 강제 사항 중 본 phase 에 직접 영향:

- **점검 기록 삭제 불가 원칙** — `check_records` 는 어떤 분기에서도 삭제 금지. assign/unassign/swap/dispose 모든 흐름에서 절대 `DELETE FROM check_records` 금지. `[VERIFIED: cha-bio-safety/functions/api/floorplan-markers/[id].ts:48]` (이미 코드에 반영됨)
- **Cloudflare 생태계 고정** — 추가 비용 $0. 신규 외부 SaaS / 라이브러리 도입 불가.
- **TypeScript strict 모드 비활성** — `tsconfig.json` `"strict": false`. 타입 추가 시 strict 가정하지 말 것.
- **Excel output 호환성** — 본 phase 와 무관 (소화기 양식 출력은 별도 phase).
- **Mobile-first PWA** — iOS 16.3.1+/Android 15+/PC 1920x1080. 모달/카드 모바일 우선 디자인.
- **`/gsd:execute-phase` 워크플로우 강제** — 직접 repo edit 금지. 본 phase 는 GSD 워크플로우로 진행.

추가로 STATE.md / 메모리 룰의 직접 적용 사항:

- **운영 관찰 모드 (2026-04-20~)** — "신규 기능 개발 금지". *본 phase 는 5월 법정점검 준비 예외* 로 명시 진행. CONTEXT.md §컨텍스트 메모 에 명시.
- **「프로덕션 배포 후 테스트」** — 로컬 서버 X. 마이그레이션은 `--remote` 로 prod D1 적용 후 검증.
- **「PWA 캐시 무효화」** — 신규 페이지/SW 빌드 변경 후 사용자에게 앱 재설치/새로고침 안내 필수.
- **「디자인 변경 전 상의 필수」** — 카드/모달 레이아웃은 sketch HTML → 사용자 승인 → 인라인 적용.
- **「배포 시 `--branch=production` 필수」** — `wrangler pages deploy` 명령에 누락 금지(자동 Preview 됨).
- **「wrangler 한글 커밋 메시지 거부」** — 필요 시 `--commit-message` 로 ASCII 별도 지정.

## Summary

Phase 24 는 **운영 데이터 모델 변경 phase** 다. 차바이오컴플렉스 4인 팀이 5월 법정점검에서 분말 소화기 10년 연한 도래 항목들을 실제 교체할 때, 현재의 `check_points ↔ extinguishers` 1:1 영구 모델로는 *위치 이력이 끊긴 채 폐기-재등록* 을 강요받는 동선을 끊고, 마커는 위치(불변), 소화기는 자산(이동/교체/폐기) 으로 분리하는 작업이다.

**현황 (검증):**
- `extinguishers.check_point_id TEXT NOT NULL REFERENCES check_points(id)` 는 **이미 존재** (마이그레이션 0035, NOT NULL). `[VERIFIED: cha-bio-safety/migrations/0035_extinguishers.sql]`
- `extinguishers.status` 컬럼은 **부재**. `check_records.extinguisher_id` 컬럼도 **부재**. 어떤 마이그레이션 파일에서도 발견되지 않음. `[VERIFIED: grep migrations/]`
- `check_records.floor_plan_marker_id`, `check_records.guide_light_type` 는 코드(`functions/api/inspections/[sessionId]/records.ts`)에서 INSERT/SELECT 되지만 **마이그레이션 파일에는 ADD COLUMN 이 없음** — 즉 운영 D1 에 직접 `wrangler d1 execute --remote --command="ALTER TABLE..."` 로 적용된 미문서화 컬럼들이 존재. `[VERIFIED: grep ALTER TABLE check_records migrations/*.sql → 0012, 0013 만 발견]`
- `check_points` 도 마찬가지로 코드(`functions/api/extinguishers/create.ts`)에서 `prefix_char`, `cert_no`, `serial_no`, `ext_type`, `approval_no`, `mfg_date`, `manufacturer`, `default_result`, `guide_light_type` 컬럼을 사용하지만 **마이그레이션에는 `location_no`, `default_result` 만 ADD COLUMN 으로 존재**. 나머지는 직접 wrangler 적용. `[VERIFIED: grep ALTER TABLE check_points migrations/*.sql]`

**Primary recommendation:** 단일 마이그레이션 `0079_extinguisher_asset_split.sql` 1개로 (a) `extinguishers.status` 추가, (b) `check_records.extinguisher_id` 추가, (c) 인덱스 보강, (d) 백필(확정 정책: 매핑된 ext_id 로 채움) 을 처리하고, 별도 plan 으로 (e) Phase 24 신규 API 6개 + (f) `ExtinguishersListPage` 신규 + (g) FloorPlanPage 마커 추가/수정 모달 단순화 + (h) InspectionPage 카드 액션 추가 + (i) FloorPlanPage 쿼리스트링 자동 layer 이동 추가 를 wave 단위로 분리한다. **5월 법정점검 마감(약 1~3일 차)을 고려해 risk-first 순서로**: 마이그레이션 → 백엔드 API (배포·검증) → 신규 페이지 (배포·검증) → 도면/InspectionPage 통합(마지막).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 자산 상태 머신(active/폐기 + 매핑 여부) | Database / Storage | API / Backend | `extinguishers.status` + `check_point_id` nullability 가 단일 source of truth. API 는 트랜잭션으로만 변경. |
| ≤3 필드 변경 룰 | API / Backend | Frontend (UX) | 백엔드가 강제(우회 불가). 프론트는 UX 힌트만. CONTEXT 명시. |
| 위치 매핑/스왑/분리 트랜잭션 | API / Backend | — | D1 batch 로 atomic. 단일 statement 실패 시 전체 롤백. (기존 `floorplan-markers/[id].ts` cascade 와 동일 패턴) |
| 점검 시점 소화기 스냅샷(`check_records.extinguisher_id`) | API / Backend (write) | Database (read) | INSERT 시점에 현재 매핑된 ext_id 를 같이 기록. 이후 자산이 이동해도 이력 보존. |
| 빈 마커(❓) 렌더링 | Frontend Server (FloorPlanPage) | Database | `floor_plan_markers.check_point_id IS NULL` 은 데이터 신호. SVG 렌더는 클라이언트. |
| 리스트 페이지 필터(매핑/미배치/폐기) | API / Backend (쿼리) | Frontend (UI) | 4가지 상태 매핑은 SQL JOIN 으로 결정 — 클라이언트 메모리 필터 X (4인 팀이지만 ext 는 ~600+행 가능). |
| 마커 동행 컨텍스트 (zone/floor 자동 layer) | Frontend (라우터 query) | — | URL `?marker=FPM-...&zone=research&floor=8F` 로 전달 — `useSearchParams` 를 FloorPlanPage 에 추가. |
| 자산 ID 생성 | API / Backend | — | 기존 `extinguishers.id INTEGER PRIMARY KEY AUTOINCREMENT` 그대로. assign/swap 은 ID 만 다룸. |
| PWA 캐시 무효화 | Frontend (Service Worker) | User (배포 후 안내) | 신규 페이지 추가 시 SW 자동 갱신, 사용자 안내 필수. |

## Standard Stack

### Core (이미 존재 — 신규 의존성 추가 금지)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Cloudflare D1 | (Workers binding) | 메인 DB — `extinguishers`/`check_points`/`check_records`/`floor_plan_markers` 모두 같은 DB | 프로젝트 인프라 고정 [VERIFIED: wrangler.toml] |
| @tanstack/react-query | 5.59.0 | 리스트/상세 데이터 fetch + invalidation | 프로젝트 표준 (모든 페이지 사용) [VERIFIED: package.json] |
| react-router-dom | 6.26.2 | `/extinguishers` 라우트 + `useSearchParams` 마커 동행 | 기존 라우팅 [VERIFIED: package.json + App.tsx] |
| zustand | 5.0.0 (`useAuthStore`) | role 기반 권한 분기 | 기존 인증 store [VERIFIED: src/stores/authStore] |
| react-hot-toast | 2.4.1 | 저장/오류 토스트 | 기존 UX 표준 [VERIFIED: 모든 페이지] |
| Tailwind + 인라인 style | 3.4.14 | 컴포넌트 스타일 | 기존 혼용 패턴 (CLAUDE.md 명시) |

### Supporting (신규 코드에서 import)

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `src/utils/api.ts` | `extinguisherApi` namespace 확장 (assign/unassign/swap/dispose/update/delete + listWithFilter) | 모든 신규 API 호출의 단일 진입 |
| `src/utils/extinguisher.ts` | `getReplaceWarning` (10년 연한) — 신규 리스트 페이지 카드 강조에 재사용 | `[VERIFIED: import getReplaceWarning, REPLACE_WARNING_STROKE]` |
| `functions/_middleware.ts` | JWT 검증 + `ctx.data.{staffId, role, name}` | 모든 신규 API 핸들러 첫줄에서 활용 (admin gate 가 필요한 경우) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `extinguishers.status` enum (active/폐기) | `extinguishers.disposed_at TEXT NULL` (timestamp) | timestamp 가 정보가 더 풍부하지만 CONTEXT 가 'active'/'폐기' 명시. 후일 폐기 시각 필요 시 별도 컬럼 추가 가능. → **CONTEXT 따름** |
| `check_records.extinguisher_id INTEGER` | snapshot JSON | snapshot JSON 은 자산 변경 후에도 당시 시리얼/제조번호까지 보존되지만, 1) 쿼리 복잡, 2) CONTEXT 가 단순 ID 스냅샷 명시. → **CONTEXT 따름**. 단, `extinguishers` 자산 행은 *절대 삭제하지 않고* status='폐기' 로만 두므로 ID 만으로도 historical lookup 이 항상 가능. |
| 단일 마이그레이션 파일 | (a) ADD COLUMN + (b) 데이터 백필 분리 | D1 마이그레이션은 트랜잭션 의미가 약함(파일 단위 batch 가 아님). ALTER TABLE 후 같은 파일에서 UPDATE 가능. **단일 파일 안전** [VERIFIED: 0078 패턴]. |
| `/extinguishers` | `/inspection/extinguishers/list` | 짧은 단일 라우트가 외부 진입(SideMenu, deep-link)에 더 적합. App.tsx 의 기존 라우트 컨벤션도 단일 segment 우세 (`/documents`, `/worklog`, `/checkpoints`). → **`/extinguishers` 권장**. |

**Installation:** 신규 의존성 없음. 모든 작업이 기존 stack 으로 가능.

**Version verification:** 신규 패키지 추가 없음 — 검증 불필요.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 사용자 (방재팀 4인)                                              │
└────────────────────────────────────────────────────────────────-┘
              │
       ┌──────┴───────┐
       │              │
       ▼              ▼
┌──────────────┐  ┌──────────────────────┐
│ 도면 페이지   │  │ 일반 점검 > 소화기    │
│ /floorplan   │  │ /inspection          │
└──────┬───────┘  └──────────┬───────────┘
       │                     │
       │ ▼ 마커 수정 모달    │ ▼ 소화기 정보 카드
       │ "소화기 배치"        │  "정보 수정" / "분리"
       │ ─ navigate(         │
       │   /extinguishers     │
       │   ?marker=FPM-X      │
       │   &zone=research     │
       │   &floor=8F)         │
       │                     │
       └──────────┬──────────┘
                  ▼
        ┌──────────────────────┐
        │ 소화기 리스트 페이지  │
        │ /extinguishers       │
        │ ─ 필터(상태/zone/    │
        │   floor/type/검색)   │
        │ ─ "+ 새로 등록"       │
        │ ─ 카드 (상태별 액션) │
        └────────────┬─────────┘
                     │
                     ▼
        ┌──────────────────────────────────────────────────────┐
        │ functions/api/extinguishers/                         │
        │  ├─ index.ts  (GET 목록 + 매핑상태 JOIN)             │
        │  ├─ create.ts (POST 등록 — 기존 유지)                │
        │  ├─ [checkPointId].ts (GET by cp_id — 기존 유지)     │
        │  ├─ [id].ts    (PUT 수정 ≤3 / DELETE hard)           │
        │  ├─ [id]/assign.ts   (POST {check_point_id})         │
        │  ├─ [id]/unassign.ts (POST)                          │
        │  ├─ [id]/swap.ts     (POST {other_extinguisher_id}) │
        │  └─ [id]/dispose.ts  (POST → status='폐기')          │
        └────────────┬─────────────────────────────────────────┘
                     │ (D1 batch transactions)
                     ▼
        ┌──────────────────────────────────────────────────────┐
        │ Cloudflare D1 (cha-bio-db)                           │
        │  ├─ extinguishers (id, check_point_id, status, ...) │
        │  ├─ check_points  (영구 위치)                        │
        │  ├─ floor_plan_markers (도면 위치, check_point_id 유지) │
        │  └─ check_records (extinguisher_id 신규)             │
        └──────────────────────────────────────────────────────┘
```

**진입점:**
- 사용자는 도면 또는 일반점검에서 시작 → 컨텍스트(마커 동행) 와 함께 리스트 페이지로 이동 → 작업 후 자동 복귀.
- 직접 SideMenu 항목으로도 진입(컨텍스트 없음 — 일반 자산 관리 모드).

### Component Responsibilities

| File | Responsibility |
|------|----------------|
| `cha-bio-safety/migrations/0079_extinguisher_asset_split.sql` | (신규) `extinguishers.status` + `check_records.extinguisher_id` 추가, 인덱스, 백필 |
| `cha-bio-safety/functions/api/extinguishers/[id].ts` | (신규/확장) PUT 수정(≤3 검증) + DELETE hard delete (가드: 매핑X + 점검기록X) |
| `cha-bio-safety/functions/api/extinguishers/[id]/assign.ts` | (신규) POST `{ check_point_id }` — 자산을 위치에 매핑. 동일 위치에 다른 자산 매핑 시 충돌 검증 |
| `cha-bio-safety/functions/api/extinguishers/[id]/unassign.ts` | (신규) POST — `check_point_id=NULL` 로 분리 (status 유지) |
| `cha-bio-safety/functions/api/extinguishers/[id]/swap.ts` | (신규) POST `{ other_extinguisher_id }` — 두 자산 위치 D1 batch 로 동시 swap |
| `cha-bio-safety/functions/api/extinguishers/[id]/dispose.ts` | (신규) POST — status='폐기' + check_point_id=NULL (D1 batch) |
| `cha-bio-safety/functions/api/extinguishers/index.ts` | (확장) 매핑 상태 필터(`?status=unmapped|mapped|disposed|all`) + JOIN 으로 cp 위치 정보 포함 + 필터 응답 |
| `cha-bio-safety/functions/api/extinguishers/create.ts` | (검토) 현재 `extinguishers + check_points` 동시 INSERT — 신규 흐름은 *자산만 등록*(check_point_id=NULL) 모드 추가 필요. 기존 흐름은 도면 페이지에서 사라지지만 *removal 은 deprecate 후 후속 phase* (CONTEXT 명시). |
| `cha-bio-safety/functions/api/inspections/[sessionId]/records.ts` | (확장) INSERT 시 `extinguisher_id` 도 같이 기록(소화기 카테고리만). 현재 매핑된 ext_id 를 한 번 더 SELECT 해서 INSERT |
| `cha-bio-safety/src/utils/api.ts` | `extinguisherApi` 에 `update(id, payload)`, `assign(id, cpId)`, `unassign(id)`, `swap(id, otherId)`, `dispose(id)`, `delete(id)` 추가. `list` 의 응답 타입에 `status`, `mapping_state` 추가. |
| `cha-bio-safety/src/pages/ExtinguishersListPage.tsx` (또는 `ExtinguisherListPage.tsx`) | (신규) 라우트 `/extinguishers`. 필터 + 카드 그리드 + 신규등록 모달 + 정보수정 모달(≤3) + 액션(배치/분리/폐기/삭제). `useSearchParams` 로 마커 동행 처리. |
| `cha-bio-safety/src/pages/FloorPlanPage.tsx` | (수정) 마커 추가 모달의 `addExtMode`/`newExt` 상태 제거 — 위치만 추가. 마커 수정 모달에 「배치/분리」 버튼 추가, ❓ 마커 클릭(점검 모드) 시 미배치 안내 모달, 점검 모달 카드의 「정보 수정」/「분리」 버튼 추가. **`useSearchParams` 추가** — `?zone=...&floor=...&marker=...` 로 자동 layer 이동 + 마커 선택 |
| `cha-bio-safety/src/pages/InspectionPage.tsx` | (수정) 소화기 카테고리 헤더에 「+ 새로 등록」 (→ `/extinguishers`) 버튼, 소화기 정보 카드에 「정보 수정」(≤3) · 「소화기 분리」 액션 추가 |
| `cha-bio-safety/src/components/SideMenu.tsx` + `src/components/DesktopSidebar.tsx` + `src/utils/api.ts` (`DEFAULT_SIDE_MENU`) | (수정 3곳) `/extinguishers` 메뉴 항목 추가 + `migrateLegacyMenuConfig` 자동 forward-merge (Phase 21 패턴 재사용) |
| `cha-bio-safety/src/App.tsx` | (수정) `<Route path="/extinguishers">` 추가, `MOBILE_NO_NAV_PATHS` 에 추가(자체 헤더 사용 시), `PAGE_TITLES` 에 `'/extinguishers': '소화기 관리'` 추가 |

### Recommended Project Structure

```
cha-bio-safety/
├── migrations/
│   └── 0079_extinguisher_asset_split.sql      # NEW: status + check_records.extinguisher_id + 백필
├── functions/api/extinguishers/
│   ├── index.ts                                 # MODIFIED: 매핑 상태 필터
│   ├── create.ts                                # MODIFIED: 자산만 등록 모드 (cp_id=null) 추가
│   ├── [checkPointId].ts                        # 기존 유지
│   ├── [id].ts                                  # NEW (확장): PUT(≤3) + DELETE
│   └── [id]/                                    # NEW: 액션별 파일
│       ├── assign.ts
│       ├── unassign.ts
│       ├── swap.ts
│       └── dispose.ts
├── functions/api/inspections/[sessionId]/
│   └── records.ts                               # MODIFIED: extinguisher_id 스냅샷 INSERT
├── src/pages/
│   ├── ExtinguishersListPage.tsx                # NEW
│   ├── FloorPlanPage.tsx                        # MODIFIED
│   └── InspectionPage.tsx                       # MODIFIED
├── src/utils/
│   ├── api.ts                                    # MODIFIED: extinguisherApi 확장
│   └── extinguisher.ts                           # 기존 유지 (getReplaceWarning 재사용)
├── src/components/
│   ├── SideMenu.tsx                              # MODIFIED
│   └── DesktopSidebar.tsx                        # MODIFIED
└── src/App.tsx                                   # MODIFIED
```

### Pattern 1: D1 마이그레이션 (단일 파일, ALTER + UPDATE)

**What:** ALTER TABLE 추가 + 기존 데이터 백필을 *같은 SQL 파일* 에 묶음. wrangler 가 파일 전체를 batch 로 실행해 atomicity 확보.
**When to use:** 모든 신규 컬럼 추가.
**Example:**
```sql
-- Source: cha-bio-safety/migrations/0078_marker_description_sync.sql (검증된 패턴)
ALTER TABLE floor_plan_markers ADD COLUMN description TEXT;
UPDATE floor_plan_markers SET description = (SELECT ...) WHERE ...;
DROP TRIGGER IF EXISTS ...;
CREATE TRIGGER ... ;
```
**Key insight:** D1 `wrangler d1 execute --file=...` 는 파일 내 statement 들을 자동 batch 로 처리. 단, **새로 추가한 컬럼은 같은 파일 안의 UPDATE 에서 즉시 사용 가능** [VERIFIED: 0078 의 description 컬럼 패턴].

### Pattern 2: D1 batch atomic transaction

**What:** 여러 statement 가 모두 성공하거나 모두 롤백되어야 할 때 `env.DB.batch([prepare(...), prepare(...), ...])` 사용.
**When to use:** 위치 스왑(2 UPDATE), 폐기(1 UPDATE + 인덱스 검증), assign 시 충돌검증 + UPDATE.
**Example:**
```typescript
// Source: cha-bio-safety/functions/api/floorplan-markers/[id].ts:67 (검증된 패턴)
await env.DB.batch([
  env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
  env.DB.prepare('DELETE FROM extinguishers WHERE check_point_id=?').bind(cpId),
  env.DB.prepare('UPDATE check_points SET is_active=0 WHERE id=?').bind(cpId),
])
```
**중요:** D1 batch 는 *atomic* 이지만 *isolation 보장 없음* — 동시 요청과의 race condition 은 별도 검증 필요. 4인 팀 + 모바일 환경에서 동시성 충돌 가능성은 매우 낮으나 swap 의 경우 `WHERE check_point_id=?` 가드를 한번 더 두는 게 안전 (낙관적 잠금 패턴).

### Pattern 3: ≤3 필드 변경 검증 (front + back)

**What:** PUT 요청에서 변경된 필드 수 카운트 → ≤3 만 허용.
**When to use:** `extinguisher 정보 수정` 의 모든 호출 경로.
**Example (백엔드):**
```typescript
// 1. 현재 행 SELECT
const existing = await env.DB.prepare('SELECT * FROM extinguishers WHERE id=?').bind(id).first()
if (!existing) return Response.json({success:false, error:'없음'}, {status:404})

// 2. 변경 필드 카운트 (정규화: '' === null)
const norm = (v: any) => (v === '' || v === undefined) ? null : v
const fields = ['type','prefix_code','seal_no','serial_no','approval_no','manufactured_at','manufacturer'] as const
let changed = 0
for (const f of fields) {
  if (norm((body as any)[f]) !== norm((existing as any)[f])) changed++
}
if (changed > 3) return Response.json({success:false, error:'한 번에 최대 3개 필드까지만 변경 가능합니다'}, {status:400})

// 3. UPDATE
```
**Why:** 사용자가 *완전히 다른 자산을 같은 행에 덮어쓰는* 사고를 방지. 자산 식별성 보장 — 4개 이상 변경은 "다른 자산" 으로 간주, 폐기+신규 등록 동선 유도.

### Pattern 4: 라우터 query string 으로 마커 동행

**What:** `navigate('/extinguishers?marker=FPM-X&zone=research&floor=8F&intent=assign')` 로 컨텍스트 전달.
**When to use:** 도면 → 리스트, 리스트 → 도면 양방향.
**Example (FloorPlanPage 측 — 신규 추가):**
```typescript
import { useSearchParams } from 'react-router-dom'
const [searchParams] = useSearchParams()
useEffect(() => {
  const z = searchParams.get('zone')
  const f = searchParams.get('floor')
  const markerId = searchParams.get('marker')
  if (f && FLOORS.includes(f)) setFloor(f)
  // marker 가 있으면 layout 후 해당 마커 select
}, [])
```
**Source:** RemediationPage.tsx (검증된 useSearchParams 패턴).

### Anti-Patterns to Avoid

- **`check_records` 삭제 금지** — `floorplan-markers/[id].ts:48` 에 명시됨. unassign/swap/dispose 어디에서도 절대 DELETE 금지. ext_id 스냅샷이 NULL 이 되거나 폐기된 ext_id 를 가리키더라도 그대로 둔다 (자산 행은 status='폐기' 로 보존).
- **`extinguishers` 행 hard delete 우회 금지** — DELETE 는 *미매핑 + 미점검* 만. 점검 기록이 있으면 무조건 폐기(soft).
- **`floor_plan_markers` cascade 우회 금지** — 마커 삭제 시 `extinguishers` 까지 cascade 하는 기존 로직(`floorplan-markers/[id].ts`)은 *이번 phase 에서 변경* 되어야 함. **자산은 자체 자산 모델로 관리되므로 마커 삭제 시 자산은 자동 unassign(check_point_id=NULL) 만, 자산 행 자체는 보존.** 이 변경은 마이그레이션과 함께 plan 에 명시 필수.
- **검색 클라이언트 메모리 필터** — 자산 600+행 가능. `?q=...` 는 SQL `LIKE` 로.
- **새 마커 생성 시 자동 자산 생성** — CONTEXT 명시: 마커 생성과 자산 생성은 분리. 빈 마커(❓)도 valid.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP 인증 | 새 미들웨어 | 기존 `functions/_middleware.ts` (JWT) | 모든 API 가 이미 JWT 검증, ctx.data.{staffId, role, name} 자동 |
| API 클라이언트 | fetch wrapper | 기존 `src/utils/api.ts` 의 `api.{get,post,put,delete}` | 401 자동 logout, ApiError 표준 |
| 토스트 UI | 커스텀 알림 | `react-hot-toast` (이미 글로벌 마운트) | 모든 페이지 동일 UX |
| 데이터 fetch + invalidate | useEffect + setState | `@tanstack/react-query` (`queryClient.invalidateQueries`) | staleTime 30s, 401 자동 retry skip |
| 라우트 보호 | 자체 가드 | `<Auth>` HOC (App.tsx) | 비인증 시 `/login` 자동 |
| 권한 분기 | 커스텀 검사 | `useAuthStore().staff?.role === 'admin'` | 기존 패턴 |
| 모달 | 새 컴포넌트 시스템 | 인라인 `position: fixed; inset:0; ...` 패턴 | 모든 모달이 같은 패턴 사용 (FloorPlanPage `editMarker`, InspectionPage 등) |
| 자산 ID 생성 | UUID 라이브러리 | `extinguishers.id INTEGER PRIMARY KEY AUTOINCREMENT` (이미 존재) | 기존 스키마 |
| 10년 연한 계산 | 새 함수 | `src/utils/extinguisher.ts` 의 `getReplaceWarning` | 이미 도면/InspectionPage 가 사용 중 |
| 한글 카테고리 매핑 | 새 enum | 기존 markerCatMap (`fire_extinguisher: '소화기'` 등) | FloorPlanPage 에 이미 있음 |

**Key insight:** 본 phase 는 *순수 데이터 모델 + UX 변경* — 신규 인프라/라이브러리 0개. 모든 패턴이 기존 코드에 검증되어 있음.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data (D1)** | (1) `extinguishers` ~600행 (실 운영) — 기존 1:1 매핑 보존. (2) `check_records` 모든 소화기 카테고리 행 — `extinguisher_id` 백필 정책 결정. (3) 미문서화 컬럼들 (`check_records.floor_plan_marker_id`, `check_records.guide_light_type`, `check_points.{prefix_char,ext_type,...}`) — 운영 D1 에 이미 존재 (코드 사용 증거). | (1) 코드 변경 + 마이그레이션. (2) **사용자 결정 필요**: 백필 정책. (3) **신규 마이그레이션 0079 작성 시 운영 D1 의 실제 컬럼 상태를 `wrangler d1 execute --remote --command="PRAGMA table_info(extinguishers)"` 로 직접 확인 후 ADD COLUMN IF NOT EXISTS 가 필요한지 판단**. SQLite 는 `IF NOT EXISTS` 를 컬럼에 직접 지원하지 않으므로 **마이그레이션 작성 전 필수 검증**. |
| **Live service config** | 없음. 본 시스템은 외부 SaaS 의존 0건. (KOELSA/민원24 는 캐시 테이블 형태로 D1 안에 있음 — 본 phase 와 무관). | None. |
| **OS-registered state** | `cbc-cron-worker` 는 별도 프로젝트. 매일 08:45 KST 푸시 — 본 phase 의 데이터 모델 변경과 무관(`schedule_items`/`check_records` 만 읽음). | 단, `extinguisher_id` 추가 후 `check_records` 컬럼 변화에 cron 코드가 영향받지 않음을 grep 확인 필요(낮은 위험). |
| **Secrets and env vars** | `JWT_SECRET` (변경 없음), R2 binding `STORAGE` (사용 없음 — 사진 업로드는 본 phase 에서 다루지 않음). | None. |
| **Build artifacts / installed packages** | PWA 서비스 워커(`src/sw.ts`) — 신규 페이지 추가 시 캐시 manifest 업데이트 필요. 이전 사용자 클라이언트는 SW 강제 갱신될 때까지 옛 캐시 유지. | 배포 후 사용자 안내 ("앱 재설치/새로고침"). 메모리 룰 「PWA 캐시가 배포 무시함」 + 「splash 버전 체크」(quick 260420-fri) 활용. |

## Common Pitfalls

### Pitfall 1: 미문서화 컬럼 충돌 — 마이그레이션 실패

**What goes wrong:** `0079` 에서 `ALTER TABLE check_records ADD COLUMN extinguisher_id` 를 실행했을 때 운영 D1 에 이미 같은 이름 컬럼이 있다면 실패. SQLite 는 `ADD COLUMN IF NOT EXISTS` 미지원.
**Why it happens:** 과거 미문서화 ALTER 가 있었고, 누군가 `extinguisher_id` 를 이미 추가했을 가능성.
**How to avoid:**
1. 마이그레이션 작성 전 prod D1 schema 직접 확인:
   ```bash
   cd cha-bio-safety
   npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(check_records)"
   npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(extinguishers)"
   ```
2. 결과를 본 RESEARCH.md 또는 plan 의 read_first 에 기록.
3. 이미 존재하면 마이그레이션을 백필+인덱스만 수행하도록 조정.
**Warning signs:** `wrangler d1 execute --remote --file=migrations/0079_...sql` 가 `duplicate column` 에러로 실패.

### Pitfall 2: PWA 캐시로 인한 "여전히 똑같다" 클레임

**What goes wrong:** 신규 `/extinguishers` 페이지 배포 후 사용자가 "메뉴에 안 보인다" / "리스트가 안 뜬다" 라고 함.
**Why it happens:** SW가 옛 manifest/index.html 을 캐시. SideMenu 가 옛 `migrateLegacyMenuConfig` 결과로 `/extinguishers` 항목을 모름 (Phase 18 메뉴 customization 시스템).
**How to avoid:**
1. `DEFAULT_SIDE_MENU` 에 항목 추가 → `migrateLegacyMenuConfig` 의 forward-merge 가 자동 처리 [VERIFIED: src/utils/api.ts:413] — Phase 21 의 `/documents` 추가 시 검증된 패턴.
2. 배포 후 splash version-check 가 자동 캐시 클리어 (메모리 룰 「splash 버전 체크」, quick 260420-fri).
3. 그래도 사용자에게 명시 안내: "앱 재설치 또는 PWA 새로고침" — 메모리 룰 「PWA 캐시 무효화」.
**Warning signs:** 사용자가 메뉴에 항목 안 보인다고 보고, 또는 리스트가 빈 화면.

### Pitfall 3: ≤3 필드 변경 룰의 빈문자열 vs null 정규화

**What goes wrong:** 사용자가 `seal_no=''` 인 자산을 그대로 저장하면 백엔드가 `'' !== null` 로 변경된 걸로 카운트.
**Why it happens:** 폼이 `''` 으로 보내고 DB 가 `NULL` 이면 비교 실패.
**How to avoid:** 정규화 함수 `norm = v => v === '' ? null : v` 양쪽(프론트 카운터, 백엔드 검증)에 동일 적용. **테스트 케이스 필수: 빈 입력에서 모든 필드 동일하게 저장 → 변경 0개 카운트**.
**Warning signs:** 첫 저장 시도에서 "변경 없음" 인데 카운터가 4 표시.

### Pitfall 4: assign 시 동일 위치 충돌

**What goes wrong:** 자산 A 가 cp-X 에 매핑된 상태에서 자산 B 를 cp-X 에 assign 호출. → 양쪽 다 cp-X 매핑된 invalid 상태.
**Why it happens:** assign 핸들러가 단순 UPDATE 만 수행.
**How to avoid:** assign 시작 시 `SELECT id FROM extinguishers WHERE check_point_id=? AND status='active'` 으로 기존 매핑 자산 조회. 있으면 *이건 swap 입니다 → swap 엔드포인트로 유도* 또는 *기존 자산 자동 unassign 후 assign*. CONTEXT 의 "매핑된 다른 소화기 클릭 → 위치 스왑" 의 의미는 **swap 엔드포인트가 명시적 호출** 임. assign 은 *대상 위치가 비어있는 경우* 만 허용 → **백엔드에서 충돌 검증 + 409 반환**.
**Warning signs:** 도면에 한 위치에 두 마커가 겹치거나, 리스트에서 같은 cp-X 가 두 자산에 표시됨.

### Pitfall 5: 점검 시점 ext_id 스냅샷 race condition

**What goes wrong:** 사용자가 점검 모달을 열어둔 채로 다른 사용자가 자산을 swap. 사용자가 저장 시 *옛 ext_id* 가 INSERT 됨 → 잘못된 스냅샷.
**Why it happens:** 클라이언트가 `extDetail` 을 fetch 한 시각과 INSERT 시각 사이의 갭.
**How to avoid:**
- 백엔드의 `inspections/[sessionId]/records.ts` 가 INSERT 직전에 `SELECT id FROM extinguishers WHERE check_point_id=? AND status='active'` 로 *현재 매핑된* ext_id 를 다시 조회 → 이를 INSERT 에 사용. 클라이언트가 보낸 ext_id 는 **참고만** 또는 무시.
- 4인 팀 동시성은 사실상 0 이지만 모범 패턴.
**Warning signs:** ext 자산이 폐기된 후에도 새 점검 기록이 폐기 자산을 가리킴.

### Pitfall 6: 마커 동행 query string 의 layer 자동 이동 — useEffect dependency 누락

**What goes wrong:** `?floor=8F` 로 진입했는데 첫 mount 시 floor 가 '8-1F' (default) 로 설정된 후 `searchParams` 처리 useEffect 가 늦게 실행되어 '8F' 로 다시 set → 마커 fetch 가 두 번 발생, 첫번째 응답이 늦게 도착하여 잘못된 floor 마커 렌더.
**How to avoid:**
- `useState` 초기값을 `searchParams.get('floor') ?? '8-1F'` 로 직접 설정 (lazy init).
- 또는 `searchParams` 처리 useEffect 의 dependency 에 `searchParams` 만 두고 한 번만 실행.
**Warning signs:** 페이지 진입 직후 깜빡임, 잘못된 층 표시.

### Pitfall 7: 5월 법정점검 일정 압박 — risk-first 순서 위반

**What goes wrong:** UI 부터 만들고 마이그레이션은 마지막에. 5/1 노동절 직전(현재 날짜 2026-04-30)에 prod D1 마이그레이션 실패 → 법정점검 첫날 데이터 모델 깨짐.
**How to avoid:**
- **Wave 1**: 마이그레이션 + 백엔드 API 만 → 배포 → 검증 (기존 UI는 그대로 동작해야 함 — 새 컬럼이 추가됐을 뿐).
- **Wave 2**: 신규 리스트 페이지만 → 배포 → 검증.
- **Wave 3**: FloorPlanPage / InspectionPage 통합 → 배포 → 검증.
- 각 wave 후 사용자가 반나절 운영해보고 다음 wave 진행. 메모리 룰 「운영 관찰 모드」가 phase 24 예외이지만 *예외도 단계적으로*.
**Warning signs:** 한 PR 에 모든 변경 묶음, 마이그레이션과 UI 가 같은 배포에 함께 들어감.

## Code Examples

### Example 1: 마이그레이션 0079 SQL 초안 (검증된 패턴 기반)

```sql
-- Source: cha-bio-safety/migrations/0078_marker_description_sync.sql 패턴 + CONTEXT.md
-- 0079: 소화기 자산-위치 분리
--
-- 추가:
--   1) extinguishers.status — 'active' / '폐기'
--   2) check_records.extinguisher_id — 점검 시점 자산 스냅샷
--
-- 백필:
--   - 모든 기존 extinguishers.status = 'active'
--   - 점검 기록은 *현재 매핑된 ext_id* 로 채움 (1:1 매핑 시점이라 안전 — CONTEXT 정책 A)
--   - 또는 NULL 유지 (정책 B) — plan 단계에서 사용자 확정

-- ── 1) extinguishers.status ───────────────────────────
ALTER TABLE extinguishers ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- ── 2) check_records.extinguisher_id ───────────────────
ALTER TABLE check_records ADD COLUMN extinguisher_id INTEGER;

-- ── 3) 인덱스 (자주 쿼리되는 패턴) ─────────────────────
CREATE INDEX IF NOT EXISTS idx_extinguishers_status ON extinguishers(status);
CREATE INDEX IF NOT EXISTS idx_extinguishers_cp_active ON extinguishers(check_point_id, status);
CREATE INDEX IF NOT EXISTS idx_check_records_ext ON check_records(extinguisher_id);

-- ── 4) 백필 (정책 A — 현재 매핑된 ext_id 추정) ─────────
-- 소화기 카테고리만, check_points 가 has-a-1:1-ext 인 행 한정.
-- 1:1 매핑이므로 cp_id 당 ext.id 가 unique → 안전.
UPDATE check_records
SET extinguisher_id = (
  SELECT e.id FROM extinguishers e
  WHERE e.check_point_id = check_records.checkpoint_id
  LIMIT 1
)
WHERE extinguisher_id IS NULL
  AND checkpoint_id LIKE 'CP-FE-%';
```

**검증 명령:**
```bash
cd cha-bio-safety
npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(extinguishers)"
# → status 컬럼이 결과에 있어야 함
npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(check_records)"
# → extinguisher_id 컬럼이 결과에 있어야 함
npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*), COUNT(extinguisher_id) FROM check_records WHERE checkpoint_id LIKE 'CP-FE-%'"
# → 두 카운트가 거의 같아야 함 (NULL 거의 없음)
```

### Example 2: assign 엔드포인트 (충돌 검증 포함)

```typescript
// Source: 신규 — cha-bio-safety/functions/api/extinguishers/[id]/assign.ts
// 패턴: floorplan-markers/[id].ts 의 D1 batch + 검증 로직 모방
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = parseInt(params.id as string, 10)
  if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 자산 ID' }, { status:400 })

  const { check_point_id } = await request.json<{ check_point_id: string }>()
  if (!check_point_id) return Response.json({ success:false, error:'check_point_id 필수' }, { status:400 })

  // 1) 자산 상태 검증
  const ext = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?')
    .bind(id).first<{ id:number; check_point_id:string|null; status:string }>()
  if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
  if (ext.status === '폐기') return Response.json({ success:false, error:'폐기된 자산은 매핑할 수 없습니다' }, { status:409 })
  if (ext.check_point_id) return Response.json({ success:false, error:'이미 매핑된 자산입니다 — 먼저 분리하세요' }, { status:409 })

  // 2) 위치 충돌 검증 — 동일 cp 에 active 자산이 이미 있으면 swap 안내
  const occupant = await env.DB.prepare(
    "SELECT id FROM extinguishers WHERE check_point_id=? AND status='active'"
  ).bind(check_point_id).first<{ id:number }>()
  if (occupant) {
    return Response.json({
      success:false,
      error:'해당 위치에 이미 매핑된 자산이 있습니다',
      data: { occupantId: occupant.id, hint: 'swap' }
    }, { status:409 })
  }

  // 3) check_points 존재 검증
  const cp = await env.DB.prepare('SELECT id FROM check_points WHERE id=? AND is_active=1').bind(check_point_id).first()
  if (!cp) return Response.json({ success:false, error:'점검 개소 없음' }, { status:404 })

  // 4) UPDATE
  await env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now') WHERE id=?")
    .bind(check_point_id, id).run()

  return Response.json({ success:true })
}
```

### Example 3: swap 엔드포인트 (D1 batch atomic)

```typescript
// Source: 신규 — cha-bio-safety/functions/api/extinguishers/[id]/swap.ts
// 패턴: floorplan-markers/[id].ts 의 batch
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = parseInt(params.id as string, 10)
  const { other_extinguisher_id } = await request.json<{ other_extinguisher_id: number }>()
  if (!Number.isFinite(id) || !Number.isFinite(other_extinguisher_id))
    return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })
  if (id === other_extinguisher_id)
    return Response.json({ success:false, error:'동일 자산입니다' }, { status:400 })

  const a = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?').bind(id).first<any>()
  const b = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?').bind(other_extinguisher_id).first<any>()
  if (!a || !b) return Response.json({ success:false, error:'자산을 찾을 수 없음' }, { status:404 })
  if (a.status !== 'active' || b.status !== 'active')
    return Response.json({ success:false, error:'폐기된 자산은 스왑할 수 없습니다' }, { status:409 })
  if (!a.check_point_id || !b.check_point_id)
    return Response.json({ success:false, error:'두 자산 모두 매핑된 상태여야 합니다' }, { status:409 })

  // D1 batch — atomic
  await env.DB.batch([
    env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now') WHERE id=?")
      .bind(b.check_point_id, a.id),
    env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now') WHERE id=?")
      .bind(a.check_point_id, b.id),
  ])

  return Response.json({ success:true })
}
```

### Example 4: dispose 엔드포인트

```typescript
// Source: 신규 — cha-bio-safety/functions/api/extinguishers/[id]/dispose.ts
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  const id = parseInt(params.id as string, 10)
  if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

  const ext = await env.DB.prepare('SELECT id, status FROM extinguishers WHERE id=?').bind(id).first<{id:number;status:string}>()
  if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
  if (ext.status === '폐기') return Response.json({ success:true, data:{noop:true} }) // idempotent

  await env.DB.prepare("UPDATE extinguishers SET status='폐기', check_point_id=NULL, updated_at=datetime('now') WHERE id=?")
    .bind(id).run()

  return Response.json({ success:true })
}
```

### Example 5: list 확장 (매핑 상태 필터)

```typescript
// Source: 확장 — cha-bio-safety/functions/api/extinguishers/index.ts (현재 코드 확장)
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  const url = new URL(request.url)
  const floor = url.searchParams.get('floor')
  const zone = url.searchParams.get('zone')
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status') // 'active' | '폐기' | undefined
  const mapping = url.searchParams.get('mapping') // 'mapped' | 'unmapped' | undefined
  const search = url.searchParams.get('q')

  let sql = `
    SELECT e.*,
           cp.location AS cp_location, cp.floor AS cp_floor, cp.zone AS cp_zone,
           cp.qr_code AS cp_qr_code
      FROM extinguishers e
      LEFT JOIN check_points cp ON e.check_point_id = cp.id
     WHERE 1=1`
  const params: any[] = []

  if (floor)   { sql += ` AND e.floor = ?`;  params.push(floor)   }
  if (zone)    { sql += ` AND e.zone = ?`;   params.push(zone)    }
  if (type)    { sql += ` AND e.type = ?`;   params.push(type)    }
  if (status)  { sql += ` AND e.status = ?`; params.push(status)  }
  if (mapping === 'mapped')   sql += ` AND e.check_point_id IS NOT NULL`
  if (mapping === 'unmapped') sql += ` AND e.check_point_id IS NULL AND e.status = 'active'`
  if (search) { sql += ` AND (e.serial_no LIKE ? OR e.mgmt_no LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }

  sql += ` ORDER BY e.seq_no ASC`
  // 후략 — stats/zones/floors 동일
}
```

### Example 6: SideMenu 항목 추가 (3곳 동시 패치)

```typescript
// 1) src/components/SideMenu.tsx (시설 관리 섹션)
{ label: '소화기 관리', path: '/extinguishers', badge: 0, soon: false },

// 2) src/components/DesktopSidebar.tsx (동일)

// 3) src/utils/api.ts — DEFAULT_SIDE_MENU
{ type: 'item', path: '/extinguishers', visible: true },
```
**Source:** Phase 21 의 `/documents` 추가 패턴 — `migrateLegacyMenuConfig` 가 forward-merge 로 자동 처리. [VERIFIED: src/utils/api.ts:413-421]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `extinguishers ↔ check_points` 1:1 영구 매핑, 폐기 시 cascade DELETE 후 재등록 | `extinguishers.status` + `check_records.extinguisher_id` 스냅샷 + soft-state 머신 | Phase 24 (본 phase) | 자산 이력 추적 가능, 마커는 위치로 영구 보존 |
| 도면에서 마커+자산 동시 등록 (`POST /api/extinguishers/create`) | 도면은 마커만, 자산은 리스트 페이지 | Phase 24 | 자산 등록 동선이 자산 관리 페이지로 일원화. 단, `extinguishers/create` 는 deprecate 만 (이번 phase 에서는 미제거 — CONTEXT 명시). |
| 마커 삭제 시 `extinguishers + check_points cascade` (floorplan-markers/[id].ts:67) | 마커 삭제 시 자산은 *unassign 만* (status='active' 보존), check_points 도 보존 | Phase 24 | **기존 cascade 동작 변경 — plan 에서 명시 필요**. |

**Deprecated/outdated:**
- `POST /api/extinguishers/create` 의 *마커 동시 등록* 흐름은 도면 페이지에서 사용 안 함 (CONTEXT 명시). 그러나 **이번 phase 에서는 제거하지 않음** — 후속 phase 또는 quick task 로 정리.
- FloorPlanPage 의 `addExtMode === 'new'` 분기와 `newExt` state — 본 phase 에서 제거.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 운영 D1 의 `extinguishers` 테이블에는 `status` / `extinguisher_id` 컬럼이 **없음** [ASSUMED based on grep migrations + 코드 검색] | §Summary, §Pitfall 1 | 마이그레이션이 `duplicate column` 으로 실패 — plan 단계에서 `wrangler d1 execute --remote --command "PRAGMA table_info(...)"` 로 직접 확인 필수. |
| A2 | 운영 D1 의 `extinguishers` 행 수 ~600 [ASSUMED — 코드의 `MAX(seq_no)` 패턴 + extinguisher_inaccessible_marks 마이그레이션 의 14개 분포 추정] | §Architectural Map (검색 SQL 화 정당화) | 만약 4000+ 이라면 클라이언트 페이지네이션 필요. 일단 단일 fetch 로 진행. |
| A3 | `check_records` 의 모든 소화기 행은 `checkpoint_id LIKE 'CP-FE-%'` 으로 식별 가능 [VERIFIED via 코드 grep + create.ts:42] — 단, 과거 일부 행이 `category='소화기'` 인 다른 cp 에 매핑되었을 가능성은 [ASSUMED 0]. | §Example 1 백필 SQL | 백필 누락 — `extinguisher_id IS NULL` 인 소화기 점검 행이 일부 남아도 시스템 동작에는 영향 없음 (NULL 허용). |
| A4 | 사용자가 `/extinguishers` 라우트를 선호 [ASSUMED — 기존 단일 segment 라우트 컨벤션] | §Standard Stack §Recommended Project Structure | 다른 경로 선호하면 plan 단계 조정. 매우 저비용. |
| A5 | swap 의 race condition 은 4인 팀 환경에서 무시 가능 [ASSUMED] | §Pitfall, §Example 3 | 동시 swap 발생 시 한쪽이 invalid 상태로 갈 수 있음. WHERE 가드 추가로 완화 가능. |
| A6 | `extinguishers/create` 는 *제거하지 않고* 새 흐름은 별도 엔드포인트(`POST /api/extinguishers`) 또는 `create.ts` 에 `skip_marker=true` 모드 추가 [ASSUMED based on CONTEXT "deprecate 가능" 표현] | §Architectural Map | plan 단계에서 사용자 확정. *별도 엔드포인트 신설* vs *기존 확장* 두 안. |
| A7 | 백필 정책은 *현재 매핑된 ext_id 추정* (정책 A) 를 추천 — 1:1 매핑 시점이라 안전 [ASSUMED — CONTEXT 가 둘 다 허용] | §Example 1 §Open Questions | 정책 B(NULL 유지)도 가능. 사용자 확인 필요. |
| A8 | Phase 22 의존성은 *코드 충돌 없음* — Phase 22 는 `work_logs` 테이블 + `/worklog` 페이지로 본 phase 와 disjoint [VERIFIED — 22-01-PLAN.md 검토] | §depends_on | 안전. |

## Open Questions (RESOLVED — 2026-04-30, codified in PLAN.md set 24-01..24-06)

1. **운영 D1 의 실제 컬럼 상태는?**
   - What we know: 마이그레이션 파일에는 `extinguishers.status` 와 `check_records.extinguisher_id` 가 없음. 그러나 다른 컬럼들(예: `check_records.floor_plan_marker_id`)도 마이그레이션 파일에 없는데 코드는 사용 중 → 미문서화 ALTER 의 가능성 존재.
   - What's unclear: prod D1 에 *이미* `status` 가 추가되어 있을 가능성.
   - Recommendation: **plan 의 wave 1 task 0** 으로 `wrangler d1 execute --remote --command "PRAGMA table_info(extinguishers)"` + `PRAGMA table_info(check_records)` 실행 → 결과를 task 결과에 인라인 기록 → 마이그레이션 SQL 을 그 결과 기반으로 작성.
   - **RESOLVED:** Plan 24-01 Task 1 (checkpoint:human-action) 으로 채택. `PRAGMA table_info(extinguishers)` + `PRAGMA table_info(check_records)` 결과를 wave 1 SUMMARY 에 인라인 기록한 뒤 마이그레이션 SQL 을 기록 기반으로 확정.

2. **백필 정책: A (추정 채움) vs B (NULL 유지)?**
   - What we know: CONTEXT 가 둘 다 허용. 1:1 매핑 보존 시점이므로 추정 정확도는 매우 높음.
   - What's unclear: 사용자가 *과거 점검 기록은 자산 추적 안 됨* 으로 둘지, *현재 매핑 가정으로 채워서 일관성 우선* 으로 갈지.
   - Recommendation: **정책 A 추천**. 5월 법정점검 시 *제출 일지* 가 ext_id 기반 트레이서를 사용한다면 일관성이 중요. 단, plan 단계에서 1줄 확인.
   - **RESOLVED: 정책 A.** Plan 24-01 의 마이그레이션 SQL 이 현재 1:1 매핑 기반으로 `check_records.extinguisher_id` 백필 (`UPDATE check_records SET extinguisher_id = (SELECT e.id FROM extinguishers e WHERE e.check_point_id = check_records.checkpoint_id) WHERE checkpoint_id LIKE 'CP-FE-%' AND extinguisher_id IS NULL`).

3. **`extinguishers/create` 의 처리?**
   - What we know: CONTEXT 가 "deprecate 가능. 리팩토링 시점은 plan 단계에서 결정" 명시.
   - What's unclear: 본 phase 에서 (a) 제거 vs (b) `skip_marker` 모드 추가 vs (c) 별도 신규 엔드포인트 `POST /api/extinguishers` (마커 없이 자산만) 추가 후 기존은 deprecate 표시만.
   - Recommendation: **(c) 안 — 신규 엔드포인트 추가, 기존은 보존**. 도면 페이지에서 옛 흐름 호출 코드를 제거하면 자연스럽게 사용 안 함. 후속 phase 에서 제거.
   - **RESOLVED: (b) 변형 — `extinguishers/create` 에 `skip_marker:true` 모드 추가 후 기존 마커-동시-등록 흐름 호출 코드는 도면에서 제거.** 별도 엔드포인트 신설보다 변경 면적이 작고 기존 1회용 호출(있다면)에도 영향 없음. Plan 24-02 Task 1 에 명시.

4. **마커 삭제 시 자산 처리 정책 변경?**
   - What we know: 현재 `floorplan-markers/[id].ts:67` 가 마커 삭제 시 `extinguishers DELETE` 까지 cascade.
   - What's unclear: 본 phase 에서 *마커 삭제 = 자산 unassign 만* 으로 바꿀지(권장), 아니면 cascade 유지(자산도 폐기 처리)할지.
   - Recommendation: **마커 삭제 = unassign(check_point_id=NULL) 만**. 자산은 status='active' 보존. 사용자가 명시적으로 자산 폐기를 원하면 리스트 페이지에서 처리. plan 에서 명시 task.
   - **RESOLVED: 마커 삭제 = unassign 만 (cascade DELETE 제거).** Plan 24-02 Task 1 의 `floorplan-markers/[id].ts` DELETE 핸들러 수정으로 채택. 자산은 `status='active'` 보존, `check_point_id=NULL` 로만 처리.

5. **빈 마커 ❓ 의 정확한 SVG/색?**
   - What we know: CONTEXT: 색 빨강 `#ef4444` / `var(--danger)`, 모양 ❓. 범례 status row 에 「미배치」 추가.
   - What's unclear: 기존 `MARKER_TYPES_MAP` 구조(SVG 케이스 분기)에 어떻게 끼워 넣을지. **「디자인 변경 전 상의 필수」 메모리 룰 적용 — sketch 먼저**.
   - Recommendation: plan 의 UI 작업 task 시작 전 `sketch/` 에 HTML 시안 작성 → 사용자 승인 → 인라인 적용.
   - **RESOLVED: UI-SPEC §Empty Marker 에서 LOCKED — 색 `#ef4444`, 심볼 `?` (Korean ❓ 대신 ASCII `?` for SVG-friendly), 외곽 stroke 동일.** Plan 24-04 Task 1 (sketch checkpoint:human-action) 에서 sketch HTML 시안 작성 → 사용자 승인 후 Plan 24-04 Task 2 에서 `MarkerIcon` 빈-매핑 분기 인라인 적용. 「디자인 변경 전 상의 필수」 메모리 룰 강제 준수.

6. **assign API 의 충돌 시 응답 — 자동 swap 안내 vs 클라이언트 사이드 처리?**
   - What we know: CONTEXT 의 "매핑된 다른 소화기 클릭 → 위치 스왑" 흐름.
   - What's unclear: 클라이언트가 *명시적으로* swap 엔드포인트를 호출하는지(권장), 아니면 assign 이 *암묵적으로 swap* 으로 동작하는지.
   - Recommendation: **명시적 분리** — assign 은 빈 위치만, 충돌 시 409 + `hint:'swap'` 반환. 클라이언트가 사용자에게 "X 위치 소화기. 서로 바꿀까요?" confirm → swap 호출. 이미 §Example 2 에 반영.
   - **RESOLVED: 명시적 분리 — assign 은 충돌 시 409 + `{hint:'swap', other_extinguisher_id}` 반환.** 클라이언트는 confirm 후 별도 swap 엔드포인트 호출. Plan 24-02 Task 2 (assign 핸들러) + Plan 24-04 Task 2 (도면 클라이언트 confirm 흐름) 에서 채택. swap 은 항상 D1 `env.DB.batch([...])` atomic.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Cloudflare D1 (cha-bio-db) | 마이그레이션 + API | ✓ | b12b88e7-fc41-4186-8f35-ee9cbaf994c7 | — |
| Cloudflare Pages Functions | API 핸들러 | ✓ | compatibility 2024-09-23 | — |
| Wrangler CLI | 배포 + 마이그레이션 적용 | ✓ | ^4.80.0 (package.json) | — |
| Node.js + npm | 빌드 | ✓ | (구체 버전 미확인 — package-lock.json 기준) | — |
| Git | 커밋 | ✓ | — | — |
| `react-router-dom` `useSearchParams` | 마커 동행 query string | ✓ | 6.26.2 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | **없음** (프로젝트에 Jest/Vitest/Playwright 미설치) |
| Config file | none |
| Quick run command | `cd cha-bio-safety && npx tsc --noEmit` (타입 검증) + `npm run build` (Vite) |
| Full suite command | `cd cha-bio-safety && npm run build && npx wrangler d1 execute cha-bio-db --remote --command "..."` (수동 SQL 검증) |

**프로젝트 정책:** *프로덕션 배포 후 테스트* (메모리 룰). 단위 테스트 인프라 없음. 검증은 (a) `tsc --noEmit` (b) `npm run build` (c) `wrangler` SQL 직접 검증 (d) prod 배포 후 사용자 UAT 의 4단계.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| EXT-04 | `extinguishers.status` 컬럼 존재 | smoke | `npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(extinguishers)" \| grep status` | manual |
| EXT-04 | `check_records.extinguisher_id` 컬럼 존재 | smoke | `npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(check_records)" \| grep extinguisher_id` | manual |
| EXT-04 | 백필 후 소화기 점검 기록의 ext_id NULL 비율 ≤ 5% | smoke | `npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) total, SUM(CASE WHEN extinguisher_id IS NULL THEN 1 ELSE 0 END) nulls FROM check_records WHERE checkpoint_id LIKE 'CP-FE-%'"` | manual |
| EXT-04 | 기존 `extinguisher.check_point_id` 1:1 매핑 보존 | smoke | `npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) FROM extinguishers WHERE check_point_id IS NOT NULL"` (마이그레이션 전후 비교) | manual |
| EXT-05 | `/extinguishers` 라우트 진입 가능 | manual-only | (배포 후 브라우저 진입) | — |
| EXT-05 | 매핑 상태 필터 동작 (4가지) | manual-only | (배포 후 사용자 클릭) | — |
| EXT-05 | 신규 등록 → 자산만 등록 (cp_id=null) | manual + sql | 등록 후 `npx wrangler d1 execute --remote --command "SELECT id, check_point_id, status FROM extinguishers ORDER BY id DESC LIMIT 1"` | — |
| EXT-05 | ≤3 필드 변경 검증 (백엔드) | smoke | `curl -X PUT /api/extinguishers/{id} -d '...4개 변경...'` → 400 | manual |
| EXT-05 | assign 충돌 시 409 + hint:'swap' | smoke | curl 시나리오 | manual |
| EXT-05 | swap atomic — 두 자산 cp_id 가 동시 변경 | smoke | swap 호출 후 `SELECT id, check_point_id FROM extinguishers WHERE id IN (a,b)` | manual |
| EXT-05 | dispose 후 status='폐기', cp_id=NULL | smoke | dispose 호출 후 SELECT | manual |
| EXT-05 | hard delete 가드 (점검기록 있으면 거부) | smoke | DELETE 호출 → 400 | manual |
| EXT-05 | 빈 마커(❓) 도면 렌더 | manual-only | 배포 후 시각 확인 | — |
| EXT-05 | 점검 시 ext_id 스냅샷 저장 | smoke | 새 점검 후 `SELECT extinguisher_id FROM check_records ORDER BY checked_at DESC LIMIT 1` | manual |

### Sampling Rate
- **Per task commit:** `cd cha-bio-safety && npx tsc --noEmit`
- **Per wave merge:** `cd cha-bio-safety && npm run build` + 핵심 SQL 검증 명령
- **Phase gate:** Wave 1(마이그레이션+API) 배포 → 사용자 UAT → Wave 2 진행

### Wave 0 Gaps

본 프로젝트는 자동 테스트 인프라가 없음 — 도입은 운영 관찰 모드 와 충돌 (별도 phase 가 필요). 본 phase 에서 다음을 *문서로 명시*:

- [ ] `cha-bio-safety/.planning/phases/24-extinguisher-asset-location/24-VALIDATION.md` (신규) — 위 §Phase Requirements → Test Map 의 SQL 검증 명령들을 실행 절차로 정리
- [ ] 각 wave 의 SUMMARY.md 에 검증 명령 실제 출력 인라인 첨부
- [ ] 5월 법정점검 *시작 전* 운영 D1 의 자산 카운트/매핑 카운트를 baseline 으로 캡쳐 (회귀 검증용)

*(자동 단위 테스트 도입은 본 phase 의 scope 밖 — 메모리 룰 「운영 관찰 모드」 + 「프로덕션 배포 후 테스트」)*

## Sources

### Primary (HIGH confidence)
- `cha-bio-safety/CLAUDE.md` — 프로젝트 제약/관습
- `cha-bio-safety/.planning/phases/24-extinguisher-asset-location/CONTEXT.md` — 본 phase 잠금 결정
- `cha-bio-safety/.planning/REQUIREMENTS.md` / `STATE.md` / `ROADMAP.md` — 프로젝트 상태
- `cha-bio-safety/migrations/0001_init.sql` — 기본 스키마
- `cha-bio-safety/migrations/0011_fire_extinguishers.sql` (구 fire_extinguishers — 폐기됨)
- `cha-bio-safety/migrations/0033_floor_plan_markers.sql` — 마커 테이블
- `cha-bio-safety/migrations/0035_extinguishers.sql` — **현행 extinguishers 스키마**
- `cha-bio-safety/migrations/0049_fire_extinguisher_location_no.sql` / `0066_fe0031_floor_fix.sql` / `0072_floor_plan_markers_description.sql` / `0075_extinguisher_inaccessible_marks.sql` / `0078_marker_description_sync.sql` — 운영 데이터 패턴
- `cha-bio-safety/functions/api/extinguishers/{index,create,[checkPointId]}.ts` — 현행 API
- `cha-bio-safety/functions/api/floorplan-markers/{index,[id]}.ts` — 마커 API + cascade 로직
- `cha-bio-safety/functions/api/check-points/{index,[id]}.ts` — cp API + cascade
- `cha-bio-safety/functions/api/inspections/{index,records,[sessionId]/records}.ts` — 점검 기록 API
- `cha-bio-safety/functions/api/public/extinguisher/[checkpointId].ts` — 공개 점검표 (영향 검증 대상)
- `cha-bio-safety/src/pages/FloorPlanPage.tsx` — 도면 페이지 전체 (1978 line)
- `cha-bio-safety/src/pages/InspectionPage.tsx` — 일반점검 (5251 line, §소화기 카드 부분)
- `cha-bio-safety/src/utils/api.ts` — API 클라이언트 + DEFAULT_SIDE_MENU
- `cha-bio-safety/src/components/SideMenu.tsx` — 메뉴 라벨 정의
- `cha-bio-safety/src/App.tsx` — 라우트 + PAGE_TITLES
- `cha-bio-safety/package.json` + `wrangler.toml` — 환경
- `cha-bio-safety/.planning/phases/22-form-excel-output/22-01-PLAN.md` / `20-document-storage/20-03-PLAN.md` — 마이그레이션 적용 명령 패턴
- `MEMORY.md` 의 운영 관찰 모드 / 디자인 변경 / PWA 캐시 / 프로덕션 배포 룰

### Secondary (MEDIUM confidence)
- 미문서화 컬럼 추정 — 코드 grep 으로 *사용 중* 까지만 확인. 실제 prod 컬럼 상태는 plan 단계에서 `PRAGMA table_info` 로 직접 검증 필요.

### Tertiary (LOW confidence)
- 운영 행 카운트(~600) — 추정. 정확 값 필요 시 `SELECT COUNT(*) FROM extinguishers`.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 stack 만 사용, 코드와 package.json 직접 검증
- Architecture: HIGH — 기존 패턴(D1 batch, 라우터, 모달)에 검증된 적용
- Pitfalls: HIGH — 운영 메모리 룰 + 코드의 cascade/PWA 관련 패턴 직접 검증
- Migration SQL: MEDIUM — 패턴은 검증됐으나 prod D1 컬럼 상태 직접 미확인 (Open Question 1 의 검증 필수)
- ≤3 필드 룰 구현: HIGH — 패턴 명확, 정규화 케이스 식별
- 마커 동행 query string: HIGH — 다른 페이지(`RemediationPage`, `LegalPage`)에서 동일 패턴 검증

**Research date:** 2026-04-30
**Valid until:** 2026-05-15 (5월 법정점검 종료 또는 2주 — 운영 D1 schema 가 빠르게 변할 수 있음)

---

## RESEARCH COMPLETE

**Phase:** 24 - 소화기 자산-위치 분리
**Confidence:** HIGH (코드/마이그레이션 검증) · MEDIUM (운영 D1 실제 컬럼 직접 미확인)

### Key Findings
- `extinguishers.check_point_id` 는 이미 존재 (NOT NULL) — 마이그레이션은 NULL 허용으로 변경 필요. 단순 ALTER 가 아니라 *컬럼 의미 변경* (NOT NULL 제거)이 핵심.
- `extinguishers.status` 와 `check_records.extinguisher_id` 는 **마이그레이션 파일에 없음** — 신규 추가 대상. 단, 운영 D1 에 미문서화 ALTER 가 있을 가능성 → **plan wave 1 의 첫 task 로 `PRAGMA table_info` 검증 필수**.
- `floorplan-markers/[id].ts:67` 의 cascade DELETE 동작은 **본 phase 에서 unassign 으로 변경** 필요 (자산 보존 원칙).
- 마이그레이션 적용은 `npx wrangler d1 execute cha-bio-db --remote --file=migrations/0079_*.sql` 패턴 (Phase 20/22 에서 검증).
- 신규 페이지 추가의 SideMenu 통합은 3곳 동시 패치 + `migrateLegacyMenuConfig` forward-merge 가 자동 처리.
- 5월 법정점검 임박 — wave 단위 배포(마이그+API → 페이지 → 통합) 강력 권장.

### File Created
`.planning/phases/24-extinguisher-asset-location/24-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | 기존 패턴 100% 재사용, 신규 의존성 0 |
| Architecture | HIGH | D1 batch / 라우팅 / 모달 / migrate 패턴 모두 검증 |
| Pitfalls | HIGH | 운영 메모리 룰 + 코드 cascade 실제 검증 |
| Migration SQL | MEDIUM | 패턴은 검증, prod 컬럼 상태 미확인 (Open Q1) |

### Open Questions (RESOLVED — see §Open Questions section above)
1. 운영 D1 의 실제 컬럼 상태 → **RESOLVED:** Plan 24-01 Task 1 PRAGMA 검증 task
2. 백필 정책 → **RESOLVED: 정책 A** (현재 1:1 매핑 기반 추정 채움)
3. `extinguishers/create` 처리 → **RESOLVED: skip_marker 모드 추가** (Plan 24-02 Task 1)
4. 마커 삭제 시 자산 cascade → **RESOLVED: unassign 만** (Plan 24-02 Task 1)
5. ❓ 마커 SVG 디자인 → **RESOLVED:** UI-SPEC LOCKED + Plan 24-04 sketch checkpoint
6. assign 충돌 시 응답 → **RESOLVED: 409 + hint:'swap'** (Plan 24-02 + 24-04)

### Ready for Planning
Research complete. 플래너는 이 RESEARCH.md 와 CONTEXT.md 를 입력으로 (a) `0079` 마이그레이션 + 백엔드 wave, (b) `ExtinguishersListPage` wave, (c) FloorPlanPage/InspectionPage 통합 wave 의 3-wave PLAN.md 들을 작성 가능. **Open Question 1 은 wave 1 의 첫 task** 로 끼워 넣어 plan 작성과 동시에 해소.
