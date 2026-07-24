# STATE — 카드 full-port (260724-ikd)

## 진행 (2026-07-24)

| 단계 | 커밋 | 상태 |
|---|---|---|
| T0 통짜 11 + 마이그 0100/0101/0102 파일 | `eb65e660` | ✅ |
| T1/T2 발산 5파일 3-way 자동병합 | `1fe9ebe0` | ✅ |
| (A) InspectionPage 비-DIV 3-way + 모달3 통짜교체 + 2충돌 | `6063c854` | ✅ |
| 바이너리 3 (xlsx cb1250de + PNG2) | `391348a3` | ✅ |
| **빌드 (tsc+vite)** | — | ✅ 통과 |
| (B) DIV/컴프레셔 → DivInspectModal.tsx | — | ⏸ **staging 요청 중** |
| 마이그 실행 → cha-bio-db (0100→0101→0102) | — | ⏳ B 후 |
| 배포 (cbc7119 --branch=production) | — | ⏳ B 후 |
| UAT §5 전 카테고리 | — | ⏳ 배포 후 |

## (A) 병합 방법 요약
- prod가 fork(b4c0de7) 이후 발산 → 통짜복사 불가. base=82875b5/mine=prod/theirs=staging **3-way**.
- 한쪽 변경 68 hunk 자동병합(prod 패널/데스크톱/주차 고유부 보존 + staging 카드).
- 양쪽 충돌 15 중: DIV 구역(1374줄, prod 추출로 empty)=prod side 유지 / 재작성 모달 3종(Stairwell·
  PowerPanel·Damper, 옛 equip·floorResults 아키 폐기)=staging 클린본 통짜교체 / InspectionModal 2충돌=
  사진가드 보존+isFamilyA 결합.
- 옛 아키 변수 0, 충돌마커 0, 함수중복 0, Check import 추가. 빌드 통과.

## (B) = 별건 이유 (구조 분기)
prod는 `260626-7vq`에서 DivModal+CompressorModal을 `src/components/div/DivInspectModal.tsx`(1338줄)로
추출. staging은 인라인. DIV 카드는 InspectionPage 아님 → 추출 모듈에 이식해야. staging 요청서:
`.planning/handoffs/260724-B-div-compressor-to-divinspectmodal-REQUEST.md`.

## 안전
- 전부 production 브랜치 커밋만. **미배포** — prod 도메인은 기존 빌드 유지. 롤백=파일 revert.
- 마이그 미실행 — prod DB 무변경.
