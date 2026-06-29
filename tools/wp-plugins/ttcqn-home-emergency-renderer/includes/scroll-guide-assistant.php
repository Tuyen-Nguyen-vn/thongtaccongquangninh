<?php
/**
 * Plugin Name: TTCQN Scroll Guide Assistant
 * Description: Trợ lý dẫn đường theo section khi người dùng cuộn trang cho thongtaccongquangninh.com.
 * Version: 2026.05.19.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

const TTCQN_SCROLL_GUIDE_VERSION = '2026.05.19.1';

function ttcqn_scroll_guide_flush_cache(): void
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

register_activation_hook(__FILE__, 'ttcqn_scroll_guide_flush_cache');

function ttcqn_scroll_guide_should_render(): bool
{
    if (is_admin() || wp_doing_ajax() || wp_is_json_request()) {
        return false;
    }

    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return false;
    }

    return true;
}

function ttcqn_scroll_guide_remove_balanced_div(string $html, string $needle): string
{
    $offset = 0;

    while (($start = strpos($html, $needle, $offset)) !== false) {
        $div_start = strripos(substr($html, 0, $start), '<div');
        if ($div_start === false) {
            $offset = $start + strlen($needle);
            continue;
        }

        $chunk = substr($html, $div_start);
        if (!preg_match_all('~</?div\b[^>]*>~i', $chunk, $matches, PREG_OFFSET_CAPTURE)) {
            $offset = $start + strlen($needle);
            continue;
        }

        $depth = 0;
        $end = null;
        foreach ($matches[0] as $match) {
            $tag = $match[0];
            $position = $match[1];
            if (stripos($tag, '</div') === 0) {
                $depth--;
                if ($depth === 0) {
                    $end = $div_start + $position + strlen($tag);
                    break;
                }
            } else {
                $depth++;
            }
        }

        if ($end === null || $end <= $div_start) {
            $offset = $start + strlen($needle);
            continue;
        }

        $html = substr($html, 0, $div_start) . "\n" . substr($html, $end);
        $offset = $div_start;
    }

    return $html;
}

function ttcqn_scroll_guide_clean_legacy_output(string $html): string
{
    $has_legacy_guide = (
        strpos($html, 'id="sa-wrap"') !== false ||
        strpos($html, "id='sa-wrap'") !== false ||
        strpos($html, 'var S=[') !== false
    );

    $has_legacy_footer_widgets = (
        strpos($html, 'id="ai-exit-popup-overlay"') !== false ||
        strpos($html, "id='ai-exit-popup-overlay'") !== false ||
        strpos($html, 'id="ai-back-to-top"') !== false ||
        strpos($html, "id='ai-back-to-top'") !== false ||
        strpos($html, 'ai-pr-block-container') !== false
    );

    if (!$has_legacy_guide && !$has_legacy_footer_widgets) {
        return $html;
    }

    if ($has_legacy_footer_widgets) {
        $html = ttcqn_scroll_guide_remove_balanced_div($html, 'id="ai-exit-popup-overlay"');
        $html = ttcqn_scroll_guide_remove_balanced_div($html, "id='ai-exit-popup-overlay'");

        $html = ttcqn_scroll_guide_remove_balanced_div($html, 'id="ai-back-to-top"');
        $html = ttcqn_scroll_guide_remove_balanced_div($html, "id='ai-back-to-top'");

        $html = preg_replace(
            '~\n?\s*<style>\s*\.ai-pr-block-container[\s\S]*?</style>\s*~',
            "\n",
            $html
        ) ?? $html;

        $html = ttcqn_scroll_guide_remove_balanced_div($html, 'class="ai-pr-block-container"');
        $html = ttcqn_scroll_guide_remove_balanced_div($html, "class='ai-pr-block-container'");
    }

    if ($has_legacy_guide) {
        $html = preg_replace(
            '~\n?<!-- Scroll Assistant Desktop -->.*?<!-- Mobile Modal -->.*?</div>\s*(?=<script>)~s',
            "\n",
            $html
        ) ?? $html;

        $html = preg_replace(
            '~\s*/\* === SCROLL ASSISTANT === \*/.*?@keyframes saSlide\{0%\{transform:translateY\(40px\);opacity:0\}100%\{transform:translateY\(0\);opacity:1\}\}\s*~s',
            "\n",
            $html
        ) ?? $html;

        $scriptStart = strpos($html, 'var S=[');
        $scriptEnd = strpos($html, '// Exit popup', $scriptStart ?: 0);
        if ($scriptStart !== false && $scriptEnd !== false && $scriptEnd > $scriptStart) {
            $html = substr($html, 0, $scriptStart) . substr($html, $scriptEnd);
        }
    }

    return $html;
}

add_action('plugins_loaded', function (): void {
    if (!ttcqn_scroll_guide_should_render()) {
        return;
    }

    ob_start('ttcqn_scroll_guide_clean_legacy_output');
}, 0);

add_action('wp_footer', function (): void {
    if (!ttcqn_scroll_guide_should_render()) {
        return;
    }
    ?>
<!-- TTCQN Scroll Guide Assistant v<?php echo esc_html(TTCQN_SCROLL_GUIDE_VERSION); ?> -->
<div class="ttcqn-sga" data-ttcqn-scroll-guide data-state="collapsed" data-active-key="services" aria-live="polite">
  <button class="ttcqn-sga-chip" type="button" data-sga-open aria-label="Mở trợ lý dẫn đường">
    <span class="ttcqn-sga-chip-dot" aria-hidden="true"></span>
    <span class="ttcqn-sga-chip-text">Trợ lý</span>
  </button>

  <aside class="ttcqn-sga-panel" aria-label="Trợ lý dẫn đường khi cuộn trang">
    <div class="ttcqn-sga-card">
      <div class="ttcqn-sga-head">
        <div>
          <span class="ttcqn-sga-eyebrow">Trợ lý dẫn đường</span>
          <strong class="ttcqn-sga-brand">Môi Trường Đô Thị Số 1</strong>
        </div>
        <div class="ttcqn-sga-actions">
          <button class="ttcqn-sga-icon-btn" type="button" data-sga-collapse aria-label="Thu gọn trợ lý">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <button class="ttcqn-sga-icon-btn" type="button" data-sga-close aria-label="Đóng trợ lý">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
      </div>

      <div class="ttcqn-sga-body">
        <div class="ttcqn-sga-copy" data-sga-copy>
          <p class="ttcqn-sga-current" data-sga-title>Dịch vụ của chúng tôi</p>
          <div class="ttcqn-sga-cta-row">
            <a class="ttcqn-sga-call" data-sga-cta href="tel:0963953533">Gọi kỹ thuật ngay</a>
            <a class="ttcqn-sga-quick-call" href="tel:0963953533" aria-label="Gọi nhanh hotline 0963.953.533">Gọi nhanh</a>
          </div>
        </div>
      </div>
    </div>

    <nav class="ttcqn-sga-nav" aria-label="Các mục trên trang">
      <button type="button" data-sga-nav="services"><span></span>Dịch vụ</button>
      <button type="button" data-sga-nav="about"><span></span>Giới thiệu</button>
      <button type="button" data-sga-nav="projects"><span></span>Dự án</button>
      <button type="button" data-sga-nav="commitments"><span></span>Cam kết</button>
      <button type="button" data-sga-nav="contact"><span></span>Liên hệ</button>
    </nav>
  </aside>
</div>

<style id="ttcqn-scroll-guide-css">
  /* Ẩn các bản trợ lý dẫn đường cũ nếu còn được theme/plugin khác bơm ra. */
  .ttcqn-old-scroll-assistant,
  .ttcqn-scroll-helper-old,
  .ttcqn-floating-guide,
  .ttcqn-guide-assistant:not(.ttcqn-sga),
  .scroll-guide-assistant:not(.ttcqn-sga),
  #sa-wrap,
  #sa-chip,
  #sa-modal,
  [data-old-scroll-guide],
  [data-legacy-guide-assistant] {
    display: none !important;
  }

  .ttcqn-sga,
  .ttcqn-sga * {
    box-sizing: border-box;
  }

  .ttcqn-sga {
    --sga-blue: var(--ttcqn-color-dark-3, #06223f);
    --sga-blue-2: var(--ttcqn-color-secondary-hover, #0757ba);
    --sga-green: var(--ttcqn-color-primary, #36b757);
    --sga-neon: var(--ttcqn-color-primary-bright, #7ed957);
    --sga-ink: var(--ttcqn-color-text-primary, #102a43);
    --sga-shadow: 0 14px 36px rgba(3, 20, 39, .22);
    position: fixed;
    right: max(22px, env(safe-area-inset-right));
    top: 50%;
    bottom: auto;
    transform: translateY(-50%);
    display: grid;
    justify-items: end;
    max-width: calc(100vw - 44px);
    overflow: hidden;
    z-index: 2147482500;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--sga-ink);
  }

  .ttcqn-sga-panel {
    width: min(330px, calc(100vw - 32px));
    max-width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 128px;
    gap: 12px;
    align-items: stretch;
    transform: translateX(0);
    opacity: 1;
    transition: transform .28s ease, opacity .22s ease;
  }

  .ttcqn-sga-card,
  .ttcqn-sga-nav {
    border: 1px solid rgba(33, 180, 91, .26);
    box-shadow: var(--sga-shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .ttcqn-sga-card {
    min-width: 0;
    overflow: hidden;
    border-radius: 16px;
    background:
      radial-gradient(circle at 90% 0%, rgba(167, 255, 63, .18), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, .96), rgba(243, 251, 255, .94));
  }

  .ttcqn-sga-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px 12px 9px;
    background: linear-gradient(135deg, rgba(6, 34, 63, .96), rgba(11, 86, 92, .92));
    color: #fff;
  }

  .ttcqn-sga-eyebrow {
    display: block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .02em;
    text-transform: uppercase;
    color: var(--sga-neon);
  }

  .ttcqn-sga-brand {
    display: block;
    margin-top: 1px;
    font-size: 12px;
    line-height: 1.2;
  }

  .ttcqn-sga-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex: 0 0 auto;
  }

  .ttcqn-sga-icon-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    padding: 0 !important;
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: 999px;
    display: inline-grid;
    place-items: center;
    color: #fff;
    background: rgba(255, 255, 255, .1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
    cursor: pointer;
    line-height: 0;
    appearance: none;
    -webkit-appearance: none;
    transition: background .2s ease, transform .2s ease;
  }

  .ttcqn-sga-icon-btn:hover {
    background: rgba(255, 255, 255, .18);
    transform: translateY(-1px);
  }

  .ttcqn-sga-icon-btn svg {
    display: block;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.35;
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: none;
  }

  .ttcqn-sga-icon-btn[data-sga-collapse] svg {
    transform: translateY(1px);
  }

  .ttcqn-sga-icon-btn[data-sga-close] svg {
    width: 17px;
    height: 17px;
  }

  .ttcqn-sga-body {
    padding: 12px;
  }

  .ttcqn-sga-copy {
    min-width: 0;
    transition: opacity .18s ease, transform .18s ease;
  }

  .ttcqn-sga-copy.is-changing {
    opacity: 0;
    transform: translateY(4px);
  }

  .ttcqn-sga-current {
    margin: 0 0 9px;
    color: var(--sga-blue-2);
    font-size: 14px;
    font-weight: 850;
    line-height: 1.35;
  }

  .ttcqn-sga-call {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 13px;
    border-radius: 999px;
    color: #fff !important;
    text-decoration: none !important;
    font-size: 12.5px;
    font-weight: 850;
    background: linear-gradient(135deg, var(--sga-green), var(--sga-blue-2));
    box-shadow: 0 10px 22px rgba(21, 105, 199, .22);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .ttcqn-sga-cta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .ttcqn-sga-quick-call {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 12px;
    border: 1px solid rgba(10, 77, 143, .2);
    border-radius: 999px;
    color: var(--sga-blue-2) !important;
    background: rgba(255, 255, 255, .82);
    text-decoration: none !important;
    font-size: 12.5px;
    font-weight: 850;
  }

  .ttcqn-sga-call:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(33, 180, 91, .28);
  }

  .ttcqn-sga-nav {
    min-width: 0;
    padding: 14px 12px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(4, 24, 46, .92), rgba(3, 35, 43, .9));
    display: grid;
    gap: 5px;
    position: relative;
  }

  .ttcqn-sga-nav::before {
    content: "";
    position: absolute;
    left: 22px;
    top: 28px;
    bottom: 28px;
    width: 2px;
    background: linear-gradient(180deg, rgba(167, 255, 63, .78), rgba(255, 255, 255, .22));
  }

  .ttcqn-sga-nav button {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 34px;
    padding: 4px 0;
    border: 0;
    color: rgba(255, 255, 255, .68);
    background: transparent;
    font: inherit;
    font-size: 12.5px;
    font-weight: 750;
    text-align: left;
    cursor: pointer;
  }

  .ttcqn-sga-nav button span {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255, 255, 255, .48);
    border-radius: 50%;
    background: var(--sga-blue);
    box-shadow: 0 0 0 3px rgba(6, 34, 63, .76);
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .ttcqn-sga[data-active-key="services"] [data-sga-nav="services"],
  .ttcqn-sga[data-active-key="about"] [data-sga-nav="about"],
  .ttcqn-sga[data-active-key="projects"] [data-sga-nav="projects"],
  .ttcqn-sga[data-active-key="commitments"] [data-sga-nav="commitments"],
  .ttcqn-sga[data-active-key="contact"] [data-sga-nav="contact"] {
    color: var(--sga-neon);
  }

  .ttcqn-sga[data-active-key="services"] [data-sga-nav="services"] span,
  .ttcqn-sga[data-active-key="about"] [data-sga-nav="about"] span,
  .ttcqn-sga[data-active-key="projects"] [data-sga-nav="projects"] span,
  .ttcqn-sga[data-active-key="commitments"] [data-sga-nav="commitments"] span,
  .ttcqn-sga[data-active-key="contact"] [data-sga-nav="contact"] span {
    border-color: var(--sga-neon);
    background: var(--sga-green);
    box-shadow: 0 0 0 4px rgba(33, 180, 91, .22), 0 0 18px rgba(167, 255, 63, .68);
  }

  .ttcqn-sga-chip {
    display: none;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    border: 1px solid rgba(167, 255, 63, .34);
    border-radius: 999px;
    padding: 9px 12px;
    color: #fff;
    background: linear-gradient(135deg, rgba(6, 34, 63, .96), rgba(15, 118, 83, .94));
    box-shadow: 0 14px 34px rgba(3, 20, 39, .28);
    font: inherit;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }

  .ttcqn-sga-chip-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--sga-neon);
    box-shadow: 0 0 0 5px rgba(167, 255, 63, .16), 0 0 20px rgba(167, 255, 63, .7);
  }

  .ttcqn-sga[data-state="collapsed"] .ttcqn-sga-panel,
  .ttcqn-sga[data-state="closed"] .ttcqn-sga-panel {
    opacity: 0;
    pointer-events: none;
    transform: translateX(18px) scale(.98);
  }

  .ttcqn-sga[data-state="collapsed"] .ttcqn-sga-chip,
  .ttcqn-sga[data-state="closed"] .ttcqn-sga-chip {
    display: inline-flex;
  }

  @media (max-width: 1240px) {
    .ttcqn-sga-panel {
      grid-template-columns: minmax(0, 1fr);
    width: min(300px, calc(100vw - 32px));
    }

    .ttcqn-sga-nav {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .ttcqn-sga {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ttcqn-sga-panel,
    .ttcqn-sga-copy,
    .ttcqn-sga-call,
    .ttcqn-sga-icon-btn {
      transition: none !important;
    }
  }
</style>

<script id="ttcqn-scroll-guide-js">
(function () {
  "use strict";

  var legacyGuideSelectors = [
    "#sa-wrap",
    "#sa-chip",
    "#sa-modal",
    ".ttcqn-old-scroll-assistant",
    ".ttcqn-scroll-helper-old",
    ".ttcqn-floating-guide",
    ".ttcqn-guide-assistant:not(.ttcqn-sga)",
    ".scroll-guide-assistant:not(.ttcqn-sga)",
    "[data-old-scroll-guide]",
    "[data-legacy-guide-assistant]"
  ];

  function removeLegacyGuideNodes() {
    legacyGuideSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        node.remove();
      });
    });
  }

  /* CSS đã ẩn bản cũ ngay; xóa DOM sau DOMContentLoaded để tránh làm script cũ lỗi null. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.setTimeout(removeLegacyGuideNodes, 0);
    }, { once: true });
  } else {
    window.setTimeout(removeLegacyGuideNodes, 0);
  }

  var root = document.querySelector("[data-ttcqn-scroll-guide]");
  if (!root) return;
  if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
    root.remove();
    return;
  }

  var storageKey = "ttcqnScrollGuideState";
  var titleEl = root.querySelector("[data-sga-title]");
  var ctaEl = root.querySelector("[data-sga-cta]");
  var copyEl = root.querySelector("[data-sga-copy]");
  var openBtn = root.querySelector("[data-sga-open]");
  var collapseBtn = root.querySelector("[data-sga-collapse]");
  var closeBtn = root.querySelector("[data-sga-close]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var sections = [
    {
      key: "services",
      label: "Dịch vụ",
      selector: ".ttcqn-services-section, #dich-vu, [data-guide-section='services']",
      title: "Dịch vụ của chúng tôi",
      cta: "Gọi kỹ thuật ngay",
      href: "tel:0963953533"
    },
    {
      key: "about",
      label: "Giới thiệu",
      selector: "#about-title, [aria-labelledby='about-title'], #gioi-thieu, [data-guide-section='about']",
      title: "Vì sao nên chọn",
      cta: "Gọi tư vấn miễn phí",
      href: "tel:0963953533"
    },
    {
      key: "projects",
      label: "Dự án",
      selector: "#du-an, #du-an-da-hoan-thanh, [aria-labelledby='project-title'], [data-guide-section='projects']",
      title: "Dự án thực tế",
      cta: "Xem thêm dự án",
      href: "#du-an"
    },
    {
      key: "commitments",
      label: "Cam kết",
      selector: ".ttcqn-benefit-strip, #cam-ket, #uu-diem, [aria-labelledby='review-title'], [data-guide-section='commitments']",
      title: "Cam kết dịch vụ",
      cta: "Gọi để được báo giá",
      href: "tel:0963953533"
    },
    {
      key: "contact",
      label: "Liên hệ",
      selector: "#lien-he, .home-footer, footer, [data-guide-section='contact']",
      title: "Cần xử lý ngay?",
      cta: "Gọi 0963.953.533",
      href: "tel:0963953533"
    }
  ];

  function findTarget(item) {
    var nodes = document.querySelectorAll(item.selector);
    if (!nodes.length) return null;
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      if (node.tagName && /^H[1-6]$/.test(node.tagName)) {
        return node.closest("section, main, article, footer") || node;
      }
      return node;
    }
    return null;
  }

  var targets = sections.map(function (item) {
    item.target = findTarget(item);
    return item;
  }).filter(function (item) {
    return !!item.target;
  });

  if (!targets.length) {
    root.remove();
    return;
  }

  function setState(state) {
    root.setAttribute("data-state", state);
    try {
      window.localStorage.setItem(storageKey, state);
    } catch (error) {}
  }

  function readState() {
    try {
      return "collapsed";
    } catch (error) {
      return "collapsed";
    }
  }

  function render(item, instant) {
    if (!item || root.getAttribute("data-active-key") === item.key) return;
    root.setAttribute("data-active-key", item.key);

    var update = function () {
      titleEl.textContent = item.title;
      ctaEl.textContent = item.cta;
      ctaEl.setAttribute("href", item.href);
      ctaEl.toggleAttribute("data-scroll-cta", item.href.charAt(0) === "#");
      if (copyEl) copyEl.classList.remove("is-changing");
    };

    if (instant || reduceMotion || !copyEl) {
      update();
      return;
    }

    copyEl.classList.add("is-changing");
    window.setTimeout(update, 140);
  }

  function scrollToTarget(item) {
    if (!item || !item.target) return;
    var top = item.target.getBoundingClientRect().top + window.pageYOffset - 78;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }

  var currentKey = "";
  function chooseByScroll() {
    var viewportLine = window.innerHeight * 0.38;
    var best = targets[0];
    var bestDistance = Infinity;

    targets.forEach(function (item) {
      var rect = item.target.getBoundingClientRect();
      var distance = Math.abs(rect.top - viewportLine);
      if (rect.top <= window.innerHeight * 0.72 && rect.bottom >= window.innerHeight * 0.18 && distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    });

    if (best && best.key !== currentKey) {
      currentKey = best.key;
      render(best);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      chooseByScroll();
      ticking = false;
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; }).sort(function (a, b) {
        return b.intersectionRatio - a.intersectionRatio;
      });
      if (!visible.length) return;
      var item = targets.find(function (candidate) { return candidate.target === visible[0].target; });
      if (item && item.key !== currentKey) {
        currentKey = item.key;
        render(item);
      }
    }, {
      root: null,
      rootMargin: "-22% 0px -52% 0px",
      threshold: [0, .18, .35, .55, .75]
    });
    targets.forEach(function (item) { observer.observe(item.target); });
  }

  root.querySelectorAll("[data-sga-nav]").forEach(function (button) {
    button.addEventListener("click", function () {
      var key = button.getAttribute("data-sga-nav");
      var item = targets.find(function (candidate) { return candidate.key === key; });
      setState("open");
      scrollToTarget(item);
      render(item);
    });
  });

  ctaEl.addEventListener("click", function (event) {
    var href = ctaEl.getAttribute("href") || "";
    if (href.charAt(0) !== "#") return;
    var item = targets.find(function (candidate) { return href === "#" + (candidate.target.id || ""); });
    var target = document.querySelector(href);
    if (target) {
      event.preventDefault();
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - 78),
        behavior: reduceMotion ? "auto" : "smooth"
      });
    } else if (item) {
      event.preventDefault();
      scrollToTarget(item);
    }
  });

  if (openBtn) openBtn.addEventListener("click", function () { setState("open"); });
  if (collapseBtn) collapseBtn.addEventListener("click", function () { setState("collapsed"); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setState("closed"); });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && root.getAttribute("data-state") === "open") {
      setState("collapsed");
      if (openBtn) openBtn.focus();
    }
  });

  setState(readState());
  render(targets[0], true);
  chooseByScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();
</script>
<!-- /TTCQN Scroll Guide Assistant -->
    <?php
}, 80);
