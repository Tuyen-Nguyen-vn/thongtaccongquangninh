<?php
/*
Plugin Name: TTCQN Trace Noindex
Description: Trace where noindex comes from for post 2554. Save to option. Self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    global $wpdb;

    // 1. Check ALL postmeta for this post
    $all_meta = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_key",
        $post_id
    ), ARRAY_A );

    // Filter rank_math_ related
    $rm_meta = array_filter( $all_meta, fn($r) => str_starts_with($r['meta_key'], 'rank_math') );

    // 2. Check Rank Math global settings for this post type
    $rm_general = get_option('rank_math_general');
    $rm_global_robots = '';
    if ( is_array($rm_general) ) {
        $rm_global_robots = $rm_general['robots_post'] ?? $rm_general['robots_posts'] ?? 'not set';
    }

    // 3. Check Rank Math post type noindex
    $rm_pt_settings = get_option('rank_math_post_type_post_robots');

    // 4. Active plugins list
    $active = get_option('active_plugins');

    // 5. Check if there's a redirect for this post
    $rm_redirections = $wpdb->get_results( $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}rank_math_redirections WHERE sources LIKE %s LIMIT 5",
        '%xe-hut-be-phot%'
    ), ARRAY_A );

    update_option( 'ttcqn_trace_noindex', [
        'rank_math_postmeta' => array_values($rm_meta),
        'rank_math_global_robots' => $rm_global_robots,
        'rank_math_pt_settings' => $rm_pt_settings,
        'active_plugins_count' => count((array)$active),
        'active_plugins_noindex' => array_filter((array)$active, fn($p) => str_contains($p, 'noindex')),
        'rank_math_redirections' => $rm_redirections,
    ] );

    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
