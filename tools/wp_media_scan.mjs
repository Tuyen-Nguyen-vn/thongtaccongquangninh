/**
 * wp_media_scan.mjs
 * --------------------------------------------------------------------------
 * MUC DICH: quet Thu vien Media WordPress (CHI DOC) de tim anh logo + anh share
 * (Open Graph) ung vien, in ra id / url / kich thuoc / ten file. Khong sua gi.
 *
 * Dung de chon dung anh truoc khi set company_logo + open_graph_image cho
 * Rank Math (tranh doan bua).
 *
 * CACH CHAY (tai D:\.thongtaccongquangninh):
 *   node tools\wp_media_scan.mjs            (tat ca anh, toi da 100 moi nhat)
 *   node tools\wp_media_scan.mjs logo       (loc theo tu khoa, vd "logo")
 *
 * YEU CAU: Node 18+. Doc .env: WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD.
 * --------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SEARCH = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";

function loadEnv() {
  const p = path.join(PROJECT_ROOT, ".env");
  if (!fs.existsSync(p)) { console.error("[X] Khong thay .env tai " + p); process.exit(1); }
  const env = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  for (const k of ["WP_USERNAME", "WP_APP_PASSWORD"]) {
    if (!env[k]) { console.error("[X] Thieu " + k + " trong .env"); process.exit(1); }
  }
  env.WP_BASE_URL = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  return env;
}

const env = loadEnv();
const AUTH = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
const BASE = env.WP_BASE_URL;

async function fetchMedia(search) {
  const params = new URLSearchParams({
    media_type: "image",
    per_page: "100",
    orderby: "date",
    order: "desc",
    _fields: "id,source_url,media_details,slug,title,mime_type",
  });
  if (search) params.set("search", search);
  const res = await fetch(BASE + "/wp-json/wp/v2/media?" + params.toString(), {
    headers: { Authorization: AUTH },
  });
  const text = await res.text();
  if (res.status !== 200) throw new Error("HTTP " + res.status + ": " + text.slice(0, 300));
  return JSON.parse(text);
}

function row(m) {
  const d = m.media_details || {};
  const w = d.width || "?";
  const h = d.height || "?";
  const file = (d.file || "").split("/").pop();
  return {
    id: m.id,
    size: w + "x" + h,
    file: file || m.slug,
    url: m.source_url,
  };
}

async function main() {
  console.log("=== Quet Media WordPress (chi doc) ===");
  console.log("Site:", BASE, "| Loc:", SEARCH || "(tat ca anh)");

  // 1) Anh logo ung vien
  const logoHits = await fetchMedia(SEARCH || "logo");
  console.log("\n--- ANH LOGO ung vien (search='" + (SEARCH || "logo") + "'): " + logoHits.length + " ket qua ---");
  for (const m of logoHits.map(row)) {
    console.log(`  [id ${m.id}] ${m.size}  ${m.file}\n        ${m.url}`);
  }

  // 2) Anh share/OG (rong, ti le ~16:9, >=1200px) trong toan bo media moi nhat
  const all = await fetchMedia("");
  const wide = all.map(row).filter((m) => {
    const [w, h] = m.size.split("x").map(Number);
    return w >= 1200 && h >= 600 && w >= h; // rong, du lon cho OG
  });
  console.log("\n--- ANH SHARE/OG ung vien (rong >=1200px, ngang): " + wide.length + " ket qua ---");
  for (const m of wide.slice(0, 20)) {
    console.log(`  [id ${m.id}] ${m.size}  ${m.file}\n        ${m.url}`);
  }

  console.log("\n[OK] Quet xong. KHONG sua gi. Chon id/url roi set bang tools/rankmath_set_titles_fields.mjs.");
}

main().catch((e) => { console.error("\n[X] LOI:", e.message); process.exit(1); });
