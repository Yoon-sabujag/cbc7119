---
status: partial
phase: 17-push-notification-settings
source: [17-VERIFICATION.md]
started: 2026-04-07
updated: 2026-04-07
---

## Current Test

[awaiting human testing]

## Tests

### 1. 실제 푸시 알림 수신
expected: 설정에서 알림 토글 ON → 권한 허용 → 구독 저장 → cron 발화 시점(08:45 KST 또는 행사 임박)에 FCM/APNs 경유로 기기에 푸시 수신
result: [pending]

### 2. PermBadge 상태 전환
expected: 브라우저 권한 프롬프트 수락 시 PermBadge가 "권한 미설정" → "허용됨"(녹색)으로 실시간 변경
result: [pending]

### 3. 차단 상태 토글 비활성화
expected: 브라우저 알림 차단 설정 후 SettingsPanel 진입 시 모든 알림 토글이 회색(not-allowed) 상태로 표시되고 탭 시 안내 토스트 표시
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
