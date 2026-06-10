# ClickGuard — Chống click ảo Google Ads, chạy độc lập trên máy

Công cụ **phát hiện, báo cáo và tự động chặn IP click ảo** vào quảng cáo
Google Ads. **Không cần Google Ads API**, không cần dịch vụ trả phí — chỉ cần
Python 3 (đã có sẵn trên hầu hết Linux/macOS, tải miễn phí cho Windows).

Xem phân tích về click ảo và kiến trúc hệ thống tại [PLAN.md](PLAN.md).

## Tính năng

- 🔍 **Phát hiện** IP nghi vấn: click quảng cáo (gclid) lặp lại nhiều lần,
  truy cập dồn dập, user-agent bot.
- 📢 **Báo cáo**: in màn hình, ghi `data/suspicious.log` (làm bằng chứng khiếu
  nại Google hoàn tiền), gửi Telegram (tuỳ chọn).
- 🚫 **Tự động chặn IP** bằng 4 cách (chọn trong `config.json`):
  - `file` — ghi `data/blocked_ips.txt` (mặc định, luôn an toàn)
  - `htaccess` — chèn luật chặn vào `.htaccess` (website Apache/hosting)
  - `iptables` — chặn ngay tại tường lửa Linux (cần chạy bằng root)
  - `windows_firewall` — chặn bằng Windows Firewall (chạy quyền Administrator)
- ⏲️ Tự **bỏ chặn sau 72 giờ** (chỉnh được, `0` = chặn vĩnh viễn).
- 📋 **Xuất danh sách IP** để dán vào *Google Ads → Cài đặt → Loại trừ IP*
  (Google sẽ ngừng hiển thị quảng cáo cho các IP đó → không mất tiền nữa).

## Chạy thử ngay (không cần dữ liệu thật)

```bash
python3 clickguard.py --simulate
```

Kết quả sẽ cho thấy: khách thật không bị ảnh hưởng, IP click 5 lần liên tiếp
và IP bot bị phát hiện + chặn.

## Cách 1 — Máy chủ riêng (VPS) có access log của nginx/apache  ✅ khuyên dùng

1. Sửa `config.json`: đường dẫn log thật của bạn

   ```json
   "log": { "path": "/var/log/nginx/access.log", "format": "combined" }
   ```

2. (Tuỳ chọn) bật chặn tường lửa: `"methods": ["file", "iptables"]`
3. Chạy:

   ```bash
   sudo python3 clickguard.py --mode log
   ```

4. Chạy nền lâu dài bằng systemd:

   ```ini
   # /etc/systemd/system/clickguard.service
   [Unit]
   Description=ClickGuard - chong click ao Google Ads
   After=network.target

   [Service]
   ExecStart=/usr/bin/python3 /duong-dan/clickguard.py --mode log
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable --now clickguard
   ```

## Cách 2 — Website chạy hosting PHP/WordPress (không có quyền xem log)

1. Tải `website/track.php` lên thư mục gốc website.
2. Thêm vào đầu `index.php` (hoặc `header.php` của theme WordPress):

   ```php
   <?php require_once __DIR__ . '/track.php'; ?>
   ```

3. `track.php` sẽ ghi mọi lượt truy cập vào `clickguard_clicks.log`.
   Tải file log đó về máy (hoặc đồng bộ định kỳ), rồi chạy:

   ```json
   "log": { "path": "clickguard_clicks.log", "format": "track", "from_start": true }
   ```

   ```bash
   python3 clickguard.py --mode log
   ```

4. Upload `data/blocked_ips.txt` lên hosting, đổi tên thành
   `clickguard_blocked.txt` — `track.php` sẽ tự trả **403** cho các IP đó.
   (Hoặc bật phương thức `htaccess` và upload file `.htaccess` được tạo ra.)

## Cách 3 — Server theo dõi + mã JS gắn website

1. Trên máy của bạn / VPS: `python3 clickguard.py --mode server`
   (mặc định cổng 8088).
2. Sửa địa chỉ server trong `website/snippet.js` rồi gắn vào website.
3. Xem trạng thái trực tiếp: `http://<ip-máy>:8088/stats`.

> Lưu ý: website HTTPS yêu cầu server theo dõi cũng phải HTTPS (đặt sau
> reverse proxy có SSL như nginx + certbot).

## Quy trình xử lý hàng tuần (khi chưa có API)

1. Mở `data/suspicious.log` xem các IP bị phát hiện và lý do.
2. Chạy `python3 clickguard.py --export-ads` → copy danh sách IP.
3. Vào **Google Ads → Cài đặt chiến dịch → Loại trừ IP** → dán vào (tối đa
   500 IP/chiến dịch). Từ đó Google không hiển thị quảng cáo cho IP này nữa.
4. Nếu thiệt hại lớn: dùng `data/suspicious.log` (IP + thời gian + lý do) làm
   bằng chứng gửi **khiếu nại click không hợp lệ** cho Google để xin hoàn phí.

## Chỉnh ngưỡng phát hiện (`config.json`)

| Khóa | Mặc định | Ý nghĩa |
|---|---|---|
| `ad_clicks_max` | 3 | Số click quảng cáo tối đa cho phép từ 1 IP |
| `ad_window_minutes` | 30 | ...trong khoảng thời gian (phút) |
| `pageviews_max` | 60 | Số lượt truy cập tối đa từ 1 IP |
| `pageview_window_minutes` | 5 | ...trong khoảng thời gian (phút) |
| `whitelist` | `127.0.0.1` | IP/dải IP không bao giờ chặn (thêm IP văn phòng của bạn, hỗ trợ CIDR như `113.160.0.0/16`) |
| `blocking.duration_hours` | 72 | Số giờ chặn (0 = vĩnh viễn) |
| `report.telegram` | tắt | Điền `bot_token` + `chat_id` để nhận cảnh báo qua Telegram (tạo bot miễn phí qua @BotFather) |

⚠️ **Quan trọng**: thêm IP nhà/văn phòng của bạn vào `whitelist` trước khi bật
chặn, tránh tự chặn chính mình khi kiểm tra quảng cáo.

## Giai đoạn 2 (khi có Google Ads API)

Công cụ đã tách riêng phần phát hiện và phần hành động, nên khi bạn đăng ký
được Google Ads API chỉ cần thêm một "method" mới trong `Blocker` để tự động
đẩy IP vào danh sách loại trừ của chiến dịch — không phải dán tay nữa.
