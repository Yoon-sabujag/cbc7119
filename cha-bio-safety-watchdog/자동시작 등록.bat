@echo off
chcp 65001 >nul
set SCRIPT_DIR=%~dp0
echo CHA Bio File Organizer — 자동시작 등록 (작업 스케줄러)
echo =============================================================
echo.

REM 1) 기존 시작 폴더 바로가기 있으면 제거 (구 방식 정리)
set OLD_LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\CHA Bio File Organizer.lnk
if exist "%OLD_LNK%" (
    del "%OLD_LNK%"
    echo - 기존 시작 폴더 바로가기 제거됨 ^(중복 실행 방지^)
)

REM 2) 작업 스케줄러 등록
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%register_task.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 등록 실패. 위 메시지 확인 후 다시 시도.
    pause
    exit /b 1
)

echo.
pause
