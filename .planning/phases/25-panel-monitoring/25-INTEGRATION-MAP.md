# Phase 25 — Integration Map (codebase → TSX)

> Produced by a 6-agent parallel codebase sweep (line numbers re-verified against live source). This is the single source the planner/executor should wire against. All paths rooted at `cha-bio-safety/`.

## 1) MOBILE DASHBOARD — 16:9 수신반 화면 card + right-aligned 경보/점검 chip
File: `src/pages/DashboardPage.tsx`

- **Branch mechanism**: `src/hooks/useIsDesktop.ts` (`matchMedia('(min-width:1024px)')`). Consumed at `:159 const isDesktop = useIsDesktop()`; `:162 if (isDesktop){ return <desktop> }`; mobile is the fall-through return. **NOT innerWidth, NOT a CSS media class. Do not add a second mechanism.**
- **Mobile grid**: `<main>` `:489-497`, `className="flex-1 min-h-0 overflow-y-auto grid gap-[7px] px-[11px] py-[7px]"`, tracks set INLINE at `:492-496`: non-Android `'auto auto auto 1fr auto'`; Android `'auto auto auto 1fr minmax(140px, auto)'`.
- **① 오늘 점검 대상 banner**: `:499-519`. Outer `flex items-center gap-2.5`. `.flex-1` label block `:504-507`. Existing right region `latestAlarm && (…)` `:508-518` (text-right shrink-0 + blinking danger dot).
- **INSERT 16:9 card**: new grid child **between `:519` (banner close) and `:521` (② 오늘 현황)**. Wrap `bg-surface-raised border border-border-default rounded-md overflow-hidden` + inner `aspect-video`.
- **CRITICAL companion edit**: add ONE `auto` track to BOTH strings `:493-495` (5→6 children): non-Android → `'auto auto auto auto 1fr auto'`; Android → `'auto auto auto auto 1fr minmax(140px, auto)'`. Keep exactly one `1fr` (오늘 일정). Omitting the track squashes/overlaps rows.
- **Right-aligned chip in banner**: add a `shrink-0` child inside the `flex items-center gap-2.5`, after `.flex-1` (`:507`), mirroring the `latestAlarm` block. Guard with a state check. Chip tokens: `bg-surface-sunken text-text-tertiary text-caption font-bold px-1.5 py-0.5 rounded-pill`.

## 2) DESKTOP DASHBOARD — 수신반 라이브 위젯 (top of right column)
File: `src/pages/DashboardPage.tsx`

- **Desktop banner**: `:249-272`. Outer `flex items-center gap-5`; `.flex-1` `:254-257`; `latestAlarm` block `:258-271` (w-px divider + text-right shrink-0). Chip drops in as another `shrink-0` child after `:257`.
- **Right column**: `:376 <div className="w-[340px] shrink-0 flex flex-col gap-4">`. Children: 미니 캘린더 (`:378`, `shrink-0`) → 오늘 일정 (`:433`, `flex-1 min-h-0`). Row wrapper `flex gap-4 flex-1 min-h-0`.
- **INSERT live widget**: new child **immediately after `:376` and BEFORE 미니 캘린더 `:378`**. `bg-surface-raised border border-border-default rounded-lg overflow-hidden shrink-0` + inner `aspect-video`. At 340px → ~191px tall. **MUST be `shrink-0`** or it steals height from the `flex-1` 오늘 일정 card.

## 3) 화재수신반 DETAIL SURFACE — form already exists; EXTEND, don't build
- **Manual-record form ALREADY EXISTS & reusable**: `FireAlarmModal` in `src/pages/InspectionPage.tsx:5337` (mounted `:5329-5330` via `showFireAlarm` state `:4687`). Renders all 5 fields — 구분 (fire=화재보 / non_fire=비화재보 toggle, **default non_fire**), 발생일시 (date+time, KST-prefilled), 발생장소, 발생원인 (default '오작동'), 조치사항 (default '자동복구, 현장확인'). Saves via `fireAlarmApi.create({type, occurred_at:`${date} ${time}:00`, location, cause, action})` `:5353`. **Do NOT rebuild form or backend.**
- 구분 field markup `:5378`: `[['fire','화재보'],['non_fire','비화재보']].map(...)` button toggle; selected `border-2 border-danger-bar bg-danger-bg text-danger`, else `border border-border-default bg-surface-sunken text-text-secondary`. Labels `text-caption font-semibold text-text-tertiary mb-1.5 block`; `inputCls` `:5361`.
- **Backend complete & wired**: `fire_alarm_records` (`migrations/0032_fire_alarm_records.sql`), `functions/api/fire-alarm/index.ts` (GET `?year=`, GET `?recent=1`, POST), client `fireAlarmApi` `src/utils/api.ts:158`. `getByYear` exists but is currently UNUSED (greenfield history-list UI over a ready endpoint).
- **Mobile entry today**: `InspectionPage.tsx` category card `화재수신반` (CATEGORY_GROUPS index 14 `:68`, Bell icon `:92`) → onClick `:5195 if (g.categories.includes('화재수신반')){ setShowFireAlarm(true); return }`. Card label '기록' `:5205`, hasItems force-true `:5184`. **DECISION: expand this modal in place into the rich page (live card + 48h events + 점검모드 toggle + form).**
- **Desktop 3-split EXISTS but 화재수신반 NOT wired** = `DesktopInspectionView` `~:5729-6046` (left card grid `~:5805`; right pane conditional `~:5875`+). Card onClick `~:5831 setCategoryIdx/ setRecordId` has NO 화재수신반 special-case → clicking shows empty list, no form. **Greenfield: branch on `CATEGORY_GROUPS[idx].categories.includes('화재수신반')` at card onClick AND right-pane conditional → render fire-alarm detail pane (live → 경보중 초안 → events → 평상시 form).**
- Existing desktop detail `<table>` binds REMEDIATION records — copy structure, swap fields to type/occurred_at/location/cause/action.
- FireAlarmModal is a mobile `fixed` fullscreen (`top-[var(--sat)] bottom-[calc(54px+safe-area)]` `~:5364`). Form body (`~:5372-5421`) is layout-agnostic and lifts verbatim into the desktop `w-1/2` pane.

## 4) NEW `/fire-alarm` FULLSCREEN ROUTE (경보 풀스크린, push destination)
File: `src/App.tsx`

1. Lazy import beside `:16-46`: `const FireAlarmPage = lazy(() => import('./pages/FireAlarmPage'))`.
2. Route in `<Routes>` (`:266-299`): `<Route path="/fire-alarm" element={<Auth><FireAlarmPage/></Auth>} />` (mirror `/inspection :270`; `Auth` wrapper `:54-57`).
3. **Fullscreen (hide all chrome)**: add `'/fire-alarm'` to BOTH `MOBILE_NO_NAV_PATHS :72` AND `DESKTOP_NO_NAV_PATHS :75` (forgetting desktop leaves the 280px sidebar + header). `showNav` computed `:115-116`.
4. Optional `PAGE_TITLES :80`, `DESKTOP_HEADER_HIDE_PATHS :78`. For `/fire-alarm/:id`, add a regex exclusion in `showNav` (mirror `/^\/remediation\/.+/`).
5. Nav surfacing (only if wanted): mobile drawer = `SideMenu.tsx` MENU `:20-56` + server `settingsApi.getMenu()`; desktop = `DesktopSidebar.tsx:8-14` DESKTOP_SECTIONS (reads MENU directly). BottomNav has 5 hardcoded slots (`BottomNav.tsx:7-31`) — no clean 6th tab. *(Push-only destination likely needs NO nav entry.)*

## 5) DESIGN TOKENS / TAILWIND / HEADER / UI PRIMITIVES
Tokens `src/styles/tokens.css` (dark = `:root`); mapping `tailwind.config.js`.

- **Tailwind color classes = FULL semantic names.** Valid: `bg-surface-page/-raised/-sunken/-active`, `text-text-primary/-secondary/-tertiary`, `border-border-default/-strong`, `bg-accent`/`text-accent`, status fg `text-safe/-warning/-danger/-info/-fire`, bars `*-bar` (`text-danger-bar`, `border-safe-bar`), bg `*-bg` (`bg-danger-bg`, `bg-safe-bg`, `bg-fire-bg`), duty `duty-day/-night/-off/-leave`.
- **Direct answers**: `bg-raised` ❌→ `bg-surface-raised`. `text-t1` ❌→ `text-text-primary`. `border-bd` ❌→ `border-border-default`. `bg-sunken` ❌→ `bg-surface-sunken`. `text-danger-bar` ✅. `text-safe-bar` ✅.
- Short aliases (`--bg/--t1/--t3/--bd/--acl/--fire/--danger/--safe/--c-day…`, `tokens.css:177-197`) are **CSS vars only, NOT Tailwind classes** — use via inline `style={{color:'var(--fire)'}}` for data-driven colors or arbitrary `bg-[var(--x)]`.
- Key hex: surface `#0a0d12/#1a1f27/#232a33/#2c333d`; text `#e6edf3/#adb6c0/#8b949e`; accent `#3b82f6`; bars safe `#22c55e` danger `#ef4444` fire `#f97316` warning `#f59e0b` info `#0ea5e9`; fg lighter (safe `#4ade80` danger `#f87171` fire `#fb923c`). **These match the sketch `:root` exactly.**
- **Spacing override TRAP** (`tailwind.config.js:99-117`): `1=4 2=8 3=12 4=16 5=20 6=24 7=32 8=48`. So **`w-7/h-7 = 32px`, `w-8/h-8 = 48px`** (NOT 28/32). `h-12 = 48px` unaffected. Radius `rounded-sm=8 -md=12 -lg=16 -pill=99`.
- fontSize: `text-caption 12 / -label 13 / -body-sm 14 / -body 16 / -title 18(w500) / -heading 22 / -display 28`.
- **Header chrome** (`src/components/GlobalHeader.tsx`): shell `flex items-center h-12 px-3 bg-surface-raised border-b border-border-default shrink-0`; buttons `w-7 h-7 rounded-[7px] bg-surface-sunken` (=32px); title `flex-1 text-title font-semibold text-text-primary` (**font-semibold forces 600 over token's 500**). Full-screen variant (`InspectionPage.tsx:364`): same but `bg-surface-page`. Dashboard uses NEITHER (own root).
- **Reusable primitives** (`src/components/ui/index.tsx`): `Donut(pct,color,size,strokeWidth,doubleCycle)` (dashboard 76/44); `DutyChip`; `RoleLabel`; `CatBar` (2px); `StatusBadge` (8px — small, prefer local `ScheduleStatusPill` at `DashboardPage.tsx:782`). Custom SVG icons `src/components/ui/icons.tsx` (Stairs/Shutter/ExitSign/SmokeVent/HoseReel/FireExtinguisher/Elevator — lucide-compatible size/color/strokeWidth).
- lucide: `import { Monitor, Video, Radio, Bell, … } from 'lucide-react'`; `<Icon size={N} className="text-text-secondary" />`. Add new widget icons to the existing DashboardPage import line (`:5`).

## 6) DATA LAYER — panelApi/alarmApi + polling + zoom + scroll-lock + viewport
- **api.ts pattern** (`src/utils/api.ts`): NO factory — plain exported const objects delegating to shared `api` verb helper (`:70-76`). Append AFTER `workListApi` (`:708`). JWT auto-injected in `req<T>` `:31-47` (`Authorization: Bearer` from `useAuthStore.getState()`); envelope `{success,data,error}` unwrapped; **401 anywhere → hard logout+redirect `/login`** (`:62-66`, only `/auth/login` exempt); one-shot cold-retry only on network reject (not 4xx/5xx). Query strings via `new URLSearchParams()` (see `remediationApi:100-110`). Colocate `interface PanelStatus/AlarmEvent/…` beside the namespace.
  - Add `panelApi` (status/maint) + `alarmApi` (active/events/ack/**resolve**). Live image = `<img src="/api/public/panel/latest.jpg?t=<updatedAt>">` (no fetch; no-store; 204→placeholder). Snapshot = `/api/public/panel/<key>.jpg`.
  - **`alarmApi.resolve(id, body)` = `POST /api/alarm/:id/resolve`** (HANDOFF §3, 2026-07-01). body = 보완된 초안 필드 `{type, occurredAt, location, cause, action}`. Server: 자동초안 `fire_alarm_record` in-place UPDATE + 확정 + `panel_alarm status=cleared, cleared_reason='record_saved'`. **화재수신반 자동초안(경보중) '조치완료 후 저장' 버튼은 이 resolve 를 호출** (신규 `fireAlarmApi.create` 아님) — 그래야 `/api/alarm/active` 에서 빠져 대시보드 경보칩이 사라짐. 평상시 수기폼 저장만 `fireAlarmApi.create`(`POST /api/fire-alarm`, 신규). 두 저장 모두 후속 `invalidateQueries` (`['alarm-active','fire-alarm-recent']` / `['fire-alarm-recent']`).
- **react-query polling**: `useQuery({ queryKey, queryFn, staleTime, refetchInterval })` — ref `FloorPlanPage.tsx:445-450`. Use `refetchInterval` (NOT setInterval). Dashboard already queries `fireAlarmApi.getRecent()` as `['fire-alarm-recent']` (`DashboardPage.tsx:118-124`, `latestAlarm=recentAlarms[0]`); **after a create you must `invalidateQueries(['fire-alarm-recent'])` — FireAlarmModal currently does NOT (known gap to fix).**
- **Zoom/pinch/double-tap** (`src/pages/FloorPlanPage.tsx`): state+refs `:422-436`; `dist/mid/clampTranslate` `:536-552`; touch handlers `:554-637`; wheel `:640-657`; double-tap (300ms toggle 1×↔2.5×) `:660-686`; container `touchAction:'none'` + `translate3d(...)scale()` `:1011-1046`; counter-scale overlays by `1/sqrt(scale)` `:1084`. Consider extracting `usePinchZoom`.
- **Scroll-lock (no body:fixed)** (`src/components/SideMenu.tsx:91-105`): save `body.style.overflow`, set `'hidden'`, add `touchmove {passive:false}` preventDefault EXCEPT inside the panel, restore on cleanup. Lighter variant `SettingsPanel.tsx:459-468`. **Never `body.position:fixed`** — zeroes iOS safe-area.
- **Viewport units**: never bare `100vh`. Shell branches `IS_ANDROID?100svh:100dvh` (`App.tsx:66,174-195`; `index.css:35-55`). Overlays pin `top:var(--sat,0px); bottom:calc(54px+var(--sab,0px))` (measured by inline script `index.html:30-63`). Max-heights `max-h-[calc(100dvh-var(--sat,0px)-var(--sab,0px))]`.

## 7) TOP RISKS / GOTCHAS
1. **Two independent JSX trees, one file** — mobile card (`:519`) & desktop widget (`:376`) are separate edits; no shared card sub-component.
2. **Mobile grid tracks load-bearing & INLINE** (`:493-495`), TWO strings (Android + non-Android). Add a matching track or rows squash. Keep exactly one `1fr`.
3. **`w-7=32px / w-8=48px`** spacing override (54a1c8d back-button 1.5× accident). `h-12` stays 48px.
4. **Emoji-zero** — DashboardPage is emoji-free; legacy pages carry emojis (InspectionPage 🔴🟡📷, LoginPage ☎). Do NOT copy. New TSX = icon components only.
5. **Prod-inline vs design-Tailwind mismatch** — employee `production` branch has redesign-untouched pages using inline styles; Tailwind-class `old_string` given verbatim can no-op when syncing (re-patch by intent). *(Relevant only at prod-sync, not this design track.)*
6. **PWA cache** — "여전히 똑같다" → SW cache; grep-verify before telling user to reinstall; brief-window multi-push can 500 lazy chunks (empty-commit re-trigger).
7. **`aspect-video` inside scrolling `<main>` on Android** may hit intrinsic-height mis-measure — set a `min-height` and test.
8. **`latestAlarm` can be undefined** (no alarm in 48h) — guard all right-region/chip reads. Dashboard also has a MOCK fallback on API error (`:84-88`) — tolerate loading-empty + mock states.
9. **30s refetchInterval + focus refetch** re-renders DashboardPage — a live `<img>` stream must own its lifecycle (cache-bust via `?t=`, don't remount per refetch).
10. **`fixed` overlay math** — FireAlarmModal's mobile `top:var(--sat)/bottom:calc(54px+sab)` won't hold inside a `<main>` route or desktop `w-1/2` pane — re-derive when lifting.
11. **Desktop detail `<table>` binds remediationApi**, not fire_alarm_records — copy structure, swap fields.
12. **`occurred_at` is plain `'YYYY-MM-DD HH:MM:SS'`** (not ISO); `getByYear` uses `LIKE 'YYYY%'`, `getRecent` uses `datetime(occurred_at) >= now-48h`. Don't alter the form's `occurred_at` build (`InspectionPage.tsx:5353`). `public/templates/fire_alarm_template.xlsx` may consume the record shape.

## 8) SERVICE WORKER DEEP-LINK (`src/sw.ts`) — HANDOFF §2.0b (this track)
- **push handler `:34-50`**: destructures `{title, body, type}` from `event.data.json()`; `showNotification(..., { tag: type, data: { type } })`. Drops `url`/`alarmType`/`alarmId`.
- **notificationclick `:53-64`**: `notification.close()` → `matchAll({type:'window', includeUncontrolled:true})` → existing client `.focus()` (**no navigation**) else `openWindow('/')`. `data.url` ignored → always root.
- **Change (both handlers):**
  1. push: forward `url` (and `alarmType`) into `notification.data` — `data: { type, url, alarmType }` from the §1.4 superset payload `{kind,alarmType,alarmId,location,detectedAt,url}`.
  2. notificationclick: read `const url = event.notification.data?.url ?? fallback`; if an existing `WindowClient` → `client.navigate(url).then(c => c?.focus())`; else `openWindow(url)`. Fallback map by `alarmType`/`type`: `fire → '/fire-alarm'` (경보 풀스크린), `equip → 화재수신반 페이지` (mobile modal-expand = `/inspection` opening FireAlarmModal). Honor backend per-type `url` verbatim when present.
- Not a visual/UI-SPEC contract → covered in plan/execute; UI-SPEC only guarantees the deep-link **destination** (the `/fire-alarm` route + 화재수신반 surface) exists. Independent of backend/other UI (non-blocker).
- Build note: `src/sw.ts` is the injectManifest SW (workbox `precacheAndRoute(self.__WB_MANIFEST)`); editing it triggers a normal build — no config change.
