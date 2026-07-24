# STATE — 카드 full-port (260724-ikd)

## 진행 (2026-07-24)

| 단계 | 커밋 | 상태 |
|---|---|---|
| T0 통짜 11 + 마이그 0100/0101/0102 파일 | `eb65e660` | ✅ |
| T1/T2 발산 5파일 3-way 자동병합 | `1fe9ebe0` | ✅ |
| (A) InspectionPage 비-DIV 3-way + 모달3 통짜교체 + 2충돌 | `6063c854` | ✅ |
| 바이너리 3 (xlsx cb1250de + PNG2) | `391348a3` | ✅ |
| 공유모듈 familyCard 추출 (B 선결, 순환 import 방지) | `054366e5` | ✅ |
| (B) DIV·컴프레셔 카드 → DivInspectModal.tsx (H1~12/C1~4) | `a0d44824` | ✅ |
| (B) parity — div_pressures.memo=raw (staging 리뷰 반영) | `29c85345` | ✅ |
| **빌드 (tsc+vite) 전체** | — | ✅ 통과 |
| 마이그 실행 → cha-bio-db (0100→0101→0102) | — | ✅ 적용·검증(136행 early 백필) |
| 배포 (cbc7119 --branch=production) | — | ✅ eafc8d34, health 200 |
| UAT §5 전 카테고리 | — | ✅ **사용자 확인 (전부 정상)** |
| 후속 픽스 — DIV 카드 전체선택(pre-card line_results=null 리뷰모드 오진입) | `d3528d60` | ✅ 배포 3a5dc76f·확인 |

## (B) DIV 포트 요약
- 스칼라 result → faMarks[1] 자동판정 주입. i1=압력(detectDivTrend 자동), i0/i2/i3=수동.
- line_results 정본 = div_pressures(/api/div/pressure). handleSave 공유 → 도면(lockToPoint) 진입 커버.
- 컴프레셔 게이트(compDone, 현재 timing) + timing별 저장(effTiming/onSaved).
- 재진입 팝업 본문전체→결과 서브영역 축소. 공유모듈 familyCard import.
- prod 고유부 보존: lockToPoint 스레딩·헤더 h-12/px-3·사진누락 가드·NAV_BOTTOM·../../ import.

## 배포 순서 (사용자 GO 후)
1. `npm run build` (재확인)
2. cha-bio-db: 0100(check_records +2컬럼) → 0101(div_pressures +line_results) → **0102(comp_inspections 재생성, 배포 직전)**
3. `pages deploy dist --project-name=cbc7119 --branch=production`
4. UAT §5

## 리스크
- 🔴 0100은 코드 배포 前 필수(4 공용 엔드포인트 참조 → 부재 시 전앱 500).
- 🟠 0102↔옛 코드 창(컴프레셔 저장만 일시 에러) → 0102 배포 직전 + 즉시 배포로 축소.
- 되돌리기: 코드 revert / 0102 역마이그(코드+0102 동반).

## 안전
- 여기까지 전부 production 브랜치 커밋만. **미배포 · 마이그 미실행** — prod 도메인/DB 무변경.
