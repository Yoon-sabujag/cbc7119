#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
# cbc7119 맥 이관 — 2단계 (새 맥에서 실행)
#
# 1) Claude 자동 메모리 복원 (path 다르면 자동으로 새 path 로 rename)
# 2) npm install
# 3) wrangler / gh 인증 상태 점검 + TODO 출력
#
# 사용: ./migrate/import.sh ~/Desktop/cbc7119-mac-migration-XXXXXX.tgz
# ───────────────────────────────────────────────────────────
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "사용: $0 <archive.tgz>" >&2
  echo "예: $0 ~/Desktop/cbc7119-mac-migration-260528-2200.tgz" >&2
  exit 1
fi

ARCHIVE="$1"
if [ ! -f "$ARCHIVE" ]; then
  echo "✗ archive 없음: $ARCHIVE" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEW_MEMORY_DIR_NAME="$(echo "$REPO_ROOT" | sed 's|/|-|g')"
# 복원 대상: ~/.claude/projects/<encoded>/memory/  (subdir 만)
MEMORY_DEST="$HOME/.claude/projects/${NEW_MEMORY_DIR_NAME}/memory"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "▶ cbc7119 이관 — 새 맥 셋업 시작"
echo "   archive:     $ARCHIVE"
echo "   repo:        $REPO_ROOT"
echo "   memory dest: $MEMORY_DEST"
echo ""

# ── 1) archive 풀기 + manifest 읽기 ──────────────────────────
tar -xzf "$ARCHIVE" -C "$STAGE"
if [ ! -d "$STAGE/memory" ] || [ ! -f "$STAGE/manifest.json" ]; then
  echo "✗ archive 구조 이상 (memory/ + manifest.json 필요)" >&2
  exit 1
fi
OLD_MEM_DIR="$(grep '"memoryDirName"' "$STAGE/manifest.json" | sed 's/.*"\(.*\)",*/\1/')"
OLD_HEAD="$(grep '"gitHeadShort"' "$STAGE/manifest.json" | sed 's/.*"\(.*\)",*/\1/')"
MEM_COUNT="$(find "$STAGE/memory" -type f -name '*.md' | wc -l | tr -d ' ')"
echo "✓ archive 추출 (${MEM_COUNT} 메모리 파일, 원래 HEAD ${OLD_HEAD})"
if [ "$OLD_MEM_DIR" != "$NEW_MEMORY_DIR_NAME" ]; then
  echo "  ↻ path 변환: $OLD_MEM_DIR → $NEW_MEMORY_DIR_NAME"
fi

# ── 2) 메모리 복원 ───────────────────────────────────────────
if [ -d "$MEMORY_DEST" ] && [ -n "$(ls -A "$MEMORY_DEST" 2>/dev/null)" ]; then
  BACKUP="${MEMORY_DEST}.bak.$(date +%y%m%d-%H%M)"
  mv "$MEMORY_DEST" "$BACKUP"
  echo "✓ 기존 메모리 백업: $BACKUP"
fi
mkdir -p "$MEMORY_DEST"
cp -R "$STAGE/memory/." "$MEMORY_DEST/"
echo "✓ 메모리 복원 완료 → $MEMORY_DEST"

# ── 3) npm install ──────────────────────────────────────────
if [ -f "$REPO_ROOT/cha-bio-safety/package.json" ]; then
  echo ""
  echo "▶ npm install (cha-bio-safety/)"
  (cd "$REPO_ROOT/cha-bio-safety" && npm install --silent 2>&1 | tail -5) || echo "  ⚠ npm install 실패 — 수동으로 다시 시도"
else
  echo "⚠ cha-bio-safety/package.json 없음 — repo clone 이 완전한지 확인"
fi

# ── 4) git 상태 확인 ────────────────────────────────────────
echo ""
echo "▶ git 상태"
cd "$REPO_ROOT"
CUR_HEAD="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
CUR_BRANCH="$(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "   branch: $CUR_BRANCH"
echo "   HEAD:   $CUR_HEAD (archive 시점: $OLD_HEAD)"
if [ "$CUR_HEAD" != "$OLD_HEAD" ]; then
  echo "   ↻ 새 commits 가 origin 에 있는 듯. git pull 권장."
fi

# ── 5) 인증 상태 점검 ──────────────────────────────────────
echo ""
echo "▶ 인증 상태"

GH_OK=0
WR_OK=0
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    echo "   ✓ gh (GitHub) 로그인됨"
    GH_OK=1
  else
    echo "   ✗ gh 미인증 — 'gh auth login' 필요"
  fi
else
  echo "   ✗ gh 미설치 — 'brew install gh'"
fi

if command -v wrangler >/dev/null 2>&1; then
  if wrangler whoami 2>&1 | grep -qE 'You are logged in|Associated email'; then
    echo "   ✓ wrangler (Cloudflare) 로그인됨"
    WR_OK=1
  else
    echo "   ✗ wrangler 미인증 — 'wrangler login' 필요"
  fi
else
  echo "   ✗ wrangler 미설치 — 'npm i -g wrangler'"
fi

# ── 6) 최종 안내 ────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ 자동 단계 완료"
echo ""
echo "남은 수동 단계:"
[ $GH_OK -eq 0 ]  && echo "  □ gh auth login           # GitHub 로그인 (브라우저)"
[ $WR_OK -eq 0 ]  && echo "  □ wrangler login          # Cloudflare 로그인 (브라우저)"
echo "  □ Claude Code 실행 — 같은 디렉토리 ($REPO_ROOT) 에서"
echo "    → 첫 메시지에 'production-sync.md 마지막 entry 알려줘' 등으로 메모리 로드 확인"
echo ""
echo "기준 production HEAD: $OLD_HEAD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
