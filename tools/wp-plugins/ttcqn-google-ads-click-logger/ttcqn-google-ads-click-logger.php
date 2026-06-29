<?php
/**
 * Plugin Name: TTCQN Google Ads Click Logger
 * Description: Ghi click có GCLID vào file riêng để hệ thống chống click ảo tải qua FTP.
 * Version: 2026.06.21.1
 * Author: Codex
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TTCQN_CLICK_LOGGER_DIR', 'ttcqn-click-logs' );
define( 'TTCQN_CLICK_LOGGER_FILE', 'click_log.php' );

/**
 * Lấy IP người truy cập. Header Cloudflare được ưu tiên khi có,
 * sau đó mới đến proxy và REMOTE_ADDR.
 */
function ttcqn_click_logger_get_ip() {
	$candidates = array();

	if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
		$candidates[] = wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] );
	}

	if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
		$forwarded = explode( ',', wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
		$candidates[] = trim( $forwarded[0] );
	}

	if ( ! empty( $_SERVER['REMOTE_ADDR'] ) ) {
		$candidates[] = wp_unslash( $_SERVER['REMOTE_ADDR'] );
	}

	foreach ( $candidates as $candidate ) {
		$candidate = trim( $candidate );
		if ( filter_var( $candidate, FILTER_VALIDATE_IP ) ) {
			return $candidate;
		}
	}

	return '';
}

/**
 * Tạo thư mục log và lớp bảo vệ truy cập trực tiếp.
 */
function ttcqn_click_logger_prepare_directory() {
	$upload = wp_upload_dir();
	if ( ! empty( $upload['error'] ) ) {
		return new WP_Error( 'upload_dir_error', $upload['error'] );
	}

	$directory = trailingslashit( $upload['basedir'] ) . TTCQN_CLICK_LOGGER_DIR;
	if ( ! wp_mkdir_p( $directory ) ) {
		return new WP_Error( 'mkdir_failed', 'Không tạo được thư mục log click.' );
	}

	$index_file = trailingslashit( $directory ) . 'index.php';
	if ( ! file_exists( $index_file ) ) {
		file_put_contents( $index_file, "<?php\n// Silence is golden.\n", LOCK_EX );
	}

	$htaccess_file = trailingslashit( $directory ) . '.htaccess';
	if ( ! file_exists( $htaccess_file ) ) {
		$rules = "Options -Indexes\n<FilesMatch \"\\.(php|txt|log)$\">\nRequire all denied\n</FilesMatch>\n";
		file_put_contents( $htaccess_file, $rules, LOCK_EX );
	}

	return $directory;
}

/**
 * Ghi một bản ghi khi URL có GCLID hợp lệ.
 */
function ttcqn_click_logger_capture() {
	if ( is_admin() || empty( $_GET['gclid'] ) ) {
		return;
	}

	$gclid = preg_replace( '/[^a-zA-Z0-9_-]/', '', wp_unslash( $_GET['gclid'] ) );
	if ( empty( $gclid ) ) {
		return;
	}

	$ip = ttcqn_click_logger_get_ip();
	if ( empty( $ip ) ) {
		return;
	}

	$directory = ttcqn_click_logger_prepare_directory();
	if ( is_wp_error( $directory ) ) {
		error_log( 'TTCQN Click Logger: ' . $directory->get_error_message() );
		return;
	}

	$log_file = trailingslashit( $directory ) . TTCQN_CLICK_LOGGER_FILE;
	$old_file = trailingslashit( $directory ) . 'click_log_old.php';

	if ( file_exists( $log_file ) && filesize( $log_file ) > 5 * MB_IN_BYTES ) {
		rename( $log_file, $old_file );
	}

	if ( ! file_exists( $log_file ) ) {
		file_put_contents( $log_file, "<?php exit; ?>\n", LOCK_EX );
	}

	$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] )
		? substr( sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ), 0, 250 )
		: '';
	$request_uri = isset( $_SERVER['REQUEST_URI'] )
		? substr( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 0, 200 )
		: '';

	$line = sprintf(
		"%s|%s|%s|%s|%s\n",
		current_time( 'Y-m-d H:i:s' ),
		$ip,
		$gclid,
		str_replace( '|', ' ', $user_agent ),
		str_replace( '|', ' ', $request_uri )
	);

	file_put_contents( $log_file, $line, FILE_APPEND | LOCK_EX );
}
add_action( 'init', 'ttcqn_click_logger_capture', 1 );

register_activation_hook(
	__FILE__,
	function () {
		ttcqn_click_logger_prepare_directory();
	}
);
