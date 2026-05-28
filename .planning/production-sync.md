# Production Sync — 직원 도메인(cbc7119) 적용 추적

> **읽기 전**: 이 파일은 `production` 브랜치에서만 갱신합니다. main 에는 없어야 정상.
>
> **목적**: 직원 도메인(cbc7119.pages.dev) 에 어떤 디자인/기능 변경이 적용되었는지 사람이 한눈에 보는 노트. main↔production 분기 시 "이 분기 commits 가 살아있는 작업인지 폐기된 작업인지" 판단의 single source of truth.

---

## 현재 상태

```
상태:           안정 (SYNCED) — bug-fix batch (WorkShift Excel + 제출용 탭 드래그 순서)
진행 작업:       없음
기준 production: `57fed69` (feat: WorkShift Excel + 제출용 탭 드래그 순서)
마지막 동기화:   2026-05-28
마지막 배포 URL: https://1da4f3b7.cbc7119.pages.dev (production alias = cbc7119.pages.dev)
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

## 적용 이력

| 날짜 | 작업명 | 적용된 main commits | production commits | 배포 URL | 메모 |
|---|---|---|---|---|---|
| 2026-05-27 | submission-ppt W1 — 점검 카드 다운로드 2버튼 | (production 직접 작업, main 무관) | `cc57711` | https://9caaecef.cbc7119.pages.dev | LegalPage 카드 하단에 결과내역서/지적조치사진 다운로드. 후자 항상 disabled (W2 이후 활성). 사용자 검증 완료. |
| 2026-05-27 | submission-ppt W2 — DB 0087 + lock guard | (production 직접 작업) | `e0659bf` | https://ace4dfdc.cbc7119.pages.dev | 4 컬럼 추가 (submission_status / ppt_file_key / submission_selected / submission_label). API GET 응답 확장 + mutation lock 가드 추가. 시각 변화 없음. prod D1 fire 카드 2건 모두 submission_status='pending' default 확인. |
| 2026-05-27 | submission-ppt W3 — 1열 토글/저장 + strip 색 단일화 | (production 직접 작업) | (push hook auto) | https://93b9530e.cbc7119.pages.dev | 1열 카드 우측에 제출 미완료/완료 토글 + 저장. admin only. lock 시 🔒 종결. strip 색 = submission_status 기반 (완료=safe, 미완료=warning). |
| 2026-05-27 | submission-ppt W4 — 2열 헤더 정리 + 내부용/제출용 탭 + 결과내역서 업로드/삭제 | (production 직접 작업) | (push hook auto) | https://4df0dedb.cbc7119.pages.dev | FindingsPanel 헤더 단순화. 탭 분리. 1열 카드 결과내역서 버튼 = 업로드/다운로드 분기 + X 삭제 (admin+!locked). PATCH null 처리. |
| 2026-05-27 | submission-ppt W5 — 제출용 탭 (체크 + 라벨 + 자동저장) + textarea 커서 fix | (production 직접 작업) | (push hook auto) | https://2ce0ba11.cbc7119.pages.dev | SubmissionTabPanel 신설. 500ms 디바운스. 사진 부족 시 저장 disabled. localLabels 유지로 커서 점프 사고 해결. |
| 2026-05-27 | submission-ppt W6 — 3열 PPT 미리보기 UI | (production 직접 작업) | (push hook auto) | https://fcb13cea.cbc7119.pages.dev | SubmissionPreviewPanel 신설. 표지 + 본문 슬라이드 + 페이지 네비. 사진은 R2 실제 미리보기 (a4 가로 비율). |
| 2026-05-27 | submission-ppt W7 — 양식 슬림화 + R2 + 서버측 PPT 생성 (표지) | (production 직접 작업) | (push hook auto) | https://89aa8a8b.cbc7119.pages.dev | 양식 PPTX 1.17MB (slide1+slide2) R2 업로드. fflate 로 서버측 생성 (JSZip 호환 안 됨). 표지 동적 ({YYYY}년 {종합정밀/작동기능}점검). 클라이언트 10초 자동저장. |
| 2026-05-27 | submission-ppt W8 — 본문 라벨 + 사진 임베딩 + 페이지 복제 + 다운로드 파일명 | (production 직접 작업) | (push hook auto) | https://1409a619.cbc7119.pages.dev | slide2 4 라벨 셀 패치. 페이지 복제 (ceil(N/2)). 사진 페이지별 R2 GET → media/image{N}.jpeg 추가 + rels redirect. rot 회전 제거. 다운로드 파일명 {YYYY.MM)차바이오... 형식. |
| 2026-05-27 | submission-ppt W9 — 결과내역서 와치독 API + ps1 패턴 | (production 직접 작업) | (push hook auto) | https://4b396dd0.cbc7119.pages.dev | 신규 API /api/legal/upload-report (admin only, 매칭 + reportFileKey 갱신). watchdog.ps1 GROUPS 에 legal_report/legal_ppt 추가. Process-LegalReportPdf = R2 업로드 + 매칭 + 폴더 이동. ps1 사용자 Windows 컴퓨터에 별도 복사 필요. |
| 2026-05-27 | submission-ppt W8c — pic geometry + right-column null guard | (production 직접 작업) | `ab6a45c` | https://aefeba6a.cbc7119.pages.dev | slide2 picture 4개 모두 셀 좌표(CELLS)로 xfrm 재작성. rot="5400000" 제거 + rId6 portrait ext (2700000×4428000) → landscape (4428492×2700000) 보정. `<a:stretch/>` → `<a:stretch><a:fillRect/></a:stretch>` 명시화로 세로사진 4귀퉁이 강제 fit. page.right=null 일 때 rId5/rId6 picture shape 제거 — 홀수 finding 마지막 페이지의 우측 템플릿 잔존 사고 차단. 사용자 검증 완료 후 origin push 완료 (`cba84ca`). |
| 2026-05-27 | tb3-03 LegalPage 디자인 sweep — emoji 8곳 → Lucide + 색 토큰 4곳 | `47b9088` | `4baf5d2` | https://6d353eb9.cbc7119.pages.dev | LegalPage.tsx 14+/14- 단일 hunk. emoji ✓/✗/🔒/💾 → Check/X/Lock/Save lucide. 저장버튼 옵션 B (bg-warning-bg text-warning outline). pill border 제거 (옵션 1). L538 string→JSX fragment (방법 A, ReactNode 자연 widen). inline style 141곳 무침범 (phase B 별도). cherry-pick 깔끔 (충돌 0). |
| 2026-05-28 | bug-fix batch — WorkShift Excel + 제출용 탭 드래그 순서 | (production 직접 작업) | `57fed69` | https://1da4f3b7.cbc7119.pages.dev | **Bug 1**: utils/generateExcel.ts 의 양식 patch — B4-B7 (title) + C4-C7 (name) 도 staffRows 순서로 패치 (이전엔 양식 하드코딩 순서 그대로 → 김병조 shift 가 박보융 행에 들어가는 사고). 양식 workbook.xml 의 `<sheet name="12월">` + definedName 도 실제 월로. **Bug 2** (W10 sketch s6 v3): migration 0088 `submission_order` 추가 + remote prod 즉시 적용 (rows_written 8). 신규 API `PUT /api/legal/:id/submission-order` batch renumber. SubmissionTabPanel 체크박스 제거 → 드래그&드롭만으로 PPT 포함/순서 변경. 4컬럼 그리드 (handle/badge/textarea/save-btn) + 빈영역 + 구분선. PPT hint textarea 우측 모서리, 인디케이터 save-btn 좌측 모서리. 미선택 카드 textarea readonly. 미선택→선택 시 자동 `#N+1` 부여, 언체크 시 자동 renumber. generate.ts `ORDER BY submission_order`. optimistic update via React Query. 8 파일 변경 + 2 신규 (migration + API endpoint). |
| 2026-05-27 | color audit tier1 — 비표준 bg-{status} 7곳 → -bar | `7031815` | `f5117b4` | (배치 끝에 deploy) | InspectionPage 3 + DivPage 2 + ElevatorPage 1 + LegalFindingDetailPage 1. 솔리드 fill 용도는 -bar 변종 (text-on-accent 흰글 fill). cherry-pick 충돌 0. |
| 2026-05-27 | color audit tier1 followup — LegalPage 결과내역서 X 빨강 | `df0f99d` | `94f31bc` | (배치 끝에 deploy) | LegalPage.tsx L1073 회색 X (bg-surface-active text-text-secondary border-strong) → 빨강 (bg-danger-bar text-text-on-accent border-0) — 같은 페이지 다른 사진제거 X 패턴 일관. cherry-pick 충돌 0. |
| 2026-05-27 | color audit tier2 — border-{status} 57곳 → border-{status}-bar | `1270ce7` | `068a7c8` | https://c92fc8e3.cbc7119.pages.dev | InspectionPage 44 + FloorPlanPage 10 + DashboardPage 2 + SchedulePage 1. perl lookahead (?![-\w]) 로 -bar/-bg variant 보호. 시각 변화 미미 (border 살짝 더 saturated). 3건 배치로 단일 deploy. cherry-pick 충돌 0. |
| 2026-05-28 | settings 테마 wire + 데드 코드 정리 | (production 직접 작업) | `12b1220` | https://75f6e539.cbc7119.pages.dev | SettingsPanel 화면 섹션: 테마 select 에 utils/theme 의 getThemePreference/setThemePreference 연결 (다크/라이트/시스템 실동작). 주간 현황 기준/결과 즉시 저장 Row 제거 (dead UI). SideMenu MenuItem.soon 필드 + 22 항목 + 준비중 배지 분기 제거. DesktopSidebar NavItem.soon prop + 분기 제거. FloorPlanPage PLAN_TYPES.ready + planReady + 준비중 배지 + 도면 준비 중 fallback 제거. AdminPage.tsx 삭제 (라우팅 없음). 5 파일 60+/94-. |

---

## 부록: 이 노트를 만든 배경

2026-05-27 main → production 머지 사고 이후 신설. 자세한 사고 기록은 `.planning/` 외부의 Claude 메모리 `project_phase_15_abandoned.md` 와 `feedback_merge_conflict_check_abandoned_work.md` 참조.

당시 production 에 폐기된 phase 15 commits 18건이 남아있었고, main 머지 시 충돌 해결로 그 진입점 버튼이 직원 도메인에 다시 노출되는 사고 발생. 근본 원인은 "production 에 뭐가 적용되어야 하는지" 의 SSOT 부재. 이 노트가 그 SSOT.
