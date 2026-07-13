---
quick_id: 260713-rwb
status: complete
date: 2026-07-13
branch: production
---

# SUMMARY — orphan 핸들러 5개 백업 후 삭제

## 결과

완료. `cha-bio-safety/functions/` 의 untracked 파일이 0건이 되어, 이 콘솔에서 배포해도
옛 맥북 잔재가 번들에 실릴 위험이 사라짐.

## 실행 내역

1. **백업** — `~/Documents/archive/orphan-handlers-260713.tgz` (5 파일, 4.0K)
   `tar -tzf` 로 5개 전부 포함 검증 완료. 리포 바깥이라 배포 번들과 무관.
2. **삭제** — 파일 5개 개별 `rm`. `rm -rf` 대신 `rmdir` 로 빈 디렉토리만 정리
   (비어있지 않으면 실패하는 안전장치).
3. **검증**
   - tracked 형제 파일 4개 생존: `[sessionId]/records.ts`, `records/[recordId].ts`,
     `records/[recordId]/resolve.ts`, `records/[recordId]/unresolve.ts`
   - `git status` — `functions/` 관련 tracked 변경 0건
   - `functions/` untracked 파일 0건

## 판정 근거 요약

git 전 ref 스캔에서 5개 모두 부재 + 호출부(`saveSessionPhoto`, `convertToPass`) 모두
미연결 dead code → prod 동작 영향 0. 상세는 PLAN.md.

## 주의 — 진단 중 얻은 교훈

**`/api/*` 401 응답은 라우트 존재 증거가 아님.** `functions/_middleware.ts` 가 leaf 핸들러
유무와 무관하게 먼저 401 을 반환하므로, "없는 라우트면 SPA fallback HTML" 판별법은
functions 번들이 통째로 누락된 경우에만 유효함. 개별 핸들러 생존 확인에는 못 씀.

## 범위 밖 (후속 후보)

- 프론트 dead code 정리: `src/utils/api.ts` 의 `saveSessionPhoto`, `src/pages/ElevatorPage.tsx`
  의 `convertToPass` (둘 다 tracked, 호출부 없음)
- 이관 잔여: Cloudflare 로그인 미완료 (`npx wrangler login`) — 배포 전 필수
