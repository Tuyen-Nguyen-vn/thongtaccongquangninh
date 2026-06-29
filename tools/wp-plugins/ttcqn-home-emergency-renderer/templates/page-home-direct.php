<?php
/**
 * Template Name: Homepage Direct
 * Template trang chủ đang được plugin TTCQN Home Emergency Renderer render trực tiếp.
 */

$ud          = wp_upload_dir();
$base        = $ud['baseurl'] . '/2026/04/';

$img_hero    = $base . 'moi-truong-do-thi-so-1-1-scaled.webp';
$header_logo_url = 'https://thongtaccongquangninh.com/wp-content/uploads/2026/04/logo-cong-ty.png';
$header_logo_rendered_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp';
$hero_logo_icon_url = $header_logo_url;
$hero_truck_url = 'https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp';
$hero_worker_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/hero-worker-tho-thong-tac-cong-quang-ninh.webp';
$hero_worker_mobile_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/hero-worker-tho-thong-tac-cong-quang-ninh-640.webp';
$intro_team_image_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/intro-section/intro-nguyen-song-hao-doi-ngu-moi-truong-do-thi-so-1-quang-ninh-ha-long.jpg';
$intro_team_image_mobile_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/intro-section/intro-nguyen-song-hao-doi-ngu-moi-truong-do-thi-so-1-quang-ninh-ha-long-mobile.jpg';
$home_real_video_youtube_id = 'EDJGYWmHqB4';
$home_real_video_url = 'https://www.youtube.com/shorts/' . $home_real_video_youtube_id;
$home_real_video_embed_url = 'https://www.youtube.com/embed/' . $home_real_video_youtube_id;
$home_real_video_thumbnail_url = 'https://i.ytimg.com/vi/' . $home_real_video_youtube_id . '/hqdefault.jpg';
$service_icon_asset_base = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/service-icons/';
$service_badge_icon_url = $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-shield.png';
$service_benefit_icon_urls = [
    'contact'   => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-phone.png',
    'price'     => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-bookmark.png',
    'locations' => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-location.png',
    'warranty'  => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-shield.png',
    'blog'      => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-document.png',
];
$stats_icon_urls = [
    'experience' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/stats-icons/icon-10-nam-kinh-nghiem-hut-be-phot-quang-ninh.png',
    'customers'  => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/stats-icons/icon-5000-khach-hang-moi-truong-quang-ninh.png',
    'areas'      => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/stats-icons/icon-khu-vuc-phuc-vu-quang-ninh.png',
    'rating'     => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/stats-icons/icon-danh-gia-49-sao-dich-vu-quang-ninh.png',
];
$contact_icon_urls = [
    'phone'    => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/contact-icons/icon-goi-dien-thoai-hut-be-phot-quang-ninh.webp',
    'zalo'     => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/contact-icons/icon-zalo-thong-tac-cong-quang-ninh.webp',
    'facebook' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/contact-icons/icon-facebook-thong-tac-cong-ha-long-24h.webp',
    'youtube'  => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/contact-icons/icon-youtube-hut-be-phot-ha-long.webp',
    'tiktok'   => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/contact-icons/icon-tiktok-thong-tac-cong-quang-ninh.webp',
];
$partner_logo_urls = [
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-vinhomes-global-gate-ha-long.webp', 'alt' => 'Logo Vinhomes Global Gate Hạ Long'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-phoenix-legend-ha-long.webp', 'alt' => 'Logo Phoenix Legend Hạ Long'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-masteri-centre-point.webp', 'alt' => 'Logo Masteri Centre Point'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-imperia-holiday-ha-long.webp', 'alt' => 'Logo Imperia Holiday Hạ Long'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-dai-hoc-ha-long-uhl.webp', 'alt' => 'Logo Đại học Hạ Long UHL'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-bia-ha-long.webp', 'alt' => 'Logo Bia Hạ Long'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-muong-thanh-hospitality.webp', 'alt' => 'Logo Mường Thanh Hospitality'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/partner-logos/logo-sun-world-ha-long.webp', 'alt' => 'Logo Sun World Hạ Long'],
];
$price_asset_base = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/price-redesign/';
$price_images = [
    'advisor' => $price_asset_base . 'price-advisor-consulting.webp',
    'truck'   => $price_asset_base . 'price-septic-truck-villa.webp',
    'cong'    => $price_asset_base . 'price-thumb-thong-tac-cong.webp',
    'boncau'  => $price_asset_base . 'price-thumb-thong-tac-bon-cau.webp',
    'hoga'    => $price_asset_base . 'price-thumb-nao-vet-ho-ga.webp',
    'chaurua' => $price_asset_base . 'price-thumb-thong-tac-chau-rua.webp',
];
$process_asset_base = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/process-redesign/';
$process_images = [
    'step1'   => $process_asset_base . 'process-step-1.webp',
    'step2'   => $process_asset_base . 'process-step-2.webp',
    'step3'   => $process_asset_base . 'process-step-3.webp',
    'step4'   => $process_asset_base . 'process-step-4.webp',
    'step5'   => $process_asset_base . 'process-step-5.webp',
];
$region_bg_asset_base = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/region-section/';
$region_bg_images = [
    'desktop' => $region_bg_asset_base . 'phuc-vu-24-7-quang-ninh-bg-desktop.webp',
    'tablet'  => $region_bg_asset_base . 'phuc-vu-24-7-quang-ninh-bg-tablet.webp',
    'mobile'  => $region_bg_asset_base . 'phuc-vu-24-7-quang-ninh-bg-mobile.webp',
];

if (function_exists('plugins_url') && basename(__DIR__) === 'templates') {
    $home_renderer_main_file = dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php';
    $home_renderer_truck_file = dirname(__DIR__) . '/assets/septic-truck-real.webp';
    $home_renderer_worker_file = dirname(__DIR__) . '/assets/hero-worker-tho-thong-tac-cong-quang-ninh.webp';
    $home_renderer_worker_mobile_file = dirname(__DIR__) . '/assets/hero-worker-tho-thong-tac-cong-quang-ninh-640.webp';
    $home_renderer_intro_team_file = dirname(__DIR__) . '/assets/intro-section/intro-nguyen-song-hao-doi-ngu-moi-truong-do-thi-so-1-quang-ninh-ha-long.jpg';
    $home_renderer_intro_team_mobile_file = dirname(__DIR__) . '/assets/intro-section/intro-nguyen-song-hao-doi-ngu-moi-truong-do-thi-so-1-quang-ninh-ha-long-mobile.jpg';
    $home_renderer_logo_file = dirname(__DIR__) . '/assets/logo-cong-ty.png';
    $home_renderer_service_icon_dir = dirname(__DIR__) . '/assets/service-icons';

    if (file_exists($home_renderer_truck_file)) {
        $hero_truck_url = plugins_url('assets/septic-truck-real.webp', $home_renderer_main_file);
    }

    if (file_exists($home_renderer_worker_file)) {
        $hero_worker_url = plugins_url('assets/hero-worker-tho-thong-tac-cong-quang-ninh.webp', $home_renderer_main_file);
    }

    if (file_exists($home_renderer_worker_mobile_file)) {
        $hero_worker_mobile_url = plugins_url('assets/hero-worker-tho-thong-tac-cong-quang-ninh-640.webp', $home_renderer_main_file);
    }

    if (file_exists($home_renderer_intro_team_file)) {
        $intro_team_image_url = plugins_url('assets/intro-section/intro-nguyen-song-hao-doi-ngu-moi-truong-do-thi-so-1-quang-ninh-ha-long.jpg', $home_renderer_main_file);
    }

    if (file_exists($home_renderer_intro_team_mobile_file)) {
        $intro_team_image_mobile_url = plugins_url('assets/intro-section/intro-nguyen-song-hao-doi-ngu-moi-truong-do-thi-so-1-quang-ninh-ha-long-mobile.jpg', $home_renderer_main_file);
    }

    if (file_exists($home_renderer_logo_file)) {
        $hero_logo_icon_url = plugins_url('assets/logo-cong-ty.png', $home_renderer_main_file);
    }

    if (file_exists($home_renderer_service_icon_dir . '/icon-dich-vu-cua-chung-toi-phone.png')) {
        $service_icon_asset_base = plugins_url('assets/service-icons/', $home_renderer_main_file);
        $service_badge_icon_url = $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-shield.png';
        $service_benefit_icon_urls = [
            'contact'   => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-phone.png',
            'price'     => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-bookmark.png',
            'locations' => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-location.png',
            'warranty'  => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-shield.png',
            'blog'      => $service_icon_asset_base . 'icon-dich-vu-cua-chung-toi-document.png',
        ];
    }

    $home_renderer_header_logo = dirname(__DIR__) . '/assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp';
    if (file_exists($home_renderer_header_logo)) {
        $header_logo_rendered_url = plugins_url('assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp', $home_renderer_main_file);
    }

    $stats_icon_urls = [
        'experience' => plugins_url('assets/stats-icons/icon-10-nam-kinh-nghiem-hut-be-phot-quang-ninh.png', $home_renderer_main_file),
        'customers'  => plugins_url('assets/stats-icons/icon-5000-khach-hang-moi-truong-quang-ninh.png', $home_renderer_main_file),
        'areas'      => plugins_url('assets/stats-icons/icon-khu-vuc-phuc-vu-quang-ninh.png', $home_renderer_main_file),
        'rating'     => plugins_url('assets/stats-icons/icon-danh-gia-49-sao-dich-vu-quang-ninh.png', $home_renderer_main_file),
    ];
    $contact_icon_urls = [
        'phone'    => plugins_url('assets/contact-icons/icon-goi-dien-thoai-hut-be-phot-quang-ninh.webp', $home_renderer_main_file),
        'zalo'     => plugins_url('assets/contact-icons/icon-zalo-thong-tac-cong-quang-ninh.webp', $home_renderer_main_file),
        'facebook' => plugins_url('assets/contact-icons/icon-facebook-thong-tac-cong-ha-long-24h.webp', $home_renderer_main_file),
        'youtube'  => plugins_url('assets/contact-icons/icon-youtube-hut-be-phot-ha-long.webp', $home_renderer_main_file),
        'tiktok'   => plugins_url('assets/contact-icons/icon-tiktok-thong-tac-cong-quang-ninh.webp', $home_renderer_main_file),
    ];
    $partner_logo_urls = [
        ['src' => plugins_url('assets/partner-logos/logo-vinhomes-global-gate-ha-long.webp', $home_renderer_main_file), 'alt' => 'Logo Vinhomes Global Gate Hạ Long'],
        ['src' => plugins_url('assets/partner-logos/logo-phoenix-legend-ha-long.webp', $home_renderer_main_file), 'alt' => 'Logo Phoenix Legend Hạ Long'],
        ['src' => plugins_url('assets/partner-logos/logo-masteri-centre-point.webp', $home_renderer_main_file), 'alt' => 'Logo Masteri Centre Point'],
        ['src' => plugins_url('assets/partner-logos/logo-imperia-holiday-ha-long.webp', $home_renderer_main_file), 'alt' => 'Logo Imperia Holiday Hạ Long'],
        ['src' => plugins_url('assets/partner-logos/logo-dai-hoc-ha-long-uhl.webp', $home_renderer_main_file), 'alt' => 'Logo Đại học Hạ Long UHL'],
        ['src' => plugins_url('assets/partner-logos/logo-bia-ha-long.webp', $home_renderer_main_file), 'alt' => 'Logo Bia Hạ Long'],
        ['src' => plugins_url('assets/partner-logos/logo-muong-thanh-hospitality.webp', $home_renderer_main_file), 'alt' => 'Logo Mường Thanh Hospitality'],
        ['src' => plugins_url('assets/partner-logos/logo-sun-world-ha-long.webp', $home_renderer_main_file), 'alt' => 'Logo Sun World Hạ Long'],
    ];

    $home_renderer_price_dir = dirname(__DIR__) . '/assets/price-redesign';
    if (file_exists($home_renderer_price_dir . '/price-advisor-consulting.webp')) {
        $price_images = [
            'advisor' => plugins_url('assets/price-redesign/price-advisor-consulting.webp', $home_renderer_main_file),
            'truck'   => plugins_url('assets/price-redesign/price-septic-truck-villa.webp', $home_renderer_main_file),
            'cong'    => plugins_url('assets/price-redesign/price-thumb-thong-tac-cong.webp', $home_renderer_main_file),
            'boncau'  => plugins_url('assets/price-redesign/price-thumb-thong-tac-bon-cau.webp', $home_renderer_main_file),
            'hoga'    => plugins_url('assets/price-redesign/price-thumb-nao-vet-ho-ga.webp', $home_renderer_main_file),
            'chaurua' => plugins_url('assets/price-redesign/price-thumb-thong-tac-chau-rua.webp', $home_renderer_main_file),
        ];
    }

    $home_renderer_process_dir = dirname(__DIR__) . '/assets/process-redesign';
    if (file_exists($home_renderer_process_dir . '/process-step-1.webp')) {
        $process_images = [
            'step1'   => plugins_url('assets/process-redesign/process-step-1.webp', $home_renderer_main_file),
            'step2'   => plugins_url('assets/process-redesign/process-step-2.webp', $home_renderer_main_file),
            'step3'   => plugins_url('assets/process-redesign/process-step-3.webp', $home_renderer_main_file),
            'step4'   => plugins_url('assets/process-redesign/process-step-4.webp', $home_renderer_main_file),
            'step5'   => plugins_url('assets/process-redesign/process-step-5.webp', $home_renderer_main_file),
        ];
    }

    $home_renderer_region_bg_dir = dirname(__DIR__) . '/assets/region-section';
    if (file_exists($home_renderer_region_bg_dir . '/phuc-vu-24-7-quang-ninh-bg-desktop.webp')) {
        $region_bg_images = [
            'desktop' => plugins_url('assets/region-section/phuc-vu-24-7-quang-ninh-bg-desktop.webp', $home_renderer_main_file),
            'tablet'  => plugins_url('assets/region-section/phuc-vu-24-7-quang-ninh-bg-tablet.webp', $home_renderer_main_file),
            'mobile'  => plugins_url('assets/region-section/phuc-vu-24-7-quang-ninh-bg-mobile.webp', $home_renderer_main_file),
        ];
    }
}

$process_steps = [
    [
        'number'      => '1',
        'title'       => 'Gọi hotline hoặc Zalo',
        'description' => 'Tiếp nhận thông tin, địa chỉ và mức độ khẩn cấp.',
        'image'       => $process_images['step1'],
        'alt'         => 'Kỹ thuật viên tiếp nhận cuộc gọi hỗ trợ khách hàng',
        'icon'        => 'phone',
    ],
    [
        'number'      => '2',
        'title'       => 'Hỏi nhanh tình trạng',
        'description' => 'Xác định điểm tắc, mùi hôi, trào ngược và nhu cầu xử lý.',
        'image'       => $process_images['step2'],
        'alt'         => 'Kỹ thuật viên hỏi nhanh tình trạng tắc nghẽn',
        'icon'        => 'chat',
    ],
    [
        'number'      => '3',
        'title'       => 'Báo phương án',
        'description' => 'Thông báo thiết bị cần dùng và thời gian có mặt dự kiến.',
        'image'       => $process_images['step3'],
        'alt'         => 'Kỹ thuật viên tư vấn phương án xử lý',
        'icon'        => 'clipboard',
    ],
    [
        'number'      => '4',
        'title'       => 'Kiểm tra và báo giá',
        'description' => 'Khảo sát thực tế, chốt chi phí trước khi thi công.',
        'image'       => $process_images['step4'],
        'alt'         => 'Kỹ thuật viên kiểm tra và báo giá trước thi công',
        'icon'        => 'check',
    ],
    [
        'number'      => '5',
        'title'       => 'Thi công và bàn giao',
        'description' => 'Xử lý, vệ sinh khu vực, xả thử và ghi rõ bảo hành.',
        'image'       => $process_images['step5'],
        'alt'         => 'Kỹ thuật viên thi công và bàn giao khu vực',
        'icon'        => 'shield',
    ],
];

$process_benefits = [
    [
        'icon'        => 'clock',
        'title'       => 'Tiếp nhận 05:00-22:00',
        'description' => 'Có mặt nhanh chóng',
    ],
    [
        'icon'        => 'worker',
        'title'       => 'Kỹ thuật có chuyên môn',
        'description' => 'Nhiều năm kinh nghiệm',
    ],
    [
        'icon'        => 'truck',
        'title'       => 'Thiết bị hiện đại',
        'description' => 'Xử lý mọi sự cố',
    ],
    [
        'icon'        => 'shield',
        'title'       => 'Bảo hành rõ ràng',
        'description' => 'Rõ ràng, minh bạch',
    ],
];

// Service card images
$img_svc1    = $base . 'service-hut-be-phot-quang-ninh.webp';
$img_svc2    = $base . 'service-thong-tac-cong-quang-ninh.webp';
$img_svc3    = $base . 'service-thong-tac-bon-cau-quang-ninh.webp';
$img_svc4    = $base . 'service-thong-tac-chau-rua-quang-ninh.webp';
$img_svc5    = $base . 'service-nao-vet-ho-ga-quang-ninh.webp';
$img_svc6    = $base . 'service-xu-ly-mui-hoi-quang-ninh.webp';
if (function_exists('plugins_url') && basename(__DIR__) === 'templates') {
    $home_renderer_main_file = dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php';
    $home_renderer_service_dir = dirname(__DIR__) . '/assets/service-images';
    $home_renderer_service_images = [
        'svc1' => 'service-hut-be-phot-quang-ninh-xe-bon-chuyen-dung.webp',
        'svc2' => 'service-thong-tac-cong-quang-ninh-may-chuyen-dung.webp',
        'svc3' => 'service-thong-tac-bon-cau-quang-ninh-khong-duc-pha.webp',
        'svc4' => 'service-thong-tac-chau-rua-quang-ninh.webp',
        'svc5' => 'service-nao-vet-ho-ga-quang-ninh-24-7.webp',
        'svc6' => 'service-xu-ly-mui-hoi-quang-ninh.webp',
    ];
    if (file_exists($home_renderer_service_dir . '/' . $home_renderer_service_images['svc1'])) {
        $img_svc1 = plugins_url('assets/service-images/' . $home_renderer_service_images['svc1'], $home_renderer_main_file);
        $img_svc2 = plugins_url('assets/service-images/' . $home_renderer_service_images['svc2'], $home_renderer_main_file);
        $img_svc3 = plugins_url('assets/service-images/' . $home_renderer_service_images['svc3'], $home_renderer_main_file);
        $img_svc4 = plugins_url('assets/service-images/' . $home_renderer_service_images['svc4'], $home_renderer_main_file);
        $img_svc5 = plugins_url('assets/service-images/' . $home_renderer_service_images['svc5'], $home_renderer_main_file);
        $img_svc6 = plugins_url('assets/service-images/' . $home_renderer_service_images['svc6'], $home_renderer_main_file);
    }
}

$handbook_image_files = [
    'cong'      => 'cam-nang-thong-tac-cong-gieng-day.webp',
    'hutbephot' => 'cam-nang-hut-be-phot-cao-xanh.webp',
    'boncau'    => 'cam-nang-nghet-bon-cau-bai-chay.webp',
    'muihoi'    => 'cam-nang-mui-hoi-nha-ve-sinh-hong-gai.webp',
    'camera'    => 'cam-nang-noi-soi-camera-duong-ong.webp',
    'ngoaitroi' => 'cam-nang-thoat-nuoc-ngoai-troi-hai-ha.webp',
];
$handbook_asset_base = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/handbook-images/';
$handbook_images = [];
foreach ($handbook_image_files as $handbook_image_key => $handbook_image_file) {
    $handbook_images[$handbook_image_key] = $handbook_asset_base . $handbook_image_file;
}
if (function_exists('plugins_url') && basename(__DIR__) === 'templates') {
    $home_renderer_main_file = dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php';
    $home_renderer_handbook_dir = dirname(__DIR__) . '/assets/handbook-images';
    foreach ($handbook_image_files as $handbook_image_key => $handbook_image_file) {
        if (file_exists($home_renderer_handbook_dir . '/' . $handbook_image_file)) {
            $handbook_images[$handbook_image_key] = plugins_url('assets/handbook-images/' . $handbook_image_file, $home_renderer_main_file);
        }
    }
}

$project_images = [
    'hut_be_phot_ha_long' => [
        'src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-hut-be-phot-ho-gia-dinh-ha-long.webp',
        'alt' => 'Hút bể phốt biệt thự tại Hạ Long bằng xe chuyên dụng',
    ],
    'chau_rua_bai_chay' => [
        'src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-thong-tac-chau-rua-bai-chay.webp',
        'alt' => 'Thông tắc chậu rửa nhà hàng tại Bãi Cháy',
    ],
    'ho_ga_cam_pha' => [
        'src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-nao-vet-ho-ga-cam-pha.webp',
        'alt' => 'Nạo vét hố ga khu dân cư tại Cẩm Phả',
    ],
    'bon_cau_uong_bi' => [
        'src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-thong-tac-bon-cau-uong-bi.webp',
        'alt' => 'Thông tắc bồn cầu nhà trọ tại Uông Bí',
    ],
    'mui_hoi_quang_yen' => [
        'src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-xu-ly-mui-hoi-quang-yen.webp',
        'alt' => 'Xử lý mùi hôi nhà vệ sinh tại Quảng Yên',
    ],
    'cong_dong_trieu' => [
        'src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-thong-tac-cong-dong-trieu.webp',
        'alt' => 'Thông tắc cống thoát sàn tại Đông Triều bằng máy lò xo',
    ],
];

$completed_project_filters = [
    ['key' => 'all', 'label' => 'Tất cả', 'icon' => 'grid'],
    ['key' => 'hut-be-phot', 'label' => 'Hút bể phốt', 'icon' => 'truck'],
    ['key' => 'thong-tac-cong', 'label' => 'Thông tắc cống', 'icon' => 'pipe'],
    ['key' => 'bon-cau', 'label' => 'Bồn cầu', 'icon' => 'toilet'],
    ['key' => 'ho-ga', 'label' => 'Hố ga', 'icon' => 'manhole'],
    ['key' => 'chau-rua', 'label' => 'Chậu rửa', 'icon' => 'sink'],
    ['key' => 'mui-hoi', 'label' => 'Xử lý mùi hôi', 'icon' => 'leaf'],
];

$completed_projects = [
    [
        'category'    => 'hut-be-phot',
        'title'       => 'Hút bể phốt biệt thự tại Hạ Long',
        'area'        => 'Hạ Long',
        'service'     => 'Hút bể phốt',
        'description' => 'Xe hút bể phốt chuyên dụng thi công tận nơi, xử lý nhanh, hạn chế ảnh hưởng sinh hoạt.',
        'result'      => 'Bể thoát tốt, khu vực sạch sẽ, bàn giao trong ngày.',
        'image'       => $project_images['hut_be_phot_ha_long']['src'],
        'alt'         => $project_images['hut_be_phot_ha_long']['alt'],
        'icon'        => 'truck',
        'url'         => home_url('/du-an-hut-be-phot-ho-gia-dinh-ha-long/'),
    ],
    [
        'category'    => 'chau-rua',
        'title'       => 'Thông tắc chậu rửa nhà hàng',
        'area'        => 'Bãi Cháy',
        'service'     => 'Thông tắc chậu rửa',
        'description' => 'Xử lý đường ống thoát nước chậu rửa bị nghẹt do dầu mỡ, cặn bẩn và rác nhỏ.',
        'result'      => 'Nước thoát nhanh, giảm mùi hôi, hoạt động ổn định.',
        'image'       => $project_images['chau_rua_bai_chay']['src'],
        'alt'         => $project_images['chau_rua_bai_chay']['alt'],
        'icon'        => 'sink',
        'url'         => home_url('/du-an-thong-tac-chau-rua-bai-chay/'),
    ],
    [
        'category'    => 'ho-ga',
        'title'       => 'Nạo vét hố ga khu dân cư',
        'area'        => 'Cẩm Phả',
        'service'     => 'Nạo vét hố ga',
        'description' => 'Nạo vét bùn thải, khơi thông dòng chảy và xử lý tình trạng ứ đọng nước.',
        'result'      => 'Hố ga thông thoáng, giảm nguy cơ ngập úng.',
        'image'       => $project_images['ho_ga_cam_pha']['src'],
        'alt'         => $project_images['ho_ga_cam_pha']['alt'],
        'icon'        => 'manhole',
        'url'         => home_url('/du-an-nao-vet-ho-ga-cam-pha/'),
    ],
    [
        'category'    => 'bon-cau',
        'title'       => 'Thông tắc bồn cầu nhà trọ',
        'area'        => 'Uông Bí',
        'service'     => 'Thông tắc bồn cầu',
        'description' => 'Xử lý bồn cầu nghẹt, nước rút chậm bằng máy chuyên dụng, hạn chế đục phá.',
        'result'      => 'Bồn cầu thoát tốt, khách được hướng dẫn cách hạn chế tái nghẹt.',
        'image'       => $project_images['bon_cau_uong_bi']['src'],
        'alt'         => $project_images['bon_cau_uong_bi']['alt'],
        'icon'        => 'toilet',
        'url'         => home_url('/du-an-thong-tac-bon-cau-uong-bi/'),
    ],
    [
        'category'    => 'mui-hoi',
        'title'       => 'Xử lý mùi hôi nhà vệ sinh',
        'area'        => 'Quảng Yên',
        'service'     => 'Xử lý mùi hôi',
        'description' => 'Kiểm tra nguyên nhân gây mùi, xử lý đường thoát sàn và khu vực bồn cầu.',
        'result'      => 'Mùi hôi giảm rõ, nhà vệ sinh thông thoáng hơn.',
        'image'       => $project_images['mui_hoi_quang_yen']['src'],
        'alt'         => $project_images['mui_hoi_quang_yen']['alt'],
        'icon'        => 'leaf',
        'url'         => home_url('/du-an-xu-ly-mui-hoi-quang-yen/'),
    ],
    [
        'category'    => 'thong-tac-cong',
        'title'       => 'Thông tắc cống nhà dân',
        'area'        => 'Đông Triều',
        'service'     => 'Thông tắc cống',
        'description' => 'Xử lý cống thoát sàn bị nghẹt, thoát nước chậm và bốc mùi trong sinh hoạt.',
        'result'      => 'Nước thoát nhanh, khu vực thi công được vệ sinh trước khi bàn giao.',
        'image'       => $project_images['cong_dong_trieu']['src'],
        'alt'         => $project_images['cong_dong_trieu']['alt'],
        'icon'        => 'pipe',
        'url'         => home_url('/du-an-thong-tac-cong-dong-trieu/'),
    ],
];

$project_trust_items = [
    ['title' => 'HỒ SƠ CÔNG TRÌNH', 'text' => 'Hình ảnh thi công rõ bối cảnh', 'icon' => 'camera'],
    ['title' => 'THIẾT BỊ CHUYÊN DỤNG', 'text' => 'Xe hút bể phốt hiện đại', 'icon' => 'truck'],
    ['title' => 'BÁO GIÁ RÕ RÀNG', 'text' => 'Minh bạch, không phát sinh', 'icon' => 'invoice'],
    ['title' => 'BÀN GIAO SẠCH SẼ', 'text' => 'Vệ sinh sau thi công', 'icon' => 'shield'],
];

if (!function_exists('ttcqn_home_project_icon')) {
function ttcqn_home_project_icon(string $icon): void
{
    $icons = [
        'grid' => '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
        'truck' => '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
        'pipe' => '<path d="M7 5v8a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V5"/><path d="M7 9h10"/><path d="M10 5h4"/>',
        'toilet' => '<path d="M7 4h10v8a5 5 0 0 1-5 5H9a2 2 0 0 0-2 2v1h10"/><path d="M9 8h6"/><path d="M17 4h2v5"/>',
        'manhole' => '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4v16M7 7l10 10M17 7 7 17"/>',
        'sink' => '<path d="M5 13h14v2a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z"/><path d="M12 13V5a3 3 0 0 1 6 0"/><path d="M9 20v2h6v-2"/>',
        'leaf' => '<path d="M20 4C10 4 5 9 5 17c0 2 1 3 3 3 8 0 12-8 12-16Z"/><path d="M5 20c4-6 8-9 15-16"/>',
        'camera' => '<path d="M4 8h4l2-3h4l2 3h4v11H4z"/><circle cx="12" cy="14" r="3"/>',
        'invoice' => '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/><path d="m14 16 1 1 3-3"/>',
        'shield' => '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-5"/>',
        'phone' => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
        'chevron' => '<path d="m6 9 6 6 6-6"/>',
    ];
    $path = $icons[$icon] ?? $icons['grid'];
    echo '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' . $path . '</svg>';
}
}

if (!function_exists('ttcqn_home_process_icon')) {
function ttcqn_home_process_icon(string $icon): void
{
    $icons = [
        'phone'     => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
        'chat'      => '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/><path d="M8 10h8M8 14h5"/>',
        'clipboard' => '<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 4h6v4H9z"/><path d="M8 12h8M8 16h6"/>',
        'check'     => '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
        'shield'    => '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-5"/>',
        'clock'     => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'worker'    => '<path d="M8 9a4 4 0 0 1 8 0"/><path d="M7 9h10"/><path d="M8 12a4 4 0 0 0 8 0"/><path d="M4 21a8 8 0 0 1 16 0"/>',
        'truck'     => '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
        'zalo'      => '<path d="M5 6h14v12H5z"/><path d="m8 14 4-4H8"/><path d="M13 14h3M16 14v-4"/>',
    ];
    $path = $icons[$icon] ?? $icons['check'];
    echo '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' . $path . '</svg>';
}
}

// Slider đối tác — ảnh ký kết thực tế, tên chuẩn SEO, cập nhật 2026-05-29
$slider_images = [
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/ky-ket-doi-tac-muong-thanh-hospitality-ha-long-moi-truong-do-thi-so-1.webp', 'alt' => 'Ký kết hợp tác chiến lược giữa Môi Trường Đô Thị Số 1 và Mường Thanh Hospitality Hạ Long'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/ky-ket-doi-tac-flc-hotels-resorts-quang-ninh-moi-truong-do-thi-so-1.webp',    'alt' => 'Ký kết hợp tác dịch vụ môi trường với FLC Hotels & Resorts Quảng Ninh'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/ky-ket-hop-tac-chien-luoc-wyndham-legend-ha-long-moi-truong-quang-ninh.webp',  'alt' => 'Lễ ký kết hợp tác chiến lược toàn diện giữa Wyndham Legend Hạ Long và Môi Trường Đô Thị Quảng Ninh'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/ky-ket-doi-tac-bim-group-dich-vu-ve-sinh-moi-truong-quang-ninh.webp',          'alt' => 'Ký kết hợp tác dịch vụ hút bể phốt và vệ sinh môi trường với BIM Group Quảng Ninh'],
];

// Slider giới thiệu công ty — 6 ảnh đội ngũ, cập nhật 2026-05-29
$intro_slider_images = [
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/bien-hieu-cong-ty-moi-truong-do-thi-so-1-quang-ninh-ha-long.webp',               'alt' => 'Biển hiệu cổng Công ty Môi Trường Đô Thị Số 1 Quảng Ninh tại Hạ Long'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/doi-ngu-ky-thuat-vien-hut-be-phot-thong-cong-ha-long-quang-ninh-1.webp',         'alt' => 'Đội ngũ kỹ thuật viên hút bể phốt và thông tắc cống tại Hạ Long Quảng Ninh'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/giam-doc-nguyen-song-hao-moi-truong-do-thi-so-1-quang-ninh.webp',                'alt' => 'Giám đốc Nguyễn Song Hào – Công ty Môi Trường Đô Thị Số 1 Quảng Ninh'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/doi-ngu-chuyen-gia-moi-truong-do-thi-quang-ninh-truoc-van-phong.webp',           'alt' => 'Đội ngũ chuyên gia Môi Trường Đô Thị Số 1 Quảng Ninh trước văn phòng công ty'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/doi-ngu-ky-thuat-moi-truong-do-thi-quang-ninh-san-sang-phuc-vu-24-7.webp',      'alt' => 'Đội ngũ kỹ thuật Môi Trường Đô Thị Số 1 Quảng Ninh sẵn sàng tiếp nhận hằng ngày'],
    ['src' => 'https://thongtaccongquangninh.com/wp-content/uploads/2026/05/xe-hut-be-phot-isuzu-chuyen-dung-moi-truong-do-thi-so-1-quang-ninh.webp',       'alt' => 'Xe hút bể phốt Isuzu chuyên dụng Công ty Môi Trường Đô Thị Số 1 Quảng Ninh'],
];

// CTA chính
$primary_hotline_display = '0963.953.533 - 0931.156.756';
$primary_hotline_href    = 'tel:0963953533';
$secondary_hotline_href  = 'tel:0931156756';
$zalo_url                = 'https://zalo.me/0931156756';
$service_zalo_url        = 'https://zalo.me/0931156756';
$facebook_url            = 'https://www.facebook.com/moitruongquangninh';
$youtube_url             = 'https://www.youtube.com/@moitruongdothiso1quangninh';
$tiktok_url              = 'https://www.tiktok.com/@thongtaccongquangninh';
$locations_page_url      = home_url('/he-thong-co-so-quang-ninh/');
$price_page_url          = home_url('/bang-gia/');
$home_internal_links     = [
    'home' => home_url('/'),
    'contact' => home_url('/lien-he/'),
    'about' => home_url('/gioi-thieu/'),
    'profile_nguyen_song_hao' => home_url('/nguyen-song-hao/'),
    'price' => home_url('/bang-gia/'),
    'blog' => home_url('/blog/'),
    'warranty' => home_url('/chinh-sach-bao-hanh/'),
    'locations' => home_url('/he-thong-co-so-quang-ninh/'),
    'services' => [
        'hut_be_phot' => home_url('/hut-be-phot-quang-ninh/'),
        'thong_tac_cong' => home_url('/thong-tac-cong-quang-ninh/'),
        'bon_cau' => home_url('/thong-tac-bon-cau-quang-ninh/'),
        'chau_rua' => home_url('/thong-tac-chau-rua-quang-ninh/'),
        'ho_ga' => home_url('/nao-vet-ho-ga-quang-ninh/'),
        'mui_hoi' => home_url('/xu-ly-mui-hoi-quang-ninh/'),
    ],
    'areas' => [
        'ha_long' => home_url('/hut-be-phot-ha-long/'),
        'cam_pha' => home_url('/hut-be-phot-cam-pha/'),
        'uong_bi' => home_url('/hut-be-phot-uong-bi/'),
        'mong_cai' => home_url('/hut-be-phot-mong-cai/'),
        'dong_trieu' => home_url('/hut-be-phot-dong-trieu/'),
        'quang_yen' => home_url('/hut-be-phot-quang-yen/'),
        'van_don' => home_url('/hut-be-phot-van-don/'),
        'bai_chay' => home_url('/hut-be-phot-bai-chay/'),
    ],
    'external' => [
        'qn_tnmt' => 'https://www.quangninh.gov.vn/so/sotainguyenmt/Trang/default.aspx',
        'tnmt_news' => 'https://baotainguyenmoitruong.vn/',
    ],
];

$office_ha_long_address = defined('TTCQN_HOME_OFFICE_HA_LONG_ADDRESS') ? TTCQN_HOME_OFFICE_HA_LONG_ADDRESS : '111 Cái Lân, Bãi Cháy, Quảng Ninh';
$office_ha_long_map_url = defined('TTCQN_HOME_OFFICE_HA_LONG_MAP_URL') ? TTCQN_HOME_OFFICE_HA_LONG_MAP_URL : 'https://www.google.com/maps/search/?api=1&query=20.962384198791902%2C107.05220536959965';
$office_ha_long_map_embed = defined('TTCQN_HOME_OFFICE_HA_LONG_MAP_EMBED') ? TTCQN_HOME_OFFICE_HA_LONG_MAP_EMBED : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.4385482896339!2d107.05220536959965!3d20.962384198791902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad947ef4a1ff%3A0xb82f0e88497fbc1c!2zSMO6dCBC4buDIFBo4buRdCAtIE3DtGkgdHLGsOG7nW5nIMSRw7QgdGjhu4sgc-G7kSAxIFF14bqjbmcgTmluaA!5e0!3m2!1svi!2s!4v1781835498222!5m2!1svi!2s';

$home_google_maps = [
    [
        'title' => 'Bản đồ văn phòng Hạ Long - Môi Trường Đô Thị Số 1',
        'label' => 'Văn phòng Hạ Long',
        'address' => $office_ha_long_address,
        'desc' => 'Đầu mối tiếp nhận yêu cầu tại Hạ Long và điều phối kỹ thuật phục vụ toàn tỉnh Quảng Ninh.',
        'src' => $office_ha_long_map_embed,
        'map_url' => $office_ha_long_map_url,
    ],
];

$home_service_cards = [
    [
        'title' => 'Hút bể phốt Quảng Ninh',
        'excerpt' => 'Xe hút chuyên dụng xử lý bể đầy, bể trào, bể lâu ngày chưa hút cho nhà dân, nhà hàng và cơ sở kinh doanh.',
        'href' => $home_internal_links['services']['hut_be_phot'],
        'image' => $img_svc1,
        'alt' => 'Xe hút bể phốt phục vụ tại Quảng Ninh',
        'cta' => 'Xem chi tiết hút bể phốt',
        'badge' => 'Từ 200.000đ',
    ],
    [
        'title' => 'Thông tắc cống Quảng Ninh',
        'excerpt' => 'Xử lý cống nghẹt, nước trào ngược, thoát sàn bốc mùi bằng máy lò xo và thiết bị phù hợp hiện trạng.',
        'href' => $home_internal_links['services']['thong_tac_cong'],
        'image' => $img_svc2,
        'alt' => 'Kỹ thuật viên thông tắc cống tại Quảng Ninh',
        'cta' => 'Xem dịch vụ thông tắc cống',
        'badge' => 'Không đục phá',
    ],
    [
        'title' => 'Thông tắc bồn cầu Quảng Ninh',
        'excerpt' => 'Xử lý bồn cầu rút chậm, nghẹt giấy, trào nước và mùi hôi trong nhà vệ sinh, ưu tiên không đục phá.',
        'href' => $home_internal_links['services']['bon_cau'],
        'image' => $img_svc3,
        'alt' => 'Thông tắc bồn cầu không đục phá tại Quảng Ninh',
        'cta' => 'Xem chi tiết bồn cầu',
        'badge' => 'Từ 100.000đ',
    ],
    [
        'title' => 'Thông tắc chậu rửa Quảng Ninh',
        'excerpt' => 'Làm thông chậu rửa, lavabo, bồn rửa bếp bị tắc do dầu mỡ, tóc, cặn bẩn và đường ống thoát chậm.',
        'href' => $home_internal_links['services']['chau_rua'],
        'image' => $img_svc4,
        'alt' => 'Thông tắc chậu rửa và lavabo tại Quảng Ninh',
        'cta' => 'Xem dịch vụ chậu rửa',
        'badge' => 'Nhà bếp, lavabo',
    ],
    [
        'title' => 'Nạo vét hố ga Quảng Ninh',
        'excerpt' => 'Nạo vét bùn, rác, cặn lắng trong hố ga, khơi thông tuyến thoát nước và giảm mùi hôi khu vực.',
        'href' => $home_internal_links['services']['ho_ga'],
        'image' => $img_svc5,
        'alt' => 'Nạo vét hố ga và khơi thông thoát nước tại Quảng Ninh',
        'cta' => 'Xem dịch vụ nạo vét hố ga',
        'badge' => 'Từ 300.000đ',
    ],
    [
        'title' => 'Xử lý mùi hôi cống',
        'excerpt' => 'Kiểm tra nguồn mùi từ cống, hố ga, thoát sàn, bể phốt và đề xuất phương án xử lý đúng nguyên nhân.',
        'href' => $home_internal_links['services']['mui_hoi'],
        'image' => $img_svc6,
        'alt' => 'Xử lý mùi hôi cống và nhà vệ sinh tại Quảng Ninh',
        'cta' => 'Xem cách xử lý mùi hôi',
        'badge' => 'Từ 500.000đ',
    ],
];

$faq_items = [
    [
        'question' => 'Giá hút bể phốt tại Quảng Ninh bao nhiêu?',
        'answer'   => 'Từ 200.000đ đến 2.000.000đ tùy khối lượng bể và khoảng cách. Chúng tôi khảo sát và báo giá miễn phí trước khi thi công.',
    ],
    [
        'question' => 'Thông tắc bồn cầu có phải đục phá không?',
        'answer'   => 'Không. Chúng tôi sử dụng máy thông tắc chuyên dụng và công nghệ cao áp để xử lý nhanh 15 đến 30 phút mà không cần đục phá.',
    ],
    [
        'question' => 'Có hỗ trợ sát giờ đóng hoặc ngoài khung tiếp nhận không?',
        'answer'   => 'Đơn vị tiếp nhận trong khung giờ 05:00-22:00 hằng ngày. Nếu phát sinh sự cố sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi hotline để được xác nhận khả năng điều phối thực tế.',
    ],
    [
        'question' => 'Thời gian có mặt sau khi gọi bao lâu?',
        'answer'   => 'Tại Hạ Long khoảng 15 đến 20 phút. Cẩm Phả và Uông Bí khoảng 25 đến 35 phút. Khu vực xa hơn sẽ được báo thời gian cụ thể khi tiếp nhận.',
    ],
    [
        'question' => 'Có bảo hành sau khi xử lý không?',
        'answer'   => 'Có. Chính sách bảo hành từ 6 đến 24 tháng tùy dịch vụ. Nếu không xử lý được theo cam kết sẽ hoàn tiền.',
    ],
    [
        'question' => 'Phục vụ khu vực nào tại Quảng Ninh?',
        'answer'   => 'Phục vụ toàn tỉnh Quảng Ninh gồm Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn, Tiên Yên và các khu vực lân cận.',
    ],
];

$home_schema_graph = ttcqn_schema_home_graph($faq_items);
if (isset($home_schema_graph['@graph']) && is_array($home_schema_graph['@graph'])) {
    $home_schema_graph['@graph'][] = [
        '@type'        => 'VideoObject',
        '@id'          => home_url('/#video-thuc-te-ha-long'),
        'name'         => 'Video khảo sát dịch vụ môi trường tại Hạ Long',
        'description'  => 'Video thực tế quá trình tiếp nhận và khảo sát dịch vụ môi trường của Môi Trường Đô Thị Số 1 Quảng Ninh tại Hạ Long. Hotline 0963.953.533.',
        'thumbnailUrl' => [$home_real_video_thumbnail_url],
        'uploadDate'   => '2026-05-30T10:30:00+07:00',
        'duration'     => 'PT31S',
        'embedUrl'     => $home_real_video_embed_url,
        'url'          => $home_real_video_url,
        'inLanguage'   => 'vi-VN',
        'publisher'    => [
            '@id' => ttcqn_schema_business_id(),
        ],
        'mainEntityOfPage' => [
            '@id' => home_url('/'),
        ],
    ];
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<?php wp_head(); ?>
<link rel="preload" as="image" href="<?php echo esc_url($header_logo_rendered_url); ?>">
<link rel="preload" as="image" href="<?php echo esc_url($hero_worker_mobile_url); ?>" imagesrcset="<?php echo esc_url($hero_worker_mobile_url); ?> 640w, <?php echo esc_url($hero_worker_url); ?> 900w" imagesizes="(max-width: 767px) 220px, 300px" fetchpriority="high">
<script type="application/ld+json" data-ttcqn-home-schema="1"><?php echo wp_json_encode($home_schema_graph, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT); ?></script>
<link rel="stylesheet" id="ttcqn-home-css" href="<?php echo esc_url(plugins_url('assets/ttcqn-home.min.css', $home_renderer_main_file)); ?>?ver=<?php echo esc_attr(TTCQN_HOME_EMERGENCY_VERSION); ?>">
</head>
<body <?php body_class('home-page-direct'); ?>>
<?php wp_body_open(); ?>

<!-- ========== NAVBAR ========== -->
<header class="ttcqn-header" role="banner">
<nav class="home-nav ttcqn-nav" role="navigation" aria-label="Điều hướng chính">
  <div class="nav-inner ttcqn-nav-inner">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-logo seo-header-logo ttcqn-brand" aria-label="Trang chủ Môi Trường Đô Thị Số 1 Quảng Ninh">
      <img src="<?php echo esc_url($header_logo_rendered_url); ?>" alt="Môi Trường Đô Thị Số 1 Quảng Ninh - phục vụ nhanh, sạch sẽ" class="ttcqn-brand-full-logo" width="356" height="94" loading="eager" fetchpriority="high" decoding="async">
    </a>
    <button class="nav-toggle ttcqn-nav-toggle" id="navToggle" type="button" aria-label="Mở menu" aria-expanded="false">☰</button>
    <a class="ttcqn-mobile-call" href="<?php echo esc_url($primary_hotline_href); ?>" aria-label="Gọi hotline 0963.953.533">
      <svg class="ttcqn-phone-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2C10 20.6 3.4 14 2.5 4.2A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>
    </a>
    <ul class="nav-menu ttcqn-nav-menu" id="navMenu" role="menubar">
      <li role="none"><a href="<?php echo esc_url(home_url('/')); ?>" role="menuitem">Trang chủ</a></li>
      <li class="has-sub" role="none">
        <button type="button" class="sub-toggle" role="menuitem" aria-haspopup="true" aria-expanded="false">Dịch vụ <span class="arrow">⌄</span></button>
        <ul class="sub-menu" role="menu">
	          <li><a href="<?php echo esc_url($home_internal_links['services']['hut_be_phot']); ?>" role="menuitem">Hút bể phốt</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['services']['thong_tac_cong']); ?>" role="menuitem">Thông tắc cống</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['services']['bon_cau']); ?>" role="menuitem">Thông tắc bồn cầu</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['services']['ho_ga']); ?>" role="menuitem">Nạo vét hố ga</a></li>
        </ul>
      </li>
      <li class="has-sub" role="none">
        <button type="button" class="sub-toggle" role="menuitem" aria-haspopup="true" aria-expanded="false">Khu vực <span class="arrow">⌄</span></button>
        <ul class="sub-menu" role="menu">
	          <li><a href="<?php echo esc_url($home_internal_links['areas']['ha_long']); ?>" role="menuitem">Hạ Long</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['areas']['cam_pha']); ?>" role="menuitem">Cẩm Phả</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['areas']['uong_bi']); ?>" role="menuitem">Uông Bí</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['areas']['quang_yen']); ?>" role="menuitem">Quảng Yên</a></li>
	          <li><a href="<?php echo esc_url($home_internal_links['areas']['van_don']); ?>" role="menuitem">Vân Đồn</a></li>
        </ul>
      </li>
      <li role="none"><a href="#du-an" role="menuitem">Dự án</a></li>
      <li role="none"><a href="#doi-tac" role="menuitem">Đối tác</a></li>
	      <li role="none"><a href="<?php echo esc_url($home_internal_links['price']); ?>" role="menuitem">Bảng giá</a></li>
	      <li role="none"><a href="<?php echo esc_url($home_internal_links['blog']); ?>" role="menuitem">Blog</a></li>
	      <li role="none"><a href="<?php echo esc_url($home_internal_links['contact']); ?>" role="menuitem">Liên hệ</a></li>
      <li role="none"><a href="<?php echo esc_url($primary_hotline_href); ?>" class="nav-cta ttcqn-header-call" role="menuitem" aria-label="Gọi hotline 0963.953.533 hoặc 0931.156.756"><svg class="ttcqn-phone-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2C10 20.6 3.4 14 2.5 4.2A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg> <?php echo esc_html($primary_hotline_display); ?></a></li>
    </ul>
  </div>
</nav>
</header>

<main id="main-content">

<!-- ========== HERO ========== -->
<?php
echo ttcqn_seo_hero_render([
    'title' => 'HÚT BỂ PHỐT, THÔNG TẮC CỐNG QUẢNG NINH',
    'description' => 'Nước trào ngược, bồn cầu rút chậm, cống bốc mùi hoặc bể phốt đầy? Gọi số điện thoại và khu vực, đội kỹ thuật sẽ gọi lại nhanh để báo hướng xử lý phù hợp.',
    'formTitle' => 'Nhận gọi lại miễn phí',
    'formDescription' => 'Chỉ cần số điện thoại và khu vực, form này ưu tiên các ca xử lý ngay trong ngày.',
]);
?>

<!-- START: SECTION GIỚI THIỆU CÔNG TY (TTCQN INTRO SECTION) -->


<section class="ttcqn-intro-section">
  <div class="ttcqn-intro-container">
    <div class="ttcqn-intro-grid">
      
      <!-- CỘT TRÁI: NỘI DUNG GIỚI THIỆU -->
      <div class="ttcqn-intro-content-col">
        <span class="ttcqn-intro-badge">VỀ MÔI TRƯỜNG ĐÔ THỊ SỐ 1</span>
        <h2 class="ttcqn-intro-title">Đơn vị thông tắc cống, hút bể phốt tại Quảng Ninh</h2>
        
        <div class="ttcqn-intro-desc-wrap">
          <p class="ttcqn-intro-desc-main">
            Công ty Môi Trường Đô Thị Số 1 Quảng Ninh cung cấp <a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['services']['hut_be_phot']); ?>">dịch vụ hút bể phốt</a>, <a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['services']['thong_tac_cong']); ?>">thông tắc cống</a>, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi cho hộ gia đình, nhà hàng, khách sạn, khu dân cư và cơ sở kinh doanh trên toàn tỉnh Quảng Ninh.
          </p>
          <p class="ttcqn-intro-desc-sub">
            Dưới sự định hướng của Nguyễn Song Hào – Founder công ty, cử nhân Đại học Bách Khoa Hà Nội, đơn vị tập trung xây dựng <a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['about']); ?>">đội ngũ kỹ thuật</a> có chuyên môn, làm việc đúng quy trình, khảo sát rõ tình trạng, <a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['price']); ?>">báo giá minh bạch</a> và xử lý sự cố theo hướng an toàn, gọn sạch.
          </p>
        </div>

        <!-- 4 ĐIỂM MẠNH DẠNG CARD -->
        <div class="ttcqn-intro-features-grid">
          
          <div class="ttcqn-intro-feature-card">
            <div class="ttcqn-intro-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="ttcqn-intro-feature-info">
              <h3>Đội ngũ kỹ thuật có chuyên môn</h3>
              <p>Kỹ thuật viên được đào tạo về xử lý thoát nước, hút bể phốt, thông tắc cống và an toàn môi trường.</p>
            </div>
          </div>

          <div class="ttcqn-intro-feature-card">
            <div class="ttcqn-intro-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div class="ttcqn-intro-feature-info">
              <h3>Khảo sát và báo giá rõ ràng</h3>
              <p>Kiểm tra tình trạng thực tế, tư vấn phương án phù hợp và thống nhất chi phí trước khi thi công.</p>
            </div>
          </div>

          <div class="ttcqn-intro-feature-card">
            <div class="ttcqn-intro-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div class="ttcqn-intro-feature-info">
              <h3>Thiết bị xử lý chuyên dụng</h3>
              <p>Sử dụng máy lò xo, máy áp lực cao, xe hút chuyên dụng và dụng cụ phù hợp từng hạng mục.</p>
            </div>
          </div>

          <div class="ttcqn-intro-feature-card">
            <div class="ttcqn-intro-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div class="ttcqn-intro-feature-info">
              <h3>Phục vụ nhanh tại Quảng Ninh</h3>
              <p>Hỗ trợ tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Quảng Yên, Đông Triều, Vân Đồn và toàn tỉnh.</p>
            </div>
          </div>

        </div>

        <!-- MINI PROFILE FOUNDER -->
        <div class="ttcqn-intro-founder-card">
          <div class="ttcqn-intro-founder-avatar">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
          <div class="ttcqn-intro-founder-meta">
            <h4 class="ttcqn-intro-founder-name">Nguyễn Song Hào</h4>
            <p class="ttcqn-intro-founder-title">Founder Công ty Môi Trường Đô Thị Số 1 Quảng Ninh</p>
            <p class="ttcqn-intro-founder-edu">Cử nhân Đại học Bách Khoa Hà Nội</p>
          </div>
        </div>

        <!-- NÚT CTA HÀNH ĐỘNG -->
        <div class="ttcqn-intro-cta-group">
          <a href="tel:0963953533" class="ttcqn-intro-btn-primary" aria-label="Gọi đội thợ trong khung giờ 05:00 đến 22:00 qua hotline 0963.953.533">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Gọi 0963.953.533
          </a>
          <a href="<?php echo esc_url($home_internal_links['price']); ?>" class="ttcqn-intro-btn-secondary">
            Xem bảng giá dịch vụ
          </a>
        </div>

      </div>

      <!-- CỘT PHẢI: HÌNH ẢNH ĐỘI NGŨ -->
      <div class="ttcqn-intro-image-col">
        <div class="ttcqn-intro-image-wrapper">
          <!-- HÌNH NỀN HỌA TIẾT TRANG TRÍ -->
          <div class="ttcqn-intro-image-decor"></div>

          <div class="ttcqn-intro-slider-wrap" id="introSlider" aria-label="Hình ảnh đội ngũ Môi Trường Đô Thị Số 1 Quảng Ninh">
            <div class="ttcqn-intro-slider-track">
              <?php foreach ($intro_slider_images as $idx => $is): ?>
              <img
                src="<?php echo esc_url($is['src']); ?>"
                alt="<?php echo esc_attr($is['alt']); ?>"
                class="ttcqn-intro-main-img"
                width="1100" height="825"
                loading="lazy"
                decoding="async"
                aria-hidden="<?php echo $idx === 0 ? 'false' : 'true'; ?>"
              >
              <?php endforeach; ?>
            </div>
            <div class="ttcqn-intro-slider-dots" role="tablist" aria-label="Chuyển ảnh đội ngũ">
              <?php foreach ($intro_slider_images as $idx => $is): ?>
              <button class="ttcqn-intro-dot<?php echo $idx === 0 ? ' is-active' : ''; ?>" onclick="introGoTo(<?php echo $idx; ?>)" role="tab" aria-label="Ảnh <?php echo $idx+1; ?>"></button>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
        <p class="ttcqn-intro-image-caption">
          Nguyễn Song Hào cùng đội ngũ kỹ thuật Môi Trường Đô Thị Số 1 Quảng Ninh.
        </p>
      </div>

    </div>
  </div>
</section>
<!-- END: SECTION GIỚI THIỆU CÔNG TY (TTCQN INTRO SECTION) -->



<section class="ttcqn-real-video-section" id="video-thuc-te" aria-labelledby="ttcqn-real-video-title">
  <div class="ttcqn-real-video-container">
    <div class="ttcqn-real-video-content">
      <span class="ttcqn-real-video-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
        Video thực tế tại Hạ Long
      </span>
      <h2 class="ttcqn-real-video-title" id="ttcqn-real-video-title">Theo dõi cách đội kỹ thuật tiếp nhận và khảo sát hiện trường</h2>
      <p class="ttcqn-real-video-desc">
        Một ca tiếp nhận thực tế tại nhà dân ở Hạ Long: đội kỹ thuật kiểm tra tình trạng, trao đổi phương án xử lý và báo chi phí rõ ràng trước khi thi công.
      </p>
      <ul class="ttcqn-real-video-points" aria-label="Điểm nổi bật trong video dịch vụ tại Hạ Long">
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>Khảo sát đúng tình trạng trước khi báo phương án</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>Phục vụ khu vực Hạ Long và toàn tỉnh Quảng Ninh</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>Báo chi phí rõ ràng trước khi thi công</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>Hỗ trợ hút bể phốt, thông tắc cống, xử lý mùi</li>
      </ul>
      <div class="ttcqn-real-video-actions">
        <a class="ttcqn-real-video-btn primary" href="tel:0963953533" aria-label="Gọi hotline 0963.953.533 để đặt dịch vụ tại Hạ Long">Gọi 0963.953.533</a>
        <a class="ttcqn-real-video-btn secondary" href="<?php echo esc_url($home_internal_links['price']); ?>">Xem bảng giá dịch vụ</a>
      </div>
    </div>

    <figure class="ttcqn-real-video-media">
      <div class="ttcqn-real-video-frame">
        <button
          class="ttcqn-yt-facade"
          type="button"
          data-vid="<?php echo esc_attr($home_real_video_youtube_id); ?>"
          data-src="<?php echo esc_url($home_real_video_embed_url); ?>?autoplay=1&rel=0"
          data-title="Video khảo sát dịch vụ môi trường tại Hạ Long của Môi Trường Đô Thị Số 1 Quảng Ninh"
          aria-label="Phát video: Video khảo sát dịch vụ môi trường tại Hạ Long của Môi Trường Đô Thị Số 1 Quảng Ninh"
        >
          <img
            class="ttcqn-yt-facade-thumb"
            src="https://i.ytimg.com/vi/<?php echo esc_attr($home_real_video_youtube_id); ?>/hqdefault.jpg"
            alt="Video khảo sát dịch vụ môi trường tại Hạ Long của Môi Trường Đô Thị Số 1 Quảng Ninh"
            width="390"
            height="693"
            loading="lazy"
            decoding="async"
          >
          <span class="ttcqn-yt-facade-play" aria-hidden="true">
            <svg viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="34" cy="34" r="34" fill="#FF0000" opacity=".92"/>
              <polygon points="27,19 54,34 27,49" fill="white"/>
            </svg>
          </span>
        </button>
      </div>
      <figcaption class="ttcqn-real-video-caption">Video khảo sát dịch vụ môi trường tại Hạ Long của Môi Trường Đô Thị Số 1 Quảng Ninh.</figcaption>
    </figure>
  </div>
</section>
<script>
(function(){
  var facades = document.querySelectorAll('.ttcqn-yt-facade');
  if (!facades.length) return;
  facades.forEach(function(btn){
    btn.addEventListener('click', function(){
      var iframe = document.createElement('iframe');
      iframe.className = 'ttcqn-real-video-player';
      iframe.src = btn.dataset.src;
      iframe.title = btn.dataset.title;
      iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      iframe.setAttribute('allowfullscreen','');
      iframe.setAttribute('loading','eager');
      btn.parentNode.replaceChild(iframe, btn);
    }, {once: true});
  });
})();
</script>

<!-- ========== DỊCH VỤ CỦA CHÚNG TÔI - SEO HUB ========== -->
<section class="ttcqn-services-section" aria-labelledby="sv-title" id="dich-vu">
  <div class="ttcqn-service-vector-bg" aria-hidden="true">
    <span class="ttcqn-service-vector is-wave"><svg viewBox="0 0 500 120"><path d="M10 70c70-50 120 30 190-10s120-50 210 0 120 20 160-20"/></svg></span>
    <span class="ttcqn-service-vector green is-blob"></span>
  </div>
  <div class="ttcqn-services-header">
    <span class="ttcqn-services-badge">
      <img src="<?php echo esc_url($service_badge_icon_url); ?>" alt="Biểu tượng dịch vụ xử lý tận nơi tại Quảng Ninh" width="44" height="44" loading="lazy" decoding="async">
      Dịch vụ xử lý tận nơi
    </span>
    <div class="section-title-wrap">
      <h2 class="section-title anim" id="sv-title"><span class="text-white">DỊCH VỤ CỦA </span><span class="text-blue">CHÚNG TÔI</span></h2>
    </div>
    <p class="section-desc anim">
      Chọn đúng hạng mục để xem phương án xử lý, hình ảnh thi công và <a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['price']); ?>">bảng giá dịch vụ</a> trước khi gọi thợ.
    </p>
  </div>

  <div class="grid-3" aria-label="Danh sách dịch vụ chính">
    <?php foreach ($home_service_cards as $service_index => $service_card) : ?>
      <a class="card anim ttcqn-service-card-link" href="<?php echo esc_url($service_card['href']); ?>" aria-label="<?php echo esc_attr($service_card['cta']); ?>">
        <span class="card-img-wrap">
          <img class="card-img" src="<?php echo esc_url($service_card['image']); ?>" alt="<?php echo esc_attr($service_card['alt']); ?>" width="720" height="540" loading="lazy" decoding="async">
          <span class="img-overlay" aria-hidden="true"></span>
        </span>
        <span class="card-body">
          <span class="service-num">DỊCH VỤ <?php echo esc_html(str_pad((string) ($service_index + 1), 2, '0', STR_PAD_LEFT)); ?></span>
          <span class="price-badge"><?php echo esc_html($service_card['badge']); ?></span>
          <h3><?php echo esc_html($service_card['title']); ?></h3>
          <span class="card-text"><?php echo esc_html($service_card['excerpt']); ?></span>
          <span class="btn-sm"><?php echo esc_html($service_card['cta']); ?></span>
        </span>
      </a>
    <?php endforeach; ?>
  </div>

  <div class="ttcqn-benefit-strip" aria-label="Liên kết nhanh hỗ trợ khách hàng">
    <a class="ttcqn-benefit-cell" href="<?php echo esc_url($home_internal_links['contact']); ?>" aria-label="Gửi yêu cầu dịch vụ">
      <span class="ttcqn-benefit-icon has-image"><img src="<?php echo esc_url($service_benefit_icon_urls['contact']); ?>" alt="Gửi yêu cầu dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh" width="92" height="92" loading="lazy" decoding="async"></span>
      <span><strong>Gửi yêu cầu dịch vụ</strong><small>Điều phối kỹ thuật viên 05:00-22:00</small></span>
    </a>
    <a class="ttcqn-benefit-cell" href="<?php echo esc_url($home_internal_links['price']); ?>" aria-label="Xem bảng giá hút bể phốt, thông tắc cống">
      <span class="ttcqn-benefit-icon has-image"><img src="<?php echo esc_url($service_benefit_icon_urls['price']); ?>" alt="Bảng giá dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh" width="92" height="92" loading="lazy" decoding="async"></span>
      <span><strong>Xem bảng giá</strong><small>Báo giá trước khi thi công</small></span>
    </a>
    <a class="ttcqn-benefit-cell" href="<?php echo esc_url($home_internal_links['locations']); ?>" aria-label="Xem hệ thống cơ sở Quảng Ninh">
      <span class="ttcqn-benefit-icon has-image"><img src="<?php echo esc_url($service_benefit_icon_urls['locations']); ?>" alt="Biểu tượng khu vực phục vụ tại Quảng Ninh" width="92" height="92" loading="lazy" decoding="async"></span>
      <span><strong>Khu vực phục vụ</strong><small>Hạ Long, Cẩm Phả, Uông Bí</small></span>
    </a>
    <a class="ttcqn-benefit-cell" href="<?php echo esc_url($home_internal_links['warranty']); ?>" aria-label="Xem chính sách bảo hành dịch vụ">
      <span class="ttcqn-benefit-icon has-image"><img src="<?php echo esc_url($service_benefit_icon_urls['warranty']); ?>" alt="Chính sách bảo hành dịch vụ thông tắc cống, hút bể phốt Quảng Ninh" width="92" height="92" loading="lazy" decoding="async"></span>
      <span><strong>Chính sách bảo hành</strong><small>Cam kết minh bạch chi phí</small></span>
    </a>
    <a class="ttcqn-benefit-cell" href="<?php echo esc_url($home_internal_links['blog']); ?>" aria-label="Xem cẩm nang xử lý tắc nghẽn">
      <span class="ttcqn-benefit-icon has-image"><img src="<?php echo esc_url($service_benefit_icon_urls['blog']); ?>" alt="Cẩm nang xử lý tắc cống, nghẹt bồn cầu tại Quảng Ninh" width="92" height="92" loading="lazy" decoding="async"></span>
      <span><strong>Cẩm nang xử lý tắc nghẽn</strong><small>Kinh nghiệm cho hộ gia đình</small></span>
    </a>
  </div>
</section>

<!-- ========== SLIDER + GIỚI THIỆU ========== -->
<section class="section-white ttcqn-region-section" aria-labelledby="about-title">
  <div class="slider-about-wrap">
    <!-- SLIDER -->
    <div class="slider-container anim-left" id="mainSlider" aria-label="Ảnh ký kết hợp tác đối tác thực tế tại Quảng Ninh">
      <div class="slider-viewport">
        <div class="slider-track">
          <?php foreach ($slider_images as $index => $img): ?>
          <img src="<?php echo esc_url($img['src']); ?>" alt="<?php echo esc_attr($img['alt']); ?>" loading="lazy" decoding="async" width="1200" height="600">
          <?php endforeach; ?>
        </div>
        <button class="slider-btn slider-prev" onclick="moveSlide(-1)" aria-label="Ảnh trước">‹</button>
        <button class="slider-btn slider-next" onclick="moveSlide(1)" aria-label="Ảnh tiếp theo">›</button>
        <div class="slider-dots" role="tablist" aria-label="Điều hướng slider">
          <?php foreach ($slider_images as $index => $img): ?>
          <button class="slider-dot <?php echo $index === 0 ? 'active' : ''; ?>" onclick="goToSlide(<?php echo $index; ?>)" aria-label="Chuyển đến ảnh <?php echo $index + 1; ?>" role="tab"></button>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
    <!-- NỘI DUNG GIỚI THIỆU -->
    <div class="about-text-side anim-right">
      <span class="ttcqn-region-badge"><svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M10.4 1.2 3.7 9.6h4.5l-.7 7.2 6.8-8.8H9.8l.6-6.8Z"/></svg>DỊCH VỤ TẠI QUẢNG NINH</span>
      <h2 id="about-title"><span>HỖ TRỢ <em>05:00-22:00</em></span><span>TẠI QUẢNG NINH</span></h2>
      <p><a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['about']); ?>">Môi Trường Đô Thị Số 1 Quảng Ninh</a> nhận xử lý những ca từ đơn giản đến phức tạp tại nhà dân, nhà hàng, khách sạn và khu dân cư. Khi bạn gọi, thợ sẽ hỏi nhanh tình trạng, đến nơi kiểm tra kỹ rồi mới bắt tay vào làm để tránh tốn thời gian và chi phí không cần thiết.</p>
      <ul>
        <li><span class="ttcqn-region-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 16V7h11l3 4h3v5"/><path d="M5 16a2 2 0 1 0 4 0"/><path d="M16 16a2 2 0 1 0 4 0"/><path d="M14 7v9"/></svg></span><span>Hút bể phốt, thông cống, thông bồn cầu và xử lý mùi hôi tận nơi</span></li>
        <li><span class="ttcqn-region-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4z"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13" r="3"/></svg></span><span>Kiểm tra đúng nguyên nhân trước khi thi công</span></li>
        <li><span class="ttcqn-region-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3C8 8 6 11 6 15a6 6 0 0 0 12 0c0-4-2-7-6-12Z"/><path d="M9 16c1 2 3 3 5 2"/></svg></span><span>Ưu tiên phương án không đục phá nếu có thể xử lý từ bên ngoài</span></li>
        <li><span class="ttcqn-region-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-5"/></svg></span><span><a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['price']); ?>">Báo giá rõ trước khi làm</a>, có bảo hành theo từng dịch vụ</span></li>
        <li><span class="ttcqn-region-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/><path d="M4 19h16"/></svg></span><span>Dọn sạch khu vực sau khi thi công</span></li>
        <li><span class="ttcqn-region-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/><path d="M4 20l3-3"/><path d="M20 20l-3-3"/></svg></span><span>Có mặt nhanh tại Hạ Long, Cẩm Phả, Uông Bí và vùng lân cận</span></li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== DỰ ÁN ĐÃ HOÀN THÀNH ========== -->
<section class="ttcqn-projects" aria-labelledby="project-title" id="du-an" data-project-section>
  <div class="ttcqn-projects-inner">
    <header class="ttcqn-projects-head">
      <span class="ttcqn-projects-kicker"><?php ttcqn_home_project_icon('grid'); ?> CÔNG TRÌNH THỰC TẾ</span>
      <h2 class="ttcqn-projects-title" id="project-title">DỰ ÁN ĐÃ <span>HOÀN THÀNH</span></h2>
      <span class="ttcqn-projects-accent" aria-hidden="true"></span>
      <p class="ttcqn-projects-desc">Một số công trình thực tế Môi Trường Đô Thị Số 1 Quảng Ninh đã xử lý cho khách hàng tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái và các khu vực lân cận.</p>
    </header>

    <div class="ttcqn-project-filters" role="toolbar" aria-label="Lọc dự án theo dịch vụ">
      <?php foreach ($completed_project_filters as $filter) : ?>
        <button class="ttcqn-project-filter<?php echo $filter['key'] === 'all' ? ' is-active' : ''; ?>" type="button" data-project-filter="<?php echo esc_attr($filter['key']); ?>" aria-pressed="<?php echo $filter['key'] === 'all' ? 'true' : 'false'; ?>">
          <?php ttcqn_home_project_icon($filter['icon']); ?>
          <span><?php echo esc_html($filter['label']); ?></span>
        </button>
      <?php endforeach; ?>
    </div>

    <div class="ttcqn-project-grid" data-project-grid>
      <?php foreach ($completed_projects as $index => $project) : ?>
        <article class="ttcqn-project-card<?php echo $index === 0 ? ' is-featured' : ''; ?>" data-project-card data-category="<?php echo esc_attr($project['category']); ?>">
          <figure class="ttcqn-project-media">
            <div class="ttcqn-project-media-link">
              <img src="<?php echo esc_url($project['image']); ?>" alt="<?php echo esc_attr($project['alt']); ?>" width="900" height="900" loading="lazy" decoding="async">
            </div>
            <span class="ttcqn-project-done">Đã hoàn thành</span>
            <span class="ttcqn-project-area">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s7-5.3 7-12a7 7 0 0 0-14 0c0 6.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>
              <?php echo esc_html($project['area']); ?>
            </span>
            <span class="ttcqn-project-icon"><?php ttcqn_home_project_icon($project['icon']); ?></span>
          </figure>
          <div class="ttcqn-project-body">
            <span class="ttcqn-project-service"><?php echo esc_html($project['service']); ?></span>
            <h3 class="ttcqn-project-title-link"><?php echo esc_html($project['title']); ?></h3>
            <p><?php echo esc_html($project['description']); ?></p>
            <p class="ttcqn-project-result"><strong>Kết quả:</strong> <?php echo esc_html($project['result']); ?></p>
          </div>
        </article>
      <?php endforeach; ?>
    </div>

    <div class="ttcqn-project-mobile-list" data-project-mobile-list>
      <?php foreach ($completed_projects as $index => $project) : ?>
        <?php if ($index === 0) { continue; } ?>
        <article class="ttcqn-project-mobile-item" data-project-mobile-item data-category="<?php echo esc_attr($project['category']); ?>">
          <button class="ttcqn-project-accordion" type="button" aria-expanded="false" aria-controls="project-mobile-panel-<?php echo (int) $index; ?>">
            <span class="ttcqn-project-accordion-icon"><?php ttcqn_home_project_icon($project['icon']); ?></span>
            <span class="ttcqn-project-accordion-title"><?php echo esc_html($project['title']); ?></span>
            <span class="ttcqn-project-accordion-area"><?php echo esc_html($project['area']); ?></span>
            <span class="ttcqn-project-accordion-arrow"><?php ttcqn_home_project_icon('chevron'); ?></span>
          </button>
          <div class="ttcqn-project-accordion-panel" id="project-mobile-panel-<?php echo (int) $index; ?>">
            <p><?php echo esc_html($project['description']); ?></p>
            <p><strong>Kết quả:</strong> <?php echo esc_html($project['result']); ?></p>
          </div>
        </article>
      <?php endforeach; ?>
    </div>

    <div class="ttcqn-project-trust" aria-label="Cam kết khi thi công">
      <?php foreach ($project_trust_items as $item) : ?>
        <div class="ttcqn-project-trust-item">
          <span class="ttcqn-project-trust-icon"><?php ttcqn_home_project_icon($item['icon']); ?></span>
          <span><strong><?php echo esc_html($item['title']); ?></strong><small><?php echo esc_html($item['text']); ?></small></span>
        </div>
      <?php endforeach; ?>
    </div>

    <div class="ttcqn-project-cta">
      <div class="ttcqn-project-cta-visual" aria-hidden="true">
        <img class="ttcqn-project-cta-truck" src="<?php echo esc_url($hero_truck_url); ?>" alt="Xe hút bể phốt chuyên dụng phục vụ công trình tại Quảng Ninh" width="900" height="600" loading="lazy" decoding="async">
        <img class="ttcqn-project-cta-person" src="<?php echo esc_url($hero_worker_url); ?>" alt="Kỹ thuật viên thông tắc cống hỗ trợ khách hàng tại Quảng Ninh" width="420" height="640" loading="lazy" decoding="async">
      </div>
      <div class="ttcqn-project-cta-copy">
        <h3>Bạn cần xử lý công trình tương tự?</h3>
        <p>Chúng tôi tiếp nhận từ 05:00 đến 22:00 hằng ngày – Có mặt nhanh chóng!</p>
        <a class="ttcqn-project-call" href="<?php echo esc_url($primary_hotline_href); ?>" aria-label="Gọi ngay hotline 0963.953.533"><?php ttcqn_home_project_icon('phone'); ?> Gọi ngay 0963.953.533</a>
      </div>
    </div>
  </div>
</section>

<!-- ========== QUY TRÌNH 5 BƯỚC ========== -->
<section class="home-process" aria-labelledby="home-process-title">
  <div class="home-process__container">
    <span class="home-process__kicker">QUY TRÌNH 5 BƯỚC</span>
    <header class="home-process__header">
      <h2 class="home-process__title" id="home-process-title">QUY TRÌNH <span>5 BƯỚC</span></h2>
      <span class="home-process__underline" aria-hidden="true"></span>
      <p class="home-process__description"><a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['contact']); ?>">Quy trình phục vụ</a> 5 bước giúp khách hàng nắm rõ từng công đoạn, thời gian xử lý và cách báo giá trước khi thi công.</p>
    </header>

    <div class="home-process__steps" role="list">
      <span class="home-process__timeline-line" aria-hidden="true"></span>
      <?php foreach ($process_steps as $process_index => $process_step) : ?>
        <article class="home-process__step" role="listitem" style="--i:<?php echo (int) $process_index; ?>;">
          <span class="home-process__number" aria-hidden="true"><?php echo esc_html($process_step['number']); ?></span>
          <div class="home-process__card">
            <figure class="home-process__image-wrap">
              <img class="home-process__image" src="<?php echo esc_url($process_step['image']); ?>" alt="<?php echo esc_attr($process_step['alt']); ?>" loading="lazy" decoding="async" width="720" height="540">
            </figure>
            <div class="home-process__card-content">
              <span class="home-process__icon" aria-hidden="true"><?php ttcqn_home_process_icon($process_step['icon']); ?></span>
              <h3 class="home-process__card-title"><?php echo esc_html($process_step['title']); ?></h3>
              <p class="home-process__card-description"><?php echo esc_html($process_step['description']); ?></p>
              <span class="home-process__card-line" aria-hidden="true"></span>
            </div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>

    <div class="home-process__cta">
      <div class="home-process__cta-content">
        <span class="home-process__cta-icon" aria-hidden="true"><?php ttcqn_home_process_icon('phone'); ?></span>
        <div>
          <h3 class="home-process__cta-title">Cần xử lý gấp?</h3>
          <p class="home-process__cta-description">Gọi ngay để kỹ thuật viên tư vấn và điều phối nhanh tại Quảng Ninh.</p>
        </div>
      </div>
      <div class="home-process__cta-actions">
        <a class="home-process__call-button" href="<?php echo esc_url($primary_hotline_href); ?>" aria-label="Gọi hotline 0963.953.533 để tư vấn dịch vụ tại Quảng Ninh"><?php ttcqn_home_process_icon('phone'); ?> Gọi 0963.953.533</a>
        <a class="home-process__advice-button" href="<?php echo esc_url($home_internal_links['contact']); ?>" aria-label="Gửi yêu cầu tư vấn quy trình xử lý">Gửi yêu cầu tư vấn</a>
        <a class="home-process__zalo-button" href="<?php echo esc_url($zalo_url); ?>" target="_blank" rel="nofollow noopener noreferrer" aria-label="Nhắn Zalo cho Môi Trường Đô Thị Số 1 Quảng Ninh"><?php ttcqn_home_process_icon('zalo'); ?> Nhắn Zalo</a>
      </div>
    </div>

    <div class="home-process__benefits" aria-label="Cam kết trong quy trình dịch vụ">
      <?php foreach ($process_benefits as $process_benefit) : ?>
        <div class="home-process__benefit">
          <span class="home-process__benefit-icon" aria-hidden="true"><?php ttcqn_home_process_icon($process_benefit['icon']); ?></span>
          <span>
            <strong class="home-process__benefit-title"><?php echo esc_html($process_benefit['title']); ?></strong>
            <span class="home-process__benefit-description"><?php echo esc_html($process_benefit['description']); ?></span>
          </span>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ========== KHU VỰC PHỤC VỤ ========== -->
<section class="ttcqn-area-section" aria-labelledby="area-title">
  <div class="ttcqn-area-container">
    <div class="ttcqn-area-header">
      <p class="ttcqn-area-kicker anim">KHU VỰC PHỤC VỤ</p>
      <h2 class="ttcqn-area-title anim" id="area-title">PHỤC VỤ TRÊN TOÀN TỈNH <span>QUẢNG NINH</span></h2>
      <p class="ttcqn-area-desc anim">Đội ngũ kỹ thuật viên túc trực tại từng khu vực, đảm bảo có mặt nhanh nhất khi bạn cần.</p>
    </div>

    <div class="ttcqn-area-layout">
      <div class="ttcqn-area-map-wrap anim">
        <figure class="ttcqn-area-map-stage" aria-label="Bản đồ Việt Nam, ghim vị trí Quảng Ninh" role="img">
          <img class="ttcqn-area-map-img" src="<?php echo esc_url(plugins_url('assets/region-section/ban-do-viet-nam-quang-ninh.webp', dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php')); ?>" alt="Bản đồ Việt Nam màu xanh ghim vị trí Quảng Ninh" width="1536" height="1024" loading="lazy" decoding="async">
          <span class="ttcqn-area-map-glow" aria-hidden="true"></span>
          <span class="ttcqn-area-pin" aria-hidden="true">
            <span class="ttcqn-area-pin-wave"></span>
            <span class="ttcqn-area-pin-core"></span>
            <span class="ttcqn-area-pin-label">Quảng Ninh</span>
          </span>
        </figure>
      </div>

      <div class="ttcqn-area-cards">
        <a href="<?php echo esc_url($home_internal_links['areas']['ha_long']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-primary)" aria-label="Hút bể phốt Hạ Long">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Hạ Long</h3><p>TP trung tâm</p></span>
          <span class="ttcqn-area-card-time">15 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['cam_pha']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-warning)" aria-label="Hút bể phốt Cẩm Phả">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Cẩm Phả</h3><p>TP công nghiệp</p></span>
          <span class="ttcqn-area-card-time">20–30 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['uong_bi']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-secondary)" aria-label="Hút bể phốt Uông Bí">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Uông Bí</h3><p>TP phía tây</p></span>
          <span class="ttcqn-area-card-time">25–35 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['mong_cai']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-error)" aria-label="Hút bể phốt Móng Cái">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Móng Cái</h3><p>TP biên giới</p></span>
          <span class="ttcqn-area-card-time">40–60 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['dong_trieu']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-secondary-hover)" aria-label="Hút bể phốt Đông Triều">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Đông Triều</h3><p>TX phía tây</p></span>
          <span class="ttcqn-area-card-time">30–40 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['quang_yen']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-info)" aria-label="Hút bể phốt Quảng Yên">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Quảng Yên</h3><p>TX ven biển</p></span>
          <span class="ttcqn-area-card-time">20–30 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['van_don']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-warning)" aria-label="Hút bể phốt Vân Đồn">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Vân Đồn</h3><p>Huyện đảo</p></span>
          <span class="ttcqn-area-card-time">50–70 phút</span>
        </a>
        <a href="<?php echo esc_url($home_internal_links['areas']['bai_chay']); ?>" class="ttcqn-area-card anim-scale" style="--area-color:var(--ttcqn-color-primary-hover)" aria-label="Hút bể phốt Bãi Cháy">
          <span class="ttcqn-area-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></span>
          <span class="ttcqn-area-card-info"><h3>Hút bể phốt Bãi Cháy</h3><p>Khu du lịch</p></span>
          <span class="ttcqn-area-card-time">15–25 phút</span>
        </a>
      </div>
    </div>

    <div class="ttcqn-area-benefits">
      <div class="ttcqn-area-benefit">
        <span class="ttcqn-area-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>
        <span><strong>Phủ sóng 8+ khu vực</strong><br>Toàn tỉnh Quảng Ninh</span>
      </div>
      <div class="ttcqn-area-benefit">
        <span class="ttcqn-area-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></span>
        <span><strong>Đội ngũ địa phương</strong><br>Am hiểu từng khu vực</span>
      </div>
      <div class="ttcqn-area-benefit">
        <span class="ttcqn-area-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></span>
        <span><strong>Có mặt nhanh 15–70 phút</strong><br>Tùy khoảng cách khu vực</span>
      </div>
      <div class="ttcqn-area-benefit">
        <span class="ttcqn-area-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span>
        <span><strong>Hotline 05:00-22:00</strong><br>0963.953.533</span>
      </div>
    </div>
  </div>
</section>

<!-- ========== BẢNG GIÁ ========== -->
<section class="section-gray section-wave-bottom wave-to-white ttcqn-price-redesign" aria-labelledby="price-title">
  <div class="ttcqn-price-container">
    <div class="ttcqn-price-layout">
      <div class="ttcqn-price-copy anim">
        <p class="ttcqn-price-kicker">BẢNG GIÁ DỊCH VỤ</p>
        <h2 class="ttcqn-price-title" id="price-title">MINH BẠCH CHI PHÍ – <span>AN TÂM DỊCH VỤ</span></h2>
        <p class="ttcqn-price-desc">Chúng tôi cam kết minh bạch mọi chi phí, không phát sinh vô lý. Khảo sát tận nơi – Báo giá trước khi thi công – Phục vụ nhanh, đúng hiện trạng.</p>
        <div class="ttcqn-price-badges" aria-label="Cam kết bảng giá">
          <div class="ttcqn-price-badge"><span class="ttcqn-price-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><circle cx="21" cy="21" r="12" stroke="currentColor" stroke-width="4"/><path d="M31 31l10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M15 21l4 4 8-9" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>Khảo sát miễn phí</span></div>
          <div class="ttcqn-price-badge"><span class="ttcqn-price-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M15 9h18a4 4 0 014 4v26a4 4 0 01-4 4H15a4 4 0 01-4-4V13a4 4 0 014-4z" stroke="currentColor" stroke-width="4"/><path d="M18 7h12v8H18zM18 25h13M18 33h13M18 18l3 3 6-7" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>Báo giá trước khi thi công</span></div>
          <div class="ttcqn-price-badge"><span class="ttcqn-price-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 5l16 6v12c0 10-6.8 17.2-16 20-9.2-2.8-16-10-16-20V11l16-6z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M17 24l5 5 10-12" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>Không phát sinh chi phí vô lý</span></div>
          <div class="ttcqn-price-badge"><span class="ttcqn-price-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 5l15 6v11c0 9-6 16-15 20-9-4-15-11-15-20V11l15-6z" stroke="currentColor" stroke-width="4"/><path d="M18 24l4 4 9-10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 39l-3 6M31 39l3 6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></span><span>Có bảo hành rõ ràng</span></div>
        </div>
      </div>

      <figure class="ttcqn-price-visual anim" aria-label="Kỹ thuật viên tư vấn bảng giá cho khách hàng">
        <img class="ttcqn-price-main-img" src="<?php echo esc_url($price_images['advisor']); ?>" alt="Kỹ thuật viên Môi Trường Đô Thị Số 1 Quảng Ninh cầm bảng báo giá tư vấn khách hàng" width="900" height="1125" loading="lazy" decoding="async">
        <figcaption class="ttcqn-price-truck-card">
          <img src="<?php echo esc_url($price_images['truck']); ?>" alt="Xe hút bể phốt màu xanh lá thi công trước biệt thự tại Quảng Ninh" width="760" height="428" loading="lazy" decoding="async">
          <span class="ttcqn-price-truck-caption"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V6l8-3z" stroke="currentColor" stroke-width="2"/><path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Xe chuyên dụng – Phục vụ nhanh chóng</span>
        </figcaption>
      </figure>

      <div class="ttcqn-price-table-panel anim">
        <div class="ttcqn-price-table-scroll">
          <table class="price-table" aria-label="Bảng giá dịch vụ vệ sinh môi trường">
            <thead>
              <tr><th>Dịch vụ</th><th>Mô tả ngắn</th><th>Giá tham khảo</th><th>Thời gian bảo hành</th></tr>
            </thead>
            <tbody>
              <tr><td class="ttcqn-price-service" data-label="Dịch vụ"><a class="ttcqn-price-service-link" href="<?php echo esc_url($home_internal_links['services']['hut_be_phot']); ?>">Hút bể phốt</a></td><td data-label="Mô tả ngắn">Hút bể phốt, bể tự hoại, bể chứa</td><td class="price" data-label="Giá tham khảo">200.000đ</td><td data-label="Bảo hành">12 tháng</td></tr>
              <tr><td class="ttcqn-price-service" data-label="Dịch vụ"><a class="ttcqn-price-service-link" href="<?php echo esc_url($home_internal_links['services']['thong_tac_cong']); ?>">Thông tắc cống</a></td><td data-label="Mô tả ngắn">Thông tắc cống thoát nước sinh hoạt</td><td class="price" data-label="Giá tham khảo">150.000đ</td><td data-label="Bảo hành">6 tháng</td></tr>
              <tr><td class="ttcqn-price-service" data-label="Dịch vụ"><a class="ttcqn-price-service-link" href="<?php echo esc_url($home_internal_links['services']['bon_cau']); ?>">Thông tắc bồn cầu</a></td><td data-label="Mô tả ngắn">Thông tắc bồn cầu, nhà vệ sinh</td><td class="price" data-label="Giá tham khảo">100.000đ</td><td data-label="Bảo hành">6 tháng</td></tr>
              <tr><td class="ttcqn-price-service" data-label="Dịch vụ"><a class="ttcqn-price-service-link" href="<?php echo esc_url($home_internal_links['services']['chau_rua']); ?>">Thông tắc chậu rửa</a></td><td data-label="Mô tả ngắn">Thông tắc chậu rửa, lavabo, bồn rửa</td><td class="price" data-label="Giá tham khảo">100.000đ</td><td data-label="Bảo hành">6 tháng</td></tr>
              <tr><td class="ttcqn-price-service" data-label="Dịch vụ"><a class="ttcqn-price-service-link" href="<?php echo esc_url($home_internal_links['services']['ho_ga']); ?>">Nạo vét hố ga</a></td><td data-label="Mô tả ngắn">Nạo vét hố ga, hố thu, cống thoát nước</td><td class="price" data-label="Giá tham khảo">300.000đ</td><td data-label="Bảo hành">12 tháng</td></tr>
              <tr><td class="ttcqn-price-service" data-label="Dịch vụ"><a class="ttcqn-price-service-link" href="<?php echo esc_url($home_internal_links['services']['mui_hoi']); ?>">Xử lý mùi hôi</a></td><td data-label="Mô tả ngắn">Xử lý mùi hôi nhà vệ sinh, cống rãnh, bể phốt</td><td class="price" data-label="Giá tham khảo">500.000đ</td><td data-label="Bảo hành">24 tháng</td></tr>
            </tbody>
          </table>
        </div>
        <p class="ttcqn-price-note"><span class="ttcqn-note-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 10v7M12 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>Bảng giá chỉ mang tính tham khảo. <a class="ttcqn-inline-link" href="<?php echo esc_url($home_internal_links['price']); ?>">Báo giá trước khi thi công</a> theo hiện trạng và khảo sát thực tế.</p>
      </div>
    </div>

    <div class="ttcqn-price-lower">
      <div class="ttcqn-work-gallery anim">
        <h3 class="ttcqn-price-subhead">HÌNH ẢNH THI CÔNG THỰC TẾ</h3>
        <div class="ttcqn-work-grid">
          <figure class="ttcqn-work-card"><img src="<?php echo esc_url($price_images['cong']); ?>" alt="Kỹ thuật viên thông tắc cống thực tế tại Quảng Ninh" width="520" height="650" loading="lazy" decoding="async"><figcaption>Thông tắc cống</figcaption></figure>
          <figure class="ttcqn-work-card"><img src="<?php echo esc_url($price_images['boncau']); ?>" alt="Kỹ thuật viên thông tắc bồn cầu thực tế tại Quảng Ninh" width="520" height="650" loading="lazy" decoding="async"><figcaption>Thông tắc bồn cầu</figcaption></figure>
          <figure class="ttcqn-work-card"><img src="<?php echo esc_url($price_images['hoga']); ?>" alt="Kỹ thuật viên nạo vét hố ga thực tế tại Quảng Ninh" width="520" height="650" loading="lazy" decoding="async"><figcaption>Nạo vét hố ga</figcaption></figure>
          <figure class="ttcqn-work-card"><img src="<?php echo esc_url($price_images['chaurua']); ?>" alt="Kỹ thuật viên thông tắc chậu rửa thực tế tại Quảng Ninh" width="520" height="650" loading="lazy" decoding="async"><figcaption>Thông tắc chậu rửa</figcaption></figure>
        </div>
      </div>

      <div class="ttcqn-price-factors anim">
        <h3 class="ttcqn-price-subhead">YẾU TỐ ẢNH HƯỞNG ĐẾN GIÁ DỊCH VỤ</h3>
        <div class="ttcqn-factor-grid">
          <article class="ttcqn-factor-card"><span class="ttcqn-factor-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M15 34v-9a9 9 0 019-9h3" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="15" cy="36" r="5" stroke="currentColor" stroke-width="4"/><circle cx="34" cy="16" r="5" stroke="currentColor" stroke-width="4"/><path d="M29 34h10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></span><h3>Mức độ tắc nghẽn</h3><p>Tắc nhẹ hay nặng sẽ ảnh hưởng đến thời gian và chi phí xử lý.</p></article>
          <article class="ttcqn-factor-card"><span class="ttcqn-factor-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 43s14-13 14-25A14 14 0 0010 18c0 12 14 25 14 25z" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="18" r="5" stroke="currentColor" stroke-width="4"/></svg></span><h3>Vị trí thi công</h3><p>Vị trí khó tiếp cận sẽ cần nhiều thời gian và nhân lực hơn.</p></article>
          <article class="ttcqn-factor-card"><span class="ttcqn-factor-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M8 34h14V20h14V8" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 26h6M22 12h6M34 20h6M14 34v6M28 20v6M36 8h6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></span><h3>Chiều dài đường ống</h3><p>Đường ống càng dài, phức tạp thì chi phí càng cao.</p></article>
          <article class="ttcqn-factor-card"><span class="ttcqn-factor-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 15a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" stroke-width="4"/><path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.5 10.5l5 5M32.5 32.5l5 5M37.5 10.5l-5 5M15.5 32.5l-5 5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></span><h3>Thiết bị sử dụng</h3><p>Thiết bị hiện đại giúp xử lý triệt để nhưng chi phí khác nhau.</p></article>
        </div>
      </div>
    </div>

    <div class="ttcqn-price-cta-wrap anim">
      <a href="<?php echo esc_url($price_page_url); ?>" class="ttcqn-price-cta">Xem bảng giá đầy đủ →</a>
      <a href="tel:0963953533" class="ttcqn-price-call">Gọi báo giá: 0963.953.533</a>
    </div>
  </div>
</section>

<!-- ========== CẨM NANG THOÁT NƯỚC THÔNG MINH ========== -->
<section class="ttcqn-handbook-section" aria-labelledby="handbook-title">
  

  <div class="ttcqn-handbook-art ttcqn-handbook-art--left" aria-hidden="true">
    <svg viewBox="0 0 250 600" fill="none">
      <path d="M174 0v216c0 22-17 40-39 40H0M174 193h-24M174 213h-24M0 242h66c20 0 36-16 36-36V0M0 269h72c30 0 55-24 55-54V0" stroke="currentColor" stroke-width="2"/>
      <path d="M70 392c0-25 27-44 27-68 0 24 28 43 28 68a27.5 27.5 0 1 1-55 0Z" stroke="#00B8D9" stroke-width="2.4"/>
      <path d="M0 454c61-11 76 36 132 36 54 0 68-61 118-66M0 469c51-10 73 42 132 42 59 0 73-61 118-68M0 484c54-9 71 48 132 48 60 0 73-60 118-68" stroke="currentColor" opacity=".42"/>
      <path d="M58 126c0-11 12-20 12-30 0 10 12 19 12 30a12 12 0 1 1-24 0Z" stroke="currentColor" stroke-width="2"/>
    </svg>
  </div>
  <div class="ttcqn-handbook-art ttcqn-handbook-art--truck" aria-hidden="true">
    <svg viewBox="0 0 500 230" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 151h33l15-61h54l28 30h34V68c0-19 14-33 33-33h113c56 0 91 29 108 72v44h28"/>
      <path d="M181 68h217M188 85h212M213 124V60M321 123V59M404 111h42l18 20v20"/>
      <path d="M113 91v60H55M84 102h28M75 113h32M202 129h204"/>
      <circle cx="92" cy="157" r="29"/><circle cx="92" cy="157" r="13"/>
      <circle cx="233" cy="157" r="29"/><circle cx="233" cy="157" r="13"/>
      <circle cx="391" cy="157" r="29"/><circle cx="391" cy="157" r="13"/>
      <path d="M225 82c0-12 13-22 13-33 0 11 13 21 13 33a13 13 0 1 1-26 0Z" stroke="#25D366"/>
    </svg>
  </div>
  <div class="ttcqn-handbook-art ttcqn-handbook-art--flow" aria-hidden="true">
    <svg viewBox="0 0 610 310" fill="none">
      <path d="M0 284c80-31 170-78 237-86 104-12 128 66 218 54 59-8 87-56 155-76M0 269c76-31 169-81 236-90 111-15 140 66 223 48 54-12 87-66 151-86M2 253c88-45 166-86 231-92 117-12 139 55 222 31 56-17 91-68 155-90M31 238c80-43 145-83 211-90 119-12 138 48 213 19 55-22 91-73 155-93" stroke="#00B8D9" stroke-opacity=".55"/>
      <path d="M134 224c68-33 127-49 175-44 60 7 93 47 145 31" stroke="#9CFF2E" stroke-opacity=".42" stroke-width="2"/>
    </svg>
  </div>
  <div class="ttcqn-handbook-art ttcqn-handbook-art--manhole" aria-hidden="true">
    <svg viewBox="0 0 250 126" fill="none" stroke="currentColor">
      <ellipse cx="125" cy="68" rx="104" ry="47" stroke-width="2.2"/>
      <ellipse cx="125" cy="62" rx="92" ry="39" stroke-width="2"/>
      <ellipse cx="125" cy="61" rx="69" ry="29" stroke-width="1.7"/>
      <path d="M58 59h134M70 48h110M69 70h111M91 37v50M112 34v55M137 34v55M159 38v48" opacity=".75"/>
    </svg>
  </div>
  <div class="ttcqn-handbook-art ttcqn-handbook-art--dots" aria-hidden="true"></div>

  <div class="ttcqn-handbook-container">
    <div class="ttcqn-handbook-header anim">
      <p class="ttcqn-handbook-kicker"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true"><path d="M12 2.5s6 6.4 6 11a6 6 0 1 1-12 0c0-4.6 6-11 6-11Z"/><path d="M9.5 14.5a2.7 2.7 0 0 0 2.7 2.4"/></svg>CẨM NANG THÔNG MINH</p>
      <h2 class="ttcqn-handbook-title" id="handbook-title"><span>CẨM NANG</span> <strong>THOÁT NƯỚC THÔNG MINH</strong></h2>
      <p class="ttcqn-handbook-desc">Nhận biết nhanh các dấu hiệu tắc cống, bể phốt đầy, bồn cầu nghẹt và mùi hôi nhà vệ sinh. Xem hướng dẫn trước khi xử lý để tránh làm sự cố nặng hơn.</p>
    </div>

    <div class="ttcqn-handbook-trust anim" aria-label="Cam kết dịch vụ">
      <article class="ttcqn-handbook-trust-item">
        <span class="ttcqn-handbook-trust-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 6a11 11 0 1 1-9.7 5.8"/><path d="M3 7v7h7"/><path d="M16 10v7l-5 3"/></svg></span>
        <div><h3>Có mặt nhanh</h3><p>Tiếp nhận 05:00-22:00, có mặt chỉ sau 30 phút</p></div>
      </article>
      <article class="ttcqn-handbook-trust-item">
        <span class="ttcqn-handbook-trust-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 3.5 27 8v8c0 6.5-4.6 10.4-11 12.5C9.6 26.4 5 22.5 5 16V8l11-4.5Z"/><path d="m11.2 15.8 3.3 3.3 6.7-7"/></svg></span>
        <div><h3>Không đục phá</h3><p>Công nghệ hiện đại, không khoan cắt</p></div>
      </article>
      <article class="ttcqn-handbook-trust-item">
        <span class="ttcqn-handbook-trust-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 3.5 27 8v8c0 6.5-4.6 10.4-11 12.5C9.6 26.4 5 22.5 5 16V8l11-4.5Z"/><path d="M11.5 16.5 15 20l6.5-8"/><path d="M16 9v3"/></svg></span>
        <div><h3>Bảo hành rõ ràng</h3><p>Bảo hành dịch vụ từ 6–24 tháng</p></div>
      </article>
    </div>

    <?php
    $handbook_cards = [
      [
        'category' => 'TẮC CỐNG',
        'title' => 'Thông tắc cống Giếng Đáy Hạ Long, thợ xử lý tận nơi nhanh',
        'excerpt' => 'Thông tắc cống Giếng Đáy Hạ Long cho nhà dân, nhà trọ, cửa hàng, xử lý nước trào, mùi hôi, cống nghẹt.',
        'href' => home_url('/thong-tac-cong-gieng-day/'),
        'image' => $handbook_images['cong'],
        'alt' => 'Thợ thông tắc cống bằng máy lò xo tại điểm thoát nước ngoài trời',
      ],
      [
        'category' => 'HÚT BỂ PHỐT',
        'title' => 'Thông tắc cống Cao Xanh, không đục phá, có mặt nhanh 15–30 phút',
        'excerpt' => 'Thông tắc cống Cao Xanh, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi.',
        'href' => home_url('/thong-tac-cong-cao-xanh/'),
        'image' => $handbook_images['hutbephot'],
        'alt' => 'Xe hút bể phốt phục vụ hệ thống thoát nước khu công nghiệp',
      ],
      [
        'category' => 'NGHẸT BỒN CẦU',
        'title' => 'Dịch vụ thông tắc cống Bãi Cháy, không đục phá, bảo hành 12 tháng',
        'excerpt' => 'Thông tắc cống Bãi Cháy, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi.',
        'href' => home_url('/thong-tac-cong-bai-chay/'),
        'image' => $handbook_images['boncau'],
        'alt' => 'Thợ thông tắc bồn cầu Bãi Cháy Quảng Ninh bằng thiết bị chuyên dụng',
      ],
      [
        'category' => 'MÙI HÔI NHÀ VỆ SINH',
        'title' => 'Thông tắc cống Hồng Gai Hạ Long, khử mùi hôi triệt để, bảo hành 12 tháng',
        'excerpt' => 'Xử lý mùi hôi nhà vệ sinh, cống thoát sàn, bể phốt. Cam kết hết mùi 100%, không đục phá.',
        'href' => home_url('/thong-tac-cong-hong-gai-2/'),
        'image' => $handbook_images['muihoi'],
        'alt' => 'Thợ kiểm tra đường ống thoát nước dưới chậu rửa',
      ],
      [
        'category' => 'NỘI SOI CAMERA',
        'title' => 'Nội soi camera đường ống – xác định chính xác vị trí tắc nghẽn',
        'excerpt' => 'Công nghệ nội soi hiện đại, xác định đúng nguyên nhân, đề xuất giải pháp tối ưu, tiết kiệm chi phí.',
        'href' => home_url('/blog/'),
        'image' => $handbook_images['camera'],
        'alt' => 'Thợ nội soi camera xác định vị trí tắc trong đường ống',
      ],
      [
        'category' => 'THOÁT NƯỚC NGOÀI TRỜI',
        'title' => 'Hút bể phốt Hải Hà Quảng Ninh, giá rõ trước khi làm',
        'excerpt' => 'Hút bể phốt, thông tắc cống ngoài trời, hệ thống thoát nước khu đô thị, khu công nghiệp, nhà xưởng.',
        'href' => home_url('/hut-be-phot-hai-ha-2/'),
        'image' => $handbook_images['ngoaitroi'],
        'alt' => 'Thợ kiểm tra hố ga và tuyến thoát nước ngoài trời',
      ],
    ];
    ?>
    <div class="ttcqn-handbook-grid anim">
      <?php foreach ($handbook_cards as $handbook_card) : ?>
        <article class="ttcqn-handbook-card">
          <a href="<?php echo esc_url($handbook_card['href']); ?>" class="ttcqn-handbook-card-link" aria-label="<?php echo esc_attr('Đọc hướng dẫn: ' . $handbook_card['title']); ?>">
            <div class="ttcqn-handbook-img-wrapper">
              <img src="<?php echo esc_url($handbook_card['image']); ?>" alt="<?php echo esc_attr($handbook_card['alt']); ?>" width="380" height="160" loading="lazy" decoding="async">
            </div>
            <div class="ttcqn-handbook-content">
              <span class="ttcqn-handbook-cat"><?php echo esc_html($handbook_card['category']); ?></span>
              <h3 class="ttcqn-handbook-post-title"><?php echo esc_html($handbook_card['title']); ?></h3>
              <p class="ttcqn-handbook-post-desc"><?php echo esc_html($handbook_card['excerpt']); ?></p>
              <span class="ttcqn-handbook-cta">
                Đọc hướng dẫn
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
            </div>
          </a>
        </article>
      <?php endforeach; ?>
    </div>

    <div class="ttcqn-handbook-footer anim">
      <a href="<?php echo esc_url(home_url('/blog/')); ?>" class="ttcqn-handbook-all-btn">Xem tất cả cẩm nang <span aria-hidden="true">→</span></a>
    </div>
  </div>
</section>

<!-- ========== KÊNH GỬI ĐÁNH GIÁ DỊCH VỤ ========== -->
<section class="ttcqn-reviews-section" aria-labelledby="review-title">
  <div class="ttcqn-reviews-bg" aria-hidden="true">
    <svg class="ttcqn-reviews-pipe" viewBox="0 0 260 260" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 42h66c24 0 36 12 36 36v56c0 22 12 34 34 34h58"/><path d="M18 82h52c14 0 20 7 20 20v45c0 35 22 57 58 57h64"/><path d="M42 20v44M78 22v72M154 146v44"/><path d="M122 66h54c24 0 38 14 38 38v48"/><path d="M81 137c-14 17-24 29-24 44 0 14 11 25 25 25s25-11 25-25c0-15-11-27-26-44Z"/></svg>
    <svg class="ttcqn-reviews-drop" viewBox="0 0 220 220" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M110 22c-34 41-63 72-63 112 0 34 27 62 63 62s63-28 63-62c0-40-29-71-63-112Z"/><path d="M82 131c22-3 40-19 55-50"/><path d="M78 157h66M92 174h38"/><path d="M138 44c25 7 43 25 51 48"/></svg>
    <svg class="ttcqn-reviews-map" viewBox="0 0 220 150" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 90 64 62l38 14 38-42 56 24-24 54-54-10-42 30-52-42Z"/><path d="M64 62v58M102 76l16 26M140 34l32 78"/><circle cx="142" cy="58" r="5" fill="currentColor"/></svg>
    <svg class="ttcqn-reviews-wave" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 92c150-64 260 44 420-10s254-64 424 0 296 52 596-20"/><path d="M0 126c150-64 260 44 420-10s254-64 424 0 296 52 596-20" opacity=".65"/><path d="M0 60c150-64 260 44 420-10s254-64 424 0 296 52 596-20" opacity=".45"/></svg>
  </div>
  <div class="ttcqn-reviews-container">
    <div class="ttcqn-reviews-header">
      <span class="ttcqn-reviews-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4c-7.5.3-12.5 3.2-14.7 8.8C3.7 16.8 6.7 20 10.6 19.4 16.2 18.5 19.7 12.6 20 4Z"/><path d="M6 18c3.8-5 7.8-8 12-9"/></svg>ĐÁNH GIÁ DỊCH VỤ</span>
      <h2 class="ttcqn-reviews-title anim" id="review-title">CHIA SẺ <span>TRẢI NGHIỆM</span></h2>
      <p class="ttcqn-reviews-desc anim">Chúng tôi chỉ công khai phản hồi do khách hàng thực tế gửi và không hiển thị điểm sao tổng hợp khi chưa có dữ liệu được xác minh.</p>
      <div class="ttcqn-reviews-underline" aria-hidden="true"></div>
    </div>

    <div class="ttcqn-reviews-grid">
      <article class="ttcqn-review-card">
        <div class="ttcqn-review-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v6h-6"/><path d="m8 12 2.5 2.5L16 9"/></svg>
        </div>
        <h3 class="ttcqn-review-card-title">Đánh giá trên Google</h3>
        <p class="ttcqn-review-text">Khách hàng đã sử dụng dịch vụ có thể gửi nhận xét trực tiếp trên hồ sơ Google của doanh nghiệp.</p>
        <a class="ttcqn-review-card-link" href="https://g.page/r/CQSOCygK1e8sEAE/review" rel="noopener noreferrer">Gửi đánh giá <span aria-hidden="true">→</span></a>
      </article>

      <article class="ttcqn-review-card">
        <div class="ttcqn-review-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2C10 20.6 3.4 14 2.5 4.2A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>
        </div>
        <h3 class="ttcqn-review-card-title">Phản hồi trực tiếp</h3>
        <p class="ttcqn-review-text">Gọi hotline để góp ý về thái độ phục vụ, chất lượng thi công hoặc chi phí đã được báo.</p>
        <a class="ttcqn-review-card-link" href="<?php echo esc_url($primary_hotline_href); ?>">Gọi 0963.953.533 <span aria-hidden="true">→</span></a>
      </article>

      <article class="ttcqn-review-card">
        <div class="ttcqn-review-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h3 class="ttcqn-review-card-title">Yêu cầu bảo hành</h3>
        <p class="ttcqn-review-text">Nếu công việc phát sinh vấn đề trong thời hạn cam kết, hãy gửi yêu cầu để đội kỹ thuật kiểm tra.</p>
        <a class="ttcqn-review-card-link" href="<?php echo esc_url($home_internal_links['warranty']); ?>">Xem chính sách <span aria-hidden="true">→</span></a>
      </article>
    </div>
  </div>
</section>

<?php
$team_photo_url = '/wp-content/uploads/team/doi-ngu-moi-truong-do-thi-so-1-quang-ninh.webp';
$team_avatar_base = '/wp-content/plugins/ttcqn-home-emergency-renderer/assets/avatars/';
$team_members = [
    [
        'name' => 'Nguyễn Song Hào',
        'role' => 'Giám đốc vận hành & dẫn dắt đội ngũ',
        'specialty' => 'Điều phối nhân sự, kiểm soát chất lượng dịch vụ.',
        'bio' => 'Nguyễn Song Hào là người dẫn dắt đội ngũ Môi Trường Đô Thị Số 1 Quảng Ninh, phụ trách điều phối nhân sự, kiểm soát chất lượng dịch vụ và xây dựng quy trình phục vụ khách hàng. Anh đảm bảo mọi yêu cầu được tiếp nhận nhanh, phân công đúng kỹ thuật viên và xử lý gọn.',
        'avatar' => 'avatar-nguyen-song-hao.webp',
        'url' => $home_internal_links['profile_nguyen_song_hao'],
        'leader' => true,
    ],
    [
        'name' => 'Lê Hữu Ninh',
        'role' => 'Trưởng bộ phận kỹ thuật thông tắc',
        'specialty' => 'Thông tắc cống, bồn cầu, chậu rửa.',
        'bio' => 'Lê Hữu Ninh phụ trách các ca xử lý thông tắc cống, thông tắc bồn cầu, chậu rửa và hệ thống đường ống dân dụng. Anh tập trung vào phương án thi công hạn chế đục phá và xử lý đúng nguyên nhân gây tắc.',
        'avatar' => 'avatar-le-huu-ninh.webp',
        'avatar_alt' => 'Lê Hữu Ninh phụ trách kỹ thuật thông tắc cống Quảng Ninh',
        'url' => $home_internal_links['about'],
        'leader' => false,
    ],
    [
        'name' => 'Nguyễn Tâm An',
        'role' => 'Quản lý xe hút bể phốt & thiết bị',
        'specialty' => 'Xe hút bể phốt, thiết bị hút chân không.',
        'bio' => 'Nguyễn Tâm An quản lý xe hút bể phốt, thiết bị hút chân không và phương án thi công tại hộ gia đình, nhà trọ, khách sạn, nhà hàng và công trình.',
        'avatar' => 'avatar-nguyen-tam-an.webp',
        'url' => $home_internal_links['about'],
        'leader' => false,
    ],
    [
        'name' => 'Lê Quốc Quang',
        'role' => 'Quản lý nạo vét hố ga & công trình',
        'specialty' => 'Nạo vét hố ga, thông tuyến thoát nước.',
        'bio' => 'Lê Quốc Quang phụ trách các hạng mục nạo vét hố ga, thông tuyến thoát nước, xử lý bùn đất, rác thải và mùi hôi tại khu dân cư, nhà hàng, khách sạn và cơ sở kinh doanh.',
        'avatar' => 'avatar-le-quoc-quang.webp',
        'url' => $home_internal_links['about'],
        'leader' => false,
    ],
    [
        'name' => 'Nguyễn Thu Hà',
        'role' => 'Quản lý chăm sóc khách hàng & bảo hành',
        'specialty' => 'Chăm sóc khách hàng, bảo hành, tiếp nhận phản hồi.',
        'bio' => 'Nguyễn Thu Hà phụ trách tiếp nhận phản hồi sau thi công, theo dõi bảo hành và ghi nhận đánh giá khách hàng. Chị đảm bảo các vấn đề phát sinh được xử lý đúng cam kết.',
        'avatar' => 'avatar-nguyen-thu-ha-20260529.webp',
        'url' => $home_internal_links['about'],
        'leader' => false,
    ],
];

// Fallback dynamic to plugin assets if uploads don't exist yet (very safe!)
if (function_exists('plugins_url') && basename(__DIR__) === 'templates') {
    $home_renderer_main_file = dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php';
    $home_renderer_team_dir = dirname(__DIR__) . '/assets/team';
    if (file_exists($home_renderer_team_dir . '/doi-ngu-moi-truong-do-thi-so-1-quang-ninh.webp')) {
        $team_photo_url = plugins_url('assets/team/doi-ngu-moi-truong-do-thi-so-1-quang-ninh.webp', $home_renderer_main_file);
    }
    $home_renderer_avatar_dir = dirname(__DIR__) . '/assets/avatars';
    if (file_exists($home_renderer_avatar_dir . '/avatar-nguyen-song-hao.webp')) {
        $team_avatar_base = plugins_url('assets/avatars/', $home_renderer_main_file);
    }
}
?>

<!-- ========== ĐỘI NGŨ & HÌNH ẢNH ĐỘI NGŨ (PREFIX: mtdt-about-) ========== -->


<section class="mtdt-about-team-section" aria-label="Đội ngũ quản lý Môi Trường Đô Thị Số 1 Quảng Ninh" id="doi-ngu">
  <div class="mtdt-about-container">
    <div class="mtdt-about-team-grid">
      <?php foreach ($team_members as $team_member) : ?>
      <article class="mtdt-about-member-card<?php echo !empty($team_member['leader']) ? ' is-leader' : ''; ?>">
        <div class="mtdt-about-avatar-container">
          <div class="mtdt-about-avatar-wrap">
            <?php if (!empty($team_member['leader'])) : ?>
              <svg class="mtdt-about-crown" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M5.2 24.5h21.6l1.6-13.9-7 4.7L16 6.2l-5.4 9.1-7-4.7 1.6 13.9Z"/>
                <path d="M6.1 27.2c0-.9.7-1.6 1.6-1.6h16.6c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6H7.7c-.9 0-1.6-.7-1.6-1.6Z"/>
              </svg>
            <?php endif; ?>
            <img class="mtdt-about-avatar" src="<?php echo esc_url($team_avatar_base . $team_member['avatar']); ?>" alt="<?php echo esc_attr($team_member['avatar_alt'] ?? ($team_member['name'] . ' - ' . $team_member['role'])); ?>" width="360" height="360" loading="lazy" decoding="async">
          </div>
        </div>
        <div class="mtdt-about-member-content">
          <h3 class="mtdt-about-member-name">
            <a href="<?php echo esc_url($team_member['url']); ?>" rel="author" title="<?php echo esc_attr('Hồ sơ tác giả ' . $team_member['name']); ?>">
              <?php echo esc_html($team_member['name']); ?>
            </a>
          </h3>
          <p class="mtdt-about-member-role"><?php echo esc_html($team_member['role']); ?></p>
          <div class="mtdt-about-member-specialty">
            <strong>Chuyên môn:</strong>&nbsp;<?php echo esc_html($team_member['specialty']); ?>
          </div>
          <p class="mtdt-about-member-bio">
            <?php echo esc_html($team_member['bio']); ?>
          </p>
          <div class="mtdt-about-member-footer">
            <a href="<?php echo esc_url($team_member['url']); ?>" class="mtdt-about-profile-btn" rel="author" title="<?php echo esc_attr('Hồ sơ tác giả ' . $team_member['name']); ?>">
              Xem hồ sơ
            </a>
          </div>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ========== HÌNH ẢNH ĐỘI NGŨ THỰC TẾ (PREFIX: mtdt-about-) ========== -->
<!-- ========== GALLERY ẢNH THI CÔNG THỰC TẾ ========== -->
<section class="ttcqn-work-gallery-section" aria-labelledby="work-gallery-title" id="hinh-anh-doi-ngu">
  <div class="mtdt-about-container">
    <header class="mtdt-about-header">
      <div class="mtdt-about-badge-wrap">
        <span class="mtdt-about-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Hình ảnh thi công từ công trình
        </span>
      </div>
      <h2 class="mtdt-about-section-title" id="work-gallery-title">
        Hình ảnh thi công <span class="mtdt-about-title-highlight">thực tế</span>
      </h2>
      <div class="mtdt-about-title-line">
        <div class="mtdt-about-line-blue"></div>
        <div class="mtdt-about-line-green"></div>
      </div>
      <p class="mtdt-about-desc">
        Công trình thực tế Môi Trường Đô Thị Số 1 Quảng Ninh đã xử lý tại Hạ Long, Cẩm Phả, Uông Bí, Đông Triều và các khu vực lân cận.
      </p>
    </header>

    <div class="ttcqn-work-gallery-grid">
      <?php foreach ($completed_projects as $gproj) : ?>
      <div class="ttcqn-work-gallery-item">
        <img src="<?php echo esc_url($gproj['image']); ?>" alt="<?php echo esc_attr($gproj['alt']); ?>" loading="lazy" decoding="async" width="900" height="675">
        <div class="ttcqn-work-gallery-label">
          <span class="ttcqn-work-gallery-service"><?php echo esc_html($gproj['service']); ?></span>
          <span class="ttcqn-work-gallery-area">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s7-5.3 7-12a7 7 0 0 0-14 0c0 6.7 7 12 7 12Z"/></svg>
            <?php echo esc_html($gproj['area']); ?>
          </span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php
$septic_truck_watermark = ttcqn_seo_hero_asset('assets/septic-truck-real.webp');
$halong_bay_watermark = ttcqn_seo_hero_asset('assets/region-section/phuc-vu-24-7-quang-ninh-bg-desktop.webp');
?>
<!-- ========== ĐỐI TÁC / KHÁCH HÀNG TIÊU BIỂU ========== -->


<section class="ttcqn-trust-section" aria-labelledby="partner-title" id="doi-tac">
  <!-- Watermarks -->
  <img class="ttcqn-trust-watermark-left" src="<?php echo esc_url($septic_truck_watermark); ?>" alt="Watermark Xe Hút Bể Phốt" width="300" height="200" loading="lazy" decoding="async">
  <img class="ttcqn-trust-watermark-right" src="<?php echo esc_url($halong_bay_watermark); ?>" alt="Watermark Vịnh Hạ Long" width="400" height="250" loading="lazy" decoding="async">

  <div class="ttcqn-trust-container">
    <!-- Header -->
    <header class="ttcqn-trust-header">
      <div class="ttcqn-trust-badge-wrap">
        <span class="ttcqn-trust-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Tiếp nhận 05:00-22:00 tại Quảng Ninh
        </span>
      </div>
      <h2 class="ttcqn-trust-title" id="partner-title">
        Đối tác lâu năm & <span class="ttcqn-trust-title-highlight">khách hàng tiêu biểu</span>
      </h2>
      <div class="ttcqn-trust-title-line">
        <span class="ttcqn-trust-line-blue"></span>
        <span class="ttcqn-trust-line-green"></span>
      </div>
      <p class="ttcqn-trust-desc">
        Chúng tôi phục vụ nhiều nhóm khách hàng tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái và các khu vực lân cận tại Quảng Ninh.
      </p>
    </header>

    <!-- Grid 8 Logos Đối Tác -->
    <div class="ttcqn-trust-logo-grid" aria-label="Logo đối tác lâu năm">
      <!-- Card 1: Vinpearl -->
      <div class="ttcqn-trust-logo-card" title="Vinpearl Resort & Spa">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo Vinpearl Resort & Spa">
          <path d="M80 5 C82 15 88 18 92 20 C85 20 80 16 80 12 C80 16 75 20 68 20 C72 18 78 15 80 5 Z" fill="#b08d57"/>
          <text x="80" y="32" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-weight="bold" font-size="10" fill="#202224" text-anchor="middle" letter-spacing="1">VINPEARL</text>
          <text x="80" y="42" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-size="6" fill="#808080" text-anchor="middle" letter-spacing="0.5">RESORT & SPA</text>
        </svg>
      </div>
      <!-- Card 2: FLC -->
      <div class="ttcqn-trust-logo-card" title="FLC Hotels & Resorts">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo FLC Hotels & Resorts">
          <g transform="translate(47, 5)">
            <path d="M11 0 L22 11 L11 22 L0 11 Z" fill="#005ea6"/>
            <text x="11" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" font-size="11" fill="#fff" text-anchor="middle">F</text>
          </g>
          <g transform="translate(69, 5)">
            <path d="M11 0 L22 11 L11 22 L0 11 Z" fill="#005ea6"/>
            <text x="11" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" font-size="11" fill="#fff" text-anchor="middle">L</text>
          </g>
          <g transform="translate(91, 5)">
            <path d="M11 0 L22 11 L11 22 L0 11 Z" fill="#005ea6"/>
            <text x="11" y="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" font-size="11" fill="#fff" text-anchor="middle">C</text>
          </g>
          <text x="80" y="40" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-weight="bold" font-size="7" fill="#b08d57" text-anchor="middle" letter-spacing="1">HOTELS & RESORTS</text>
        </svg>
      </div>
      <!-- Card 3: Mường Thanh -->
      <div class="ttcqn-trust-logo-card" title="Mường Thanh Hospitality">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo Mường Thanh Hospitality">
          <path d="M60 18 C65 12 75 12 80 18 C85 12 95 12 100 18 C92 16 85 18 80 23 C75 18 68 16 60 18 Z" fill="#b08d57"/>
          <path d="M70 23 C75 20 78 20 80 23 C82 20 85 20 90 23 C85 22 82 23 80 26 C78 23 75 22 70 23 Z" fill="#b08d57"/>
          <text x="80" y="37" font-family="-apple-system, BlinkMacSystemFont, Georgia, serif" font-weight="bold" font-size="8" fill="#3a3022" text-anchor="middle" letter-spacing="1.5">MƯỜNG THANH</text>
          <text x="80" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="5" fill="#808080" text-anchor="middle" letter-spacing="1">HOSPITALITY</text>
        </svg>
      </div>
      <!-- Card 4: Wyndham -->
      <div class="ttcqn-trust-logo-card" title="Wyndham Legend Halong">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo Wyndham Legend Halong">
          <rect x="25" y="12" width="24" height="24" fill="#0072c6" rx="2"/>
          <path d="M31 18 L35 30 L39 18 L43 30 L47 18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <text x="56" y="24" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-weight="900" font-size="12" fill="#0072c6" letter-spacing="0.5">WYNDHAM</text>
          <text x="56" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="7" fill="#666" letter-spacing="0.2">Legend Halong</text>
        </svg>
      </div>
      <!-- Card 5: BIM Group -->
      <div class="ttcqn-trust-logo-card" title="BIM Group">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo BIM Group">
          <text x="80" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Times New Roman', serif" font-style="italic" font-weight="bold" font-size="20" fill="#006c3a" text-anchor="middle">BIM <tspan font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-style="normal" font-weight="normal" font-size="14" fill="#666">Group</tspan></text>
        </svg>
      </div>
      <!-- Card 6: Sun Group -->
      <div class="ttcqn-trust-logo-card" title="Sun Group">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo Sun Group">
          <g transform="translate(30, 10)">
            <circle cx="15" cy="15" r="7" fill="#f58220"/>
            <path d="M15 2 L15 6 M15 24 L15 28 M2 15 L6 15 M24 15 L28 15 M6 6 L9 9 M21 21 L24 24 M6 24 L9 21 M21 9 L24 6" stroke="#f58220" stroke-width="2"/>
          </g>
          <text x="65" y="29" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-weight="900" font-size="13" fill="#f58220">SUN GROUP</text>
        </svg>
      </div>
      <!-- Card 7: TPG Hospitality -->
      <div class="ttcqn-trust-logo-card" title="TPG Hospitality">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo TPG Hospitality">
          <path d="M35 15 L47 35 L23 35 Z" fill="#b08d57"/>
          <path d="M35 20 L43 32 L27 32 Z" fill="#ffffff"/>
          <text x="56" y="28" font-family="-apple-system, BlinkMacSystemFont, Georgia, serif" font-weight="bold" font-size="16" fill="#1b2530" letter-spacing="1">TPG</text>
          <text x="56" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="5" fill="#808080" letter-spacing="1.5">HOSPITALITY</text>
        </svg>
      </div>
      <!-- Card 8: Novotel -->
      <div class="ttcqn-trust-logo-card" title="Novotel Hotels & Resorts">
        <svg viewBox="0 0 160 50" width="100%" height="100%" aria-label="Logo Novotel Hotels & Resorts">
          <text x="80" y="28" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-weight="bold" font-size="15" fill="#002b66" text-anchor="middle" letter-spacing="2">NOVOTEL</text>
          <text x="80" y="38" font-family="-apple-system, BlinkMacSystemFont, Montserrat, sans-serif" font-size="5.5" fill="#002b66" text-anchor="middle" letter-spacing="1">HOTELS & RESORTS</text>
        </svg>
      </div>
    </div>

    <!-- Dòng Trust / Social Proof -->
    <div class="ttcqn-trust-proof-line">
      <span class="ttcqn-trust-proof-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      <span>Hơn <strong>1.000+ doanh nghiệp & hộ gia đình</strong> đã tin tưởng và sử dụng dịch vụ của chúng tôi</span>
    </div>

    <!-- Lưới 6 Card Nhóm Khách Hàng -->
    <div class="ttcqn-trust-clients-grid">
      <!-- Card 1: Nhà hàng -->
      <article class="ttcqn-trust-client-card">
        <div class="ttcqn-trust-card-icon-container">
          <div class="ttcqn-trust-card-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M5 2v5M7 2v5M16 2c-1.5 0-3 1.3-3 3.5V11a3 3 0 0 0 6 0V5.5c0-2.2-1.5-3.5-3-3.5zM16 14v7M6 11v10h2V11"/></svg>
          </div>
          <span class="ttcqn-trust-card-check">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
        <h3>Nhà hàng & quán ăn</h3>
        <p>Xử lý tắc chậu rửa, đường ống bếp, hố ga, dầu mỡ và mùi hôi khu vực bếp.</p>
      </article>

      <!-- Card 2: Khách sạn -->
      <article class="ttcqn-trust-client-card">
        <div class="ttcqn-trust-card-icon-container">
          <div class="ttcqn-trust-card-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V2h18v20M9 6h6M9 10h6M9 14h6M9 18h6"/></svg>
          </div>
          <span class="ttcqn-trust-card-check">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
        <h3>Khách sạn & homestay</h3>
        <p>Hỗ trợ bồn cầu, thoát sàn, nhà vệ sinh và hệ thống thoát nước phòng lưu trú.</p>
      </article>

      <!-- Card 3: Nhà trọ -->
      <article class="ttcqn-trust-client-card">
        <div class="ttcqn-trust-card-icon-container">
          <div class="ttcqn-trust-card-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2v2H9V9zm0 4h2v2H9v-2zm4-4h2v2h-2V9zm0 4h2v2h-2v-2z"/></svg>
          </div>
          <span class="ttcqn-trust-card-check">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
        <h3>Nhà trọ & chung cư mini</h3>
        <p>Phù hợp công trình nhiều người dùng, dễ phát sinh tắc nghẽn và quá tải bể phốt.</p>
      </article>

      <!-- Card 4: Hộ gia đình -->
      <article class="ttcqn-trust-client-card">
        <div class="ttcqn-trust-card-icon-container">
          <div class="ttcqn-trust-card-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="3"/><path d="M15 21v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 1v1"/></svg>
          </div>
          <span class="ttcqn-trust-card-check">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
        <h3>Hộ gia đình</h3>
        <p>Có mặt trong ngày, xử lý bồn cầu nghẹt, chậu rửa thoát chậm, mùi hôi trong nhà.</p>
      </article>

      <!-- Card 5: Doanh nghiệp -->
      <article class="ttcqn-trust-client-card">
        <div class="ttcqn-trust-card-icon-container">
          <div class="ttcqn-trust-card-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18M3 9l3-6h12l3 6M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M9 22V12h6v10"/></svg>
          </div>
          <span class="ttcqn-trust-card-check">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
        <h3>Cơ sở kinh doanh</h3>
        <p>Hỗ trợ ngoài giờ, hạn chế gián đoạn hoạt động và ảnh hưởng khách ra vào.</p>
      </article>

      <!-- Card 6: Khu dân cư -->
      <article class="ttcqn-trust-client-card">
        <div class="ttcqn-trust-card-icon-container">
          <div class="ttcqn-trust-card-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20M4 22V6l8-4 8 4v16M8 18h2v4H8v-4zm6-6h2v2h-2v-2zm0 4h2v2h-2v-2zm-6-4h2v2H8v-2zm0 4h2v2H8v-2z"/></svg>
          </div>
          <span class="ttcqn-trust-card-check">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
        <h3>Công trình & khu dân cư</h3>
        <p>Nạo vét hố ga, thông tuyến thoát nước, xử lý mùi hôi theo từng khu vực.</p>
      </article>
    </div>

    <!-- Khối Banner CTA Ở Cuối -->
    <div class="ttcqn-trust-cta-banner">
      <div class="ttcqn-trust-cta-left">
        <div class="ttcqn-trust-cta-phone-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2C10 20.6 3.4 14 2.5 4.2A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>
        </div>
        <div class="ttcqn-trust-cta-text">
          <h3>Bạn cần thông tắc cống, hút bể phốt gấp?</h3>
          <p>Đội ngũ kỹ thuật có mặt nhanh 15 – 30 phút tại Quảng Ninh</p>
        </div>
      </div>

      <div class="ttcqn-trust-cta-mid">
        <a href="tel:0963953533" class="ttcqn-trust-btn-green" aria-label="Gọi ngay hotline 0963.953.533">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Gọi ngay 0963.953.533
        </a>
        <span class="ttcqn-trust-cta-sub">Tư vấn & báo giá miễn phí 05:00-22:00</span>
      </div>

      <div class="ttcqn-trust-cta-right">
        <a href="https://zalo.me/0931156756" target="_blank" rel="nofollow noopener noreferrer" class="ttcqn-trust-btn-blue" aria-label="Tư vấn nhanh qua Zalo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          Tư vấn nhanh
        </a>
        <span class="ttcqn-trust-cta-sub">Chat Zalo - Phản hồi ngay</span>
      </div>
    </div>

    <!-- Hàng 4 USP/Cam kết -->
    <div class="ttcqn-trust-usps">
      <div class="ttcqn-trust-usp">
        <span class="ttcqn-trust-usp-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </span>
        <span>Có mặt nhanh 15 – 30 phút</span>
      </div>
      <div class="ttcqn-trust-usp">
        <span class="ttcqn-trust-usp-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </span>
        <span>Thiết bị hiện đại, không đục phá</span>
      </div>
      <div class="ttcqn-trust-usp">
        <span class="ttcqn-trust-usp-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
        </span>
        <span>Giá thành minh bạch, hợp lý</span>
      </div>
      <div class="ttcqn-trust-usp">
        <span class="ttcqn-trust-usp-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        <span>Bảo hành từ 6 – 12 tháng</span>
      </div>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section class="section-gray section-wave-bottom wave-to-blue" aria-labelledby="faq-title">
  <div class="section-title-wrap">
    <h2 class="section-title anim" id="faq-title"><span class="text-blue">CÂU HỎI THƯỜNG GẶP</span></h2>
  </div>
  <p class="section-desc anim">Nếu bạn đang phân vân nên gọi lúc nào, có phải đục phá không hay giá thực tế ra sao, phần này sẽ giúp bạn rõ ngay.</p>
  <details class="faq-item anim"><summary>Giá hút bể phốt tại Quảng Ninh bao nhiêu?</summary><p>Giá thường từ 200.000đ đến 2.000.000đ tùy dung tích bể và vị trí thi công. Thợ sẽ khảo sát, báo giá trước rồi bạn mới quyết định làm hay không.</p></details>
  <details class="faq-item anim"><summary>Thông tắc bồn cầu có phải đục phá không?</summary><p>Thường là không. Với đa số trường hợp, thợ dùng máy chuyên dụng để xử lý từ bên ngoài, chỉ đục phá khi tình trạng quá đặc biệt và phải báo trước cho bạn.</p></details>
  <details class="faq-item anim"><summary>Có hỗ trợ sát giờ đóng hoặc ngoài khung tiếp nhận không?</summary><p>Đơn vị tiếp nhận trong khung giờ 05:00-22:00 hằng ngày. Nếu sự cố phát sinh sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi hotline để được xác nhận khả năng điều phối thực tế.</p></details>
  <details class="faq-item anim"><summary>Thời gian có mặt sau khi gọi bao lâu?</summary><p>Ở Hạ Long thường rất nhanh, các khu vực khác như Cẩm Phả, Uông Bí hay Quảng Yên sẽ được báo thời gian cụ thể ngay lúc tiếp nhận để bạn chủ động chờ thợ.</p></details>
  <details class="faq-item anim"><summary>Có bảo hành sau khi xử lý không?</summary><p>Có. Tùy từng dịch vụ và tình trạng thực tế, thợ sẽ nói rõ thời gian bảo hành ngay từ đầu để bạn yên tâm sử dụng.</p></details>
  <details class="faq-item anim"><summary>Phục vụ khu vực nào tại Quảng Ninh?</summary><p>Chúng tôi phục vụ toàn tỉnh Quảng Ninh, gồm Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn, Tiên Yên và các khu vực lân cận.</p></details>
</section>


<!-- ========== FOOTER ========== -->
</main><!-- /#main-content -->

<footer class="home-footer" id="footer" role="contentinfo">
  <svg class="footer-icon-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <symbol id="ft-headset" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 12v4a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Z"/><path d="M20 12v4a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z"/><path d="M16 20c-1 .7-2.3 1-4 1"/></symbol>
    <symbol id="ft-phone" viewBox="0 0 24 24"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2c-9.8-.9-16.4-7.5-17.3-17.3A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></symbol>
    <symbol id="ft-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m8.7 12 2.2 2.2 4.6-5"/></symbol>
    <symbol id="ft-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></symbol>
    <symbol id="ft-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></symbol>
    <symbol id="ft-pin" viewBox="0 0 24 24"><path d="M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.4"/></symbol>
    <symbol id="ft-truck" viewBox="0 0 24 24"><path d="M3 7h10v9H3z"/><path d="M13 10h4l4 4v2h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M6 7V5h5v2"/></symbol>
    <symbol id="ft-wrench" viewBox="0 0 24 24"><path d="M15.8 5.2a5 5 0 0 0 3 6.5L9.5 21 3 14.5l9.3-9.3a5 5 0 0 0 6.5 3Z"/><path d="m6.6 15.4 2 2"/></symbol>
    <symbol id="ft-toilet" viewBox="0 0 24 24"><path d="M7 3h9v6a4 4 0 0 1-4 4H9a2 2 0 0 1-2-2Z"/><path d="M6 13h11v1a5 5 0 0 1-5 5H9a3 3 0 0 1-3-3Z"/><path d="M9 19v2h6"/></symbol>
    <symbol id="ft-sink" viewBox="0 0 24 24"><path d="M5 12h14v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5Z"/><path d="M12 12V5a2 2 0 0 1 2-2h2"/><path d="M8 21h8"/><path d="M8 8h8"/></symbol>
    <symbol id="ft-manhole" viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="8" ry="4"/><path d="M4 8v7c0 2.2 3.6 4 8 4s8-1.8 8-4V8"/><path d="M8 8h8M7 12h10M8 16h8"/></symbol>
    <symbol id="ft-leaf" viewBox="0 0 24 24"><path d="M20 4c-7.5.3-12.5 3.2-14.7 8.8C3.7 16.8 6.7 20 10.6 19.4 16.2 18.5 19.7 12.6 20 4Z"/><path d="M6 18c3.8-5 7.8-8 12-9"/></symbol>
    <symbol id="ft-home" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></symbol>
    <symbol id="ft-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><path d="M12 7h.01"/></symbol>
    <symbol id="ft-tag" viewBox="0 0 24 24"><path d="M20 12 12 20 4 12V4h8Z"/><circle cx="8.5" cy="8.5" r="1.2"/></symbol>
    <symbol id="ft-images" viewBox="0 0 24 24"><rect x="3" y="5" width="15" height="13" rx="2"/><path d="M7 14l3-3 4 4"/><circle cx="8" cy="9" r="1.2"/><path d="M8 21h11a2 2 0 0 0 2-2V9"/></symbol>
    <symbol id="ft-news" viewBox="0 0 24 24"><path d="M4 5h14a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2Z"/><path d="M8 9h8M8 13h8M8 17h5"/></symbol>
    <symbol id="ft-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M21 21v-2a3.6 3.6 0 0 0-3-3.6"/><path d="M16 3.2a4 4 0 0 1 0 7.6"/></symbol>
    <symbol id="ft-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.2 12.2 2.4 2.4 5.2-5.2"/></symbol>
    <symbol id="ft-arrow-up" viewBox="0 0 24 24"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></symbol>
    <symbol id="ft-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
    <symbol id="ft-logo" viewBox="0 0 88 88"><path d="M44 7c-12 14-27 20-27 39 0 14.4 11.6 26 27 26s27-11.6 27-26C71 27 56 21 44 7Z" fill="none" stroke="currentColor" stroke-width="5"/><path d="M30 47c9-1 17-8 23-21" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M29 55h30M35 64h18" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M26 72h36" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></symbol>
    <symbol id="ft-facebook" viewBox="0 0 24 24"><path fill="currentColor" d="M14.2 8.2V6.9c0-.7.5-1.1 1.3-1.1h2.1V2.2A28 28 0 0 0 14.5 2c-3.1 0-5.2 1.9-5.2 5.4v.8H6v4h3.3V22h4.1v-9.8h3.4l.5-4h-3.1Z"/></symbol>
    <symbol id="ft-zalo" viewBox="0 0 24 24"><rect x="2.5" y="3" width="19" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15.6" text-anchor="middle" font-size="7.8" font-family="Arial, sans-serif" font-weight="900" fill="currentColor">Zalo</text></symbol>
    <symbol id="ft-youtube" viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 7.3a3 3 0 0 0-2.1-2.1C17.6 4.7 12 4.7 12 4.7s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.7 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.7ZM10 15.5v-7l6 3.5-6 3.5Z"/></symbol>
    <symbol id="ft-tiktok" viewBox="0 0 24 24"><path fill="currentColor" d="M16.8 2c.4 2.8 2 4.5 4.7 4.7v3.6a8 8 0 0 1-4.6-1.4v6.3c0 4-2.7 6.8-6.7 6.8A6.3 6.3 0 0 1 4 15.6a6.2 6.2 0 0 1 7.3-6.1v3.8a2.7 2.7 0 1 0 1.8 2.6V2h3.7Z"/></symbol>
  </svg>

  <div class="footer-shell">
    <section class="footer-support" aria-label="Hỗ trợ nhanh 05:00-22:00">
      <div class="footer-support-head">
        <span class="footer-headset" aria-hidden="true"><svg class="footer-icon"><use href="#ft-headset"></use></svg></span>
        <div>
          <p class="footer-support-kicker">Cần hỗ trợ ngay?</p>
          <p class="footer-support-title">Gọi chúng tôi 05:00-22:00</p>
        </div>
      </div>
      <a class="footer-support-cta-mobile" href="tel:0931156756" aria-label="Gọi ngay 0931.156.756">
        <svg class="footer-icon" aria-hidden="true"><use href="#ft-phone"></use></svg>
        GỌI NGAY: 0931.156.756
      </a>
      <div class="footer-support-items">
        <article class="footer-support-item">
          <span class="footer-support-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-phone"></use></svg></span>
          <div>
            <p class="footer-support-label">Hotline</p>
            <p class="footer-support-main">0931.156.756</p>
            <p class="footer-support-note">Tư vấn nhanh - Có mặt sau ít phút</p>
          </div>
        </article>
        <article class="footer-support-item">
          <span class="footer-support-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-shield"></use></svg></span>
          <div>
            <p class="footer-support-label">Cam kết</p>
            <p class="footer-support-main">Minh bạch - Không phát sinh</p>
            <p class="footer-support-note">Báo giá rõ ràng trước khi thi công</p>
          </div>
        </article>
        <article class="footer-support-item">
          <span class="footer-support-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-clock"></use></svg></span>
          <div>
            <p class="footer-support-label">Phục vụ</p>
            <p class="footer-support-main">05:00-22:00 hằng ngày</p>
            <p class="footer-support-note">Hỗ trợ khẩn cấp mọi lúc mọi nơi</p>
          </div>
        </article>
      </div>
      <figure class="footer-support-media" aria-label="Xe hút bể phốt và kỹ thuật viên">
        <img class="footer-truck-img" src="<?php echo esc_url($hero_truck_url); ?>" alt="Xe hút bể phốt chuyên dụng màu xanh phục vụ tại Quảng Ninh" width="900" height="600" loading="lazy" decoding="async">
        <img class="footer-worker-img" src="<?php echo esc_url($hero_worker_url); ?>" alt="Kỹ thuật viên thông tắc cống tại Quảng Ninh" width="420" height="640" loading="lazy" decoding="async">
      </figure>
    </section>

    <section class="footer-map-section" aria-labelledby="footer-map-title">
      <div class="footer-map-head">
        <div>
          <p class="footer-map-kicker">Bản đồ văn phòng</p>
          <h2 class="footer-map-title" id="footer-map-title">Các địa chỉ văn phòng tại Quảng Ninh</h2>
        </div>
        <p class="footer-map-note">Khách hàng xem đúng địa chỉ văn phòng, mở Google Maps và gọi trước để được điều phối kỹ thuật nhanh.</p>
      </div>
      <div class="footer-map-grid">
        <?php foreach ($home_google_maps as $home_google_map) : ?>
          <article class="footer-map-card">
            <iframe
              class="footer-map-frame"
              src="<?php echo esc_url($home_google_map['src']); ?>"
              title="<?php echo esc_attr($home_google_map['title']); ?>"
              width="400"
              height="300"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div class="footer-map-caption">
              <h3><?php echo esc_html($home_google_map['label']); ?></h3>
              <p class="footer-map-address">Địa chỉ: <a href="<?php echo esc_url($home_google_map['map_url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($home_google_map['address']); ?></a></p>
              <p><?php echo esc_html($home_google_map['desc']); ?></p>
              <div class="footer-map-actions">
                <a class="footer-map-open" href="<?php echo esc_url($home_google_map['map_url']); ?>" target="_blank" rel="noopener noreferrer">Mở Google Maps</a>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="footer-main-card" aria-label="Thông tin chân trang">
      <div class="footer-main-grid">
        <div class="footer-brand-col">
          <div class="footer-brand-logo-row">
            <svg class="footer-brand-mark" aria-hidden="true"><use href="#ft-logo"></use></svg>
            <h2 class="footer-brand-title">Môi Trường Đô Thị<span>Số 1 Quảng Ninh</span></h2>
          </div>
          <p class="footer-brand-desc">Cung cấp dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu và xử lý mùi hôi tại Quảng Ninh.</p>
          <ul class="footer-contact-list" aria-label="Thông tin liên hệ">
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-phone"></use></svg><a href="tel:0931156756">0931.156.756</a></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg><a href="<?php echo esc_url($office_ha_long_map_url); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($office_ha_long_address); ?></a></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-mail"></use></svg><a href="mailto:moitruongdothiso1qn@gmail.com">moitruongdothiso1qn@gmail.com</a></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-clock"></use></svg><span>Tiếp nhận 05:00-22:00 - Có mặt nhanh chóng</span></li>
          </ul>
          <a class="footer-call-btn" href="tel:0931156756" aria-label="Gọi ngay 0931.156.756">
            <svg class="footer-icon" aria-hidden="true"><use href="#ft-phone"></use></svg>
            GỌI NGAY: 0931.156.756
          </a>
          <div class="footer-social-title">Kết nối với chúng tôi</div>
          <div class="footer-social-row" aria-label="Mạng xã hội">
            <a class="footer-social-link is-facebook" href="<?php echo esc_url($facebook_url); ?>" target="_blank" rel="nofollow noopener noreferrer" aria-label="Facebook Môi Trường Đô Thị Số 1 Quảng Ninh"><svg aria-hidden="true"><use href="#ft-facebook"></use></svg></a>
            <a class="footer-social-link is-zalo" href="<?php echo esc_url($zalo_url); ?>" target="_blank" rel="nofollow noopener noreferrer" aria-label="Zalo Môi Trường Đô Thị Số 1 Quảng Ninh"><svg aria-hidden="true"><use href="#ft-zalo"></use></svg></a>
            <a class="footer-social-link is-youtube" href="<?php echo esc_url($youtube_url); ?>" target="_blank" rel="nofollow noopener noreferrer" aria-label="YouTube Môi Trường Đô Thị Số 1 Quảng Ninh"><svg aria-hidden="true"><use href="#ft-youtube"></use></svg></a>
            <a class="footer-social-link is-tiktok" href="<?php echo esc_url($tiktok_url); ?>" target="_blank" rel="nofollow noopener noreferrer" aria-label="TikTok Môi Trường Đô Thị Số 1 Quảng Ninh"><svg aria-hidden="true"><use href="#ft-tiktok"></use></svg></a>
            <a class="footer-social-link is-phone" href="tel:0931156756" aria-label="Gọi điện Môi Trường Đô Thị Số 1 Quảng Ninh"><svg aria-hidden="true"><use href="#ft-phone"></use></svg></a>
          </div>
        </div>

        <nav class="footer-link-col is-open" data-footer-accordion aria-label="Dịch vụ của chúng tôi">
          <h3 class="footer-col-title">Dịch vụ của chúng tôi</h3>
          <button class="footer-accordion-toggle" type="button" aria-expanded="true" aria-controls="footer-services-list">
            <span class="footer-accordion-title"><svg class="footer-icon" aria-hidden="true"><use href="#ft-wrench"></use></svg>Dịch vụ của chúng tôi</span>
            <svg class="footer-accordion-chevron footer-icon" aria-hidden="true"><use href="#ft-chevron"></use></svg>
          </button>
          <ul class="footer-link-list" id="footer-services-list">
            <li><a href="<?php echo esc_url($home_internal_links['services']['hut_be_phot']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-truck"></use></svg>Hút bể phốt Quảng Ninh</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['services']['thong_tac_cong']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-wrench"></use></svg>Thông tắc cống Quảng Ninh</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['services']['bon_cau']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-toilet"></use></svg>Thông tắc bồn cầu</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['services']['chau_rua']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-sink"></use></svg>Thông tắc chậu rửa</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['services']['ho_ga']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-manhole"></use></svg>Nạo vét hố ga</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['services']['mui_hoi']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-leaf"></use></svg>Xử lý mùi hôi cống</a></li>
          </ul>
        </nav>

        <nav class="footer-link-col" data-footer-accordion aria-label="Khu vực phục vụ">
          <h3 class="footer-col-title">Khu vực phục vụ</h3>
          <button class="footer-accordion-toggle" type="button" aria-expanded="false" aria-controls="footer-area-list">
            <span class="footer-accordion-title"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Khu vực phục vụ</span>
            <svg class="footer-accordion-chevron footer-icon" aria-hidden="true"><use href="#ft-chevron"></use></svg>
          </button>
          <ul class="footer-link-list" id="footer-area-list">
            <li><a href="<?php echo esc_url($home_internal_links['areas']['ha_long']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Hạ Long</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['areas']['cam_pha']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Cẩm Phả</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['areas']['uong_bi']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Uông Bí</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['areas']['mong_cai']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Móng Cái</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['areas']['dong_trieu']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Đông Triều</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['areas']['quang_yen']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Quảng Yên</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['areas']['van_don']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hút bể phốt Vân Đồn</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['locations']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hệ thống cơ sở Quảng Ninh</a></li>
          </ul>
        </nav>

        <nav class="footer-link-col" data-footer-accordion aria-label="Liên kết nhanh">
          <h3 class="footer-col-title">Liên kết nhanh</h3>
          <button class="footer-accordion-toggle" type="button" aria-expanded="false" aria-controls="footer-quick-list">
            <span class="footer-accordion-title"><svg class="footer-icon" aria-hidden="true"><use href="#ft-home"></use></svg>Liên kết nhanh</span>
            <svg class="footer-accordion-chevron footer-icon" aria-hidden="true"><use href="#ft-chevron"></use></svg>
          </button>
          <ul class="footer-link-list" id="footer-quick-list">
            <li><a href="<?php echo esc_url($home_internal_links['home']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-home"></use></svg>Trang chủ</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['about']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-info"></use></svg>Giới thiệu công ty</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['price']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-tag"></use></svg>Bảng giá dịch vụ</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['warranty']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-shield"></use></svg>Chính sách bảo hành</a></li>
            <li><a href="<?php echo esc_url(home_url('/#du-an')); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-images"></use></svg>Công trình tiêu biểu</a></li>
            <li><a href="<?php echo esc_url(home_url('/#doi-tac')); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-users"></use></svg>Khách hàng tiêu biểu</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['blog']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-news"></use></svg>Tin tức - Blog</a></li>
            <li><a href="<?php echo esc_url($home_internal_links['contact']); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-mail"></use></svg>Liên hệ</a></li>
          </ul>
        </nav>

        <aside class="footer-commit-card" aria-label="Cam kết của chúng tôi">
          <div class="footer-commit-head">
            <span class="footer-commit-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-shield"></use></svg></span>
            <h3>Cam kết của chúng tôi</h3>
          </div>
          <ul class="footer-commit-list">
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-check"></use></svg><span>Khảo sát miễn phí</span></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-check"></use></svg><span>Báo giá trước khi thi công</span></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-check"></use></svg><span>Không phát sinh chi phí vô lý</span></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-check"></use></svg><span>Thi công nhanh chóng</span></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-check"></use></svg><span>Bảo hành dài hạn</span></li>
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-check"></use></svg><span>Hỗ trợ 05:00-22:00 - tiếp nhận hằng ngày</span></li>
          </ul>
        </aside>
        <nav class="footer-source-links" aria-label="Nguồn tham khảo ngành môi trường">
          <h3>Nguồn tham khảo</h3>
          <a href="<?php echo esc_url($home_internal_links['external']['qn_tnmt']); ?>" target="_blank" rel="noopener noreferrer">Sở Tài nguyên và Môi trường Quảng Ninh</a>
          <a href="<?php echo esc_url($home_internal_links['external']['tnmt_news']); ?>" target="_blank" rel="noopener noreferrer">Báo Tài nguyên & Môi trường</a>
        </nav>
      </div>

      <div class="footer-benefits" aria-label="Lợi ích dịch vụ">
        <article class="footer-benefit-card">
          <span class="footer-benefit-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-users"></use></svg></span>
          <div>
            <p class="footer-benefit-title">Đội ngũ kỹ thuật</p>
            <p class="footer-benefit-text">Kinh nghiệm thực tế</p>
          </div>
        </article>
        <article class="footer-benefit-card">
          <span class="footer-benefit-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-truck"></use></svg></span>
          <div>
            <p class="footer-benefit-title">Thiết bị hiện đại</p>
            <p class="footer-benefit-text">Công nghệ tiên tiến</p>
          </div>
        </article>
        <article class="footer-benefit-card">
          <span class="footer-benefit-icon" aria-hidden="true"><svg class="footer-icon"><use href="#ft-leaf"></use></svg></span>
          <div>
            <p class="footer-benefit-title">Thân thiện môi trường</p>
            <p class="footer-benefit-text">Xử lý sạch - An toàn</p>
          </div>
        </article>
      </div>
    </section>

    <p class="footer-copyright">
      &copy; 2026 Môi Trường Đô Thị Số 1 Quảng Ninh. All rights reserved. | Thiết kế bởi <span>Môi Trường Đô Thị Số 1 Quảng Ninh</span>
    </p>
  </div>

  <button class="footer-back-top" type="button" aria-label="Lên đầu trang">
    <svg class="footer-icon" aria-hidden="true"><use href="#ft-arrow-up"></use></svg>
  </button>
</footer>

<script>
/* === PREMIUM FOOTER INTERACTIONS === */
<?php include __DIR__ . '/shared-footer-interactions-inline.php'; ?>

/* === MOBILE NAV === */
var navToggle = document.getElementById('navToggle');
var navMenu   = document.getElementById('navMenu');
navToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  var open = navMenu.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  navToggle.textContent = open ? '✕' : '☰';
});

/* Mobile dropdown */
document.querySelectorAll('.has-sub > .sub-toggle').forEach(function(toggle) {
  toggle.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault(); e.stopPropagation();
      var parent = this.parentElement;
      document.querySelectorAll('.has-sub.open').forEach(function(item) {
        if (item !== parent) {
          item.classList.remove('open');
          var itemToggle = item.querySelector('.sub-toggle');
          if (itemToggle) {
            itemToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
      var open = parent.classList.toggle('open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  });
});

/* Submenu links: bình thường điều hướng */
document.querySelectorAll('.sub-menu a').forEach(function(link) {
  link.addEventListener('click', function(e) { e.stopPropagation(); });
});

/* Click ngoài → đóng menu */
document.addEventListener('click', function(e) {
  if (!e.target.closest('.home-nav')) {
    navMenu.classList.remove('active');
    navToggle.textContent = '☰';
    navToggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.has-sub.open').forEach(function(item) {
      item.classList.remove('open');
      var itemToggle = item.querySelector('.sub-toggle');
      if (itemToggle) {
        itemToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

/* Resize: reset mobile state khi chuyển về desktop */
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    navMenu.classList.remove('active');
    navToggle.textContent = '☰';
    navToggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.has-sub.open').forEach(function(item) {
      item.classList.remove('open');
      var itemToggle = item.querySelector('.sub-toggle');
      if (itemToggle) {
        itemToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

/* === COMPLETED PROJECT FILTER + MOBILE ACCORDION === */
(function() {
  var section = document.querySelector('[data-project-section]');
  if (!section) return;

  var filterButtons = Array.prototype.slice.call(section.querySelectorAll('[data-project-filter]'));
  var cards = Array.prototype.slice.call(section.querySelectorAll('[data-project-card]'));
  var mobileItems = Array.prototype.slice.call(section.querySelectorAll('[data-project-mobile-item]'));
  var accordions = Array.prototype.slice.call(section.querySelectorAll('.ttcqn-project-accordion'));

  function matchCategory(item, category) {
    return category === 'all' || item.getAttribute('data-category') === category;
  }

  function applyProjectFilter(category) {
    filterButtons.forEach(function(button) {
      var active = button.getAttribute('data-project-filter') === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    cards.forEach(function(card, index) {
      var visible = matchCategory(card, category);
      card.classList.toggle('is-hidden', !visible);
      card.classList.toggle('is-featured', visible && (category !== 'all' || index === 0));
    });

    mobileItems.forEach(function(item) {
      item.classList.toggle('is-hidden', category !== 'all' || !matchCategory(item, category));
    });
  }

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      applyProjectFilter(button.getAttribute('data-project-filter') || 'all');
    });
  });

  accordions.forEach(function(button) {
    button.addEventListener('click', function() {
      var panelId = button.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (panel) {
        panel.classList.toggle('is-open', !expanded);
      }
    });
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        document.body.classList.toggle('ttcqn-projects-in-view', entry.isIntersecting && entry.intersectionRatio > 0.24);
      });
    }, { threshold: [0, 0.25, 0.5] });
    observer.observe(section);
  }
})();

(function() {
  var section = document.querySelector('.home-process');
  if (!section || !('IntersectionObserver' in window)) {
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      document.body.classList.toggle('ttcqn-process-in-view', entry.isIntersecting && entry.intersectionRatio > 0.18);
    });
  }, { threshold: [0, 0.2, 0.5] });

  observer.observe(section);
})();

/* === IMAGE FALLBACK — Nếu ảnh broken, ẩn thẻ img === */
document.querySelectorAll('.card-img, .slider-track img, .ttcqn-project-media img').forEach(function(img) {
  img.addEventListener('error', function() {
    this.style.opacity = '0';
    if (this.closest('.card-img-wrap')) {
      this.closest('.card-img-wrap').style.background = 'var(--ttcqn-gradient-secondary)';
    }
  });
});

/* === SLIDER === */
var currentSlide = 0, totalSlides = Math.max(document.querySelectorAll('.slider-track img').length, 1), sliderInterval;
function updateSlider() {
  var track = document.querySelector('.slider-track');
  if (!track) return;
  track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
  document.querySelectorAll('.slider-dot').forEach(function(dot, i) {
    dot.classList.toggle('active', i === currentSlide);
    dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
  });
}
function moveSlide(dir) { currentSlide = (currentSlide + dir + totalSlides) % totalSlides; updateSlider(); resetAutoSlide(); }
function goToSlide(i) { currentSlide = i; updateSlider(); resetAutoSlide(); }
function resetAutoSlide() { clearInterval(sliderInterval); sliderInterval = setInterval(function() { moveSlide(1); }, 4500); }

/* Touch swipe */
var touchStartX = 0;
var slider = document.getElementById('mainSlider');
if (slider) {
  slider.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; }, {passive:true});
  slider.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].screenX;
    if (diff > 50) moveSlide(1);
    else if (diff < -50) moveSlide(-1);
  }, {passive:true});
}
sliderInterval = setInterval(function() { moveSlide(1); }, 4500);

/* === INTRO MINI SLIDER === */
(function() {
  var wrap = document.getElementById('introSlider');
  if (!wrap) return;
  var track = wrap.querySelector('.ttcqn-intro-slider-track');
  var dots  = wrap.querySelectorAll('.ttcqn-intro-dot');
  var imgs  = wrap.querySelectorAll('.ttcqn-intro-slider-track img');
  var cur   = 0, total = imgs.length, timer;
  function introSet(n) {
    cur = (n + total) % total;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function(d, i) {
      d.classList.toggle('is-active', i === cur);
      imgs[i].setAttribute('aria-hidden', i === cur ? 'false' : 'true');
    });
  }
  window.introGoTo = function(n) { introSet(n); clearInterval(timer); timer = setInterval(function(){ introSet(cur + 1); }, 4500); };
  /* swipe */
  var tx = 0;
  wrap.addEventListener('touchstart', function(e){ tx = e.changedTouches[0].screenX; }, {passive:true});
  wrap.addEventListener('touchend', function(e){
    var d = e.changedTouches[0].screenX - tx;
    if (Math.abs(d) > 40) introGoTo(d < 0 ? cur + 1 : cur - 1);
  }, {passive:true});
  timer = setInterval(function(){ introSet(cur + 1); }, 4500);
})();

/* === NUMBER COUNTER === */
function formatCounterValue(value, format, decimals) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }

  var rounded = Math.round(value).toString();
  if (format === 'dot') {
    return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  return rounded;
}

function animateCounter(node) {
  if (!node || node.dataset.counted === '1') {
    return;
  }

  var target = parseFloat(node.dataset.target || '0');
  var suffix = node.dataset.suffix || '';
  var decimals = parseInt(node.dataset.decimals || '0', 10);
  var format = node.dataset.format || '';
  var duration = 1300;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }

    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = target * eased;

    node.textContent = formatCounterValue(current, format, decimals) + suffix;

    if (progress < 1) {
      window.requestAnimationFrame(step);
      return;
    }

    node.dataset.counted = '1';
    node.textContent = formatCounterValue(target, format, decimals) + suffix;
  }

  window.requestAnimationFrame(step);
}

var counterNodes = document.querySelectorAll('.stat-num[data-target]');
if ('IntersectionObserver' in window && counterNodes.length) {
  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold:0.45 });

  counterNodes.forEach(function(node) {
    counterObserver.observe(node);
  });
} else {
  counterNodes.forEach(function(node) {
    animateCounter(node);
  });
}

/* === SCROLL ANIMATIONS === */
if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() { entry.target.classList.add('visible'); }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.1, rootMargin:'0px 0px -30px 0px' });
  document.querySelectorAll('.anim, .anim-left, .anim-right, .anim-scale').forEach(function(el) {
    observer.observe(el);
  });
} else {
  /* Fallback nếu browser không hỗ trợ IntersectionObserver */
  document.querySelectorAll('.anim, .anim-left, .anim-right, .anim-scale').forEach(function(el) {
    el.classList.add('visible');
  });
}
</script>

<?php wp_footer(); ?>
</body>
</html>
