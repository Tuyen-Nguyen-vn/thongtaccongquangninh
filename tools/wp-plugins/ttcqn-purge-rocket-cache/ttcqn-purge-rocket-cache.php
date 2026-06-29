<?php
/*
Plugin Name: TTCQN Purge WP Rocket Cache
Description: One-time: clear WP Rocket full site cache, then self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    if ( function_exists( 'rocket_clean_domain' ) ) {
        rocket_clean_domain();
    }
    if ( function_exists( 'rocket_clean_minify' ) ) {
        rocket_clean_minify();
    }
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
