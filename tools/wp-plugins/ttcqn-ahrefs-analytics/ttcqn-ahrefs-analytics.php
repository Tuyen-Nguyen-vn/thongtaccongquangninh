<?php
/*
Plugin Name: TTCQN Ahrefs Analytics
Description: Adds Ahrefs Analytics tracking script to every frontend page head.
Version: 1.0.0
Author: Codex
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_head', 'ttcqn_add_ahrefs_analytics', 1 );
function ttcqn_add_ahrefs_analytics() {
    if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        return;
    }
    echo '<script src="https://analytics.ahrefs.com/analytics.js" data-key="2OIJwuMkh/P2qdBRgrz3pA" async></script>' . "\n";
}
