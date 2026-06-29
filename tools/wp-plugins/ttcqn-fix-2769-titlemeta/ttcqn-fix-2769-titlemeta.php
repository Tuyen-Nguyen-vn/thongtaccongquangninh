<?php
/*
Plugin Name: TTCQN Fix Post 2769 Title Meta
Description: One-time: fix rank_math_title + description for post 2769. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    update_post_meta( 2769, 'rank_math_title', 'Hút Bể Phốt Khu Công Nghiệp Quảng Ninh – Có Mặt 15 Phút' );
    update_post_meta( 2769, 'rank_math_description', 'Hút bể phốt khu công nghiệp Quảng Ninh – xe bồn 5 khối, có mặt trong 15 phút, không đục phá, báo giá minh bạch. Gọi ngay 0963.953.533, phục vụ 24/7. Bảo hành.' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
