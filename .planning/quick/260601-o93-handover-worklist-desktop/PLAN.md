---
phase: quick-260601-o93
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/HandoverPage.tsx
  - cha-bio-safety/src/pages/WorkListPage.tsx
autonomous: true
requirements: [DESIGN-HANDOVER-WORKLIST-DESKTOP-RULES]
must_haves:
  truths:
    - "Handover 데스크톱 카드 그리드가 1920px 에서 1200px 중앙 정렬 (sprawl 안 함)"
    - "완료/대기/삭제됨 status 배지가 시맨틱 토큰 색 사용"
    - "대기 배지 색이 카드 좌측 bar(warning) 와 일치 — 더 이상 파랑 accent 아님"
    - "모바일 완료 배지 이모지 체크 제거, lucide Check 아이콘으로 데스크톱과 통일"
    - "현재 배지(accent) / 복원 배지(purple) / pin(amber) 은 그대로 유지 (regression 없음)"
  artifacts:
    - path: "cha-bio-safety/src/pages/HandoverPage.tsx"
      provides: "DesktopHandover 그리드 max-width + status 토큰화 + 이모지 제거"
    - path: "cha-bio-safety/src/pages/WorkListPage.tsx"
      provides: "삭제됨 배지 danger 토큰화 (모바일+데스크톱 row)"
  key_links:
    - from: "DesktopHandover 카드 좌측 bar (bg-warning-bar)"
      to: "대기 배지 색 (var status-warning-bar)"
      via: "동일 warning 토큰 — bar+badge 색 일치"
      pattern: "status-warning-bar"
---

<objective>
HandoverPage(인수인계장)·WorkListPage(업무관련리스트) 데스크톱 분기의 디자인 룰 정렬.
데스크톱 분기 포팅은 이미 완료(cherry-pick 됨). 이 plan 은 그 위에 정확히 3개 룰 수정만 적용.

Purpose: 데스크톱에서 그리드가 1920px 풀폭으로 퍼지는 것 방지(DocumentsPage 선례 정렬), status 배지 하드코딩 색을 시맨틱 토큰으로 정규화, 모바일 이모지 체크마크를 lucide 아이콘으로 통일.

Output: 두 TSX 파일의 시각 토큰 + 레이아웃 컨테이너 변경만. 기능 로직(모바일/데스크톱 동작) 무변경.

NON-GOAL (절대 손대지 말 것):
- WorkList 테이블 포맷 / 풀폭 유지 — 다른 데스크톱 페이지도 테이블 사용, 룰 준수임. 테이블 레이아웃 재디자인 금지.
- 현재 배지(accent blue), 복원 배지(purple), pin(amber) — status 색 아님. 그대로.
- wrangler / deploy 명령 — 디자인 워크트리, 금지.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/quick/260601-o93-handover-worklist-desktop/sketch-handover-worklist-desktop.html

토큰 값 (tokens.css 에서 grep 확인 완료):
- status-safe-bg = rgba(34,197,94,0.16) / status-safe-bar = #22c55e
- status-warning-bg = rgba(245,158,11,0.16) / status-warning-bar = #f59e0b
- status-danger-bg = rgba(239,68,68,0.16) / status-danger-bar = #ef4444

DocumentsPage 데스크톱 선례: .docs-desktop-grid max-width:1200px; margin:0 auto

라인 번호는 현재(포팅 후) 파일 기준 확인 완료. 편집 시 정확한 old_string 으로 매칭하므로 라인이 약간 밀려도 문자열로 찾을 것.
</context>

<tasks>

<task type="auto">
  <name>Task 1: FIX2 + FIX3 — status 배지 토큰화 + 모바일 이모지 제거</name>
  <files>cha-bio-safety/src/pages/HandoverPage.tsx, cha-bio-safety/src/pages/WorkListPage.tsx</files>
  <action>
per-occurrence 로 정확히 아래 8곳만 변경. 블랭킷 sed 절대 금지 — 파랑 rgba(59,130,246,.15) 는 대기 배지(변경 대상)와 현재 배지(유지 대상) 둘 다 쓰므로 의미별로 구분.

각 변경은 그 줄의 `background` 와 `color` 두 값만 토큰으로 교체(FIX3 줄은 추가로 아이콘/flex). 나머지 padding / borderRadius / className 은 그대로.

토큰 매핑:
- 완료(done) 배지: background → var(--status-safe-bg), color → var(--status-safe-bar)
- 대기(waiting) 배지: background → var(--status-warning-bg), color → var(--status-warning-bar)
- 삭제됨(deleted) 배지: background → var(--status-danger-bg), color → var(--status-danger-bar)

변경 대상 8곳:

1) HandoverPage.tsx L207 모바일 완료 배지 — FIX3 포함.
   현재: background rgba(34,197,94,.15), color #16a34a, 텍스트 = 체크이모지 + 공백 + "완료".
   변경: background/color 를 safe 토큰으로. 체크 이모지와 그 뒤 공백을 제거하고 lucide 아이콘 Check size 12 + "완료" 로. span style 에 display:'inline-flex', alignItems:'center', gap:3 추가 (데스크톱 L581 패턴과 동일). Check 는 이미 import 됨.
   결과 형태: text-caption font-bold span, style { padding:'2px 6px', borderRadius:4, background:'var(--status-safe-bg)', color:'var(--status-safe-bar)', display:'inline-flex', alignItems:'center', gap:3 }, 내용 = Check 아이콘(size 12) + 완료.

2) HandoverPage.tsx L208 모바일 대기 배지 — background rgba(59,130,246,.15) → var(--status-warning-bg), color var(--accent) → var(--status-warning-bar). 텍스트 "대기" 유지.

3) HandoverPage.tsx L209 모바일 삭제됨 배지 — background rgba(239,68,68,.15) → var(--status-danger-bg), color var(--status-danger) → var(--status-danger-bar).

4) HandoverPage.tsx L581 데스크톱 완료 배지 (leading-none, 이미 Check size 10 + inline-flex 있음) — background rgba(34,197,94,.15) → var(--status-safe-bg), color #16a34a → var(--status-safe-bar). 나머지(display/gap/아이콘) 그대로.

5) HandoverPage.tsx L582 데스크톱 대기 배지 — background rgba(59,130,246,.15) → var(--status-warning-bg), color var(--accent) → var(--status-warning-bar).

6) HandoverPage.tsx L583 데스크톱 삭제됨 배지 — background rgba(239,68,68,.15) → var(--status-danger-bg), color var(--status-danger) → var(--status-danger-bar).

7) WorkListPage.tsx L217 모바일 삭제됨 배지 — background rgba(239,68,68,.15) → var(--status-danger-bg), color var(--status-danger) → var(--status-danger-bar).

8) WorkListPage.tsx L667 데스크톱 row 삭제됨 배지 (fontSize:10, padding:'1px 4px', borderRadius:3 — 다른 스타일이니 주의) — background rgba(239,68,68,.15) → var(--status-danger-bg), color var(--status-danger) → var(--status-danger-bar). fontSize/padding/radius 그대로.

DO NOT TOUCH (regression 가드 — 색 문자열 1 byte 도 변경 금지):
- 현재 배지: HandoverPage L410, WorkListPage L382 — rgba(59,130,246,.15) + var(--accent). 유지.
- 복원 배지: HandoverPage L412, WorkListPage L384 — #9333ea / rgba(168,85,247,.15). 유지.
- pin amber: HandoverPage L231(카드), L620(모달) — #d97706 / rgba(217,119,6,.15). status 아님, 유지.
- accent 버튼 color #fff on var(--accent), modal overlay rgba(0,0,0,.5), CARD deleted bg, var(--bg2) — 유지.
  </action>
  <verify>
    <automated>bash .planning/quick/260601-o93-handover-worklist-desktop/verify.sh badges</automated>
  </verify>
  <done>verify.sh badges 의 모든 게이트 PASS. 핵심: HandoverPage 체크 이모지 0, 하드코딩 그린 0, var(--accent)>=1(현재 배지 유지), 9333ea(복원) 유지. WorkList status-danger-bg=2. Handover safe/warning/danger 각 토큰 >=2.</done>
</task>

<task type="auto">
  <name>Task 2: FIX1 — Handover 데스크톱 그리드 max-width 중앙 컨테이너</name>
  <files>cha-bio-safety/src/pages/HandoverPage.tsx</files>
  <action>
DesktopHandover 의 카드 그리드(L562 부근)를 1200px 중앙 정렬 컨테이너로 감싸고, min track 290→300, gap-2.5→gap-3(12px). DocumentsPage .docs-desktop-grid (max-width:1200px; margin:0 auto) 선례 + 승인 sketch 일치.

loading/empty 상태(L556~561)는 컨테이너 밖에 그대로 둔다 (감싸지 말 것).

[변경 A] grid 여는 줄 (현재 L562):
   기존 한 줄 = grid gap-2.5 div, gridTemplateColumns repeat(auto-fill, minmax(290px, 1fr)).
   이걸 두 줄로 교체:
   - 바깥 래퍼: style { maxWidth: 1200, margin: '0 auto' } 인 div 여는 태그
   - 안쪽: className "grid gap-3", style gridTemplateColumns repeat(auto-fill, minmax(300px, 1fr)) 인 div 여는 태그

[변경 B] grid 닫는 부분 (현재 L599~601: map 닫힘 `})}` + grid 닫는 div + flex-1 컨테이너 닫는 div).
   grid 닫는 div 와 flex-1 컨테이너 닫는 div 사이에 maxWidth 래퍼 닫는 div 한 줄 추가.
   즉 닫는 div 가 2개 → 3개 (grid / maxWidth래퍼 / flex-1컨테이너 순서).

주의: items.map 내부 카드 JSX(L563~598)는 한 글자도 바꾸지 말 것 — 여는 줄과 닫는 줄만 조정. 닫는 div 개수 정합이 최우선(들여쓰기 어긋남은 빌드 영향 없음).
  </action>
  <verify>
    <automated>bash .planning/quick/260601-o93-handover-worklist-desktop/verify.sh grid</automated>
  </verify>
  <done>verify.sh grid 의 모든 게이트 PASS: maxWidth 1200 컨테이너 >=1, minmax(300px,1fr) >=1, grid gap-3 >=1, 옛 minmax(290px 0.</done>
</task>

</tasks>

<verification>
세 FIX 전부 적용 후 전체 게이트 + 빌드:

  bash .planning/quick/260601-o93-handover-worklist-desktop/verify.sh all

마지막 줄이 "ALL GATES PASS" 이고 build PASS 여야 한다.
build 가 느리거나 noisy 하면 `cd cha-bio-safety && npx tsc --noEmit` 로 대체 — 프로젝트는 strict:false 라서 NEW 에러 없어야 통과로 본다 (기존 경고는 무시).

수동 시각 확인(선택): 1920px 데스크톱에서 인수인계장 카드가 화면 중앙 1200px 폭 안에 모이고, 대기 카드의 좌측 주황 bar 와 "대기" 배지 색이 같은 톤인지.
</verification>

<success_criteria>
- FIX1: Handover 데스크톱 카드 그리드가 maxWidth 1200 + margin auto 로 중앙 정렬, min track 300, gap-3.
- FIX2: 완료/대기/삭제됨 배지 8곳 모두 var(--status-*) 토큰 사용. 대기 배지 = warning(주황)으로 좌측 bar 와 일치.
- FIX3: HandoverPage 체크 이모지 0개, 모바일 완료 배지가 lucide Check 아이콘 사용.
- Regression 없음: 현재(accent)/복원(purple)/pin(amber) 색 그대로.
- 빌드(또는 tsc) 통과, NEW 에러 없음.
- wrangler/deploy 명령 미사용. 변경 파일은 두 TSX 뿐(+verify.sh 보조 스크립트).
</success_criteria>

<output>
완료 후 `.planning/quick/260601-o93-handover-worklist-desktop/SUMMARY.md` 생성.
커밋 분할: FIX2+FIX3 한 커밋, FIX1 한 커밋 (또는 세 FIX 한 커밋도 허용). 디자인 트랙이므로 main 머지는 사용자 컨펌 후.
</output>
