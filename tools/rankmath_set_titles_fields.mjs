/**
 * rankmath_set_titles_fields.mjs
 * --------------------------------------------------------------------------
 * MUC DICH: cong cu CHUNG, idempotent, set cac truong trong panel `titles` cua
 * Rank Math, CHI GHI KHI TRUONG DANG TRONG (khong ghi de gia tri co san). Giu
 * nguyen moi truong khac. Dung cho cac bo sung Local SEO/Schema nho le.
 *
 * Da set: social_url_facebook (sameAs), knowledgegraph_logo + _id (logo Org).
 *
 * CACH CHAY (tai D:\.thongtaccongquangninh):
 *   Kiem tra (chi doc): node tools\rankmath_set_titles_fields.mjs
 *   Ap dung:            node tools\rankmath_set_titles_fields.mjs --apply
 *
 * MUON THEM TRUONG KHAC: sua object FIELDS ben duoi (key = ten truong titles).
 * YEU CAU: Node 18+ (fetch/FormData/Blob). Doc .env: WP_BASE_URL, WP_USERNAME,
 * WP_APP_PASSWORD. Tu backup settings vao tools\backups\ truoc khi ghi.
 * --------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");

// Cac truong can dam bao co gia tri. Chi ghi khi truong dang TRONG.
const FIELDS = {
  social_url_facebook: "https://www.facebook.com/moitruongquangninh",
  // Logo Organization (schema). Anh PNG logo-cong-ty.png id 339, 1536x1024.
  knowledgegraph_logo: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/logo-cong-ty.png",
  knowledgegraph_logo_id: 339,
  // Anh OG mac dinh chia se (Facebook + Zalo). Dung PNG logo id 339: tuong thich Zalo (Zalo hay loi voi .webp).
  open_graph_image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/logo-cong-ty.png",
  open_graph_image_id: 339,
};

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

function isEmpty(v) {
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "") ||
         (Array.isArray(v) && v.length === 0);
}

async function main() {
  console.log("=== Rank Math - set titles fields (chi khi trong) ===");
  console.log("Site:", BASE, "| Mode:", APPLY ? "APPLY (sua)" : "CHECK (chi doc)");

  const all = await exportSettings();
  if (!all.titles || typeof all.titles !== "object") {
    try { all.titles = JSON.parse(all.titles); } catch (e) { all.titles = {}; }
  }

  const bdir = path.join(__dirname, "backups");
  fs.mkdirSync(bdir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const bpath = path.join(bdir, "rankmath-export-" + stamp + ".json");
  fs.writeFileSync(bpath, JSON.stringify(all, null, 2), "utf8");
  console.log("\n[BACKUP] " + bpath + "\n");

  const toSet = [];
  for (const [k, want] of Object.entries(FIELDS)) {
    const cur = all.titles[k];
    console.log("  " + k + " hien tai = " + JSON.stringify(cur));
    if (isEmpty(cur)) toSet.push([k, want]);
    else console.log("    -> da co gia tri, BO QUA (khong ghi de).");
  }

  if (toSet.length === 0) {
    console.log("\n[OK] Khong co truong nao trong de set. Xong.");
    return;
  }
  if (!APPLY) {
    console.log("\n[OK] CHE DO KIEM TRA. Se set " + toSet.length + " truong khi chay --apply:");
    for (const [k, v] of toSet) console.log("   " + k + " = " + JSON.stringify(v));
    return;
  }

  for (const [k, v] of toSet) { all.titles[k] = v; console.log("[FIX] " + k + " = " + JSON.stringify(v)); }

  const imp = await importSettings(all);
  console.log("[IMPORT] OK qua field: " + imp.field + " | HTTP " + imp.status);

  const after = await exportSettings();
  let ok = true;
  for (const [k, v] of toSet) {
    const got = after.titles && after.titles[k];
    console.log("[SAU] " + k + " = " + JSON.stringify(got));
    if (String(got) !== String(v)) ok = false;
  }
  console.log("\n" + (ok ? "[SUCCESS] Da set xong cac truong." : "[WARN] Co truong chua khop - kiem tra lai."));
  console.log("Mo: " + BASE + "/wp-admin/admin.php?page=rank-math-options-titles");
}

main().catch((e) => { console.error("\n[X] LOI:", e.message); process.exit(1); });
