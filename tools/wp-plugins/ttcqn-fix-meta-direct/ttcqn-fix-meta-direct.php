<?php
/*
Plugin Name: TTCQN Fix Meta Direct
Description: One-time: delete+rewrite rank_math_description for 6 posts directly. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    global $wpdb;

    $targets = [
        35  => "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.",
        26  => "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.",
        380 => "Thông tắc cống chung cư Hạ Long — xử lý trục đứng, tầng hầm, cống bếp, thoát sàn bằng thiết bị chuyên dụng, báo giá rõ. Gọi 0963.953.533. Có mặt 15 phút.",
        384 => "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút.",
        386 => "Nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống lắp sai độ dốc. Gọi 0963.953.533 kiểm tra. Có mặt 15 phút, xử lý tại chỗ.",
        2589 => "Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng tăng. Hút ngay Quảng Ninh 24/7, gọi 0963.953.533, có mặt 15 phút, bảo hành.",
    ];

    $results = [];
    foreach ($targets as $post_id => $desc) {
        // Delete all existing rank_math_description entries for this post
        $deleted = $wpdb->delete(
            $wpdb->postmeta,
            ['post_id' => $post_id, 'meta_key' => 'rank_math_description'],
            ['%d', '%s']
        );
        // Add fresh entry
        $inserted = $wpdb->insert(
            $wpdb->postmeta,
            ['post_id' => $post_id, 'meta_key' => 'rank_math_description', 'meta_value' => $desc],
            ['%d', '%s', '%s']
        );
        $len = mb_strlen($desc);
        $results[] = "post_id={$post_id} deleted={$deleted} inserted={$inserted} len={$len}";
    }

    // Clear WP object cache
    wp_cache_flush();

    // Save results to wp_options
    update_option('ttcqn_fix_meta_result', implode(' | ', $results));

    // Clear WP Rocket cache
    if (function_exists('rocket_clean_domain')) rocket_clean_domain();

    deactivate_plugins(plugin_basename(__FILE__));
});
