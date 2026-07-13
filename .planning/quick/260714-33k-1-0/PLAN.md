---
quick_id: 260714-33k
slug: 1-0
date: 2026-07-14
branch: production
---

# 화재수신반 에이전트 원격 모니터링 — 1단계 백엔드 + 0단계 화면

핸드오프: `panel-agent/HANDOFF-0328-MONITORING.md` · 계약 SSOT: `panel-agent/MONITORING-SPEC.md`
(둘이 어긋나면 SPEC 이 이긴다)

## 목표
판정 로직은 한 줄도 건드리지 않고 **관측만** 추가한다. 원격에서
① 캡처보드 수신 ② R2 업로드 ③ 감지 ④ OCR 4단계의 생사와 근거를 본다.

## 치명 결함 2건 (이번에 수정)
- **C1** `location.ts` 가 `location` 키 부재를 null 로 간주해 무조건 덮어씀 →
  재시작/dedupe 경로에서 **대응자에게 표시되던 화재 위치가 지워진다.**
- **C2** `frame.ts` 가 frameKey 무관하게 `frame_updated_at` 갱신 →
  라이브 업로드가 죽은 채 화재가 나면 **낡은 화면이 "방금"으로 표시된다.**

## 범위
1단계 백엔드 8파일 + 마이그 0096 / 0단계 화면(`/panel-monitor`, admin 전용).
4단계 cron 워치독은 **범위 밖**(별도).

## 게이트
staging-first 예외를 사용자 승인으로 적용(에이전트가 prod 로만 송신).
production-sync.md 표준 절차 준수. §6.1 prod 실증이 BACKEND_V2=1 플립의 유일한 전제조건.
