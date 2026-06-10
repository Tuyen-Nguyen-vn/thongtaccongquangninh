<?php
/**
 * ClickGuard - track.php (dành cho website chạy hosting PHP/WordPress)
 *
 * Cách dùng:
 * 1. Tải file này lên thư mục gốc website (cùng cấp index.php).
 * 2. Thêm vào đầu file index.php (hoặc header.php của theme WordPress):
 *        <?php require_once __DIR__ . '/track.php'; ?>
 * 3. File sẽ:
 *    - Ghi mỗi lượt truy cập vào clickguard_clicks.log
 *      (định dạng: ISO_TIME|IP|URI|USER_AGENT — chạy clickguard.py với
 *       log.format = "track" để phân tích)
 *    - Tự trả mã 403 cho IP có trong clickguard_blocked.txt
 *      (tải file data/blocked_ips.txt do clickguard.py tạo ra rồi đổi tên
 *       thành clickguard_blocked.txt và upload lên cùng thư mục)
 */

if (!defined('CLICKGUARD_LOADED')) {
    define('CLICKGUARD_LOADED', true);

    $cg_dir = __DIR__;
    $cg_log = $cg_dir . '/clickguard_clicks.log';
    $cg_blocklist = $cg_dir . '/clickguard_blocked.txt';

    // Lấy IP thật của khách (hỗ trợ Cloudflare / proxy)
    $cg_ip = $_SERVER['REMOTE_ADDR'] ?? '';
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR'] as $h) {
        if (!empty($_SERVER[$h])) {
            $cg_ip = trim(explode(',', $_SERVER[$h])[0]);
            break;
        }
    }

    // 1. Chặn IP có trong danh sách
    if ($cg_ip && is_readable($cg_blocklist)) {
        $blocked = file($cg_blocklist, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($blocked && in_array($cg_ip, $blocked, true)) {
            http_response_code(403);
            header('Content-Type: text/html; charset=utf-8');
            echo '<h1>403 - Truy cập bị từ chối</h1>';
            exit;
        }
    }

    // 2. Ghi log lượt truy cập (bỏ qua file tĩnh)
    $cg_uri = $_SERVER['REQUEST_URI'] ?? '/';
    $cg_path = parse_url($cg_uri, PHP_URL_PATH) ?: '/';
    $cg_static = ['css','js','png','jpg','jpeg','gif','webp','svg','ico','woff','woff2','ttf','map'];
    $cg_ext = strtolower(pathinfo($cg_path, PATHINFO_EXTENSION));
    if (!in_array($cg_ext, $cg_static, true)) {
        $cg_ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250);
        $cg_line = date('c') . '|' . $cg_ip . '|' . $cg_uri . '|' .
                   str_replace(['|', "\n", "\r"], ' ', $cg_ua) . "\n";
        @file_put_contents($cg_log, $cg_line, FILE_APPEND | LOCK_EX);
    }
}
