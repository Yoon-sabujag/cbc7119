@echo off
chcp 65001 >nul
echo Windows 시작 프로그램에 등록합니다...

set SCRIPT_DIR=%~dp0
set SHORTCUT_NAME=CHA Bio File Organizer
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

REM exe 존재 여부 확인
if exist "%SCRIPT_DIR%dist\CHA Bio File Organizer.exe" (
    set TARGET_PATH=%SCRIPT_DIR%dist\CHA Bio File Organizer.exe
    set TARGET_ARGS=
    echo EXE 모드로 등록합니다.
) else (
    set TARGET_PATH=pythonw
    set TARGET_ARGS="%SCRIPT_DIR%watchdog.py"
    echo Python 모드로 등록합니다.
)

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\cs.vbs"
echo sLinkFile = "%STARTUP_DIR%\%SHORTCUT_NAME%.lnk" >> "%TEMP%\cs.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\cs.vbs"
echo oLink.TargetPath = "%TARGET_PATH%" >> "%TEMP%\cs.vbs"
echo oLink.Arguments = %TARGET_ARGS% >> "%TEMP%\cs.vbs"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%TEMP%\cs.vbs"
echo oLink.Description = "CHA Bio File Auto-Organizer" >> "%TEMP%\cs.vbs"
echo oLink.WindowStyle = 7 >> "%TEMP%\cs.vbs"
echo oLink.Save >> "%TEMP%\cs.vbs"

cscript //nologo "%TEMP%\cs.vbs"
del "%TEMP%\cs.vbs"

echo.
echo 등록 완료! PC를 켜면 자동으로 실행됩니다.
pause
