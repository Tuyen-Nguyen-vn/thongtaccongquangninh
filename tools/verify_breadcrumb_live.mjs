/**
 * Verify BreadcrumbList JSON-LD appears on key pages after plugin restore
 */
import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

const PAGES = [
  { url: "/thong-tac-cong-ha-long/",       label: "TTC Hạ Long (page 296)" },
  { url: "/thong-tac-cong-cao-xanh/",      label: "TTC Cao Xanh (page 991, ward)" },
  { url: "/thong-tac-cong-bai-chay/",      label: "TTC Bãi Cháy (post 2054)" },
  { url: "/thong-tac-cong-quang-ninh/",    label: "TTC Quảng Ninh (main)" },
  { url: "/bang-gia/",                     label: "Bảng giá (page 61)" },
  { url: "/lien-he/",                      label: "Liên hệ (page 63)" },
];

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "schema-verify/1.0", "Cache-Control": "no-cache" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout " + path)));
    req.end();
  });
}

function extractSchemas(html) {
  const scripts = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[0].split(">")[0];
    try {
      const parsed = JSON.parse(m[1].trim());
      scripts.push({ attrs, parsed });
    } catch {
      scripts.push({ attrs, raw: m[1].trim().slice(0, 100) });
    }
  }
  return scripts;
}

function findBreadcrumbs(schemas) {
  const results = [];
  for (const { attrs, parsed } of schemas) {
    if (!parsed) continue;
    // Direct BreadcrumbList
    if (parsed["@type"] === "BreadcrumbList") {
      const isOurs = attrs.includes("ttcqn-doorway") || attrs.includes("ttcqn-post");
      results.push({ source: isOurs ? "OUR_PLUGIN" : "RANK_MATH", items: parsed.itemListElement?.length ?? 0 });
    }
    // BreadcrumbList inside @graph
    if (parsed["@graph"]) {
      for (const node of parsed["@graph"]) {
        if (node["@type"] === "BreadcrumbList") {
          results.push({ source: "RANK_MATH_GRAPH", items: node.itemListElement?.length ?? 0 });
        }
      }
    }
  }
  return results;
}

async function main() {
  console.log("=== BreadcrumbList Live Verify ===\n");

  for (const page of PAGES) {
    process.stdout.write(`${page.label}... `);
    try {
      const { status, html } = await fetchPage(page.url);
      if (status !== 200) { console.log(`HTTP ${status}`); continue; }

      const schemas = extractSchemas(html);
      const breadcrumbs = findBreadcrumbs(schemas);

      const ourBC = breadcrumbs.find(b => b.source === "OUR_PLUGIN");
      const rmBC = breadcrumbs.find(b => b.source === "RANK_MATH" || b.source === "RANK_MATH_GRAPH");

      const totalScripts = html.match(/<script[^>]*application\/ld\+json/gi)?.length ?? 0;

      if (ourBC) {
        console.log(`✓ OUR BreadcrumbList (${ourBC.items} items) | RM=${rmBC?.items ?? 0} items | scripts=${totalScripts}`);
      } else {
        console.log(`✗ NO OUR BreadcrumbList | RM=${rmBC?.items ?? 0} | scripts=${totalScripts}`);
        // Show all schema types for debug
        const types = schemas.map(s => s.parsed?.["@type"] ?? s.parsed?.["@graph"]?.map(n=>n["@type"]).join(",") ?? "?");
        console.log(`   Schema types: ${types.join(" | ")}`);
      }
    } catch (e) {
      console.log(`ERR: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
