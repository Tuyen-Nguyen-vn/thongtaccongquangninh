<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<style id="ttcqn-doorway-safe-page-css">
    .ttcqn-doorway-safe-page {
        width: 100%;
        max-width: none;
        margin: 0 auto;
        padding: 0 0 48px;
        line-height: 1.75;
    }
    .ttcqn-doorway-safe-content {
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px 16px 0;
    }
    .ttcqn-doorway-safe-page h1,
    .ttcqn-doorway-safe-page h2,
    .ttcqn-doorway-safe-page h3 {
        line-height: 1.3;
    }
    .ttcqn-doorway-safe-page h1 {
        font-size: clamp(30px, 4vw, 46px);
        margin: 24px 0;
    }
    .ttcqn-doorway-safe-page h2 {
        margin-top: 34px;
    }
    .ttcqn-doorway-safe-page img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
    }
    .ttcqn-doorway-safe-page table {
        width: 100%;
        border-collapse: collapse;
        margin: 18px 0;
        overflow-x: auto;
        display: block;
    }
    .ttcqn-doorway-safe-page th,
    .ttcqn-doorway-safe-page td {
        border: 1px solid var(--ttcqn-color-border, #d9e2ec);
        padding: 10px;
        text-align: left;
        vertical-align: top;
    }
    .ttcqn-doorway-safe-page a {
        font-weight: 700;
    }
    @media (max-width: 640px) {
        .ttcqn-doorway-safe-page {
            padding: 0 0 40px;
        }
        .ttcqn-doorway-safe-content {
            padding: 18px 14px 0;
        }
    }
</style>
<main id="primary" class="site-main ttcqn-doorway-safe-page">
    <?php
    while (have_posts()) {
        the_post();
        global $wpdb;
        $content = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s LIMIT 1",
                'ttcqn_doorway_safe_page_296_content'
            )
        );
        if (!is_string($content) || $content === '') {
            $content = get_the_content(null, false, get_the_ID());
        }
        $content = preg_replace('/<h1\b[^>]*>.*?<\/h1>/is', '', (string) $content, 1);
        echo '<!-- ttcqn-doorway-safe-content-source:' . esc_html($content === get_the_content(null, false, get_the_ID()) ? 'post' : 'option') . ';len:' . esc_html(strlen($content)) . ' -->';
        if (function_exists('ttcqn_seo_hero_render')) {
            echo ttcqn_seo_hero_render([
                'title' => get_the_title(),
                'description' => function_exists('ttcqn_seo_hero_current_description') ? ttcqn_seo_hero_current_description() : '',
            ]);
        }
        echo '<article id="post-' . esc_attr(get_the_ID()) . '" class="ttcqn-doorway-safe-content">';
        if (!function_exists('ttcqn_seo_hero_render')) {
            echo '<h1>' . esc_html(get_the_title()) . '</h1>';
        }
        echo apply_filters('the_content', $content);
        echo '</article>';
    }
    ?>
</main>
<?php
get_footer();
