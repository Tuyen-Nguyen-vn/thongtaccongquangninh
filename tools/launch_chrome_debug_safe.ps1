Write-Output "Stopping Chrome..."
taskkill /F /IM chrome.exe >$null 2>&1
Start-Sleep -Seconds 4

$src = "C:\Users\DELL\AppData\Local\Google\Chrome\User Data"
$dst = "C:\Users\DELL\AppData\Local\Google\Chrome\User Data Debug"

# Create destination directories
New-Item -ItemType Directory -Force -Path "$dst\Default\Network" >$null 2>&1

Write-Output "Copying Local State and Cookies..."
# Copy Local State (contains encryption keys)
Copy-Item -Path "$src\Local State" -Destination "$dst\Local State" -Force -ErrorAction SilentlyContinue

# Copy Cookies file (contains sessions)
if (Test-Path "$src\Default\Network\Cookies") {
    Copy-Item -Path "$src\Default\Network\Cookies" -Destination "$dst\Default\Network\Cookies" -Force -ErrorAction SilentlyContinue
    Write-Output "✓ Copied Default\Network\Cookies"
} elseif (Test-Path "$src\Default\Cookies") {
    Copy-Item -Path "$src\Default\Cookies" -Destination "$dst\Default\Cookies" -Force -ErrorAction SilentlyContinue
    Write-Output "✓ Copied Default\Cookies (legacy path)"
} else {
    Write-Output "⚠️ Cookies file not found!"
}

# Robocopy the rest of the Default folder (excluding heavy cache folders)
Write-Output "Robocopying profile settings..."
robocopy "$src\Default" "$dst\Default" /E /R:1 /W:1 /XD Cache "Code Cache" GPUCache "Web Applications" "Service Worker" "Network" > $null

# Delete lock files
Remove-Item -Path "$dst\SingletonLock" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$dst\Default\SingletonLock" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$dst\lockfile" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$src\DevToolsActivePort" -Force -ErrorAction SilentlyContinue

# Create shortcut
$lnkPath = "D:\.thongtaccongquangninh\scratch\ChromeDebug.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnkPath)
$shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$shortcut.Arguments = "--remote-debugging-port=9222 --user-data-dir=""$dst"" --no-sandbox"
$shortcut.Save()

Write-Output "Launching Chrome Debug..."
explorer.exe $lnkPath
Start-Sleep -Seconds 8

try {
    $json = Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/version'
    Write-Output "Successfully launched Chrome debug on port 9222!"
    Write-Output "WebSocket URL: $($json.webSocketDebuggerUrl)"
} catch {
    Write-Error "Failed to connect to Chrome debug port: $_"
}
