/**
 * debug_rm_news_sitemap.mjs
 * Đọc Rank Math news sitemap config + enable post type 'post' nếu chưa có
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

// PHP code — dùng raw string, không cần escape $
const PHP_READ_CONFIG = `
add_action('rest_api_init', function() {
  register_rest_route('ttcqn/v1', '/rm-news-info', [
    'methods'  => 'GET',
    'callback' => function() {
      $opts  = get_option('rank-math-options-sitemap', []);
      $act   = get_option('rank-math-active-modules', []);
      $posts = get_posts(['post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 5, 'orderby' => 'date', 'order' => 'DESC']);
      return new WP_REST_Response([
        'sitemap_opts'   => $opts,
        'active_modules' => $act,
        'recent_posts'   => array_map(function($p) {
          return [
            'id'         => $p->ID,
            'slug'       => $p->post_name,
            'date_gmt'   => get_post_time('c', true, $p),
            'rm_exclude' => get_post_meta($p->ID, 'rank_math_sitemap_exclude', true),
            'rm_news'    => get_post_meta($p->ID, 'rank_math_news_sitemap_include', true),
          ];
        }, $posts),
        'now_gmt' => gmdate('c'),
        'site_url' => get_site_url(),
      ], 200);
    },
    'permission_callback' => '__return_true',
  ]);
});
`;

const PHP_FIX_CONFIG = `
add_action('rest_api_init', function() {
  register_rest_route('ttcqn/v1', '/rm-news-fix', [
    'methods'  => 'POST',
    'callback' => function() {
      $opts = get_option('rank-math-options-sitemap', []);
      $before = $opts['news_sitemap_post_types'] ?? 'not_set';

      // Enable 'post' type for news sitemap
      $types = (array)($opts['news_sitemap_post_types'] ?? []);
      if (!in_array('post', $types)) {
        $types[] = 'post';
        $opts['news_sitemap_post_types'] = $types;
        update_option('rank-math-options-sitemap', $opts);
      }

      // Also set news sitemap publication name if not set
      if (empty($opts['news_sitemap_publication_name'])) {
        $opts['news_sitemap_publication_name'] = get_bloginfo('name');
        update_option('rank-math-options-sitemap', $opts);
      }

      // Clear Rank Math sitemap cache
      delete_option('rank_math_sitemap_cache_hash');
      wp_cache_flush();

      $after = get_option('rank-math-options-sitemap', []);
      return new WP_REST_Response([
        'before' => $before,
        'after'  => $after['news_sitemap_post_types'] ?? 'not_set',
        'pub_name' => $after['news_sitemap_publication_name'] ?? 'not_set',
        'updated' => true,
      ], 200);
    },
    'permission_callback' => '__return_true',
  ]);
});
`;

const env     = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL;
const auth    = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function createAndActivate(name, code) {
  const cr = await wpFetch(baseUrl, auth, "/code-snippets/v1/snippets", {
    method: "POST",
    body: JSON.stringify({ name, code, scope: "global", active: false, priority: 1 }),
  });
  console.log(`Created snippet #${cr.id}: ${name}`);

  // Try PATCH to activate
  const r = await fetch(`${baseUrl}/wp-json/code-snippets/v1/snippets/${cr.id}`, {
    method: "PATCH",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ active: true }),
  });
  const body = await r.json();
  console.log(`  PATCH activate: HTTP ${r.status}, active=${body.active}, name=${body.name}`);
  return cr.id;
}

async function cleanup(id) {
  await fetch(`${baseUrl}/wp-json/code-snippets/v1/snippets/${id}`, {
    method: "PATCH",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ active: false }),
  });
  await fetch(`${baseUrl}/wp-json/code-snippets/v1/snippets/${id}`, {
    method: "DELETE",
    headers: { Authorization: auth },
  });
}

async function main() {
  // 1. Create + activate info snippet
  const id1 = await createAndActivate("TMP-RM-news-info", PHP_READ_CONFIG);
  const id2 = await createAndActivate("TMP-RM-news-fix", PHP_FIX_CONFIG);

  // 2. Warm up with a regular page request
  console.log("\nWaiting for snippet to activate...");
  await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(10000) }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // 3. Read config
  console.log("\nReading Rank Math news sitemap config...");
  const info = await fetch(`${baseUrl}/wp-json/ttcqn/v1/rm-news-info`, {
    headers: { Authorization: auth, "Cache-Control": "no-cache" },
  }).then(r => {
    console.log("  HTTP:", r.status);
    return r.json();
  });
  console.log(JSON.stringify(info, null, 2));

  // 4. Fix if needed
  if (info.code !== "rest_no_route") {
    console.log("\nApplying fix (enable post type for news sitemap)...");
    const fix = await fetch(`${baseUrl}/wp-json/ttcqn/v1/rm-news-fix`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
    }).then(r => r.json());
    console.log("Fix result:", JSON.stringify(fix, null, 2));
  }

  // 5. Cleanup
  await cleanup(id1);
  await cleanup(id2);
  console.log("\nCleaned up snippets");

  // 6. Check sitemap
  console.log("\nChecking news-sitemap.xml...");
  const sitemap = await fetch(`${baseUrl}/news-sitemap.xml?nocache=1`, {
    headers: { "Cache-Control": "no-cache" },
  }).then(r => r.text());
  console.log(sitemap.slice(0, 1000));
}

main().catch(err => { console.error(err.stack ?? err.message); process.exit(1); });
