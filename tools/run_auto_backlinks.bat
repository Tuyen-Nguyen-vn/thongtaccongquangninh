@echo off
title CONG CU DI BACKLINK TU DONG - ANH TUYEN
chcp 65001 > nul
cls

:menu
cls
echo ==========================================================
echo    CÔNG CỤ ĐI BACKLINK VÀ THỰC THỂ TỰ ĐỘNG - ANH TUYỀN
echo ==========================================================
echo.
echo  [1] THIẾT LẬP (Đăng nhập tài khoản Pinterest, Twitter lần đầu)
echo  [2] CHẠY ẨN TỰ ĐỘNG 100%% (Không hiện cửa sổ trình duyệt)
echo  [3] CHẠY TỰ ĐỘNG CÓ GIAO DIỆN (Interactive UI kéo thả)
echo  [4] THOÁT
echo.
echo ==========================================================
set /p choice="Nhập lựa chọn của anh (1-4): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto auto
if "%choice%"=="3" goto interactive
if "%choice%"=="4" exit
echo Lựa chọn không hợp lệ! Vui lòng chọn lại.
pause
goto menu

:setup
echo.
echo === ĐANG CHẠY CHẾ ĐỘ THIẾT LẬP ĐĂNG NHẬP... ===
node auto_backlink_v2.js --setup
echo.
echo [Xong] Đã hoàn thành quá trình thiết lập.
pause
goto menu

:auto
echo.
echo === ĐANG CHẠY CHẾ ĐỘ TỰ ĐỘNG CHẠY ẨN 100%%... ===
node auto_backlink_v2.js --auto
echo.
echo [Xong] Đã hoàn thành chiến dịch chạy ẩn.
pause
goto menu

:interactive
echo.
echo === ĐANG CHẠY CHẾ ĐỘ CÓ GIAO DIỆN TƯƠNG TÁC... ===
node auto_backlink_v2.js --interactive
echo.
echo [Xong] Đã hoàn thành phiên tương tác.
pause
goto menu
