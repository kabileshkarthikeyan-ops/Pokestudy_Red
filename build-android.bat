@echo off
echo ==========================================
echo   StudyMon Dex - Android APK Builder
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo [1/6] Installing dependencies...
call npm install

echo.
echo [2/6] Installing Capacitor dependencies...
call npm install @capacitor/core @capacitor/cli @capacitor/android --save

echo.
echo [3/6] Building production version...
call npm run build

echo.
echo [4/6] Initializing Capacitor (if not already done)...
if not exist "capacitor.config.ts" (
    call npx cap init "StudyMon Dex" "app.lovable.studymondex" --web-dir dist
)

echo.
echo [5/6] Adding Android platform...
if not exist "android" (
    call npx cap add android
)

echo.
echo [6/6] Syncing to Android...
call npx cap sync android

echo.
echo ==========================================
echo   BUILD COMPLETE!
echo ==========================================
echo.
echo To open in Android Studio:
echo   npx cap open android
echo.
echo To run on connected device:
echo   npx cap run android
echo.
echo Your APK will be in:
echo   android/app/build/outputs/apk/
echo.
echo NOTE: For a signed release APK, open Android Studio
echo       and go to Build ^> Generate Signed Bundle/APK
echo.
pause
