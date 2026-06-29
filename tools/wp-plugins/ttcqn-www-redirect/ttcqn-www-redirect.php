<?php
/**
 * Plugin Name: TTCQN WWW Redirect
 * Description: Ghi redirect www -> non-www vao dau .htaccess va dong bo khi version doi.
 * Version: 1.2
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_WWW_REDIRECT_VERSION = '1.2';

function ttcqn_www_redirect_block(): string {
    return "# BEGIN TTCQN-WWW-Redirect\n"
        . "<IfModule mod_rewrite.c>\n"
        . "RewriteEngine On\n"
        . "RewriteCond %{HTTP_HOST} ^www\\.thongtaccongquangninh\\.com$ [NC]\n"
        . "RewriteRule ^ https://thongtaccongquangninh.com%{REQUEST_URI} [R=301,L,NE]\n"
        . "</IfModule>\n"
        . "# END TTCQN-WWW-Redirect\n";
}

function ttcqn_www_redirect_sync_htaccess(): void {
    $htaccess = ABSPATH . '.htaccess';
    $current = file_exists($htaccess) ? file_get_contents($htaccess) : '';

    if ($current === false) {
        return;
    }

    $block = ttcqn_www_redirect_block();
    $without_old_block = preg_replace(
        '~\s*# BEGIN TTCQN-WWW-Redirect\s*<IfModule mod_rewrite\.c>[\s\S]*?</IfModule>\s*# END TTCQN-WWW-Redirect\s*~',
        "\n",
        $current
    );
    $without_old_block = is_string($without_old_block) ? ltrim($without_old_block) : $current;
    $new = $block . "\n" . $without_old_block;

    if ($new === $current) {
        update_option('ttcqn_www_redirect_version', TTCQN_WWW_REDIRECT_VERSION, false);
        return;
    }

    if (file_exists($htaccess)) {
        $backup = ABSPATH . '.htaccess.ttcqn-www-redirect.bak-' . gmdate('YmdHis');
        copy($htaccess, $backup);
    }

    file_put_contents($htaccess, $new, LOCK_EX);
    update_option('ttcqn_www_redirect_done', current_time('mysql'));
    update_option('ttcqn_www_redirect_version', TTCQN_WWW_REDIRECT_VERSION, false);
}

register_activation_hook(__FILE__, 'ttcqn_www_redirect_sync_htaccess');

add_action('init', function(): void {
    if (get_option('ttcqn_www_redirect_version') !== TTCQN_WWW_REDIRECT_VERSION) {
        ttcqn_www_redirect_sync_htaccess();
    }
}, 1);
