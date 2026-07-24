---
quick_id: 260724-ikd
slug: card-fullport
date: 2026-07-24
status: complete
deploy_url: https://eafc8d34.cbc7119.pages.dev
base_production: 29c85345
---

# SUMMARY — 점검 내용 카드 프로젝트 FULL-PORT (staging → prod)

## 결과
staging(`cbc7119-data`)에서 UAT 완료된 "점검 내용 카드" 프로젝트(증분 A~E-2 + 리파인 4)를 prod
(`cha-bio-safety`, branch=production, DB=cha-bio-db)에 **첫 이관 + 배포 완료**. 배포 URL `eafc8d34`.
health 200(db/storage ok). **UAT 잔여**(§5 전 카테고리).

## 어떻게 (핵심)
prod가 fork(b4c0de7) 이후 카드와 무관하게 발산(패널 모니터링·데스크톱 재디자인·**DIV 모듈 추출**)해
통짜복사 불가 → **base=82875b5 / mine=prod / theirs=staging 3-way**.

| 단계 | 커밋 | 방법 |
|---|---|---|
| T0 | `eb65e660` | 발산0 통짜 11(API 8+inspectionContent 신규+useInspectionRevisitPopup+types) + 마이그 파일 3 |
| T1/T2 | `1fe9ebe0` | reports/remediation×2/generateExcel/ExcelPreview — 3-way 자동병합(68 hunk 한쪽변경, prod 고유부 보존) |
| A | `6063c854` | InspectionPage 비-DIV: 재작성 모달 3종(계단·소방전원·댐퍼) staging 클린본 통짜교체 + InspectionModal 2충돌(사진가드 보존+isFamilyA 결합) |
| 바이너리 | `391348a3` | xlsx 10항목+PNG2, prod 순정 base(8a7527e6) → §8 case B 통짜복사 후 cb1250de 검증 |
| 공유모듈 | `054366e5` | FamilyACard/fa*/RESULT_ICONS/INSPECT_RESULT_OPTIONS → `components/inspection/familyCard.tsx` (순환 import 방지) |
| B | `a0d44824` | DIV/컴프 카드 → 추출 모듈 DivInspectModal.tsx (staging hunk H1~12/C1~4) |
| parity | `29c85345` | staging 리뷰 반영 — div_pressures.memo=raw memo |

## DIV 포트(B) 요약
스칼라 result→faMarks[1] 자동판정 주입. line_results 정본=div_pressures(/api/div/pressure) — handleSave
공유라 도면(lockToPoint) 진입 커버. 컴프레셔 timing 게이트(compDone). 재진입 팝업 본문전체→결과 서브영역
축소. prod 고유부(lockToPoint 26곳·헤더 h-12/px-3·사진누락 가드·NAV_BOTTOM·../../) 보존.
**staging (B) 리뷰 PASS.**

## D1 (cha-bio-db, 코드 배포 前)
0100 check_records +line_results/remediation_symbol → 0101 div_pressures +line_results →
0102 comp_inspections 재생성 +timing(136행 early 백필, UNIQUE(...timing)). 0096 drop_minwon 제외.

## 검증
각 단계 tsc+vite 빌드 통과. 배포후 health 200 + InspectionPage 신규 chunk 200. staging (B) 리뷰 PASS.

## 잔여 (UAT §5)
전 카테고리 회귀: 카드 10종 저장·서버 worst 롤업 / 비-카드(소화기·유도등) 회귀 0 / 조치(remediation_symbol
우선 + 레거시 memo 폴백) / 리포트 10종(다운로드↔ExcelPreview) / 재진입 팝업 / **도면 DIV 마커 line_results**.
PWA 캐시 — 사용자 앱 재설치/하드리프레시로 신규 번들 수신.

## 롤백
코드 revert / 0102 역마이그(코드+0102 동반).
