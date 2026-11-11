@echo off
cd /d "%~dp0"
echo SafeVoice MVP: http://127.0.0.1:4178
echo Requires Node.js 24+. Synthetic data only.
echo First login: data\first-login.txt (generated on first start).
echo Keep this window open while using SafeVoice. Press Ctrl+C to stop.
node server.mjs
pause
