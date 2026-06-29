<?php
/**
 * Plugin Name: TTCQN Title Meta Short Fix 2026-06-12
 * Description: Fix TITLE_SHORT/META_SHORT for selected TTCQN URLs.
 * Version: 2026.06.29.1
 */
if (!defined('ABSPATH')) exit;

function ttcqn_20260612_desc($post_id) {
    switch ((int) $post_id) {
        case 23: return 'Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Hoạt động 05:00-22:00 hằng ngày, có mặt 15 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756 để xử lý.';
        case 25: return 'Dịch vụ hút bể phốt Quảng Ninh, thông tắc cống và xử lý mùi hôi qua các bài hướng dẫn thực tế. Cần thợ gọi 0963.953.533. Thợ có mặt nhanh trong khung giờ làm việc.';
        case 26: return 'Hút bể phốt Quảng Ninh bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình trong khung giờ 05:00-22:00. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.';
        case 35: return 'Thông tắc cống Quảng Ninh tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái. Không đục phá, báo giá trước, bảo hành theo ca. Gọi 0963.953.533 / 0931.156.756.';
        case 61: return 'Bảng giá hút bể phốt thông tắc cống Quảng Ninh 2026 rõ từng hạng mục, báo giá trước, không ẩn phí. Gọi ngay 0963.953.533. Thợ có mặt nhanh trong khung giờ làm việc.';
        case 380: return 'Thông tắc cống chung cư Hạ Long, xử lý trục đứng, tầng hầm, cống bếp và thoát sàn bằng thiết bị phù hợp. Gọi 0963.953.533. Thợ có mặt 15 phút, hỗ trợ tận nơi.';
        case 384: return 'Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút.';
        case 386: return 'Tìm nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống sai độ dốc. Gọi 0963.953.533. Có mặt 15 phút, xử lý nhanh ngay tại nhà.';
        case 2589: return 'Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng nhiều. Gọi 0963.953.533 hút ngay tại Quảng Ninh, có mặt 15 phút tại nhà trong khung giờ làm việc.';
        case 2702: return 'Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe trong khung giờ 05:00-22:00.';
        default: return null;
    }
}

function ttcqn_20260612_title($post_id) {
    switch ((int) $post_id) {
        case 23: return 'Thông Tắc Cống Quảng Ninh - Hút Bể Phốt';
        case 25: return 'Dịch vụ hút bể phốt Quảng Ninh: blog xử lý cống, bể phốt, mùi hôi';
        case 35: return 'Dịch vụ thông tắc cống Quảng Ninh | Song Hào xử lý nhanh';
        case 61: return 'Bảng Giá Hút Bể Phốt Thông Tắc Cống Quảng Ninh 2026 Không Ẩn Phí';
        default: return null;
    }
}

function ttcqn_20260612_keyword($post_id) {
    switch ((int) $post_id) {
        case 23: return 'thông tắc cống Quảng Ninh';
        case 25: return 'dịch vụ hút bể phốt Quảng Ninh';
        case 26: return 'hút bể phốt Quảng Ninh';
        case 35: return 'thông tắc cống Quảng Ninh';
        case 61: return 'bảng giá hút bể phốt thông tắc cống Quảng Ninh';
        case 380: return 'thông tắc cống chung cư Hạ Long';
        case 384: return 'thông tắc cống ngõ nhỏ Hạ Long';
        case 386: return 'nguyên nhân cống tắc thường xuyên Hạ Long';
        case 2589: return 'dấu hiệu bể phốt bị đầy';
        case 2702: return 'hút bể phốt khách sạn Quảng Ninh';
        default: return null;
    }
}

add_filter('rank_math/frontend/description', function($desc) {
    $fixed = ttcqn_20260612_desc(get_queried_object_id());
    return $fixed !== null ? $fixed : $desc;
}, 9999);

add_filter('rank_math/frontend/title', function($title) {
    $fixed = ttcqn_20260612_title(get_queried_object_id());
    return $fixed !== null ? $fixed : $title;
}, 9999);

add_filter('pre_get_document_title', function($title) {
    $fixed = ttcqn_20260612_title(get_queried_object_id());
    return $fixed !== null ? $fixed : $title;
}, 9999);

add_filter('document_title_parts', function($parts) {
    $fixed = ttcqn_20260612_title(get_queried_object_id());
    if ($fixed !== null) {
        $parts['title'] = $fixed;
        unset($parts['site'], $parts['tagline']);
    }
    return $parts;
}, 9999);

add_action('init', function() {
    if (get_option('ttcqn_title_meta_short_20260627_v1')) return;
    $fixes = [
        23 => ['desc' => 'Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Hoạt động 05:00-22:00 hằng ngày, có mặt 15 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756 để xử lý.', 'title' => 'Thông Tắc Cống Quảng Ninh - Hút Bể Phốt', 'keyword' => 'thông tắc cống Quảng Ninh'],
        25 => ['desc' => 'Dịch vụ hút bể phốt Quảng Ninh, thông tắc cống và xử lý mùi hôi qua các bài hướng dẫn thực tế. Cần thợ gọi 0963.953.533. Thợ có mặt nhanh trong khung giờ làm việc.', 'title' => 'Dịch vụ hút bể phốt Quảng Ninh: blog xử lý cống, bể phốt, mùi hôi', 'keyword' => 'dịch vụ hút bể phốt Quảng Ninh'],
        26 => ['desc' => 'Hút bể phốt Quảng Ninh bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình trong khung giờ 05:00-22:00. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.', 'title' => null, 'keyword' => 'hút bể phốt Quảng Ninh'],
        35 => ['desc' => 'Thông tắc cống Quảng Ninh tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái. Không đục phá, báo giá trước, bảo hành theo ca. Gọi 0963.953.533 / 0931.156.756.', 'title' => 'Dịch vụ thông tắc cống Quảng Ninh | Song Hào xử lý nhanh', 'keyword' => 'thông tắc cống Quảng Ninh'],
        61 => ['desc' => 'Bảng giá hút bể phốt thông tắc cống Quảng Ninh 2026 rõ từng hạng mục, báo giá trước, không ẩn phí. Gọi ngay 0963.953.533. Thợ có mặt nhanh trong khung giờ làm việc.', 'title' => 'Bảng Giá Hút Bể Phốt Thông Tắc Cống Quảng Ninh 2026 Không Ẩn Phí', 'keyword' => 'bảng giá hút bể phốt thông tắc cống Quảng Ninh'],
        380 => ['desc' => 'Thông tắc cống chung cư Hạ Long, xử lý trục đứng, tầng hầm, cống bếp và thoát sàn bằng thiết bị phù hợp. Gọi 0963.953.533. Thợ có mặt 15 phút, hỗ trợ tận nơi.', 'title' => null, 'keyword' => 'thông tắc cống chung cư Hạ Long'],
        384 => ['desc' => 'Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút.', 'title' => null, 'keyword' => 'thông tắc cống ngõ nhỏ Hạ Long'],
        386 => ['desc' => 'Tìm nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống sai độ dốc. Gọi 0963.953.533. Có mặt 15 phút, xử lý nhanh ngay tại nhà.', 'title' => null, 'keyword' => 'nguyên nhân cống tắc thường xuyên Hạ Long'],
        2589 => ['desc' => 'Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng nhiều. Gọi 0963.953.533 hút ngay tại Quảng Ninh, có mặt 15 phút tại nhà trong khung giờ làm việc.', 'title' => null, 'keyword' => 'dấu hiệu bể phốt bị đầy'],
        2702 => ['desc' => 'Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe trong khung giờ 05:00-22:00.', 'title' => null, 'keyword' => 'hút bể phốt khách sạn Quảng Ninh'],
    ];
    foreach ($fixes as $post_id => $data) {
        update_post_meta($post_id, 'rank_math_description', $data['desc']);
        if (!empty($data['title'])) update_post_meta($post_id, 'rank_math_title', $data['title']);
        if (!empty($data['keyword'])) update_post_meta($post_id, 'rank_math_focus_keyword', $data['keyword']);
        wp_cache_delete($post_id, 'post_meta');
        clean_post_cache($post_id);
    }
    update_option('ttcqn_title_meta_short_20260627_v1', 1);
}, 1);
