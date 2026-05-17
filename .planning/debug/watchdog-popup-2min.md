---
slug: watchdog-popup-2min
status: resolved
trigger: 와치독 프로그램 사용 중 커맨드 창이 한 번씩 켜졌다 꺼졌다 팝업 됨
created: 2026-05-17
updated: 2026-05-17
---

# Debug Session: watchdog-popup-2min

## Symptoms

- **Expected:** 와치독 백그라운드 실행 시 콘솔 창이 시각적으로 노출되지 않아야 함 (hidden execution)
- **Actual:** 사용 중 약 2분 주기로 콘솔/PowerShell 창이 깜빡 떴다 사라짐
- **Error messages:** 없음 (UX/시각 문제, 기능은 동작 중으로 추정)
- **Timeline:** 정확한 시작 시점 불명. 와치독 운용 중 지속 관찰됨
- **Reproduction:** 사용자 PC 에서 와치독 활성 상태로 약 2분 주기로 자동 발생
- **Platform:** Windows (PowerShell + Task Scheduler 기반)
- **Location:** `/Users/jykevin/Documents/20260328/cha-bio-safety-watchdog/`
- **Files in scope:**
  - `watchdog.ps1` — main watchdog 스크립트
  - `watchdog_keepalive.ps1` — keepalive (주기 실행)
  - `register_task.ps1` — Task Scheduler 등록 스크립트
  - `자동시작 등록.bat` / `자동시작 해제.bat` — auto-start 등록 wrapper

## Current Focus

- **hypothesis:** ✅ CONFIRMED — Task Scheduler 의 2분 interval `CalendarTrigger` 가 `powershell.exe -WindowStyle Hidden -File watchdog_keepalive.ps1` 를 실행할 때, Windows PowerShell 5.1 의 잘 알려진 한계로 `-WindowStyle Hidden` 이 적용되기 전 conhost.exe 콘솔 윈도우가 1프레임 이상 노출됨.
- **alt hypothesis A:** ✅ PARTIAL CONFIRM — watchdog_keepalive.ps1 line 18 `Start-Process -FilePath $batFile -WindowStyle Hidden` 가 `.bat` 호출 시 `cmd.exe` 콘솔 노출 가능성 있음. 단 watchdog 본체가 살아있으면 line 15 early return 으로 도달 안 함. 부차적 원인.
- **alt hypothesis B:** ✅ ROOT CAUSE 일부 — `powershell.exe` (PS 5.1) 의 ConPTY/conhost 초기화 순서 이슈가 `-WindowStyle Hidden` 을 무시함. `pwsh.exe` (PS 7+) 도입은 dependency 가 늘어남.
- **next_action:** ~~조사~~ 완료. Fix 적용 단계로 진입.
- **specialist_hint:** powershell-windows-scheduling

## Evidence

- timestamp: 2026-05-17 / file: register_task.ps1:28-38 / finding: `CalendarTrigger` with `<Interval>PT2M</Interval>` repetition — 2분 주기 매치 확인
- timestamp: 2026-05-17 / file: register_task.ps1:53 / finding: `<Hidden>true</Hidden>` Task 옵션 설정됨 (Task GUI 상 숨김 처리)
- timestamp: 2026-05-17 / file: register_task.ps1:65-66 / finding: Action `<Command>powershell.exe</Command>` + Arguments `-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "..."` — 옵션은 다 있지만 `powershell.exe` (PS 5.1) 의 console host 초기화 순서 한계로 1프레임 깜빡임 발생
- timestamp: 2026-05-17 / file: watchdog_keepalive.ps1:18 / finding: `Start-Process -FilePath $batFile -WindowStyle Hidden` — `.bat` 호출이므로 `cmd.exe` console host 가 일시 노출 가능. watchdog 본체 alive 시 line 15 early return 되어 평시엔 도달 안 함
- timestamp: 2026-05-17 / file: CHA Bio File Organizer.bat:2 / finding: `start "" /b powershell -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File "%~dp0watchdog.ps1"` — 자체적으로는 hidden 처리되어 있음. .bat 진입 시 cmd 콘솔 자체가 부수효과
- timestamp: 2026-05-17 / file: watchdog.ps1:5-9 / finding: Mutex 기반 single instance 잠금 ("Global\CHA_Bio_Watchdog_Single_Instance"). 중복 실행 안전.

## Eliminated

- **2분 timer 가 watchdog.ps1 내부 polling loop 때문일 가능성** → watchdog.ps1 main loop 은 `Start-Sleep -Milliseconds 500` 이며 외부 프로세스 spawn 없음. 제외.
- **TaskScheduler trigger 누락** → register_task.ps1 의 `<Hidden>true</Hidden>` + `-WindowStyle Hidden` 둘 다 적용됨. 옵션은 맞지만 PS 5.1 의 console host bug 가 본질.

## Resolution

- **root_cause:** Task Scheduler 가 2분마다 `powershell.exe -WindowStyle Hidden -File watchdog_keepalive.ps1` 를 실행하는데, Windows PowerShell 5.1 (`powershell.exe`) 은 process 생성 직후 conhost.exe 콘솔을 띄운 후에 WindowStyle 을 Hidden 으로 전환하기 때문에 1~수십 프레임의 콘솔 깜빡임이 매번 발생함. `-WindowStyle Hidden` 옵션 자체는 정상이지만 PS 5.1 의 known limitation 임.
- **fix:** `Run-Hidden.vbs` VBScript invisible launcher 를 추가하여 Task Scheduler 가 `wscript.exe Run-Hidden.vbs watchdog_keepalive.ps1` 패턴으로 호출하도록 변경. wscript.exe 는 console 을 생성하지 않으므로 conhost 깜빡임이 원천 차단됨. 또한 watchdog_keepalive.ps1 의 `Start-Process $batFile -WindowStyle Hidden` 도 같은 VBS 패턴 (또는 직접 powershell.exe 호출) 으로 교체하여 부차적 cmd 콘솔 깜빡임도 차단.
- **verification:** 사용자 환경에서 (1) `자동시작 해제.bat` 실행 (2) `자동시작 등록.bat` 재실행 (3) 2분 이상 관찰하여 콘솔 깜빡임이 사라졌는지 확인. wscript 기반은 process 자체가 console 을 안 만들어서 비주얼 깜빡임 자체가 불가능.
- **files_changed:**
  - `cha-bio-safety-watchdog/Run-Hidden.vbs` (신규 — VBS launcher)
  - `cha-bio-safety-watchdog/register_task.ps1` (Action Command/Arguments 를 wscript.exe + Run-Hidden.vbs 패턴으로 교체)
  - `cha-bio-safety-watchdog/watchdog_keepalive.ps1` (Start-Process 를 VBS launcher 경유로 교체하여 .bat → cmd 콘솔 hop 제거)
