/**
 * rankmath_fix_facebook.mjs
 * --------------------------------------------------------------------------
 * MUC DICH: sua social_url_facebook trong Rank Math cho KHOP trang Facebook
 * thuc su dang dung tren site + schema live (facebook.com/thongtacconghalong24h).
 * Truoc do bi set nham theo CODEX (moitruongquangninh). Ghi de DUNG truong nay.
 *
 * Neu Tuyen xac nhan moitruongquangninh moi dung: doi DESIRED ben duoi.
 *
 * CHAY (tai D:\.thongtaccongquangninh):
 *   Kiem tra: node tools\rankmath_fix_facebook.mjs
 *   Ap dung:  node tools\rankmath_fix_facebook.mjs --apply
 * --------------------------------------------------------------------------
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const DESIRED = "https://www.facebook.com/moitruongquangninh";

function loadEnv() {
  const p = path.join(PROJECT_ROOT, ".env");
  const env = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
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
        if (s.startsWith("{") || s.startsWith("[")) { try { obj[k] = JSON.parse(s); } catch (e) {} }
      }
    }
  }
  return obj;
}
async function exportSettings() {
  for (const body of [{ panels: ["general", "titles", "sitemap"] }, {}]) {
    const res = await fetch(BASE + "/wp-json/rankmath/v1/status/exportSettings?_locale=user", {
      method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const text = await res.text();
    if (res.status === 200) { let d; try { d = JSON.parse(text); } catch (e) { d = text; } return deepNormalize(d); }
  }
  throw new Error("exportSettings that bai");
}
async function importSettings(obj) {
  const content = JSON.stringify(obj);
  for (const field of ["import-me", "file", "settings"]) {
    const fd = new FormData();
    fd.append(field, new Blob([content], { type: "application/json" }), "rank-math-settings.json");
    const res = await fetch(BASE + "/wp-json/rankmath/v1/status/importSettings?_locale=user", { method: "POST", headers: { Authorization: AUTH }, body: fd });
    if (res.status === 200) return field;
  }
  throw new Error("importSettings that bai");
}
async function main() {
  console.log("=== Sua Facebook URL trong Rank Math ===");
  console.log("Site:", BASE, "| Mode:", APPLY ? "APPLY" : "CHECK");
  const all = await exportSettings();
  if (!all.titles || typeof all.titles !== "object") { try { all.titles = JSON.parse(all.titles); } catch (e) { all.titles = {}; } }
  console.log("Hien tai social_url_facebook =", JSON.stringify(all.titles.social_url_facebook));
  console.log("Muon doi thanh            =", JSON.stringify(DESIRED));

  const bdir = path.join(__dirname, "backups");
  fs.mkdirSync(bdir, { recursive: true });
  const bpath = path.join(bdir, "rankmath-export-" + new Date().toISOString().replace(/[:.]/g, "-") + ".json");
  fs.writeFileSync(bpath, JSON.stringify(all, null, 2), "utf8");
  console.log("[BACKUP]", bpath);

  if (all.titles.social_url_facebook === DESIRED) { console.log("[OK] Da dung roi, khong can sua."); return; }
  if (!APPLY) { console.log("[CHECK] Chay --apply de ghi de."); return; }

  all.titles.social_url_facebook = DESIRED;
  const field = await importSettings(all);
  console.log("[IMPORT] OK qua field:", field);
  const after = await exportSettings();
  const got = after.titles && after.titles.social_url_facebook;
  console.log("[SAU] social_url_facebook =", JSON.stringify(got));
  console.log(got === DESIRED ? "[SUCCESS] Da sua khop trang Facebook live." : "[WARN] Chua khop.");
}
main().catch((e) => { console.error("[X] LOI:", e.message); process.exit(1); });
