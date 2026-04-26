# CHA Bio Complex - Download File Auto-Organizer
# Windows 7+ (PowerShell 2.0+ / .NET 3.5+)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$global:WEB_APP_URL = "https://cbc7119.pages.dev"
$global:CONFIG_DIR = Join-Path $env:USERPROFILE ".cha-bio-watchdog"
$global:CONFIG_FILE = Join-Path $global:CONFIG_DIR "config.txt"
$global:watcher = $null
$global:notifyIcon = $null
$global:SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$global:MENU_PDF_PATTERN = '^CBC Weekly MENU \((\d{2})\.(\d{2})_(\d{2})\.(\d{2})\)\.pdf$'
$global:ELEV_CERT_PATTERN = '^Secure document \(2D Barcode\)(\s*\(\d+\))?\.pdf$'

# TLS 1.2 (Cloudflare 요구) + Windows 7 SSL 인증서 우회
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# ── File Patterns (grouped) ────────────────────────────
$global:GROUPS = @(
    @{ name="1. 업무 계획 및 일지"; items=@(
        @{ key="daily_single";  label="일별업무일지";       pattern='^(\d{1,2})월(\d{2})일 방재업무일지\.xlsx$';                       yearG=0; monthG=1 }
        @{ key="daily_monthly"; label="월별업무일지";       pattern='^일일업무일지\((\d{2})월\)\.xlsx$';                               yearG=0; monthG=1 }
        @{ key="work_log";      label="수행기록표";         pattern='^소방안전관리자_업무수행기록표_(\d{4})년_(\d{1,2})월\.xlsx$';       yearG=1; monthG=2 }
        @{ key="monthly_plan";  label="월간업무추진계획";    pattern='^(\d{4})년_(\d{1,2})월_중요업무추진계획\(방재\)\.xlsx$';           yearG=1; monthG=2 }
        @{ key="annual_plan";   label="연간업무추진계획";    pattern='^(\d{4})년 연간 업무 추진 계획\.xlsx$';                           yearG=1; monthG=0 }
    )}
    @{ name="2. 각종 운영 문서"; items=@(
        @{ key="shift";         label="월별근무표";         pattern='^(\d{4})년_(\d{1,2})월_근무표\.xlsx$';                            yearG=1; monthG=2 }
        @{ key="leave";         label="휴가신청서";         pattern='^휴가신청서_.+_(\d{4})(\d{2})\d{2}\.xlsx$';                      yearG=1; monthG=2 }
    )}
    @{ name="3. 점검 및 조치"; items=@(
        @{ key="remed";         label="일상점검조치";       pattern='^조치보고서_.+_(\d{4})(\d{2})\d{2}\.html$';                      yearG=1; monthG=2 }
        @{ key="legal";         label="소방점검조치";       pattern='^지적사항_.+\.zip$';                                             yearG=0; monthG=0 }
    )}
    @{ name="4. 소방설비점검일지"; items=@(
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
    @{ name="5. 승강기 관련"; items=@(
        @{ key="elev_cert";       label="검사결과 및 성적서"; pattern='^PLACEHOLDER_ELEV_CERT$';                                      yearG=0; monthG=0 }
        @{ key="elev_periodic";   label="정기 점검";          pattern='^VFM_Maintenance.*\.pdf$';                                    yearG=0; monthG=0 }
        @{ key="elev_quotation";  label="견적서";             pattern='^.*Quotation.*?(?:_(\d{4})(\d{2})\d{2}\d{6})?\.pdf$';         yearG=1; monthG=2 }
    )}
    @{ name="6. QR 코드"; items=@(
        @{ key="qr_ext_insp";   label="소화기점검용";       pattern='^소화기_점검용_QR\.pdf$';                                        yearG=0; monthG=0 }
        @{ key="qr_ext_pub";    label="소화기점검표";       pattern='^소화기_점검확인용_QR\.pdf$';                                    yearG=0; monthG=0 }
        @{ key="qr_hydrant";    label="소화전점검용";       pattern='^소화전_점검용_QR\.pdf$';                                        yearG=0; monthG=0 }
        @{ key="qr_div";        label="DIV점검용";          pattern='^DIV_점검용_QR\.pdf$';                                           yearG=0; monthG=0 }
        @{ key="qr_clean";      label="청정점검용";         pattern='^청정소화약제_점검용_QR\.pdf$';                                  yearG=0; monthG=0 }
        @{ key="qr_descend";    label="완강기점검용";       pattern='^완강기_점검용_QR\.pdf$';                                        yearG=0; monthG=0 }
        @{ key="qr_damper";     label="제연댐퍼점검용";     pattern='^전실제연댐퍼_점검용_QR\.pdf$';                                  yearG=0; monthG=0 }
        @{ key="qr_shutter";    label="방화셔터점검용";     pattern='^방화셔터_점검용_QR\.pdf$';                                      yearG=0; monthG=0 }
    )}
    @{ name="7. 백업"; items=@(
        @{ key="backup_db";     label="DB백업";             pattern='^cha-bio-safety_(\d{4})-(\d{2})-\d{2}\.sql$';                   yearG=1; monthG=2 }
        @{ key="backup_r2";     label="파일백업";           pattern='^cha-bio-r2_(\d{4})-(\d{2})-\d{2}\.zip$';                      yearG=1; monthG=2 }
    )}
)

$global:ALL_PATTERNS = @()
foreach ($g in $global:GROUPS) { foreach ($item in $g.items) { $global:ALL_PATTERNS += $item } }

# Build lookup: key → (groupName, label)
$global:KEY_INFO = @{}
foreach ($g in $global:GROUPS) {
    foreach ($item in $g.items) {
        $global:KEY_INFO[$item.key] = @{ group=$g.name; label=$item.label }
    }
}

# ── Config ──────────────────────────────────────────────
function Load-Config {
    $cfg = @{}
    $cfg["download_folder"] = Join-Path $env:USERPROFILE "Downloads"
    $cfg["open_webapp_on_start"] = "true"
    $cfg["mode"] = "simple"
    $cfg["root_folder"] = ""
    $cfg["menu_auto_import"] = "false"
    $cfg["api_staff_id"] = ""
    $cfg["api_password"] = ""
    if (Test-Path $global:CONFIG_FILE) {
        $lines = [System.IO.File]::ReadAllLines($global:CONFIG_FILE, [System.Text.Encoding]::UTF8)
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
    if (-not (Test-Path $global:CONFIG_DIR)) { New-Item -ItemType Directory -Path $global:CONFIG_DIR -Force | Out-Null }
    $lines = New-Object System.Collections.ArrayList
    $lines.Add("# CHA Bio File Organizer Config") | Out-Null
    $lines.Add("download_folder=" + $cfg["download_folder"]) | Out-Null
    $lines.Add("open_webapp_on_start=" + $cfg["open_webapp_on_start"]) | Out-Null
    $lines.Add("mode=" + $cfg["mode"]) | Out-Null
    $lines.Add("root_folder=" + $cfg["root_folder"]) | Out-Null
    $lines.Add("") | Out-Null
    $lines.Add("# 식단표 자동 등록") | Out-Null
    $lines.Add("menu_auto_import=" + $cfg["menu_auto_import"]) | Out-Null
    $lines.Add("api_staff_id=" + $cfg["api_staff_id"]) | Out-Null
    $lines.Add("api_password=" + $cfg["api_password"]) | Out-Null
    $lines.Add("") | Out-Null
    foreach ($pat in $global:ALL_PATTERNS) {
        if ($cfg.ContainsKey($pat.key) -and $cfg[$pat.key] -ne "") {
            $lines.Add($pat.key + "=" + $cfg[$pat.key]) | Out-Null
        }
    }
    [System.IO.File]::WriteAllLines($global:CONFIG_FILE, $lines.ToArray(), [System.Text.Encoding]::UTF8)
}

# ── Chrome 백그라운드 실행 활성화 (푸시 알림 수신 유지) ──
function Enable-ChromeBackground {
    $regPath = "HKCU:\Software\Policies\Google\Chrome"
    try {
        if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
        $cur = Get-ItemProperty -Path $regPath -Name "BackgroundModeEnabled" -ErrorAction SilentlyContinue
        if (-not $cur -or $cur.BackgroundModeEnabled -ne 1) {
            Set-ItemProperty -Path $regPath -Name "BackgroundModeEnabled" -Value 1 -Type DWord
        }
    } catch {}
}

# ── Open PWA (설치된 PWA 우선, 없으면 Chrome app mode) ──
$global:PWA_APP_ID = "kbhogldhkfnbkoghoggjepkcfcbkacfh"

function Open-WebApp {
    # 설치된 PWA를 chrome_proxy.exe로 실행
    $proxyPaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome_proxy.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome_proxy.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome_proxy.exe"
    )
    foreach ($p in $proxyPaths) {
        if (Test-Path $p) {
            Start-Process $p -ArgumentList "--profile-directory=Default --app-id=$($global:PWA_APP_ID)"
            return
        }
    }
    # PWA 못 찾으면 Chrome app mode 폴백
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    foreach ($p in $chromePaths) {
        if (Test-Path $p) {
            Start-Process $p -ArgumentList ("--app=" + $global:WEB_APP_URL)
            return
        }
    }
    Start-Process $global:WEB_APP_URL
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
        $info = $global:KEY_INFO[$patKey]
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
    foreach ($pat in $global:ALL_PATTERNS) {
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
    if ($global:notifyIcon) {
        $global:notifyIcon.BalloonTipTitle = $title
        $global:notifyIcon.BalloonTipText = $text
        $global:notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
        $global:notifyIcon.ShowBalloonTip(3000)
    }
}

# ── Process Menu PDF (PS 5.1 + Python/PyMuPDF) ─────────
function Process-MenuPdf($filePath) {
    $cfg = Load-Config
    if ($cfg["menu_auto_import"] -ne "true") { return $false }

    $fileName = Split-Path $filePath -Leaf
    $menuMatch = [regex]::Match($fileName, $global:MENU_PDF_PATTERN)
    if (-not $menuMatch.Success) { return $false }

    # 다운로드 완료 대기
    $prevSize = -1
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Milliseconds 500
        if (-not (Test-Path $filePath)) { return $true }
        $curSize = (Get-Item $filePath).Length
        if ($curSize -eq $prevSize -and $curSize -gt 0) { break }
        $prevSize = $curSize
    }

    Show-Balloon "식단표 감지" "메뉴 파싱 중..."

    # Python 파서 호출
    $parseScript = Join-Path $global:SCRIPT_DIR "parse_menu.py"
    if (-not (Test-Path $parseScript)) {
        Show-Balloon "식단표 오류" "parse_menu.py 파일이 없습니다"
        return $true
    }

    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "python"
        $psi.Arguments = "`"$parseScript`" `"$filePath`""
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
        $proc = [System.Diagnostics.Process]::Start($psi)
        $resultStr = $proc.StandardOutput.ReadToEnd()
        $errStr = $proc.StandardError.ReadToEnd()
        $proc.WaitForExit()

        if ($proc.ExitCode -ne 0 -or -not $resultStr) {
            Show-Balloon "식단표 오류" ("Python 오류: " + $(if ($errStr) { $errStr.Substring(0, [Math]::Min(100, $errStr.Length)) } else { "출력 없음" }))
            return $true
        }
        $json = $resultStr | ConvertFrom-Json
    } catch {
        Show-Balloon "식단표 오류" "Python 실행 실패: $_"
        return $true
    }

    if ($json.error) {
        Show-Balloon "식단표 오류" $json.error
        return $true
    }

    # API 인증 정보 확인
    $apiBase = $global:WEB_APP_URL
    $staffId = $cfg["api_staff_id"]
    $password = $cfg["api_password"]
    if (-not $staffId -or $staffId -eq "" -or -not $password -or $password -eq "") {
        Show-Balloon "식단표 오류" "설정에서 관리자 사번/비밀번호를 입력하세요"
        return $true
    }

    # 로그인
    try {
        $loginBody = @{ staffId = $staffId; password = $password } | ConvertTo-Json
        $loginResp = Invoke-RestMethod -Uri "$apiBase/api/auth/login" -Method POST `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($loginBody)) `
            -ContentType "application/json; charset=utf-8"
        $token = $loginResp.data.token
    } catch {
        Show-Balloon "식단표 오류" "API 로그인 실패"
        return $true
    }

    # PDF 업로드 (R2)
    $pdfKey = $null
    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
        $enc = [System.Text.Encoding]::UTF8
        $crlf = "`r`n"
        $hdr = "--$boundary$crlf" +
               "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"$crlf" +
               "Content-Type: application/pdf$crlf$crlf"
        $ftr = "$crlf--$boundary--$crlf"
        $hdrB = $enc.GetBytes($hdr)
        $ftrB = $enc.GetBytes($ftr)
        $body = New-Object byte[] ($hdrB.Length + $fileBytes.Length + $ftrB.Length)
        [System.Buffer]::BlockCopy($hdrB, 0, $body, 0, $hdrB.Length)
        [System.Buffer]::BlockCopy($fileBytes, 0, $body, $hdrB.Length, $fileBytes.Length)
        [System.Buffer]::BlockCopy($ftrB, 0, $body, ($hdrB.Length + $fileBytes.Length), $ftrB.Length)

        $uploadResp = Invoke-RestMethod -Uri "$apiBase/api/uploads" -Method POST -Body $body `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Headers @{ Authorization = "Bearer $token" }
        $pdfKey = $uploadResp.data.key
    } catch {
        # PDF 업로드 실패해도 메뉴 등록은 계속 진행
    }

    # 메뉴 등록
    try {
        $menuPayload = @{ menus = $json.menus }
        if ($pdfKey) { $menuPayload["pdf_key"] = $pdfKey }

        $menuBody = $menuPayload | ConvertTo-Json -Depth 5
        $menuResp = Invoke-RestMethod -Uri "$apiBase/api/menu" -Method POST `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($menuBody)) `
            -ContentType "application/json; charset=utf-8" `
            -Headers @{ Authorization = "Bearer $token" }

        if ($menuResp.success) {
            $count = ($json.menus | Where-Object { $_.lunch_a }).Count
            Show-Balloon "식단표 등록 완료" "$count 일치 메뉴가 등록되었습니다"
        } else {
            Show-Balloon "식단표 오류" $menuResp.error
        }
    } catch {
        Show-Balloon "식단표 오류" "메뉴 등록 실패: $_"
    }

    return $true
}

# ── Process Elevator Cert PDF (검사성적서 자동 분류) ────
function Process-ElevCertPdf($filePath) {
    $fileName = Split-Path $filePath -Leaf
    $certMatch = [regex]::Match($fileName, $global:ELEV_CERT_PATTERN)
    if (-not $certMatch.Success) { return $false }

    # 다운로드 완료 대기
    $prevSize = -1
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Milliseconds 500
        if (-not (Test-Path $filePath)) { return $true }
        $curSize = (Get-Item $filePath).Length
        if ($curSize -eq $prevSize -and $curSize -gt 0) { break }
        $prevSize = $curSize
    }

    Show-Balloon "검사성적서 감지" "검사실시일 파싱 중..."

    # Python 파서 호출
    $parseScript = Join-Path $global:SCRIPT_DIR "parse_elev_cert.py"
    if (-not (Test-Path $parseScript)) {
        Show-Balloon "검사성적서 오류" "parse_elev_cert.py 파일이 없습니다"
        return $true
    }

    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "python"
        $psi.Arguments = "`"$parseScript`" `"$filePath`""
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
        $proc = [System.Diagnostics.Process]::Start($psi)
        $resultStr = $proc.StandardOutput.ReadToEnd()
        $errStr = $proc.StandardError.ReadToEnd()
        $proc.WaitForExit()

        if ($proc.ExitCode -ne 0 -or -not $resultStr) {
            Show-Balloon "검사성적서 오류" ("Python 오류: " + $(if ($errStr) { $errStr.Substring(0, [Math]::Min(100, $errStr.Length)) } else { "출력 없음" }))
            return $true
        }
        $json = $resultStr | ConvertFrom-Json
    } catch {
        Show-Balloon "검사성적서 오류" "Python 실행 실패: $_"
        return $true
    }

    if ($json.error) {
        Show-Balloon "검사성적서 오류" $json.error
        return $true
    }

    # 폴더 경로 계산: 5. 승강기 관련/검사결과 및 성적서/YYYY년/MM월/
    $cfg = Load-Config
    $destDir = Get-DestFolder $cfg "elev_cert" $json.year $json.month
    if (-not $destDir) {
        Show-Balloon "검사성적서" "저장 폴더 미설정 (설정에서 루트 폴더를 지정하세요)"
        return $true
    }

    # 파일명 변환: 검사성적서_YYYY-MM-DD.pdf
    $newName = "검사성적서_$($json.inspect_date).pdf"
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    $destFile = Join-Path $destDir $newName

    # 동일 이름 존재 시 번호 추가
    if (Test-Path $destFile) {
        $base = "검사성적서_$($json.inspect_date)"
        $n = 2
        while (Test-Path (Join-Path $destDir "${base}_${n}.pdf")) { $n++ }
        $destFile = Join-Path $destDir "${base}_${n}.pdf"
        $newName = "${base}_${n}.pdf"
    }

    try {
        Move-Item -Path $filePath -Destination $destFile -Force
        Show-Balloon $newName "이동 완료: $destDir"
    } catch {
        Show-Balloon "이동 실패" "$newName`n$_"
    }

    return $true
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
    $form.Size = New-Object System.Drawing.Size(700, 810)
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

    # ── 식단표 자동 등록 ────────────────────────────────
    $menuLabel = New-Object System.Windows.Forms.Label
    $menuLabel.Text = "식단표 자동 등록:"
    $menuLabel.Font = New-Object System.Drawing.Font($krFont, 10, [System.Drawing.FontStyle]::Bold)
    $menuLabel.ForeColor = $fgAccent
    $menuLabel.Location = New-Object System.Drawing.Point(20, $y); $menuLabel.AutoSize = $true
    $form.Controls.Add($menuLabel)
    $y += 22

    $chkMenu = New-Object System.Windows.Forms.CheckBox
    $chkMenu.Text = "식단표 PDF 감지 시 자동으로 DB에 등록"
    $chkMenu.Checked = ($cfg["menu_auto_import"] -eq "true")
    $chkMenu.Location = New-Object System.Drawing.Point(25, $y); $chkMenu.AutoSize = $true
    $chkMenu.ForeColor = $fgText
    $form.Controls.Add($chkMenu)
    $y += 24

    $lblStaff = New-Object System.Windows.Forms.Label
    $lblStaff.Text = "  관리자 사번:"
    $lblStaff.Location = New-Object System.Drawing.Point(20, ($y + 3)); $lblStaff.AutoSize = $true
    $form.Controls.Add($lblStaff)
    $txtStaff = New-Object System.Windows.Forms.TextBox
    $txtStaff.Text = $cfg["api_staff_id"]
    $txtStaff.Location = New-Object System.Drawing.Point(120, $y)
    $txtStaff.Size = New-Object System.Drawing.Size(150, 24)
    $txtStaff.BackColor = $bgInput; $txtStaff.ForeColor = $fgText
    $form.Controls.Add($txtStaff)

    $lblPwd = New-Object System.Windows.Forms.Label
    $lblPwd.Text = "비밀번호:"
    $lblPwd.Location = New-Object System.Drawing.Point(290, ($y + 3)); $lblPwd.AutoSize = $true
    $form.Controls.Add($lblPwd)
    $txtPwd = New-Object System.Windows.Forms.TextBox
    $txtPwd.Text = $cfg["api_password"]
    $txtPwd.Location = New-Object System.Drawing.Point(370, $y)
    $txtPwd.Size = New-Object System.Drawing.Size(150, 24)
    $txtPwd.BackColor = $bgInput; $txtPwd.ForeColor = $fgText
    $txtPwd.UseSystemPasswordChar = $true
    $form.Controls.Add($txtPwd)
    $y += 35

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

    foreach ($group in $global:GROUPS) {
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
        if ($chkMenu.Checked) { $newCfg["menu_auto_import"] = "true" } else { $newCfg["menu_auto_import"] = "false" }
        $newCfg["api_staff_id"] = $txtStaff.Text
        $newCfg["api_password"] = $txtPwd.Text
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

# ── 파일 처리 공통 (Created / Renamed 이벤트 공유) ──────
function Handle-DownloadFile($path) {
    if (-not (Test-Path $path)) { return }
    $fname = Split-Path $path -Leaf
    if ($fname -match '\.(crdownload|tmp|part)$') { return }

    # Chrome 중복 파일명 "(N)" 제거 후 원본 이름으로 매칭
    # 예: "4월17일 방재업무일지 (1).xlsx" → "4월17일 방재업무일지.xlsx"
    $cleanFname = $fname -replace '\s*\(\d+\)(?=\.[^.]+$)', ''

    # 식단표 PDF 우선 체크
    if (Process-MenuPdf $path) { return }

    # 승강기 검사성적서 PDF 체크
    if (Process-ElevCertPdf $path) { return }

    $cfg = Load-Config
    foreach ($pat in $global:ALL_PATTERNS) {
        $rm = [regex]::Match($cleanFname, $pat.pattern)
        if ($rm.Success) {
            $now = Get-Date
            $yr = $null; $mo = $null
            if ($pat.yearG -gt 0 -and $rm.Groups[$pat.yearG].Success) { $yr = $rm.Groups[$pat.yearG].Value }
            if ($pat.monthG -gt 0 -and $rm.Groups[$pat.monthG].Success) { $mo = $rm.Groups[$pat.monthG].Value.PadLeft(2, '0') }
            if (-not $yr -or $yr -eq "") { $yr = $now.Year.ToString() }
            if (-not $mo -or $mo -eq "") { $mo = $now.Month.ToString().PadLeft(2, '0') }

            $destDir = Get-DestFolder $cfg $pat.key $yr $mo
            if (-not $destDir) {
                Show-Balloon "분류 대상 없음" "$fname`n($($global:KEY_INFO[$pat.key].label)) 저장 폴더 미설정"
                return
            }

            try {
                Move-ToFolder $path $destDir
                Show-Balloon $fname "이동 완료: $destDir"
            } catch {
                Show-Balloon "이동 실패" "$fname`n$_"
            }
            return
        }
    }
}

# ── Watcher (Register-ObjectEvent) ──────────────────────
$global:fsWatcher = $null

function Start-Watcher {
    $cfg = Load-Config
    $dlFolder = $cfg["download_folder"]
    if (-not $dlFolder -or -not (Test-Path $dlFolder)) {
        Show-Balloon "감시 오류" "다운로드 폴더를 찾을 수 없습니다: $dlFolder"
        return
    }

    $w = New-Object System.IO.FileSystemWatcher
    $w.Path = $dlFolder
    $w.Filter = "*.*"
    $w.IncludeSubdirectories = $false
    $w.EnableRaisingEvents = $true

    Register-ObjectEvent -InputObject $w -EventName Created -SourceIdentifier "DLCreated" -Action {
        $path = $Event.SourceEventArgs.FullPath
        Start-Sleep -Seconds 3
        Handle-DownloadFile $path
    } | Out-Null

    Register-ObjectEvent -InputObject $w -EventName Renamed -SourceIdentifier "DLRenamed" -Action {
        $path = $Event.SourceEventArgs.FullPath
        Start-Sleep -Seconds 2
        Handle-DownloadFile $path
    } | Out-Null

    $global:fsWatcher = $w
}

function Restart-Watcher {
    if ($global:fsWatcher) {
        $global:fsWatcher.EnableRaisingEvents = $false
        $global:fsWatcher.Dispose()
        $global:fsWatcher = $null
    }
    Unregister-Event -SourceIdentifier "DLCreated" -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier "DLRenamed" -ErrorAction SilentlyContinue
    Start-Watcher
}

# ── Tray App (while loop — processes PS events via Start-Sleep) ──
function Start-TrayApp {
    Enable-ChromeBackground
    $cfg = Load-Config
    if ($cfg["open_webapp_on_start"] -eq "true") { Open-WebApp }

    $hasConfig = ($cfg["mode"] -eq "simple" -and $cfg["root_folder"] -ne "") -or ($cfg["mode"] -eq "detail")
    if (-not $hasConfig) { Show-Settings }

    Start-Watcher

    $icon = New-Object System.Windows.Forms.NotifyIcon
    $icon.Text = "CHA Bio 파일 분류"; $icon.Visible = $true
    $global:notifyIcon = $icon

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
        if ($global:fsWatcher) { $global:fsWatcher.Dispose() }
        $global:notifyIcon.Visible = $false
        $global:notifyIcon.Dispose()
        $global:appRunning = $false
    }); $menu.Items.Add($miQuit) | Out-Null

    $icon.ContextMenuStrip = $menu
    $icon.Add_DoubleClick({ Show-Settings })
    Show-Balloon "CHA Bio 파일 분류" "파일 감시 시작됨"

    # Main loop: DoEvents for UI + Start-Sleep processes PS event queue
    $global:appRunning = $true
    while ($global:appRunning) {
        [System.Windows.Forms.Application]::DoEvents()
        Start-Sleep -Milliseconds 500
    }
}

Start-TrayApp
