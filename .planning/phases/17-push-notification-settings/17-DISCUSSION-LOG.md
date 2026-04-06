# Phase 17: Push Notification Settings - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 17-push-notification-settings
**Areas discussed:** iOS 호환성 대응, 알림 유형/토글 구성, 알림 발송 트리거, 구독 UX/상태 표시

---

## iOS 호환성 대응

| Option | Description | Selected |
|--------|-------------|----------|
| iOS 26+ 로 업데이트 | 현실에 맞게 타겟 변경. 푸시 알림 fallback 불필요 | ✓ |
| 기존 16.3.1+ 유지 | 보수적으로 낮은 버전 타겟 유지 | |

**User's choice:** iOS 26+ 로 업데이트
**Notes:** 사용자가 실제 iOS 26.3.1(a) 사용 중이며 26.4로 업데이트 중. 프로젝트 제약조건의 iOS 16.3.1+은 오래된 정보.

---

## 알림 유형/토글 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 3개 그대로 | 점검 미완료(마감 1h전), 미조치(매일 09:00), 승강기 D-7 | |
| 2개만 (NOTI-02, NOTI-03) | ROADMAP 요구사항 기준: 점검 일정 알림 + 미조치 이슈 알림만 | ✓ (초기) |

**User's choice:** 초기 2개 → 이후 6개로 확장
**Notes:** 사용자가 추가로 원하는 알림: 금일 점검 + 전일 미완료 + 미조치 + 교육 D-30 + 행사 15분전 + 행사 5분전. 점검 일정 알림 시간은 당일 08:45 KST. 승강기 D-7 토글은 제거.

---

## 알림 발송 트리거

| Option | Description | Selected |
|--------|-------------|----------|
| Cron Trigger (추천) | Cloudflare Workers Cron으로 매일 실행 | ✓ |
| 수동 API 호출 | 관리자가 버튼 눌러서 알림 발송 | |
| Claude에게 맡김 | 구현 방식은 알아서 결정 | |

**User's choice:** Cron Trigger — 2개 사용 (08:45 일일 + */5 행사)
**Notes:** 무료 플랜 Cron 한도 최대 5개. 현재 2개 사용으로 여유 3개.

---

## 구독 UX/상태 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 토글 ON 시 자동 구독 (추천) | 알림 토글 켜면 브라우저 권한 요청 자동 트리거 | ✓ |
| 별도 구독 버튼 | '푸시 알림 활성화' 버튼으로 구독 후 개별 토글 | |

**User's choice:** 토글 ON 시 자동 구독

### 토글 배치

| Option | Description | Selected |
|--------|-------------|----------|
| 플랫 리스트 | 모든 알림 토글 한 섹션에 평면 나열 | |
| 그룹 나누기 | 점검(일정/미완료/미조치) + 일정(행사/교육) 소그룹 구분 | ✓ |

### 상태 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 토글 상단 배지 | 섹션 상단에 허용됨/차단됨/미설정 배지 | |
| 토글 비활성화 | 권한 차단 시 토글 회색 비활성화 + 탭 시 안내 | ✓ |

---

## Claude's Discretion

- VAPID 키 생성 및 환경변수 관리 방식
- push_subscriptions 테이블 상세 스키마
- Cron Worker 내부 로직 구조
- 푸시 메시지 본문 포맷
- Service Worker push event handler 구현 상세
