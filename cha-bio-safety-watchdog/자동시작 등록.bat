@echo off
chcp 65001 >nul
set SCRIPT_DIR=%~dp0
echo CHA Bio File Organizer - Auto-start setup (Task Scheduler)
echo ============================================================
echo.

set OLD_LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\CHA Bio File Organizer.lnk
if exist "%OLD_LNK%" (
    del "%OLD_LNK%"
    echo - Old startup folder shortcut removed.
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%register_task.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FAIL] Registration failed. Check messages above.
    pause
    exit /b 1
)

echo.
pause
