---
quick_id: 260515-jp3
slug: redesign-07-elevator-tsx-wave-4-repairne
status: complete
date: 2026-05-15
commit: 4d9e26a
phase: quick
plan: 260515-jp3
subsystem: elevator-redesign
tags:
  - redesign
  - elevator
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - repairnewmodal
  - wave4
dependency_graph:
  requires:
    - 260515-iz1 (Wave 3 — FaultNewModal/FaultNewFullscreen/FaultResolveModal)
    - 260515-ia6 (Wave 2 — EvSelector/EsBtn/EsNodeMap)
  provides:
    - RepairNewModal v0.1.1 Tailwind 변환 완료
  affects:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
tech_stack:
  added: []
  patterns:
    - warning 토큰 (bg-warning-bg/text-warning/outline-warning) for selected state
    - accent 단색 CTA (bg-accent/hover:bg-accent-hover) — no gradient
    - text-label (13px) replacing 11px inline fontSize
key_files:
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx (RepairNewModal, lines 3082~3236)
decisions:
  - "CTA edit 모드 라벨: '수리 기록 저장' → '수정 완료' (시안 권위 — 헤더 '수리 기록 수정'과 일관)"
  - "수리 대상/홀 층 칩 선택색: #eab308 직접색 → warning 토큰 (2C 시안 결정 권위 60515-g61)"
  - "11px 폰트 → text-label (13px) — 노안 룰 준수"
metrics:
  duration: "~5 min"
  completed: 2026-05-15
  tasks_completed: 2
  files_modified: 1
---

# Phase quick Plan 260515-jp3: RepairNewModal v0.1.1 Tailwind 변환 Summary

RepairNewModal 함수 본체(ElevatorPage.tsx 3082~3236줄)를 v0.1.1 디자인 토큰 + Tailwind utility 전용으로 변환. 수리 대상/홀 층 칩 = warning 토큰, CTA = accent 단색, 11px 폰트 제거, 비즈니스 로직 100% 보존.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | RepairNewModal TSX 변환 + grep gate 검증 | 4d9e26a | cha-bio-safety/src/pages/ElevatorPage.tsx |
| 2 | 회귀 검증 (grep gate + sentinel + build) | — (Task 1에 통합) | — |

## 변환 전/후 라인 범위

| 항목 | 값 |
|------|-----|
| RepairNewModal 시작 | line 3082 |
| RepairNewModal 종료 | line 3236 |
| 변환 영역 라인 수 | 155줄 |
| ElevatorPage.tsx 전체 (이전) | 3345줄 |
| ElevatorPage.tsx 전체 (이후) | 3356줄 |
| 증감 | +11줄 (멀티라인 버튼 요소 전개) |

## 2C 시안 권위 매핑 표

| UI 요소 | 변환 전 | 변환 후 |
|---------|---------|---------|
| 수리 대상 버튼 (선택) | `background: '#eab30822'`, `color: '#eab308'`, `outline: '2px solid #eab308'` | `bg-warning-bg text-warning outline outline-2 outline-warning outline-offset-1` |
| 수리 대상 버튼 (비선택) | `background: 'var(--bg3)'`, `color: 'var(--t3)'` | `bg-surface-sunken text-text-tertiary` |
| 홀 층 칩 (선택) | `background: '#eab30822'`, `color: '#eab308'`, `outline: '2px solid #eab308'` | `bg-warning-bg text-warning outline outline-2 outline-warning outline-offset-1` |
| 홀 층 칩 (비선택) | `background: 'var(--bg3)'`, `color: 'var(--t3)'` | `bg-surface-sunken text-text-tertiary` |
| CTA 저장 버튼 | `...primaryBtnSt, opacity:` | `bg-accent hover:bg-accent-hover text-white` + `style={{ opacity }}` 화이트리스트 |
| date input | `style={inputSt}` | `bg-surface-sunken border border-border-default rounded-md text-body-sm ...` |
| text input | `style={inputSt}` | 동일 패턴 + `placeholder:text-text-tertiary` |
| textarea | `style={{ ...inputSt, resize:'none' }}` | 동일 패턴 + `resize-none font-[inherit]` |
| 섹션 라벨 | `fontSize:11, color:'var(--t2)'` | `text-label font-bold text-text-secondary` (13px) |
| 본문 wrapper | `style={{ display:'flex', flexDirection:'column', gap:14 }}` | `className="flex flex-col gap-[14px]"` |

## grep gate 결과 표

| 검사 항목 | 기대 | 실제 | 결과 |
|----------|------|------|------|
| 인라인 style={{ 개수 | 1 (opacity 화이트리스트) | 1 | PASS |
| style={{ 내용 | opacity: canSubmit ? 1 : 0.5 | `style={{ opacity: canSubmit ? 1 : 0.5 }}` | PASS |
| #eab308 직접색 | 0 | 0 | PASS |
| inputSt/primaryBtnSt 사용 | 0 | 0 | PASS |
| 9-11px 폰트 | 0 | 0 | PASS |
| 이모지 | 0 | 0 | PASS |
| bg-warning-bg | ≥2 | 2 | PASS |
| outline-warning | ≥2 | 2 | PASS |
| bg-accent | ≥1 | 1 | PASS |
| linear-gradient | 0 | 0 | PASS |
| 옛 토큰 var(--xxx) | 0 | 0 | PASS |

## 비즈니스 로직 보존 sentinel

| 검사 항목 | 기대 | 실제 | 결과 |
|----------|------|------|------|
| useState 개수 | 13 | 13 | PASS |
| elevatorRepairApi.create/update | 2 | 2 | PASS |
| qc.invalidateQueries 2종 | 2 | 2 | PASS |
| useEffect | 1 | 1 | PASS |
| canSubmit = | 1 | 1 | PASS |
| toast 호출 라인 | 2 라인 (각 ternary로 2메시지) | 2 | PASS |
| EV_GROUPS_ANNUAL | 1 | 1 | PASS |
| ES_NODES_ANNUAL | 1 | 1 | PASS |
| MultiPhotoUpload | 4 | 4 | PASS |
| 4단계 사진 라벨 | 4 | 4 | PASS |

## 보존 영역 sentinel

| 검사 항목 | 기대 | 실제 | 결과 |
|----------|------|------|------|
| primaryBtnSt/inputSt 전역 본체 | 2 | 2 | PASS |
| FaultNewModal/FaultNewFullscreen/FaultResolveModal | 3 | 3 | PASS |
| InspectModal/EvDetailModal/ModalWrap/Field/MultiPhotoUpload/EvSelector | 6 | 6 | PASS |
| RepairNewModal 호출 사이트 | 4 | 4 | PASS |
| git status 변경 파일 | 1 (ElevatorPage.tsx) | 1 | PASS |

## edit 모드 라벨 정정 결정 근거

- **변환 전**: CTA 라벨이 edit 모드에서도 "수리 기록 저장" 출력 (코드: `saving ? '저장 중...' : '수리 기록 저장'`)
- **변환 후**: `saving ? '저장 중...' : (isEdit ? '수정 완료' : '수리 기록 저장')`
- **근거**: 헤더가 이미 `isEdit ? "수리 기록 수정" : "수리 기록 입력"` 분기 적용 중. CTA도 동일한 맥락 일관성 필요. 2C 시안 권위(시안 HTML의 "수정 완료" 표기)가 권위 있는 정정 근거.

## npm run build 결과

- TypeScript 오류: 0건
- 빌드 성공 (built in 14.35s)
- ElevatorPage chunk 생성 확인됨

## Deviations from Plan

None — plan executed exactly as written. Edit-mode CTA label fix ("수정 완료") was specified in the plan's Task 1 action as a 시안 권위 정정.

## Known Stubs

None.

## Self-Check: PASSED

- [x] `cha-bio-safety/src/pages/ElevatorPage.tsx` 존재 및 수정됨
- [x] commit 4d9e26a 존재
- [x] 모든 grep gate PASS
- [x] 모든 비즈니스 로직 sentinel PASS
- [x] 보존 영역 sentinel PASS
- [x] npm run build 성공
