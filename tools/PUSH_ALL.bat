@echo off
chcp 65001 >nul
echo ========================================
echo DANG PUBLIC 53 BAI SEO LEN WORDPRESS...
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "D:\.thongtaccongquangninh\tools\push_all_drafts.ps1"
echo.
pause
