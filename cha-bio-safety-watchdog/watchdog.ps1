# CHA Bio Complex - Download File Auto-Organizer
# Windows 7+ (PowerShell 2.0+ / .NET 3.5+)
# No installation required

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$script:WEB_APP_URL = "https://cbc7119.pages.dev"
$script:CONFIG_PATH = Join-Path $env:USERPROFILE ".cha-bio-watchdog\config.json"
$script:watcher = $null
$script:notifyIcon = $null

# ── File Patterns ───────────────────────────────────────
$script:FILE_PATTERNS = @(
    @{ key="inspection_zip";      label="`uc810`uac80`uc77c`uc9c0 `uc885`ud569";                 pattern='^(\d{4})년도 점검일지 종합 \((\d{2})월 업데이트\)\.zip$';           yearG=1; monthG=2 }
    @{ key="div_inspection";      label="DIV `uc810`uac80`ud45c";                                pattern='^(\d{4})년도_DIV점검표_.+\.xlsx$';                               yearG=1; monthG=0 }
    @{ key="equipment_inspection";label="`uc7a5`ube44`ubcc4 `uc810`uac80`uc77c`uc9c0";            pattern='^(\d{4})년도_(.+)_점검일지\.xlsx$';                              yearG=1; monthG=0 }
    @{ key="pump_inspection";     label="`uc18c`ubc29`ud38c`ud504 `uc810`uac80`uc77c`uc9c0";      pattern='^(\d{4})년도_소방펌프_점검일지\.xlsx$';                           yearG=1; monthG=0 }
    @{ key="shift_schedule";      label="`uadfc`ubb34`ud45c";                                    pattern='^(\d{4})년_(\d{1,2})월_근무표\.xlsx$';                            yearG=1; monthG=2 }
    @{ key="daily_report_single"; label="`uc77c`uc77c`uc5c5`ubb34`uc77c`uc9c0(`uc77c`ubcc4)";    pattern='^(\d{1,2})월(\d{2})일 방재업무일지\.xlsx$';                       yearG=0; monthG=1 }
    @{ key="daily_report_monthly";label="`uc77c`uc77c`uc5c5`ubb34`uc77c`uc9c0(`uc6d4`ubcc4)";    pattern='^일일업무일지\((\d{2})월\)\.xlsx$';                               yearG=0; monthG=1 }
    @{ key="work_log";            label="`uc5c5`ubb34`uc218`ud589`uae30`ub85d`ud45c";             pattern='^소방안전관리자_업무수행기록표_(\d{4})년_(\d{1,2})월\.xlsx$';       yearG=1; monthG=2 }
    @{ key="leave_request";       label="`ud734`uac00`uc2e0`uccad`uc11c";                        pattern='^휴가신청서_.+_\d{8}\.xlsx$';                                    yearG=0; monthG=0 }
    @{ key="annual_plan";         label="`uc5f0`uac04 `uc5c5`ubb34 `ucd94`uc9c4 `uacc4`ud68d";  pattern='^(\d{4})년 연간 업무 추진 계획\.xlsx$';                           yearG=1; monthG=0 }
    @{ key="monthly_plan";        label="`uc6d4`uac04 `uc911`uc694`uc5c5`ubb34`ucd94`uc9c4";     pattern='^(\d{4})년_(\d{1,2})월_중요업무추진계획\(방재\)\.xlsx$';           yearG=1; monthG=2 }
    @{ key="qr_code";             label="QR `ucf54`ub4dc";                                       pattern='^.+_(?:점검용|점검확인용)_QR\.pdf$';                              yearG=0; monthG=0 }
    @{ key="remediation_report";  label="`uc870`uce58`ubcf4`uace0`uc11c";                        pattern='^조치보고서_.+_\d{8}\.html$';                                    yearG=0; monthG=0 }
    @{ key="legal_findings";      label="`uc9c0`uc801`uc0ac`ud56d";                              pattern='^지적사항_.+\.zip$';                                             yearG=0; monthG=0 }
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

# ── File Move ───────────────────────────────────────────
function Move-MatchedFile($filePath, $destBase, $year, $month) {
    $now = Get-Date
    if (-not $year) { $year = $now.Year.ToString() }
    if (-not $month) { $month = $now.Month.ToString().PadLeft(2, '0') }

    $destDir = Join-Path $destBase "${year}`ub144\${month}`uc6d4"
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

            # Wait for download to finish
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
                Show-Balloon "$fileName `uc774`ub3d9 `uc644`ub8cc" "`u2192 ${dest}\${year}`ub144\${month}`uc6d4"
            } catch {}
            return
        }
    }
}

# ── Balloon notification ────────────────────────────────
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
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "CHA Bio - `ud30c`uc77c `uc790`ub3d9 `ubd84`ub958 `uc124`uc815"
    $form.Size = New-Object System.Drawing.Size(680, 580)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $form.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $form.Font = New-Object System.Drawing.Font("`ub9d1`uc740 `uace0`ub515", 9.5)
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false

    $y = 15

    # Title
    $lbl = New-Object System.Windows.Forms.Label
    $lbl.Text = "CHA Bio `ud30c`uc77c `uc790`ub3d9 `ubd84`ub958 `uc124`uc815"
    $lbl.Font = New-Object System.Drawing.Font("`ub9d1`uc740 `uace0`ub515", 13, [System.Drawing.FontStyle]::Bold)
    $lbl.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $lbl.Location = New-Object System.Drawing.Point(20, $y)
    $lbl.AutoSize = $true
    $form.Controls.Add($lbl)
    $y += 35

    # Download folder
    $lbl2 = New-Object System.Windows.Forms.Label
    $lbl2.Text = "`ub2e4`uc6b4`ub85c`ub4dc `uac10`uc2dc `ud3f4`ub354:"
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

    $btnBrowseDL = New-Object System.Windows.Forms.Button
    $btnBrowseDL.Text = "..."
    $btnBrowseDL.Location = New-Object System.Drawing.Point(570, $y)
    $btnBrowseDL.Size = New-Object System.Drawing.Size(60, 24)
    $btnBrowseDL.FlatStyle = "Flat"
    $btnBrowseDL.BackColor = [System.Drawing.Color]::FromArgb(69, 71, 90)
    $btnBrowseDL.Add_Click({
        $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
        if ($fbd.ShowDialog() -eq "OK") { $txtDL.Text = $fbd.SelectedPath }
    })
    $form.Controls.Add($btnBrowseDL)
    $y += 30

    # Webapp checkbox
    $chkWeb = New-Object System.Windows.Forms.CheckBox
    $chkWeb.Text = "`uc2dc`uc791 `uc2dc `uc6f9`uc571 `uc790`ub3d9 `uc5f4`uae30"
    $chkWeb.Checked = [bool]$cfg.open_webapp_on_start
    $chkWeb.Location = New-Object System.Drawing.Point(20, $y)
    $chkWeb.AutoSize = $true
    $chkWeb.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $form.Controls.Add($chkWeb)
    $y += 35

    # Separator
    $sep = New-Object System.Windows.Forms.Label
    $sep.Text = "`ud30c`uc77c `uc885`ub958`ubcc4 `uc800`uc7a5 `uacbd`ub85c (`ube44`uc6cc`ub450`uba74 `uc774`ub3d9 `uc548 `ud568):"
    $sep.Font = New-Object System.Drawing.Font("`ub9d1`uc740 `uace0`ub515", 10, [System.Drawing.FontStyle]::Bold)
    $sep.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $sep.Location = New-Object System.Drawing.Point(20, $y)
    $sep.AutoSize = $true
    $form.Controls.Add($sep)
    $y += 25

    # Scrollable panel for rules
    $panel = New-Object System.Windows.Forms.Panel
    $panel.Location = New-Object System.Drawing.Point(20, $y)
    $panel.Size = New-Object System.Drawing.Size(620, 340)
    $panel.AutoScroll = $true
    $panel.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $form.Controls.Add($panel)

    $ruleTexts = @{}
    $py = 0
    $rules = $cfg.rules

    foreach ($pat in $script:FILE_PATTERNS) {
        $key = $pat.key
        $label = $pat.label

        $rl = New-Object System.Windows.Forms.Label
        $rl.Text = $label + ":"
        $rl.Location = New-Object System.Drawing.Point(0, ($py + 3))
        $rl.Size = New-Object System.Drawing.Size(160, 20)
        $panel.Controls.Add($rl)

        $rt = New-Object System.Windows.Forms.TextBox
        $val = ""
        if ($rules -and $rules.PSObject.Properties[$key]) { $val = $rules.$key }
        $rt.Text = $val
        $rt.Location = New-Object System.Drawing.Point(165, $py)
        $rt.Size = New-Object System.Drawing.Size(370, 22)
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
        $theTextBox = $rt
        $rb.Tag = $rt
        $rb.Add_Click({
            $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
            if ($fbd.ShowDialog() -eq "OK") { $this.Tag.Text = $fbd.SelectedPath }
        })
        $panel.Controls.Add($rb)
        $py += 28
    }

    $y += 350

    # Save button
    $btnSave = New-Object System.Windows.Forms.Button
    $btnSave.Text = "`uc800`uc7a5"
    $btnSave.Location = New-Object System.Drawing.Point(490, $y)
    $btnSave.Size = New-Object System.Drawing.Size(80, 30)
    $btnSave.FlatStyle = "Flat"
    $btnSave.BackColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $btnSave.ForeColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $btnSave.Font = New-Object System.Drawing.Font("`ub9d1`uc740 `uace0`ub515", 10, [System.Drawing.FontStyle]::Bold)
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
        [System.Windows.Forms.MessageBox]::Show("`uc124`uc815`uc774 `uc800`uc7a5`ub418`uc5c8`uc2b5`ub2c8`ub2e4.", "`uc644`ub8cc")
        $form.Close()
    })
    $form.Controls.Add($btnSave)

    # Cancel button
    $btnCancel = New-Object System.Windows.Forms.Button
    $btnCancel.Text = "`ucde8`uc18c"
    $btnCancel.Location = New-Object System.Drawing.Point(580, $y)
    $btnCancel.Size = New-Object System.Drawing.Size(60, 30)
    $btnCancel.FlatStyle = "Flat"
    $btnCancel.BackColor = [System.Drawing.Color]::FromArgb(69, 71, 90)
    $btnCancel.Add_Click({ $form.Close() })
    $form.Controls.Add($btnCancel)

    $form.ShowDialog()
}

# ── File Watcher ────────────────────────────────────────
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

# ── System Tray ─────────────────────────────────────────
function Start-TrayApp {
    $cfg = Load-Config

    # Open webapp
    if ($cfg.open_webapp_on_start) {
        Start-Process $script:WEB_APP_URL
    }

    # Start watcher
    Start-Watcher $cfg

    # Show settings if no rules
    if (-not $cfg.rules -or ($cfg.rules.PSObject.Properties | Measure-Object).Count -eq 0) {
        Show-Settings $cfg
        $cfg = Load-Config
    }

    # Tray icon
    $icon = New-Object System.Windows.Forms.NotifyIcon
    $icon.Text = "CHA Bio `ud30c`uc77c `ubd84`ub958"
    $icon.Visible = $true
    $script:notifyIcon = $icon

    # Create icon image
    $bmp = New-Object System.Drawing.Bitmap(32, 32)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(137, 180, 250))
    $g.FillRectangle([System.Drawing.Brushes]::White, 8, 10, 16, 14)
    $g.FillPolygon([System.Drawing.Brushes]::White, @(
        (New-Object System.Drawing.Point(16, 4)),
        (New-Object System.Drawing.Point(10, 12)),
        (New-Object System.Drawing.Point(22, 12))
    ))
    $g.Dispose()
    $icon.Icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())

    # Context menu
    $menu = New-Object System.Windows.Forms.ContextMenuStrip

    $miWeb = New-Object System.Windows.Forms.ToolStripMenuItem
    $miWeb.Text = "`uc6f9`uc571 `uc5f4`uae30"
    $miWeb.Add_Click({ Start-Process $script:WEB_APP_URL })
    $menu.Items.Add($miWeb) | Out-Null

    $miSet = New-Object System.Windows.Forms.ToolStripMenuItem
    $miSet.Text = "`uc124`uc815"
    $miSet.Add_Click({
        $c = Load-Config
        Show-Settings $c
    })
    $menu.Items.Add($miSet) | Out-Null

    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    $miQuit = New-Object System.Windows.Forms.ToolStripMenuItem
    $miQuit.Text = "`uc885`ub8cc"
    $miQuit.Add_Click({
        if ($script:watcher) { $script:watcher.Dispose() }
        $script:notifyIcon.Visible = $false
        $script:notifyIcon.Dispose()
        [System.Windows.Forms.Application]::Exit()
    })
    $menu.Items.Add($miQuit) | Out-Null

    $icon.ContextMenuStrip = $menu

    # Double click = open settings
    $icon.Add_DoubleClick({
        $c = Load-Config
        Show-Settings $c
    })

    # Balloon on start
    Show-Balloon "CHA Bio `ud30c`uc77c `ubd84`ub958" "`ud30c`uc77c `uac10`uc2dc `uc2dc`uc791`ub428"

    # Run message loop
    [System.Windows.Forms.Application]::Run()
}

# ── Entry Point ─────────────────────────────────────────
Start-TrayApp
