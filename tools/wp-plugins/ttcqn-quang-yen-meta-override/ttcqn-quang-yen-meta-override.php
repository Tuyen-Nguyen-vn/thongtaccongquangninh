<?php
/**
 * Plugin Name: TTCQN Quang Yen Meta Override
 * Description: Narrow override for page 424 meta description after Quang Yen TTC rewrite.
 * Version: 2026.06.28.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_QY_META_PAGE_ID = 424;
const TTCQN_QY_META_DESC = 'Thông tắc cống Quảng Yên, khảo sát nhanh, báo giá trước, không đục phá, bảo hành 6-24 tháng. Tiếp nhận 05:00-22:00. Gọi 0963.953.533.';

function ttcqn_qy_meta_is_target(): bool {
    return (int) get_queried_object_id() === TTCQN_QY_META_PAGE_ID;
}

add_action('init', function (): void {
    update_post_meta(TTCQN_QY_META_PAGE_ID, 'rank_math_description', TTCQN_QY_META_DESC);
    update_post_meta(TTCQN_QY_META_PAGE_ID, '_rank_math_description', TTCQN_QY_META_DESC);
}, 20);

add_filter('rank_math/frontend/description', function ($description): string {
    return ttcqn_qy_meta_is_target() ? TTCQN_QY_META_DESC : (string) $description;
}, 999);

add_filter('rank_math/opengraph/facebook/description', function ($description): string {
    return ttcqn_qy_meta_is_target() ? TTCQN_QY_META_DESC : (string) $description;
}, 999);

add_filter('rank_math/opengraph/twitter/description', function ($description): string {
    return ttcqn_qy_meta_is_target() ? TTCQN_QY_META_DESC : (string) $description;
}, 999);

add_filter('rank_math/json_ld', function ($data, $jsonld = null) {
    if (!ttcqn_qy_meta_is_target() || !is_array($data)) {
        return $data;
    }

    foreach ($data as $key => $node) {
        if (!is_array($node)) {
            continue;
        }
        $type = $node['@type'] ?? '';
        $types = is_array($type) ? $type : [$type];
        if (array_intersect($types, ['WebPage', 'Article', 'BlogPosting'])) {
            $data[$key]['description'] = TTCQN_QY_META_DESC;
        }
    }

    return $data;
}, 999, 2);
