<?php
if (!defined('ABSPATH')) { exit; }

$home_url    = home_url('/');
$hero_img    = 'https://thongtaccongquangninh.com/wp-content/uploads/2026/04/moi-truong-do-thi-so-1-1-scaled.webp';
$hotline     = '0963.953.533';
$hotline_tel = 'tel:0963953533';
$zalo_url    = 'https://zalo.me/0963953533';
$canonical   = home_url('/he-thong-co-so-quang-ninh/');

$locations = [
    'Thành phố Hạ Long' => [
        ['Cơ sở 1', '260 Ngọc Vừng, Phường Hà Khánh, Thành phố Hạ Long, Quảng Ninh'],
        ['Cơ sở 2', 'Số 15 Đường Giếng Đáy, Phường Giếng Đáy, Thành phố Hạ Long, Quảng Ninh'],
        ['Cơ sở 3', 'Số 124 Đường Hạ Long, Phường Bãi Cháy, Thành phố Hạ Long, Quảng Ninh'],
    ],
    'Thành phố Cẩm Phả' => [
        ['Cơ sở 4', 'Số 126 Đường Trần Phú, Phường Cẩm Trung, Thành phố Cẩm Phả, Quảng Ninh'],
        ['Cơ sở 5', 'Số 45 Đường Lý Bôn, Phường Cửa Ông, Thành phố Cẩm Phả, Quảng Ninh'],
    ],
    'Thành phố Uông Bí' => [
        ['Cơ sở 6', 'Số 82 Đường Quang Trung, Phường Quang Trung, Thành phố Uông Bí, Quảng Ninh'],
        ['Cơ sở 7', 'Số 18 Đường Trần Hưng Đạo, Phường Thanh Sơn, Thành phố Uông Bí, Quảng Ninh'],
    ],
    'Móng Cái, Quảng Yên, Đông Triều, Vân Đồn' => [
        ['Cơ sở 8', 'Số 22 Đại lộ Hòa Bình, Phường Trần Phú, Thành phố Móng Cái, Quảng Ninh'],
        ['Cơ sở 9', 'Số 55 Đường Lê Lợi, Phường Quảng Yên, Thị xã Quảng Yên, Quảng Ninh'],
        ['Cơ sở 10', 'Số 102 Đường Nguyễn Bình, Phường Đông Triều, Thị xã Đông Triều, Quảng Ninh'],
        ['Cơ sở 11', 'Số 34 Đường Cái Rồng, Khu 5, Thị trấn Cái Rồng, Huyện Vân Đồn, Quảng Ninh'],
    ],
];

$total_locations = 0;
foreach ($locations as $items) { $total_locations += count($items); }

// Build ItemList schema
$schema_items = [];
$pos = 1;
foreach ($locations as $items) {
    foreach ($items as $item) {
        $schema_items[] = [
            '@type'    => 'ListItem',
            'position' => $pos++,
            'name'     => $item[0] . ' - ' . $item[1],
            'url'      => 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($item[1]),
        ];
    }
}
$schema = [
    '@context' => 'https://schema.org',
    '@graph'   => [
        [
            '@type'       => 'CollectionPage',
            '@id'         => $canonical . '#webpage',
            'url'         => $canonical,
            'name'        => 'Hệ thống cơ sở Công Ty Môi Trường Đô Thị Số 1 Quảng Ninh',
            'description' => 'Danh sách cơ sở tại Quảng Ninh kèm chỉ đường Google Maps để khách hàng dễ đến trực tiếp.',
            'inLanguage'  => 'vi-VN',
        ],
        [
            '@type'           => 'ItemList',
            '@id'             => $canonical . '#locations',
            'name'            => 'Hệ thống cơ sở tại Quảng Ninh',
            'itemListElement' => $schema_items,
        ],
    ],
];
?><!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hệ Thống Cơ Sở Quảng Ninh | Công Ty Môi Trường Đô Thị Số 1 Quảng Ninh</title>
    <meta name="description" content="Xem hệ thống cơ sở tại Quảng Ninh, chọn địa điểm gần nhất và mở Google Maps để đi trực tiếp.">
    <link rel="canonical" href="<?php echo esc_url($canonical); ?>">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="vi_VN">
    <meta property="og:title" content="Hệ Thống Cơ Sở Quảng Ninh | Công Ty Môi Trường Đô Thị Số 1 Quảng Ninh">
    <meta property="og:description" content="Xem hệ thống cơ sở tại Quảng Ninh, chọn địa điểm gần nhất và mở Google Maps để đi trực tiếp.">
    <meta property="og:url" content="<?php echo esc_url($canonical); ?>">
    <meta property="og:image" content="<?php echo esc_url($hero_img); ?>">
    <script type="application/ld+json"><?php echo wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?></script>
    <?php wp_head(); ?>
    <style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; color: #102235; background: linear-gradient(180deg, #f4f9ff 0%, #ffffff 58%, #eef6ff 100%); }
        a { color: inherit; }

        /* ── shell ── */
        .coso-shell { max-width: 1180px; margin: 0 auto; padding: 0 18px; }

        /* ── hero ── */
        .coso-hero { display: grid; grid-template-columns: minmax(0,.92fr) minmax(300px,1.08fr); gap: 22px; align-items: center; padding: 28px 0 32px; }
        .coso-kicker { display: inline-flex; align-items: center; min-height: 34px; padding: 0 12px; border-radius: 999px; background: rgba(37,99,235,.08); color: #1d5cab; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .coso-hero h1 { margin: 14px 0 10px; font-size: clamp(32px, 4vw, 52px); line-height: 1.05; }
        .coso-hero p { margin: 0; max-width: 560px; font-size: 17px; line-height: 1.7; color: #46637d; }
        .coso-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .coso-pills span { display: inline-flex; align-items: center; min-height: 34px; padding: 0 12px; border-radius: 999px; background: #fff; border: 1px solid rgba(37,99,235,.1); color: #244968; font-size: 13px; font-weight: 700; }
        .coso-media { position: relative; min-height: 420px; overflow: hidden; border-radius: 28px; background: #0e2238; box-shadow: 0 24px 60px rgba(7,19,31,.18); }
        .coso-media img { width: 100%; height: 100%; display: block; object-fit: cover; }
        .coso-media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(7,19,31,.12), rgba(7,19,31,.44)); }

        /* ── grid listing ── */
        .coso-section-title { margin: 8px 0 18px; font-size: clamp(26px, 3vw, 38px); line-height: 1.1; }
        .coso-section-copy { margin: 0 0 20px; color: #46637d; line-height: 1.7; }
        .coso-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }
        .coso-card { padding: 20px; border-radius: 24px; background: #fff; border: 1px solid rgba(37,99,235,.08); box-shadow: 0 16px 38px rgba(37,99,235,.08); }
        .coso-card h2 { margin: 0 0 12px; color: #12385a; font-size: 18px; }
        .coso-item { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 14px; border-radius: 18px; background: #f6faff; border: 1px solid rgba(37,99,235,.08); }
        .coso-item strong { display: block; margin-bottom: 4px; font-size: 15px; }
        .coso-item span { display: block; color: #4b6880; font-size: 14px; line-height: 1.6; }
        .coso-item a { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 14px; border-radius: 999px; text-decoration: none; background: linear-gradient(135deg, #1ecfff, #2563eb); color: #fff; font-weight: 700; font-size: 13px; white-space: nowrap; }
        .coso-items-list { display: flex; flex-direction: column; gap: 12px; }

        /* ── footer CTA ── */
        .coso-footer-cta { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 16px; align-items: center; padding: 22px 28px; margin: 32px 0 48px; border-radius: 24px; background: linear-gradient(135deg, #0f2238, #14385d); color: #fff; }
        .coso-footer-cta h2 { margin: 0 0 8px; font-size: 22px; }
        .coso-footer-cta p { margin: 0; color: rgba(231,242,250,.82); line-height: 1.7; font-size: 15px; }
        .coso-footer-btns { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .coso-btn-zalo { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 18px; border-radius: 999px; text-decoration: none; background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2); font-weight: 700; font-size: 14px; }
        .coso-btn-primary-footer { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 20px; border-radius: 999px; text-decoration: none; background: linear-gradient(135deg, #1ecfff, #2563eb); color: #fff; font-weight: 700; font-size: 14px; box-shadow: 0 8px 18px rgba(37,99,235,.25); }

        /* ── responsive ── */
        @media (max-width: 900px) {
            .coso-hero, .coso-grid-2, .coso-footer-cta { grid-template-columns: 1fr; }
            .coso-media { min-height: 280px; order: -1; }
            .coso-footer-btns { justify-content: flex-start; }
        }
        @media (max-width: 640px) {
            .coso-shell { padding: 0 14px; }
            .coso-item { grid-template-columns: 1fr; }
            .coso-item a { width: 100%; }
            .coso-hero h1 { font-size: 30px; }
        }
    </style>
</head>
<body class="ttcqn-shared-header-active">

<?php echo ttcqn_shared_header_render_markup(); // phpcs:ignore ?>

<div class="coso-shell">

  <section class="coso-hero">
    <div>
      <span class="coso-kicker">Chỉ đường nhanh bằng Google Maps</span>
      <h1>Hệ thống cơ sở tại Quảng Ninh</h1>
      <p>Khách cần đến trực tiếp có thể chọn khu vực gần nhất, bấm mở Google Maps và đi theo chỉ dẫn ngay trên điện thoại.</p>
      <div class="coso-pills">
        <span><?php echo (int) $total_locations; ?> cơ sở đang hiển thị</span>
        <span>Mở chỉ đường nhanh</span>
        <span>Dễ chia sẻ qua Zalo, Facebook</span>
      </div>
    </div>
    <div class="coso-media">
      <img src="<?php echo esc_url($hero_img); ?>" alt="Hệ thống cơ sở môi trường tại Quảng Ninh" width="900" height="600" loading="eager">
    </div>
  </section>

  <section>
    <h2 class="coso-section-title">Danh sách cơ sở và chỉ đường</h2>
    <p class="coso-section-copy">Trang này được thiết kế riêng để khách hàng dễ tìm, dễ chia sẻ và cũng tốt hơn cho SEO khi tìm các từ khóa liên quan đến địa điểm tại Quảng Ninh.</p>
    <div class="coso-grid-2">
      <?php foreach ($locations as $city => $items) : ?>
        <article class="coso-card">
          <h2><?php echo esc_html($city); ?></h2>
          <div class="coso-items-list">
            <?php foreach ($items as $item) : ?>
              <div class="coso-item">
                <div>
                  <strong><?php echo esc_html($item[0]); ?></strong>
                  <span><?php echo esc_html($item[1]); ?></span>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=<?php echo rawurlencode($item[1]); ?>" target="_blank" rel="noopener noreferrer">Mở chỉ đường</a>
              </div>
            <?php endforeach; ?>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="coso-footer-cta" aria-label="Liên hệ hỗ trợ">
    <div>
      <h2>Cần hỗ trợ trước khi đến cơ sở?</h2>
      <p>Gọi trực tiếp để được hướng dẫn cơ sở gần nhất, kiểm tra lịch làm việc và tư vấn nhanh trước khi di chuyển.</p>
    </div>
    <div class="coso-footer-btns">
      <a class="coso-btn-zalo" href="<?php echo esc_url($zalo_url); ?>" target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
      <a class="coso-btn-primary-footer" href="<?php echo esc_url($hotline_tel); ?>">Gọi <?php echo esc_html($hotline); ?></a>
    </div>
  </section>

</div>

<?php include dirname(__DIR__, 2) . '/ttcqn-home-emergency-renderer/templates/shared-footer.php'; ?>

<?php wp_footer(); ?>
</body>
</html>
