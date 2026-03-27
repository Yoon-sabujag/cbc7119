#!/usr/bin/env bash
# ============================================================
#  차바이오컴플렉스 방재시스템 — 배포 관리 도구
#  프로젝트: cha-bio-safety  |  대상: Cloudflare Pages + D1
# ============================================================

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 색상 정의 ──────────────────────────────────────────────
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ── 공통 함수 ──────────────────────────────────────────────
print_header() {
  echo ""
  echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}${BOLD}║   차바이오컴플렉스 방재시스템 배포 도구  v0.2.0      ║${RESET}"
  echo -e "${CYAN}${BOLD}║   Cloudflare Pages + D1 배포 관리                    ║${RESET}"
  echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
  echo ""
}

print_menu() {
  echo -e "${BOLD}  ┌─────────────────────────────────────────────┐${RESET}"
  echo -e "${BOLD}  │  배포 메뉴를 선택하세요                       │${RESET}"
  echo -e "${BOLD}  ├─────────────────────────────────────────────┤${RESET}"
  echo -e "${BOLD}  │  ${GREEN}1${RESET}${BOLD})  빌드만 (Build)                            │${RESET}"
  echo -e "${BOLD}  │  ${GREEN}2${RESET}${BOLD})  빌드 + Cloudflare 배포                    │${RESET}"
  echo -e "${BOLD}  │  ${GREEN}3${RESET}${BOLD})  DB 마이그레이션 — 원격 (Cloudflare D1)    │${RESET}"
  echo -e "${BOLD}  │  ${GREEN}4${RESET}${BOLD})  DB 마이그레이션 — 로컬 (개발용)           │${RESET}"
  echo -e "${BOLD}  │  ${GREEN}5${RESET}${BOLD})  전체 배포 (빌드 + 배포 + 원격 DB 마이그)  │${RESET}"
  echo -e "${BOLD}  │  ${GREEN}6${RESET}${BOLD})  개발 서버 시작 (로컬)                     │${RESET}"
  echo -e "${BOLD}  │  ${GREEN}7${RESET}${BOLD})  Wrangler 로그인 상태 확인                 │${RESET}"
  echo -e "${BOLD}  │  ${YELLOW}0${RESET}${BOLD})  종료                                      │${RESET}"
  echo -e "${BOLD}  └─────────────────────────────────────────────┘${RESET}"
  echo ""
}

check_node() {
  if ! command -v node &>/dev/null; then
    echo -e "${RED}[오류] Node.js가 설치되어 있지 않습니다.${RESET}"
    exit 1
  fi
  if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}[알림] node_modules 가 없습니다. npm install 을 먼저 실행합니다...${RESET}"
    npm install
  fi
}

check_wrangler() {
  if ! command -v wrangler &>/dev/null && ! npx --no wrangler --version &>/dev/null 2>&1; then
    echo -e "${RED}[오류] wrangler 를 찾을 수 없습니다. npm install 을 실행해 주세요.${RESET}"
    exit 1
  fi
}

step() { echo -e "\n${CYAN}▶ $1${RESET}"; }
ok()   { echo -e "${GREEN}✔ $1${RESET}"; }
fail() { echo -e "${RED}✘ $1${RESET}"; }

# ── 작업 함수 ──────────────────────────────────────────────

do_build() {
  check_node
  step "TypeScript 컴파일 + Vite 빌드 시작..."
  if npm run build; then
    ok "빌드 완료 → dist/ 폴더 생성됨"
  else
    fail "빌드 실패. 오류 메시지를 확인하세요."
    return 1
  fi
}

do_deploy() {
  step "Cloudflare Pages 배포 시작..."
  check_wrangler
  if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo -e "${YELLOW}  dist/ 폴더가 없습니다. 빌드를 먼저 실행합니다.${RESET}"
    do_build || return 1
  fi
  if wrangler pages deploy dist; then
    ok "Cloudflare Pages 배포 완료!"
    echo -e "  ${CYAN}→ Cloudflare Dashboard에서 배포 상태를 확인하세요.${RESET}"
  else
    fail "배포 실패. wrangler 로그인 상태를 확인하세요 (메뉴 7번)."
    return 1
  fi
}

do_db_migrate_remote() {
  check_wrangler
  echo ""
  echo -e "${YELLOW}  [원격 D1 마이그레이션]${RESET}"
  echo -e "  아래 마이그레이션 파일을 순서대로 적용합니다:"
  echo ""

  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "$SCRIPT_DIR/migrations" -name "*.sql" ! -name "seed.sql" -print0 | sort -z)

  if [ ${#files[@]} -eq 0 ]; then
    echo -e "${YELLOW}  적용할 마이그레이션 파일이 없습니다.${RESET}"
    return 0
  fi

  for f in "${files[@]}"; do
    echo -e "  • $(basename "$f")"
  done
  echo ""
  read -rp "  원격 D1 DB에 적용하시겠습니까? (y/N): " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    for f in "${files[@]}"; do
      step "$(basename "$f") 적용 중..."
      if wrangler d1 execute cha-bio-db --remote --file="$f"; then
        ok "$(basename "$f") 완료"
      else
        fail "$(basename "$f") 실패"
        echo -e "${YELLOW}  이미 적용된 마이그레이션이라면 무시해도 됩니다.${RESET}"
      fi
    done
    ok "원격 DB 마이그레이션 완료"
  else
    echo -e "  취소했습니다."
  fi
}

do_db_migrate_local() {
  check_wrangler
  echo ""
  echo -e "${YELLOW}  [로컬 D1 마이그레이션 (개발용)]${RESET}"

  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "$SCRIPT_DIR/migrations" -name "*.sql" ! -name "seed.sql" -print0 | sort -z)

  if [ ${#files[@]} -eq 0 ]; then
    echo -e "${YELLOW}  적용할 마이그레이션 파일이 없습니다.${RESET}"
    return 0
  fi

  for f in "${files[@]}"; do
    step "$(basename "$f") 로컬 적용 중..."
    if wrangler d1 execute cha-bio-db --local --file="$f"; then
      ok "$(basename "$f") 완료"
    else
      fail "$(basename "$f") 실패 (이미 적용된 경우 무시 가능)"
    fi
  done
  ok "로컬 DB 마이그레이션 완료"
}

do_full_deploy() {
  echo -e "${BOLD}  [전체 배포: 빌드 → Pages 배포 → 원격 DB 마이그레이션]${RESET}"
  echo ""
  read -rp "  전체 배포를 진행하시겠습니까? (y/N): " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { echo "  취소했습니다."; return 0; }

  do_build       || return 1
  do_deploy      || return 1
  do_db_migrate_remote
  echo ""
  ok "==== 전체 배포 완료 ===="
}

do_dev_server() {
  check_node
  check_wrangler
  echo ""
  echo -e "${YELLOW}  [로컬 개발 서버]${RESET}"
  echo -e "  • 프론트엔드: http://localhost:5173"
  echo -e "  • API (Pages Functions): wrangler pages dev"
  echo -e "  • 종료: Ctrl+C"
  echo ""
  echo -e "  ${BOLD}어떤 서버를 시작할까요?${RESET}"
  echo -e "  ${GREEN}1${RESET}) 프론트엔드만 (Vite, 빠름)"
  echo -e "  ${GREEN}2${RESET}) 전체 개발 서버 (Vite + Wrangler Pages, API 포함)"
  echo ""
  read -rp "  선택 (1/2): " devchoice
  case "$devchoice" in
    1) npm run dev:front ;;
    2)
      step "Vite 빌드 후 Wrangler Pages 개발 서버 시작..."
      npm run build -- --watch &
      wrangler pages dev dist --d1 DB=cha-bio-db --compatibility-date=2024-09-23
      ;;
    *) echo "  취소했습니다." ;;
  esac
}

do_check_login() {
  check_wrangler
  echo ""
  step "Wrangler 로그인 상태 확인..."
  wrangler whoami
  echo ""
  echo -e "  ${YELLOW}로그인이 필요한 경우: ${BOLD}wrangler login${RESET} 을 실행하세요."
}

# ── 메인 루프 ──────────────────────────────────────────────
print_header

while true; do
  print_menu
  read -rp "  번호를 입력하세요 → " choice
  echo ""

  case "$choice" in
    1) do_build ;;
    2) do_deploy ;;
    3) do_db_migrate_remote ;;
    4) do_db_migrate_local ;;
    5) do_full_deploy ;;
    6) do_dev_server ;;
    7) do_check_login ;;
    0)
      echo -e "${CYAN}  종료합니다.${RESET}"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}  올바른 번호를 입력하세요 (0~7).${RESET}"
      ;;
  esac

  echo ""
  read -rp "  메뉴로 돌아가려면 Enter를 누르세요..." _
  print_header
done
