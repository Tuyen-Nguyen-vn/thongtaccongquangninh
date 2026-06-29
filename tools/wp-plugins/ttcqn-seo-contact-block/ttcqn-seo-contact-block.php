<?php
/**
 * Plugin Name: TTCQN SEO Contact Block
 * Plugin URI:  https://thongtaccongquangninh.com
 * Description: Appends a Local SEO / GEO contact block to the end of every public singular post, page, and CPT. One instance per request. Compatible with ttcqn-doorway-safe-renderer (uses ob_start fallback for page 296). No extra LocalBusiness schema — already handled by ttcqn-doorway-schema plugin.
 * Version:     2026.06.28.1
 * Author:      Codex
 * Text Domain: ttcqn-scb
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TTCQN_SCB_VERSION', '2026.06.28.1' );
define( 'TTCQN_SCB_MARKER', 'seo-contact-block' ); // sentinel: detect if block already present
define( 'TTCQN_SCB_OFFICE_ADDRESS', '111 Cái Lân, Bãi Cháy, Quảng Ninh' );
define( 'TTCQN_SCB_OFFICE_MAP_URL', 'https://www.google.com/maps/search/?api=1&query=111%20C%C3%A1i%20L%C3%A2n%2C%20B%C3%A3i%20Ch%C3%A1y%2C%20Qu%E1%BA%A3ng%20Ninh' );

// =============================================================================
// 1. HTML BLOCK
// =============================================================================

/**
 * Returns the full contact block HTML.
 * Edit ONLY this function to update content across the entire site.
 */
function ttcqn_scb_render_block(): string {
	return '
<section class="seo-contact-block" aria-labelledby="seo-contact-title">
  <div class="seo-contact-block__inner">
    <h2 id="seo-contact-title">Cách liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh</h2>

    <p>
      <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> cung cấp dịch vụ
      <strong>hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh</strong>.
      Đơn vị tiếp nhận khách hàng trong khung giờ 05:00-22:00 hằng ngày, tư vấn rõ ràng và điều phối nhanh khi khách hàng cần xử lý sự cố.
    </p>

    <ul class="seo-contact-block__list">
      <li><strong>Hotline:</strong> <a href="tel:0963953533">0963.953.533</a> - <a href="tel:0931156756">0931.156.756</a></li>
      <li><strong>Email:</strong> <a href="mailto:moitruongdothiso1qn@gmail.com">moitruongdothiso1qn@gmail.com</a></li>
      <li><strong>Website:</strong> <a href="https://thongtaccongquangninh.com" target="_blank" rel="noopener">thongtaccongquangninh.com</a></li>
      <li><strong>Địa chỉ văn phòng Hạ Long:</strong> <a href="' . esc_url( TTCQN_SCB_OFFICE_MAP_URL ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( TTCQN_SCB_OFFICE_ADDRESS ) . '</a></li>
      <li><strong>Thời gian làm việc:</strong> 05:00-22:00 hằng ngày</li>
      <li><strong>Khu vực phục vụ:</strong> Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Vân Đồn, Móng Cái và toàn tỉnh Quảng Ninh</li>
    </ul>

    <p class="seo-contact-block__cta">
      <strong>Gọi ngay 0963.953.533 - 0931.156.756</strong> để được Môi Trường Đô Thị Số 1 Quảng Ninh tư vấn, báo giá và hỗ trợ nhanh chóng.
    </p>
  </div>
</section>
';
}

function ttcqn_scb_footer_nap_html(): string {
	return '<div class="footer-nap-info" style="text-align:center;color:#888;font-size:13px;padding:6px 0 2px;">'
		. '<a href="' . esc_url( TTCQN_SCB_OFFICE_MAP_URL ) . '" target="_blank" rel="noopener noreferrer" style="color:#aaa;">' . esc_html( TTCQN_SCB_OFFICE_ADDRESS ) . '</a>'
		. ' | <a href="tel:0931156756" style="color:#aaa;">0931.156.756</a>'
		. ' | <a href="tel:0963953533" style="color:#aaa;">0963.953.533</a>'
		. ' | <a href="mailto:moitruongdothiso1qn@gmail.com" style="color:#aaa;">moitruongdothiso1qn@gmail.com</a>'
		. '</div>';
}

function ttcqn_scb_sync_generatepress_footer_nap( string $copyright = '' ): string {
	return ttcqn_scb_footer_nap_html();
}
add_filter( 'generate_copyright', 'ttcqn_scb_sync_generatepress_footer_nap', 1000 );

// =============================================================================
// 2. the_content FILTER — standard WP rendering (posts, pages, all CPTs)
// =============================================================================

/**
 * Appends the contact block to singular content rendered through the standard
 * WordPress apply_filters('the_content', ...) pipeline.
 *
 * Priority 99:
 *   - After shortcode expansion (priority 11)
 *   - After Elementor / Gutenberg block rendering (priority 9–20)
 *   - After ttcqn_inject_ai_features_to_content (priority 9)
 *   - After ttcqn_doorway_schema_strip_escaped_json_ld_content (priority 20)
 *   - Before wptexturize / nl2br transforms (priority 9999+)
 *
 * Guards:
 *   - Fires exactly once per HTTP request (static $done flag).
 *   - Skips admin, REST API, AJAX, autosave, feed, search, archive, taxonomy,
 *     blog-index, non-singular views.
 *   - Skips the homepage (front page): the home-emergency-renderer handles it
 *     with its own CTAs; appending here would create a duplicate block below
 *     the page's lead-generation sections.
 *   - Skips if the sentinel class is already in $content (e.g. manually inserted
 *     into a post in the editor).
 *   - Skips genuinely empty content (draft preview, protected post, etc.).
 */
function ttcqn_scb_filter_content( string $content ): string {
	static $done = false;
	if ( $done ) {
		return $content;
	}

	// ── Frontend-only guards ──────────────────────────────────────────────────
	if ( is_admin() ) {
		return $content;
	}
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return $content;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return $content;
	}
	if ( wp_doing_ajax() ) {
		return $content;
	}

	// ── Content-type guards ───────────────────────────────────────────────────
	if ( is_feed() )     { return $content; }
	if ( is_search() )   { return $content; }
	if ( is_archive() )  { return $content; }
	if ( is_category() ) { return $content; }
	if ( is_tag() )      { return $content; }
	if ( is_tax() )      { return $content; }
	if ( is_home() )     { return $content; }   // Blog posts listing page
	if ( is_front_page() ) { return $content; } // Homepage (handled by home-emergency-renderer)

	// ── Must be a singular view ───────────────────────────────────────────────
	if ( ! is_singular() ) {
		return $content;
	}

	// ── Duplicate guard ───────────────────────────────────────────────────────
	if ( strpos( $content, TTCQN_SCB_MARKER ) !== false ) {
		return $content;
	}

	// ── Skip truly empty content (preview, protected, etc.) ───────────────────
	if ( trim( strip_tags( $content ) ) === '' ) {
		return $content;
	}

	$done = true;
	return $content . "\n" . ttcqn_scb_render_block();
}
add_filter( 'the_content', 'ttcqn_scb_filter_content', 99 );


// =============================================================================
// 3. wp_footer FALLBACK — for ttcqn-doorway-safe-renderer (page 296)
// =============================================================================

/**
 * The ttcqn-doorway-safe-renderer plugin echoes $content directly without
 * calling apply_filters('the_content'), so the filter above never fires for
 * page 296 (/thong-tac-cong-ha-long/).
 *
 * Fix: hook into wp_footer (priority 1) and output the block server-side for
 * page 296. The doorway-safe-renderer template calls get_footer() which runs
 * wp_footer, so this fires before </body>. The block is fully server-side —
 * visible to Googlebot without JavaScript.
 *
 * No duplicate risk: the_content filter above uses static $done and also
 * skips page 296 via the same is_singular/front_page guards; this hook only
 * fires when is_page(296) is true which never triggers the_content path.
 */
function ttcqn_scb_footer_for_doorway(): void {
	if ( ! is_page( 296 ) ) {
		return;
	}
	echo "\n" . ttcqn_scb_render_block() . "\n";
}
add_action( 'wp_footer', 'ttcqn_scb_footer_for_doorway', 1 );


// =============================================================================
// 4. CSS ENQUEUE
// =============================================================================

/**
 * Loads the contact block stylesheet on all public singular pages.
 * Matches the same conditions as ttcqn_scb_filter_content() so CSS is loaded
 * exactly when and where the block is rendered.
 *
 * Works for:
 *   - Standard WP templates (enqueued before wp_head via wp_enqueue_scripts)
 *   - ttcqn-doorway-safe-renderer (calls get_header() → wp_head() → enqueue fires)
 *   - ttcqn-home-emergency-renderer (calls wp_head() inline → enqueue fires)
 */
function ttcqn_scb_enqueue_styles(): void {
	if ( is_admin() || is_feed() || is_search() || is_archive() || is_home() ) {
		return;
	}
	if ( ! is_singular() ) {
		return;
	}
	if ( is_front_page() ) {
		return;
	}

	wp_enqueue_style(
		'ttcqn-seo-contact-block',
		plugins_url( 'assets/seo-contact-block.css', __FILE__ ),
		[],
		TTCQN_SCB_VERSION
	);
}
add_action( 'wp_enqueue_scripts', 'ttcqn_scb_enqueue_styles' );
