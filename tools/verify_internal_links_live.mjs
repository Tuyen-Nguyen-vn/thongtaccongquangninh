/**
 * Verify internal links are live on HBP + TTC + BC landing pages.
 */
import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE = "https://thongtaccongquangninh.com";

const CHECKS = [
  {
    url: "/hut-be-phot-quang-ninh/",
    label: "HBP Quảng Ninh",
    expectLinks: [
      "/hut-be-phot-mong-cai/",
      "/hut-be-phot-dong-trieu/",
      "/hut-be-phot-van-don/",
      "/chi-phi-hut-be-phot-quang-ninh/",
      "/chu-ky-hut-be-phot/",
      "/dau-hieu-be-phot-bi-day-2026/",
    ],
  },
  {
    url: "/thong-tac-cong-quang-ninh/",
    label: "TTC Quảng Ninh",
    expectLinks: [
      "/thong-tac-cong-bai-chay/",
      "/thong-tac-cong-cao-xanh/",
      "/thong-tac-cong-tuan-chau/",
      "/thong-tac-cong-gieng-day/",
      "/thong-tac-cong-dong-trieu/",
    ],
  },
];

function fetchHtml(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "verify/1.0", "Cache-Control": "no-cache" },
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
  console.log("=== Verify Internal Links Live ===\n");
  for (const check of CHECKS) {
    console.log(`${check.label} (${check.url})`);
    const { status, html } = await fetchHtml(check.url);
    if (status !== 200) { console.log(`  HTTP ${status} ERROR\n`); continue; }
    let pass = 0;
    for (const link of check.expectLinks) {
      const found = html.includes(`href="${BASE}${link}"`) || html.includes(`href="${link}"`);
      console.log(`  ${found ? "✓" : "✗"} ${link}`);
      if (found) pass++;
    }
    console.log(`  Result: ${pass}/${check.expectLinks.length} links present\n`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
