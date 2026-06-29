/**
 * rankmath_localseo_fix.mjs
 * --------------------------------------------------------------------------
 * MUC DICH HIEN TAI: them hotline thu 2 vao Local SEO cua Rank Math.
 *
 * Trang thai da kiem (2026-06-19): loi data titles da duoc sua (titles la
 * object 171 truong). Organization=company, LocalBusiness, gio 24/7 (7 ngay
 * 00:00-23:59), dia chi that "111 Cai Lan, Bai Chay, Quang Ninh, VN" - DA DUNG.
 * Tuyen quyet: GIU NGUYEN ten thuong hieu, CHI them hotline thu 2.
 *
 * CACH CHAY (PowerShell/CMD tai D:\.thongtaccongquangninh):
 *   Kiem tra (chi doc): node tools\rankmath_localseo_fix.mjs
 *   Ap dung (them so):   node tools\rankmath_localseo_fix.mjs --apply
 *
 * YEU CAU: Node 18+ (co fetch/FormData/Blob). Doc .env: WP_BASE_URL,
 * WP_USERNAME, WP_APP_PASSWORD. Tu backup settings vao tools\backups\.
 * --------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");

// Thao tac duy nhat: dam bao co du 2 hotline. Khong dung truong nao khac.
const DESIRED_PHONES = [
  { type: "customer support", number: "+84963953533" }, // 0963.953.533
  { type: "customer support", number: "+84931156756" }, // 0931.156.756
];

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

function reportTitles(all, tag) {
  const titles = all && all.titles;
  const type = Array.isArray(titles) ? "array" : typeof titles;
  console.log("\n[" + tag + "] kieu cua titles = " + type +
    (titles && typeof titles === "object" ? " (" + Object.keys(titles).length + " truong)" : ""));
  if (titles && typeof titles === "object") {
    const show = ["knowledgegraph_type", "knowledgegraph_name", "website_name", "website_alternate_name", "local_business_type", "opening_hours_format"];
    for (const k of show) console.log("   " + k + " = " + JSON.stringify(titles[k]));
    console.log("   phone_numbers = " + JSON.stringify(titles.phone_numbers));
    console.log("   local_address = " + JSON.stringify(titles.local_address));
  }
  return type;
}

async function main() {
  console.log("=== Rank Math Local SEO - them hotline ===");
  console.log("Site:", BASE, "| Mode:", APPLY ? "APPLY (sua)" : "CHECK (chi doc)");

  const all = await exportSettings();
  reportTitles(all, "HIEN TAI");

  const bdir = path.join(__dirname, "backups");
  fs.mkdirSync(bdir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const bpath = path.join(bdir, "rankmath-export-" + stamp + ".json");
  fs.writeFileSync(bpath, JSON.stringify(all, null, 2), "utf8");
  console.log("\n[BACKUP] " + bpath);

  if (!APPLY) {
    console.log("\n[OK] CHE DO KIEM TRA xong. Chua sua gi.");
    console.log("Chay de them hotline: node tools\\rankmath_localseo_fix.mjs --apply");
    return;
  }

  if (!all.titles || typeof all.titles !== "object") {
    try { all.titles = JSON.parse(all.titles); } catch (e) { all.titles = {}; }
  }
  const cur = Array.isArray(all.titles.phone_numbers) ? all.titles.phone_numbers : [];
  const have = new Set(cur.map((p) => String(p.number || "").replace(/\D/g, "")));
  let added = 0;
  for (const p of DESIRED_PHONES) {
    if (!have.has(p.number.replace(/\D/g, ""))) { cur.push(p); added++; }
  }
  all.titles.phone_numbers = cur;
  console.log("\n[FIX] phone_numbers: them " + added + " so (tong " + cur.length + "). Khong thay doi truong khac.");

  if (added === 0) {
    console.log("[OK] Ca 2 hotline da co san, khong can import. Xong.");
    return;
  }

  const imp = await importSettings(all);
  console.log("[IMPORT] OK qua field: " + imp.field + " | HTTP " + imp.status);

  const after = await exportSettings();
  reportTitles(after, "SAU KHI SUA");
  const nums = (after.titles.phone_numbers || []).map((p) => String(p.number).replace(/\D/g, ""));
  const ok = nums.includes("84963953533") && nums.includes("84931156756");
  console.log("\n" + (ok ? "[SUCCESS] Da co du 2 hotline trong Local SEO." : "[WARN] Chua thay du 2 hotline sau khi sua - kiem tra lai."));
  console.log("Mo: " + BASE + "/wp-admin/admin.php?page=rank-math-options-titles de xac nhan.");
}

main().catch((e) => { console.error("\n[X] LOI:", e.message); process.exit(1); });
