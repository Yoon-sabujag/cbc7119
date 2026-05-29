---
phase: 260529-vwc-floor-format-unify-logs
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/utils/formatFloorLabel.ts  # new
  - cha-bio-safety/src/utils/dailyReportCalc.ts
  - cha-bio-safety/src/utils/generateExcel.ts
  - cha-bio-safety/src/pages/LegalPage.tsx
autonomous: false
requirements:
  - QUICK-260529-VWC-01  # formatFloorLabel helper 신규
  - QUICK-260529-VWC-02  # dailyReportCalc 조치완료 floor 표시 통일
  - QUICK-260529-VWC-03  # generateExcel PS_LABELS 18 라벨 새 양식
  - QUICK-260529-VWC-04  # LegalPage 제출용 탭 textarea prefill 지하층 자동 변환
user_setup: []

must_haves:
  truths:
    - "일일 업무일지의 조치완료 항목은 지상층=`연구동/사무동 {floor}`, 지하층=`B{N}F`, '전층' 자연어는 보존 — formatFloorLabel(floor, zone) 단일 함수 호출"
    - "업무수행기록표 Excel 의 PS_LABELS 18개가 모두 새 양식으로 표시 (예: '8층 연구동 공조실'→'연구동 8F 공조실', 'B3층 휀룸1'→'B3F 휀룸1', '8층 계단위 PS실'→'사무동 8-1F 계단위 PS실', '2층 PS실'→'2F PS실')"
    - "소방점검관리 제출용 탭의 textarea 자동 prefill 은 location 텍스트 시작이 `B[1-5]` (whole word) 패턴이면 `B[1-5]F` 로 자동 변환, 그 외 형태는 변경 없이 그대로 노출"
    - "지상층은 prefix(연구동/사무동/공용) + 공백 + DB floor 코드 (예: `연구동 1F`, `사무동 8-1F`). zone='basement' 또는 floor 가 B 패턴이면 B+숫자+F (zone 무시)"
    - "'전층' 자연어 seed (schedule MEMO + dailyReportCalc.INSPECT_FULL_CONTENT) 는 전혀 건드리지 않음"
    - "DB schema 변경 0 — 자동 양식 변환은 UI/생성 레이어에서만"
  artifacts:
    - path: "cha-bio-safety/src/utils/formatFloorLabel.ts"
      provides: "formatFloorLabel(floor, zone) → 새 양식 문자열"
      contains: "B 패턴 분기 + ZONE_KO 매핑 + 빈값/M floor 안전 fallback"
  key_links:
    - from: "src/utils/dailyReportCalc.ts"
      to: "src/utils/formatFloorLabel.ts"
      via: "import { formatFloorLabel } — 조치완료 항목 floor 표시 단일 호출"
      pattern: "formatFloorLabel"
    - from: "src/utils/generateExcel.ts PS_LABELS"
      to: "(hardcoded 라벨 표 재작성)"
      via: "18 entry 직접 수정. div_id 와 floorLabel 의 짝 보존"
      pattern: "PS_LABELS"
    - from: "src/pages/LegalPage.tsx labelFor"
      to: "src/utils/formatFloorLabel.ts (또는 inline regex)"
      via: "지하층 정규식 변환 적용"
      pattern: "labelFor"

---

<objective>
3개 일지/문서 작성 페이지의 자동 기입 부분에서 층 표기를 통일된 양식으로 변경한다.

Purpose:
DB 는 영문 코드 (`B3`, `1F`, `8-1F`), constants 는 한국어 ('B3층', '1층', '8-1층'), 업무수행기록표는 한국어+위치명 ('B3층 휀룸1'), 일일 업무일지는 영문 floor 그대로 ('B3 D-7 기둥') — 4가지 양식이 혼재. 사용자에게 노출되는 자동생성 문구를 단일 룰로 통일.

룰:
- 지상층: zone 한국어 prefix + DB floor 코드 (`연구동 1F`, `사무동 8-1F`, `공용 1F`)
- 지하층: `B{N}F` (zone 무시, B+숫자+F)
- '전층' 같은 자연어 seed: 그대로 보존
- 빈/Unknown floor: 그대로 (empty string 가능)

Output:
1. 신규 헬퍼 `src/utils/formatFloorLabel.ts` — (floor, zone) 받아 새 양식 반환
2. `dailyReportCalc.ts` 조치완료 항목 (L408-414) 의 floor 표시를 헬퍼로 통일
3. `generateExcel.ts` PS_LABELS 18 entry 재작성 (한국어 → 새 양식)
4. `LegalPage.tsx:769` labelFor 의 location prefill 에 지하층 자동 변환 적용
5. orchestrator (메인 Claude) build + deploy

absolutely_do_not:
- `INSPECT_FULL_CONTENT` (dailyReportCalc seed) 의 '전층' / '1층, B4층' 같은 자연어 변경 금지
- SchedulePage.MEMO_SEED 자연어 변경 금지
- DIV_POINTS.floorLabel 변경 금지 (다른 곳에서 직접 참조)
- DB schema 변경 금지
- 사용자가 자유 입력하는 textarea (DailyReport/WorkLog 의 '조치 내역' / '기타 내용') 의 placeholder 변경 금지 — auto-generated 부분만 손볼 것
- 지상층 자동 변환 LegalPage 에서 시도 금지 (zone 정보 부재, 사용자 컨펌으로 지하층 한정)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/production-sync.md
@CLAUDE.md

<interfaces>

**DB check_points.floor distinct 값** (PRAGMA + SELECT DISTINCT 확인됨):
`1F`, `2F`, `3F`, `5F`, `6F`, `7F`, `8F`, `8-1F`, `B1`, `B2`, `B3`, `B4`, `B5`, `M`

(주의: 4F 없음 / B 코드는 F suffix 없음 — DB 상태 그대로)

**ZONE_KO 매핑** (dailyReportCalc.ts:388 기존, 헬퍼로 재사용):
`{ office: '사무동', research: '연구동', common: '공용', basement: '지하' }`

---

**Task 1 — formatFloorLabel.ts 신규**

새 파일 `cha-bio-safety/src/utils/formatFloorLabel.ts`:

```ts
// 자동 기입 페이지 (일일 업무일지 / 업무수행기록표 / 소방점검관리 제출용 탭) 에서
// 층 표기를 통일하기 위한 헬퍼.
//
// 룰:
//   - 지하층 (B1~B5, B+숫자 패턴): zone 무시 → `B1F`, `B5F`
//   - 지상층 (1F~8F, 8-1F 등 F 접미 코드): zone 한국어 prefix + 공백 + floor 코드
//     예) zone=office, floor=1F → '사무동 1F'
//     예) zone=research, floor=8-1F → '연구동 8-1F'
//     예) zone=common, floor=3F → '공용 3F'
//   - zone 없음/Unknown 지상층: prefix 생략 → '1F'
//   - M (기계실) / 빈 값: 그대로 반환 (빈 문자열 가능)
//
// 호출자는 이 결과를 다른 텍스트 (위치, 카테고리, 메모 등) 와 공백으로 join 한다.

const ZONE_KO: Record<string, string> = {
  office:    '사무동',
  research:  '연구동',
  common:    '공용',
  basement:  '지하',
}

export function formatFloorLabel(floor: string | null | undefined, zone?: string | null | undefined): string {
  const f = (floor ?? '').trim()
  if (!f) return ''
  // 지하층: 'B1' ~ 'B5' 또는 'B' + 숫자 — zone 무시, F 접미 추가
  if (/^B\d+$/.test(f)) return `${f}F`
  // 지상층 (이미 F 또는 N-NF 형태): zone prefix 추가
  const zoneKo = ZONE_KO[zone ?? ''] ?? ''
  return zoneKo ? `${zoneKo} ${f}` : f
}
```

---

**Task 2 — dailyReportCalc.ts (조치완료 항목 floor 표시)**

현재 코드 (L386-414):

```ts
  // 오늘 조치 완료된 점검 항목 (불량/주의)
  const ZONE_KO: Record<string,string> = { office: '사무동', research: '연구동', common: '공용', basement: '지하' }
  // 유도등 타입 라벨 (RemediationDetailPage 와 동일 매핑)
  const GL_TYPE_LABEL: Record<string,string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_passage: '거실통로',
    corridor_passage: '복도통로',
    stair_passage: '계단통로',
    audience_passage: '객석통로',
  }
  for (const r of (remediations ?? [])) {
    const floor = r.floor ?? ''
    const cat = r.category ?? ''
    const loc = r.location ?? ''
    const markerLabel = r.marker_label ?? ''
    const locationDetail = r.location_detail ?? ''
    const zoneKo = ZONE_KO[r.zone ?? ''] ?? ''
    const reso = r.resolution_memo ?? ''
    // 유도등: location_detail > marker_label > loc 우선순위, 타입 라벨을 카테고리 앞에 붙임
    const isGL = cat === '유도등'
    const spot = locationDetail || markerLabel || loc
    const glType = isGL ? (GL_TYPE_LABEL[r.guide_light_type ?? ''] ?? '') : ''
    const place = isGL
      ? [zoneKo, floor, spot].filter(Boolean).join(' ')
      : [floor, loc].filter(Boolean).join(' ')
    const catWithType = isGL && glType ? `${glType} ${cat}` : cat
    const parts = [place, catWithType, reso].filter(Boolean).join(' ')
    tasks.push({ number: num++, content: parts })
  }
```

**변경 후** (formatFloorLabel 사용, ZONE_KO 로컬 정의 제거, 유도등/비유도등 한 줄 통일):

```ts
  // 오늘 조치 완료된 점검 항목 (불량/주의)
  // 유도등 타입 라벨 (RemediationDetailPage 와 동일 매핑)
  const GL_TYPE_LABEL: Record<string,string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_passage: '거실통로',
    corridor_passage: '복도통로',
    stair_passage: '계단통로',
    audience_passage: '객석통로',
  }
  for (const r of (remediations ?? [])) {
    const cat = r.category ?? ''
    const loc = r.location ?? ''
    const markerLabel = r.marker_label ?? ''
    const locationDetail = r.location_detail ?? ''
    const reso = r.resolution_memo ?? ''
    const floorLabel = formatFloorLabel(r.floor, r.zone)
    // 유도등: location_detail > marker_label > loc 우선순위, 타입 라벨을 카테고리 앞에 붙임
    const isGL = cat === '유도등'
    const spot = isGL ? (locationDetail || markerLabel || loc) : loc
    const glType = isGL ? (GL_TYPE_LABEL[r.guide_light_type ?? ''] ?? '') : ''
    const place = [floorLabel, spot].filter(Boolean).join(' ')
    const catWithType = isGL && glType ? `${glType} ${cat}` : cat
    const parts = [place, catWithType, reso].filter(Boolean).join(' ')
    tasks.push({ number: num++, content: parts })
  }
```

import 추가 (파일 상단):
```ts
import { formatFloorLabel } from './formatFloorLabel'
```

기존 import 인 `import { DIV_POINT_LABEL } from '../constants/divPoints'` 옆에 추가하면 됨.

---

**Task 3 — generateExcel.ts PS_LABELS 18 라벨 재작성**

현재 L4-19:

```ts
// '소방용 가압송수장치 점검 일지'의 측정점 라벨
const PS_LABELS: Record<string, string> = {
  '9-3':  '8층 계단위 PS실',
  '8-1':  '8층 연구동 공조실', '8-2':  '8층 연구동 PS실',  '8-3':  '8층 사무동 PS실',
  '7-1':  '7층 연구동 공조실', '7-2':  '7층 연구동 PS실',  '7-3':  '7층 사무동 PS실',
  '6-1':  '6층 연구동 공조실', '6-2':  '6층 연구동 PS실',  '6-3':  '6층 사무동 PS실',
  '5-1':  '5층 연구동 공조실', '5-2':  '5층 연구동 PS실',  '5-3':  '5층 사무동 PS실',
  '3-1':  '3층 연구동 공조실', '3-2':  '3층 연구동 PS실',  '3-3':  '3층 사무동 PS실',
  '2-2':  '2층 PS실',          '2-3':  '2층 사무동 PS실',
  '1-1':  '1층 연구동 공조실', '1-2':  '1층 연구동 PS실',  '1-3':  '1층 사무동 PS실',
  '-1-1': 'B1층 공조실',       '-1-2': 'B1층 식당',        '-1-3': 'B1층 화장실',
  '-2-1': 'B2층 공조실',       '-2-2': 'B2층 CPX실',       '-2-3': 'B2층 PS실',
  '-3-2': 'B3층 휀룸1',        '-3-3': 'B3층 기사대기실',
  '-4-1': 'B4층 기계실',       '-4-2': 'B4층 팬룸',        '-4-3': 'B4층 창고',
  '-5-2': 'B5층 휀룸1',        '-5-3': 'B5층 휀룸2',
}
```

**변경 후** (룰: 지상층 zone 분리 + DB floor 코드 + 위치명 / 지하층 B+숫자+F + 위치명. 9-3 은 8-1층 사무동):

```ts
// '소방용 가압송수장치 점검 일지'의 측정점 라벨
// 양식: 지상층 = `{zone 한국어} {floor 코드} {위치명}` / 지하층 = `B{N}F {위치명}`
// formatFloorLabel 헬퍼와 동일 룰 (constants/divPoints.ts DIV_POINTS 의 floor/loc 패턴 기준 mirror).
const PS_LABELS: Record<string, string> = {
  '9-3':  '사무동 8-1F 계단위 PS실',
  '8-1':  '연구동 8F 공조실', '8-2':  '연구동 8F PS실',  '8-3':  '사무동 8F PS실',
  '7-1':  '연구동 7F 공조실', '7-2':  '연구동 7F PS실',  '7-3':  '사무동 7F PS실',
  '6-1':  '연구동 6F 공조실', '6-2':  '연구동 6F PS실',  '6-3':  '사무동 6F PS실',
  '5-1':  '연구동 5F 공조실', '5-2':  '연구동 5F PS실',  '5-3':  '사무동 5F PS실',
  '3-1':  '연구동 3F 공조실', '3-2':  '연구동 3F PS실',  '3-3':  '사무동 3F PS실',
  '2-2':  '2F PS실',           '2-3':  '사무동 2F PS실',
  '1-1':  '연구동 1F 공조실', '1-2':  '연구동 1F PS실',  '1-3':  '사무동 1F PS실',
  '-1-1': 'B1F 공조실',        '-1-2': 'B1F 식당',         '-1-3': 'B1F 화장실',
  '-2-1': 'B2F 공조실',        '-2-2': 'B2F CPX실',        '-2-3': 'B2F PS실',
  '-3-2': 'B3F 휀룸1',         '-3-3': 'B3F 기사대기실',
  '-4-1': 'B4F 기계실',        '-4-2': 'B4F 팬룸',         '-4-3': 'B4F 창고',
  '-5-2': 'B5F 휀룸1',         '-5-3': 'B5F 휀룸2',
}
```

총 35 entry. 9-3 은 8-1층 사무동 (constants/divPoints.ts DIV_POINTS L5: `{ floor: 9, pos: 3, id: '9-3', floorLabel: '8-1층', loc: '사) 8층 계단 위' }` 기준 사무동 매핑).

`2-2` 는 원본에 zone 누락이라 그대로 zone 없는 케이스로 보존 (`2F PS실`).

generateExcel.ts 의 L6-18 만 교체. 다른 라벨/셀 매핑은 무손상.

---

**Task 4 — LegalPage.tsx labelFor 지하층 자동 변환**

현재 L767-770:

```ts
  // 라벨 (DB submissionLabel || prefill)
  const labelFor = (f: LegalFinding): string =>
    f.submissionLabel ?? `${f.location ?? ''} ${f.description}`.trim()
```

**변경 후** (지하층 정규식 한정 자동 변환):

```ts
  // 라벨 (DB submissionLabel || prefill)
  // prefill 시 location 텍스트가 'B1' ~ 'B5' 로 시작하면 'B1F' ~ 'B5F' 로 자동 변환 (지하층 룰 통일).
  // 지상층 패턴은 zone 정보 부재로 자동 변환 X — 사용자가 finding 만들 때 '연구동/사무동 3F' 형태로 자유 입력.
  const labelFor = (f: LegalFinding): string => {
    if (f.submissionLabel != null) return f.submissionLabel
    const loc = (f.location ?? '').replace(/^(B[1-5])(?![0-9F])/, '$1F')
    return `${loc} ${f.description}`.trim()
  }
```

정규식 설명:
- `^(B[1-5])` — 시작이 'B1' / 'B2' / 'B3' / 'B4' / 'B5'
- `(?![0-9F])` — 그 다음이 숫자나 F 가 아닐 때만 (이미 'B1F' 라면 변환 안 함 — 이중 F 방지)
- 변환: `B[1-5]` → `B[1-5]F`
- 예시:
  - `B3 D-7 기둥` → `B3F D-7 기둥`
  - `B5 팬룸` → `B5F 팬룸`
  - `B3F D-7` → `B3F D-7` (이미 F)
  - `3F 복도` → `3F 복도` (지상층 — 변환 안 함)
  - `사무동 3F 복도` → `사무동 3F 복도` (이미 prefix 있음 — 변환 안 함)

L995 (`KVRow label="위치">{finding.location ?? '-'}` — 상세 페이지 위치 표시) 와 L963 (zip 파일명) 의 location 사용처는 변경 없음 (raw 표시 + 파일명 안전).

---

**Task 5 — checkpoint:human-verify**: orchestrator deploy 후 사용자 시각 검증.

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: formatFloorLabel.ts 헬퍼 신규</name>
  <files>cha-bio-safety/src/utils/formatFloorLabel.ts (NEW)</files>
  <action>
Write 도구로 위 Task 1 interfaces 의 헬퍼 코드 그대로 신규 작성. ZONE_KO 매핑 4개 + B 패턴 정규식 분기 + 빈값/M floor 안전 fallback. export 1개 함수.

작업 후 verify grep:
- `grep -c 'export function formatFloorLabel' cha-bio-safety/src/utils/formatFloorLabel.ts` = 1
- `grep -c "office:.*사무동\|research:.*연구동\|common:.*공용\|basement:.*지하" cha-bio-safety/src/utils/formatFloorLabel.ts` ≥ 4 (ZONE_KO 4개 매핑)
- `grep -E "B\\\\d\\\\+" cha-bio-safety/src/utils/formatFloorLabel.ts` 1 hit (지하층 정규식)
  </action>
  <verify>
    <automated>
      ls cha-bio-safety/src/utils/formatFloorLabel.ts
      grep -c 'export function formatFloorLabel' cha-bio-safety/src/utils/formatFloorLabel.ts
      cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
    </automated>
  </verify>
  <done>
- 파일 신규 작성, export 1개
- 단독 컴파일 (tsc) 통과
  </done>
</task>

<task type="auto">
  <name>Task 2: dailyReportCalc.ts 조치완료 항목 floor 표시 통일</name>
  <files>cha-bio-safety/src/utils/dailyReportCalc.ts</files>
  <action>
Edit 도구로:

**Edit 1 — import 추가** (파일 상단 import 영역):

old_string:
```
import { DIV_POINT_LABEL } from '../constants/divPoints'
```

new_string:
```
import { DIV_POINT_LABEL } from '../constants/divPoints'
import { formatFloorLabel } from './formatFloorLabel'
```

**Edit 2 — 조치완료 블록 L386-414 교체** (위 Task 2 interfaces 의 변경 후 코드 그대로):

old_string (정확 매치, 들여쓰기 2-space):
```
  // 오늘 조치 완료된 점검 항목 (불량/주의)
  const ZONE_KO: Record<string,string> = { office: '사무동', research: '연구동', common: '공용', basement: '지하' }
  // 유도등 타입 라벨 (RemediationDetailPage 와 동일 매핑)
  const GL_TYPE_LABEL: Record<string,string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_passage: '거실통로',
    corridor_passage: '복도통로',
    stair_passage: '계단통로',
    audience_passage: '객석통로',
  }
  for (const r of (remediations ?? [])) {
    const floor = r.floor ?? ''
    const cat = r.category ?? ''
    const loc = r.location ?? ''
    const markerLabel = r.marker_label ?? ''
    const locationDetail = r.location_detail ?? ''
    const zoneKo = ZONE_KO[r.zone ?? ''] ?? ''
    const reso = r.resolution_memo ?? ''
    // 유도등: location_detail > marker_label > loc 우선순위, 타입 라벨을 카테고리 앞에 붙임
    const isGL = cat === '유도등'
    const spot = locationDetail || markerLabel || loc
    const glType = isGL ? (GL_TYPE_LABEL[r.guide_light_type ?? ''] ?? '') : ''
    const place = isGL
      ? [zoneKo, floor, spot].filter(Boolean).join(' ')
      : [floor, loc].filter(Boolean).join(' ')
    const catWithType = isGL && glType ? `${glType} ${cat}` : cat
    const parts = [place, catWithType, reso].filter(Boolean).join(' ')
    tasks.push({ number: num++, content: parts })
  }
```

new_string (변경 후 — ZONE_KO 로컬 정의 제거, place 한 줄 통일):
```
  // 오늘 조치 완료된 점검 항목 (불량/주의)
  // 유도등 타입 라벨 (RemediationDetailPage 와 동일 매핑)
  const GL_TYPE_LABEL: Record<string,string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_passage: '거실통로',
    corridor_passage: '복도통로',
    stair_passage: '계단통로',
    audience_passage: '객석통로',
  }
  for (const r of (remediations ?? [])) {
    const cat = r.category ?? ''
    const loc = r.location ?? ''
    const markerLabel = r.marker_label ?? ''
    const locationDetail = r.location_detail ?? ''
    const reso = r.resolution_memo ?? ''
    const floorLabel = formatFloorLabel(r.floor, r.zone)
    // 유도등: location_detail > marker_label > loc 우선순위, 타입 라벨을 카테고리 앞에 붙임
    const isGL = cat === '유도등'
    const spot = isGL ? (locationDetail || markerLabel || loc) : loc
    const glType = isGL ? (GL_TYPE_LABEL[r.guide_light_type ?? ''] ?? '') : ''
    const place = [floorLabel, spot].filter(Boolean).join(' ')
    const catWithType = isGL && glType ? `${glType} ${cat}` : cat
    const parts = [place, catWithType, reso].filter(Boolean).join(' ')
    tasks.push({ number: num++, content: parts })
  }
```

verify grep (cha-bio-safety/src/utils/dailyReportCalc.ts 에 대해):
- `grep -c 'formatFloorLabel' ...` ≥ 2 (import 1 + 호출 1)
- `grep -c 'const ZONE_KO' ...` = 0 (조치완료 블록 ZONE_KO 로컬 정의 제거됨. 다른 블록에 ZONE_KO 가 있으면 별개 — 검증 시 변경 영향 자리만 확인)
- `grep -c "\\[zoneKo, floor, spot\\]" ...` = 0 (옛 유도등 빌더 제거)
- `grep -c "\\[floor, loc\\]" ...` = 0 (옛 비-유도등 빌더 제거)
- `grep -c "formatFloorLabel(r.floor, r.zone)" ...` = 1

작업 흐름:
1. Read 로 영역 확인 (L386-414 + 상단 import 영역)
2. Edit 1 + Edit 2 적용
3. tsc 통과 확인
4. 모든 grep 결과 SUMMARY 박제

**중요**:
- 다른 블록 (예: tomorrow tasks, monthly summary) 의 ZONE_KO/floor 사용은 변경 대상 아님. 조치완료 블록만 교체.
- 만약 `const ZONE_KO` 가 다른 블록에서도 정의되어 있으면 그건 별개 인스턴스 — Edit 1/2 영역 밖이라면 무손상.
  </action>
  <verify>
    <automated>
      grep -c 'formatFloorLabel' cha-bio-safety/src/utils/dailyReportCalc.ts
      grep -c 'formatFloorLabel(r.floor, r.zone)' cha-bio-safety/src/utils/dailyReportCalc.ts
      grep -E "\[zoneKo, floor, spot\]" cha-bio-safety/src/utils/dailyReportCalc.ts || echo "PASS: 옛 유도등 빌더 제거됨"
      grep -E "\[floor, loc\]" cha-bio-safety/src/utils/dailyReportCalc.ts || echo "PASS: 옛 비유도등 빌더 제거됨"
      cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
    </automated>
  </verify>
  <done>
- import 추가 (formatFloorLabel)
- 조치완료 블록 ZONE_KO 로컬 정의 제거 + place 빌더 한 줄 통일
- 옛 빌더 패턴 grep 0
- tsc 통과
  </done>
</task>

<task type="auto">
  <name>Task 3: generateExcel.ts PS_LABELS 18 라벨 재작성</name>
  <files>cha-bio-safety/src/utils/generateExcel.ts</files>
  <action>
Edit 도구로 L4-19 의 PS_LABELS 객체 전체를 위 Task 3 interfaces 의 변경 후 블록으로 교체.

old_string (헤더 주석 + 객체 전체, 정확 매치):
```ts
// '소방용 가압송수장치 점검 일지'의 측정점 라벨
const PS_LABELS: Record<string, string> = {
  '9-3':  '8층 계단위 PS실',
  '8-1':  '8층 연구동 공조실', '8-2':  '8층 연구동 PS실',  '8-3':  '8층 사무동 PS실',
  '7-1':  '7층 연구동 공조실', '7-2':  '7층 연구동 PS실',  '7-3':  '7층 사무동 PS실',
  '6-1':  '6층 연구동 공조실', '6-2':  '6층 연구동 PS실',  '6-3':  '6층 사무동 PS실',
  '5-1':  '5층 연구동 공조실', '5-2':  '5층 연구동 PS실',  '5-3':  '5층 사무동 PS실',
  '3-1':  '3층 연구동 공조실', '3-2':  '3층 연구동 PS실',  '3-3':  '3층 사무동 PS실',
  '2-2':  '2층 PS실',          '2-3':  '2층 사무동 PS실',
  '1-1':  '1층 연구동 공조실', '1-2':  '1층 연구동 PS실',  '1-3':  '1층 사무동 PS실',
  '-1-1': 'B1층 공조실',       '-1-2': 'B1층 식당',        '-1-3': 'B1층 화장실',
  '-2-1': 'B2층 공조실',       '-2-2': 'B2층 CPX실',       '-2-3': 'B2층 PS실',
  '-3-2': 'B3층 휀룸1',        '-3-3': 'B3층 기사대기실',
  '-4-1': 'B4층 기계실',       '-4-2': 'B4층 팬룸',        '-4-3': 'B4층 창고',
  '-5-2': 'B5층 휀룸1',        '-5-3': 'B5층 휀룸2',
}
```

new_string:
```ts
// '소방용 가압송수장치 점검 일지'의 측정점 라벨
// 양식: 지상층 = `{zone 한국어} {floor 코드} {위치명}` / 지하층 = `B{N}F {위치명}`
// formatFloorLabel 헬퍼와 동일 룰 (constants/divPoints.ts DIV_POINTS 의 floor/loc 패턴 기준 mirror).
const PS_LABELS: Record<string, string> = {
  '9-3':  '사무동 8-1F 계단위 PS실',
  '8-1':  '연구동 8F 공조실', '8-2':  '연구동 8F PS실',  '8-3':  '사무동 8F PS실',
  '7-1':  '연구동 7F 공조실', '7-2':  '연구동 7F PS실',  '7-3':  '사무동 7F PS실',
  '6-1':  '연구동 6F 공조실', '6-2':  '연구동 6F PS실',  '6-3':  '사무동 6F PS실',
  '5-1':  '연구동 5F 공조실', '5-2':  '연구동 5F PS실',  '5-3':  '사무동 5F PS실',
  '3-1':  '연구동 3F 공조실', '3-2':  '연구동 3F PS실',  '3-3':  '사무동 3F PS실',
  '2-2':  '2F PS실',           '2-3':  '사무동 2F PS실',
  '1-1':  '연구동 1F 공조실', '1-2':  '연구동 1F PS실',  '1-3':  '사무동 1F PS실',
  '-1-1': 'B1F 공조실',        '-1-2': 'B1F 식당',         '-1-3': 'B1F 화장실',
  '-2-1': 'B2F 공조실',        '-2-2': 'B2F CPX실',        '-2-3': 'B2F PS실',
  '-3-2': 'B3F 휀룸1',         '-3-3': 'B3F 기사대기실',
  '-4-1': 'B4F 기계실',        '-4-2': 'B4F 팬룸',         '-4-3': 'B4F 창고',
  '-5-2': 'B5F 휀룸1',         '-5-3': 'B5F 휀룸2',
}
```

verify grep:
- `grep -c "'B[0-9]층 " cha-bio-safety/src/utils/generateExcel.ts` = 0 (옛 'B3층' 형태 모두 제거)
- `grep -c "'B[0-9]F " cha-bio-safety/src/utils/generateExcel.ts` ≥ 14 (지하층 14 entry 새 양식)
- `grep -c "'연구동 [0-9]F\|'사무동 [0-9]F\|'사무동 8-1F" cha-bio-safety/src/utils/generateExcel.ts` ≥ 19 (지상층 새 양식 — 8F·7F·6F·5F·3F·1F 각 3 entry = 18 + 2F 1 entry + 8-1F 1 entry = 약 20)
- `grep -c "'[0-9]층 " cha-bio-safety/src/utils/generateExcel.ts` = 0 (옛 '1층' 형태 모두 제거)
- tsc 통과
  </action>
  <verify>
    <automated>
      grep -c "'B[0-9]층 " cha-bio-safety/src/utils/generateExcel.ts || echo "0"
      grep -c "'B[0-9]F " cha-bio-safety/src/utils/generateExcel.ts
      grep -cE "'(연구동|사무동) [0-9]F" cha-bio-safety/src/utils/generateExcel.ts
      grep -c "'8층 " cha-bio-safety/src/utils/generateExcel.ts || echo "0"
      cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
    </automated>
  </verify>
  <done>
- PS_LABELS 35 entry 모두 새 양식
- 옛 한국어 'N층' / 'BN층' grep 0
- 9-3 = '사무동 8-1F 계단위 PS실' 정확 매핑
- 2-2 = '2F PS실' (zone 없음 케이스)
- tsc 통과
  </done>
</task>

<task type="auto">
  <name>Task 4: LegalPage.tsx 제출용 탭 labelFor 지하층 자동 변환</name>
  <files>cha-bio-safety/src/pages/LegalPage.tsx</files>
  <action>
Edit 도구로 L767-770 의 `labelFor` 함수 교체.

old_string:
```ts
  // 라벨 (DB submissionLabel || prefill)
  const labelFor = (f: LegalFinding): string =>
    f.submissionLabel ?? `${f.location ?? ''} ${f.description}`.trim()
```

new_string:
```ts
  // 라벨 (DB submissionLabel || prefill)
  // prefill 시 location 텍스트가 'B1' ~ 'B5' 로 시작하면 'B1F' ~ 'B5F' 로 자동 변환 (지하층 룰 통일).
  // 지상층 패턴은 zone 정보 부재로 자동 변환 X — 사용자가 finding 만들 때 '연구동/사무동 3F' 형태로 자유 입력.
  const labelFor = (f: LegalFinding): string => {
    if (f.submissionLabel != null) return f.submissionLabel
    const loc = (f.location ?? '').replace(/^(B[1-5])(?![0-9F])/, '$1F')
    return `${loc} ${f.description}`.trim()
  }
```

verify grep:
- `grep -c 'labelFor' cha-bio-safety/src/pages/LegalPage.tsx` ≥ 2 (정의 1 + 호출 1+)
- `grep -cE "replace\\(/\\^\\(B\\[1-5\\]\\)" cha-bio-safety/src/pages/LegalPage.tsx` = 1 (지하층 정규식 변환)
- tsc 통과
- 다른 위치 사용 (`finding.location` 단독 표시 자리, L995 KVRow, L963 zip 파일명) 무손상 — git diff 확인
  </action>
  <verify>
    <automated>
      grep -c 'labelFor' cha-bio-safety/src/pages/LegalPage.tsx
      grep -cE "replace\(/\^\(B\[1-5\]\)" cha-bio-safety/src/pages/LegalPage.tsx
      cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
    </automated>
  </verify>
  <done>
- labelFor 함수 본문 교체
- 지하층 정규식 변환 정확히 적용 (`^(B[1-5])(?![0-9F])` → `$1F`)
- 다른 location 표시 자리 무손상
- tsc 통과
  </done>
</task>

<task type="auto">
  <name>Task 5: 단일 atomic commit (4 파일)</name>
  <files>(아래 4 파일 모두)</files>
  <action>
Task 1~4 모두 적용 후 git status 확인 후 한 commit 으로 묶음.

작업 영역:
- cha-bio-safety/src/utils/formatFloorLabel.ts (NEW)
- cha-bio-safety/src/utils/dailyReportCalc.ts (modified)
- cha-bio-safety/src/utils/generateExcel.ts (modified)
- cha-bio-safety/src/pages/LegalPage.tsx (modified)

commit message:
```
feat(260529-vwc): 일지/Excel/제출용 탭 층 양식 통일 자동 기입

- utils/formatFloorLabel.ts 신규 — 지상층 `연구동/사무동 1F`, 지하층 `B1F` 룰
- dailyReportCalc 조치완료 항목 floor 표시를 헬퍼로 통일 (유도등/비유도등 한 줄)
- generateExcel PS_LABELS 35 entry 모두 새 양식 ('8층 연구동 공조실' → '연구동 8F 공조실')
- LegalPage 제출용 탭 textarea prefill 에 지하층 자동 변환 (B1~B5 → B1F~B5F)
- 지상층 finding location prefill 은 zone 정보 부재로 자동 변환 X (사용자 컨펌)
- '전층' 자연어 seed / DB schema / SchedulePage MEMO / DIV_POINTS 무손상
```

tsc 전체 통과 확인 후 commit.

**중요**:
- 빌드 + wrangler pages deploy 는 executor 안 함 — orchestrator 처리
- 작업 브랜치 production 가정. HEAD 가 production 아니면 STOP + 보고
  </action>
  <verify>
    <automated>
      cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
      git status --short
      git log --oneline -3
    </automated>
  </verify>
  <done>
- 4 파일 변경 단일 commit
- tsc 전체 통과
- commit hash SUMMARY 박제
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 6: 배포 후 사용자 시나리오 검증 (orchestrator deploy 후)</name>
  <what-built>
- Task 1-4 코드 변경
- Task 5 commit
- orchestrator build + wrangler pages deploy --branch=production
  </what-built>
  <how-to-verify>
**A. 일일 업무일지 (DailyReportPage)**
- 오늘 조치 완료된 점검 항목이 있다면 (또는 임의 점검 1건 조치 처리해보고) 자동생성 텍스트의 floor 표시가 새 양식인지 확인
- 지상층 예시: 기존 `1F 사무동 ... 소화기` → 새 양식 `사무동 1F ... 소화기`
- 지하층 예시: 기존 `B3 D-7 기둥 ...` → 새 양식 `B3F D-7 기둥 ...`
- 유도등 예시: 기존 `사무동 1F 복도 천장피난구 유도등` → 새 양식 동일 형태 보존 (헬퍼가 같은 결과 산출)

**B. 업무수행기록표 (WorkLogPage)**
- 다운로드 받아서 Excel 의 측정점 라벨 시트 확인
- 35 entry 모두 새 양식 표시:
  - 연구동 8F 공조실 / 사무동 8F PS실 (지상 zone 분리)
  - B3F 휀룸1 / B5F 휀룸2 (지하 F 접미)
  - 사무동 8-1F 계단위 PS실 (9-3 의 8-1층 보정)
  - 2F PS실 (zone 없는 케이스)

**C. 제출용 탭 textarea prefill (LegalPage)**
- 소방점검관리 → 2열 제출용 탭
- finding 의 location 이 'B3 D-7 기둥' → prefill 텍스트 'B3F D-7 기둥 ...' 로 자동 변환 확인
- finding 의 location 이 '3F 복도' (지상층) → 변환 없음, 그대로 표시
- 이미 'B3F' 인 경우 → 이중 F 안 됨, 그대로 'B3F' 유지

**D. 회귀 없음**
- SchedulePage MEMO ("전층 X 점검", "2층 및 B1층 ...") 그대로 노출
- 일일 업무일지의 INSPECT_FULL_CONTENT seed ("전층 ...") 그대로 노출
- DivPage / FloorPlanPage / InspectionPage 등 다른 페이지 변경 없음
- finding 상세 페이지 위치 표시 (KVRow "위치") 변경 없음 — raw `location` 값 그대로
  </how-to-verify>
  <resume-signal>
검증 통과 시 "approved" 또는 "배포 OK". 이슈 발견 시 시나리오 + 증상 보고. 검증 후 production-sync.md 표 entry 추가 + 상태 '안정' 환원.
  </resume-signal>
</task>

</tasks>

<verification>
1. Task 1-4 grep + tsc 모두 PASS
2. Task 5 단일 commit, 4 파일 변경
3. Task 6 사용자 시나리오 A/B/C/D 통과
4. production-sync.md 표 entry + 안정 환원
</verification>

<success_criteria>
- formatFloorLabel 헬퍼 신규 (B 패턴 + zone prefix 룰)
- dailyReportCalc 조치완료 항목 floor 표시 헬퍼 통일
- generateExcel PS_LABELS 35 entry 모두 새 양식
- LegalPage labelFor 지하층 정규식 변환
- '전층' seed / DB schema / DIV_POINTS / SchedulePage MEMO 무손상
- 직원 도메인 cbc7119.pages.dev 배포 완료
- production-sync entry + 안정 환원
</success_criteria>

<output>
After completion, create `.planning/quick/260529-vwc-floor-format-unify-logs/260529-vwc-SUMMARY.md` containing:
- Task 1 신규 파일 내용
- Task 2 import + 조치완료 블록 diff
- Task 3 PS_LABELS 35 entry diff
- Task 4 labelFor diff + 정규식 설명
- Task 5 commit hash + 4 파일 stat
- tsc / grep 모두 PASS 출력
- 배포 URL (orchestrator)
- production-sync.md 갱신 entry (orchestrator)
</output>
