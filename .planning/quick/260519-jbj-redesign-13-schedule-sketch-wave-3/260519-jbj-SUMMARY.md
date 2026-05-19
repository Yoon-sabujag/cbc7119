---
phase: 260519-jbj
plan: 01
subsystem: redesign/13-schedule
tags: [sketch, wave-3, monthly-plan-preview, schedule, design-tokens-v0.1.1]
dependency_graph:
  requires:
    - cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx (source, untouched)
    - cha-bio-safety/docs/redesign-context/13-schedule/tokens.css
    - cha-bio-safety/docs/redesign-context/13-schedule/typography.css
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html (W1 LOCKED chrome reference)
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html (W2 LOCKED chrome reference)
  provides:
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html (W3 미리보기 시안 — 사용자 컨펌 + OQ 답변 대기)
  affects: []
tech_stack:
  added: []
  patterns:
    - "tokens.css + typography.css verbatim 임베드 (W1/W2 chrome mirror)"
    - "data-theme 토글 (다크/라이트)"
    - "v0.1.1 토큰 (var(--accent)) — source line 478의 var(--acl) 는 W3 chrome 에서 v0.1.1 token 로 정규화"
    - "31×21 dynamic 셀 색상 CSS 클래스화 (cell-bg-sun/sat/hol/safe + cell-today/cell-today-last)"
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html (1857 lines)
  modified: []
decisions:
  - "Sticky 좌측 NO+내용 컬럼은 모바일 다크 frame 에 시안 기본 a)로 시연. 라이트 frame 은 sticky 없음 b)로 대비 시연."
  - "FAB 시안 기본 b) 숨김 — 미리보기 페이지 본질이 다운로드라 일정 추가 부자연스러움."
  - "데스크톱 1280px frame 은 시안 기본 a) cramped 그대로 — 노안 격상 후퇴(c) 금지."
  - "inline style 예외 허용: 31×21 dynamic 셀 색상은 CSS 클래스로 환원, page-header / preview-table 컨테이너 inline style 은 source verbatim 위해 유지 (linear-gradient #15803d→#22c55e source line 478 + padding 12px 20px 8px source line 536)."
metrics:
  duration_minutes: 6
  completed_date: "2026-05-19"
---

# 260519-jbj — redesign/13-schedule sketch wave 3 Summary

**One-liner:** Monthly plan preview table (`MonthlyPlanPreview`, SchedulePage.tsx line 498~643) sketch with 21 rows × 31 days verbatim, header (백+타이틀+엑셀 다운로드+추가) line 470~486 verbatim, 노안 격상 9·10·11→12px, 4 frames (데스크톱 다크/라이트 + 모바일 393 다크 sticky + 라이트 자연 스크롤) + 2 variants (planLoading + Empty month) + OQ 3건.

---

## 작업 요약

- 단일 HTML 파일 작성: `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html` (1857 lines)
- 범위: SchedulePage.tsx `MonthlyPlanPreview` 컴포넌트 (line 498~643) 의 시각 디자인 컨펌용 정적 HTML
- 헤더 영역: line 470~486 verbatim 구조 (백 버튼 + 타이틀 "월간 점검 계획" + 엑셀 다운로드 + + 추가)
- 본 테이블:
  - 컨테이너 `padding:12px 20px 8px; background:var(--surface-raised)` (source verbatim, 토큰 정규화)
  - 타이틀 `5월 중요업무추진계획(방재)` text-center 14px weight 700 marginBottom 8
  - thead 2-row: 날짜 행 (`[빈칸][시행일자][1..31][비고]`) + 요일 행 (`[NO.][내 용][일~토 4.4 반복][빈칸]`)
  - tbody 21행 — PLAN_PREVIEW_ROWS verbatim (truncate 0), 31일 셀 분기 룰 source line 604~630 verbatim
  - 5/19 오늘 셀: `2px solid var(--accent)` border (날짜 행 top/side / 요일 행 side / tbody 셀 side, 마지막 행은 borderBottom 추가)
  - 멀티데이 5/12~5/15 (4일) 행 4 DIV+컴프레셔 → "점검" safe 0.10 배경
- 노안 격상 매핑 적용:
  - thead 11 → **12px** (text-caption + leading-none)
  - tbody NO. + 셀 12 → **12px**
  - 내용 label 셀 10 → **12px**
  - 비고 셀 9 → **12px** (lineHeight 1.2 유지)
  - 헤더 버튼 라벨 12 → **14px** (text-body)
  - 타이틀 14 → **14px** (변경 없음 — 이미 충분)
- 4 frame 시연:
  1. 데스크톱 1280px 다크 (메인 — 전체 21행 노출)
  2. 데스크톱 1280px 라이트 (대표 6행)
  3. 모바일 393px 다크 + sticky 좌측 NO/내용 (OQ #1 a) — 대표 5행)
  4. 모바일 393px 라이트 + sticky 없음 (OQ #1 b 대비 — 대표 3행)
- 2 variant:
  - planLoading=true → 엑셀 버튼 "생성 중..." + var(--surface-sunken) + disabled
  - Empty month items=[] → daily 행은 평일 "점검" / cats 행은 모두 "." empty
- OQ 3건 카드 (시안 기본 a/b/a) + LOCKED 일관성 카드 + 16-gate 검수 카드 + inline style 예외 사유 카드 + 메모리 룰 footer

---

## Verify gate 16/16 결과

| # | Gate | Expected | Measured | Status |
|---|------|----------|----------|--------|
| 1 | 라인 수 | ≥ 600 | **1857** | PASS |
| 2 | 이모지 (broad sweep) | 0 | **0** | PASS |
| 3 | font-size 9/10/11px (verbatim/source/line 주석 제외) | 0 | **0** | PASS |
| 4 | text-status- prefix (className) | 0 | **0** | PASS |
| 5 | 카테고리 5 hex (#3b82f6/#eab308/#e2e8f0/#f97316/#ef4444) | 각 ≥ 1 | 9 / 4 / 4 / 5 / 8 | PASS |
| 6 | 라이트 event #94a3b8 | ≥ 1 | **8** | PASS |
| 7 | PLAN_PREVIEW_ROWS 21 label 전수 등장 | 21 | **21** (MISSING 0) | PASS |
| 8 | 1~31 일자 등장 (날짜 행 + 요일 행 셀) | 31 | **31** (MISSING 0) | PASS |
| 9 | 요일 7개 (일·월·화·수·목·금·토) 등장 | 7 | **7** (MISSING 0) | PASS |
| 10 | `tokens.css line.*verbatim` 표시 | ≥ 1 | **9** | PASS |
| 11 | `typography.css line.*verbatim` 표시 | ≥ 1 | **5** | PASS |
| 12 | data-theme attr/토글/frame | ≥ 3 | **12** | PASS |
| 13 | "엑셀 다운로드" 라벨 | ≥ 1 | **6** | PASS |
| 14 | 5/12 + 5/15 멀티데이 시각 표시 | ≥ 1 each | 5/12=9, 5/15=6 | PASS |
| 15 | 오늘 셀 2px accent border | ≥ 3 | **11** | PASS |
| 16 | 타이틀 "5월 중요업무추진계획(방재)" verbatim | ≥ 1 | **6** | PASS |

**Negative gate:**
- 이모지 0 (broad U+1F000~U+1FFFF 스캔) PASS
- font-size 9/10/11px 0 (verbatim/source/line 주석은 1건 — "9px/10px/11px" 검수 항목 자체, 실제 CSS 0건) PASS
- W1/W2 LOCKED 위반 0 — 카테고리 5 hex 외 색상 0 (주말/공휴는 source rgba 룰 verbatim), "오늘" 텍스트 칩 본문 0회, 멀티데이 별표 0 PASS
- 비즈 로직 변경 0 — SchedulePage.tsx 1줄도 수정 X PASS

**Full automated verify script (PLAN.md `<automated>` 블록):** PASS

---

## Inline style 예외 사유

본 시안은 11곳 inline style 유지:
1. **page-header linear-gradient** (`background: linear-gradient(135deg,#15803d,#22c55e)`) — SchedulePage.tsx line 478 verbatim 재현이 우선. Tailwind `bg-gradient-to-br from-[#15803d] to-[#22c55e]` 으로 표현 가능하지만 source 와 동일성 유지를 위해 inline 유지.
2. **MonthlyPlanPreview 컨테이너** (`padding:12px 20px 8px; background:var(--surface-raised)`) — source line 536 verbatim.
3. **타이틀 div** (`text-align:center; font-size:14px; font-weight:700; margin-bottom:8px; color:var(--text-primary)`) — source line 538 verbatim.
4. **OQ/LOCKED/검수/예외 사유 카드** 의 alpha 배경 (`rgba(N,N,N,0.06)` + border `rgba(N,N,N,0.3)`) — Tailwind alpha utility 가 0.05/0.10/0.20 stepping 으로 정확 매칭 어려움. 시안 정보 카드 전용 customization.
5. **31×21 동적 셀 색상**: `cell-bg-sun/sat/hol/safe + cell-today/cell-today-last` 6종 CSS 클래스로 환원. inline 으로 표현해도 가독성 손상 → 클래스화 가산.

전체적으로 source 의 inline rule (line 622~630 의 `style={{ background: isWeekend ? (...) : text && !row.daily ? 'rgba(34,197,94,0.1)' : 'transparent', borderLeft: isTdy ? '2px solid var(--acl)' : undefined, ... }}`) 를 dynamic class 화 한 것 — 30 × 21 = 630 셀에 inline 을 다 박지 않아 마크업 가독성 확보.

---

## W1+W2 LOCKED 결정 mirror 확인

| LOCKED 결정 | W3 적용 | 위치 |
|------------|---------|------|
| 카테고리 5 hex 세트 verbatim | ✓ | cell-bg-safe (점검 칠해진 셀), CSS 변수 + dot 가용 (W1/W2 patten consistency) |
| 라이트 event dot #94a3b8 override | ✓ | `.event-dot-themed` CSS 룰 임베드 (W2 sketch line 240~245 mirror, body에 8회 노출) |
| 멀티데이 = dot only (W1 OQ #2) | ✓ | 5/12~5/15 멀티데이 셀에 "점검" 텍스트만 + safe 0.10 배경 (별표/dot 추가 표시 없음) |
| "오늘" 칩 본문 0회 (W1 OQ #3) | ✓ | 5/19 셀은 `2px solid var(--accent)` border 만 — "오늘" 문자 0회 grep PASS |
| 상태 칩 색 source verbatim (W2 OQ #1 a) | N/A | 본 wave 는 상태 칩 자체 없음 (개별 일정 X) |
| FAB CTA 우하단 (W2 OQ #2 c) | OQ #2 b 시안 기본 = FAB 숨김 | 미리보기 본질이 다운로드 |
| 멀티데이 = 시간 자리 텍스트 (W2 OQ #3 b) | N/A | 본 wave 는 시간 표시 자체 없음 |

---

## OQ — LOCKED (2026-05-19 사용자 답변)

| OQ | 답변 | 적용 |
|----|------|------|
| #1 | **LOCKED 모바일 미구현** — 미리보기는 데스크톱 전용 (SchedulePage.tsx 466~496 모바일 render 와 일치) | SECTION 3+4 모바일 frame 2개 + `.frame-mobile`/`.sticky-left`/`.mobile-table-wrap` CSS 룰 제거. 1857 → 1657줄 (-200) |
| #2 | **LOCKED b)** — 미리보기 페이지에서 FAB 표시 안 함. 헤더 "+ 추가" 버튼은 유지 | 4 frame 모두 FAB 없음 유지 |
| #3 | **LOCKED a)** — 데스크톱 1280px 셀 폭/폰트 = cramped 그대로 | SECTION 1+2 그대로 유지 |

---

## 사용자 다음 액션

1. **브라우저로 sketch-wave-3.html 열기:**
   ```bash
   open /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html
   ```
2. **시각 검수:**
   - 데스크톱 1280px 다크 (SECTION 1) — 31 cramped 폰트 12px 가독성 (1~2글자 노출) 판단
   - 데스크톱 1280px 라이트 (SECTION 2) — 라이트 모드 텍스트/배경 대비
   - 모바일 393px 다크 sticky (SECTION 3) — 가로 스크롤 시 좌측 NO/내용 stick 동작
   - 모바일 393px 라이트 자연 스크롤 (SECTION 4) — sticky 없음 대비
   - planLoading variant (SECTION 5-1) — 엑셀 버튼 "생성 중..." disabled 상태
   - Empty month variant (SECTION 5-2) — items=[] 일 때 daily/cats 행 분기
3. **OQ #1/#2/#3 답변:**
   - #1: sticky 적용 vs 없음
   - #2: FAB 숨김 vs 유지 vs 헤더 + 만
   - #3: 1280 cramped vs min-width:1800 vs 폰트 11
4. **답변 LOCKED 후 다음 wave:**
   - W4 (등록 모달 또는 자동 생성 패널) 또는
   - TSX 변환 wave (sketch W1+W2+W3 합쳐 SchedulePage.tsx v0.1.1 Tailwind 재작성)
5. **컨펌 후 main 머지** — cbc7119-preview.pages.dev 자동 배포 (현재 워크트리는 cbc7119-design, wrangler 금지)

---

## 커밋 정보

| 항목 | 값 |
|------|------|
| 브랜치 | `redesign/13-schedule` |
| 커밋 hash | `5d89faf` |
| 메시지 | `sketch(13-schedule): wave 3 — 월간 점검 계획 미리보기 테이블` |
| 변경 | `+1857 / -0` (1 file created) |

---

## Self-Check

- [x] sketch-wave-3.html 파일 존재 (`/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html` 1857 lines)
- [x] 16 verify gate PASS (자동화 + 수동)
- [x] negative gate PASS (이모지 0 / 9·10·11px 0 / status- 0 / 비즈 로직 변경 0)
- [x] commit hash 5d89faf 존재 (`git log --oneline -1` 확인)
- [x] PLAN_PREVIEW_ROWS 21 label 전수 truncate 0
- [x] W1+W2 LOCKED 결정 mirror 완료
- [x] OQ 3건 카드 노출 + 기본 선택 명시
- [x] SchedulePage.tsx 1줄도 수정 X

## Self-Check: PASSED
