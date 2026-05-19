---
phase: 260519-lof-quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html
autonomous: true
requirements:
  - QUICK-13S-W5-EDITM
tags:
  - redesign
  - 13-schedule
  - sketch
  - wave-5
  - edit-modal
must_haves:
  truths:
    - "EditModal 단일 모달 시안 1장이 sketch-wave-5.html 파일로 존재한다"
    - "default / empty-title-error / saving / 카테고리 5종 mini-strip / 데스크톱 480 / 라이트 미러 frame 매트릭스가 한 페이지에 노출된다"
    - "SchedulePage.tsx line 966~1042 verbatim 의 4 필드(제목 / 날짜 / 시간(선택) / 내용(선택)) + 저장 단일 버튼 구조가 그대로 매핑된다"
    - "저장 버튼 색이 `var(--accent)` solid (W4 OQ #2 LOCKED b) 이며 source 의 `linear-gradient(135deg,#1d4ed8,#2563eb)` 는 0회 등장한다"
    - "BottomSheet maxHeight `90dvh` source verbatim (W4 OQ #1 LOCKED a) 이 모바일 frame 에 적용된다"
    - "헤더 타이틀 'text-title' 18px font-bold 격상 (source 15 → 18 노안 룰), 저장 버튼 라벨 16px (source 14 → 16) 격상"
    - "이모지 0개, 9·10·11px font-size 0개, status- prefix className 0개, '오늘' 본문 0회"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html"
      provides: "EditModal 시안 (frame matrix: default / empty-title / saving / 카테고리 strip / mobile+desktop / 라이트 mirror)"
      min_lines: 400
  key_links:
    - from: "sketch-wave-5.html"
      to: "SchedulePage.tsx line 966~1042"
      via: "EditModal verbatim 4-field 구조 + onClick/onChange handler 라벨 매핑"
      pattern: "일정 수정|수정 저장|저장 중\\.\\.\\.|제목을 입력하세요"
    - from: "sketch-wave-5.html"
      to: "tokens.css + typography.css + sketch-wave-4.html chrome"
      via: "임베드 `<style>` 블록 + chrome (overlay rgba(0,0,0,0.55) z-300 / BottomSheet 90dvh / center 480) AddModal 1:1 mirror"
      pattern: "tokens.css|typography.css|var\\(--accent\\)|90dvh"
---

<objective>
SchedulePage EditModal (line 966~1042) 의 정적 HTML 시안 1장 (`sketch-wave-5.html`) 을 작성한다.
W1+W2+W3+W4 LOCKED 결정과 inspection-modal-chrome-rules.md 를 100% 상속하며, AddModal (sketch-wave-4.html) chrome 을 mirror 한다.
EditModal 은 AddModal 대비 단순 (카테고리 picker / 멀티데이 토글 / 자동 매핑 없음 → 4 필드 + 저장 1버튼). 노안 룰(헤더 18 / 버튼 16) 격상과 저장 버튼 `var(--accent)` solid 적용을 강제한다.

Purpose: TSX 변환 wave 전 사용자 컨펌용 시안. 비즈 로직 변경 0, 디자인만.
Output: `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html` (~600-900 lines 예상).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/13-schedule/13-schedule.md
@cha-bio-safety/docs/redesign-context/13-schedule/design-system.md
@cha-bio-safety/docs/redesign-context/13-schedule/tokens.css
@cha-bio-safety/docs/redesign-context/13-schedule/typography.css
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-4.html
@cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx

<interfaces>
<!-- SchedulePage.tsx line 81~87 — 카테고리 5 hex set (모든 wave 일관) -->
<!-- SchedulePage.tsx line 966~1042 — EditModal verbatim 4 필드 + 저장 1버튼 -->

From SchedulePage.tsx line 81~87:
```typescript
const SCHED_CATEGORIES: { value: ScheduleCategory; label: string; color: string }[] = [
  { value:'inspect',  label:'점검',  color:'#3b82f6' },  // 파랑
  { value:'task',     label:'업무',  color:'#eab308' },  // 노랑
  { value:'event',    label:'행사',  color:'#e2e8f0' },  // 화이트/라이트는 #94a3b8 hardcode (W1 LOCKED)
  { value:'elevator', label:'승강기', color:'#f97316' },  // 주황
  { value:'fire',     label:'소방',  color:'#ef4444' },  // 빨강
]
```

From SchedulePage.tsx line 966~1042 (EditModal — verbatim mapping target):
```typescript
function EditModal({ item, onClose, onSaved, isDesktop }: {
  item: ScheduleItem; onClose: () => void; onSaved: () => void; isDesktop?: boolean
}) {
  const [title,  setTitle]  = useState(item.title)
  const [date,   setDate]   = useState(item.date)
  const [time,   setTime]   = useState(item.time ?? '')
  const [memo,   setMemo]   = useState(item.memo ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) { toast.error('제목을 입력하세요'); return }
    setSaving(true)
    try {
      await scheduleApi.update(item.id, { title: title.trim(), date, time: time || undefined, memo: memo || undefined })
      onSaved()
    } catch {
      toast.error('수정 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, ...
      <div ... style={{ background:'var(--bg2)', borderRadius: isDesktop ? 16 : '20px 20px 0 0',
        padding: isDesktop ? '24px 28px 28px' : '20px 16px 40px',
        maxHeight:'90dvh', overflowY:'auto',
        ...(isDesktop ? { width: 480, maxWidth: '90vw' } : {}), }}>
        // 헤더: '일정 수정' (15px → 18px 격상) + close X (28×28 → 32×32 lucide)
        // 본문 4 필드:
        //   1. 제목 input (required, height 44)
        //   2. 날짜 input type="date" + 시간 input type="time" (선택) — flex gap:10
        //   3. 내용 textarea rows={4} (선택)
        //   4. 저장 버튼: '수정 저장' / saving='저장 중...'
        //      bg: var(--accent) solid (source linear-gradient #1d4ed8→#2563eb 폐기 — W4 LOCKED b)
        //      fontSize: 14 → 16 격상 (노안 룰)
      </div>
    </div>
  )
}
```

W1~W4 LOCKED 결정 inherit:
- 카테고리 5 hex set: `#3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444` (다크) + 라이트 event `#94a3b8` hardcode
- BottomSheet maxHeight `90dvh` (W4 OQ #1 LOCKED a)
- 저장 버튼 `var(--accent)` solid (W4 OQ #2 LOCKED b — source linear-gradient 폐기)
- 모바일 BottomSheet `20px 20px 0 0` / 데스크톱 center 480 width
- overlay `rgba(0,0,0,0.55)` z-300
- 본문 "오늘" 단어 0회 (chrome 룰)
- status- prefix className 0회
- 이모지 0개 (lucide stroke SVG inline)
- 9·10·11px font-size 0개
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write sketch-wave-5.html — EditModal 시안 매트릭스 (default + empty-title + saving + 카테고리 strip + 라이트 mirror + 데스크톱)</name>
  <files>cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html</files>

  <action>
SchedulePage.tsx line 966~1042 (EditModal) 의 정적 HTML 시안을 작성한다. sketch-wave-4.html (AddModal) chrome 을 100% mirror.

**파일 구조 (단일 self-contained HTML):**

1. **`<head>` 임베드** (sketch-wave-4.html line 1~50 verbatim 카피)
   - `<style>` 블록 안에 tokens.css 전체 임베드 + typography.css 전체 임베드
   - `data-theme="dark"` body 기본 / 라이트 frame 은 `data-theme="light"` wrapper div 로 분기
   - meta viewport / font-family Noto Sans KR

2. **페이지 헤더 (h1)** — "Sketch Wave 5 — EditModal 수정 모달"
   - 부제: "SchedulePage.tsx line 966~1042 verbatim + W1~W4 LOCKED 상속 + AddModal chrome mirror"

3. **Frame 매트릭스 (총 6 frame, 4개 다크 + 2개 라이트 미러):**

   ### Frame A: 모바일 default (다크) — `data-theme="dark"`
   - 가상 모바일 viewport (width 390, height 844 컨테이너 외곽선)
   - 배경: 흐릿한 캘린더 페이지 placeholder (sketch-wave-1 카드 1개 가짜 노출) + overlay rgba(0,0,0,0.55)
   - EditModal BottomSheet:
     - bg `var(--bg2)`, borderRadius `20px 20px 0 0`, padding `20px 16px 40px`, maxHeight `90dvh`
     - 헤더 row (display:flex, justify-content:space-between, mb 18):
       - 타이틀 "일정 수정" — text-title 18px font-bold (source 15 → 18 노안 격상)
       - close X 버튼 32×32 (source 28 → 32 노안), border 1px solid var(--bd), bg var(--bg3), radius 8
         - 안에 lucide X stroke svg width=18 height=18 stroke-width=2 stroke=var(--t2)
     - 카테고리 lock indicator (OQ #1 답변 b 채택 → 본문 메타 row "카테고리: 점검" 텍스트):
       - flex row gap 8, padding 12px, bg var(--bg3), radius 8, mb 4
       - 좌측 dot (10×10, bg #3b82f6 카테고리 색 — default frame은 점검)
       - 라벨 "점검" + 부가 텍스트 "(카테고리는 수정 후에도 변경할 수 없습니다)" text-caption var(--t3)
       - 비고: source 에는 카테고리 변경 UI 없음 — 명확성 위해 lock 표시만 추가, 비즈 로직 변경 0
     - 본문 4 필드 (display:flex, flex-direction:column, gap 16):
       1. **제목 필드** (label "제목" text-label 13 var(--t2) + mb 6):
          - input value="유도등 점검" — width 100%, height 44, padding 0 14, radius 8
          - bg var(--bg3), border 1px solid var(--bd), color var(--t1), font-size 16 (text-body)
       2. **날짜+시간 row** (display:flex, gap 10):
          - 날짜 (flex 1): label "날짜" + input type="date" value="2026-05-19" height 44 (모바일 노안)
          - 시간 (flex 1): label "시간 <span>(선택)</span>" + input type="time" value="14:00" height 44
       3. **내용 필드** (label "내용 (선택)" + textarea):
          - textarea rows=4 value="유도등 분기점검\n - 점등 상태 확인\n - 충전 상태 확인" line-height 1.6
          - 같은 inp 스타일 (radius 8 + var(--bg3))
       4. **저장 버튼** (단일):
          - text "수정 저장", padding 14, radius 12, border none
          - **bg `var(--accent)` solid (W4 OQ #2 LOCKED b — source `linear-gradient(135deg,#1d4ed8,#2563eb)` 폐기)**
          - color #fff, font-size 16 font-weight 700 (source 14 → 16 노안 격상)

   ### Frame B: 모바일 empty title error 시연 (다크)
   - Frame A 와 동일 구조, 차이점만:
     - 제목 input value="" (placeholder "제목을 입력하세요")
     - **OQ #2 답변 b 채택 → inline 에러 메시지** (input border var(--danger) + 아래 작은 빨간 라벨):
       - input border-color: var(--danger), border-width 1px
       - input 아래 mt 6, text-caption 12px (단 leading-none 적용 — 작은 컨테이너 룰), color var(--danger)
       - 텍스트: "제목을 입력하세요" (source toast.error 메시지 verbatim)
     - 저장 버튼 normal 상태 (saving false)
   - 비고: 토스트 단일 시연은 fixed 칩보다 inline 에러가 사용자에게 즉시 가까운 위치 + chrome 일관 (modal 안 영역에서 처리)

   ### Frame C: 모바일 saving (다크)
   - Frame A 와 동일 데이터, 차이점만:
     - 저장 버튼 text "저장 중..." opacity 0.6 + disabled cursor not-allowed
     - 다른 입력들 readonly 시각 hint 없음 (source 도 readonly 처리 없음 — 비즈 로직 그대로)

   ### Frame D: 카테고리 5종 mini-strip (다크)
   - 가로 5열 grid (gap 12, 데스크톱 frame 안 카드 형태)
   - 각 카드 (width ~ 180, padding 16, bg var(--bg2), radius 12, border 1px solid var(--bd)):
     - 상단 카테고리 lock row (dot + 라벨):
       1. dot #3b82f6 + "점검"
       2. dot #eab308 + "업무"
       3. dot #e2e8f0 + "행사" (다크에서만 #e2e8f0)
       4. dot #f97316 + "승강기"
       5. dot #ef4444 + "소방"
     - 카드 본문: "일정 수정 — {카테고리}" 미니 헤더 + 더미 input row 1개 (제목 placeholder)
     - 비고: 5 hex 모두 등장하도록 (verify gate #5)

   ### Frame E: 데스크톱 480 center (다크)
   - 가상 데스크톱 viewport (width 1280, height 800 컨테이너 외곽선)
   - overlay rgba(0,0,0,0.55) z-300 + 중앙 modal:
     - width 480, radius 16 (source isDesktop true)
     - padding 24 28 28
     - 그 외 내용은 Frame A 와 동일 (default 데이터 채움)

   ### Frame F: 라이트 mirror (단일 컨테이너에 default + 카테고리 5 strip 2종 노출)
   - wrapper `data-theme="light"` (tokens.css 라이트 분기 자동 동작)
   - 좌측: 모바일 default frame 축소 (Frame A 라이트 미러)
   - 우측: 카테고리 5 strip (Frame D 라이트 미러)
     - **행사 dot 라이트는 `#94a3b8` hardcode** (chrome consistency — 라이트 #e2e8f0 가 흰 배경에서 안 보임)
     - 다른 4 hex 는 동일

4. **푸터 메모 영역** — "W1+W2+W3+W4 LOCKED 결정 일관 mirror" 작은 caption 박스 (text-caption 12px, var(--t3))
   - 항목 리스트:
     - 카테고리 5 hex set 다크 + 라이트 #94a3b8 event
     - BottomSheet maxHeight 90dvh
     - 저장 버튼 `var(--accent)` solid
     - 헤더 18 / 버튼 16 노안 격상
     - empty title 시연 = inline 에러 (OQ #2 b)
     - 카테고리 lock = 본문 메타 row 텍스트 (OQ #1 b)

**스타일/마크업 룰 (강제):**

- 이모지 0개 (lucide stroke SVG inline 만 허용 — close X, calendar, clock, optional file-text)
- font-size 9·10·11px 0개 (text-caption 12px 가 최저)
- status- prefix className 0개 (status-fire / status-safe 등 X — chrome 룰 + EditModal 은 상태 표시 없음)
- "오늘" 단어 본문 0회
- "수정 저장" / "저장 중..." / "제목을 입력하세요" / "일정 수정" 라벨 source verbatim
- `linear-gradient(135deg,#1d4ed8,#2563eb)` 0회 (W4 OQ #2 LOCKED b 적용)
- `var(--accent)` 저장 버튼 색 1회 이상 등장
- BottomSheet maxHeight `90dvh` source verbatim
- 카테고리 5 hex 모두 등장 (`#3b82f6` / `#eab308` / `#e2e8f0` / `#f97316` / `#ef4444`)
- 라이트 event `#94a3b8` hardcode 1회 이상
- `data-theme="dark"` + `data-theme="light"` 둘 다 존재
- tokens.css + typography.css 임베드 (헤드 `<style>` 안)
- 인라인 style 최소화 — 가능한 한 `<style>` 블록 클래스 정의로 처리. 동적 분기(라이트 dot color hardcode 등)만 inline 허용.
- 비즈 로직 변경 0 — handler 코드 시안에 없음 (정적 HTML), 그러나 라벨/필드/순서/구조는 source 1:1.

**파일 크기 가이드:** sketch-wave-4 (1739라인) 대비 EditModal 은 단순 → 600~900 라인 예상. 최소 400 라인 (verify gate #1).
  </action>

  <verify>
    <automated>bash -c '
set -e
F="cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html"

# 0. 파일 존재
test -f "$F" || { echo "FAIL: file missing"; exit 1; }

# 1. 라인 수 >= 400
L=$(wc -l < "$F")
test "$L" -ge 400 || { echo "FAIL: file < 400 lines (got $L)"; exit 1; }

# 2. 이모지 0 (대표 이모지 + emoji range)
EMOJI=$(grep -cE "[😀-🙏🚀-🛿✅⚠️🔥📌📅⏰📝🗓️📋✏️]" "$F" 2>/dev/null || true)
test "$EMOJI" -eq 0 || { echo "FAIL: emoji found ($EMOJI hits)"; exit 1; }

# 3. 9·10·11px font-size 0 (코드 안 — 주석 제외 grep)
SMALL=$(grep -v "^\s*//\|^\s*<!--" "$F" | grep -cE "font-size:\s*(9|10|11)px|fontSize:\s*(9|10|11)\b|text-\[(9|10|11)px\]" || true)
test "$SMALL" -eq 0 || { echo "FAIL: 9/10/11px font-size found"; exit 1; }

# 4. status- prefix className 0
STATUS=$(grep -cE "class(Name)?=\"[^\"]*\bstatus-" "$F" || true)
test "$STATUS" -eq 0 || { echo "FAIL: status- prefix className found"; exit 1; }

# 5. 카테고리 5 hex 모두 등장
for hex in "#3b82f6" "#eab308" "#e2e8f0" "#f97316" "#ef4444"; do
  grep -qi "$hex" "$F" || { echo "FAIL: hex $hex missing"; exit 1; }
done

# 6. 라이트 event #94a3b8 hardcode
grep -qi "#94a3b8" "$F" || { echo "FAIL: light event #94a3b8 missing"; exit 1; }

# 7. tokens.css 임베드
grep -q "tokens.css\|--surface-page\|--text-primary\|--status-safe" "$F" || { echo "FAIL: tokens.css markers missing"; exit 1; }

# 8. typography.css 임베드
grep -q "typography.css\|text-title\|text-body\|text-caption\|text-label\|text-heading" "$F" || { echo "FAIL: typography.css markers missing"; exit 1; }

# 9. data-theme 다크/라이트 토글
grep -q "data-theme=\"dark\"" "$F" || { echo "FAIL: data-theme dark missing"; exit 1; }
grep -q "data-theme=\"light\"" "$F" || { echo "FAIL: data-theme light missing"; exit 1; }

# 10. 일정 수정 헤더 verbatim
grep -q "일정 수정" "$F" || { echo "FAIL: 일정 수정 missing"; exit 1; }

# 11. 수정 저장 / 저장 중... verbatim
grep -q "수정 저장" "$F" || { echo "FAIL: 수정 저장 missing"; exit 1; }
grep -q "저장 중\.\.\." "$F" || { echo "FAIL: 저장 중... missing"; exit 1; }

# 12. 제목을 입력하세요 toast verbatim
grep -q "제목을 입력하세요" "$F" || { echo "FAIL: 제목을 입력하세요 missing"; exit 1; }

# 13. var(--accent) 저장 버튼 색 등장 + linear-gradient(135deg,#1d4ed8 0회
grep -q "var(--accent)" "$F" || { echo "FAIL: var(--accent) missing"; exit 1; }
LGRAD=$(grep -c "linear-gradient(135deg,#1d4ed8" "$F" || true)
test "$LGRAD" -eq 0 || { echo "FAIL: source linear-gradient 1d4ed8→2563eb still present ($LGRAD hits) — W4 LOCKED b 위반"; exit 1; }

# 14. 모바일 + 데스크톱 frame 둘 다 노출
grep -qE "390|모바일|mobile" "$F" || { echo "FAIL: mobile frame indicator missing"; exit 1; }
grep -qE "1280|480|데스크톱|desktop" "$F" || { echo "FAIL: desktop frame indicator missing"; exit 1; }

# 15. 90dvh BottomSheet 룰
grep -q "90dvh" "$F" || { echo "FAIL: 90dvh missing (W4 OQ #1 LOCKED a)"; exit 1; }

# 16. 오늘 본문 0회
TODAY=$(grep -c "오늘" "$F" || true)
test "$TODAY" -eq 0 || { echo "FAIL: 오늘 found in body ($TODAY hits)"; exit 1; }

echo "PASS: all 16 gates green ($L lines)"
'</automated>
  </verify>

  <done>
- `sketch-wave-5.html` 파일이 `cha-bio-safety/docs/redesign-context/13-schedule/` 에 존재 (≥ 400 lines)
- 16개 verify grep gate 모두 PASS
- 6 frame (default / empty-title-error / saving / 카테고리 5 strip / 데스크톱 480 / 라이트 mirror) 모두 노출
- W1+W2+W3+W4 LOCKED 결정 일관 mirror (카테고리 5 hex / 90dvh / var(--accent) / 라이트 event #94a3b8)
- 노안 격상 적용 (헤더 18 / 버튼 16) — source 15/14 폐기
- OQ #1 b (메타 row 텍스트) + OQ #2 b (inline 에러) 적용 — Plan 안에 reasonable call 명시
- 비즈 로직 변경 0 (라벨/필드 순서/필수성 source 1:1)
  </done>
</task>

</tasks>

<verification>
**End-of-wave 체크 (executor 자체 검수):**

1. 16개 grep gate 모두 PASS (verify 블록 자동화 처리)
2. 시각 검수 (사용자 컨펌 대기):
   - default frame: AddModal (W4) 와 chrome 구분 어색하지 않은가? (헤더 텍스트 + 4 필드만 차이)
   - empty title inline 에러: 너무 강조 / 너무 약하지 않은가?
   - saving 버튼: opacity 0.6 가 충분히 disabled 표현인가?
   - 카테고리 5 strip: 5 hex 시각 식별 가능한가? (라이트에서 event #94a3b8 대체 효과)
   - 데스크톱 480: BottomSheet 가 아닌 center modal 로 보이는가?
3. W1~W4 LOCKED 결정 위반 0 (chrome / 카테고리 hex / 저장 버튼 색 / 90dvh)
4. 이모지/lh-leak/status-prefix/오늘 단어 0 (negative gate)
</verification>

<success_criteria>
- 시안 1장 파일 생성 + 16 grep gate green
- 사용자가 시각 확인 후 컨펌 → 다음 단계(다른 wave 또는 TSX 변환 wave) 가능
- 본 plan 만으로 TSX 변환 wave 진입 가능한 명세 (frame matrix + LOCKED 결정 mirror)
</success_criteria>

<output>
After completion, create `.planning/quick/260519-lof-redesign-13-schedule-sketch-wave-5-editm/260519-lof-SUMMARY.md`
- 작성된 파일 경로 + 라인 수
- 16 grep gate PASS 증거
- OQ #1 / OQ #2 reasonable call 기록 (b / b 채택)
- 다음 wave 후보 (TSX 변환 wave 또는 DeleteConfirm / Holiday API 등 추가 sketch wave)
</output>
