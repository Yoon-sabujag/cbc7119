# Phase 1: Deployment & Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-deployment-infrastructure
**Areas discussed:** 504 진단 방향, 배포 파이프라인, DB 마이그레이션 전략, PWA 캐시 정책

---

## 504 진단 방향

| Option | Description | Selected |
|--------|-------------|----------|
| 배포 시점 | wrangler pages deploy 실행 중 504 발생 (업로드 실패) | ✓ |
| 런타임 | 배포는 되는데 앱 접속 시 504 발생 | |
| 모르겠음 | 정확히 어느 시점인지 확인 필요 | |

**User's choice:** 배포 시점
**Notes:** Cloudflare API 장애 때만 간헐적 발생

| Option | Description | Selected |
|--------|-------------|----------|
| 재시도 먼저 | Cloudflare 장애 복구 후 바로 재배포 시도 | |
| 번들 최적화 후 | manualChunks 설정 등 번들 크기 줄인 후 배포 | ✓ |
| 둘 다 | 재시도하고, 성공해도 번들 최적화까지 | |

**User's choice:** 번들 최적화 후

---

## 배포 파이프라인

| Option | Description | Selected |
|--------|-------------|----------|
| deploy.sh 유지 | 현재 인터랙티브 메뉴 그대로 사용 | |
| GitHub Actions 추가 | push 시 자동 배포 (CI/CD) | ✓ |
| wrangler 직접 | deploy.sh 없이 wrangler pages deploy 직접 실행 | |
| You decide | Claude 재량으로 판단 | |

**User's choice:** GitHub Actions 추가

| Option | Description | Selected |
|--------|-------------|----------|
| main push만 | main 브랜치에 push 시만 자동 배포 | |
| PR merge + main | PR 머지 시 + main 직접 push 시 | ✓ |
| Manual only | workflow_dispatch로 수동 실행만 | |

**User's choice:** PR merge + main

---

## DB 마이그레이션 전략

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 유지 | 수동 SQL 파일 실행 (wrangler d1 execute --file) | |
| wrangler migrations | wrangler d1 migrations 공식 명령어 전환 | |
| CI에 통합 | GitHub Actions에서 자동 마이그레이션 실행 | ✓ |
| You decide | Claude 재량 | |

**User's choice:** CI에 통합

---

## PWA 캐시 정책

| Option | Description | Selected |
|--------|-------------|----------|
| 업데이트 알림 추가 | 앱 업데이트 시 사용자에게 새로고침 안내 표시 | |
| 자동 새로고침 | skipWaiting + clientsClaim으로 자동 적용 (현재 설정) | ✓ |
| You decide | Claude 재량으로 최적 설정 | |

**User's choice:** 자동 새로고침 (현재 설정 유지)

---

## Claude's Discretion

- Vite manualChunks 분할 전략
- GitHub Actions workflow 파일 구조
- D1 마이그레이션 CI 실행 방식

## Deferred Ideas

None
