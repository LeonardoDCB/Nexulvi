@echo off
cd /d "%~dp0"
start "Nexulvi Local Server" cmd /k node servidor-local.js
timeout /t 2 /nobreak >nul
start "Nexulvi" http://127.0.0.1:4173
