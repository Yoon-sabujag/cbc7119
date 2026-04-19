---
phase: 260420-c5s
plan: 01
subsystem: DIV Pressure Page
tags: [frontend, react, tabs, div, comp_drain]
requires:
  - cha-bio-safety/functions/api/div/logs.ts (TABLE_MAP['comp_drain'] = 'comp_drain_log', 기존)
  - migration 0059_compressor.sql (comp_drain_log 테이블, 기존)
provides:
  - cha-bio-safety/src/pages/DivPage.tsx (4-tab DIV page with 탱크배수주기 tab)
affects:
  - DIV 압력 관리 페이지 UI (탭 3개 → 4개)
tech-stack:
  added: []
  patterns:
    - "drain useQuery + useMemo 패턴을 comp_drain에 대칭 복제"
    - "renderLogTab 분기 확장 (3항 → 4항 삼항 체인)"
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DivPage.tsx
decisions:
  - "갈색 hex는 #8b4513 (saddle brown) 선택 — amber-800(#92400e)은 오일 #f97316과 색상 거리 너무 가까움, saddle brown은 하늘색/주황과 명확히 구별되고 '탱크 녹물/고동' 이미지와 매칭"
  - "탭 순서를 '압력 트렌드 → 챔버배수주기 → 탱크배수주기 → 오일 주기'로 — 배수 계열(챔버/탱크)을 인접 배치하여 사용자 멘탈 모델 정렬"
  - "백엔드/DB 수정 없음 — logs.ts의 TABLE_MAP에 이미 comp_drain 엔트리 존재, migration 0059로 comp_drain_log 테이블 이미 배포됨"
metrics:
  duration: ~15m
  completed: 2026-04-20
---

# Quick Task 260420-c5s: DIV 탱크배수주기 탭 추가 Summary

## One-liner

DIV 압력 관리 페이지에 `comp_drain_log` 데이터를 보여주는 '탱크배수주기' 탭 추가 + 기존 '배수 주기' 탭을 '챔버배수주기'로 리네이밍.

## 변경 내역 (8개 편집 포인트)

| # | 위치 (대략 라인) | 변경 내용 |
|---|-------------------|-----------|
| 1 | L2-6 (doc comment) | 탭 3개 설명 → 탭 4개 설명으로 업데이트 |
| 2 | L83 (fetchLogs 시그니처) | `type: 'drain' \| 'compressor'` → `...\| 'comp_drain'` 추가 |
| 3 | L156 (Tab 유니온) | `Tab` 타입에 `'comp_drain'` 추가 |
| 4 | L193-197 (useQuery) | `compDrainLogs` useQuery 블록 신규 추가 (`enabled: tab === 'comp_drain'`) |
| 5 | L229-237 (useMemo) | `compDrainDateMap` useMemo 신규 추가 (drain 패턴 복제, `drained_at` 컬럼 사용) |
| 6 | L350-352 (renderLogTab) | 시그니처에 `'comp_drain'` 추가 + dateMap/color 삼항 확장 |
| 7 | L548-553 (탭 버튼 배열) | `드레인 주기` 라벨 `챔버배수주기`로 변경 + `탱크배수주기` 엔트리 삽입 |
| 8 | L569-574 (렌더 dispatch) | `{tab === 'comp_drain' && renderLogTab('comp_drain')}` 라인 추가 |

## 선택된 색상

**탱크배수주기 막대 색상: `#8b4513` (saddle brown)**

근거:
- 기존 챔버배수 하늘색 `#38bdf8`과 HSL 거리 충분 (채도/명도 모두 반대 스펙트럼)
- 기존 오일 주황색 `#f97316`과도 명도 차 확보 (#8b4513은 명도 ~30% vs #f97316 ~55%)
- 대안 amber-800 (#92400e)은 주황과 너무 가까워 기각
- 'tank' 이미지(녹슨 압력탱크, 고동색 강철)와 시맨틱 매칭

## 공용 패턴 재사용

- `IntervalBar` 컴포넌트는 그대로 재사용 (color prop만 `#8b4513` 전달)
- `FLOOR_GROUPS` 층별 3열 그리드 레이아웃 재사용
- `drained_at` 컬럼명이 `div_drain_log`와 `comp_drain_log`에서 동일하므로 dateMap 빌더 구조 완전 대칭

## Deviations from Plan

None — 플랜 8개 편집 포인트를 명세된 그대로 실행. 추가 버그/누락 사항 발견 없음.

## Verification

### Automated (완료)

```
cd cha-bio-safety && npx tsc --noEmit -p tsconfig.json
→ DivPage 관련 타입 에러 0건 (전체 빌드도 clean)
```

### Manual Smoke Test (사용자가 `wrangler deploy --branch production` 후 수행)

- [ ] DIV 압력 관리 페이지 진입 시 헤더 아래 탭이 **4개** 표시됨: `압력 트렌드` · `챔버배수주기` · `탱크배수주기` · `오일 주기`
- [ ] '챔버배수주기' 탭 선택 → 기존 배수 주기와 동일한 하늘색 `#38bdf8` 막대그래프 표시 (데이터 동일)
- [ ] '탱크배수주기' 탭을 처음 클릭 시 네트워크 탭에서 `GET /api/div/logs?type=comp_drain` 요청 1회 확인
- [ ] '탱크배수주기' 탭에서 층별 3열 그리드에 갈색 `#8b4513` 막대그래프 표시 (데이터 없는 DIV는 "기록 없음" 플레이스홀더)
- [ ] '오일 주기' 탭이 기존과 동일하게 주황색 `#f97316`으로 작동 (회귀 없음)
- [ ] '압력 트렌드' 탭 및 DIV 상세 바텀시트 동작 회귀 없음

## Commit

| Commit | Description |
|--------|-------------|
| `e4995aa` | feat: DIV 페이지에 탱크배수주기 탭 추가, 배수 주기를 챔버배수주기로 변경 |

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/pages/DivPage.tsx (commit diff: 27 insertions, 9 deletions)
- FOUND: commit e4995aa
- FOUND: Tab 유니온에 'comp_drain' 포함
- FOUND: #8b4513 리터럴 in renderLogTab
- FOUND: tsc --noEmit 0 errors
