# CHA Bio Complex - Download File Auto-Organizer
# Windows 7+ (PowerShell 2.0+ / .NET 3.5+)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$script:WEB_APP_URL = "https://cbc7119.pages.dev"
$script:CONFIG_PATH = Join-Path $env:USERPROFILE ".cha-bio-watchdog\config.json"
$script:watcher = $null
$script:notifyIcon = $null

# ── File Patterns ───────────────────────────────────────
$script:FILE_PATTERNS = @(
    @{ key="inspection_zip";      label="점검일지 종합";           pattern='^(\d{4})년도 점검일지 종합 \((\d{2})월 업데이트\)\.zip$';           yearG=1; monthG=2 }
    @{ key="div_inspection";      label="DIV 점검표";              pattern='^(\d{4})년도_DIV점검표_.+\.xlsx$';                               yearG=1; monthG=0 }
    @{ key="equipment_inspection";label="장비별 점검일지";          pattern='^(\d{4})년도_(.+)_점검일지\.xlsx$';                              yearG=1; monthG=0 }
    @{ key="pump_inspection";     label="소방펌프 점검일지";        pattern='^(\d{4})년도_소방펌프_점검일지\.xlsx$';                           yearG=1; monthG=0 }
    @{ key="shift_schedule";      label="근무표";                  pattern='^(\d{4})년_(\d{1,2})월_근무표\.xlsx$';                            yearG=1; monthG=2 }
    @{ key="daily_report_single"; label="일일업무일지(일별)";       pattern='^(\d{1,2})월(\d{2})일 방재업무일지\.xlsx$';                       yearG=0; monthG=1 }
    @{ key="daily_report_monthly";label="일일업무일지(월별)";       pattern='^일일업무일지\((\d{2})월\)\.xlsx$';                               yearG=0; monthG=1 }
    @{ key="work_log";            label="업무수행기록표";           pattern='^소방안전관리자_업무수행기록표_(\d{4})년_(\d{1,2})월\.xlsx$';       yearG=1; monthG=2 }
    @{ key="leave_request";       label="휴가신청서";              pattern='^휴가신청서_.+_\d{8}\.xlsx$';                                    yearG=0; monthG=0 }
    @{ key="annual_plan";         label="연간 업무 추진 계획";      pattern='^(\d{4})년 연간 업무 추진 계획\.xlsx$';                           yearG=1; monthG=0 }
    @{ key="monthly_plan";        label="월간 중요업무추진계획";     pattern='^(\d{4})년_(\d{1,2})월_중요업무추진계획\(방재\)\.xlsx$';           yearG=1; monthG=2 }
    @{ key="qr_code";             label="QR 코드";                pattern='^.+_(?:점검용|점검확인용)_QR\.pdf$';                              yearG=0; monthG=0 }
    @{ key="remediation_report";  label="조치보고서";              pattern='^조치보고서_.+_\d{8}\.html$';                                    yearG=0; monthG=0 }
    @{ key="legal_findings";      label="지적사항";                pattern='^지적사항_.+\.zip$';                                             yearG=0; monthG=0 }
)

# ── Config ──────────────────────────────────────────────
function Load-Config {
    if (Test-Path $script:CONFIG_PATH) {
        $raw = [System.IO.File]::ReadAllText($script:CONFIG_PATH, [System.Text.Encoding]::UTF8)
        return (ConvertFrom-Json $raw)
    }
    $default = @{
        download_folder = Join-Path $env:USERPROFILE "Downloads"
        open_webapp_on_start = $true
        rules = @{}
    }
    return (New-Object PSObject -Property $default)
}

function Save-Config($cfg) {
    $dir = Split-Path $script:CONFIG_PATH
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $json = ConvertTo-Json $cfg -Depth 4
    [System.IO.File]::WriteAllText($script:CONFIG_PATH, $json, [System.Text.Encoding]::UTF8)
}

# ── Open Chrome ─────────────────────────────────────────
function Open-WebApp {
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    foreach ($p in $chromePaths) {
        if (Test-Path $p) {
            Start-Process $p -ArgumentList $script:WEB_APP_URL
            return
        }
    }
    # Chrome not found, try default browser
    Start-Process $script:WEB_APP_URL
}

# ── File Move ───────────────────────────────────────────
function Move-MatchedFile($filePath, $destBase, $year, $month) {
    $now = Get-Date
    if (-not $year) { $year = $now.Year.ToString() }
    if (-not $month) { $month = $now.Month.ToString().PadLeft(2, '0') }

    $yearFolder = $year + [char]0xB144        # 년
    $monthFolder = $month + [char]0xC6D4      # 월
    $destDir = Join-Path $destBase (Join-Path $yearFolder $monthFolder)
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

    $destFile = Join-Path $destDir (Split-Path $filePath -Leaf)
    if (Test-Path $destFile) { Remove-Item $destFile -Force }

    Start-Sleep -Milliseconds 500
    Move-Item -Path $filePath -Destination $destFile -Force
}

# ── Process File ────────────────────────────────────────
function Process-File($filePath, $cfg) {
    $fileName = Split-Path $filePath -Leaf
    if ($fileName -match '\.(crdownload|tmp|part)$') { return }

    $rules = $cfg.rules
    if (-not $rules) { return }

    foreach ($pat in $script:FILE_PATTERNS) {
        if ($fileName -match $pat.pattern) {
            $key = $pat.key
            $dest = $null
            if ($rules.PSObject.Properties[$key]) {
                $dest = $rules.$key
            }
            if (-not $dest) { continue }

            $year = $null; $month = $null
            if ($pat.yearG -gt 0 -and $Matches[$pat.yearG]) { $year = $Matches[$pat.yearG] }
            if ($pat.monthG -gt 0 -and $Matches[$pat.monthG]) { $month = $Matches[$pat.monthG].PadLeft(2, '0') }

            # Wait for download complete
            $prevSize = -1
            for ($i = 0; $i -lt 15; $i++) {
                Start-Sleep -Milliseconds 500
                if (-not (Test-Path $filePath)) { return }
                $curSize = (Get-Item $filePath).Length
                if ($curSize -eq $prevSize -and $curSize -gt 0) { break }
                $prevSize = $curSize
            }

            try {
                Move-MatchedFile $filePath $dest $year $month
                Show-Balloon "$fileName" ("이동 완료: " + $dest)
            } catch {}
            return
        }
    }
}

# ── Balloon ─────────────────────────────────────────────
function Show-Balloon($title, $text) {
    if ($script:notifyIcon) {
        $script:notifyIcon.BalloonTipTitle = $title
        $script:notifyIcon.BalloonTipText = $text
        $script:notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
        $script:notifyIcon.ShowBalloonTip(3000)
    }
}

# ── Settings GUI ────────────────────────────────────────
function Show-Settings($cfg) {
    $krFont = "맑은 고딕"
    # Fallback font check
    $testFont = New-Object System.Drawing.Font($krFont, 9.5)
    if ($testFont.Name -ne $krFont) { $krFont = "굴림" }
    $testFont.Dispose()

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "CHA Bio - 파일 자동 분류 설정"
    $form.Size = New-Object System.Drawing.Size(680, 580)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $form.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $form.Font = New-Object System.Drawing.Font($krFont, 9.5)
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false

    $y = 15

    # Title
    $lbl = New-Object System.Windows.Forms.Label
    $lbl.Text = "CHA Bio 파일 자동 분류 설정"
    $lbl.Font = New-Object System.Drawing.Font($krFont, 13, [System.Drawing.FontStyle]::Bold)
    $lbl.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $lbl.Location = New-Object System.Drawing.Point(20, $y)
    $lbl.AutoSize = $true
    $form.Controls.Add($lbl)
    $y += 35

    # Download folder
    $lbl2 = New-Object System.Windows.Forms.Label
    $lbl2.Text = "다운로드 감시 폴더:"
    $lbl2.Location = New-Object System.Drawing.Point(20, $y)
    $lbl2.AutoSize = $true
    $form.Controls.Add($lbl2)
    $y += 22

    $txtDL = New-Object System.Windows.Forms.TextBox
    $txtDL.Text = $cfg.download_folder
    $txtDL.Location = New-Object System.Drawing.Point(20, $y)
    $txtDL.Size = New-Object System.Drawing.Size(540, 24)
    $txtDL.BackColor = [System.Drawing.Color]::FromArgb(49, 50, 68)
    $txtDL.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $form.Controls.Add($txtDL)

    $btnBDL = New-Object System.Windows.Forms.Button
    $btnBDL.Text = "..."
    $btnBDL.Location = New-Object System.Drawing.Point(570, $y)
    $btnBDL.Size = New-Object System.Drawing.Size(60, 24)
    $btnBDL.FlatStyle = "Flat"
    $btnBDL.BackColor = [System.Drawing.Color]::FromArgb(69, 71, 90)
    $btnBDL.Add_Click({
        $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
        if ($fbd.ShowDialog() -eq "OK") { $txtDL.Text = $fbd.SelectedPath }
    })
    $form.Controls.Add($btnBDL)
    $y += 30

    # Webapp checkbox
    $chkWeb = New-Object System.Windows.Forms.CheckBox
    $chkWeb.Text = "시작 시 웹앱 자동 열기 (Chrome)"
    $chkWeb.Checked = [bool]$cfg.open_webapp_on_start
    $chkWeb.Location = New-Object System.Drawing.Point(20, $y)
    $chkWeb.AutoSize = $true
    $chkWeb.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $form.Controls.Add($chkWeb)
    $y += 35

    # Separator label
    $sep = New-Object System.Windows.Forms.Label
    $sep.Text = "파일 종류별 저장 경로 (비워두면 이동 안 함):"
    $sep.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $sep.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $sep.Location = New-Object System.Drawing.Point(20, $y)
    $sep.AutoSize = $true
    $form.Controls.Add($sep)
    $y += 25

    # Scrollable panel
    $panel = New-Object System.Windows.Forms.Panel
    $panel.Location = New-Object System.Drawing.Point(20, $y)
    $panel.Size = New-Object System.Drawing.Size(620, 340)
    $panel.AutoScroll = $true
    $panel.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $form.Controls.Add($panel)

    $ruleTexts = @{}
    $rules = $cfg.rules
    $py = 0

    foreach ($pat in $script:FILE_PATTERNS) {
        $key = $pat.key
        $label = $pat.label

        $rl = New-Object System.Windows.Forms.Label
        $rl.Text = $label + ":"
        $rl.Location = New-Object System.Drawing.Point(0, ($py + 3))
        $rl.Size = New-Object System.Drawing.Size(170, 20)
        $panel.Controls.Add($rl)

        $rt = New-Object System.Windows.Forms.TextBox
        $val = ""
        if ($rules -and $rules.PSObject.Properties[$key]) { $val = $rules.$key }
        $rt.Text = $val
        $rt.Location = New-Object System.Drawing.Point(175, $py)
        $rt.Size = New-Object System.Drawing.Size(360, 22)
        $rt.BackColor = [System.Drawing.Color]::FromArgb(49, 50, 68)
        $rt.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
        $panel.Controls.Add($rt)
        $ruleTexts[$key] = $rt

        $rb = New-Object System.Windows.Forms.Button
        $rb.Text = "..."
        $rb.Location = New-Object System.Drawing.Point(545, $py)
        $rb.Size = New-Object System.Drawing.Size(40, 22)
        $rb.FlatStyle = "Flat"
        $rb.BackColor = [System.Drawing.Color]::FromArgb(69, 71, 90)
        $rb.Tag = $rt
        $rb.Add_Click({
            $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
            if ($fbd.ShowDialog() -eq "OK") { $this.Tag.Text = $fbd.SelectedPath }
        })
        $panel.Controls.Add($rb)
        $py += 28
    }

    $y += 350

    # Save
    $btnSave = New-Object System.Windows.Forms.Button
    $btnSave.Text = "저장"
    $btnSave.Location = New-Object System.Drawing.Point(490, $y)
    $btnSave.Size = New-Object System.Drawing.Size(80, 30)
    $btnSave.FlatStyle = "Flat"
    $btnSave.BackColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $btnSave.ForeColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $btnSave.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $btnSave.Add_Click({
        $cfg.download_folder = $txtDL.Text
        $cfg.open_webapp_on_start = $chkWeb.Checked
        $newRules = New-Object PSObject
        foreach ($k in $ruleTexts.Keys) {
            $v = $ruleTexts[$k].Text.Trim()
            if ($v) { $newRules | Add-Member -NotePropertyName $k -NotePropertyValue $v }
        }
        $cfg.rules = $newRules
        Save-Config $cfg
        Restart-Watcher $cfg
        [System.Windows.Forms.MessageBox]::Show("설정이 저장되었습니다.", "완료")
        $form.Close()
    })
    $form.Controls.Add($btnSave)

    $btnCancel = New-Object System.Windows.Forms.Button
    $btnCancel.Text = "취소"
    $btnCancel.Location = New-Object System.Drawing.Point(580, $y)
    $btnCancel.Size = New-Object System.Drawing.Size(60, 30)
    $btnCancel.FlatStyle = "Flat"
    $btnCancel.BackColor = [System.Drawing.Color]::FromArgb(69, 71, 90)
    $btnCancel.Add_Click({ $form.Close() })
    $form.Controls.Add($btnCancel)

    $form.ShowDialog()
}

# ── Watcher ─────────────────────────────────────────────
function Start-Watcher($cfg) {
    $dlFolder = $cfg.download_folder
    if (-not (Test-Path $dlFolder)) { return }

    $w = New-Object System.IO.FileSystemWatcher
    $w.Path = $dlFolder
    $w.Filter = "*.*"
    $w.IncludeSubdirectories = $false
    $w.EnableRaisingEvents = $true

    $action = {
        $path = $Event.SourceEventArgs.FullPath
        Start-Sleep -Seconds 2
        Process-File $path $cfg
    }

    Register-ObjectEvent -InputObject $w -EventName Created -Action $action | Out-Null
    Register-ObjectEvent -InputObject $w -EventName Renamed -Action $action | Out-Null

    $script:watcher = $w
}

function Restart-Watcher($cfg) {
    if ($script:watcher) {
        $script:watcher.EnableRaisingEvents = $false
        $script:watcher.Dispose()
        Get-EventSubscriber | Unregister-Event -Force 2>$null
    }
    Start-Watcher $cfg
}

# ── Tray App ────────────────────────────────────────────
function Start-TrayApp {
    $cfg = Load-Config

    if ($cfg.open_webapp_on_start) { Open-WebApp }

    Start-Watcher $cfg

    # First run — show settings
    if (-not $cfg.rules -or ($cfg.rules.PSObject.Properties | Measure-Object).Count -eq 0) {
        Show-Settings $cfg
        $cfg = Load-Config
    }

    # Tray icon
    $icon = New-Object System.Windows.Forms.NotifyIcon
    $icon.Text = "CHA Bio 파일 분류"
    $icon.Visible = $true
    $script:notifyIcon = $icon

    # Icon bitmap
    $bmp = New-Object System.Drawing.Bitmap(32, 32)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(137, 180, 250))
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($brush, 8, 12, 16, 12)
    $points = @(
        (New-Object System.Drawing.Point(16, 5)),
        (New-Object System.Drawing.Point(8, 14)),
        (New-Object System.Drawing.Point(24, 14))
    )
    $g.FillPolygon($brush, $points)
    $brush.Dispose()
    $g.Dispose()
    $icon.Icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())

    # Context menu
    $menu = New-Object System.Windows.Forms.ContextMenuStrip

    $miWeb = New-Object System.Windows.Forms.ToolStripMenuItem
    $miWeb.Text = "웹앱 열기"
    $miWeb.Add_Click({ Open-WebApp })
    $menu.Items.Add($miWeb) | Out-Null

    $miSet = New-Object System.Windows.Forms.ToolStripMenuItem
    $miSet.Text = "설정"
    $miSet.Add_Click({
        $c = Load-Config
        Show-Settings $c
    })
    $menu.Items.Add($miSet) | Out-Null

    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    $miQuit = New-Object System.Windows.Forms.ToolStripMenuItem
    $miQuit.Text = "종료"
    $miQuit.Add_Click({
        if ($script:watcher) { $script:watcher.Dispose() }
        $script:notifyIcon.Visible = $false
        $script:notifyIcon.Dispose()
        [System.Windows.Forms.Application]::Exit()
    })
    $menu.Items.Add($miQuit) | Out-Null

    $icon.ContextMenuStrip = $menu
    $icon.Add_DoubleClick({
        $c = Load-Config
        Show-Settings $c
    })

    Show-Balloon "CHA Bio 파일 분류" "파일 감시 시작됨"

    [System.Windows.Forms.Application]::Run()
}

Start-TrayApp
