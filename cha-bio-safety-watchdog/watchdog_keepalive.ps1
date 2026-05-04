# CHA Bio Watchdog Keepalive
# Task Scheduler calls every 2 min. NoOp if running, restart if dead.

$scriptDir = $PSScriptRoot
$batFile = Join-Path $scriptDir "CHA Bio File Organizer.bat"

try {
    $existing = Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction Stop |
        Where-Object { $_.CommandLine -like "*watchdog.ps1*" } |
        Select-Object -First 1
} catch {
    return
}

if ($existing) { return }

if (Test-Path $batFile) {
    Start-Process -FilePath $batFile -WorkingDirectory $scriptDir -WindowStyle Hidden
}
