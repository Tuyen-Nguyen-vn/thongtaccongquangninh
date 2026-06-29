<?php
/**
 * Plugin Name: TTCQN Mobile Left Sticky CTA
 * Description: Hiển thị 2 icon nổi (Gọi điện + Zalo) ở góc TRÁI màn hình mobile, lơ lửng theo cuộn chuột.
 * Version: 2026.05.16.3
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_MLS_VERSION = '2026.05.16.3';
const TTCQN_MLS_PHONE   = '0963953533';
const TTCQN_MLS_ZALO    = '0931156756';

function ttcqn_mls_asset(string $file): string
{
    return plugins_url('assets/contact-icons/' . ltrim($file, '/'), dirname(__DIR__) . '/ttcqn-home-emergency-renderer.php');
}

add_action('wp_footer', function (): void {
    if (is_admin()) {
        return;
    }

    $phone_href      = 'tel:' . TTCQN_MLS_PHONE;
    $zalo_href       = 'https://zalo.me/' . TTCQN_MLS_ZALO;
    ?>
<style id="ttcqn-mls-style">
.ttcqn-mls{display:none}
.ttcqn-mls a{text-decoration:none !important}
@media(max-width:768px){
  .ttcqn-mls{
    position:fixed;
    left:12px;
    bottom:calc(20px + env(safe-area-inset-bottom,0px));
    z-index:99990;
    display:flex;
    flex-direction:column;
    gap:12px;
    pointer-events:none;
  }
  .ttcqn-mls a{
    pointer-events:auto;
    position:relative;
    display:flex;
    align-items:center;
    justify-content:center;
    width:58px;
    height:58px;
    border-radius:50%;
    color:#fff;
    box-shadow:0 6px 20px rgba(0,0,0,.22),0 0 0 2px rgba(57,183,47,.18);
    text-decoration:none;
    -webkit-tap-highlight-color:transparent;
  }
  .ttcqn-mls-call{background:linear-gradient(145deg,var(--ttcqn-color-primary-bright,#7ed957),var(--ttcqn-color-primary-hover,#168b39))}
  .ttcqn-mls-zalo{background:linear-gradient(145deg,var(--ttcqn-color-surface,#ffffff),var(--ttcqn-color-surface-muted,#eef8ff))}
  .ttcqn-mls a:active{transform:scale(.93)}
  .ttcqn-mls svg{
    display:block;
    aspect-ratio:1 / 1;
    flex:0 0 auto;
    overflow:visible;
    transform-box:fill-box;
    transform-origin:center;
  }
  .ttcqn-mls svg *{vector-effect:non-scaling-stroke}
  .ttcqn-mls-call svg{
    width:34px;
    height:34px;
    fill:none;
    stroke:currentColor;
    stroke-width:2.5;
    stroke-linecap:round;
    stroke-linejoin:round;
  }
  .ttcqn-mls-zalo svg{
    width:42px;
    height:42px;
    color:var(--ttcqn-color-secondary,#0b6fd3);
  }
  .ttcqn-mls-zalo text{
    font-family:Arial,sans-serif;
    font-size:8px;
    font-weight:900;
    letter-spacing:-.2px;
  }
  .ttcqn-mls a::before{
    content:'';
    position:absolute;
    inset:-5px;
    border-radius:50%;
    pointer-events:none;
  }
  .ttcqn-mls-call::before{animation:ttcqnMlsRingGreen 2.6s ease-out infinite}
  .ttcqn-mls-zalo::before{animation:ttcqnMlsRingBlue 2.6s ease-out .9s infinite}
  @keyframes ttcqnMlsRingGreen{
    0%{box-shadow:0 0 0 0 rgba(54,183,87,.5)}
    70%{box-shadow:0 0 0 16px rgba(54,183,87,0)}
    100%{box-shadow:0 0 0 0 rgba(54,183,87,0)}
  }
  @keyframes ttcqnMlsRingBlue{
    0%{box-shadow:0 0 0 0 rgba(11,111,211,.5)}
    70%{box-shadow:0 0 0 16px rgba(11,111,211,0)}
    100%{box-shadow:0 0 0 0 rgba(11,111,211,0)}
  }
  @media(prefers-reduced-motion:reduce){
    .ttcqn-mls a::before{animation:none}
  }
}
</style>
<nav class="ttcqn-mls" aria-label="Liên hệ nhanh">
  <a class="ttcqn-mls-call" href="<?php echo esc_attr($phone_href); ?>" aria-label="Gọi 0963.953.533 – hút bể phốt thông tắc cống Quảng Ninh">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 16.9v2.6a2 2 0 0 1-2.2 2C10 20.6 3.4 14 2.5 4.2A2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a13.8 13.8 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>
  </a>
  <a class="ttcqn-mls-zalo" href="<?php echo esc_url($zalo_href); ?>" target="_blank" rel="nofollow noopener noreferrer" aria-label="Nhắn Zalo 0931.156.756 – tư vấn miễn phí">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.75" y="3.25" width="18.5" height="17.5" rx="5" fill="#fff" stroke="currentColor" stroke-width="2"/><text x="12" y="15.7" text-anchor="middle" fill="currentColor">Zalo</text></svg>
  </a>
</nav>
    <?php
}, 100);

register_activation_hook(__FILE__, function (): void {
    if (class_exists('LiteSpeed_Cache_API') && method_exists('LiteSpeed_Cache_API', 'purge_all')) {
        LiteSpeed_Cache_API::purge_all();
    }
    if (function_exists('rocket_clean_domain')) {
        rocket_clean_domain();
    }
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
});
