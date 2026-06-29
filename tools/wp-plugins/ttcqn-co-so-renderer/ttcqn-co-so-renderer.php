<?php
/**
 * Plugin Name: TTCQN Cơ Sở Renderer
 * Description: Renders the "Hệ thống cơ sở Quảng Ninh" standalone page at /he-thong-co-so-quang-ninh/.
 * Version: 2026.05.30.2
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('template_redirect', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return;
    }

    $path = (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $path = '/' . trim($path, '/');

    if ($path !== '/he-thong-co-so-quang-ninh') {
        return;
    }

    status_header(200);
    nocache_headers();

    include __DIR__ . '/templates/page-co-so.php';
    exit;
}, -200);
