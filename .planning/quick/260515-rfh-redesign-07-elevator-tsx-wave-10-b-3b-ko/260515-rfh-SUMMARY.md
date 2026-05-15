---
phase: quick-260515-rfh
plan: 01
subsystem: redesign-07-elevator
tags: [redesign, tsx, wave-10, option-b-3b, koelsa, inspect-tab, annual-tab, v0.1.1-tokens, lucide, tailwind]
requires:
  - branch: redesign/07-elevator
  - sketch: 031ddfb inspect-cert-history-sketch.html (Wave 10 시안 권위, 1888 라인)
  - preserved: Wave 1~9 변환 결과 + 안전관리자 탭 (`tab === 'safety'`)
provides:
  - 점검 기록 탭 본문 v0.1.1 토큰 + Tailwind + lucide 변환
  - 검사 기록 탭 본문 v0.1.1 토큰 + Tailwind + lucide 변환
  - KoelsaHistorySection 본체 v0.1.1 토큰 + Tailwind + lucide 변환
affects:
  - cha-bio-safety/src/pages/ElevatorPage.tsx (점검/검사 IIFE + lucide import 확장)
  - cha-bio-safety/src/components/KoelsaHistorySection.tsx (전체 본체 + dispClass 헬퍼 + lucide import)
tech-stack:
  added:
    - lucide-react ClipboardList (점검 빈 / 검사 yearStr 빈)
    - lucide-react Search (검사 hasAny=false 빈)
    - lucide-react ChevronLeft (월 피커 + 연도 피커 prev)
    - lucide-react AlertTriangle (KoelsaHistorySection 부적합 헤더)
    - lucide-react ChevronRight (KoelsaHistorySection 펼침 chevron)
  patterns:
    - "::before pseudo 좌측 색바 (Wave 9 3A 패턴 재사용)"
    - "dispClass 헬퍼 패턴 (text/bg/bar className 객체 반환) — KoelsaHistorySection + ElevatorPage 두 곳"
    - "isMobile 분기 → className 변수 매핑 (padCls/headerCls/dateCls/subCls)"
    - "TYPE_ICON 이모지 → TYPE_ICON_COMPONENT lucide 컴포넌트 매퍼 (Wave 1 패턴)"
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
    - cha-bio-safety/src/components/KoelsaHistorySection.tsx
decisions:
  - "TYPE_ICON 글로벌 객체 정의 line 194 유지 — EvDetailModal line 673 (Wave 1~9 영역) 에서 여전히 사용 중. Wave 10 zones (점검/검사) 에서만 TYPE_ICON_COMPONENT 로 교체"
  - "dispClass 헬퍼는 KoelsaHistorySection.tsx 와 ElevatorPage.tsx (annual IIFE) 두 곳 별도 정의 — 두 컴포넌트 독립성 유지 (props 시그니처 보존)"
  - "주의관찰 grid `display:contents` 보존 + cellBase 변수 + isLast 분기 직접 className 조합 — last:border-b-0 만으로는 grid + display:contents 조합에서 row-level 마지막 cell 구분 불가"
  - "subFs - 1 (10/11px) 격상 정책: text-caption(12px) 으로 통일 — 9·10·11px 격상 룰 강제"
  - "headerCls 데스크톱 16px 토큰 미정의 — `text-[16px] font-bold leading-[1.4]` arbitrary value (tailwind.config.js typography 토큰 추가 X — 본 wave 영역 외)"
metrics:
  duration_sec: 412
  files_modified: 2
  insertions: 221
  deletions: 148
  completed_at: "2026-05-15T11:00:21Z"
---

# Quick 260515-rfh: redesign/07-elevator TSX Wave 10 — 옵션 B 3B 변환 Summary

옵션 B 3B sketch (031ddfb) 1:1 매핑 변환 — ElevatorPage.tsx 점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection.tsx 본체 3 영역 v0.1.1 토큰 + Tailwind + lucide 적용. Wave 9 3A 변환 (고장 탭 + RepairListSection + FAB) 의 mirror structure.

## What changed

### (1) ElevatorPage.tsx 점검 기록 탭 본문 (line 1225~1386)

- **월 피커 (line 1233~1252)** — `flex items-center gap-2 mb-1` + 32×32 button(`w-8 h-8 rounded-lg bg-surface-raised border border-border-default`) + `<ChevronLeft size={16} />` / `<ChevronRight size={16} />` + 가운데 라벨 `text-body-sm font-bold text-text-primary`. ‹/› 문자 제거.
- **로딩/에러/빈 메시지** — `text-center py-6 text-caption text-text-tertiary` (로딩) / `text-danger` (에러) / `<EmptyState icon={<ClipboardList size={36} />} text="해당 월 점검 기록이 없어요" />` (📋 제거).
- **그룹 헤더 (line 1264~1266)** — `text-caption font-bold text-text-tertiary tracking-wider uppercase mb-1.5 mt-1`. TYPE_ICON 이모지 제거 (sketch 디자인에 그룹 헤더 이모지 없음 확인). TYPE_LABEL 텍스트만 + 그룹 개수.
- **카드 wrapper (line 1294~1302)** — `relative bg-surface-raised border rounded-xl overflow-hidden mb-1.5 shrink-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-xl`. 분기:
  - 양호: `before:bg-safe-bar border-border-default`
  - 이상: `before:bg-warning-bar border-warning-bar/40`
  - 미점검: `before:bg-surface-sunken border-border-default`
- **카드 헤더** — `pl-3.5 pr-3 py-2.5 flex items-center gap-2.5 cursor-pointer|default`. TYPE_ICON 이모지 → `TYPE_ICON_COMPONENT[type]` lucide 컴포넌트 (size={22} text-text-secondary). 호기 라벨 `text-label font-bold text-text-primary` + 위치 부가 `text-caption text-text-tertiary ml-1`. 점검일 `text-caption text-text-tertiary mt-0.5`. 배지 시맨틱 토큰 (text-safe·bg-safe-bg / text-warning·bg-warning-bg / text-text-tertiary·bg-surface-sunken). 펼침 chevron → `<ChevronRight size={14} className="... rotate-90" />`.
- **펼친 영역** — 점검업체/점검자 grid `grid grid-cols-2 gap-y-1 gap-x-3 text-caption mb-2` (라벨 text-tertiary / 값 text-primary font-semibold). A~E 카운트 칩 `chipClass` 객체 매핑 (A safe / B warning / C danger / D·E text-tertiary). 주의관찰 grid 3-col `gridTemplateColumns: '50px 1fr auto'` 인라인 화이트리스트 보존 — 헤더 `<AlertTriangle size={12} />` + "주의관찰 항목". cellBase 변수 `px-2 py-1.5 text-caption ${isLast ? '' : 'border-b border-border-default'}` (display:contents + isLast 분기 직접 표현). 결과 cell 분기 `text-danger`(C) / `text-warning`(그 외).

### (2) ElevatorPage.tsx 검사 기록 탭 본문 (line 1387~1578)

- **dispClass 헬퍼 신설** — text/bg/bar className 객체 반환 (5종: 합격 safe / 보완후·조건부 warning / 보완·불합격 danger / null·기타 text-tertiary). 기존 dispColor var() 반환 함수 교체.
- **cert_no 없음** — `text-center py-10 text-caption text-text-tertiary`.
- **연도 피커** — 월 피커와 동일 구조 (`<ChevronLeft size={16} />` / `<ChevronRight size={16} />`).
- **5 상태 메시지** — 로딩 `text-text-tertiary` / 에러 `text-danger` / `<EmptyState icon={<Search size={36} />}>` (hasAny=false 빈) / `<EmptyState icon={<ClipboardList size={36} />}>` (yearStr 빈). 🔍/📋 제거.
- **검사 카드 wrapper** — 좌측 색바 `dispClass(latest?.dispWords).bar` 동적 적용 (4종: safe-bar/warning-bar/danger-bar/surface-sunken). `relative ... before:w-[3px] before:rounded-l-xl`.
- **카드 헤더** — TYPE_ICON_COMPONENT 매퍼 적용. 호기 라벨 `text-label font-bold` + escalator 공단호기 `text-caption text-text-tertiary ml-1.5` + classification `ml-1`. 배지 `dispClass.text/bg` 매핑 (인라인 alpha bg `${badge}22` 제거).
- **펼친 영역** — `border-t border-border-default px-3 py-2.5 flex flex-col gap-2`. 이력 카드 `bg-surface-sunken border border-border-default rounded-lg px-3 py-2.5`. 날짜 `text-label font-bold` / inspectKind `text-caption text-tertiary` / 배지 `dispClass` 매핑. 유효기간 `text-caption text-text-secondary` / 기관 `text-caption text-tertiary mt-0.5`. 부적합 영역 `border-t mt-2 pt-2` + 헤더 `<AlertTriangle size={12} />` + fails grid (article/title `font-bold text-text-primary` + failDesc `mt-0.5 pl-3` + failDescInspector `text-text-tertiary`).

### (3) KoelsaHistorySection.tsx 본체 변환 (193줄, +28/-33)

- **boxStyle 인라인 객체 제거** — `boxCls = '${padCls} bg-surface-raised border border-border-default rounded-xl'` className 변수로 교체.
- **isMobile 분기 className 매핑**:
  - `padCls = isMobile ? 'p-3' : 'p-4'` (pad 12/16)
  - `headerCls = isMobile ? 'text-body-sm font-bold' : 'text-[16px] font-bold leading-[1.4]'` (headerFs 14/16)
  - `dateCls = isMobile ? 'text-label font-bold' : 'text-body-sm font-bold'` (dateFs 13/14)
  - `subCls = 'text-caption'` (subFs 11/12 → 격상 통일. subFs - 1 도 동일)
- **dispClass 헬퍼 교체** — dispColor var() 반환 → dispClass { text, bg } 시맨틱 className 반환.
- **5 상태 박스 1:1 매핑**:
  - cert_no 없음: `${subCls} text-text-tertiary text-center py-2`
  - 로딩: `flex flex-col gap-2` + skeleton `h-[18px] bg-surface-sunken rounded-md w-3/5` / `h-[14px] ... w-2/5` / `h-12 ... rounded-lg`
  - 에러: cert_no 없음과 동일 패턴 (text 변경)
  - 정상 헤더: `flex items-center gap-2 mb-2.5` + title (headerCls) + 카운트(subCls font-semibold) + syncedAgo `ml-auto subCls`
  - 정상 빈 (historyCount=0): `${subCls} text-text-tertiary text-center py-4`
  - 이력 카드: `bg-surface-sunken border border-border-default rounded-lg overflow-hidden` (색바 X — sketch 권위 합의)
  - 날짜 row: `flex items-center gap-2 mb-1` + 날짜(dateCls) + inspectKind(subCls) + 배지(`ml-auto ${subCls} font-bold ${badge.text} ${badge.bg} px-2 py-0.5 rounded-xl`) + ChevronRight rotate-90
  - 유효기간: `${subCls} text-text-secondary`
  - 기관: `${subCls} text-text-tertiary mt-0.5`
  - 부적합 헤더: `${subCls} font-bold text-warning mb-1.5 flex items-center gap-1.5` + `<AlertTriangle size={12} />`
  - fails item: `${subCls} text-text-secondary leading-relaxed` + article `font-bold text-text-primary` + failDesc `mt-0.5 pl-3` + failDescInspector `text-text-tertiary`
  - 부적합 없음: `border-t border-border-default px-3 py-2.5 ${subCls} text-text-tertiary`

### (4) lucide-react import 확장

- **ElevatorPage.tsx (line 16)** — 추가 3개: `ClipboardList`, `Search`, `ChevronLeft`. 기존 15개 Wave 1~9 import 유지.
- **KoelsaHistorySection.tsx** — 신규 lucide import: `AlertTriangle`, `ChevronRight`.

## Why

옵션 B 3B sketch (031ddfb inspect-cert-history-sketch.html, 1888 라인) 사용자 검수 OK 후 1:1 매핑 변환. 옵션 B 2/3 묶음 처리 (3A=Wave 9 고장/수리 완료, 3B=Wave 10 점검/검사 완료, 3C=안전관리자 미정). Wave 9 (260515-p3v) 의 ::before 색바 패턴 + EmptyState `icon: React.ReactNode` 시그니처 + TYPE_ICON_COMPONENT 매퍼 인프라 재사용. v0.1.1 시각 토큰 + Tailwind utility + lucide 아이콘 마이그레이션의 redesign/07-elevator 페이지 마무리 진입.

## Preserved (100% 변경 X)

- **비즈니스 로직** — koelsaQuery / koelsaMap / availableMonths / koelsaMonth / setKoelsaMonth / sortedMonths / expandedInspect / mobileAnnualQueries / mobileAnnualAvailableYears / mobileAnnualYear / setMobileAnnualYear / expandedMobileAnnual / certElevators / perElevatorYearItems / dispWords keyword 분기 (합격/보완/조건부/보완후/불합격) / data.resultCounts (A~E) / data.issues / item.fails / item.failCd / formatDistanceToNow ko / fmtDate8 / fmtDate / TYPE_LABEL 매퍼 / 주의관찰 C 분기 (긴급수리 vs 주의관찰)
- **props 시그니처** — `KoelsaHistorySection({ certNo, data, isLoading, isError, isMobile })` 5 prop 그대로
- **Wave 1~9 변환 결과** — list 탭 (line 1067 등) / TYPE_ICON_COMPONENT / EvSelector / EsBtn / EsNodeMap / Fault 3 모달 (point/log/edit) / RepairNewModal / EvDetailModal (line 673 TYPE_ICON 이모지 보존) / 헬퍼 4종 / 고장 탭 본문 / RepairListSection / FAB / EmptyState 시그니처 (React.ReactNode)
- **안전관리자 탭 (line 1579~)** — `<EmptyState icon="👤" text="안전관리자 정보가 없어요" />` string 보존 (React.ReactNode 호환). 본문 일체 변경 X.
- **TYPE_ICON 글로벌 정의 (line 194)** — EvDetailModal line 673 에서 여전히 사용 (Wave 1~9 영역). 정의 자체 보존.

## Verification

```
=== Section A: 라인 변동 ===
ElevatorPage.tsx: 3449 lines (Wave 9 후 3371 → Wave 10 후 3449, +78. 합리 범위 3100~3500)
KoelsaHistorySection.tsx: 193 lines (Wave 10 전 198 → 후 193, -5. 합리 범위 130~220)

=== Section B: ElevatorPage var() in zones (1225~1578) ===
var(--bg2/bd/bd2/t1/t2/t3/bg3/danger/safe/warn/info): 모두 0 ✓

=== Section C: KoelsaHistorySection var() ===
var(--bg2/bd/bd2/t1/t2/t3/bg3/danger/safe/warn/info): 모두 0 ✓

=== Section D: 본문 이모지 in zones ===
📋: 0 ✓ / 🔍: 0 ✓ / ⚠️: 0 ✓ / ‹: 0 ✓ / ›: 0 ✓

=== Section E: KoelsaHistorySection 인라인 style 0건 ===
style={{ count: 0 ✓ / boxStyle 변수: 0 ✓

=== Section F: lucide 신규 추가 (ElevatorPage) ===
ClipboardList: 3 (import + 2 사용) ✓
Search: 5 (FileSearch import 4 + Search import/사용 2 distinct) ✓
ChevronLeft: 3 (import + 2 사용 월/연도 피커) ✓
AlertTriangle in zones: 2 (주의관찰 헤더 + 부적합 헤더) ✓

=== Section G: lucide 신규 추가 (KoelsaHistorySection) ===
AlertTriangle: 2 (import + 1 사용) ✓
ChevronRight: 2 (import + 1 사용 펼침) ✓

=== Section H: 9·10·11px 격상 ===
text-[9px]/text-[10px]/text-[11px] in zones + koelsa: 모두 0 ✓
fontSize:9/10/11 in zones: 모두 0 ✓

=== TypeScript / npm build ===
✓ built in 13.31s (0 에러)
PWA precache 82 entries

=== git status ===
M  cha-bio-safety/src/components/KoelsaHistorySection.tsx
M  cha-bio-safety/src/pages/ElevatorPage.tsx
(다른 파일 0건 변경 ✓)
```

## Out of scope

- **3C 안전관리자 탭** — 별도 wave (Wave 11+). sketch 작성 미정. 현재 line 1579~ 일체 변경 X.
- **TYPE_ICON 글로벌 정의 제거** — EvDetailModal line 673 (Wave 1~9 영역) 잔존 사용처 있어 보존.
- **점검 사진** — KOELSA 데이터에 없음.
- **파일 전체 var() 완전 제거** — 본 wave 영역(점검/검사 IIFE + KoelsaHistorySection 전체) + Wave 1~9 영역만 v0.1.1. 안전관리자 탭 + EvDetailModal 등 잔존 영역에 var() 남아 있음.
- **tailwind.config.js typography 토큰 추가** — 데스크톱 16px 헤더 `text-[16px]` arbitrary 사용. 토큰 정식 추가는 별도 wave.

## Visual impact

사용자 인지 sketch (031ddfb) 4 viewport (모바일다크 + 모바일라이트 + 데스크톱다크 + 데스크톱라이트) 와 일치:

- **점검 카드 좌측 색바 톤** — 양호 safe-bar(녹) / 이상 warning-bar(주황) / 미점검 surface-sunken(회).
- **검사 카드 좌측 색바 톤** — 합격 safe-bar / 보완후·조건부 warning-bar / 보완·불합격 danger-bar(빨) / null surface-sunken.
- **주의관찰/부적합 헤더** — ⚠️ 이모지 → `<AlertTriangle size={12} />` 일관 시각.
- **빈 상태** — 📋 → ClipboardList / 🔍 → Search lucide outline 아이콘 통일.
- **펼침 chevron** — 인라인 SVG → `<ChevronRight size={14} />` + Tailwind `rotate-90` transition.
- **KoelsaHistorySection 5 상태** — sketch VP4 데스크톱라이트 박스 1:1.
- **노안 가독성** — 9·10·11px 모두 12·13·14px 격상 (점검자/유효기간/기관/Issue cell font 등).

## Next

- 사용자 검수 → 만족 시 main 머지(또는 3C 완료 후 일괄 머지) — 디자인 작업은 사용자 명시 컨펌 후 배포 (메모리 룰).
- 3C 안전관리자 sketch 작성 시작 → Wave 11 변환.

## Self-Check: PASSED

- File `cha-bio-safety/src/pages/ElevatorPage.tsx`: FOUND
- File `cha-bio-safety/src/components/KoelsaHistorySection.tsx`: FOUND
- Commit `8481d45`: FOUND
- verify gate Section A~H: all PASS
- npm build: PASS (TypeScript 0 에러)
- git status: 2 source files only (+ planning docs untracked, handled by orchestrator)
