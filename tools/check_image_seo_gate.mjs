import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkImageSeoPackage } from "./image_seo_gate.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");

function buildInput(target) {
  if (!target) return {};
  const absolute = path.resolve(target);
  if (existsSync(absolute)) return { markdownPath: absolute };
  return { slug: target };
}

function main() {
  const target = process.argv[2] ?? "";
  const result = checkImageSeoPackage(buildInput(target));
  const report = {
    target,
    checked_at: new Date().toISOString(),
    status: result.status,
    pass: result.ok,
    slug: result.slug,
    image_count: result.imageCount ?? 0,
    package_path: result.packagePath,
    notes: result.issues.length ? result.issues : ["Image SEO package passed."],
  };

  mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(REPORTS_DIR, `image-gate-${stamp}.json`);
  writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
  process.stdout.write(`${JSON.stringify({ ...report, report_json: out }, null, 2)}\n`);

  if (!result.ok) process.exit(1);
}

main();
