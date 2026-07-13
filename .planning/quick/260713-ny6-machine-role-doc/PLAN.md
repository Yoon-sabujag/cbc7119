---
quick_id: 260713-ny6
slug: machine-role-doc
date: 2026-07-13
branch: production
worktree: false
---

# MACBOOK-SETUP.md — 머신 역할 분리 + panel-agent 백업 반영

## 배경
2026-07-13 맥미니→맥북 개발환경 이전 완료. 이전 과정에서 확정된 사항이 문서에 없음:
- panel-agent 를 `Yoon-sabujag/panel-agent` **비공개** 저장소로 백업 완료 (`cb9da95`, branch=master). 이전엔 맥미니 로컬에만 존재.
- 맥미니 Claude 창의 역할 = `~/panel-agent/` 전용 (개발 콘솔 은퇴).
- 에이전트↔앱 짝 변경 시 순서 규칙 (앱=맥북 먼저 → 에이전트=맥미니).
- `gsd-tools` 가 맥북 PATH 에 없어 GSD 워크플로 실패 → `~/.local/bin/gsd-tools` 심볼릭 링크로 해결 (셋업 문서에 없던 단계).

## 범위
문서 편집만. 코드 변경·배포·D1 조작 없음. worktree 미사용 (production 브랜치 직접 — [[feedback_worktree_isolation_bases_off_main]]).

## 작업
1. `MACBOOK-SETUP.md` §2 코드 내려받기 — panel-agent clone (리뷰 전용) 추가
2. `MACBOOK-SETUP.md` §4/§5 — gsd-tools 심볼릭 링크 단계 추가
3. `MACBOOK-SETUP.md` "맥미니에 남기는 것" — 백업 저장소 + config.env 커밋 금지 + 수정 시 push 규칙
4. 신규 섹션 "에이전트 ↔ 앱 짝 변경 순서"
5. 커밋 (atomic, docs:)

## 검증
- `grep` 로 4개 항목 문구 존재 확인
- AGENT_KEY 실제 값이 문서에 안 들어갔는지 확인
- 커밋 1건, 코드 파일 0 변경
