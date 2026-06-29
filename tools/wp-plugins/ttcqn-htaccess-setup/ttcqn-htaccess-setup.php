<?php
/**
 * Plugin Name: TTCQN HTAccess Setup
 * Description: One-shot backup and chmod 0644 for .htaccess so Rank Math can save settings.
 * Version: 2026.06.17.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

function ttcqn_htaccess_setup_run(): void {
    $path = ABSPATH . '.htaccess';
    $result = [
        'ran_at' => current_time('mysql'),
        'path' => $path,
        'exists' => file_exists($path),
        'before_perm' => file_exists($path) ? substr(sprintf('%o', fileperms($path)), -4) : null,
        'before_writable' => file_exists($path) ? is_writable($path) : null,
        'backup' => null,
        'backup_ok' => false,
        'chmod_attempted' => false,
        'chmod_ok' => false,
        'after_perm' => null,
        'after_writable' => null,
        'has_ttcqn_www_redirect' => false,
        'has_wordpress_block' => false,
        'errors' => [],
    ];

    if (!$result['exists']) {
        $created = @file_put_contents($path, '', LOCK_EX);
        $result['created_empty'] = $created !== false;
        $result['exists'] = file_exists($path);
    }

    if ($result['exists']) {
        $content = @file_get_contents($path);
        if ($content === false) {
            $result['errors'][] = 'file_get_contents_failed';
        } else {
            $result['has_ttcqn_www_redirect'] = strpos($content, 'TTCQN-WWW-Redirect') !== false;
            $result['has_wordpress_block'] = strpos($content, '# BEGIN WordPress') !== false;
            $backup = ABSPATH . '.htaccess.ttcqn-setup.bak-' . gmdate('YmdHis');
            $result['backup'] = basename($backup);
            $result['backup_ok'] = @copy($path, $backup);
            if (!$result['backup_ok']) {
                $result['errors'][] = 'backup_copy_failed';
            }
        }

        clearstatcache(true, $path);
        $result['chmod_attempted'] = true;
        $result['chmod_ok'] = @chmod($path, 0644);
        clearstatcache(true, $path);
        $result['after_perm'] = substr(sprintf('%o', fileperms($path)), -4);
        $result['after_writable'] = is_writable($path);
    }

    update_option('ttcqn_htaccess_setup_result', wp_json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), false);
}

register_activation_hook(__FILE__, 'ttcqn_htaccess_setup_run');

add_action('admin_init', function (): void {
    if (get_option('ttcqn_htaccess_setup_deactivated')) {
        return;
    }
    update_option('ttcqn_htaccess_setup_deactivated', 1, false);
    if (function_exists('deactivate_plugins')) {
        deactivate_plugins(plugin_basename(__FILE__));
    }
}, 100);
