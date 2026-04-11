@echo off
echo CHA Bio 파일 분류 프로그램 설치
echo ================================
echo.

REM Python 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo https://www.python.org/downloads/ 에서 Python 3.10 이상을 설치해주세요.
    pause
    exit /b 1
)

REM 의존성 설치
echo 필요한 패키지를 설치합니다...
pip install -r requirements.txt

echo.
echo 설치 완료!
echo.
echo 실행: python watchdog.py
echo 시작 프로그램 등록: register_startup.bat
pause
