#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
# cbc7119 맥 이관 — 1단계 (현재 맥에서 실행)
#
# Claude 자동 메모리 + manifest 를 단일 archive 로 묶음.
# 새 맥에 복사 후 ./migrate/import.sh <archive> 실행.
#
# 사용: ./migrate/export.sh
# ───────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEMORY_DIR_NAME="$(echo "$REPO_ROOT" | sed 's|/|-|g')"
# Claude project dir = ~/.claude/projects/<encoded path>/
#   - memory/ 만 persistent (이 스크립트의 백업 대상)
#   - <UUID>/, *.jsonl 은 session-specific (제외 — 용량 큼)
MEMORY_SRC="$HOME/.claude/projects/${MEMORY_DIR_NAME}/memory"
DESKTOP="$HOME/Desktop"
TS="$(date +%y%m%d-%H%M)"
ARCHIVE="${DESKTOP}/cbc7119-mac-migration-${TS}.tgz"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "▶ cbc7119 이관 — 메모리 + manifest 추출"
echo "   repo:    $REPO_ROOT"
echo "   memory:  $MEMORY_SRC"
echo ""

# ── 1) 사전 점검 ────────────────────────────────────────────
if [ ! -d "$MEMORY_SRC" ]; then
  echo "✗ 메모리 폴더 없음: $MEMORY_SRC" >&2
  exit 1
fi

cd "$REPO_ROOT"
DIRTY="$(git status --porcelain | grep -v '^??' || true)"
UNPUSHED="$(git log --oneline @{u}..HEAD 2>/dev/null || echo "")"
BRANCH="$(git branch --show-current)"

if [ -n "$DIRTY" ]; then
  echo "⚠ uncommitted 변경 있음:"
  echo "$DIRTY" | sed 's/^/    /'
  echo "  → 이관 전 commit/stash 권장. 그래도 진행하려면 Enter, 중단 Ctrl+C"
  read -r
fi
if [ -n "$UNPUSHED" ]; then
  echo "⚠ unpushed commits 있음 (origin/$BRANCH 보다 앞섬):"
  echo "$UNPUSHED" | sed 's/^/    /'
  echo "  → git push 후 진행 권장. 그래도 진행하려면 Enter"
  read -r
fi

# ── 2) 메모리 복사 ──────────────────────────────────────────
mkdir -p "$STAGE/memory"
cp -R "$MEMORY_SRC/." "$STAGE/memory/"
MEM_COUNT="$(find "$STAGE/memory" -type f -name '*.md' | wc -l | tr -d ' ')"
echo "✓ 메모리 ${MEM_COUNT} 파일 staged"

# ── 3) manifest 생성 ────────────────────────────────────────
GIT_REMOTE="$(git remote get-url origin 2>/dev/null || echo 'unknown')"
GIT_HEAD="$(git rev-parse HEAD)"
GIT_HEAD_SHORT="$(git rev-parse --short HEAD)"
USER_NAME="$(whoami)"

cat > "$STAGE/manifest.json" <<JSON
{
  "exportedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "exportedFromUser": "$USER_NAME",
  "repoPath": "$REPO_ROOT",
  "memoryDirName": "$MEMORY_DIR_NAME",
  "gitRemote": "$GIT_REMOTE",
  "gitBranch": "$BRANCH",
  "gitHead": "$GIT_HEAD",
  "gitHeadShort": "$GIT_HEAD_SHORT",
  "memoryFileCount": $MEM_COUNT
}
JSON
echo "✓ manifest 작성"

# ── 4) 압축 ─────────────────────────────────────────────────
tar -czf "$ARCHIVE" -C "$STAGE" memory manifest.json
SIZE="$(du -h "$ARCHIVE" | awk '{print $1}')"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ archive 생성 완료"
echo "   $ARCHIVE ($SIZE)"
echo ""
echo "다음 단계 (새 맥에서):"
echo "  1. 위 archive 를 새 맥의 ~/Desktop 으로 옮기기 (AirDrop / iCloud / USB)"
echo "  2. 새 맥에서 도구 설치 (Node, git, gh, Claude Code)"
echo "  3. ~/Documents 로 이동 후:"
echo "       gh auth login                 # GitHub 인증"
echo "       gh repo clone Yoon-sabujag/cbc7119 20260328"
echo "       cd 20260328 && git checkout $BRANCH"
echo "       ./migrate/import.sh ~/Desktop/$(basename "$ARCHIVE")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
