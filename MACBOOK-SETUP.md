# 맥북 개발환경 셋업 — 맥미니에서 개발 작업 이전

> **역할 분리**: 맥미니 = 수신반 화면 서버(panel-agent) 전용. 개발/디자인/스테이징 = 맥북.
> **철칙**: 개발은 맥북 **한 곳에서만**. 두 컴퓨터에서 같은 코드를 동시에 만지면 꼬입니다.
> 옮긴 뒤 맥미니의 개발용 Claude 창은 은퇴시키고, 맥미니는 panel-agent만 돌립니다.

작성일: 2026-07-13 (이전 완료 — 아래 체크리스트는 이력 겸 재현용)

---

## ⚠️ 먼저 읽기 — 맥북에 옛 작업 폴더가 이미 있는 경우 (현재 상황)
이 프로젝트는 **원래 맥북(jykevin)에서 개발**하다 맥미니(jongyupyoon)로 옮겨 작업했습니다.
그래서 맥북엔 **옮기기 전 옛 버전**이 그대로 남아 있습니다:
- 옛 코드: `~/Documents/20260328`, `~/Documents/cbc7119-data`
- 옛 기억: `~/.claude/projects/-Users-jykevin-Documents-*`

그동안 **최신은 맥미니 + GitHub** 입니다. 따라서 할 일은 "새로 내려받기"가 아니라 **"맥북 옛 폴더를 최신으로 갱신"** 입니다.

**❗ 함부로 덮지 말고 — 맥북에만 남은 작업이 있는지 먼저 확인하세요.**
가장 쉬운 방법: 맥북에서 Claude Code 로그인 후 아래를 그대로 붙여넣기 👇

```
이 맥북에 예전 작업 폴더(~/Documents/20260328, ~/Documents/cbc7119-data)와
옛 ~/.claude 기억이 있어. 이건 맥미니로 개발 옮기기 전 옛날 버전이고,
그동안 맥미니에서 작업해서 GitHub이 최신이야.
맥북 옛 폴더·기억에 GitHub/맥미니에 없는 나만의 작업이 남아 있는지 먼저 전부
확인해줘 (git status, origin 에 없는 로컬 커밋, git stash, .claude 메모리 날짜 비교).
아무것도 바꾸지 말고 진단만 먼저 하고, 맥북에만 있는 게 있으면 덮지 말고 알려줘.
없으면 그때 GitHub 최신으로 안전하게 갱신하고 기억도 최신으로 바꾸자.
```

- 진단 결과 **"맥북에만 있는 것 없음"** → 기존 폴더에서 `git` 최신화 + tgz(맥미니 기억)로 덮기로 진행(Claude 가 안내). 아래 2~3번의 "새 clone"은 건너뜀.
- 진단 결과 **맥북에만 있는 작업이 있음** → 그걸 먼저 GitHub/맥미니와 합친 뒤 갱신.
- 맥북에 아무 옛것도 없다(진짜 새 컴퓨터)면 → 아래 0번부터 순서대로.

> 참고: staging(`cbc7119-data`)은 맥북 옛 폴더엔 GitHub 원격이 없었지만, 지금은 비공개 백업(`Yoon-sabujag/cbc7119-data`, 맥미니 최신)이 있습니다. 맥북 옛 staging 은 그 원격 기준으로 갱신하면 됩니다(진단에 포함).

---

## 0. 맥북에 프로그램 설치 (한 번만)
터미널(응용프로그램 > 유틸리티 > 터미널)을 열고 순서대로 붙여넣기:

```bash
# Homebrew (이미 있으면 건너뜀)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js + git + GitHub CLI
brew install node git gh

# Claude Code
npm install -g @anthropic-ai/claude-code
# (wrangler 는 프로젝트에서 npx 로 자동 실행 — 따로 설치 안 함)
```

## 1. 로그인 (한 번만, 브라우저가 뜹니다)
```bash
gh auth login          # GitHub — 본인 계정(Yoon-sabujag) 선택
claude                 # Claude Code 실행 → 본인 계정 로그인 후 종료
# Cloudflare 로그인은 2번에서 프로젝트 폴더에 들어가 npx wrangler login
```

## 2. 코드 내려받기
```bash
mkdir -p ~/Documents && cd ~/Documents

# 직원/디자인 코드 (production 브랜치 + 디자인 브랜치 모두 포함)
gh repo clone Yoon-sabujag/cbc7119 20260328

# 스테이징 코드 (GitHub 비공개 백업본)
gh repo clone Yoon-sabujag/cbc7119-data

# 수신반 에이전트 (비공개 백업본) — ★맥북에선 리뷰 전용, 실행은 맥미니에서만
gh repo clone Yoon-sabujag/panel-agent
```

## 3. 설정·기억 복사  ★제일 중요★
이 폴더를 안 옮기면 작업 방식·기억(메모리)·자동화 규칙이 달라집니다.

**압축 파일은 이미 만들어져 있습니다** — 맥미니 바탕화면 `~/Desktop/claude-config.tgz`
(맥북 계정 `jykevin` 에 맞춰 기억 폴더 이름 4개까지 이미 정리한 버전).

```bash
# 맥미니 바탕화면의 claude-config.tgz 를 AirDrop 등으로 [맥북] 홈(~)으로 옮긴 뒤:
cd ~ && tar xzf claude-config.tgz
ls ~/.claude/projects   # -Users-jykevin-Documents-... 로 보이면 정상
# (sessions / cache / tasks / shell-snapshots 등 나머지는 안 옮겨도 됨)
```

이 tgz 는 **계정 이름(jykevin)까지 이미 맞춰져 있어 폴더 rename 이 필요 없습니다** — 풀기만 하면 끝.
단, 맥북에 옛 기억(`-Users-jykevin-...`)이 이미 있으면, 맨 위 "먼저 읽기" 진단을 거친 뒤 덮으세요
(옛 기억에만 있는 게 없는지 확인 후 최신으로 교체).

## 4. 각 코드 폴더 준비
```bash
# 직원/디자인 앱 (앱은 cha-bio-safety 하위)
cd ~/Documents/20260328/cha-bio-safety && npm install && npx wrangler login

# 스테이징 앱 (앱이 루트에 있음)
cd ~/Documents/cbc7119-data && npm install

# GSD 도구 PATH 연결 (안 하면 /gsd:* 워크플로가 "gsd-tools: command not found" 로 실패)
mkdir -p ~/.local/bin && ln -sf ~/.claude/get-shit-done/bin/gsd-tools.cjs ~/.local/bin/gsd-tools
gsd-tools query init.quick   # JSON 이 나오면 정상
```

## 5. 확인
```bash
cd ~/Documents/20260328 && claude
# → 기억(메모리)·규칙이 그대로 인식되면 성공. 실제 배포는 변경이 있을 때만.
```

---

## 맥미니에 남기는 것 (건드리지 말 것)
- **`~/panel-agent/`** — 수신반 화면 서버. 캡처보드가 물리적으로 꽂혀 있어 맥북으로 못 옮김. 계속 실행.
  ```bash
  # 상태 확인
  cat ~/panel-agent/agent.pid ; tail -5 ~/panel-agent/agent.log
  # 재시작이 필요할 때만
  kill $(cat ~/panel-agent/agent.pid); sleep 2
  cd ~/panel-agent && nohup python3 agent.py >> agent.log 2>&1 & disown ; echo $! > agent.pid
  ```
- `~/Desktop/수신반-미리보기/` — panel-agent 스캐폴드(이미 panel-agent 에 통합됨). 참고용.

## 맥미니 Claude 창의 역할 (2026-07-13 확정)
**맥미니 Claude = `~/panel-agent/` 전용.** 개발용 콘솔은 은퇴 — 맥미니에 남은 옛 `~/Documents/20260328`·`cbc7119-data` 폴더는 stale 이므로 **거기서 편집·배포(wrangler)·D1 조작 금지**. 앱 개발은 전부 맥북에서.

### panel-agent 백업 저장소
- **`Yoon-sabujag/panel-agent` (비공개, branch `master`)** — 2026-07-13 백업(`cb9da95`). 그전까지 맥미니 한 대에만 존재해 유실 위험이 있었음.
- 🔒 **`config.env` 는 절대 커밋 금지** — AGENT_KEY(비밀키)가 들어 있어 유출 시 가짜 화재경보 푸시가 가능해짐. `.gitignore` 로 제외돼 있고 값을 비운 `config.env.example` 만 저장소에 있음. 로그·`snaps/`·`ocr` 바이너리·`*.bak.*` 도 제외.
- **에이전트 코드를 수정하면 맥미니에서 반드시 commit + push** 해야 백업이 최신으로 유지됨.
- 맥북 clone(`~/Documents/panel-agent`)은 **리뷰 전용**. 실행하려면 캡처보드가 필요함(맥미니).

### ★에이전트 ↔ 앱 짝 변경 순서
push-first 위치 patch, 라이브뷰 폴 주기처럼 **에이전트 수정이 앱 API·프론트 변경과 짝**으로 가는 경우가 많음. 이때 순서를 지키지 않으면 라이브뷰·경보가 깨짐:

1. **맥북** — 앱(백엔드/프론트) 먼저 설계·검증·배포 (staging → prod)
2. **맥미니** — 그다음 에이전트에 반영 + panel-agent 저장소에 push

에이전트 단독 수정(감지 임계값·OCR 크롭·로깅)은 맥미니에서 단독 진행 가능.

## 배포·작업 규칙 (옮긴 뒤에도 그대로)
- 직원 도메인 배포·브랜치 규칙 → `~/Documents/20260328/CLAUDE.md` 와 `.planning/production-sync.md`.
- 스테이징(cbc7119-data) → 별도 Cloudflare Pages/D1/R2. 맥북에서 작업 후 **GitHub 백업본에도 push** 해 동기 유지.
- 데이터/스키마/룰 변경은 staging 먼저 검증 → prod. (단, 라이브뷰처럼 staging 검증이 불가능한 건 예외.)
