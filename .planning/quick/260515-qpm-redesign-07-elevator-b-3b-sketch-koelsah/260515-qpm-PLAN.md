---
quick_id: 260515-qpm
slug: redesign-07-elevator-b-3b-sketch-koelsah
date: 2026-05-15
branch: redesign/07-elevator
type: quick
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html
autonomous: true
tags: [sketch, redesign, elevator, inspect-tab, annual-tab, koelsa-history, list, design-tokens, lucide]

# ───────────────────────────────────────────────────────────
# 옵션 B 두번째 wave (3B) — 점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection
# ───────────────────────────────────────────────────────────
# 5탭 본문 중 KOELSA 공단 API 데이터 흐름인 형제 2 탭(점검/검사) +
# 데스크톱 EvDetailModal 우측 패널 KoelsaHistorySection 5 상태를 한 sketch 로 묶음.
# 다음 wave: 3C (안전관리자) — 별도 quick task.
# 다음 wave 변환: 3A 와 동일하게 Wave 10 예정.

must_haves:
  truths:
    - "단일 HTML 파일 — inspect-cert-history-sketch.html"
    - "[data-theme] 컨테이너 ≥4 (모바일 다크 + 모바일 라이트 + 데스크톱 다크 + 데스크톱 라이트)"
    - "viewport 라벨 ≥4 (📱 모바일 / 🖥️ 데스크톱 × 다크/라이트 명시)"
    - "점검 기록 탭 본문 시각화: 월 피커(◀/▶) + 4 타입 그룹(passenger/cargo/dumbwaiter/escalator) 헤더 + 호기 카드 3변형 (양호 접힘 + 이상 펼침(A~E 카운트 칩 + 주의관찰 grid 2 row) + 미점검 접힘) + 빈 상태 (ClipboardList) + 로딩 + 에러 — 최소 3 변형"
    - "검사 기록 탭 본문 시각화: 연도 피커(◀/▶) + 호기 카드 2변형 (합격 접힘 + 보완후합격 펼침 — 부적합 fails grid) + 빈 상태 2변형 (등록 없음 Search / 해당 연도 없음 ClipboardList) + 로딩 + 에러 — 최소 2 카드"
    - "KoelsaHistorySection 5 상태 시각화 (데스크톱 우측 패널): (1) 정상 렌더(헤더 + 동기화 시각 + 카드 list 접힘/펼침) / (2) cert_no 없음 / (3) 로딩 스켈레톤(18/14/48 그레이) / (4) 에러 / (5) 빈 historyCount=0"
    - "본문 이모지 0건 — 모두 lucide 매핑: 📋 → ClipboardList / 🔍 → Search / ⚠️ → AlertTriangle / TYPE_ICON → ElevatorIcon/Package/UtensilsCrossed/MoveDiagonal (3A 와 동일 매퍼) / ChevronRight (펼침 표시) / ChevronLeft (◀ 피커) 또는 chevron 변형"
    - "9·10·11px 폰트 0건 — 옛 코드의 9/10/11px(현 inspect+annual 본문 인라인 다수) 모두 12px 이상으로 격상 (12 caption / 13 body-sm / 14 body)"
    - "인라인 style 속성 0건 (모두 CSS class 또는 <style> block — 3A 패턴 그대로)"
    - "호기 ID(EV-NN/ES-NN) 본문 노출 0건 — 호기 라벨은 'N호기' 만 (3A 와 동일 룰)"
    - "옛 토큰(--bg2/bd/bd2/t1/t2/t3/bg3) 인라인 0건 — 모두 v0.1.1 시각 토큰 (bg-surface-raised / border-border-default / text-text-primary 등) 으로 매핑"
    - "점검 카드 배지 색 결정 시각화 — 미점검(t3 회색) / 이상(warn) / 양호(safe) 좌측 색바 또는 우측 배지 톤 통일 (3A fault-card 좌측 색바 패턴과 일관)"
    - "주의관찰 항목 grid 색 결정 — C 결과(긴급수리)=danger / 그 외(주의관찰)=warn (현 코드 색 보존)"
    - "검사 카드 dispWords 5종 색 결정 시각화 — 합격=safe / 보완후합격·조건부=warn / 보완·불합격=danger / 기타=t3 (현 KoelsaHistorySection.dispColor 100% 보존)"
    - "부적합 fails grid 시각화 — standardArticle/standardTitle (text-text-primary bold '▸ ...') + failDesc (text-text-secondary + paddingLeft 12) + failDescInspector (text-text-tertiary 보조)"
    - "월 피커 / 연도 피커 동일 패턴 — 32×32 button ◀/▶ + 가운데 라벨 14px bold + disabled opacity 0.4"
    - "KoelsaHistorySection 정상 렌더 헤더 — '공단 공식 검사이력' + '· 총 N건' + '동기화 N시간 전' (marginLeft auto, formatDistanceToNow ko 그대로)"
    - "KoelsaHistorySection 카드 펼침 시 — 부적합 1건 이상이면 fails 표시 / 0건이면 '부적합 내역 없음' (text-text-tertiary)"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
      provides: "옵션 B 3B sketch — 점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection 5 상태 4 viewport 시각화"
      min_lines: 1200
      max_lines: 3500
  key_links:
    - from: "inspect-cert-history-sketch.html"
      to: "fault-repair-lists-sketch.html (3A)"
      via: "tokens.css 다크/라이트 + viewport-frame + meta-label + typography 7단계 + 카드 좌측 색바 ::before pseudo + 자체 헤더(미해결 칩 + 6탭) 100% 재사용"
      pattern: "\\[data-theme=\"(dark|light)\"\\]"
    - from: "inspect-cert-history-sketch.html"
      to: "evdetail-modal-sketch.html (2D)"
      via: "KIND_STYLE 카탈로그 row 패턴 (dispWords 5종 카탈로그 row 로 응용)"
      pattern: "kind-(fault|repair|inspect|annual)|cat-row"
    - from: "inspect-cert-history-sketch.html"
      to: "fault-modals-sketch.html (2B)"
      via: "AlertTriangle warn 헤더 패턴 (주의관찰 항목 + 부적합 N건 헤더)"
      pattern: "alert-triangle|warn-header"

verify_before_commit:
  - id: 1
    name: 라인 수
    target: "1200-3500"
    cmd: "wc -l cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
  - id: 2
    name: 9·10·11px 폰트
    target: "0건"
    cmd: "grep -cE 'font-size:\\s*(9|10|11)px|fontSize:(9|10|11)\\b' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
  - id: 3
    name: 본문 이모지
    target: "0건"
    cmd: "grep -cP '[\\x{1F300}-\\x{1F9FF}]|📋|🔍|⚠️|✅|🚨|🔧|📷|⏳' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html | grep -v 'viewport.*📱\\|viewport.*🖥️'"
  - id: 4
    name: 인라인 style 속성
    target: "0건"
    cmd: "grep -c 'style=\"' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
  - id: 5
    name: 호기 ID 본문 노출
    target: "0건"
    cmd: "grep -cE 'EV-[0-9]+|ES-[0-9]+' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
  - id: 6
    name: viewport [data-theme] >=4
    target: ">=4"
    cmd: "grep -c '\\[data-theme=' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
  - id: 7
    name: 옛 토큰 인라인 0건
    target: "0건"
    cmd: "grep -cE 'var\\(--(bg2|bd|bd2|t1|t2|t3|bg3)\\)' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html"
  - id: 8
    name: 코드 변경 0건
    target: "0건"
    cmd: "git diff --name-only HEAD | grep -v 'docs/redesign-context' | grep -v '.planning/' | wc -l"
---

<objective>
redesign/07-elevator 옵션 B 두번째 wave (3B) — 5탭 본문 sketch 시리즈 중 KOELSA 공단 API 데이터 흐름인 형제 2 탭(점검 기록 + 검사 기록) + 데스크톱 EvDetailModal 우측 패널 KoelsaHistorySection 5 상태를 한 sketch HTML 로 묶어 시각화. v0.1.1 토큰 + Tailwind 권위. 코드 변경 0건. 다음 wave 에서 TSX 변환 시 1:1 매핑 source 로 사용.

Purpose: 3A (고장+수리) 변환은 Wave 9 (0af052c) 으로 완료. 남은 5탭 본문 중 inspect/annual 두 탭과 KoelsaHistorySection 컴포넌트(198라인) 본체가 옛 인라인 var() + 이모지(📋/🔍/⚠️) 그대로. 데이터 모양이 비슷한 형제(공단 API → 호기별 카드 list → 부적합 펼침) 묶어 sketch 권위 잡고 TSX 변환.

Output: 단일 sketch HTML — 4 viewport × 점검 탭 / 검사 탭 / KoelsaHistorySection 5 상태. 코드 변경 0건. 다음 wave 의 변환 source.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah/

# 메모리 권위
# - project_redesign_07_elevator_status.md → 옵션 B 5 탭 본문 sketch+변환. 3A 끝, 3B = 점검+검사+KoelsaHistorySection.
# - feedback_redesign_sketch_rule_enforcement.md → §6.1 색 토큰 분리 + verify gate 4중 강화
# - feedback_sketch_realistic_data.md → 표시 분기/라벨 코드 그대로, 시각만 손봄
# - project_design_tokens_branch.md → v0.1.1 시각 토큰 룰 (bg-surface-raised / text-text-primary 등)

# 패턴 참고 (재사용 — 인프라 source)
# - cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-repair-lists-sketch.html (3A — 가장 최근, 인프라/tokens/typography/viewport 100% 재사용 source)
# - cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html (2D — KIND_STYLE 카탈로그 row 패턴)
# - cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html (2B — AlertTriangle warn 헤더 패턴)

# 코드 source (Read 검증 완료 — 2026-05-15)
# - cha-bio-safety/src/pages/ElevatorPage.tsx
#   - 점검 기록 탭 본문 (line 1224~1325): 월 피커 + 로딩/에러/빈 + 4 타입 그룹 헤더 + 호기 카드 (헤더 TYPE_ICON+호기+위치+점검일+배지+chevron / 펼침 점검업체+점검자 + A~E 카운트 칩 + 주의관찰 grid 3-col)
#   - 검사 기록 탭 본문 (line 1327~1499): 연도 피커 + 로딩/에러/빈 2변형 + 호기 카드 (헤더 TYPE_ICON+호기+공단번호+classification+건수+최근일+dispWords 배지+chevron / 펼침 검사 이력 카드 list — 날짜+검사종류+dispWords 배지+유효기간+기관/회사명+부적합 fails)
#   - KoelsaHistorySection 본체 (src/components/KoelsaHistorySection.tsx 1~198라인): 5 상태 분기 (cert_no 없음 / 로딩 스켈레톤 / 에러 / 빈 historyCount=0 / 정상 렌더 — 헤더 + 카드 list 접힘/펼침)

# 색 매핑 (사용자 의도 — 메모리 + 직전 sketch 권위)
# - 점검 카드 배지 색: 미점검=text-tertiary / 이상=warn / 양호=safe (현 코드 dispColor 와 동일)
# - 주의관찰 grid 결과: C=danger(긴급수리) / 그 외=warn(주의관찰) — 보존
# - 검사 카드 dispWords 배지: 합격=safe / 보완후합격·조건부=warn / 보완·불합격=danger / 기타=text-tertiary (KoelsaHistorySection.dispColor 코드 그대로)
# - 부적합 grid: 헤더=warn (AlertTriangle + '부적합 N건') / standardArticle.standardTitle=text-primary bold '▸ ...' / failDesc=text-secondary + paddingLeft / failDescInspector=text-tertiary 보조
# - 카드 좌측 색바 (3A 패턴 응용 옵션): 점검 미점검=text-tertiary / 이상=warn / 양호=safe (배지 색과 일관) — 사용자 검토 후 확정 (시안만 노출)
# - KoelsaHistorySection 헤더 동기화 시각: text-text-tertiary 보조 (현 코드 t3 그대로)
# - 5 상태 박스 (cert_no 없음 / 로딩 / 에러 / 빈): 모두 boxStyle = bg-surface-raised + border-border-default + radius 12 + pad 16

@cha-bio-safety/src/pages/ElevatorPage.tsx
@cha-bio-safety/src/components/KoelsaHistorySection.tsx
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-repair-lists-sketch.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: inspect-cert-history-sketch.html 작성</name>
  <files>cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html</files>
  <action>
직전 sketch (fault-repair-lists-sketch.html — 3A, 1837라인 1:1 mirror source) 의 tokens.css + viewport-frame + meta-label 인프라 100% 재사용. 본문에 4 viewport 영역 작성.

### viewport 구성 (4개 — 3A 와 동일 구조)

**VP1 모바일다크 — 점검 기록 탭 본문 (data 있음)**
- 자체 헤더 (미해결 칩 + 6탭, '점검 기록' 활성) — 3A 헤더 패턴 그대로
- 월 피커 (◀ 2026년 5월 ▶, 32×32 button + 14px bold 가운데 라벨)
- 그룹 1 헤더 ("passenger 8대" — text-caption 12px text-tertiary uppercase letterSpacing .06em — 옛 fontSize:9 → 12px 격상)
- 호기 카드 3변형:
  - 카드 A 양호 접힘:
    - 헤더: TYPE_ICON 박스(40×40 + bg-surface-sunken + radius 10) + 1호기 (text-body bold) + "B5-연구동2층 (투명 E/V, 장애/전망용)" (text-caption text-tertiary, marginLeft 4) + "점검일: 2026-05-05" (text-caption text-tertiary, marginTop 2) + 양호 배지 (text-caption bold text-safe + bg-safe-bg + radius 20 + padding 3 8) + ChevronRight lucide (14×14 text-tertiary)
  - 카드 B 이상 펼침:
    - 헤더: 4호기 / "B5-사무동8층" / 점검일 2026-05-05 / 이상 배지 (text-warn + bg-warn-bg) / ChevronRight rotate 90deg
    - 펼침 영역 (border-top border-default + padding 12 14):
      - 2-col grid (text-body-sm 13px): "점검업체 티케엘리베이터코리아" / "점검자 김영민" (라벨 text-tertiary + 값 text-primary bold)
      - A~E 카운트 칩 (flex gap 6, flex-wrap): "양호 8" (text-safe + bg-safe-bg) / "주의 2" (text-warn + bg-warn-bg) / "긴급 1" (text-danger + bg-danger-bg) — 옛 fontSize:10 → 12px 격상
      - 주의관찰 항목 박스 (border border-default + radius 8):
        - 헤더 (padding 6 10 + bg-surface-raised + border-bottom border-default + text-body-sm bold text-warn): AlertTriangle 14px + "주의관찰 항목" — 옛 ⚠️ 이모지 제거, fontSize:10.5 → 13px 격상
        - 3-col grid (50px / 1fr / auto, bg-surface-sunken):
          - row 1: "12-3" (mono text-caption text-tertiary bold) / "도어인터록 접점 (마모)" (text-body-sm text-primary, itemDetail text-tertiary marginLeft 4) / "긴급수리" (text-body-sm bold text-danger)
          - row 2: "15-1" / "비상정지스위치 점검" / "주의관찰" (text-warn)
  - 카드 C 미점검 접힘:
    - 헤더: 2호기 / "B1-사무동B1층" / "점검 데이터 없음" / 미점검 배지 (text-tertiary + bg-surface-sunken) / chevron 없음 (data 가 없을 시 chevron 렌더 안 함)
- 그룹 2 헤더 ("escalator 6대") 1줄 시각 — 다음 그룹 시작 시그널만

**VP2 모바일라이트 — 점검 빈 상태 + 검사 기록 탭 본문 (data 있음)**
- 영역 1 (상단 ~30%): 점검 기록 탭 — 월 피커 (◀ 2026년 4월 ▶) + 빈 상태 (EmptyState — ClipboardList 24px text-tertiary + text-body-sm "해당 월 점검 기록이 없어요")
- 영역 2 (나머지): 검사 기록 탭 시작:
  - 자체 헤더 (탭 '검사 기록' 활성)
  - 연도 피커 (◀ 2026년 ▶) — 점검 탭 월 피커와 동일 32×32 button 패턴
  - 호기 카드 2변형:
    - 카드 D 합격 접힘:
      - 헤더: TYPE_ICON 박스 + "1호기" / "· 일반승객용" (classification, text-caption text-tertiary marginLeft 4) / "3건 · 최근 2026-04-15" (text-caption text-tertiary marginTop 2) / 합격 배지 (text-safe + bg-safe-bg) / ChevronRight
    - 카드 E 보완후합격 펼침:
      - 헤더: 3호기 / "· 장애인용" / "2건 · 최근 2026-03-10" / 보완후합격 배지 (text-warn + bg-warn-bg) / ChevronRight rotate 90deg
      - 펼침 영역 (border-top + padding 10 12 + flex column gap 8):
        - 이력 카드 1개 (bg-surface-sunken + border border-default + radius 10 + padding 10 12):
          - 1줄: "2026-03-10" (text-body-sm bold text-primary) + "· 정기검사" (text-caption text-tertiary inspectKind) + marginLeft auto + "보완후합격" 배지 (text-warn + bg-warn-bg + radius 12 + padding 2 8)
          - 2줄: "유효기간 2026-03-10 ~ 2028-03-09" (text-body-sm text-secondary)
          - 3줄: "한국승강기안전공단 · 티케엘리베이터코리아" (text-caption text-tertiary marginTop 2)
          - 부적합 영역 (border-top border-default + marginTop 8 + paddingTop 8):
            - 헤더: AlertTriangle 12px + "부적합 2건" (text-body-sm bold text-warn) — 옛 fontSize:11 → 13px 격상
            - flex column gap 8:
              - fail 1: "▸ 안전 6.5 도어 작동 안전장치" (text-body-sm bold text-primary) / "도어 닫힘 속도 미세 조정 필요" (text-body-sm text-secondary paddingLeft 12) / "(검사자: 박성훈)" (text-caption text-tertiary span 보조)
              - fail 2: "▸ 안전 9.2 비상통화장치" / "통화 응답 지연"

**VP3 데스크톱다크 — 검사 기록 탭 풀 화면**
- 좌측 영역: 호기 그리드 placeholder (3A 와 동일 패턴 — Wave 1 결과 5그룹 호기 배치도 dim 표시, sketch 본 영역은 우측)
- 우측 영역: 검사 기록 본문 — 연도 피커 (◀ 2026년 ▶) + 호기 카드 2개:
  - 카드 1 펼침: 5호기 에스컬레이터 (MoveDiagonal lucide TYPE_ICON) / "(공단 9호기)" (public_number) / "· 일반승객용" (classification) / "1건 · 최근 2026-02-20" / 보완 배지 (text-danger + bg-danger-bg) / chevron rotate 90deg
    - 펼침: 이력 카드 1개 — "2026-02-20" / "· 정밀안전검사" / 보완 배지 / 유효기간 / "한국승강기안전공단 · 한국승강기안전기술원" / 부적합 3건 — standardArticle/standardTitle + failDesc + failDescInspector 시각화 풀 grid (text-body-sm 13px 보존, lineHeight 1.5)
  - 카드 2 접힘: 11호기 (Package lucide cargo) / "(공단 14호기)" / "2건 · 최근 2025-12-10" / 합격 배지 / chevron
- 카탈로그 row (좌측 호기 그리드 아래 dim 영역에 dispWords 5종 카탈로그 — 합격(safe) / 보완후합격(warn) / 조건부합격(warn) / 보완(danger) / 불합격(danger))

**VP4 데스크톱라이트 — KoelsaHistorySection 5 상태 시각화 (EvDetailModal 우측 패널 임베드)**
- 영역 1 — 정상 렌더 (boxStyle border 12 radius pad 16):
  - 헤더 (flex baseline gap 12): "공단 공식 검사이력" (text-heading 16px bold text-primary) + "· 총 5건" (text-body text-secondary) + marginLeft auto + "3시간 전 동기화" (text-caption text-tertiary, formatDistanceToNow ko)
  - 카드 list 2개 (flex column gap 8 marginTop 12):
    - 카드 1 접힘: "2026-04-15" (text-body bold) / "· 정기검사" / 합격 배지 (text-safe) / chevron
    - 카드 2 펼침: "2025-10-20" / "· 정기검사" / 보완후합격 배지 (text-warn) / chevron rotate 90deg / 펼침 — 유효기간 + 기관 + 부적합 1건 (▸ 안전 8.3 비상조명 / "조도 부족 — 60lx 미만")
- 영역 2 — cert_no 없음: boxStyle + center "공단 고유번호 없음 — 관리자 등록 필요" (text-body-sm text-tertiary padding 8 0)
- 영역 3 — 로딩 스켈레톤: boxStyle + flex column gap 8 — 18px height bg-surface-sunken width 60% / 14px height width 40% / 48px height (radius 6/6/8)
- 영역 4 — 에러: boxStyle + center "공단 API 일시 오류 — 잠시 후 다시 시도해주세요" (text-body-sm text-tertiary)
- 영역 5 — 빈 historyCount=0: boxStyle + center "공단에 등록된 검사이력이 없습니다" (text-body-sm text-tertiary)
- (5 박스를 가로 grid 또는 세로 stack 으로 배치 — viewport 가로 1280 안에 모두 표시. 라벨 박스로 "정상 / cert_no 없음 / 로딩 / 에러 / 빈" 명시)

### 디자인 룰 (verify gate 강제)

- 폰트: 9·10·11px 0건. 최소 12px (text-caption). 13px = body-sm. 14px = body. 16px = heading.
- 색: 점검/검사 배지 = 합격·양호 safe / 주의·보완후·조건부 warn / 긴급·보완·불합격 danger / 미점검·기타 text-tertiary
- 아이콘: lucide 사용 — TYPE_ICON_COMPONENT 4종 (3A 와 동일 — ElevatorIcon SVG / Package / UtensilsCrossed / MoveDiagonal) + ClipboardList(점검 빈) / Search(검사 빈) / AlertTriangle(주의관찰+부적합 헤더) / ChevronRight(펼침) / ChevronLeft·ChevronRight or ‹/› (피커 ◀/▶ — lucide 우선)
- 본문 호기 라벨: "N호기" 만. EV-NN / ES-NN 본문 노출 금지.
- 인라인 style 속성 0건. 모두 CSS class.
- 다크/라이트 둘 다 동일 컨텐츠. tokens.css [data-theme] 분기 사용. [data-theme="dark"]/[data-theme="light"] selector ≥4 (3A 처럼 추가 보강 selector 가능 — 카드 hover / 배지 가독성).
- viewport 라벨: 화면 좌상단 모바일/데스크톱 + 다크/라이트 명시 (📱/🖥️ 이모지는 viewport 라벨 한정 허용 — 본문 0건 규칙은 그대로)

### 인프라 재사용 (fault-repair-lists-sketch.html — 3A 에서 그대로)

- <style> 안의 tokens.css 다크/라이트 변수 정의 (v0.1.1)
- viewport-frame class (모바일 393×852 / 데스크톱 1280×720)
- meta-label class (viewport 라벨 + 설명)
- typography 7단계 (text-caption / text-body-sm / text-body / text-heading 등)
- 자체 헤더 패턴 (미해결 칩 + 6탭) — 3A VP1/VP2 그대로
- KIND_STYLE 카탈로그 row 패턴 (dispWords 5종 카탈로그 row 로 응용)
- empty-state class (EmptyState 시각화 — icon component prop 으로 lucide 받음)
- lucide icon stroke svg (TYPE_ICON 4종 / CheckCircle2 / AlertTriangle / Wrench / Camera / Loader2 / ChevronRight) + 새 매핑 추가: ClipboardList(📋 대체) / Search(🔍 대체)
- 카드 좌측 색바 ::before pseudo 패턴 (3A fault-card 와 동일 옵션 — 점검·검사 배지 색과 일관)

### 보존 항목 (절대 건드리지 말 것)

- ElevatorPage.tsx / KoelsaHistorySection.tsx 본체 코드 (단 한 줄도 수정 X)
- icons.tsx / tailwind.config.js / 다른 sketch HTML (3A 포함 변경 0건)
- 다른 페이지 / 컴포넌트

### 작업 순서 (안전)

1. fault-repair-lists-sketch.html 의 <head>+<style>+<body> 인프라 + 자체 헤더 + viewport-frame 복사 → inspect-cert-history-sketch.html 새 파일
2. <style> 에 lucide 신규 icon stroke 2종 추가: ClipboardList, Search (svg path 그대로 임베드)
3. VP1 영역 작성 (점검 카드 3변형 + 월 피커 + 그룹 헤더)
4. VP2 영역 작성 (점검 빈 + 검사 시작 — 호기 카드 2변형 + 부적합 grid)
5. VP3 영역 작성 (검사 풀화면 + dispWords 5종 카탈로그)
6. VP4 영역 작성 (KoelsaHistorySection 5 상태)
7. verify gate 8개 모두 PASS 확인
8. commit
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
  echo "=== Section A: 라인 수 ===" && \
  wc -l cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html && \
  test $(wc -l < cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -ge 1200 && \
  test $(wc -l < cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -le 3500 && \
  echo "" && \
  echo "=== Section B: 9·10·11px 폰트 0건 ===" && \
  test $(grep -cE 'font-size:\s*(9|10|11)px|fontSize:(9|10|11)\b' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section C: 인라인 style 속성 0건 ===" && \
  test $(grep -c 'style="' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section D: 호기 ID 본문 노출 0건 ===" && \
  test $(grep -cE 'EV-[0-9]+|ES-[0-9]+' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section E: viewport [data-theme] >=4 ===" && \
  test $(grep -c '\[data-theme=' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -ge 4 && \
  echo "" && \
  echo "=== Section F: 옛 토큰 인라인 0건 ===" && \
  test $(grep -cE 'var\(--(bg2|bd|bd2|t1|t2|t3|bg3)\)' cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section G: 코드 변경 0건 ===" && \
  test $(git diff --name-only HEAD | grep -v 'docs/redesign-context' | grep -v '.planning/' | wc -l) -eq 0 && \
  echo "" && \
  echo "=== ALL VERIFY GATES PASS ==="
    </automated>
  </verify>
  <done>
- inspect-cert-history-sketch.html 작성 완료 (1200~3500 라인)
- verify gate Section A~G 모두 PASS
- 코드 0건 변경 (단일 sketch HTML 만)
- ElevatorPage.tsx / KoelsaHistorySection.tsx / icons.tsx / tailwind.config.js / 다른 컴포넌트 / 3A 포함 다른 sketch HTML 0건 수정
  </done>
</task>

<task type="auto">
  <name>Task 2: SUMMARY 작성 + commit</name>
  <files>.planning/quick/260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah/260515-qpm-SUMMARY.md</files>
  <action>
SUMMARY 작성 후 single commit.

### SUMMARY 필수 섹션
- **What changed**: 단일 HTML sketch (inspect-cert-history-sketch.html) 작성. 4 viewport × 점검 탭 + 검사 탭 + KoelsaHistorySection 5 상태 본문 시각화. 호기 카드 변형 + 월/연도 피커 + 부적합 grid + 주의관찰 grid + dispWords 5종 카탈로그 + KoelsaHistorySection 5 분기.
- **Why**: 5탭 본문 중 KOELSA 공단 API 데이터 흐름 형제 2 탭(점검+검사) + KoelsaHistorySection 컴포넌트 sketch 권위 확보. 다음 wave TSX 변환 1:1 매핑 source. 옵션 B 의 2/3 묶음 (3A 완료, 3B 본 task, 3C 남음).
- **Design decisions**: 색 매핑 (양호·합격=safe / 주의·보완후·조건부=warn / 긴급·보완·불합격=danger / 미점검·기타=t3) 현 코드 dispColor 100% 보존. 9·10·11px → 12px+ 격상. 이모지 → lucide (ClipboardList/Search/AlertTriangle/ChevronRight). 호기 라벨 'N호기' 만. KoelsaHistorySection 5 상태 박스 boxStyle 통일.
- **Preserved**: 모든 코드 0건 변경. 3A 포함 다른 sketch HTML 0건 변경.
- **Verification**: verify gate Section A~G 모두 PASS, npm build 무관 (HTML sketch).
- **Out of scope**: 안전관리자 탭 (3C). TSX 변환 (별도 wave — Wave 10 예정). 점검 사진 (KOELSA 데이터에 photo 없음).
- **Next**: 사용자 검수 → 변환 wave 또는 3C sketch 로 진행.

### Commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html
git commit -m "feat(260515-qpm): 옵션 B 3B sketch — 점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection v0.1.1 시안 HTML"
git push origin redesign/07-elevator
```

배포 X. redesign/07-elevator 브랜치 push 만. SUMMARY + PLAN 은 orchestrator 가 별도 docs commit 처리.
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
  ls .planning/quick/260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah/260515-qpm-SUMMARY.md && \
  git log --oneline -1 | grep -q '260515-qpm'
    </automated>
  </verify>
  <done>
- SUMMARY.md 작성 완료
- single commit (sketch HTML 만)
- redesign/07-elevator push (main 머지 X)
  </done>
</task>

</tasks>

<success_criteria>
- [ ] inspect-cert-history-sketch.html 1200~3500 라인
- [ ] [data-theme] 컨테이너 ≥4
- [ ] 본문 이모지 0건 (viewport 라벨 한정 허용)
- [ ] 9·10·11px 0건
- [ ] 인라인 style 속성 0건
- [ ] EV-NN/ES-NN 본문 0건
- [ ] var(--bg2/bd/bd2/t1/t2/t3/bg3) 인라인 0건
- [ ] 코드 0건 변경
- [ ] SUMMARY + single commit + push
</success_criteria>

<output>
After completion, ensure `.planning/quick/260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah/260515-qpm-SUMMARY.md` exists.
</output>
</content>
</invoke>