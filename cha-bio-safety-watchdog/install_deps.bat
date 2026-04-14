@echo off
chcp 65001 >nul
echo ========================================
echo   식단표 자동 등록 - 준비
echo ========================================
echo.
echo 식단표 자동 등록 기능을 사용하려면
echo pdftotext.exe 파일이 필요합니다.
echo.
echo 1. 아래 사이트에서 "Xpdf command line tools"
echo    Windows 32-bit 버전을 다운로드하세요:
echo.
echo    https://www.xpdfreader.com/download.html
echo.
echo 2. 다운로드한 zip 파일 압축 해제
echo.
echo 3. bin32\pdftotext.exe 파일을
echo    이 bat 파일과 같은 폴더에 복사하세요.
echo.
echo 4. watchdog 설정에서 "식단표 자동 등록" 체크!
echo.
echo ========================================
echo.
if exist "%~dp0pdftotext.exe" (
    echo [OK] pdftotext.exe 가 이미 설치되어 있습니다!
) else (
    echo [!] pdftotext.exe 가 아직 없습니다.
    echo     위 안내대로 다운로드해주세요.
)
echo.
pause
