<?php
/*
Plugin Name: TTCQN Dump All Meta Post 35
Description: One-time: dump ALL rank_math_* meta for post 35. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    global $wpdb;
    $rows = $wpdb->get_results(
        "SELECT meta_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = 35 AND meta_key LIKE 'rank_math%' ORDER BY meta_id ASC",
        ARRAY_A
    );
    $out = [];
    foreach ($rows as $r) {
        $len = function_exists('mb_strlen') ? mb_strlen($r['meta_value']) : strlen($r['meta_value']);
        $out[] = "meta_id={$r['meta_id']} key={$r['meta_key']} len={$len} val=" . substr($r['meta_value'], 0, 100);
    }
    file_put_contents(ABSPATH . 'meta_dump_35.txt', implode("\n", $out));
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
