@echo off
pushd "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0watchdog.ps1"
