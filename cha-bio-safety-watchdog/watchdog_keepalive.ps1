# CHA Bio Watchdog Keepalive
# Task Scheduler calls every 2 min. NoOp if running, restart if dead.
#
# NOTE (2026-05-17): watchdog 재시작 경로를 .bat 경유에서 VBS launcher 경유로 교체.
# Start-Process $batFile -WindowStyle Hidden 은 cmd.exe 콘솔 호스트가 일시 노출되는
# 부차 깜빡임을 유발했음. wscript.exe + Run-Hidden.vbs 는 console 을 만들지 않음.

$scriptDir = $PSScriptRoot
$vbsLauncher = Join-Path $scriptDir "Run-Hidden.vbs"
$watchdog = Join-Path $scriptDir "watchdog.ps1"

try {
    $existing = Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction Stop |
        Where-Object { $_.CommandLine -like "*watchdog.ps1*" } |
        Select-Object -First 1
} catch {
    return
}

if ($existing) { return }

if ((Test-Path $vbsLauncher) -and (Test-Path $watchdog)) {
    # wscript.exe 는 console 을 생성하지 않으므로 깜빡임 없음
    Start-Process -FilePath "wscript.exe" -ArgumentList @("`"$vbsLauncher`"", "`"$watchdog`"") -WorkingDirectory $scriptDir -WindowStyle Hidden
}
