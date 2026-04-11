@echo off
echo Windows 시작 프로그램에 등록합니다...

set SCRIPT_DIR=%~dp0
set SHORTCUT_NAME=CHA Bio 파일 분류
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

REM VBS로 바로가기 생성
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\create_shortcut.vbs"
echo sLinkFile = "%STARTUP_DIR%\%SHORTCUT_NAME%.lnk" >> "%TEMP%\create_shortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\create_shortcut.vbs"
echo oLink.TargetPath = "pythonw" >> "%TEMP%\create_shortcut.vbs"
echo oLink.Arguments = """%SCRIPT_DIR%watchdog.py""" >> "%TEMP%\create_shortcut.vbs"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%TEMP%\create_shortcut.vbs"
echo oLink.Description = "CHA Bio 파일 자동 분류" >> "%TEMP%\create_shortcut.vbs"
echo oLink.WindowStyle = 7 >> "%TEMP%\create_shortcut.vbs"
echo oLink.Save >> "%TEMP%\create_shortcut.vbs"

cscript //nologo "%TEMP%\create_shortcut.vbs"
del "%TEMP%\create_shortcut.vbs"

echo.
echo 등록 완료! PC를 켜면 자동으로 실행됩니다.
echo 해제하려면 시작 프로그램 폴더에서 바로가기를 삭제하세요.
pause
