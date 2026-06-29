<?php
/**
 * Plugin Name: TTCQN Fix Homepage Image Alt
 * Description: Output-buffer hook: thay thế alt trống / alt thiếu dịch vụ+địa phương trên trang chủ.
 * Version: 2026.06.08.3
 * Author: ttcqn-auto
 *
 * Chỉ chạy trên trang chủ (is_front_page). Dùng output buffering để
 * scan toàn bộ <img> và patch alt theo bảng MAP_ALT.
 *
 * DEPLOY: Upload file này vào /wp-content/mu-plugins/
 */

defined('ABSPATH') || exit;

// Bảng mapping filename → alt text chuẩn SEO
// Key = tên file (không extension, không path), Value = alt text mới
const TTCQN_ALT_MAP = [
    'septic-truck-real'                        => 'xe bồn hút bể phốt Quảng Ninh chuyên dụng – Môi Trường Đô Thị Số 1',
    'hero-worker-tho-thong-tac-cong-quang-ninh'=> 'thợ thông tắc cống Quảng Ninh đang thi công – có mặt trong 15 phút',
    'process-step-1'                           => 'bước 1: tiếp nhận cuộc gọi hút bể phốt thông tắc cống Quảng Ninh',
    'process-step-2'                           => 'bước 2: kỹ thuật viên hỏi nhanh tình trạng tắc nghẽn tại Quảng Ninh',
    'process-step-3'                           => 'bước 3: tư vấn phương án thông tắc cống hút bể phốt Quảng Ninh',
    'process-step-4'                           => 'bước 4: kiểm tra và báo giá hút bể phốt thông tắc tại Quảng Ninh',
    'process-step-5'                           => 'bước 5: thi công thông tắc cống hút bể phốt và bàn giao tại Quảng Ninh',
    'cam-nang-mui-hoi-nha-ve-sinh-hong-gai'   => 'xử lý mùi hôi nhà vệ sinh tại Hồng Gai Hạ Long Quảng Ninh',
    'cam-nang-noi-soi-camera-duong-ong'        => 'nội soi camera xác định vị trí tắc đường ống – dịch vụ thông tắc cống Quảng Ninh',
    'cam-nang-thoat-nuoc-ngoai-troi-hai-ha'   => 'kiểm tra hố ga tuyến thoát nước ngoài trời tại Hải Hà Quảng Ninh',
    'testimonial-anh-tran-hung'                => 'minh họa kênh phản hồi dịch vụ hút bể phốt Quảng Ninh',
    'testimonial-chi-nguyen-lan'               => 'minh họa kênh phản hồi thông tắc cống tại Quảng Ninh',
    'testimonial-anh-vu-phong'                 => 'minh họa kênh phản hồi dịch vụ bể phốt Quảng Ninh',
    'testimonial-chat-chi-lan'                 => 'minh họa tin nhắn phản hồi dịch vụ hút bể phốt Quảng Ninh',
    'testimonial-chat-anh-hung'                => 'minh họa tin nhắn phản hồi thông tắc cống tại Quảng Ninh',
    'testimonial-chat-chi-mai'                 => 'minh họa tin nhắn phản hồi dịch vụ bể phốt Quảng Ninh',
    'avatar-nguyen-song-hao'                   => 'Nguyễn Song Hào – Giám đốc vận hành Môi Trường Đô Thị Số 1 Quảng Ninh',
    'avatar-nguyen-thu-ha-20260529'            => 'Nguyễn Thu Hà – Quản lý chăm sóc khách hàng dịch vụ hút bể phốt Quảng Ninh',
];

// Ảnh decorative — giữ nguyên alt="" (theo chuẩn WCAG)
const TTCQN_ALT_DECORATIVE = [
    'icon-dich-vu-cua-chung-toi-shield',
    'icon-dich-vu-cua-chung-toi-phone',
    'icon-dich-vu-cua-chung-toi-bookmark',
    'icon-dich-vu-cua-chung-toi-location',
    'icon-dich-vu-cua-chung-toi-document',
];

// Priority -2500: run AFTER the -3000 outer ob_start but BEFORE the
// home-emergency-renderer exit at -2000. This ensures our buffer wraps
// the renderer output so str_replace + preg_replace_callback both run.
add_action('template_redirect', function () {
    if (!is_front_page()) return;
    ob_start('ttcqn_patch_img_alt');
}, -2500);

function ttcqn_patch_img_alt(string $html): string {
    // Fix EXTERNAL_HOTLINK: thay ytimg.com thumb → WP media local
    $html = str_replace(
        'src="https://i.ytimg.com/vi/EDJGYWmHqB4/hqdefault.jpg"',
        'src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/video-khao-sat-dich-vu-moi-truong-do-thi-so-1-quang-ninh.jpg"',
        $html
    );

    // Regex: match <img ... > (không self-close hoặc self-close)
    return preg_replace_callback(
        '/<img\s([^>]*?)(?:\s*\/?>)/i',
        function (array $m): string {
            $attrs  = $m[1];
            $full   = $m[0];

            // Lấy src
            if (!preg_match('/src=["\']([^"\']+)["\']/i', $attrs, $srcM)) return $full;
            $src = $srcM[1];

            // Lấy stem (tên file không extension, không path prefix)
            $stem = pathinfo(explode('?', basename($src))[0], PATHINFO_FILENAME);
            // Normalize: bỏ suffix kích thước như -1024x768
            $stemClean = preg_replace('/-\d{3,4}x\d{3,4}$/', '', $stem);

            // Decorative: giữ nguyên
            if (in_array($stemClean, TTCQN_ALT_DECORATIVE, true)) return $full;

            // Tìm alt mới trong map
            $newAlt = TTCQN_ALT_MAP[$stemClean] ?? null;
            if ($newAlt === null) return $full; // không có trong map → giữ nguyên

            // Escape
            $newAltEsc = esc_attr($newAlt);

            // Nếu đã có alt attr → thay
            if (preg_match('/\balt=["\'][^"\']*["\']/i', $attrs)) {
                $newAttrs = preg_replace('/\balt=["\'][^"\']*["\']/i', 'alt="' . $newAltEsc . '"', $attrs);
            } else {
                // Thêm alt vào cuối attrs
                $newAttrs = $attrs . ' alt="' . $newAltEsc . '"';
            }

            // Reconstruct tag
            $closing = str_ends_with(rtrim($full), '/>') ? ' />' : '>';
            return '<img ' . $newAttrs . $closing;
        },
        $html
    );
}
