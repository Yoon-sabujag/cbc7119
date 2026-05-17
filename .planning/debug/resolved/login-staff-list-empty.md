---
slug: login-staff-list-empty
status: root_cause_found
trigger: 로그인 페이지 담당자 선택 영역에 직원 목록이 안 뜸 (방금 발견, 운영 PWA 영향)
created: 2026-05-18
updated: 2026-05-18
priority: HIGH
---

# Debug Session: login-staff-list-empty

## Symptoms

- **Expected:** LoginPage 의 "담당자 선택" 영역에 active=1 staff 4명 (방재팀) 카드 노출
- **Actual:** 카드 0개, 빈 영역
- **Error messages:** 미확인 (사용자 콘솔 로그 못 봄). LoginPage:43 `.then(r => r.json())` 가 HTML 응답에서 silent fail → setStaffList 호출 안 됨
- **Timeline:** 어제 (2026-05-17) 23~01 KST 사이 production 배포 직후로 추정
- **Reproduction:** https://cbc7119.pages.dev 접속 → 로그인 페이지 → 담당자 선택 영역 (빈 영역)
- **Platform:** 설치된 PWA + 모든 브라우저 (서버 사이드 문제)
- **Build:** `cd cha-bio-safety && npm run build` PASS — 코드 정상

## 환경 컨텍스트

- 어제 (2026-05-17) debug session multiday-schedule-missing 의 agent 가 `wrangler pages deploy --branch=production` 실행
- main 브랜치 = 893497e (09-extinguishers 재머지 포함), origin/main 동기화됨
- 활성 production deploy = `9edb3597-6008-415f-80b0-175f6efd08fe` (source: aaf75bd, 1시간 전)
- 직전 production deploy = `431bf7cf-7a76-4846-a451-1963a78dd103` (source: f7204d1, 1시간 전)
- 운영 cbc7119 (직원) 은 wrangler 수동 배포만 반영
- 디자인 cbc7119-preview 는 GitHub auto-deploy (정상 작동 확인됨)

## Files in scope

- `cha-bio-safety/src/pages/LoginPage.tsx:43` — `fetch('/api/public/staff-list')` (정상)
- `cha-bio-safety/functions/api/public/staff-list.ts` — D1 staff 쿼리 (정상)
- `cha-bio-safety/functions/_middleware.ts` — PUBLIC_PREFIX 에 `/api/public/` 포함됨 (정상)
- `cha-bio-safety/wrangler.toml` — `pages_build_output_dir = "dist"` (정상)
- `cha-bio-safety/dist/_routes.json` — `{"include": ["/api/*"]}` (정상)

## Current Focus

- **hypothesis 확정:** Pages Functions 가 production deploy 에 번들되지 않음. 코드/D1/middleware 모두 무결.
- **specialist_hint:** cloudflare-pages-deploy

## Evidence

- timestamp: 2026-05-18 / endpoint: `https://cbc7119.pages.dev/api/public/staff-list` / finding: HTTP 200, content-type **text/html**, body = SPA `index.html` (functions 실행 안 됨)
- timestamp: 2026-05-18 / endpoint: `https://cbc7119.pages.dev/api/health` / finding: HTTP 200, content-type text/html (동일 증상 — 모든 `/api/*` 에 영향)
- timestamp: 2026-05-18 / endpoint: `https://cbc7119.pages.dev/api/auth/login` OPTIONS / finding: HTTP **405** (no allow-methods header) — middleware 의 OPTIONS handler 가 실행 안 됨. SPA static handler 가 잡음.
- timestamp: 2026-05-18 / endpoint: `https://cbc7119-preview.pages.dev/api/public/staff-list` / finding: HTTP 200, **application/json**, `{"success":true,"data":[4 staff]}` — 동일 소스 코드를 GitHub 으로 빌드한 preview 프로젝트는 정상. D1/middleware/staff 데이터 모두 OK 증명.
- timestamp: 2026-05-18 / endpoint: `https://cbc7119-preview.pages.dev/api/health` / finding: HTTP 200, application/json, `{"status":"healthy","services":{"database":"ok","storage":"ok"}}` — D1, R2 binding 정상.
- timestamp: 2026-05-18 / file: cha-bio-safety/wrangler.toml / finding: `pages_build_output_dir = "dist"` — functions/ 는 dist sibling. `wrangler pages deploy dist` 시 자동 픽업되어야 함.
- timestamp: 2026-05-18 / version.json: cbc7119 apex = `00:20` (직전 deploy 와 일치), cbc7119-preview apex = `02:06` (방금 GitHub 빌드)
- timestamp: 2026-05-18 / fact: 활성 production deploy 가 정적 자산만 포함 (functions bundle 누락). 어제 agent 의 `wrangler pages deploy dist` 호출이 functions 디렉토리를 같이 업로드하지 않음.

## Eliminated

- **로컬 코드 regression** → npm run build PASS, LoginPage / staff-list.ts 어제부터 변경 0건
- **D1 staff 데이터 손상** → preview 도메인에서 4명 staff 정상 응답 (`{"success":true,"data":[4 staff]}`)
- **middleware public-routes 누락** → `_middleware.ts:27` 에 `/api/public/` 포함, preview 도메인 정상 작동
- **Cloudflare Access 차단** → apex `cbc7119.pages.dev` 는 Access 없음 (deploy hash URL 만 Access 적용)
- **PWA SW 캐시** → 캐시 무시 (`?bust=ts`) 해도 HTML 반환, 서버 사이드 문제 확정

## Root Cause

활성 production deploy `9edb3597` (source: aaf75bd) 에 Pages Functions 번들이 **누락됨**. 어제 agent 가 실행한 `npx wrangler pages deploy dist --branch=production` 가 정적 자산만 업로드하고 `functions/` 디렉토리를 같이 업로드하지 않은 것으로 보임. 결과로 `/api/*` 요청이 SPA `index.html` 로 폴백되어 모든 백엔드 API 가 응답 없음 (LoginPage 의 staff-list 도 그 한 케이스).

## Fix

`cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cbc7119 --branch=production --commit-message="redeploy with functions"` — wrangler 가 dist sibling 의 functions/ 를 같이 번들하도록 정확히 동일 명령 재실행. 빌드는 이미 dist/ 에 최신 상태 (01:57).

대안: `--project-name` 명시 + `--commit-dirty=true` 추가 (working tree 가 untracked debug file 외엔 clean)

## Verification

배포 후:
1. `curl https://cbc7119.pages.dev/api/health` → 200 application/json `{"status":"healthy",...}` 기대
2. `curl https://cbc7119.pages.dev/api/public/staff-list` → 200 application/json 4 staff 기대
3. PWA 강제 종료/재실행 + LoginPage 에서 4명 카드 노출 확인 (방재팀 사용자)
4. version.json buildTime = `2026-05-18 01:57` (방금 빌드)

## Files Changed

(코드 수정 없음 — 단순 재배포)
