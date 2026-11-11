@echo off
cd /d "%~dp0"
if not exist "data\first-login.txt" (
  echo Hay mo Mo-SafeVoice.cmd truoc de khoi tao tai khoan.
  pause
  exit /b 1
)
notepad "data\first-login.txt"
