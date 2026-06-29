<?php
if (!defined('ABSPATH')) {
    exit;
}

$home_renderer_main_file = dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php';
$hero_truck_url = ttcqn_seo_hero_asset('assets/septic-truck-real.webp');
$hero_worker_url = ttcqn_seo_hero_asset('assets/hero-worker-tho-thong-tac-cong-quang-ninh.webp');
$zalo_url = 'https://zalo.me/0931156756';
$facebook_url = 'https://www.facebook.com/moitruongquangninh';
$youtube_url = 'https://www.youtube.com/@moitruongdothiso1quangninh';
$tiktok_url = 'https://www.tiktok.com/@thongtaccongquangninh';
$office_ha_long_address = defined('TTCQN_HOME_OFFICE_HA_LONG_ADDRESS') ? TTCQN_HOME_OFFICE_HA_LONG_ADDRESS : '111 Cái Lân, Bãi Cháy, Quảng Ninh';
$office_ha_long_map_url = defined('TTCQN_HOME_OFFICE_HA_LONG_MAP_URL') ? TTCQN_HOME_OFFICE_HA_LONG_MAP_URL : 'https://www.google.com/maps/search/?api=1&query=20.962384198791902%2C107.05220536959965';
$office_ha_long_map_embed = defined('TTCQN_HOME_OFFICE_HA_LONG_MAP_EMBED') ? TTCQN_HOME_OFFICE_HA_LONG_MAP_EMBED : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.4385482896339!2d107.05220536959965!3d20.962384198791902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad947ef4a1ff%3A0xb82f0e88497fbc1c!2zSMO6dCBC4buDIFBo4buRdCAtIE3DtGkgdHLGsOG7nW5nIMSRw7QgdGjhu4sgc-G7kSAxIFF14bqjbmcgTmluaA!5e0!3m2!1svi!2s!4v1781835498222!5m2!1svi!2s';
?>
<footer class="home-footer" role="contentinfo">
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
          <h2 class="footer-map-title" id="footer-map-title">Địa chỉ văn phòng tại Quảng Ninh</h2>
        </div>
        <p class="footer-map-note">Khách hàng mở Google Maps và gọi trước để được điều phối kỹ thuật nhanh.</p>
      </div>
      <div class="footer-map-grid">
        <article class="footer-map-card">
          <iframe
            class="footer-map-frame"
            src="<?php echo esc_url($office_ha_long_map_embed); ?>"
            title="Bản đồ văn phòng Hạ Long - Môi Trường Đô Thị Số 1"
            width="400"
            height="300"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
          <div class="footer-map-caption">
            <h3>Văn phòng Hạ Long</h3>
            <p class="footer-map-address">Địa chỉ: <a href="<?php echo esc_url($office_ha_long_map_url); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($office_ha_long_address); ?></a></p>
            <p>Đầu mối tiếp nhận yêu cầu tại Hạ Long và điều phối kỹ thuật phục vụ toàn tỉnh Quảng Ninh.</p>
            <div class="footer-map-actions">
              <a class="footer-map-open" href="<?php echo esc_url($office_ha_long_map_url); ?>" target="_blank" rel="noopener noreferrer">Mở Google Maps</a>
            </div>
          </div>
        </article>
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
            <li><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg><a href="<?php echo esc_url(defined('TTCQN_HOME_OFFICE_HA_LONG_MAP_URL') ? TTCQN_HOME_OFFICE_HA_LONG_MAP_URL : 'https://www.google.com/maps/search/?api=1&query=111%20C%C3%A1i%20L%C3%A2n%2C%20B%C3%A3i%20Ch%C3%A1y%2C%20Qu%E1%BA%A3ng%20Ninh'); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html(defined('TTCQN_HOME_OFFICE_HA_LONG_ADDRESS') ? TTCQN_HOME_OFFICE_HA_LONG_ADDRESS : '111 Cái Lân, Bãi Cháy, Quảng Ninh'); ?></a></li>
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
            <li><a href="/hut-be-phot-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-truck"></use></svg>Hút bể phốt</a></li>
            <li><a href="/thong-tac-cong-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-wrench"></use></svg>Thông tắc cống</a></li>
            <li><a href="/thong-tac-bon-cau-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-toilet"></use></svg>Thông tắc bồn cầu</a></li>
            <li><a href="/thong-tac-chau-rua-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-sink"></use></svg>Thông tắc chậu rửa</a></li>
            <li><a href="/nao-vet-ho-ga-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-manhole"></use></svg>Nạo vét hố ga</a></li>
            <li><a href="/xu-ly-mui-hoi-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-leaf"></use></svg>Xử lý mùi hôi</a></li>
          </ul>
        </nav>

        <nav class="footer-link-col" data-footer-accordion aria-label="Khu vực phục vụ">
          <h3 class="footer-col-title">Khu vực phục vụ</h3>
          <button class="footer-accordion-toggle" type="button" aria-expanded="false" aria-controls="footer-area-list">
            <span class="footer-accordion-title"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Khu vực phục vụ</span>
            <svg class="footer-accordion-chevron footer-icon" aria-hidden="true"><use href="#ft-chevron"></use></svg>
          </button>
          <ul class="footer-link-list" id="footer-area-list">
            <li><a href="/hut-be-phot-ha-long/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Hạ Long</a></li>
            <li><a href="/hut-be-phot-cam-pha/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Cẩm Phả</a></li>
            <li><a href="/hut-be-phot-uong-bi/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Uông Bí</a></li>
            <li><a href="/hut-be-phot-mong-cai/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Móng Cái</a></li>
            <li><a href="/hut-be-phot-dong-trieu/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Đông Triều</a></li>
            <li><a href="/hut-be-phot-quang-yen/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Quảng Yên</a></li>
            <li><a href="/hut-be-phot-van-don/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Vân Đồn</a></li>
            <li><a href="/lien-he/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-pin"></use></svg>Và các khu vực khác...</a></li>
          </ul>
        </nav>

        <nav class="footer-link-col" data-footer-accordion aria-label="Liên kết nhanh">
          <h3 class="footer-col-title">Liên kết nhanh</h3>
          <button class="footer-accordion-toggle" type="button" aria-expanded="false" aria-controls="footer-quick-list">
            <span class="footer-accordion-title"><svg class="footer-icon" aria-hidden="true"><use href="#ft-home"></use></svg>Liên kết nhanh</span>
            <svg class="footer-accordion-chevron footer-icon" aria-hidden="true"><use href="#ft-chevron"></use></svg>
          </button>
          <ul class="footer-link-list" id="footer-quick-list">
            <li><a href="<?php echo esc_url(home_url('/')); ?>"><svg class="footer-icon" aria-hidden="true"><use href="#ft-home"></use></svg>Trang chủ</a></li>
            <li><a href="/gioi-thieu/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-info"></use></svg>Giới thiệu</a></li>
            <li><a href="/bang-gia/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-tag"></use></svg>Bảng giá</a></li>
            <li><a href="/hut-be-phot-quang-ninh/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-wrench"></use></svg>Dịch vụ</a></li>
            <li><a href="#du-an"><svg class="footer-icon" aria-hidden="true"><use href="#ft-images"></use></svg>Dự án - Hình ảnh</a></li>
            <li><a href="/blog/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-news"></use></svg>Tin tức</a></li>
            <li><a href="/lien-he/"><svg class="footer-icon" aria-hidden="true"><use href="#ft-mail"></use></svg>Liên hệ</a></li>
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
