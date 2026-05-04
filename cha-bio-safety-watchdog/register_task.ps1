# CHA Bio Watchdog - Register Scheduled Task
# Trigger: 30s after logon + every 2 min keepalive
# Settings: Hidden window, restart on failure (1 min interval x3)

$scriptDir = $PSScriptRoot
$keepalive = Join-Path $scriptDir "watchdog_keepalive.ps1"
$taskName = "CHA Bio File Organizer"

if (-not (Test-Path $keepalive)) {
    Write-Error "watchdog_keepalive.ps1 not found: $keepalive"
    exit 1
}

$user = "$env:USERDOMAIN\$env:USERNAME"

$xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>CHA Bio File Organizer auto-start with keepalive</Description>
  </RegistrationInfo>
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
      <UserId>$user</UserId>
      <Delay>PT30S</Delay>
    </LogonTrigger>
    <CalendarTrigger>
      <Repetition>
        <Interval>PT2M</Interval>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>2026-01-01T00:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>$user</UserId>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <Hidden>true</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT2M</ExecutionTimeLimit>
    <Priority>7</Priority>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>3</Count>
    </RestartOnFailure>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$keepalive"</Arguments>
    </Exec>
  </Actions>
</Task>
"@

$tmpXml = Join-Path $env:TEMP "cha-bio-task.xml"
[System.IO.File]::WriteAllText($tmpXml, $xml, [System.Text.Encoding]::Unicode)

schtasks /Delete /TN $taskName /F 2>$null | Out-Null
$result = schtasks /Create /TN $taskName /XML $tmpXml /F
Remove-Item $tmpXml -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
    Write-Error "Register failed: $result"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "[OK] Scheduled task registered." -ForegroundColor Green
Write-Host "     - Auto-start 30s after logon"
Write-Host "     - Health check every 2 min, auto-restart if dead"
Write-Host ""

schtasks /Run /TN $taskName 2>$null | Out-Null
Write-Host "[OK] First run triggered." -ForegroundColor Cyan
exit 0
