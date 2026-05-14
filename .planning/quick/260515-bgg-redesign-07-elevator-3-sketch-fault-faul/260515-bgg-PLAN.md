---
quick_id: 260515-bgg
slug: redesign-07-elevator-3-sketch-fault-faul
description: redesign/07-elevator 2B sketch — Fault 흐름 3 모달 (FaultNewModal / FaultNewFullscreen / FaultResolveModal) v0.1.1 시안. 코드 변경 0건, 시안 HTML 1 파일.
date: 2026-05-15
status: planned
parent: 260515-4zh
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
autonomous: true
requirements: []
must_haves:
  truths:
    - 4 viewport (VP1 모바일 다크 FaultNewModal / VP2 모바일 라이트 FaultResolveModal / VP3 데스크톱 다크 FaultNewFullscreen / VP4 데스크톱 라이트 FaultResolveModal) 노출
    - 3 모달 모두 sketch 안에서 시각 확인 가능 — FaultNewModal (VP1) / FaultNewFullscreen (VP3) / FaultResolveModal (VP2 + VP4)
    - 호기 ID (EV-NN / ES-NN) 본문 노출 0건 — "N호기" 라벨만 (2A `260515-4zh` 룰 적용)
    - 본문 이모지 (🚨 🛗 📦 🔲 ↕️ ✕ 🔴 ✅ ⚠️ 🔲) 0건 — viewport 라벨 📱/🖥️ 만 허용
    - 9·10·11px 폰트 사이즈 0건 (노안 친화 — 본문 16px, 보조 12~14px)
    - 인라인 `style="..."` 0건 (Tailwind class + `<style>` 블록만)
    - [data-theme="dark"] / [data-theme="light"] 컨테이너 ≥4
    - viewport 라벨 (📱 / 🖥️) ≥4
    - EvSelector 임베드 영역에 2A `evselector-sketch.html` 의 시각 패턴 (5그룹 호기 그리드, `.es-btn-selected` accent fill, 호기 비선택/선택/고장 3상태) 재사용 — 본 sketch 에서는 "호기 선택 후" 결과 상태 위주 (1호기 또는 7호기 선택 highlight) 노출
    - 승객 탑승 토글 — ON 상태 (danger-bg + outline-danger + lucide AlertTriangle + text-danger) + OFF 상태 (surface-sunken + text-text-tertiary) 모두 등장. §6.1 색 의미 코멘트로 "danger = 즉시 위험 (승객 탑승) — 호기 고장 fire 와 다름" 명시
    - CTA 상태 변종 — 비활성 (opacity 0.5, 증상 비어있음) + 활성 (full opacity, 증상 입력됨) 모두 등장
    - 풀스크린 헤더 — 자체 헤더 (Siren 또는 AlertTriangle 아이콘 + 타이틀 "고장 접수" + 부제 "접수 후 TKE(1899-9070) 자동 연결" + ✕ 닫기 → lucide X 대체) + 본문 스크롤 영역 + 하단 CTA 영역 시각 확인 가능
    - FaultResolveModal 고장 정보 카드 — 호기 아이콘 (TYPE_ICON_COMPONENT 매퍼 — passenger=ElevatorIcon / cargo=Package / dumbwaiter=Square / escalator=MoveDiagonal) + "N호기" + 증상 요약 (pureSymptoms — `[발생층] [승객탑승]` prefix 제거) — bg-surface-sunken + rounded-lg + p-3
    - 사진 슬롯 — 0개 (FaultNew) + 2개 채워진 상태 (FaultResolve VP2) 두 variant 모두 등장 (MultiPhotoUpload placeholder)
    - lucide / 커스텀 아이콘 enumeration — ElevatorIcon (커스텀 SVG) / Siren 또는 AlertTriangle (Fullscreen 헤더 + 승객 탑승 ON) / X (닫기) / Camera (사진 슬롯) / CheckCircle2 (수리 완료 의미) / Calendar 또는 Clock (datetime) — 모두 등장
    - §6.4 CTA 그라디언트 정책 — fire 의미의 위험 CTA (FaultNew 의 "고장 접수") 는 그라디언트 1개 허용 (Wave 1 권위 따름), FaultResolve 의 "수리 완료" CTA 는 단색 accent (위험 아님)
    - §6.5 hover 패턴 (border-strong + translateY(-1px) .13s) 적용
    - §6.7 그림자 0건
    - §7.1 이모지 0건 (본문) — lucide + 커스텀 아이콘만
    - 라인 수 합리적 범위 (1500-4000 — 3 모달이라 2A 보다 약간 클 수 있음)
  artifacts:
    - path: cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
      provides: "Fault 흐름 3 모달 2B 시안 — FaultNewModal (VP1) + FaultNewFullscreen (VP3) + FaultResolveModal (VP2 + VP4) × 모바일 다크/라이트 + 데스크톱 다크/라이트 매트릭스"
      min_lines: 1500
  key_links:
    - from: cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
      to: cha-bio-safety/docs/redesign-context/07-elevator/sketch/elevator-sketch.html
      via: "1차 sketch 의 헤더 / 토큰 정의 / Tailwind config / Pretendard+Lucide CDN / viewport-frame 컨테이너 패턴 100% 복사"
    - from: cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
      to: cha-bio-safety/docs/redesign-context/07-elevator/sketch/evselector-sketch.html
      via: "2A EvSelector 시각 패턴 — 종류 토글 / 5그룹 호기 그리드 / `.es-btn-selected` accent fill / 호기 비선택·선택·고장 3상태 / 호기 라벨 N호기 단일 표기 재사용"
    - from: cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
      to: cha-bio-safety/src/pages/ElevatorPage.tsx
      via: "FaultNewModal (line 1998-2085) + FaultNewFullscreen (line 2087-2189) + FaultResolveModal (line 2191-2229) + ModalWrap (line 2504) + TYPE_ICON 매퍼 (line 194) + TKE_TEL (line 227) + inputSt/primaryBtnSt 1:1 매핑"
---

# 260515-bgg — redesign/07-elevator 2B sketch (Fault 흐름 3 모달)

## Background

1차 sketch (`260510-c2z`, `elevator-sketch.html`) = list 탭 + 페이지 헤더 / 탭 / 카드.
2A sketch (`260515-4zh`, `evselector-sketch.html`) = EvSelector + EsNodeMap + EsBtn (호기 선택 헬퍼 — 모든 모달 공통).

이번 2B 는 **Fault 흐름 3 모달** (`FaultNewModal` / `FaultNewFullscreen` / `FaultResolveModal`) 컨테이너 시각화. EvSelector 영역은 2A 의 시각 패턴을 임베드하되, 본 sketch 의 핵심은 **모달 컨테이너 본문 — Field / 입력 / 토글 / CTA / 풀스크린 자체 헤더 / 고장 정보 카드** 디자인이다.

Wave 1 TSX 변환 (`260515-3mc`) 토큰 매핑이 권위 (bg-surface-raised / bg-surface-sunken / text-text-primary / text-text-secondary / text-text-tertiary / bg-fire-bg / text-fire / bg-danger-bg / text-danger / bg-accent / text-text-on-accent / border-default / border-strong).

## 시안 범위

### 4 viewport 매트릭스

| Viewport | Theme | Device | Modal | 주요 시각 결정 노출 |
|---|---|---|---|---|
| VP1 | dark | mobile | FaultNewModal | EvSelector "호기 선택 후" 상태 (1호기 선택 highlight), 모든 필드 노출 (일시/층/승객 ON/증상 입력됨/사진 0개), CTA 활성 (그라디언트, fire 의미) |
| VP2 | light | mobile | FaultResolveModal | 고장 정보 카드 (ElevatorIcon + 1호기 + 증상 요약), 수리업체 TKE, 수리 일시, 수리 내용 입력됨, 사진 2개 채워짐, CTA 활성 (단색 accent) |
| VP3 | dark | desktop | FaultNewFullscreen | 풀스크린 자체 헤더 (AlertTriangle + 타이틀 + 부제 + X), EvSelector 5그룹 ANNUAL, 7호기 선택, 일시/층/승객 OFF, 증상 입력 중, 사진 1개, 하단 고정 CTA 활성 |
| VP4 | light | desktop | FaultResolveModal | ModalWrap 형태 유지 (데스크톱에서도 modal), 고장 정보 카드 + 수리업체/일시/내용 비어있음 → CTA 비활성 (opacity 0.5) |

### 디자인 의사결정 영역 (반드시 시각화)

#### 1. ModalWrap shell (현 코드 line 2504)

- 1차 sketch / Wave 1 inspection 모달 패턴과 일관
- 모달 헤더 = 타이틀 (text-text-primary, 16px, fontWeight 700) + ✕ 닫기 (→ lucide X, text-text-tertiary, hover text-text-primary)
- 본문 영역 = flex column gap-14 (FaultNew) / gap-12 (FaultResolve)
- 단독 사용 시 width 100% (모바일), max-width 480px 중앙 정렬 (데스크톱)
- footer 없음 (CTA 가 본문 끝에 있는 모달)

#### 2. Field 컴포넌트 시각 (현 코드 ~ line 2440)

- 라벨: 13px (10px 또는 11px 금지 — 노안 친화. 현 코드의 11px 도 14px 로 올림. v0.1.1 §노안 룰), fontWeight 700, text-text-secondary, marginBottom 5
- input / select / textarea: height 42 (단일행) 또는 row 3-4 (textarea), padding 12, border-default 1px, bg-surface-sunken, text-text-primary, rounded-md (8px)
- focus: border-strong + outline-none
- placeholder: text-text-tertiary

#### 3. 승객 탑승 토글 (현 코드 line 2050-2061)

- 라벨 "승객 탑승" (13px fontWeight 700 text-text-secondary, marginBottom 5)
- 버튼 height 42, padding "0 16px", rounded-md, fontSize 14 (12px 금지), fontWeight 700, border:none, whiteSpace nowrap, cursor pointer
- **ON 상태:** bg-danger-bg + text-danger + outline-2 outline-danger + lucide AlertTriangle (14×14, ml-1) — 라벨 "탑승"
- **OFF 상태:** bg-surface-sunken + text-text-tertiary + outline:none — 라벨 "미탑승"
- **§6.1 색 의미 코멘트:** "danger = 즉시 위험 (승객 탑승) — 호기 고장 fire 와 다름. 승객 탑승은 인명 안전 직결이므로 danger 유지"
- VP1 = ON 상태 demo / VP3 = OFF 상태 demo (Fullscreen 에서 OFF — 빈 호기 고장 케이스)

#### 4. MultiPhotoUpload placeholder (현 코드 별도 파일 — 본 sketch 는 placeholder 만)

- 라벨 ("증상 사진" / "수리 사진"): 13px fontWeight 700 text-text-secondary, marginBottom 5
- 사진 슬롯 3개 + 추가 버튼 1개 = 4 슬롯 총 grid-cols-4 (모바일) / grid-cols-6 (데스크톱, 더 많이 보이도록)
- 빈 슬롯: aspect-square + bg-surface-sunken + border-default border-dashed + lucide Camera (24×24, text-text-tertiary) 중앙
- 채워진 슬롯: aspect-square + bg-cover (회색 placeholder, 실제 이미지 X — 시안이므로) + rounded-md + 우상단 ✕ (lucide X 14×14, bg-surface-overlay rounded-full)
- VP1 = 0 슬롯 (빈 placeholder 4개), VP2 = 2 슬롯 채워짐 + 추가 슬롯 2개, VP3 = 1 슬롯 채워짐 + 빈 5개, VP4 = 0 슬롯

#### 5. CTA 버튼 (현 코드 line 2071-2079, 2176-2186, 2218-2225)

- 공통: height 48, padding "0 16px", rounded-md, fontWeight 700, fontSize 16 (본문급 — 노안 친화), border:none, cursor pointer, width 100%
- **FaultNew CTA (fire 의미 — 위험 CTA, 그라디언트 허용 §6.4 예외):**
  - 활성: `linear-gradient(135deg, #991b1b, #ef4444)` + text-white (현 Wave 1 권위 그대로)
  - 비활성: opacity 0.5
  - 라벨: "고장 접수 (TKE 자동 연결)" (Fullscreen 은 "고장 접수 (TKE 자동 연결)" — 🚨 이모지 제거. 헤더 아이콘이 이미 위험 알림 역할)
  - `<a href="tel:18999070">` 안 button 패턴 시각화 (코멘트로 명시)
- **FaultResolve CTA (위험 아님 — 단색 accent §6.4 기본):**
  - 활성: bg-accent + text-text-on-accent (단색)
  - 비활성: opacity 0.5
  - 라벨: "수리 완료" + lucide CheckCircle2 (16×16, ml-2)
- VP1 / VP3 = 활성 (그라디언트), VP2 = 활성 (accent), VP4 = 비활성 (opacity 0.5)

#### 6. 풀스크린 자체 헤더 (현 코드 line 2114-2123)

- 컨테이너: position fixed top-0 left-0 right-0 bottom-NAV_H zIndex 100, bg-surface, flex column, paddingTop safe-area-top
- 헤더 영역: flex-shrink-0, bg-surface-raised, borderBottom border-default 1px, padding "14px 16px 12px", flex items-center gap-10
- 아이콘 박스: 36×36, rounded-md, bg-danger-bg, flex center, **lucide AlertTriangle (또는 Siren) 20×20 text-danger** (현 코드 🚨 이모지 → 아이콘 대체)
- 타이틀: 16px (현 15px → 16px 본문급으로 올림) fontWeight 700 text-text-primary "고장 접수"
- 부제: 12px (현 10px → 12px 노안 친화로 올림) text-text-tertiary "접수 후 TKE(1899-9070) 자동 연결"
- ✕ 닫기: lucide X 20×20 text-text-tertiary, hover text-text-primary (현 코드 ✕ 문자 → 아이콘)
- 본문 스크롤 영역: flex-1 min-h-0 overflow-y-auto padding 16
- 하단 고정 영역: flex-shrink-0 padding "12px 16px" bg-surface-raised borderTop border-default — CTA 1개

#### 7. FaultResolve 고장 정보 카드 (현 코드 line 2205-2208)

- 컨테이너: bg-surface-sunken + rounded-lg + p-3 (현 padding "10px 13px" → p-3 토큰화)
- 1행: 호기 아이콘 + "{N}호기" (현 코드 `{TYPE_ICON[fault.elevator_type]} {fault.elevator_number}호기` — 이모지 → 아이콘 매퍼)
  - 아이콘 매퍼 (코멘트로 명시): passenger=ElevatorIcon / cargo=Package (lucide) / dumbwaiter=Square (lucide) / escalator=MoveDiagonal (lucide). VP2 = ElevatorIcon (passenger 1호기 가정), VP4 = MoveDiagonal (escalator)
  - 호기 라벨: 14px (현 11px → 14px) fontWeight 700 text-text-primary, "N호기" (EV-NN 본문 노출 X — 2A 룰)
- 2행: 증상 요약 텍스트 (pureSymptoms — `[발생층] [승객탑승]` prefix 제거된 결과), 13px text-text-secondary
- VP2 예시: "1호기 / 문이 안 닫힘, 도어센서 오작동 의심"
- VP4 예시: "5호기 (하행) / 비상정지 버튼 작동 안 됨"

#### 8. §6.1 색 의미 코멘트 (시안 상단 + 각 viewport 카드 코멘트)

```
<!-- §6.1 색 의미 고정 (v0.1.1, 2A 룰 계승 + 2B Fault 흐름 확장):
     · fire (주황)   = 호기 고장 미수리 — EvSelector 호기 버튼 + FaultNew CTA 그라디언트
     · danger (적)   = 즉시 위험 — 승객 탑승 토글 ON / 풀스크린 헤더 아이콘 박스 / Fullscreen CTA 그라디언트 종점
                       (Fault 흐름에서 fire 와 danger 의 차이: fire=고장 자체 / danger=인명 직결 위험)
     · accent (파)   = 선택 상태 + 수리 완료 CTA (단색)
     · safe (녹)     = (Fault 흐름 미사용 — EsBtn 상행 표시 전용)
-->
```

### v0.1.1 룰 준수 체크리스트

- [ ] §6.1 색바 — fire=호기 고장 / danger=승객 위험 + 풀스크린 헤더 / accent=수리 완료 / safe=미사용
- [ ] §6.2 negative rule — 위험 임계치 아닌 요소는 status 색 금지 (수리 업체 input / 일시 input / 빈 사진 슬롯 모두 회색)
- [ ] §6.3 회색 통일 — Field 라벨 / 비활성 토글 / 닫기 X / 부제 / pureSymptoms 모두 text-text-secondary 또는 text-text-tertiary
- [ ] §6.4 단색 surface + 그라디언트 예외 — FaultNew CTA (fire 위험 의미) 만 그라디언트, FaultResolve CTA / 토글 / 카드 모두 단색
- [ ] §6.5 hover — CTA / 닫기 X / 토글 / 사진 슬롯 모두 border-strong + translateY(-1px) .13s
- [ ] §6.6 animation — 일반 .13s
- [ ] §6.7 그림자 0건
- [ ] §7.1 이모지 0건 — 본문 (🚨 🛗 📦 🔲 ↕️ ✕ 🔴 ✅ ⚠️) 0건, viewport 라벨 📱/🖥️ 만 허용
- [ ] 노안 친화 — 9·10·11px 0건, 본문 16px (CTA + 타이틀) / 보조 12~14px

### 시안 포맷 (1차 c2z / 2A 4zh 와 동일 컨테이너 패턴 재사용)

- 단일 HTML 파일 신규 (`fault-modals-sketch.html`) — 1차 / 2A 와 분리
- Tailwind CDN + Pretendard CDN + Lucide CDN
- `[data-theme="dark"]` / `[data-theme="light"]` × 모바일/데스크톱 = 4 viewport
- 토큰 인라인 정의 + alias 변수 + Tailwind config (1차 / 2A 패턴 그대로 복사)
- 인라인 `style="..."` 0건 — Tailwind class + `<style>` 블록만 (2A 의 inline-style 제거 패턴 따름: grid-template-columns / sidebar width / 데모 fixed width 모두 CSS class)

## Out of scope

- 코드 변경 (`ElevatorPage.tsx` / `icons.tsx` / 모달 컨테이너 TSX 등) — 0건
- `InspectModal` (점검 기록) — 2C sketch 별도 quick
- `RepairNewModal` (수리 기록) — 2D sketch 별도 quick
- `EvDetailModal` (호기 상세) — 2E sketch 별도 quick
- KOELSA 검사 이력 — 3차 sketch 별도 quick
- TSX 변환 — 모든 sketch 통과 후 별도 quick (Wave 2/3)
- 실제 사진 이미지 — placeholder 회색 박스로만 표현 (시안)
- MultiPhotoUpload / PhotoSourceModal 내부 구현 — placeholder 그리드만 (Wave 1 inspection 패턴 참조)

## 작업 흐름

### Task 1 — `fault-modals-sketch.html` 신규 작성 + 자가검증

<task type="auto">
  <name>Task 1: fault-modals-sketch.html — 2B sketch HTML 신규 작성 + 자가검증 12/12 PASS</name>

  <files>cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html</files>

  <action>
신규 단일 HTML 파일 작성. 1차 sketch (`elevator-sketch.html`) + 2A sketch (`evselector-sketch.html`) 의 헤더 / 토큰 / CSS 블록 / viewport-frame 컨테이너 패턴 그대로 복사 후, **본문(viewport-frame 내부)을 Fault 흐름 3 모달 시안으로 전면 재구성**.

### 헤더 / 토큰 / 컨테이너 (1차 + 2A 패턴 100% 복사)

1. `<head>` Pretendard + Lucide CDN + Tailwind CDN
2. `<style>` 블록 — `[data-theme="dark"]` / `[data-theme="light"]` 토큰 (`elevator-sketch.html` line 20-156 그대로 복사 — `--bg` / `--bg2` / `--bg3` / `--t1` / `--t2` / `--t3` / `--bd` / `--bd-strong` / `--accent` / `--fire` / `--fire-bg` / `--danger` / `--danger-bg` / `--safe` / `--safe-bg` / `--on-accent`)
3. Tailwind config `<script>` — bg-surface / bg-surface-raised / bg-surface-sunken / text-text-primary / text-text-secondary / text-text-tertiary / bg-accent / text-text-on-accent / bg-fire-bg / text-fire / bg-danger-bg / text-danger / border-default / border-strong 토큰 alias
4. `.viewport-frame` / `.viewport-mobile` / `.viewport-desktop` 베이스 클래스 그대로 복사
5. `<body>` 안에 4 viewport-frame 컨테이너 + viewport 라벨 (📱 모바일 다크 / 📱 모바일 라이트 / 🖥️ 데스크톱 다크 / 🖥️ 데스크톱 라이트)

### 본문 — 3 모달 시안 (각 viewport-frame 내부)

각 viewport-frame 안에는 페이지 컨테이너 / 탭 / 네비를 재현하지 않음. **모달 자체 단독 데모**.

**VP1 — 모바일 다크 / FaultNewModal (호기 선택 후 상태, CTA 활성, 승객 ON):**

- ModalWrap shell:
  - overlay (bg-overlay, fixed inset-0)
  - panel (bg-surface, rounded-2xl, max-w-[420px], mx-auto, mt-12, p-4)
  - 헤더: "고장 접수" (16px 700 text-text-primary) + ✕ 닫기 (lucide X, 20×20, text-text-tertiary)
- 본문 (flex column gap-14):
  - **EvSelector 임베드** — 2A 패턴 그대로. 종류 토글 (엘리베이터 active, ElevatorIcon) + 4그룹 (FAULT variant, 덤웨이터 X). 호기 상태: 1호기 선택 (accent + outline-2 outline-accent), 4호기 고장 (fire-bg + Siren), 나머지 비선택. 그룹 라벨 4종 (uppercase tracking-wider text-text-tertiary).
  - Field "발생 일시": datetime-local input (예시 값 "2026-05-15T14:23")
  - 발생 층 + 승객 탑승 (flex gap-8 items-end):
    - 발생 층 select (flex-1, "1F" 선택됨)
    - 승객 탑승 토글 ON (danger-bg + outline-danger + text-danger + lucide AlertTriangle 14×14 + 라벨 "탑승")
  - Field "증상": textarea rows-3 입력됨 ("문이 안 닫힘, 도어센서 오작동 의심")
  - MultiPhotoUpload "증상 사진": grid-cols-4, 빈 슬롯 4개 (Camera icon 24×24 text-text-tertiary)
  - CTA: "고장 접수 (TKE 자동 연결)" — 활성 (그라디언트 `linear-gradient(135deg, #991b1b, #ef4444)`, text-white, height 48, fontSize 16, fontWeight 700)
  - 코멘트: `<!-- VP1 — FaultNewModal 호기 선택 후 / CTA 활성 / 승객 ON / 사진 0개 / fire 그라디언트 CTA -->`

**VP2 — 모바일 라이트 / FaultResolveModal (전체 입력 완료, CTA 활성):**

- ModalWrap shell:
  - overlay + panel (max-w-[420px], p-4)
  - 헤더: "수리 완료 처리" + ✕ 닫기 (lucide X)
- 본문 (flex column gap-12):
  - **고장 정보 카드** (bg-surface-sunken, rounded-lg, p-3):
    - 1행: ElevatorIcon (커스텀 SVG, 24×24, text-text-primary) + "1호기" (14px 700 text-text-primary)
    - 2행: "문이 안 닫힘, 도어센서 오작동 의심" (13px text-text-secondary)
  - Field "수리 업체": input value "TKE"
  - Field "수리 완료 일시": datetime-local input value "2026-05-15T15:47"
  - Field "수리 내용": textarea rows-3 입력됨 ("도어센서 교체 — TKE 출동, 1번 도어센서 모듈 신품 교체. 정상 동작 확인.")
  - MultiPhotoUpload "수리 사진": grid-cols-4, 2 슬롯 채워짐 (회색 placeholder bg + 우상단 ✕ 버튼 lucide X 14×14) + 빈 슬롯 2개 (Camera icon)
  - CTA: "수리 완료" + lucide CheckCircle2 (16×16 ml-2) — 활성 (bg-accent, text-text-on-accent, 단색, height 48, fontSize 16)
  - 코멘트: `<!-- VP2 — FaultResolveModal 전체 입력 완료 / 사진 2개 / accent 단색 CTA / 위험 아님 -->`

**VP3 — 데스크톱 다크 / FaultNewFullscreen (풀스크린, 호기 선택 후, 증상 입력 중, 사진 1개):**

- 풀스크린 컨테이너 (position fixed top-0 left-0 right-0 bottom-NAV_H, zIndex 100, bg-surface, flex column):
  - 자체 헤더 (flex-shrink-0, bg-surface-raised, borderBottom border-default, padding "14px 16px 12px", flex items-center gap-10):
    - 아이콘 박스 36×36 rounded-md bg-danger-bg flex center + lucide AlertTriangle 20×20 text-danger
    - 타이틀 영역 (flex-1):
      - "고장 접수" (16px 700 text-text-primary)
      - "접수 후 TKE(1899-9070) 자동 연결" (12px text-text-tertiary)
    - ✕ 닫기 lucide X 20×20 text-text-tertiary (hover text-text-primary)
  - 본문 스크롤 (flex-1 min-h-0 overflow-y-auto padding 16, flex column gap-16):
    - EvSelector 임베드 — 5그룹 ANNUAL variant (덤웨이터 포함). 7호기 선택 (accent), 10호기 고장 (fire+AlertTriangle), 나머지 비선택. 데스크톱 터치 타겟 40px.
    - Field "발생 일시" datetime-local
    - 발생 층 select + 승객 탑승 토글 OFF (surface-sunken + text-text-tertiary + 라벨 "미탑승")
    - Field "증상" textarea 입력 중 ("비상 정지 버튼 작동 안 됨. 점검 필요")
    - MultiPhotoUpload "증상 사진" grid-cols-6 (데스크톱), 1 슬롯 채워짐 + 빈 5개
  - 하단 고정 CTA 영역 (flex-shrink-0 padding "12px 16px" bg-surface-raised borderTop border-default):
    - `<a href="tel:18999070">` 코멘트로 명시
    - CTA "고장 접수 (TKE 자동 연결)" — 활성 (그라디언트 fire, height 48, fontSize 16) — 🚨 이모지 제거 (헤더 아이콘이 위험 알림 역할)
  - 코멘트: `<!-- VP3 — FaultNewFullscreen 풀스크린 / 자체 헤더 (AlertTriangle + X) / 호기 7호기 선택 / 승객 OFF / 증상 입력 중 / 사진 1개 / fire 그라디언트 CTA 활성 -->`

**VP4 — 데스크톱 라이트 / FaultResolveModal (데스크톱에서도 modal 형태 유지, CTA 비활성):**

- ModalWrap shell (데스크톱 형태):
  - overlay + panel (max-w-[520px], mx-auto, mt-16, p-5)
  - 헤더: "수리 완료 처리" + ✕ 닫기 (lucide X)
- 본문 (flex column gap-12):
  - 고장 정보 카드 (bg-surface-sunken, rounded-lg, p-3):
    - 1행: MoveDiagonal lucide 24×24 (escalator) + "5호기 (하행)" (14px 700)
    - 2행: "비상정지 버튼 작동 안 됨" (13px text-text-secondary)
  - Field "수리 업체": input value "TKE"
  - Field "수리 완료 일시": datetime-local value "2026-05-15T16:12"
  - Field "수리 내용": textarea rows-3 **비어있음** (placeholder "수리 내용" text-text-tertiary)
  - MultiPhotoUpload "수리 사진": grid-cols-6 (데스크톱), 빈 슬롯 6개
  - CTA: "수리 완료" + lucide CheckCircle2 — **비활성** (opacity 0.5, 단색 accent, "수리 내용 비어있음" 조건)
  - 코멘트: `<!-- VP4 — FaultResolveModal 데스크톱 modal / 호기 5호기 escalator / 수리 내용 빈 / CTA 비활성 opacity 0.5 -->`

### 색 의미 코멘트 (모든 viewport 공통, 상단 1회)

```
<!-- §6.1 색 의미 고정 (v0.1.1, 2A 룰 계승 + 2B Fault 흐름 확장):
     · fire (주황)   = 호기 고장 미수리 — EvSelector 호기 버튼 + FaultNew CTA 그라디언트
     · danger (적)   = 즉시 위험 — 승객 탑승 토글 ON / 풀스크린 헤더 아이콘 박스
                       (Fault 흐름에서 fire 와 danger 의 차이: fire=고장 자체 / danger=인명 직결 위험)
     · accent (파)   = 선택 상태 + 수리 완료 CTA (단색)
     · safe (녹)     = (Fault 흐름 미사용 — EsBtn 상행 표시 전용)

     §6.4 그라디언트 예외:
     · FaultNew CTA (fire 위험 의미) 1개만 허용 — Wave 1 TSX 권위 그대로
     · FaultResolve CTA / 토글 / 카드 모두 단색
-->
```

### 인라인 style 제거 패턴 (2A 룰 따름)

- grid-template-columns 인라인 → `.grid-cols-photo-mobile` (4) / `.grid-cols-photo-desktop` (6) CSS class
- 풀스크린 컨테이너 fixed inset → `.fullscreen-container` class (bottom: NAV_H 토큰화)
- 사진 슬롯 fixed aspect → `.photo-slot` class (aspect-square + 공통 시각)
- 데스크톱 modal max-w → `.modal-panel-desktop` class
- 모바일 modal max-w → `.modal-panel-mobile` class
- inline `style="..."` 발견 시 즉시 CSS class 대체 (자가검증 6번에서 차단)

### 자가검증 (작성 후, 커밋 전 — 12 체크)

```bash
SKETCH=cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html

# 1) 라인 수 합리적 범위
wc -l $SKETCH  # 1500-4000 기대 (3 모달이라 2A 1557 보다 약간 큼)

# 2) 9·10·11px 폰트 0건 (노안 친화)
grep -nE 'text-\[(9|10|11)px\]|font-size: ?(9|10|11)px' $SKETCH | wc -l  # → 0

# 3) [data-theme] 컨테이너 ≥4
grep -c 'data-theme=' $SKETCH  # ≥4

# 4) viewport 라벨 (📱 / 🖥️) ≥4
grep -cE '📱|🖥️' $SKETCH  # ≥4

# 5) 본문 이모지 0건 (코멘트 제외)
grep -v "^[[:space:]]*<!--" $SKETCH | grep -E '🚨|🛗|📦|🔲|↕|✕|🔴|✅|⚠' | wc -l  # → 0

# 6) EV- / ES- 본문 노출 0건 (2A 룰 — 호기 ID 본문 X)
grep -v "^[[:space:]]*<!--" $SKETCH | grep -cE 'EV-[0-9]|ES-[0-9]'  # → 0

# 7) 인라인 style 0건
grep -nE 'style="[^"]+"' $SKETCH | wc -l  # → 0

# 8) 3 모달 등장 (코멘트/섹션 라벨로 확인)
grep -c 'FaultNewModal' $SKETCH        # ≥1 (VP1 코멘트)
grep -c 'FaultNewFullscreen' $SKETCH   # ≥1 (VP3 코멘트)
grep -c 'FaultResolveModal' $SKETCH    # ≥2 (VP2 + VP4)

# 9) 아이콘 enumeration (lucide / 커스텀)
grep -cE 'ElevatorIcon|elevator-icon' $SKETCH                    # ≥2 (VP1 EvSelector + VP2 고장 카드)
grep -cE 'Siren|siren|AlertTriangle|alert-triangle' $SKETCH      # ≥3 (호기 고장 + 풀스크린 헤더 + 승객 ON)
grep -cE '"X"|data-lucide="x"' $SKETCH                            # ≥4 (4 viewport 닫기 + 풀스크린 X)
grep -cE 'Camera|camera' $SKETCH                                 # ≥4 (4 viewport 빈 사진 슬롯)
grep -cE 'CheckCircle2|check-circle-2|CheckCircle' $SKETCH       # ≥2 (FaultResolve CTA — VP2 + VP4)

# 10) 승객 탑승 토글 상태
grep -c '탑승' $SKETCH       # ≥2 (ON 라벨 "탑승" + OFF 라벨 "미탑승" + 코멘트)
grep -c '미탑승' $SKETCH     # ≥1 (VP3 OFF)

# 11) CTA 상태 변종
grep -cE 'opacity-50|opacity:0\.5|opacity: 0\.5' $SKETCH         # ≥1 (VP4 비활성)
grep -c '고장 접수' $SKETCH  # ≥2 (VP1 + VP3 CTA, FaultNewModal/Fullscreen)
grep -c '수리 완료' $SKETCH  # ≥2 (VP2 + VP4 CTA)

# 12) 풀스크린 자체 헤더 요소
grep -c '1899-9070' $SKETCH  # ≥1 (VP3 부제)
grep -c 'TKE' $SKETCH        # ≥3 (VP1 CTA + VP2 수리 업체 + VP3 헤더/CTA)
```

모든 체크 통과 시에만 커밋. 한 건이라도 실패하면 시안 수정 후 재검증.

  </action>

  <verify>
    <automated>bash -c '
SKETCH=cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
[ -f "$SKETCH" ] || { echo "FAIL: file missing"; exit 1; }

# 1) line count
LINES=$(wc -l < "$SKETCH"); echo "Lines: $LINES"
[ "$LINES" -ge 1500 ] && [ "$LINES" -le 4000 ] || { echo "FAIL: line count $LINES out of 1500-4000"; exit 1; }

# 2) 9-11px fonts
SMALL=$(grep -cE "text-\[(9|10|11)px\]|font-size: ?(9|10|11)px" "$SKETCH"); echo "small fonts: $SMALL"
[ "$SMALL" -eq 0 ] || { echo "FAIL: 9-11px font present"; exit 1; }

# 3) data-theme >=4
THEME=$(grep -c "data-theme=" "$SKETCH"); echo "data-theme: $THEME"
[ "$THEME" -ge 4 ] || { echo "FAIL: data-theme < 4"; exit 1; }

# 4) viewport labels >=4
LABEL=$(grep -cE "📱|🖥" "$SKETCH"); echo "viewport labels: $LABEL"
[ "$LABEL" -ge 4 ] || { echo "FAIL: viewport label < 4"; exit 1; }

# 5) body emojis = 0 (excluding comments)
EMOJI=$(grep -v "^[[:space:]]*<!--" "$SKETCH" | grep -cE "🚨|🛗|📦|🔲|↕|✕|🔴|✅|⚠"); echo "body emojis: $EMOJI"
[ "$EMOJI" -eq 0 ] || { echo "FAIL: emoji in body"; exit 1; }

# 6) EV-/ES- body = 0
EVID=$(grep -v "^[[:space:]]*<!--" "$SKETCH" | grep -cE "EV-[0-9]|ES-[0-9]"); echo "EV-/ES- body: $EVID"
[ "$EVID" -eq 0 ] || { echo "FAIL: EV-/ES- in body"; exit 1; }

# 7) inline style = 0
INLINE=$(grep -cE "style=\"[^\"]+\"" "$SKETCH"); echo "inline style: $INLINE"
[ "$INLINE" -eq 0 ] || { echo "FAIL: inline style present"; exit 1; }

# 8) 3 modals present
FNM=$(grep -c "FaultNewModal" "$SKETCH"); echo "FaultNewModal: $FNM"
[ "$FNM" -ge 1 ] || { echo "FAIL: FaultNewModal missing"; exit 1; }
FNF=$(grep -c "FaultNewFullscreen" "$SKETCH"); echo "FaultNewFullscreen: $FNF"
[ "$FNF" -ge 1 ] || { echo "FAIL: FaultNewFullscreen missing"; exit 1; }
FRM=$(grep -c "FaultResolveModal" "$SKETCH"); echo "FaultResolveModal: $FRM"
[ "$FRM" -ge 2 ] || { echo "FAIL: FaultResolveModal < 2 (VP2+VP4 expected)"; exit 1; }

# 9) icon enumeration
EIC=$(grep -cE "ElevatorIcon|elevator-icon" "$SKETCH"); echo "ElevatorIcon: $EIC"
[ "$EIC" -ge 2 ] || { echo "FAIL: ElevatorIcon < 2"; exit 1; }
SIR=$(grep -cE "Siren|siren|AlertTriangle|alert-triangle" "$SKETCH"); echo "Siren/AlertTriangle: $SIR"
[ "$SIR" -ge 3 ] || { echo "FAIL: Siren/AlertTriangle < 3"; exit 1; }
XIC=$(grep -cE "data-lucide=\"x\"|\"X\"|lucide-x" "$SKETCH"); echo "X icon: $XIC"
[ "$XIC" -ge 4 ] || { echo "FAIL: X icon < 4"; exit 1; }
CAM=$(grep -cE "Camera|camera" "$SKETCH"); echo "Camera: $CAM"
[ "$CAM" -ge 4 ] || { echo "FAIL: Camera < 4"; exit 1; }
CCC=$(grep -cE "CheckCircle2|check-circle-2|CheckCircle" "$SKETCH"); echo "CheckCircle: $CCC"
[ "$CCC" -ge 2 ] || { echo "FAIL: CheckCircle < 2"; exit 1; }

# 10) passenger toggle states
TBO=$(grep -c "탑승" "$SKETCH"); echo "탑승 label: $TBO"
[ "$TBO" -ge 2 ] || { echo "FAIL: 탑승 label < 2"; exit 1; }
MTB=$(grep -c "미탑승" "$SKETCH"); echo "미탑승 (OFF): $MTB"
[ "$MTB" -ge 1 ] || { echo "FAIL: 미탑승 missing"; exit 1; }

# 11) CTA state variants
OP5=$(grep -cE "opacity-50|opacity:0\.5|opacity: 0\.5" "$SKETCH"); echo "opacity 0.5: $OP5"
[ "$OP5" -ge 1 ] || { echo "FAIL: disabled CTA opacity 0.5 missing (VP4)"; exit 1; }
GCT=$(grep -c "고장 접수" "$SKETCH"); echo "고장 접수: $GCT"
[ "$GCT" -ge 2 ] || { echo "FAIL: 고장 접수 CTA < 2"; exit 1; }
SCT=$(grep -c "수리 완료" "$SKETCH"); echo "수리 완료: $SCT"
[ "$SCT" -ge 2 ] || { echo "FAIL: 수리 완료 CTA < 2"; exit 1; }

# 12) Fullscreen header elements
TKE=$(grep -c "1899-9070" "$SKETCH"); echo "1899-9070: $TKE"
[ "$TKE" -ge 1 ] || { echo "FAIL: 1899-9070 phone missing"; exit 1; }
TKL=$(grep -c "TKE" "$SKETCH"); echo "TKE: $TKL"
[ "$TKL" -ge 3 ] || { echo "FAIL: TKE label < 3"; exit 1; }

echo "ALL 12 CHECKS PASS"
'</automated>
  </verify>

  <done>
- `fault-modals-sketch.html` 신규 생성 (1500~4000 줄)
- 브라우저에서 열었을 때 4 viewport 모두 시각 확인 가능:
  - VP1 모바일 다크 FaultNewModal (호기 선택 후 / 승객 ON / 사진 0개 / fire CTA 활성)
  - VP2 모바일 라이트 FaultResolveModal (전체 입력 완료 / 사진 2개 / accent CTA 활성)
  - VP3 데스크톱 다크 FaultNewFullscreen (풀스크린 자체 헤더 / 호기 7호기 선택 / 승객 OFF / fire CTA 활성)
  - VP4 데스크톱 라이트 FaultResolveModal (호기 5호기 escalator / 수리내용 빈 / accent CTA 비활성)
- 3 모달 컨테이너 (FaultNewModal / FaultNewFullscreen / FaultResolveModal) + EvSelector 임베드 (2A 패턴) + 모든 디자인 의사결정 (Field / 토글 / 사진 / CTA / 풀스크린 헤더 / 고장 정보 카드) 시각 확인 가능
- 자가검증 12/12 PASS (라인 수 / 9-11px 0 / [data-theme] ≥4 / viewport 라벨 ≥4 / 본문 이모지 0 / EV-ES- 본문 0 / 인라인 style 0 / 3 모달 모두 / 아이콘 enumeration 5종 / 토글 ON+OFF / CTA 활성+비활성 / 풀스크린 헤더 요소)
- 코드 변경 0건 (ElevatorPage.tsx / icons.tsx / 기타 src/ 모두 untouched)
  </done>
</task>

## Build / Deploy

배포 안 함 (시안만). Task 1 완료 + 자가검증 12/12 PASS 후 git commit + push.

커밋 메시지 형식:
```
docs(260515-bgg): 07-elevator 2B sketch — Fault 흐름 3 모달 (FaultNewModal + FaultNewFullscreen + FaultResolveModal)
```

## 사용자 컨펌 후 다음 단계

1. 브라우저에서 4 viewport 시각 검토 → ModalWrap shell / Field / 승객 토글 색 의미 (danger vs fire) / 풀스크린 자체 헤더 / 고장 정보 카드 / CTA 그라디언트 정책 컨펌
2. 컨펌 시: 2C sketch (InspectModal — 점검 기록) 또는 2D sketch (RepairNewModal — 수리 기록) 별도 quick
3. 모든 모달 sketch 통과 후 TSX 변환 quick 진행 (Wave 2/3)
