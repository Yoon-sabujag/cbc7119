# Phase 24 Plan 06 — Deploy Log

**Deployed at:** 2026-04-30 08:26 KST
**Version:** 0.2.0 → 0.2.1
**Git commit:** `5ceb702` (pre-deploy HEAD; deploy itself adds no source commit)
**Wrangler deployment URL:** https://2b5c0059.cbc7119.pages.dev
**Branch:** production

## Build output (vite + tsc)

```
✓ 87 modules transformed.
dist/assets/vendor-qr-BnVSKYIf.js          357.65 kB │ gzip: 108.84 kB
dist/assets/vendor-xTtxdrZS.js           1,444.59 kB │ gzip: 419.56 kB
✓ built in 10.99s

PWA v0.21.2 — service worker (sw.ts)
✓ built in 165ms
precache 69 entries (6034.29 KiB)
```

(Note: vendor chunk >500kB warning is pre-existing — not introduced by Phase 24.)

## Deploy output (wrangler)

```
✨ Compiled Worker successfully
Uploading... (353/353)
✨ Success! Uploaded 35 files (318 already uploaded) (2.00 sec)
✨ Uploading _headers
✨ Uploading Functions bundle
✨ Uploading _routes.json
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://2b5c0059.cbc7119.pages.dev
```

**Wrangler version:** 4.80.0
**Compatibility note:** node:crypto warning from `@block65/webcrypto-web-push` — pre-existing (require `nodejs_compat` flag), not Phase 24-related.

## Memory rules honored

- ✓ `--branch=production` flag used (메모리 룰 「배포 시 --branch production 필수」)
- ✓ ASCII commit message: `phase 24 extinguisher asset location split` (메모리 룰 「wrangler가 한글 커밋 메시지 거부」)
- ✓ 프로덕션 배포 후 sanity SQL 검증 (메모리 룰 「프로덕션 배포 후 테스트」)

## PWA 캐시 무효화 안내 (사용자 전달용)

방재팀 4명에게 다음 메시지 전달:

> **소화기 관리 페이지가 추가됐습니다 (v0.2.1).**
>
> 앱이 자동으로 업데이트되지만 안 보이면 다음 중 하나를 실행해 주세요:
> 1. 홈 화면의 PWA 앱 종료 후 재실행
> 2. 안 되면 사파리/크롬에서 https://cha-bio-safety.pages.dev 접속 후 새로고침
> 3. 그래도 안 되면 PWA 앱 삭제 후 다시 홈 화면에 추가
>
> 새 기능:
> - 사이드 메뉴 「소화기」 → 자산 리스트 페이지 (필터, 등록, 수정, 폐기, 분리)
> - 도면 빈 마커는 빨간 ❓ 로 표시 (소화기 미배치 위치)
> - 점검 모드에서 빈 ❓ 클릭 → 매핑 유도 모달
> - 점검 기록에 그 시점 자산 ID 가 스냅샷 보존됨 (자산 폐기 후에도 이력 추적 가능)

## Sanity SQL (운영 D1 — 배포 직후)

### 1. extinguishers.status 컬럼 존재 확인

```
PRAGMA table_info(extinguishers);
```

→ `"name": "status"` 매치 ✓

### 2. extinguishers 활성 카운트

```
SELECT COUNT(*) AS total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active FROM extinguishers;
-- total: 448, active: 448
```

→ 모든 행 active (폐기 0). Phase 01 baseline 보존 ✓

### 3. 매핑 카운트 (1:1 baseline)

```
SELECT COUNT(*) AS mapped FROM extinguishers WHERE check_point_id IS NOT NULL;
-- mapped: 448
```

→ Plan 01 PRAGMA baseline `total=448, unmapped=0` 와 동일 (mapped=total). 데이터 무손실 ✓

### 4. 신규 인덱스 3개 존재 확인

```
SELECT name FROM sqlite_master WHERE type='index' AND (name LIKE 'idx_extinguishers_%' OR name='idx_check_records_ext');
```

발견된 인덱스:
- `idx_extinguishers_cp` (기존)
- `idx_extinguishers_mgmt` (기존)
- `idx_extinguishers_status` ✓ (Phase 24 신규)
- `idx_extinguishers_cp_active` ✓ (Phase 24 신규)
- `idx_check_records_ext` ✓ (Phase 24 신규)

→ 신규 3개 모두 존재 ✓

## Outcome

배포 성공 + 4개 sanity SQL 모두 통과. UAT (Task 2) 진행 가능 상태.
