---
phase: quick-260516-uzh
plan: 01
type: execute
wave: multi
waves_count: 6
depends_on:
  - 260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag   # 직전 redesign TSX 변환 권위 (페이지 1개 단일 wave) — verify gate / lucide import / sketch verbatim 인용 패턴
  - 260515-3mc-redesign-07-elevator-tsx-wave-1-list       # 다중 wave 변환 패턴 권위 (ElevatorPage 11 wave) — wave 분할 / 영역 한정 변환 / Wave 0+ preserve marker / interface 명시 패턴
  - 260515-1p0-redesign-02-inspection-tsx-wave-5-cctv     # paired-precedent 04+05 변환 패턴 권위 — 결과/상태 배지 페어, CTA 단색 accent, 노안 12px
  - 260515-2r5-redesign-02-inspection-tsx-wave-6-powerp   # InspectionPage 모달 변환 패턴 권위 — 증상 피커 5종 / lucide / verify gate
  - 260514-tbj-redesign-02-inspection-tsx-wave-4          # 댐퍼 증상 피커 신설 패턴 권위 (자동화 5종 카테고리)
  - 260509-5xl-redesign-01-dashboard-tsx                  # Dashboard 변환 — 인라인 style 화이트리스트 + 9/10/11px 0건 패턴 권위
files_modified:
  - cha-bio-safety/src/pages/FloorPlanPage.tsx
autonomous: true
requirements:
  - REDESIGN-06-FLOORPLAN-TSX-MULTIWAVE
tags:
  - redesign
  - floorplan
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - multi-wave
  - paired-precedent-mirror

must_haves:
  truths:
    # ── 전체 페이지 보존 룰 (모든 wave 공통) ─────────────────────────────────────
    - "FloorPlanPage.tsx (현 2165줄) 의 비즈니스 로직 100% 보존 — 한 줄도 변경 X. 모든 useState (~40종) / useRef (~12종) / useMemo (cpIdToWarning, cpIdToExtType, currentMarkerTypes, addOptionMarkerTypes, currentMonth) / useEffect (~10종, planType/floor sync, paired BC 식별, resolveModal 자동 선택, 스케일 리셋 등) / useCallback (onTouchStart, onTouchMove, onTouchEnd, onWheel, handleTap, onCanvasMouseDown/Move/Up, onCanvasDblClick) / useQuery (markersQuery, extListQuery, scheduleItems) / useMutation (createMutation, updateMutation, deleteMutation, assignMutation, unassignMutation) / 핸들러 (startLongPress, cancelLongPress, onMarkerClick, onMarkerTouchStart, onMarkerMouseDown, loadAddCheckpoints, submitAddMarker, dist, mid, clampTranslate, getBalloonPos, openInspectModal, openEditMarkerModal, evalRevisit, getMarkerStatus, getFloorPlanUrl, extTypeToMarkerType) / 핀치줌 multi-touch ratio 계산 + 패닝 clamp + 더블탭 줌 + FINGER_OFFSET 60px / PDF·SVG 마커 좌표계 정규화 (x_pct, y_pct 0~1) / 자산 배치 워크플로우 (?fromMarker=, ?placingExtinguisher=, navigate('/extinguishers'), floorPlanMarkerApi.placeAsset, extinguisherApi.assign/unassign) / React Query invalidate / toast / URL searchParams sync — 한 줄도 변경 금지"
    - "InspectionRevisitPopup / AccessBlockedPopup / PhotoButton 호출 단 한 줄도 변경 없음 — 이 3 컴포넌트는 이미 v0.1.1 (260514-pnr lucide+토큰 통일 완료, FloorPlanPage 공유 자동 적용 컨펌됨). 본 multiwave 변환 영역에서는 호출 위치 시각 정합만 확인 (변환 X). props 인터페이스 그대로 (variant, checkedAt, inspectorName, recordId, onClose, onGoToRemediation / onConfirm / hook, label, noCapture)"
    - "다른 컴포넌트 (icons.tsx / GlobalHeader.tsx / BottomNav.tsx / SideMenu.tsx / DesktopSidebar.tsx / 다른 페이지 .tsx / hooks / utils / API / 라우팅 / D1 스키마 / DesignPage / App.tsx / Tailwind config / tokens.css / typography.css) 수정 0건 — 본 multi-wave 는 FloorPlanPage.tsx 단일 파일만 변경 (icons.tsx 추가 export 도 없음 — 이미 v0.1.1 인 모든 컴포넌트 그대로 활용)"

    # ── 변환 영역 검수 룰 (모든 wave 공통, 영역은 해당 wave 정의) ──────────────
    - "변환 영역 안에 인라인 style 의 정적 금지 키 0건 — color / background / backgroundColor / padding(*) / margin(*) / fontSize / fontWeight / borderRadius(*) / display / flex / flexDirection / flexShrink / flexGrow / justifyContent / alignItems / alignSelf / grid / gridTemplateColumns / gap / rowGap / columnGap / width / height / minWidth / maxWidth / minHeight / maxHeight / overflow / overflowX|Y / textAlign / lineHeight / wordBreak / whiteSpace / letterSpacing / opacity (정적) / cursor / textOverflow / boxSizing / border(*) — 모두 Tailwind utility 로 교체. **화이트리스트** (정적 금지 키 예외): position / inset / top / left / right / bottom (동적 위치 px) / transform (마커 scale·translate 동적 ratio) / transition / animation / pointerEvents / userSelect / WebkitUserSelect / WebkitTouchCallout / touchAction — 핀치줌/마커 좌표 계산 필수. 또한 marker SVG 의 fill={color} stroke={strokeColor} strokeWidth={strokeWidth} 등 동적 prop 은 화이트리스트 (마커는 §6.2 negative rule 예외 — 상태 표현 매체)"
    - "변환 영역 안에 9 / 10 / 10.5 / 11px 폰트 사이즈 0건 — 모두 Tailwind text-caption(12) / text-label(13) / text-body-sm(14) / text-body(16) / text-title(18) / text-heading(22) / text-display(28) 또는 12 이상 arbitrary value 로 격상. **노안 12px 마지노 — 04+05 paired-precedent 룰** (현재 코드의 fontSize:9/10/10.5/11 = 36 발생 추정, 모두 12 이상으로 격상)"
    - "변환 영역 안에 옛 토큰 var(--bg) / var(--bg2) / var(--bg3) / var(--bd) / var(--bd2) / var(--acl) / var(--t1) / var(--t2) / var(--t3) / var(--safe) / var(--warn) / var(--danger) / var(--fire) / var(--info) 사용 0건 — 모두 Tailwind utility (bg-surface-page/raised/sunken, text-text-primary/secondary/tertiary, border-border-default/strong, bg-{safe|warning|danger|fire|info}-bg, text-{safe|warning|danger|fire|info}, border-{safe|warning|danger|fire|info}-bar, bg-accent, text-on-accent) 로 교체"
    - "변환 영역 안에 이모지 사용 0건 — ✕ → `<X size=N />` / ℹ️ → `<Info size=N />` 또는 lucide 동등 / 인라인 SVG 헤더 back chevron (line 955) → `<ChevronLeft size=15 />` / 인라인 SVG trash icon (line 1288) → `<Trash2 size=18 />` 모두 lucide-react 컴포넌트로 통일. **단** 마커 SVG (MarkerIcon 함수 안의 polygon/circle/rect/line — 19종 분기) 는 **시각 정체성** 이므로 SVG markup 유지 (fill 속성만 토큰 var(--status-*-bar) 로 교체)"
    - "변환 영역 안에 linear-gradient 사용 0건 — line 1271 `linear-gradient(135deg,#f59e0b,#ef4444)` (조치 CTA) + line 2155 `linear-gradient(135deg,#f59e0b,#ef4444)` (조치 완료 CTA) 모두 단색 `bg-warning` 또는 `bg-fire` 로 교체 (04+05 paired-precedent 결정 — CTA 단색 채택)"
    - "변환 영역 안에 인라인 hex fill (#ef4444 / #22c55e / #eab308 / #3b82f6 / #9ca3af / #f59e0b / #fff / #888 / #000) 0건 — STATUS_COLOR Record (line 103~110) 는 객체 정의로 유지 (마커 색 동적 lookup 용) 하되 값을 `var(--status-{safe|warning|danger|fire|info}-bar)` 토큰으로 교체. 인라인 hex (예: line 1098 `outline: '2.5px solid #3b82f6'` / line 1271 그라디언트 / line 1342 `color: statusColor` 등) 는 STATUS_COLOR lookup 으로 통일. **마커 SVG 내부 stroke=\"#fff\" (line 133, 138, 145, 154, 159, 162, 174, 178 등 19종) 는 시각 정체성이므로 보존** (사용자 결정 — 마커 stroke 흰선 유지)"
    - "TypeScript 컴파일 0 에러 (`npx tsc -p . --noEmit` PASS 또는 `npm run build` PASS), 각 wave 끝나면 확인. 누적 wave 끝나도 동일"
    - "lucide-react import 신설 — 현재 import 없음. 추가 (전체 multi-wave 누적): ChevronLeft (헤더 back) / Plus (마커 추가 — 데스크톱 가이드만, 옵션) / Trash2 (마커 삭제 + admin 분리) / Edit / Settings (편집모드 토글, 옵션 — '마커 편집' 텍스트 유지도 허용) / Camera (이미 PhotoButton 안에서 사용 중, 본 페이지 직접 import 안 함) / X (모달 close + 인라인 ✕) / Info (toast 안내 icon — 옵션, toast.icon 그대로 두면 import 불필요) / AlertTriangle (danger badge — 옵션, 인라인 SVG ! 보존 권장) / Search (검색 — 도입 안 함). **최소 필수 5종**: ChevronLeft / Trash2 / X. 나머지는 wave 별 자율 (텍스트 ✕ 유지도 허용 — 현재 코드 텍스트 ✕ × 2 = line 1346, 1383)"

    # ── 도면 위 마커 SVG: status-bar 토큰 + §6.2 negative rule 예외 ─────────────
    - "STATUS_COLOR (line 103~110) 값이 인라인 hex → CSS var() 로 교체된다 — `uninspected: 'var(--text-tertiary)'` (또는 #9ca3af 유지 화이트리스트 — text-tertiary 톤 매칭) / `normal: 'var(--status-safe-bar)'` (#22c55e → safe) / `caution: 'var(--status-warning-bar)'` (#eab308 → warning, 시안 권위 — caution 은 warning 카테고리) / `bad: 'var(--status-danger-bar)'` (#ef4444 → danger) / `fault: 'var(--status-danger-bar)'` (#ef4444 → danger) / `resolved: 'var(--accent)'` (#3b82f6 → accent, 사용자 결정 — resolved 색은 accent). MarkerIcon 함수 (line 121~277) 의 fill={color} 호출은 그대로 — color prop 이 var() 문자열을 받으므로 SVG 가 자동으로 토큰 색 채택. **마커 색 토큰화 = §6.2 negative rule 예외 허용** (마커는 도면 위에서 색이 곧 상태 의미 표현 매체 — 이 변환은 토큰 정합 목적)"
    - "마커 SVG 내부 인라인 hex (stroke=\"#fff\" stroke=\"#3b82f6\" border=\"1.5px solid #fff\" background=\"#ef4444\" 등 19종 분기 안) **시각 정체성 유지** — 마커는 도면 위 시각 인식이 최우선이라 흰색 외곽 stroke / 흰색 내부 선 / danger badge 빨강 배경 등은 hex 보존 (var() 변환 안 함). 단 마커 외부 outline (line 1098 `outline: '2.5px solid #3b82f6'`) 은 `var(--accent)` 또는 ring-2 ring-accent 유틸리티로 교체"
    - "도면 위 마커 색 매핑은 코드 그대로 — STATUS_COLOR 객체 + getMarkerStatus 함수 분기 (`if (!m.last_result) return 'uninspected'`, `if ((bad|caution) && resolved) return 'resolved'`, fallback return 'uninspected') 한 줄도 변경 X. 자산 type 기반 시각 분기 (cpIdToExtType + extTypeToMarkerType) 도 그대로"

    # ── Wave 별 변환 영역 (다중 wave plan 1 → executor 가 wave 별 sub-task) ────
    - "**Wave 1 — 자체 헤더 + 도면 종류 탭 + 13층 가로 스크롤 + PDF/SVG 컨테이너 셸 + 편집모드/배치모드 안내 배너 + 범례 + 마커 오버레이 + 캔버스 기본 layout** (라인 940~1148 + 1391~1470 + 1036~1047 + 1024) — 비즈니스 로직 (핀치줌 핸들러, 마커 좌표 계산, imgRect lookup) 한 줄도 수정 X. 헤더 (line 943~979) — 모바일 자체 헤더 + 데스크톱 헤더 분기 (isDesktop), back 버튼 / 타이틀 / 마커 편집 토글 / 축소보기 버튼. PLAN_TYPES 탭 (line 981~1001) — 4 종 + 준비중 라벨. FLOORS 가로 스크롤 (line 1003~1019) — 13층 칩. 캔버스 (line 1022~1148) — `bg-[#1a1f2b]` (도면 배경 다크, sketch 권위 — line 1024 `background: '#1a1f2b'` 시안 그대로 유지) + 핀치줌 transform 화이트리스트 + 마커 오버레이 div (line 1085~1142) + 마커 SVG 분기. 편집모드 banner (line 1037~1041) `rgba(59,130,246,0.85)` → `bg-accent/85` 또는 `bg-info-bg/85`. 배치모드 banner (line 1043~1047) `rgba(239,68,68,0.9)` → `bg-danger/90`. 도면 준비중 placeholder (line 1144~1148) — `text-text-tertiary text-body-sm font-semibold`. 범례 (line 1391~1470) — `bg-surface-raised border-t border-border-default px-3 pb-[26px] pt-[1px] min-h-[93px] flex flex-col gap-2`. labelStyle (line 1395) 10.5px → text-caption(12). 미배치 ❓ 마커 SVG (line 1112~1117) 인라인 hex `#ef4444 / #fff` 보존(시각 정체성)"
    - "**Wave 2 — MarkerIcon 함수 (line 121~277) 의 STATUS_COLOR 토큰화 + 데스크톱 말풍선 + 모바일 바텀시트 (line 1150~1389)** — STATUS_COLOR 객체 (line 103~110) 값을 인라인 hex → `var(--status-*-bar)` 토큰으로 교체 (위 truths 룰). 19종 마커 SVG 함수 본체 (line 131~249) 는 fill={color} 그대로 유지 — color prop 이 토큰 문자열 받음. dangerBadge UI (line 254~275) — `background:'#ef4444'/border:'1.5px solid #fff'` 보존 (시각 정체성), text fontSize 9 → text-[10px] arbitrary 12px 미만 허용? **NO** — 12px 격상 강제. 결정: fontSize 9 → `text-[10px]`? **사용자 권위 룰 위반** — multi-wave 시작 전 이 결정 잠가야 함. **결정 잠금 (이 plan):** dangerBadge ! 텍스트는 `text-caption font-black` (12px) 로 격상, 12px 가 12px 컨테이너에 들어가도록 컨테이너도 14×14 로 확대 (현재 12×12 → 14×14, 시각 영향 미미). 데스크톱 말풍선 (line 1296~1351) — `bg-surface-raised border border-border-strong rounded-[14px] px-4 pt-[14px] pb-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)]`. 화살표 (line 1318~1326) `border-bottom: '8px solid var(--bg2)'` → `var(--surface-raised)` 토큰. 모바일 바텀시트 (line 1354~1387) — `bg-surface-raised border-t border-border-strong rounded-t-2xl px-4 pt-4 pb-5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]`. 헤더 row (line 1328~1347 데스크톱, 1365~1384 모바일) — markerLabel + 메타 (floor, ID, statusLabel, last_inspected_at). **statusColor + '22' (line 1331, 1368) backgroundColor 동적 = 화이트리스트** (마커 type 별 색 표시). **statusLabel 색 (line 1342, 1379) `color: statusColor` 동적 = 화이트리스트** (마커 상태별 색). actionButtons (line 1254~1293) — 점검 CTA (line 1263) `bg-accent text-on-accent` 단색 (현재 `var(--acl)` 그대로) + 조치 CTA (line 1271) `linear-gradient(135deg,#f59e0b,#ef4444)` → **`bg-fire`** (단색, 04+05 paired-precedent 결정 — CTA 단색, fire 톤 채택). 편집모드 수정/삭제 버튼 (line 1278~1289) — 수정 outline ghost / 삭제 admin outline danger pair (`bg-danger-bg border-danger-bar/30 text-danger`). 인라인 SVG trash (line 1288) → `<Trash2 size=18 />` lucide. ✕ (line 1346, 1383) → `<X size=16 />` / `<X size=18 />`"
    - "**Wave 3 — 점검 모달 inline (line 1723~1948)** — `position absolute inset-0 z-50 flex items-center justify-center bg-black/60` 오버레이 + `bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong max-h-[86vh] overflow-y-auto w-[90%] max-w-[340px]` 카드. 접근불가 분기 (line 1737~1745) — AccessBlockedPopup 호출 그대로, 컨테이너만 토큰화 (현재 `var(--bg2)/var(--bd2)` → 토큰). 타이틀 (line 1749) 'fontSize:15 fontWeight:700' → `text-body-sm font-bold text-text-primary`. 자산 정보 카드 (line 1754~1767) — 8 KV grid (위치/제조업체/제조년월/형식승인/접두문자/증지번호/제조번호/ID), 현재 fontSize:11 → text-caption(12) 격상 + `text-text-tertiary` 라벨 + `text-text-primary font-semibold` 값. **admin 액션 row (line 1769~1786) — 정보 수정 (outline warning?) + 소화기 분리 (outline danger).** 결정 잠금 (이 plan): 정보 수정 = `bg-surface-sunken border border-border-default text-text-secondary` (ghost outline, admin 색 매핑 04+05 mirror — 정보 수정은 warning 의미 약하므로 ghost outline 채택) / 소화기 분리 = `bg-danger-bg border border-danger-bar/30 text-danger` (admin outline danger pair). 점검 결과 3택 (line 1789~1798) — `bg-{safe|warning|danger}-bg + text-{safe|warning|danger} + border-2 border-{safe|warning|danger}-bar` 페어 (active) / `bg-surface-sunken border border-border-default text-text-tertiary` (inactive). 증상 피커 5종 (line 1800~1814) — **Wave 3 안에서 5종 정의 (유도등은 line 1802~1813 직접 + 다른 4종은 분기 추가 필요 X — FloorPlanPage 에서 needSymptom 분기는 유도등 한정 line 1730). 단 메모리 룰 `260514-sp7 증상 피커 5종` 은 InspectionPage 의 자동화 5종 카테고리 — FloorPlanPage 는 유도등만 노출되므로 본 변환은 유도등 1종만 처리**. flex flex-wrap gap-1.5 + button flex-1 basis-0 + inactive(border-default/surface-raised/text-secondary) / active(accent border + tinted bg + text-accent). textarea + PhotoButton row (line 1822~1830) — `flex gap-2 items-start` + textarea `flex-1 h-[72px] rounded-xl bg-surface-sunken border border-border-strong text-body-sm`. **paired BC 섹션 (line 1832~1870) — `border-t border-border-default my-2.5` divider + BC 카드 (`bg-surface-sunken rounded-xl px-3 py-2 border border-border-default`) + BC 점검 결과 3택 (위와 동일 페어) + BC textarea + BC PhotoButton row.** 모달 푸터 (line 1872~1944) — 취소 ghost / 저장 primary `bg-accent text-on-accent` 또는 disabled `bg-border-strong text-text-tertiary`"
    - "**Wave 4 — 자산 정보 모달 컴포넌트 (Wave 3 안의 자산 카드 + admin 액션) 의 visual polish 보강 + 마커 수정 모달 (line 1472~1585) + 자산 배치 워크플로우 UI 부분** — **Wave 3 와 겹치는 자산 카드는 Wave 3 에서 처리**, Wave 4 는 **마커 수정 모달 전용**. `bg-black/60 absolute inset-0 z-40 flex items-center justify-center` 오버레이 + `w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong max-h-[80vh] overflow-y-auto` 카드. 타이틀 (line 1476) — `text-body-sm font-bold text-text-primary mb-4`. 구역 selector (line 1480~1500) 3택 (연구동/사무동/지하) — pair pattern (`bg-accent text-on-accent` active / `bg-surface-sunken border border-border-default text-text-secondary` inactive). 마커 종류 grid (line 1502~1521) 3 컬럼 — 동일 active/inactive 페어. **MarkerIcon size=16** (line 1516) + label 2줄 (mt.label[0], mt.label[1]) — fontSize:11 → text-caption(12). 라벨 input (line 1522~1528) — `w-full px-3 py-2.5 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-body-sm`. **자산 매핑 분기 (line 1531~1559) — extinguisher plan 한정, mappedExt 있으면 '소화기 분리' admin outline danger / 미배치면 '소화기 배치' primary accent**. 푸터 (line 1561~1583) — 취소 ghost / 저장 primary. **자산 배치 워크플로우 UI** = 미배치 마커 클릭 시 navigate(`/extinguishers?fromMarker=...`) — 이 navigate 호출은 비즈니스 로직이라 변경 X, Wave 4 는 시각만"
    - "**Wave 5 — 마커 추가 모달 (line 1587~1689) — 4 옵션 (planType=extinguisher) / 6+ 옵션 (planType=guidelamp/detector/sprinkler) variant + confirm 모달 3종 (소화기 분리 line 1952~1974 / 미배치 안내 line 1977~1999 / 배치 확인 line 2001~2036)** — 추가 모달 (line 1587~1689) 구조는 Wave 4 수정 모달과 거의 동일 (구역 + 마커 종류 grid + 라벨/개소명 input + 푸터). planType=extinguisher 분기 (line 1638~1666) — 개소명 (필수) + 구역 (필수) + zone 3택. planType=guidelamp 만 구역 선택 (line 1593~1615). 인라인 hex `var(--bd2)` (disabled background, line 1683) → `bg-border-strong`. **Confirm 모달 3종** (소화기 분리/미배치 안내/배치 확인) — 모두 `position:fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4` 오버레이 + `w-[90%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong` 카드. 타이틀 (각각 '소화기 분리' / '소화기 미배치' / '소화기 배치') — `text-body-sm font-bold text-text-primary mb-2`. body 메시지 (line 1956, 1981, 2006) — `text-caption text-text-secondary mb-4 leading-relaxed` + `<strong>` 강조 `text-text-primary font-semibold`. 푸터 (각각 취소+분리 / 닫기+배치하기 / 취소+배치) — 분리 = admin outline danger pair / 배치 = primary accent (단, line 1969 `rgba(239,68,68,0.85)` 는 단색 fire 그대로 — 04+05 mirror 결정: 분리는 danger 단색 채택, '분리' CTA 단색 = `bg-danger text-on-danger`). disabled = `bg-border-strong text-text-tertiary`"
    - "**Wave 6 — 인라인 조치 모달 (line 2038~2162) + InspectionRevisitPopup 호출 (line 1691~1721) + 데스크톱 분기 정합 최종 검증 + 마무리 cleanup** — 조치 모달 (line 2038~2162) `position absolute inset-0 z-50 bg-black/60 flex items-center justify-center` 오버레이 + `w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong` 카드. 타이틀 (line 2041) — `text-body-sm font-bold text-text-primary`. 지적 메모 inline 배너 (line 2043~2047) `var(--warn) + rgba(245,158,11,.1)/.2` → **결과 배지 페어** `bg-warning-bg text-warning border border-warning-bar/30 rounded-xl px-2.5 py-1.5 text-caption mb-3`. **유도등 분기 (line 2048~2102)** — 조치 피커 3택 (본체 교체/예비전원 교체/직접 입력) — 증상 피커 페어와 동일 (`bg-accent/10 border-2 border-accent text-accent` active / inactive ghost) — accent 강조. 자재명 + 개수 + 사진 row (line 2079~2101) — input 토큰화. **비유도등 분기 (line 2103~2119)** — 단순 textarea + PhotoButton. **조치 CTA (line 2155) `linear-gradient(135deg,#f59e0b,#ef4444)` → `bg-fire text-on-fire`** (단색, 04+05 mirror — paired-precedent 결정. fire 톤이 'CTA 가 위험 조치임' 신호) / disabled `bg-border-strong text-text-tertiary`. **InspectionRevisitPopup 호출 (line 1691~1721) — 컨테이너만 토큰화** (`position:fixed inset-0 z-[60] bg-black/55 flex items-center justify-center p-4` 그대로, 안쪽 wrapper `w-[90%] max-w-[320px] min-h-[180px]`) — InspectionRevisitPopup 본체는 이미 v0.1.1 컨펌됨, 호출 한 줄도 변경 X. **데스크톱 분기 정합 최종 검증** — isDesktop 분기 (헤더 line 947, 말풍선 line 1296, getBalloonPos line 890) 가 Wave 1~5 변환 후에도 정상 동작 확인. **마무리 cleanup** — 변환 영역 전체 grep -nE 'fontSize:\\s*(9|10|10\\.5|11)' 0건 / 'var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b' 0건 / 'linear-gradient' 0건 / '#[0-9a-f]{3,6}' 변환 영역 안 0건 (마커 SVG / dangerBadge / 도면 배경 #1a1f2b 등 화이트리스트 제외)"

    # ── sketch 1:1 매핑 룰 (모든 wave 공통) ─────────────────────────────────────
    - "각 wave 변환 시 sketch CSS 정의 (`floorplan-sketch.html` line 286~648 + `floorplan-modals-sketch.html` line 293~640) 를 grep 으로 추출해 단일 진실 소스로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례 — memory `feedback_planner_prompt_sketch_verbatim`). **Wave 시작 전 `grep -n '    \\.fp-' sketch_파일` 로 클래스 정의 라인 확인 + Read 명시**. 예: Wave 1 헤더 `.fp-page-hd { height: 54px; padding: 0 16px; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); display: flex; align-items: center; gap: 10px; }` → Tailwind: `h-[54px] px-4 bg-surface-raised border-b border-border-default flex items-center gap-2.5`"
    - "04+05 paired-precedent 1:1 mirror — 결과 배지 페어 (불량 `bg-danger-bg + text-danger` / 주의 `bg-warning-bg + text-warning`) + 상태 배지 페어 (미조치 `bg-fire-bg + text-fire` / 완료 `bg-safe-bg + text-safe`) + CTA 단색 `bg-accent` 또는 `bg-fire` (그라디언트 폐기) + 노안 12px 마지노 + admin outline (정보 수정 ghost / 분리 danger). 본 multi-wave 6개 wave 모두 동일 룰 적용"
    - "도면 위 마커 색 = `var(--status-*-bar)` 토큰만 사용 (인라인 hex 0건 — STATUS_COLOR 값 토큰화 외에 마커 fill 인라인 hex 없음). 자산 type 기반 시각 분기 (cpIdToExtType + extTypeToMarkerType) 코드 그대로. 소화기 REPLACE_WARNING_STROKE 점선 외곽 (이미 옛 코드 verbatim 유지) — Wave 2 에서 stroke prop 동적 = 화이트리스트, 본 plan 의 truths 5번째 룰과 일관"
    - "소화전 paired BC nested 카드 (260428-lha 룰 — 비상콘센트 결과 3택 + textarea + photo, line 1832~1870) Wave 3 에서 처리. 5종 증상 피커 중 유도등만 FloorPlanPage 에서 노출 — 다른 4종 (소화기/소화전/방화셔터/전실제연댐퍼) 은 InspectionPage 만 적용 (메모리 룰 `260514-sp7`). FloorPlanPage 의 needSymptom 분기 (line 1730) 코드 그대로, 시각만 토큰화"
    - "**resolved 색 = `var(--accent)`** (옛 #3b82f6 verbatim 매핑) — Wave 2 STATUS_COLOR 토큰화에서 적용. 마커 outline (line 1098 `outline: '2.5px solid #3b82f6'`) 도 `outline-2 outline-accent` 또는 `ring-2 ring-accent` 로 교체"

  artifacts:
    - path: "cha-bio-safety/src/pages/FloorPlanPage.tsx"
      provides: "redesign/06-floorplan TSX multi-wave 변환 — 자체 헤더 / 도면 종류 탭 / 13층 가로 스크롤 / PDF 컨테이너 셸 / 19종 마커 SVG status-bar 토큰화 / 데스크톱 말풍선 / 모바일 바텀시트 / 점검 모달 (paired BC + 유도등 증상 피커) / 마커 수정 모달 / 마커 추가 모달 (4/6 옵션 variant) / confirm 3종 / 인라인 조치 모달 / InspectionRevisitPopup + AccessBlockedPopup 호출 위치 시각 정합 모두 v0.1.1 토큰 + Tailwind only"
      contains: "FloorPlanPage default export / MarkerIcon / getMarkerStatus / STATUS_COLOR / getFloorPlanUrl / extTypeToMarkerType / EXT_ASSET_MARKER_TYPES / PLAN_TYPES / FLOORS / GUIDELAMP_MARKER_TYPES / DETECTOR_MARKER_TYPES / SPRINKLER_MARKER_TYPES / EXTINGUISHER_MARKER_TYPES / EXTINGUISHER_ADD_OPTIONS / MARKER_TYPES_MAP / cpIdToWarning / cpIdToExtType / markersQuery / extListQuery / createMutation / updateMutation / deleteMutation / assignMutation / unassignMutation / 핀치줌 핸들러 / 마커 클릭 핸들러 / submitAddMarker / loadAddCheckpoints / openInspectModal / openEditMarkerModal / evalRevisit / getBalloonPos"
      min_lines: 2100
      max_lines: 2300

  key_links:
    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx (Wave 1~6 변환 영역)"
      to: "tailwind.config.js fontSize tokens (caption ~ display) + colors (status / text / surface / border / accent)"
      via: "Tailwind utility 클래스 (text-caption / text-label / text-body-sm / text-body / text-title / text-heading / bg-surface-page / bg-surface-raised / bg-surface-sunken / text-text-primary / text-text-secondary / text-text-tertiary / border-border-default / border-border-strong / bg-{safe|warning|danger|fire|info}-bg / text-{safe|warning|danger|fire|info} / border-{safe|warning|danger|fire|info}-bar / bg-accent / text-on-accent)"
      pattern: "text-(caption|label|body-sm|body|title|heading|display)|bg-surface-(page|raised|sunken)|text-text-(primary|secondary|tertiary|on-accent)|border-border-(default|strong)|(bg|text|border)-(safe|warning|danger|info|fire)(-bar|-bg)?|bg-accent|text-on-accent|bg-fire"

    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx (Wave 2 STATUS_COLOR 토큰화)"
      to: "tokens.css status-bar variables (--status-safe-bar / --status-warning-bar / --status-danger-bar / --status-fire-bar / --status-info-bar / --accent / --text-tertiary)"
      via: "STATUS_COLOR Record 값 = CSS var() 문자열 → MarkerIcon 의 fill={color} 가 var() 문자열을 그대로 SVG attribute 로 전달 → 브라우저가 자동 토큰 색 채택"
      pattern: "var\\(--(status-(safe|warning|danger|fire|info)-bar|accent|text-tertiary)\\)"

    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx (Wave 1~6 변환 영역)"
      to: "lucide-react (ChevronLeft / Trash2 / X / 옵션: Plus / Edit / Info / AlertTriangle)"
      via: "import 신설 (현재 import 0건 — 모든 SVG 인라인). 인라인 SVG → lucide 컴포넌트 치환 (헤더 back / 마커 삭제 / 모달 close)"
      pattern: "import\\s*\\{[^}]*(ChevronLeft|Trash2|X)[^}]*\\}\\s*from\\s+['\"]lucide-react['\"]"

    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx (Wave 3, 6 모달 내 점검/조치 CTA)"
      to: "design-system.md v0.1.1 §6.4 CTA 룰 + paired-precedent 04+05 결정 (CTA 단색 채택, 그라디언트 폐기)"
      via: "조치 CTA `linear-gradient(135deg,#f59e0b,#ef4444)` (line 1271, 2155) → `bg-fire text-on-fire` 단색 / 점검 CTA `var(--acl)` → `bg-accent text-on-accent` 단색"
      pattern: "bg-fire|bg-accent\\s+text-on-(accent|fire)"

    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx (Wave 2 마커 SVG)"
      to: "MarkerIcon 함수 19종 분기 (line 121~277) — fill={color} prop"
      via: "color prop 이 var(--status-*-bar) 문자열을 받아 SVG attribute 로 전달 — 마커는 §6.2 negative rule 예외 (색이 상태 표현 매체)"
      pattern: "MarkerIcon\\s+markerType=.*?\\s+color=\\{(statusColor|color|STATUS_COLOR)"

    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx (sketch 1:1 매핑)"
      to: "cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html (1667줄, 메인+카탈로그) + floorplan-modals-sketch.html (1487줄, 10 viewport 모달)"
      via: "각 wave 시작 전 sketch CSS 정의 grep 으로 추출 → Read 로 확정 → Tailwind utility 매핑. fp-page-hd / fp-plan-tab / fp-floor-chip / fp-canvas / fp-marker-dot / fp-bottomsheet / fp-balloon / fp-legend / fp-modal-overlay / fp-modal-card / fp-modal-section-label / fp-asset-sub-btn / fp-symptom-btn / fp-modal-cancel / fp-modal-submit / fp-confirm-card 등 모든 .fp-* 클래스를 source of truth 로"
      pattern: "06-floorplan/sketch/floorplan-(sketch|modals-sketch)\\.html"

    - from: "각 wave 끝에 verify gate"
      to: "TypeScript 0 에러 + 인라인 금지 키 0건 grep + 9/10/11px 0건 grep + 옛 토큰 0건 grep + 이모지 0건 grep + linear-gradient 0건 grep + 인라인 hex 0건 grep (마커 SVG / dangerBadge / #1a1f2b 화이트리스트 제외)"
      via: "wave 별 sub-task 마지막 단계에 verify gate 명시 — `grep -nE 'fontSize:\\s*(9|10|10\\.5|11)\\b' src/pages/FloorPlanPage.tsx` 결과를 wave 범위에 한정 검증. 모든 wave 끝나면 `npm run build` PASS"
      pattern: "verify-gate-wave-(1|2|3|4|5|6)"
---

<objective>
**redesign/06-floorplan TSX multi-wave 변환** — sketch 2 파일 (`floorplan-sketch.html` 1667줄 commit c6a2c34 + `floorplan-modals-sketch.html` 1487줄 commit 1c645c8) 권위로 `cha-bio-safety/src/pages/FloorPlanPage.tsx` (2165줄) 의 **모든 시각 layout (헤더 / 도면 종류 탭 / 13층 스크롤 / 캔버스 / 마커 오버레이 / 데스크톱 말풍선 / 모바일 바텀시트 / 점검 모달 / 자산 정보 / 마커 수정/추가 / confirm 3종 / 인라인 조치 / 범례)** 를 v0.1.1 디자인 토큰 + Tailwind only 로 교체한다.

**페이지 크기(2165줄) + 32k 출력 한계 + 04+05 paired-precedent 1:1 mirror + 도면 페이지 특수성(핀치줌·마커 SVG·자산 워크플로우 보존) 으로 6 wave 분할**:

- **Wave 1** (라인 940~1148 + 1391~1470, ~370줄 변환) — 자체 헤더 + 도면 종류 탭 + 13층 가로 스크롤 + 캔버스 shell + 마커 오버레이 div + 편집/배치 안내 배너 + 범례
- **Wave 2** (라인 103~277 + 1150~1389, ~410줄 변환) — STATUS_COLOR 토큰화 + 19종 MarkerIcon 함수 정합 + 데스크톱 말풍선 + 모바일 바텀시트
- **Wave 3** (라인 1723~1948, ~225줄 변환) — 점검 모달 inline (자산 정보 카드 + admin 액션 + 결과 3택 + 유도등 증상 피커 + textarea + paired BC nested)
- **Wave 4** (라인 1472~1585, ~114줄 변환) — 마커 수정 모달 (구역 + 마커 종류 grid + 라벨 + 자산 분리/배치 분기)
- **Wave 5** (라인 1587~1689 + 1952~2036, ~190줄 변환) — 마커 추가 모달 (4/6 옵션) + confirm 모달 3종 (소화기 분리 / 미배치 안내 / 배치 확인)
- **Wave 6** (라인 1691~1721 + 2038~2162, ~155줄 변환) — InspectionRevisitPopup 호출 컨테이너 정합 + 인라인 조치 모달 (유도등 분기 + 비유도등 분기) + 데스크톱 분기 최종 검증 + 마무리 cleanup grep

**총 변환 영역 ~1464줄 / 비변환(보존) ~700줄** (import / 상수 / 함수 / state / useEffect / useQuery / useMutation / 핀치줌 / 마커 클릭 / submitAddMarker / loadAddCheckpoints / openInspectModal / evalRevisit / getBalloonPos / 비즈니스 로직 100% 보존).

**Purpose:**
- 04+05 paired-precedent 결과/상태 배지 페어 + CTA 단색 (그라디언트 폐기) + 노안 12px 마지노 + admin outline (정보 수정 ghost / 분리 danger) — 5xl Dashboard / i4r Inspection Wave 1 / 2r5 PowerPanel / 3mc ElevatorPage Wave 1 / kmw QRScanPage Wave 1 의 변환 패턴(인라인 style 금지 키 0건 + 9/10/11px 0건 + 옛 토큰 0건 + 이모지 0건 + lucide+커스텀 아이콘 통일 + tokens.css 자동 라이트/다크 분기 + §6.1 Progress Color Rule + §6.3 카테고리 카드 일관성 + §6.5 hover + §6.7 그림자 X + §7.1 아이콘 일관성) 을 FloorPlanPage 의 모든 변환 영역에 정착
- **도면 위 마커 색 = `var(--status-*-bar)` 토큰만** — §6.2 negative rule 예외 허용 (마커는 도면 위에서 상태 표현 매체). STATUS_COLOR Record 6개 값을 인라인 hex → CSS var() 로 교체 → MarkerIcon 의 fill={color} 가 자동으로 토큰 색 채택. 마커 SVG 내부 #fff stroke 등은 시각 정체성으로 보존
- **소화기 REPLACE_WARNING_STROKE 점선 외곽 (옛 코드 verbatim 유지)** — Wave 2 에서 stroke prop 동적 = 화이트리스트로 유지, 점선 외곽 시각 정체성 보존
- **소화전 paired BC nested 카드 (260428-lha 룰)** — Wave 3 에서 비상콘센트 결과 3택 + textarea + photo, BC mapping useEffect (line 406~420) 그대로 + 시각만 토큰화
- **InspectionRevisitPopup + AccessBlockedPopup + PhotoButton 호출 위치 시각 정합** — 이 3 컴포넌트는 이미 v0.1.1 컨펌됨 (260514-pnr lucide+토큰 통일), 본 multi-wave 는 **호출 위치만 시각 정합 확인** (변환 X). props 인터페이스 그대로

**Output:**
- 비즈니스 로직 100% 보존하면서 6 wave 의 변환 영역 마크업/스타일이 sketch 2 파일과 1:1 매칭된 새 `FloorPlanPage.tsx`
- icons.tsx / 다른 페이지 .tsx / 컴포넌트 / hooks / utils / API / 라우팅 / D1 스키마 / DesignPage / App.tsx / BottomNav / DesktopSidebar / GlobalHeader / Tailwind config / tokens.css 수정 0건
- 각 wave 끝나면 `npm run build` PASS — chunk hash 자동 변경 → cbc7119-preview.pages.dev 자동 배포 대상이지만 본 multi-wave 의 verify 는 빌드 통과까지 (시각 검수는 사용자가 push 후 별도 진행, **redesign 브랜치 작업은 사용자 명시 컨펌 후에만 main 머지+배포** — memory `feedback_deploy_test`)

**핵심 메모리 룰 강제 (모든 wave 공통, 작업 전 재확인):**
- **"디자인 변경 전 상의 필수"** — sketch 권위. 시안과 다른 새 디자인 결정 시 사용자 컨펌 필요
- **"디자인 조정은 시안 먼저"** — floorplan-sketch.html 1667줄 + floorplan-modals-sketch.html 1487줄 = 마크업/색/구조 단일 진실 소스
- **"재디자인 시안은 디자인만 — 표시 분기/라벨 룰(없음/N개/X-Y/완료)은 코드 그대로"** — 미배치 ❓ 마커 판정 / paired BC 매핑 / cpIdToWarning lookup / extTypeToMarkerType 분기 / placingExtinguisher URL param / fromMarker navigate / evalRevisit pending/completed 분기 / addOptionMarkerTypes (4/6 분기) / planType=guidelamp 만 zone 노출 / planType=extinguisher 만 paired BC 시도 / canInspect / canResolve 분기 — 한 줄도 변경 금지
- **"cbc7119 = 디자인 격리 리포"** — 본 변환은 cbc7119-design 에서만 수행. 원본 PWA(cha-bio-safety) 영향 없음. 단 본 리포의 worktree 안의 cha-bio-safety/src/pages/FloorPlanPage.tsx 를 수정
- **"PWA 캐시가 배포 무시함"** — FloorPlanPage.tsx 본체 수정 → chunk hash 자동 변경. 빌드 후 `dist/assets/FloorPlanPage-*.js` 파일명 hash 차이 확인 권장
- **"운영 관찰 모드"** — 신규 기능 추가 금지. 본 multi-wave 는 시각만 교체 (비즈니스 로직 0 변경). 새 기능/필터/검색/통계 카드 도입 금지
- **"점검 완료 단일 룰"** — isCpCompleted 헬퍼 + bad+resolved 도 완료. STATUS_COLOR 의 'resolved' 색 = accent 매핑이 이 룰 시각화 (Wave 2)
- **"미조치 색 = status-fire (주황)"** — 메인 칩 fire / 상세 danger inconsistent. 결과 배지 vs 상태 배지 페어 — Wave 6 조치 모달 안의 지적 메모 inline 배너 (line 2043~2047) 색 결정 (warning vs fire) 가 이 룰 충돌점. **결정 잠금: 지적 메모 = warning 페어** (지적 = 점검 결과 caution/bad, 결과 배지 페어)
- **"BottomNav 하단 갭 구현"** — 본 페이지는 자체 헤더 + 자체 범례 (BottomNav 숨김 페이지, 03/05 mirror). 본 multi-wave 의 영향 범위 아님 (BottomNav 자체는 다른 페이지)
- **"planner 프롬프트 sketch CSS verbatim 인용 필수"** — 각 wave 시작 전 `grep -n '    \\.fp-' sketch_파일` 로 클래스 정의 라인 확인 + Read 로 본문 확정 → Tailwind utility 매핑. 추측 금지 (03-qr-scan 6건 사례)
- **"작은 컨테이너 안 text-caption → leading-none"** — 작은 영역 (헤더 토글 h-[30px], 마커 dangerBadge 14×14, 액션 row admin 분리 버튼 h-[32px] 등) 안의 text-caption(12) 은 `leading-none` 명시 (h 작은 컨테이너 안에서 lh:1.5 가 시각적 패딩으로 작용)
- **"미배치 색 = status-fire (주황)"** 아니라 sketch 권위는 `.fp-marker-empty` 가 빨강 배경 `#ef4444 / #fff text` (line 432~448 in sketch) — **미배치 ❓ 마커 = `bg-fire` 또는 `bg-danger`?** **결정 잠금 (이 plan, sketch 권위 기반): 미배치 = `bg-danger` (현재 코드 line 1113 #ef4444 = danger 일관)** — danger 톤 유지 (시안 권위)

**핵심 메모리 룰 — 작업하지 말 것 (sketch 와 코드 차이 인식):**
- sketch 데스크톱 viewport (modals-sketch VP10 line 1358~) — 모달이 화면 가운데 뜨는 모습 — 본 multi-wave 는 **데스크톱 분기 = 현재 코드 isDesktop 분기 그대로 유지** (말풍선 vs 바텀시트 vs 모달 위치 결정은 코드의 isDesktop + getBalloonPos 그대로). 데스크톱 레이아웃 자체 재구성은 별도 후속 (사용자 컨펌 필요)
- sketch 메인 (floorplan-sketch.html) 의 13층 가로 스크롤 layout (`.fp-floor-scroll`) — 본 multi-wave Wave 1 에서 시안 권위 그대로 토큰화 (현재 코드도 13층 가로 스크롤 — 라벨/순서 한 줄도 변경 X)
- sketch 마커 카탈로그 (floorplan-sketch.html line 1291~) — 19 type × 6 status = 114 셀 — 이건 design reference (디자인 시스템 카탈로그용), 본 페이지 코드와 무관 (코드는 도면 위 마커만 표시). 참조용 — 변환 대상 아님
- sketch 모달 (floorplan-modals-sketch.html) 10 viewport — VP1~VP10 각 모달의 layout/스타일 권위. Wave 3~6 가 각 viewport 매핑 (VP1 → Wave 3 점검 모달 / VP2 → Wave 3 유도등 + 증상 / VP3 → Wave 3 자산 정보 / VP4 → Wave 5 추가 모달 ext / VP5 → Wave 5 추가 모달 guidelamp / VP6 → Wave 5 confirm 3종 / VP7 → Wave 6 revisit popup / VP8 → Wave 3/6 access blocked / VP9 → Wave 3 라이트 분기 / VP10 → 데스크톱 분기 정합)
- 비즈니스 로직 (useState ~40종 / useRef ~12종 / useMemo / useEffect ~10종 / useCallback / useQuery / useMutation / 핀치줌 / 마커 클릭 핸들러 / 자산 배치 워크플로우 / API 호출 / route navigation / URL searchParams sync) 100% 보존 — 한 줄도 변경 X
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

# Sketch (단일 진실 소스 — 2 파일)
@cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html
@cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html

# 변환 대상 (2165줄)
@cha-bio-safety/src/pages/FloorPlanPage.tsx

# 06-floorplan 페이지 컨텍스트 + 디자인 시스템
@cha-bio-safety/docs/redesign-context/06-floorplan/06-floorplan.md
@cha-bio-safety/docs/redesign-context/06-floorplan/design-system.md
@cha-bio-safety/docs/redesign-context/06-floorplan/tokens.css
@cha-bio-safety/docs/redesign-context/06-floorplan/typography.css

# 이미 v0.1.1 인 컴포넌트 (호출만, 변환 X)
@cha-bio-safety/docs/redesign-context/06-floorplan/InspectionRevisitPopup.tsx
@cha-bio-safety/docs/redesign-context/06-floorplan/AccessBlockedPopup.tsx
@cha-bio-safety/docs/redesign-context/06-floorplan/PhotoButton.tsx

# 변환 영역에 사용할 외부 컴포넌트 (참조용)
@cha-bio-safety/docs/redesign-context/06-floorplan/PdfFloorPlan.tsx
@cha-bio-safety/docs/redesign-context/06-floorplan/SvgFloorPlan.tsx

# paired-precedent 04+05 (1:1 mirror — 결과/상태 배지 페어, CTA 단색, 노안 12px, admin outline)
@cha-bio-safety/src/pages/RemediationPage.tsx
@cha-bio-safety/src/pages/RemediationDetailPage.tsx

# Tailwind 토큰 설정
@cha-bio-safety/src/styles/tokens.css
@cha-bio-safety/src/styles/typography.css
@cha-bio-safety/tailwind.config.js

# multi-wave 분할 패턴 권위
@.planning/quick/260515-3mc-redesign-07-elevator-tsx-wave-1-list/260515-3mc-PLAN.md
@.planning/quick/260515-3mc-redesign-07-elevator-tsx-wave-1-list/260515-3mc-SUMMARY.md

# 직전 redesign TSX wave (verify gate / lucide / sketch verbatim 인용 패턴)
@.planning/quick/260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag/260516-kmw-PLAN.md
@.planning/quick/260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag/260516-kmw-SUMMARY.md

<interfaces>
<!-- Wave 1~6 변환 영역에서 사용할 lucide 아이콘 + 디자인 토큰 컨트랙트. 추측 금지 — 아래 verbatim 인용 사용 -->

From lucide-react (multi-wave 누적 신규 import — 최소 필수 3종):
```typescript
import {
  ChevronLeft,   // 헤더 back 버튼 (인라인 SVG → lucide), 모바일 자체 헤더 (Wave 1)
  Trash2,        // 마커 삭제 admin 액션 (인라인 SVG → lucide), 데스크톱 말풍선 + 모바일 바텀시트 (Wave 2)
  X,             // 모달 close 인라인 ✕ (line 1346, 1383) → lucide (Wave 2)
  // 옵션 (자율 판단):
  // Plus,        // 마커 추가 진입 가이드 (도입 안 함 — 현재 코드에 없음)
  // Edit,        // 편집모드 토글 (텍스트 '마커 편집' 유지 권장)
  // Info,        // toast.icon 'ℹ️' (line 761) — toast.icon 그대로 두면 import 불필요
  // AlertTriangle, // dangerBadge ! (인라인 SVG ! 보존 권장)
} from 'lucide-react';
```

From sketch CSS verbatim (`floorplan-sketch.html` 메인 영역 클래스 정의 — Wave 1 권위):
```css
/* line 286 */ .fp-page-hd { height: 54px; padding: 0 16px; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); display: flex; align-items: center; gap: 10px; }
/* line 298 */ .fp-back-btn { width: 34px; height: 34px; border-radius: 8px; background: var(--surface-sunken); border: 1px solid var(--border-default); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
/* line 307 */ .fp-page-hd-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
/* line 313 */ .fp-hd-btn { height: 30px; padding: 0 10px; border-radius: 7px; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
/* line 324 */ .fp-hd-btn.is-active { background: var(--accent); border: none; color: var(--text-on-accent); }
/* line 331 */ .fp-plan-tabs { display: flex; gap: 4px; padding: 7px 10px; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); }
/* line 338 */ .fp-plan-tab { flex: 1; padding: 6px 4px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--surface-sunken); color: var(--text-secondary); border: 1px solid var(--border-default); }
/* line 350 */ .fp-plan-tab.is-active { background: var(--accent); color: var(--text-on-accent); border: none; }
/* line 357 */ .fp-floor-scroll { overflow-x: auto; display: flex; gap: 4px; padding: 7px 10px; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); }
/* line 365 */ .fp-floor-chip { flex-shrink: 0; padding: 4px 10px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--surface-sunken); color: var(--text-secondary); border: 1px solid var(--border-default); }
/* line 377 */ .fp-floor-chip.is-active { background: var(--accent); color: var(--text-on-accent); border: none; }
/* line 384 */ .fp-canvas { flex: 1; position: relative; background: #1a1f2b; overflow: hidden; touch-action: none; }
/* line 414 */ .fp-edit-banner { position: absolute; top: 0; left: 0; right: 0; z-index: 20; padding: 6px 12px; background: var(--accent); font-size: 12px; color: var(--text-on-accent); font-weight: 600; text-align: center; pointer-events: none; }
/* line 425 */ .fp-marker-dot { position: absolute; transform: translate(-50%, -50%); cursor: pointer; pointer-events: auto; }
/* line 432 */ .fp-marker-empty { width: 13px; height: 13px; border-radius: 50%; background: var(--status-danger-bar); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; line-height: 1; }
/* line 442 */ .fp-marker-danger-badge { position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; background: var(--status-danger-bar); border: 1.5px solid var(--surface-page); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #fff; line-height: 1; }
/* line 454 */ .fp-bottomsheet { position: absolute; bottom: 0; left: 0; right: 0; background: var(--surface-raised); border-top: 1px solid var(--border-strong); border-radius: 16px 16px 0 0; padding: 16px 16px 20px; z-index: 30; box-shadow: 0 -8px 32px rgba(0,0,0,0.4); }
/* line 467 */ .fp-marker-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
/* line 471 */ .fp-marker-icon-box { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
/* line 480 */ .fp-marker-title { font-size: 16px; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
/* line 494 */ .fp-cta-row { display: flex; gap: 8px; }
/* line 495 */ .fp-cta { flex: 1; height: 46px; border-radius: 12px; border: none; color: var(--text-on-accent); font-size: 14px; font-weight: 700; cursor: pointer; background: var(--accent); display: flex; align-items: center; justify-content: center; }
/* line 505 */ .fp-cta.is-fire { background: var(--status-fire-bar); }
/* line 506 */ .fp-cta-outline { background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-primary); }
/* line 516 */ .fp-cta-delete { width: 46px; flex: 0 0 auto; background: var(--status-danger-bg); border: 1px solid var(--status-danger-bar); color: var(--status-danger-bar); }
/* line 527 */ .fp-balloon { position: absolute; width: 320px; background: var(--surface-raised); border: 1px solid var(--border-strong); border-radius: 14px; padding: 14px 16px 16px; z-index: 30; box-shadow: 0 8px 32px rgba(0,0,0,0.45); }
/* line 546 */ .fp-legend { background: var(--surface-raised); border-top: 1px solid var(--border-default); padding: 1px 12px 26px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; min-height: 93px; }
/* line 559 */ .fp-legend-item { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
/* line 563 */ .fp-legend-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; white-space: nowrap; }
/* line 568 */ .fp-legend-divider { width: 1px; height: 12px; background: var(--border-default); margin: 0 2px; flex-shrink: 0; }
```

From sketch CSS verbatim (`floorplan-modals-sketch.html` 클래스 정의 — Wave 3~6 권위):
```css
/* line 293 */ .fp-modal-overlay { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); padding: 16px; }
/* line 299 */ .fp-modal-card { width: 90%; max-width: 340px; background: var(--surface-raised); border-radius: 16px; padding: 20px; border: 1px solid var(--border-strong); max-height: 86vh; overflow-y: auto; }
/* line 307 */ .fp-modal-card.is-wide { max-width: 360px; }
/* line 310 */ .fp-modal-hd { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
/* line 314 */ .fp-modal-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
/* line 325 */ .fp-modal-sub { font-size: 12px; color: var(--text-tertiary); margin-bottom: 14px; }
/* line 330 */ .fp-modal-section-label { font-size: 12px; color: var(--text-tertiary); margin-bottom: 6px; font-weight: 500; }
/* line 338 */ .fp-modal-divider { height: 1px; background: var(--border-default); margin: 10px 0; }
/* line 360 */ .fp-asset-sub-row { display: flex; gap: 6px; margin-bottom: 14px; }
/* line 361 */ .fp-asset-sub-btn { flex: 1; height: 32px; border-radius: 8px; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; line-height: 1; }
/* line 371 */ .fp-asset-sub-btn.is-danger { background: var(--status-danger-bg); border-color: var(--status-danger-bar); color: var(--status-danger-bar); }
/* line 406 */ .fp-symptom-row { display: flex; gap: 5px; margin-bottom: 12px; flex-wrap: wrap; }
/* line 407 */ .fp-symptom-btn { flex: 1; basis: 0; padding: 9px 4px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border-default); background: var(--surface-raised); color: var(--text-secondary); font-size: 13px; font-weight: 700; line-height: 1; }
/* line 416 */ .fp-symptom-btn.is-active { border: 2px solid var(--accent); background: var(--accent-soft); color: var(--accent); }
/* line 448 */ .fp-modal-foot { display: flex; gap: 8px; margin-top: 4px; }
/* line 449 */ .fp-modal-cancel { flex: 1; height: 42px; border-radius: 10px; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; }
/* line 458 */ .fp-modal-submit { flex: 1; height: 42px; border-radius: 10px; background: var(--accent); border: none; color: var(--text-on-accent); font-size: 13px; font-weight: 700; cursor: pointer; }
/* line 467 */ .fp-modal-submit.is-danger { background: var(--status-danger-bar); }
/* line 470 */ .fp-modal-submit.is-fire { background: var(--status-fire-bar); }
/* line 537 */ .fp-confirm-card { width: 90%; max-width: 320px; background: var(--surface-raised); border-radius: 16px; padding: 20px; border: 1px solid var(--border-strong); }
/* line 544 */ .fp-confirm-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
/* line 550 */ .fp-confirm-body { font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5; }
/* line 555 */ .fp-confirm-body strong { color: var(--text-primary); font-weight: 600; }
```

From cha-bio-safety/src/pages/FloorPlanPage.tsx (변경 금지 — 비즈니스 로직 상수/함수):
```typescript
// line 17 — PlanType, PLAN_TYPES (4종, ready boolean)
type PlanType = 'guidelamp' | 'detector' | 'sprinkler' | 'extinguisher'
const PLAN_TYPES: { key: PlanType; label: string; ready: boolean }[] = [...]

// line 26 — FLOORS (13층 위→아래)
const FLOORS = ['8-1F','8F','7F','6F','5F','3F','2F','1F','B1','B2','B3','B4','B5']

// line 30~92 — 마커 type enum 4 그룹 + extTypeToMarkerType 매핑 함수 (변경 X)
type GuidelampType / DetectorType / SprinklerType / ExtinguisherType
GUIDELAMP_MARKER_TYPES / DETECTOR_MARKER_TYPES / SPRINKLER_MARKER_TYPES / EXTINGUISHER_MARKER_TYPES / EXTINGUISHER_ADD_OPTIONS
EXT_ASSET_MARKER_TYPES (Set, 4종)
function extTypeToMarkerType(extType): string  // 분말 20kg / 할로겐 / 이산화탄소 / K급 / 강화액 매핑

// line 94~100 — MarkerType union + MARKER_TYPES_MAP (4 plan type 별 lookup)

// line 103~110 — STATUS_COLOR (Wave 2 토큰화 대상)
const STATUS_COLOR: Record<string, string> = {
  uninspected: '#9ca3af',  // → var(--text-tertiary) 또는 보존
  normal:      '#22c55e',  // → var(--status-safe-bar)
  caution:     '#eab308',  // → var(--status-warning-bar)
  bad:         '#ef4444',  // → var(--status-danger-bar)
  fault:       '#ef4444',  // → var(--status-danger-bar)
  resolved:    '#3b82f6',  // → var(--accent) — 사용자 결정
}

// line 112~116 — getMarkerStatus 분기 (변경 X)
function getMarkerStatus(m: FloorPlanMarker): string  // last_result + last_status 기반 분기

// line 121~277 — MarkerIcon 함수 19종 SVG 분기 (Wave 2 정합, 본체는 fill={color} 그대로 유지)
function MarkerIcon({ markerType, color, size=20, strokeColor='#fff', strokeWidth=1.5, dangerBadge=false }): JSX.Element
// 19 case: wall_exit / ceiling_exit / stair_corridor / hallway_corridor / room_corridor / seat_corridor
//          smoke_detector / heat_detector
//          closed_head / open_head / king_head / test_valve
//          fire_extinguisher / ext_powder20 / ext_halogen / ext_kitchen_k / indoor_hydrant / descending_lifeline / div_marker
//          flame (default 분기는 fire_extinguisher 와 동일)
// dangerBadge UI (line 254~275) — 우상단 14×14 #ef4444 ! 배지 (시각 정체성, hex 보존 — fp-marker-danger-badge sketch CSS 와 동치)

// line 279~282 — getFloorPlanUrl(planType, floor): string  (변경 X)

// line 285~ — FloorPlanPage default export (변환 영역 6 wave 분할)
```

From design-system.md v0.1.1 (paired-precedent 04+05 결정 1:1 mirror):
- §6.2 negative rule — 위험 임계치 아닌 카드는 status 색 금지. **예외**: 도면 위 마커는 상태 표현 매체 → status-bar 토큰 허용
- §6.3 일관성 — 비슷한 의미 요소는 같은 색
- §6.4 CTA — paired-precedent 결정: 그라디언트 폐기, 단색 채택 (`bg-accent` 일반 / `bg-fire` 조치)
- §7.1 일관성 — lucide 통일, 인라인 SVG 폐기 (마커 SVG 19종 = 예외, 시각 정체성)
- 결과 배지 페어 (불량 `bg-danger-bg + text-danger` / 주의 `bg-warning-bg + text-warning`)
- 상태 배지 페어 (미조치 `bg-fire-bg + text-fire` / 완료 `bg-safe-bg + text-safe`)
- admin outline (정보 수정 ghost `bg-surface-sunken + text-text-secondary` / 분리 `bg-danger-bg + text-danger + border-danger-bar/30`)
- 노안 12px 마지노 — 9/10/10.5/11 모두 격상
</interfaces>

</context>

<tasks>

<task type="auto">
  <name>Task 1: Wave 1 — 자체 헤더 + 도면 종류 탭 + 13층 가로 스크롤 + 캔버스 shell + 마커 오버레이 + 안내 배너 + 범례</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
**Wave 1 변환 영역**: line 940~1148 (페이지 root + 헤더 + 탭 + 캔버스 + 마커 오버레이) + line 1391~1470 (범례).

**Step 1 — 작업 전 확인**:
1. `git branch --show-current` 출력이 `redesign/06-floorplan` 인지 확인. 아니면 사용자 컨펌 받기 (memory `feedback_check_branch_before_edit`)
2. `git status` 깨끗한지 확인 (untracked sketch 외에 modified 없어야 함)

**Step 2 — sketch CSS verbatim 추출 (이미 plan interfaces 에 인용됨, 재확인용)**:
- `grep -n '    \\.fp-page-hd\\|    \\.fp-plan-\\|    \\.fp-floor-\\|    \\.fp-canvas\\|    \\.fp-edit-banner\\|    \\.fp-marker-dot\\|    \\.fp-marker-empty\\|    \\.fp-legend' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html`
- 추출된 클래스의 background/border/padding/font 값을 Tailwind utility 로 매핑 (위 interfaces 블록 verbatim 참조)

**Step 3 — lucide-react import 신설** (현재 파일 import 없음):
- line 12 (`import { AccessBlockedPopup } from '../components/AccessBlockedPopup'`) 다음 줄에 추가:
  ```typescript
  import { ChevronLeft, Trash2, X } from 'lucide-react'
  ```
- ChevronLeft = Wave 1 헤더 back / Trash2 + X = Wave 2 에서 사용

**Step 4 — 페이지 root + 헤더 변환** (line 940~979):
- root `<div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>` → `<div className="h-full flex flex-col overflow-hidden bg-surface-page relative">`
- 헤더 `<header>` (line 945~979): isDesktop 분기 유지. 데스크톱: `h-[54px] px-5 bg-surface-raised border-b border-border-default flex-shrink-0 flex items-center gap-2.5` / 모바일: `px-3 py-2 bg-surface-raised border-b border-border-default flex-shrink-0 flex items-center gap-2`
- back 버튼 (line 953~957): 모바일만. 인라인 SVG → `<ChevronLeft size={15} className="text-text-secondary" strokeWidth={2} />` + 버튼 `w-[34px] h-[34px] rounded-lg bg-surface-sunken border border-border-default cursor-pointer flex items-center justify-center flex-shrink-0`
- 타이틀 `<span>` (line 958): `flex-1 text-body-sm md:text-body font-bold text-text-primary` (isDesktop 시 text-body=16 / 모바일 text-body-sm=14 — sketch fp-page-hd-title=14)
- 마커 편집 버튼 (line 959~972): editMode 동적 active/inactive 분기 — active: `h-[30px] px-2.5 rounded-md bg-accent border-0 text-on-accent text-caption font-semibold cursor-pointer leading-none` / inactive: `h-[30px] px-2.5 rounded-md bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer leading-none` (작은 컨테이너 leading-none 적용 — memory `feedback_text_caption_leading_none`). fontSize 11 → text-caption(12)
- 축소보기 버튼 (line 973~978): 동일 inactive ghost 패턴 `h-[30px] px-2.5 rounded-md bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer leading-none`

**Step 5 — 도면 종류 탭 변환** (line 981~1001):
- 컨테이너 `flex-shrink-0 flex gap-1 px-2.5 py-[7px] bg-surface-raised border-b border-border-default`
- 각 버튼 (line 983~999): active/inactive 분기 + ready boolean 추가 분기. active: `flex-1 px-1 py-1.5 rounded-md text-caption font-semibold bg-accent text-on-accent border-0 cursor-pointer leading-none` / inactive (ready): `flex-1 px-1 py-1.5 rounded-md text-caption font-semibold bg-surface-sunken text-text-secondary border border-border-default cursor-pointer leading-none` / disabled (!ready): inactive + `opacity-40 cursor-default`. fontSize 11 → text-caption(12)
- 준비중 배지 (line 998): `absolute top-[-6px] right-[-2px] text-[8px] bg-surface-sunken text-text-tertiary px-1 py-[1px] rounded border border-border-default` → **fontSize 8 격상 결정: 준비중 배지는 단계적 격상 보류 (sketch 권위 없음). 결정: 8px → text-caption(12) + 배지 컨테이너 확대** (`absolute top-[-8px] right-[-4px] text-caption bg-surface-sunken text-text-tertiary px-1.5 py-0.5 rounded border border-border-default leading-none`). 단, 시각이 너무 커지면 사용자 컨펌 — 현재 코드의 fontSize:8 은 12px 마지노 위반이므로 격상 필수

**Step 6 — 13층 가로 스크롤 변환** (line 1003~1019):
- 컨테이너 `flex-shrink-0 overflow-x-auto flex gap-1 px-2.5 py-[7px] bg-surface-raised border-b border-border-default`
- 각 칩 (line 1005~1018): active/inactive 분기. active: `flex-shrink-0 px-2.5 py-1 rounded-md text-caption font-semibold bg-accent text-on-accent border-0 cursor-pointer leading-none` / inactive: `flex-shrink-0 px-2.5 py-1 rounded-md text-caption font-semibold bg-surface-sunken text-text-secondary border border-border-default cursor-pointer leading-none`. fontSize 11 → text-caption(12)

**Step 7 — 캔버스 변환** (line 1022~1148):
- 컨테이너 `<div ref={containerRef}>` (line 1022~1034): `flex-1 overflow-hidden relative touch-none bg-[#1a1f2b] select-none [-webkit-user-select:none] [-webkit-touch-callout:none]` (sketch fp-canvas 권위 — background #1a1f2b 그대로). 모든 onTouchStart/Move/End/Wheel/MouseDown/Move/Up/Leave/DoubleClick/Click 핸들러 보존
- 편집모드 banner (line 1037~1041): `absolute top-0 left-0 right-0 z-20 px-3 py-1.5 bg-accent/85 text-caption text-on-accent font-semibold text-center pointer-events-none`. 메시지 문자열 그대로
- 배치모드 banner (line 1043~1047): `absolute top-0 left-0 right-0 z-20 px-3 py-[7px] bg-danger/90 text-caption text-on-accent font-bold text-center pointer-events-none`. 메시지 그대로
- 도면 wrapper (line 1050~1058): position relative + transform 동적 = 화이트리스트. `w-full h-full relative` className + 인라인 style 에 transform / transformOrigin / willChange 만 남김 (transform 동적 = 화이트리스트)
- `<img>` (line 1059~1074): onLoad 핸들러 비즈니스 로직 그대로. style → `w-full h-full object-contain block pointer-events-none select-none` + draggable={false} 그대로
- 마커 오버레이 div (line 1085~1140): position absolute + left/top/transform/cursor/zIndex/outline/borderRadius/pointerEvents — **left/top/transform = 동적 = 화이트리스트** / outline = 정적 (selected 시 `outline-2 outline-[var(--accent)]` 또는 ring-2 ring-accent — `outlineOffset: 2` 는 outline-offset-2) / cursor-pointer / pointer-events-auto / rounded-full
- 미배치 ❓ 마커 SVG (line 1112~1117): **시각 정체성 보존** — `<svg width={13} height={13} viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="6.5" fill="#ef4444"/><text x="6.5" y="10.5" fontSize={8} fill="#fff" textAnchor="middle" fontWeight={700} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>?</text></svg>` — 단 fill="#ef4444" 를 `fill="var(--status-danger-bar)"` 로 교체. fontSize 8 보존 (SVG 내부 text 는 시각 정체성, 12px 마지노 룰 적용 안 함 — 마커 SVG 예외). sketch fp-marker-empty (line 432) 권위
- MarkerIcon 호출 (line 1130~1138): props 그대로 (markerType / color / size / strokeColor / strokeWidth / dangerBadge)
- 도면 준비중 placeholder (line 1144~1148): `flex items-center justify-center h-full text-text-tertiary text-body-sm font-semibold`

**Step 8 — 범례 변환** (line 1391~1470):
- 컨테이너 (line 1405~1418): `flex-shrink-0 bg-surface-raised border-t border-border-default px-3 pb-[26px] pt-[1px] flex flex-col justify-between gap-2 min-h-[93px]` + `data-no-print` 속성 보존
- rowStyle (line 1396~1403): `flex items-center justify-between flex-wrap gap-x-2 gap-y-1.5 w-full` className 으로 교체
- itemStyle (line 1394): `flex items-center gap-1.5 flex-shrink-0`
- labelStyle (line 1395): fontSize 10.5 → **text-caption(12) leading-none** (작은 컨테이너 마지노 격상). `text-caption text-text-secondary font-medium whitespace-nowrap leading-none`
- Row 1 (line 1420~1427): currentMarkerTypes.map — MarkerIcon size=13 color="#888" → color="var(--text-tertiary)" (sketch 권위 일관성)
- Row 2 (line 1429~1466): 상태 + 미배치 + REPLACE_WARNING 분기. 상태 칩 dot (line 1432): `w-[9px] h-[9px] rounded-full` + `style={{ background: STATUS_COLOR[s] }}` (Wave 2 토큰화 대상). 미배치 dot (line 1439~1444): `w-[9px] h-[9px] rounded-full bg-danger flex items-center justify-center` + ? 텍스트 fontSize 6 → **시각 정체성 보존? 격상?** **결정 잠금: fontSize 6 → text-[10px] 격상 (12px 마지노 위반이지만 9px dot 안에 들어가는 ? 는 시각 마커 — 화이트리스트 허용)** OR 격상 강제. **선택**: dot 자체를 12×12 로 확대 + ? text-caption(12). 사용자 컨펌 받지 못한 영역이라 보수적 결정 — **9px dot + 6px text 그대로 유지 (시각 정체성, 마커 SVG 동치 — 12px 마지노 마커 SVG 예외)**. divider (line 1447): `w-px h-3 bg-border-default mx-0.5 flex-shrink-0`

**Step 9 — verify gate (Wave 1 영역 한정)**:
```bash
# 인라인 style 금지 키 grep (Wave 1 영역, 라인 940~1148 + 1391~1470)
sed -n '940,1148p;1391,1470p' cha-bio-safety/src/pages/FloorPlanPage.tsx > /tmp/wave1.tsx
# 정적 금지 키 검사 (color / background / fontSize / padding 등 정적값)
grep -nE "style=\\{\\{[^}]*?(color|background|backgroundColor|padding|margin|fontSize|fontWeight|borderRadius|display|flex|justifyContent|alignItems|gap|width|height|overflow|textAlign|lineHeight|cursor|border|opacity):" /tmp/wave1.tsx | grep -vE "(transform|transition|animation|inset|top|left|right|bottom|position|pointerEvents|WebkitUserSelect|WebkitTouchCallout|touchAction|userSelect)" 
# → 결과 0 (마커 left/top px 동적, transform scale 동적 제외 — 화이트리스트)

# 9/10/10.5/11px 0건
grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b" /tmp/wave1.tsx
# → 결과 0 (마커 SVG 내부 text fontSize=8 은 SVG 내부 attribute 라 grep 비대상)

# 옛 토큰 0건
grep -nE "var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" /tmp/wave1.tsx
# → 결과 0

# 이모지 0건 (변환 영역에 ✕/ℹ️/📷/🔍 없음 — 인라인 SVG back chevron 만 lucide 치환 대상)
grep -nP "[\\x{2600}-\\x{27BF}\\x{1F300}-\\x{1F9FF}]" /tmp/wave1.tsx
# → 결과 0

# TypeScript 컴파일
cd cha-bio-safety && npx tsc -p . --noEmit
# → 0 에러
```

**Step 10 — 커밋**:
- `git add cha-bio-safety/src/pages/FloorPlanPage.tsx`
- `git commit -m "redesign(06-floorplan): TSX Wave 1 — 헤더 + 탭 + 13층 + 캔버스 + 범례 v0.1.1 토큰+Tailwind"` (한글 OK, ASCII commit-message 별도 지정 안 해도 됨 — pages deploy 시점에만 변환 필요)
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc -p . --noEmit && echo "Wave 1 TSC PASS" && sed -n '940,1148p;1391,1470p' src/pages/FloorPlanPage.tsx | grep -cE "fontSize:\\s*(9|10|10\\.5|11)\\b|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" | grep -v '^#' | grep -q '^0$' && echo "Wave 1 GREP PASS"</automated>
  </verify>
  <done>Wave 1 변환 영역(헤더 + 탭 + 13층 + 캔버스 shell + 마커 오버레이 div + 안내 배너 + 범례)의 인라인 정적 style 금지 키 0건 / 9·10·10.5·11px 0건 / 옛 토큰 0건 / 이모지 0건. lucide ChevronLeft+Trash2+X import 신설. 비즈니스 로직 (핀치줌 핸들러 / 마커 좌표 계산 / 마커 클릭 / 자산 배치 모드 분기) 한 줄도 변경 X. TSC 0 에러. 커밋 1건.</done>
</task>

<task type="auto">
  <name>Task 2: Wave 2 — STATUS_COLOR 토큰화 + MarkerIcon 함수 정합 + 데스크톱 말풍선 + 모바일 바텀시트</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
**Wave 2 변환 영역**: line 103~110 (STATUS_COLOR 상수) + line 121~277 (MarkerIcon 함수 — fill 매핑만 변경, SVG markup 보존) + line 1150~1389 (selected 마커 상세 — 데스크톱 말풍선 + 모바일 바텀시트).

**Step 1 — sketch CSS verbatim 확인 (interfaces 블록 이미 포함)**:
- `.fp-bottomsheet` (line 454), `.fp-marker-head` (line 467), `.fp-marker-icon-box` (line 471), `.fp-marker-title` (line 480), `.fp-marker-sub-row` (line 481), `.fp-marker-close-btn` (line 485), `.fp-cta-row` (line 494), `.fp-cta` (line 495), `.fp-cta.is-fire` (line 505), `.fp-cta-outline` (line 506), `.fp-cta-delete` (line 516), `.fp-balloon` (line 527), `.fp-balloon-arrow` (line 535) 모두 interfaces 에 verbatim. Read 로 재확정 필요시 `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html` line 454~545 읽기

**Step 2 — STATUS_COLOR 토큰화** (line 103~110):
```typescript
const STATUS_COLOR: Record<string, string> = {
  uninspected: 'var(--text-tertiary)',     // #9ca3af → 토큰
  normal:      'var(--status-safe-bar)',   // #22c55e
  caution:     'var(--status-warning-bar)',// #eab308
  bad:         'var(--status-danger-bar)', // #ef4444
  fault:       'var(--status-danger-bar)', // #ef4444
  resolved:    'var(--accent)',            // #3b82f6 → accent (사용자 결정)
}
```
- MarkerIcon 함수 (line 121~277) 의 fill={color} 호출은 그대로 — color prop 이 var() 문자열을 받으므로 SVG 가 자동 토큰 색 채택
- getMarkerStatus 함수 (line 112~116) 그대로
- 범례 Row 2 의 STATUS_COLOR[s] (line 1432) 자동 적용 (Wave 1 에서 동적 style 로 남겨둠)

**Step 3 — MarkerIcon 함수 SVG 내부 hex 보존 확인** (line 121~277):
- 19종 case 각각의 SVG 안의 `stroke="#fff"` `stroke="#fff"` `fill="#fff"` 등은 **시각 정체성 — 보존**
- dangerBadge UI (line 254~275): `background: '#ef4444'` 보존 (sketch `.fp-marker-danger-badge` 도 `var(--status-danger-bar)` = #ef4444 = 동치). border `'1.5px solid #fff'` 보존 (sketch 는 `border: 1.5px solid var(--surface-page)` 라 약간 차이 — **결정 잠금: 그대로 #fff 유지** (시안과 코드 시각 동일, 도면 위 가시성 우선)). fontSize 9 → **결정 잠금: 시각 정체성 보존 (작은 ! 배지)** OR 컨테이너 14×14 + text-caption(12). **결정 잠금: 컨테이너 14×14 + fontSize 변경 없이 9px 유지 (마커 SVG 내부 text 는 12px 마지노 예외 — sketch fp-marker-danger-badge 도 12px 명시이긴 함)**. **사용자 권위 명확화 필요 — 그대로 보수적: 시각 정체성 보존, fontSize 9 유지**. sketch 권위 (12px) 와 코드 권위 (9px) 충돌 시 코드 시각 우선 (이미 사용자 시각 검수 완료된 영역)
- 단, **인라인 style 의 fontSize:9 line 269 는 인라인 정적 키 = 변환 영역 룰 위반**. 결정 잠금: `fontSize: 9` 인라인 → `text-[9px]` arbitrary value (12px 마지노 위반이지만 마커 시각 정체성 예외 화이트리스트). 차라리 SVG `<text fontSize={9}>` 으로 옮기는 게 깔끔 — **결정 잠금: dangerBadge 의 ! 텍스트를 `<svg width={14} height={14}><circle cx={7} cy={7} r={7} fill="var(--status-danger-bar)"/><circle cx={7} cy={7} r={6.25} fill="none" stroke="#fff" strokeWidth={1.5}/><text x={7} y={10} fontSize={9} fontWeight={900} fill="#fff" textAnchor="middle">!</text></svg>` 으로 통합 — 인라인 style 0 + SVG markup 으로 시각 정체성 보존**

**Step 4 — 데스크톱 말풍선 변환** (line 1296~1351):
- 컨테이너 (line 1301~1316): position absolute + 동적 left/top/bottom (getBalloonPos 계산) = 화이트리스트 + `w-[320px] bg-surface-raised border border-border-strong rounded-[14px] px-4 pt-[14px] pb-4 z-30 shadow-[0_8px_32px_rgba(0,0,0,0.45)]`
- 화살표 (line 1318~1326): position absolute + 동적 left/top/bottom = 화이트리스트. arrowDir 분기 — bottom 화살표 `border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-surface-raised` / top 화살표 `border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-surface-raised` (sketch `fp-balloon-arrow` 권위, var(--bg2) → var(--surface-raised))
- 헤더 row (line 1328~1347): `flex items-start gap-2.5 mb-3` + 아이콘 박스 `w-9 h-9 rounded-[9px] flex-shrink-0 flex items-center justify-center` + style `backgroundColor: statusColor + '22'` (동적 alpha = 화이트리스트) + `border: '1.5px solid ' + statusColor + '55'` (동적 = 화이트리스트). MarkerIcon size=20 그대로
- meta div (line 1337~1345): `flex-1 min-w-0` + 타이틀 `text-body-sm font-bold text-text-primary mb-0.5` + 메타 row `flex gap-1.5 flex-wrap items-center` + 각 span `text-caption text-text-tertiary` / status span `text-caption font-bold` + `style={{ color: statusColor }}` (동적 = 화이트리스트). 인라인 fontSize 11 → text-caption(12). 마지막 점검 날짜 (line 1343): `text-caption text-text-tertiary`
- close 버튼 (line 1346): ✕ 텍스트 → `<X size={16} className="text-text-tertiary" />` + 버튼 `bg-transparent border-0 cursor-pointer p-1 leading-none`
- actionButtons (line 1254~1293): canInspect + canResolve + editMode 분기 보존. 점검 CTA `flex-1 h-[46px] rounded-xl bg-accent border-0 text-on-accent text-body-sm font-bold cursor-pointer` (sketch fp-cta). 조치 CTA `flex-1 h-[46px] rounded-xl bg-fire border-0 text-on-accent text-body-sm font-bold cursor-pointer` (sketch fp-cta.is-fire — **linear-gradient 폐기, fire 단색 채택**). 편집모드 수정 ghost (line 1278~1283): `flex-1 h-[46px] md:h-[38px] rounded-xl md:rounded-[10px] bg-surface-sunken border border-border-default text-text-primary text-body-sm md:text-label font-semibold cursor-pointer`. 삭제 admin (line 1284~1289): `w-[46px] h-[46px] md:w-[38px] md:h-[38px] rounded-xl md:rounded-[10px] bg-danger-bg border border-danger-bar/30 text-danger flex items-center justify-center cursor-pointer flex-shrink-0` + 인라인 SVG → `<Trash2 size={18} />` (sketch fp-cta-delete)

**Step 5 — 모바일 바텀시트 변환** (line 1354~1387):
- 컨테이너 (line 1354~1362): `absolute bottom-0 left-0 right-0 bg-surface-raised border-t border-border-strong rounded-t-2xl px-4 pt-4 pb-5 z-30 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]`
- grab handle (line 1364): `w-9 h-1 rounded-sm bg-border-strong mx-auto mb-3.5` (sketch fp-bottomsheet-grab — 결정 잠금)
- 헤더 row (line 1365~1383): `flex items-start gap-3 mb-4`. 아이콘 박스 `w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center` + 동적 backgroundColor/border = 화이트리스트. 타이틀 `text-body font-bold text-text-primary mb-[3px]`. 메타 row `flex gap-2 flex-wrap` + 각 span `text-caption text-text-tertiary`. close 버튼 (line 1383): ✕ → `<X size={18} className="text-text-tertiary" />` + 버튼 `bg-transparent border-0 cursor-pointer p-1 leading-none`

**Step 6 — verify gate (Wave 2 영역 한정)**:
```bash
sed -n '103,110p;121,277p;1150,1389p' cha-bio-safety/src/pages/FloorPlanPage.tsx > /tmp/wave2.tsx
grep -nE "style=\\{\\{[^}]*?(color|background|backgroundColor|padding|margin|fontSize|fontWeight|borderRadius|display|flex|justifyContent|alignItems|gap|width|height|overflow|textAlign|lineHeight|cursor|border|opacity):" /tmp/wave2.tsx | grep -vE "(transform|transition|animation|inset|top|left|right|bottom|position|statusColor|pointerEvents|outline)"
# → 결과 0 (statusColor / outline / position 등 화이트리스트 제외)
grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b" /tmp/wave2.tsx
# → 결과 0 (dangerBadge SVG <text fontSize={9}> 는 SVG attribute, grep 비대상 — 단 인라인 style fontSize: 9 는 0건)
grep -nE "var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" /tmp/wave2.tsx
# → 결과 0
grep -nE "linear-gradient" /tmp/wave2.tsx
# → 결과 0
grep -nP "[\\x{2600}-\\x{27BF}\\x{1F300}-\\x{1F9FF}]" /tmp/wave2.tsx
# → 결과 0
cd cha-bio-safety && npx tsc -p . --noEmit
# → 0 에러
```

**Step 7 — 커밋**: `redesign(06-floorplan): TSX Wave 2 — STATUS_COLOR 토큰화 + MarkerIcon SVG fill 토큰 + 말풍선 + 바텀시트 + CTA 단색 fire 채택`
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc -p . --noEmit && echo "Wave 2 TSC PASS" && sed -n '103,110p;121,277p;1150,1389p' src/pages/FloorPlanPage.tsx | grep -cE "linear-gradient|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" | grep -v '^#' | grep -q '^0$' && echo "Wave 2 GREP PASS"</automated>
  </verify>
  <done>STATUS_COLOR 객체 값이 var() 토큰. MarkerIcon 19종 fill={color} 매핑 정합 (자동 토큰 색). dangerBadge SVG 통합 (인라인 style 0). 데스크톱 말풍선 + 화살표 + 모바일 바텀시트 + grab handle + 헤더 row + actionButtons (점검 accent / 조치 fire 단색 / 수정 ghost / 삭제 admin danger) 모두 v0.1.1. ✕ → X lucide 2건 / 인라인 SVG trash → Trash2. linear-gradient 0건. TSC 0 에러. 커밋 1건.</done>
</task>

<task type="auto">
  <name>Task 3: Wave 3 — 점검 모달 inline (자산 정보 + admin 액션 + 결과 3택 + 증상 피커 + textarea + paired BC nested)</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
**Wave 3 변환 영역**: line 1723~1948 (`{inspectModal && selected && (...)}` 인라인 점검 기록 모달).

**Step 1 — sketch CSS verbatim 확인** (interfaces 블록 이미 포함):
- `.fp-modal-overlay`, `.fp-modal-card`, `.fp-modal-hd`, `.fp-modal-title`, `.fp-modal-sub`, `.fp-modal-section-label`, `.fp-modal-divider`, `.fp-asset-sub-row`, `.fp-asset-sub-btn`, `.fp-asset-sub-btn.is-danger`, `.fp-symptom-row`, `.fp-symptom-btn`, `.fp-symptom-btn.is-active`, `.fp-modal-foot`, `.fp-modal-cancel`, `.fp-modal-submit` 권위 (modals-sketch.html line 293~470). 추가로 sketch VP1 (소화전+paired BC) + VP2 (유도등+증상 피커) + VP3 (자산 정보 + ext_powder20) 확인:
- `grep -n 'VP1\\|VP2\\|VP3' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html` → line 697, 787, 857 (Read 로 본문 100줄씩 확인)

**Step 2 — 점검 모달 오버레이 + 카드 변환** (line 1747~1748):
- 오버레이 `<div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>` → `<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setInspectModal(false)}>`
- 카드 `<div ...>` (line 1748) → `<div className="relative w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong max-h-[86vh] overflow-y-auto" onClick={e => e.stopPropagation()}>`

**Step 3 — 접근불가 분기 변환** (line 1737~1745):
- 오버레이 동일 패턴 + 카드 `relative w-[90%] max-w-[340px] h-[290px] bg-surface-raised rounded-2xl border border-border-strong`. AccessBlockedPopup 호출 그대로 (이미 v0.1.1)

**Step 4 — 타이틀 + 부제 변환** (line 1749~1752):
- 타이틀 `<div>점검 기록 입력</div>` → `<div className="text-body font-bold text-text-primary mb-1">점검 기록 입력</div>` (sketch fp-modal-title=16px)
- 부제 markerLabel · floor → `<div className="text-caption text-text-tertiary mb-3.5">{markerLabel} · {floor}</div>` (sketch fp-modal-sub=12px)

**Step 5 — 자산 정보 카드 변환** (line 1754~1767, planType==='extinguisher' + inspectExtDetail 분기):
- 컨테이너 `<div className="bg-surface-sunken rounded-[10px] px-3 py-2.5 border border-border-default mb-2">`
- 8 KV grid `<div className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption">` (sketch VP3 권위, fontSize 11 → text-caption=12)
- 각 KV: `<div><span className="text-text-tertiary">위치 </span><span className="text-text-primary font-semibold">{inspectExtDetail.location}</span></div>` (값 fallback 분기 그대로)

**Step 6 — admin 액션 row 변환** (line 1769~1786, 정보 수정 + 소화기 분리):
- row `<div className="flex gap-1.5 mb-3.5">`
- 정보 수정 버튼 (line 1771~1777): `flex-1 h-8 rounded-lg bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer leading-none` (sketch fp-asset-sub-btn ghost outline). fontSize 11 → text-caption(12) + leading-none
- 소화기 분리 버튼 (line 1778~1784): `flex-1 h-8 rounded-lg bg-danger-bg border border-danger-bar/30 text-danger text-caption font-semibold cursor-pointer leading-none` (sketch fp-asset-sub-btn.is-danger admin outline)

**Step 7 — 점검 결과 3택 변환** (line 1788~1798):
- 라벨 (line 1788): `text-caption text-text-tertiary mb-1.5 font-medium` (sketch fp-modal-section-label)
- row `<div className="flex gap-1.5 mb-3.5">`
- 각 버튼 (line 1790~1797): active/inactive 페어. **active** (val === normal/caution/bad 별 색 차이): `bg-{safe|warning|danger}-bg text-{safe|warning|danger} border-2 border-{safe|warning|danger}-bar flex-1 px-1 py-2.5 rounded-[10px] text-caption font-bold cursor-pointer` / **inactive**: `bg-surface-sunken text-text-tertiary border border-border-default flex-1 px-1 py-2.5 rounded-[10px] text-caption font-bold cursor-pointer`. fontSize 12 유지. **결과 배지 페어 1:1 mirror — 04+05**

**Step 8 — 증상 피커 변환** (line 1800~1814, needSymptom 분기, 유도등만):
- 라벨 (line 1802): `text-caption text-text-tertiary mb-1.5 font-medium`
- row `<div className="flex gap-1.5 mb-2.5">`
- 각 버튼 (line 1804~1811): active/inactive 페어. **active**: `flex-1 basis-0 px-1 py-2.5 rounded-[10px] border-2 border-accent bg-accent/10 text-accent text-caption font-bold cursor-pointer leading-none` (sketch fp-symptom-btn.is-active) / **inactive**: `flex-1 basis-0 px-1 py-2.5 rounded-[10px] border border-border-default bg-surface-raised text-text-secondary text-caption font-bold cursor-pointer leading-none` (sketch fp-symptom-btn)

**Step 9 — textarea + PhotoButton row 변환** (line 1816~1830):
- 라벨 row (line 1816~1821): `flex items-center justify-between mb-1.5` + label `text-caption font-semibold text-text-tertiary tracking-wide leading-none` (fontSize 10 → 12 격상, letterSpacing 0.05em → tracking-wide arbitrary) + span `text-caption text-text-tertiary leading-none`
- input row `<div className="flex gap-2 items-start mb-3.5">`
- textarea (line 1823~1828): `flex-1 h-[72px] px-[11px] py-2.5 rounded-xl bg-surface-sunken border border-border-strong text-text-primary text-caption resize-none font-inherit outline-none box-border` (fontSize 12 유지)
- PhotoButton hook + label="촬영" + noCapture 그대로

**Step 10 — paired BC 섹션 변환** (line 1832~1870, pairedBC 분기 — 소화전 마커 only):
- divider (line 1835): `<div className="h-px bg-border-default my-2.5" />`
- BC 카드 (line 1836~1840): `<div className="bg-surface-sunken rounded-[10px] px-3 py-2 border border-border-default mb-2.5">` + category `text-caption text-text-tertiary leading-none` + location `text-label font-bold text-text-primary mt-px leading-tight` + description `text-caption text-text-tertiary mt-0.5 leading-none`
- 결과 라벨 (line 1842): `text-caption font-semibold text-text-tertiary mb-1.5 tracking-wide leading-none`
- 결과 3택 row (line 1843~1853): Step 7 와 동일 페어 (active/inactive)
- 특이사항/사진 라벨 row (line 1854~1858): Step 9 와 동일
- textarea + PhotoButton row (line 1859~1867): Step 9 와 동일

**Step 11 — 푸터 변환** (line 1872~1944):
- row `<div className="flex gap-2">`
- 취소 (line 1873~1875): `flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer` (sketch fp-modal-cancel)
- 저장 (line 1876~1943): **disabled 분기** (`inspectSubmitting || photo.uploading || isAccessBlocked`) → `bg-border-strong text-text-tertiary cursor-default` / **enabled**: `flex-1 h-[42px] rounded-[10px] bg-accent border-0 text-on-accent text-label font-bold cursor-pointer` (sketch fp-modal-submit). 라벨 분기 (`사진 업로드 중...` / `저장 중...` / `접근 불가 개소` / `저장`) 그대로

**Step 12 — verify gate**:
```bash
sed -n '1723,1948p' cha-bio-safety/src/pages/FloorPlanPage.tsx > /tmp/wave3.tsx
grep -nE "style=\\{\\{[^}]*?(color|background|backgroundColor|padding|margin|fontSize|fontWeight|borderRadius|display|flex|justifyContent|alignItems|gap|width|height|textAlign|lineHeight|cursor|border|opacity):" /tmp/wave3.tsx | grep -vE "(transform|transition|animation|position|inset|top|left|right|bottom|color:\\s*'#fff'|pointerEvents|outline)"
# → 결과 0
grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b" /tmp/wave3.tsx
# → 결과 0
grep -nE "var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" /tmp/wave3.tsx
# → 결과 0
grep -nE "rgba\\(239,68,68|rgba\\(245,158,11|rgba\\(34,197,94|rgba\\(59,130,246" /tmp/wave3.tsx
# → 결과 0 (인라인 rgba alpha → 페어 토큰 교체 완료)
cd cha-bio-safety && npx tsc -p . --noEmit
```

**Step 13 — 커밋**: `redesign(06-floorplan): TSX Wave 3 — 점검 모달 + paired BC nested + 증상 피커 v0.1.1`
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc -p . --noEmit && echo "Wave 3 TSC PASS" && sed -n '1723,1948p' src/pages/FloorPlanPage.tsx | grep -cE "rgba\\(239,68,68|rgba\\(245,158,11|rgba\\(34,197,94|rgba\\(59,130,246|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" | grep -v '^#' | grep -q '^0$' && echo "Wave 3 GREP PASS"</automated>
  </verify>
  <done>점검 모달 오버레이 + 카드 + 자산 정보 KV grid + admin 액션 (정보 수정 ghost / 분리 admin danger) + 점검 결과 3택 (페어) + 증상 피커 (유도등) + textarea + PhotoButton + paired BC nested (BC 카드 + 결과 + textarea + photo) + 푸터 (취소 ghost / 저장 primary) 모두 v0.1.1. 인라인 rgba alpha 0건. TSC 0. 커밋 1건.</done>
</task>

<task type="auto">
  <name>Task 4: Wave 4 — 마커 수정 모달 (구역 + 종류 grid + 라벨 + 자산 분리/배치 분기)</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
**Wave 4 변환 영역**: line 1472~1585 (`{editMarker && selected && (...)}` 마커 수정 모달).

**Step 1 — sketch VP4/VP5 권위 확인**: floorplan-modals-sketch.html line 938~1099 (마커 추가 — Wave 5 영역이지만 layout 패턴 동일). 마커 수정 layout = 추가 layout - 라벨 input + 자산 액션 row.

**Step 2 — 오버레이 + 카드 변환** (line 1474~1475):
- 오버레이 `<div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60" onClick={() => setEditMarker(false)}>`
- 카드 `<div className="w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>`

**Step 3 — 타이틀** (line 1476): `<div className="text-body font-bold text-text-primary mb-4">마커 수정</div>`

**Step 4 — 구역 selector** (line 1478~1500, guidelamp/extinguisher 분기):
- 라벨 (line 1480): `text-caption text-text-tertiary mb-1.5 font-medium`
- row `<div className="flex gap-1.5 mb-3.5">`
- 3택 버튼 (line 1487~1497): active/inactive. **active**: `flex-1 py-2 rounded-lg text-caption font-bold bg-accent text-on-accent border-0 cursor-pointer leading-none` / **inactive**: `flex-1 py-2 rounded-lg text-caption font-bold bg-surface-sunken text-text-secondary border border-border-default cursor-pointer leading-none`. fontSize 12 → text-caption=12 유지

**Step 5 — 마커 종류 라벨 + grid** (line 1502~1521):
- 라벨 (line 1502, planType 별 분기): `text-caption text-text-tertiary mb-1.5 font-medium`
- grid (line 1503): `grid grid-cols-3 gap-1.5 mb-3.5`
- 각 셀 (line 1504~1519): active/inactive. **active**: `px-1 py-2 rounded-lg text-caption font-semibold bg-accent text-on-accent border-0 cursor-pointer flex flex-col items-center gap-[3px] leading-tight` / **inactive**: `px-1 py-2 rounded-lg text-caption font-semibold bg-surface-sunken text-text-secondary border border-border-default cursor-pointer flex flex-col items-center gap-[3px] leading-tight`. MarkerIcon size=16 + color 동적 (active="var(--text-on-accent)" 또는 #fff / inactive=#888 → "var(--text-tertiary)"). fontSize 11 → text-caption(12)

**Step 6 — 라벨 input** (line 1522~1528):
- 라벨 (line 1522, planType 별 '개소명'/'라벨'): `text-caption text-text-tertiary mb-1.5 font-medium`
- input: `w-full px-3 py-2.5 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-label mb-3.5 box-border`

**Step 7 — 자산 매핑 분기 (extinguisher 한정, line 1530~1559)**:
- mappedExt 있으면 (line 1536~1546): row `flex gap-2 mb-3.5` + 소화기 분리 버튼 `flex-1 py-2 rounded-lg text-caption font-bold bg-danger-bg text-danger border border-danger-bar/30 cursor-pointer leading-none`
- 미배치 (line 1549~1558): 단독 버튼 `w-full h-[42px] rounded-[10px] bg-accent border-0 text-on-accent text-label font-bold cursor-pointer mb-3.5`. onClick + navigate 분기 그대로

**Step 8 — 푸터 row** (line 1561~1583):
- row `flex gap-2`
- 취소 (line 1562): `flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer`
- 저장 (line 1565~1582): `flex-1 h-[42px] rounded-[10px] bg-accent border-0 text-on-accent text-label font-bold cursor-pointer`. updateMutation.mutate 분기 그대로

**Step 9 — verify gate**:
```bash
sed -n '1472,1585p' cha-bio-safety/src/pages/FloorPlanPage.tsx > /tmp/wave4.tsx
grep -nE "style=\\{\\{[^}]*?(color|background|padding|fontSize|borderRadius|display|flex|gap|width|height):" /tmp/wave4.tsx | grep -vE "(transform|position|inset|top|left|right|bottom)"
# → 결과 0
grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b|rgba\\(239,68,68|linear-gradient" /tmp/wave4.tsx
# → 결과 0
cd cha-bio-safety && npx tsc -p . --noEmit
```

**Step 10 — 커밋**: `redesign(06-floorplan): TSX Wave 4 — 마커 수정 모달 + 자산 분리/배치 분기 v0.1.1`
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc -p . --noEmit && echo "Wave 4 TSC PASS" && sed -n '1472,1585p' src/pages/FloorPlanPage.tsx | grep -cE "fontSize:\\s*(9|10|10\\.5|11)\\b|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b|rgba\\(239,68,68|linear-gradient" | grep -v '^#' | grep -q '^0$' && echo "Wave 4 GREP PASS"</automated>
  </verify>
  <done>마커 수정 모달 오버레이 + 카드 + 타이틀 + 구역 selector 3택 + 마커 종류 grid 3컬럼 (active/inactive 페어) + 라벨 input + 자산 매핑 분기 (소화기 분리 admin danger / 소화기 배치 primary accent) + 푸터 모두 v0.1.1. updateMutation / setEditMarker / navigate 호출 한 줄도 변경 X. TSC 0. 커밋 1건.</done>
</task>

<task type="auto">
  <name>Task 5: Wave 5 — 마커 추가 모달 (4/6 옵션 variant) + confirm 모달 3종</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
**Wave 5 변환 영역**: line 1587~1689 (`{addModal && (...)}` 마커 추가 모달) + line 1952~2036 (confirm 모달 3종 — unassignConfirm + emptyMarkerModal + placingConfirm).

**Step 1 — sketch VP4 (extinguisher) / VP5 (guidelamp) / VP6 (confirm 3종) 권위 확인**: modals-sketch.html line 938~1099 + 1103~1166. 추가 모달 layout = 수정 모달 layout + planType 분기 (개소명 필수 + 구역 필수 / 라벨 선택).

**Step 2 — 마커 추가 모달 변환** (line 1587~1689):
- 오버레이 (line 1589) → `absolute inset-0 z-40 flex items-center justify-center bg-black/60`
- 카드 (line 1590) → `w-[85%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong`
- 타이틀 (line 1591) → `text-body font-bold text-text-primary mb-4 → 마커 추가`
- guidelamp 구역 selector (line 1593~1615): Wave 4 Step 4 와 동일 패턴
- 마커 종류 grid (line 1617~1635): Wave 4 Step 5 와 동일. **단 onClick: `setAddMarkerType + setAddCheckpointId(null) + loadAddCheckpoints(mt.key)` 호출 그대로**
- extinguisher 분기 (line 1638~1666): 개소명 input + 구역 selector. 라벨 (line 1640) `text-caption text-text-tertiary mb-1.5` + input `w-full px-3 py-2.5 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-label mb-3.5 box-border`. 구역 선택 (line 1647~1665): Wave 4 Step 4 와 동일
- guidelamp/detector/sprinkler 분기 (line 1667~1677): 라벨 input
- 푸터 row (line 1679~1687): 취소 + 추가. **disabled 분기** (`addSubmitting`) → `bg-border-strong text-text-tertiary cursor-default` / enabled → `bg-accent text-on-accent`. submitAddMarker 호출 그대로

**Step 3 — Confirm 모달 1: 소화기 분리** (line 1952~1974):
- 오버레이 (line 1953) → `fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4`
- 카드 (line 1954) → `w-[90%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong` (sketch fp-confirm-card)
- 타이틀 (line 1955): `text-body font-bold text-text-primary mb-2 → 소화기 분리` (sketch fp-confirm-title)
- body (line 1956~1958): `text-caption text-text-secondary mb-4 leading-relaxed` + `<strong>` → `<span className="text-text-primary font-semibold">`
- 푸터 (line 1959~1971): 취소 ghost + 분리 admin danger. **분리 CTA 단색 결정 잠금**: `bg-danger text-on-accent border-0` (sketch fp-modal-submit.is-danger 권위 — `rgba(239,68,68,0.85)` → `bg-danger` 단색). disabled `bg-border-strong text-text-tertiary`. unassignMutation.mutate 호출 그대로

**Step 4 — Confirm 모달 2: 미배치 안내** (line 1977~1999):
- 오버레이/카드 동일 패턴
- 타이틀: `소화기 미배치`
- body (line 1981~1984): `<br/>` 줄바꿈 포함 그대로 + 토큰화
- 푸터 (line 1985~1997): 닫기 ghost + 배치하기 primary `bg-accent text-on-accent`. navigate 호출 그대로

**Step 5 — Confirm 모달 3: 배치 확인** (line 2001~2036):
- 오버레이/카드 동일 패턴
- 타이틀: `소화기 배치`
- body (line 2006~2008): 동일 패턴
- 푸터 (line 2009~2034): 취소 + 배치 primary. disabled (`assignMutation.isPending`) → `bg-border-strong text-text-tertiary`. assignMutation.mutateAsync / floorPlanMarkerApi.placeAsset / qc.invalidateQueries / navigate 호출 그대로

**Step 6 — verify gate**:
```bash
sed -n '1587,1689p;1952,2036p' cha-bio-safety/src/pages/FloorPlanPage.tsx > /tmp/wave5.tsx
grep -nE "style=\\{\\{[^}]*?(color|background|padding|fontSize|borderRadius|display|flex|gap|width|height):" /tmp/wave5.tsx | grep -vE "(transform|position|inset|top|left|right|bottom|pointerEvents)"
# → 결과 0
grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b|rgba\\(239,68,68|linear-gradient" /tmp/wave5.tsx
# → 결과 0
cd cha-bio-safety && npx tsc -p . --noEmit
```

**Step 7 — 커밋**: `redesign(06-floorplan): TSX Wave 5 — 마커 추가 + confirm 3종 (분리/미배치/배치) v0.1.1`
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc -p . --noEmit && echo "Wave 5 TSC PASS" && sed -n '1587,1689p;1952,2036p' src/pages/FloorPlanPage.tsx | grep -cE "fontSize:\\s*(9|10|10\\.5|11)\\b|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b|rgba\\(239,68,68|linear-gradient" | grep -v '^#' | grep -q '^0$' && echo "Wave 5 GREP PASS"</automated>
  </verify>
  <done>마커 추가 모달 (구역 + 종류 grid + 개소명/라벨 + 푸터, 4/6 옵션 variant) + Confirm 3종 (소화기 분리 admin danger / 미배치 안내 / 배치 확인 primary accent) 모두 v0.1.1. submitAddMarker / unassignMutation / assignMutation / navigate / floorPlanMarkerApi.placeAsset 호출 한 줄도 변경 X. TSC 0. 커밋 1건.</done>
</task>

<task type="auto">
  <name>Task 6: Wave 6 — 인라인 조치 모달 + InspectionRevisitPopup 컨테이너 정합 + 데스크톱 분기 검증 + 마무리 cleanup</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
**Wave 6 변환 영역**: line 1691~1721 (InspectionRevisitPopup 컨테이너) + line 2038~2162 (인라인 조치 모달) + 데스크톱 분기 최종 검증 + 전체 페이지 마무리 grep.

**Step 1 — InspectionRevisitPopup 컨테이너 정합** (line 1691~1721):
- 오버레이 (line 1693): `<div className="fixed inset-0 z-[60] bg-black/55 flex items-center justify-center p-4">` (sketch VP7 권위, padding 16 → p-4)
- inner wrapper (line 1694): `<div className="relative w-[90%] max-w-[320px] min-h-[180px]">`
- InspectionRevisitPopup 호출 (line 1695~1718): props 그대로 (variant / checkedAt / inspectorName / recordId / onClose / onGoToRemediation). onClose 안의 분기 (`wasCompleted` + setRevisitPopup(null) + setInspectModal(true) + setInspectExtDetail 등) 비즈니스 로직 한 줄도 변경 X. **InspectionRevisitPopup 본체 = 이미 v0.1.1** (260514-pnr 컨펌)

**Step 2 — 조치 모달 오버레이 + 카드** (line 2039~2040):
- 오버레이 → `absolute inset-0 z-50 flex items-center justify-center bg-black/60`
- 카드 → `w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong`

**Step 3 — 타이틀 + 부제** (line 2041~2042):
- 타이틀: `text-body font-bold text-text-primary mb-1 → 조치 입력`
- 부제 `selected.label · floor` (line 2042): `text-caption text-text-tertiary mb-1`

**Step 4 — 지적 메모 inline 배너 변환** (line 2043~2047, last_memo 분기):
- 결정 잠금 — **결과 배지 페어 (warning)**: `text-caption text-warning mb-3 bg-warning-bg border border-warning-bar/20 rounded-lg px-2.5 py-1.5` (sketch fp-symptom + 04+05 mirror — '지적' = 점검 caution/bad 결과이므로 warning 페어). 옛 `var(--warn) + rgba(245,158,11,.1)/.2` → 페어 토큰 통일

**Step 5 — 유도등 분기 (planType==='guidelamp', line 2048~2102)**:
- 조치 피커 3택 row (line 2051~2060): 증상 피커와 동일 페어 (active `border-2 border-accent bg-accent/10 text-accent flex-1 px-1 py-2.5 rounded-[10px] text-caption font-bold cursor-pointer leading-none` / inactive `border border-border-default bg-surface-sunken text-text-secondary flex-1 px-1 py-2.5 rounded-[10px] text-caption font-bold cursor-pointer leading-none`)
- 직접 입력 분기 textarea (line 2063~2070): `w-full h-[72px] px-[11px] py-2.5 rounded-xl bg-surface-sunken border border-border-strong text-text-primary text-caption resize-none font-inherit outline-none box-border mb-2.5`
- 소모 자재 라벨 row (line 2073~2076): `flex items-center justify-between mb-1.5` + label `text-caption font-semibold text-text-tertiary tracking-wide leading-none` + span `text-caption text-text-tertiary leading-none`
- 자재명 + 개수 + 사진 row (line 2079~2101): 복잡한 input row — `flex gap-2 items-start mb-3.5 max-w-full`. inner column `flex-1 min-w-0 flex flex-col gap-1 h-[72px]`. 자재명 input `flex-1 min-h-0 min-w-0 w-full px-2.5 rounded-lg bg-surface-sunken border border-border-strong text-text-primary text-label box-border font-inherit`. 개수 wrapper `relative flex-1 min-h-0 min-w-0` + input `w-full h-full min-w-0 pl-2.5 pr-7 rounded-lg bg-surface-sunken border border-border-strong text-text-primary text-label box-border font-inherit`. ea 단위 (line 2097): position absolute + right-2.5 top-1/2 -translate-y-1/2 + `text-caption text-text-tertiary pointer-events-none`. PhotoButton 그대로

**Step 6 — 비유도등 분기 (line 2103~2119)**:
- 라벨 row (line 2105~2108): Step 5 와 동일
- textarea + PhotoButton row (line 2109~2117): Wave 3 Step 9 패턴 동일

**Step 7 — 푸터 변환** (line 2120~2160):
- 취소 (line 2121~2123): `flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer`
- 조치 완료 CTA (line 2124~2158): **disabled** (`resolveSubmitting || resolvePhoto.uploading`) → `bg-border-strong text-text-tertiary cursor-default` / **enabled** → `bg-fire border-0 text-on-accent flex-1 h-[42px] rounded-[10px] text-label font-bold cursor-pointer` (sketch fp-modal-submit.is-fire — **linear-gradient 폐기, fire 단색 채택, 04+05 mirror**). resolveActionPick / finalMemo / materialsString / api.post / qc.invalidateQueries 호출 한 줄도 변경 X

**Step 8 — 데스크톱 분기 최종 검증**:
- `grep -n "isDesktop" cha-bio-safety/src/pages/FloorPlanPage.tsx` 모든 isDesktop 분기 확인 (헤더 line 947, 951, 954 / 마커 클릭 line 749 / 캔버스 mouse 핸들러 line 810~813, 816~819, 846~847, 866~868 / 말풍선 line 1296 / actionButtons line 1280, 1284 / canInspect canResolve line 1168~1169 / getBalloonPos line 891)
- 변환 후 데스크톱 분기 시각이 정상인지 확인 (Wave 1~5 가 모두 isDesktop 분기 보존했는지)

**Step 9 — 마무리 cleanup grep (전체 파일)**:
```bash
# 9·10·10.5·11px 0건 (전체 파일)
grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b" cha-bio-safety/src/pages/FloorPlanPage.tsx
# → 결과 0

# 옛 토큰 0건 (전체 파일)
grep -nE "var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" cha-bio-safety/src/pages/FloorPlanPage.tsx
# → 결과 0

# linear-gradient 0건 (전체 파일)
grep -nE "linear-gradient" cha-bio-safety/src/pages/FloorPlanPage.tsx
# → 결과 0

# 인라인 rgba alpha 0건 (변환 영역 — 마커 SVG / dangerBadge / 도면 배경 제외)
grep -nE "rgba\\(239,68,68|rgba\\(245,158,11|rgba\\(34,197,94|rgba\\(59,130,246" cha-bio-safety/src/pages/FloorPlanPage.tsx | grep -v "MarkerIcon\\|dangerBadge"
# → 결과 0 (또는 마커 SVG / textShadow 화이트리스트만 남음)

# 이모지 0건 (변환 영역 — 마커 SVG 예외)
grep -nP "[\\x{2600}-\\x{27BF}\\x{1F300}-\\x{1F9FF}]" cha-bio-safety/src/pages/FloorPlanPage.tsx
# → 결과 0 또는 toast.icon 'ℹ️' (line 761) — 이건 비즈니스 로직 (toast 옵션) 이라 보존 화이트리스트

# TypeScript 0 에러
cd cha-bio-safety && npx tsc -p . --noEmit
# → PASS

# npm build PASS — 최종 검증
cd cha-bio-safety && npm run build
# → PASS, dist/assets/FloorPlanPage-*.js chunk hash 자동 변경
```

**Step 10 — 커밋**: `redesign(06-floorplan): TSX Wave 6 — 조치 모달 + RevisitPopup 컨테이너 + cleanup. multi-wave 완료`
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc -p . --noEmit && npm run build 2>&1 | tail -20 && grep -cE "fontSize:\\s*(9|10|10\\.5|11)\\b|var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b|linear-gradient" src/pages/FloorPlanPage.tsx | grep -v '^#' | grep -q '^0$' && echo "Wave 6 FINAL CLEANUP PASS"</automated>
  </verify>
  <done>InspectionRevisitPopup 컨테이너 정합 (호출 본체 변경 X). 인라인 조치 모달 (지적 메모 inline warning 페어 + 유도등 분기 조치 피커 + 자재명/개수/사진 row + 비유도등 분기 textarea + 조치 완료 CTA fire 단색 [linear-gradient 폐기]) 모두 v0.1.1. 데스크톱 분기 (isDesktop) 정상 동작 확인. 전체 파일 9·10·11px 0건 / 옛 토큰 0건 / linear-gradient 0건 / 이모지 0건 (toast.icon 'ℹ️' 비즈니스 로직 화이트리스트 제외). npm run build PASS. TSC 0. 커밋 1건. **multi-wave 완료** — chunk hash 자동 변경 → cbc7119-preview.pages.dev 자동 배포 대상이지만 사용자 시각 검수 + main 머지+배포는 사용자 명시 컨펌 후에만 (feedback_deploy_test).</done>
</task>

</tasks>

<verification>
**모든 wave 끝나면 다음 4개 grep 0건 확인** (전체 파일):

1. **9·10·11px 폰트 0건**:
   ```bash
   grep -nE "fontSize:\\s*(9|10|10\\.5|11)\\b" cha-bio-safety/src/pages/FloorPlanPage.tsx
   ```
   - 마커 SVG 내부 `<text fontSize={9}>` 은 SVG attribute 라 비대상 (화이트리스트)

2. **옛 토큰 var(--bg/bg2/bg3/bd/bd2/acl/t1/t2/t3/safe/warn/danger/fire/info) 0건**:
   ```bash
   grep -nE "var\\(--(bg|bg2|bg3|bd|bd2|acl|t1|t2|t3|safe|warn|danger|fire|info)\\b" cha-bio-safety/src/pages/FloorPlanPage.tsx
   ```

3. **linear-gradient 0건**:
   ```bash
   grep -nE "linear-gradient" cha-bio-safety/src/pages/FloorPlanPage.tsx
   ```

4. **이모지 0건** (toast.icon 'ℹ️' 비즈니스 로직 제외):
   ```bash
   grep -nP "[\\x{2600}-\\x{27BF}\\x{1F300}-\\x{1F9FF}]" cha-bio-safety/src/pages/FloorPlanPage.tsx
   ```

**TypeScript + 빌드**:
- `cd cha-bio-safety && npx tsc -p . --noEmit` → 0 에러
- `cd cha-bio-safety && npm run build` → PASS, dist/assets/FloorPlanPage-*.js chunk hash 변경 (PWA 캐시 무효화)

**비즈니스 로직 보존 검증** (sanity check):
- `grep -c "useState\\|useRef\\|useMemo\\|useEffect\\|useCallback\\|useQuery\\|useMutation" cha-bio-safety/src/pages/FloorPlanPage.tsx` → 변환 전 대비 동일 (라인 shift 만 허용)
- 핀치줌 핸들러 (onTouchStart, onTouchMove, onTouchEnd) / 마커 좌표 계산 / dragId / dragPos / 자산 배치 워크플로우 (?fromMarker, ?placingExtinguisher) 호출 한 줄도 변경 X
- React Query (markersQuery, extListQuery, scheduleItems) + Mutation (createMutation, updateMutation, deleteMutation, assignMutation, unassignMutation) 한 줄도 변경 X
- InspectionRevisitPopup + AccessBlockedPopup + PhotoButton + extinguisherApi + floorPlanMarkerApi + inspectionApi + scheduleApi 호출 한 줄도 변경 X

**git 검증**:
- `git status` → cha-bio-safety/src/pages/FloorPlanPage.tsx 1 파일만 변경 + PLAN.md + SUMMARY.md (Wave 6 끝나면 SUMMARY 작성)
- `git log --oneline -10` → 6개 wave 커밋 + plan/summary 커밋
- 다른 페이지 .tsx / icons.tsx / GlobalHeader.tsx / 다른 컴포넌트 / hooks / utils / tokens.css / tailwind.config.js 수정 0건

**시각 검수 (사용자 권한)**:
- redesign/06-floorplan 브랜치 push → cbc7119-preview.pages.dev 자동 배포
- 사용자 시각 검수 → main 머지+배포는 사용자 명시 컨펌 후에만 (memory `feedback_deploy_test`)
- "거의 일치" 자체 평가 금지 (memory `feedback_avoid_premature_confirmation`)
</verification>

<success_criteria>
- [ ] Wave 1 변환 영역 (헤더 + 도면 종류 탭 + 13층 가로 스크롤 + 캔버스 shell + 마커 오버레이 + 안내 배너 + 범례, 라인 940~1148 + 1391~1470) v0.1.1 토큰 + Tailwind only
- [ ] Wave 2 변환 영역 (STATUS_COLOR 토큰화 + 19종 MarkerIcon SVG fill 토큰 + 데스크톱 말풍선 + 모바일 바텀시트, 라인 103~110 + 121~277 + 1150~1389) v0.1.1
- [ ] Wave 3 변환 영역 (점검 모달 + 자산 정보 KV + admin 액션 + 결과 3택 + 증상 피커 + textarea + paired BC nested, 라인 1723~1948) v0.1.1
- [ ] Wave 4 변환 영역 (마커 수정 모달 + 자산 분리/배치 분기, 라인 1472~1585) v0.1.1
- [ ] Wave 5 변환 영역 (마커 추가 모달 4/6 옵션 + confirm 3종, 라인 1587~1689 + 1952~2036) v0.1.1
- [ ] Wave 6 변환 영역 (InspectionRevisitPopup 컨테이너 + 인라인 조치 모달 + 데스크톱 분기 검증 + cleanup, 라인 1691~1721 + 2038~2162) v0.1.1
- [ ] 전체 파일 9·10·11px 0건 / 옛 토큰 0건 / linear-gradient 0건 / 인라인 정적 style 금지 키 0건 (마커 SVG / 동적값 화이트리스트 제외) / 이모지 0건 (toast.icon 비즈니스 로직 제외)
- [ ] STATUS_COLOR 객체 값 = `var(--status-*-bar)` + `var(--accent)` + `var(--text-tertiary)` (인라인 hex 0)
- [ ] 마커 SVG 19종 (MarkerIcon 함수) fill={color} 그대로 + 내부 stroke="#fff" 등 시각 정체성 보존
- [ ] 도면 위 마커 색 = §6.2 negative rule 예외 (상태 표현 매체로 허용)
- [ ] InspectionRevisitPopup + AccessBlockedPopup + PhotoButton 호출 본체 변경 X (이미 v0.1.1 컨펌)
- [ ] 비즈니스 로직 (핀치줌 / 마커 클릭 / 자산 배치 워크플로우 / URL searchParams sync / React Query / Mutation / API 호출 / navigate / toast) 한 줄도 변경 X
- [ ] lucide-react import 신설 — 최소 3종 (ChevronLeft / Trash2 / X). 옵션 (Plus / Edit / Info / AlertTriangle) 은 wave 별 자율
- [ ] CTA 단색 채택 (paired-precedent 04+05 mirror) — 점검 `bg-accent` / 조치 `bg-fire` / 분리 `bg-danger` (linear-gradient 폐기)
- [ ] 결과 배지 페어 (불량 danger-bg+danger / 주의 warning-bg+warning) — 점검 결과 3택 + 지적 메모 inline 배너
- [ ] admin outline 페어 (정보 수정 ghost / 분리 danger-bg+danger+danger-bar/30 border)
- [ ] paired BC nested 카드 (260428-lha 룰) Wave 3 에서 정합 — 비즈니스 로직 분기 한 줄도 변경 X
- [ ] TypeScript 0 에러 (`npx tsc -p . --noEmit` PASS) + npm build PASS
- [ ] 각 wave 끝나면 git 커밋 1건 + verify gate 자체 검증 PASS
- [ ] FloorPlanPage.tsx 단일 파일만 변경 (icons.tsx / GlobalHeader / BottomNav / 다른 페이지 / tokens.css / tailwind.config.js 0건)
- [ ] 사용자 시각 검수 → main 머지+배포는 사용자 명시 컨펌 후에만 (memory `feedback_deploy_test`)
</success_criteria>

<output>
After all 6 waves complete, create `.planning/quick/260516-uzh-redesign-06-floorplan-tsx-floorplanpage-/260516-uzh-SUMMARY.md`:

- **What changed**: 6 wave 변환 영역 라인 범위 + 변환 후 라인 수 (현 2165줄 → 예상 ~2100~2300줄, lucide import 3 라인 추가 + 인라인 style 객체 → className 통합으로 일부 감소)
- **Decisions locked** (이 plan 안에서 잠긴 결정 + 작업 중 추가 결정):
  - STATUS_COLOR 6 값 모두 var() 토큰 + resolved = accent (사용자 결정)
  - 도면 위 마커 색 §6.2 negative rule 예외 허용 (상태 표현 매체)
  - 마커 SVG 내부 #fff stroke + dangerBadge #ef4444 background = 시각 정체성 보존 (hex)
  - 미배치 ❓ 마커 SVG fontSize 8 = 마커 SVG 예외 (12px 마지노 적용 안 함)
  - 조치 CTA 단색 fire 채택 (linear-gradient 폐기, 04+05 mirror)
  - 분리 CTA 단색 danger 채택 (admin 액션, 04+05 mirror)
  - 정보 수정 = ghost outline (admin 색 매핑, 04+05 mirror — 분리 = danger pair / 수정 = ghost)
  - 지적 메모 inline = warning 페어 (지적 = 점검 caution/bad 결과)
- **Out of scope (다음 후속 quick 후보)**:
  - 데스크톱 레이아웃 자체 재구성 (사용자 컨펌 필요, sketch VP10 단순 참고용)
  - 마커 카탈로그 (sketch line 1291~ 디자인 시스템 reference, 코드와 무관)
  - icons.tsx 신규 export (본 multi-wave 는 0건)
  - 다른 페이지 (.tsx) / GlobalHeader / BottomNav (본 multi-wave 영향 범위 아님)
- **Memory updates 후보** (있다면 사용자 컨펌 받고 추가):
  - `project_redesign_06_floorplan_status.md` — FloorPlanPage TSX 변환 완결 + main 머지+배포 후 갱신
- **Next steps**:
  - 사용자 시각 검수 (cbc7119-preview.pages.dev 자동 배포)
  - 컨펌 시 main 머지+배포 (memory `feedback_deploy_test` 룰)
  - 다음 redesign 페이지 (08~ 또는 잔존 cleanup 3건, 메모리 `project_redesign_07_elevator_status` 참조)
</output>
