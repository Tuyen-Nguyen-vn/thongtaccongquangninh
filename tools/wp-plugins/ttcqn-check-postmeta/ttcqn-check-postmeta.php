<?php
/*
Plugin Name: TTCQN Check PostMeta
Description: One-time: dump rank_math_description for posts 35,26,380,384,386,2589. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    $ids = [35, 26, 380, 384, 386, 2589];
    $out = [];
    foreach ($ids as $id) {
        $desc = get_post_meta($id, 'rank_math_description', true);
        $out[] = $id . ': [' . mb_strlen($desc) . '] ' . substr($desc, 0, 80);
    }
    file_put_contents(ABSPATH . 'postmeta_dump.txt', implode("\n", $out));
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
