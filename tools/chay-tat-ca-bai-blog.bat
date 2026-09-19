@echo off
chcp 65001 >nul
cd /d D:\.thongtaccongquangninh

echo ============================================
echo  Tai code moi nhat
echo ============================================
git pull

echo.
echo ============================================
echo  CANH BAO: neu batch nao ban DA chay/dang bai roi,
echo  dung chay lai - se tao bai nhap TRUNG SLUG (WordPress
echo  tu them -2 vao cuoi, khong mat du lieu cu nhung bi trung).
echo  Bo dau "rem " o dau dong ung voi batch CHUA chay.
echo ============================================
echo.

rem --- 1/6: Cam nang hut be phot tai Ha Long ---
rem node tools\publish_cam_nang_hut_be_phot_ha_long.mjs

rem --- 2/6: Cam nang hut be phot tai Cam Pha + Uong Bi ---
rem node tools\publish_cam_nang_batch2.mjs

rem --- 3/6: Cam nang hut be phot tai Quang Yen, Mong Cai, Dong Trieu, Van Don ---
rem node tools\publish_cam_nang_batch3.mjs

rem --- 4/6: Cam nang thong tac cong tai 6 dia ban ---
rem node tools\publish_cam_nang_thong_tac_cong_batch1.mjs

rem --- 5/6: Cam nang thong tac bon cau tai 7 dia ban ---
rem node tools\publish_cam_nang_thong_tac_bon_cau_batch1.mjs

echo --- 6/6: Cam nang hut ham cau tai 7 dia ban (MOI, CHUA chay lan nao) ---
node tools\publish_cam_nang_hut_ham_cau_batch1.mjs

echo.
echo ============================================
echo  XONG. Viec tiep theo (lam tay trong WordPress):
echo  1. Mo tung link "DA TAO BAI NHAP: ..." in ra o tren
echo  2. Them 2 anh that/bai theo goi y alt text da in kem
echo  3. Doc lai, bam DANG (Publish) khi ung y
echo ============================================
pause
