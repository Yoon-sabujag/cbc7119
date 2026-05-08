# CHA Bio Complex 방재 시스템 — Design System

**Version:** v0.1.0  
**Product:** 사내 소방·시설 점검 및 조치 관리 도구  
**Platform:** React + Tailwind PWA (모바일 현장 점검자 3명 + 데스크톱 관리자)  
**Users:** 한국 중년 남성 소방 시설 관리자 — **노안 친화 디자인이 최우선**

---

## Product Context

CHA Bio Complex 방재 시스템은 CHA 바이오 단지 내 소방·시설 점검 업무를 디지털화한 사내 도구입니다. 핵심 사용자는 현장 점검자 3명(모바일)과 관리자(데스크톱)이며, 산업용 방재(소방) 도메인의 진중하고 신뢰감 있는 업무 도구 톤을 유지합니다.

### 주요 기능
- **대시보드** — 금일 점검 현황, 근무자 상태, 미완료/미조치 통계
- **일반 점검** — 16종 카테고리(특별피난계단, DIV, 소화기, CCTV 등) 시설 점검
- **조치 관리** — 불량/주의 항목 조치 워크플로우
- **승강기 관리** — 11호기 엘리베이터 + 6대 에스컬레이터 고장/수리/점검
- **소방 도면** — PDF 도면 + 마커 오버레이(유도등/감지기/스프링클러/소화기)
- **DIV 압력 관리** — 34개 측정점 압력 트렌드
- **연차/식사** — 휴가 신청서 PDF, 식단/식대 관리
- **보고서** — 10종 Excel 점검 일지 출력
- **월간 근무표, 법정점검, 보수교육, 소방계획서** 등

### Source Materials
- `reference/design-system.md` — 디자인 시스템 정의 문서 (v0.1.0, 절대 기준)
- `reference/tokens.css` — CSS 변수 토큰 전체 정의
- `reference/typography.css` — 타이포그래피 정의
- `reference/tailwind.config.js` — Tailwind 설정
- `reference/page-spec.md` — 전체 페이지 스펙 (코드 기반 분석)
- `reference/samples/DashboardPage.tsx` — 대시보드 페이지 전체 구현
- `reference/samples/InspectionPage.tsx` — 점검 페이지 전체 구현 (~5300 라인)

---

## Design Principles

1. **노안 친화가 모든 결정보다 우선** — 본문 16px+, 9/10/11px 사용 절대 금지, 터치 타겟 모바일 44px / 데스크톱 40px
2. **정보 인지 > 미적 정제** — 트렌디함보다 빠른 식별. 폰트 크기·굵기·색으로 정보 위계 확보
3. **모바일/데스크톱 같은 시스템, 다른 밀도** — 폰트·radius 동일, spacing만 분기. 레이아웃(사이드바, 그리드)이 밀도 조절
4. **상태 색은 의미가 우선** — safe/warning/danger/info/fire 5종, foreground/bar/bg 3중 페어

---

## CONTENT FUNDAMENTALS

### Tone & Voice
- **진중하고 신뢰감 있는 업무 도구 톤** — 게임/SNS/엔터테인먼트 톤 절대 금지
- 간결한 한국어, 존댓말 기반 (`~하시겠습니까?`, `~되었습니다`)
- 확인(confirm) 대화는 `"제목"을 완료 처리하시겠습니까?` 패턴
- 성공 피드백: `일정이 완료 처리되었습니다`, `저장 완료`
- 에러 피드백: `완료 처리에 실패했습니다`, `저장 오류`

### Casing & Labeling
- 한국어가 기본, 영문 약어만 예외 (DIV, CCTV, DVR, QR, PDF, TKE, KOELSA)
- 섹션 헤더: 명사형 (`오늘 현황`, `빠른 도구 모음`, `이번 달 점검 현황`)
- 버튼: 동사형 또는 명사+동사 (`저장`, `닫기`, `전화 걸기`, `점검 기록 저장`, `CCTV 점검 저장`)
- 상태 라벨: 한글 2글자 중심 (`정상`, `주의`, `불량`, `미조치`, `미확인`)

### Copy Patterns
- 통계 카드: `라벨` + `숫자` + `단위` (예: `미조치 항목` `3` `건`)
- 배지: 2글자 상태 (`정상`, `주의`, `불량`) 또는 짧은 설명 (`완료`, `지연`)
- 빈 상태: `오늘 일정 없음`, `이번 달 점검 일정 없음`, `조치 항목 없음`
- 달성 메시지: `연속 N일 점검 달성`

### Emoji Usage
- 카테고리 아이콘으로 제한적 사용 (🚪🚰🧯📹⚡🪟 등 — 점검 카테고리 구분용)
- 빠른 도구 카드 아이콘 (🗺️📈🚨🍱)
- 본문/배지/버튼에는 사용하지 않음
- 결과 옵션에 보조 아이콘 (✅⚠️❌)

---

## VISUAL FOUNDATIONS

### Colors
- **다크 모드 기본**, 라이트 모드 페어링 필수
- 페이지 배경: 깊은 네이비-블랙 (`#0a0d12`)
- 카드: 약간 밝은 차콜 (`#1a1f27`)
- 5종 상태 색이 시스템의 핵심 시각 언어 — safe(녹), warning(황), danger(적), info(청), fire(주황)
- 액센트: Blue-600 계열 (`#3b82f6`) — 차분하고 신뢰감 있는 톤

### Typography
- **Pretendard Variable** — 한글 최적화 가변 폰트 (CDN 로드)
- **JetBrains Mono** — 수치/코드용 모노스페이스
- 7단계 타입 스케일: caption(12) → label(13) → body-sm(14) → body(16) → title(18) → heading(22) → display(28)
- 한글 친화 line-height (영문보다 한 단계 넓게)
- 큰 헤더에만 음수 letter-spacing (-0.01em ~ -0.02em)

### Spacing
- **4의 배수 8pt 그리드** — 4/8/12/16/20/24/32/48px
- 모바일/데스크톱 자동 분기: 카드 패딩 14→10px, 버튼 높이 44→40px 등
- `1px 단위 미세 차이는 의미 없다` — 토큰은 4의 배수로만

### Backgrounds
- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- 유일한 그라디언트: `오늘 점검 대상` 배너의 은은한 블루 그라디언트 (`linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`)
- 저장/CTA 버튼의 블루 그라디언트 (`linear-gradient(135deg, #1d4ed8, #0ea5e9)`)

### Borders & Cards
- 카드: `1px solid var(--border-default)` + `border-radius: 12px` (radius-md)
- 다크 모드에서 카드 경계는 명도 차이로, 라이트 모드에서는 보더로
- 상태 바: 카드 하단 또는 좌측 2-3px 색 바로 상태 표현

### Shadows
- **그림자 사용하지 않음** — 다크 모드 기반이라 명도 차이만으로 계층 표현

### Corner Radii
- sm(8px): input, button, sub-card
- md(12px): 표준 카드
- lg(16px): 모달, 큰 패널
- pill(99px): 캡슐 배지, 칩

### Progress Color Rule (진척률 색 매핑)
점검 카테고리 도넛, 카테고리 카드 좌측 색바 등 진척률 표현 시 일관 적용:
| 진척률 | 색상 | 토큰 |
|---|---|---|
| 100% (완료) | 녹색 | `--status-safe-bar` |
| 50~99% | 파랑 | `--accent` |
| 1~49% | 노랑 | `--status-warning-bar` |
| 0% (미시작) | 회색 | `--text-tertiary` |

**카테고리별 임의 색 배정 폐지** — 진척률 기반 색만 사용.

### Stat Card Number Color
- 통계 카드 숫자(28px display)는 기본 `--text-primary` (흰색/검정)
- 라벨 색과 하단 색바는 해당 status 색 유지
- **위험 임계치 조건부 처리**: 점검 미완료 > 0, 미조치 > 0 등 주의가 필요한 경우 숫자가 `--status-danger`로 변경

### Hover & Press States
- hover: `border-color` 강화 (default→strong) + `translateY(-1px)` 미세 상승
- 또는 `background` 한 단계 진하게 (bg2→bg3)
- press/active: 없음 (웹 기반 PWA, 네이티브 제스처 의존)
- 링크: 별도 hover 없음, `text-link` 색만

### Animation
- **최소한의 애니메이션** — 업무 도구 톤
- 모달/시트: `transform: translateY(100%)→0` slide-up, `cubic-bezier(0.32,0.72,0,1)`, 0.26s
- 대시보드: `slideUp .28s ease-out` stagger (0.06s 간격)
- 상태 dot: `blink 2s ease-in-out infinite` (수신반 이력)
- 트랜지션: `all .13s` 또는 `border-color .15s, transform .15s`

### Layout Rules
- 모바일: 단일 컬럼, 그리드 기반 (2열 또는 4열 통계)
- 데스크톱: 좌/우 분할 (flex, 우측 고정폭 340px 등), 또는 좌(50%)/우(50%)
- 페이지 패딩: 모바일 16px, 데스크톱 24px
- 네비게이션: 하단 BottomNav (모바일), 사이드바 (데스크톱)
- 자체 헤더 사용하는 페이지 다수 (App.tsx 헤더 숨김 패턴)

### Transparency & Blur
- 상태 배경에 rgba 투명도 (0.08~0.16) 사용
- 오버레이: `rgba(0,0,0,0.6)` (다크), `rgba(0,0,0,0.5)` (라이트)
- blur 사용하지 않음

### Imagery
- 제품 내 이미지 없음 — 순수 데이터 기반 UI
- PDF 도면만 예외 (FloorPlanPage)
- 점검 사진은 사용자 촬영 이미지

---

## ICONOGRAPHY

### Icon System: Lucide (`lucide-react`)
- **Lucide** 아이콘 라이브러리 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16px / 20px / 24px** 세 종류만 사용
- 색상: design-system.md의 status/accent 토큰만 사용

### Icon Mapping (카테고리 → Lucide)
| 용도 | Lucide 아이콘 | 색상 |
|---|---|---|
| 특별피난계단 | `DoorOpen` | `#22c55e` |
| 청정소화약제 | `Cloud` | `#0ea5e9` |
| 전실제연댐퍼/연결송수관 | `Shield` | `#64748b` |
| 주차장비/회전문 | `Car` | `#a855f7` |
| 소방용전원공급반 | `Zap` | `#f59e0b` |
| 방화셔터 | `PanelBottomClose` | `#ef4444` |
| DIV | `BarChart3` | `#f59e0b` |
| 컴프레셔 | `Wind` | `#64748b` |
| 유도등 | `Lightbulb` | `#eab308` |
| 배연창 | `Blinds` | `#3b82f6` |
| 완강기 | `ArrowDownToLine` | `#f97316` |
| 소화전/비상콘센트 | `Droplets` | `#3b82f6` |
| 소화기 | `FireExtinguisher` | `#ef4444` |
| 소방펌프 | `Waves` | `#0ea5e9` |
| 화재수신반 | `Bell` | `#ef4444` |
| CCTV | `Video` | `#475569` |

### Status/Result Icons
| 의미 | Lucide 아이콘 |
|---|---|
| 정상 | `CheckCircle2` |
| 주의 | `AlertTriangle` |
| 불량 | `XCircle` |
| 미조치 | `Wrench` |
| 미확인 | `HelpCircle` |
| 긴급/조치대기 | `Flame` |
| 고장 접수 | `Siren` |

### Navigation Icons
| 위치 | Lucide 아이콘 |
|---|---|
| 대시보드 탭 | `LayoutDashboard` |
| 점검 탭 | `ClipboardList` |
| 일정 탭 | `Calendar` |
| 더보기 탭 | `Menu` |
| 뒤로가기 | `ChevronLeft` |
| 촬영 | `Camera` |

### Quick Tool Icons
| 도구 | Lucide 아이콘 |
|---|---|
| 도면 점검 | `Map` |
| DIV 트렌드 | `TrendingUp` |
| 고장 접수 | `Siren` |
| 직원 서비스 | `Users` |

### Zone Icons
| 구역 | Lucide 아이콘 |
|---|---|
| 연구동 | `FlaskConical` |
| 사무동 | `Building2` |
| 지하 | `TrainFront` |

### Assets
- `assets/icon-192.png` — CBC 방재팀 앱 로고 (CHA 로고 + "CBC 방재팀" 텍스트, 라운드 스퀘어)

---

## File Index

```
├── README.md                    ← 이 파일
├── SKILL.md                     ← Agent skill 정의
├── colors_and_type.css          ← 통합 CSS 변수 (색상 + 타이포그래피 + 스페이싱)
├── reference/
│   ├── design-system.md         ← 디자인 시스템 원본 (v0.1.0, 절대 기준)
│   ├── tokens.css               ← CSS 토큰 원본
│   ├── typography.css           ← 타이포그래피 원본
│   ├── tailwind.config.js       ← Tailwind 설정
│   ├── page-spec.md             ← 전체 페이지 스펙
│   └── samples/
│       ├── DashboardPage.tsx    ← 대시보드 구현 (698 lines)
│       └── InspectionPage.tsx   ← 점검 페이지 구현 (~5300 lines)
├── preview/                     ← Design System 탭 카드들
│   ├── surface-colors.html
│   ├── text-colors.html
│   ├── status-colors.html
│   ├── duty-colors.html
│   ├── accent-border.html
│   ├── type-scale.html
│   ├── type-display.html
│   ├── spacing-tokens.html
│   ├── radius-tokens.html
│   ├── buttons.html
│   ├── badges.html
│   ├── cards.html
│   ├── inputs.html
│   ├── stat-cards.html
│   └── modals.html
├── ui_kits/
│   └── bangje-app/
│       ├── README.md
│       ├── index.html           ← 인터랙티브 프로토타입
│       └── *.jsx                ← 컴포넌트 파일들
└── assets/                      ← 로고 및 시각 에셋
```
