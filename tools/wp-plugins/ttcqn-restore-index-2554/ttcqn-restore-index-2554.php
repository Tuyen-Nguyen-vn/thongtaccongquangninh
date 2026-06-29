<?php
/*
Plugin Name: TTCQN Restore Index Post 2554
Description: Set rank_math_robots index/follow, xóa canonical cũ (-2026), rồi self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    // Khôi phục index+follow
    update_post_meta( $post_id, 'rank_math_robots', [ 'index', 'follow' ] );
    // Xóa canonical cũ (-2026) để Rank Math dùng current permalink
    delete_post_meta( $post_id, 'rank_math_canonical_url' );
    // Xóa advanced robots nếu có noindex ở đó
    delete_post_meta( $post_id, 'rank_math_advanced_robots' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
