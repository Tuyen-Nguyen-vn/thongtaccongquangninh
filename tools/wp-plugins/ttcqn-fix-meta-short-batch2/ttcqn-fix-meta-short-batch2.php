<?php
/*
Plugin Name: TTCQN Fix Meta Short Batch 2
Description: One-time: extend rank_math_description for 8 URLs with META_SHORT. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    update_post_meta( 2589, 'rank_math_description', 'Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng nhiều. Gọi 0963.953.533 hút ngay tại Quảng Ninh, có mặt 15 phút. 24/7.' );
    update_post_meta( 26, 'rank_math_description', 'Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.' );
    update_post_meta( 386, 'rank_math_description', 'Tìm nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống sai độ dốc. Gọi 0963.953.533. Có mặt 15 phút, xử lý tại chỗ.' );
    update_post_meta( 380, 'rank_math_description', 'Thông tắc cống chung cư Hạ Long, xử lý trục đứng, tầng hầm, cống bếp và thoát sàn bằng thiết bị phù hợp. Gọi 0963.953.533. Thợ có mặt 15 phút.' );
    update_post_meta( 384, 'rank_math_description', 'Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút.' );
    update_post_meta( 35, 'rank_math_description', 'Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.' );
    update_post_meta( 1369, 'rank_math_description', 'Xử lý mùi hôi nhà vệ sinh Quảng Ninh 24/7 — tìm đúng nguồn hôi từ bể phốt, cống, ron cầu, hết hẳn không quay lại. Gọi 0963.953.533. Thợ có mặt 15 phút.' );
    update_post_meta( 311, 'rank_math_description', 'Xử lý mùi hôi Quảng Ninh 24/7 — tìm đúng nguồn hôi từ cống, bể phốt, hố ga, xử lý hết hẳn không tái phát. Thợ có mặt 15 phút, bảo hành. Gọi 0963.953.533.' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
