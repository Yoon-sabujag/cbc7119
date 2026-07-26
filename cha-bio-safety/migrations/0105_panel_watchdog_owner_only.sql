-- 0105_panel_watchdog_owner_only.sql
-- 워치독 푸시 수신자 = 프로그램 담당자(윤종엽 2022051052) 단독 (2026-07-27 담당자 지시).
-- 석현민 플래그 해제 — 화면 열람은 role='admin' 게이트(§5)로 계속 가능하고 **발송만** 제외된다.
-- 같은 지시로 워커의 폴백(구독 전멸 시 전 직원 확장 발송)도 폐기됨 — 담당자 외 발송 금지.
--
-- 이관 절차(퇴사 등으로 담당자 변경 시): 아래 두 줄을 D1 에 실행하면 끝 — 코드 재배포 불필요.
--   UPDATE staff SET panel_watchdog = 1 WHERE id = '<새 담당자 사번>';
--   UPDATE staff SET panel_watchdog = 0 WHERE id = '2022051052';

UPDATE staff SET panel_watchdog = 0 WHERE id = '2018042451';  -- 석현민
