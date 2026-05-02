---
phase: 260502-wet-2f-png-pdf-4000px-png
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/public/floorplans/sprinkler/2F.png
  - cha-bio-safety/src/pages/FloorPlanPage.tsx
autonomous: true
requirements:
  - QUICK-01-replace-2f-png
  - QUICK-02-cache-bust
  - QUICK-03-deploy

must_haves:
  truths:
    - "스프링클러 2F 도면이 새 PDF에서 렌더된 PNG로 교체됨 (하단 잘림 없음)"
    - "2F.png 가 검은 배경 + 컬러 라인 (흰 배경 → 검은색, 검은 라인 → 흰색, 컬러는 보존)"
    - "2F.png 폭이 4000px 이고 1F.png 와 시각적 톤이 매칭됨"
    - "PWA 사용자가 앱 재시작 시 새 도면이 자동으로 보임 (캐시버스팅 ?v=5)"
    - "프로덕션(production 브랜치) 에 배포 완료되어 https URL 에서 새 도면 확인 가능"
  artifacts:
    - path: "cha-bio-safety/public/floorplans/sprinkler/2F.png"
      provides: "새 4000px-wide 스프링클러 2F 도면 (검은 배경, 컬러 라인 보존)"
      contains: "PNG image data, 4000 x N, RGB(A)"
    - path: "cha-bio-safety/src/pages/FloorPlanPage.tsx"
      provides: "캐시버스팅 버전 ?v=5"
      contains: "?v=5"
  key_links:
    - from: "cha-bio-safety/src/pages/FloorPlanPage.tsx"
      to: "/floorplans/sprinkler/2F.png?v=5"
      via: "getFloorPlanUrl 반환값"
      pattern: "\\?v=5"
---

<objective>
스프링클러 2F 도면 PNG 를 새 PDF (사용자가 DWG 에서 변환해온 준공도면) 에서 4000px 폭으로 다시 렌더하고, AutoCAD 모델스페이스 톤(검은 배경 + 컬러 라인)에 맞게 색상 변환한 뒤 캐시버스팅과 함께 프로덕션에 배포한다.

Purpose:
- 현재 2F.png 는 4000×2512 로 하단 ~430px 가 잘려 있어 점검 시 하단 영역 확인 불가
- 새 PDF 는 한글/하단 모두 정상이지만 흰 배경 + 컬러 라인 (PLOT 스타일) 이라 다른 층(검은 배경) 과 톤 불일치
- 단순 negate 시 컬러 라인이 보색으로 깨지므로 마스크 기반 변환 필요

Output:
- 교체된 cha-bio-safety/public/floorplans/sprinkler/2F.png (4000px, 검은 배경, 컬러 보존)
- ?v=4 → ?v=5 로 캐시버스팅 적용된 FloorPlanPage.tsx
- production 브랜치에 배포된 새 도면
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

<source_pdf>
경로 (gitignored, worktree 부적합):
/Users/jykevin/Documents/20260328/작업용/도면/소방 기계/EF-016 지상2층 기계소화 평면도_준공도면_20140331.pdf

특성:
- DWG → PDF 변환된 준공도면
- 흰 배경 + 컬러 라인 (PLOT 스타일)
- 한글/하단 정상 확인됨
</source_pdf>

<reference_png>
경로: cha-bio-safety/public/floorplans/sprinkler/1F.png
- PNG, 4000 × 2946, 8-bit RGBA
- 검은 배경 + 컬러 라인 (AutoCAD 모델스페이스 톤)
- 변환 후 2F.png 가 시각적으로 이 톤과 매칭되어야 함
</reference_png>

<current_target>
경로: cha-bio-safety/public/floorplans/sprinkler/2F.png
- PNG, 4000 × 2512, 8-bit RGBA
- 하단 ~430px 잘림 → 교체 대상
</current_target>

<color_conversion_spec>
**옵션 B (사용자 결정) — 마스크 기반 변환:**

- 흰 배경 픽셀 (R>240 AND G>240 AND B>240) → 검은색 (0, 0, 0)
- 검은 라인 픽셀 (R<30 AND G<30 AND B<30) → 흰색 (255, 255, 255)
- 그 외 모든 컬러 픽셀 (빨강·노랑·초록·청록 등) → 그대로 유지

**금지:**
- 단순 negate / 전체 픽셀 반전 금지 (컬러가 보색으로 변해 다른 층과 톤 불일치)
- ImageMagick `-negate` 류 단축 변환 금지

**알파 채널:**
- 입력 PNG 가 알파를 가지면 RGB 만 변환하고 알파는 그대로 보존 (1F.png 가 RGBA 이므로 출력도 RGBA 권장)
</color_conversion_spec>

<tools_available>
- pdftoppm (poppler) — `/usr/local/bin/pdftoppm` — 설치됨
- python3 — `/usr/bin/python3` — PIL 11.3.0, numpy 2.0.2 설치됨
- ImageMagick — 미설치 (사용 금지, 필요 시 brew install 가능하지만 이번 작업엔 불필요)
</tools_available>

<deployment_rules>
- npm run deploy 는 cha-bio-safety/ 디렉토리에서 실행 (wrangler pages deploy)
- **반드시 `--branch production` 명시** — 안 붙이면 Preview 로 감 (메모리 룰)
- **wrangler 가 한글 커밋 메시지를 거부할 수 있음** — `--commit-message` 로 ASCII 별도 지정 (메모리 룰)
- **로컬 dev 서버로 테스트 금지** — 항상 프로덕션 배포 후 https URL 에서 확인 (메모리 룰)
- **PWA 캐시 무효화 핵심:** ?v 쿼리 파라미터 bump 가 SW 캐시를 무효화시키는 유일한 방법 (메모리 룰)
</deployment_rules>

<commit_policy>
- 코드 + PNG 는 atomic commit (binary PNG 와 ?v=5 변경이 한 커밋)
- SUMMARY.md 는 orchestrator 가 처리, executor 가 직접 commit 금지
- 커밋 후 push 적극 권유 (메모리 룰)
</commit_policy>
</context>

<tasks>

<task type="auto">
  <name>Task 1: 새 PDF 에서 4000px PNG 렌더 및 색상 변환</name>
  <files>cha-bio-safety/public/floorplans/sprinkler/2F.png</files>
  <action>
새 PDF 를 4000px 폭으로 렌더한 뒤 마스크 기반 색상 변환을 적용해 2F.png 를 교체한다.

**Step 1 — 임시 작업 디렉토리 준비:**
```bash
TMPDIR=$(mktemp -d)
echo "Working in: $TMPDIR"
```

**Step 2 — pdftoppm 으로 고해상도 PNG 렌더:**

PDF 의 페이지 폭을 먼저 확인해서 4000px 폭에 맞는 DPI 를 계산한다.
```bash
pdfinfo "/Users/jykevin/Documents/20260328/작업용/도면/소방 기계/EF-016 지상2층 기계소화 평면도_준공도면_20140331.pdf" | grep "Page size"
```

`pdftoppm -r {DPI}` 로 렌더 (4000px 폭 목표). PDF 폭이 inch 단위로 나오면 `DPI = ceil(4000 / page_width_inch)`. 일반적으로 A1/A2 도면이면 `-r 600` 근처면 4000~5000px 폭이 나온다.

```bash
pdftoppm -r 600 -png \
  "/Users/jykevin/Documents/20260328/작업용/도면/소방 기계/EF-016 지상2층 기계소화 평면도_준공도면_20140331.pdf" \
  "$TMPDIR/raw"
ls -la "$TMPDIR"/
file "$TMPDIR"/raw-1.png
```

산출물 폭이 4000 보다 크면 다음 단계에서 PIL 로 4000 폭으로 리사이즈, 작으면 `-r` 을 더 높여서 재렌더 (예: `-r 750`). 정확히 4000px 폭이 나올 필요는 없다 — 4000~5000 범위에서 후처리에서 리사이즈하면 됨.

**Step 3 — Python (PIL+numpy) 으로 색상 변환 + 4000px 리사이즈:**

다음 스크립트를 `$TMPDIR/convert.py` 로 작성하고 실행:

```python
import sys
from PIL import Image
import numpy as np

src = sys.argv[1]   # 예: $TMPDIR/raw-1.png
dst = sys.argv[2]   # 예: $TMPDIR/2F.png

img = Image.open(src).convert("RGBA")
arr = np.array(img)  # shape (H, W, 4)

rgb = arr[..., :3]
alpha = arr[..., 3:4]

R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]

# 흰 배경 마스크: R>240 AND G>240 AND B>240
white_mask = (R > 240) & (G > 240) & (B > 240)

# 검은 라인 마스크: R<30 AND G<30 AND B<30
black_mask = (R < 30) & (G < 30) & (B < 30)

# 새 RGB 배열
new_rgb = rgb.copy()
new_rgb[white_mask] = [0, 0, 0]      # 흰 배경 → 검은색
new_rgb[black_mask] = [255, 255, 255] # 검은 라인 → 흰색
# 나머지 컬러는 그대로

# 합치기
out_arr = np.concatenate([new_rgb, alpha], axis=-1).astype(np.uint8)
out_img = Image.fromarray(out_arr, mode="RGBA")

# 4000px 폭으로 리사이즈 (비율 유지, LANCZOS)
target_w = 4000
w, h = out_img.size
if w != target_w:
    new_h = round(h * target_w / w)
    out_img = out_img.resize((target_w, new_h), Image.LANCZOS)

out_img.save(dst, "PNG", optimize=True)
print(f"Saved: {dst} {out_img.size}")
```

실행:
```bash
python3 "$TMPDIR/convert.py" "$TMPDIR/raw-1.png" "$TMPDIR/2F.png"
file "$TMPDIR/2F.png"
```

**Step 4 — 검증 후 교체:**

산출물이 4000px 폭이고 RGBA 인지 확인:
```bash
file "$TMPDIR/2F.png"
# 기대: PNG image data, 4000 x N, 8-bit/color RGBA
```

OK 면 cha-bio-safety/public/floorplans/sprinkler/2F.png 로 복사:
```bash
cp "$TMPDIR/2F.png" /Users/jykevin/Documents/20260328/cha-bio-safety/public/floorplans/sprinkler/2F.png
file /Users/jykevin/Documents/20260328/cha-bio-safety/public/floorplans/sprinkler/2F.png
```

**Step 5 — 시각 확인 준비 (Task 3 의 사용자 검증용):**

새 2F.png 를 macOS 미리보기로 열어둘 수 있도록 경로만 메모. 실제 비교는 Task 3 에서.

**주의 / 함정:**
- pdftoppm 산출물 파일명은 `raw-1.png` 형태 (페이지 1) — 멀티페이지 PDF 면 raw-2, raw-3 도 생성됨. 1페이지만 사용.
- 흰/검 임계값 (240, 30) 은 사용자 결정값. 변경 금지.
- 단순 negate (전체 반전) 절대 금지 — 컬러 라인이 보색으로 깨짐.
- 알파 채널은 RGB 만 변환하고 보존 (1F.png 와 일관성).
- 리사이즈는 색상 변환 **이후** 에 하면 LANCZOS 보간 때문에 임계값 마스크가 정확하지 않을 수 있는데, 이번 케이스는 변환 후 다운샘플 → 흰/검 영역의 평균이라 문제 없음. 만약 결과가 어색하면 변환 전에 4000 폭 리사이즈하고 변환을 마지막에 적용하는 순서로 바꾸어도 무방 (둘 다 시도 가능).
  </action>
  <verify>
    <automated>file /Users/jykevin/Documents/20260328/cha-bio-safety/public/floorplans/sprinkler/2F.png | grep -E "4000 x [0-9]+, 8-bit/color RGB"</automated>
  </verify>
  <done>
- 새 2F.png 가 cha-bio-safety/public/floorplans/sprinkler/ 에 위치
- 폭 4000px, RGB(A) 8-bit
- 흰 배경이 검은색으로, 검은 라인이 흰색으로 변환됨 (컬러 라인은 그대로)
- 하단 잘림 없음 (사용자가 PDF 에서 정상 확인했다고 함)
  </done>
</task>

<task type="auto">
  <name>Task 2: 캐시버스팅 ?v=5 적용 + atomic commit</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx, cha-bio-safety/public/floorplans/sprinkler/2F.png</files>
  <action>
PWA 서비스워커 캐시를 무효화하기 위해 캐시버스팅 버전을 bump 하고, PNG + 코드 변경을 atomic commit 한다.

**Step 1 — 코드 수정:**

`cha-bio-safety/src/pages/FloorPlanPage.tsx:280` 한 줄 수정:
- Before: `return \`/floorplans/${planType}/${floor}.png?v=4\``
- After:  `return \`/floorplans/${planType}/${floor}.png?v=5\``

Edit 도구 사용. 수정 후 grep 으로 확인:
```bash
grep -n "?v=" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/FloorPlanPage.tsx
# 기대: 280번째 줄에 ?v=5 한 곳만 매치
```

**Step 2 — git status 확인:**

```bash
git -C /Users/jykevin/Documents/20260328 status
# 기대: 두 파일 modified
#   cha-bio-safety/public/floorplans/sprinkler/2F.png
#   cha-bio-safety/src/pages/FloorPlanPage.tsx
```

**Step 3 — atomic commit:**

PNG 와 ?v=5 변경을 한 커밋으로:
```bash
git -C /Users/jykevin/Documents/20260328 add \
  cha-bio-safety/public/floorplans/sprinkler/2F.png \
  cha-bio-safety/src/pages/FloorPlanPage.tsx

git -C /Users/jykevin/Documents/20260328 commit -m "$(cat <<'EOF'
chore(floorplan): 스프링클러 2F PNG 교체 (4000px, 하단 잘림 수정)

- 새 PDF (EF-016 지상2층 기계소화 평면도_준공도면_20140331.pdf) 에서 pdftoppm 으로 고해상도 렌더
- 흰 배경 → 검은색, 검은 라인 → 흰색, 컬러 라인 보존 (마스크 기반 변환)
- 4000px 폭으로 리사이즈 (1F.png 와 톤 매칭)
- FloorPlanPage.tsx ?v=4 → ?v=5 캐시버스팅 (PWA SW 캐시 무효화)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Step 4 — 커밋 확인:**

```bash
git -C /Users/jykevin/Documents/20260328 log -1 --stat
```

**주의 / 함정:**
- `git add -A` 또는 `git add .` 사용 금지 — 다른 untracked 파일 끌려올 수 있음. 두 파일만 명시적으로 add.
- SUMMARY.md 는 commit 하지 말 것 (orchestrator 책임).
- 만약 grep 에서 `?v=4` 가 다른 곳에도 있다면 모두 ?v=5 로 통일 (하지만 사전 탐색 결과 280줄 한 군데만임).
  </action>
  <verify>
    <automated>grep -c "?v=5" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/FloorPlanPage.tsx | grep -q "^1$" && ! grep -q "?v=4" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/FloorPlanPage.tsx && git -C /Users/jykevin/Documents/20260328 log -1 --pretty=%s | grep -q "스프링클러 2F"</automated>
  </verify>
  <done>
- FloorPlanPage.tsx 에 `?v=5` 한 군데, `?v=4` 0건
- git log 최상단 커밋이 PNG + tsx 두 파일 포함, 메시지에 "스프링클러 2F" 포함
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 프로덕션 배포 + 사용자 시각 검증</name>
  <what-built>
- 4000px 폭 새 스프링클러 2F.png (검은 배경, 컬러 라인 보존, 하단 잘림 없음)
- ?v=5 캐시버스팅 적용된 FloorPlanPage.tsx
- atomic git commit 완료
  </what-built>
  <how-to-verify>
**Step A — 프로덕션 배포 (Claude 가 자동 실행):**

```bash
cd /Users/jykevin/Documents/20260328/cha-bio-safety && \
  npm run deploy -- --branch production --commit-message "chore(floorplan): replace sprinkler 2F PNG (4000px, fix bottom crop)"
```

주의:
- **반드시 `--branch production`** (메모리 룰: 안 붙이면 Preview 로 감)
- **`--commit-message` 는 ASCII** (메모리 룰: wrangler 가 한글 거부 가능)
- npm run deploy 가 추가 인자를 wrangler 까지 forward 하는지 package.json 확인. 만약 forward 안 되면 `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --branch production --commit-message "..."` 직접 실행.

배포 완료 메시지에서 production URL 확인하여 사용자에게 알림.

**Step B — 사용자 시각 검증 (수동):**

배포된 production URL 에서 PWA 앱 열고:

1. 스프링클러 → 2F 도면 페이지 진입
2. 새 도면이 표시되는지 확인 (캐시 무효화 안 되면 강제 새로고침 또는 PWA 재시작)
3. 다음 항목 점검:
   - [ ] 하단 잘림 없음 (이전 4000×2512 대비 비율이 1F 와 비슷한 4000×~2900 대)
   - [ ] 배경이 검은색 (흰색 아님)
   - [ ] 라인 컬러 (빨강/노랑/초록/청록 등) 가 1F 와 동일한 톤으로 보존됨
   - [ ] 텍스트(한글) 가 흰색으로 깔끔하게 보임 (배경에 흰 사각형 안 깔림)
4. 1F 와 2F 를 번갈아 보면서 톤 일관성 확인
  </how-to-verify>
  <resume-signal>
"approved" 입력 시 plan 완료. 문제 있으면 구체적 증상 (예: "배경에 회색 잡티 남음", "노란 라인이 보라색으로 변함", "여전히 하단 잘림") 알려주면 임계값 (240/30) 또는 변환 순서 조정해 재실행.
  </resume-signal>
</task>

</tasks>

<verification>
**자동 검증 (Task 1 + Task 2):**

```bash
# 1. PNG 정상
file /Users/jykevin/Documents/20260328/cha-bio-safety/public/floorplans/sprinkler/2F.png | grep -E "4000 x [0-9]+, 8-bit/color RGB"

# 2. 캐시버스팅 정상
grep -c "?v=5" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/FloorPlanPage.tsx
# 기대: 1
grep -c "?v=4" /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/FloorPlanPage.tsx
# 기대: 0

# 3. atomic commit 존재
git -C /Users/jykevin/Documents/20260328 log -1 --name-only | grep -E "(2F\.png|FloorPlanPage\.tsx)"
# 기대: 두 파일 모두 출력
```

**수동 검증 (Task 3):**

production URL 에서 스프링클러 2F 도면이 1F 와 톤 매칭되어 표시 + 하단 잘림 없음.
</verification>

<success_criteria>
- [ ] cha-bio-safety/public/floorplans/sprinkler/2F.png 가 4000px 폭, 검은 배경 + 컬러 라인
- [ ] FloorPlanPage.tsx 의 캐시버스팅이 ?v=5 (4 잔존 0건)
- [ ] PNG + tsx 가 atomic git commit 으로 묶임
- [ ] production 브랜치에 wrangler pages deploy 성공 (Preview 아님)
- [ ] 사용자가 production URL 에서 새 2F 도면 시각 검증 완료 ("approved")
</success_criteria>

<output>
After completion, create `.planning/quick/260502-wet-2f-png-pdf-4000px-png/260502-wet-SUMMARY.md`
</output>
