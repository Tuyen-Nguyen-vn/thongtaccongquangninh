# Tích hợp Google Web Vitals cho thongtaccongquangninh.com

**Ngày lập**: 2026-06-28  
**Repo tham chiếu**: `git@github.com:GoogleChrome/web-vitals.git`  
**Vị trí local**: `_tmp/web-vitals`  
**HEAD đã kiểm tra**: `bb3995c0dc22ae0635f730d9a60dd4379879e86e` (v5.0.0+)

---

## 1. Giới thiệu & Mục tiêu hiệu suất

Thư viện **`web-vitals`** của Google Chrome là một thư viện JavaScript siêu nhẹ (~2KB) giúp đo lường các chỉ số **Core Web Vitals** trên trình duyệt của người dùng thực tế (Real User Metrics - RUM).

Theo chẩn đoán hiệu suất tại [PLAN_FIX_PERFORMANCE_SCHEMA_2026-06-12.md](file:///D:/.thongtaccongquangninh/docs/PLAN_FIX_PERFORMANCE_SCHEMA_2026-06-12.md), website `thongtaccongquangninh.com` đang tối ưu hóa PageSpeed Mobile (FCP/LCP). Việc tích hợp `web-vitals` sẽ giúp:
1. Theo dõi chính xác trải nghiệm thực tế của khách hàng tại Quảng Ninh khi truy cập mạng 4G/Wifi.
2. Đo lường các chỉ số chính: **LCP** (Largest Contentful Paint), **CLS** (Cumulative Layout Shift), và **INP** (Interaction to Next Paint - thay thế FID).
3. Đẩy dữ liệu trực tiếp về tài khoản **Google Analytics 4 (GA4)** đang chạy trên site.

---

## 2. Cách thức tích hợp đề xuất

### Phương án 1: Tải từ CDN (Khuyên dùng - nhanh nhất và an toàn)
Sử dụng script dạng module tải trực tiếp phiên bản chuẩn từ CDN và gửi sự kiện đến `gtag.js` đã có sẵn trong trang.

Dán đoạn mã dưới đây vào cuối file `footer` chung hoặc thông qua plugin custom renderer (`tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer-interactions-inline.php`):

```html
<!-- Google Web Vitals Monitoring -->
<script type="module">
  // Load module trực tiếp từ CDN unpkg (hoặc self-host file JS trong thư mục assets của plugin)
  import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'https://unpkg.com/web-vitals@5?module';

  function sendToGoogleAnalytics({ name, delta, value, id }) {
    if (typeof gtag === 'function') {
      gtag('event', name, {
        // Gửi delta để GA4 có thể tính tổng/trung bình cộng dễ dàng
        value: delta,
        // Các tham số tùy chỉnh để phân tích chi tiết
        metric_id: id,
        metric_value: value,
        metric_delta: delta,
        page_path: window.location.pathname
      });
    }
  }

  // Đăng ký đo lường
  onCLS(sendToGoogleAnalytics);
  onINP(sendToGoogleAnalytics);
  onLCP(sendToGoogleAnalytics);
  onFCP(sendToGoogleAnalytics);
  onTTFB(sendToGoogleAnalytics);
</script>
```

### Phương án 2: Tự lưu trữ (Self-host) trong Plugin
Để tối ưu hóa bảo mật và tốc độ load (tránh DNS lookup từ CDN ngoài), ta có thể copy file build của thư viện từ `_tmp/web-vitals/dist/web-vitals.iife.js` vào thư mục assets của emergency renderer và load cục bộ.

1. Copy file:
   Nguồn: `_tmp/web-vitals/dist/web-vitals.iife.js`  
   Đích: `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/js/web-vitals.min.js`
2. Enqueue file trong PHP của plugin:
   ```php
   wp_enqueue_script('ttcqn-web-vitals', plugin_dir_url(__FILE__) . 'assets/js/web-vitals.min.js', array(), '5.0.0', true);
   ```
3. Khởi tạo Classic Script gửi data:
   ```html
   <script>
     window.addEventListener('load', function() {
       if (typeof webVitals !== 'undefined' && typeof gtag === 'function') {
         function sendToGA(metric) {
           gtag('event', metric.name, {
             value: metric.delta,
             metric_id: metric.id,
             metric_value: metric.value
           });
         }
         webVitals.onCLS(sendToGA);
         webVitals.onINP(sendToGA);
         webVitals.onLCP(sendToGA);
       }
     });
   </script>
   ```

---

## 3. Các chỉ số đo lường chính

| Chỉ số | Tên Sự Kiện | Ngưỡng Tốt (Good) | Mô tả ngắn |
|---|---|---|---|
| **LCP** | `LCP` | `≤ 2.5s` | Thời gian tải thành phần nội dung lớn nhất |
| **CLS** | `CLS` | `≤ 0.1` | Mức độ dịch chuyển bố cục không báo trước |
| **INP** | `INP` | `≤ 200ms` | Độ trễ tương tác của người dùng trên toàn trang |
| **FCP** | `FCP` | `≤ 1.8s` | Thời gian vẽ phần tử đầu tiên lên màn hình |
| **TTFB** | `TTFB` | `≤ 800ms` | Thời gian phản hồi từ máy chủ |

---

## 4. Kế hoạch xác minh (QA & Smoke Test)

1. **Kiểm tra cục bộ**: Mở trang Console trong Chrome DevTools, xác nhận không có lỗi tải script module.
2. **Kiểm tra Gửi Sự Kiện (gtag)**:
   - Thực hiện tương tác với trang (cuộn chuột, click nút gọi điện/hotline, chuyển tab).
   - Kiểm tra tab **Network** lọc theo `collect?v=2` để thấy payload gửi sang Google Analytics có chứa tên sự kiện `LCP`, `CLS`, `INP` đi kèm param `metric_value`.
3. **Kiểm tra GA4 Realtime**: Mở trang quản trị GA4 -> Realtime report -> xem sự kiện phát sinh trong 30 phút qua để đảm bảo các event `LCP`, `CLS`, `INP` xuất hiện đúng cấu trúc.
