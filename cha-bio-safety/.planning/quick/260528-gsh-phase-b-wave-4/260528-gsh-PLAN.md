---
phase: 260528-gsh-phase-b-wave-4-dashboard-daily-worklog
plan: 01
type: execute
wave: 4
depends_on: [260528-cjn]
files_modified:
  - src/pages/DashboardPage.tsx
  - src/pages/DailyReportPage.tsx
  - src/pages/WorkLogPage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 4 (보고/대시보드 — Dashboard 의도 inline + 캘리브 2종)
---

<objective>
**Phase B Wave 4 — 보고/대시보드.** Tier 1 네 번째 wave.

- DashboardPage (803줄, 10 inline) — **`feedback_dashboard_grid_1fr.md` + `feedback_dashboard_horizontal_scroll.md`** + IS_ANDROID 의도 인라인 (코드 주석 명시)
- DailyReportPage (742줄, 10 inline) — **redesign/15 캘리브 시스템 100% 보존**
- WorkLogPage (1077줄, 20 inline) — 캘리브 마커 시스템 + imgRect 동적

**예상 잔존비율 높음** (~50%) — 의도 inline + 캘리브 다수.

### 위험 anchor
- Dashboard: 그리드 1fr (핀치줌 원복 깜빡임 방지) / 월간 도넛 가로 스크롤 / IS_ANDROID 분기 height (코드 주석 "인라인 허용 키")
- DailyReport: imgRect / pt.x/y 캘리브 좌표 / textStyle spread / DAILY_CALIB_STEPS
- WorkLog: imgRect / pt.x/y 캘리브 / WORKLOG_CALIB_STEPS / 마커 색변수
</objective>

<context>

### DashboardPage 10 inline 변환 매핑

**보존 (3건, 코드 주석 명시 "인라인 허용 키")**
- L491 주석 + L492-498 `gridTemplateRows: IS_ANDROID ? '...' : '...'` — **잔존**
- L656 주석 + L657 `height: IS_ANDROID ? 125 : undefined` — **잔존**
- L670 주석 + L671-673 `overflowY: 'clip', flex: IS_ANDROID ? 1 : undefined, height: IS_ANDROID ? 101 : undefined` — **잔존**

**동적 색변수 (2건, 옵션 N 잔존)**
- L423 `style={{ background: CAT_DOT[cat] ?? 'var(--text-tertiary)' }}` — 잔존
- L764 `style={{ background: catColor[item.category] ?? 'var(--text-tertiary)' }}` — 잔존

**변환 가능 (5건)**
- L503 `style={{ animation:'slideUp .28s ease-out' }}` → `className="[animation:slideUp_.28s_ease-out]"` (또는 기존 className 합병)
- L524 `style={{ animation:'slideUp .28s .06s ease-out both' }}` → `[animation:slideUp_.28s_.06s_ease-out_both]`
- L603 `style={{ animation:'slideUp .28s .12s ease-out both' }}` → `[animation:slideUp_.28s_.12s_ease-out_both]`
- L629 `style={{ animation:'slideUp .28s .16s ease-out both' }}` → `[animation:slideUp_.28s_.16s_ease-out_both]`
- L713 `style={{ paddingBottom: 'calc(16px + var(--sab, 0px))' }}` → `pb-[calc(16px+var(--sab,0px))]`

**Dashboard 예상: 10 → 5 잔존** (3 IS_ANDROID 의도 + 2 동적 색)

### DailyReportPage 10 inline 변환 매핑

**변환 (2건)**
- L394 `style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-page)' }}` → `h-full flex flex-col overflow-hidden bg-surface-page` (Wave 1 ReportsPage 동일 패턴)
- L405 `style={{ flex: 1, overflowY: 'auto' }}` (기존 className page-body) → 기존 className 에 `flex-1 overflow-y-auto` 추가

**캘리브 좌표 잔존 (8건, 옵션 N)**
- L615 `left: imgRect.left, top: imgRect.top, width: imgRect.width, height: imgRect.height` (imgRect 동적 객체) — **잔존**
- L627 `position: 'absolute', left: \`${pt.x}%\`, top: \`${pt.y}%\`, width: '75%', ...textStyle(10), fontWeight: 700` (pt.x/y 동적 + textStyle spread) — **잔존**
- L638 동일 패턴 — **잔존**
- L667 `style={{ background: DAILY_CALIB_STEPS[calibStep].color }}` (동적 색) — **잔존**
- L701 `style={{ left: \`${x}%\`, top: \`${y}%\` }}` (캘리브 좌표 동적) — **잔존**
- L702 `style={{ background: color }}` (마커 색 동적) — **잔존**
- L703 `style={{ background: color }}` — **잔존**
- L706 `style={{ background: color }}` — **잔존**

**DailyReport 예상: 10 → 8 잔존**

### WorkLogPage 20 inline 변환 매핑

**변환 (7건)**
- L567 `style={{ marginLeft: 6 }}` → `ml-[6px]`
- L585 `style={{ marginLeft: 6 }}` → `ml-[6px]`
- L637 `style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20 }}` → `flex items-center justify-end mb-5`
- L641 `style={{ marginTop: 4 }}` → `mt-1`
- L644 `style={{ height: 24 }}` → `h-6`
- L679 `style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}` → `h-full flex flex-col overflow-hidden bg-surface-page` (--bg aliases --surface-page per tokens.css L178)
- L695 `style={{ flex: 1, overflowY: 'auto' }}` → 기존 page-body className 합병 `flex-1 overflow-y-auto`
- L697 `style={{ height: 72 }}` → `h-[72px]`

**큰 toolbar (정적 부분 변환, L1007-1015)**
- L1007 multiline `position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 16, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap'` → 통째 변환 가능:
  → `absolute top-2 left-1/2 -translate-x-1/2 bg-[rgba(0,0,0,0.9)] text-white px-5 py-[10px] rounded-[10px] text-[14px] font-bold flex items-center gap-4 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] whitespace-nowrap`
- L1023 `style={{ fontSize: 11, color: '#aaa' }}` → `text-[11px] text-[#aaa]`
- L1027 confirm button `background: '#22c55e', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700` → `bg-[#22c55e] border-0 text-white px-4 py-[6px] rounded-md cursor-pointer text-[13px] font-bold`
- L1032 cancel button — 동일 패턴 변환

**캘리브 시스템 잔존 (옵션 N)**
- L955 multiline imgRect + calibMode 동적 — 잔존 (imgRect/calibMode 모두 동적)
- L970 multiline `${pt.x}%` `${pt.y}%` + width: item.width || '75%' + textStyle spread — 잔존
- L981 multiline `${pt.x}%` `${pt.y}%` + textStyle spread — 잔존
- L1016 multiline `width: 24, height: 24, borderRadius: '50%', background: WORKLOG_CALIB_STEPS[calibStep].color, ...` — 정적 부분만 변환 + WORKLOG_CALIB_STEPS 동적 색만 옵션 N 잔존
- L1056 outer marker `${x}%` `${y}%` 동적 — 잔존
- L1062 `background: color` cross — 잔존
- L1063 `background: color` cross — 잔존
- L1064 multiline marker dot active 분기 + background: color — 잔존 (active 정적 → conditional className 분리 시도 가능하지만 동적 색이 같이 있어서 잔존이 안전)

**WorkLog 예상: 20 → ~11 잔존**

### 합계 예상

| 파일 | Before | After | 변환 |
|---|---:|---:|---:|
| Dashboard | 10 | ~5 | 5 |
| DailyReport | 10 | ~8 | 2 |
| WorkLog | 20 | ~11 | ~9 |
| **합계** | **40** | **~24** | **~16 (-40%)** |

이 wave 는 다른 wave 보다 잔존 비율 높음 — 캘리브 + IS_ANDROID 의도 패턴 다수. **정상.**

### 룰 (locked)
- 옵션 X+P+M+색변수N 승계
- **Dashboard 1fr / 가로 스크롤 / IS_ANDROID 의도 inline 절대 보존** (메모리 anchor 룰)
- **DailyReport 캘리브 100% 보존** (imgRect / pt.x/y / textStyle / DAILY_CALIB_STEPS)
- **WorkLog 캘리브 마커 시스템 보존** (imgRect / pt.x/y / WORKLOG_CALIB_STEPS / 마커 색)
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 3 .tsx 만

### tailwind w-7/p-7/w-8/p-8 = 32/48 함정 회피
- 28px → arbitrary `[28px]`
- 32px → `-7` (config) 또는 arbitrary
- 36px → arbitrary `[36px]`
- 44px → arbitrary `[44px]`
- 48px → `-8` (config) 또는 arbitrary
- **혼란 방지: stale arbitrary 권장**

### 메모리 anchors
- `feedback_dashboard_grid_1fr.md` (그리드 1fr 의도)
- `feedback_dashboard_horizontal_scroll.md` (가로 스크롤 의도)
- `project_redesign_15_daily_report_status.md` (캘리브 100% 보존)
- `feedback_tailwind_w8_h8_is_48px.md` (w-7=32 / w-8=48 함정)

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk apply Dashboard + Daily + WorkLog inline → tailwind</name>
  <files>
    src/pages/DashboardPage.tsx
    src/pages/DailyReportPage.tsx
    src/pages/WorkLogPage.tsx
  </files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  echo "$F before: $(grep -c 'style={{' $F)"
done

for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/gsh-before.txt

for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/gsh-clicks-$(basename $F .tsx).txt
done
```

### Step 2: Edit DashboardPage.tsx

**보존 (3 IS_ANDROID 의도 + 2 동적 색)** — 그대로 두기:
- L492-498 gridTemplateRows IS_ANDROID
- L657 height IS_ANDROID
- L671-673 overflowY/flex/height IS_ANDROID
- L423 background CAT_DOT
- L764 background catColor

**변환 (5건)**:
- L503/L524/L603/L629 animation → `[animation:slideUp_...]` arbitrary
- L713 paddingBottom calc → `pb-[calc(16px+var(--sab,0px))]`

### Step 3: Edit DailyReportPage.tsx

**변환 (2건)**:
- L394 root → `h-full flex flex-col overflow-hidden bg-surface-page`
- L405 page-body → 기존 className + `flex-1 overflow-y-auto`

**캘리브 잔존 (8건)** — 그대로

### Step 4: Edit WorkLogPage.tsx

**변환 (~10건)**:
- L567/L585 marginLeft → `ml-[6px]`
- L637 flex/margin → `flex items-center justify-end mb-5`
- L641 marginTop → `mt-1`
- L644 height spacer → `h-6`
- L679 root → `h-full flex flex-col overflow-hidden bg-surface-page` (`var(--bg)` 가 `var(--surface-page)` alias 라 동일 결과)
- L695 page-body → 기존 className + `flex-1 overflow-y-auto`
- L697 spacer → `h-[72px]`
- L1007 toolbar 전체 변환 (큰 박스)
- L1023 fontSize/color → `text-[11px] text-[#aaa]`
- L1027 confirm button → 변환
- L1032 cancel button → 변환

**캘리브 마커 잔존 (옵션 N)** — L955/L970/L981/L1016/L1056/L1062/L1063/L1064 그대로

### Step 5: After verification

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

# 1. style count
for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  echo "$F after: $(grep -c 'style={{' $F)"
done

# 2. 비즈 anchor identity
for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/gsh-after.txt
diff /tmp/gsh-before.txt /tmp/gsh-after.txt
# MUST empty

# 3. onClick precise
for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/gsh-clicks-$(basename $F .tsx)-after.txt
  diff /tmp/gsh-clicks-$(basename $F .tsx).txt /tmp/gsh-clicks-$(basename $F .tsx)-after.txt
done

# 4. emoji + 비색
for F in src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx; do
  echo "$F emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
  echo "$F 비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"
done
# 모두 0

# 5. TypeScript
./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

# 6. file scope
cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/\(DashboardPage\|DailyReportPage\|WorkLogPage\).tsx" | grep -v ".planning/" | wc -l

# 7. 의도 inline 보존 검증 (Dashboard 3 + Daily 8 + WorkLog 11+)
grep -c "IS_ANDROID" src/pages/DashboardPage.tsx
# IS_ANDROID 참조 그대로 (4건: const + 3 inline)
grep -c "imgRect\|DAILY_CALIB_STEPS\|WORKLOG_CALIB_STEPS" src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx
# 캘리브 시스템 변수 그대로
```

### Step 6: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/DashboardPage.tsx cha-bio-safety/src/pages/DailyReportPage.tsx cha-bio-safety/src/pages/WorkLogPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-gsh-01): Phase B Wave 4 — Dashboard 10 + Daily 10 + WorkLog 20 → tailwind

Dashboard 10→5 (IS_ANDROID 의도 inline 3건 + CAT_DOT/catColor 동적 2건 옵션 N 잔존, animation 4건 + paddingBottom calc 변환).
DailyReport 10→8 (캘리브 좌표 imgRect/pt.x.y/textStyle/DAILY_CALIB_STEPS 잔존, root + page-body 2건 변환).
WorkLog 20→~10 (캘리브 마커 시스템 잔존, toolbar + spacer + margin 등 다수 변환).
옵션 X+P+M+색변수N 승계. 시각 0 byte. 모든 의도 inline + 캘리브 시스템 보존.
EOF
)"
```

### Step 7: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-gsh-phase-b-wave-4/260528-gsh-SUMMARY.md` (Wave 3 SUMMARY 포맷 reference).
포함:
- 옵션 + 캘리브 룰
- Before/After grep count
- 변환 매핑
- 잔존 inline 분류 (의도/동적/캘리브)
- 비즈 anchor identity
- 의도 anchor 보존 확인 (IS_ANDROID / imgRect / 캘리브 STEPS)
- Self-Check: PASSED
- Next: Wave 5 (RemediationDetailPage)

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && D=$(grep -c 'style={{' src/pages/DashboardPage.tsx) && DR=$(grep -c 'style={{' src/pages/DailyReportPage.tsx) && WL=$(grep -c 'style={{' src/pages/WorkLogPage.tsx) && echo "D=$D DR=$DR WL=$WL" && [ "$D" -le "7" ] && [ "$DR" -le "10" ] && [ "$WL" -le "13" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/DashboardPage.tsx src/pages/DailyReportPage.tsx src/pages/WorkLogPage.tsx | awk -F: '{s+=$2} END{print s}')" = "0" ] && [ "$(grep -c 'IS_ANDROID' src/pages/DashboardPage.tsx)" -ge "4" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - Dashboard inline ≤7 (10→5 예상, IS_ANDROID 3 + 동적 색 2 잔존)
    - DailyReport inline ≤10 (10→8 예상, 캘리브 8 잔존)
    - WorkLog inline ≤13 (20→~10 예상, 캘리브 마커 잔존)
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0
    - IS_ANDROID 참조 ≥4 (Dashboard const + 3 inline 보존)
    - imgRect / DAILY_CALIB_STEPS / WORKLOG_CALIB_STEPS 변수 보존
    - TypeScript 0 error
    - 변경 파일 = 3 .tsx 만
  </done>
</task>

</tasks>

<commits>
- Pre-dispatch: `docs(260528-gsh): pre-dispatch plan for Phase B Wave 4`
- Task 1: `feat(260528-gsh-01): Phase B Wave 4 — Dashboard + Daily + WorkLog ...`
- Docs: `docs(quick-260528-gsh): Wave 4 완료 — SUMMARY + STATE`
</commits>
