# Phase 23 Summary — 실제 변경 내역

## Commits (main 브랜치, 시간 순)

### Issue A — 푸시 cron 복구
| Commit | 내용 | 파일 |
|--------|------|------|
| `a814729` | 진단용 `*/15` 트리거 추가 (임시) | `cbc-cron-worker/src/index.ts`, `cbc-cron-worker/wrangler.toml` |
| `910d4ef` | 드라이런 추적 함수 추가 (임시) | `cbc-cron-worker/src/index.ts` |
| **`811e127`** | **annual_leaves.status 조건 제거 (진짜 버그픽스)** | `cbc-cron-worker/src/index.ts` |
| `da4bb04` | 진단 코드 정리(원복) | `cbc-cron-worker/src/index.ts`, `cbc-cron-worker/wrangler.toml` |

### Issue B — 교육 알림 정비
| Commit | 내용 | 파일 |
|--------|------|------|
| `e1f7372` | (초기 오해) "가장 최근 completed_at" 기준으로 수정 — 이후 되돌림 | `cbc-cron-worker/src/index.ts` |
| `a297123` | D-30 → D-60 확장 (UI 레이블 포함) | `cbc-cron-worker/src/index.ts`, `cha-bio-safety/src/components/SettingsPanel.tsx` |
| **`2fdb87a`** | **신규교육일 고정 기준으로 재수정 (법 해석 일치)** | `cbc-cron-worker/src/index.ts` |
| `f52571a` | "보수교육" → "실무교육" 문구 수정 | `cbc-cron-worker/src/index.ts` |
| `f4f1fe2` | 신규교육 D-60 알림 추가 (소방 `appointed_at+6개월` / 승강기 `safety_mgr_appointed_at+3개월`) + 승강기 재교육 레이블 정정 | `cbc-cron-worker/src/index.ts` |

### Issue C — 점검 카드 통일
| Commit | 내용 | 파일 |
|--------|------|------|
| `35d250b` | 대시보드 `CATEGORY_ALIAS` 컴프레셔↔DIV 제거 + `[접근불가]` 자동완료 확장 | `cha-bio-safety/functions/api/dashboard/stats.ts` |
| `9177031` | 모바일 카드 대시보드 방식 도입 (초기 attribution window) | `cha-bio-safety/src/utils/inspectionProgress.ts` (신규), `cha-bio-safety/src/pages/InspectionPage.tsx` |
| `21e5a40` | `monthRecordDates` 배열로 여러 기록 케이스 커버 | 동일 |
| **`fa7725b`** | **attribution window 폐기 → 당월 전체 집계 (대시보드 동치)** | 동일 |
| `c73a1de` | 유도등 바이패스 당월 any-done 확장 | `cha-bio-safety/src/pages/InspectionPage.tsx` |

## DB Mutations (remote `cha-bio-db`)

### `education_records`
```sql
-- 석현민의 잘못 등록된 미래-날짜 initial 삭제
DELETE FROM education_records
WHERE staff_id = '2018042451' AND education_type = 'initial' AND completed_at = '2026-05-13';

-- 사용자 제공 과거 이수일을 refresher 로 등록 (박보융은 제공 데이터 이상으로 제외)
INSERT INTO education_records (id, staff_id, education_type, completed_at, created_at) VALUES
  ('731A7586-6BE8-4C4A-8C30-899C0C6B5F8D', '2018042451', 'refresher', '2024-04-16', datetime('now', '+9 hours')),
  ('7C0A316C-4737-4FB9-A2D6-D7BBA41AAD4F', '2021061451', 'refresher', '2023-11-21', datetime('now', '+9 hours'));
```

### `check_records`
```sql
-- 사용자 실수로 찍힌 유도등 caution + 직후 재찍은 normal 2건 삭제 (admin 권한 외 예외 처리)
DELETE FROM check_records WHERE id = 'Dj0Yaivhj3msRLQ0Ekv9G';  -- caution 점등 이상
DELETE FROM check_records WHERE id = 'lJC05RCkHFraaIQPUyLIE';  -- normal
```

## 배포 URL (실시간)
- 여러 차례 배포됨 (커밋마다 별도 URL). 최종: https://22789ed8.cbc7119.pages.dev (c73a1de)
- cron worker 최종 배포 Version ID: `75e06927-f4cf-4ed3-aee2-cd53c689a2cf` (f4f1fe2)

## 문서/스킬 변경 없음
- `.planning/` 기존 문서에 영향 없음
- GSD 메타 상 이 phase 만 소급 추가

## 메모리에 추가된 항목
- `memory/reference_cron_worker.md` — "푸시 cron 은 별도 프로젝트 cbc-cron-worker" 레퍼런스 (미래 세션에서 같은 실수 방지)
