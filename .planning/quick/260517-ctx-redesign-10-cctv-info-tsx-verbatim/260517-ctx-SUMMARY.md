---
quick_id: 260517-ctx
title: redesign/10-cctv-info — CctvInfoPage.tsx v0.1.1 토큰 변환 (sketch verbatim)
branch: redesign/10-cctv-info
date: 2026-05-17
depends_on: [260517-upw]
status: 완료 · main 머지 대기 (사용자 명시 컨펌)
---

# 260517-ctx · 10-cctv-info TSX verbatim 변환

## 변경 파일

- `cha-bio-safety/src/pages/CctvInfoPage.tsx` (69 → 86 lines)

## sketch verbatim 매핑 (시각만 변경, 비즈니스 로직 0)

| 영역 | 변경 |
|---|---|
| 페이지 wrapper | `--bg` → `--surface-page` |
| 카드 wrapper | `--bg2/bd` → `--surface-raised`/`--border-default`, radius 10→md (12), padding 10/12→12 |
| 카드 라벨 | fontSize 14→13, `--t1` → `--text-primary` |
| 채널 텍스트 | fontSize 10→12, `--t3` → `--text-tertiary`, `lineHeight: 1` 추가 |
| 보존 배지 | fontSize 11→12, padding 2/7→2/8, radius 5→pill, raw rgba/hex → status-safe/info 토큰, dot 6px span 추가 |
| 녹화구역 row | fontSize 11→12, `--t2/t3` → `--text-secondary/tertiary` |
| 포트 표 wrapper | `--bg/bd` → `--surface-page/border-default`, radius 7→sm (8), padding 7/10→8/10, wrapper fontSize 제거 (셀 명시) |
| 포트 표 헤더 | `--t3` → `--text-tertiary`, fontSize 12 명시 |
| 포트 표 본문 | (#/cap) `--t1` → `--text-primary` / (replaced isReplaced) `#1d4ed8` → `--status-info` / (else) `--t2` → `--text-tertiary` (sketch 가 source: keep = tertiary) |
| 카드 푸터 | fontSize 10→12, `--t3` → `--text-tertiary`, `lineHeight: 1` |
| 페이지 출처 | fontSize 10→12, `--t3` → `--text-tertiary`, padding 14/0/8 → 12/0/0, `lineHeight: 1` |

## 5 grep gate 결과 (모두 PASS)

```
G1 옛 alias (--bg/bd/t1~t3/safe/warn/danger)    : 0 (=0) PASS
G2 raw hex (#xxxxxx)                            : 0 (=0) PASS
G3 raw rgba(...)                                : 0 (=0) PASS
G4 fontSize 10/11                               : 0 (=0) PASS
G5 v0.1.1 토큰 등장                              : 모두 ≥1 PASS
   status-safe(1) / status-info(2) / status-safe-bg(1) / status-info-bg(1)
   surface-raised(1) / surface-page(2) / text-primary(3) / text-tertiary(8)
   border-default(2) / radius-* (3)
```

## TypeScript check

```
npx tsc --noEmit  → PASS (exit 0)
```

## 비즈니스 로직 보존 (0 변경)

- `useIsDesktop()` 호출 + 모바일/데스크톱 grid/padding 분기
- `CCTV_DVRS.map(dvr => ...)` 13개 카드
- `dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)` 합계
- `dvr.retention.includes('추정')` 추정 분기 (isEstimate)
- `p.replaced !== '기존'` 교체일자 분기 (isReplaced)
- `CCTV_INFO_UPDATED` 페이지 출처 날짜

## 변환 후 inline-style 일관성

- 모든 색은 `var(--...)` 토큰 (raw 색 0)
- 모든 radius 는 `var(--radius-*)` 토큰
- 작은 컨테이너 (배지 / 채널수 / 푸터 / 페이지 출처) 는 `lineHeight: 1`
- sketch html 의 inline style 패턴과 1:1 매핑

## 다음 단계

1. **사용자 시각 컨펌** — 브라우저 또는 dev server (`npm run dev`) 로 `/cctv-info` 화면 확인
2. 컨펌 OK 시 → `redesign/10-cctv-info` 를 `main` 으로 머지 + `wrangler pages deploy ... --branch production` 배포 (메모리 `feedback_deploy_branch` / `feedback_deploy_test`)
3. main 머지 후 → 다음 redesign 페이지 진입

## 파일 변경 요약

```
M  cha-bio-safety/src/pages/CctvInfoPage.tsx (69 → 86 lines)
A  .planning/quick/260517-ctx-redesign-10-cctv-info-tsx-verbatim/260517-ctx-PLAN.md
A  .planning/quick/260517-ctx-redesign-10-cctv-info-tsx-verbatim/260517-ctx-SUMMARY.md
```
