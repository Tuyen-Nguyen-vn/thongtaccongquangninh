<?php
/*
Plugin Name: TTCQN Check Options 35
Description: Check options and postmeta for Page ID 35. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    global $wpdb;
    $id = 35;
    $out = [];
    
    // Check all postmeta for ID 35
    $meta = $wpdb->get_results($wpdb->prepare("SELECT meta_key, meta_value FROM $wpdb->postmeta WHERE post_id = %d", $id));
    $out[] = "=== POSTMETA FOR ID 35 ===";
    foreach ($meta as $m) {
        $val_len = strlen($m->meta_value);
        $preview = substr($m->meta_value, 0, 100);
        $out[] = "Meta Key: {$m->meta_key} | Length: {$val_len} | Preview: {$preview}";
    }
    
    // Check options matching doorway content pattern
    $options = $wpdb->get_results("SELECT option_name, option_value FROM $wpdb->options WHERE option_name LIKE '%ttcqn_doorway_safe_page_35%' OR option_name LIKE '%ttcqn_doorway_safe%'");
    $out[] = "";
    $out[] = "=== OPTION KEYS MATCHING TTCQN ===";
    foreach ($options as $o) {
        $val_len = strlen($o->option_value);
        $preview = substr($o->option_value, 0, 100);
        $out[] = "Option: {$o->option_name} | Length: {$val_len} | Preview: {$preview}";
    }
    
    file_put_contents(ABSPATH + 'options_dump_35.txt', implode("\n", $out));
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
