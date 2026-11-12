@echo off
setlocal
if "%~1"=="" (
  echo Usage: drag an APK onto this file, or run verify-apk.bat "D:\path\app.apk"
  pause
  exit /b 2
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify-apk.ps1" -Path "%~1"
set RC=%ERRORLEVEL%
echo.
if "%RC%"=="0" (
  echo RESULT: FILE HASH MATCH - see above for signature check status.
) else if "%RC%"=="3" (
  echo RESULT: UNVERIFIED - verification is incomplete. Do not assume this file is safe.
) else (
  echo RESULT: FAILED - do not install based on this check.
)
echo.
pause
exit /b %RC%
