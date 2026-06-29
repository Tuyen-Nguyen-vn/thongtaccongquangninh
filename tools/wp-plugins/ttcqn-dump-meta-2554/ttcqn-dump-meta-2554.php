<?php
/*
Plugin Name: TTCQN Dump Meta 2554
Description: Dump rank_math postmeta for post 2554 to transient, then deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    global $wpdb;
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s",
        $post_id, 'rank_math%'
    ), ARRAY_A );
    set_transient( 'ttcqn_meta_dump_2554', $rows, 300 );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
