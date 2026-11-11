@echo off
setlocal
rem Double-click helper for verify-apk.ps1 (ASCII only on purpose).
rem Drag an .apk onto this file, or run: verify-apk.bat "D:\path\app.apk"

if "%~1"=="" (
  echo.
  echo  Usage: drag an APK file onto this .bat
  echo         or: verify-apk.bat "D:\path\app.apk"
  echo.
  pause
  exit /b 2
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify-apk.ps1" -Path "%~1"
set RC=%ERRORLEVEL%
echo.
if "%RC%"=="0" (
  echo  RESULT: PASS
) else (
  echo  RESULT: FAILED - do NOT install this file
)
echo.
pause
exit /b %RC%
