---
status: resolved
phase: 17-push-notification-settings
source: [17-VERIFICATION.md]
started: 2026-04-07
updated: 2026-04-07
---

## Current Test

[all tests passed]

## Tests

### 1. 실제 푸시 알림 수신
expected: 설정에서 알림 토글 ON → 권한 허용 → 구독 저장 → cron 발화 시점(08:45 KST 또는 행사 임박)에 FCM/APNs 경유로 기기에 푸시 수신
result: passed
note: 수동으로 cron worker fetch handler 추가 → daily cron 트리거 → "오늘의 점검 일정" 푸시 iOS 디바이스(web.push.apple.com endpoint)에 정상 수신 확인. 이후 fetch handler 제거하고 재배포.

### 2. PermBadge 상태 전환
expected: 브라우저 권한 프롬프트 수락 시 PermBadge가 "권한 미설정" → "허용됨"(녹색)으로 실시간 변경
result: passed

### 3. 차단 상태 토글 비활성화
expected: 브라우저 알림 차단 설정 후 SettingsPanel 진입 시 모든 알림 토글이 회색(not-allowed) 상태로 표시되고 탭 시 안내 토스트 표시
result: passed

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
