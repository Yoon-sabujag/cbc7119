# 맥북 개발환경 셋업 — 맥미니에서 개발 작업 이전

> **역할 분리**: 맥미니 = 수신반 화면 서버(panel-agent) 전용. 개발/디자인/스테이징 = 맥북.
> **철칙**: 개발은 맥북 **한 곳에서만**. 두 컴퓨터에서 같은 코드를 동시에 만지면 꼬입니다.
> 옮긴 뒤 맥미니의 개발용 Claude 창은 은퇴시키고, 맥미니는 panel-agent만 돌립니다.

작성일: 2026-07-13

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
```

## 3. 설정·기억 복사  ★제일 중요★
이 폴더를 안 옮기면 작업 방식·기억(메모리)·자동화 규칙이 달라집니다.

```bash
# [맥미니] 터미널에서 압축:
cd ~
tar czf ~/Desktop/claude-config.tgz \
  .claude/settings.json .claude/hooks .claude/skills .claude/agents \
  .claude/plugins .claude/get-shit-done .claude/projects

# → 만들어진 ~/Desktop/claude-config.tgz 를 AirDrop 등으로 [맥북] 홈으로 옮긴 뒤:
cd ~ && tar xzf ~/Desktop/claude-config.tgz
# (sessions / cache / tasks / shell-snapshots 등 나머지는 안 옮겨도 됨)
```

## 3-1. ★ 기억 폴더 이름 맞추기 (맥북 계정이 다르므로 필수)
맥미니 계정은 `jongyupyoon`, **맥북 계정은 `jykevin`** 이라 기억(메모리)이 연결된 폴더 경로가 다릅니다.
위 tgz 를 푼 뒤, 폴더 이름을 맥북 경로에 맞춰 바꿉니다:
```bash
cd ~/.claude/projects
mv -- "-Users-jongyupyoon-Documents-20260328"     "-Users-jykevin-Documents-20260328"     2>/dev/null
mv -- "-Users-jongyupyoon-Documents-cbc7119-data" "-Users-jykevin-Documents-cbc7119-data" 2>/dev/null
ls   # 바뀐 이름 확인 (-Users-jykevin-... 두 개 보이면 성공)
```
→ 이러면 맥북에서 `~/Documents/20260328` 에 들어갔을 때 기억이 자동 연결됩니다.
**코드는 반드시 아래 경로 그대로** 두세요(이래야 폴더 이름과 매칭): `~/Documents/20260328`, `~/Documents/cbc7119-data`.
(맥북에 예전 `-Users-jykevin-...` 폴더가 이미 있다면 덮어쓰기 전에 알려주세요 — 최신 것과 합쳐야 합니다.)

## 4. 각 코드 폴더 준비
```bash
# 직원/디자인 앱 (앱은 cha-bio-safety 하위)
cd ~/Documents/20260328/cha-bio-safety && npm install && npx wrangler login

# 스테이징 앱 (앱이 루트에 있음)
cd ~/Documents/cbc7119-data && npm install
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

## 배포·작업 규칙 (옮긴 뒤에도 그대로)
- 직원 도메인 배포·브랜치 규칙 → `~/Documents/20260328/CLAUDE.md` 와 `.planning/production-sync.md`.
- 스테이징(cbc7119-data) → 별도 Cloudflare Pages/D1/R2. 맥북에서 작업 후 **GitHub 백업본에도 push** 해 동기 유지.
- 데이터/스키마/룰 변경은 staging 먼저 검증 → prod. (단, 라이브뷰처럼 staging 검증이 불가능한 건 예외.)
