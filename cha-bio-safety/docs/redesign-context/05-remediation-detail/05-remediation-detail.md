# 05. 조치 상세 재디자인 컨텍스트

> 자기-완결적입니다. 새 채팅에 이 한 파일만 복붙하면 (+ 섹션 5의 첨부 파일들) 작업 시작 가능.

> ⚠️ **권위 있는 디자인 스펙은 첨부된 `design-system.md` (v0.1.1) 입니다.**
> 아래 섹션 1은 v0.1.0 토큰 카탈로그의 인라인 요약(빠른 참조용). v0.1.1에서 추가된 다음 룰은 **반드시 `design-system.md` §6 ~ §7 을 따라 구현**하세요:
> - **Progress Color Rule** (진척률 색 매핑) — 도넛/카테고리 카드 색바
> - **Stat Card Number Color** — 좌측 3px 색바 + 위험 임계치 조건부 danger
> - **카테고리 카드** — 아이콘 모두 회색 통일, 진척률 색바, 0% 카드 opacity 0.6
> - **Iconography (Lucide + 커스텀 SVG 6종)** — 카테고리/도구/네비 매핑
> - Hover/Animation/Layout/Imagery 패턴

---

## 섹션 1. 디자인 시스템 컨텍스트 (v0.1.0 토큰 빠른 참조)

### 1. 디자인 원칙

이 시스템의 모든 디자인 결정은 다음 4가지 원칙을 따른다. 새 컴포넌트나 페이지를 만들 때 의사결정이 흔들리면 여기로 돌아온다.

#### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.

#### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.

#### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.

#### 1.4 상태 색은 의미가 우선
- `safe`(정상), `warning`(주의), `danger`(불량), `info`(정보), `fire`(조치 대기/긴급).
- foreground / bar / bg 3중 페어로 컨텍스트별 사용.
- `duty`(근무) 색은 status와 별개 시스템 — 혼용 금지.

### 2. 토큰 카탈로그

전체 정의는 `src/styles/tokens.css` 참조.

#### 2.1 Surface (5단계)
| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `--surface-page` | `#0a0d12` | `#ffffff` | 페이지 전체 배경 |
| `--surface-raised` | `#1a1f27` | `#f6f8fa` | 카드 |
| `--surface-sunken` | `#232a33` | `#ebeef1` | input, 카드 안 들어간 영역 |
| `--surface-active` | `#2c333d` | `#d8dee4` | 활성 탭, 선택된 슬롯 |
| `--surface-overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.5)` | 모달 뒤 어둡힘 |

#### 2.2 Text (6단계)
| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `--text-primary` | `#e6edf3` | `#1f2328` | 본문, 제목 |
| `--text-secondary` | `#adb6c0` | `#4d5562` | 보조 텍스트 (AAA 7:1+) |
| `--text-tertiary` | `#8b949e` | `#656d76` | 희미 메타, 시간 |
| `--text-disabled` | `#5d646e` | `#afb8c1` | 비활성 |
| `--text-on-accent` | `#ffffff` | `#ffffff` | 액센트 버튼 위 텍스트 |
| `--text-link` | `#58a6ff` | `#0969da` | 링크 |

#### 2.3 Status (3중 페어 × 5종)
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

#### 2.4 Duty (근무)
| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `--duty-day` | `#f59e0b` | `#b45309` | 주간 |
| `--duty-night` | `#ef4444` | `#b91c1c` | 당직 |
| `--duty-off` | `#3b82f6` | `#1f6feb` | 비번 |
| `--duty-leave` | `#6b7280` | `#6b7280` | 휴무 |

#### 2.5 Spacing (8단계 + 컴포넌트 토큰)

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

#### 2.6 Radius (4단계, 모드 무관)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-sm` | 8px | input, button, sub-card |
| `--radius-md` | 12px | 표준 카드 |
| `--radius-lg` | 16px | 모달, 큰 panel |
| `--radius-pill` | 99px | 캡슐 배지, 칩 |

#### 2.7 Typography (7단계)
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

## 섹션 2. 작업 대상 페이지 메타

| 항목 | 값 |
|---|---|
| 파일 경로 | `src/pages/RemediationDetailPage.tsx` |
| 라우트 | `/remediation/:recordId` |
| 라인 수 | 594 |
| 모바일 | ✅ |
| 데스크톱 | ✅ |
| BottomNav | **숨김** (자체 헤더 — 높이 48, 뒤로가기 + "조치 상세" 타이틀) |
| SideMenu | 자체 헤더 사용으로 미노출 |
| 접근 권한 | admin은 추가로 "조치 취소" / "삭제" 노출 |

---

## 섹션 3. 현재 페이지 분석

### 조치 상세 (`/remediation/:recordId`)

**파일 위치:** `src/pages/RemediationDetailPage.tsx`

**핵심 기능:**
- 조치 상세 정보 표시 + 조치 내용 입력 폼
- 카테고리별 "조치 피커" 자동 선택 — 점검 시 입력된 증상(`record.memo`)에 따라 기본 조치 옵션 결정
  - 유도등: `점등 이상→본체 교체`, `예비전원 이상→예비전원 교체`
  - 소화기: `받침 파손→받침 교체`, `연한 만료→소화기 교체`
  - 소화전: `경종 파손→경종 교체`, `위치표시등 점등 이상→위치표시등 교체`, `호스걸이 파손→호스걸이 교체`
  - 방화셔터: `방화셔터 라인 표시 필요→방화셔터 라인 표시함`, `연동제어기 기판 작동 불→연동제어기 기판 교체`
  - 전실제연댐퍼: `기판 조작 불량→기판 교체`, `모터 기능 이상→모터 교체`
- 조치 → 자재 자동 채움(`materialName`, `materialCount`) — 5개 카테고리 모두 동일 패턴
- 조치 사진 첨부, 조치 메모 입력
- admin 전용: 조치 취소 (`/unresolve`), 점검 기록 삭제 (`/inspections/records/{id}`)
- 조치 완료 후 dashboard/remediation 캐시 invalidate, navigate(-1)

**사용하는 데이터/API:**
- D1 테이블: `check_records`, `check_points`, `extinguishers`
- Worker 엔드포인트:
  - `GET /api/remediation/{recordId}`
  - `POST /api/inspections/records/{recordId}/resolve` (resolution_memo, resolution_photo_key, materials_used)
  - `POST /api/inspections/records/{recordId}/unresolve` (admin 전용)
  - `DELETE /api/inspections/records/{recordId}` (admin 전용)
- 외부 API: 없음

**주요 UI 요소:**
- 자체 헤더 (높이 48, 뒤로가기 버튼 + "조치 상세" 타이틀, BottomNav 숨김)
- KV 행 컴포넌트(`KVRow`)
- 카테고리별 조치 피커 버튼 그룹 + 직접 입력 textarea
- 자재 입력(자재명 input + 수량 number input + ea suffix)
- `PhotoButton` (조치 사진)
- admin: 조치 취소 / 삭제 버튼 (텍스트 컬러 outline 스타일)
- 고정 하단 CTA 버튼 (조치 완료)

**상태/인터랙션:**
- 5종 카테고리에 대해 5개의 별도 `useEffect` 가 `actionPick` 변경 시 자재 자동 채움 — 메모리에 의도된 패턴으로 명시
- `resolve` 성공 시: `queryClient.invalidateQueries(['remediation', 'remediation-detail', 'dashboard'])` + `navigate(-1)`

**현재 구현의 한계나 개선 여지:**
- 5개 카테고리에 대한 useEffect/useState 분기가 `is{Category}` 5개로 중복 — 패턴은 동일
- 자재 자동 채움 시 사용자가 수동 수정 후 다시 카테고리 변경하면 덮어쓰기됨 (의도된 동작인지 코드만으로는 불명)

---

## 섹션 4. 작업 지시 프롬프트

이 페이지를 디자인 시스템 v0.1.0 기준으로 재디자인해줘.

**진행 방식:**
1. 페이지 컨테이너 + 섹션 레이아웃 (자체 헤더 + 본문 + 고정 하단 CTA 구조) 먼저
2. 큰 컴포넌트부터 작은 컴포넌트 순서로 (이 페이지의 경우: 자체 헤더 → KV 행 카드 → 조치 피커 버튼 그룹 → 자재 입력 → 사진 첨부 → admin 액션 → 고정 하단 CTA)
3. 인터랙션과 상태 처리(loading/error/empty)는 마지막
4. 한 번에 다 하지 말고 단계별로 (stream 끊김 방지)

**이 페이지 특수 지침:**
- BottomNav가 숨겨지는 페이지이므로 **고정 하단 CTA 버튼**을 위해 페이지 본문에 적절한 paddingBottom 확보 필요.
- 조치 피커는 5개 카테고리(유도등/소화기/소화전/방화셔터/전실제연댐퍼) 별도 buttonset이지만 패턴 동일 → `<ActionPicker category={...} options={...}>` 형태로 통합 제안 가능 (단, 각 카테고리의 자재 자동채움 useEffect 보존 검증).
- admin 전용 버튼은 `useAuthStore` role 체크 그대로 유지.
- 조치 → 자재 자동 채움은 메모리에 의도된 패턴으로 명시 — useEffect 5개 구조는 보존, 제목/스타일만 바꿀 것.

**요구사항:**
- React + TypeScript + Tailwind만 사용
- `style={{...}}` 인라인 스타일 금지 (불가피한 경우만 예외, 사유 명시)
- 모바일/데스크톱 spacing 분기는 토큰이 자동 처리. `lg:*` prefix는 레이아웃 차이(컬럼 수, 사이드바 노출 등)에만 사용
- 새 공통 컴포넌트가 필요하면 `src/components/ui/`에 추가하고 컴포넌트 명세도 함께 출력
- 폰트는 모바일/데스크톱 동일 (노안 대응)
- 결과는 `src/pages/RemediationDetailPage.tsx` 교체본으로 출력

**보존 룰:** 기존 코드의 모든 비즈니스 로직(useQuery, useMutation, useState, 이벤트 핸들러, API 호출, navigation 등)은 100% 보존. UI 마크업과 스타일링만 재작성.

---

## 섹션 5. 새 채팅에 같이 첨부할 파일

이 폴더(`docs/redesign-context/05-remediation-detail/`) 안의 모든 파일을 새 채팅에 함께 드래그·첨부하면 됩니다.

| 파일 | 역할 |
|---|---|
| `05-remediation-detail.md` | 이 컨텍스트 문서 (지금 보고 있는 이 파일) |
| `design-system.md` | **권위 있는 디자인 시스템 스펙 v0.1.1** (Progress Color Rule, Stat Card 룰, Iconography 등 포함) — `docs/design-system.md` 스냅샷 |
| `RemediationDetailPage.tsx` | 재디자인 대상 — `src/pages/RemediationDetailPage.tsx` 스냅샷 |
| `tokens.css` | 디자인 토큰 — `src/styles/tokens.css` 스냅샷 |
| `typography.css` | 타이포그래피 — `src/styles/typography.css` 스냅샷 |
| `ui-index.tsx` | 공통 UI 컴포넌트 (`KVRow`, `StatusBadge` 등) — `src/components/ui/index.tsx` 스냅샷 |
| `PhotoButton.tsx` | 사진 버튼 컴포넌트 — `src/components/PhotoButton.tsx` 스냅샷 |

> 모두 스냅샷이므로 작업 도중 원본이 바뀌어도 영향 없음. 작업 시작이 며칠 이상 미뤄지면 재생성 권장.
>
> 추가 권장: lucide-react는 이미 설치되어 있고, 커스텀 SVG 아이콘은 `src/components/ui/icons.tsx` 에 정의되어 있습니다 (`StairsIcon`, `ShutterIcon`, `ExitSignIcon`, `SmokeVentIcon`, `HoseReelIcon`, `FireExtinguisherCustom`). 페이지가 카테고리/소화기/소화전/유도등/배연창/방화셔터 관련이면 직접 사용 검토.
