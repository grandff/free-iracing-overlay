@echo off
chcp 65001 >nul
echo ========================================================
echo  Free iRacing Overlay - Windows 실행 (Dev/Preview)
echo ========================================================
echo.
call npm install
call npx @tauri-apps/cli dev
pause
