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

echo [1/8] Installing dependencies...
call npm install

echo.
echo [2/8] Installing Capacitor dependencies...
call npm install @capacitor/core @capacitor/cli @capacitor/android --save

echo.
echo [3/8] Extracting sprites...
if exist "public\sprites.zip" (
    if not exist "public\sprites" mkdir "public\sprites"
    echo Extracting sprites.zip to public\sprites...
    powershell -command "Expand-Archive -Path 'public\sprites.zip' -DestinationPath 'public\sprites' -Force"
    echo Sprites extracted successfully!
) else (
    echo WARNING: sprites.zip not found in public folder!
    echo The app will fall back to online sprites.
)

echo.
echo [4/8] Building production version...
call npm run build

echo.
echo [5/8] Initializing Capacitor (if not already done)...
if not exist "capacitor.config.ts" (
    call npx cap init "StudyMon Dex" "app.lovable.studymondex" --web-dir dist
)

echo.
echo [6/8] Adding Android platform...
if not exist "android" (
    call npx cap add android
)

echo.
echo [7/8] Syncing to Android...
call npx cap sync android

echo.
echo [8/8] Copying assets to Android...
if exist "dist\sprites" (
    echo Copying sprites to Android assets...
    xcopy /E /I /Y "dist\sprites" "android\app\src\main\assets\public\sprites"
)
if exist "dist\backgrounds" (
    echo Copying backgrounds to Android assets...
    xcopy /E /I /Y "dist\backgrounds" "android\app\src\main\assets\public\backgrounds"
)

echo.
echo ==========================================
echo   BUILD COMPLETE!
echo ==========================================
echo.
echo IMPORTANT: Make sure you have extracted sprites.zip
echo before building. The app uses local sprites for
echo fully offline functionality.
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
