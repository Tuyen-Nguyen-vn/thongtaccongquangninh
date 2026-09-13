@echo off
chcp 65001 >nul
cd /d D:\.thongtaccongquangninh

echo ============================================
echo  Tai code moi nhat
echo ============================================
git pull

echo.
echo ============================================
echo  Tao 20 bai blog NHAP (chua cong khai, an toan)
echo ============================================
echo.
echo --- 1/5: Cam nang hut be phot tai Ha Long ---
node tools\publish_cam_nang_hut_be_phot_ha_long.mjs

echo.
echo --- 2/5: Cam nang hut be phot tai Cam Pha + Uong Bi ---
node tools\publish_cam_nang_batch2.mjs

echo.
echo --- 3/5: Cam nang hut be phot tai Quang Yen, Mong Cai, Dong Trieu, Van Don ---
node tools\publish_cam_nang_batch3.mjs

echo.
echo --- 4/5: Cam nang thong tac cong tai 6 dia ban ---
node tools\publish_cam_nang_thong_tac_cong_batch1.mjs

echo.
echo --- 5/5: Cam nang thong tac bon cau tai 7 dia ban ---
node tools\publish_cam_nang_thong_tac_bon_cau_batch1.mjs

echo.
echo ============================================
echo  XONG. Viec tiep theo (lam tay trong WordPress):
echo  1. Mo tung link "DA TAO BAI NHAP: ..." in ra o tren
echo  2. Them 2 anh that/bai theo goi y alt text da in kem
echo  3. Doc lai, bam DANG (Publish) khi ung y
echo ============================================
pause
