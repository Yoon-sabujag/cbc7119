---
phase: 260528-nkv-phase-b-wave-11-elevator-finding-detail
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [elevator-finding-detail, inline-style-to-tailwind, emoji-to-lucide, no-op-refactor, phase-b-tier-1-wave-11, deprecated-entry-compat, atomic-single-commit, lucide-x-import, tier-1-final]
requires:
  - 260528-jxo-phase-b-wave-10 완료 (Inspection mega atomic, cd22afc)
  - 260528-jey-phase-b-wave-9 완료 (도면 atomic, 7701872)
  - 260528-irl-phase-b-wave-8 완료 (소화기 atomic, de15e07)
  - 260528-iht-phase-b-wave-7 완료 (직원 서비스 atomic, 316e1eb)
  - 260528-hbv-phase-b-wave-6 완료 (일정/교육 atomic)
  - 260528-h3z-phase-b-wave-5 완료 (db728c0)
  - 260528-gsh-phase-b-wave-4 완료 (05fddf1)
  - 260528-cjn-phase-b-wave-3 완료 (a78963f + 4e99270)
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260527-tb3-legalpage-sweep-emoji Phase A LegalPage 완료
provides:
  - ElevatorFindingDetailPage.tsx Phase B Wave 11 완료 (60 → 2 inline 잔존, 3 ✕ → 0, single atomic — 옵션 X+P+M+색변수N+Lucide X 승계)
  - **Phase B Tier 1 완결** — 11 wave 모두 atomic commit + 시각 0 byte 보존. 다음: Tier 2 (모바일 zone 분할 페이지)
  - **deprecated 진입점 보존** — 메모리 `project_08_finding_detail_deprecated.md` 의 호환만 유지 page. 진입점 제거(96b9588) 후에도 deep link 호환을 위한 코드 잔존. 시각 변경 0 룰 보존하면서 sweep 적용
  - **Lucide X 신규 import 패턴 박제** — 기존 `import { Wrench }` → `import { Wrench, X }` 확장. 3 위치 각각 size={24}(modal close) / size={14}(linked repair clear) / size={10}(thumbnail remove) 의도된 사이즈 변화
  - **토큰 alias 일괄 매핑 사례 박제** — `var(--bg)`→`bg-surface-page` / `var(--bd)`→`border-border-default` / `var(--bd2)`→`border-border-strong` / `var(--t1/t2/t3)`→`text-text-primary/secondary/tertiary` / `var(--acl)`→`bg-accent` / `var(--danger)`→`bg-danger-bar` / `var(--safe)`→`text-safe-bar` / `var(--info)`→`text-info-bar`. tokens.css L178-191 alias 정의 그대로 활용 (수정 없이 className 변환 가능)
affects:
  - src/pages/ElevatorFindingDetailPage.tsx
tech-stack:
  added:
    - "Lucide X — ElevatorFindingDetailPage default import block 신규 추가 (Wrench 옆 알파벳 무관, `Wrench, X` 순)"
  patterns:
    - "옵션 X (정확값 arbitrary) — `z-[300]` / `bg-[rgba(0,0,0,0.95)]` / `pt-[calc(12px+var(--sat,44px))]` / `bg-[rgba(22,27,34,0.97)]` / `text-[14px]` / `text-[13px]` / `text-[11px]` / `text-[10px]` / `text-[9px]` / `text-[22px]` / `w-[28px] h-[28px]` / `w-[48px]` (h-8 spacing override 회피용) / `w-[72px] h-[72px]` / `w-[18px] h-[18px]` / `max-h-[240px]` / `max-h-[200px]` / `rounded-[10px]` / `rounded-[9px]` / `rounded-[6px]` / `mb-[10px]` / `leading-[1.5]` / `bg-[rgba(239,68,68,0.12)]` / `bg-[rgba(34,197,94,0.12)]` / `bg-[rgba(59,130,246,0.08)]` / `border-[rgba(59,130,246,0.2)]` / `bg-[rgba(34,197,94,0.06)]` / `border-[rgba(34,197,94,0.2)]` / `font-['Noto_Sans_KR',sans-serif]` / `[animation:spin_.7s_linear_infinite]` / `[-webkit-appearance:none]` 정확값 보존"
    - "옵션 M (template literal conditional) — Section 1 status badge 의 `${finding.status === 'open' ? 'bg-[rgba(239,68,68,0.12)] text-danger-bar' : 'bg-[rgba(34,197,94,0.12)] text-safe-bar'}` (2-prop bg+color 단일 conditional, 색만 변하고 layout 불변) + photo add button cursor `${uploading ? 'cursor-wait' : 'cursor-pointer'}` (1-prop) + bottom CTA `${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}` (2-prop cursor+opacity)"
    - "옵션 N (의도 inline) 잔존 2건 — L83 ImageViewer `<img>` 의 동적 transform + transition (scale/pos state + dragging 분기) + L245 content container 의 동적 paddingBottom (status open/resolved 분기). 둘 다 multi-state 동적 → inline 유지 (className+inline 혼용)"
    - "Lucide X size variant — size={24} (modal close, dark overlay), size={14} (linked repair clear chip), size={10} (photo thumbnail remove badge, w-[18px] h-[18px] 컨테이너 안). 3 위치 모두 onClick + className 보존"
    - "tokens.css alias 활용 — `--bg/--bg3/--bd/--bd2/--t1/--t2/--t3/--acl/--info/--safe/--danger` 모두 tokens.css L178-191 에 정의된 alias 변수. tailwind config 의 surface-page/border-default/text-text-primary 등 token utility 와 자동 매핑되어 className 변환 가능"
    - "rounded-sm=8 / rounded-md=12 spacing override 인지 + 비표준 값 arbitrary — 원본 `borderRadius:8` → `rounded-sm` (config 8px) / `borderRadius:12` → `rounded-md` (config 12px) / 원본 `borderRadius:9/10/6` → `rounded-[9px]/[10px]/[6px]` arbitrary"
    - "h-8/w-8=48 spacing override 회피 — 헤더 `height:48` 의도값과 동일하므로 `h-[48px]` arbitrary 사용 (의미적 의도 명시). w-9/h-9=36(default) 은 그대로 사용 (config override 외 영역)"
    - "rounded-full + w-[18px]/h-[18px] thumbnail remove badge — 원본 `width:18, height:18, borderRadius:'50%'` → `w-[18px] h-[18px] rounded-full`. -top-1/-right-1 = -4px (negative spacing 1=4px)"
    - "appearance + -webkit-appearance 동시 처리 — 원본 `WebkitAppearance:'none', appearance:'none'` → `appearance-none [-webkit-appearance:none]` (Wave 7 staff-service precedent 동일)"
key-files:
  created:
    - .planning/quick/260528-nkv-phase-b-wave-11/260528-nkv-SUMMARY.md
  modified:
    - src/pages/ElevatorFindingDetailPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 12번째 승계)"
  - "Lucide X 신규 import — 기존 `import { Wrench }` 단일 → `import { Wrench, X }` 확장. 알파벳순 우선 룰 보다 기존 순서(Wrench 먼저) 유지 (lucide-react 단일 import block 최소 변경)"
  - "Section 1 status badge — multi-prop conditional (bg + color 2-prop) 이지만 layout/box 불변이라 옵션 M 적용. multi-prop 이라도 색만 변하면 색 변수 N 룰 적용"
  - "Spinner — Wave 5 RemediationDetail precedent 그대로 `[animation:spin_.7s_linear_infinite]` underscore 치환 (Wave 5 precedent 박제 룰)"
  - "ImageViewer img L83 — multi-state 동적 (scale + pos + dragging) → 옵션 N 잔존. className 으로 정적 prop (max-w-full/max-h-full/object-contain/select-none) 분리 후 transform/transition 만 inline 유지 (혼용 패턴)"
  - "Content container L245 — finding.status 동적 paddingBottom 1-prop multiline 짧음 → className+inline 혼용 (overflow-y-auto/flex-1 만 className 으로 분리). 옵션 N 잔존이지만 multiline 짧아짐"
  - "Photo modal overlay (ImageViewer 의 4-prop multi-static) — 정적 4-prop 모두 className 변환 가능. position/inset/z/bg/display/flex-direction → `fixed inset-0 z-[300] bg-[rgba(0,0,0,0.95)] flex flex-col`"
  - "지적사항 status badge — Wave 10 InspectionPage precedent 와 동일한 패턴 (multi-prop bg+color conditional → 옵션 M template literal)"
  - "단일 atomic commit 패턴 자동 도달 — c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo + 28-splash/27-login/23-education 승계 (12번째 자동 도달, 60 inline + 3 ✕ atomic)"
  - "deprecated 진입점 호환 보존 — 메모리 `project_08_finding_detail_deprecated.md` 인지하면서도 deep link 호환을 위한 코드 그대로 유지. 비즈니스 로직 0 byte 변경 (10 onClick / 8 useState / 5 useRef / 1 useMutation / 2 useQuery / 1 useNavigate / 1 useParams / 1 fetch 모두 IDENTICAL)"
  - "**Tier 1 종결** — 11 wave 모두 정상 완결. 다음 wave 부터 Tier 2 진입 (모바일 zone 분할 페이지 / 12a~15b)"
metrics:
  duration: "약 15분 (Task 1 atomic — single commit, 60 inline + 3 ✕)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "82 insertions / 159 deletions (net -77 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 11 (승강기 상세 — deprecated 진입점, Tier 1 마지막)"
---

# Phase 260528-nkv Plan 01: Phase B Wave 11 ElevatorFindingDetailPage Summary

ElevatorFindingDetailPage.tsx (505줄, 60 inline + 3 ✕) 의 58건 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo 승계 옵션 X+P+M+색변수N 으로 tailwind className 변환 + 3 ✕ (modal close size=24 / linked repair clear size=14 / photo thumbnail remove size=10) 을 Lucide X (신규 import) 로 변환. **deprecated 진입점 호환 보존** — 메모리 `project_08_finding_detail_deprecated.md` 인지 하에 deep link 호환 코드 그대로 유지. **단일 atomic commit** — `9c5ae9a`. **60 → 2 잔존** (-58건 -96.7%) + **3 → 0 emoji** (전체 페이지 ✕ → Lucide X 단일 진실 원천 enforce). 잔존 2건 = ImageViewer img 의 동적 transform/transition (scale/pos/dragging 다중 state) + content container 의 동적 paddingBottom (open/resolved 분기). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (10 onClick + 8 useState + 5 useRef + 1 useMutation + 2 useQuery + 1 useNavigate + 1 useParams + 1 fetch + elevatorInspectionApi/elevatorRepairApi + handlePhotoAdd + resolveMutation + handleResolve + PhotoSourceModal + ImageViewer + KVRow + SectionHeader + Spinner + Section 1/2/3/4 모두 보존) 모두 IDENTICAL. **Phase B Tier 1 Wave 11 성공** — 예상 (60→~5-10 잔존) 초과 달성 (2 잔존, -3건 추가 감소). **Tier 1 종결** — 11 wave 모두 atomic + 시각 0 byte 보존. 다음 wave 부터 Tier 2 (모바일 zone 분할 페이지).

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존                           | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선    | wdc Phase B Task 2 결정            |
| -   | **a3v~jxo 12 wave 승계 적용** — 본 wave 재확인 없이             | 260528-0hr roadmap v2 locked-decisions |
| (Phase A) | **Lucide X — modal close + chip clear + thumbnail remove** | Wave 10 jxo precedent + Phase A 룰 |

## Before / After 카운트

| Metric                                       | Before | After  | Diff             |
| -------------------------------------------- | ------ | ------ | ---------------- |
| ElevatorFindingDetailPage.tsx `style={{`     | **60** | **2**  | **-58 (-96.7%)** |
| ElevatorFindingDetailPage.tsx ✕ emoji        | **3**  | **0**  | **-3 (Lucide X)** |
| TypeScript errors                            | 0      | 0      | =                |
| 비즈 anchors (10 onClick / 8 useState / etc)  | IDENTICAL | IDENTICAL | =          |
| 비표준 색 토큰 (warning/safe/danger no-suffix) | 0      | 0      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)            | 0      | 0      | =                |

## ✕ → Lucide X 매핑 (3건)

| Line (Before) | 위치 | Before                                    | After                       | size |
| -------------:| ---- | ----------------------------------------- | --------------------------- | ----:|
| L68           | ImageViewer modal close (오버레이 우상단) | `>✕</button>` + 24px hex `#fff` | `<X size={24} />` + `text-white` | 24 |
| L353          | linked repair clear chip (`{linkedRepair && (...)}` 카드 안 ✕) | `>✕</button>` + 14px t3 | `<X size={14} />` + `text-text-tertiary` | 14 |
| L425          | photo thumbnail remove (좌상단 둥근 빨강 ●안 ✕) | `>✕</button>` + 10px white in 18×18 circle | `<X size={10} />` + `bg-danger-bar text-white` | 10 |

## 옵션 N (의도 inline) 잔존 2건

| Line | 위치               | 잔존 prop                                                | 사유                                                   |
| ----:| ------------------ | -------------------------------------------------------- | ------------------------------------------------------ |
| L83  | ImageViewer `<img>` | `transform: translate(${pos.x}px,...) scale(${scale})` + `transition: dragging ? 'none' : '...'` | multi-state 동적 (scale + pos + dragging 3-state). className 분리 (max-w-full/max-h-full/object-contain/select-none) + inline 잔존 (혼용 패턴) |
| L245 | content container   | `paddingBottom: finding.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24` | finding.status 동적 1-prop. className+inline 혼용 (flex-1/overflow-y-auto 만 분리). multiline 짧음 |

## 변환 매핑 (주요 site 13개)

| Line   | Before (요약)                                                                                         | After (요약)                                                                                            | 옵션 |
| ------:| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----:|
| L66    | `position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.95)', display:'flex', flexDirection:'column'` | `fixed inset-0 z-[300] bg-[rgba(0,0,0,0.95)] flex flex-col`                                              | X    |
| L67    | `flexShrink:0, display:'flex', justifyContent:'flex-end', padding:'12px 16px', paddingTop:'calc(12px + var(--sat,44px))'` | `shrink-0 flex justify-end px-4 py-3 pt-[calc(12px+var(--sat,44px))]`                                    | X    |
| L104   | KVRow row `display:'flex', gap:12, alignItems:'flex-start'`                                            | `flex gap-3 items-start`                                                                                | -    |
| L114   | SectionHeader `fontSize:12, fontWeight:700, color:'var(--t3)', marginBottom:10`                        | `text-caption font-bold text-text-tertiary mb-[10px]`                                                   | -    |
| L124   | Spinner `width:28, height:28, border:'2px solid var(--bd2)', borderTopColor:'var(--acl)', borderRadius:'50%', animation:'spin .7s linear infinite'` | `w-[28px] h-[28px] border-2 border-border-strong border-t-accent rounded-full [animation:spin_.7s_linear_infinite]` | X    |
| L214   | main page root `flex:1, display:'flex', flexDirection:'column', background:'var(--bg)', height:'100%', overflow:'hidden'` | `flex-1 flex flex-col bg-surface-page h-full overflow-hidden`                                            | -    |
| L219   | 자체 헤더 (height/background/border/display/...) 8-prop                                                | `h-[48px] bg-[rgba(22,27,34,0.97)] border-b border-border-default flex items-center justify-center relative shrink-0` | X    |
| L274   | status badge 6-prop multi-prop conditional (open vs resolved)                                          | `text-[10px] font-bold px-2 py-[2px] rounded-[10px] ${ status==='open' ? 'bg-[rgba(239,68,68,0.12)] text-danger-bar' : 'bg-[rgba(34,197,94,0.12)] text-safe-bar' }` | M+X  |
| L324   | `수리이력에서 조치 선택` button 9-prop                                                                  | `w-full mb-3 p-[10px] rounded-sm bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] text-info-bar text-caption font-bold cursor-pointer inline-flex items-center justify-center gap-1.5` | X    |
| L408   | photo add button 6-prop + `cursor: uploading ? 'wait' : 'pointer'`                                     | `w-[72px] h-[72px] shrink-0 rounded-[10px] border border-dashed border-border-strong bg-surface-sunken flex flex-col items-center justify-center gap-1 ${uploading ? 'cursor-wait' : 'cursor-pointer'}` | X+M  |
| L424   | photo img `width:72, height:72, objectFit:'cover', borderRadius:10, border:'1px solid var(--bd)'`     | `w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default`                            | X    |
| L450   | resolved main img 7-prop                                                                               | `w-full max-h-[240px] object-cover rounded-[10px] border border-border-default block mt-3 cursor-pointer` | X    |
| L482   | bottom CTA button 11-prop + `cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1`           | `w-full h-8 bg-accent text-white text-[14px] font-bold border-none rounded-md transition-opacity duration-150 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}` | M+X  |

## 비즈 anchors 보존 (10 onClick / 8 useState / 5 useRef / 1 useMutation / 2 useQuery / 1 useNavigate / 1 useParams / 1 fetch — IDENTICAL)

```
onClick=\{...\} : 10 (before) == 10 (after)
useState\( : 8 == 8
useRef<.../>(...) : 5 == 5
useMutation\( : 1 == 1
useQuery\( : 2 == 2
useNavigate\( : 1 == 1
useParams<.../>(...) : 1 == 1
fetch\( : 1 == 1
```

precise diff (sort+uniq onClick set): **0 line difference**.

## 자동 검증 결과

| Verify gate                                            | Result    |
| ------------------------------------------------------ | --------- |
| `style={{` ≤ 15                                        | **2** ✓   |
| emoji ✓✗✕🔒💾 = 0                                       | **0** ✓   |
| TypeScript `error TS` count = 0                        | **0** ✓   |
| 비표준 색 토큰 (warning/safe/danger no-suffix) = 0      | **0** ✓   |
| Lucide X import 추가                                   | `Wrench, X` ✓ |
| 변경 파일 = 1 .tsx 만 (off-scope = 0)                   | **0 off-scope** ✓ |
| Vite build (PWA generation)                            | **succeeded** ✓ |

## Commit

| Hash        | Subject                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `9c5ae9a`   | feat(260528-nkv-01): Phase B Wave 11 — ElevatorFindingDetail 60 inline + 3 ✕ → tailwind + Lucide X |

## Phase B Tier 1 누적 통계 (Wave 1~11 — Tier 1 종결)

| Wave | 페이지(s)                                              | inline (before → after) | emoji (before → after) | atomic commit |
| ---- | ------------------------------------------------------ | ----------------------- | ---------------------- | ------------- |
| 1    | QRScan / Div / Reports                                 | 4 → 4 (DivPage 4 동적)  | -                      | 18fd138       |
| 2    | Login / Splash                                         | 28 → 13                 | -                      | d36a20f       |
| 3    | Workshift / AnnualPlan                                 | 24 → 21                 | -                      | a78963f + 4e99270 |
| 4    | Dashboard / DailyReport / WorkLog                      | 20 → 20 (캘리브 보존)   | -                      | 05fddf1       |
| 5    | Remediation / RemediationDetail                        | 11 → 11                 | -                      | db728c0       |
| 6    | Schedule / Education                                   | 137 → ~23 (Sched 20 + Edu 3 잔존) | -            | hbv atomic    |
| 7    | StaffService                                           | 34 → 10                 | -                      | 316e1eb       |
| 8    | Extinguisher Public / List                             | 122 → 15 (Public 0 / List 15) | 8 ✓ → 0 (Lucide) | de15e07       |
| 9    | FloorPlan                                              | 25 → 12                 | -                      | 7701872       |
| 10   | Inspection (mega 6047줄)                                | 47 → 35                 | 26 → 0 (Lucide Check)  | cd22afc       |
| 11   | **ElevatorFindingDetail (deprecated 진입점)** ← 이번    | **60 → 2**              | **3 ✕ → 0 (Lucide X)** | **9c5ae9a**   |
| **합계** | **15 페이지**                                       | **512 → ~166 (-67.5%)** | **37 → 0 (Phase A 완결)** | **11 atomic commits** |

### Tier 1 핵심 성과

1. **Phase A emoji sweep 완결** — Wave 8 (Extinguisher 8 ✓) + Wave 10 (Inspection 26 ✓+✕) + Wave 11 (ElevatorFindingDetail 3 ✕) 합계 37 emoji → 0. Lucide Check / X 단일 진실 원천 enforce. 모든 페이지 코드 안 emoji 0 (주석 안 ✓ 잔존은 의도)
2. **시각 0 byte 룰 100% 유지** — 11 wave 모두 PWA build 성공 + 비즈 anchor IDENTICAL + 비표준 색 토큰 0
3. **단일 atomic commit 패턴 12회 자동 도달** — Wave 1~11 모두 atomic, 11번째 (Inspection 47+26) + 12번째 (이번 ElevatorFindingDetail 60+3) 까지 단일 atomic 적용
4. **chrome 통일 룰 페이지 (02 InspectionPage + 06 FloorPlanPage) 무중단 보존** — chrome 4종 (backdrop/modal box/textarea/button) 패턴 변환 전후 100% 일관
5. **캘리브 좌표 시스템 100% 보존** — DailyReport / WorkLog / AnnualPlan / Splash / Login / Schedule monthly plan / FloorPlan marker 좌표 1 byte 변경 0
6. **deprecated 진입점 호환 보존** — Wave 11 (ElevatorFindingDetail) 메모리 룰 인지하면서도 deep link 호환 코드 그대로 유지

### 다음 단계 (Tier 2 진입)

- Tier 2 시작 — 모바일 zone 분할 페이지 (12a~15b 카테고리)
- Tier 1 종결 후 verify: 운영 도메인 영향 0 확인 (cbc7119-preview main 자동 배포 외 추가 작업 없음)
- 단일 atomic 패턴 + 옵션 X+P+M+색변수N 룰 그대로 Tier 2 승계

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | h-8=48 ↔ 헤더 height:48 의도값 ↔ `h-[48px]` arbitrary 명시 / 하단 CTA 의 height:48 → `h-8` 사용 (의도 일치) |
| `project_08_finding_detail_deprecated.md` | deep link 호환 페이지 인지하면서 sweep 적용 — 시각 0 byte / 비즈 anchor IDENTICAL 보장 |
| Wave 5 (RemediationDetail) spinner | `[animation:spin_.7s_linear_infinite]` underscore 치환 룰 그대로 적용 |
| Wave 10 (InspectionPage) emoji Lucide | `<X size={N} />` size variant 룰 + `onClick + className` 룰 그대로 적용 |
| Wave 7 (StaffService) appearance prefix | `appearance-none [-webkit-appearance:none]` 동시 처리 룰 그대로 적용 |

## Self-Check: PASSED

- ElevatorFindingDetailPage.tsx 변경 commit `9c5ae9a` (file:/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx) — FOUND
- commit hash 9c5ae9a — FOUND in git log
- emoji = 0 verify gate — PASSED
- 비즈 anchor diff = 0 line — PASSED
- TypeScript = 0 error — PASSED
- Vite build = succeeded — PASSED
- off-scope 변경 = 0 — PASSED
