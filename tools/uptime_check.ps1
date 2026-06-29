# Uptime Monitor — thongtaccongquangninh.com
# Chạy bởi Task Scheduler mỗi 5 phút
# Nếu site down: hiện thông báo Windows + ghi log

$site = "https://thongtaccongquangninh.com"
$logFile = "D:\.thongtaccongquangninh\logs\uptime.log"
$statusFile = "D:\.thongtaccongquangninh\logs\uptime_status.json"
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Kiểm tra site
try {
    $response = Invoke-WebRequest -Uri $site -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    $status = $response.StatusCode
    $ok = $status -lt 400
} catch {
    $status = 0
    $ok = $false
    $errMsg = $_.Exception.Message
}

# Đọc trạng thái lần trước
$lastStatus = $null
if (Test-Path $statusFile) {
    try { $lastStatus = Get-Content $statusFile | ConvertFrom-Json } catch {}
}

# Ghi log
$logLine = "$now | Status=$status | OK=$ok"
Add-Content -Path $logFile -Value $logLine

# Ghi status hiện tại
$currentStatus = @{ time = $now; status = $status; ok = $ok }
$currentStatus | ConvertTo-Json | Set-Content -Path $statusFile -Encoding utf8

# Nếu DOWN → thông báo Windows
if (-not $ok) {
    $title = "⚠️ Website DOWN!"
    $msg = "thongtaccongquangninh.com không truy cập được lúc $now (HTTP $status)"

    # Windows Toast Notification
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $balloon = New-Object System.Windows.Forms.NotifyIcon
        $balloon.Icon = [System.Drawing.SystemIcons]::Warning
        $balloon.BalloonTipIcon = "Warning"
        $balloon.BalloonTipTitle = $title
        $balloon.BalloonTipText = $msg
        $balloon.Visible = $true
        $balloon.ShowBalloonTip(10000)
        Start-Sleep -Seconds 2
        $balloon.Dispose()
    } catch {}

    Add-Content -Path $logFile -Value ">>> ALERT: $msg"
    Write-Host "DOWN: $msg" -ForegroundColor Red
} else {
    # Nếu vừa phục hồi từ DOWN → thông báo OK
    if ($lastStatus -and -not $lastStatus.ok) {
        $recoverMsg = "thongtaccongquangninh.com đã hoạt động trở lại lúc $now"
        try {
            Add-Type -AssemblyName System.Windows.Forms
            $balloon = New-Object System.Windows.Forms.NotifyIcon
            $balloon.Icon = [System.Drawing.SystemIcons]::Information
            $balloon.BalloonTipIcon = "Info"
            $balloon.BalloonTipTitle = "✅ Website OK trở lại"
            $balloon.BalloonTipText = $recoverMsg
            $balloon.Visible = $true
            $balloon.ShowBalloonTip(8000)
            Start-Sleep -Seconds 2
            $balloon.Dispose()
        } catch {}
        Add-Content -Path $logFile -Value ">>> RECOVERED: $recoverMsg"
    }
    Write-Host "OK: $site (HTTP $status)" -ForegroundColor Green
}
