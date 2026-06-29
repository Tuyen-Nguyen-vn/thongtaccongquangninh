/**
 * rankmath_altname_fix.mjs
 * --------------------------------------------------------------------------
 * MUC DICH: dien website_alternate_name (dang TRONG) = ten that cong ty.
 * Chi sua DUNG 1 truong nay, giu nguyen moi truong khac (ten chinh, hotline,
 * dia chi, gio mo cua...). Khong dung neu da co gia tri.
 *
 * CACH CHAY (tai D:\.thongtaccongquangninh):
 *   Kiem tra (chi doc): node tools\rankmath_altname_fix.mjs
 *   Ap dung:            node tools\rankmath_altname_fix.mjs --apply
 *
 * YEU CAU: Node 18+ (fetch/FormData/Blob). Doc .env: WP_BASE_URL,
 * WP_USERNAME, WP_APP_PASSWORD. Tu backup settings vao tools\backups\.
 * --------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const DESIRED_ALT_NAME = "Môi Trường Đô Thị Quảng Ninh";

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

function deepNormalize(raw) {
  let obj = raw;
  if (typeof obj === "string") { try { obj = JSON.parse(obj); } catch (e) {} }
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      if (typeof obj[k] === "string") {
        const s = obj[k].trim();
        if (s.startsWith("{") || s.startsWith("[")) {
          try { obj[k] = JSON.parse(s); } catch (e) {}
        }
      }
    }
  }
  return obj;
}

async function exportSettings() {
  const bodies = [{ panels: ["general", "titles", "sitemap"] }, {}];
  let lastErr = "";
  for (const body of bodies) {
    const res = await fetch(BASE + "/wp-json/rankmath/v1/status/exportSettings?_locale=user", {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (res.status === 200) {
      let data;
      try { data = JSON.parse(text); } catch (e) { data = text; }
      return deepNormalize(data);
    }
    lastErr = "HTTP " + res.status + ": " + text.slice(0, 300);
  }
  throw new Error("exportSettings that bai - " + lastErr);
}

async function importSettings(settingsObj) {
  const content = JSON.stringify(settingsObj);
  const fieldNames = ["import-me", "file", "settings"];
  let lastErr = "";
  for (const field of fieldNames) {
    const fd = new FormData();
    fd.append(field, new Blob([content], { type: "application/json" }), "rank-math-settings.json");
    const res = await fetch(BASE + "/wp-json/rankmath/v1/status/importSettings?_locale=user", {
      method: "POST",
      headers: { Authorization: AUTH },
      body: fd,
    });
    const text = await res.text();
    if (res.status === 200) return { field, status: res.status, text: text.slice(0, 300) };
    lastErr = "field=" + field + " HTTP " + res.status + ": " + text.slice(0, 200);
  }
  throw new Error("importSettings that bai voi moi field name - " + lastErr);
}

async function main() {
  console.log("=== Rank Math - dien website_alternate_name ===");
  console.log("Site:", BASE, "| Mode:", APPLY ? "APPLY (sua)" : "CHECK (chi doc)");

  const all = await exportSettings();
  if (!all.titles || typeof all.titles !== "object") {
    try { all.titles = JSON.parse(all.titles); } catch (e) { all.titles = {}; }
  }
  const cur = all.titles.website_alternate_name;
  console.log("\n[HIEN TAI] website_alternate_name = " + JSON.stringify(cur));
  console.log("[HIEN TAI] website_name           = " + JSON.stringify(all.titles.website_name));

  const bdir = path.join(__dirname, "backups");
  fs.mkdirSync(bdir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const bpath = path.join(bdir, "rankmath-export-" + stamp + ".json");
  fs.writeFileSync(bpath, JSON.stringify(all, null, 2), "utf8");
  console.log("\n[BACKUP] " + bpath);

  if (cur && String(cur).trim() !== "") {
    console.log("\n[SKIP] website_alternate_name da co gia tri, khong ghi de. Xong.");
    return;
  }

  if (!APPLY) {
    console.log("\n[OK] CHE DO KIEM TRA xong. Chua sua gi.");
    console.log("Chay de dien: node tools\\rankmath_altname_fix.mjs --apply");
    return;
  }

  all.titles.website_alternate_name = DESIRED_ALT_NAME;
  console.log("\n[FIX] dat website_alternate_name = " + JSON.stringify(DESIRED_ALT_NAME));

  const imp = await importSettings(all);
  console.log("[IMPORT] OK qua field: " + imp.field + " | HTTP " + imp.status);

  const after = await exportSettings();
  const got = after.titles && after.titles.website_alternate_name;
  console.log("\n[SAU KHI SUA] website_alternate_name = " + JSON.stringify(got));
  console.log(got === DESIRED_ALT_NAME ? "[SUCCESS] Da dien ten thay the." : "[WARN] Chua khop - kiem tra lai.");
  console.log("Mo: " + BASE + "/wp-admin/admin.php?page=rank-math-options-titles de xac nhan.");
}

main().catch((e) => { console.error("\n[X] LOI:", e.message); process.exit(1); });
