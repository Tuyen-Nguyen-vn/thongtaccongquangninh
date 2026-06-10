# KẾ HOẠCH: Hệ thống chống click ảo (click fraud) Google Ads — ClickGuard

## 1. Tìm hiểu về click ảo trên Google Ads

### Click ảo là gì?
Click ảo (invalid click / click fraud) là các lượt nhấp vào quảng cáo Google Ads
không xuất phát từ khách hàng thật, nhằm **đốt ngân sách quảng cáo** của bạn.
Nguồn phổ biến:

- **Đối thủ cạnh tranh**: nhấp tay hoặc thuê người/bot nhấp liên tục vào quảng cáo
  của bạn (cùng từ khóa, cùng khu vực — ví dụ "thông tắc cống Quảng Ninh").
- **Bot / phần mềm tự động**: click hàng loạt, thường đến từ dải IP data center,
  VPN, proxy, user-agent bất thường.
- **Click farm**: nhóm người được thuê click, thường đổi IP liên tục (IP hopping,
  3G/4G reset).

### Dấu hiệu nhận biết (theo các nghiên cứu về click fraud)
1. **Nhiều click quảng cáo từ cùng 1 IP trong thời gian ngắn** — ví dụ cùng IP
   click 5–10 lần trong vài phút. Nhận biết click quảng cáo qua tham số
   `gclid=` / `gbraid=` / `wbraid=` trên URL trang đích.
2. **Thời gian ở lại trang gần như bằng 0** (vào rồi thoát ngay, bounce 100%).
3. **IP tập trung theo cụm** — nhiều click từ cùng dải /24, hoặc từ IP data
   center / VPN thay vì mạng dân cư.
4. **Click dồn vào giờ bất thường** (nửa đêm, sáng sớm) hoặc tăng đột biến.
5. **User-agent giống hệt nhau hoặc bất thường** (trình duyệt cũ, headless,
   curl/python...).
6. **CTR tăng nhưng không có chuyển đổi** (gọi điện / form liên hệ).
7. Google tự lọc một phần "invalid clicks" nhưng theo thống kê vẫn lọt
   **14–30% ngân sách** nếu không có lớp bảo vệ riêng.

### Cách phòng tránh click ảo của đối thủ
| Lớp bảo vệ | Cách làm | Cần API? |
|---|---|---|
| 1. Phát hiện tại website | Theo dõi mọi lượt truy cập có `gclid`, ghi IP + thời gian + user-agent | ❌ Không |
| 2. Chặn tại website/máy chủ | Tự động chặn IP nghi vấn bằng `.htaccess`, iptables, Windows Firewall → đối thủ click vào chỉ thấy trang bị chặn, hết động lực | ❌ Không |
| 3. Loại trừ IP trong Google Ads | Vào *Cài đặt chiến dịch → Loại trừ IP* dán danh sách IP do công cụ xuất ra (tối đa 500 IP/chiến dịch, hỗ trợ cả cấp tài khoản) → Google **không hiển thị quảng cáo** cho IP đó nữa, không mất tiền | ❌ Thủ công (copy/paste) |
| 4. Khiếu nại hoàn tiền | Dùng báo cáo IP + thời gian click làm bằng chứng gửi Google xin hoàn phí click không hợp lệ | ❌ Không |
| 5. Tự động loại trừ IP qua Google Ads API | Khi nào có API thì công cụ tự đẩy IP lên Google Ads | ✅ (giai đoạn sau) |

> Lưu ý: chỉ chặn IP là chưa đủ tuyệt đối (đối thủ có thể đổi IP), nhưng là lớp
> rẻ nhất - hiệu quả nhất khi chưa có API; kết hợp thu hẹp vùng quảng cáo,
> bật remarketing và theo dõi chuyển đổi để giảm thiệt hại.

## 2. Yêu cầu của công cụ

- ✅ **Chạy độc lập trên máy** (máy chủ web hoặc máy tính cá nhân), không phụ
  thuộc dịch vụ ngoài, không cần API — chỉ cần Python 3 (thư viện chuẩn).
- ✅ **Phát hiện và báo IP nghi vấn click** quảng cáo (console, file báo cáo,
  tuỳ chọn Telegram).
- ✅ **Tự động chặn IP** nghi vấn (nhiều phương thức: file danh sách,
  `.htaccess`, iptables Linux, Windows Firewall) + tự bỏ chặn sau thời hạn.
- ✅ **Xuất danh sách IP** để dán vào mục "Loại trừ IP" của Google Ads.

## 3. Kiến trúc & quy trình

```
            ┌────────────────────────────────────────────────┐
 Khách click │  Nguồn dữ liệu (chọn 1 trong 3)               │
 quảng cáo → │  A. Log máy chủ web (nginx/apache access.log) │
 vào website │  B. Server theo dõi tích hợp + mã JS gắn web  │
            │  C. track.php (hosting PHP) ghi log click      │
            └───────────────────────┬────────────────────────┘
                                    ▼
                     ┌──────────────────────────┐
                     │  BỘ PHÁT HIỆN (detector) │
                     │  - Đếm click có gclid/IP │
                     │  - Đếm tần suất truy cập │
                     │  - Soi user-agent bot    │
                     │  - Bỏ qua IP whitelist   │
                     └────────────┬─────────────┘
                                  ▼ IP nghi vấn
              ┌───────────────────┴───────────────────┐
              ▼                                       ▼
   ┌─────────────────────┐               ┌─────────────────────────┐
   │  BÁO CÁO (reporter) │               │  CHẶN TỰ ĐỘNG (blocker) │
   │  - Console          │               │  - data/blocked_ips.txt │
   │  - data/suspicious  │               │  - .htaccess (Apache)   │
   │    .log (bằng chứng │               │  - iptables (Linux)     │
   │    khiếu nại Google)│               │  - Windows Firewall     │
   │  - Telegram (tuỳ    │               │  - Tự bỏ chặn sau N giờ │
   │    chọn)            │               └─────────────────────────┘
   └─────────────────────┘                            │
              │                                       ▼
              ▼                          Dán IP vào Google Ads →
   Bằng chứng xin hoàn tiền              "Loại trừ IP" (thủ công,
                                         sau này tự động qua API)
```

## 4. Luật phát hiện (cấu hình được trong `config.json`)

| Luật | Mặc định | Ý nghĩa |
|---|---|---|
| `ad_clicks_max` / `ad_window_minutes` | ≥ 3 click có gclid trong 30 phút | Cùng IP click quảng cáo lặp lại |
| `pageviews_max` / `pageview_window_minutes` | ≥ 60 lượt trong 5 phút | Spam truy cập / bot quét |
| `bot_user_agents` | curl, python, wget, headless... | Truy cập bằng công cụ tự động |
| `whitelist` | IP của bạn, Googlebot... | Không bao giờ chặn |
| `duration_hours` | 72 giờ | Hết hạn tự bỏ chặn (0 = vĩnh viễn) |

## 5. Các bước triển khai code

1. **`clickguard.py`** — công cụ chính (1 file, Python 3 thuần):
   - Chế độ `log`: đọc tiếp diễn (tail) access log nginx/apache hoặc log của
     `track.php`; chịu được log xoay vòng (rotation).
   - Chế độ `server`: HTTP server tích hợp nhận tín hiệu từ mã JS gắn website
     (`/track`), có `/stats` xem trạng thái.
   - Detector + Reporter + Blocker + lưu trạng thái (`data/state.json`) để
     khởi động lại không mất danh sách chặn.
   - Chế độ `--simulate` để chạy thử không cần dữ liệu thật.
2. **`config.json`** — toàn bộ ngưỡng, whitelist, phương thức chặn.
3. **`website/track.php`** — cho website chạy hosting PHP: ghi log mỗi lượt
   truy cập + tự trả 403 cho IP đã có trong danh sách chặn.
4. **`website/snippet.js`** — mã gắn vào website khi dùng chế độ `server`.
5. **`README.md`** — hướng dẫn cài đặt, chạy, dán IP vào Google Ads.

## 6. Lộ trình nâng cấp khi có API (giai đoạn 2)

- Google Ads API: tự động đẩy IP nghi vấn vào danh sách loại trừ IP của chiến
  dịch (hết thao tác thủ công).
- Bổ sung chấm điểm hành vi (thời gian ở trang, chuyển động chuột) qua snippet JS.
- Phát hiện theo dải mạng /24 và danh sách IP data center/VPN công khai.
