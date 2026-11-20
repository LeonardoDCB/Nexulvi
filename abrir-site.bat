@echo off
cd /d "%~dp0"
call npm run build
if errorlevel 1 (
  pause
  exit /b 1
)
start "Nexulvi Local Server" cmd /k npm run preview
timeout /t 2 /nobreak >nul
for /f "delims=" %%P in ('node -p "new URL(require('./site.config').siteUrl).pathname"') do start "Nexulvi" "http://127.0.0.1:4173%%P"
