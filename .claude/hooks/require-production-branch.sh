#!/bin/bash
# Block wrangler / npm-style deploy commands unless current git branch is `production`.
# Triggered by Claude Code PreToolUse hook (matcher: Bash).
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$COMMAND" ] && exit 0
if echo "$COMMAND" | grep -qE "(^|[^a-zA-Z_-])(npx +)?wrangler([ \t]|$)|(^|[^a-zA-Z_-])(npm|pnpm|yarn) +run +deploy([ \t]|$)|(^|[^a-zA-Z_-])(npm|pnpm|yarn) +deploy([ \t]|$)"; then
  CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)
  [ -z "$CWD" ] && CWD="$PWD"
  BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)
  if [ "$BRANCH" != "production" ]; then
    cat >&2 <<MSG
BLOCKED by .claude/hooks/require-production-branch.sh

Deploy/wrangler 명령은 'production' 브랜치에서만 허용됩니다.
현재 브랜치: ${BRANCH:-unknown}
실행하려면: git checkout production
MSG
    exit 2
  fi
fi
exit 0
