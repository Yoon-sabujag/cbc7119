# CHA Bio Watchdog Keepalive
# 작업 스케줄러가 2분마다 호출. watchdog 프로세스 살아있으면 NoOp, 죽었으면 재시작.

$scriptDir = $PSScriptRoot
$batFile = Join-Path $scriptDir "CHA Bio File Organizer.bat"

# 1) 살아있는 watchdog 프로세스 찾기 (powershell.exe 명령줄에 watchdog.ps1 포함된 것)
try {
    $existing = Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction Stop |
        Where-Object { $_.CommandLine -like "*watchdog.ps1*" } |
        Select-Object -First 1
} catch {
    # CIM 실패 시 안전하게 NoOp (watchdog 살아있어도 죽이지 말기)
    return
}

if ($existing) {
    # 이미 살아있음 — 끝
    return
}

# 2) 죽었음 — 다시 시작 (숨김 창)
if (Test-Path $batFile) {
    Start-Process -FilePath $batFile -WorkingDirectory $scriptDir -WindowStyle Hidden
}
