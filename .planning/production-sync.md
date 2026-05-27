# Production Sync — 직원 도메인(cbc7119) 적용 추적

> **읽기 전**: 이 파일은 `production` 브랜치에서만 갱신합니다. main 에는 없어야 정상.
>
> **목적**: 직원 도메인(cbc7119.pages.dev) 에 어떤 디자인/기능 변경이 적용되었는지 사람이 한눈에 보는 노트. main↔production 분기 시 "이 분기 commits 가 살아있는 작업인지 폐기된 작업인지" 판단의 single source of truth.

---

## 현재 상태

```
상태:           안정 (SYNCED)
기준 production: f122572 (cherry-pick 5건 적용 완료 — 5/27 디자인 sweep + doubleCycle fix)
마지막 동기화:   2026-05-27
마지막 배포 URL: https://3919a665.cbc7119.pages.dev (production alias = cbc7119.pages.dev)
```

**상태 의미**:
- `안정 (SYNCED)` — 직원 도메인이 표 마지막 entry 와 일치. 새 작업 들어와도 OK.
- `작업중 (IN_PROGRESS)` — cherry-pick / 배포가 진행 중이거나 중단됨. 새 작업 들어오면 STOP, 먼저 진행 중인 거 마무리.

---

## 사고 방지 룰 (작업 시작 전 필독)

1. **이 노트의 "기준 production" 과 실제 `git rev-parse origin/production` 이 다르면 STOP** — 누군가 이 노트 갱신 없이 production 을 건드림 = 미상의 변경. 사용자에게 즉시 확인.
2. **`origin/main` 에 표에 없는 source commit 이 있으면** → 사용자에게 "이거 적용 대상이냐, 폐기됐냐" 확인. 무조건 cherry-pick 금지.
3. **충돌 시 "operational fix 보존" 자동 적용 금지** — 분기 commit 정체가 표에 없으면 폐기 의심부터. (사고 사례: 2026-05-27 phase 15 진입점 버튼 부활)
4. **작업 시작 시 상태를 `작업중` 으로 바꾸고, 배포 후 새 entry 추가 + `안정` 으로 환원**.

---

## 표준 절차

| 단계 | 액션 |
|---|---|
| ① 사전 점검 | `git fetch origin` → 이 노트의 "기준 production" == `git rev-parse origin/production` 검증 |
| ② 작업 식별 | 사용자가 cherry-pick 대상 commit hash 알려주면 → 그 commit 들이 source-only(.ts/.tsx/.css/.html) 인지 확인 |
| ③ 상태 전환 | 이 노트의 "상태" 를 `작업중 (IN_PROGRESS)` 로 변경 + 무슨 작업인지 한 줄 |
| ④ cherry-pick | `git cherry-pick <hashes>` (충돌 시 위 룰 #3 적용) |
| ⑤ verify | 사용자가 알려준 grep/tsc 체크 통과 |
| ⑥ build + deploy | `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cbc7119 --branch=production --commit-message="ASCII"` |
| ⑦ 표 갱신 | 아래 표에 새 entry 추가, "기준 production" 갱신, 상태 `안정` 환원 |
| ⑧ commit | 이 노트와 cherry-pick 모두 production 브랜치에 commit. push 는 사용자 명시 OK 시에만 |

---

## 적용 이력 (다음 작업이 첫 entry)

| 날짜 | 작업명 | 적용된 main commits | production commits | 배포 URL | 메모 |
|---|---|---|---|---|---|
| — | — | — | — | — | (이 표가 비어있다는 건 이 노트가 새로 만들어진 직후라는 뜻. 다음 작업이 첫 줄로 들어감) |

---

## 부록: 이 노트를 만든 배경

2026-05-27 main → production 머지 사고 이후 신설. 자세한 사고 기록은 `.planning/` 외부의 Claude 메모리 `project_phase_15_abandoned.md` 와 `feedback_merge_conflict_check_abandoned_work.md` 참조.

당시 production 에 폐기된 phase 15 commits 18건이 남아있었고, main 머지 시 충돌 해결로 그 진입점 버튼이 직원 도메인에 다시 노출되는 사고 발생. 근본 원인은 "production 에 뭐가 적용되어야 하는지" 의 SSOT 부재. 이 노트가 그 SSOT.
