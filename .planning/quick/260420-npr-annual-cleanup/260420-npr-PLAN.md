---
phase: 260420-npr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
files_deleted:
  - cha-bio-safety/src/utils/parseInspectionPdf.ts
  - cha-bio-safety/src/utils/splitInspectionPdf.ts
autonomous: true
requirements:
  - NPR-01
  - NPR-02

must_haves:
  truths:
    - "승강기 상세 → '검사 기록' 탭에서 KoelsaHistorySection 카드(공단 공식 검사이력)만 보인다"
    - "annual 탭의 PDF 업로드 버튼, 민원24 검사결과 카드, DB 업로드 검사성적서 목록이 사라졌다"
    - "점검 기록(tab==='inspect'), 고장(tab==='fault'), 수리(tab==='repair'), 안전관리자(tab==='safety') 탭은 건들지 않고 정상 동작한다"
    - "TypeScript 컴파일이 0 errors로 통과한다"
  artifacts:
    - path: "cha-bio-safety/src/pages/ElevatorPage.tsx"
      provides: "annual 탭을 KoelsaHistorySection만 렌더링하도록 단순화"
      forbidden_contains: ["AnnualUploadModal", "parseInspectionPdf", "splitInspectionPdf", "annual_upload"]
      required_contains: ["KoelsaHistorySection"]
  key_links:
    - from: "ElevatorPage.tsx (annual 탭 모바일)"
      to: "KoelsaHistorySection"
      via: "직접 렌더 (래핑 없음)"
      pattern: "tab === 'annual'[\\s\\S]*?KoelsaHistorySection"
    - from: "ElevatorPage.tsx (annual 탭 데스크톱)"
      to: "KoelsaHistorySection"
      via: "직접 렌더 (래핑 없음)"
      pattern: "desktopRightTab === 'annual'[\\s\\S]*?KoelsaHistorySection"
---

<objective>
승강기 관리의 "검사 기록(annual)" 탭을 공단 공식 검사이력(KoelsaHistorySection) 카드 하나만 보이도록 정리한다.

기존 UI (민원24 검사결과 카드, 업로드된 검사성적서 리스트, PDF 일괄 업로드 모달, 연도 네비게이션, 검사 기록 입력 FAB)를 제거하되,
- 같은 annual 탭 최상단의 KoelsaHistorySection은 그대로 유지
- 다른 탭(점검 기록 / 고장 / 수리 / 안전관리자)의 동작은 회귀 없음 보장
- 안전관리자 탭에서 사용 중인 `InspectionLookupInput` (cstmr/recptn 입력)은 유지

**Purpose:** 공단 공식 검사이력 API로 모든 필요 정보가 커버되므로 중복/혼동 UI 제거로 annual 탭 정리.
**Output:** ElevatorPage.tsx 슬림화 + 고아가 된 PDF 파싱 유틸 2개 파일 삭제.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@cha-bio-safety/src/pages/ElevatorPage.tsx
@cha-bio-safety/src/components/KoelsaHistorySection.tsx

<grep_findings>
<!-- Planner가 사전 조사한 결과 — executor는 이 결과에 의존해서 작업 -->

**parseInspectionPdf 참조:**
- `src/pages/ElevatorPage.tsx:14` — `import { parseInspectionPdf, type ParsedCertPage, type InspectionItem }`
- `src/utils/parseInspectionPdf.ts` — 본 파일 자신 (내보내는 쪽)
- **결론:** ElevatorPage가 유일한 소비자. LegalFindingsPage의 `inspectionItem`은 변수명 우연 일치 (대소문자·경로 모두 다름), 관계 없음. → **parseInspectionPdf.ts 파일 삭제 가능**

**splitInspectionPdf 참조:**
- `src/pages/ElevatorPage.tsx:15` — `import { extractSinglePagePdf }`
- `src/pages/ElevatorPage.tsx:2883` — `extractSinglePagePdf(file, r.pageNumber)` (AnnualUploadModal 내부)
- `src/utils/splitInspectionPdf.ts:4` — 본 파일 export
- **결론:** ElevatorPage가 유일한 소비자. AnnualUploadModal 제거 시 참조도 함께 소멸. → **splitInspectionPdf.ts 파일 삭제 가능**

**AnnualUploadModal 참조:**
- `src/pages/ElevatorPage.tsx:1216` — `{modal === 'annual_upload' && <AnnualUploadModal ... />}`
- `src/pages/ElevatorPage.tsx:2826~3005` — `type ParsedRow` + `function AnnualUploadModal(...)` 정의 (~180줄)
- **결론:** 전부 ElevatorPage 내부 전용. → **전체 블록 제거**

**'annual_upload' 문자열:**
- line 93 (`Modal` union type), line 1004 (`setModal('annual_upload')` 버튼 클릭), line 1216 (렌더링)
- **결론:** 3군데 모두 제거 (Modal type에서 옵션 문자열 삭제)

**fetchInspections 참조:**
- line 234 정의, line 343 호출 (`useQuery queryKey:['elevator_annuals']`)
- **결론:** 파일 내 유일 호출. `annuals` useQuery 제거 시 `fetchInspections` 함수는 다른 탭에서 쓰이는지 확인 필요
- 실제 확인: `fetchInspections`는 `'annual'` 타입으로만 호출됨. `inspect` 타입 데이터는 `koelsaMap` 등 별도 쿼리로 가져옴.
- **결론:** `fetchInspections` 함수 정의도 제거 가능

**elevator_annuals queryKey 참조:**
- line 333 (`deleteRecord` 함수), line 343 (useQuery), line 455 (`submitInspect.onSuccess`), line 1216 (`AnnualUploadModal onComplete`), line 1700 (모바일 인증서 첨부 핸들러 — annual 탭 DB 카드 내부), line 3119 (FindingsPanel 합격 전환)
- **처리:**
  - line 1216, 1700 → 함께 제거되는 블록 안에 있으므로 자동 제거
  - line 343 → useQuery 자체 제거
  - line 333, 455, 3119 → `annual_new` / `AnnualModal` 경로도 함께 제거하므로 조건식 단순화 (아래 참조)

**minwon24_inspect 참조:**
- line 494 (useQuery 정의)
- line 894, 948, 969, 1019, 1488, 1636, 1642 (데스크톱/모바일 annual 탭 내부 UI)
- **결론:** annual 탭 UI 외에 소비자 없음 → `minwon24Query` useQuery + `inspectKeyList` 상태 **유지 검토**
- ⚠️ `inspectKeyList` 는 `InspectionLookupInput` (safety 탭)에서 갱신되지만 실제 fetch (`minwon24Query`)는 annual UI에서만 소비. safety 탭에서는 저장만 하고 표시는 annual에서만 했던 구조.
- **결정:** `minwon24Query` + `inspectKeyList` + `inspectKeysQuery` + `InspectKeyEntry` **유지**. 이유: ① `InspectionLookupInput` 컴포넌트가 safety 탭 양쪽(데스크톱 line 1194, 모바일 line 1882)에서 여전히 렌더됨 ② 저장된 cstmr/recptn는 향후 원복 대비 백엔드에 남김 ③ `/api/elevators/inspect-keys` 유지 요구 명시됨. `minwon24Query`는 결과를 소비하는 UI가 없어져 실제 호출되지 않음(`enabled: inspectKeyList.length > 0` 여전히 유효하지만 결과는 버려짐 — 추후 삭제 가능한 기술 부채로 주석 표기).

**elevator_annuals (전체 코드베이스):**
- ElevatorPage.tsx 내부 참조만 존재. 다른 파일/백엔드에서 동일 queryKey 쓰는 곳 없음. → 안전하게 제거.

**InspectKeyEntry 참조:**
- line 470, 473, 481, 486, 2486(type 정의), 2488(Component props), 2489(state), 2519~, 2572(컴포넌트 끝)
- **결론:** safety 탭 `InspectionLookupInput`에서 쓰이므로 **전체 유지**

**AnnualModal vs AnnualUploadModal 구분:**
- `AnnualModal` (line 2673, 수동 입력 모달) — FAB "🔍 검사 기록 입력"에서 호출 (line 1905), `modal === 'annual_new'` (line 1215, 1931)
- `AnnualUploadModal` (line 2830, PDF 일괄 업로드) — `modal === 'annual_upload'` (line 1216)
- 사용자 스코프는 "annual_upload" 제거 + "기존 검사기록 카드 리스트" 제거 명시. DB 카드 리스트가 사라지면 `AnnualModal`로 입력해도 표시할 곳이 없어 고아 UI가 됨.
- **결정:** `AnnualModal` + `annual_new` modal 옵션 + FAB 버튼 (line 1904~1909) + `submitInspect` 내 `'annual'` 분기도 함께 제거. `submitInspect` 자체는 `inspect_new` (InspectModal)에서도 쓰이므로 함수는 유지하되 `vars.type === 'annual'` 분기를 단순화.
</grep_findings>

<interfaces>
<!-- KoelsaHistorySection props (유지 카드) — src/components/KoelsaHistorySection.tsx -->
```typescript
type Props = {
  certNo: string | undefined | null
  data: InspectHistoryApiResponse | undefined  // fetchInspectHistory 반환
  isLoading: boolean
  isError: boolean
  isMobile?: boolean
}
export function KoelsaHistorySection(props: Props): JSX.Element
```

<!-- ElevatorPage.tsx 내부 기존 호출 (그대로 유지) -->
```tsx
// 모바일 (현재 line 1532~)
<KoelsaHistorySection
  certNo={selectedEv?.cert_no}
  data={koelsaHistoryMobile.data}
  isLoading={koelsaHistoryMobile.isLoading}
  isError={koelsaHistoryMobile.isError}
  isMobile
/>

// 데스크톱 (현재 line 952~)
<KoelsaHistorySection
  certNo={selectedDesktopEv?.cert_no}
  data={koelsaHistoryDesktop.data}
  isLoading={koelsaHistoryDesktop.isLoading}
  isError={koelsaHistoryDesktop.isError}
/>
```

<!-- koelsaHistoryMobile/Desktop useQuery (그대로 유지) — line 522, 541 -->
</interfaces>

<constraints_reminder>
- **유지 필수:** KoelsaHistorySection, koelsaHistoryMobile/Desktop useQuery, InspectionLookupInput, inspectKeysQuery, inspectKeyList state, InspectKeyEntry type, `/api/elevators/inspect-keys` 엔드포인트 (백엔드 건들지 않음)
- **회귀 금지:** tab === 'list' / 'fault' / 'repair' / 'inspect' / 'safety' 및 desktopRightTab 동일 키들
- **DB/백엔드 건들지 않음:** elevator_inspections 테이블, /api/elevators/inspections 엔드포인트, 마이그레이션, wrangler 설정
- **annual 탭 키는 유지:** `Tab` union 에서 'annual'은 그대로 (탭 버튼·`TABS` 배열·`RIGHT_TABS` 배열). 탭은 열리지만 내용물이 KoelsaHistorySection 하나로 축소됨.
</constraints_reminder>
</context>

<tasks>

<task type="auto">
  <name>Task 1: ElevatorPage.tsx annual 탭 UI 섹션 제거 & 관련 상태/쿼리/이벤트 정리</name>
  <files>cha-bio-safety/src/pages/ElevatorPage.tsx</files>
  <action>
    ElevatorPage.tsx를 **한 번의 편집 세션**으로 아래 사항을 모두 반영한다 (Read는 1회, 이후 Edit 연쇄).

    **A. Import 제거 (line 14-15)**
    ```diff
    - import { parseInspectionPdf, type ParsedCertPage, type InspectionItem } from '../utils/parseInspectionPdf'
    - import { extractSinglePagePdf } from '../utils/splitInspectionPdf'
    ```

    **B. Modal union type 축소 (line 93)**
    ```diff
    - type Modal = null | 'fault_new' | 'fault_resolve' | 'inspect_new' | 'annual_new' | 'annual_upload' | 'repair_new' | 'ev_detail'
    + type Modal = null | 'fault_new' | 'fault_resolve' | 'inspect_new' | 'repair_new' | 'ev_detail'
    ```

    **C. `fetchInspections` 함수 제거 (line 234 부근 전체 함수 블록)**
    - `async function fetchInspections(type: string): Promise<ElevatorInspection[]> { ... }` 전체 삭제.

    **D. `annuals` useQuery 제거 (line 343)**
    ```diff
    - const { data: annuals = [] } = useQuery({ queryKey:['elevator_annuals'], queryFn: () => fetchInspections('annual') })
    ```

    **E. `deleteRecord` 함수 단순화 (line 327~339)**
    - `type === 'fault'` 분기만 실제로 호출되도록 `type: 'fault' | 'inspection'` 시그니처는 유지하되 `'inspection'` 분기는 이제 호출되지 않으므로 `elevator_annuals` invalidateQueries 라인만 제거:
    ```diff
    -       qc.invalidateQueries({ queryKey: type === 'fault' ? ['elevator_faults'] : ['elevator_annuals'] })
    +       qc.invalidateQueries({ queryKey: ['elevator_faults'] })
    ```
    `elevator_inspections` 라인은 inspect 탭용이므로 그대로 유지. (호출처가 모두 사라지지만 함수 시그니처 변경은 하지 않음 — 다른 탭 회귀 방지.)

    **F. `submitInspect` onSuccess 단순화 (line 453~457)**
    ```diff
    -   onSuccess: (_,vars:any) => {
    -     qc.invalidateQueries({ queryKey:['elevators'] })
    -     qc.invalidateQueries({ queryKey: vars.type === 'annual' ? ['elevator_annuals'] : ['elevator_inspections'] })
    -     setModal(null); toast.success('기록 저장 완료')
    -   },
    +   onSuccess: () => {
    +     qc.invalidateQueries({ queryKey:['elevators'] })
    +     qc.invalidateQueries({ queryKey:['elevator_inspections'] })
    +     setModal(null); toast.success('기록 저장 완료')
    +   },
    ```

    **G. 데스크톱 annual 블록 축소 (line 892 `{desktopRightTab === 'annual' && (() => {` ~ 대응 닫힘 `})()}` at line 1086)**
    - 블록 내부 전체 IIFE를 아래처럼 교체:
    ```tsx
    {desktopRightTab === 'annual' && (
      <KoelsaHistorySection
        certNo={selectedDesktopEv?.cert_no}
        data={koelsaHistoryDesktop.data}
        isLoading={koelsaHistoryDesktop.isLoading}
        isError={koelsaHistoryDesktop.isError}
      />
    )}
    ```
    - 이로써 `evAnnuals`, `correctiveByParent` (desktop scope line 578-583), `mwEv` 계산, 연도 네비게이션, 민원24 카드, DB 업로드 카드 리스트 전체 제거.

    **H. 데스크톱 scope 변수 정리 (line 578-583)**
    - `evAnnuals`, `correctiveByParent` 선언문 2개 제거 (desktop 블록 진입부).

    **I. `RIGHT_TABS` annual count 조정 (line 619)**
    ```diff
    -       { key:'annual',  label:'검사 기록', count: evAnnuals.length },
    +       { key:'annual',  label:'검사 기록', count: 0 },
    ```

    **J. 모달 렌더링 제거 (line 1215-1216)**
    ```diff
    - {modal === 'annual_new' && <AnnualModal elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} onSubmit={b => submitInspect.mutate(b)} loading={submitInspect.isPending} />}
    - {modal === 'annual_upload' && <AnnualUploadModal elevators={elevators} onClose={() => setModal(null)} onComplete={() => { qc.invalidateQueries({ queryKey:['elevator_annuals'] }); setModal(null) }} />}
    ```
    (그리고 모바일 렌더링 line 1931도 동일하게 `annual_new` 라인 제거.)

    **K. 모바일 annual 탭 블록 축소 (line 1486 ~ 대응 닫힘 line 1761 `})()}`)**
    - 전체 IIFE를 아래로 교체:
    ```tsx
    {tab === 'annual' && (
      <div style={{ marginBottom: 10 }}>
        <KoelsaHistorySection
          certNo={selectedEv?.cert_no}
          data={koelsaHistoryMobile.data}
          isLoading={koelsaHistoryMobile.isLoading}
          isError={koelsaHistoryMobile.isError}
          isMobile
        />
      </div>
    )}
    ```
    - 이로써 `mainAnnuals`, `correctiveByParent`, `yearMainAnnuals`, 민원24 카드 타입별 그룹, DB 업로드 카드 리스트, 인증서 첨부 라벨(line 1678~1708), 삭제 버튼(line 1746~) 전체 제거.

    **L. 모바일 FAB 버튼 수정 (line 1890, 1904~1909)**
    ```diff
    - {(tab === 'fault' || tab === 'repair' || tab === 'annual') && (
    + {(tab === 'fault' || tab === 'repair') && (
    ```
    - 블록 내부 `{tab === 'annual' && ( <button ...🔍 검사 기록 입력... /> )}` 섹션 제거.

    **M. 모바일 모달 렌더링 제거 (line 1931)**
    ```diff
    - {modal === 'annual_new' && <AnnualModal elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} onSubmit={b => submitInspect.mutate(b)} loading={submitInspect.isPending} />}
    ```

    **N. `AnnualModal` 함수 정의 제거 (line 2673 `function AnnualModal(...)` ~ 대응 닫힘 line 2822 `}`)**
    - 전체 함수 블록 삭제.

    **O. `ParsedRow` 타입 & `AnnualUploadModal` 함수 제거 (line 2824 주석 ~ line 3005 함수 끝)**
    - 주석 `// ── 검사성적서 일괄 업로드 모달 ──...` 부터 `AnnualUploadModal` 함수 닫는 `}`까지 전체 삭제.

    **P. FindingsPanel 내 convertToPass 쿼리 무효화 정리 (line 3119)**
    ```diff
    -       qc.invalidateQueries({ queryKey: ['elevator_annuals'] })
    ```
    - 제거. (annual 데이터가 없으므로 불필요. `elev-findings` invalidation은 유지.)

    **Q. `state` 중 dead 변수 정리**
    - `expandedAnnual` (line 320) — annual 카드 펼침 전용 → 다른 곳에서 쓰이지 않음 → 제거
    - `expandedMw` (line 323) — 민원24 카드 펼침 전용 → 제거
    - `annualYear` / `setAnnualYear` (line 377) — annual 연도 네비 전용 → 제거
    - `certViewerKey` / `setCertViewerKey` (line 321), `CertViewerModal` 렌더 (line 1219) — 확인 필요: `CertSummary` (line 3222) 에서도 `onViewCert` 로 받아 쓰는데, `CertSummary`는 제거되는 annual DB 카드에서만 호출됨. 따라서 `certViewerKey` 상태도 제거하고 `CertViewerModal` 렌더 라인도 제거.

    **R. 그에 따라 `CertSummary` / `CertBlock` / `certHasData` / `FindingCountBadge` / `FindingsPanel` 사용처 점검**
    - `FindingCountBadge` (line 3039) — annual 모바일 카드(line 1665)에서만 렌더 → **제거 가능**하지만 FindingsPanel이 외부 /elevator/findings 라우트에서도 쓰이는지 확인:
    ```bash
    grep -rn "FindingsPanel\|FindingCountBadge\|CertSummary\|CertBlock" cha-bio-safety/src
    ```
    (Executor는 Grep으로 확인 후, annual 탭 전용이면 함수 정의도 제거. 다른 페이지에서 import되면 유지.)
    - ⚠️ **보수적 처리 원칙:** 확신이 없는 dead 함수는 **파일 내 함수 정의는 유지**하고 호출만 제거한다. TypeScript가 no-unused-locals 비활성이라 남아도 빌드 실패하지 않는다. 과감한 정리보다는 회귀 방지 우선.

    **S. `minwon24Query` / `inspectKeyList` / `inspectKeysQuery` 처리**
    - **유지** (safety 탭 `InspectionLookupInput`이 계속 호출; 삭제 시 safety 탭 깨짐).
    - 단, `minwon24Query` useQuery (line 493~507)는 결과 소비자가 사라져 dead state가 된다. **유지하되 주석 추가:**
    ```ts
    // NOTE(260420): annual 탭 UI 제거로 결과 소비자 없음. inspect-keys 저장은 유지 (InspectionLookupInput에서 사용).
    ```

    **T. 편집 전략 (context 절약)**
    1. Read ElevatorPage.tsx 한 번에 필요 블록만 offset/limit으로 (1-100, 300-500, 570-620, 885-1095, 1200-1220, 1480-1765, 1885-1935, 2670-3010, 3115-3125) — 이미 planner가 읽은 라인은 재독 금지
    2. 큰 삭제 블록은 Edit tool의 old_string/new_string으로 블록 단위 교체
    3. 모든 수정 후 저장.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit</automated>
  </verify>
  <done>
    - `npx tsc --noEmit` → 0 errors
    - `grep -c "AnnualUploadModal\|parseInspectionPdf\|splitInspectionPdf\|annual_upload" cha-bio-safety/src/pages/ElevatorPage.tsx` → 0
    - `grep -c "AnnualModal\b" cha-bio-safety/src/pages/ElevatorPage.tsx` → 0
    - `grep -c "KoelsaHistorySection" cha-bio-safety/src/pages/ElevatorPage.tsx` → 2 (desktop + mobile)
    - `grep -c "'annual'" cha-bio-safety/src/pages/ElevatorPage.tsx` → ≥3 (Tab type + TABS 배열 + RIGHT_TABS + tab === 'annual' 분기)
    - `grep -c "evAnnuals\|mainAnnuals\|yearMainAnnuals\|yearAnnuals\|correctiveByParent\|expandedAnnual\|expandedMw" cha-bio-safety/src/pages/ElevatorPage.tsx` → 0
    - `grep -c "KoelsaHistorySection\|InspectionLookupInput" cha-bio-safety/src/pages/ElevatorPage.tsx` → 각각 ≥2
  </done>
</task>

<task type="auto">
  <name>Task 2: 고아 유틸 파일 삭제 & 최종 빌드 검증</name>
  <files>
    cha-bio-safety/src/utils/parseInspectionPdf.ts,
    cha-bio-safety/src/utils/splitInspectionPdf.ts
  </files>
  <action>
    Task 1 완료 후 아래 두 파일이 ElevatorPage.tsx 외부에서 import되지 않음을 재확인하고 **삭제**한다.

    **Step 1: 재확인 grep (executor 실행)**
    ```bash
    cd /Users/jykevin/Documents/20260328/cha-bio-safety
    grep -rn "from.*parseInspectionPdf\|from.*splitInspectionPdf" src
    ```
    결과가 비어있어야 한다 (Task 1에서 ElevatorPage import 2줄 제거 완료).

    **Step 2: 파일 삭제**
    ```bash
    rm cha-bio-safety/src/utils/parseInspectionPdf.ts
    rm cha-bio-safety/src/utils/splitInspectionPdf.ts
    ```

    **Step 3: TypeScript 전체 검증**
    ```bash
    cd cha-bio-safety && npx tsc --noEmit
    ```
    0 errors 필수.

    **Step 4: 최종 grep 회귀 검증**
    ```bash
    cd /Users/jykevin/Documents/20260328/cha-bio-safety
    # annual 관련 dead 심볼 완전 제거 확인
    grep -rn "AnnualUploadModal\|AnnualModal\b\|parseInspectionPdf\|splitInspectionPdf\|annual_upload\|elevator_annuals" src functions migrations 2>/dev/null
    ```
    결과:
    - `elevator_annuals` 는 백엔드/마이그레이션에는 남아있을 수 있으나 `src` 하위에선 **0건**이어야 한다 (백엔드 테이블명이면 유지 OK).
    - 다른 심볼 전부 `src/` 에서 0건.

    **Step 5 (선택, dev가 배포 확인):**
    - `npm run deploy -- --branch production` 후 승강기 상세 → 검사 기록 탭에서 KOELSA 카드만 보이는지 직접 확인 (human verify는 quick 모드에서는 skip — dev 판단).
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit && test ! -f src/utils/parseInspectionPdf.ts && test ! -f src/utils/splitInspectionPdf.ts && echo OK</automated>
  </verify>
  <done>
    - 두 파일 삭제됨
    - `npx tsc --noEmit` 0 errors
    - `grep -rn "parseInspectionPdf\|splitInspectionPdf" cha-bio-safety/src` → 0건
    - ElevatorPage.tsx는 Task 1의 모든 done 기준을 계속 만족
  </done>
</task>

</tasks>

<verification>
Task 1 + Task 2 완료 후 통합 검증:

1. **빌드:**
   ```bash
   cd /Users/jykevin/Documents/20260328/cha-bio-safety
   npx tsc --noEmit
   ```
   → 0 errors

2. **정적 회귀 검증 (모든 grep 0건이어야 함):**
   ```bash
   cd /Users/jykevin/Documents/20260328/cha-bio-safety/src
   grep -c "AnnualUploadModal" pages/ElevatorPage.tsx
   grep -c "AnnualModal\b" pages/ElevatorPage.tsx
   grep -c "parseInspectionPdf" pages/ElevatorPage.tsx
   grep -c "splitInspectionPdf" pages/ElevatorPage.tsx
   grep -c "annual_upload" pages/ElevatorPage.tsx
   grep -c "evAnnuals\|mainAnnuals\|yearAnnuals\|yearMainAnnuals\|correctiveByParent" pages/ElevatorPage.tsx
   grep -c "expandedAnnual\|expandedMw\|annualYear" pages/ElevatorPage.tsx
   grep -c "fetchInspections" pages/ElevatorPage.tsx
   ```
   전부 0.

3. **유지 검증 (모두 ≥1이어야 함):**
   ```bash
   grep -c "KoelsaHistorySection" pages/ElevatorPage.tsx  # ≥3 (import + desktop + mobile)
   grep -c "InspectionLookupInput" pages/ElevatorPage.tsx  # ≥3 (정의 + desktop safety + mobile safety)
   grep -c "inspectKeyList\|InspectKeyEntry" pages/ElevatorPage.tsx  # ≥4
   grep -c "desktopRightTab === 'inspect'" pages/ElevatorPage.tsx  # ≥1 (점검 기록 탭 유지)
   grep -c "tab === 'inspect'" pages/ElevatorPage.tsx  # ≥1
   grep -c "tab === 'fault'\|tab === 'repair'\|tab === 'safety'" pages/ElevatorPage.tsx  # 각 ≥1
   ```

4. **annual 탭 키 유지 검증 (축소는 했지만 탭은 존재):**
   ```bash
   grep -c "tab === 'annual'" pages/ElevatorPage.tsx  # ≥2 (모바일 분기 + FAB 제외 조건)
   grep -c "desktopRightTab === 'annual'" pages/ElevatorPage.tsx  # ≥2 (koelsaHistoryDesktop enabled + 블록 진입)
   grep "key:'annual'" pages/ElevatorPage.tsx  # TABS, RIGHT_TABS 배열에 annual 엔트리 존재
   ```

5. **파일 삭제 검증:**
   ```bash
   ls cha-bio-safety/src/utils/parseInspectionPdf.ts 2>&1  # No such file
   ls cha-bio-safety/src/utils/splitInspectionPdf.ts 2>&1  # No such file
   ```

6. **수동 배포 검증 (optional, dev 판단):**
   `npm run deploy -- --branch production` 후:
   - 승강기 관리 → 호기 선택 → 검사 기록 탭 → **KOELSA 공단 공식 검사이력 카드만** 보임
   - 점검 기록 탭 정상 동작 (koelsaMap 기반)
   - 고장 / 수리 / 안전관리자 탭 회귀 없음
   - 안전관리자 탭의 "검사 일정 등록 (cstmr/recptn 입력)" UI 정상
</verification>

<success_criteria>
- [ ] `npx tsc --noEmit` 0 errors
- [ ] ElevatorPage.tsx 내 annual 탭 UI = `<KoelsaHistorySection />` 하나만 (desktop + mobile 각 1개)
- [ ] `parseInspectionPdf.ts`, `splitInspectionPdf.ts` 삭제됨
- [ ] AnnualModal / AnnualUploadModal / fetchInspections / elevator_annuals 관련 코드 ElevatorPage.tsx에서 완전 소멸
- [ ] 다른 탭 (list/fault/repair/inspect/safety) 및 desktopRightTab 해당 키들 코드 회귀 없음
- [ ] InspectionLookupInput (safety 탭) 및 inspect-keys 저장 흐름 유지
- [ ] 백엔드(functions/api/elevators/*.ts), 마이그레이션, wrangler.toml 건들지 않음
</success_criteria>

<output>
작업 완료 후 SUMMARY는 quick 모드이므로 생략 가능. 단, 다음 한 줄 로그를 남긴다:

```
260420-npr-annual-cleanup: ElevatorPage.tsx annual 탭 UI 제거 완료 — KoelsaHistorySection 단독 렌더. parseInspectionPdf/splitInspectionPdf 파일 삭제. tsc 0 errors.
```
</output>
