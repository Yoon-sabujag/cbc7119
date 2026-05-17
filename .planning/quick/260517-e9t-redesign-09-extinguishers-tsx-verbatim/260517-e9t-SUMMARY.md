---
quick_id: 260517-e9t
title: redesign/09-extinguishers — ExtinguishersListPage.tsx v0.1.1 토큰 변환 (sketch verbatim)
branch: redesign/09-extinguishers
depends_on: [260517-e9c, e9d, e9r, e9e, e9k, e9s]
status: TSX 변환 완료 · 사용자 시각 컨펌 대기 (preview deploy)
---

# 260517-e9t · 09 TSX verbatim 변환

## 변경 파일

- `cha-bio-safety/src/pages/ExtinguishersListPage.tsx` (1168 lines 유지, 토큰만 교체)

## 변환 통계

### Alias 일괄 치환 (Phase 1, 13종)

```
var(--bg)    → var(--surface-page)
var(--bg2)   → var(--surface-raised)
var(--bg3)   → var(--surface-sunken)
var(--bg4)   → var(--surface-active)
var(--bd)    → var(--border-default)
var(--bd2)   → var(--border-strong)
var(--t1)    → var(--text-primary)
var(--t2)    → var(--text-secondary)
var(--t3)    → var(--text-tertiary)
var(--acl)   → var(--accent)
var(--info)  → var(--status-info)
var(--warn)  → var(--status-warning)
var(--danger)→ var(--status-danger)
```

### Raw 색 → 토큰 (Phase 2, 4 hex + 19 rgba)

| 원본 | 변환 |
|---|---|
| `#fff` | `var(--accent-fg)` (primary 버튼 텍스트) |
| `#a16207` | `var(--status-warning)` (chrome warn chip 텍스트) |
| `#c2410c` | `var(--status-fire)` (imminent chip 텍스트) |
| `#b91c1c` | `var(--status-danger)` (danger chip 텍스트) |
| `rgba(14,165,233,.10)` | `var(--status-info-bg)` |
| `rgba(14,165,233,.25)` `.35` | `var(--status-info-bar)` |
| `rgba(0,0,0,0.6)` | `var(--surface-overlay)` |
| `rgba(234,179,8,.08)` `.25` | `var(--status-warning-bg)` |
| `rgba(234,179,8,.5)` | `var(--status-warning-bar)` |
| `rgba(249,115,22,.08)` `.25` | `var(--status-fire-bg)` |
| `rgba(249,115,22,.5)` | `var(--status-fire-bar)` |
| `rgba(239,68,68,.08)` `.15` `.25` | `var(--status-danger-bg)` |
| `rgba(239,68,68,.3)` `.5` | `var(--status-danger-bar)` |
| `rgba(245,158,11,.15)` | `var(--status-warning-bg)` |
| `rgba(245,158,11,.3)` | `var(--status-warning-bar)` |
| `rgba(59,130,246,.15)` | `var(--accent-bg)` |

### fontSize 11 → 12 (Phase 3, 13곳)

마지노선 12px. 카드 footer / badge / chip / DetailField / counter / microcopy / info banner / FieldLabel 등.

### borderRadius 숫자 → 토큰 (Phase 4)

```
5  → radius-sm (badge / chip)
6  → radius-sm (chrome chip / 취소버튼 border)
7  → radius-sm (헤더 등록 버튼)
8  → radius-sm (input / select / action button)
10 → radius-md (confirm 버튼)
12 → radius-md (카드 + skeleton)
16 → radius-lg (모달 wrapper)
```

## 5 verify gate (모두 PASS)

```
G1 옛 alias 단독                : 0 (=0) PASS
G2 raw hex                      : 0 (=0) PASS
G3 raw rgba                     : 0 (=0) PASS
G4 fontSize 9/10/11             : 0 (=0) PASS
G5 borderRadius 숫자             : 0 (=0) PASS
```

## v0.1.1 토큰 등장 (token usage)

- Surface 5 종: 19곳
- Text 3 종: 31곳
- Border 2 종: 18곳
- Accent + accent-fg + accent-bg: 11 + 5 + 2 = 18곳
- Status info-bg/bar: 2/3
- Status warning-bg/bar: 4/2
- Status fire-bg/bar: 2/1
- Status danger-bg/bar: 6/4
- Radius sm/md/lg: 18/6/1

## TypeScript build

```
npx tsc --noEmit → PASS (exit 0)
npm run build    → PASS
```

## 비즈니스 로직 보존 (0 변경)

- import / hooks / state / useQuery / 7 mutations
- handleRegister / handleAssignClick / dismissMarkerContext
- getMappingState / getReplaceWarning
- replaceFilter / replaceCounts
- norm() / changedCount useMemo / saveDisabled / borderForField
- ConfirmModal 4 호출처 (분리 / 폐기 / 삭제 / 스왑)
- gridCols 반응형
- localStorage 'cbc24:lastRegisteredExt'
- toast / navigate / setSearchParams

## 변환 방식 — 단순 1:1 치환 (verbatim mapping)

- 6 sketch wave (chrome / card / register / edit / confirm / states) 의 토큰 매핑 테이블 그대로 적용
- JSX 구조 / 비즈니스 로직 / 컴포넌트 시그니처 0 변경
- inline style 객체 내 색/사이즈/radius 만 토큰으로 교체

## 다음 단계

1. **사용자 시각 컨펌** — preview deploy URL 로 `/extinguishers` 페이지 확인
   - 4탭 / 필터 / 카드 (collapsed/expanded/disposed) / 등록 모달 / 수정 모달 / 확인 모달 4종 / loading / empty / error 전부 확인
2. 컨펌 OK 시 → main 머지 + production 배포 (사용자 명시 컨펌 후)
3. 다음 redesign 페이지 진입

## 파일 변경 요약

```
M  cha-bio-safety/src/pages/ExtinguishersListPage.tsx (1168 lines 유지)
A  .planning/quick/260517-e9t-redesign-09-extinguishers-tsx-verbatim/260517-e9t-PLAN.md
A  .planning/quick/260517-e9t-redesign-09-extinguishers-tsx-verbatim/260517-e9t-SUMMARY.md
```
