<?php
/*
Plugin Name: TTCQN Read Robots 2554
Description: Reads rank_math_robots for post 2554 and saves to WP option, then deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    global $wpdb;

    // Get ALL meta rows for rank_math_robots
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key IN ('rank_math_robots','rank_math_canonical_url','rank_math_advanced_robots')",
        $post_id
    ), ARRAY_A );

    update_option( 'ttcqn_debug_robots_2554', $rows );

    // Also force-delete and re-add
    $wpdb->delete( $wpdb->postmeta, [ 'post_id' => $post_id, 'meta_key' => 'rank_math_robots' ], [ '%d', '%s' ] );
    $wpdb->delete( $wpdb->postmeta, [ 'post_id' => $post_id, 'meta_key' => 'rank_math_canonical_url' ], [ '%d', '%s' ] );
    $wpdb->delete( $wpdb->postmeta, [ 'post_id' => $post_id, 'meta_key' => 'rank_math_advanced_robots' ], [ '%d', '%s' ] );

    // Clean WP object cache
    clean_post_cache( $post_id );

    // Purge LiteSpeed
    if ( function_exists( 'do_action' ) ) {
        do_action( 'litespeed_purge_post', $post_id );
        do_action( 'litespeed_purge_all' );
    }

    update_option( 'ttcqn_debug_robots_2554_after', [
        'deleted_rows' => [
            'rank_math_robots' => $wpdb->rows_affected,
        ],
        'repurged' => true,
    ] );

    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
