---
quick_id: 260713-ny6
slug: machine-role-doc
status: complete
date: 2026-07-13
branch: production
---

# SUMMARY — MACBOOK-SETUP.md 머신 역할 분리 + panel-agent 백업 반영

## 한 일
`MACBOOK-SETUP.md` 문서 단일 파일 편집 (코드 변경 0, 배포 0):

1. **§2 코드 내려받기** — `gh repo clone Yoon-sabujag/panel-agent` 추가 (맥북은 리뷰 전용 명시)
2. **§4 폴더 준비** — `gsd-tools` PATH 심볼릭 링크 단계 추가 (`~/.local/bin/gsd-tools` → `~/.claude/get-shit-done/bin/gsd-tools.cjs`)
3. **신규 "맥미니 Claude 창의 역할"** — 개발 콘솔 은퇴, 맥미니의 stale 폴더에서 편집/wrangler/D1 금지
4. **신규 "panel-agent 백업 저장소"** — `Yoon-sabujag/panel-agent` 비공개(`cb9da95`, master), 🔒 `config.env`(AGENT_KEY) 커밋 금지, 수정 시 push 의무
5. **신규 "★에이전트 ↔ 앱 짝 변경 순서"** — 앱(맥북) 먼저 → 에이전트(맥미니). 단독 수정(임계값/크롭/로깅)만 맥미니 단독 가능

## 발견 / 부수 수정
- **`gsd-tools` 가 맥북 PATH 에 없었음** → GSD 워크플로가 `command not found` 로 실패. `~/.local/bin` 심볼릭 링크로 해결 후 문서에 단계 추가. (맥미니 tgz 이식이 `.claude/` 는 옮겼지만 PATH 상 shim 은 안 옮겨진 케이스.)

## 검증
- 4개 신규 문구 grep 존재 확인 (130행 `config.env` 경고 포함)
- 문서에 AGENT_KEY 실제 값 없음 (`grep -E "AGENT_KEY *= *[a-z0-9]{6,}|db553c"` → 0건)
- 변경 파일 = `MACBOOK-SETUP.md` + `.planning/quick/260713-ny6-*` 뿐. 앱 코드·마이그레이션 무변경, 배포 없음
- worktree 미사용 (production 브랜치 직접 — `feedback_worktree_isolation_bases_off_main`)

## 관련
- 메모리 `project_machine_role_split.md` 신규 (같은 내용 박제)
- panel-agent 백업 자체는 맥미니 콘솔에서 수행 (`cb9da95`), 맥북에서 clone + 히스토리 비밀키 검사 PASS
