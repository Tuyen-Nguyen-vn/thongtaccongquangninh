<?php
/**
 * Plugin Name: TTCQN Service Schema
 * Description: Injects Service, OfferCatalog, ContactPage, BlogPosting JSON-LD and scoped SEO metadata overrides for TTCQN pages/posts. Isolated from Rank Math global options.
 * Version: 2026.06.28.2
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_DOORWAY_OFFICE_HA_LONG_MAP_URL = 'https://www.google.com/maps/search/?api=1&query=111%20C%C3%A1i%20L%C3%A2n%2C%20B%C3%A3i%20Ch%C3%A1y%2C%20Qu%E1%BA%A3ng%20Ninh';

/**
 * Danh sách 8 văn phòng trên toàn tỉnh Quảng Ninh.
 * Chỉ Hạ Long có hasMap (GBP đã xác minh). Các văn phòng khác có địa chỉ + geo nhưng chưa có map URL.
 */
function ttcqn_doorway_offices(): array
{
    return [
        'ha_long'    => [
            'city'         => 'Hạ Long',
            'label'        => 'TP. Hạ Long',
            'street'       => '111 Cái Lân, Bãi Cháy',
            'locality'     => 'Hạ Long',
            'lat'          => 20.9520,
            'lng'          => 107.0789,
            'hasMap'       => TTCQN_DOORWAY_OFFICE_HA_LONG_MAP_URL,
        ],
        'cam_pha'    => [
            'city'         => 'Cẩm Phả',
            'label'        => 'TP. Cẩm Phả',
            'street'       => '416 Đường Trần Phú, Phường Cẩm Trung',
            'locality'     => 'Cẩm Phả',
            'lat'          => 21.0167,
            'lng'          => 107.2667,
            'hasMap'       => null,
        ],
        'uong_bi'    => [
            'city'         => 'Uông Bí',
            'label'        => 'TP. Uông Bí',
            'street'       => '192 Đường Quang Trung, Phường Thanh Sơn',
            'locality'     => 'Uông Bí',
            'lat'          => 21.0367,
            'lng'          => 106.7717,
            'hasMap'       => null,
        ],
        'mong_cai'   => [
            'city'         => 'Móng Cái',
            'label'        => 'TP. Móng Cái',
            'street'       => '88 Đường Hùng Vương, Phường Trần Phú',
            'locality'     => 'Móng Cái',
            'lat'          => 21.5269,
            'lng'          => 107.9683,
            'hasMap'       => null,
        ],
        'quang_yen'  => [
            'city'         => 'Quảng Yên',
            'label'        => 'TX. Quảng Yên',
            'street'       => '134 Đường Lê Lợi, Phường Quảng Yên',
            'locality'     => 'Quảng Yên',
            'lat'          => 20.9333,
            'lng'          => 106.8067,
            'hasMap'       => null,
        ],
        'dong_trieu' => [
            'city'         => 'Đông Triều',
            'label'        => 'TX. Đông Triều',
            'street'       => '465 Đường Nguyễn Bình, Phường Đông Triều',
            'locality'     => 'Đông Triều',
            'lat'          => 21.1067,
            'lng'          => 106.5267,
            'hasMap'       => null,
        ],
        'tien_yen'   => [
            'city'         => 'Tiên Yên',
            'label'        => 'Huyện Tiên Yên',
            'street'       => '72 Đường Lý Thường Kiệt, Thị trấn Tiên Yên',
            'locality'     => 'Tiên Yên',
            'lat'          => 21.3333,
            'lng'          => 107.4000,
            'hasMap'       => null,
        ],
        'van_don'    => [
            'city'         => 'Vân Đồn',
            'label'        => 'Huyện Vân Đồn',
            'street'       => '318 Đường Lý Anh Tông, Thị trấn Cái Rồng',
            'locality'     => 'Vân Đồn',
            'lat'          => 21.0667,
            'lng'          => 107.5333,
            'hasMap'       => null,
        ],
    ];
}

/**
 * Trả về office data theo tên thành phố (dùng cho city service pages).
 */
function ttcqn_doorway_office_for_city(string $city): ?array
{
    static $map = null;
    if ($map === null) {
        $map = [];
        foreach (ttcqn_doorway_offices() as $office) {
            $map[$office['city']] = $office;
        }
    }
    return $map[$city] ?? null;
}

function ttcqn_doorway_schema_get_gbp_data(): ?array
{
    $file_path = __DIR__ . '/gbp_data.json';
    if (!file_exists($file_path)) {
        return null;
    }
    $content = file_get_contents($file_path);
    if (!$content) {
        return null;
    }
    return json_decode($content, true);
}

function ttcqn_doorway_schema_business_id(): string
{
    return home_url('/#localbusiness');
}

function ttcqn_doorway_schema_provider_ref(?string $city = null): array
{
    $ref = [
        '@type' => 'LocalBusiness',
        '@id'   => ttcqn_doorway_schema_business_id(),
        'name'  => 'Thông Tắc Cống Quảng Ninh',
        'telephone' => ['+84963953533', '+84931156756'],
        'url' => home_url('/'),
        'areaServed' => [
            '@type' => 'AdministrativeArea',
            'name'  => 'Quảng Ninh',
        ],
    ];

    // Nếu có city cụ thể, thêm địa chỉ văn phòng cục bộ vào provider.
    // Giúp Google hiểu dịch vụ tại thành phố này được thực hiện bởi văn phòng tại chỗ.
    if ($city !== null) {
        $office = ttcqn_doorway_office_for_city($city);
        if ($office !== null) {
            $ref['address'] = [
                '@type'           => 'PostalAddress',
                'streetAddress'   => $office['street'],
                'addressLocality' => $office['locality'],
                'addressRegion'   => 'Quảng Ninh',
                'addressCountry'  => 'VN',
            ];
            $ref['geo'] = [
                '@type'     => 'GeoCoordinates',
                'latitude'  => $office['lat'],
                'longitude' => $office['lng'],
            ];
        }
    }

    return $ref;
}

/**
 * Schema map: page_id => [service, city, lat, lng]
 * Cities are administrative units in Quảng Ninh province, Vietnam.
 */
function ttcqn_doorway_schema_map(): array
{
    return [
        // Hút bể phốt (HBP)
        52  => ['service' => 'hbp', 'city' => 'Hạ Long',    'lat' => 20.9520, 'lng' => 107.0789],
        53  => ['service' => 'hbp', 'city' => 'Cẩm Phả',    'lat' => 21.0167, 'lng' => 107.2667],
        54  => ['service' => 'hbp', 'city' => 'Uông Bí',    'lat' => 21.0367, 'lng' => 106.7717],
        55  => ['service' => 'hbp', 'city' => 'Móng Cái',   'lat' => 21.5269, 'lng' => 107.9683],
        56  => ['service' => 'hbp', 'city' => 'Đông Triều', 'lat' => 21.1067, 'lng' => 106.5267],
        57  => ['service' => 'hbp', 'city' => 'Quảng Yên',  'lat' => 20.9333, 'lng' => 106.8067],
        58  => ['service' => 'hbp', 'city' => 'Vân Đồn',    'lat' => 21.0667, 'lng' => 107.5333],
        // Thông tắc cống (TTC)
        296 => ['service' => 'ttc', 'city' => 'Hạ Long',    'lat' => 20.9520, 'lng' => 107.0789],
        400 => ['service' => 'ttc', 'city' => 'Cẩm Phả',    'lat' => 21.0167, 'lng' => 107.2667],
        405 => ['service' => 'ttc', 'city' => 'Uông Bí',    'lat' => 21.0367, 'lng' => 106.7717],
        424 => ['service' => 'ttc', 'city' => 'Quảng Yên',  'lat' => 20.9333, 'lng' => 106.8067],
        425 => ['service' => 'ttc', 'city' => 'Đông Triều', 'lat' => 21.1067, 'lng' => 106.5267],
        426 => ['service' => 'ttc', 'city' => 'Móng Cái',   'lat' => 21.5269, 'lng' => 107.9683],
        427 => ['service' => 'ttc', 'city' => 'Vân Đồn',    'lat' => 21.0667, 'lng' => 107.5333],
        // Hút bể phốt huyện (posts)
        2048 => ['service' => 'hbp', 'city' => 'Bình Liêu',  'lat' => 21.2833, 'lng' => 107.4167],
        2049 => ['service' => 'hbp', 'city' => 'Cô Tô',      'lat' => 20.9500, 'lng' => 107.7667],
        2050 => ['service' => 'hbp', 'city' => 'Đầm Hà',     'lat' => 21.3500, 'lng' => 107.6000],
        2051 => ['service' => 'hbp', 'city' => 'Hải Hà',     'lat' => 21.3833, 'lng' => 107.7167],
        2052 => ['service' => 'hbp', 'city' => 'Tiên Yên',   'lat' => 21.3333, 'lng' => 107.4000],
        // Thông tắc cống phường Hạ Long (ward posts)
        2039 => ['service' => 'ttc', 'city' => 'Cao Xanh',   'lat' => 20.9667, 'lng' => 107.0667],
        2041 => ['service' => 'ttc', 'city' => 'Tuần Châu',  'lat' => 20.9170, 'lng' => 106.9830],
    ];
}

function ttcqn_doorway_schema_main_service_map(): array
{
    return [
        26 => [
            'serviceType' => 'Hút bể phốt',
            'name' => 'Hút bể phốt Quảng Ninh',
            'description' => 'Dịch vụ hút bể phốt Quảng Ninh bằng xe bồn chuyên dụng, tiếp nhận 05:00-22:00 hằng ngày cho nhà dân, nhà hàng, khách sạn và công trình. Báo giá trước khi làm, gọi 0963.953.533.',
        ],
        35 => [
            'serviceType' => 'Thông tắc cống',
            'name' => 'Thông tắc cống Quảng Ninh',
            'description' => 'Dịch vụ thông tắc cống Quảng Ninh bằng máy lò xo, tiếp nhận 05:00-22:00 hằng ngày để xử lý nước trào, cống nghẹt và mùi hôi. Không đục phá khi chưa cần, gọi 0963.953.533.',
        ],
        36 => [
            'serviceType' => 'Thông tắc chậu rửa',
            'name' => 'Thông tắc chậu rửa Quảng Ninh',
            'description' => 'Dịch vụ thông tắc chậu rửa Quảng Ninh cho bếp gia đình, quán ăn và nhà hàng. Xử lý dầu mỡ, cặn bám, nước rút chậm, gọi 0963.953.533.',
        ],
        37 => [
            'serviceType' => 'Thông tắc bồn cầu',
            'name' => 'Thông tắc bồn cầu Quảng Ninh',
            'description' => 'Dịch vụ thông tắc bồn cầu Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày để xử lý nghẹt, rút chậm, trào ngược và mùi hôi. Báo giá rõ trước khi làm, gọi 0963.953.533.',
        ],
        38 => [
            'serviceType' => 'Nạo vét hố ga',
            'name' => 'Nạo vét hố ga Quảng Ninh',
            'description' => 'Dịch vụ nạo vét hố ga Quảng Ninh, xử lý bùn rác, mùi hôi, thoát nước kém và chống ngập cục bộ. Tiếp nhận 05:00-22:00 hằng ngày, gọi 0963.953.533.',
        ],
        311 => [
            'serviceType' => 'Xử lý mùi hôi',
            'name' => 'Xử lý mùi hôi Quảng Ninh',
            'description' => 'Dịch vụ xử lý mùi hôi Quảng Ninh cho nhà vệ sinh, cống thoát sàn, bể phốt và hố ga. Tìm đúng nguồn hôi, hỗ trợ nhanh, gọi 0963.953.533.',
        ],
        // Service-variant posts (hbp + hút hầm cầu)
        2449 => [
            'serviceType' => 'Hút bể phốt',
            'name' => 'Giá hút bể phốt Quảng Ninh',
            'description' => 'Bảng giá hút bể phốt Quảng Ninh 2026 tính theo m³, địa bàn và loại bể. Báo giá miễn phí, thợ có mặt 15 phút, gọi 0963.953.533.',
        ],
        2430 => [
            'serviceType' => 'Hút bể phốt khẩn cấp',
            'name' => 'Hút bể phốt khẩn cấp Quảng Ninh',
            'description' => 'Hút bể phốt khẩn cấp Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày; xe bồn có mặt trong 15 phút để xử lý tràn hầm và bể phốt đầy gấp. Gọi 0963.953.533.',
        ],
        2559 => [
            'serviceType' => 'Hút hầm cầu',
            'name' => 'Hút hầm cầu Quảng Ninh',
            'description' => 'Hút hầm cầu Quảng Ninh bằng xe bồn chuyên dụng, tiếp nhận 05:00-22:00 hằng ngày, hút bể 1–20 khối, có mặt sau 15 phút, không đục phá. Gọi 0963.953.533.',
        ],
        2694 => [
            'serviceType' => 'Hút bể phốt công ty',
            'name' => 'Hút bể phốt công ty Quảng Ninh',
            'description' => 'Hút bể phốt công ty, nhà máy, khu công nghiệp Quảng Ninh. Tiếp nhận 05:00-22:00 hằng ngày, xe bồn chuyên dụng, hóa đơn VAT, hợp đồng định kỳ. Gọi 0963.953.533.',
        ],
        2687 => [
            'serviceType' => 'Hút bể phốt nhà hàng',
            'name' => 'Hút bể phốt nhà hàng Quảng Ninh',
            'description' => 'Hút bể phốt nhà hàng Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày, xử lý nhanh không gián đoạn kinh doanh, không mùi, đúng giờ. Gọi 0963.953.533.',
        ],
        2702 => [
            'serviceType' => 'Hút bể phốt khách sạn',
            'name' => 'Hút bể phốt khách sạn Quảng Ninh',
            'description' => 'Hút bể phốt khách sạn Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày, hút sạch không mùi, xe bồn đủ tải trọng, phục vụ nhanh ngày lễ. Gọi 0963.953.533.',
        ],
        2708 => [
            'serviceType' => 'Hút bể phốt khu nhà trọ',
            'name' => 'Hút bể phốt khu nhà trọ Quảng Ninh',
            'description' => 'Hút bể phốt khu nhà trọ Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày, xe bồn vào ngõ sâu, hút nhanh không làm phiền khách thuê. Gọi 0963.953.533.',
        ],
        // Thông tắc bồn cầu service-variant posts
        2417 => [
            'serviceType' => 'Thông tắc bồn cầu khách sạn',
            'name' => 'Thông tắc bồn cầu khách sạn Quảng Ninh',
            'description' => 'Thông tắc bồn cầu khách sạn Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày, xử lý nghẹt không gián đoạn dịch vụ, không đục phá, thợ có mặt 15 phút. Gọi 0963.953.533.',
        ],
        2385 => [
            'serviceType' => 'Thông tắc bồn cầu không đục phá',
            'name' => 'Thông tắc bồn cầu không đục phá Quảng Ninh',
            'description' => 'Thông tắc bồn cầu không đục phá Quảng Ninh, dùng máy thông cơ và công nghệ áp lực cao, bảo toàn gạch men và kết cấu. Gọi 0963.953.533.',
        ],
        2407 => [
            'serviceType' => 'Thông tắc bồn cầu nhà dân',
            'name' => 'Thông tắc bồn cầu nhà dân Quảng Ninh',
            'description' => 'Thông tắc bồn cầu nhà dân Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày, xử lý rút chậm, trào ngược, tắc hoàn toàn, báo giá rõ trước khi làm. Gọi 0963.953.533.',
        ],
        2412 => [
            'serviceType' => 'Thông tắc bồn cầu nhà hàng',
            'name' => 'Thông tắc bồn cầu nhà hàng Quảng Ninh',
            'description' => 'Thông tắc bồn cầu nhà hàng Quảng Ninh, tiếp nhận 05:00-22:00 hằng ngày, hỗ trợ khẩn cấp giờ cao điểm, xử lý nhanh không ảnh hưởng kinh doanh. Gọi 0963.953.533.',
        ],
    ];
}

function ttcqn_doorway_schema_video_map(): array
{
    return [
        26 => [
            'name' => 'Video quy trình hút bể phốt tại Quảng Ninh',
            'description' => 'Video minh họa quy trình tiếp nhận, kiểm tra và xử lý hút bể phốt, thông tắc cống tại Quảng Ninh. Liên hệ 0963.953.533 / 0931.156.756 trong khung 05:00-22:00 hằng ngày.',
            'thumbnailUrl' => 'https://i.ytimg.com/vi/DmiPD6WM9Jg/hqdefault.jpg',
            'uploadDate' => '2026-05-31T00:00:00+07:00',
            'embedUrl' => 'https://www.youtube.com/embed/DmiPD6WM9Jg',
            'contentUrl' => 'https://www.youtube.com/watch?v=DmiPD6WM9Jg',
        ],
        35 => [
            'name' => 'Đội thợ thông tắc cống Quảng Ninh xử lý nhanh trong ngày',
            'description' => 'Video minh họa quy trình kiểm tra đường cống, xác định điểm nghẹt và xử lý không đục phá tại Quảng Ninh. Liên hệ 0963.953.533 / 0931.156.756 trong khung 05:00-22:00 hằng ngày.',
            'thumbnailUrl' => 'https://i.ytimg.com/vi/pXSJIOhrO3Q/hqdefault.jpg',
            'uploadDate' => '2026-05-31T00:00:00+07:00',
            'embedUrl' => 'https://www.youtube.com/embed/pXSJIOhrO3Q',
            'contentUrl' => 'https://www.youtube.com/watch?v=pXSJIOhrO3Q',
        ],
    ];
}

function ttcqn_doorway_schema_video_node(int $page_id, string $page_url): ?array
{
    $videos = ttcqn_doorway_schema_video_map();
    if (!isset($videos[$page_id])) {
        return null;
    }

    $video = $videos[$page_id];

    return [
        '@context' => 'https://schema.org',
        '@type' => 'VideoObject',
        '@id' => trailingslashit($page_url) . '#video',
        'name' => $video['name'],
        'description' => $video['description'],
        'thumbnailUrl' => [$video['thumbnailUrl']],
        'uploadDate' => $video['uploadDate'],
        'embedUrl' => $video['embedUrl'],
        'contentUrl' => $video['contentUrl'],
        'inLanguage' => 'vi-VN',
        'publisher' => [
            '@id' => ttcqn_doorway_schema_business_id(),
        ],
        'mainEntityOfPage' => [
            '@id' => trailingslashit($page_url) . '#webpage',
        ],
    ];
}

function ttcqn_doorway_schema_offer_catalog_items(): array
{
    $services = [
        ['Hút bể phốt Quảng Ninh', 'Hút bể phốt', home_url('/hut-be-phot-quang-ninh/')],
        ['Thông tắc cống Quảng Ninh', 'Thông tắc cống', home_url('/thong-tac-cong-quang-ninh/')],
        ['Thông tắc bồn cầu Quảng Ninh', 'Thông tắc bồn cầu', home_url('/thong-tac-bon-cau-quang-ninh/')],
        ['Thông tắc chậu rửa Quảng Ninh', 'Thông tắc chậu rửa', home_url('/thong-tac-chau-rua-quang-ninh/')],
        ['Nạo vét hố ga Quảng Ninh', 'Nạo vét hố ga', home_url('/nao-vet-ho-ga-quang-ninh/')],
        ['Xử lý mùi hôi Quảng Ninh', 'Xử lý mùi hôi', home_url('/xu-ly-mui-hoi-quang-ninh/')],
    ];

    return array_map(static function (array $service): array {
        return [
            '@type' => 'Offer',
            'itemOffered' => [
                '@type' => 'Service',
                'name' => $service[0],
                'serviceType' => $service[1],
                'url' => $service[2],
                'provider' => [
                    '@id' => ttcqn_doorway_schema_business_id(),
                ],
            ],
        ];
    }, $services);
}

function ttcqn_doorway_schema_service_name(string $service, string $city): string
{
    return $service === 'hbp'
        ? "Hút bể phốt {$city}"
        : "Thông tắc cống {$city}";
}

function ttcqn_doorway_schema_service_description(string $service, string $city): string
{
    return $service === 'hbp'
        ? "Dịch vụ hút bể phốt tại {$city}, Quảng Ninh. Xe bồn hiện đại, có mặt 15 phút, không đục phá, bảo hành dài hạn. Tiếp nhận 05:00-22:00 hằng ngày."
        : "Dịch vụ thông tắc cống tại {$city}, Quảng Ninh. Máy lò xo chuyên dụng, không đục phá, có mặt nhanh trong 15 phút. Tiếp nhận 05:00-22:00 hằng ngày.";
}

function ttcqn_doorway_schema_service_node(string $page_url, string $name, string $description, string $service_type, array $area_served, ?string $city = null): array
{
    $node = [
        '@context' => 'https://schema.org',
        '@type'    => 'Service',
        '@id'      => trailingslashit($page_url) . '#service',
        'name'     => $name,
        'description' => $description,
        'serviceType' => $service_type,
        'provider' => ttcqn_doorway_schema_provider_ref($city),
        'areaServed' => $area_served,
        'availableChannel' => [
            '@type' => 'ServiceChannel',
            'servicePhone' => '+84963953533',
            'serviceUrl'   => $page_url,
            'availableLanguage' => ['vi'],
        ],
        'hoursAvailable' => [
            '@type' => 'OpeningHoursSpecification',
            'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'opens'  => '05:00',
            'closes' => '22:00',
        ],
        'url' => $page_url,
    ];

    return $node;
}

function ttcqn_doorway_schema_page_nodes(int $page_id): array
{
    $page_url = get_permalink($page_id);
    if (!$page_url) {
        return [];
    }

    $nodes = [];

    $doorway_map = ttcqn_doorway_schema_map();
    if (isset($doorway_map[$page_id])) {
        $entry = $doorway_map[$page_id];
        $service = $entry['service'];
        $city = $entry['city'];

        $nodes[] = ttcqn_doorway_schema_service_node(
                $page_url,
                ttcqn_doorway_schema_service_name($service, $city),
                ttcqn_doorway_schema_service_description($service, $city),
                $service === 'hbp' ? 'Hút bể phốt' : 'Thông tắc cống',
                [
                    '@type' => 'City',
                    'name'  => $city,
                    'containedInPlace' => [
                        '@type' => 'AdministrativeArea',
                        'name'  => 'Quảng Ninh',
                    ],
                    'geo' => [
                        '@type' => 'GeoCoordinates',
                        'latitude'  => $entry['lat'],
                        'longitude' => $entry['lng'],
                    ],
                ],
                $city  // truyền city để provider_ref thêm địa chỉ văn phòng cục bộ
            );

        $video_node = ttcqn_doorway_schema_video_node($page_id, $page_url);
        if ($video_node !== null) {
            $nodes[] = $video_node;
        }

        return $nodes;
    }

    $main_services = ttcqn_doorway_schema_main_service_map();
    if (isset($main_services[$page_id])) {
        $entry = $main_services[$page_id];

        $nodes[] = ttcqn_doorway_schema_service_node(
                $page_url,
                $entry['name'],
                $entry['description'],
                $entry['serviceType'],
                [
                    '@type' => 'AdministrativeArea',
                    'name'  => 'Quảng Ninh',
                ]
            );

        $video_node = ttcqn_doorway_schema_video_node($page_id, $page_url);
        if ($video_node !== null) {
            $nodes[] = $video_node;
        }

        return $nodes;
    }

    if ($page_id === 61) {
        return [
            [
                '@context' => 'https://schema.org',
                '@type' => 'OfferCatalog',
                '@id' => trailingslashit($page_url) . '#offer-catalog',
                'name' => 'Bảng giá dịch vụ môi trường Quảng Ninh',
                'url' => $page_url,
                'provider' => [
                    '@id' => ttcqn_doorway_schema_business_id(),
                ],
                'itemListElement' => ttcqn_doorway_schema_offer_catalog_items(),
            ],
        ];
    }

    if ($page_id === 63) {
        return [
            [
                '@context' => 'https://schema.org',
                '@type' => 'ContactPage',
                '@id' => trailingslashit($page_url) . '#contactpage',
                'url' => $page_url,
                'name' => 'Liên hệ Thông Tắc Cống Quảng Ninh',
                'about' => [
                    '@id' => ttcqn_doorway_schema_business_id(),
                ],
                'mainEntity' => [
                    '@id' => ttcqn_doorway_schema_business_id(),
                ],
            ],
        ];
    }

    return [];
}

function ttcqn_doorway_schema_target_page_ids(): array
{
    return array_keys(ttcqn_doorway_schema_map() + ttcqn_doorway_schema_main_service_map() + [61 => true, 63 => true]);
}

function ttcqn_doorway_schema_clean_text(string $text): string
{
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, get_bloginfo('charset') ?: 'UTF-8');
    $text = wp_strip_all_tags($text, true);
    $text = preg_replace('/\s+/u', ' ', $text);

    return trim((string) $text);
}

function ttcqn_doorway_schema_meta_overrides(): array
{
    return [
        55 => [
            'title' => 'Hút Bể Phốt Móng Cái - Giá Rẻ Không Đục Phá, Có Mặt 15 Phút',
            'description' => 'Hút bể phốt Móng Cái sạch triệt để, tiếp nhận 05:00-22:00 hằng ngày, thợ có mặt sau 15 phút, cam kết không đục phá bừa bãi, bảo hành dài hạn. Gọi ngay 0963.953.533 / 0931.156.756.',
        ],
        56 => [
            'title' => 'Hút Bể Phốt Đông Triều - Giá Rẻ Không Đục Phá, Có Mặt 15 Phút',
            'description' => 'Hút bể phốt Đông Triều cho nhà dân, trang trại, khu trọ. Tiếp nhận 05:00-22:00 hằng ngày, xe bồn vào ngõ sâu, báo giá trước, không đục phá khi chưa cần. Gọi 0963.953.533 / 0931.156.756.',
        ],
        296 => [
            'title' => 'Thông tắc cống Hạ Long cho nhà hàng, khách sạn, nhà dân',
            'description' => 'Thông tắc cống Hạ Long cho nhà hàng, khách sạn, nhà dân; tiếp nhận 05:00-22:00 hằng ngày, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 khi cống trào, mùi hôi, nước rút chậm.',
        ],
        425 => [
            'title' => 'Thông tắc cống Đông Triều, không đục phá, thợ có mặt nhanh',
            'description' => 'Thông tắc cống Đông Triều, tiếp nhận 05:00-22:00 hằng ngày, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi nhanh chóng tại nhà.',
        ],
        426 => [
            'title' => 'Thông tắc cống Móng Cái, không đục phá, thợ có mặt nhanh',
            'description' => 'Thông tắc cống Móng Cái, tiếp nhận 05:00-22:00 hằng ngày, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi nhanh chóng tại nhà.',
        ],
        427 => [
            'title' => 'Thông tắc cống Vân Đồn, không đục phá, thợ có mặt nhanh',
            'description' => 'Thông tắc cống Vân Đồn, tiếp nhận 05:00-22:00 hằng ngày, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi nhanh chóng tại nhà.',
        ],
    ];
}

function ttcqn_doorway_schema_current_meta_override(): ?array
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request() || !is_singular('page')) {
        return null;
    }

    $page_id = (int) get_queried_object_id();
    $overrides = ttcqn_doorway_schema_meta_overrides();

    return $overrides[$page_id] ?? null;
}

function ttcqn_doorway_schema_override_title($title): string
{
    $override = ttcqn_doorway_schema_current_meta_override();

    return $override !== null ? $override['title'] : (string) $title;
}

function ttcqn_doorway_schema_override_description($description): string
{
    $override = ttcqn_doorway_schema_current_meta_override();

    return $override !== null ? $override['description'] : (string) $description;
}

add_filter('pre_get_document_title', 'ttcqn_doorway_schema_override_title', 999);
add_filter('rank_math/frontend/title', 'ttcqn_doorway_schema_override_title', 999);
add_filter('rank_math/frontend/description', 'ttcqn_doorway_schema_override_description', 999);
add_filter('rank_math/opengraph/facebook/title', 'ttcqn_doorway_schema_override_title', 999);
add_filter('rank_math/opengraph/facebook/description', 'ttcqn_doorway_schema_override_description', 999);
add_filter('rank_math/opengraph/twitter/title', 'ttcqn_doorway_schema_override_title', 999);
add_filter('rank_math/opengraph/twitter/description', 'ttcqn_doorway_schema_override_description', 999);

/**
 * Intercept Rank Math JSON-LD output on the homepage to optimize WebSite Schema for Site Name.
 */
function ttcqn_doorway_schema_optimize_website_site_name(array $data, $jsonld): array
{
    $is_home = is_front_page() || is_home()
        || (function_exists('ttcqn_home_emergency_is_front_request') && ttcqn_home_emergency_is_front_request());

    if (!$is_home) {
        return $data;
    }

    foreach ($data as $key => $node) {
        if (isset($node['@type']) && $node['@type'] === 'WebSite') {
            $data[$key]['name'] = 'Thông Tắc Cống Quảng Ninh';
            // Xóa alternateName — nhiều tên khác nhau khiến Google không xác định được tên chính
            unset($data[$key]['alternateName']);
            $data[$key]['url'] = trailingslashit(home_url('/'));
            // Cập nhật potentialAction theo format EntryPoint mới (không deprecated)
            $data[$key]['potentialAction'] = [
                '@type'       => 'SearchAction',
                'target'      => [
                    '@type'       => 'EntryPoint',
                    'urlTemplate' => trailingslashit(home_url('/')) . '?s={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ];
        }
    }

    return $data;
}
add_filter('rank_math/json_ld', 'ttcqn_doorway_schema_optimize_website_site_name', 99, 2);

function ttcqn_doorway_schema_is_bad_youtube_video_node(array $node): bool
{
    $types = (array) ($node['@type'] ?? []);
    if (!in_array('VideoObject', $types, true)) {
        return false;
    }

    $haystack = implode(' ', [
        (string) ($node['name'] ?? ''),
        (string) ($node['description'] ?? ''),
        (string) ($node['embedUrl'] ?? ''),
        (string) ($node['contentUrl'] ?? ''),
    ]);

    return stripos($haystack, '0981.306.307') !== false
        || stripos($haystack, 'Môi Trường Đông Bắc') !== false
        || stripos($haystack, 'youtube.com/embed/') !== false
        || stripos($haystack, 'youtube.com/watch?v=') !== false
        || stripos($haystack, 'youtube.com/embed/vcVjDZLV_O0') !== false
        || stripos($haystack, 'youtube.com/watch?v=vcVjDZLV_O0') !== false
        || stripos($haystack, 'youtube.com/embed/oWFUTKj4O18') !== false
        || stripos($haystack, 'youtube.com/watch?v=oWFUTKj4O18') !== false;
}

function ttcqn_doorway_schema_remove_bad_youtube_video_nodes(array $data, $jsonld): array
{
    foreach ($data as $key => $node) {
        if (is_array($node) && ttcqn_doorway_schema_is_bad_youtube_video_node($node)) {
            unset($data[$key]);
        }
    }

    return $data;
}
add_filter('rank_math/json_ld', 'ttcqn_doorway_schema_remove_bad_youtube_video_nodes', 101, 2);

function ttcqn_doorway_schema_strip_escaped_json_ld_content(string $content): string
{
    return (string) preg_replace(
        '~<p[^>]*>\s*&lt;script\b[^&]*?type=&quot;application/ld\+json&quot;[\s\S]*?&lt;/script&gt;\s*</p>~iu',
        '',
        $content
    );
}

add_filter('the_content', 'ttcqn_doorway_schema_strip_escaped_json_ld_content', 20);

function ttcqn_doorway_schema_post_description(int $post_id): string
{
    $description = (string) get_post_meta($post_id, 'rank_math_description', true);
    if ($description === '') {
        $description = (string) get_post_meta($post_id, '_rank_math_description', true);
    }

    if ($description === '') {
        $description = has_excerpt($post_id)
            ? (string) get_the_excerpt($post_id)
            : wp_trim_words(ttcqn_doorway_schema_clean_text((string) get_post_field('post_content', $post_id)), 32, '...');
    }

    return ttcqn_doorway_schema_clean_text($description);
}

function ttcqn_doorway_schema_post_image(int $post_id): string
{
    $featured = get_the_post_thumbnail_url($post_id, 'full');
    if ($featured) {
        return $featured;
    }

    $content = (string) get_post_field('post_content', $post_id);
    if (preg_match('~<img[^>]+src=["\']([^"\']+)["\']~i', $content, $match)) {
        return esc_url_raw(html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, get_bloginfo('charset') ?: 'UTF-8'));
    }

    return home_url('/wp-content/uploads/2026/04/logo-cong-ty.png');
}

function ttcqn_doorway_schema_blogposting_node(int $post_id): array
{
    $url = get_permalink($post_id);
    $author_id = (int) get_post_field('post_author', $post_id);
    $author_name = $author_id > 0 ? (string) get_the_author_meta('display_name', $author_id) : '';
    if ($author_name === '') {
        $author_name = 'Thông Tắc Cống Quảng Ninh';
    }

    return [
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        '@id' => trailingslashit($url) . '#blogposting',
        'headline' => ttcqn_doorway_schema_clean_text(get_the_title($post_id)),
        'description' => ttcqn_doorway_schema_post_description($post_id),
        'url' => $url,
        'mainEntityOfPage' => [
            '@type' => 'WebPage',
            '@id' => $url,
        ],
        'image' => ttcqn_doorway_schema_post_image($post_id),
        'datePublished' => get_post_time(DATE_W3C, false, $post_id),
        'dateModified' => get_post_modified_time(DATE_W3C, false, $post_id),
        'inLanguage' => 'vi-VN',
        'author' => [
            '@type' => 'Person',
            'name' => $author_name,
        ],
        'publisher' => [
            '@id' => ttcqn_doorway_schema_business_id(),
        ],
        'isPartOf' => [
            '@id' => home_url('/#website'),
        ],
    ];
}

function ttcqn_doorway_schema_extract_faq_items(int $post_id): array
{
    $html = ttcqn_doorway_schema_strip_escaped_json_ld_content((string) get_post_field('post_content', $post_id));
    $faq_start = stripos($html, 'Câu hỏi thường gặp');
    if ($faq_start !== false) {
        $html = substr($html, $faq_start);
    }

    preg_match_all('~<p[^>]*>\s*<strong[^>]*>([\s\S]*?)</strong>\s*([\s\S]*?)</p>~iu', $html, $matches, PREG_SET_ORDER);

    $items = [];
    foreach ($matches as $match) {
        $question = ttcqn_doorway_schema_clean_text($match[1]);
        $answer = ttcqn_doorway_schema_clean_text($match[2]);

        if ($question === '' || $answer === '' || strpos($question, '?') === false) {
            continue;
        }

        $items[] = [
            'question' => $question,
            'answer' => $answer,
        ];

        if (count($items) >= 6) {
            break;
        }
    }

    return $items;
}

function ttcqn_doorway_schema_faq_node_for_post(int $post_id): ?array
{
    $items = ttcqn_doorway_schema_extract_faq_items($post_id);
    if (count($items) < 2) {
        return null;
    }

    $url = get_permalink($post_id);

    return [
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        '@id' => trailingslashit($url) . '#faq',
        'mainEntity' => array_map(static function (array $item): array {
            return [
                '@type' => 'Question',
                'name' => $item['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $item['answer'],
                ],
            ];
        }, $items),
    ];
}

function ttcqn_doorway_schema_article_page_ids(): array
{
    return [2025];
}

function ttcqn_doorway_schema_is_article_singular(): bool
{
    if (is_singular('post')) {
        return true;
    }

    return is_singular('page') && in_array((int) get_queried_object_id(), ttcqn_doorway_schema_article_page_ids(), true);
}

function ttcqn_doorway_schema_is_target_page(): bool
{
    return is_singular() && in_array((int) get_queried_object_id(), ttcqn_doorway_schema_target_page_ids(), true);
}

function ttcqn_doorway_schema_strip_weak_service_blocks(string $html): string
{
    if (!ttcqn_doorway_schema_is_target_page()) {
        return $html;
    }

    return (string) preg_replace_callback('~<script\b([^>]*type=["\']application/ld\+json["\'][^>]*)>([\s\S]*?)</script>~i', static function (array $match): string {
        $attrs = $match[1];
        if (stripos($attrs, 'data-ttcqn-doorway-schema') !== false || stripos($attrs, 'rank-math-schema') !== false) {
            return $match[0];
        }

        $decoded = json_decode(trim($match[2]), true);
        if (!is_array($decoded) || !isset($decoded['@type'])) {
            return $match[0];
        }

        $types = (array) $decoded['@type'];
        $is_weak_service = in_array('Service', $types, true) && (empty($decoded['@id']) || empty($decoded['name']));
        $is_stale_hbp_halong_faq = false;
        if ((int) get_queried_object_id() === 52 && in_array('FAQPage', $types, true)) {
            $first_question = $decoded['mainEntity'][0]['name'] ?? '';
            $is_stale_hbp_halong_faq = is_string($first_question)
                && stripos($first_question, 'Giá dịch vụ Hút bể phốt tại Hạ Long') !== false;
        }

        return ($is_weak_service || $is_stale_hbp_halong_faq) ? '' : $match[0];
    }, $html);
}

add_filter('template_redirect', static function (): void {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return;
    }

    ob_start('ttcqn_doorway_schema_strip_weak_service_blocks');
}, -2500);

function ttcqn_doorway_schema_render(): void
{
    if (!ttcqn_doorway_schema_is_target_page()) {
        return;
    }

    $page_id = get_queried_object_id();
    foreach (ttcqn_doorway_schema_page_nodes((int) $page_id) as $schema) {
        $json = wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            echo "\n<script type=\"application/ld+json\" data-ttcqn-doorway-schema=\"1\">{$json}</script>\n";
        }
    }
}

add_action('wp_head', 'ttcqn_doorway_schema_render', 50);

function ttcqn_doorway_schema_render_post_schema(): void
{
    if (!ttcqn_doorway_schema_is_article_singular()) {
        return;
    }

    $post_id = (int) get_queried_object_id();
    if ($post_id <= 0) {
        return;
    }

    $schemas = [ttcqn_doorway_schema_blogposting_node($post_id)];
    $faq = ttcqn_doorway_schema_faq_node_for_post($post_id);
    if ($faq !== null) {
        $schemas[] = $faq;
    }

    foreach ($schemas as $schema) {
        $json = wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            echo "\n<script type=\"application/ld+json\" data-ttcqn-post-schema=\"1\">{$json}</script>\n";
        }
    }
}

add_action('wp_head', 'ttcqn_doorway_schema_render_post_schema', 55);

/**
 * FAQPage schema hardcode cho page 63 (lien-he) và 386 (nguyen-nhan-cong-tac).
 * Các trang này có FAQ trong content nhưng không đúng format parser.
 */
function ttcqn_doorway_schema_extra_faq_map(): array
{
    return [
        52 => [
            ['q' => 'Bao lâu nên hút bể phốt một lần tại Hạ Long?',
             'a' => 'Với nhà dân, nên kiểm tra định kỳ khoảng 3–5 năm/lần tùy số người sử dụng. Với khách sạn, homestay, nhà hàng hoặc khu trọ, thời gian có thể ngắn hơn do tần suất dùng cao, nhất là mùa du lịch Hạ Long.'],
            ['q' => 'Bồn cầu rút chậm có phải luôn do bể phốt đầy không?',
             'a' => 'Không phải lúc nào cũng vậy. Nếu chỉ tắc một điểm, có thể là nghẹt cục bộ do giấy hoặc dị vật. Nếu nhiều điểm thoát nước cùng chậm, khả năng cao liên quan đến bể phốt, hố ga hoặc đường ống chính.'],
            ['q' => 'Giá hút bể phốt Hạ Long được tính như thế nào?',
             'a' => 'Giá phụ thuộc vào dung tích bể, độ đầy, vị trí nắp bể, lối xe vào, khoảng cách kéo ống và việc có cần xử lý tắc nghẽn kèm theo hay không. Khách nên gửi ảnh nắp bể và lối vào để báo giá sát hơn.'],
            ['q' => 'Nhà trong ngõ nhỏ hoặc đường dốc có hút được không?',
             'a' => 'Có. Khách cần báo trước vị trí xe có thể đỗ, chiều rộng ngõ và khoảng cách từ xe đến nắp bể để đội kỹ thuật chuẩn bị xe, ống hút và phương án kéo ống phù hợp.'],
            ['q' => 'Có nên tự đổ hóa chất khi bể phốt trào ngược không?',
             'a' => 'Không nên lạm dụng hóa chất khi chưa xác định đúng nguyên nhân, vì có thể không giải quyết được sự cố và làm khó kiểm tra thực tế hơn. Tốt nhất nên dừng xả nước và gọi kiểm tra sớm.'],
        ],
        63 => [
            ['q' => 'Liên hệ với công ty bằng cách nào?',
             'a' => 'Gọi hotline 0963.953.533 hoặc 0931.156.756 trong khung 05:00-22:00 hằng ngày. Có thể nhắn tin qua Zalo cùng số để được tiếp nhận nhanh.'],
            ['q' => 'Có cần gửi ảnh trước khi thợ đến không?',
             'a' => 'Nên gửi nếu có. Ảnh nắp bể, hố ga hoặc khu vực bị trào giúp thợ ước lượng phương án và mang đúng dụng cụ nhanh hơn.'],
            ['q' => 'Có báo giá qua điện thoại được không?',
             'a' => 'Có thể báo khoảng giá nếu thông tin rõ. Giá chính thức chốt sau khi kiểm tra thực tế để đảm bảo minh bạch.'],
            ['q' => 'Thợ có mặt sau bao lâu kể từ khi gọi?',
             'a' => 'Khu vực nội thành Hạ Long thường 15–30 phút. Khu vực xa hơn trong Quảng Ninh từ 30–60 phút tùy vị trí.'],
        ],
        386 => [
            ['q' => 'Cống tắc thường xuyên tại Hạ Long do nguyên nhân chính nào?',
             'a' => 'Ba nguyên nhân phổ biến nhất là rác sinh hoạt tích tụ, dầu mỡ từ bếp đóng cứng trong đường ống, và bùn cát từ mưa lớn dồn vào hố ga theo mùa.'],
            ['q' => 'Làm thế nào để ngăn cống tắc lặp lại?',
             'a' => 'Vệ sinh định kỳ 3–6 tháng/lần, lắp lưới lọc tại miệng hố ga, tránh đổ dầu mỡ và rác cứng xuống cống. Nếu đường ống cũ, nên kiểm tra camera nội soi để phát hiện nứt sớm.'],
            ['q' => 'Gọi xử lý cống tắc Hạ Long, bao lâu có thợ đến?',
             'a' => 'Khu vực trung tâm Hạ Long thường điều thợ trong 15–30 phút. Gọi 0963.953.533, khách được báo thời gian dự kiến ngay khi xác nhận ca.'],
        ],
    ];
}

function ttcqn_doorway_schema_render_extra_faq(): void
{
    if (!is_singular()) {
        return;
    }

    $page_id = (int) get_queried_object_id();
    $faq_map = ttcqn_doorway_schema_extra_faq_map();

    if (!isset($faq_map[$page_id])) {
        return;
    }

    $page_url = get_permalink($page_id);
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        '@id' => trailingslashit($page_url) . '#faq',
        'mainEntity' => array_map(static function (array $item): array {
            return [
                '@type' => 'Question',
                'name' => $item['q'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $item['a'],
                ],
            ];
        }, $faq_map[$page_id]),
    ];

    $json = wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json !== false) {
        echo "\n<script type=\"application/ld+json\" data-ttcqn-extra-faq=\"1\">{$json}</script>\n";
    }
}

add_action('wp_head', 'ttcqn_doorway_schema_render_extra_faq', 56);

/**
 * Fix Organization schema từ Rank Math:
 * - @id "#person" → "#organization" (Rank Math entity type bị cấu hình sai)
 * - addressLocality "Bãi Cháy" → "Hạ Long"
 * - thêm sameAs YouTube + Google Maps
 * - cập nhật WebSite publisher reference
 */
function ttcqn_doorway_schema_fix_organization_node(array $data, $jsonld): array
{
    $org_id_old = home_url('/#person');
    $org_id_new = home_url('/#organization');

    foreach ($data as $key => $node) {
        if (!is_array($node)) {
            continue;
        }

        $types = (array) ($node['@type'] ?? []);
        if (in_array('Organization', $types, true) && ($node['@id'] ?? '') === $org_id_old) {
            $data[$key]['@id'] = $org_id_new;

            if (isset($data[$key]['address']['addressLocality']) && $data[$key]['address']['addressLocality'] === 'Bãi Cháy') {
                $data[$key]['address']['addressLocality'] = 'Hạ Long';
            }

            $same_as = (array) ($data[$key]['sameAs'] ?? []);
            $yt    = 'https://www.youtube.com/@moitruongdothiso1quangninh';
            $maps  = 'https://maps.app.goo.gl/gbKEWZQjHR6yP9iW7';
            if (!in_array($yt, $same_as, true)) {
                $same_as[] = $yt;
            }
            if (!in_array($maps, $same_as, true)) {
                $same_as[] = $maps;
            }
            $data[$key]['sameAs'] = $same_as;
        }

        if (($node['@type'] ?? '') === 'WebSite') {
            if (($node['publisher']['@id'] ?? '') === $org_id_old) {
                $data[$key]['publisher']['@id'] = $org_id_new;
            }
        }
    }

    return $data;
}
add_filter('rank_math/json_ld', 'ttcqn_doorway_schema_fix_organization_node', 102, 2);

/**
 * LocalBusiness schema cho trang chủ — NAP khớp văn phòng Hạ Long.
 */
function ttcqn_doorway_schema_home_local_business_node(): array
{
    $node = [
        '@context' => 'https://schema.org',
        '@type'    => 'LocalBusiness',
        '@id'      => home_url('/#localbusiness'),
        'name'     => 'Thông Tắc Cống Quảng Ninh',
        'alternateName' => 'Hút Bể Phốt Quảng Ninh',
        'url'           => trailingslashit(home_url('/')),
        'image'         => home_url('/wp-content/uploads/2026/04/logo-cong-ty.png'),
        'telephone'     => ['+84963953533', '+84931156756'],
        'priceRange'    => '$$',
        'sameAs'        => [
            trailingslashit(home_url('/')),
            'https://www.facebook.com/moitruongquangninh',
            'https://www.youtube.com/@moitruongdothiso1quangninh',
            'https://www.tiktok.com/@thongtaccongquangninh',
        ],
        'address' => [
            '@type'           => 'PostalAddress',
            'streetAddress'   => '111 Cái Lân, Bãi Cháy',
            'addressLocality' => 'Hạ Long',
            'addressRegion'   => 'Quảng Ninh',
            'addressCountry'  => 'VN',
        ],
        'hasMap' => TTCQN_DOORWAY_OFFICE_HA_LONG_MAP_URL,
        'areaServed' => [
            'Hạ Long', 'Bãi Cháy', 'Hồng Gai', 'Hà Lầm', 'Cái Lân',
            'Cẩm Phả', 'Uông Bí', 'Quảng Yên', 'Đông Triều', 'Vân Đồn', 'Móng Cái', 'Quảng Ninh',
        ],
        'openingHoursSpecification' => [
            '@type'      => 'OpeningHoursSpecification',
            'dayOfWeek'  => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'opens'      => '05:00',
            'closes'     => '22:00',
        ],
        'department' => ttcqn_doorway_schema_departments(),
    ];

    return $node;
}

/**
 * Tạo mảng department cho tất cả 8 văn phòng.
 * Chỉ Hạ Long có hasMap; các văn phòng khác có địa chỉ + geo nhưng không có map URL.
 */
function ttcqn_doorway_schema_departments(): array
{
    $departments = [];
    foreach (ttcqn_doorway_offices() as $office) {
        $dept = [
            '@type'    => 'LocalBusiness',
            'name'     => 'Thông Tắc Cống Quảng Ninh - Văn Phòng ' . $office['label'],
            'telephone' => ['+84963953533', '+84931156756'],
            'address'  => [
                '@type'           => 'PostalAddress',
                'streetAddress'   => $office['street'],
                'addressLocality' => $office['locality'],
                'addressRegion'   => 'Quảng Ninh',
                'addressCountry'  => 'VN',
            ],
            'geo' => [
                '@type'     => 'GeoCoordinates',
                'latitude'  => $office['lat'],
                'longitude' => $office['lng'],
            ],
            'openingHoursSpecification' => [
                '@type'     => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'opens'     => '05:00',
                'closes'    => '22:00',
            ],
        ];
        // Chỉ thêm hasMap nếu văn phòng đã có xác minh Google Maps
        if (!empty($office['hasMap'])) {
            $dept['hasMap'] = $office['hasMap'];
        }
        $departments[] = $dept;
    }
    return $departments;
}

function ttcqn_doorway_schema_inject_home_local_business(array $data, $jsonld): array
{
    $is_home = is_front_page() || is_home()
        || (function_exists('ttcqn_home_emergency_is_front_request') && ttcqn_home_emergency_is_front_request());
    if (!$is_home) {
        return $data;
    }

    // Xóa LocalBusiness cũ của Rank Math (nếu có) để tránh duplicate
    foreach ($data as $key => $node) {
        if (isset($node['@type']) && $node['@type'] === 'LocalBusiness') {
            unset($data[$key]);
        }
    }

    if (function_exists('ttcqn_schema_home_graph')) {
        return $data;
    }

    $data['ttcqn-localbusiness'] = ttcqn_doorway_schema_home_local_business_node();
    return $data;
}
add_filter('rank_math/json_ld', 'ttcqn_doorway_schema_inject_home_local_business', 100, 2);
