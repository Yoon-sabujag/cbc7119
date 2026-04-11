@echo off
chcp 65001 >nul
echo CHA Bio 파일 분류 프로그램 설치
echo ================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo https://www.python.org/downloads/ 에서 Python 3.8 이상을 설치해주세요.
    pause
    exit /b 1
)

echo 필요한 패키지를 설치합니다...
pip install watchdog pystray Pillow pywin32

echo.
echo 설치 완료!
echo.
echo 실행 방법:
echo   1. pythonw watchdog.py  (Python 직접 실행)
echo   2. build_exe.bat 실행 후 dist 폴더의 exe 사용 (Python 없는 PC용)
echo.
echo 시작 프로그램 등록: register_startup.bat
pause
