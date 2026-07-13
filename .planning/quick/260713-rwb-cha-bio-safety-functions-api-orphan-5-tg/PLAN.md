---
quick_id: 260713-rwb
slug: cha-bio-safety-functions-api-orphan-5-tg
date: 2026-07-13
branch: production
---

# 미커밋 orphan 핸들러 5개 백업 후 삭제

## 배경

맥미니 → 맥북 개발환경 이관(260713) 직후 점검 중, `cha-bio-safety/functions/api/` 아래에서
git 전체(모든 브랜치·모든 이력)에 **한 번도 존재한 적 없는** 파일 5개를 발견.

| 파일 | 수정일 | export |
|---|---|---|
| `functions/api/inspections/[sessionId]/photo.ts` | 3/30 | onRequestPut |
| `functions/api/inspections/records/[recordId]/index.ts` | 4/7 | onRequestDelete |
| `functions/api/elevators/[elevatorId]/inspections/[inspectionId]/cert.ts` | 4/5 | onRequestPut |
| `.../[inspectionId]/findings/index.ts` | 4/5 | onRequestGet, onRequestPost |
| `.../[inspectionId]/findings/[fid]/resolve.ts` | 4/5 | onRequestPost |

전부 맥미니로 개발을 옮기기 **전** 옛 맥북 시절(3~4월) 파일. 그동안 맥미니는 git clone
기준이었으므로 이 파일들 없이 prod 를 배포·운영해 왔음.

## 삭제 근거 (dead code 판정)

- **git 부재**: `git ls-tree` 전 ref 스캔 → 5개 모두 어떤 브랜치에도 없음. `.gitignore` 무관
  (`git check-ignore` 음성) — 애초에 커밋된 적 없는 파일.
- **호출부도 dead**:
  - `saveSessionPhoto` (`src/utils/api.ts:341`) — 래퍼 정의만 있고 호출부 0건.
  - `convertToPass` (`src/pages/ElevatorPage.tsx:2586`) — `useMutation` 선언만 있고 `.mutate()` 0건.
  - 승강기 findings 계열은 deprecated `ElevatorFindingDetailPage` 소속 (진입점 제거됨, 96b9588).
- 따라서 삭제해도 prod 동작 변화 없음.

## 방치 시 위험

배포는 디스크의 `functions/` 를 통째로 번들함. 이 콘솔에서 배포하면
`records/[recordId]/index.ts` 가 정식 `records/[recordId].ts` 와 **같은 라우트
(`DELETE /api/inspections/records/:recordId`) 를 중복 정의** → 어느 핸들러가 이길지 비결정적.

## 작업

1. 리포 **바깥**에 tgz 백업: `~/Documents/archive/orphan-handlers-260713.tgz`
2. 파일 5개 개별 `rm` + 빈 디렉토리만 `rmdir` (tracked 형제 파일 보존)
3. 검증: tracked 변경 0건 / `functions/` untracked 0건 / 형제 4개 생존

## 범위 밖 (그대로 둠)

프론트 dead code (`api.ts` 의 `saveSessionPhoto`, `ElevatorPage` 의 `convertToPass`) 는
git tracked 코드이므로 이번 작업에서 건드리지 않음. 별도 정리 후보.
