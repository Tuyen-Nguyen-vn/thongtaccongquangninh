import { readFileSync, writeFileSync } from "fs";

const urlListPath = "D:\\.thongtaccongquangninh\\wp-url-audit-list.json";
const reportPath = "D:\\.thongtaccongquangninh\\reports\\ai_overview_schema_audit.md";

const list = JSON.parse(readFileSync(urlListPath, "utf-8"));
const publicUrls = (list.entries || []).filter(
  (e) => e.is_public === "true" || e.is_public === true,
);

const results = [];
let passCount = 0;
let failCount = 0;

console.log(`Starting scan for ${publicUrls.length} URLs...`);

for (const item of publicUrls) {
  try {
    const url = item.link;
    // fetch live HTML
    const response = await fetch(url, { headers: { "User-Agent": "Codex SEO Audit" }});
    if (!response.ok) {
      results.push({ slug: item.slug, status: "FAIL", issues: [`HTTP ${response.status}`], url });
      failCount++;
      continue;
    }
    const html = await response.text();
    
    // Check schemas
    const schemas = [];
    const scriptMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const match of scriptMatches) {
        try {
            const data = JSON.parse(match[1]);
            const extractType = (obj) => {
                let types = [];
                if (obj["@graph"]) {
                    types = obj["@graph"].map(g => g["@type"]).flat();
                } else {
                    types = [obj["@type"]].flat();
                }
                return types;
            };
            schemas.push(...extractType(data));
        } catch (e) {
            // invalid json
        }
    }
    
    const schemaTypes = [...new Set(schemas.flat())];
    
    // Check AI Overview features
    const hasTOC = html.includes('id="ez-toc-container"') || html.includes('table of contents') || html.match(/<ul[^>]*class="[^"]*toc[^"]*"[^>]*>/i) || html.includes('TOC');
    const hasFAQSchema = schemaTypes.includes("FAQPage");
    const hasLocalBusiness = schemaTypes.includes("LocalBusiness") || schemaTypes.includes("Plumber") || schemaTypes.includes("Service");
    const hasArticle = schemaTypes.includes("Article") || schemaTypes.includes("BlogPosting");
    
    // AI overview loves standard formatting and H2/H3 depth
    const heading2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    
    // Check slugs (no stop words, exactly matches keywords. Usually just needs to be concise)
    const slugParts = item.slug.split("-");
    const isSlugStandard = slugParts.length <= 8 && !item.slug.includes("va") && !item.slug.includes("cac"); // rough check
    
    const issues = [];
    // Only expect FAQ and LocalBusiness on service/local landing pages
    if (item.is_local_landing && !hasFAQSchema) issues.push("Thiếu FAQ Schema (Cần thiết cho AI Overview)");
    // Rank Math typically injects Article/WebPage by default, so we look for those
    if (heading2Count < 3) issues.push("Quá ít Heading 2 (<3), AI Overview khó trích xuất");
    if (!hasTOC && item.words > 1000) issues.push("Bài dài nhưng thiếu Mục lục (TOC) cho AI Overview");
    if (!isSlugStandard) issues.push("Slug chưa tối ưu (quá dài hoặc chứa stop word)");
    
    const isStandard = issues.length === 0;
    if (isStandard) {
        passCount++;
    } else {
        failCount++;
    }
    
    results.push({
        slug: item.slug,
        title: item.title,
        url,
        status: isStandard ? "PASS" : "FAIL",
        schemas: schemaTypes,
        issues,
        http: response.status
    });
    console.log(`Processed ${item.slug}: ${isStandard ? "PASS" : "FAIL"}`);
  } catch (err) {
      results.push({ slug: item.slug, status: "ERROR", issues: [err.message], url: item.link, schemas: [] });
      failCount++;
      console.error(`Error on ${item.slug}:`, err.message);
  }
}

// Generate markdown
let md = `# Phân tích chuyên sâu AI Overview & Schema\n\n`;
md += `**Thời gian:** ${new Date().toISOString()}\n`;
md += `**Tổng số trang đã quét:** ${publicUrls.length}\n`;
md += `**Chuẩn SEO (Sẵn sàng Index):** ${passCount}\n`;
md += `**Cần tối ưu thêm:** ${failCount}\n\n`;

md += `## Danh sách trang ĐẠT CHUẨN (PASS)\n`;
for (const r of results.filter(x => x.status === "PASS")) {
    md += `- [${r.slug}](${r.url}) - **Schemas:** ${r.schemas.join(", ")}\n`;
}

md += `\n## Danh sách trang CẦN TỐI ƯU (FAIL / ERROR)\n`;
for (const r of results.filter(x => x.status !== "PASS")) {
    md += `- [${r.slug}](${r.url})\n`;
    md += `  - **Issues:** ${r.issues.join(", ")}\n`;
    md += `  - **Schemas found:** ${r.schemas.join(", ") || "None"}\n`;
}

writeFileSync(reportPath, md, "utf-8");

// Export PASS urls for indexing
const passUrls = results.filter(x => x.status === "PASS").map(x => x.url);
writeFileSync("D:\\.thongtaccongquangninh\\reports\\ai_overview_pass_urls.json", JSON.stringify(passUrls, null, 2), "utf-8");

console.log("Analysis complete. Found " + passCount + " standard pages.");
