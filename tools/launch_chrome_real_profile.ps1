taskkill /F /IM chrome.exe >$null 2>&1
Start-Sleep -Seconds 2

# Path to real Chrome profile
$profilePath = "C:\Users\DELL\AppData\Local\Google\Chrome\User Data"

# Delete lock files to prevent Chrome from exiting immediately
Remove-Item -Path "$profilePath\SingletonLock" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$profilePath\Default\SingletonLock" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$profilePath\lockfile" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$profilePath\DevToolsActivePort" -Force -ErrorAction SilentlyContinue

# Launch Chrome with real profile and remote debugging enabled
$lnkPath = "D:\.thongtaccongquangninh\scratch\ChromeDebug.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnkPath)
$shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$shortcut.Arguments = "--remote-debugging-port=9222 --user-data-dir=""$profilePath"" --no-sandbox"
$shortcut.Save()

Write-Output "Launching Chrome with real profile via Explorer..."
explorer.exe $lnkPath
Start-Sleep -Seconds 8

try {
    $json = Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/version'
    Write-Output "Successfully launched Chrome debug on port 9222!"
    Write-Output "WebSocket URL: $($json.webSocketDebuggerUrl)"
} catch {
    Write-Error "Failed to connect to Chrome debug port: $_"
}
