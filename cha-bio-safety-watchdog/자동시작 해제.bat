@echo off
chcp 65001 >nul
echo CHA Bio File Organizer - Auto-start removal
echo ============================================
echo.

schtasks /Delete /TN "CHA Bio File Organizer" /F 2>nul
if %ERRORLEVEL% EQU 0 (
    echo - Scheduled task removed.
) else (
    echo - No scheduled task found.
)

set OLD_LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\CHA Bio File Organizer.lnk
if exist "%OLD_LNK%" (
    del "%OLD_LNK%"
    echo - Startup folder shortcut removed.
)

powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='powershell.exe' OR Name='pwsh.exe'\" | Where-Object { $_.CommandLine -like '*watchdog.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
echo - Running watchdog process killed.

echo.
echo [OK] Auto-start removed.
pause
