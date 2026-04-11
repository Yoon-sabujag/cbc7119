@echo off
chcp 65001 >nul
set SCRIPT_DIR=%~dp0
set SHORTCUT_NAME=CHA Bio File Organizer
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set TARGET=%SCRIPT_DIR%CHA Bio File Organizer.bat

echo CHA Bio 파일 분류 — 시작 프로그램 등록
echo =========================================
echo.

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\cs.vbs"
echo sLinkFile = "%STARTUP_DIR%\%SHORTCUT_NAME%.lnk" >> "%TEMP%\cs.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\cs.vbs"
echo oLink.TargetPath = "%TARGET%" >> "%TEMP%\cs.vbs"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%TEMP%\cs.vbs"
echo oLink.Description = "CHA Bio File Auto-Organizer" >> "%TEMP%\cs.vbs"
echo oLink.WindowStyle = 7 >> "%TEMP%\cs.vbs"
echo oLink.Save >> "%TEMP%\cs.vbs"

cscript //nologo "%TEMP%\cs.vbs"
del "%TEMP%\cs.vbs"

echo.
echo 등록 완료! PC 켜면 자동 실행됩니다.
pause
