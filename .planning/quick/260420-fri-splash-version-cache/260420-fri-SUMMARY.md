---
phase: 260420-fri-splash-version-cache
plan: 01
status: complete
date: 2026-04-20
---

# Splash Version Check + Conditional Cache Reset

## What Changed

스플래쉬 진입 시 `/version.json` 비교로 버전이 달라졌을 때만 Cache Storage 전체 삭제 + 서비스워커 unregister + `location.reload()`를 실행하도록 변경. 기존 `main.tsx`에서 매번 실행되던 floorplan/workbox-precache 하드코딩 삭제 로직은 제거.

## Commits

- `ea498f9` feat(260420-fri-01): emit dist/version.json and drop legacy cache purge
- `6ab5225` feat(260420-fri-02): gate cache purge behind version mismatch on splash
- `3a0a04b` chore: merge quick task worktree (worktree-agent-a1ca21c0)

## Files Modified

- `cha-bio-safety/vite.config.ts` — 인라인 `emit-version-json` 플러그인 추가 (build 시 `dist/version.json` emit)
- `cha-bio-safety/src/utils/versionCheck.ts` — **NEW** `checkVersionAndRefresh()` 유틸
- `cha-bio-safety/src/pages/SplashScreen.tsx` — `checkVersionAndRefresh()` 호출 + 하단 버전 표기 동적(`__APP_VERSION__`)으로 교체
- `cha-bio-safety/src/main.tsx` — 레거시 하드코딩 `caches.keys()` 삭제 블록 제거

## Design Decisions Honored

- **LOCKED:** 백그라운드 복귀(visibilitychange/pageshow) 체크는 입력 손실 위험으로 미도입
- AbortController 3초 타임아웃 + 최상위 try/catch → 오프라인/느린 네트워크에서도 스플래쉬 블로킹 없음
- 최초 실행 가드(`!stored`) → 신규 설치 사용자 리로드 루프 방지
- `apply: 'build'`로 dev 서버에서는 version.json 미생성(404 → silent fail)
- fire-and-forget `void checkVersionAndRefresh()` → 스플래쉬 1.6s 진행과 독립 실행

## Verification

- `npx vite build` → `dist/version.json` 생성 확인 ({version: "0.2.0", buildTime: KST 타임스탬프})
- `npx tsc --noEmit` → 변경 파일 타입 에러 없음
- `grep`: `main.tsx`에서 `caches.keys` / `floorplan` / `workbox-precache` 제거 확인
- `grep`: `visibilitychange` / `pageshow` 추가 코드 없음

## Deploy Notes

배포 후 확인:
1. 현재 접속자들의 다음 스플래쉬 진입 시 version mismatch → 1회 자동 리로드 발생
2. 이후부터는 package.json version bump 배포 시마다 동일 동작
3. 오프라인 스플래쉬 진입 시 silent fail, 정상 진행

## Build Note

Full `npm run build`는 worktree에서 사전 누락 파일(`src/components/PhotoSourceModal.tsx` — main에서 untracked, 본 task 범위 외)로 block. `npx vite build` 단독 실행 시 성공하여 version.json 생성 검증 완료. 본인 로컬에서 `npm run build` 전 해당 컴포넌트 구현/커밋 필요.
