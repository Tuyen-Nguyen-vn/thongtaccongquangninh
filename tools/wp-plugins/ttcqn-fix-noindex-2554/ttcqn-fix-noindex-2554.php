<?php
/*
Plugin Name: TTCQN Fix NoIndex Post 2554
Description: One-time: set rank_math_robots index/follow + canonical for post 2554, then self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    update_post_meta( $post_id, 'rank_math_robots', [ 'index', 'follow' ] );
    update_post_meta( $post_id, 'rank_math_canonical_url', 'https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh-2026/' );
    delete_post_meta( $post_id, 'rank_math_advanced_robots' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
