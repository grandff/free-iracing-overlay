@echo off
chcp 65001 >nul
echo ========================================================
echo  Free iRacing Overlay - Windows 1-Click Build Script
echo ========================================================
echo.

echo [1/3] Node.js 및 NPM 확인 중...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다. https://nodejs.org/ 에서 Node.js v20+을 설치해 주세요.
    pause
    exit /b 1
)

echo [2/3] 의존성 설치 및 프론트엔드 빌드 중...
call npm install
if %errorlevel% neq 0 (
    echo [오류] npm install 실패
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo [오류] 프론트엔드 빌드 실패
    pause
    exit /b 1
)

echo [3/3] Tauri Windows 네이티브 인스톨러 빌드 중...
call npx @tauri-apps/cli build
if %errorlevel% neq 0 (
    echo.
    echo [오류] Tauri 빌드 실패
    echo Rust 및 C++ Build Tools가 설치되어 있는지 확인하세요:
    echo 1. Rust: https://rustup.rs/
    echo 2. Visual Studio C++ Build Tools
    pause
    exit /b 1
)

echo.
echo ========================================================
echo  [성공] Windows 설치 파일 및 실행 파일 빌드 완료!
echo  설치 파일 위치: src-tauri\target\release\bundle\nsis\
echo  단독 실행 파일: src-tauri\target\release\
echo ========================================================
pause
