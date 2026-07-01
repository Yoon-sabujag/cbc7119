---
quick_id: 260702-39r
slug: 260701-pnl-f1-mapalarm-location-f2-usepi
date: 2026-07-02
status: complete
parent_commit: 71f3d6c5
commits:
  - 5dacc1ac  # F1 alarm.ts mapAlarm location
  - 0f564d77  # F2 usePinchZoom double-tap guard
deploy_url: https://aca1e5f2.cbc7119.pages.dev
---

# SUMMARY — 화재수신반 260701-pnl 이관 (3)(4) F1/F2 prod 미러

staging(cbc7119-data) 검증완료 이관문서 4항목의 prod 미러. SSOT: `cbc7119-data/.planning/quick/260701-pnl-panel-alarm-backend/PROD-HANDOFF-audience-and-roster.md`.

## Recon — 스코프 축소 (4항목 → 코드변경 2건)

| 항목 | prod 실측 | 조치 |
|---|---|---|
| (1) getPanelAudienceIds (push.ts) | prod push.ts = staging **byte-identical** (본체 이관 aecaf292 에 이미 포함) | 무변경 (확인만) |
| (2) shift_offset (cha-bio-db) | 0053 완전 일치 — 박보융0/윤종엽1/김병조2/석현민 fixed=day, E2E-PANEL count=0 | 무변경 (SELECT 대조만) |
| (3) F1 mapAlarm location | `mapAlarm()` 리턴 location 누락 present | **패치 → 5dacc1ac** |
| (4) F2 usePinchZoom 더블탭 | `lastTouchAt` 0건 (합성 dblclick 충돌 버그 present) | **패치 → 0f564d77** |

## 적용

- **F1** `functions/_lib/alarm.ts`: `mapAlarm()` 리턴에 `location: LOCATION_LABEL,` 1줄(detectedAt 다음). staging 4a8315e 동일.
- **F2** `src/hooks/usePinchZoom.ts`: lastTouchAt 가드 4 hunk(ref 선언 + onTouchStart/onTouchEnd 시각기록 + onDoubleClick 초입 `Date.now()-lastTouchAt<700` early-return). staging 5cecc14 동일. design 트랙 P2-3 커버.

## 검증 (all PASS)

- 두 파일 `diff` vs staging 수정본 → **byte-identical** (최강 등가 증명).
- grep: alarm.ts `location: LOCATION_LABEL`×2 · `LOCATION_LABEL`×3 / usePinchZoom `lastTouchAt`×4.
- `npx tsc --noEmit` 0 errors.
- `npm run build` 성공 (precache 87 entries, sw.js 생성).

## 배포

- CWD=cha-bio-safety, fresh build → `wrangler pages deploy --project-name=cbc7119 --branch=production` (Functions bundle 업로드 확인).
- ASCII commit-message (한글 UTF8 wrangler 거부 회피).
- **https://aca1e5f2.cbc7119.pages.dev** (production alias = cbc7119.pages.dev).
- 원자 커밋 2개(F1/F2 분리), production 브랜치. `.claude/scheduled_tasks.lock`·이미지 등 무관 파일 미포함(명시 add).

## 준수 룰

- worktree 미사용·production 브랜치 직접 ([[feedback_worktree_isolation_bases_off_main]]).
- 배포는 메인 Claude 직접 (서브에이전트 deploy 금지 룰 준수 — 편집도 inline).
- production-sync.md 는 실해시/URL 확보 후 마감 ([[feedback_sync_note_after_real_hashes]]).

## 잔여 / 후속 (본 배치 제외)

- **P2-1**(sticky alarmAcked→ackedId) · **P2-2**(resolve↔create 오픈타임 스냅샷) — InspectionPage.tsx, design/main 704c9158/f5978ff7. cbc7119-preview 검증·컨펌 후 **별도 재승격** 대상. prod anchor 확인됨: alarmAcked L4848 · LIVE activeAlarm.id L4180 (Tailwind 버전, 의도 기준 재패치).
- **UAT 대기**: staging PWA 온디바이스(F1 라벨·F2 더블탭) + preview(P2-1/2/3) + prod PWA 재설치. dormant라 경보 화면 실발현은 맥 에이전트 배포 후.
