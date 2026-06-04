---
quick_id: 260605-1ql
slug: pdf-prod
date: 2026-06-05
status: complete
commit: 7debf75
deploy: https://2a26f36f.cbc7119.pages.dev
---

# Quick 260605-1ql 완료 — 식단표 PDF 파서 비정상 파싱 감지 가드 (staging → prod)

## 한 일

staging(cbc7119-data) 에서 검증 완료된 가드(커밋 `dc981f0`)를 production 에 동일 반영.
`src/pages/StaffServicePage.tsx` `handleMenuUpload` 의 menus 생성 직후·`menuApi.upsert`
직전에 3종 비정상 파싱 감지 가드 삽입. 하나라도 걸리면 `throw` → 기존 try/catch 가
`toast.error(err.message)` 로 표시하고 upsert 미도달 → 깨진 데이터가 정상 데이터를
silent overwrite 하는 것 차단.

- `extracted`(빈칸 필터 전, `dow` 포함) 추출 → `menus`(빈칸 필터 + dow strip)로 분리.
  upsert payload 는 기존과 동일(dow 미전송).
- ① 비-공휴일 평일(월~금)인데 중식A·중식B·석식 전부 공란 → 비는 날짜 표시 후 차단
- ② `menus.length < expectedDays`(평일·공휴일 제외) → 인식 일수 표시 후 차단
- ③ weekdayCols x 간격 한 칸이 중앙값 ~1.8배↑ → 헤더 통째 누락 의심, 차단

## 검증

- `npx tsc --noEmit` → exit 0 PASS
- `npm run build` → PASS (precache 83 entries, sw 생성)
- pdfjs(3.11.174 legacy) 로 앱 파서+가드 1:1 재현 시뮬레이션(`/tmp/sim_guard.mjs`):
  - 정상: 6/1~6/5(6/3 선거) & 5/4~5/8(5/5 어린이날) → 운영일수=menus=4, gaps 균등 → **PASS(오발동 0)**
  - 음성통제: 6/3 을 평일 취급(holiday 제외) → 운영일 5 vs menus 4 → **BLOCK ① 정확히 발동**
- 라이브 배포 검증: 새 청크 `StaffServicePage-D5J5oudl.js`(이전 `CmIKWmQa`)에 `비정상 파싱 감지` 마커 존재 ✓

## 배포

- code commit: `7debf75` (production, +38/-1, 단일 파일)
- `wrangler pages deploy dist --project-name=cbc7119 --branch=production` (cha-bio-safety CWD, Functions bundle 포함)
- 배포 URL: https://2a26f36f.cbc7119.pages.dev (apex = cbc7119.pages.dev)
- **메인 Claude 직접 배포** (서브에이전트 prod 배포 금지 룰 준수)

## 사전 점검 발견 (production-sync 게이트)

노트 기준(`c6f3432`) ↔ HEAD(`46fdb6c`) 차이 = 260602-3p6 ExtinguisherPublicPage width fix
(`b7570a1`/`3614304`, source-only, 파서 무관) + 문서 커밋뿐 — 폐기/미상 작업 아님. 이번
배포에 함께 포함됨. 노트 헤더 갱신 누락분이라 이번에 보정.

## 비적용 결정

"이상하지만 그래도 저장" confirm 우회 미포함 — 습관적 클릭 사고 재발 방지(staging 과 동일).
