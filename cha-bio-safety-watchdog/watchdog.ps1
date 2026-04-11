# CHA Bio Complex - Download File Auto-Organizer
# Windows 7+ (PowerShell 2.0+ / .NET 3.5+)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$script:WEB_APP_URL = "https://cbc7119.pages.dev"
$script:CONFIG_DIR = Join-Path $env:USERPROFILE ".cha-bio-watchdog"
$script:CONFIG_FILE = Join-Path $script:CONFIG_DIR "config.txt"
$script:watcher = $null
$script:notifyIcon = $null

# ── File Patterns (grouped) ────────────────────────────
$script:GROUPS = @(
    @{ name="업무 계획 및 일지"; items=@(
        @{ key="daily_single";  label="일별업무일지";       pattern='^(\d{1,2})월(\d{2})일 방재업무일지\.xlsx$';                       yearG=0; monthG=1 }
        @{ key="daily_monthly"; label="월별업무일지";       pattern='^일일업무일지\((\d{2})월\)\.xlsx$';                               yearG=0; monthG=1 }
        @{ key="work_log";      label="수행기록표";         pattern='^소방안전관리자_업무수행기록표_(\d{4})년_(\d{1,2})월\.xlsx$';       yearG=1; monthG=2 }
        @{ key="monthly_plan";  label="월간업무추진계획";    pattern='^(\d{4})년_(\d{1,2})월_중요업무추진계획\(방재\)\.xlsx$';           yearG=1; monthG=2 }
        @{ key="annual_plan";   label="연간업무추진계획";    pattern='^(\d{4})년 연간 업무 추진 계획\.xlsx$';                           yearG=1; monthG=0 }
    )}
    @{ name="각종 운영 문서"; items=@(
        @{ key="shift";         label="월별근무표";         pattern='^(\d{4})년_(\d{1,2})월_근무표\.xlsx$';                            yearG=1; monthG=2 }
        @{ key="leave";         label="휴가신청서";         pattern='^휴가신청서_.+_(\d{4})(\d{2})\d{2}\.xlsx$';                      yearG=1; monthG=2 }
    )}
    @{ name="점검 및 조치"; items=@(
        @{ key="remed";         label="일상점검조치";       pattern='^조치보고서_.+_(\d{4})(\d{2})\d{2}\.html$';                      yearG=1; monthG=2 }
        @{ key="legal";         label="소방점검조치";       pattern='^지적사항_.+\.zip$';                                             yearG=0; monthG=0 }
    )}
    @{ name="소방설비점검일지"; items=@(
        @{ key="div_early";     label="유수검지장치(월초)";  pattern='^(\d{4})년도_DIV점검표_월초\.xlsx$';                              yearG=1; monthG=0 }
        @{ key="div_late";      label="유수검지장치(월말)";  pattern='^(\d{4})년도_DIV점검표_월말\.xlsx$';                              yearG=1; monthG=0 }
        @{ key="hydrant";       label="옥내소화전";         pattern='^(\d{4})년도_소화전_점검일지\.xlsx$';                              yearG=1; monthG=0 }
        @{ key="emergency";     label="비상콘센트";         pattern='^(\d{4})년도_비상콘센트_점검일지\.xlsx$';                          yearG=1; monthG=0 }
        @{ key="clean";         label="청정소화약제";       pattern='^(\d{4})년도_청정소화약제_점검일지\.xlsx$';                        yearG=1; monthG=0 }
        @{ key="escape";        label="피난방화시설";       pattern='^(\d{4})년도_피난방화시설_점검일지\.xlsx$';                        yearG=1; monthG=0 }
        @{ key="shutter";       label="방화셔터";           pattern='^(\d{4})년도_방화셔터_점검일지\.xlsx$';                           yearG=1; monthG=0 }
        @{ key="smoke";         label="제연설비";           pattern='^(\d{4})년도_제연설비_점검일지\.xlsx$';                           yearG=1; monthG=0 }
        @{ key="detect";        label="자탐설비";           pattern='^(\d{4})년도_자동화재탐지설비_점검일지\.xlsx$';                    yearG=1; monthG=0 }
        @{ key="pump";          label="소방펌프";           pattern='^(\d{4})년도_소방펌프_점검일지\.xlsx$';                           yearG=1; monthG=0 }
        @{ key="all_zip";       label="전체 일괄 받기";     pattern='^(\d{4})년도 점검일지 종합 \((\d{2})월 업데이트\)\.zip$';          yearG=1; monthG=2 }
    )}
    @{ name="QR 코드"; items=@(
        @{ key="qr_ext_insp";   label="소화기점검용";       pattern='^소화기_점검용_QR\.pdf$';                                        yearG=0; monthG=0 }
        @{ key="qr_ext_pub";    label="소화기점검표";       pattern='^소화기_점검확인용_QR\.pdf$';                                    yearG=0; monthG=0 }
        @{ key="qr_hydrant";    label="소화전점검용";       pattern='^소화전_점검용_QR\.pdf$';                                        yearG=0; monthG=0 }
        @{ key="qr_div";        label="DIV점검용";          pattern='^DIV_점검용_QR\.pdf$';                                           yearG=0; monthG=0 }
        @{ key="qr_clean";      label="청정점검용";         pattern='^청정소화약제_점검용_QR\.pdf$';                                  yearG=0; monthG=0 }
        @{ key="qr_descend";    label="완강기점검용";       pattern='^완강기_점검용_QR\.pdf$';                                        yearG=0; monthG=0 }
        @{ key="qr_damper";     label="제연댐퍼점검용";     pattern='^전실제연댐퍼_점검용_QR\.pdf$';                                  yearG=0; monthG=0 }
        @{ key="qr_shutter";    label="방화셔터점검용";     pattern='^방화셔터_점검용_QR\.pdf$';                                      yearG=0; monthG=0 }
    )}
)

$script:ALL_PATTERNS = @()
foreach ($g in $script:GROUPS) { foreach ($item in $g.items) { $script:ALL_PATTERNS += $item } }

# Build lookup: key → (groupName, label)
$script:KEY_INFO = @{}
foreach ($g in $script:GROUPS) {
    foreach ($item in $g.items) {
        $script:KEY_INFO[$item.key] = @{ group=$g.name; label=$item.label }
    }
}

# ── Config ──────────────────────────────────────────────
function Load-Config {
    $cfg = @{}
    $cfg["download_folder"] = Join-Path $env:USERPROFILE "Downloads"
    $cfg["open_webapp_on_start"] = "true"
    $cfg["mode"] = "simple"
    $cfg["root_folder"] = ""
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
    if (-not (Test-Path $script:CONFIG_DIR)) { New-Item -ItemType Directory -Path $script:CONFIG_DIR -Force | Out-Null }
    $lines = New-Object System.Collections.ArrayList
    $lines.Add("# CHA Bio File Organizer Config") | Out-Null
    $lines.Add("download_folder=" + $cfg["download_folder"]) | Out-Null
    $lines.Add("open_webapp_on_start=" + $cfg["open_webapp_on_start"]) | Out-Null
    $lines.Add("mode=" + $cfg["mode"]) | Out-Null
    $lines.Add("root_folder=" + $cfg["root_folder"]) | Out-Null
    $lines.Add("") | Out-Null
    foreach ($pat in $script:ALL_PATTERNS) {
        if ($cfg.ContainsKey($pat.key) -and $cfg[$pat.key] -ne "") {
            $lines.Add($pat.key + "=" + $cfg[$pat.key]) | Out-Null
        }
    }
    [System.IO.File]::WriteAllLines($script:CONFIG_FILE, $lines.ToArray(), [System.Text.Encoding]::UTF8)
}

# ── Open Chrome (app mode) ──────────────────────────────
function Open-WebApp {
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    foreach ($p in $chromePaths) {
        if (Test-Path $p) {
            Start-Process $p -ArgumentList ("--app=" + $script:WEB_APP_URL)
            return
        }
    }
    Start-Process $script:WEB_APP_URL
}

# ── File Move ───────────────────────────────────────────
function Get-DestFolder($cfg, $patKey, $year, $month) {
    $now = Get-Date
    if (-not $year -or $year -eq "") { $year = $now.Year.ToString() }
    if (-not $month -or $month -eq "") { $month = $now.Month.ToString().PadLeft(2, '0') }
    $yearFolder = $year + [char]0xB144
    $monthFolder = $month + [char]0xC6D4

    if ($cfg["mode"] -eq "simple") {
        $root = $cfg["root_folder"]
        if (-not $root -or $root -eq "") { return $null }
        $info = $script:KEY_INFO[$patKey]
        $dest = Join-Path $root (Join-Path $info.group (Join-Path $info.label (Join-Path $yearFolder $monthFolder)))
    } else {
        if (-not $cfg.ContainsKey($patKey) -or $cfg[$patKey] -eq "") { return $null }
        $dest = Join-Path $cfg[$patKey] (Join-Path $yearFolder $monthFolder)
    }
    return $dest
}

function Move-ToFolder($filePath, $destDir) {
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
    foreach ($pat in $script:ALL_PATTERNS) {
        $m = [regex]::Match($fileName, $pat.pattern)
        if ($m.Success) {
            $year = $null; $month = $null
            if ($pat.yearG -gt 0 -and $m.Groups[$pat.yearG].Success) { $year = $m.Groups[$pat.yearG].Value }
            if ($pat.monthG -gt 0 -and $m.Groups[$pat.monthG].Success) { $month = $m.Groups[$pat.monthG].Value.PadLeft(2, '0') }

            $destDir = Get-DestFolder $cfg $pat.key $year $month
            if (-not $destDir) { continue }

            $prevSize = -1
            for ($i = 0; $i -lt 15; $i++) {
                Start-Sleep -Milliseconds 500
                if (-not (Test-Path $filePath)) { return }
                $curSize = (Get-Item $filePath).Length
                if ($curSize -eq $prevSize -and $curSize -gt 0) { break }
                $prevSize = $curSize
            }
            try {
                Move-ToFolder $filePath $destDir
                Show-Balloon $fileName "이동 완료"
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

    $bgDark = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $bgInput = [System.Drawing.Color]::FromArgb(49, 50, 68)
    $fgText = [System.Drawing.Color]::FromArgb(205, 214, 244)
    $fgAccent = [System.Drawing.Color]::FromArgb(137, 180, 250)
    $fgGroup = [System.Drawing.Color]::FromArgb(250, 179, 135)
    $bgBtn = [System.Drawing.Color]::FromArgb(69, 71, 90)
    $bgBottom = [System.Drawing.Color]::FromArgb(24, 24, 37)

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "CHA Bio - 파일 자동 분류 설정"
    $form.Size = New-Object System.Drawing.Size(700, 720)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = $bgDark
    $form.ForeColor = $fgText
    $form.Font = New-Object System.Drawing.Font($krFont, 9.5)
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false

    $y = 15

    # Title
    $lbl = New-Object System.Windows.Forms.Label
    $lbl.Text = "CHA Bio 파일 자동 분류 설정"
    $lbl.Font = New-Object System.Drawing.Font($krFont, 13, [System.Drawing.FontStyle]::Bold)
    $lbl.ForeColor = $fgAccent
    $lbl.Location = New-Object System.Drawing.Point(20, $y)
    $lbl.AutoSize = $true
    $form.Controls.Add($lbl)
    $y += 35

    # Download folder
    $lbl2 = New-Object System.Windows.Forms.Label
    $lbl2.Text = "다운로드 감시 폴더:"
    $lbl2.Location = New-Object System.Drawing.Point(20, $y); $lbl2.AutoSize = $true
    $form.Controls.Add($lbl2)
    $y += 22

    $txtDL = New-Object System.Windows.Forms.TextBox
    $txtDL.Text = $cfg["download_folder"]
    $txtDL.Location = New-Object System.Drawing.Point(20, $y)
    $txtDL.Size = New-Object System.Drawing.Size(555, 24)
    $txtDL.BackColor = $bgInput; $txtDL.ForeColor = $fgText
    $form.Controls.Add($txtDL)

    $btnBDL = New-Object System.Windows.Forms.Button
    $btnBDL.Text = "..."; $btnBDL.Location = New-Object System.Drawing.Point(585, $y)
    $btnBDL.Size = New-Object System.Drawing.Size(60, 24); $btnBDL.FlatStyle = "Flat"; $btnBDL.BackColor = $bgBtn
    $btnBDL.Add_Click({ $fbd = New-Object System.Windows.Forms.FolderBrowserDialog; if ($fbd.ShowDialog() -eq "OK") { $txtDL.Text = $fbd.SelectedPath } })
    $form.Controls.Add($btnBDL)
    $y += 28

    # Webapp checkbox
    $chkWeb = New-Object System.Windows.Forms.CheckBox
    $chkWeb.Text = "시작 시 웹앱 자동 열기 (Chrome)"
    $chkWeb.Checked = ($cfg["open_webapp_on_start"] -eq "true")
    $chkWeb.Location = New-Object System.Drawing.Point(20, $y); $chkWeb.AutoSize = $true
    $chkWeb.ForeColor = $fgText
    $form.Controls.Add($chkWeb)
    $y += 30

    # ── Mode selection ──────────────────────────────────
    $modeLabel = New-Object System.Windows.Forms.Label
    $modeLabel.Text = "분류 방식:"
    $modeLabel.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $modeLabel.ForeColor = $fgAccent
    $modeLabel.Location = New-Object System.Drawing.Point(20, $y); $modeLabel.AutoSize = $true
    $form.Controls.Add($modeLabel)
    $y += 22

    $rbSimple = New-Object System.Windows.Forms.RadioButton
    $rbSimple.Text = "간편 모드 — 루트 폴더 하나만 지정 (자동으로 그룹/항목/년/월 폴더 생성)"
    $rbSimple.Location = New-Object System.Drawing.Point(25, $y); $rbSimple.AutoSize = $true
    $rbSimple.ForeColor = $fgText; $rbSimple.Checked = ($cfg["mode"] -ne "detail")
    $form.Controls.Add($rbSimple)
    $y += 22

    $rbDetail = New-Object System.Windows.Forms.RadioButton
    $rbDetail.Text = "상세 모드 — 항목별 개별 폴더 지정"
    $rbDetail.Location = New-Object System.Drawing.Point(25, $y); $rbDetail.AutoSize = $true
    $rbDetail.ForeColor = $fgText; $rbDetail.Checked = ($cfg["mode"] -eq "detail")
    $form.Controls.Add($rbDetail)
    $y += 28

    # ── Simple mode panel ───────────────────────────────
    $simplePanel = New-Object System.Windows.Forms.Panel
    $simplePanel.Location = New-Object System.Drawing.Point(0, $y)
    $simplePanel.Size = New-Object System.Drawing.Size(685, 50)
    $simplePanel.BackColor = $bgDark
    $form.Controls.Add($simplePanel)

    $lblRoot = New-Object System.Windows.Forms.Label
    $lblRoot.Text = "루트 폴더:"
    $lblRoot.Location = New-Object System.Drawing.Point(20, 5); $lblRoot.AutoSize = $true
    $simplePanel.Controls.Add($lblRoot)

    $txtRoot = New-Object System.Windows.Forms.TextBox
    $txtRoot.Text = $cfg["root_folder"]
    $txtRoot.Location = New-Object System.Drawing.Point(20, 25)
    $txtRoot.Size = New-Object System.Drawing.Size(555, 24)
    $txtRoot.BackColor = $bgInput; $txtRoot.ForeColor = $fgText
    $simplePanel.Controls.Add($txtRoot)

    $btnBRoot = New-Object System.Windows.Forms.Button
    $btnBRoot.Text = "..."; $btnBRoot.Location = New-Object System.Drawing.Point(585, 25)
    $btnBRoot.Size = New-Object System.Drawing.Size(60, 24); $btnBRoot.FlatStyle = "Flat"; $btnBRoot.BackColor = $bgBtn
    $btnBRoot.Add_Click({ $fbd = New-Object System.Windows.Forms.FolderBrowserDialog; if ($fbd.ShowDialog() -eq "OK") { $txtRoot.Text = $fbd.SelectedPath } })
    $simplePanel.Controls.Add($btnBRoot)

    # ── Detail mode panel (scrollable) ──────────────────
    $detailPanel = New-Object System.Windows.Forms.Panel
    $detailPanel.Location = New-Object System.Drawing.Point(0, $y)
    $detailPanel.Size = New-Object System.Drawing.Size(685, 430)
    $detailPanel.AutoScroll = $true
    $detailPanel.BackColor = $bgDark
    $detailPanel.Visible = $false
    $form.Controls.Add($detailPanel)

    $ruleTexts = @{}
    $dpy = 5

    foreach ($group in $script:GROUPS) {
        $gh = New-Object System.Windows.Forms.Label
        $gh.Text = ([char]0x25A0) + " " + $group.name
        $gh.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
        $gh.ForeColor = $fgGroup
        $gh.Location = New-Object System.Drawing.Point(20, $dpy); $gh.AutoSize = $true
        $detailPanel.Controls.Add($gh)
        $dpy += 24

        foreach ($item in $group.items) {
            $rl = New-Object System.Windows.Forms.Label
            $rl.Text = "  " + $item.label + ":"
            $rl.Location = New-Object System.Drawing.Point(20, ($dpy + 3))
            $rl.Size = New-Object System.Drawing.Size(160, 20)
            $detailPanel.Controls.Add($rl)

            $rt = New-Object System.Windows.Forms.TextBox
            $val = ""; if ($cfg.ContainsKey($item.key)) { $val = $cfg[$item.key] }
            $rt.Text = $val
            $rt.Location = New-Object System.Drawing.Point(185, $dpy)
            $rt.Size = New-Object System.Drawing.Size(390, 22)
            $rt.BackColor = $bgInput; $rt.ForeColor = $fgText
            $detailPanel.Controls.Add($rt)
            $ruleTexts[$item.key] = $rt

            $rb = New-Object System.Windows.Forms.Button
            $rb.Text = "..."; $rb.Location = New-Object System.Drawing.Point(585, $dpy)
            $rb.Size = New-Object System.Drawing.Size(40, 22); $rb.FlatStyle = "Flat"; $rb.BackColor = $bgBtn
            $rb.Tag = $rt
            $rb.Add_Click({ $fbd = New-Object System.Windows.Forms.FolderBrowserDialog; if ($fbd.ShowDialog() -eq "OK") { $this.Tag.Text = $fbd.SelectedPath } })
            $detailPanel.Controls.Add($rb)
            $dpy += 26
        }
        $dpy += 10
    }

    # ── Mode toggle logic ───────────────────────────────
    function Update-ModeUI {
        if ($rbSimple.Checked) {
            $simplePanel.Visible = $true
            $detailPanel.Visible = $false
        } else {
            $simplePanel.Visible = $false
            $detailPanel.Visible = $true
        }
    }

    $rbSimple.Add_CheckedChanged({ Update-ModeUI })
    $rbDetail.Add_CheckedChanged({ Update-ModeUI })
    Update-ModeUI

    # ── Bottom buttons ──────────────────────────────────
    $bottomPanel = New-Object System.Windows.Forms.Panel
    $bottomPanel.Dock = "Bottom"; $bottomPanel.Height = 45; $bottomPanel.BackColor = $bgBottom
    $form.Controls.Add($bottomPanel)

    $btnSave = New-Object System.Windows.Forms.Button
    $btnSave.Text = "저장"
    $btnSave.Location = New-Object System.Drawing.Point(510, 8)
    $btnSave.Size = New-Object System.Drawing.Size(80, 30); $btnSave.FlatStyle = "Flat"
    $btnSave.BackColor = $fgAccent; $btnSave.ForeColor = $bgDark
    $btnSave.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $btnSave.Add_Click({
        $newCfg = @{}
        $newCfg["download_folder"] = $txtDL.Text
        if ($chkWeb.Checked) { $newCfg["open_webapp_on_start"] = "true" } else { $newCfg["open_webapp_on_start"] = "false" }
        if ($rbSimple.Checked) {
            $newCfg["mode"] = "simple"
            $newCfg["root_folder"] = $txtRoot.Text
        } else {
            $newCfg["mode"] = "detail"
            $newCfg["root_folder"] = ""
            foreach ($k in $ruleTexts.Keys) {
                $v = $ruleTexts[$k].Text.Trim()
                if ($v -ne "") { $newCfg[$k] = $v }
            }
        }
        Save-Config $newCfg
        Restart-Watcher
        [System.Windows.Forms.MessageBox]::Show("설정이 저장되었습니다.", "완료")
        $form.Close()
    })
    $bottomPanel.Controls.Add($btnSave)

    $btnCancel = New-Object System.Windows.Forms.Button
    $btnCancel.Text = "취소"
    $btnCancel.Location = New-Object System.Drawing.Point(600, 8)
    $btnCancel.Size = New-Object System.Drawing.Size(60, 30); $btnCancel.FlatStyle = "Flat"; $btnCancel.BackColor = $bgBtn
    $btnCancel.Add_Click({ $form.Close() })
    $bottomPanel.Controls.Add($btnCancel)

    $form.ShowDialog()
}

# ── Watcher (timer-based polling) ───────────────────────
$script:knownFiles = @{}
$script:pollTimer = $null

function Start-Watcher {
    if ($script:pollTimer) { return }
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = 3000
    $timer.Add_Tick({
        $cfg = Load-Config
        $dlFolder = $cfg["download_folder"]
        if (-not $dlFolder -or -not (Test-Path $dlFolder)) { return }
        $files = Get-ChildItem -Path $dlFolder -File -ErrorAction SilentlyContinue
        foreach ($f in $files) {
            $fp = $f.FullName
            $fname = $f.Name
            if ($fname -match '\.(crdownload|tmp|part)$') { continue }
            # Skip already processed
            if ($script:knownFiles.ContainsKey($fp)) { continue }
            # Check if file matches any pattern
            $matched = $false
            foreach ($pat in $script:ALL_PATTERNS) {
                $m = [regex]::Match($fname, $pat.pattern)
                if ($m.Success) {
                    $matched = $true
                    $year = $null; $month = $null
                    if ($pat.yearG -gt 0 -and $m.Groups[$pat.yearG].Success) { $year = $m.Groups[$pat.yearG].Value }
                    if ($pat.monthG -gt 0 -and $m.Groups[$pat.monthG].Success) { $month = $m.Groups[$pat.monthG].Value.PadLeft(2, '0') }
                    $destDir = Get-DestFolder $cfg $pat.key $year $month
                    if (-not $destDir) { break }
                    # Wait for stable file size
                    $sz1 = $f.Length
                    Start-Sleep -Milliseconds 1000
                    if (-not (Test-Path $fp)) { break }
                    $sz2 = (Get-Item $fp).Length
                    if ($sz2 -ne $sz1 -or $sz2 -eq 0) { break }
                    try {
                        Move-ToFolder $fp $destDir
                        $script:knownFiles[$fp] = $true
                        Show-Balloon $fname "이동 완료"
                    } catch {}
                    break
                }
            }
            if (-not $matched) { $script:knownFiles[$fp] = $true }
        }
    })
    $timer.Start()
    $script:pollTimer = $timer
}

function Restart-Watcher {
    if ($script:pollTimer) { $script:pollTimer.Stop(); $script:pollTimer.Dispose(); $script:pollTimer = $null }
    $script:knownFiles = @{}
    Start-Watcher
}

# ── Tray App ────────────────────────────────────────────
function Start-TrayApp {
    $cfg = Load-Config
    if ($cfg["open_webapp_on_start"] -eq "true") { Open-WebApp }

    $hasConfig = ($cfg["mode"] -eq "simple" -and $cfg["root_folder"] -ne "") -or ($cfg["mode"] -eq "detail")
    if (-not $hasConfig) { Show-Settings }

    Start-Watcher

    $icon = New-Object System.Windows.Forms.NotifyIcon
    $icon.Text = "CHA Bio 파일 분류"; $icon.Visible = $true
    $script:notifyIcon = $icon

    $bmp = New-Object System.Drawing.Bitmap(32, 32)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(137, 180, 250))
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($brush, 8, 12, 16, 12)
    $points = @((New-Object System.Drawing.Point(16, 5)), (New-Object System.Drawing.Point(8, 14)), (New-Object System.Drawing.Point(24, 14)))
    $g.FillPolygon($brush, $points)
    $brush.Dispose(); $g.Dispose()
    $icon.Icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())

    $menu = New-Object System.Windows.Forms.ContextMenuStrip
    $miWeb = New-Object System.Windows.Forms.ToolStripMenuItem; $miWeb.Text = "웹앱 열기"
    $miWeb.Add_Click({ Open-WebApp }); $menu.Items.Add($miWeb) | Out-Null
    $miSet = New-Object System.Windows.Forms.ToolStripMenuItem; $miSet.Text = "설정"
    $miSet.Add_Click({ Show-Settings }); $menu.Items.Add($miSet) | Out-Null
    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null
    $miQuit = New-Object System.Windows.Forms.ToolStripMenuItem; $miQuit.Text = "종료"
    $miQuit.Add_Click({
        if ($script:pollTimer) { $script:pollTimer.Stop(); $script:pollTimer.Dispose() }
        $script:notifyIcon.Visible = $false; $script:notifyIcon.Dispose()
        [System.Windows.Forms.Application]::Exit()
    }); $menu.Items.Add($miQuit) | Out-Null

    $icon.ContextMenuStrip = $menu
    $icon.Add_DoubleClick({ Show-Settings })
    Show-Balloon "CHA Bio 파일 분류" "파일 감시 시작됨"
    [System.Windows.Forms.Application]::Run()
}

Start-TrayApp
