<?php
/*
Plugin Name: TTCQN Disable Elementor 35
Description: One-time: tat Elementor cho page 35 de render bang post_content. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    $id = 35;
    $before = [
        'edit_mode' => get_post_meta($id, '_elementor_edit_mode', true),
        'version'   => get_post_meta($id, '_elementor_version', true),
        'tmpl_type' => get_post_meta($id, '_elementor_template_type', true),
        'data_len'  => strlen(get_post_meta($id, '_elementor_data', true)),
        'template'  => get_page_template_slug($id),
    ];
    delete_post_meta($id, '_elementor_edit_mode');
    delete_post_meta($id, '_elementor_data');
    delete_post_meta($id, '_elementor_template_type');
    delete_post_meta($id, '_elementor_version');
    delete_post_meta($id, '_elementor_page_settings');
    delete_post_meta($id, '_elementor_conditions');
    delete_post_meta($id, '_elementor_css');
    delete_post_meta($id, '_wp_page_template');
    update_post_meta($id, '_wp_page_template', 'default');
    if ( function_exists('wp_cache_flush') ) wp_cache_flush();
    clean_post_cache($id);
    $after = [
        'edit_mode' => get_post_meta($id, '_elementor_edit_mode', true),
        'data_len'  => strlen(get_post_meta($id, '_elementor_data', true)),
        'template'  => get_page_template_slug($id),
    ];
    file_put_contents(ABSPATH . 'elementor35_dump.txt', "BEFORE: " . json_encode($before) . "\nAFTER: " . json_encode($after));
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
