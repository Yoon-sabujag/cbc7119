#!/usr/bin/env bash
# Verify gates for the handover/worklist desktop rule-alignment quick task.
# Usage: bash verify.sh [badges|grid|build|all]
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
H=cha-bio-safety/src/pages/HandoverPage.tsx
W=cha-bio-safety/src/pages/WorkListPage.tsx
fail=0

check() { # label expected actual
  local label="$1" exp="$2" act="$3"
  if [ "$act" = "$exp" ]; then
    echo "PASS  $label  ($act)"
  else
    echo "FAIL  $label  expected=$exp actual=$act"
    fail=1
  fi
}
checkge() { # label min actual
  local label="$1" min="$2" act="$3"
  if [ "$act" -ge "$min" ]; then
    echo "PASS  $label  ($act >= $min)"
  else
    echo "FAIL  $label  expected>=$min actual=$act"
    fail=1
  fi
}

mode="${1:-all}"

if [ "$mode" = "badges" ] || [ "$mode" = "all" ]; then
  echo "── FIX2/FIX3 badge gates ──"
  # 1. no check-emoji anywhere in HandoverPage (use printf to match the glyph)
  emoji=$(grep -c "$(printf '\xe2\x9c\x93')" "$H")
  check "no check-emoji in HandoverPage" 0 "$emoji"
  # 2. both 완료 badges tokenized (no hardcoded green)
  green=$(grep -cE 'rgba\(34,197,94|#16a34a' "$H")
  check "no hardcoded green in HandoverPage" 0 "$green"
  # 3. 현재 badge accent NOT over-replaced (still present)
  checkge "var(--accent) kept (현재 badge)" 1 "$(grep -c 'var(--accent)' "$H")"
  checkge "현재 text kept" 1 "$(grep -c '현재' "$H")"
  # 4. 복원 purple kept
  checkge "복원 purple kept (9333ea)" 1 "$(grep -c '9333ea' "$H")"
  # 5. WorkList 삭제됨 danger tokenized at both spots
  check "WorkList status-danger-bg count" 2 "$(grep -c 'status-danger-bg' "$W")"
  # 6. Handover status tokens present (safe+warning+danger across mobile+desktop)
  checkge "Handover status-safe-bg" 2 "$(grep -c 'status-safe-bg' "$H")"
  checkge "Handover status-warning-bg" 2 "$(grep -c 'status-warning-bg' "$H")"
  checkge "Handover status-danger-bg" 2 "$(grep -c 'status-danger-bg' "$H")"
fi

if [ "$mode" = "grid" ] || [ "$mode" = "all" ]; then
  echo "── FIX1 grid gates ──"
  checkge "maxWidth 1200 container" 1 "$(grep -c 'maxWidth: 1200' "$H")"
  checkge "min track 300" 1 "$(grep -c 'minmax(300px, 1fr)' "$H")"
  checkge "grid gap-3" 1 "$(grep -c 'className="grid gap-3"' "$H")"
  check "old 290 track removed" 0 "$(grep -c 'minmax(290px' "$H")"
fi

if [ "$mode" = "build" ] || [ "$mode" = "all" ]; then
  echo "── build gate ──"
  ( cd cha-bio-safety && npm run build >/tmp/o93-build.log 2>&1 )
  if [ $? -eq 0 ]; then echo "PASS  build"; else echo "FAIL  build (see /tmp/o93-build.log)"; fail=1; fi
fi

echo
if [ "$fail" -eq 0 ]; then echo "ALL GATES PASS"; else echo "SOME GATES FAILED"; fi
exit $fail
