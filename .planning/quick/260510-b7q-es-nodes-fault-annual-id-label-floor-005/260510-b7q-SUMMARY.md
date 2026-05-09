---
quick_id: 260510-b7q
type: quick
status: complete
completed: 2026-05-09
---

# Quick 260510-b7q: 에스컬레이터 호기 매핑 수정 — 요약

## 변경 사항

**`cha-bio-safety/src/pages/ElevatorPage.tsx` (lines 153-173)**

`ES_NODES_FAULT` 와 `ES_NODES_ANNUAL` 의 ID·라벨·층 배치를 0056 마이그레이션의 물리 배치(service_range)와 일치시킴. 04-07 swap 커밋(`004dfbe`) 이후 라벨만 갱신되고 floor↔ID 매핑이 방치돼 발생한 모순 해소.

### 새 매핑 (사용자 승인: Q1=물리 배치 우선, Q2=1·2호기 제외)

| 층 구간       | ID 페어        | 내부 호기 | 비고                          |
|---------------|----------------|-----------|-------------------------------|
| 3층 ↔ 2층    | ES-03 / ES-04 | 5,6호기   | 5.4m, 35°                    |
| 2층 ↔ B1층   | ES-01 / ES-02 | 3,4호기   | 8.4m, 30° (가장 큰 에스컬레이터) |
| B1층 ↔ M층   | ES-05 / ES-06 | 1,2호기   | 1.92m, 35° (검사성적서 보유)    |

**고장 모달 (`ES_NODES_FAULT`, 4대)**: 1·2호기(B1↔M) 제외 → 표시 `5,6,3,4`
**수리 모달 (`ES_NODES_ANNUAL`, 6대)**: 전체 → 표시 `5,6,3,4,1,2`

## 검증

- Vite 프로덕션 빌드 성공
- 번들 grep 으로 새 매핑 확인 (`dist/assets/ElevatorPage-*.js`):
  - FAULT 4쌍: ES-03/5, ES-04/6, ES-01/3, ES-02/4
  - ANNUAL 6쌍: + ES-05/1, ES-06/2
- Cloudflare Pages production 배포 완료 (cbc7119, --branch production)

## 커밋

- `050baf0` fix(quick-260510-b7q): 에스컬레이터 호기 매핑 0056 물리배치에 정렬

## 후속

PWA 캐시 때문에 사용자 단말에는 즉시 반영되지 않을 수 있음. 5월 법정점검 전에 방재팀 4인 단말 PWA 재설치 또는 강제 새로고침 필요.
