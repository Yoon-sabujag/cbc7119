#!/usr/bin/env bash
# Auto-push after `git commit` (PostToolUse:Bash hook).
# Skips amend/rebase/reset to avoid force-push risk.

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Skip history-rewriting commands
if printf '%s' "$CMD" | grep -qE '(^|[[:space:]])(--amend|git[[:space:]]+rebase|git[[:space:]]+reset)([[:space:]]|$)'; then
  exit 0
fi

# Trigger only on `git commit`
if printf '%s' "$CMD" | grep -qE '(^|[[:space:]])git[[:space:]]+commit([[:space:]]|$)'; then
  cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null
  echo ""
  echo "[auto-push] git push..."
  git push 2>&1 || echo "[auto-push] push failed (non-blocking)"
fi

exit 0
