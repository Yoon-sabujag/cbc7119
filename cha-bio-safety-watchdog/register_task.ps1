# CHA Bio Watchdog — 작업 스케줄러 등록
# 트리거: 로그온 30초 후 + 매 2분마다 keepalive 호출
# Settings: 실패시 1분 후 재시도 (최대 3회), 숨김창

$scriptDir = $PSScriptRoot
$keepalive = Join-Path $scriptDir "watchdog_keepalive.ps1"
$taskName = "CHA Bio File Organizer"

if (-not (Test-Path $keepalive)) {
    Write-Error "watchdog_keepalive.ps1 가 없습니다: $keepalive"
    exit 1
}

$user = "$env:USERDOMAIN\$env:USERNAME"

# XML 직접 생성 — 무한 반복 (Duration 생략) 은 cmdlet 으로 표현 어려움
$xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>CHA Bio File Organizer 자동시작 + keepalive</Description>
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

# 기존 작업 있으면 삭제 후 재등록
schtasks /Delete /TN $taskName /F 2>$null | Out-Null
$result = schtasks /Create /TN $taskName /XML $tmpXml /F
Remove-Item $tmpXml -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
    Write-Error "작업 등록 실패: $result"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "✅ 작업 스케줄러 등록 완료" -ForegroundColor Green
Write-Host "   - PC 시작 + 로그인 30초 후 자동 실행"
Write-Host "   - 매 2분마다 살아있는지 확인, 죽었으면 자동 재시작"
Write-Host ""

# 즉시 첫 실행
Start-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
Write-Host "지금 즉시 watchdog 첫 실행 trigger 됨." -ForegroundColor Cyan
