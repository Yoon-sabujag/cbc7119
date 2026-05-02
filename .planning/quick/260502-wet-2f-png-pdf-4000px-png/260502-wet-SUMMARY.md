---
quick_task: 260502-wet-2f-png-pdf-4000px-png
plan: 01
status: complete
date: 2026-05-03
tags:
  - floorplan
  - sprinkler
  - asset-replacement
  - pwa-cache-bust
  - png-conversion
  - pdftocairo
---

# Quick Task 260502-wet — 스프링클러 2F 도면 PNG 교체

## One-liner

DWG→PDF 신규 도면을 4000×2946 RGBA PNG 로 변환해 `cha-bio-safety/public/floorplans/sprinkler/2F.png` 교체. 18번 시도 끝에 1F·3F 와 톤 매칭. 알고리즘 메모리 저장 (`reference_floorplan_png_algorithm.md`).

## Final result

- `cha-bio-safety/public/floorplans/sprinkler/2F.png` — 4000×2946 RGBA, 84% 투명, 1F·3F 톤 매칭, 하단 잘림 없음
- `cha-bio-safety/src/pages/FloorPlanPage.tsx:280` — `?v=4` → `?v=18` 캐시버스팅
- 알고리즘 메모리 저장 — 다음 도면 작업 시 재사용
- 피드백 메모리 저장 — `feedback_avoid_premature_confirmation.md` (시각 작업에서 자신감 표현 자제)

## Final algorithm (v18)

### Step 1 — pdftocairo -transp

```bash
pdftocairo -transp -png -r 350 input.pdf out
```

핵심: `pdftocairo -transp` 가 PDF 흰 배경을 직접 알파=0 (투명) 으로 렌더. 후처리 작업 대폭 간소화. pdftoppm 은 흰 배경 그대로 그려서 부적합.

### Step 2 — Python (PIL + numpy)

```python
img = Image.open(src).convert("RGBA")
img = img.resize((4000, h*4000//w), Image.LANCZOS)
arr = np.array(img); rgb = arr[..., :3].astype(np.int16); alpha = arr[..., 3].copy()
R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
mn = np.minimum.reduce([R, G, B]); mx = np.maximum.reduce([R, G, B])
saturation = mx - mn

# 그레이 라인 처리: RGB 흰색화 + alpha 부스트
gray_mask = (saturation < 30) & (alpha > 10) & (mn < 250)
new_rgb = rgb.copy()
new_rgb[gray_mask] = 255  # RGB → (255,255,255) 흰색
darkness = (255 - mn).astype(np.uint8)
new_alpha = alpha.copy()
new_alpha[gray_mask] = np.maximum(alpha[gray_mask], darkness[gray_mask])

# 컬러 영역만 +1px dilation (3x3 MaxFilter)
color_mask = saturation >= 30
color_alpha = np.where(color_mask, new_alpha, 0).astype(np.uint8)
color_alpha_d = np.array(Image.fromarray(color_alpha).filter(ImageFilter.MaxFilter(3)))
color_rgb = np.where(color_mask[..., None], new_rgb, 0).astype(np.uint8)
color_rgb_d = np.array(Image.fromarray(color_rgb).filter(ImageFilter.MaxFilter(3)))

final_rgb = new_rgb.copy()
final_alpha = new_alpha.copy()
expand_mask = (color_alpha_d > 0) & ~color_mask
final_rgb[expand_mask] = color_rgb_d[expand_mask]
final_alpha[expand_mask] = np.maximum(final_alpha[expand_mask], color_alpha_d[expand_mask])

# 1F.png 와 동일한 4000×2946 종횡비 패딩 (위/아래 투명)
out = np.dstack([final_rgb, final_alpha])
target_h = 2946
if new_h < target_h:
    pad_total = target_h - new_h
    out = np.concatenate([
        np.zeros((pad_total // 2, 4000, 4), dtype=np.uint8),
        out,
        np.zeros((pad_total - pad_total // 2, 4000, 4), dtype=np.uint8)
    ], axis=0)

Image.fromarray(out, mode="RGBA").save(dst, "PNG", optimize=True)
```

### 최종 분포 (1F 레퍼런스 매칭)

| 메트릭 | 1F.png | 새 2F.png (v18) |
|--------|--------|-----------------|
| 사이즈 | 4000×2946 | 4000×2946 ✓ |
| 종횡비 | 1.358 | 1.358 ✓ |
| alpha=0 | 86% | ~84% ✓ |
| 그레이 라인 (sat<30, alpha>50) | 8.54% | 7.15% ≈ |
| 그레이 RGB 평균 | 157 | 255 (흰색 강제) — 시각적으로 1F-like |
| 컬러 라인 (sat≥30, alpha>50) | 3.67% | 4.86% ≈ |

## Why this took 18 versions

핵심 원인: **1F·3F 가 어떻게 만들어졌는지 기록이 0** — 사용자가 PDF 만 주고 Claude (이전 세션) 가 PNG 변환했지만 알고리즘 안 적어둠. 이번에 처음부터 추측해야 했음.

### 시도 흐름

| v | Commit | 핵심 시도 | 사용자 반응 |
|---|--------|----------|------------|
| 1 (v5) | 477490a | pdftoppm + 흰배경→솔리드 검정 + 검정라인→흰선 + alpha=255 | "배경이 검은색이 아니어야 해" |
| 2 (v6) | e0b8eab | 흰배경→투명 (alpha=255-min(RGB)) | 라인 옅음 |
| 3 (v7) | 060ebd3 | 임계값 알파 (resize→threshold) | 라인 옅음 |
| 4 (v8) | 040f377 | Hybrid: invert RGB + binary alpha | 컬러 라인 안 보임 |
| 5 (v9) | 43779df | Soft alpha + 컬러 부스트 | 해상도 무너짐 |
| 6 (v10) | cc15c7c | 솔리드 #1a1f2b 페이지 매칭 | "한게 이게 맞아?" |
| 7 (v11) | 27aaa61 | 1F 픽셀 역공학 — alpha=max(R,G,B) (87% 일치) | "이게 진짜?" |
| 8 (v12) | 24c4ae9 | v11 + dilation +1px | "무슨 소리하는거야" |
| **9 (v13)** | a3f9c85 | **사용자 단서: pdftocairo -transp 발견** | 도면 크게 표시 OK |
| 10 (v14) | 12d8d39 | 컬러 dilation +2px 추가 | 라인 너무 두꺼움 |
| 11 (v15) | 64977f6 | 그레이 dilation 제거, 컬러 +1px | "그럴싸 해진 거 같아" |
| 12 (v16) | (no deploy) | dilation 다 제거 시도 | (사용자 다른 방향) |
| 13 (v17) | 88d1f6f | 그레이 RGB 흰색화 + alpha 부스트 | "회색 선이 더 회색" |
| **14 (v18)** | (final) | v17 + 컬러 +1px dilation | **"됐어 이제"** |

## Files changed (final commit only — `?v=18`)

- `cha-bio-safety/public/floorplans/sprinkler/2F.png` (binary 4000×2946 RGBA)
- `cha-bio-safety/src/pages/FloorPlanPage.tsx` (line 280)

## Production deployment

최종 URL: `https://f8dab874.cbc7119.pages.dev` (production 브랜치)
총 14회 deploy 동안 PWA SW 캐시 무효화 위해 `?v=4` → `?v=18` (14단계 bump).

## Memory artifacts

다음 도면 작업 시 18번 반복 안 하도록 메모리 저장:

- `reference_floorplan_png_algorithm.md` — pdftocairo -transp 기반 표준 알고리즘
- `feedback_avoid_premature_confirmation.md` — 시각 작업에서 "approved 주세요" 자제, 결과 보여주고 사용자 판단

## Verification

- [x] 사용자 PWA 에서 스프링클러 2F 도면 표시 정상 ("됐어 이제")
- [x] 1F·3F 와 톤 매칭 (확대 + 축소 모두 비교 후 사용자 OK)
- [x] 도면 외곽 잘림 없음 (이전 4000×2512 → 4000×2946)
- [x] 캐시버스팅 ?v=18 (PWA SW 무효화)
- [x] 알고리즘 메모리 저장 (다음 도면 작업 재사용 가능)

## Pending

없음. 추가 도면(자탐/유도등/소화기) 작업 시 메모리 알고리즘 그대로 적용 가능.
