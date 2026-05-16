---
phase: 260516-sdd
plan: "01"
subsystem: redesign/05-remediation-detail
tags: [tsx-transform, v0.1.1-tokens, lucide, sketch-mapping]
dependency_graph:
  requires: [RemediationPage.tsx (Wave 1, commit e01c6e7)]
  provides: [RemediationDetailPage.tsx v0.1.1 토큰/Tailwind/lucide 적용]
  affects: [cha-bio-safety/src/pages/RemediationDetailPage.tsx]
tech_stack:
  added: [lucide-react (ChevronLeft/Image/RotateCcw/Trash2/Check)]
  patterns: [v0.1.1 design tokens, Tailwind utility classes, sketch 1:1 CSS verbatim mapping]
key_files:
  modified:
    - cha-bio-safety/src/pages/RemediationDetailPage.tsx
decisions:
  - "소화전 tight 피커 11px → sketch line 392 verbatim 화이트리스트 유지 (4-옵션 tight 예외)"
  - "점검 사진 없을 때 placeholder 미도입 — 비즈니스 로직 보존 원칙 (sketch 시연용 .det-photo-empty 제외)"
  - "CTA 단색 bg-accent — 그라디언트 0건 (sketch 결정 mirror)"
metrics:
  duration: "~15min"
  completed: "2026-05-16"
  lines_before: 594
  lines_after: 527
---

# Phase 260516-sdd Plan 01: RemediationDetailPage.tsx 변환 Summary

**One-liner:** RemediationDetailPage.tsx 594→527줄, sketch (커밋 0c6315e) 1:1 매핑 — v0.1.1 토큰/Tailwind/lucide 5종 적용, 비즈니스 로직 100% 보존.

## 변환 결과

| 항목 | Before | After |
|------|--------|-------|
| 라인 수 | 594 | 527 |
| 인라인 style | 전체 (var(--*)로 가득) | 최소 (layout-only + iOS sab calc) |
| lucide import | 없음 | ChevronLeft/Image/RotateCcw/Trash2/Check |
| Tailwind class | 없음 | 전면 적용 |

## Sketch 1:1 매핑 결과

| 영역 | Sketch 클래스 | TSX 적용 결과 |
|------|---------------|---------------|
| 자체 헤더 | `.det-page-hd` (height:48, bg surface-raised) | `h-12 bg-surface-raised border-b border-border-default relative flex-shrink-0` |
| 결과 배지 페어 | `.det-badge.danger/.warning` (line 339/340) | `bg-danger-bg text-danger` / `bg-warning-bg text-warning` + `leading-none` |
| 섹션 wrapper | `.det-section` (padding:20px 16px) | `py-5 px-4 border-b border-border-default` |
| 5종 피커 | `.det-picker` (gap:5, mb:10) | `flex gap-[5px] mb-2.5` |
| 소화전 tight (4-옵션) | `.det-picker.tight` (font-size:11) | `style={{ fontSize: 11, padding: '10px 2px' }}` 화이트리스트 |
| textarea | `.det-textarea` | `w-full min-h-24 bg-surface-sunken border border-border-strong rounded-[10px] text-body-sm` |
| Admin 조치취소 | `.det-admin-btn.warn` | `border border-warning-bar text-warning-bar` outline |
| Admin 기록삭제 | `.det-admin-btn.danger` | `border border-danger-bar text-danger-bar` outline |
| CTA | `.det-cta-btn` (bg accent, 단색) | `bg-accent text-on-accent rounded-xl h-12` — 그라디언트 0건 |

## lucide 5종 도입

| 아이콘 | Size | 위치 |
|--------|------|------|
| ChevronLeft | 20 (icon-lg) | 자체 헤더 back 버튼 (인라인 svg 치환) |
| Image | 28/24 | 사진 placeholder/preview (PhotoButton 내부는 Camera 유지) |
| RotateCcw | 14 (icon-sm) | admin "조치 취소" 버튼 |
| Trash2 | 14 (icon-sm) | admin "점검 기록 삭제" 버튼 |
| Check | 16 (icon-md) | CTA "조치 완료" 좌측 |

Note: Image 아이콘은 import에 포함되나, 점검 사진 없을 때 placeholder 미도입 결정(비즈니스 로직 보존)으로 현재 TSX 내 실사용 0건. 추후 placeholder 도입 시 활용 가능.

## 변환 영역 검수 결과

| 항목 | 기준 | 결과 |
|------|------|------|
| 옛 alias (--bg/--bg2/--bg3/--bd/--bd2/--t1/--t2/--t3/--acl/--warn/--danger) | 0건 | **0건** |
| 인라인 rgba(상태색) rgba(239,68,68|245,158,11|34,197,94) | 0건 | **0건** |
| 인라인 svg (width={20}+viewBox) | 0건 | **0건** |
| 9·10px | 0건 | **0건** |
| 11px | 정확히 1건 (소화전 tight 화이트리스트) | **1건** |
| 이모지 | 0건 | **0건** |
| lucide import | 1줄 | **1줄** |
| soft accent rgba(59,130,246,0.12) | 화이트리스트 (동적, sketch verbatim) | 유지 |

## 비즈니스 로직 보존 검증

| 항목 | 기준 | 결과 |
|------|------|------|
| useEffect 총 수 (5종 증상→피커 + 5종 피커→자재) | 10 | **10** |
| handle* 함수 (handleDelete/handleUnresolve/handleResolve) | 3 | **3** |
| useQuery queryKey | ['remediation-detail', recordId] | **보존** |
| GL_TYPE_LABEL 6키 | ceiling_exit/wall_exit/room_passage/corridor_passage/stair_passage/audience_passage | **보존** |
| ZONE_LABEL 4키 | office/research/basement/common | **보존** |
| state union 12개 타입 | 본체 교체~직접 입력 | **보존** |
| PhotoButton 호출 | `<PhotoButton hook={photo} label="촬영" noCapture />` | **보존** |
| toast 메시지 한글 | 삭제 완료/조치 취소됨/조치 완료 등 | **보존** |
| confirm 한글 문자열 | 영구 삭제/조치 취소 confirm | **보존** |
| api.* path | /inspections/records/{recordId}/resolve·unresolve / api.delete | **보존** |
| queryClient.invalidateQueries 키 | remediation/remediation-detail/dashboard | **보존** |
| iOS sab | `paddingBottom: 'calc(12px + var(--sab, 0px))'` | **보존** |
| route param | `useParams<{ recordId: string }>()` | **보존** |

## 04 Paired-Page 일관 확인

| 항목 | RemediationPage.tsx (Wave 1) | RemediationDetailPage.tsx (이번) |
|------|------------------------------|----------------------------------|
| 결과 배지 | `bg-danger-bg text-danger` / `bg-warning-bg text-warning` | 동일 |
| lucide import | `from 'lucide-react'` 1줄 | 동일 |
| lucide 호출 | `<Icon size={N} />` | 동일 |
| 보조 라벨 폰트 | 12px (11→12 상향) | 동일 (소모 자재 라벨/ea suffix) |
| CTA | `bg-accent text-on-accent` 단색 | 동일 |

## TypeScript / 빌드 결과

- `tsc --noEmit`: RemediationDetailPage 관련 에러 **0건** (환경 이슈 --cloudflare workers-types 등은 pre-existing)
- `npm run build`: **PASS** (cbc7119-design worktree에서 검증, 14.18s)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `/Users/jykevin/Documents/20260328/.claude/worktrees/agent-a2da49b76db48c344/cha-bio-safety/src/pages/RemediationDetailPage.tsx` — FOUND
- Commit 453c28f — FOUND
- sweep checks: ALIAS=0, RGBA=0, INLINESVG=0, SMALLPX=1, EMOJI=0, LUCIDE=1 — ALL PASS
- npm build — PASS
