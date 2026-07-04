# PROD → DESIGN 이관 — 화재수신반 UI 260702-p22 + 260704 델타

> **읽는 콘솔**: design = `~/Documents/cbc7119-design` (`cd ~/Documents/cbc7119-design && claude`).
> **작성 출처**: prod 콘솔(`~/Documents/20260328`), production HEAD `a4e89772`, 2026-07-04.
> design 은 prod 와 **같은 git repo**(cbc7119.git). design 은 `main` 브랜치.
> **배포 = `main` push → `cbc7119-preview` 자동.** ⚠️ **이 콘솔에서 wrangler 금지.**
> design 레이아웃은 prod 와 동일하게 앱이 `cha-bio-safety/` 하위.

---

## 배경 / 왜 이 갭이 생겼나

Phase 25 패널 원격감시 UI(시안→TSX, `b6fe0931`) 이후의 패널 UI 진화가 **prod 직접**으로 들어감
(GSD sketch → quick, worktree OFF). design/`main` 은 **Phase 25 base + 260701-mw4 + 260702-1vw
(`e524b90a`)** 까지만 → 다음 redesign wave 가 `main` 에서 분기하면 이 패널 UI가 **회귀**함.
→ `main` 을 prod 현실에 맞춰 올려야 함.

## design/main 이 실제로 없는 것 (분석 세션 실측)

**신규 3파일 (design 리포에 파일 자체가 없음):**
- `cha-bio-safety/src/utils/panelEvents.ts` — `mergePanelEvents`/`useRecentPanelEvents`/`kstStr`/`KIND_BADGE`.
  자동(`alarmApi.getEvents`) + 수동(`fireAlarmApi.getByYear`, `created_by !== 'panel-agent'`) **48h 병합**.
  KST 벽시계 문자열 비교로 정렬/필터 (tz epoch 함정 회피).
- `cha-bio-safety/src/components/PanelEventRow.tsx` — 카드 2곳 + 이력 페이지 공유 행. `thumb` prop(84×48).
- `cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx` — `/fire-alarm-history`. 종류/출처 세그먼트 + 월 스테퍼 + 날짜그룹.

**변경 6파일:**
- `src/pages/InspectionPage.tsx` — **구 인라인 `panelEvents` useQuery(자동감지 전용) → 병합모듈 카드**
  + 데스크톱 "전체 이력" **in-pane**(`FireAlarmHistoryView` 추출, `panelHistoryOpen` 토글) + 데스크톱 카드 썸네일.
  (design 은 현재 `InspectionPage` 안에 구 `const { data: panelEvents } = useQuery(...)` 지역변수만 있음.)
- `src/pages/DashboardPage.tsx` + `src/components/panel/LivePanelImage.tsx` — 모바일 라이브카드 2.06:1
  + Android 짜부/자연비율 fix (iOS/Android 분기).
- `src/pages/FireAlarmPage.tsx` — fault 풀스크린 게이트 (고장/설비는 push+풀스크린만).
- `src/utils/api.ts` — `alarmApi` 인터페이스에 `'fault'` 타입 + `location` 필드. (design api.ts 에 fault 없음 확인됨.)
- `src/App.tsx` — `/fire-alarm-history` 라우트 + no-nav 등록.

---

## 권장 방식 — design 트랙 정석 (승인된 시안 재사용)

병합 카드/전체이력은 이미 **GSD sketch 승인**됨(실토큰 다크). prod 에 있음:

```
~/Documents/20260328/cha-bio-safety/.planning/sketches/
  ├─ 001-card-event-item/   (병합 이벤트 카드 행 = PanelEventRow 시안)
  ├─ 002-history-page/      (전체이력 페이지 = FireAlarmHistoryPage 시안)
  ├─ MANIFEST.md
  └─ themes/
```

quick 아티팩트(PLAN/SUMMARY — 구현 의도·결정사항):
```
~/Documents/20260328/.planning/quick/260704-0xr-panel-events-merge-history/   (PLAN + SUMMARY)
~/Documents/20260328/.planning/quick/260704-fh2-panel-thumb-desktop-inpane-history/   (SUMMARY)
```

레퍼런스 구현 = prod 파일 원본 (신규 3파일은 통짜 참고 OK, 공유파일은 hunk만):
```bash
# 신규 3파일 원본 확인:
cat ~/Documents/20260328/cha-bio-safety/src/utils/panelEvents.ts
cat ~/Documents/20260328/cha-bio-safety/src/components/PanelEventRow.tsx
cat ~/Documents/20260328/cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx
```

## 대안 — cherry-pick (같은 repo라 가능하나 함정 있음)

```bash
cd ~/Documents/cbc7119-design && git fetch origin
git log --oneline origin/main..origin/production   # prod 전용 커밋 전체
```

design 이 필요한 UI 커밋:
- 신규 3파일 도입: `687464ac`(병합+공용행) `cf019347`(이력+라우트) `c4255ac8`+`cf08be76`(데스크톱 썸네일/in-pane)
- fault/라이브카드: `0afae824` `dfe65330` `75f878da` `30abd0f9` `92714e80` `1db8cdf4` `cd0634e6` `5ff1d932` `1494dc46`

**cherry-pick 함정:**
1. prod 커밋은 **front+back 번들** — `0afae824` 는 마이그 `0093`/`functions/` 도 포함. design 은 base
   마이그 `0091`/`0092` 조차 없음 → cherry-pick 시 **`src/` hunk 만 취하고 `functions/`·`migrations/` 는 버릴 것**.
2. `142aac24`·`c45097e5` 는 design 이 이미 보유(260702-1vw `f5978ff7`/`704c9158` 미러)라 **제외** — 안 그러면 충돌/중복.
3. **형상 차이**: design = Tailwind 토큰, prod = operational 인라인 스타일. `InspectionPage`/`DashboardPage` 는
   operational↔redesign 로 크게 분기 → **통짜 복사 금지, 패널 hunk 만 골라 의도 이식**. prod 인라인
   `old_string` 을 design 에 그대로 주면 no-op.

> 두 방식 다 유효. 신규 3파일은 파일 자체가 없어 도입이 깔끔(시안 or 원본 참고), 공유 6파일은 hunk 이식이 안전.

---

## 검증 · 배포

```bash
cd ~/Documents/cbc7119-design
npm run build        # 타입/빌드 통과 확인 (⚠️ wrangler 실행 금지)
git add -A && git commit -m "..."      # 코드 변경
git push origin main                    # → cbc7119-preview 자동 배포
```

- 검토 URL: **https://cbc7119-preview.pages.dev** (또는 `<branch>.cbc7119-preview.pages.dev`).
- ⚠️ **직원 도메인(cbc7119)은 이 콘솔에서 절대 안 건드림.** `wrangler --project-name=cbc7119` 금지.
  "프로덕션 배포" = `main` push 로 cbc7119-preview 자동. wrangler X.

## 백엔드 의존 (참고)

- `panelEvents.ts` 는 `alarmApi.getEvents`(panel_alarms) + `fireAlarmApi.getByYear`(fire_alarm_records) 소비.
  design `api.ts` 에 그 인터페이스(`+fault`, `+location`)가 있어야 타입 통과.
- cbc7119-preview 가 자체 D1 이면 fault/location 실데이터가 없어 UI 빈값으로 보일 수 있음(형상 검증엔 무방).
  prod D1 공유면 이미 커버. 실데이터 필요 시 prod 트리거로 생성.
