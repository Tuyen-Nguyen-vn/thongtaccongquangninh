<?php
/**
 * Plugin Name: TTCQN QN Service Landing
 * Description: React/Tailwind landing page for "Thông tắc cống - Hút bể phốt tại Quảng Ninh" rendered by shortcode.
 * Version: 2026.06.28.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_QN_SERVICE_LANDING_VERSION = '2026.06.28.1';
const TTCQN_QN_SERVICE_LANDING_SHORTCODE = 'ttcqn_qn_service_landing';
const TTCQN_QN_SERVICE_LANDING_HANDLE = 'ttcqn-qn-service-landing';

function ttcqn_qn_service_landing_title(): string
{
    return 'Thông Tắc Cống, Hút Bể Phốt Tại Quảng Ninh | Hotline 0963.953.533';
}

function ttcqn_qn_service_landing_description(): string
{
    return 'Dịch vụ thông tắc cống, thông tắc bồn cầu, xử lý mùi hôi, hút bể phốt tại Quảng Ninh. Có mặt nhanh 15-30 phút, tiếp nhận 05:00-22:00 hằng ngày, báo giá rõ ràng. Gọi 0963.953.533.';
}

function ttcqn_qn_service_landing_keywords(): string
{
    return 'thông tắc cống quảng ninh, thông tắc bồn cầu quảng ninh, hút bể phốt quảng ninh, xử lý mùi hôi nhà vệ sinh quảng ninh, thông tắc cống hạ long, hút bể phốt hạ long, thông tắc cống cẩm phả';
}

function ttcqn_qn_service_landing_canonical_url(): string
{
    return home_url('/hut-be-phot-thong-tac-cong-quang-ninh/');
}

function ttcqn_qn_service_landing_image_url(): string
{
    return plugins_url('assets/images/hero-xe-hut-be-phot-quang-ninh.jpg', __FILE__);
}

function ttcqn_qn_service_landing_manifest(): array
{
    static $manifest = null;
    if (is_array($manifest)) {
        return $manifest;
    }

    $manifest_path = plugin_dir_path(__FILE__) . 'assets/.vite/manifest.json';
    if (!is_readable($manifest_path)) {
        $manifest = [];
        return $manifest;
    }

    $decoded = json_decode((string) file_get_contents($manifest_path), true);
    $manifest = is_array($decoded) ? $decoded : [];
    return $manifest;
}

function ttcqn_qn_service_landing_manifest_entry(): array
{
    $manifest = ttcqn_qn_service_landing_manifest();
    return isset($manifest['index.html']) && is_array($manifest['index.html']) ? $manifest['index.html'] : [];
}

function ttcqn_qn_service_landing_has_shortcode_on_page(): bool
{
    if (!is_singular()) {
        return false;
    }

    $post = get_post();
    if (!$post || !isset($post->post_content)) {
        return false;
    }

    return has_shortcode((string) $post->post_content, TTCQN_QN_SERVICE_LANDING_SHORTCODE);
}

function ttcqn_qn_service_landing_enqueue_assets(): void
{
    static $enqueued = false;
    if ($enqueued) {
        return;
    }

    $entry = ttcqn_qn_service_landing_manifest_entry();
    if (empty($entry['file'])) {
        return;
    }

    $asset_base_url = plugins_url('assets', __FILE__);

    if (!empty($entry['css']) && is_array($entry['css'])) {
        foreach ($entry['css'] as $index => $css_file) {
            wp_enqueue_style(
                TTCQN_QN_SERVICE_LANDING_HANDLE . '-' . (int) $index,
                plugins_url('assets/' . ltrim((string) $css_file, '/'), __FILE__),
                [],
                TTCQN_QN_SERVICE_LANDING_VERSION
            );
        }
    }

    wp_enqueue_script(
        TTCQN_QN_SERVICE_LANDING_HANDLE,
        plugins_url('assets/' . ltrim((string) $entry['file'], '/'), __FILE__),
        [],
        TTCQN_QN_SERVICE_LANDING_VERSION,
        true
    );

    wp_add_inline_script(
        TTCQN_QN_SERVICE_LANDING_HANDLE,
        'window.TTCQN_QN_LANDING_ASSET_BASE=' . wp_json_encode($asset_base_url) . ';window.TTCQN_QN_LANDING_DISABLE_CLIENT_SCHEMA=true;',
        'before'
    );

    $enqueued = true;
}

add_filter('script_loader_tag', function (string $tag, string $handle): string {
    if ($handle !== TTCQN_QN_SERVICE_LANDING_HANDLE) {
        return $tag;
    }

    if (str_contains($tag, ' type=')) {
        return $tag;
    }

    return str_replace('<script ', '<script type="module" ', $tag);
}, 10, 2);

add_action('wp_enqueue_scripts', function (): void {
    if (ttcqn_qn_service_landing_has_shortcode_on_page()) {
        ttcqn_qn_service_landing_enqueue_assets();
    }
});

add_shortcode(TTCQN_QN_SERVICE_LANDING_SHORTCODE, function (): string {
    ttcqn_qn_service_landing_enqueue_assets();

    ob_start();
    ?>
    <div id="ttcqn-qn-landing-root" data-ttcqn-qn-landing-version="<?php echo esc_attr(TTCQN_QN_SERVICE_LANDING_VERSION); ?>"></div>
    <noscript>
        <section>
            <h1>Thông tắc cống, hút bể phốt tại Quảng Ninh</h1>
            <p>Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận thông tắc cống, thông tắc bồn cầu, xử lý mùi hôi và hút bể phốt tại Hạ Long, Cẩm Phả, Uông Bí và toàn tỉnh.</p>
            <p><strong>Hotline: <a href="tel:0963953533">0963.953.533</a> - Zalo: <a href="https://zalo.me/0931156756">0931.156.756</a></strong></p>
        </section>
    </noscript>
    <?php
    return (string) ob_get_clean();
});

add_filter('pre_get_document_title', function (string $title): string {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_title() : $title;
}, 1000);

add_filter('rank_math/frontend/title', function ($title) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_title() : $title;
}, 1000);

add_filter('rank_math/frontend/description', function ($description) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_description() : $description;
}, 1000);

add_filter('rank_math/frontend/canonical', function ($canonical) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_canonical_url() : $canonical;
}, 1000);

add_filter('rank_math/opengraph/facebook/title', function ($title) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_title() : $title;
}, 1000);

add_filter('rank_math/opengraph/facebook/description', function ($description) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_description() : $description;
}, 1000);

add_filter('rank_math/opengraph/facebook/image', function ($image) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_image_url() : $image;
}, 1000);

add_filter('rank_math/opengraph/twitter/title', function ($title) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_title() : $title;
}, 1000);

add_filter('rank_math/opengraph/twitter/description', function ($description) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_description() : $description;
}, 1000);

add_filter('rank_math/opengraph/twitter/image', function ($image) {
    return ttcqn_qn_service_landing_has_shortcode_on_page() ? ttcqn_qn_service_landing_image_url() : $image;
}, 1000);

add_action('wp_head', function (): void {
    if (!ttcqn_qn_service_landing_has_shortcode_on_page()) {
        return;
    }

    if (!defined('RANK_MATH_VERSION')) {
        echo '<title>' . esc_html(ttcqn_qn_service_landing_title()) . '</title>' . "\n";
        echo '<meta name="description" content="' . esc_attr(ttcqn_qn_service_landing_description()) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url(ttcqn_qn_service_landing_canonical_url()) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr(ttcqn_qn_service_landing_title()) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr(ttcqn_qn_service_landing_description()) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url(ttcqn_qn_service_landing_canonical_url()) . '">' . "\n";
        echo '<meta property="og:image" content="' . esc_url(ttcqn_qn_service_landing_image_url()) . '">' . "\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    }

    echo '<meta name="keywords" content="' . esc_attr(ttcqn_qn_service_landing_keywords()) . '">' . "\n";
    echo '<meta name="robots" content="index, follow, max-image-preview:large">' . "\n";
    foreach (ttcqn_qn_service_landing_schema_graph() as $schema) {
        echo '<script type="application/ld+json" data-ttcqn-qn-service-landing-schema="1">' .
            wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) .
            '</script>' . "\n";
    }
}, 20);

function ttcqn_qn_service_landing_service_areas(): array
{
    return ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Móng Cái', 'Quảng Yên', 'Đông Triều', 'Vân Đồn', 'Tiên Yên', 'Ba Chẽ', 'Hoành Bồ', 'Bình Liêu', 'Hải Hà', 'Đầm Hà', 'Cô Tô'];
}

function ttcqn_qn_service_landing_services(): array
{
    return [
        'Thông tắc cống Quảng Ninh',
        'Thông tắc bồn cầu Quảng Ninh',
        'Xử lý mùi hôi nhà vệ sinh, bếp, cống thoát sàn',
        'Hút bể phốt Quảng Ninh',
    ];
}

function ttcqn_qn_service_landing_schema_graph(): array
{
    $page_url = ttcqn_qn_service_landing_canonical_url();
    $business_id = $page_url . '#localbusiness';
    $faq_items = ttcqn_qn_service_landing_faq_items();
    $area_served = array_map(
        static function (string $area): array {
            return [
                '@type' => 'AdministrativeArea',
                'name' => $area === 'Hoành Bồ' ? 'Hoành Bồ, Hạ Long' : $area . ', Quảng Ninh',
            ];
        },
        ttcqn_qn_service_landing_service_areas()
    );

    return [
        [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            '@id' => $business_id,
            'name' => 'Môi Trường Đô Thị Số 1 Quảng Ninh',
            'url' => $page_url,
            'image' => ttcqn_qn_service_landing_image_url(),
            'telephone' => '0963.953.533',
            'email' => 'moitruongdothiso1qn@gmail.com',
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => 'Hạ Long',
                'addressRegion' => 'Quảng Ninh',
                'addressCountry' => 'VN',
            ],
            'priceRange' => 'Liên hệ báo giá',
            'openingHours' => 'Mo-Su 05:00-22:00',
            'areaServed' => $area_served,
            'serviceType' => ['Thông tắc cống', 'Thông tắc bồn cầu', 'Hút bể phốt', 'Xử lý mùi hôi'],
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => '0963.953.533',
                'contactType' => 'customer service',
                'areaServed' => 'VN',
                'availableLanguage' => 'Vietnamese',
            ],
        ],
        [
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            '@id' => $page_url . '#service',
            'name' => 'Thông tắc cống, hút bể phốt tại Quảng Ninh',
            'serviceType' => ttcqn_qn_service_landing_services(),
            'provider' => ['@id' => $business_id],
            'areaServed' => [
                '@type' => 'AdministrativeArea',
                'name' => 'Quảng Ninh',
            ],
            'availableChannel' => [
                '@type' => 'ServiceChannel',
                'servicePhone' => [
                    '@type' => 'ContactPoint',
                    'telephone' => '0963.953.533',
                    'contactType' => 'customer service',
                ],
            ],
        ],
        [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            '@id' => $page_url . '#faq',
            'mainEntity' => array_map(
                static function (array $faq): array {
                    return [
                        '@type' => 'Question',
                        'name' => $faq['question'],
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => $faq['answer'],
                        ],
                    ];
                },
                $faq_items
            ),
        ],
        [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            '@id' => $page_url . '#breadcrumb',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Trang chủ',
                    'item' => home_url('/'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => 'Dịch vụ Quảng Ninh',
                    'item' => home_url('/dich-vu/'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => 'Thông tắc cống, hút bể phốt tại Quảng Ninh',
                    'item' => $page_url,
                ],
            ],
        ],
    ];
}

function ttcqn_qn_service_landing_faq_items(): array
{
    return [
        [
            'question' => 'Thông tắc cống tại Quảng Ninh bao lâu có mặt?',
            'answer' => 'Thông thường kỹ thuật viên có thể có mặt sau 15-30 phút tùy khu vực. Với các khu vực xa trung tâm, thời gian sẽ được thông báo cụ thể khi khách hàng gọi hotline.',
        ],
        [
            'question' => 'Hút bể phốt có làm bẩn khu vực thi công không?',
            'answer' => 'Chúng tôi sử dụng xe hút chuyên dụng, ống hút kín và quy trình thi công sạch sẽ, hạn chế tối đa mùi hôi và không làm bẩn khu vực xung quanh.',
        ],
        [
            'question' => 'Thông tắc bồn cầu có cần đục phá không?',
            'answer' => 'Phần lớn trường hợp được xử lý bằng máy lò xo chuyên dụng, không cần đục phá. Nếu phát sinh tình trạng nặng, kỹ thuật viên sẽ khảo sát và báo trước phương án xử lý.',
        ],
        [
            'question' => 'Dịch vụ có làm ngoài giờ, ban đêm hoặc ngày lễ không?',
            'answer' => 'Đơn vị tiếp nhận trong khung giờ 05:00-22:00 hằng ngày. Nếu phát sinh nhu cầu sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi hotline để được xác nhận khả năng điều phối thực tế.',
        ],
        [
            'question' => 'Có báo giá trước khi làm không?',
            'answer' => 'Có. Kỹ thuật viên sẽ kiểm tra hiện trạng, tư vấn phương án và báo giá rõ ràng trước khi thi công.',
        ],
    ];
}
