<?php
/*
Plugin Name: TTCQN Clear Robots 2554
Description: Xóa hoàn toàn rank_math_robots và rank_math_canonical_url cho post 2554. Revert về site default (index). Tự deactivate.
Version: 2.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;

    // Xóa hết rank_math_robots (dù là string hay array hay serialized)
    delete_post_meta( $post_id, 'rank_math_robots' );
    // Xóa canonical cũ
    delete_post_meta( $post_id, 'rank_math_canonical_url' );
    // Xóa advanced robots nếu có
    delete_post_meta( $post_id, 'rank_math_advanced_robots' );
    // Set lại index,follow explicitly (backup)
    add_post_meta( $post_id, 'rank_math_robots', 'index', true );

    // Xóa cache LiteSpeed nếu có
    if ( function_exists( 'do_action' ) ) {
        do_action( 'litespeed_purge_post', $post_id );
    }
    if ( function_exists( 'litespeed_purge_post' ) ) {
        litespeed_purge_post( $post_id );
    }

    deactivate_plugins( plugin_basename( __FILE__ ) );

    // Log để debug
    error_log( 'TTCQN: cleared rank_math_robots for post ' . $post_id );
} );
