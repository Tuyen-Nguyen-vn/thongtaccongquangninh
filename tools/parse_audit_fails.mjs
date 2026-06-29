import { readFileSync } from "node:fs";
const j = JSON.parse(readFileSync("reports/seo-full-audit-2026-06-19.json", "utf8"));
const rows = j.results;

console.log("=== Broken links detail ===");
for (const r of rows) {
  if (Array.isArray(r.brokenLinks) && r.brokenLinks.length) {
    console.log(`\n${r.link}:`);
    for (const bl of r.brokenLinks) {
      console.log("  -", typeof bl === "string" ? bl : JSON.stringify(bl));
    }
  }
}

console.log("\n=== Duplicate title pairs (check false positive) ===");
console.log(JSON.stringify(j.duplicateTitlePairs, null, 1).slice(0, 800));
