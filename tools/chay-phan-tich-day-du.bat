@echo off
chcp 65001 >nul
cd /d D:\.thongtaccongquangninh

echo ============================================
echo  BUOC 1/3: Tai code moi nhat tu GitHub
echo ============================================
git pull

echo ============================================
echo  BUOC 2/3: Crawl toan bo site (122 URL, mat vai phut)
echo ============================================
node tools\tai-keyword-crawl-audit.mjs

echo ============================================
echo  BUOC 3/3: Phan tich va xuat ket luan
echo ============================================
node tools\phan-tich-ket-qua-crawl.mjs

echo ============================================
echo  XONG. Ket qua nam trong thu muc reports\
echo  Tim file ten: phan-tich-tai-*.md
echo ============================================
pause
