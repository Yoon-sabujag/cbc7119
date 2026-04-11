@echo off
chcp 65001 >nul
echo CHA Bio 파일 분류 - EXE 빌드
echo =============================
echo.

pip install pyinstaller watchdog pystray Pillow

pyinstaller --onefile --noconsole --name "CHA Bio File Organizer" --icon=NONE watchdog.py

echo.
echo 빌드 완료: dist\CHA Bio File Organizer.exe
echo 이 파일을 방재팀 PC에 복사하세요.
pause
