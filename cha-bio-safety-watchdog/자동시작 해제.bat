@echo off
chcp 65001 >nul
echo CHA Bio File Organizer — 자동시작 해제
echo =======================================
echo.

REM 1) 작업 스케줄러 항목 제거
schtasks /Delete /TN "CHA Bio File Organizer" /F 2>nul
if %ERRORLEVEL% EQU 0 (
    echo - 작업 스케줄러 항목 제거됨
) else (
    echo - 작업 스케줄러 항목 없음 ^(이미 없거나 등록 안 됨^)
)

REM 2) 시작 폴더 바로가기 제거 (legacy)
set OLD_LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\CHA Bio File Organizer.lnk
if exist "%OLD_LNK%" (
    del "%OLD_LNK%"
    echo - 시작 폴더 바로가기 제거됨
)

REM 3) 현재 떠있는 watchdog 프로세스 종료
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='powershell.exe' OR Name='pwsh.exe'\" | Where-Object { $_.CommandLine -like '*watchdog.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
echo - 현재 watchdog 프로세스 종료됨

echo.
echo ✅ 자동시작 해제 완료
pause
