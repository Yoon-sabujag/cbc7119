---
quick_id: 260704-hzz
title: prod→staging / prod→design 화재수신반 패널 갭 이관 핸드오프 문서 2개
date: 2026-07-04
status: complete
type: docs-only
---

# SUMMARY — Quick 260704-hzz

## 무엇을 했나
화재수신반 패널 작업이 prod 직접 적용되며 벌어진 **staging·design 갭**을 각 콘솔에서 메우도록,
이관 지시서 2개를 이 prod 리포에 작성. **앱/코드 변경 0 — 문서만.**

- `STAGING-HANDOFF.md` — staging(cbc7119-data) 콘솔용. 백엔드/스키마 갭.
- `DESIGN-HANDOFF.md` — design(cbc7119-design) 콘솔용. UI 갭.

## 실측 기준 (분석 세션)
- prod HEAD `a4e89772` / staging 동기점 `0f564d77` / design base `origin/main` `e524b90a`
- `git diff 0f564d77..production` (백엔드 7파일: 마이그 0093·0094 + functions 5)
- `git log origin/main..production` (design 전용 UI 커밋 목록)
- 3-트랙 파일 대조: design 에 `panelEvents.ts`/`PanelEventRow.tsx`/`FireAlarmHistoryPage.tsx` 부재 확인,
  staging 마이그 0092까지·앱 루트 레이아웃 확인

## 갭 확정
| 트랙 | 갭 | 핵심 |
|---|---|---|
| staging | 백엔드/데이터 | 마이그 `0093_panel_alarms_fault`+`0094_panel_alarms_location` + `functions/_lib/{alarm,push}.ts` + `functions/api/alarm/{trigger,clear,renotify}.ts` |
| design | UI | 신규 `panelEvents.ts`/`PanelEventRow.tsx`/`FireAlarmHistoryPage.tsx` + `InspectionPage/DashboardPage/FireAlarmPage/App/api/LivePanelImage` 변경 |

## 각 문서의 핵심 지시
- **staging**: 마이그 2개 prod 에서 `cp` → `cha-bio-db-staging` 적용 / 백엔드 5파일 `git apply -p2`
  (fast) 또는 수기 fallback / `cbc7119-data` 배포 + fault 트리거 API 검증. 레이아웃 = 앱 루트.
- **design**: 승인 시안(001/002) 재사용 or cherry-pick(함정: front+back 번들·base 마이그 부재·미러중복·
  Tailwind vs 인라인 형상차) / `main` push → `cbc7119-preview` 자동 / **wrangler 금지**.

## 격리 준수
문서는 prod 리포에만. 각 콘솔은 절대경로로 읽음. prod 콘솔에서 staging/design 직접 조작 안 함.

## 후속 (사용자)
- 각 콘솔 새 세션에 해당 핸드오프 붙여넣고 진행.
- 별개 부채: staging `events.ts` 720h 캡 해제(원래 staging-first 항목), b5v 반쪽윈도우 — 다음 staging 작업 때.
