<?php
/**
 * Plugin Name: TTCQN Home Emergency Renderer
 * Description: Renders the approved direct homepage template when the active theme home template returns an empty response.
 * Version: 2026.06.05.2
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_HOME_EMERGENCY_VERSION = '2026.06.05.2';
const TTCQN_HOME_OFFICE_HA_LONG_ADDRESS = '111 Cái Lân, Bãi Cháy, Quảng Ninh';
const TTCQN_HOME_OFFICE_HA_LONG_MAP_URL = 'https://www.google.com/maps/search/?api=1&query=111%20C%C3%A1i%20L%C3%A2n%2C%20B%C3%A3i%20Ch%C3%A1y%2C%20Qu%E1%BA%A3ng%20Ninh';
const TTCQN_HOME_OFFICE_HA_LONG_MAP_EMBED = 'https://www.google.com/maps?q=111%20C%C3%A1i%20L%C3%A2n%2C%20B%C3%A3i%20Ch%C3%A1y%2C%20Qu%E1%BA%A3ng%20Ninh&output=embed';

function ttcqn_home_emergency_meta_description(): string
{
    return 'Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh 24/7. Có mặt 15-30 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756.';
}

function ttcqn_home_emergency_should_override_meta(): bool
{
    return function_exists('ttcqn_home_emergency_is_front_request') && ttcqn_home_emergency_is_front_request();
}

add_filter('rank_math/frontend/description', function ($description) {
    return ttcqn_home_emergency_should_override_meta() ? ttcqn_home_emergency_meta_description() : $description;
}, 1000);

add_filter('rank_math/opengraph/facebook/description', function ($description) {
    return ttcqn_home_emergency_should_override_meta() ? ttcqn_home_emergency_meta_description() : $description;
}, 1000);

add_filter('rank_math/opengraph/twitter/description', function ($description) {
    return ttcqn_home_emergency_should_override_meta() ? ttcqn_home_emergency_meta_description() : $description;
}, 1000);

function ttcqn_color_system_should_print_frontend(): bool
{
    return !is_admin() && !wp_doing_ajax() && !wp_is_json_request();
}

function ttcqn_replace_legacy_wp_custom_css(): void
{
    if (!ttcqn_color_system_should_print_frontend()) {
        return;
    }

    remove_action('wp_head', 'wp_custom_css_cb', 101);
}
add_action('init', 'ttcqn_replace_legacy_wp_custom_css', 20);

// Bỏ CSS không dùng của WordPress core để giảm tải trang
add_action('wp_enqueue_scripts', function (): void {
    if (is_admin()) return;
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('global-styles');
    wp_dequeue_style('classic-theme-styles');
}, 100);

// Thêm font-display:swap cho Google Fonts để tránh block render
add_filter('style_loader_tag', function (string $html, string $handle): string {
    if (str_contains($html, 'fonts.googleapis.com') && !str_contains($html, 'display=swap')) {
        $html = str_replace("fonts.googleapis.com/css", "fonts.googleapis.com/css?display=swap", $html);
        // Tránh duplicate nếu URL đã có query string khác
        $html = str_replace("css?display=swap?", "css?display=swap&", $html);
    }
    return $html;
}, 10, 2);

// =====================================================================
// DELAY THIRD-PARTY SCRIPTS (GA4 / GTM) cho đến khi user tương tác
// Giảm TBT (Total Blocking Time) — không ảnh hưởng tracking chính xác
// =====================================================================
if (!is_admin()) {
    // Bước 1: Bắt output của wp_head, tìm <script src="googletagmanager.com...">
    // và thay src → data-src để trình duyệt không load ngay
    add_action('wp_head', function (): void {
        ob_start(function (string $buf): string {
            // Chỉ xử lý external script tags từ các domain analytics
            $delay_pattern = '#(<script\b[^>]*\bsrc=["\'])' .
                '(https?://(?:www\.googletagmanager\.com|www\.google-analytics\.com|' .
                'static\.doubleclick\.net|connect\.facebook\.net)[^"\']*' .
                ')(["\'][^>]*>)(\s*</script>)#si';

            return preg_replace_callback(
                $delay_pattern,
                function (array $m): string {
                    // Thêm data-ttcqn-delay="1", đổi src → data-src
                    $attrs = str_replace($m[1], '<script data-ttcqn-delay="1" data-src="' . esc_url($m[2]) . '" ', $m[1] . $m[2] . $m[3]);
                    // Xây lại tag không có src để trình duyệt không fetch
                    $tag = '<script data-ttcqn-delay="1" data-src="' . esc_url($m[2]) . '">' . '</script>';
                    return $tag;
                },
                $buf
            );
        });
    }, 1); // priority 1 = chạy đầu tiên trong wp_head

    add_action('wp_head', function (): void {
        ob_end_flush(); // flush buffer đã xử lý
    }, PHP_INT_MAX); // priority PHP_INT_MAX = chạy cuối cùng trong wp_head

    // Bước 2: Inject JS trigger ở footer — load delayed scripts khi user tương tác lần đầu
    add_action('wp_footer', function (): void {
        echo <<<'HTML'
<script id="ttcqn-delay-loader">
(function(){
  var loaded = false;
  function loadDelayed(){
    if(loaded) return; loaded = true;
    document.querySelectorAll('script[data-ttcqn-delay]').forEach(function(s){
      var el = document.createElement('script');
      el.src = s.getAttribute('data-src');
      el.async = true;
      document.head.appendChild(el);
    });
    ['scroll','click','mousemove','touchstart','keydown'].forEach(function(e){
      window.removeEventListener(e, loadDelayed, {passive:true});
    });
  }
  ['scroll','click','mousemove','touchstart','keydown'].forEach(function(e){
    window.addEventListener(e, loadDelayed, {passive:true, once:true});
  });
  // Fallback: load sau 5 giây dù không có tương tác (đảm bảo tracking bot/crawler)
  setTimeout(loadDelayed, 5000);
})();
</script>
HTML;
    }, 5);
}

function ttcqn_home_phone_icon_svg(string $class = 'ttcqn-phone-svg'): string
{
    return '<svg class="' . esc_attr($class) . '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2C10 20.6 3.4 14 2.5 4.2A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>';
}
const TTCQN_HOME_EMERGENCY_BYPASS_TOKEN = 'codex-20260513-template-test';

$ttcqn_home_integrated_ui = [
    __DIR__ . '/includes/scroll-guide-assistant.php',
    __DIR__ . '/includes/mobile-left-sticky-cta.php',
];
foreach ($ttcqn_home_integrated_ui as $ttcqn_home_integrated_ui_file) {
    if (file_exists($ttcqn_home_integrated_ui_file)) {
        require_once $ttcqn_home_integrated_ui_file;
    }
}
unset($ttcqn_home_integrated_ui, $ttcqn_home_integrated_ui_file);

function ttcqn_seo_hero_asset(string $path): string
{
    return plugins_url(ltrim($path, '/'), __FILE__);
}

function ttcqn_schema_business_id(): string
{
    return home_url('/#localbusiness');
}

function ttcqn_schema_website_id(): string
{
    return home_url('/#website');
}

function ttcqn_schema_primary_logo_url(): string
{
    return 'https://thongtaccongquangninh.com/wp-content/uploads/2026/04/logo-cong-ty.png';
}

function ttcqn_schema_area_served(): array
{
    $cities = ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Móng Cái', 'Đông Triều', 'Quảng Yên', 'Vân Đồn', 'Tiên Yên'];

    return array_map(
        static function (string $city): array {
            return [
                '@type' => 'City',
                'name'  => $city,
                'containedInPlace' => [
                    '@type' => 'AdministrativeArea',
                    'name'  => 'Quảng Ninh',
                ],
            ];
        },
        $cities
    );
}

function ttcqn_schema_offer_catalog_node(): array
{
    $services = [
        ['Hút bể phốt Quảng Ninh', 'Hút bể phốt', home_url('/hut-be-phot-quang-ninh/')],
        ['Thông tắc cống Quảng Ninh', 'Thông tắc cống', home_url('/thong-tac-cong-quang-ninh/')],
        ['Thông tắc bồn cầu Quảng Ninh', 'Thông tắc bồn cầu', home_url('/thong-tac-bon-cau-quang-ninh/')],
        ['Nạo vét hố ga Quảng Ninh', 'Nạo vét hố ga', home_url('/nao-vet-ho-ga-quang-ninh/')],
        ['Xử lý mùi hôi Quảng Ninh', 'Xử lý mùi hôi', home_url('/xu-ly-mui-hoi-quang-ninh/')],
    ];

    return [
        '@type' => 'OfferCatalog',
        '@id'   => home_url('/#service-catalog'),
        'name'  => 'Dịch vụ vệ sinh môi trường',
        'itemListElement' => array_map(
            static function (array $service): array {
                return [
                    '@type' => 'Offer',
                    'itemOffered' => [
                        '@type' => 'Service',
                        'name'  => $service[0],
                        'serviceType' => $service[1],
                        'url'   => $service[2],
                        'provider' => [
                            '@id' => ttcqn_schema_business_id(),
                        ],
                    ],
                ];
            },
            $services
        ),
    ];
}

function ttcqn_schema_local_business_node(): array
{
    $logo_url = ttcqn_schema_primary_logo_url();

    return [
        '@type'            => ['LocalBusiness', 'HomeAndConstructionBusiness'],
        '@id'              => ttcqn_schema_business_id(),
        'name'             => 'Môi Trường Đô Thị Số 1 Quảng Ninh',
        'alternateName'    => ['Thông Tắc Cống Quảng Ninh', 'Hút Bể Phốt Quảng Ninh'],
        'url'              => home_url('/'),
        'logo'             => $logo_url,
        'image'            => $logo_url,
        'description'      => 'Dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga tại Quảng Ninh. Phục vụ 24/7, có mặt trong 15 phút, không đục phá, bảo hành dài hạn.',
        'telephone'        => ['+84963953533', '+84931156756'],
        'address'          => [
            '@type'           => 'PostalAddress',
            'streetAddress'   => '111 Cái Lân, Bãi Cháy',
            'addressLocality' => 'Hạ Long',
            'addressRegion'   => 'Quảng Ninh',
            'addressCountry'  => 'VN',
        ],
        'hasMap'           => TTCQN_HOME_OFFICE_HA_LONG_MAP_URL,
        'areaServed'       => ttcqn_schema_area_served(),
        'openingHours'     => 'Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59',
        'priceRange'       => '₫₫',
        'currenciesAccepted' => 'VND',
        'paymentAccepted'  => 'Cash, Bank Transfer',
        'hasOfferCatalog'  => ttcqn_schema_offer_catalog_node(),
        'sameAs'           => [
            home_url('/'),
            'https://www.youtube.com/@moitruongdothiso1quangninh',
            'https://www.facebook.com/thongtacconghalong24h',
            'https://www.tiktok.com/@thongtaccongquangninh',
        ],
    ];
}

function ttcqn_schema_website_node(): array
{
    return [
        '@type' => 'WebSite',
        '@id'   => ttcqn_schema_website_id(),
        'name'  => 'Môi Trường Đô Thị Số 1 Quảng Ninh',
        'alternateName' => [
            'Môi Trường Đô Thị Quảng Ninh',
            'Thông Tắc Cống Quảng Ninh',
            'Hút Bể Phốt Quảng Ninh',
        ],
        'url' => home_url('/'),
        'inLanguage' => 'vi-VN',
        'publisher' => [
            '@id' => ttcqn_schema_business_id(),
        ],
    ];
}

function ttcqn_schema_home_breadcrumb_node(): array
{
    return [
        '@type' => 'BreadcrumbList',
        '@id'   => home_url('/#breadcrumb'),
        'itemListElement' => [
            [
                '@type'    => 'ListItem',
                'position' => 1,
                'name'     => 'Trang chủ',
                'item'     => home_url('/'),
            ],
        ],
    ];
}

function ttcqn_schema_faq_page_node(array $faq_items, string $schema_id): ?array
{
    if (empty($faq_items)) {
        return null;
    }

    return [
        '@type' => 'FAQPage',
        '@id'   => $schema_id,
        'mainEntity' => array_map(
            static function (array $item): array {
                return [
                    '@type' => 'Question',
                    'name'  => $item['question'],
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text'  => $item['answer'],
                    ],
                ];
            },
            $faq_items
        ),
    ];
}

function ttcqn_schema_home_graph(array $faq_items = []): array
{
    $graph = [
        ttcqn_schema_local_business_node(),
        ttcqn_schema_website_node(),
        ttcqn_schema_home_breadcrumb_node(),
    ];

    $faq_node = ttcqn_schema_faq_page_node($faq_items, home_url('/#faq'));
    if ($faq_node !== null) {
        $faq_node['isPartOf'] = [
            '@id' => ttcqn_schema_website_id(),
        ];
        $graph[] = $faq_node;
    }

    return [
        '@context' => 'https://schema.org',
        '@graph'   => $graph,
    ];
}

function ttcqn_shared_header_should_render(): bool
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return false;
    }

    if (function_exists('is_front_page') && is_front_page()) {
        return false;
    }

    if (function_exists('ttcqn_home_emergency_is_front_request') && ttcqn_home_emergency_is_front_request()) {
        return false;
    }

    return (function_exists('is_singular') && is_singular())
        || (function_exists('is_home') && is_home())
        || (function_exists('is_archive') && is_archive());
}

function ttcqn_shared_footer_should_render(): bool
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return false;
    }

    if (function_exists('is_front_page') && is_front_page()) {
        return false;
    }

    if (function_exists('ttcqn_home_emergency_is_front_request') && ttcqn_home_emergency_is_front_request()) {
        return false;
    }

    return true;
}

function ttcqn_shared_header_render_markup(): string
{
    $home_url = home_url('/');
    $logo_url = ttcqn_seo_hero_asset('assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp');
    $primary_hotline_href = 'tel:0963953533';
    $primary_hotline_display = '0963.953.533 - 0931.156.756';

    ob_start();
    ?>
    <header class="ttcqn-header ttcqn-shared-header" role="banner" data-ttcqn-shared-header>
        <nav class="home-nav ttcqn-nav" role="navigation" aria-label="Điều hướng chính">
            <div class="nav-inner ttcqn-nav-inner">
                <a href="<?php echo esc_url($home_url); ?>" class="nav-logo seo-header-logo ttcqn-brand" aria-label="Trang chủ Môi Trường Đô Thị Số 1 Quảng Ninh">
                    <img src="<?php echo esc_url($logo_url); ?>" alt="Môi Trường Đô Thị Số 1 Quảng Ninh - hút bể phốt thông tắc cống 24/7" class="ttcqn-brand-full-logo" width="356" height="94" loading="eager" fetchpriority="high" decoding="async">
                </a>
                <button class="nav-toggle ttcqn-nav-toggle" type="button" aria-label="Mở menu" aria-expanded="false">☰</button>
                <a class="ttcqn-mobile-call" href="<?php echo esc_url($primary_hotline_href); ?>" aria-label="Gọi hotline 0963.953.533">
                    <?php echo ttcqn_home_phone_icon_svg(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                </a>
                <ul class="nav-menu ttcqn-nav-menu" role="menubar">
                    <li role="none"><a href="<?php echo esc_url($home_url); ?>" role="menuitem">Trang chủ</a></li>
                    <li class="has-sub" role="none">
                        <button type="button" class="sub-toggle" role="menuitem" aria-haspopup="true" aria-expanded="false">Dịch vụ <span class="arrow">⌄</span></button>
                        <ul class="sub-menu" role="menu">
                            <li><a href="<?php echo esc_url(home_url('/hut-be-phot-quang-ninh/')); ?>" role="menuitem">Hút bể phốt</a></li>
                            <li><a href="<?php echo esc_url(home_url('/thong-tac-cong-quang-ninh/')); ?>" role="menuitem">Thông tắc cống</a></li>
                            <li><a href="<?php echo esc_url(home_url('/thong-tac-bon-cau-quang-ninh/')); ?>" role="menuitem">Thông tắc bồn cầu</a></li>
                            <li><a href="<?php echo esc_url(home_url('/nao-vet-ho-ga-quang-ninh/')); ?>" role="menuitem">Nạo vét hố ga</a></li>
                        </ul>
                    </li>
                    <li class="has-sub" role="none">
                        <button type="button" class="sub-toggle" role="menuitem" aria-haspopup="true" aria-expanded="false">Khu vực <span class="arrow">⌄</span></button>
                        <ul class="sub-menu" role="menu">
                            <li><a href="<?php echo esc_url(home_url('/hut-be-phot-ha-long/')); ?>" role="menuitem">Hạ Long</a></li>
                            <li><a href="<?php echo esc_url(home_url('/hut-be-phot-cam-pha/')); ?>" role="menuitem">Cẩm Phả</a></li>
                            <li><a href="<?php echo esc_url(home_url('/hut-be-phot-uong-bi/')); ?>" role="menuitem">Uông Bí</a></li>
                            <li><a href="<?php echo esc_url(home_url('/hut-be-phot-quang-yen/')); ?>" role="menuitem">Quảng Yên</a></li>
                            <li><a href="<?php echo esc_url(home_url('/hut-be-phot-van-don/')); ?>" role="menuitem">Vân Đồn</a></li>
                        </ul>
                    </li>
                    <li role="none"><a href="<?php echo esc_url(home_url('/#du-an')); ?>" role="menuitem">Dự án</a></li>
                    <li role="none"><a href="<?php echo esc_url(home_url('/#doi-tac')); ?>" role="menuitem">Đối tác</a></li>
                    <li role="none"><a href="<?php echo esc_url(home_url('/bang-gia/')); ?>" role="menuitem">Bảng giá</a></li>
                    <li role="none"><a href="<?php echo esc_url(home_url('/blog/')); ?>" role="menuitem">Blog</a></li>
                    <li role="none"><a href="<?php echo esc_url(home_url('/lien-he/')); ?>" role="menuitem">Liên hệ</a></li>
                    <li role="none"><a href="<?php echo esc_url($primary_hotline_href); ?>" class="nav-cta ttcqn-header-call" role="menuitem" aria-label="Gọi hotline 0963.953.533 hoặc 0931.156.756"><?php echo ttcqn_home_phone_icon_svg(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo esc_html($primary_hotline_display); ?></a></li>
                </ul>
            </div>
        </nav>
    </header>
    <?php
    return (string) ob_get_clean();
}

function ttcqn_seo_hero_default_description(): string
{
    return 'Nước trào ngược, bồn cầu rút chậm, cống bốc mùi hoặc bể phốt đầy? Gọi số điện thoại và khu vực, đội kỹ thuật sẽ gọi lại nhanh để báo hướng xử lý phù hợp.';
}

function ttcqn_seo_hero_current_title(): string
{
    if (is_singular()) {
        $title = trim(wp_strip_all_tags((string) get_the_title()));
        return $title !== '' ? $title : 'Hút bể phốt, thông tắc cống Quảng Ninh 24/7';
    }

    if (is_home()) {
        $page_for_posts = (int) get_option('page_for_posts');
        if ($page_for_posts > 0) {
            $title = trim(wp_strip_all_tags((string) get_the_title($page_for_posts)));
            if ($title !== '') {
                return $title;
            }
        }
        return 'Blog thông tắc cống, hút bể phốt Quảng Ninh';
    }

    if (is_archive()) {
        $title = trim(wp_strip_all_tags((string) get_the_archive_title()));
        return $title !== '' ? $title : 'Dịch vụ môi trường đô thị Quảng Ninh';
    }

    return 'Hút bể phốt, thông tắc cống Quảng Ninh 24/7';
}

function ttcqn_seo_hero_current_description(): string
{
    $description = '';

    if (is_singular()) {
        $post_id = (int) get_the_ID();
        $meta_keys = ['rank_math_description', '_rank_math_description', '_yoast_wpseo_metadesc'];
        foreach ($meta_keys as $key) {
            $value = trim(wp_strip_all_tags((string) get_post_meta($post_id, $key, true)));
            if ($value !== '') {
                $description = $value;
                break;
            }
        }

        if ($description === '') {
            $excerpt = trim(wp_strip_all_tags((string) get_the_excerpt($post_id)));
            if ($excerpt !== '') {
                $description = $excerpt;
            }
        }

        if ($description === '') {
            $content = trim(wp_strip_all_tags(strip_shortcodes((string) get_post_field('post_content', $post_id))));
            if ($content !== '') {
                $description = wp_trim_words($content, 32, '...');
            }
        }
    } elseif (is_archive()) {
        $description = trim(wp_strip_all_tags((string) get_the_archive_description()));
    }

    if ($description !== '') {
        $description = (string) preg_replace('/\*\*(.*?)\*\*/', '$1', $description);
        $description = trim($description);
    }

    return $description !== '' ? $description : ttcqn_seo_hero_default_description();
}

function ttcqn_seo_hero_highlight_title(string $title, string $highlight = '24/7'): string
{
    $title = trim($title);
    if ($title === '') {
        return '';
    }

    if ($highlight !== '' && stripos($title, $highlight) !== false) {
        $parts = preg_split('/(' . preg_quote($highlight, '/') . ')/i', $title, -1, PREG_SPLIT_DELIM_CAPTURE);
        $html = '';
        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }
            $html .= strcasecmp($part, $highlight) === 0
                ? '<span class="ttcqn-seo-hero-highlight">' . esc_html($part) . '</span>'
                : esc_html($part);
        }
        return $html;
    }

    return esc_html($title);
}

function ttcqn_seo_hero_callback_form(string $prefix, array $args = []): string
{
    $endpoint = esc_url(rest_url('ttcqn/v1/lead'));
    $defaults = [
        'title' => 'Nhận gọi lại miễn phí',
        'description' => 'Chỉ cần số điện thoại và khu vực, form này ưu tiên các ca xử lý ngay trong ngày.',
        'area' => '',
        'issue' => '',
    ];
    $args = array_merge($defaults, $args);

    $areas = ['' => 'Chọn khu vực', 'Hạ Long' => 'Hạ Long', 'Cẩm Phả' => 'Cẩm Phả', 'Uông Bí' => 'Uông Bí', 'Móng Cái' => 'Móng Cái', 'Quảng Yên' => 'Quảng Yên', 'Đông Triều' => 'Đông Triều', 'Khác' => 'Khu vực khác tại Quảng Ninh'];
    $issues = ['' => 'Chọn vấn đề', 'Tắc cống' => 'Tắc cống', 'Hút bể phốt' => 'Hút bể phốt', 'Bồn cầu tắc' => 'Bồn cầu tắc', 'Mùi hôi' => 'Mùi hôi', 'Hố ga đầy' => 'Hố ga đầy', 'Cần tư vấn' => 'Cần tư vấn'];
    $times = ['' => 'Chọn thời gian', 'Ngay bây giờ' => 'Ngay bây giờ', 'Trong hôm nay' => 'Trong hôm nay', 'Đặt lịch' => 'Đặt lịch'];

    ob_start();
    ?>
    <div class="ttcqn-seo-callback-card">
        <h2 id="<?php echo esc_attr($prefix); ?>-title"><?php echo esc_html($args['title']); ?></h2>
        <p><?php echo esc_html($args['description']); ?></p>
        <form class="ttcqn-seo-callback-form" data-endpoint="<?php echo $endpoint; ?>" autocomplete="on" novalidate>
            <label class="ttcqn-seo-field ttcqn-seo-field-full" for="<?php echo esc_attr($prefix); ?>-phone">
                <span>Số điện thoại *</span>
                <input id="<?php echo esc_attr($prefix); ?>-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Nhập số điện thoại của anh/chị" required>
            </label>
            <label class="ttcqn-seo-field" for="<?php echo esc_attr($prefix); ?>-area">
                <span>Khu vực</span>
                <select id="<?php echo esc_attr($prefix); ?>-area" name="area">
                    <?php foreach ($areas as $value => $label) : ?>
                        <option value="<?php echo esc_attr($value); ?>"<?php selected($args['area'], $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label class="ttcqn-seo-field" for="<?php echo esc_attr($prefix); ?>-issue">
                <span>Vấn đề</span>
                <select id="<?php echo esc_attr($prefix); ?>-issue" name="issue">
                    <?php foreach ($issues as $value => $label) : ?>
                        <option value="<?php echo esc_attr($value); ?>"<?php selected($args['issue'], $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label class="ttcqn-seo-field ttcqn-seo-field-full" for="<?php echo esc_attr($prefix); ?>-time">
                <span>Thời gian cần hỗ trợ</span>
                <select id="<?php echo esc_attr($prefix); ?>-time" name="time_needed">
                    <?php foreach ($times as $value => $label) : ?>
                        <option value="<?php echo esc_attr($value); ?>"><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label class="ttcqn-seo-field ttcqn-seo-field-full" for="<?php echo esc_attr($prefix); ?>-note">
                <span>Ghi chú thêm</span>
                <textarea id="<?php echo esc_attr($prefix); ?>-note" name="note" maxlength="220" placeholder="Ví dụ: nước trào ở nhà vệ sinh tầng 1, xe bồn vào được ngõ"></textarea>
            </label>
            <label class="ttcqn-seo-hp" aria-hidden="true">
                <span>Không nhập mục này</span>
                <input type="text" name="company" tabindex="-1" autocomplete="off">
            </label>
            <button class="ttcqn-seo-submit" type="submit">Gửi yêu cầu gọi lại ngay</button>
            <p class="ttcqn-seo-form-status" aria-live="polite"></p>
        </form>
    </div>
    <?php
    return (string) ob_get_clean();
}

function ttcqn_seo_hero_render(array $args = []): string
{
    $defaults = [
        'badgeText' => 'TIẾP NHẬN 24/7',
        'title' => ttcqn_seo_hero_current_title(),
        'description' => ttcqn_seo_hero_current_description(),
        'highlightText' => '24/7',
        'heroImage' => ttcqn_seo_hero_asset('assets/septic-truck-real.webp'),
        'heroImageMobile' => ttcqn_seo_hero_asset('assets/septic-truck-real-640.webp'),
        'heroImageTablet' => ttcqn_seo_hero_asset('assets/septic-truck-real-768.webp'),
        'staffImage' => ttcqn_seo_hero_asset('assets/hero-worker-tho-thong-tac-cong-quang-ninh.webp'),
        'staffImageSmall' => ttcqn_seo_hero_asset('assets/hero-worker-tho-thong-tac-cong-quang-ninh-480.webp'),
        'staffImageMobile' => ttcqn_seo_hero_asset('assets/hero-worker-tho-thong-tac-cong-quang-ninh-640.webp'),
        'formTitle' => 'Nhận gọi lại miễn phí',
        'formDescription' => 'Chỉ cần số điện thoại và khu vực, form này ưu tiên các ca xử lý ngay trong ngày.',
        'defaultArea' => '',
        'defaultIssue' => '',
    ];
    $args = array_merge($defaults, $args);

    $uid = 'ttcqn-seo-hero-' . substr(md5((string) $args['title']), 0, 8);
    $desktop_form = ttcqn_seo_hero_callback_form($uid . '-desktop', [
        'title' => $args['formTitle'],
        'description' => $args['formDescription'],
        'area' => $args['defaultArea'],
        'issue' => $args['defaultIssue'],
    ]);
    $mobile_form = ttcqn_seo_hero_callback_form($uid . '-mobileform', [
        'title' => $args['formTitle'],
        'description' => $args['formDescription'],
        'area' => $args['defaultArea'],
        'issue' => $args['defaultIssue'],
    ]);

    ob_start();
    ?>
    <section class="ttcqn-seo-hero" data-ttcqn-seo-hero aria-labelledby="<?php echo esc_attr($uid); ?>-heading">
        <div class="ttcqn-seo-hero-city" aria-hidden="true"></div>
        <div class="ttcqn-seo-hero-inner">
            <div class="ttcqn-seo-hero-copy">
                <p class="ttcqn-seo-hero-badge"><svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M10.4 1.2 3.7 9.6h4.5l-.7 7.2 6.8-8.8H9.8l.6-6.8Z"/></svg><?php echo esc_html($args['badgeText']); ?></p>
                <h1 class="ttcqn-seo-hero-title" id="<?php echo esc_attr($uid); ?>-heading"><?php echo ttcqn_seo_hero_highlight_title((string) $args['title'], (string) $args['highlightText']); ?></h1>
                <p class="ttcqn-seo-hero-description"><?php echo esc_html(wp_strip_all_tags((string) $args['description'])); ?></p>
            </div>

            <div class="ttcqn-seo-hero-visual">
                <img class="ttcqn-seo-hero-truck" src="<?php echo esc_url($args['heroImage']); ?>" srcset="<?php echo esc_url($args['heroImageMobile']); ?> 640w, <?php echo esc_url($args['heroImageTablet']); ?> 768w, <?php echo esc_url($args['heroImage']); ?> 1536w" sizes="(max-width: 767px) 330px, (max-width: 1279px) 640px, 760px" alt="Xe hút bể phốt chuyên dụng tại Quảng Ninh" width="1536" height="1024" loading="eager" fetchpriority="auto" decoding="async">
                <img class="ttcqn-seo-hero-staff" src="<?php echo esc_url($args['staffImage']); ?>" srcset="<?php echo esc_url($args['staffImageSmall']); ?> 480w, <?php echo esc_url($args['staffImageMobile']); ?> 640w, <?php echo esc_url($args['staffImage']); ?> 900w" sizes="(max-width: 767px) 220px, 300px" alt="Kỹ thuật viên Môi Trường Đô Thị Số 1 Quảng Ninh tư vấn dịch vụ" width="900" height="1350" loading="eager" fetchpriority="high" decoding="async">
                <button class="ttcqn-seo-callback-bubble" type="button" data-ttcqn-open-sheet aria-controls="<?php echo esc_attr($uid); ?>-sheet" aria-expanded="false">
                    <strong>Nhận gọi lại miễn phí</strong>
                    <span>Để lại số điện thoại, kỹ thuật sẽ gọi lại ngay</span>
                    <em>Gửi yêu cầu</em>
                </button>
            </div>

            <aside class="ttcqn-seo-hero-form" aria-label="Form nhận gọi lại miễn phí">
                <?php echo $desktop_form; ?>
            </aside>
        </div>

        <div class="ttcqn-seo-sheet" id="<?php echo esc_attr($uid); ?>-sheet" role="dialog" aria-modal="true" aria-labelledby="<?php echo esc_attr($uid); ?>-sheet-title" hidden>
            <div class="ttcqn-seo-sheet-backdrop" data-ttcqn-close-sheet></div>
            <div class="ttcqn-seo-sheet-panel" role="document">
                <button class="ttcqn-seo-sheet-close" type="button" data-ttcqn-close-sheet aria-label="Đóng form">×</button>
                <div class="ttcqn-seo-sheet-head">
                    <h2 id="<?php echo esc_attr($uid); ?>-sheet-title"><?php echo esc_html($args['formTitle']); ?></h2>
                    <p><?php echo esc_html($args['formDescription']); ?></p>
                </div>
                <?php echo $mobile_form; ?>
            </div>
        </div>
    </section>
    <?php
    return (string) ob_get_clean();
}

function ttcqn_home_emergency_flush_cache(): void
{
    if (class_exists('LiteSpeed_Cache_API') && method_exists('LiteSpeed_Cache_API', 'purge_all')) {
        LiteSpeed_Cache_API::purge_all();
    }

    if (function_exists('rocket_clean_domain')) {
        rocket_clean_domain();
    }

    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
}
register_activation_hook(__FILE__, 'ttcqn_home_emergency_flush_cache');

// =====================================================================
// ACTIVATION: Patch .htaccess với performance headers
// Chạy một lần khi activate plugin — an toàn, idempotent
// =====================================================================
register_activation_hook(__FILE__, function (): void {
    $htaccess = ABSPATH . '.htaccess';
    if (! is_writable($htaccess)) {
        return; // Server không cho phép ghi — bỏ qua, không lỗi
    }

    $marker  = 'TTCQN Performance Boost';
    $content = file_get_contents($htaccess);

    // Nếu đã có block này rồi thì bỏ qua (idempotent)
    if ($content && str_contains($content, "# BEGIN $marker")) {
        return;
    }

    $patch = <<<'HTACCESS'

# BEGIN TTCQN Performance Boost
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType image/webp          "access plus 1 year"
  ExpiresByType image/avif          "access plus 1 year"
  ExpiresByType image/avif-sequence "access plus 1 year"
  ExpiresByType image/jpeg          "access plus 1 year"
  ExpiresByType image/jpg           "access plus 1 year"
  ExpiresByType image/png           "access plus 1 year"
  ExpiresByType image/gif           "access plus 1 year"
  ExpiresByType image/svg+xml       "access plus 1 year"
  ExpiresByType image/x-icon        "access plus 1 year"
  ExpiresByType font/woff2          "access plus 1 year"
  ExpiresByType font/woff           "access plus 1 year"
  ExpiresByType font/ttf            "access plus 1 year"
  ExpiresByType font/otf            "access plus 1 year"
  ExpiresByType application/font-woff2        "access plus 1 year"
  ExpiresByType application/vnd.ms-fontobject "access plus 1 year"
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "\.(css|js)$">
    Header append Cache-Control "immutable"
  </FilesMatch>
  <FilesMatch "\.(css|js|html|svg|xml|json)$">
    Header append Vary "Accept-Encoding"
  </FilesMatch>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/javascript application/javascript application/json image/svg+xml font/woff2 font/woff
</IfModule>
# END TTCQN Performance Boost
HTACCESS;

    // Thêm patch vào cuối .htaccess
    file_put_contents($htaccess, $content . $patch);
});

function ttcqn_home_emergency_register_lead_post_type(): void
{
    register_post_type('ttcqn_lead', [
        'labels' => [
            'name' => 'TTCQN Leads',
            'singular_name' => 'TTCQN Lead',
            'menu_name' => 'TTCQN Leads',
            'add_new_item' => 'Them lead moi',
            'edit_item' => 'Sua lead',
            'view_item' => 'Xem lead',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'ttcqn-leads',
        'menu_position' => 26,
        'menu_icon' => 'dashicons-phone',
        'supports' => ['title', 'editor', 'custom-fields'],
    ]);
}
add_action('init', 'ttcqn_home_emergency_register_lead_post_type');

function ttcqn_home_emergency_register_lead_rest(): void
{
    register_rest_route('ttcqn/v1', '/lead', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'ttcqn_home_emergency_handle_lead_rest',
    ]);
}
add_action('rest_api_init', 'ttcqn_home_emergency_register_lead_rest');

function ttcqn_home_emergency_handle_lead_rest(WP_REST_Request $request)
{
    $params = $request->get_json_params();
    if (!is_array($params)) {
        $params = $request->get_body_params();
    }

    $honeypot = sanitize_text_field((string) ($params['company'] ?? ''));
    if ($honeypot !== '') {
        return new WP_REST_Response(['ok' => true, 'ignored' => true], 200);
    }

    $phone = sanitize_text_field((string) ($params['phone'] ?? ''));
    $digits = preg_replace('/\D+/', '', $phone);
    if (strlen((string) $digits) < 9 || strlen((string) $digits) > 11) {
        return new WP_Error('ttcqn_invalid_phone', 'Số điện thoại chưa đúng. Anh/chị kiểm tra lại giúp.', ['status' => 400]);
    }

    $ip = sanitize_text_field((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $rate_key = 'ttcqn_lead_' . md5($ip . '|' . $digits);
    if (get_transient($rate_key)) {
        return new WP_Error('ttcqn_rate_limited', 'Yêu cầu đã được ghi nhận. Đội kỹ thuật sẽ gọi lại sớm.', ['status' => 429]);
    }
    set_transient($rate_key, 1, MINUTE_IN_SECONDS);

    $allowed_areas = ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Móng Cái', 'Quảng Yên', 'Đông Triều', 'Khác'];
    $allowed_issues = ['Tắc cống', 'Hút bể phốt', 'Bồn cầu tắc', 'Mùi hôi', 'Hố ga đầy', 'Cần tư vấn'];
    $allowed_times = ['Ngay bây giờ', 'Trong hôm nay', 'Đặt lịch'];

    $area = sanitize_text_field((string) ($params['area'] ?? 'Hạ Long'));
    if (!in_array($area, $allowed_areas, true)) {
        $area = 'Khác';
    }

    $issue = sanitize_text_field((string) ($params['issue'] ?? 'Cần tư vấn'));
    if (!in_array($issue, $allowed_issues, true)) {
        $issue = 'Cần tư vấn';
    }

    $time_needed = sanitize_text_field((string) ($params['time_needed'] ?? 'Ngay bây giờ'));
    if (!in_array($time_needed, $allowed_times, true)) {
        $time_needed = 'Ngay bây giờ';
    }

    $note = sanitize_textarea_field((string) ($params['note'] ?? ''));
    $page = esc_url_raw((string) ($params['page'] ?? home_url('/')));
    $created = current_time('mysql');
    $title = sprintf('Lead trang chủ - %s - %s', $digits, $created);
    $content = implode("\n", [
        'Số điện thoại: ' . $phone,
        'Khu vực: ' . $area,
        'Vấn đề: ' . $issue,
        'Thời gian cần thợ: ' . $time_needed,
        'Ghi chú: ' . ($note !== '' ? $note : 'Không có'),
        'Trang gửi: ' . $page,
        'IP: ' . $ip,
    ]);

    $lead_id = wp_insert_post([
        'post_type' => 'ttcqn_lead',
        'post_status' => 'private',
        'post_title' => $title,
        'post_content' => $content,
    ], true);

    if (is_wp_error($lead_id)) {
        return new WP_Error('ttcqn_save_failed', 'Chưa lưu được yêu cầu. Anh/chị gọi trực tiếp hotline để xử lý nhanh.', ['status' => 500]);
    }

    update_post_meta($lead_id, 'phone', $phone);
    update_post_meta($lead_id, 'area', $area);
    update_post_meta($lead_id, 'issue', $issue);
    update_post_meta($lead_id, 'time_needed', $time_needed);
    update_post_meta($lead_id, 'page', $page);
    update_post_meta($lead_id, 'ip', $ip);

    $admin_email = get_option('admin_email');
    if (is_email($admin_email)) {
        wp_mail(
            $admin_email,
            'Lead trang chu thongtaccongquangninh.com',
            $content,
            ['Content-Type: text/plain; charset=UTF-8']
        );
    }

    return new WP_REST_Response([
        'ok' => true,
        'lead_id' => (int) $lead_id,
        'message' => 'Đã nhận thông tin. Đội kỹ thuật sẽ gọi lại ngay.',
    ], 200);
}

function ttcqn_seo_hero_print_assets(): void
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }
    ?>
<style id="ttcqn-shared-header-css">
:root {
  --ttcqn-color-primary:#36b757;
  --ttcqn-color-primary-hover:#168b39;
  --ttcqn-color-primary-bright:#7ed957;
  --ttcqn-color-secondary:#0b6fd3;
  --ttcqn-color-secondary-hover:#0757ba;
  --ttcqn-color-accent:#f5b301;
  --ttcqn-color-warning:#ff7a00;
  --ttcqn-color-info:#00b8d9;
  --ttcqn-color-error:#c62828;
  --ttcqn-color-success:#168a3a;
  --ttcqn-color-background:#f7fcff;
  --ttcqn-color-surface:#ffffff;
  --ttcqn-color-surface-muted:#eef8ff;
  --ttcqn-color-border:#d9e6ef;
  --ttcqn-color-text-primary:#102a43;
  --ttcqn-color-text-secondary:#243b53;
  --ttcqn-color-text-muted:#52606d;
  --ttcqn-color-dark:#03111f;
  --ttcqn-color-dark-2:#020d17;
  --ttcqn-color-dark-3:#061827;
  --ttcqn-shadow-soft:0 16px 40px rgba(15,76,129,.10);
  --ttcqn-shadow-card:0 18px 44px rgba(15,76,129,.12);
  --ttcqn-gradient-primary:linear-gradient(135deg,var(--ttcqn-color-primary),var(--ttcqn-color-primary-hover));
  --ttcqn-gradient-dark:linear-gradient(180deg,var(--ttcqn-color-dark) 0%,var(--ttcqn-color-dark-2) 100%);
}
body.ttcqn-shared-header-active #masthead.site-header,
body.ttcqn-shared-header-active .site-header.has-inline-mobile-toggle {
  display:none !important;
}
.ttcqn-shared-header {
  height:96px;
  background:var(--ttcqn-color-dark);
  box-shadow:0 12px 28px rgba(0,0,0,.22);
  position:relative;
  z-index:1000;
}
.ttcqn-shared-header .home-nav.ttcqn-nav {
  position:relative;
  min-height:96px;
  background:var(--ttcqn-color-dark);
  box-shadow:none;
}
.ttcqn-shared-header .ttcqn-nav-inner {
  width:100%;
  max-width:1680px;
  height:96px;
  margin:0 auto;
  padding:0 28px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:28px;
}
.ttcqn-shared-header .ttcqn-brand {
  width:340px;
  min-width:340px;
  height:82px;
  display:flex;
  align-items:center;
  line-height:1;
  text-decoration:none;
  overflow:visible;
}
.ttcqn-shared-header .ttcqn-brand-full-logo {
  width:330px;
  height:88px;
  display:block;
  object-fit:contain;
  object-position:left center;
  filter:drop-shadow(0 0 12px rgba(0,156,255,.18));
}
.ttcqn-shared-header ul.ttcqn-nav-menu {
  flex:1;
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:24px;
  flex-wrap:nowrap;
}
.ttcqn-shared-header ul.ttcqn-nav-menu li {
  position:relative;
  margin:0;
}
.ttcqn-shared-header ul.ttcqn-nav-menu li > a,
.ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle {
  color:#f7f9fb;
  text-decoration:none;
  padding:36px 0;
  display:block;
  font-size:15.5px;
  font-weight:650;
  letter-spacing:0;
  line-height:1.1;
  background:none;
  border:0;
  cursor:pointer;
  white-space:nowrap;
  position:relative;
  transition:color .22s ease, transform .22s ease;
}
.ttcqn-shared-header ul.ttcqn-nav-menu li > a::after,
.ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle::after {
  content:"";
  position:absolute;
  bottom:24px;
  left:50%;
  width:0;
  height:2px;
  background:var(--ttcqn-color-primary-bright);
  transform:translateX(-50%);
  transition:width .22s ease;
}
.ttcqn-shared-header ul.ttcqn-nav-menu li > a:hover,
.ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle:hover {
  color:var(--ttcqn-color-primary-bright);
}
.ttcqn-shared-header ul.ttcqn-nav-menu li > a:hover::after,
.ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle:hover::after {
  width:70%;
}
.ttcqn-shared-header ul.ttcqn-nav-menu li.has-sub:hover > .sub-menu {
  display:block;
}
.ttcqn-shared-header .sub-menu {
  display:none;
  position:absolute;
  top:100%;
  left:0;
  min-width:235px;
  z-index:10000;
  list-style:none;
  margin:0;
  padding:0;
  background:var(--ttcqn-color-dark-3);
  border:1px solid rgba(126,217,87,.22);
  border-top:2px solid var(--ttcqn-color-primary-bright);
  border-radius:0 0 12px 12px;
  box-shadow:0 22px 48px rgba(0,0,0,.4);
}
.ttcqn-shared-header .sub-menu li a {
  padding:12px 18px;
  font-size:14px;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.ttcqn-shared-header .sub-menu li a::after {
  display:none;
}
.ttcqn-shared-header .sub-menu li:last-child a {
  border-bottom:0;
}
.ttcqn-shared-header .nav-cta.ttcqn-header-call {
  height:48px;
  display:inline-flex;
  align-items:center;
  gap:9px;
  margin-left:2px;
  padding:0 26px !important;
  border-radius:999px !important;
  background:linear-gradient(90deg,var(--ttcqn-color-primary-hover) 0%,var(--ttcqn-color-primary-bright) 100%) !important;
  color:#fff !important;
  font-size:15.5px !important;
  font-weight:900 !important;
  box-shadow:0 16px 34px rgba(8,123,58,.32), inset 0 1px 0 rgba(255,255,255,.22);
  transition:transform .18s ease, filter .18s ease, box-shadow .18s ease;
}
.ttcqn-shared-header .nav-cta.ttcqn-header-call:hover {
  transform:translateY(-1px);
  filter:brightness(1.08);
  box-shadow:0 18px 40px rgba(126,211,33,.34), inset 0 1px 0 rgba(255,255,255,.28);
}
.ttcqn-shared-header .nav-cta.ttcqn-header-call::after {
  display:none !important;
}
.ttcqn-shared-header .ttcqn-header-call svg,
.ttcqn-shared-header .ttcqn-mobile-call svg {
  width:24px;
  height:24px;
  display:block;
  flex:0 0 24px;
  fill:none;
  stroke:currentColor;
  stroke-width:2.2;
  stroke-linecap:round;
  stroke-linejoin:round;
  aspect-ratio:1 / 1;
  overflow:visible;
}
.ttcqn-shared-header .ttcqn-nav-toggle {
  display:none;
  width:46px;
  height:46px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.06);
  color:#fff;
  font-size:24px;
  line-height:1;
  cursor:pointer;
}
.ttcqn-shared-header .ttcqn-mobile-call {
  display:none;
}
@media (max-width:1600px) {
  .ttcqn-shared-header .ttcqn-nav-inner { max-width:1360px; gap:16px; padding:0 20px; }
  .ttcqn-shared-header .ttcqn-brand { width:300px; min-width:300px; }
  .ttcqn-shared-header .ttcqn-brand-full-logo { width:292px; height:78px; }
  .ttcqn-shared-header ul.ttcqn-nav-menu { gap:17px; }
  .ttcqn-shared-header ul.ttcqn-nav-menu li > a,
  .ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle { font-size:14.5px; }
  .ttcqn-shared-header .nav-cta.ttcqn-header-call { padding:0 18px !important; font-size:14px !important; }
}
@media (max-width:1279px) {
  .ttcqn-shared-header,
  .ttcqn-shared-header .home-nav.ttcqn-nav,
  .ttcqn-shared-header .ttcqn-nav-inner {
    height:82px;
    min-height:82px;
  }
  .ttcqn-shared-header .ttcqn-brand {
    width:260px;
    min-width:260px;
    height:70px;
  }
  .ttcqn-shared-header .ttcqn-brand-full-logo {
    width:250px;
    height:66px;
  }
  .ttcqn-shared-header .ttcqn-nav-toggle {
    display:block;
    order:3;
    margin-left:0;
  }
  .ttcqn-shared-header .ttcqn-mobile-call {
    order:2;
    margin-left:auto;
    width:44px;
    height:44px;
    display:grid;
    place-items:center;
    border-radius:999px;
    color:#fff;
    text-decoration:none;
  background:linear-gradient(180deg,var(--ttcqn-color-primary-bright),var(--ttcqn-color-primary-hover));
    box-shadow:0 10px 22px rgba(5,133,54,.28);
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu {
    display:none;
    position:absolute;
    top:82px;
    left:0;
    right:0;
    z-index:10001;
    flex-direction:column;
    align-items:stretch;
    gap:0;
    background:var(--ttcqn-color-dark);
    padding:10px 18px 18px;
    box-shadow:0 22px 46px rgba(0,0,0,.42);
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu.active {
    display:flex;
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu li > a,
  .ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle {
    width:100%;
    padding:14px 8px;
    text-align:left;
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu li > a::after,
  .ttcqn-shared-header ul.ttcqn-nav-menu li > .sub-toggle::after {
    bottom:8px;
  }
  .ttcqn-shared-header .nav-cta.ttcqn-header-call {
    margin:10px 0 4px;
    justify-content:center;
  }
  .ttcqn-shared-header .sub-menu {
    position:static;
    min-width:0;
    width:100%;
    margin:0 0 8px;
    border-radius:10px;
    box-shadow:none;
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu li.has-sub:hover > .sub-menu {
    display:none;
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu li.has-sub.open > .sub-menu {
    display:block;
  }
  .ttcqn-shared-header .has-sub.open > .sub-toggle .arrow {
    display:inline-block;
    transform:rotate(180deg);
  }
}
@media (max-width:767px) {
  .ttcqn-shared-header,
  .ttcqn-shared-header .home-nav.ttcqn-nav,
  .ttcqn-shared-header .ttcqn-nav-inner {
    height:72px;
    min-height:72px;
  }
  .ttcqn-shared-header .ttcqn-nav-inner {
    padding:0 14px;
    gap:10px;
  }
  .ttcqn-shared-header .ttcqn-brand {
    width:auto;
    min-width:0;
    max-width:calc(100% - 116px);
    height:60px;
  }
  .ttcqn-shared-header .ttcqn-brand-full-logo {
    width:min(210px,100%);
    height:54px;
  }
  .ttcqn-shared-header ul.ttcqn-nav-menu {
    top:72px;
  }
  .ttcqn-shared-header .ttcqn-nav-toggle,
  .ttcqn-shared-header .ttcqn-mobile-call {
    flex:0 0 44px;
  }
}
@media (prefers-reduced-motion:reduce) {
  .ttcqn-shared-header * {
    transition:none !important;
  }
}
</style>
<style id="ttcqn-seo-hero-css">
.ttcqn-seo-hero {
  --hero-green:var(--ttcqn-color-primary-bright);
  --hero-green-2:var(--ttcqn-color-primary-bright);
  --hero-blue:var(--ttcqn-color-secondary);
  position:relative;
  width:100%;
  min-height:720px;
  overflow:hidden;
  isolation:isolate;
  padding:64px 24px 58px;
  color:#fff;
  background:
    radial-gradient(circle at 55% 78%, rgba(126,217,87,.25), transparent 31%),
    radial-gradient(circle at 66% 38%, rgba(19,136,245,.13), transparent 30%),
    linear-gradient(105deg,#020b12 0%,var(--ttcqn-color-dark) 48%,#052018 100%);
}
.ttcqn-seo-hero::before {
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background:
    linear-gradient(90deg,rgba(2,11,18,.78) 0%,rgba(2,11,18,.28) 46%,rgba(2,11,18,.72) 100%),
    linear-gradient(180deg,rgba(2,11,18,.08),rgba(2,11,18,.76));
}
.ttcqn-seo-hero-city {
  position:absolute;
  left:0;
  right:0;
  bottom:70px;
  height:190px;
  z-index:1;
  opacity:.28;
  pointer-events:none;
  background:
    linear-gradient(180deg,transparent,rgba(2,11,18,.82)),
    linear-gradient(90deg,transparent 0 10%,rgba(16,80,85,.48) 10% 14%,transparent 14% 21%,rgba(16,90,88,.4) 21% 25%,transparent 25% 32%,rgba(20,92,100,.45) 32% 36%,transparent 36% 46%,rgba(18,88,94,.45) 46% 50%,transparent 50% 58%,rgba(18,98,92,.42) 58% 64%,transparent 64% 74%,rgba(16,82,92,.44) 74% 79%,transparent 79% 100%);
}
.ttcqn-seo-hero-inner {
  position:relative;
  z-index:2;
  width:min(1280px,100%);
  min-height:600px;
  margin:0 auto;
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(280px,.55fr) minmax(390px,460px);
  gap:28px;
  align-items:center;
}
.ttcqn-seo-hero-copy {
  position:relative;
  z-index:4;
  max-width:650px;
}
.ttcqn-seo-hero-badge {
  display:inline-flex;
  align-items:center;
  gap:9px;
  margin:0 0 20px;
  padding:10px 18px;
  border-radius:999px;
  border:1px solid rgba(126,217,87,.42);
  background:rgba(2,21,18,.84);
  color:var(--hero-green-2);
  font-size:13px;
  font-weight:950;
  letter-spacing:1.6px;
  text-transform:uppercase;
  box-shadow:0 0 22px rgba(126,217,87,.16);
}
.ttcqn-seo-hero-badge svg {
  width:16px;
  height:16px;
  fill:currentColor;
}
.ttcqn-seo-hero-title {
  margin:0;
  color:#fff !important;
  font-size:clamp(48px,5vw,76px) !important;
  line-height:1.02 !important;
  font-weight:950;
  letter-spacing:0;
  text-transform:uppercase;
  text-shadow:0 16px 28px rgba(0,0,0,.46);
}
.ttcqn-seo-hero-highlight {
  color:var(--hero-green-2) !important;
  white-space:nowrap;
}
.ttcqn-seo-hero-description {
  max-width:620px;
  margin:22px 0 0;
  color:#dce7f2;
  font-size:18px;
  line-height:1.72;
  font-weight:550;
  text-shadow:0 2px 14px rgba(0,0,0,.42);
}
.ttcqn-seo-hero-visual {
  position:absolute;
  z-index:auto;
  left:34%;
  right:430px;
  bottom:0;
  height:600px;
  pointer-events:none;
}
.ttcqn-seo-hero-truck {
  position:absolute;
  z-index:1;
  right:-330px;
  bottom:72px;
  width:760px;
  max-width:none;
  opacity:.64;
  mix-blend-mode:normal;
  filter:saturate(1.15) contrast(1.08) brightness(.88) drop-shadow(0 0 34px rgba(126,217,87,.34));
}
.ttcqn-seo-hero-staff {
  position:absolute;
  z-index:8;
  right:-42px;
  bottom:0;
  width:auto !important;
  height:520px;
  max-width:none;
  object-fit:contain;
  filter:drop-shadow(0 0 22px rgba(0,255,190,.30)) drop-shadow(0 24px 44px rgba(0,0,0,.55));
}
.ttcqn-seo-hero-form {
  position:relative;
  z-index:7;
  grid-column:3;
  width:100%;
  max-width:450px;
  justify-self:end;
  align-self:center;
}
.ttcqn-seo-callback-card {
  border-radius:24px;
  background:#fff;
  color:var(--ttcqn-color-text-primary);
  padding:24px 26px 22px;
  box-shadow:0 24px 64px rgba(0,0,0,.36),0 0 36px rgba(126,217,87,.18);
  border:1px solid rgba(126,217,87,.25);
}
.ttcqn-seo-callback-card h2 {
  margin:0 0 8px;
  color:var(--ttcqn-color-text-primary);
  font-size:24px;
  line-height:1.18;
  font-weight:950;
}
.ttcqn-seo-callback-card p {
  margin:0 0 16px;
  color:var(--ttcqn-color-text-muted);
  font-size:13.5px;
  line-height:1.55;
}
.ttcqn-seo-callback-form {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:11px;
}
.ttcqn-seo-field {
  display:grid;
  gap:6px;
  margin:0;
}
.ttcqn-seo-field-full { grid-column:1/-1; }
.ttcqn-seo-field span {
  color:var(--ttcqn-color-text-secondary);
  font-size:13px;
  font-weight:850;
}
.ttcqn-seo-field input,
.ttcqn-seo-field select,
.ttcqn-seo-field textarea {
  width:100%;
  min-height:43px;
  border:1px solid var(--ttcqn-color-border);
  border-radius:12px;
  background:var(--ttcqn-color-background);
  color:var(--ttcqn-color-text-primary);
  padding:10px 12px;
  font:inherit;
  font-size:14px;
  outline:none;
}
.ttcqn-seo-field textarea {
  min-height:74px;
  resize:vertical;
}
.ttcqn-seo-field input:focus,
.ttcqn-seo-field select:focus,
.ttcqn-seo-field textarea:focus {
  border-color:var(--ttcqn-color-primary);
  box-shadow:0 0 0 3px rgba(126,217,87,.18);
  background:var(--ttcqn-color-surface);
}
.ttcqn-seo-hp {
  position:absolute !important;
  left:-9999px !important;
  width:1px !important;
  height:1px !important;
  overflow:hidden !important;
}
.ttcqn-seo-submit {
  grid-column:1/-1;
  min-height:48px;
  border:0;
  border-radius:999px;
  background:var(--ttcqn-gradient-primary);
  color:#fff;
  font-size:14px;
  font-weight:950;
  text-transform:uppercase;
  cursor:pointer;
  box-shadow:0 14px 28px rgba(65,204,42,.28);
  transition:transform .22s ease,filter .22s ease;
}
.ttcqn-seo-submit:hover {
  transform:translateY(-2px);
  filter:brightness(1.04);
}
.ttcqn-seo-submit:disabled {
  opacity:.68;
  cursor:wait;
}
.ttcqn-seo-form-status {
  grid-column:1/-1;
  min-height:20px;
  margin:0 !important;
  font-size:13px !important;
  font-weight:750;
}
.ttcqn-seo-form-status.is-ok { color:var(--ttcqn-color-success) !important; }
.ttcqn-seo-form-status.is-error { color:var(--ttcqn-color-error) !important; }
.ttcqn-seo-callback-bubble { display:none; }
.ttcqn-seo-sheet[hidden] { display:none; }
.ttcqn-seo-sheet {
  position:fixed;
  inset:0;
  z-index:2147482600;
}
.ttcqn-seo-sheet-backdrop {
  position:absolute;
  inset:0;
  background:rgba(1,8,14,.68);
  backdrop-filter:blur(3px);
}
.ttcqn-seo-sheet-panel {
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  max-height:88vh;
  overflow:auto;
  border-radius:24px 24px 0 0;
  background:var(--ttcqn-color-surface);
  padding:18px 16px 22px;
  box-shadow:0 -24px 60px rgba(0,0,0,.34);
}
.ttcqn-seo-sheet-close {
  position:absolute;
  top:12px;
  right:14px;
  width:38px;
  height:38px;
  border:0;
  border-radius:50%;
  background:var(--ttcqn-color-surface-muted);
  color:var(--ttcqn-color-text-primary);
  font-size:26px;
  line-height:1;
  cursor:pointer;
}
.ttcqn-seo-sheet-head { padding:4px 46px 12px 4px; }
.ttcqn-seo-sheet-head h2 {
  margin:0 0 6px;
  color:var(--ttcqn-color-text-primary);
  font-size:22px;
  font-weight:950;
}
.ttcqn-seo-sheet-head p {
  margin:0;
  color:var(--ttcqn-color-text-muted);
  font-size:14px;
  line-height:1.5;
}
.ttcqn-seo-sheet .ttcqn-seo-callback-card {
  box-shadow:none;
  border:0;
  padding:0;
}
.ttcqn-seo-sheet .ttcqn-seo-callback-card > h2,
.ttcqn-seo-sheet .ttcqn-seo-callback-card > p { display:none; }
@media (max-width:1279px) and (min-width:768px) {
  .ttcqn-seo-hero {
    min-height:700px;
    padding:54px 22px 50px;
  }
  .ttcqn-seo-hero-inner {
    min-height:590px;
    grid-template-columns:minmax(0,1fr) minmax(360px,420px);
    gap:24px;
  }
  .ttcqn-seo-hero-title { font-size:clamp(42px,5.3vw,58px) !important; }
  .ttcqn-seo-hero-description { font-size:16px; }
  .ttcqn-seo-hero-form { grid-column:2; max-width:420px; }
  .ttcqn-seo-hero-visual {
    left:33%;
    right:375px;
    height:520px;
  }
  .ttcqn-seo-hero-truck {
    right:-315px;
    bottom:70px;
    width:640px;
    opacity:.46;
  }
  .ttcqn-seo-hero-staff {
    right:-28px;
    height:450px;
    opacity:.88;
  }
}
@media (max-width:767px) {
  .ttcqn-seo-hero {
    min-height:0;
    padding:34px 16px 36px;
  }
  .ttcqn-seo-hero-inner {
    display:flex;
    flex-direction:column;
    align-items:stretch;
    min-height:0;
    gap:0;
  }
  .ttcqn-seo-hero-copy {
    order:1;
    max-width:none;
  }
  .ttcqn-seo-hero-badge {
    margin-bottom:16px;
    padding:9px 14px;
    font-size:12px;
  }
  .ttcqn-seo-hero-title {
    font-size:clamp(38px,11.2vw,46px) !important;
    line-height:1.05 !important;
  }
  .ttcqn-seo-hero-description {
    margin-top:16px;
    font-size:15px;
    line-height:1.62;
  }
  .ttcqn-seo-hero-visual {
    order:2;
    position:relative;
    left:auto;
    right:auto;
    bottom:auto;
    width:100%;
    height:510px;
    margin:8px 0 0;
    overflow:visible;
  }
  .ttcqn-seo-hero-truck {
    right:28px;
    bottom:168px;
    width:330px;
    opacity:.46;
  }
  .ttcqn-seo-hero-staff {
    right:8px;
    bottom:150px;
    height:330px;
  }
  .ttcqn-seo-hero-form { display:none; }
  .ttcqn-seo-callback-bubble {
    position:absolute;
    left:0;
    right:0;
    bottom:10px;
    z-index:8;
    display:grid;
    gap:4px;
    width:min(100%,360px);
    margin:0 auto;
    padding:14px 16px;
    border:1px solid rgba(126,217,87,.52);
    border-radius:16px;
    background:rgba(255,255,255,.96);
    color:var(--ttcqn-color-text-primary);
    text-align:left;
    box-shadow:0 18px 34px rgba(0,0,0,.32);
    cursor:pointer;
    pointer-events:auto;
  }
  .ttcqn-seo-callback-bubble strong {
    font-size:15px;
    line-height:1.15;
    font-weight:950;
  }
  .ttcqn-seo-callback-bubble span {
    font-size:12px;
    line-height:1.35;
    color:var(--ttcqn-color-text-muted);
  }
  .ttcqn-seo-callback-bubble em {
    display:inline-flex;
    width:max-content;
    margin-top:3px;
    padding:7px 11px;
    border-radius:999px;
    background:var(--ttcqn-gradient-primary);
    color:#fff;
    font-size:12px;
    font-style:normal;
    font-weight:900;
  }
  .ttcqn-seo-callback-form { grid-template-columns:1fr; }
  .ttcqn-seo-field-full { grid-column:auto; }
  .ttcqn-seo-submit { position:sticky; bottom:0; }
  .ttcqn-seo-hero-city { bottom:126px; height:155px; }
}
@media (max-width:380px) {
  .ttcqn-seo-hero-title { font-size:38px !important; }
  .ttcqn-seo-hero-visual { height:492px; }
  .ttcqn-seo-hero-staff { height:315px; right:-4px; bottom:148px; }
  .ttcqn-seo-hero-truck { width:315px; right:18px; bottom:164px; }
  .ttcqn-seo-callback-bubble { width:100%; }
}
@media (prefers-reduced-motion:reduce) {
  .ttcqn-seo-submit { transition:none !important; }
}
</style>
<style id="ttcqn-seo-hero-layout-guard">
body.ttcqn-seo-hero-active .entry-header,
body.ttcqn-seo-hero-active .page-header,
body.ttcqn-seo-hero-active .inside-page-hero,
body.ttcqn-seo-hero-active .page-title-area { display:none !important; }
html.ttcqn-seo-sheet-open,
body.ttcqn-seo-sheet-open { overflow:hidden !important; }
body.ttcqn-seo-sheet-open .ttcqn-mls,
body.ttcqn-seo-sheet-open .ttcqn-floating-guide,
body.ttcqn-seo-sheet-open .ttcqn-sga-root,
body.ttcqn-seo-sheet-open .generate-back-to-top,
body.ttcqn-seo-sheet-open .footer-back-top { display:none !important; }
body.ttcqn-seo-hero-active .site-content,
body.ttcqn-seo-hero-active .content-area,
body.ttcqn-seo-hero-active .site-main { padding-top:0 !important; }
body.ttcqn-shared-header-active .site-content,
body.ttcqn-shared-header-active .content-area,
body.ttcqn-shared-header-active .site-main {
  margin-top:0 !important;
  padding-top:0 !important;
}
body.ttcqn-seo-hero-active .ttcqn-doorway-safe-page {
  width:100% !important;
  max-width:none !important;
}
body.ttcqn-seo-hero-active .ttcqn-seo-hero {
  width:100vw;
  max-width:100vw;
  margin-left:calc(50% - 50vw);
  margin-right:calc(50% - 50vw);
}
.ttcqn-doorway-safe-page > .ttcqn-seo-hero {
  width:100vw;
  max-width:100vw;
  margin-left:calc(50% - 50vw);
  margin-right:calc(50% - 50vw);
}
body.ttcqn-seo-hero-active .ttcqn-seo-hero-title,
.ttcqn-doorway-safe-page > .ttcqn-seo-hero .ttcqn-seo-hero-title,
body.ttcqn-seo-hero-active .ttcqn-seo-hero h1,
.ttcqn-doorway-safe-page > .ttcqn-seo-hero h1 {
  color:#fff !important;
}
.ttcqn-seo-callback-bubble { pointer-events:auto; }
</style>
    <?php
}
add_action('wp_head', 'ttcqn_seo_hero_print_assets', 40);

function ttcqn_shared_footer_print_assets(): void
{
    if (!ttcqn_shared_footer_should_render()) {
        return;
    }

    $template = __DIR__ . '/templates/page-home-direct.php';
    $css = '';
    if (file_exists($template)) {
        $source = (string) file_get_contents($template);
        if (preg_match('~/\\* === PREMIUM FOOTER 2026 === \\*/[\\s\\S]*?@media \\(prefers-reduced-motion:reduce\\) \\{[\\s\\S]*?\\n\\}~', $source, $match)) {
            $css = $match[0];
        }
    }

    if ($css === '') {
        return;
    }
    ?>
<style id="ttcqn-shared-footer-css">
body.ttcqn-shared-footer-active #colophon,
body.ttcqn-shared-footer-active footer.site-footer,
body.ttcqn-shared-footer-active .site-footer:not(.home-footer),
body.ttcqn-shared-footer-active .footer-widgets,
body.ttcqn-shared-footer-active .site-info {
  display:none !important;
}
body.ttcqn-shared-footer-active .home-footer {
  margin-top:0;
  width:100%;
  max-width:100vw;
}
body.ttcqn-shared-footer-active .home-footer,
body.ttcqn-shared-footer-active .home-footer * {
  box-sizing:border-box;
}
<?php echo $css; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
body.ttcqn-shared-footer-active .home-footer a:not(.footer-call-btn):not(.footer-social-link),
body.ttcqn-shared-footer-active .home-footer .footer-contact-list a,
body.ttcqn-shared-footer-active .home-footer .footer-contact-list span,
body.ttcqn-shared-footer-active .home-footer .footer-link-list a,
body.ttcqn-shared-footer-active .home-footer .footer-commit-list span {
  color:#ECF6FF !important;
}
body.ttcqn-shared-footer-active .home-footer .footer-brand-title span,
body.ttcqn-shared-footer-active .home-footer .footer-copyright span {
  color:var(--footer-green) !important;
}
body.ttcqn-shared-footer-active .home-footer .footer-call-btn {
  color:var(--footer-green) !important;
}
@media (max-width:768px) {
  body.ttcqn-shared-footer-active .home-footer .footer-call-btn,
  body.ttcqn-shared-footer-active .home-footer .footer-support-cta-mobile {
    color:#fff !important;
  }
}
</style>
    <?php
}
add_action('wp_head', 'ttcqn_shared_footer_print_assets', 45);

function ttcqn_seo_hero_should_render_global(): bool
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return false;
    }

    if (function_exists('is_front_page') && is_front_page()) {
        return false;
    }

    if (function_exists('ttcqn_home_emergency_is_front_request') && ttcqn_home_emergency_is_front_request()) {
        return false;
    }

    if (function_exists('ttcqn_doorway_safe_should_render') && ttcqn_doorway_safe_should_render()) {
        return false;
    }

    return function_exists('is_singular') && is_singular();
}

add_filter('body_class', function (array $classes): array {
    if (ttcqn_shared_header_should_render()) {
        $classes[] = 'ttcqn-shared-header-active';
    }

    if (ttcqn_seo_hero_should_render_global()) {
        $classes[] = 'ttcqn-seo-hero-active';
    }

    if (ttcqn_shared_footer_should_render()) {
        $classes[] = 'ttcqn-shared-footer-active';
    }
    return $classes;
});

add_filter('generate_show_title', function ($show) {
    return ttcqn_seo_hero_should_render_global() ? false : $show;
}, 20);

function ttcqn_shared_header_render(): void
{
    if (!ttcqn_shared_header_should_render()) {
        return;
    }

    echo ttcqn_shared_header_render_markup();
}
add_action('generate_before_header', 'ttcqn_shared_header_render', 1);

function ttcqn_shared_footer_render(): void
{
    if (!ttcqn_shared_footer_should_render()) {
        return;
    }

    static $rendered = false;
    if ($rendered) {
        return;
    }
    $rendered = true;

    $template = __DIR__ . '/templates/shared-footer.php';
    if (file_exists($template)) {
        include $template;
    }
}
add_action('generate_before_footer', 'ttcqn_shared_footer_render', 1);

function ttcqn_seo_hero_render_after_header(): void
{
    if (!ttcqn_seo_hero_should_render_global()) {
        return;
    }

    echo ttcqn_seo_hero_render();
}
add_action('generate_after_header', 'ttcqn_seo_hero_render_after_header', 5);

add_filter('the_content', function ($content) {
    static $did_strip = false;

    if ($did_strip || !ttcqn_seo_hero_should_render_global() || !in_the_loop() || !is_main_query()) {
        return $content;
    }

    $did_strip = true;

    $stripped = preg_replace('/<h1\b[^>]*>.*?<\/h1>/is', '', (string) $content, 1);

    return is_string($stripped) ? $stripped : $content;
}, 99);

function ttcqn_normalize_duplicate_img_loading_attributes(string $content): string
{
    if (stripos($content, '<img') === false || stripos($content, 'loading=') === false) {
        return $content;
    }

    $normalized = preg_replace_callback('/<img\b[^>]*>/i', function (array $matches): string {
        $tag = $matches[0];
        $loading_count = preg_match_all('/\sloading=(["\'])(.*?)\1/i', $tag, $loading_matches, PREG_OFFSET_CAPTURE);

        if ($loading_count <= 1) {
            return $tag;
        }

        $kept_first = false;

        return preg_replace_callback('/\sloading=(["\'])(.*?)\1/i', function (array $attr_matches) use (&$kept_first): string {
            if (!$kept_first) {
                $kept_first = true;
                return $attr_matches[0];
            }

            return '';
        }, $tag);
    }, $content);

    return is_string($normalized) ? $normalized : $content;
}

add_filter('the_content', 'ttcqn_normalize_duplicate_img_loading_attributes', 120);

function ttcqn_seo_hero_print_scripts(): void
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }
    ?>
<script id="ttcqn-shared-header-js">
(function() {
  if (!document.body.classList.contains('ttcqn-shared-footer-active')) return;
  if (window.ttcqnSharedFooterInit) return;
  window.ttcqnSharedFooterInit = true;

  document.querySelectorAll('[data-footer-accordion]').forEach(function(section) {
    var button = section.querySelector('.footer-accordion-toggle');
    if (!button) return;

    button.addEventListener('click', function() {
      var isOpen = section.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  document.querySelectorAll('.footer-back-top').forEach(function(button) {
    if (button.parentElement !== document.body) {
      document.body.appendChild(button);
    }

    button.addEventListener('click', function() {
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  });
})();

(function() {
  var header = document.querySelector('[data-ttcqn-shared-header]');
  if (!header) return;

  var navToggle = header.querySelector('.ttcqn-nav-toggle');
  var navMenu = header.querySelector('.ttcqn-nav-menu');
  if (!navToggle || !navMenu) return;

  function closeMenu() {
    navMenu.classList.remove('active');
    navToggle.textContent = '☰';
    navToggle.setAttribute('aria-expanded', 'false');
    header.querySelectorAll('.has-sub.open').forEach(function(item) {
      item.classList.remove('open');
      var toggle = item.querySelector('.sub-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  navToggle.addEventListener('click', function(event) {
    event.stopPropagation();
    var open = navMenu.classList.toggle('active');
    navToggle.textContent = open ? '✕' : '☰';
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  header.querySelectorAll('.has-sub > .sub-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(event) {
      if (window.innerWidth > 1279) return;
      event.preventDefault();
      event.stopPropagation();
      var parent = toggle.parentElement;
      header.querySelectorAll('.has-sub.open').forEach(function(item) {
        if (item !== parent) {
          item.classList.remove('open');
          var itemToggle = item.querySelector('.sub-toggle');
          if (itemToggle) itemToggle.setAttribute('aria-expanded', 'false');
        }
      });
      var open = parent.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  header.querySelectorAll('.sub-menu a').forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  });

  document.addEventListener('click', function(event) {
    if (!event.target.closest('[data-ttcqn-shared-header]')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 1279) closeMenu();
  });
})();
</script>
<script id="ttcqn-seo-hero-js">
(function() {
  var activeSheet = null;
  var activeOpener = null;

  function setStatus(form, message, type) {
    var status = form.querySelector('.ttcqn-seo-form-status');
    if (!status) return;
    status.textContent = message || '';
    status.classList.remove('is-ok', 'is-error');
    if (type) status.classList.add(type);
  }

  function firstFocusable(container) {
    return container.querySelector('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
  }

  function openSheet(button) {
    var section = button.closest('[data-ttcqn-seo-hero]');
    if (!section) return;
    var sheetId = button.getAttribute('aria-controls');
    var sheet = sheetId ? document.getElementById(sheetId) : section.querySelector('.ttcqn-seo-sheet');
    if (!sheet) return;
    activeSheet = sheet;
    activeOpener = button;
    sheet.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('ttcqn-seo-sheet-open');
    document.body.classList.add('ttcqn-seo-sheet-open');
    window.setTimeout(function() {
      var focusTarget = sheet.querySelector('input[name="phone"]') || firstFocusable(sheet);
      if (focusTarget) focusTarget.focus();
    }, 40);
  }

  function closeSheet(sheet) {
    sheet = sheet || activeSheet;
    if (!sheet) return;
    sheet.hidden = true;
    document.documentElement.classList.remove('ttcqn-seo-sheet-open');
    document.body.classList.remove('ttcqn-seo-sheet-open');
    if (activeOpener) {
      activeOpener.setAttribute('aria-expanded', 'false');
      activeOpener.focus();
    }
    activeSheet = null;
    activeOpener = null;
  }

  document.addEventListener('click', function(event) {
    var opener = event.target.closest('[data-ttcqn-open-sheet]');
    if (opener) {
      event.preventDefault();
      openSheet(opener);
      return;
    }

    var closer = event.target.closest('[data-ttcqn-close-sheet]');
    if (closer) {
      event.preventDefault();
      closeSheet(closer.closest('.ttcqn-seo-sheet'));
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && activeSheet) {
      event.preventDefault();
      closeSheet(activeSheet);
    }
  });

  document.addEventListener('submit', function(event) {
    var form = event.target.closest('.ttcqn-seo-callback-form');
    if (!form) return;

    event.preventDefault();
    var phoneInput = form.querySelector('input[name="phone"]');
    var submit = form.querySelector('.ttcqn-seo-submit');
    var phone = phoneInput ? phoneInput.value.trim() : '';
    var digits = phone.replace(/\D+/g, '');

    if (!phoneInput || digits.length < 9 || digits.length > 11) {
      if (phoneInput) {
        phoneInput.setAttribute('aria-invalid', 'true');
        phoneInput.focus();
      }
      setStatus(form, 'Số điện thoại chưa đúng. Anh/chị kiểm tra lại giúp.', 'is-error');
      return;
    }

    if (phoneInput) phoneInput.setAttribute('aria-invalid', 'false');
    setStatus(form, 'Đang gửi yêu cầu...', '');
    if (submit) {
      submit.disabled = true;
      submit.dataset.originalText = submit.dataset.originalText || submit.textContent;
      submit.textContent = 'ĐANG GỬI YÊU CẦU...';
    }

    var formData = new FormData(form);
    var payload = {
      phone: phone,
      area: String(formData.get('area') || 'Khác').trim() || 'Khác',
      issue: String(formData.get('issue') || 'Cần tư vấn').trim() || 'Cần tư vấn',
      time_needed: String(formData.get('time_needed') || 'Ngay bây giờ').trim() || 'Ngay bây giờ',
      note: String(formData.get('note') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      page: window.location.href
    };

    fetch(form.getAttribute('data-endpoint'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    })
      .then(function(response) {
        return response.json().catch(function() { return {}; }).then(function(json) {
          if (!response.ok) throw new Error(json.message || 'Chưa gửi được yêu cầu. Anh/chị gọi trực tiếp hotline để xử lý nhanh.');
          return json;
        });
      })
      .then(function() {
        form.reset();
        setStatus(form, 'Đã ghi nhận. Đội kỹ thuật sẽ gọi lại sớm.', 'is-ok');
        if (submit) submit.textContent = 'ĐÃ GHI NHẬN - SẼ GỌI LẠI SỚM';
      })
      .catch(function(error) {
        setStatus(form, error.message || 'Chưa gửi được yêu cầu. Anh/chị gọi trực tiếp hotline để xử lý nhanh.', 'is-error');
        if (phoneInput) phoneInput.setAttribute('aria-invalid', 'true');
        if (submit) submit.textContent = submit.dataset.originalText || 'Gửi yêu cầu gọi lại ngay';
      })
      .finally(function() {
        if (submit) submit.disabled = false;
      });
  });
})();
</script>
    <?php
}
add_action('wp_footer', 'ttcqn_seo_hero_print_scripts', 40);

function ttcqn_seo_hero_strip_legacy_top_blocks(string $html): string
{
    $html = (string) preg_replace_callback('~<style\b[^>]*>[\s\S]*?</style>~i', function (array $match): string {
        $style = $match[0];
        if (
            stripos($style, 'ai-injected') !== false ||
            stripos($style, 'GENERATEPRESS THEME OVERRIDE') !== false
        ) {
            return '';
        }

        return $style;
    }, $html);

    $html = (string) preg_replace_callback('~<script\b[^>]*>[\s\S]*?</script>~i', function (array $match): string {
        return stripos($match[0], 'ai-injected') !== false || stripos($match[0], 'temp_banner') !== false ? '' : $match[0];
    }, $html);

    $patterns = [
        '~<!--\s*ttcqn-subpage-banner-dedupe:[\s\S]*?-->~i',
        '~<style\b[^>]*id=["\']ttcqn-subpage-banner-css["\'][^>]*>.*?</style>~is',
        '~<section\b[^>]*class=["\'][^"\']*\bttcqn-subpage-banner\b[^"\']*["\'][^>]*>.*?</section>~is',
        '~<div\b[^>]*class=["\'][^"\']*\bfeatured-image\b[^"\']*\bpage-header-image\b[^"\']*["\'][^>]*>.*?</div>~is',
        '~<(section|div)\b[^>]*class=["\'][^"\']*\bhero-banner-section\b[^"\']*["\'][^>]*>.*?</\1>~is',
        '~<section\b[^>]*class=["\'][^"\']*\bttcqn-lead-section\b[^"\']*["\'][^>]*>.*?</section>~is',
        '~<section\b[^>]*class=["\'][^"\']*\bservice-hero-premium\b[^"\']*["\'][^>]*>.*?</section>~is',
        '~<a\b[^>]*class=["\'][^"\']*\bai-injected-(?:sticky|incontent)-banner\b[^"\']*["\'][^>]*>.*?</a>~is',
        '~<img\b[^>]*src=["\'][^"\']*(?:%22|\.\./|\.\./\.\./)image-briefs/assets/[^"\']*["\'][^>]*>~is',
        '~<img\b[^>]*src=\\\\["\'][^"\']*(?:\.\./|\.\./\.\./)image-briefs/assets/[^"\']*\\\\["\'][^>]*>~is',
    ];

    foreach ($patterns as $pattern) {
        $next = preg_replace($pattern, '', $html);
        if (is_string($next)) {
            $html = $next;
        }
    }

    $html = (string) preg_replace('~<meta\b[^>]*property=["\']og:video["\'][^>]*>\s*~i', '', $html);

    $html = (string) preg_replace_callback('~<script\b([^>]*type=["\']application/ld\+json["\'][^>]*)>([\s\S]*?)</script>~i', function (array $match): string {
        $attrs = $match[1];
        if (stripos($attrs, 'rank-math-schema') === false) {
            return $match[0];
        }

        $decoded = json_decode(trim($match[2]), true);
        if (!is_array($decoded) || empty($decoded['@graph']) || !is_array($decoded['@graph'])) {
            return $match[0];
        }

        $decoded['@graph'] = array_values(array_filter($decoded['@graph'], static function ($node): bool {
            if (!is_array($node)) {
                return true;
            }

            $types = (array) ($node['@type'] ?? []);
            $is_video = in_array('VideoObject', $types, true);
            $embed_url = (string) ($node['embedUrl'] ?? '');

            return !($is_video && (
                stripos($embed_url, 'youtube.com/embed/vcVjDZLV_O0') !== false
                || stripos($embed_url, 'youtube.com/embed/DmiPD6WM9Jg') !== false
            ));
        }));

        $new_json = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $new_json === false ? $match[0] : '<script ' . $attrs . '>' . $new_json . '</script>';
    }, $html);

    $has_home_schema = strpos($html, 'data-ttcqn-home-schema="1"') !== false;

    if ($has_home_schema) {
        $html = (string) preg_replace_callback('~<script\b([^>]*type=["\']application/ld\+json["\'][^>]*)>([\s\S]*?)</script>~i', function (array $match): string {
            $attrs = $match[1];
            if (stripos($attrs, 'data-ttcqn-home-schema') !== false || stripos($attrs, 'rank-math-schema') !== false) {
                return $match[0];
            }

            $decoded = json_decode(trim($match[2]), true);
            if (!is_array($decoded)) {
                return $match[0];
            }

            $types = (array) ($decoded['@type'] ?? []);
            $is_local_business = in_array('LocalBusiness', $types, true);
            $is_home_business_id = isset($decoded['@id']) && $decoded['@id'] === ttcqn_schema_business_id();

            return ($is_local_business && $is_home_business_id) ? '' : $match[0];
        }, $html);
    } else {
        $seen_business_node = false;
        $html = (string) preg_replace_callback('~<script\b([^>]*type=["\']application/ld\+json["\'][^>]*)>([\s\S]*?)</script>~i', function (array $match) use (&$seen_business_node): string {
            $attrs = $match[1];
            if (stripos($attrs, 'rank-math-schema') !== false || stripos($attrs, 'data-ttcqn-doorway-schema') !== false) {
                return $match[0];
            }

            $decoded = json_decode(trim($match[2]), true);
            if (!is_array($decoded)) {
                return $match[0];
            }

            $types = (array) ($decoded['@type'] ?? []);
            $is_local_business = in_array('LocalBusiness', $types, true) || in_array('HomeAndConstructionBusiness', $types, true);
            $is_business_id = isset($decoded['@id']) && $decoded['@id'] === ttcqn_schema_business_id();
            $is_business_name = isset($decoded['name']) && $decoded['name'] === 'Môi Trường Đô Thị Số 1 Quảng Ninh';

            if (!$is_local_business || (!$is_business_id && !$is_business_name)) {
                return $match[0];
            }

            if ($seen_business_node) {
                return '';
            }

            $canonical = ttcqn_schema_local_business_node();
            $canonical['@context'] = 'https://schema.org';
            $new_json = json_encode($canonical, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if ($new_json === false) {
                return $match[0];
            }

            $seen_business_node = true;
            return '<script ' . $attrs . '>' . $new_json . '</script>';
        }, $html);
    }

    // Strip invalid schema properties from all JSON-LD blocks in HTML, fill
    // safe required fields in older content JSON-LD, and avoid duplicate FAQPage.
    $seen_faq_page = false;
    $html = (string) preg_replace_callback('~<script\b([^>]*type=["\']application/ld\+json["\'][^>]*)>([\s\S]*?)</script>~i', function (array $match) use (&$seen_faq_page): string {
        $attrs = $match[1];
        $json_str = trim($match[2]);
        $decoded = json_decode($json_str, true);
        if (is_array($decoded)) {
            ttcqn_strip_invalid_properties_recursive($decoded);
            ttcqn_normalize_legacy_schema_recursive($decoded);
            if (!ttcqn_keep_first_faq_schema($decoded, $seen_faq_page)) {
                return '';
            }
            $new_json = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if ($new_json !== false) {
                return '<script ' . $attrs . '>' . $new_json . '</script>';
            }
        }
        return $match[0];
    }, $html);

    return $html;
}

add_action('template_redirect', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    ob_start('ttcqn_seo_hero_strip_legacy_top_blocks');
}, -3000);

function ttcqn_home_emergency_is_front_request(): bool
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return false;
    }

    $bypass = isset($_GET['ttcqn_bypass_emergency']) ? sanitize_text_field(wp_unslash($_GET['ttcqn_bypass_emergency'])) : '';
    if (hash_equals(TTCQN_HOME_EMERGENCY_BYPASS_TOKEN, $bypass)) {
        return false;
    }

    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return false;
    }

    $path = (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $path = '/' . trim($path, '/');

    return $path === '/' || (function_exists('is_front_page') && is_front_page());
}

add_action('template_redirect', function (): void {
    if (!ttcqn_home_emergency_is_front_request()) {
        return;
    }

    $front_page_id = (int) get_option('page_on_front');
    if ($front_page_id <= 0) {
        return;
    }

    $front_post = get_post($front_page_id);
    if (!$front_post instanceof WP_Post || $front_post->post_status !== 'publish') {
        return;
    }

    status_header(200);
    nocache_headers();
    header('Content-Type: text/html; charset=' . get_bloginfo('charset'));

    global $post;
    $previous_post = $post ?? null;
    $post = $front_post;
    setup_postdata($post);

    add_action('wp_head', function (): void {
        echo "\n<meta name=\"ttcqn-home-emergency-renderer\" content=\"" . esc_attr(TTCQN_HOME_EMERGENCY_VERSION) . "; direct-template\" />\n";
    }, 0);

    $template_path = __DIR__ . '/templates/page-home-direct.php';
    if (file_exists($template_path)) {
        include $template_path;
    } else {
        ?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="ttcqn-home-emergency-renderer" content="<?php echo esc_attr(TTCQN_HOME_EMERGENCY_VERSION); ?>; fallback-content">
<?php wp_head(); ?>
</head>
<body <?php body_class('ttcqn-home-emergency-rendered'); ?>>
<?php
if (function_exists('wp_body_open')) {
    wp_body_open();
}
?>
<main id="primary" class="ttcqn-home-emergency-main">
<?php
echo '<!-- TTCQN Home Emergency Renderer active: fallback-content -->';
echo apply_filters('the_content', $front_post->post_content);
?>
</main>
<?php wp_footer(); ?>
</body>
</html>
        <?php
    }

    wp_reset_postdata();
    $post = $previous_post;
    exit;
}, -2000);

add_action('wp_head', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    $path = (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $path = '/' . trim($path, '/');
    if ($path === '/' || (function_exists('is_front_page') && is_front_page())) {
        return;
    }
    ?>
<style id="ttcqn-gp-pages-css">
.page-header,
.inside-page-hero,
.page-title-area,
.gp-page-header-content,
.entry-header.page-header {
  background: linear-gradient(135deg, var(--ttcqn-color-dark) 0%, var(--ttcqn-color-secondary) 58%, var(--ttcqn-color-primary-hover) 100%) !important;
  color: #fff !important;
  padding: 40px 20px 36px !important;
  text-align: center;
}
.page-header .entry-title,
.page-header h1,
.inside-page-hero h1,
.page-title-area h1,
.gp-page-header-content h1 {
  color: #fff !important;
  font-size: clamp(22px, 3.5vw, 36px) !important;
  font-weight: 800 !important;
  line-height: 1.28 !important;
  text-shadow: 0 2px 12px rgba(0,0,0,.28) !important;
  margin: 0 auto !important;
  max-width: 820px !important;
}
.page-header::before,
.page-title-area::before,
.inside-page-hero::before {
  display: none !important;
}
.singular .entry-content,
.page .entry-content,
.single .entry-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--ttcqn-color-text-primary);
  max-width: 820px;
  margin: 0 auto;
}
.singular .entry-content h2,
.page .entry-content h2 {
  color: var(--ttcqn-color-secondary);
  font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 800;
  margin-top: 36px;
  margin-bottom: 12px;
  border-left: 4px solid var(--ttcqn-color-primary);
  padding-left: 12px;
}
.singular .entry-content h3,
.page .entry-content h3 {
  color: var(--ttcqn-color-secondary-hover);
  font-size: clamp(17px, 1.8vw, 21px);
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 8px;
}
.singular .entry-content p,
.page .entry-content p {
  margin-bottom: 16px;
}
.singular .entry-content ul,
.page .entry-content ul {
  padding-left: 22px;
  margin-bottom: 16px;
}
.singular .entry-content ul li {
  margin-bottom: 6px;
  position: relative;
}
.singular .entry-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--ttcqn-shadow-soft);
}
.singular .entry-content table thead tr {
  background: linear-gradient(135deg,var(--ttcqn-color-secondary-hover),var(--ttcqn-color-secondary));
  color: #fff;
}
.singular .entry-content table th,
.singular .entry-content table td {
  padding: 10px 14px;
  font-size: 14px;
  border-bottom: 1px solid rgba(11,111,211,.12);
  text-align: left;
}
.singular .entry-content table tr:nth-child(even) td {
  background: rgba(11,111,211,.05);
}
body:not(.home).ttcqn-shared-header-active {
  background:
    radial-gradient(circle at 8% 22%, rgba(126,217,87,.15), transparent 27%),
    radial-gradient(circle at 88% 30%, rgba(0,184,217,.13), transparent 31%),
    radial-gradient(circle at 22% 78%, rgba(126,217,87,.10), transparent 28%),
    linear-gradient(180deg,var(--ttcqn-color-dark) 0%,var(--ttcqn-color-dark-2) 44%,#020911 100%) fixed !important;
  color:var(--ttcqn-color-text-primary);
}
body:not(.home).ttcqn-shared-header-active #page {
  width:100% !important;
  max-width:none !important;
  margin:0 !important;
  position:relative;
  isolation:isolate;
  overflow:hidden;
  background:
    radial-gradient(circle at 78% 18%, rgba(126,217,87,.10), transparent 26%),
    radial-gradient(circle at 12% 54%, rgba(0,184,217,.10), transparent 28%),
    linear-gradient(180deg,var(--ttcqn-color-dark) 0%,var(--ttcqn-color-dark-2) 52%,#020911 100%) !important;
}
body:not(.home).ttcqn-shared-header-active #page::before,
body:not(.home).ttcqn-shared-header-active #page::after {
  content:"";
  position:absolute;
  z-index:0;
  pointer-events:none;
  background-repeat:no-repeat;
  background-position:center;
  background-size:contain;
  filter:drop-shadow(0 18px 34px rgba(0,0,0,.26));
}
body:not(.home).ttcqn-shared-header-active #page::before {
  top:56px;
  right:max(22px,5vw);
  width:330px;
  height:230px;
  opacity:.62;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 260'%3E%3Cg fill='none' stroke='%237ED957' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' opacity='.55'%3E%3Crect x='42' y='108' width='132' height='74' rx='20'/%3E%3Cpath d='M174 140h62l34 42h42'/%3E%3Cpath d='M54 108c16-38 78-38 106 0'/%3E%3Ccircle cx='92' cy='198' r='24'/%3E%3Ccircle cx='286' cy='198' r='24'/%3E%3Cpath d='M58 82h90M226 112h54M316 182h28'/%3E%3C/g%3E%3Cg fill='none' stroke='%2300B8D9' stroke-width='4' stroke-linecap='round' opacity='.35'%3E%3Cpath d='M28 50h90M250 68h84M196 42c42 18 72 52 82 102'/%3E%3C/g%3E%3C/svg%3E");
}
body:not(.home).ttcqn-shared-header-active #page::after {
  top:780px;
  left:max(18px,4vw);
  width:300px;
  height:255px;
  opacity:.52;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 280'%3E%3Cg fill='none' stroke='%2300B8D9' stroke-width='9' stroke-linecap='round' stroke-linejoin='round' opacity='.45'%3E%3Cpath d='M44 66h106c34 0 62 28 62 62v84'/%3E%3Cpath d='M212 212h64'/%3E%3Ccircle cx='75' cy='66' r='34'/%3E%3Cpath d='M52 66h46M75 43v46'/%3E%3Cpath d='M168 122h88c18 0 32 14 32 32v42'/%3E%3C/g%3E%3Cg fill='none' stroke='%237ED957' stroke-width='4' opacity='.36'%3E%3Cpath d='M34 230c52-24 110-24 174 0s86 23 102 12'/%3E%3Cpath d='M24 250c68-16 120-10 176 8'/%3E%3C/g%3E%3C/svg%3E");
}
body:not(.home).ttcqn-seo-hero-active #content {
  width:min(1200px,100%) !important;
  max-width:1200px !important;
  margin:0 auto !important;
  padding:56px 16px 78px !important;
  position:relative;
  z-index:1;
  background:transparent !important;
}
body:not(.home).ttcqn-service-page #content {
  width:min(1200px,100%) !important;
  max-width:1200px !important;
  margin:0 auto !important;
  padding:0 16px 78px !important;
  position:relative;
  z-index:1;
  background:transparent !important;
}
body:not(.home).ttcqn-shared-header-active .inside-article,
body:not(.home).ttcqn-shared-header-active .ttcqn-doorway-safe-content {
  background:rgba(255,255,255,.97) !important;
  border:1px solid rgba(54,183,87,.18) !important;
  border-radius:22px !important;
  box-shadow:0 28px 70px rgba(0,0,0,.34), 0 0 0 1px rgba(255,255,255,.06) !important;
  overflow:hidden;
}
body:not(.home).ttcqn-shared-header-active .inside-article {
  padding:42px 38px !important;
}
body:not(.home).ttcqn-shared-header-active .ttcqn-doorway-safe-content {
  margin-top:56px !important;
  padding:42px 38px !important;
}
body:not(.home).ttcqn-shared-header-active .site-main,
body:not(.home).ttcqn-shared-header-active .content-area,
body:not(.home).ttcqn-shared-header-active article {
  position:relative;
  z-index:1;
}
body:not(.home).ttcqn-shared-header-active .entry-content img,
body:not(.home).ttcqn-shared-header-active .ttcqn-doorway-safe-content img {
  border-radius:14px !important;
  box-shadow:0 16px 34px rgba(2,13,23,.12);
}
body:not(.home).ttcqn-shared-header-active .sidebar .widget,
body:not(.home).ttcqn-shared-header-active #right-sidebar .widget {
  background:rgba(255,255,255,.96) !important;
  border-radius:18px !important;
  border:1px solid rgba(54,183,87,.18) !important;
  box-shadow:0 20px 48px rgba(0,0,0,.24) !important;
}
@media (max-width:1023px) {
  body:not(.home).ttcqn-shared-header-active #page::before {
    width:230px;
    height:170px;
    top:52px;
    right:-62px;
    opacity:.38;
  }
  body:not(.home).ttcqn-shared-header-active #page::after {
    width:220px;
    height:190px;
    top:720px;
    left:-72px;
    opacity:.34;
  }
  body:not(.home).ttcqn-seo-hero-active #content,
  body:not(.home).ttcqn-service-page #content {
    padding-left:14px !important;
    padding-right:14px !important;
  }
  body:not(.home).ttcqn-shared-header-active .inside-article,
  body:not(.home).ttcqn-shared-header-active .ttcqn-doorway-safe-content {
    border-radius:18px !important;
    padding:28px 18px !important;
  }
}
@media (max-width:640px) {
  body:not(.home).ttcqn-seo-hero-active #content {
    padding-top:36px !important;
    padding-bottom:56px !important;
  }
  body:not(.home).ttcqn-service-page #content {
    padding-bottom:56px !important;
  }
  body:not(.home).ttcqn-shared-header-active .ttcqn-doorway-safe-content {
    margin-top:36px !important;
  }
  body:not(.home).ttcqn-shared-header-active #page::before {
    top:44px;
    right:-92px;
  }
  body:not(.home).ttcqn-shared-header-active #page::after {
    top:620px;
    left:-100px;
  }
}
</style>
    <?php
}, 100);

function ttcqn_color_system_legacy_override(): void
{
    if (!ttcqn_color_system_should_print_frontend()) {
        return;
    }
    ?>
<style id="ttcqn-clean-custom-css">
:root {
  --ttcqn-color-primary:#36b757;
  --ttcqn-color-primary-hover:#168b39;
  --ttcqn-color-primary-bright:#7ed957;
  --ttcqn-color-secondary:#0b6fd3;
  --ttcqn-color-secondary-hover:#0757ba;
  --ttcqn-color-accent:#f5b301;
  --ttcqn-color-border:#d9e6ef;
  --ttcqn-gradient-primary:linear-gradient(135deg,var(--ttcqn-color-primary),var(--ttcqn-color-primary-hover));
  --ttcqn-gradient-secondary:linear-gradient(135deg,var(--ttcqn-color-secondary-hover),var(--ttcqn-color-secondary));
}
/* Clean replacement for legacy WordPress Additional CSS. */
.hero-banner-section {
  position:relative;
}
.hero-banner-section::before {
  content:"";
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  height:100px;
  background:linear-gradient(to top,rgba(0,0,0,.30),transparent);
  pointer-events:none;
  z-index:1;
}
.floating-cta {
  position:fixed;
  right:20px;
  bottom:20px;
  z-index:9999;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.floating-cta a {
  display:flex;
  align-items:center;
  justify-content:center;
  width:60px;
  height:60px;
  border-radius:50%;
  color:#fff !important;
  font-size:28px;
  text-decoration:none !important;
  box-shadow:0 4px 12px rgba(0,0,0,.30);
  transition:transform .3s ease;
}
.floating-cta a:hover {
  transform:scale(1.1);
}
.floating-cta .btn-phone,
body .floating-cta .btn-phone {
  background:var(--ttcqn-gradient-primary) !important;
  animation:ttcqn-pulse-primary 2s infinite !important;
}
.floating-cta .btn-zalo,
body .floating-cta .btn-zalo {
  background:var(--ttcqn-gradient-secondary) !important;
}
.pricing-highlight,
body .pricing-highlight {
  border-color:var(--ttcqn-color-primary) !important;
  box-shadow:0 14px 34px rgba(54,183,87,.18) !important;
}
.hero-banner-section > .elementor-background-overlay,
.hero-banner-section::after {
  content:"";
  position:absolute;
  inset:0;
  background:rgba(10,20,40,.85) !important;
  z-index:0;
}
.hero-banner-section > .elementor-container {
  position:relative;
  z-index:1;
}
@media (max-width:767px) {
  .hero-banner-section .elementor-widget-heading h1,
  .hp-hero h1 {
    font-size:26px !important;
    line-height:1.3 !important;
  }
  .hp-hero h2 {
    font-size:16px !important;
  }
  div[style*="grid-template-columns:repeat(3"] {
    grid-template-columns:1fr !important;
  }
  div[style*="grid-template-columns:repeat(4"] {
    grid-template-columns:repeat(2,1fr) !important;
  }
  div[style*="display:flex"][style*="gap:40px"] {
    gap:20px !important;
  }
}
@keyframes ttcqn-pulse-primary {
  0% { box-shadow:0 0 0 0 rgba(54,183,87,.52); }
  70% { box-shadow:0 0 0 15px rgba(54,183,87,0); }
  100% { box-shadow:0 0 0 0 rgba(54,183,87,0); }
}
</style>
    <?php
}
add_action('wp_head', 'ttcqn_color_system_legacy_override', 9999);

/**
 * ============================================================================
 * PHẦN 2: TỰ ĐỘNG PHÂN LOẠI DANH MỤC BÀI VIẾT (NHÓM TỪ KHÓA) Chuẩn SEO Codex 2026
 * ============================================================================
 */
class TTCQN_Post_Auto_Classifier {
    private static $doing_classification = false;

    public static function init() {
        add_action('wp_after_insert_post', [__CLASS__, 'classify_post'], 10, 4);
    }

    public static function classify_post($post_id, $post, $update, $post_before) {
        if ($post->post_type !== 'post') {
            return;
        }

        if (self::$doing_classification) {
            return;
        }

        self::$doing_classification = true;

        $title = $post->post_title;
        $content = $post->post_content;
        $excerpt = $post->post_excerpt;
        $slug = $post->post_name;

        // Nội dung gộp để quét từ khóa
        $text_to_scan = $title . ' ' . $slug . ' ' . $excerpt . ' ' . $content;
        $text_to_scan = mb_strtolower($text_to_scan, 'UTF-8');

        $categories_to_assign = [];

        // Helper check từ khóa
        $has_keywords = function($keywords) use ($text_to_scan) {
            foreach ($keywords as $kw) {
                if (mb_stripos($text_to_scan, $kw, 0, 'UTF-8') !== false) {
                    return true;
                }
            }
            return false;
        };

        // 1. Nhóm Hút bể phốt
        $is_hut_be_phot = $has_keywords(['hút bể phốt', 'bể phốt đầy', 'hầm cầu đầy', 'hút hầm cầu', 'bể tự hoại', 'xe hút bể phốt', 'mùi hôi bể phốt', 'đầy bể phốt']);
        if ($is_hut_be_phot) {
            $categories_to_assign[] = 'hut-be-phot';
            $categories_to_assign[] = 'blog';
        }

        // 2. Nhóm Thông tắc cống
        $is_thong_tac_cong = $has_keywords(['thông tắc cống', 'cống tắc', 'cống nghẹt', 'nước rút chậm', 'đường ống thoát nước', 'tắc đường ống', 'cống thoát sàn', 'cống nhà tắm', 'cống nhà bếp', 'dầu mỡ tắc cống']);
        if ($is_thong_tac_cong) {
            $categories_to_assign[] = 'thong-tac-cong';
            $categories_to_assign[] = 'blog';
        }

        // 3. Nhóm Thông tắc bồn cầu
        $is_thong_tac_bon_cau = $has_keywords(['thông tắc bồn cầu', 'bồn cầu tắc', 'bồn cầu nghẹt', 'bồn cầu không xuống nước', 'bồn cầu trào ngược', 'giấy vệ sinh gây tắc', 'dị vật trong bồn cầu']);
        if ($is_thong_tac_bon_cau) {
            $categories_to_assign[] = 'thong-tac-bon-cau';
            $categories_to_assign[] = 'blog';
        }

        // 4. Nhóm Nạo vét hố ga
        $is_nao_vet_ho_ga = $has_keywords(['nạo vét hố ga', 'hố ga đầy', 'bùn hố ga', 'nạo vét cống rãnh', 'vệ sinh hố ga', 'hố ga bốc mùi', 'nước thải ứ đọng']);
        if ($is_nao_vet_ho_ga) {
            $categories_to_assign[] = 'nao-vet-ho-ga';
            $categories_to_assign[] = 'blog';
        }

        // 5. Nhóm Xử lý mùi hôi
        $is_xu_ly_mui_hoi = $has_keywords(['mùi hôi nhà vệ sinh', 'mùi hôi cống', 'mùi hôi bồn cầu', 'mùi hôi bể phốt', 'nhà vệ sinh bốc mùi', 'cống bốc mùi', 'khử mùi nhà vệ sinh', 'xử lý mùi hôi']);
        if ($is_xu_ly_mui_hoi) {
            $categories_to_assign[] = 'xu-ly-mui-hoi';
            $categories_to_assign[] = 'blog';
        }

        // Phân loại chéo phụ trợ
        if ($is_xu_ly_mui_hoi) {
            if ($has_keywords(['bể phốt', 'hầm cầu'])) {
                $categories_to_assign[] = 'hut-be-phot';
            }
            if ($has_keywords(['cống', 'thoát sàn'])) {
                $categories_to_assign[] = 'thong-tac-cong';
            }
        }
        if ($is_nao_vet_ho_ga && $has_keywords(['mùi hôi', 'bốc mùi'])) {
            $categories_to_assign[] = 'xu-ly-mui-hoi';
        }

        // 6. Nhóm Bảng giá dịch vụ
        $is_bang_gia = $has_keywords(['bảng giá', 'giá hút bể phốt', 'giá thông tắc cống', 'giá thông tắc bồn cầu', 'chi phí', 'báo giá', 'dịch vụ bao nhiêu tiền']);
        if ($is_bang_gia) {
            $categories_to_assign[] = 'bang-gia';
            $categories_to_assign[] = 'blog';
        }

        // 7. Nhóm Hướng dẫn xử lý tại nhà
        $is_huong_dan = $has_keywords(['cách xử lý', 'tự xử lý', 'tại nhà', 'mẹo xử lý', 'hướng dẫn', 'làm gì khi', 'có nên dùng', 'cách thông', 'cách khử mùi']);
        if ($is_huong_dan || ($is_thong_tac_cong && $has_keywords(['tự xử lý', 'mẹo', 'tại nhà'])) || ($is_thong_tac_bon_cau && $has_keywords(['mẹo', 'tại nhà']))) {
            $categories_to_assign[] = 'huong-dan-tai-nha';
        }

        // 8. Nhóm Dấu hiệu cảnh báo
        $is_canh_bao = $has_keywords(['dấu hiệu', 'nhận biết', 'cảnh báo', 'khi nào cần gọi thợ', 'biểu hiện', 'nguyên nhân', 'vì sao', 'có nguy hiểm không']);
        if ($is_canh_bao || $is_hut_be_phot || $is_thong_tac_cong || $is_thong_tac_bon_cau || $is_nao_vet_ho_ga) {
            if ($has_keywords(['dấu hiệu', 'nhận biết', 'cảnh báo', 'nguyên nhân', 'vì sao'])) {
                $categories_to_assign[] = 'canh-bao';
            }
        }

        // Lấy các categories hiện có của post
        $current_categories = wp_get_post_categories($post_id, ['fields' => 'all']);
        $current_slugs = [];
        $current_ids = [];
        foreach ($current_categories as $c) {
            $current_slugs[] = $c->slug;
            $current_ids[] = $c->term_id;
        }

        // Mặc định luôn có ít nhất Blog hoặc Tin tức
        if (!in_array('blog', $current_slugs) && !in_array('tin-tuc', $current_slugs)) {
            $categories_to_assign[] = 'blog';
        }

        // Chuyển slug sang term ID thực tế
        $term_ids_to_add = [];
        $categories_to_assign = array_unique($categories_to_assign);

        foreach ($categories_to_assign as $slug) {
            $term = get_category_by_slug($slug);
            if ($term) {
                $term_ids_to_add[] = $term->term_id;
            }
        }

        // Hợp nhất, không ghi đè lựa chọn của admin
        $final_term_ids = array_unique(array_merge($current_ids, $term_ids_to_add));

        if (count($final_term_ids) !== count($current_ids) || array_diff($final_term_ids, $current_ids)) {
            wp_set_post_categories($post_id, $final_term_ids);
        }

        self::$doing_classification = false;
    }
}
TTCQN_Post_Auto_Classifier::init();

// === STRIP INVALID PROPERTIES FROM RANK MATH SCHEMA ===
function ttcqn_strip_invalid_properties_recursive(&$array) {
    if (!is_array($array)) {
        return;
    }
    
    // Strip isPrimary (always invalid for standard schema.org types generated by Rank Math)
    if (isset($array['isPrimary'])) {
        unset($array['isPrimary']);
    }

    // Review rich results are strict and must be backed by a single clean
    // visible source of truth. Remove rating/review markup generated by older
    // SEO layers to avoid duplicate aggregateRating and invalid parent nodes.
    if (isset($array['aggregateRating'])) {
        unset($array['aggregateRating']);
    }
    if (isset($array['review'])) {
        unset($array['review']);
    }
    
    // Strip inLanguage from LocalBusiness, Organization, HomeAndConstructionBusiness, Place
    if (isset($array['@type'])) {
        $type = $array['@type'];
        $types = is_array($type) ? $type : [$type];
        $invalid_for_in_language = ['LocalBusiness', 'Organization', 'HomeAndConstructionBusiness', 'Place'];
        $has_invalid_type = false;
        foreach ($types as $t) {
            if (in_array($t, $invalid_for_in_language)) {
                $has_invalid_type = true;
                break;
            }
        }
        if ($has_invalid_type && isset($array['inLanguage'])) {
            unset($array['inLanguage']);
        }
    }
    
    foreach ($array as $key => &$value) {
        if (is_array($value)) {
            ttcqn_strip_invalid_properties_recursive($value);
        }
    }
}

function ttcqn_schema_types($node): array {
    if (!is_array($node) || !isset($node['@type'])) {
        return [];
    }

    return is_array($node['@type']) ? $node['@type'] : [$node['@type']];
}

function ttcqn_schema_has_type($node, string $type): bool {
    return in_array($type, ttcqn_schema_types($node), true);
}

function ttcqn_current_public_url(): string {
    if (function_exists('get_permalink') && is_singular()) {
        $permalink = get_permalink();
        if (is_string($permalink) && $permalink !== '') {
            return $permalink;
        }
    }

    $path = (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    return home_url('/' . ltrim($path, '/'));
}

function ttcqn_normalize_legacy_schema_recursive(&$node): void {
    if (!is_array($node)) {
        return;
    }

    if (array_is_list($node)) {
        foreach ($node as &$item) {
            ttcqn_normalize_legacy_schema_recursive($item);
        }
        return;
    }

    $types = ttcqn_schema_types($node);
    $is_local_business = in_array('LocalBusiness', $types, true) || in_array('HomeAndConstructionBusiness', $types, true);
    if ($is_local_business) {
        $name = (string) ($node['name'] ?? '');
        $id = (string) ($node['@id'] ?? '');
        if (!isset($node['url']) && (
            $name === 'Môi Trường Đô Thị Số 1 Quảng Ninh'
            || $id === ttcqn_schema_business_id()
            || isset($node['telephone'])
        )) {
            $node['url'] = home_url('/');
        }
    }

    if (in_array('Service', $types, true)) {
        if (empty($node['name']) && !empty($node['serviceType'])) {
            $node['name'] = (string) $node['serviceType'];
        }
        if (empty($node['url'])) {
            $node['url'] = ttcqn_current_public_url();
        }
    }

    foreach ($node as &$value) {
        ttcqn_normalize_legacy_schema_recursive($value);
    }
}

function ttcqn_keep_first_faq_schema(&$node, bool &$seen_faq_page): bool {
    if (!is_array($node)) {
        return true;
    }

    if (array_is_list($node)) {
        $kept = [];
        foreach ($node as $item) {
            if (ttcqn_keep_first_faq_schema($item, $seen_faq_page)) {
                $kept[] = $item;
            }
        }
        $node = $kept;
        return !empty($node);
    }

    if (ttcqn_schema_has_type($node, 'FAQPage')) {
        if ($seen_faq_page) {
            return false;
        }
        $seen_faq_page = true;
    }

    if (isset($node['@graph']) && is_array($node['@graph'])) {
        $filtered = [];
        foreach ($node['@graph'] as $item) {
            if (ttcqn_keep_first_faq_schema($item, $seen_faq_page)) {
                $filtered[] = $item;
            }
        }
        $node['@graph'] = $filtered;
    }

    return true;
}

add_filter('rank_math/json_ld', function($data, $jsonld) {
    if (is_array($data)) {
        ttcqn_strip_invalid_properties_recursive($data);
        ttcqn_normalize_legacy_schema_recursive($data);
    }
    return $data;
}, 99, 2);

// === LOCALIZED FAQ AND QUICK TAKEAWAYS FOR GOOGLE AI OVERVIEW & AI MODE ===

function ttcqn_detect_service_and_location($slug) {
    $service_type = 'thong-tac-cong';
    $service_name = 'Thông tắc cống';
    
    if (strpos($slug, 'hut-be-phot') !== false) {
        $service_type = 'hut-be-phot';
        $service_name = 'Hút bể phốt';
    } elseif (strpos($slug, 'thong-tac-bon-cau') !== false || strpos($slug, 'thong-bon-cau') !== false) {
        $service_type = 'thong-bon-cau';
        $service_name = 'Thông tắc bồn cầu';
    } elseif (strpos($slug, 'thong-tac-chau-rua') !== false || strpos($slug, 'thong-chau-rua') !== false) {
        $service_type = 'thong-chau-rua';
        $service_name = 'Thông tắc chậu rửa';
    } elseif (strpos($slug, 'nao-vet') !== false) {
        $service_type = 'nao-vet';
        $service_name = 'Nạo vét hố ga';
    } elseif (strpos($slug, 'mui-hoi') !== false) {
        $service_type = 'mui-hoi';
        $service_name = 'Xử lý mùi hôi';
    }

    $location = 'Quảng Ninh';
    $specials = '';

    if (strpos($slug, 'ha-long') !== false || strpos($slug, 'bai-chay') !== false || strpos($slug, 'cao-xanh') !== false || strpos($slug, 'hong-gai') !== false || strpos($slug, 'gieng-day') !== false || strpos($slug, 'tuan-chau') !== false) {
        $location = 'Hạ Long';
        if (strpos($slug, 'bai-chay') !== false) {
            $location = 'Bãi Cháy, Hạ Long';
            $specials = 'phục vụ nhanh các nhà hàng, khách sạn dọc đường Hạ Long và khu phố cổ Bãi Cháy ban đêm để không ảnh hưởng hoạt động kinh doanh';
        } elseif (strpos($slug, 'cao-xanh') !== false) {
            $location = 'Cao Xanh, Hạ Long';
            $specials = 'hỗ trợ xử lý triệt để bùn đất bồi lắng, cống nghẹt tại khu vực Cao Xanh và Hà Khánh dọc trục đường chính';
        } elseif (strpos($slug, 'hong-gai') !== false) {
            $location = 'Hồng Gai, Hạ Long';
            $specials = 'thông tắc cống không đục phá cho các nhà phố cổ, ngõ dốc đứng khu vực Hồng Gai và Bạch Đằng gần chợ Hạ Long';
        } elseif (strpos($slug, 'gieng-day') !== false) {
            $location = 'Giếng Đáy, Hạ Long';
            $specials = 'xử lý hút bể phốt bồn chân không công suất lớn cho khu công nghiệp Giếng Đáy và các ngõ sâu vùng dốc';
        } elseif (strpos($slug, 'tuan-chau') !== false) {
            $location = 'Tuần Châu, Hạ Long';
            $specials = 'phục vụ xe hút chân không hiện đại, xử lý mùi hôi triệt để cho các biệt thự, resort nghỉ dưỡng cao cấp tại đảo Tuần Châu';
        } else {
            $specials = 'xử lý nhanh chóng các điểm ngập úng cục bộ, tắc nghẽn cống thoát nước do triều cường hoặc địa hình dốc đá đặc thù tại các phường thuộc Hạ Long';
        }
    } elseif (strpos($slug, 'cam-pha') !== false || strpos($slug, 'cua-ong') !== false || strpos($slug, 'mong-duong') !== false || strpos($slug, 'cam-trung') !== false || strpos($slug, 'cam-thuy') !== false) {
        $location = 'Cẩm Phả';
        if (strpos($slug, 'cua-ong') !== false) {
            $location = 'Cửa Ông, Cẩm Phả';
            $specials = 'phục vụ hút bể phốt, thông tắc cống sạch sẽ cho hộ dân xung quanh đền Cửa Ông và các ngõ sâu vùng mỏ';
        } elseif (strpos($slug, 'mong-duong') !== false) {
            $location = 'Mông Dương, Cẩm Phả';
            $specials = 'hỗ trợ thông tắc cống, xử lý bùn than lắng cặn trong đường ống thoát nước công nghiệp khu vực Mông Dương';
        } elseif (strpos($slug, 'cam-trung') !== false) {
            $location = 'Cẩm Trung, Cẩm Phả';
            $specials = 'phục vụ thông tắc chậu rửa, đường ống thoát sàn khu dân cư đông đúc Cẩm Trung dọc Quốc lộ 18';
        } elseif (strpos($slug, 'cam-thuy') !== false) {
            $location = 'Cẩm Thủy, Cẩm Phả';
            $specials = 'sử dụng máy lò xo công nghiệp thông cống không đục phá cho các hộ dân và nhà xưởng tại Cẩm Thủy';
        } else {
            $specials = 'luồn ống dài tới 150-200m vào tận ngõ sâu vùng mỏ Cẩm Phả, hút sạch bùn than cặn lắng trong bể phốt dứt điểm';
        }
    } elseif (strpos($slug, 'uong-bi') !== false || strpos($slug, 'yen-tu') !== false || strpos($slug, 'phuong-dong') !== false || strpos($slug, 'vang-danh') !== false) {
        $location = 'Uông Bí';
        if (strpos($slug, 'yen-tu') !== false) {
            $location = 'Yên Tử, Uông Bí';
            $specials = 'phục vụ xử lý chất thải bể phốt, cống nghẹt cho các nhà hàng kinh doanh, cơ sở lưu trú phục vụ lễ hội quanh khu vực Yên Tử';
        } elseif (strpos($slug, 'phuong-dong') !== false) {
            $location = 'Phương Đông, Uông Bí';
            $specials = 'phục vụ hút bể phốt và thông tắc cống nhanh cho các hộ gia đình dọc đường Cách Mạng Tháng Tám và khu dân cư mới Phương Đông';
        } elseif (strpos($slug, 'vang-danh') !== false) {
            $location = 'Vàng Danh, Uông Bí';
            $specials = 'sử dụng xe hút bồn lớn và máy thông lò xo đặc trị tắc nghẽn cống than cặn cho các khu tập thể công nhân Vàng Danh';
        } else {
            $specials = 'đáp ứng nhanh sau 15 phút tại các tuyến đường Trần Hưng Đạo, Quang Trung và khu dân cư đông đúc của thành phố Uông Bí';
        }
    } elseif (strpos($slug, 'quang-yen') !== false || strpos($slug, 'minh-thanh') !== false || strpos($slug, 'nam-hoa') !== false) {
        $location = 'Quảng Yên';
        if (strpos($slug, 'minh-thanh') !== false) {
            $location = 'Minh Thành, Quảng Yên';
            $specials = 'xử lý thông tắc cống thoát nước và hút bể phốt cho các khu dân cư mới Minh Thành gần nút giao cao tốc';
        } elseif (strpos($slug, 'nam-hoa') !== false) {
            $location = 'Nam Hòa, Quảng Yên';
            $specials = 'phục vụ thông cống bồi lắng bùn cát đầm lầy đặc thù khu vực Nam Hòa không đục phá bằng máy lò xo';
        } else {
            $specials = 'đặc trị cống nghẹt bùn sình đất cát do địa hình đầm lầy, hút bể phốt trang trại chăn nuôi thủy sản tại thị xã Quảng Yên';
        }
    } elseif (strpos($slug, 'dong-trieu') !== false || strpos($slug, 'mao-khe') !== false) {
        $location = 'Đông Triều';
        if (strpos($slug, 'mao-khe') !== false) {
            $location = 'Mạo Khê, Đông Triều';
            $specials = 'phục vụ hút bể phốt xe bồn chân không công nghệ Nhật Bản và thông tắc cống lò xo tại thị trấn Mạo Khê đông đúc';
        } else {
            $specials = 'thông cống không đục phá và xử lý mùi hôi dứt điểm cho các hộ dân và làng nghề gốm sứ truyền thống Đông Triều';
        }
    } elseif (strpos($slug, 'van-don') !== false || strpos($slug, 'cai-rong') !== false) {
        $location = 'Vân Đồn';
        $specials = 'hút bể phốt, thông tắc cống dứt điểm cho các cơ sở nuôi trồng thủy hải sản, nhà hàng ven biển và biệt thự đảo Vân Đồn';
    } else {
        $specials = 'phục vụ 24/7 không đục phá, cam kết bảo hành dài hạn từ 6 đến 24 tháng cho mọi công trình tại Quảng Ninh';
    }

    return [
        'service_type' => $service_type,
        'service_name' => $service_name,
        'location'     => $location,
        'specials'     => $specials,
    ];
}

function ttcqn_get_localized_faq($slug) {
    $data = ttcqn_detect_service_and_location($slug);
    $service = $data['service_name'];
    $location = $data['location'];
    $specials = $data['specials'];

    $q1 = "Giá dịch vụ " . $service . " tại " . $location . " là bao nhiêu?";
    $a1 = "Chi phí " . mb_strtolower($service) . " tại " . $location . " dao động tùy thuộc vào mức độ tắc nghẽn, thể tích bể phốt thực tế (đối với xe hút) hoặc chiều dài đường ống dẫn (đối với máy lò xo). Môi Trường Đô Thị Số 1 Quảng Ninh cam kết báo giá công khai rõ ràng trước khi thi công, dao động từ 100k - 300k cho thông tắc và từ 250k - 350k/khối cho xe hút chân không chuyên dụng. Mọi yêu cầu được khảo sát miễn phí qua Hotline tư vấn 24/7: 0963.953.533 / 0931.156.756.";

    $q2 = "Thợ " . $service . " tại " . $location . " bao lâu thì có mặt?";
    $a2 = "Chúng tôi có chi nhánh trực thuộc tại tất cả các khu vực của " . $location . ". Do đó, chỉ sau 15 phút nhận cuộc gọi qua hotline, đội ngũ kỹ thuật cùng xe bồn chuyên dụng hoặc máy lò xo công nghiệp sẽ lập tức có mặt tại địa bàn. Đặc biệt, tại khu vực " . $location . ", chúng tôi " . $specials . ".";

    $q3 = "Dịch vụ " . $service . " tại " . $location . " có bảo hành không và cam kết thế nào?";
    $a3 = "Chúng tôi tự hào áp dụng chính sách bảo hành dài hạn từ 6 đến 24 tháng cho dịch vụ " . mb_strtolower($service) . " tại " . $location . ". Khách hàng được cam kết 3 KHÔNG độc quyền: Không đục phá làm hư hại kết cấu công trình - Không nâng khống giá/báo giá ảo - Không tái phát tắc nghẽn trong thời hạn bảo hành. Nếu có bất kỳ sự cố phát sinh nào, kỹ thuật viên sẽ quay lại xử lý hoàn toàn miễn phí.";

    $html = '<div class="ttcqn-faq-section" id="faq-overview">';
    $html .= '<h3 class="ttcqn-faq-section-title">Câu Hỏi Thường Gặp Về Dịch Vụ tại ' . esc_html($location) . '</h3>';
    
    $html .= '<div class="ttcqn-faq-item">';
    $html .= '<h4 class="ttcqn-faq-question">💡 ' . esc_html($q1) . '</h4>';
    $html .= '<p class="ttcqn-faq-answer">' . esc_html($a1) . '</p>';
    $html .= '</div>';

    $html .= '<div class="ttcqn-faq-item">';
    $html .= '<h4 class="ttcqn-faq-question">💡 ' . esc_html($q2) . '</h4>';
    $html .= '<p class="ttcqn-faq-answer">' . esc_html($a2) . '</p>';
    $html .= '</div>';

    $html .= '<div class="ttcqn-faq-item">';
    $html .= '<h4 class="ttcqn-faq-question">💡 ' . esc_html($q3) . '</h4>';
    $html .= '<p class="ttcqn-faq-answer">' . esc_html($a3) . '</p>';
    $html .= '</div>';

    $html .= '</div>';

    return [
        'html' => $html,
        'schema' => [
            ['question' => $q1, 'answer' => $a1],
            ['question' => $q2, 'answer' => $a2],
            ['question' => $q3, 'answer' => $a3],
        ]
    ];
}

function ttcqn_get_localized_quick_takeaways($slug) {
    $data = ttcqn_detect_service_and_location($slug);
    $service = $data['service_name'];
    $location = $data['location'];

    $html = '<div class="ttcqn-quick-takeaways">';
    $html .= '<div class="ttcqn-quick-takeaways-title">';
    $html .= '<span>💡</span> TÓM TẮT NHANH (AI QUICK TAKEAWAYS)';
    $html .= '</div>';
    $html .= '<ul class="ttcqn-quick-takeaways-list">';
    $html .= '<li><strong>Dịch vụ:</strong> ' . esc_html($service) . ' kỹ thuật tại <strong>' . esc_html($location) . '</strong>, hoạt động 24/7 bất kể ngày đêm hay ngày lễ tết.</li>';
    $html .= '<li><strong>Tốc độ:</strong> Đội thợ túc trực địa bàn có mặt sau <strong>15 phút</strong>, khảo sát hiện trạng hoàn toàn miễn phí.</li>';
    $html .= '<li><strong>Cam kết:</strong> Áp dụng chính sách 3 Không (Không đục phá - Không báo giá ảo - Không tái phát). Bảo hành dài hạn từ <strong>6 - 24 tháng</strong>.</li>';
    $html .= '<li><strong>Hotline liên hệ trực tiếp:</strong> Gọi ngay <a class="ttcqn-quick-takeaway-link" href="tel:0963953533">0963.953.533</a> hoặc <a class="ttcqn-quick-takeaway-link" href="tel:0931156756">0931.156.756</a> để được thợ hỗ trợ lập tức và giảm 30% hôm nay.</li>';
    $html .= '</ul>';
    $html .= '</div>';

    return $html;
}

// Chèn CSS chuẩn vào head
add_action('wp_head', 'ttcqn_inject_ai_overview_styles');
function ttcqn_inject_ai_overview_styles() {
    ?>
    <style id="ttcqn-ai-overview-styles">
    .ttcqn-quick-takeaways {
        border: 1px solid var(--ttcqn-color-border, #d9e6ef);
        border-left: 4px solid var(--ttcqn-color-secondary, #0b6fd3);
        padding: 16px 20px;
        background: var(--ttcqn-color-surface-muted, #eef8ff);
        margin: 20px 0;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .ttcqn-quick-takeaways-title {
        margin: 0 0 12px 0;
        font-weight: 700;
        color: var(--ttcqn-color-secondary-hover, #0757ba);
        text-transform: uppercase;
        font-size: 13px;
        letter-spacing: 0.8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .ttcqn-quick-takeaways-list {
        margin: 0;
        padding-left: 20px;
        list-style-type: disc !important;
    }
    .ttcqn-quick-takeaways-list li {
        margin-bottom: 8px;
        font-size: 15px;
        color: var(--ttcqn-color-text-secondary, #243b53);
        line-height: 1.6;
    }
    .ttcqn-quick-takeaways-list li:last-child {
        margin-bottom: 0;
    }
    .ttcqn-quick-takeaway-link {
        color: var(--ttcqn-color-secondary, #0b6fd3);
        font-weight: 800;
        text-decoration: none;
    }
    .ttcqn-faq-section {
        margin-top: 40px;
        padding: 24px;
        background: var(--ttcqn-color-surface, #ffffff);
        border: 1px solid var(--ttcqn-color-border, #d9e6ef);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .ttcqn-faq-section-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--ttcqn-color-text-primary, #102a43);
        margin: 0 0 20px 0;
        border-bottom: 2px solid var(--ttcqn-color-secondary, #0b6fd3);
        padding-bottom: 8px;
    }
    .ttcqn-faq-item {
        margin-bottom: 20px;
        border-bottom: 1px solid var(--ttcqn-color-border, #d9e6ef);
        padding-bottom: 15px;
    }
    .ttcqn-faq-item:last-child {
        margin-bottom: 0;
        border-bottom: none;
        padding-bottom: 0;
    }
    .ttcqn-faq-question {
        font-size: 16px;
        font-weight: 600;
        color: var(--ttcqn-color-secondary, #0b6fd3);
        margin: 0 0 8px 0;
    }
    .ttcqn-faq-answer {
        font-size: 15px;
        color: var(--ttcqn-color-text-muted, #52606d);
        line-height: 1.6;
        margin: 0;
    }
    </style>
    <?php
}

function ttcqn_content_has_managed_faq_schema($content) {
    if (!is_string($content) || stripos($content, 'application/ld+json') === false) {
        return false;
    }

    return preg_match('/["\']@type["\']\s*:\s*["\']FAQPage["\']/i', $content) === 1;
}

// Chèn nội dung Quick Takeaways và FAQ vào the_content
add_filter('the_content', 'ttcqn_inject_ai_features_to_content', 9);
function ttcqn_inject_ai_features_to_content($content) {
    if (is_admin() || is_feed() || !in_the_loop() || !is_main_query()) {
        return $content;
    }

    if (!is_single() && !is_page()) {
        return $content;
    }

    global $post;
    if (!$post) {
        return $content;
    }

    // Nội dung đã có FAQ và schema kiểm soát riêng thì không chèn khối FAQ mẫu trùng lặp.
    if (ttcqn_content_has_managed_faq_schema($content)) {
        return $content;
    }

    $slug = $post->post_name;
    
    $is_target = false;
    $keywords = ['hut-be-phot', 'thong-tac-cong', 'thong-tac-bon-cau', 'thong-bon-cau', 'nao-vet', 'mui-hoi', 'thong-tac-chau-rua', 'thong-chau-rua'];
    foreach ($keywords as $kw) {
        if (strpos($slug, $kw) !== false) {
            $is_target = true;
            break;
        }
    }

    if (!$is_target) {
        return $content;
    }

    static $already_injected = [];
    if (isset($already_injected[$post->ID])) {
        return $content;
    }
    $already_injected[$post->ID] = true;

    $takeaways_html = ttcqn_get_localized_quick_takeaways($slug);
    $faq_data = ttcqn_get_localized_faq($slug);
    $faq_html = $faq_data['html'];

    return $takeaways_html . $content . $faq_html;
}

// Chèn JSON-LD FAQ Schema vào wp_head
add_action('wp_head', 'ttcqn_inject_faq_schema_to_head', 11);
function ttcqn_inject_faq_schema_to_head() {
    if (is_admin()) {
        return;
    }

    if (!is_single() && !is_page()) {
        return;
    }

    global $post;
    if (!$post) {
        return;
    }

    if (ttcqn_content_has_managed_faq_schema($post->post_content)) {
        return;
    }

    $slug = $post->post_name;
    
    $is_target = false;
    $keywords = ['hut-be-phot', 'thong-tac-cong', 'thong-tac-bon-cau', 'thong-bon-cau', 'nao-vet', 'mui-hoi