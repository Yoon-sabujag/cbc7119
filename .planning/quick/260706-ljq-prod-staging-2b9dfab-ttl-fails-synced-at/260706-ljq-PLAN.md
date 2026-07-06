---
quick_id: 260706-ljq
description: 승강기 공단 검사이력 동기화 개선 prod 이식 (staging 2b9dfab 검증본)
date: 2026-07-06
mode: main-direct (배포 포함 — 서브에이전트 금지 룰, 260702-39r 관행)
---

# Plan — staging 검증본 prod 이식

원 스펙: `.planning/quick/260706-e0o-staging-handoff-ttl-fail-detail/STAGING-HANDOFF.md`
핸드백: 같은 폴더 `STAGING-VERIFIED-HANDBACK.md` (staging 커밋 2b9dfab, 검증 5종 통과 + 사용자 확인)

## 사전 비판 검토 결과 (완료)

- 스펙 이탈 1건(변경 3 → fails_synced_at 성공 마커) **정당**: 원 스펙의 "history 존재 = 상세 조회됨" 판정은 상세조회 실패 건이 60일 후 영구 재조회 불가가 되는 실제 구멍. 마커 방식이 자가 치유 복원.
- 구현 검증: UPSERT ON CONFLICT SET 에 fails_synced_at 없음(마커 보존) / 성공 시에만 마커 UPDATE / 실패 시 continue+캐시 유지 / 판정은 history 기반(fails 부재 기반 아님) 전부 확인.
- 베이스 정합: 백엔드 2파일 staging 변경 전 == prod 현재 **byte-identical**. 프론트는 staging 베이스에 stale 토스트 자체가 미이식 상태였으나 staging 최종본 == prod 현재본+7일 조건 (diff 확인) → 통째 복사 안전.
- Playwright 목킹 코드 번들 유출 없음 (frontend diff 에 토스트 조건만).
- prod D1 추적 테이블에 0091~0094 미기록 = 이 콘솔 관행은 `d1 execute --file` 수동 적용. 0095 동일 관행.

## Tasks

1. **파일 4개 복사** (staging → prod cha-bio-safety/): inspect-history.ts / _koelsa-common.ts / src/utils/inspectHistory.ts / migrations/0095_inspect_history_fails_synced_at.sql
   - verify: 각각 staging 원본과 diff byte-identical + 마커 grep (fails_synced_at, syncPolicy, FETCH_MAX_ATTEMPTS, STALE_TOAST_MIN_AGE_MS) + tsc 0 + build
2. **D1 0095 코드 배포 전 적용** (⚠️ 순서: 코드 먼저 배포하면 컬럼 부재로 전 호기 stale): `wrangler d1 execute cha-bio-db --remote --file` → 검증: 컬럼 존재 + 백필 = 전행 + 마커 NULL 0건 + 백필 리스크 sanity (상세 미보유 불합격/보완 최근건 유무)
3. **커밋 + 배포**: production 브랜치 커밋 → `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cbc7119 --branch=production --commit-message=ASCII` → 스모크 (앱 200 / api 401 JSON / dist 마커 604800000)
4. **문서 갱신**: production-sync.md entry+기준+안정 환원 / STATE.md row / SUMMARY.md / 메모리

## 리스크 노트

- 백필 미세 리스크: "상세 성공조회 0회" 행도 fetched_at 으로 마킹됨 — 실무상 확률 ≈0 (구코드가 수개월 전건 재조회), task 2 sanity 쿼리로 확인.
- 0095 는 ALTER+UPDATE 2문 — batch 비원자성 인지, 적용 후 개별 검증.
- deploy.yml (`d1 migrations apply`, main 전용) 은 main 에 0095 도달 시점에 재적용 시도 가능성 — 0091~0094 와 동일한 기존 패턴, 이번 범위 밖 (sync 노트에 기록).
