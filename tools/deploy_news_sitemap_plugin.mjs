import { readFileSync, writeFileSync } from "node:fs";

const PROJECT_ROOT = "D:\\.thongtaccongquangninh";
const ENV_PATH = `${PROJECT_ROOT}\\.env`;

function readEnvFile(fp) {
  const env = {};
  for (const line of readFileSync(fp, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const e = readEnvFile(ENV_PATH);
const auth = `Basic ${Buffer.from(`${e.WP_USERNAME}:${e.WP_APP_PASSWORD}`).toString("base64")}`;

const phpCode = `
if ( ! defined( 'ABSPATH' ) ) exit;

add_filter( 'robots_txt', 'ttcqn_add_news_sitemap_to_robots', 20, 2 );
function ttcqn_add_news_sitemap_to_robots( $output, $public ) {
    if ( '1' !== $public ) return $output;
    $news_url = home_url( '/news-sitemap.xml' );
    if ( strpos( $output, $news_url ) === false ) {
        $output .= "\\nSitemap: {$news_url}\\n";
    }
    return $output;
}
`.trim();

async function wpFetch(path, opts = {}) {
  const url = `${e.WP_BASE_URL}/wp-json/${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json", ...(opts.headers || {}) },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

(async () => {
  // 1. Tạo snippet mới
  console.log("Tạo snippet...");
  const save = await wpFetch("code-snippets/v1/snippets", {
    method: "POST",
    body: JSON.stringify({
      name: "TTCQN - News Sitemap robots.txt",
      desc: "Thêm news-sitemap.xml vào robots.txt để Google News có thể crawl.",
      code: phpCode,
      tags: ["sitemap", "news", "robots", "ttcqn"],
      scope: "php",
      active: false,
      priority: 1,
    }),
  });
  console.log("Save status:", save.status);

  if (save.status !== 200 || !save.body?.id) {
    console.error("Lỗi tạo snippet:", JSON.stringify(save.body, null, 2));
    process.exit(1);
  }

  const snippetId = save.body.id;
  console.log("Snippet ID:", snippetId);

  // 2. Activate snippet
  const activate = await wpFetch(`code-snippets/v1/snippets/${snippetId}`, {
    method: "PATCH",
    body: JSON.stringify({ active: true }),
  });
  console.log("Activate status:", activate.status, activate.body?.active ? "active" : "failed");

  // 3. Verify robots.txt
  const robots = await fetch(`${e.WP_BASE_URL}/robots.txt`).then(r => r.text()).catch(() => "");
  const ok = robots.includes("news-sitemap.xml");
  console.log(ok ? "✓ news-sitemap.xml đã có trong robots.txt" : "✗ Chưa thấy - kiểm tra lại plugin Code Snippets");

  // Save log
  const log = { timestamp: new Date().toISOString(), snippetId, activate: activate.body, robots_ok: ok };
  const logFile = `${PROJECT_ROOT}\\WORDPRESS_NEWS_SITEMAP_PLUGIN_UPLOAD_${new Date().toISOString().slice(0,19).replace(/[:]/g,"-")}Z.json`;
  writeFileSync(logFile, JSON.stringify(log, null, 2));
  console.log("Log:", logFile);
})();
