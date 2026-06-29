<?php
/*
Plugin Name: TTCQN Nuke Noindex 2554
Description: Find ALL meta containing noindex for post 2554, delete them, purge cache. Self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    global $wpdb;

    // Find EVERYTHING containing noindex for this post
    $all_meta = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d",
        $post_id
    ), ARRAY_A );

    $noindex_rows = array_filter( $all_meta, function($row) {
        return strpos( $row['meta_value'], 'noindex' ) !== false;
    });

    $deleted = [];
    foreach ( $noindex_rows as $row ) {
        $wpdb->query( $wpdb->prepare(
            "DELETE FROM {$wpdb->postmeta} WHERE meta_id = %d",
            $row['meta_id']
        ) );
        $deleted[] = $row;
    }

    // Also look at WP options for anything with 2554 + noindex
    $option_rows = $wpdb->get_results(
        "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_value LIKE '%noindex%' AND option_value LIKE '%2554%'",
        ARRAY_A
    );

    // Set index explicitly via serialized array (how Rank Math actually stores it)
    $robots_serialized = serialize( ['index', 'follow'] );
    $exists = $wpdb->get_var( $wpdb->prepare(
        "SELECT meta_id FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = 'rank_math_robots'",
        $post_id
    ) );
    if ( $exists ) {
        $wpdb->update( $wpdb->postmeta, ['meta_value' => $robots_serialized], ['meta_id' => $exists], ['%s'], ['%d'] );
    } else {
        $wpdb->insert( $wpdb->postmeta, ['post_id' => $post_id, 'meta_key' => 'rank_math_robots', 'meta_value' => $robots_serialized], ['%d', '%s', '%s'] );
    }

    // Clean caches
    clean_post_cache( $post_id );
    wp_cache_delete( $post_id, 'post_meta' );

    if ( defined( 'LSCWP_CONTENT_FOLDER' ) || function_exists( 'litespeed_purge_post' ) ) {
        do_action( 'litespeed_purge_post', $post_id );
        do_action( 'litespeed_purge_all' );
    }

    update_option( 'ttcqn_nuke_noindex_2554', [
        'found_noindex_rows' => $deleted,
        'options_with_noindex' => array_column( $option_rows, 'option_name' ),
        'wrote_robots' => $robots_serialized,
    ] );

    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
