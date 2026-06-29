Write-Host '[INFO] Doctor dự án thongtaccongquangninh' -ForegroundColor Cyan
foreach ($cmd in @('git', 'curl', 'wget', 'rg', 'fzf', 'node', 'python', 'docker')) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Host "OK   $cmd" } else { Write-Host "MISS $cmd" -ForegroundColor Yellow }
}
