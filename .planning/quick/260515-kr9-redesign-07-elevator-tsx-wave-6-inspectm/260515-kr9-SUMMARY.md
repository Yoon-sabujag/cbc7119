---
quick_id: 260515-kr9
slug: redesign-07-elevator-tsx-wave-6-inspectm
status: complete
date: 2026-05-15
commit: 87cacf1
tags: [cleanup, dead-code, elevator-page, wave-6]
files_modified:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
---

# Quick Task 260515-kr9: Wave 6 — InspectModal Dead Code Cleanup + primaryBtnSt 제거

**One-liner:** ElevatorPage.tsx 에서 사용자 진입점 0건인 InspectModal 함수·JSX 분기·submitInspect mutation·'inspect_new' Modal 타입 멤버·primaryBtnSt 글로벌 상수 5개 항목 제거 (-131줄).

## What Changed

`cha-bio-safety/src/pages/ElevatorPage.tsx` 에서 dead code 5개 항목 제거:

| 항목 | 위치 (변환 전) | 제거 줄 수 |
|------|--------------|-----------|
| `'inspect_new'` Modal type union 멤버 | line 95 | 1 (인라인) |
| `submitInspect` useMutation 정의 블록 | line 483~509 | 27 |
| `<InspectModal>` JSX 렌더 분기 | line 1670 | 1 |
| `function InspectModal(...)` 정의 전체 | line 2365~2460 + 헤더 주석 | ~100 |
| `const primaryBtnSt` 글로벌 상수 정의 | line 2895~2899 | 5 |

**라인 수 변화:** 3421 → 3290 (-131줄)

**ElevatorPage 번들 크기:** 100.29 kB → 95.82 kB (-4.47 kB, gzip 24.41→23.32 kB)

## Why

- `project_elevator_page_tabs.md` 메모리 권위: InspectModal 은 사용자 입력 진입점 0건 dead code (`setModal('inspect_new')` 호출 0건 확인됨)
- 2C SUMMARY (260515-g61) 권위: InspectModal 시안 사후 검증 → dead code 정정 마킹
- Wave 4 (260515-jp3) RepairNewModal 변환 시 `primaryBtnSt` 를 `bg-accent` inline으로 교체 완료 → ElevatorPage 내 사용처 InspectModal 외 0건
- Wave 1~5 (3mc/ia6/iz1/jp3/k5p) 변환 완료 후 마지막 cleanup

## Preserved

- `const inputSt: React.CSSProperties` 글로벌 상수 정의 보존 (RepairListSection 3건 사용 중)
- Modal type union 다른 4 멤버 보존: `fault_new` / `fault_resolve` / `repair_new` / `ev_detail`
- Wave 1~5 변환 결과 전체 보존 (list탭/TYPE_ICON_COMPONENT/EvSelector/EsBtn/EsNodeMap/Fault 3모달/RepairNewModal/EvDetailModal)
- ModalWrap / Field / MultiPhotoUpload / CertViewerModal / RepairListSection / ElevatorInfoCard 보존
- icons.tsx / tailwind.config.js / 다른 컴포넌트 / 다른 페이지 파일 수정 0건
- 비즈니스 로직 변경 0건 — dead code 제거만 (시각적 변경 0건)

## Verification

### Grep Gates

```
1. function InspectModal: 0 (expect 0)  -- PASS
2. 'inspect_new':          0 (expect 0)  -- PASS
3. submitInspect:          0 (expect 0)  -- PASS
4. primaryBtnSt:           0 (expect 0)  -- PASS
5. inputSt:                4 (expect >=3) -- PASS (정의 1 + RepairListSection 3)
6. Modal union (fault_new|fault_resolve|repair_new|ev_detail): 존재 확인 -- PASS
7. 보존 sentinel functions: 12 (EvDetailModal/EvSelector/FaultNewModal/FaultNewFullscreen/FaultResolveModal/RepairNewModal/EsBtn/EsNodeMap/ModalWrap/Field/RepairListSection/ElevatorInfoCard) -- PASS
```

### Build

```
npm run build PASS
ElevatorPage-B19PQb4z.js  95.82 kB (gzip: 23.32 kB)
tsc 0 errors -- PASS
```

### Git

```
git diff --stat: 1 insertion(+), 132 deletions(-)
git status: ElevatorPage.tsx 만 변경 (다른 파일 0건)
```

## Out of Scope

- `inputSt` 글로벌 상수 → RepairListSection 변환 시 인라인 교체 (별도 wave)
- 다른 잠재 dead code → 별도 wave

## Visual Impact

0건 — InspectModal 은 사용자 진입점 0건인 dead code 였으므로 사용자가 보는 화면 변경 없음

## Next

redesign/07-elevator TSX 변환 시리즈 Wave 6 = 마지막. main 머지 후 다음 페이지 재디자인으로.

---

## Self-Check

### Grep gate results (from commit 87cacf1)

1. `grep -c "function InspectModal" cha-bio-safety/src/pages/ElevatorPage.tsx` → **0** (목표: 0) PASS
2. `grep -c "'inspect_new'" cha-bio-safety/src/pages/ElevatorPage.tsx` → **0** (목표: 0) PASS
3. `grep -c "submitInspect" cha-bio-safety/src/pages/ElevatorPage.tsx` → **0** (목표: 0) PASS
4. `grep -c "primaryBtnSt" cha-bio-safety/src/pages/ElevatorPage.tsx` → **0** (목표: 0) PASS
5. `grep -c "inputSt" cha-bio-safety/src/pages/ElevatorPage.tsx` → **4** (목표: >=3) PASS
6. Modal union members `fault_new|fault_resolve|repair_new|ev_detail`: `type Modal = null | 'fault_new' | 'fault_resolve' | 'repair_new' | 'ev_detail'` 확인 PASS
7. Sentinel function count: 12 (모두 존재) PASS
8. Line count: 3421 → 3290 (-131줄) PASS
9. npm run build: ElevatorPage-B19PQb4z.js 95.82 kB PASS

## Self-Check: PASSED
