<?php
/**
 * Plugin Name: TTCQN Bãi Cháy Meta Override
 * Description: Override public meta description only for post 2054 after Bãi Cháy H1/schema patch.
 * Version: 2026.06.28.1
 */
if (!defined('ABSPATH')) exit;

add_filter('rank_math/frontend/description', function(string $desc): string {
    return ((int) get_queried_object_id() === 2054) ? 'Thông tắc cống Bãi Cháy Hạ Long, xử lý nhanh cho nhà dân, khách sạn, nhà hàng. Báo giá trước, không đục phá. Gọi 0963.953.533.' : $desc;
}, 300);

add_filter('rank_math/opengraph/facebook/description', function(string $desc): string {
    return ((int) get_queried_object_id() === 2054) ? 'Thông tắc cống Bãi Cháy Hạ Long, xử lý nhanh cho nhà dân, khách sạn, nhà hàng. Báo giá trước, không đục phá. Gọi 0963.953.533.' : $desc;
}, 300);

add_filter('rank_math/opengraph/twitter/description', function(string $desc): string {
    return ((int) get_queried_object_id() === 2054) ? 'Thông tắc cống Bãi Cháy Hạ Long, xử lý nhanh cho nhà dân, khách sạn, nhà hàng. Báo giá trước, không đục phá. Gọi 0963.953.533.' : $desc;
}, 300);
