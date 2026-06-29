/**
 * Audit HBP canonical cannibalization
 * /hut-be-phot-quang-ninh/ vs /xe-hut-be-phot-quang-ninh-2026/
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpReq(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "audit/1.0" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: urlPath, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "audit/1.0", "Cache-Control": "no-cache" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const slugs = ["hut-be-phot-quang-ninh", "xe-hut-be-phot-quang-ninh-2026"];

  for (const slug of slugs) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`SLUG: ${slug}`);
    console.log("=".repeat(60));

    let found = false;
    for (const type of ["pages", "posts"]) {
      const r = await wpReq(`/wp/v2/${type}?slug=${slug}&context=edit`, auth);
      if (r.status === 200 && Array.isArray(r.data) && r.data.length > 0) {
        const p = r.data[0];
        const meta = p.meta ?? {};
        const content = p.content?.raw ?? "";

        console.log(`  Type: ${type} | ID: ${p.id} | Status: ${p.status}`);
        console.log(`  Link: ${p.link}`);
        console.log(`  Title raw: ${p.title?.raw ?? p.title?.rendered}`);
        console.log(`  Excerpt: ${(p.excerpt?.raw ?? "").slice(0, 100)}`);
        console.log(`  Content chars: ${content.length}`);
        console.log(`  RM title: ${meta.rank_math_title ?? "(none)"}`);
        console.log(`  RM desc: ${(meta.rank_math_description ?? "(none)").slice(0, 100)}`);
        console.log(`  RM focus_kw: ${meta.rank_math_focus_keyword ?? "(none)"}`);
        console.log(`  RM canonical: ${meta.rank_math_canonical_url ?? "(none)"}`);
        console.log(`  RM robots: ${meta.rank_math_robots ?? "(none)"}`);

        // Check live HTML for canonical
        const html = await fetchHtml(`/${slug}/`);
        const canonMatch = html.html.match(/<link rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        const robotsMatch = html.html.match(/<meta name=["']robots["'][^>]*content=["']([^"']+)["']/i);
        const h1Match = html.html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

        console.log(`  Live canonical: ${canonMatch?.[1] ?? "(none found)"}`);
        console.log(`  Live robots: ${robotsMatch?.[1] ?? "(none found)"}`);
        console.log(`  Live H1: ${h1Match?.[1]?.trim() ?? "(none)"}`);
        console.log(`  Live HTTP: ${html.status}`);

        found = true;
        break;
      }
    }
    if (!found) console.log("  NOT FOUND via REST API");
  }
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
