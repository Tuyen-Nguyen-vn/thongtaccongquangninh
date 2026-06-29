/**
 * Scan tất cả posts/pages tìm draft notes bị publish.
 * Sau đó tự động remove và report.
 */
import https from "node:https";
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const AUDIT_LIST = "D:\\.thongtaccongquangninh\\wp-url-audit-list.json";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, bodyObj) {
  return new Promise((resolve, reject) => {
    const b = bodyObj ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;
    const headers = { Host: WP_HOST, Authorization: auth };
    if (b) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = b.length; }
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method, headers, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: resp.statusCode, d }); } }); });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t")));
    if (b) r.write(b); r.end();
  });
}

function countVis(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

// Draft markers to detect
const DRAFT_MARKERS = [
  "Gợi ý ảnh SEO",
  "Internal links:",
  "Checklist Rank Math",
  "Điểm ước tính:",
  "PENDING_IMAGE_SEO",
  "External link:\nCục",
  "Anchor: &#8220;",
];

// Detect and strip draft section from raw content
function removeDraftNotes(raw) {
  let modified = raw;
  let totalRemoved = 0;

  // Pattern: remove paragraphs containing draft markers
  // Strategy: find earliest draft marker, remove from there to JSON-LD or author line
  const draftMarkerPositions = DRAFT_MARKERS
    .map(m => raw.indexOf(m))
    .filter(i => i > -1);

  if (draftMarkerPositions.length === 0) return { modified: raw, removedWords: 0 };

  // Find the paragraph start before the earliest marker
  const earliest = Math.min(...draftMarkerPositions);
  const pStart = raw.lastIndexOf("<p>", earliest);
  const pStartFallback = raw.lastIndexOf("<p><strong>", earliest);
  const sectionStart = Math.max(pStart, pStartFallback);

  // Find end: before first JSON-LD script or author line after the marker
  const jsonLdIdx = raw.indexOf('<script type="application/ld+json">', earliest);
  const authorIdx = raw.indexOf('<p>Tác giả:', earliest);
  const possibleEnds = [jsonLdIdx, authorIdx].filter(i => i > earliest);
  const sectionEnd = possibleEnds.length > 0 ? Math.min(...possibleEnds) : raw.length;

  const removed = raw.slice(sectionStart > 0 ? sectionStart : earliest, sectionEnd);
  const removedWords = countVis(removed);

  modified = raw.slice(0, sectionStart > 0 ? sectionStart : earliest) + raw.slice(sectionEnd);

  return { modified, removedWords, removedChars: removed.length };
}

// Load all public posts/pages from audit list
const auditList = JSON.parse(readFileSync(AUDIT_LIST, "utf8"));
const entries = auditList.entries.filter(e => e.is_public === "true" && e.status === "publish");
console.log(`Total public entries: ${entries.length}`);

const affected = [];
const errors = [];
let fixed = 0;

for (let i = 0; i < entries.length; i++) {
  const e = entries[i];
  const restBase = e.post_type === "page" ? "pages" : "posts";
  process.stdout.write(`[${i + 1}/${entries.length}] ${e.slug} ... `);

  const r = await wpReq("GET", `/wp-json/wp/v2/${restBase}/${e.id}?context=edit`);
  if (r.s !== 200) { console.log(`HTTP ${r.s} skip`); continue; }

  const raw = r.d?.content?.raw ?? "";
  const hasMarkers = DRAFT_MARKERS.some(m => raw.includes(m));

  if (!hasMarkers) { console.log("clean"); continue; }

  const { modified, removedWords, removedChars } = removeDraftNotes(raw);

  if (removedWords === 0) { console.log("markers found but no removable block"); continue; }

  console.log(`DRAFT FOUND: removing ~${removedWords} words`);
  affected.push({ slug: e.slug, id: e.id, type: e.post_type, removedWords });

  // Update
  const upd = await wpReq("POST", `/wp-json/wp/v2/${restBase}/${e.id}`, { content: modified });
  if (upd.s === 200) {
    console.log(`  ✓ Updated (${e.slug})`);
    fixed++;
  } else {
    console.log(`  ✗ Failed: ${JSON.stringify(upd.d).slice(0, 100)}`);
    errors.push(e.slug);
  }

  await new Promise(r => setTimeout(r, 500)); // rate limit
}

console.log(`\n=== SUMMARY ===`);
console.log(`Scanned: ${entries.length} | Affected: ${affected.length} | Fixed: ${fixed} | Errors: ${errors.length}`);
if (affected.length > 0) {
  console.log("\nAffected pages:");
  affected.forEach(a => console.log(`  - ${a.slug} (${a.type} ${a.id}): removed ~${a.removedWords} words`));
}

// Write report
const reportPath = `D:\\.thongtaccongquangninh\\reports\\draft-notes-scan-${new Date().toISOString().slice(0, 10)}.md`;
const reportLines = [
  `# Draft Notes Scan — ${new Date().toISOString().slice(0, 10)}`,
  ``,
  `**Scanned:** ${entries.length} | **Fixed:** ${fixed} | **Errors:** ${errors.length}`,
  ``,
  `## Pages with draft notes removed`,
  `| Slug | ID | Type | Words removed |`,
  `|---|---|---|---:|`,
  ...affected.map(a => `| ${a.slug} | ${a.id} | ${a.type} | ${a.removedWords} |`),
  ``,
  errors.length > 0 ? `## Errors\n${errors.join(", ")}` : "",
];
writeFileSync(reportPath, reportLines.join("\n"), "utf8");

// CSV log
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH,
  `\n${TODAY},${TIME},SCAN-DRAFT-NOTES-ALL-${TODAY},content_fix,Quet ${entries.length} trang tim draft notes (Goi y anh SEO/Internal links/Checklist); fix ${fixed} trang,https://thongtaccongquangninh.com,,done,high,,,,,Bat gap ${affected.length} trang co draft notes bi publish,${reportPath},,Re-run audit sau khi cache expire,,,,,,`,
  "utf8"
);
console.log(`\nReport: ${reportPath}`);
