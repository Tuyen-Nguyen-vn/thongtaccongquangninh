@echo off
REM Chạy Daily Dashboard SEO — thongtaccongquangninh.com
REM Scheduled bởi Windows Task Scheduler mỗi sáng 7:00

cd /d "D:\.thongtaccongquangninh"
node tools/daily_dashboard.mjs >> logs\dashboard.log 2>&1
