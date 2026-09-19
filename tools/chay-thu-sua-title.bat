@echo off
chcp 65001 >nul
cd /d D:\.thongtaccongquangninh
echo === Dang tai code moi nhat tu GitHub ===
git pull
echo.
echo === Dang chay thu (--dry, KHONG ghi gi len site) ===
node tools\fix_tai_title_meta_batch1.mjs --dry
echo.
echo === XONG. Doc ket qua o tren, chup man hinh hoac copy gui lai. ===
pause
