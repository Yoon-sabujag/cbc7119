---
phase: 260514-pnr-wave-1-fix-photobutton-revisitpopup-acce
plan: 01
type: execute
wave: 1-fix
depends_on:
  - 260514-i4r-redesign-02-inspection-tsx   # Wave 1 본체 변환 — 외부 컴포넌트 3종은 누락됨
files_modified:
  - cha-bio-safety/src/components/PhotoButton.tsx
  - cha-bio-safety/src/components/InspectionRevisitPopup.tsx
  - cha-bio-safety/src/components/AccessBlockedPopup.tsx
autonomous: true
requirements:
  - REDESIGN-02-INSPECTION-TSX-WAVE1-FIX
tags:
  - redesign
  - inspection
  - fix
  - lucide-icons
  - design-tokens-v0.1.1
---

<objective>
Wave 1 사용자 시각 검증 (Task 4) 에서 발견된 3 컴포넌트 fix —
이전 quick (260514-i4r) 가 InspectionPage.tsx 단일 파일만 다뤘는데, 외부 컴포넌트 3종이 그대로 옛 이모지/토큰을 쓰고 있었음.

**fix 범위:**
1. `PhotoButton.tsx` — 빈 상태 버튼 📷 → lucide `Camera`, 토큰 v0.1.1 화
2. `InspectionRevisitPopup.tsx` — variant 2종 아이콘 ⚠️ → `CheckCircle2` (completed, status-safe) / `Flame` (pending-action, status-fire), 토큰 v0.1.1 화
3. `AccessBlockedPopup.tsx` — 🚫 → `ShieldAlert` (status-warning), 토큰 v0.1.1 화

**시안 권위 spec (inspection-sketch-main.html line 1898-1976 + inspection-sketch-misc-modals.html line 166-177):**
- PhotoButton 빈 상태: 72×72 컨테이너 + lucide camera 22×22 + "촬영" 라벨
- RevisitPopup completed: lucide check-circle-2 w-8 h-8, color status-safe + accent CTA "확인"
- RevisitPopup pending-action: lucide flame w-8 h-8, color status-fire + accent CTA "이동" + 보조 "취소"
- AccessBlockedPopup: lucide shield-alert w-8 h-8, color status-warning + accent CTA "확인"

**비즈니스 로직 보존 (한 줄도 변경 금지):**
- PhotoButton: input refs / accept / capture / onChange / PhotoSourceModal / photoPreview / removePhoto / uploading 흐름
- InspectionRevisitPopup: variant 분기 / fmtDateTime / onClose / onGoToRemediation / recordId guard / message 문자열
- AccessBlockedPopup: onConfirm / 메시지 문자열

**Out of scope:**
- InspectionPage.tsx 본문 — 이미 Wave 1 에서 변환됨
- FloorPlanPage.tsx — AccessBlockedPopup 을 같이 쓰지만 페이지 자체는 redesign 트랙 미도착. AccessBlockedPopup fix 가 자동으로 그쪽에도 적용되는 건 의도된 통일 (사용자 컨펌됨)
</objective>

<tasks>

<task type="auto">
  <name>Task 1: 3 컴포넌트 일괄 fix — lucide 아이콘 + v0.1.1 토큰 + Tailwind only</name>
  <files>
    cha-bio-safety/src/components/PhotoButton.tsx
    cha-bio-safety/src/components/InspectionRevisitPopup.tsx
    cha-bio-safety/src/components/AccessBlockedPopup.tsx
  </files>
  <behavior>
변환 후 3 파일이 다음을 만족:
- 옛 이모지 (📷 / ⚠️ / 🚫) 0개 — 모두 lucide-react 아이콘으로 교체
- 옛 토큰 (--bg2 / --bd / --bd2 / --acl / --t1 / --t2 / --t3 / --danger) 0개 — v0.1.1 토큰 (--surface-raised / --border-default / --border-strong / --accent / --text-primary / --text-secondary / --text-tertiary / --status-danger) 으로 교체
- 시안 spec 정확 매핑 (아이콘 종류 + size + color)
- 비즈니스 로직 100% 보존 (props 시그니처 / 동작 분기 / hook 호출 / 문자열 모두 그대로)
- 9/10/11px 폰트 사이즈 0개 (12px+ 만)
- TypeScript 컴파일 + npm run build 통과
- /inspection 라우트 라이트/다크 양쪽 렌더 정상
  </behavior>
  <action>
세 파일이 작아서 (24/84/31 줄) 각각 Read 전체 → Write 전체로 교체.

**1.1 PhotoButton.tsx:**
- import 에 `Camera` from 'lucide-react' 추가
- 빈 상태 버튼: `<span style={{ fontSize:22 }}>📷</span>` → `<Camera size={22} />`
- 컨테이너 인라인 style 토큰 교체:
  - background: var(--bg2) → var(--surface-raised)
  - border: 1px dashed var(--bd2) → 1px dashed var(--border-strong)
  - color: var(--t3) → var(--text-tertiary)
- 사진 미리보기:
  - border: 1px solid var(--bd) → 1px solid var(--border-default)
  - 제거 버튼: background: var(--danger) → var(--status-danger)
- 라벨 fontSize 11 → 12 (노안 12px+ 룰)

**1.2 InspectionRevisitPopup.tsx:**
- import 에 `CheckCircle2, Flame` from 'lucide-react' 추가
- 아이콘 영역 (line 52): `<div style={{ fontSize:32 }}>⚠️</div>` → variant 분기:
  ```tsx
  {variant === 'completed' ? (
    <CheckCircle2 size={32} color="var(--status-safe)" />
  ) : (
    <Flame size={32} color="var(--status-fire)" />
  )}
  ```
- 컨테이너 토큰: var(--bg2)/var(--bd) → var(--surface-raised)/var(--border-default)
- 메시지 토큰: var(--t1) → var(--text-primary)
- CTA "확인"/"이동" 토큰: var(--acl) → var(--accent)
- "취소" 보조 버튼 토큰: var(--bg)/var(--bd2)/var(--t2) → var(--surface-page)/var(--border-strong)/var(--text-secondary)
- 폰트 13 → 13 (이미 12+, 그대로). variant/checkedAt/inspectorName/recordId/onClose/onGoToRemediation 시그니처 그대로.

**1.3 AccessBlockedPopup.tsx:**
- import: `import { ShieldAlert } from 'lucide-react'`
- 아이콘: `<div style={{ fontSize:32 }}>🚫</div>` → `<ShieldAlert size={32} color="var(--status-warning)" />`
- 컨테이너/메시지/CTA 토큰: InspectionRevisitPopup 와 동일 패턴
- onConfirm 시그니처 그대로
  </action>
  <verify>
1. grep "📷\|⚠️\|🚫" 3 파일 → 0건
2. grep "var(--bg2\|--bd\|--acl\|--t[123]\b\|--danger\b)" 3 파일 → 0건 (단 --status-danger 는 OK)
3. grep "fontSize:9\|fontSize:10\|fontSize:11" 3 파일 → 0건
4. npx tsc --noEmit (cha-bio-safety) → 0 에러
5. npm run build (cha-bio-safety) → ✓ built
  </verify>
  <done>
- 3 파일 다 lucide 아이콘 + v0.1.1 토큰 사용
- tsc + build 통과
- atomic commit: `feat(260514-pnr): Wave 1 외부 컴포넌트 3종 lucide 아이콘 + v0.1.1 토큰 통일`
  </done>
</task>

</tasks>
