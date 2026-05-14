# CHA Bio Complex 방재 시스템 — 디자인 시스템

**버전:** v0.1.0 (Phase 0 완료)
**기준 커밋:** `c8bfa86`
**작성:** 2026-05-06

---

## 1. 디자인 원칙

이 시스템의 모든 디자인 결정은 다음 4가지 원칙을 따른다. 새 컴포넌트나 페이지를 만들 때 의사결정이 흔들리면 여기로 돌아온다.

### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.

### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.

### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.

### 1.4 상태 색은 의미가 우선
- `safe`(정상), `warning`(주의), `danger`(불량), `info`(정보), `fire`(조치 대기/긴급).
- foreground / bar / bg 3중 페어로 컨텍스트별 사용.
- `duty`(근무) 색은 status와 별개 시스템 — 혼용 금지.

---

## 2. 토큰 카탈로그

전체 정의는 `src/styles/tokens.css` 참조.

### 2.1 Surface (5단계)
| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `--surface-page` | `#0a0d12` | `#ffffff` | 페이지 전체 배경 |
| `--surface-raised` | `#1a1f27` | `#f6f8fa` | 카드 |
| `--surface-sunken` | `#232a33` | `#ebeef1` | input, 카드 안 들어간 영역 |
| `--surface-active` | `#2c333d` | `#d8dee4` | 활성 탭, 선택된 슬롯 |
| `--surface-overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.5)` | 모달 뒤 어둡힘 |

### 2.2 Text (6단계)
| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `--text-primary` | `#e6edf3` | `#1f2328` | 본문, 제목 |
| `--text-secondary` | `#adb6c0` | `#4d5562` | 보조 텍스트 (AAA 7:1+) |
| `--text-tertiary` | `#8b949e` | `#656d76` | 희미 메타, 시간 |
| `--text-disabled` | `#5d646e` | `#afb8c1` | 비활성 |
| `--text-on-accent` | `#ffffff` | `#ffffff` | 액센트 버튼 위 텍스트 |
| `--text-link` | `#58a6ff` | `#0969da` | 링크 |

### 2.3 Status (3중 페어 × 5종)
| 의미 | foreground | bar | bg |
|---|---|---|---|
| safe | `--status-safe` | `--status-safe-bar` | `--status-safe-bg` |
| warning | `--status-warning` | `--status-warning-bar` | `--status-warning-bg` |
| danger | `--status-danger` | `--status-danger-bar` | `--status-danger-bg` |
| info | `--status-info` | `--status-info-bar` | `--status-info-bg` |
| fire | `--status-fire` | `--status-fire-bar` | `--status-fire-bg` |

**사용:**
- `foreground` — 배지 텍스트, 아이콘 색
- `bar` — 점검 항목 카드 좌측 색바, 도넛 차트
- `bg` — 배지 채움, 카드 hover 강조

**`fire` 의미 고정:** 조치 대기 / 긴급. 방화셔터 미조치, 승강기 고장 미수리 등.

### 2.4 Duty (근무)
| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `--duty-day` | `#f59e0b` | `#b45309` | 주간 |
| `--duty-night` | `#ef4444` | `#b91c1c` | 당직 |
| `--duty-off` | `#3b82f6` | `#1f6feb` | 비번 |
| `--duty-leave` | `#6b7280` | `#6b7280` | 휴무 |

### 2.5 Spacing (8단계 + 컴포넌트 토큰)

**Primitive scale:**
`--space-1`(4) · `-2`(8) · `-3`(12) · `-4`(16) · `-5`(20) · `-6`(24) · `-7`(32) · `-8`(48)

**Component (자동 분기):**
| 토큰 | 모바일 | 데스크톱 ≥768px |
|---|---|---|
| `--card-padding` | 14px | 10px |
| `--card-padding-sm` | 10px | 8px |
| `--card-gap` | 8px | 6px |
| `--modal-padding` | 20px | 24px |
| `--section-gap` | 24px | 32px |
| `--page-padding` | 16px | 24px |
| `--input-height` | 44px | 40px |
| `--button-height` | 44px | 40px |

### 2.6 Radius (4단계, 모드 무관)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-sm` | 8px | input, button, sub-card |
| `--radius-md` | 12px | 표준 카드 |
| `--radius-lg` | 16px | 모달, 큰 panel |
| `--radius-pill` | 99px | 캡슐 배지, 칩 |

### 2.7 Typography (7단계)
| 클래스 | px | weight | line-height | 용도 |
|---|---|---|---|---|
| `text-caption` | 12 | 400 | 1.5 | 시간, ID, 가장 작은 메타 |
| `text-label` | 13 | 400 | 1.5 | 입력 라벨, 보조 정보 |
| `text-body-sm` | 14 | 400 | 1.6 | 데스크톱 표 셀, 보조 본문 |
| `text-body` | 16 | 400 | 1.7 | 기본 본문 (마지노선) |
| `text-title` | 18 | 500 | 1.4 | 카드 제목, 섹션 헤더 |
| `text-heading` | 22 | 600 | 1.3 | 페이지 제목, 모달 제목 |
| `text-display` | 28 | 500 | 1.0 | 통계 숫자, 큰 강조 |

---

## 3. 사용 가이드

### 3.1 컴포넌트 만들 때 토큰 매핑

```
[페이지 컨테이너]
  padding: var(--page-padding)
  gap (섹션 간): var(--section-gap)
  background: var(--surface-page)

[카드]
  background: var(--surface-raised)
  border: 1px solid var(--border-default)
  border-radius: var(--radius-md)
  padding: var(--card-padding)
  gap (자식 간): var(--card-gap)

[모달]
  background: var(--surface-raised)
  border-radius: var(--radius-lg)
  padding: var(--modal-padding)
  뒤 overlay: var(--surface-overlay)

[배지]
  status 배지: bg var(--status-{...}-bg) + color var(--status-{...})
  일반 칩: bg var(--surface-sunken) + color var(--text-primary)
  border-radius: var(--radius-pill)

[input / button]
  height: var(--input-height) / var(--button-height)
  border-radius: var(--radius-sm)
  padding-x: var(--input-padding-x) / var(--button-padding-x)
```

### 3.2 Tailwind 사용 예

```tsx
// 카드
<div className="bg-surface-raised border border-border-default rounded-md p-card">
  <h3 className="text-title text-text-primary">DIV 압력 측정</h3>
  <p className="text-label text-text-secondary mt-1">
    B5층 · 박보융 · 4시간 전
  </p>
</div>

// 상태 배지
<span className="text-caption font-medium px-3 py-1 rounded-pill bg-danger-bg text-danger">
  불량
</span>

// 페이지
<main className="p-page space-y-section bg-surface-page min-h-screen">
  ...
</main>

// 통계 카드
<div className="bg-surface-raised rounded-md p-card">
  <div className="text-label text-text-secondary mb-1">미완료</div>
  <div className="text-display text-text-primary">12</div>
</div>
```

---

## 4. 마이그레이션 룰

기존 코드(`src/index.css`의 `--bg`, `--t1` 등 raw 변수, 인라인 스타일)를 새 토큰으로 변환할 때 참조.

### 4.1 색상 매핑
| 기존 | 새 토큰 |
|---|---|
| `var(--bg)` | `var(--surface-page)` |
| `var(--bg2)` | `var(--surface-raised)` |
| `var(--bg3)` | `var(--surface-sunken)` |
| `var(--bg4)` | `var(--surface-active)` |
| `var(--t1)` | `var(--text-primary)` |
| `var(--t2)` | `var(--text-secondary)` |
| `var(--t3)` | `var(--text-tertiary)` |
| `var(--bd)` | `var(--border-default)` |
| `var(--bd2)` | `var(--border-strong)` |
| `var(--acl)` | `var(--accent)` |
| `var(--safe)` | `var(--status-safe-bar)` (좌측 색바) / `var(--status-safe)` (텍스트) |
| `var(--warn)` | `var(--status-warning-*)` |
| `var(--danger)` | `var(--status-danger-*)` |
| `var(--fire)` | `var(--status-fire-*)` (의미: 조치 대기) |
| `var(--c-day/night/off/leave)` | `var(--duty-day/night/off/leave)` |

### 4.2 폰트 사이즈 매핑
| 기존 fontSize | 새 토큰 / 클래스 |
|---|---|
| 9, 10, 11 | `text-caption` (12) — **일괄 상향** |
| 12 | `text-caption` (12) 또는 `text-label` (13) |
| 13 | `text-label` (13) |
| 14 | `text-body-sm` (14) 또는 `text-body` (16) — 본문이면 16 |
| 16 | `text-body` (16) 또는 `text-title` (18) — 카드 제목이면 18 |
| 22 | `text-heading` (22) |
| 26~32 | `text-display` (28) |

### 4.3 Radius 매핑
| 기존 | 새 토큰 |
|---|---|
| 7, 8, 9, 10 | `var(--radius-sm)` (8) |
| 12, 14 | `var(--radius-md)` (12) |
| 16, 20 | `var(--radius-lg)` (16) |
| 22 | `var(--radius-pill)` (99) |

### 4.4 페이지별 작업 순서 (권장)
1. 페이지 컨테이너 (`p-page`, `space-y-section`)
2. 섹션 wrapper
3. 카드/리스트 항목
4. 카드 내부 텍스트 (`text-title`, `text-body`, `text-label`)
5. 인터랙션 (button, input)

각 단계마다 인라인 `style={{...}}` 제거하고 Tailwind utility로 대체.

---

## 5. Phase 2 페이지 디자인용 컨텍스트 프롬프트

새 채팅에서 페이지 디자인할 때 아래 블록을 컨텍스트에 첨부하고 시작.

```
이 시스템은 CHA Bio Complex 방재 시스템 (Cloudflare Workers + D1 + React).
디자인 시스템 v0.1.0 적용 중.

핵심 원칙:
- 노안 친화 우선 (본문 16px+, 9·10·11px 금지)
- 모바일은 b-lite 톤 (큰 글씨 + 적당한 패딩)
- 데스크톱은 같은 폰트 + 빽빽한 spacing + 다른 레이아웃
- 상태 색은 status 토큰만 사용 (safe/warning/danger/info/fire)
- fire는 "조치 대기/긴급" 의미 고정

사용할 토큰: tokens.css, typography.css 참조
사용할 utility:
- text-{caption|label|body-sm|body|title|heading|display}
- bg-surface-{page|raised|sunken|active}
- text-text-{primary|secondary|tertiary}
- border-border-{default|strong|focus}
- rounded-{sm|md|lg|pill}
- p-{card|card-sm|modal|page}, gap-card-gap
- 상태: bg-{safe|warning|danger|info|fire}-bg + text-{safe|warning|danger|info|fire}

결과물은 React 컴포넌트 파일로. 인라인 style={{...}} 금지, Tailwind utility만 사용.
모바일/데스크톱 분기는 토큰이 자동 처리하므로 lg:* 미디어쿼리 prefix 사용 금지.
레이아웃 차이가 필요할 때만 lg:* 사용 (그리드 컬럼 수, 사이드바 노출 등).
```

---

## 6. 다음 단계

### Phase 1 (예정) — 공통 컴포넌트 디자인
v0.2.0에서 다음 컴포넌트 정의:
- `Button` (primary/secondary/ghost/danger × sm/md/lg)
- `Card` (raised/sunken/clickable)
- `Modal` / `BottomSheet` / `DesktopModal`
- `Input` (text/number/select/textarea)
- `Badge` (status pills)
- `Chip` (DutyChip 등)
- `KVRow`, `Section`, `Skeleton`, `Toast`, `Popup`
- `DutyChip`, `Donut`, `StatusBadge`, `CatBar`, `ResultBadge`

### Phase 2 (예정) — 페이지별 디자인
페이지당 새 채팅, 위 컨텍스트 프롬프트 첨부.
순서: 메인 워크플로우(대시보드 → 점검 → 조치) → 시설 관리 → 법정점검 → 나머지.

---

## 7. 변경 이력

- **v0.1.0** (2026-05-06) — Phase 0 완료. Color, Typography, Spacing, Radius 토큰 정의.
