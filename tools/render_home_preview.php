<?php
declare(strict_types=1);

$project_root = dirname(__DIR__);
$output_file = $project_root . '/_tmp_home_reference_preview.html';

if (!defined('TTCQN_HOME_EMERGENCY_VERSION')) {
    define('TTCQN_HOME_EMERGENCY_VERSION', 'local-preview');
}

function wp_upload_dir(): array
{
    return ['baseurl' => 'https://thongtaccongquangninh.com/wp-content/uploads'];
}

function get_post_field(string $field, int $post_id): string
{
    return '';
}

function get_the_ID(): int
{
    return 23;
}

function home_url(string $path = '/'): string
{
    return $path === '/' ? './' : $path;
}

function esc_url(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function esc_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function esc_attr(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function wp_json_encode(mixed $value, int $flags = 0): string
{
    return json_encode($value, $flags) ?: '';
}

function language_attributes(): void
{
    echo 'lang="vi"';
}

function bloginfo(string $field): void
{
    echo $field === 'charset' ? 'UTF-8' : '';
}

function wp_head(): void
{
    echo '<link rel="stylesheet" id="ttcqn-shared-footer-css" href="tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-shared-footer.css?ver=local-preview">' . PHP_EOL;
}

function wp_body_open(): void
{
}

function body_class(string $class = ''): void
{
    $classes = trim($class . ' ttcqn-shared-footer-active');
    echo 'class="' . htmlspecialchars($classes, ENT_QUOTES, 'UTF-8') . '"';
}

function wp_footer(): void
{
}

function ttcqn_schema_home_graph(): array
{
    return [];
}

function ttcqn_seo_hero_render(array $args = []): string
{
    return '';
}

function ttcqn_seo_hero_asset(string $path): string
{
    return '/wp-content/plugins/ttcqn-home-emergency-renderer/' . ltrim($path, '/');
}

function trailingslashit(string $value): string
{
    return rtrim($value, '/\\') . '/';
}

class WP_Query
{
    public function __construct(array $args = [])
    {
    }

    public function have_posts(): bool
    {
        return false;
    }
}

function plugins_url(string $path, string $plugin): string
{
    $project_root = dirname(__DIR__);
    $plugin_dir = dirname($plugin);
    $relative_plugin_dir = ltrim(str_replace($project_root, '', $plugin_dir), '/\\');

    return str_replace('\\', '/', $relative_plugin_dir . '/' . ltrim($path, '/'));
}

ob_start();
include $project_root . '/tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php';
$html = ob_get_clean();

file_put_contents($output_file, $html);
echo $output_file . PHP_EOL;
