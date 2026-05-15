---
phase: quick-260515-rfh
plan: 01
type: execute
wave: 1
depends_on: [260515-qpm, 260515-p3v]
files_modified:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
  - cha-bio-safety/src/components/KoelsaHistorySection.tsx
autonomous: true
requirements:
  - QUICK-260515-rfh
must_haves:
  truths:
    - "점검 기록 탭 변환 영역 (`tab === 'inspect'` IIFE 블록, line 1225~1325 ~102줄) 내 인라인 style 속성 0건 + var(--bg2/bd/bd2/t1/t2/t3/bg3/danger/safe/warn/info) 인라인 0건 + 9·10·11px 폰트 0건 + 본문 이모지 0건 (📋, ⚠️ 제거)"
    - "검사 기록 탭 변환 영역 (`tab === 'annual'` IIFE 블록, line 1328~1499 ~172줄) 내 인라인 style 속성 0건 + var() 인라인 0건 + 9·10·11px 0건 + 본문 이모지 0건 (🔍, 📋 제거)"
    - "KoelsaHistorySection.tsx 본체 (198줄) 내 인라인 style 속성 0건 + boxStyle 인라인 객체 제거 + isMobile 분기 pad/headerFs/dateFs/subFs 변수는 코드 그대로 보존하되 Tailwind className 으로 매핑 (모바일 = text-body-sm/p-3 / 데스크톱 = text-body/p-4 등 isMobile 삼항)"
    - "이모지/문자 → lucide 매핑: 📋→ClipboardList (점검/검사 빈상태 EmptyState icon prop), 🔍→Search (검사 빈상태), ⚠️→AlertTriangle (주의관찰 헤더 + KoelsaHistorySection 부적합 헤더), '‹·›'→ChevronLeft·ChevronRight (월 피커 + 연도 피커), 펼침 chevron 인라인 SVG→ChevronRight lucide + rotate-90 분기"
    - "lucide-react import 확장: ElevatorPage.tsx → ClipboardList + Search + ChevronLeft 추가 (Wave 1~9 기존: Package/UtensilsCrossed/MoveDiagonal/ChevronRight/ChevronUp/ChevronDown/AlertTriangle/Wrench/X/AlertOctagon/ClipboardCheck/FileSearch/CheckCircle2/Camera/Loader2). KoelsaHistorySection.tsx → AlertTriangle + ChevronRight 신규 import"
    - "EmptyState 호출처 4건 변환 (이번 wave 영역): line 1248(점검 빈)=`<ClipboardList size={36} />` / line 1404(검사 hasAny=false 빈)=`<Search size={36} />` / line 1407(검사 yearStr 빈)=`<ClipboardList size={36} />`. 별개 wave 영역인 line 1504(안전관리자 👤)는 본 wave 스코프 외 — 변경 X (Wave 11 또는 별도 wave)"
    - "점검 카드 좌측 색바 패턴 (Wave 9 3A 재사용): `before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-xl` + 양호=`before:bg-safe-bar border-border-default` / 이상=`before:bg-warning-bar border-warning-bar/40` / 미점검=`before:bg-surface-sunken border-border-default`"
    - "검사 카드 좌측 색바 (Wave 9 패턴 응용): 합격=`before:bg-safe-bar` / 보완후·조건부=`before:bg-warning-bar` / 보완·불합격=`before:bg-danger-bar` / null=`before:bg-surface-sunken` — dispColor 코드 분기 100% 보존하되 좌측 색바 className 매핑 추가"
    - "주의관찰 grid 결과 색 = 코드 분기 100% 보존: C=text-danger '긴급수리' / 그 외=text-warning '주의관찰' (현 코드 line 1299~1300 그대로 유지). grid 3-col gridTemplateColumns:'50px 1fr auto' 인라인 화이트리스트 보존 (dynamic value)"
    - "자체점검 결과 칩 A~E (line 1283~1288) 색 매핑: A=text-safe+bg-safe-bg / B=text-warning+bg-warning-bg / C=text-danger+bg-danger-bg / D·E=text-text-tertiary+bg-surface-sunken — 현 코드 `${c[r]}18` 인라인 alpha bg 를 Tailwind 시맨틱 bg-*-bg 토큰으로 치환"
    - "검사 dispWords 5종 배지 색 매핑 = KoelsaHistorySection.dispColor 100% 보존 + Tailwind 시맨틱 className 으로 표현: 합격=text-safe/bg-safe-bg / 보완후합격·조건부=text-warning/bg-warning-bg / 보완·불합격=text-danger/bg-danger-bg / 기본=text-text-tertiary/bg-surface-sunken (현 코드 `${badge}22` 인라인 alpha bg 치환)"
    - "9·10·11px 폰트 모두 12px 이상 격상: 11→text-body-sm(13)/text-label(13) / 10·10.5→text-caption(12) / 9→text-caption(12) — 점검자/점검업체/부적합 헤더/유효기간/기관/Issue cell font 등 보조 정보 노안 가독성"
    - "본문 이모지 0건: 📋/🔍/⚠️ 제거 (점검 빈/검사 빈/주의관찰 헤더/부적합 헤더 모두 lucide 치환). TYPE_ICON 이모지 매퍼는 본 wave 영역(점검/검사 카드 헤더 line 1268, 1424)에서 TYPE_ICON_COMPONENT 매퍼로 교체 — Wave 1 패턴"
    - "비즈니스 로직 100% 보존 (한 줄도 수정 X): koelsaQuery / koelsaMap / availableMonths / koelsaMonth / setKoelsaMonth / sortedMonths / expandedInspect / mobileAnnualQueries / mobileAnnualAvailableYears / mobileAnnualYear / setMobileAnnualYear / expandedMobileAnnual / certElevators / perElevatorYearItems / dispColor 분기 / dispWords / hasIssues / data.resultCounts / data.issues / item.fails / item.failCd / formatDistanceToNow ko / fmtDate8 / fmtDate / TYPE_LABEL 매퍼"
    - "props 시그니처 보존: KoelsaHistorySection({ certNo, data, isLoading, isError, isMobile }) — 외부 호출처 0건 영향 (grep 검증)"
    - "TypeScript 컴파일 0 에러 (`npm run build` PASS)"
    - "다른 컴포넌트/페이지 0건 수정 — git status 에 ElevatorPage.tsx + KoelsaHistorySection.tsx + PLAN + SUMMARY 만 표시"
    - "Wave 1~9 변환 결과 단 한 줄도 수정 X (list 탭 / TYPE_ICON_COMPONENT / EvSelector / EsBtn / EsNodeMap / Fault 3 모달 / RepairNewModal / EvDetailModal / 헬퍼 4종 / 고장 탭 본문 / 수리 탭 RepairListSection / FAB / EmptyState 시그니처)"
    - "안전관리자 탭 (`tab === 'safety'`) 본문 = 본 wave 영역 외, 단 한 줄도 변경 X (line 1500~). line 1504 의 `<EmptyState icon=\"👤\" ...>` string 그대로 보존 — React.ReactNode 호환"
  artifacts:
    - path: "cha-bio-safety/src/pages/ElevatorPage.tsx"
      provides: "옵션 B 3B 변환 — 점검 기록 탭 + 검사 기록 탭 v0.1.1 토큰 + Tailwind + lucide"
      contains: "tab === 'inspect' IIFE / tab === 'annual' IIFE"
    - path: "cha-bio-safety/src/components/KoelsaHistorySection.tsx"
      provides: "옵션 B 3B 변환 — KoelsaHistorySection 5 상태 v0.1.1 토큰 + Tailwind + lucide"
      contains: "function KoelsaHistorySection (정상 / cert_no 없음 / 로딩 / 에러 / 빈)"
  key_links:
    - from: "cha-bio-safety/src/pages/ElevatorPage.tsx"
      to: "cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
      via: "1:1 매핑 — 4 viewport (모바일다크/라이트 + 데스크톱다크/라이트) 색/스페이싱/아이콘 결정 source (commit 031ddfb, Wave 10 시안 권위)"
      pattern: "inspect-cert-history-sketch"
    - from: "cha-bio-safety/src/components/KoelsaHistorySection.tsx"
      to: "cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
      via: "VP4 데스크톱라이트 5 상태 박스 (정상 / cert_no 없음 / 로딩 스켈레톤 / 에러 / 빈 historyCount=0) 1:1 매핑"
      pattern: "koelsa-history-section"
---

<objective>
redesign/07-elevator 옵션 B 두 번째 변환 wave (Wave 10) — sketch (commit 031ddfb, inspect-cert-history-sketch.html) 권위로 ElevatorPage.tsx 의 점검 기록 탭 본문 + 검사 기록 탭 본문 + KoelsaHistorySection.tsx 본체 3 영역 v0.1.1 토큰 + Tailwind + lucide 변환. Wave 9 (260515-p3v) 1:1 mirror structure.

Purpose: 옵션 B 3B sketch 사용자 검수 OK. 1:1 매핑 변환. 옵션 B 2/3 묶음 처리. 다음 wave: 3C sketch (안전관리자) → 변환.

Output: ElevatorPage.tsx + KoelsaHistorySection.tsx 2개 파일 변경. 약 +250/-300 줄 추정. 다른 파일 0건. sketch 0건 변경 (이미 commit 031ddfb 완료).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260515-rfh-redesign-07-elevator-tsx-wave-10-b-3b-ko/

# 메모리 권위
# - project_redesign_07_elevator_status.md → Wave 10 = 옵션 B 3B 변환
# - feedback_redesign_sketch_rule_enforcement.md → sketch 권위 + 4중 verify gate
# - feedback_sketch_realistic_data.md → 비즈니스 로직 100% 보존, 시각만 손봄
# - project_design_tokens_branch.md → v0.1.1 시각 토큰
# - project_elevator_page_tabs.md → 점검/검사 = API 자동 (입력 모달 없음). 비즈니스 로직 보존만 신경

# 직전 변환 (참고만, 수정 X)
# - Wave 1~9 모두 보존 (list 탭 + 5 모달 + 헬퍼 4종 + 고장 탭 + RepairListSection + FAB)
# - Wave 9 (260515-p3v) commit 0af052c — EmptyState 시그니처 icon: React.ReactNode 확장 완료

# sketch 권위 (1:1 매핑 source)
# - 031ddfb inspect-cert-history-sketch.html (1888 라인)
# - 4 viewport: 모바일다크(점검 탭) + 모바일라이트(점검 빈+검사 시작) + 데스크톱다크(검사 풀화면) + 데스크톱라이트(KoelsaHistorySection 5 상태)
# - 점검 카드 3변형: 양호 접힘 / 이상 펼침 + A~E 카운트 칩 + 주의관찰 grid / 미점검 접힘
# - 검사 카드 2변형: 합격 접힘 / 보완후합격 펼침 + 이력 카드 + 부적합 fails grid
# - KoelsaHistorySection 5 상태 박스
# - dispWords 5종 카탈로그 (합격/보완후합격/조건부/보완/불합격)
# - 월/연도 피커 32×32 button 패턴
# - 색 매핑: 합격·양호=safe / 보완후·이상·주의관찰=warning / 보완·불합격·긴급=danger / 미점검·기타=text-tertiary

# 코드 source (Read 검증 완료, 2026-05-15)
# - 점검 기록 탭 본문 (line 1225~1325, ~102줄): IIFE 블록. 월 피커 + 그룹 헤더 + 카드 list + 펼침 + A~E 칩 + 주의관찰 grid
# - 검사 기록 탭 본문 (line 1328~1499, ~172줄): IIFE 블록. dispColor 헬퍼 + 연도 피커 + 빈상태 + 호기 카드 + 펼침 + 이력 + 부적합
# - 안전관리자 탭 (line 1500~): 본 wave 영역 외 — line 1504 의 `<EmptyState icon="👤" ...>` string 그대로 보존
# - KoelsaHistorySection.tsx (198줄): boxStyle 인라인 객체 + isMobile 분기 pad/headerFs/dateFs/subFs + 5 상태 분기
# - lucide-react import (line 16): Wave 9 까지 15개 — Loader2/Camera/CheckCircle2/Wrench/AlertTriangle/Package/UtensilsCrossed/MoveDiagonal/ChevronRight/ChevronUp/ChevronDown/X/AlertOctagon/ClipboardCheck/FileSearch
# - 추가할 lucide: ClipboardList, Search, ChevronLeft (3개 신규)
# - KoelsaHistorySection.tsx: lucide 신규 import — AlertTriangle (부적합 헤더) + ChevronRight (펼침 분기 시각화)
# - tailwind.config.js 토큰: text-text-primary/secondary/tertiary, bg-surface-page/raised/sunken, border-border-default/strong, bg-safe-bg/warning-bg/danger-bg/info-bg/fire-bg, safe/warning/danger/info/fire (foreground), safe-bar/warning-bar/danger-bar/info-bar/fire-bar (좌측 색바)
# - EmptyState 시그니처 (Wave 9 line 2580): icon: React.ReactNode — string 도 호환 (안전관리자 line 1504 보존 가능)

@cha-bio-safety/src/pages/ElevatorPage.tsx
@cha-bio-safety/src/components/KoelsaHistorySection.tsx
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html
@cha-bio-safety/tailwind.config.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: 3 영역 v0.1.1 토큰 + Tailwind + lucide 변환</name>
  <files>cha-bio-safety/src/pages/ElevatorPage.tsx, cha-bio-safety/src/components/KoelsaHistorySection.tsx</files>
  <action>
sketch (031ddfb) 권위 1:1 매핑. 3 영역 변환:

### 1. lucide-react import 확장

**ElevatorPage.tsx (line 16)** — 기존 (Wave 9 후):
```ts
import { Package, UtensilsCrossed, MoveDiagonal, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Wrench, X, AlertOctagon, ClipboardCheck, FileSearch, CheckCircle2, Camera, Loader2 } from 'lucide-react'
```

추가 3개: `ClipboardList`, `Search`, `ChevronLeft`:
```ts
import { Package, UtensilsCrossed, MoveDiagonal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Wrench, X, AlertOctagon, ClipboardCheck, FileSearch, CheckCircle2, Camera, Loader2, ClipboardList, Search } from 'lucide-react'
```

**KoelsaHistorySection.tsx (line 1~5)** — 기존:
```ts
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { InspectHistoryResponse } from '../utils/inspectHistory'
```

추가 lucide import:
```ts
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { InspectHistoryResponse } from '../utils/inspectHistory'
```

### 2. 점검 기록 탭 본문 변환 (line 1225~1325)

sketch VP1/VP2 의 점검 카드 3변형 (양호 접힘 / 이상 펼침 + 카운트 칩 + 주의관찰 grid / 미점검 접힘) + 월 피커 + 그룹 헤더 1:1 매핑.

**(a) 월 피커 (line 1236~1242)**
- wrapper: `flex items-center gap-2 mb-1` (현 인라인 `gap:8 marginBottom:4`)
- prev/next 버튼: `w-8 h-8 rounded-lg bg-surface-raised border border-border-default flex items-center justify-center text-text-secondary disabled:opacity-40 disabled:cursor-default` (cursor: 'pointer' 가능 분기)
- '‹' / '›' 문자 → `<ChevronLeft size={16} />` / `<ChevronRight size={16} />`
- 가운데 라벨: `flex-1 text-center text-body font-bold text-text-primary` (현 14px → text-body, var(--t1) → text-text-primary)

**(b) 로딩/에러/빈 메시지 (line 1244~1249)**
- 로딩: `text-center py-6 text-caption text-text-tertiary` (현 24px padding → py-6 = 24px)
- 에러: `text-center py-6 text-caption text-danger`
- 빈상태: `<EmptyState icon={<ClipboardList size={36} />} text="해당 월 점검 기록이 없어요" />` (📋 제거, lucide 치환)

**(c) 그룹 헤더 (line 1256~1259)**
- wrapper: `text-caption font-bold text-text-tertiary tracking-wider uppercase mb-1.5 mt-1`
  - 9px → text-caption (12px) 격상
  - var(--t3) → text-text-tertiary
  - 인라인 letterSpacing:'.06em' → tracking-wider
  - TYPE_ICON[type] (이모지) 제거 — TYPE_LABEL[type] (group.length)대 텍스트만 (그룹 헤더는 sketch 디자인에 이모지 없음 확인)

**(d) 카드 wrapper + 헤더 (line 1266~1275)**
좌측 색바 패턴 (Wave 9 3A 재사용 ::before pseudo):
- wrapper: `relative bg-surface-raised border border-border-default rounded-xl overflow-hidden mb-1.5 shrink-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-xl`
- 배지 분기에 따라 className 확장 (className 배열 join):
  - 양호=`before:bg-safe-bar` (data 있고 hasIssues=false)
  - 이상=`before:bg-warning-bar border-warning-bar/40` (data 있고 hasIssues=true)
  - 미점검=`before:bg-surface-sunken` (!data)
- 클릭 영역: `pl-3.5 pr-3 py-2.5 flex items-center gap-2.5 cursor-pointer data-[disabled=true]:cursor-default` (data 있을 때만 onClick — 미점검은 disabled 효과)
  - 좌측 padding pl-3.5 (14px) = ::before 색바(3px) + gap
- TYPE_ICON 이모지 → TYPE_ICON_COMPONENT 매퍼 (Wave 1 패턴):
  - 기존 line 1268: `{TYPE_ICON[type]}` (22px 이모지)
  - → `{(() => { const Icon = TYPE_ICON_COMPONENT[type]; return <Icon size={22} className="text-text-secondary" /> })()}`
  - wrapper: `w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center flex-shrink-0`
- 호기 라벨 (line 1270): `text-label font-bold text-text-primary` (12px → label 13px)
- 호기 location 부가 텍스트: `text-caption font-normal text-text-tertiary ml-1` (10px → caption 12px)
- 점검일/데이터 없음 (line 1271): `text-caption text-text-tertiary mt-0.5` (10px → caption)
- 배지 (line 1273) — Tailwind 시맨틱 매핑 (인라인 `${c[r]}18` 또는 `var(--*)/rgba(*.12)` 제거):
  - 양호: `text-caption font-bold text-safe bg-safe-bg px-2 py-0.5 rounded-full flex-shrink-0`
  - 이상: `text-caption font-bold text-warning bg-warning-bg px-2 py-0.5 rounded-full flex-shrink-0`
  - 미점검: `text-caption font-bold text-text-tertiary bg-surface-sunken px-2 py-0.5 rounded-full flex-shrink-0`
- 펼침 chevron (line 1274 inline SVG `width={14} ... strokeWidth={2}`) → lucide:
  - `{data && <ChevronRight size={14} className={['flex-shrink-0 text-text-tertiary transition-transform duration-150', isExp ? 'rotate-90' : ''].join(' ')} />}`

**(e) 펼친 영역 (line 1277~1314)**
- wrapper: `border-t border-border-default px-3.5 pt-3 pb-3` (현 12/14 padding → 3.5)
- 점검업체/점검자 grid (line 1278~1281):
  - 인라인 grid → Tailwind `grid grid-cols-2 gap-y-1 gap-x-3 mb-2`
  - 라벨 ('점검업체 '): `text-caption text-text-tertiary` (var(--t3) → text-tertiary, 11 → caption — sketch 결정 확인)
  - 값 (companyName/inspectorName): `text-caption text-text-primary font-semibold`
- A~E 카운트 칩 (line 1282~1289):
  - row wrapper: `flex gap-1.5 flex-wrap mb-2.5 data-[has-issues=false]:mb-0` (인라인 marginBottom: hasIssues ? 10 : 0 → 조건부 className)
  - 칩 매핑 — `${c[r]}18` 알파 인라인 bg 제거, Tailwind 시맨틱 토큰:
    - A: `text-caption font-bold text-safe bg-safe-bg px-2 py-0.5 rounded-md`
    - B: `text-caption font-bold text-warning bg-warning-bg px-2 py-0.5 rounded-md`
    - C: `text-caption font-bold text-danger bg-danger-bg px-2 py-0.5 rounded-md`
    - D/E: `text-caption font-bold text-text-tertiary bg-surface-sunken px-2 py-0.5 rounded-md`
  - className lookup 객체 (인라인 c[r] 객체 대신):
    ```ts
    const chipClass: Record<string,string> = {
      A: 'text-caption font-bold text-safe bg-safe-bg px-2 py-0.5 rounded-md',
      B: 'text-caption font-bold text-warning bg-warning-bg px-2 py-0.5 rounded-md',
      C: 'text-caption font-bold text-danger bg-danger-bg px-2 py-0.5 rounded-md',
      D: 'text-caption font-bold text-text-tertiary bg-surface-sunken px-2 py-0.5 rounded-md',
      E: 'text-caption font-bold text-text-tertiary bg-surface-sunken px-2 py-0.5 rounded-md',
    }
    ```
  - label 매퍼 `l[r]` ('양호'/'주의'/'긴급'/'제외'/'없음') 그대로 보존
- 주의관찰 영역 (line 1290~1314, hasIssues=true 일 때):
  - wrapper: `border border-border-default rounded-lg overflow-hidden`
  - 헤더 (line 1292~1294):
    - `bg-surface-raised border-b border-border-default px-2.5 py-1.5 text-caption font-bold text-warning flex items-center gap-1.5`
    - ⚠️ 이모지 → `<AlertTriangle size={12} />` + 텍스트 "주의관찰 항목"
    - 10.5px → text-caption(12px)
  - grid wrapper (line 1295):
    - `bg-surface-sunken grid` + 인라인 화이트리스트 보존 (dynamic): `style={{ gridTemplateColumns: '50px 1fr auto' }}` (gridTemplateColumns 는 dynamic value 화이트리스트 — Tailwind arbitrary value 도 가능 `grid-cols-[50px_1fr_auto]` 권장)
  - cell 매핑 (line 1296~1311):
    - 공통 cellSt → `px-2 py-1.5 text-caption border-b border-border-default last:border-b-0` (Tailwind 클래스 직접 적용 — cellSt 변수 제거)
    - titNo cell: `font-semibold font-mono tabular-nums text-text-tertiary px-2 py-1 text-caption` (10 → caption 격상 + JetBrains Mono 보존)
    - itemName cell: `text-text-primary px-2 py-1.5 text-caption`
    - itemDetail span: `text-text-tertiary ml-1 text-caption` (10 → caption)
    - result cell: `text-caption font-bold px-2 py-1.5` + 분기 className (`issue.result === 'C' ? 'text-danger' : 'text-warning'`)
    - resultLabel 텍스트 매퍼 ('긴급수리'/'주의관찰') 그대로 보존
  - 마지막 row border 제거: `last:border-b-0` Tailwind (현 인라인 `isLast ? 'none' : '1px solid var(--bd)'`)
  - **주의:** `display:'contents'` wrapper 는 grid 의 row 묶음 시각 wrapper — 그대로 `<div className="contents">` 또는 React Fragment 로 보존 (idx key)

### 3. 검사 기록 탭 본문 변환 (line 1328~1499)

sketch VP2/VP3 의 검사 카드 2변형 (합격 접힘 / 보완후합격 펼침 with 이력 카드 + fails grid) + 연도 피커 + 5 상태 매핑.

**(a) dispColor 헬퍼 (line 1330~1342)** — 코드 그대로 보존. 반환값을 className 으로 매핑하는 helper 추가:
```ts
const dispClass = (disp: string | null | undefined): { text: string; bg: string; bar: string } => {
  if (!disp) return { text: 'text-text-tertiary', bg: 'bg-surface-sunken', bar: 'before:bg-surface-sunken' }
  const s = disp
  const hasBo = s.includes('보완')
  const hasFail = s.includes('불합격')
  const hasCond = s.includes('조건부')
  const hasBoAfterPass = s.includes('보완후합격')
  const hasPass = s.includes('합격')
  if (hasBoAfterPass || hasCond) return { text: 'text-warning', bg: 'bg-warning-bg', bar: 'before:bg-warning-bar' }
  if (hasBo || hasFail) return { text: 'text-danger', bg: 'bg-danger-bg', bar: 'before:bg-danger-bar' }
  if (hasPass) return { text: 'text-safe', bg: 'bg-safe-bg', bar: 'before:bg-safe-bar' }
  return { text: 'text-text-tertiary', bg: 'bg-surface-sunken', bar: 'before:bg-surface-sunken' }
}
```
기존 dispColor 함수는 var() 반환 — Wave 10 영역에서만 사용되었다면 제거. **확인 필요**: KoelsaHistorySection.tsx 의 dispColor 와 별개 — ElevatorPage 본문의 dispColor 만 dispClass 로 교체. KoelsaHistorySection 의 dispColor 는 자체 변환 (#4 참조).

**(b) cert_no 없음 분기 (line 1345~1351)**:
- 인라인 div → `<div className="text-center py-10 text-caption text-text-tertiary">공단 고유번호가 등록된 호기가 없습니다</div>`

**(c) 연도 피커 (line 1381~1395)** — 월 피커와 동일 패턴:
- wrapper: `flex items-center gap-2 mb-1`
- prev/next: `w-8 h-8 rounded-lg bg-surface-raised border border-border-default flex items-center justify-center text-text-secondary disabled:opacity-40 disabled:cursor-default` + `<ChevronLeft size={16} />` / `<ChevronRight size={16} />` (‹/› 문자 제거)
- 가운데: `flex-1 text-center text-body font-bold text-text-primary`

**(d) 5 상태 메시지 (line 1397~1408)**:
- 로딩: `text-center py-6 text-caption text-text-tertiary`
- 에러 visible.length === 0: `text-center py-6 text-caption text-danger`
- !hasAny 빈: `<EmptyState icon={<Search size={36} />} text="등록된 검사 이력이 없어요" />` (🔍 → Search)
- yearStr 빈: `<EmptyState icon={<ClipboardList size={36} />} text="해당 연도에 검사 이력이 없어요" />` (📋 → ClipboardList)

**(e) 검사 카드 wrapper + 헤더 (line 1418~1441)**:
- wrapper: `relative bg-surface-raised border border-border-default rounded-xl overflow-hidden shrink-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-xl ${dispClass(latest?.dispWords).bar}`
- 헤더 클릭 영역: `pl-3.5 pr-3 py-2.5 flex items-center gap-2.5 cursor-pointer`
- TYPE_ICON 이모지 → TYPE_ICON_COMPONENT 매퍼 (Wave 1 패턴): 동일 패턴 점검 탭과 일치
- 호기 라벨 row (line 1426~1434):
  - 호기명: `text-label font-bold text-text-primary` (12 → label)
  - 공단호기 / classification 부가: `text-caption font-normal text-text-tertiary ml-1.5` (10 → caption)
- 건수/최근 일자: `text-caption text-text-tertiary mt-0.5` (10 → caption)
- 배지: `text-caption font-bold ${dispClass(latest?.dispWords).text} ${dispClass(latest?.dispWords).bg} px-2 py-0.5 rounded-full flex-shrink-0` (10 → caption, `${badge}22` 알파 인라인 제거)
- 펼침 chevron (line 1440 inline SVG) → lucide ChevronRight 14 + rotate-90 분기 (점검 탭과 동일 패턴)

**(f) 펼친 영역 (line 1443~1493)**:
- wrapper: `border-t border-border-default px-3 py-2.5 flex flex-col gap-2`
- 이력 카드 (line 1449):
  - wrapper: `bg-surface-sunken border border-border-default rounded-lg px-3 py-2.5`
- 헤더 row (line 1450~1456):
  - flex row: `flex items-center gap-2 mb-1`
  - 날짜: `text-label font-bold text-text-primary` (13 → label)
  - inspectKind: `text-caption text-text-tertiary` (10 → caption)
  - 배지: `ml-auto text-caption font-bold ${dispClass(item.dispWords).text} ${dispClass(item.dispWords).bg} px-2 py-0.5 rounded-xl` (10 → caption, alpha 인라인 제거)
- 유효기간 (line 1457~1461): `text-caption text-text-secondary` (11 → caption, sketch 권위 확인)
- 기관/회사명 (line 1462~1464): `text-caption text-text-tertiary mt-0.5` (10 → caption)
- 부적합 영역 (line 1465~1488):
  - wrapper: `border-t border-border-default mt-2 pt-2`
  - 헤더: `text-caption font-bold text-warning mb-1.5 flex items-center gap-1.5` + `<AlertTriangle size={12} />` + "부적합 N건" (11 → caption)
  - fails list wrapper: `flex flex-col gap-2`
  - 각 fail item: `text-caption text-text-secondary leading-relaxed` (11 → caption)
  - standardArticle+Title 헤더: `font-bold text-text-primary` ("▸ " 텍스트 prefix 보존)
  - failDesc: `mt-0.5 pl-3` (Tailwind paddingLeft:12 → pl-3)
  - failDescInspector inline: `text-text-tertiary` (괄호 ' (...)' 텍스트 보존)

### 4. KoelsaHistorySection.tsx 본체 변환 (198줄)

sketch VP4 데스크톱라이트 의 5 상태 박스 1:1 매핑. isMobile 분기 보존 (코드 데이터 권위 — props 시그니처 100% 보존):

**(a) isMobile 분기 변수 보존 + className 매핑**:
boxStyle 인라인 객체 제거. isMobile 삼항을 className 으로:
```ts
const padCls = isMobile ? 'p-3' : 'p-4'  // 12px / 16px
const headerCls = isMobile ? 'text-body' : 'text-h2-sm'  // 14 / 16
const dateCls = isMobile ? 'text-label' : 'text-body-sm'  // 13 / 14
const subCls = isMobile ? 'text-caption' : 'text-label'  // 11→caption(12) / 12
const subSmCls = subCls  // subFs - 1 → 한 단계 더 작게: 이미 caption(12) 이라 더 못 내림. **격상 정책** = subSmCls 도 text-caption 유지 (10→caption 격상)
```

**중요**: `subFs - 1` 패턴 (현 line 105, 138, 143, 158) 은 11-1=10 또는 12-1=11 — 모두 9·10·11 격상 룰 위반. subSmCls = text-caption(12) 으로 통일.

검토:
- text-h2-sm 토큰 존재 여부 확인. tailwind.config.js typography 섹션 (별도 grep). 없다면 `text-[16px] font-bold` arbitrary value 또는 `text-base font-bold`.
- 사용 가능한 typography 토큰 grep 후 매핑:
  ```bash
  grep -n "fontSize\|text-h1\|text-h2\|text-body\|text-label\|text-caption" tailwind.config.js
  ```
- 만약 text-h2-sm 미정의: headerCls = `isMobile ? 'text-body font-bold' : 'text-[16px] font-bold'` (16px arbitrary)

**(b) cert_no 없음 분기 (line 45~53)**:
```tsx
if (!certNo) {
  return (
    <div className={`${padCls} bg-surface-raised border border-border-default rounded-xl`}>
      <div className={`${subCls} text-text-tertiary text-center py-2`}>
        공단 고유번호 없음 — 관리자 등록 필요
      </div>
    </div>
  )
}
```

**(c) 로딩 스켈레톤 (line 56~66)**:
```tsx
if (isLoading && !data) {
  return (
    <div className={`${padCls} bg-surface-raised border border-border-default rounded-xl`}>
      <div className="flex flex-col gap-2">
        <div className="h-[18px] bg-surface-sunken rounded-md w-3/5" />
        <div className="h-[14px] bg-surface-sunken rounded-md w-2/5" />
        <div className="h-12 bg-surface-sunken rounded-lg" />
      </div>
    </div>
  )
}
```
- var(--bg3) → bg-surface-sunken
- 18px/14px height: h-[18px]/h-[14px] arbitrary
- 60%/40%: w-3/5 / w-2/5
- 48px: h-12 = 48px

**(d) 에러 분기 (line 69~77)**:
```tsx
if (isError) {
  return (
    <div className={`${padCls} bg-surface-raised border border-border-default rounded-xl`}>
      <div className={`${subCls} text-text-tertiary text-center py-2`}>
        공단 API 일시 오류 — 잠시 후 다시 시도해주세요
      </div>
    </div>
  )
}
```

**(e) 정상 렌더 (line 94~196)**:
- wrapper: `<div className={\`${padCls} bg-surface-raised border border-border-default rounded-xl\`}>`
- 헤더 (line 97~109):
  - row: `flex items-center gap-2 mb-2.5`
  - title: `${headerCls} font-bold text-text-primary` ("공단 공식 검사이력")
  - count: `${subCls} font-semibold text-text-tertiary` ("· 총 N건")
  - syncedAgo: `ml-auto ${subCls} text-text-tertiary` (subFs - 1 → 격상 subCls = text-caption)
- 빈 historyCount=0 (line 112~115):
  - `<div className={\`${subCls} text-text-tertiary text-center py-4\`}>공단에 등록된 검사이력이 없습니다</div>` (16px padding → py-4)
- 이력 list wrapper (line 117): `flex flex-col gap-2`
- 이력 카드 (line 122~129):
  - wrapper: `bg-surface-sunken border border-border-default rounded-lg overflow-hidden`
  - 색바 추가 (sketch 권위 — Wave 10 정책 합의): **이력 카드 자체에는 색바 없음** (현 코드도 색바 없음, sketch 도 카드 wrapper 가 sunken — 헤더 row 의 dispWords 배지로만 표현). 색바 추가 X, 기존 wrapper 디자인 유지.
- 헤더 클릭 row (line 130~152):
  - `px-3 py-2.5 cursor-pointer`
  - flex row mb-1: `flex items-center gap-2 mb-1`
  - 날짜: `${dateCls} font-bold text-text-primary`
  - inspectKind: `${subCls} text-text-tertiary` ("· N")
  - 배지: dispColor 결과로 className 매핑 — KoelsaHistorySection 내 자체 dispColor 함수의 var() 반환을 `{ text, bg }` className 객체 반환으로 변경:
    ```ts
    function dispClass(disp: string | null): { text: string; bg: string } {
      if (!disp) return { text: 'text-text-tertiary', bg: 'bg-surface-sunken' }
      const s = disp
      const hasBo = s.includes('보완'); const hasFail = s.includes('불합격')
      const hasCond = s.includes('조건부'); const hasBoAfterPass = s.includes('보완후합격')
      const hasPass = s.includes('합격')
      if (hasBoAfterPass || hasCond) return { text: 'text-warning', bg: 'bg-warning-bg' }
      if (hasBo || hasFail) return { text: 'text-danger', bg: 'bg-danger-bg' }
      if (hasPass) return { text: 'text-safe', bg: 'bg-safe-bg' }
      return { text: 'text-text-tertiary', bg: 'bg-surface-sunken' }
    }
    ```
  - 기존 dispColor 함수는 제거 (라인 16~28) — dispClass 로 교체
  - 배지 className: `ml-auto ${subCls} font-bold ${dispClass(item.dispWords).text} ${dispClass(item.dispWords).bg} px-2 py-0.5 rounded-xl`
- 유효기간 (line 153~157): `${subCls} text-text-secondary`
- 기관/회사명 (line 158~160): `${subCls} text-text-tertiary mt-0.5`
- 펼친 부적합 (line 162~185):
  - wrapper: `border-t border-border-default px-3 py-2.5`
  - 헤더: `${subCls} font-bold text-warning mb-1.5 flex items-center gap-1.5` + `<AlertTriangle size={12} />` + "부적합 N건"
  - fails wrapper: `flex flex-col gap-2`
  - fail item: `${subCls} text-text-secondary leading-relaxed`
  - article/title 헤더: `font-bold text-text-primary` ("▸ ..." prefix 보존)
  - failDesc: `mt-0.5 pl-3`
  - failDescInspector: `text-text-tertiary` (" (...)" 텍스트 보존)
- 펼친 빈 부적합 (line 186~190):
  - `<div className="border-t border-border-default px-3 py-2.5 text-text-tertiary text-caption">부적합 내역 없음</div>` (subFs → subCls 또는 text-caption 직접 — subCls 사용)

### 5. 보존 항목 (절대 건드리지 말 것)

- Wave 1~9 변환 결과 (list 탭, 5 모달, 헬퍼 4종, 고장 탭, RepairListSection, FAB)
- 비즈니스 로직 (state, query, mutation, handler, fetch, navigation, modal toggle, koelsa data, mobileAnnual, dispWords keyword 분기, formatDistanceToNow)
- props 시그니처 (KoelsaHistorySection 5개 prop)
- 안전관리자 탭 (`tab === 'safety'` line 1500~) — 본 wave 영역 외, 단 한 줄 변경 X. 특히 line 1504 의 `<EmptyState icon="👤" text="안전관리자 정보가 없어요" />` string prop 그대로 보존 (Wave 9 시그니처 React.ReactNode 호환 — string 도 ReactNode)
- TYPE_ICON 글로벌 객체 정의 — 다른 곳 사용처(line 1268, 1424 외) 0건 되면 제거 가능. **확인**:
  ```bash
  grep -n "TYPE_ICON\b" src/pages/ElevatorPage.tsx
  ```
  사용처 모두 본 wave 영역 (line 1268, 1424) + Wave 9 이미 제거된 영역이라면 정의 자체 제거. 그러나 다른 wave 영역에 잔존하면 보존.
- TYPE_LABEL 글로벌 객체 — 그룹 헤더 line 1258 에서 사용. 보존 (텍스트 매퍼)
- icons.tsx / tailwind.config.js
- 다른 페이지/파일

### 6. 작업 순서 (안전)

1. lucide-react import 확장 (ElevatorPage 3개 + KoelsaHistorySection 2개)
2. KoelsaHistorySection.tsx 본체 변환 — 독립 컴포넌트, 의존성 0건 (가장 안전)
   - 2.1: dispColor → dispClass 함수 교체
   - 2.2: boxStyle 인라인 객체 제거 + padCls/headerCls/dateCls/subCls 변수 정의
   - 2.3: 5 상태 분기 본체 Tailwind 변환
3. ElevatorPage.tsx — 점검 탭 본문 변환 (line 1225~1325)
   - 3.1: 월 피커
   - 3.2: 로딩/에러/빈 메시지 (📋 → ClipboardList)
   - 3.3: 그룹 헤더 (TYPE_ICON 이모지 제거)
   - 3.4: 카드 wrapper + 좌측 색바 + 헤더 (TYPE_ICON_COMPONENT 매퍼)
   - 3.5: 펼친 영역 + A~E 칩 + 주의관찰 grid (⚠️ → AlertTriangle, cellSt 변수 제거)
4. ElevatorPage.tsx — 검사 탭 본문 변환 (line 1328~1499)
   - 4.1: dispColor → dispClass 헬퍼 교체
   - 4.2: cert_no 없음 분기
   - 4.3: 연도 피커 (‹/› → ChevronLeft/Right)
   - 4.4: 5 상태 메시지 (🔍 → Search / 📋 → ClipboardList)
   - 4.5: 카드 wrapper + 좌측 색바 + 헤더 (TYPE_ICON_COMPONENT, dispClass.bar)
   - 4.6: 펼친 영역 + 이력 카드 + 부적합 fails grid (⚠️ → AlertTriangle)
5. TYPE_ICON 사용처 0건 되면 정의 자체 제거 (Wave 1 패턴)
6. `npm run build` PASS 확인 (TS 0 에러)
7. grep gate 통과 확인 (verify 블록)
8. commit
  </action>
  <verify>
    <automated>
cd cha-bio-safety && \
  echo "=== Section A: 라인 변동 (Wave 10 변환 후 합리적 범위) ===" && \
  echo "ElevatorPage.tsx lines: $(wc -l < src/pages/ElevatorPage.tsx) (Wave 9 기준 3371. expect 3100~3500 — 인라인 제거로 감소 가능)" && \
  echo "KoelsaHistorySection.tsx lines: $(wc -l < src/components/KoelsaHistorySection.tsx) (Wave 10 전 198. expect 130~220 — Tailwind 변환으로 감소)" && \
  echo "" && \
  echo "=== Section B: ElevatorPage 변환 영역 인라인 var() 0건 (점검+검사 IIFE 블록 기준 sed 스코프 — line 1225~1499) ===" && \
  sed -n '1225,1499p' src/pages/ElevatorPage.tsx > /tmp/wave10-elevator-zones.txt && \
  echo "var(--bg2) in zones: $(grep -c 'var(--bg2)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--bd) in zones: $(grep -c 'var(--bd)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--bd2) in zones: $(grep -c 'var(--bd2)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--t1) in zones: $(grep -c 'var(--t1)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--t2) in zones: $(grep -c 'var(--t2)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--t3) in zones: $(grep -c 'var(--t3)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--bg3) in zones: $(grep -c 'var(--bg3)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--danger) in zones: $(grep -c 'var(--danger)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--safe) in zones: $(grep -c 'var(--safe)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--warn) in zones: $(grep -c 'var(--warn)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "var(--info) in zones: $(grep -c 'var(--info)' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "" && \
  echo "=== Section C: KoelsaHistorySection 전체 인라인 var() 0건 ===" && \
  echo "var(--bg2): $(grep -c 'var(--bg2)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--bd): $(grep -c 'var(--bd)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--bg3): $(grep -c 'var(--bg3)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--t1): $(grep -c 'var(--t1)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--t2): $(grep -c 'var(--t2)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--t3): $(grep -c 'var(--t3)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--warn): $(grep -c 'var(--warn)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--danger): $(grep -c 'var(--danger)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "var(--safe): $(grep -c 'var(--safe)' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "" && \
  echo "=== Section D: 변환 영역 본문 이모지 0건 ===" && \
  echo "📋 in elevator zones: $(grep -c '📋' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "🔍 in elevator zones: $(grep -c '🔍' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "⚠️ in elevator zones: $(grep -c '⚠️' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "‹ in elevator zones: $(grep -c '‹' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "› in elevator zones: $(grep -c '›' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "" && \
  echo "=== Section E: KoelsaHistorySection 인라인 style 속성 0건 ===" && \
  echo "style={{ count: $(grep -c 'style={{' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "boxStyle: $(grep -c 'boxStyle' src/components/KoelsaHistorySection.tsx) (expect 0 — 변수 + 사용처 모두 제거)" && \
  echo "" && \
  echo "=== Section F: lucide 신규 추가 (ElevatorPage) ===" && \
  echo "ClipboardList: $(grep -c 'ClipboardList' src/pages/ElevatorPage.tsx) (expect >= 3 — import + 2 사용)" && \
  echo "Search: $(grep -c 'Search' src/pages/ElevatorPage.tsx) (expect >= 2 — import + 1 사용)" && \
  echo "ChevronLeft: $(grep -c 'ChevronLeft' src/pages/ElevatorPage.tsx) (expect >= 3 — import + 2 사용 월/연도 피커)" && \
  echo "AlertTriangle in zones: $(grep -c 'AlertTriangle' /tmp/wave10-elevator-zones.txt) (expect >= 2 — 주의관찰 + 부적합 헤더)" && \
  echo "" && \
  echo "=== Section G: lucide 신규 추가 (KoelsaHistorySection) ===" && \
  echo "AlertTriangle: $(grep -c 'AlertTriangle' src/components/KoelsaHistorySection.tsx) (expect >= 2 — import + 1 사용)" && \
  echo "" && \
  echo "=== Section H: 9·10·11px 격상 (text-[Xpx] arbitrary 잔존) ===" && \
  echo "text-[9px] in zones: $(grep -c 'text-\\[9px\\]' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "text-[10px] in zones: $(grep -c 'text-\\[10px\\]' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "text-[11px] in zones: $(grep -c 'text-\\[11px\\]' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "text-[9px] in koelsa: $(grep -c 'text-\\[9px\\]' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "text-[10px] in koelsa: $(grep -c 'text-\\[10px\\]' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "text-[11px] in koelsa: $(grep -c 'text-\\[11px\\]' src/components/KoelsaHistorySection.tsx) (expect 0)" && \
  echo "fontSize:9 in zones: $(grep -cE 'fontSize: ?9[^0-9]' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "fontSize:10 in zones: $(grep -cE 'fontSize: ?10[^0-9]' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "fontSize:11 in zones: $(grep -cE 'fontSize: ?11[^0-9]' /tmp/wave10-elevator-zones.txt) (expect 0)" && \
  echo "" && \
  echo "=== Hard gate ===" && \
  test $(grep -cE 'var\\(--(bg2|bd|bd2|t1|t2|t3|bg3|danger|safe|warn|info)\\)' /tmp/wave10-elevator-zones.txt) -eq 0 && \
  test $(grep -cE 'var\\(--(bg2|bd|bd2|t1|t2|t3|bg3|danger|safe|warn|info)\\)' src/components/KoelsaHistorySection.tsx) -eq 0 && \
  test $(grep -c 'style={{' src/components/KoelsaHistorySection.tsx) -eq 0 && \
  test $(grep -c '📋' /tmp/wave10-elevator-zones.txt) -eq 0 && \
  test $(grep -c '🔍' /tmp/wave10-elevator-zones.txt) -eq 0 && \
  test $(grep -c '⚠️' /tmp/wave10-elevator-zones.txt) -eq 0 && \
  test $(grep -c '‹' /tmp/wave10-elevator-zones.txt) -eq 0 && \
  test $(grep -c '›' /tmp/wave10-elevator-zones.txt) -eq 0 && \
  echo "" && \
  echo "=== git status — only 2 source files + planning docs ===" && \
  git status --short && \
  echo "" && \
  echo "=== TypeScript / npm build ===" && \
  npm run build 2>&1 | tail -10 && \
  echo "=== build PASS ==="
    </automated>
  </verify>
  <done>
- grep gate Section A~H 모두 PASS (라인 변동 합리 / var() in zones 0 / 이모지 in zones 0 / KoelsaHistorySection 인라인 style 0 / boxStyle 제거 / ClipboardList·Search·ChevronLeft import 보장 / AlertTriangle 사용 보장 / 9·10·11px in zones 0)
- 점검 기록 탭 본문 + 검사 기록 탭 본문 + KoelsaHistorySection 본체 sketch (031ddfb) 1:1 매핑 변환
- 점검 카드 좌측 색바: 양호 safe-bar / 이상 warning-bar / 미점검 surface-sunken
- 검사 카드 좌측 색바: 합격 safe-bar / 보완후·조건부 warning-bar / 보완·불합격 danger-bar / null surface-sunken (dispClass 매퍼)
- 주의관찰 grid 결과 색 분기 100% 보존 (C=danger / 그 외=warning)
- A~E 카운트 칩 시맨틱 토큰 매핑 (A safe / B warning / C danger / D·E text-tertiary)
- 이모지 → lucide 치환: 📋→ClipboardList, 🔍→Search, ⚠️→AlertTriangle, ‹/›→ChevronLeft/Right, 펼침→ChevronRight + rotate-90
- npm run build PASS (TypeScript 0 에러)
- 다른 파일 0건 변경 (`git status` 에 ElevatorPage.tsx + KoelsaHistorySection.tsx + PLAN.md + SUMMARY.md 만)
- Wave 1~9 변환 결과 단 한 줄도 시각 결정 변경 X
- 안전관리자 탭 (line 1500~) 0건 수정 — line 1504 `<EmptyState icon="👤" ...>` string 보존
  </done>
</task>

<task type="auto">
  <name>Task 2: SUMMARY 작성 + commit</name>
  <files>.planning/quick/260515-rfh-redesign-07-elevator-tsx-wave-10-b-3b-ko/260515-rfh-SUMMARY.md</files>
  <action>
SUMMARY 작성 후 single commit. SUMMARY 는 orchestrator 가 별도 docs commit 처리할 수 있도록 untracked 유지 가능 (executor 가 commit 안 함).

### SUMMARY 필수 섹션

- **What changed**: ElevatorPage.tsx + KoelsaHistorySection.tsx 3 영역 sketch 1:1 변환.
  - (1) 점검 기록 탭 본문 (line 1225~1325): 월 피커 ChevronLeft/Right / 그룹 헤더 (TYPE_ICON 이모지 제거) / 카드 wrapper 좌측 색바 ::before (safe-bar/warning-bar/surface-sunken) / TYPE_ICON_COMPONENT 매퍼 / 호기·점검일 / 배지(양호 safe / 이상 warning / 미점검 t3) / 펼침 chevron lucide rotate-90 / 점검업체·점검자 grid / A~E 카운트 칩(safe/warning/danger/t3) / 주의관찰 grid 3-col (⚠️→AlertTriangle + cellSt 변수 제거 + C=danger '긴급수리' / 그 외=warning '주의관찰' 분기 보존)
  - (2) 검사 기록 탭 본문 (line 1328~1499): dispColor → dispClass(text/bg/bar) 헬퍼 교체 / cert_no 없음 / 연도 피커 ChevronLeft/Right / 5 상태 빈상태 lucide (🔍→Search / 📋→ClipboardList) / 검사 카드 좌측 색바 (dispClass.bar) / TYPE_ICON_COMPONENT 매퍼 / 호기 헤더 + 부가 정보 (escalator 공단호기 / classification) / 배지(dispClass.text/bg) / 펼침 chevron lucide / 이력 카드(surface-sunken) / 부적합 fails grid (⚠️→AlertTriangle)
  - (3) KoelsaHistorySection.tsx (198줄): boxStyle 인라인 객체 제거 / isMobile 분기 padCls/headerCls/dateCls/subCls 변수 className 매핑 (var() 인라인 0건) / dispColor → dispClass 헬퍼 교체 / 5 상태 박스(정상 / cert_no 없음 / 로딩 스켈레톤 / 에러 / 빈 historyCount=0) Tailwind / 부적합 헤더 ⚠️→AlertTriangle
  - 부가: lucide import 확장 ElevatorPage(ClipboardList/Search/ChevronLeft) + KoelsaHistorySection(AlertTriangle/ChevronRight)
- **Why**: 옵션 B 3B sketch (031ddfb inspect-cert-history-sketch.html, 1888 라인) 사용자 검수 OK. 1:1 매핑 변환. 옵션 B 2/3 묶음 처리. Wave 9 (260515-p3v) 의 ::before 색바 패턴 + EmptyState ReactNode 시그니처 + TYPE_ICON_COMPONENT 매퍼 인프라 재사용.
- **Preserved**: 비즈니스 로직 100% (koelsaQuery / koelsaMap / availableMonths / koelsaMonth / sortedMonths / expandedInspect / mobileAnnualQueries / mobileAnnualAvailableYears / mobileAnnualYear / expandedMobileAnnual / certElevators / perElevatorYearItems / dispWords keyword 분기 / data.resultCounts / data.issues / item.fails / formatDistanceToNow ko / fmtDate8 / fmtDate / TYPE_LABEL / 주의관찰 C 분기). props 시그니처 (KoelsaHistorySection 5 prop). Wave 1~9 변환 결과 (list 탭 / 5 모달 / 헬퍼 4종 / 고장 탭 / RepairListSection / FAB / EmptyState 시그니처). 안전관리자 탭 line 1500~ (line 1504 `<EmptyState icon="👤" ...>` string 보존).
- **Verification**: grep gate Section A~H 모두 PASS, npm build PASS, git status ElevatorPage.tsx + KoelsaHistorySection.tsx + PLAN + SUMMARY 만.
- **Out of scope**: 3C (안전관리자) — 별도 wave (Wave 11+). 점검 사진 (KOELSA 데이터에 없음). 파일 전체 var() 완전 제거.
- **Visual impact**: 사용자 인지 sketch (031ddfb) 4 viewport 와 일치 — 점검 카드 좌측 색바 톤(safe/warning/t3) / 검사 카드 좌측 색바 톤(safe/warning/danger/t3) / 주의관찰 grid / 부적합 fails AlertTriangle 헤더 / KoelsaHistorySection 5 상태 박스. 노안 가독성 (9·10·11px → 12·13px 격상).
- **Next**: 사용자 검수 → main 머지(또는 3C 완료 후 일괄 머지) → 3C 안전관리자 sketch 작성 시작.

### Commit (code only)

executor 가 ElevatorPage.tsx + KoelsaHistorySection.tsx 만 single commit:
```
feat(260515-rfh): Wave 10 — 옵션 B 3B 변환 (점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection) v0.1.1 토큰 + Tailwind + lucide
```

SUMMARY/PLAN docs commit 은 orchestrator 가 worktree merge 후 처리.
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
  ls .planning/quick/260515-rfh-redesign-07-elevator-tsx-wave-10-b-3b-ko/260515-rfh-SUMMARY.md
    </automated>
  </verify>
  <done>
- SUMMARY.md 작성 완료 (untracked or committed depending on orchestrator policy)
- single code commit (ElevatorPage.tsx + KoelsaHistorySection.tsx 만)
- redesign/07-elevator push (main 머지 X, 배포 X — 사용자 컨펌 대기)
  </done>
</task>

</tasks>

<success_criteria>
- [ ] lucide-react import 확장 — ElevatorPage(ClipboardList/Search/ChevronLeft) + KoelsaHistorySection(AlertTriangle/ChevronRight)
- [ ] 점검 기록 탭 본문 line 1225~1325 변환 — 월 피커 ChevronLeft/Right / 카드 좌측 색바 safe-bar/warning-bar/surface-sunken / TYPE_ICON_COMPONENT / 배지 시맨틱 / A~E 칩 시맨틱 / 주의관찰 grid AlertTriangle + cellSt 제거 + C 분기 보존
- [ ] 검사 기록 탭 본문 line 1328~1499 변환 — dispClass(text/bg/bar) 헬퍼 / 연도 피커 ChevronLeft/Right / 빈상태 Search·ClipboardList / 카드 좌측 색바 dispClass.bar / TYPE_ICON_COMPONENT / 배지 dispClass / 이력 카드 surface-sunken / 부적합 AlertTriangle
- [ ] KoelsaHistorySection.tsx 본체 변환 — boxStyle 인라인 객체 제거 / padCls·headerCls·dateCls·subCls className 매핑 / dispClass 헬퍼 / 5 상태 박스 Tailwind / 부적합 AlertTriangle
- [ ] var(--bg2/bd/bd2/t1/t2/t3/bg3/danger/safe/warn/info) 변환 영역(점검 IIFE + 검사 IIFE + KoelsaHistorySection 전체) 0건
- [ ] 본문 이모지 변환 영역 0건 (📋/🔍/⚠️ 제거 / ‹·› 제거)
- [ ] 9·10·11px 폰트 변환 영역 0건 (text-[9px]/text-[10px]/text-[11px]/fontSize:9/10/11 모두 0)
- [ ] KoelsaHistorySection 인라인 style 속성 0건 (`style={{` 0건 + boxStyle 변수 + 사용처 0건)
- [ ] Wave 1~9 변환 결과 단 한 줄도 변경 X
- [ ] 안전관리자 탭 line 1500~ 0건 수정 (line 1504 `<EmptyState icon="👤" ...>` string 보존)
- [ ] TypeScript 0 에러, npm run build PASS
- [ ] SUMMARY 작성 + single commit + push (main 머지 X)
</success_criteria>

<output>
After completion, ensure `.planning/quick/260515-rfh-redesign-07-elevator-tsx-wave-10-b-3b-ko/260515-rfh-SUMMARY.md` exists.
</output>
