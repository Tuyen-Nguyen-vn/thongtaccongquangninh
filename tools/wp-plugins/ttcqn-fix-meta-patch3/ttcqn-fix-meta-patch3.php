<?php
/*
Plugin Name: TTCQN Fix Meta Patch 3
Description: One-time: fix 3 remaining META_SHORT. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    update_post_meta( 2589, 'rank_math_description', 'Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng tăng. Hút ngay Quảng Ninh 24/7, gọi 0963.953.533, có mặt 15 phút, bảo hành.' );
    update_post_meta( 386, 'rank_math_description', 'Nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống lắp sai độ dốc. Gọi 0963.953.533 kiểm tra. Có mặt 15 phút, xử lý tại chỗ.' );
    update_post_meta( 380, 'rank_math_description', 'Thông tắc cống chung cư Hạ Long — xử lý trục đứng, tầng hầm, cống bếp, thoát sàn bằng thiết bị chuyên dụng, báo giá rõ. Gọi 0963.953.533. Có mặt 15 phút.' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
