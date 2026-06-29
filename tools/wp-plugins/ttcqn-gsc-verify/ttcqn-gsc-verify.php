<?php
/**
 * Plugin Name: TTCQN GSC Verify
 * Description: Them Google Search Console verification meta tag vao head.
 * Version: 1.0
 */
add_action('wp_head', function() {
    echo '<meta name="google-site-verification" content="etA-ExGP7O3x-PtWhNNEv5Gu7N4uxMhRQBteclII_34">' . "\n";
}, 1);
