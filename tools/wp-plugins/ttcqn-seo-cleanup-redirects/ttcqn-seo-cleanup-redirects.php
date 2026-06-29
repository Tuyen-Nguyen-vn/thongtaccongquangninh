<?php
/**
 * Plugin Name: TTCQN SEO Cleanup Redirects
 * Description: Canonical 301 redirects for retired duplicate or legacy SEO URLs.
 * Version: 2026.06.29.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

function ttcqn_seo_cleanup_redirect_map(): array
{
    return [
        '/thong-tac-toilet-quang-ninh' => '/thong-tac-bon-cau-quang-ninh/',
        '/thong-tac-cong-bai-chay-2' => '/thong-tac-cong-bai-chay/',
        '/thong-tac-cong-bai-chay-3' => '/thong-tac-cong-bai-chay/',
        // Cao Xanh duplicate: giữ landing page chính, nghỉ bản post hậu tố -2
        '/thong-tac-cong-cao-xanh-2' => '/thong-tac-cong-cao-xanh/',
        // Giếng Đáy duplicate: giữ landing page chính, nghỉ bản post hậu tố -2
        '/thong-tac-cong-gieng-day-2' => '/thong-tac-cong-gieng-day/',
        '/thong-tac-cong-gieng-day-3' => '/thong-tac-cong-gieng-day/',
        '/thong-tac-cong-gieng-day-bai-viet' => '/thong-tac-cong-gieng-day/',
        // Chi phí: giữ bài đã duyệt SEO ở URL sạch, redirect bản hậu tố/legacy về canonical.
        '/chi-phi-hut-be-phot-quang-ninh-2' => '/chi-phi-hut-be-phot-quang-ninh/',
        '/blog/chi-phi-hut-be-phot-quang-ninh' => '/chi-phi-hut-be-phot-quang-ninh/',
        // Bảng giá duplicate auto: giữ URL canonical đã tối ưu, nghỉ bản hậu tố -3.
        '/bang-gia-hut-be-phot-quang-ninh-2026-3' => '/bang-gia-hut-be-phot-quang-ninh-2026/',
        // FAQ duplicate: 2 trang cùng title — giữ URL sạch, redirect bản slug xấu
        '/cau-hoi-thuong-gap-thong-tac-cong-qn-2' => '/cau-hoi-thuong-gap-thong-tac-cong/',
        // Hoành Bồ sáp nhập Hạ Long từ 2020 — redirect về trang Hạ Long
        '/hut-be-phot-hoanh-bo' => '/hut-be-phot-ha-long/',
        // Bồn cầu khẩn cấp duplicate: giữ URL sạch, nghỉ bản hậu tố -2
        '/thong-tac-bon-cau-khan-cap-quang-ninh-2' => '/thong-tac-bon-cau-khan-cap-quang-ninh/',
        // GSC Coverage cleanup 2026-06-03: legacy 404 URLs with clear replacement intent.
        '/thong-tac-cong-nha-hang-quang-ninh' => '/thong-tac-cong-nha-hang-ha-long/',
        '/hut-ham-cau' => '/hut-be-phot-quang-ninh/',
        '/dich-vu' => '/',
        '/category/dich-vu' => '/blog/',
        '/tag/thong-tac' => '/thong-tac-cong-quang-ninh/',
        '/tag/hut-be-phot' => '/hut-be-phot-quang-ninh/',
        '/bao-gia' => '/bang-gia/',
        '/lien-he-2' => '/lien-he/',
        '/contact' => '/lien-he/',
        '/dich-vu-hut-be-phot' => '/hut-be-phot-quang-ninh/',
        '/dich-vu-thong-tac-cong' => '/thong-tac-cong-quang-ninh/',
        '/ve-chung-toi' => '/gioi-thieu/',
        '/about' => '/gioi-thieu/',
        '/tin-tuc' => '/blog/',
        '/news' => '/blog/',
        '/blog-2' => '/blog/',
        // Category nao-vet-ho-ga trả 502 — redirect về landing page chính
        '/category/nao-vet-ho-ga' => '/nao-vet-ho-ga-quang-ninh/',
    ];
}

function ttcqn_seo_cleanup_retired_paths(): array
{
    return array_keys(ttcqn_seo_cleanup_redirect_map());
}

function ttcqn_seo_cleanup_retired_slugs(): array
{
    return array_map(static function (string $path): string {
        return trim($path, '/');
    }, ttcqn_seo_cleanup_retired_paths());
}

function ttcqn_seo_cleanup_intentional_noindex_slugs(): array
{
    return [
        'dieu-khoan-dich-vu',
        'chinh-sach-bao-mat',
        'he-thong-lien-ket-doi-tac',
    ];
}

function ttcqn_seo_cleanup_sitemap_excluded_paths(): array
{
    return array_map(static function (string $slug): string {
        return '/' . trim($slug, '/');
    }, ttcqn_seo_cleanup_intentional_noindex_slugs());
}

function ttcqn_seo_cleanup_normalize_path(string $url_or_path): string
{
    $path = (string) wp_parse_url($url_or_path, PHP_URL_PATH);
    return '/' . trim($path, '/');
}

add_action('template_redirect', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return;
    }

    $path = ttcqn_seo_cleanup_normalize_path((string) ($_SERVER['REQUEST_URI'] ?? '/'));
    $redirects = ttcqn_seo_cleanup_redirect_map();

    if (!isset($redirects[$path])) {
        return;
    }

    wp_safe_redirect(home_url($redirects[$path]), 301, 'TTCQN SEO Cleanup Redirects');
    exit;
}, -1000);

add_filter('rank_math/sitemap/entry', function ($url, $type, $object) {
    if (in_array((string) $type, ['author', 'user'], true)) {
        return false;
    }

    if (isset($object->ID) && (int) $object->ID === 1801) {
        return false;
    }

    if (isset($object->post_name) && in_array((string) $object->post_name, ttcqn_seo_cleanup_intentional_noindex_slugs(), true)) {
        return false;
    }

    if (isset($object->post_name) && in_array((string) $object->post_name, ttcqn_seo_cleanup_retired_slugs(), true)) {
        return false;
    }

    if (!is_array($url) || empty($url['loc'])) {
        return $url;
    }

    $path = ttcqn_seo_cleanup_normalize_path((string) $url['loc']);
    if (in_array($path, ttcqn_seo_cleanup_sitemap_excluded_paths(), true)) {
        return false;
    }

    if (in_array($path, ttcqn_seo_cleanup_retired_paths(), true)) {
        return false;
    }

    return $url;
}, 10, 3);

add_filter('rank_math/sitemap/index/entry', function ($index, $type) {
    return in_array((string) $type, ['author', 'user', 'category', 'post_tag'], true) ? false : $index;
}, 10, 2);

add_filter('rank_math/sitemap/author/query', function ($args) {
    return [
        'include' => [0],
        'number' => 0,
    ];
}, 999);

add_filter('rank_math/sitemap/xml_post_url', function ($url, $post) {
    if (isset($post->ID) && (int) $post->ID === 1801) {
        return false;
    }

    if (isset($post->post_name) && in_array((string) $post->post_name, ttcqn_seo_cleanup_intentional_noindex_slugs(), true)) {
        return false;
    }

    if (isset($post->post_name) && in_array((string) $post->post_name, ttcqn_seo_cleanup_retired_slugs(), true)) {
        return false;
    }

    $path = ttcqn_seo_cleanup_normalize_path((string) $url);
    if (in_array($path, ttcqn_seo_cleanup_sitemap_excluded_paths(), true)) {
        return false;
    }

    if (in_array($path, ttcqn_seo_cleanup_retired_paths(), true)) {
        return false;
    }

    return $url;
}, 10, 2);

add_filter('rank_math/sitemap/enable_caching', '__return_false', 999);

function ttcqn_seo_cleanup_is_author_archive_path(): bool
{
    return str_starts_with(ttcqn_seo_cleanup_current_path(), '/author/');
}

add_filter('rank_math/frontend/robots', function ($robots) {
    if (!is_author() && !is_category()) {
        return $robots;
    }

    return [
        'noindex' => 'noindex',
        'follow' => 'follow',
        'max-snippet' => 'max-snippet:-1',
        'max-video-preview' => 'max-video-preview:-1',
        'max-image-preview' => 'max-image-preview:large',
    ];
}, 999);

function ttcqn_seo_cleanup_filter_author_archive_html(string $html): string
{
    if (!ttcqn_seo_cleanup_is_author_archive_path() && !is_category()) {
        return $html;
    }

    $noindex = '<meta name="robots" content="noindex, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"/>';
    if (preg_match('~<meta\b[^>]*name=["\']robots["\'][^>]*>~i', $html)) {
        return (string) preg_replace('~<meta\b[^>]*name=["\']robots["\'][^>]*>~i', $noindex, $html, 1);
    }

    return (string) preg_replace('~</head>~i', $noindex . "\n</head>", $html, 1);
}

function ttcqn_seo_cleanup_is_sitemap_request(): bool
{
    $path = ttcqn_seo_cleanup_current_path();
    return str_ends_with($path, 'sitemap.xml') || str_ends_with($path, 'sitemap_index.xml');
}

function ttcqn_seo_cleanup_empty_author_sitemap(): string
{
    return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
        . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>' . "\n"
        . '<!-- TTCQN SEO Cleanup: author archives intentionally removed from XML sitemap. -->' . "\n";
}

function ttcqn_seo_cleanup_filter_sitemap_xml(string $xml): string
{
    $path = ttcqn_seo_cleanup_current_path();

    if ($path === '/author-sitemap.xml') {
        return ttcqn_seo_cleanup_empty_author_sitemap();
    }

    $xml = (string) preg_replace(
        '~\s*<sitemap>\s*<loc>https?://[^<]+/author-sitemap\.xml</loc>[\s\S]*?</sitemap>~i',
        '',
        $xml
    );

    $xml = (string) preg_replace(
        '~\s*<sitemap>\s*<loc>https?://[^<]+/category-sitemap\.xml</loc>[\s\S]*?</sitemap>~i',
        '',
        $xml
    );

    foreach (ttcqn_seo_cleanup_sitemap_excluded_paths() as $excluded_path) {
        $quoted_path = preg_quote(trim($excluded_path, '/'), '~');
        $xml = (string) preg_replace(
            '~\s*<url>\s*<loc>https?://[^<]+/' . $quoted_path . '/?</loc>[\s\S]*?</url>~i',
            '',
            $xml
        );
    }

    return (string) preg_replace(
        '~\s*<url>\s*<loc>https?://[^<]+/author/[^<]+</loc>[\s\S]*?</url>~i',
        '',
        (string) preg_replace(
            '~\s*<url>\s*<loc>https?://[^<]+/category/[^<]+</loc>[\s\S]*?</url>~i',
            '',
            $xml
        )
    );
}

add_action('template_redirect', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    if (is_author() || is_category()) {
        ob_start('ttcqn_seo_cleanup_filter_author_archive_html');
    }

    if (ttcqn_seo_cleanup_is_sitemap_request()) {
        ob_start('ttcqn_seo_cleanup_filter_sitemap_xml');
    }
}, -2500);

add_action('init', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    // Rank Math can render sitemap routes before template_redirect.
    if (ttcqn_seo_cleanup_is_sitemap_request()) {
        ob_start('ttcqn_seo_cleanup_filter_sitemap_xml');
    }
}, -2500);

function ttcqn_seo_cleanup_default_og_image(): string
{
    return 'https://thongtaccongquangninh.com/wp-content/uploads/2026/04/og-ve-sinh-moi-truong-quang-ninh-phuc-vu-24-7.jpg';
}

function ttcqn_seo_cleanup_current_path(): string
{
    return ttcqn_seo_cleanup_normalize_path((string) ($_SERVER['REQUEST_URI'] ?? '/'));
}

function ttcqn_seo_cleanup_meta_overrides(): array
{
    $image = ttcqn_seo_cleanup_default_og_image();

    return [
        '/gioi-thieu' => [
            'title'       => 'Hồ sơ Môi Trường Đô Thị Số 1 Quảng Ninh và đội thông hút 24/7',
            'description' => 'Môi Trường Đô Thị Số 1 Quảng Ninh – hút bể phốt, thông tắc cống, thông bồn cầu 24/7. Có mặt 15 phút, báo giá công khai, không đục phá. Gọi ngay 0963.953.533.',
        ],
        '/lien-he' => [
            'title' => 'Liên hệ đặt lịch hút bể phốt, thông tắc cống Quảng Ninh 24/7',
        ],
        '/chinh-sach-bao-mat' => [
            'title' => 'Chính sách bảo mật thông tin khách hàng Quảng Ninh',
        ],
        '/thong-tac-bon-cau-cam-pha' => [
            'description' => 'Thông tắc bồn cầu Cẩm Phả cho nhà dân, nhà trọ, khu mỏ khi nước rút chậm, trào ngược hoặc có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        '/thong-tac-bon-cau-mong-cai' => [
            'description' => 'Thông tắc bồn cầu Móng Cái cho nhà phố, cửa hàng, nhà nghỉ khi nước rút chậm, trào ngược hoặc có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        '/thong-tac-bon-cau-uong-bi' => [
            'description' => 'Thông tắc bồn cầu Uông Bí cho nhà trọ, khu dân cư và nhà ống cũ khi nước rút chậm, trào ngược, có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        '/thong-tac-bon-cau-van-don' => [
            'description' => 'Thông tắc bồn cầu Vân Đồn cho homestay, resort và nhà dân khi nước rút chậm, trào ngược hoặc có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        '/he-thong-lien-ket-doi-tac' => [
            'description' => 'Danh bạ liên kết đối tác Môi Trường Đô Thị Số 1 Quảng Ninh: kênh truyền thông, hồ sơ doanh nghiệp và đầu mối liên hệ. Gọi 0963.953.533 / 0931.156.756.',
        ],
        '/hut-be-phot-quang-ninh' => [
            'description' => 'Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533.',
        ],
        '/thong-tac-cong-quang-ninh' => [
            'description' => 'Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533.',
        ],
        '/thong-tac-chau-rua-quang-ninh' => [
            'description' => 'Thông tắc chậu rửa Quảng Ninh 24/7, xử lý dầu mỡ, cặn bám, nước rút chậm tại bếp nhà dân và quán ăn. Gọi 0963.953.533.',
        ],
        '/nao-vet-ho-ga-quang-ninh' => [
            'description' => 'Nạo vét hố ga Quảng Ninh 24/7, xử lý bùn rác, mùi hôi, thoát nước kém trước mùa mưa. Báo giá rõ, gọi 0963.953.533.',
        ],
        '/thong-tac-cong-chung-cu-ha-long' => [
            'description' => 'Thông tắc cống chung cư Hạ Long, xử lý trục đứng, tầng hầm, cống bếp và thoát sàn bằng thiết bị phù hợp. Gọi 0963.953.533.',
        ],
        '/thong-tac-cong-ngo-nho-ha-long' => [
            'description' => 'Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533.',
        ],
        '/nguyen-nhan-cong-tac-thuong-xuyen-ha-long' => [
            'description' => 'Tìm nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống sai độ dốc. Cần kiểm tra gọi 0963.953.533.',
        ],
        '/thong-tac-cong-dong-trieu' => [
            'description' => 'Thông tắc cống Đông Triều 24/7 cho nhà vườn, khu trọ, cơ sở kinh doanh. Xử lý nước trào, mùi hôi, không đục phá khi chưa cần. Gọi 0963.953.533 / 0931.156.756.',
        ],
        '/thong-tac-cong-mong-cai' => [
            'description' => 'Thông tắc cống Móng Cái 24/7 cho nhà phố, quán ăn, khu chợ cửa khẩu. Xử lý cống nghẹt, nước trào, báo giá rõ trong ngày. Gọi 0963.953.533 / 0931.156.756.',
        ],
        '/thong-tac-cong-van-don' => [
            'description' => 'Thông tắc cống Vân Đồn 24/7 cho nhà hàng, homestay, công trình ven biển. Xử lý cát, mỡ, mùi hôi, báo giá rõ trong ngày. Gọi 0963.953.533 / 0931.156.756.',
        ],
        '/hut-be-phot-mong-cai' => [
            'description' => 'Hút bể phốt Móng Cái cho nhà dân, khách sạn, khu kinh doanh. Tiếp nhận 05:00-22:00, xe bồn hút sạch, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.',
        ],
        '/hut-be-phot-van-don' => [
            'description' => 'Hút bể phốt Vân Đồn cho homestay, resort, nhà dân ven biển. Tiếp nhận 05:00-22:00, xe bồn hút sạch, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.',
        ],
        '/category/uncategorized' => [
            'title' => 'Bài viết chưa phân loại về dịch vụ môi trường Quảng Ninh',
            'description' => 'Danh sách bài viết đang chờ phân loại về hút bể phốt, thông tắc cống, bồn cầu, hố ga và xử lý mùi hôi tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/huong-dan' => [
            'description' => 'Hướng dẫn xử lý sự cố cống tắc, bồn cầu nghẹt, bể phốt đầy và mùi hôi nhà vệ sinh trước khi gọi thợ tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/bang-gia-blog' => [
            'description' => 'Bảng giá tham khảo cho dịch vụ hút bể phốt, thông tắc cống, bồn cầu, chậu rửa và nạo vét hố ga tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/blog' => [
            'description' => 'Blog vệ sinh môi trường Quảng Ninh: dấu hiệu cống tắc, bể phốt đầy, bồn cầu nghẹt, mùi hôi và cách xử lý an toàn.',
            'image' => $image,
        ],
        '/category/hut-be-phot' => [
            'description' => 'Kiến thức và bảng giá hút bể phốt Quảng Ninh, dấu hiệu bể đầy, chu kỳ hút, cách báo giá và lưu ý khi gọi xe bồn.',
            'image' => $image,
        ],
        '/category/thong-tac-cong' => [
            'description' => 'Hướng dẫn thông tắc cống Quảng Ninh: nguyên nhân cống nghẹt, nước trào, mùi hôi, cách xử lý và khi nào cần gọi thợ.',
            'image' => $image,
        ],
        '/category/thong-tac-bon-cau' => [
            'description' => 'Hướng dẫn xử lý bồn cầu nghẹt, nước rút chậm, trào ngược và dấu hiệu cần gọi thợ thông tắc bồn cầu tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/nao-vet-ho-ga' => [
            'description' => 'Tổng hợp bài viết về nạo vét hố ga, xử lý bùn rác, mùi hôi, thoát nước kém và chống ngập cho công trình tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/xu-ly-mui-hoi' => [
            'description' => 'Cách nhận biết và xử lý mùi hôi nhà vệ sinh, cống thoát sàn, bể phốt và hố ga cho nhà dân, cửa hàng tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/huong-dan-tai-nha' => [
            'description' => 'Hướng dẫn xử lý tạm tại nhà khi cống nghẹt, bồn cầu rút chậm, bể phốt có mùi và các dấu hiệu cần gọi thợ sớm.',
            'image' => $image,
        ],
        '/category/canh-bao' => [
            'description' => 'Dấu hiệu cảnh báo cống tắc, bể phốt đầy, bồn cầu nghẹt, hố ga quá tải và mùi hôi cần xử lý sớm tại Quảng Ninh.',
            'image' => $image,
        ],
        '/category/bang-gia' => [
            'description' => 'Bảng giá dịch vụ thông tắc cống, hút bể phốt, thông bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh.',
            'image' => $image,
        ],
        '/author/cuben01' => [
            'description' => 'Tổng hợp bài viết SEO dịch vụ môi trường Quảng Ninh do Tuyền Nguyễn biên soạn và kiểm tra nội dung trước khi đăng.',
            'image' => $image,
        ],
        '/author/admin' => [
            'description' => 'Lưu trữ bài viết quản trị website Môi Trường Đô Thị Số 1 Quảng Ninh về dịch vụ môi trường và thông tin liên hệ.',
            'image' => $image,
        ],
        '/author/chatgpt' => [
            'description' => 'Lưu trữ bài viết hỗ trợ nội dung SEO cho dịch vụ hút bể phốt, thông tắc cống và vệ sinh môi trường Quảng Ninh.',
            'image' => $image,
        ],
    ];
}

function ttcqn_seo_cleanup_current_override(): array
{
    $path = ttcqn_seo_cleanup_current_path();
    $overrides = ttcqn_seo_cleanup_meta_overrides();

    return $overrides[$path] ?? [];
}

function ttcqn_seo_cleanup_polish_description(string $description): string
{
    $description = trim($description);
    if ($description !== '' && function_exists('mb_strlen') && mb_strlen($description, 'UTF-8') < 120) {
        $description .= ' Gọi 0963.953.533 để được tư vấn nhanh.';
    }

    return $description;
}

add_filter('rank_math/frontend/title', function ($title) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['title']) ? $override['title'] : $title;
}, 999);

add_filter('rank_math/frontend/description', function ($description) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['description']) ? ttcqn_seo_cleanup_polish_description($override['description']) : $description;
}, 999);

add_filter('rank_math/opengraph/facebook/title', function ($title) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['title']) ? $override['title'] : $title;
}, 999);

add_filter('rank_math/opengraph/facebook/description', function ($description) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['description']) ? ttcqn_seo_cleanup_polish_description($override['description']) : $description;
}, 999);

add_filter('rank_math/opengraph/twitter/title', function ($title) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['title']) ? $override['title'] : $title;
}, 999);

add_filter('rank_math/opengraph/twitter/description', function ($description) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['description']) ? ttcqn_seo_cleanup_polish_description($override['description']) : $description;
}, 999);

add_filter('rank_math/opengraph/facebook/image', function ($image) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['image']) ? $override['image'] : $image;
}, 999);

add_filter('rank_math/opengraph/facebook/og_image', function ($image) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['image']) ? $override['image'] : $image;
}, 999);

add_filter('rank_math/opengraph/twitter/image', function ($image) {
    $override = ttcqn_seo_cleanup_current_override();
    return !empty($override['image']) ? $override['image'] : $image;
}, 999);

add_action('wp_head', function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    $override = ttcqn_seo_cleanup_current_override();
    if (empty($override)) {
        return;
    }

    $title = $override['title'] ?? wp_get_document_title();
    $description = !empty($override['description']) ? ttcqn_seo_cleanup_polish_description($override['description']) : '';
    $image = $override['image'] ?? '';

    if ($description && (is_category() || is_author())) {
        echo "\n<meta name=\"description\" content=\"" . esc_attr($description) . "\" />\n";
        echo "<meta property=\"og:description\" content=\"" . esc_attr($description) . "\" />\n";
        echo "<meta name=\"twitter:description\" content=\"" . esc_attr($description) . "\" />\n";
    }

    if ($title && (is_category() || is_author())) {
        echo "<meta property=\"og:title\" content=\"" . esc_attr($title) . "\" />\n";
        echo "<meta name=\"twitter:title\" content=\"" . esc_attr($title) . "\" />\n";
    }

    if ($image && (is_category() || is_author())) {
        echo "<meta property=\"og:image\" content=\"" . esc_url($image) . "\" />\n";
        echo "<meta property=\"og:image:secure_url\" content=\"" . esc_url($image) . "\" />\n";
        echo "<meta name=\"twitter:image\" content=\"" . esc_url($image) . "\" />\n";
    }
}, 2);
