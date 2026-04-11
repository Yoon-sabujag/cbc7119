@echo off
start "" /b powershell -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File "%~dp0watchdog.ps1"
exit
