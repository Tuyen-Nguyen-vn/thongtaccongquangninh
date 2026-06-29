# Đăng ký Windows Task Scheduler — Daily Dashboard SEO
# Chạy 1 lần với quyền Admin:
#   Right-click PowerShell → "Run as administrator"
#   cd D:\.thongtaccongquangninh
#   .\tools\setup_scheduled_task.ps1

$TaskName = "SEO_Daily_Dashboard_thongtaccongquangninh"
$Description = "Tạo báo cáo SEO sáng hàng ngày cho thongtaccongquangninh.com"
$ScriptPath = "D:\.thongtaccongquangninh\tools\run_dashboard.bat"

# Xoá task cũ nếu có
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Tạo action
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`""

# Chạy mỗi sáng 7:00 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At "07:00"

# Cài đặt: chạy kể cả khi không login
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Đăng ký
Register-ScheduledTask `
    -TaskName $TaskName `
    -Description $Description `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -RunLevel Highest `
    -Force

Write-Host ""
Write-Host "✅ Đã đăng ký task: $TaskName" -ForegroundColor Green
Write-Host "   Chạy lúc: 07:00 AM hàng ngày" -ForegroundColor Cyan
Write-Host "   Script: $ScriptPath" -ForegroundColor Cyan
Write-Host "   Log: D:\.thongtaccongquangninh\logs\dashboard.log" -ForegroundColor Cyan
Write-Host ""
Write-Host "Kiểm tra task trong Task Scheduler → Task Scheduler Library → $TaskName"
Write-Host "Hoặc chạy thử ngay: Start-ScheduledTask -TaskName '$TaskName'"
