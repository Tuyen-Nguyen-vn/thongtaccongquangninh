<?php
/**
 * Plugin Name: TTCQN Doorway Safe Renderer
 * Description: Render selected TTCQN service pages from post_content when a legacy template keeps showing stale body content.
 * Version: 1.0.0
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

function ttcqn_doorway_safe_should_render()
{
    if (is_admin()) {
        return false;
    }

    $request_uri = isset($_SERVER['REQUEST_URI']) ? (string) wp_unslash($_SERVER['REQUEST_URI']) : '';
    $path = parse_url($request_uri, PHP_URL_PATH);
    $path = untrailingslashit((string) $path);

    return is_page(296) || $path === '/thong-tac-cong-ha-long' || strpos($request_uri, 'thong-tac-cong-ha-long') !== false;
}

function ttcqn_doorway_safe_byline(int $post_id): string
{
    $iso = get_post_modified_time(DATE_W3C, false, $post_id); // Cùng nguồn với dateModified trong schema BlogPosting.
    $display = get_the_modified_date('d/m/Y', $post_id);
    if (!is_string($iso) || $iso === '' || !is_string($display) || $display === '') {
        return '';
    }

    return '<p class="ttcqn-doorway-safe-meta">Cập nhật lần cuối: '
        . '<time datetime="' . esc_attr($iso) . '">' . esc_html($display) . '</time></p>';
}

add_action('template_redirect', function () {
    if (!ttcqn_doorway_safe_should_render()) {
        return;
    }

    status_header(200);
    nocache_headers();
    include __DIR__ . '/templates/page-content-render-v2.php';
    exit;
}, 0);

add_action('wp_head', function () {
    if (ttcqn_doorway_safe_should_render()) {
        echo "\n<meta name=\"ttcqn-doorway-safe-renderer\" content=\"active\" />\n";
    }
}, 1);
