#!/usr/bin/env bash
# 260612-3lt grep verify 게이트 — cha-bio-safety/ 기준, 전부 PASS 필수.
# 실측 확정값 (planner 가 patch 임시 적용 후 측정). 불일치 시 비정상 종료.
set -u
cd /Users/jongyupyoon/Documents/20260328 || exit 2
B=cha-bio-safety/src
fail=0
# grep -c 는 0 매치 시 종료코드 1 → 카운트는 stdout 으로만 판단 (종료코드 무시).
chk() { # chk <expected> <token> <file>
  local got
  got=$(grep -c "$2" "$3" 2>/dev/null)
  got=${got:-0}
  if [ "$got" != "$1" ]; then echo "FAIL: grep -c '$2' $3 = $got (expect $1)"; fail=1
  else echo "ok: $3 '$2' = $got"; fi
}
chk 1  "photoUploadFailMsg" "$B/hooks/usePhotoUpload.ts"
chk 2  "photoUploadFailMsg" "$B/hooks/useMultiPhotoUpload.ts"
chk 13 "photoUploadFailMsg" "$B/pages/InspectionPage.tsx"
chk 4  "photoUploadFailMsg" "$B/pages/FloorPlanPage.tsx"
chk 2  "photoUploadFailMsg" "$B/pages/RemediationDetailPage.tsx"
chk 0  "업로드 실패 — 다시" "$B/pages/InspectionPage.tsx"
chk 0  "업로드 실패 — 다시" "$B/pages/FloorPlanPage.tsx"
chk 0  "업로드 실패 — 다시" "$B/pages/RemediationDetailPage.tsx"
chk 1  "bcPhoto.vaultBacked" "$B/pages/InspectionPage.tsx"
chk 1  "inspectBcPhoto.vaultBacked" "$B/pages/FloorPlanPage.tsx"
chk 1  "usePhotoUpload('inspection-resolution')" "$B/pages/RemediationDetailPage.tsx"
chk 1  "photo.reset()" "$B/pages/RemediationDetailPage.tsx"
# 존재성 게이트
grep -q "export function photoUploadFailMsg" "$B/hooks/usePhotoUpload.ts" || { echo "FAIL: photoUploadFailMsg export 없음"; fail=1; }
grep -q "const vaultBacked = !!vaultIdRef.current" "$B/hooks/usePhotoUpload.ts" || { echo "FAIL: vaultBacked 파생 없음"; fail=1; }
grep -q "catch {" "$B/hooks/usePhotoUpload.ts" || { echo "FAIL: upload catch 블록 없음"; fail=1; }
# LegalFindingsPage 무접촉 — '사진 업로드 실패' 라벨 그대로 1건
chk 1 "사진 업로드 실패" "$B/pages/LegalFindingsPage.tsx"
# diff 가 정확히 5파일만 (production-sync.md/.planning 제외)
nchanged=$(git diff --name-only -- cha-bio-safety/ | wc -l | tr -d ' ')
[ "$nchanged" = 5 ] || { echo "FAIL: cha-bio-safety/ 변경 파일 = $nchanged (expect 5)"; fail=1; }
if [ "$fail" = 0 ]; then echo GATE-PASS; else echo GATE-FAIL; exit 1; fi
