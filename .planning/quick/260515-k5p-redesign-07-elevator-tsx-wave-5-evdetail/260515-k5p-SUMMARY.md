---
quick_id: 260515-k5p
slug: redesign-07-elevator-tsx-wave-5-evdetail
status: complete
date: 2026-05-15
commit: ef16be2
wave: 5
phase: redesign/02-inspection
---

# 260515-k5p: Wave 5 — EvDetailModal v0.1.1 토큰 + Tailwind 변환 SUMMARY

**One-liner:** EvDetailModal (line 1696~1958, 263줄) 전체를 v0.1.1 디자인 토큰 + Tailwind utility 전용으로 변환 — KIND_STYLE 이모지→lucide 매핑, fault=fire/annual=회색 색 통일, ev-btn-selected 3 영역, 좌측 3px 색바 absolute span 패턴 적용.

## 변환 전/후 라인 범위

| 항목 | 변환 전 | 변환 후 |
|------|---------|---------|
| EvDetailModal 시작 | line 1696 | line 1696 (동일) |
| EvDetailModal 종료 | line 1891 | line 1958 |
| 총 라인 수 | 196줄 | 263줄 (+67줄, lucide icon JSX 확장) |
| 다음 함수 시작 | line 1893 (EsBtn) | line 1959 (EsBtn, 이동) |

## 2D 시안 권위 매핑 (6 영역)

| 영역 | 변환 전 | 변환 후 |
|------|---------|---------|
| 헤더 컨테이너 | `style={{ ... borderBottom:'1px solid var(--bd)' ...}}` | `className="flex-shrink-0 px-4 pt-[14px] pb-3 border-b border-border-default ..."` |
| 헤더 아이콘 | `{TYPE_ICON[ev.type]}` 이모지 | `TYPE_ICON_COMPONENT[ev.type]` + `<TypeIcon size={20} className="text-text-secondary" />` |
| 헤더 닫기 | `✕` 문자 | `<X size={20} />` lucide |
| 기간 선택 | `background: periodIdx===i ? 'var(--acl)' : 'var(--bg3)'` | `bg-accent text-text-on-accent` / `bg-surface-sunken text-text-tertiary` |
| 층별 이력 legend | `🔴 미해결 ⚠️ 이력있음 ✅ 이상없음` | `<AlertOctagon /> <AlertTriangle /> <CheckCircle2 />` + 색 className |
| 점검항목 필터 | `background: checkFilter===k ? 'var(--acl)' : 'var(--bg3)'` | ev-btn-selected 패턴 (bg-accent/bg-surface-sunken) |
| 이력 탭 | `background: histTab===t.key ? 'var(--acl)' : 'var(--bg3)'` | ev-btn-selected 패턴 |
| 이력 카드 색바 | `borderLeft: \`3px solid ${ks.color}\`` 동적 인라인 | `<span className={'absolute left-0 top-0 bottom-0 w-[3px] ' + ks.barCls} />` 정적 className |
| 이력 빈 상태 | `fontSize:12, color:'var(--t3)'` + 문자 | `<FileSearch size={28} />` + `text-caption text-text-tertiary` |
| 층별 빈 상태 | `이상 없음 ✅` | `<CheckCircle2 size={14} />` + `text-safe` |

## KIND_STYLE 색 결정 4종 (2D 시안 권위)

| kind | textCls | barCls | Icon |
|------|---------|--------|------|
| fault | `text-fire` | `bg-fire-bar` | `AlertOctagon` |
| repair | `text-safe` | `bg-safe-bar` | `Wrench` |
| inspect | `text-info` | `bg-info-bar` | `ClipboardCheck` |
| annual | `text-text-tertiary` | `bg-text-tertiary` | `FileSearch` |

변환 전 KIND_STYLE: `{color: string; label: string; icon: string}` (CSS var + 이모지)
변환 후 KIND_STYLE: `{textCls: string; barCls: string; label: string; Icon: React.ComponentType}` (className enum + lucide)

## 이모지 → lucide 매핑 표

| 이모지 | 역할 | lucide 대체 |
|--------|------|-------------|
| `{TYPE_ICON[ev.type]}` | 헤더 호기 타입 아이콘 | `TYPE_ICON_COMPONENT[ev.type]` 매퍼 (ElevatorIcon/Package/UtensilsCrossed/MoveDiagonal) |
| `✕` | 닫기 버튼 | `<X size={20} />` |
| `🔴` | KIND_STYLE fault icon | `AlertOctagon` |
| `🔧` | KIND_STYLE repair icon | `Wrench` |
| `📋` | KIND_STYLE inspect icon | `ClipboardCheck` |
| `🔍` | KIND_STYLE annual icon | `FileSearch` |
| `🔴` | 층별 이력 legend 미해결 | `<AlertOctagon size={12} className="text-fire" />` |
| `⚠️` | 층별 이력 legend 이력있음 | `<AlertTriangle size={12} className="text-warning" />` |
| `✅` | 층별 이력 legend 이상없음 | `<CheckCircle2 size={12} className="text-safe" />` |
| `🔴` (row) | 층별 row 미해결 상태 아이콘 | `<AlertOctagon size={16} className="text-fire" />` |
| `⚠️` (row) | 층별 row 이력있음 상태 아이콘 | `<AlertTriangle size={16} className="text-warning" />` |
| `✅` (row) | 층별 row 이상없음 상태 아이콘 | `<CheckCircle2 size={16} className="text-safe" />` |
| `✅` (빈 상태) | 층별 빈 상태 | `<CheckCircle2 size={14} className="text-safe" />` |

## 인라인 화이트리스트 (보존된 인라인 style)

| 키 | 용도 | 적용 위치 |
|----|------|-----------|
| `position:'fixed'` | 모달 overlay + container 고정 | overlay div + modal container |
| `inset:0` | overlay 전체 화면 | overlay div |
| `zIndex:90` | overlay z-index | overlay div |
| `top:'50%', left:'50%'` | 데스크톱 모달 중앙 위치 | modal container (isDesktop) |
| `transform:'translate(-50%, -50%)'` | 데스크톱 모달 정중앙 | modal container (isDesktop) |
| `boxShadow:'0 20px 60px rgba(0,0,0,.5)'` | §6.7 모달 그림자 예외 | modal container (isDesktop) |
| `bottom:NAV_H` | 모바일 bottom-sheet 위치 | modal container (mobile) |
| `maxHeight:'calc(100dvh - ...)'` | 모바일 최대 높이 동적 계산 | modal container (mobile) |
| `WebkitOverflowScrolling:'touch'` | iOS scroll 부드럽게 | 스크롤 body div |
| `overscrollBehavior:'contain'` | 스크롤 바운스 제어 | 스크롤 body div |

화이트리스트 외 정적 인라인: **0건** (grep 검증 완료)

## Self-Check grep gate 결과

### 변환 영역 (line 1696~1958)

| 검사 항목 | 결과 | 기대값 |
|-----------|------|--------|
| 이모지 0건 (🛗📦🔲↕️🔴⚠️✅🔧📋🔍✕) | **0** | 0 |
| 9-11px 폰트 0건 | **0** | 0 |
| 옛 토큰 var(--bg/bg2/bg3/bg4/bd/bd2/t1/t2/t3/danger/warn/info/safe/acl) 0건 | **0** | 0 |
| 인라인 화이트리스트 외 정적 인라인 0건 | **0** | 0 |
| ev-btn-selected 패턴 (bg-accent text-text-on-accent) | **3** | 3 |

### lucide 신규 import 확인

```
grep -E "AlertOctagon|ClipboardCheck|FileSearch|CheckCircle2" cha-bio-safety/src/pages/ElevatorPage.tsx | head -1
```
결과: `import { ..., AlertOctagon, ClipboardCheck, FileSearch, CheckCircle2 } from 'lucide-react'` — **PASS**

### KIND_STYLE 재설계 확인

```
grep -A 6 "const KIND_STYLE" cha-bio-safety/src/pages/ElevatorPage.tsx | head -12
```
결과: `textCls / barCls / label / Icon` 필드 4종 — **PASS**

### TYPE_ICON_COMPONENT 매퍼 사용 (헤더)

```
grep -E "TYPE_ICON_COMPONENT\[ev\.type\]" cha-bio-safety/src/pages/ElevatorPage.tsx
```
결과: `const TypeIcon = TYPE_ICON_COMPONENT[ev.type]` (EvDetailModal 헤더 내부) — **PASS**

### ElevatorInfoCard 호출 보존

```
grep "<ElevatorInfoCard" cha-bio-safety/src/pages/ElevatorPage.tsx
```
결과: `<ElevatorInfoCard ev={ev} compact={!isDesktop} />` — **PASS** (props 그대로)

## 비즈니스 로직 보존 sentinel

| 항목 | 결과 | 기대값 |
|------|------|--------|
| state 3종 (setPeriodIdx/setCheckFilter/setHistTab) | **6** | ≥6 |
| useEffect body scroll lock `document.body.style.overflow = 'hidden'` | **1** | 1 |
| useQuery `queryKey: ['ev_history'` | **1** | 1 |
| `filtered.map(h =>` | **1** | 1 |
| `<ElevatorInfoCard ev={ev} compact={!isDesktop} />` | **1** | 1 |

## 보존 영역 sentinel

| 항목 | 결과 | 기대값 |
|------|------|--------|
| 보존 함수 정의 13종 (KoelsaHistorySection은 외부 import) | **13** | 13 |
| `modal === 'ev_detail'` call site | **2** | 2 |
| icons.tsx / tailwind.config.js 미수정 | **PASS** | 0건 |
| git diff 단일 파일 ElevatorPage.tsx | **PASS** | 1파일 |

## npm run build 결과

```
✓ built in 13.61s
ElevatorPage-CIO-v4sb.js  (새 chunk 해시)
TypeScript 에러: 0건
```

## Deviations from Plan

None — 계획대로 정확히 실행. KoelsaHistorySection은 외부 import로 함수 정의가 ElevatorPage.tsx에 없음 (plan의 14 sentinel이 13인 이유, 비수정 확인됨).

## Self-Check: PASSED

- [x] EvDetailModal 파일 `/cha-bio-safety/src/pages/ElevatorPage.tsx` 존재 확인
- [x] 커밋 `ef16be2` 존재 확인
- [x] 변환 영역 이모지 0건
- [x] 변환 영역 9-11px 0건
- [x] 변환 영역 옛 토큰 0건
- [x] 변환 영역 인라인 화이트리스트 외 0건
- [x] lucide 4종 신규 import 확인
- [x] KIND_STYLE 재설계 (textCls/barCls/label/Icon)
- [x] ev-btn-selected 패턴 3 영역 (기간/점검필터/이력탭)
- [x] 비즈니스 로직 sentinel 5종 PASS
- [x] 보존 영역 sentinel 13 함수 + ev_detail 2건 PASS
- [x] npm run build PASS (TypeScript 0 에러, 새 chunk)
