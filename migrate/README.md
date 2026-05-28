# 맥 이관 (cbc7119)

Claude 메모리는 git 추적 밖이라 따로 옮겨야 함. 그것만 자동화한 스크립트 2종.

## 현재 맥에서

```
./migrate/export.sh
```

→ `~/Desktop/cbc7119-mac-migration-YYMMDD-HHMM.tgz` 생성. AirDrop/iCloud/USB 로 새 맥에 옮긴다.

## 새 맥에서

도구 먼저:

```bash
# Node + git + gh + Claude Code 설치
brew install node git gh
npm i -g wrangler
# Claude Code 는 공식 배포 채널에서
```

그 다음:

```bash
cd ~/Documents
gh auth login
gh repo clone Yoon-sabujag/cbc7119 20260328
cd 20260328
git checkout production
./migrate/import.sh ~/Desktop/cbc7119-mac-migration-YYMMDD-HHMM.tgz
```

`import.sh` 가 자동으로:
- 메모리 복원 (path 다르면 자동 rename)
- `npm install` (cha-bio-safety/)
- gh / wrangler 인증 상태 점검
- 다음 수동 단계 출력

마지막에 출력되는 □ 항목 (보통 `wrangler login` 1개) 만 처리하면 끝.

## 검증

Claude Code 실행 후 첫 메시지로:

> production-sync.md 마지막 entry 알려줘

→ "도면 마커 cp 자동생성 + 편집 모달 가드" 같은 답이 즉시 나오면 메모리 정상 로드.

## 주의

- 메모리는 외부 동기화 안 됨 — 새 맥으로 옮긴 뒤엔 한 맥에서만 작업
- archive 안에 내부 컨텍스트 (직원/시설 정보 등) 있으니 외부 공유 금지
- Windows 와치독은 별개 — 해당 머신에 `watchdog.ps1` 최신본 복사는 별도 작업
