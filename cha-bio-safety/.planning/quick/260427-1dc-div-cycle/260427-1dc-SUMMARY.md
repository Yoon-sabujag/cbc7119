---
phase: quick-260427-1dc
plan: 01
subsystem: dashboard, inspection
tags:
  - dashboard
  - inspection
  - donut
  - cycle-window
  - DIV
  - 컴프레셔
requires:
  - schedule_items 에 DIV/컴프레셔 inspect 일정이 등록돼 있음
provides:
  - DIV/컴프레셔 카테고리에 대해 cycle window (현재/직전 연속 블록) 기준 진행률 표시
  - "이번 달 점검 현황" 도넛에 doubleCycle two-lap overlay 시각화
affects:
  - functions/api/dashboard/stats.ts (inspDoneN, monthlyItems)
  - src/utils/inspectionProgress.ts (computeCardCompletion)
  - src/components/ui/index.tsx (Donut)
  - src/pages/DashboardPage.tsx (MonthlyItem + 두 Donut 호출부)
  - src/pages/InspectionPage.tsx (line 4418 호출부 + IIFE 안에 _todayForCycle)
tech-stack:
  added: []
  patterns:
    - "consecutive date block grouping (서버 getCycleRange / 클라 getCycleRangeJS 동일 로직)"
    - "Donut overlay arc (월초 색A 한 바퀴 → 월말 색B overlay)"
key-files:
  created: []
  modified:
    - functions/api/dashboard/stats.ts
    - src/utils/inspectionProgress.ts
    - src/components/ui/index.tsx
    - src/pages/DashboardPage.tsx
    - src/pages/InspectionPage.tsx
decisions:
  - "CYCLE_CATEGORIES 는 'DIV', '컴프레셔' 둘만 — 나머지 카테고리는 회귀 방지로 기존 monthly 윈도우 그대로"
  - "cycle window = today 포함 블록 → 없으면 today 이전 가장 최근 블록 → 없으면 폴백 [monthStart, monthEnd]"
  - "Donut.doubleCycle 미전달 시 기존 단일 arc 동작 100% 보존 (backward compat)"
  - "doubleCycle 메타에서 pct = (early_pct + late_pct)/2 로 표시용 호환값 보존, done = early_done + late_done"
  - "InspectionPage 호출부는 IIFE 로 _todayForCycle 한 번만 만들어 .map 안에서 사용 (다른 today 로컬과 충돌 방지)"
metrics:
  duration_minutes: ~25
  completed_at: 2026-04-27
  tasks: 3
  files_changed: 5
  commits: 2
---

# Quick 260427-1dc: DIV/컴프레셔 cycle window 인식 Summary

DIV/컴프레셔 카테고리(월 2 cycle 구조) 의 진행률 표시를 cycle window 기준으로 정확히 인식하도록 수정. 대시보드 "오늘 현황 점검 미완료" / "이번 달 점검 현황" 도넛 / 점검 페이지 카드 — 3 곳 모두 같은 룰(현재/직전 연속 블록) 로 동기화. 다른 카테고리는 코드 경로 그대로 → 회귀 없음.

## One-liner

DIV/컴프레셔 격주 점검 사이클을 정확히 반영하도록 서버(stats.ts) + 클라이언트(inspectionProgress, Donut, DashboardPage, InspectionPage) 5개 파일에 cycle window 분기 추가; 다른 카테고리/Donut backward compat 100% 보존.

## 변경 요약

### 1) functions/api/dashboard/stats.ts (Task 1, commit 067c813)
- `CYCLE_CATEGORIES = new Set(['DIV', '컴프레셔'])` 정의
- `getCycleRange(env, cat, today, monthStart, monthEnd)` — today 포함 블록 또는 이전 가장 최근 블록 반환
- `getMonthlyBlocks(env, cat, monthStart, monthEnd)` — 이번 달 모든 연속 블록 반환 (early/late 각 cycle 집계용)
- `inspDoneN` 루프: DIV/컴프레셔만 `getCycleRange` 결과로 `[startDate, endDate]` 사용, 그 외는 `[_monthStart, _monthEnd]` 그대로
- `monthlyItems` 루프: `cpTotal === 0` 분기 직후 / 기존 일반 분기 직전에 DIV/컴프 doubleCycle 분기 삽입 (early_done/late_done/early_pct/late_pct/early_color='var(--info)'/late_color='var(--warn)' + doubleCycle:true 메타 push)
- monthlyItems 배열 타입 시그니처에 doubleCycle/early_*/late_* 옵셔널 필드 추가

### 2) src/utils/inspectionProgress.ts (Task 2)
- `CYCLE_CATEGORIES` 동일 정의
- `getCycleRangeJS(scheduleItems, cat, today)` — 서버 `getCycleRange` 와 동일 로직의 클라이언트 버전 (scheduleItems 는 InspectionPage useQuery 로 당월치만 로드)
- `computeCardCompletion` 시그니처 확장: `scheduleItems?: ScheduleItem[]`, `today?: string` 옵셔널 추가
- DIV/컴프 + scheduleItems + today 모두 있으면 cycle window 안에 기록(`monthRecordDates[cp.id]`) 이 하나라도 있는지 검사
- 폴백: cycle 일정이 아예 없으면(`range === null`) → 기존 monthly 동작 (records 있으면 완료)
- 다른 카테고리 / 인자 미전달 시: 기존 monthly 동작 100% 그대로 (backward compat)

### 3) src/components/ui/index.tsx (Task 2)
- `DonutProps.doubleCycle?: { earlyPct, latePct, earlyColor, lateColor }` 옵셔널 추가
- doubleCycle 분기:
  - 트랙(`var(--bg4)`) → earlyArc(stroke=earlyColor, dash=earlyPct/100) → lateArc(stroke=lateColor, dash=latePct/100) overlay
  - 텍스트는 `{earlyPct}/{latePct}` 형태 (200% 두 cycle 값 동시 표시)
- doubleCycle 미전달 시: 기존 단일 arc 100% 보존 (zero=='#2a2f37', text=`{pct}%`, fontSize:10 등 모두 동일)

### 4) src/pages/DashboardPage.tsx (Task 2)
- `MonthlyItem` 인터페이스에 doubleCycle/early_*/late_* 옵셔널 추가 (서버 응답과 일치)
- desktop (line 269) 와 mobile (line 553) 두 `<Donut>` 호출부 모두 `m.doubleCycle ? <Donut doubleCycle={...}/> : <Donut .../>` 분기로 교체
- size 값 (52 desktop / 44 mobile) 기존 그대로
- done/total 표시 (`{m.done}/{m.total}`) 기존 그대로 (서버에서 done = early_done+late_done, total = cpTotal 로 채움)

### 5) src/pages/InspectionPage.tsx (Task 2)
- 카테고리 그리드 `<div ...>` 안 `.map(...)` 을 IIFE 로 감싸 `_todayForCycle` 한 번만 KST 로컬로 만들어서 사용
- line 4418 (변경 전): `doneCnt = computeCardCompletion({ cps, monthRecordDates })`
- line 4423 (변경 후): `doneCnt = computeCardCompletion({ cps, monthRecordDates, scheduleItems, today: _todayForCycle })`
- 유도등 분기(isGL) 기존 그대로
- scheduleItems 는 line 3936 `useQuery` 로 이미 로드됨 — 추가 import 없음

## 서버/클라이언트 cycle window 동기화

| 항목 | 서버 (`getCycleRange`) | 클라이언트 (`getCycleRangeJS`) |
|---|---|---|
| 입력 | env(D1), cat, today, monthStart, monthEnd | scheduleItems(당월), cat, today |
| 데이터 소스 | `SELECT DISTINCT date FROM schedule_items WHERE category='inspect' AND inspection_category=cat ...` | `scheduleItems.filter(s => s.category==='inspect' && s.inspectionCategory===cat).map(s => s.date)` |
| 블록 그룹핑 | `dayDiff(prev, cur) === 1` 이면 같은 블록 | 동일 |
| today 포함 블록 우선 | `today >= b[0] && today <= b[last]` | 동일 |
| 폴백 | `[monthStart, monthEnd]` (서버는 SQL 윈도우 필요) | `null` (클라는 호출자가 monthly 동작으로 폴백) |

→ 두 헬퍼가 같은 입력에 대해 같은 [start, end] 결과를 산출하도록 정합성 유지. 점검 카드(클라) 와 대시보드 카드(서버) 가 같은 cycle 기간 안에서 같은 cp 완료 카운트를 보여줌.

## monthlyItems doubleCycle 메타 + Donut overlay 흐름

```
서버 stats.ts:
  if (CYCLE_CATEGORIES.has(cpCategory)) {
    blocks = getMonthlyBlocks(...)
    earlyBlock = blocks[0], lateBlock = blocks[1]
    early_done = cycleDone(earlyBlock)   // [s, e] 로 record + auto 카운트
    late_done  = cycleDone(lateBlock)
    early_pct/late_pct = min(round(done/total * 100), 100)
    push { ..., doubleCycle:true, early_done, late_done, early_pct, late_pct, early_color:'var(--info)', late_color:'var(--warn)' }
  }

API JSON:
  monthlyItems[i] = {
    label, pct, color, total, done,
    doubleCycle: true,
    early_pct: 100, late_pct: 60,
    early_color: 'var(--info)', late_color: 'var(--warn)'
  }

DashboardPage:
  m.doubleCycle 분기 → <Donut doubleCycle={{ earlyPct, latePct, earlyColor, lateColor }} />

Donut:
  배경 트랙 → earlyArc(파랑) 100% 한 바퀴 → lateArc(주황) 60% overlay
  텍스트 "100/60"
```

## 회귀 체크 결과

- 다른 카테고리(소화기/소화전/스프링클러/유도등/감지기/제연/방화셔터/특별피난계단/CCTV/회전문/주차장비) 코드 경로 변경 없음:
  - inspDoneN: `CYCLE_CATEGORIES.has(cat)` false → `[_monthStart, _monthEnd]` 그대로 사용 → 기존 SQL 동일
  - monthlyItems: 유도등 분기 / `cpTotal === 0` 분기 / 일반 분기 모두 그대로 흐름 (DIV/컴프 분기는 일반 분기 직전, `continue` 로 빠짐)
  - computeCardCompletion: `CYCLE_CATEGORIES.has(cp.category)` false → 기존 `monthRecordDates[cp.id]?.length` 동작 그대로
- Donut backward compat:
  - `doubleCycle` 미전달 시 if-block 진입 안 함 → 기존 dash/zero/'#2a2f37'/'JetBrains Mono'/fontSize:10/`{pct}%` 텍스트 모두 동일
- 빌드 검증: 빌드된 JS 번들에 `early_pct`, `earlyPct`, `var(--info)` 식별자 포함 (DashboardPage), `It = new Set(["DIV","컴프레셔"])`, `Dt`(getCycleRangeJS), `Bt`(computeCardCompletion) 포함 (InspectionPage 번들)
- check_records 테이블 / SQL 안에 DELETE/UPDATE 절 0개 (점검 기록 절대 수정 금지 원칙 유지)

## 빌드 + 배포

```bash
cd /Users/jykevin/Documents/20260328/cha-bio-safety
npm run build   # ✓ tsc PASS, vite ✓ built in 10.60s, sw.js 67 entries
npx wrangler pages deploy dist --branch production --commit-message "div compressor cycle recognition"
# ✨ Success! Uploaded 33 files (318 already uploaded) (2.02 sec)
# 🌎 Deployment complete! https://13c5704c.cbc7119.pages.dev
```

`wrangler pages deployment list --project-name=cbc7119` 로 확인:
- Id: 13c5704c-967a-43de-a64f-15d75d328624
- Environment: **Production**
- Branch: **production**
- Source: c5708fc (Task 2 client commit)
- Status: 12 seconds ago

ASCII commit message 사용 (`feedback_wrangler_commit_utf8` 회피). `--branch production` 명시 (`feedback_deploy_branch` 회피).

## 사용자 PWA 재설치 + 검증 안내 (5 항목)

PWA 캐시가 새 배포를 무시하는 사례 다수(`feedback_pwa_cache_invalidation`) — 사용자는 다음 절차로 검증:

1. 모바일 홈화면의 cha-bio-safety 앱 아이콘 길게 눌러 **삭제**
2. Safari/Chrome 에서 `https://cha-bio-safety.pages.dev/` 다시 접속
3. "홈 화면에 추가" 로 PWA 재설치
4. 로그인 후 아래 5 항목 확인:

### 검증 5 항목

1. **대시보드 "오늘 현황 점검 미완료" (DIV/컴프 일정이 있는 날)**
   - 오늘이 DIV/컴프 cycle 안 → cycle window 시작일 ~ 오늘 까지 기록만 카운트
   - 오늘이 cycle 사이 gap → 직전 cycle 의 완료 개수 표시
   - 다른 카테고리 일정인 날엔 변화 없음

2. **대시보드 "이번 달 점검 현황" 도넛**
   - DIV/컴프 카드: 두 색 arc — 월초(파랑 `var(--info)`) + 월말(주황 `var(--warn)`)
   - 텍스트가 `{earlyPct}/{latePct}` 형태로 표시 (예: "100/0", "100/60", "100/100")
   - 다른 카테고리 도넛: 기존 단일 arc + `{pct}%` 텍스트 그대로

3. **점검 페이지 점검 항목 카드 (DIV / 컴프레셔 카드)**
   - 현재 cycle 안: cycle window 안 기록만 카운트 → done/total
   - cycle 사이 gap: 직전 cycle 의 완료 개수
   - 다른 카테고리 카드: 기존 monthly 카운트 그대로

4. **회귀 체크 (절대 변하면 안 됨)**
   - 소화기/소화전/스프링클러/유도등/감지기/제연/방화셔터 카테고리 done/total 동일
   - "오늘 현황 점검 미완료" 가 DIV/컴프 외 일정인 날엔 기존 숫자 그대로
   - 점검 기록(check_records) 자체 변경 없음

5. **이번 달 DIV/컴프 일정 위치 확인 (4/27 기준)**
   - 4월 DIV/컴프 cycle 일정이 월초/월말 어디에 있는지 사용자가 직접 확인
   - 4/27 이 cycle 안이면 "현재 cycle 진행률" 보임
   - 4/27 이 두 cycle 사이 gap 이면 "직전 cycle 완료 개수" 보임 (예: 월초 cycle 끝났으면 100/0)

### 사용자 메모

- 4월 잔여분으로 미리 검증 → 5월 법정점검 실전 검증이 1순위 (`project_operation_mode`)
- gap 기간 표시 (직전 cycle 잔존) 가 의도대로 보이는지가 핵심 검증 포인트
- 두 cycle 색 가독성 — 파랑(`var(--info)`) + 주황(`var(--warn)`) 대비 충분한지 확인

## Deviations from Plan

None — Plan 의 Task 1/2/3 스펙 그대로 실행. 사소한 구조 차이 한 가지:

- **Plan: "today const 한 번만 선언, IIFE 또는 카테고리 그리드 직전"** → IIFE 채택
  - 이유: `loading` 검사 외부 자리(line 4395 직전)는 `loading=true` 분기에서 today 가 무의미. `.map(...)` 직전 자리(line 4400 안)는 인라인 `const` 선언 불가(JSX expression child).
  - 해결: `<div ...>` 안의 `{...}` JSX expression 으로 IIFE `(() => { const _todayForCycle = ...; return CATEGORY_GROUPS.map(...) })()` 로 한 번만 만들어 `.map` 콜백 클로저로 공유.
  - 영향: 함수 단위 closure 1회 실행, 기존 `loadTodayRecords` 내 로컬 `today` 와 이름 충돌 없음(`_todayForCycle`).

기능/회귀 영향 0.

## Commits

- 067c813 — feat(quick-260427-1dc-01): add cycle window logic for DIV/compressor in dashboard stats
- c5708fc — feat(quick-260427-1dc-02): client-side cycle window for DIV/compressor

## Self-Check: PASSED

- 변경 파일 5개 모두 git 에 반영됨 (FOUND on disk)
- 067c813 / c5708fc 두 commit 모두 git log 에 존재
- TypeScript noEmit PASS (exit 0)
- npm run build PASS (vite + sw)
- 빌드 산출물에 `early_pct/earlyPct/var(--info)` (DashboardPage 번들) + `It=new Set(["DIV","컴프레셔"]) / Dt / Bt` (InspectionPage 번들) 포함 확인
- 프로덕션 배포 성공: 13c5704c-..., Branch=production, Source=c5708fc
- check_records 에 DELETE/UPDATE SQL 0개 (점검 기록 보존 원칙 준수)

## TDD Gate Compliance

해당 plan 은 `type: execute` 로 TDD 플로우 대상이 아님 — 별도 RED/GREEN 게이트 검증 불필요.
