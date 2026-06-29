/**
 * fix_rm_news_post_type.mjs
 * Bật post type 'post' cho Rank Math news sitemap (key: news_sitemap_post_type singular)
 */
import { readFileSync } from "node:fs";

const PROJECT  = "D:\\.thongtaccongquangninh";
const ENV_PATH = `${PROJECT}\\.env`;

function parseEnv(fp) {
  const env = {};
  for (const line of readFileSync(fp, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

async function wpFetch(baseUrl, auth, route, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let body; try { body = text ? JSON.parse(text) : {}; } catch { body = text; }
  if (!res.ok) throw new Error(`WP ${res.status} ${route}: ${typeof body === "object" ? body.message : body}`);
  return body;
}

// PHP snippet: fix news_sitemap_post_type (singular key!) và publication_name
const PHP_FIX = `
add_action('rest_api_init', function() {
  register_rest_route('ttcqn/v1', '/rm-news-fix2', [
    'methods'  => 'POST',
    'callback' => function() {
      $opts = get_option('rank-math-options-sitemap', []);

      // Key đúng: news_sitemap_post_type (singular, không phải plural)
      $before = $opts['news_sitemap_post_type'] ?? 'not_set';

      $types = (array)($opts['news_sitemap_post_type'] ?? []);
      if (!in_array('post', $types)) {
        $types[] = 'post';
      }
      $opts['news_sitemap_post_type'] = $types;

      // Publication name
      if (empty($opts['news_sitemap_publication_name'])) {
        $opts['news_sitemap_publication_name'] = get_bloginfo('name');
      }

      update_option('rank-math-options-sitemap', $opts);

      // Clear Rank Math sitemap cache (các transients)
      global $wpdb;
      $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_rank_math_sitemap%'");
      $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_rank_math_sitemap%'");
      wp_cache_flush();

      $after = get_option('rank-math-options-sitemap', []);
      return new WP_REST_Response([
        'before' => $before,
        'after_post_type'  => $after['news_sitemap_post_type'] ?? 'not_set',
        'pub_name' => $after['news_sitemap_publication_name'] ?? '',
      ], 200);
    },
    'permission_callback' => '__return_true',
  ]);
});
`;

const env     = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL;
const auth    = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function main() {
  // Create & activate snippet
  const cr = await wpFetch(baseUrl, auth, "/code-snippets/v1/snippets", {
    method: "POST",
    body: JSON.stringify({ name: "TMP-RM-news-fix2", code: PHP_FIX, scope: "global", active: false, priority: 1 }),
  });
  console.log("Created snippet #" + cr.id);

  await fetch(`${baseUrl}/wp-json/code-snippets/v1/snippets/${cr.id}`, {
    method: "PATCH",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ active: true }),
  });

  // Warm up
  await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(10000) }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // Apply fix
  console.log("Applying fix...");
  const fix = await fetch(`${baseUrl}/wp-json/ttcqn/v1/rm-news-fix2`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
  }).then(r => r.json());
  console.log("Fix result:", JSON.stringify(fix, null, 2));

  // Cleanup
  await fetch(`${baseUrl}/wp-json/code-snippets/v1/snippets/${cr.id}`, {
    method: "PATCH",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ active: false }),
  });
  await fetch(`${baseUrl}/wp-json/code-snippets/v1/snippets/${cr.id}`, {
    method: "DELETE", headers: { Authorization: auth },
  });
  console.log("Cleaned up");

  // Check sitemap
  console.log("\nChecking news-sitemap.xml...");
  const sitemap = await fetch(`${baseUrl}/news-sitemap.xml`, {
    headers: { "Cache-Control": "no-cache, no-store" },
  }).then(r => r.text());
  console.log(sitemap.slice(0, 1500));
}

main().catch(err => { console.error(err.stack ?? err.message); process.exit(1); });
