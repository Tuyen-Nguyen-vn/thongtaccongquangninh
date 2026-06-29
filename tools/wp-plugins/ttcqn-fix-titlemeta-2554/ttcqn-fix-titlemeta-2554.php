<?php
/*
Plugin Name: TTCQN Fix Title Meta Post 2554
Description: One-time: set rank_math_title and rank_math_description for post 2554, then self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    update_post_meta( $post_id, 'rank_math_title', 'Xe Hút Bể Phốt Quảng Ninh – Có Mặt 15 Phút | 0963.953.533' );
    update_post_meta( $post_id, 'rank_math_description', 'Xe hút bể phốt Quảng Ninh – xe bồn 5 khối hút sạch bể 1–20 khối, có mặt sau 15 phút, không đục phá, báo giá rõ ràng trước thi công. Gọi ngay 0963.953.533.' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
