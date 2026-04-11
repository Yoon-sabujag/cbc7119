# CHA Bio Complex - Download File Auto-Organizer
# Windows 7+ (PowerShell 2.0+ / .NET 3.5+)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$script:WEB_APP_URL = "https://cbc7119.pages.dev"
$script:CONFIG_DIR = Join-Path $env:USERPROFILE ".cha-bio-watchdog"
$script:CONFIG_FILE = Join-Path $script:CONFIG_DIR "config.txt"
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
    @{ key="leave_request";       label="휴가신청서";              pattern='^휴가신청서_.+_(\d{4})(\d{2})\d{2}\.xlsx$';                      yearG=1; monthG=2 }
    @{ key="annual_plan";         label="연간 업무 추진 계획";      pattern='^(\d{4})년 연간 업무 추진 계획\.xlsx$';                           yearG=1; monthG=0 }
    @{ key="monthly_plan";        label="월간 중요업무추진계획";     pattern='^(\d{4})년_(\d{1,2})월_중요업무추진계획\(방재\)\.xlsx$';           yearG=1; monthG=2 }
    @{ key="qr_code";             label="QR 코드";                pattern='^.+_(?:점검용|점검확인용)_QR\.pdf$';                              yearG=0; monthG=0 }
    @{ key="remediation_report";  label="조치보고서";              pattern='^조치보고서_.+_(\d{4})(\d{2})\d{2}\.html$';                      yearG=1; monthG=2 }
    @{ key="legal_findings";      label="지적사항";                pattern='^지적사항_.+\.zip$';                                             yearG=0; monthG=0 }
)

# ── Config (simple key=value text file) ─────────────────
function Load-Config {
    $cfg = @{}
    $cfg["download_folder"] = Join-Path $env:USERPROFILE "Downloads"
    $cfg["open_webapp_on_start"] = "true"

    if (Test-Path $script:CONFIG_FILE) {
        $lines = [System.IO.File]::ReadAllLines($script:CONFIG_FILE, [System.Text.Encoding]::UTF8)
        foreach ($line in $lines) {
            $line = $line.Trim()
            if ($line -eq "" -or $line.StartsWith("#")) { continue }
            $idx = $line.IndexOf("=")
            if ($idx -gt 0) {
                $k = $line.Substring(0, $idx).Trim()
                $v = $line.Substring($idx + 1).Trim()
                $cfg[$k] = $v
            }
        }
    }
    return $cfg
}

function Save-Config($cfg) {
    if (-not (Test-Path $script:CONFIG_DIR)) {
        New-Item -ItemType Directory -Path $script:CONFIG_DIR -Force | Out-Null
    }
    $lines = New-Object System.Collections.ArrayList
    $lines.Add("# CHA Bio File Organizer Config") | Out-Null
    $lines.Add("download_folder=" + $cfg["download_folder"]) | Out-Null
    $lines.Add("open_webapp_on_start=" + $cfg["open_webapp_on_start"]) | Out-Null
    $lines.Add("") | Out-Null
    $lines.Add("# Rules: key=folder_path") | Out-Null
    foreach ($pat in $script:FILE_PATTERNS) {
        $key = $pat.key
        if ($cfg.ContainsKey($key) -and $cfg[$key] -ne "") {
            $lines.Add($key + "=" + $cfg[$key]) | Out-Null
        }
    }
    [System.IO.File]::WriteAllLines($script:CONFIG_FILE, $lines.ToArray(), [System.Text.Encoding]::UTF8)
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
    Start-Process $script:WEB_APP_URL
}

# ── File Move ───────────────────────────────────────────
function Move-MatchedFile($filePath, $destBase, $year, $month) {
    $now = Get-Date
    if (-not $year -or $year -eq "") { $year = $now.Year.ToString() }
    if (-not $month -or $month -eq "") { $month = $now.Month.ToString().PadLeft(2, '0') }

    $yearFolder = $year + [char]0xB144
    $monthFolder = $month + [char]0xC6D4
    $destDir = Join-Path $destBase (Join-Path $yearFolder $monthFolder)
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

    $destFile = Join-Path $destDir (Split-Path $filePath -Leaf)
    if (Test-Path $destFile) { Remove-Item $destFile -Force }

    Start-Sleep -Milliseconds 500
    Move-Item -Path $filePath -Destination $destFile -Force
}

# ── Process File ────────────────────────────────────────
function Process-File($filePath) {
    $cfg = Load-Config
    $fileName = Split-Path $filePath -Leaf
    if ($fileName -match '\.(crdownload|tmp|part)$') { return }

    foreach ($pat in $script:FILE_PATTERNS) {
        $m = [regex]::Match($fileName, $pat.pattern)
        if ($m.Success) {
            $key = $pat.key
            if (-not $cfg.ContainsKey($key) -or $cfg[$key] -eq "") { continue }
            $dest = $cfg[$key]

            $year = $null; $month = $null
            if ($pat.yearG -gt 0 -and $m.Groups[$pat.yearG].Success) { $year = $m.Groups[$pat.yearG].Value }
            if ($pat.monthG -gt 0 -and $m.Groups[$pat.monthG].Success) { $month = $m.Groups[$pat.monthG].Value.PadLeft(2, '0') }

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
                Show-Balloon $fileName ("이동 완료")
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
function Show-Settings {
    $cfg = Load-Config

    $krFont = "맑은 고딕"
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

    $lbl = New-Object System.Windows.Forms.Label
    $lbl.Text = "CHA Bio 파일 자동 분류 설정"
    $lbl.Font = New-Object System.Drawing.Font($krFont, 13, [System.Drawing.FontStyle]::Bold)
    $lbl.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $lbl.Location = New-Object System.Drawing.Point(20, $y)
    $lbl.AutoSize = $true
    $form.Controls.Add($lbl)
    $y += 35

    $lbl2 = New-Object System.Windows.Forms.Label
    $lbl2.Text = "다운로드 감시 폴더:"
    $lbl2.Location = New-Object System.Drawing.Point(20, $y)
    $lbl2.AutoSize = $true
    $form.Controls.Add($lbl2)
    $y += 22

    $txtDL = New-Object System.Windows.Forms.TextBox
    $txtDL.Text = $cfg["download_folder"]
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

    $chkWeb = New-Object System.Windows.Forms.CheckBox
    $chkWeb.Text = "시작 시 웹앱 자동 열기 (Chrome)"
    $chkWeb.Checked = ($cfg["open_webapp_on_start"] -eq "true")
    $chkWeb.Location = New-Object System.Drawing.Point(20, $y)
    $chkWeb.AutoSize = $true
    $chkWeb.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $form.Controls.Add($chkWeb)
    $y += 35

    $sep = New-Object System.Windows.Forms.Label
    $sep.Text = "파일 종류별 저장 경로 (비워두면 이동 안 함):"
    $sep.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $sep.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $sep.Location = New-Object System.Drawing.Point(20, $y)
    $sep.AutoSize = $true
    $form.Controls.Add($sep)
    $y += 25

    $panel = New-Object System.Windows.Forms.Panel
    $panel.Location = New-Object System.Drawing.Point(20, $y)
    $panel.Size = New-Object System.Drawing.Size(620, 340)
    $panel.AutoScroll = $true
    $panel.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $form.Controls.Add($panel)

    $ruleTexts = @{}
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
        if ($cfg.ContainsKey($key)) { $val = $cfg[$key] }
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

    $btnSave = New-Object System.Windows.Forms.Button
    $btnSave.Text = "저장"
    $btnSave.Location = New-Object System.Drawing.Point(490, $y)
    $btnSave.Size = New-Object System.Drawing.Size(80, 30)
    $btnSave.FlatStyle = "Flat"
    $btnSave.BackColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $btnSave.ForeColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $btnSave.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $btnSave.Add_Click({
        $newCfg = @{}
        $newCfg["download_folder"] = $txtDL.Text
        if ($chkWeb.Checked) { $newCfg["open_webapp_on_start"] = "true" } else { $newCfg["open_webapp_on_start"] = "false" }
        foreach ($k in $ruleTexts.Keys) {
            $v = $ruleTexts[$k].Text.Trim()
            if ($v -ne "") { $newCfg[$k] = $v }
        }
        Save-Config $newCfg
        Restart-Watcher
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
function Start-Watcher {
    $cfg = Load-Config
    $dlFolder = $cfg["download_folder"]
    if (-not (Test-Path $dlFolder)) { return }

    $w = New-Object System.IO.FileSystemWatcher
    $w.Path = $dlFolder
    $w.Filter = "*.*"
    $w.IncludeSubdirectories = $false
    $w.EnableRaisingEvents = $true

    Register-ObjectEvent -InputObject $w -EventName Created -Action {
        Start-Sleep -Seconds 2
        Process-File $Event.SourceEventArgs.FullPath
    } | Out-Null

    Register-ObjectEvent -InputObject $w -EventName Renamed -Action {
        Start-Sleep -Seconds 1
        Process-File $Event.SourceEventArgs.FullPath
    } | Out-Null

    $script:watcher = $w
}

function Restart-Watcher {
    if ($script:watcher) {
        $script:watcher.EnableRaisingEvents = $false
        $script:watcher.Dispose()
        $script:watcher = $null
    }
    Get-EventSubscriber | Unregister-Event -Force 2>$null
    Start-Watcher
}

# ── Tray App ────────────────────────────────────────────
function Start-TrayApp {
    $cfg = Load-Config

    if ($cfg["open_webapp_on_start"] -eq "true") { Open-WebApp }

    # First run — show settings
    $hasRules = $false
    foreach ($pat in $script:FILE_PATTERNS) {
        if ($cfg.ContainsKey($pat.key) -and $cfg[$pat.key] -ne "") { $hasRules = $true; break }
    }
    if (-not $hasRules) {
        Show-Settings
    }

    Start-Watcher

    # Tray icon
    $icon = New-Object System.Windows.Forms.NotifyIcon
    $icon.Text = "CHA Bio 파일 분류"
    $icon.Visible = $true
    $script:notifyIcon = $icon

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

    $menu = New-Object System.Windows.Forms.ContextMenuStrip

    $miWeb = New-Object System.Windows.Forms.ToolStripMenuItem
    $miWeb.Text = "웹앱 열기"
    $miWeb.Add_Click({ Open-WebApp })
    $menu.Items.Add($miWeb) | Out-Null

    $miSet = New-Object System.Windows.Forms.ToolStripMenuItem
    $miSet.Text = "설정"
    $miSet.Add_Click({ Show-Settings })
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
    $icon.Add_DoubleClick({ Show-Settings })

    Show-Balloon "CHA Bio 파일 분류" "파일 감시 시작됨"

    [System.Windows.Forms.Application]::Run()
}

Start-TrayApp
