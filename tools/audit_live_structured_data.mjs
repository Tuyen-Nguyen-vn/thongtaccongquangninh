import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const REPORT_DIR = join(ROOT, "reports");
const URL_LIST_PATH = join(ROOT, "wp-url-audit-list.json");
const CACHE_BUSTER = "codex=structured-data-audit-20260601&nowprocket=1";

function timestamp() {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "")
    .replace(/:/g, "-");
}

function addCacheBuster(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${CACHE_BUSTER}`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function flattenTypes(type) {
  if (!type) return [];
  return Array.isArray(type) ? type.flatMap(flattenTypes) : [String(type)];
}

function walkJsonLd(node, visitor) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLd(item, visitor);
    return;
  }
  visitor(node);
  for (const value of Object.values(node)) {
    walkJsonLd(value, visitor);
  }
}

function extractJsonLdScripts(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match, index) => ({
      index: index + 1,
      raw: match[1].trim(),
    }));
}

function hasNoindexRobots(html) {
  const robots = [...html.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)]
    .map((match) => match[0]);

  return robots.some((tag) => /content=["'][^"']*\bnoindex\b/i.test(tag));
}

function summarizeJsonLd(script) {
  const result = {
    index: script.index,
    parsed: false,
    error: null,
    types: [],
    ids: [],
    warnings: [],
    forbiddenReviewMarkers: [],
  };

  let data;
  try {
    data = JSON.parse(script.raw);
    result.parsed = true;
  } catch (error) {
    result.error = error.message;
    return result;
  }

  walkJsonLd(data, (node) => {
    const types = flattenTypes(node["@type"]);
    result.types.push(...types);
    if (node["@id"]) result.ids.push(String(node["@id"]));

    if (types.includes("Review")) result.forbiddenReviewMarkers.push("@type Review");
    if (types.includes("AggregateRating")) result.forbiddenReviewMarkers.push("@type AggregateRating");
    if (Object.hasOwn(node, "review")) result.forbiddenReviewMarkers.push("review");
    if (Object.hasOwn(node, "aggregateRating")) result.forbiddenReviewMarkers.push("aggregateRating");
    if (Object.hasOwn(node, "reviewRating")) result.forbiddenReviewMarkers.push("reviewRating");

    if (types.includes("FAQPage")) {
      const questions = Array.isArray(node.mainEntity) ? node.mainEntity.length : 0;
      if (questions === 0) result.warnings.push("FAQPage thiếu mainEntity dạng mảng");
    }

    if (types.includes("BreadcrumbList")) {
      const items = Array.isArray(node.itemListElement) ? node.itemListElement.length : 0;
      if (items < 2) result.warnings.push("BreadcrumbList có ít hơn 2 item");
    }

    if (types.includes("Service")) {
      for (const key of ["name", "provider", "url"]) {
        if (!Object.hasOwn(node, key)) result.warnings.push(`Service thiếu ${key}`);
      }
    }

    if (types.includes("LocalBusiness") || types.includes("HomeAndConstructionBusiness")) {
      for (const key of ["name", "telephone", "url"]) {
        if (!Object.hasOwn(node, key)) result.warnings.push(`LocalBusiness thiếu ${key}`);
      }
    }
  });

  result.types = unique(result.types);
  result.ids = unique(result.ids);
  result.warnings = unique(result.warnings);
  result.forbiddenReviewMarkers = unique(result.forbiddenReviewMarkers);
  return result;
}

function loadUrls() {
  const argUrl = process.argv.find((arg) => arg.startsWith("--url="));
  if (argUrl) {
    const url = argUrl.slice("--url=".length);
    return [{ slug: "manual-url", title: url, url }];
  }

  const list = JSON.parse(readFileSync(URL_LIST_PATH, "utf8"));
  const urls = [
    {
      slug: "home",
      title: "Trang chủ",
      url: "https://thongtaccongquangninh.com/",
    },
  ];

  const publicEntries = (list.entries ?? []).filter(
    (e) => e.is_public === "true" || e.is_public === true,
  );
  for (const item of publicEntries) {
    const url = item.normalizedLink || item.link;
    if (!url || !url.startsWith("https://thongtaccongquangninh.com/")) continue;
    if (urls.some((existing) => existing.url === url)) continue;
    urls.push({
      slug: item.slug || url,
      title: item.title || item.slug || url,
      url,
    });
  }
  return urls;
}

function countTypes(scripts) {
  const counts = new Map();
  for (const script of scripts) {
    for (const type of script.types) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }
  return counts;
}

function assessPage(page) {
  const issues = [];
  const warnings = [];
  const parsedScripts = page.scripts.filter((script) => script.parsed);
  const typeCounts = countTypes(parsedScripts);

  if (page.error) issues.push(page.error);
  if (page.httpStatus && page.httpStatus >= 400) issues.push(`HTTP ${page.httpStatus}`);
  if (page.scripts.length === 0) warnings.push("Không thấy JSON-LD");

  for (const script of page.scripts) {
    if (!script.parsed) issues.push(`JSON-LD #${script.index} parse lỗi: ${script.error}`);
    if (script.forbiddenReviewMarkers.length) {
      issues.push(`JSON-LD #${script.index} có review/rating marker: ${script.forbiddenReviewMarkers.join(", ")}`);
    }
    warnings.push(...script.warnings.map((warning) => `JSON-LD #${script.index}: ${warning}`));
  }

  if ((typeCounts.get("FAQPage") ?? 0) > 1) {
    warnings.push(`Có ${typeCounts.get("FAQPage")} FAQPage trên cùng URL, nên hợp nhất để tránh schema trùng lớp`);
  }

  if (page.noindex && issues.length === 0) {
    return {
      ...page,
      issues: [],
      warnings: [],
      status: "PASS",
      schemaTypes: unique(parsedScripts.flatMap((script) => script.types)),
      note: "Trang noindex, bỏ qua gate rich result/schema public",
    };
  }

  return {
    ...page,
    issues: unique(issues),
    warnings: unique(warnings),
    status: issues.length ? "FAIL" : warnings.length ? "WARN" : "PASS",
    schemaTypes: unique(parsedScripts.flatMap((script) => script.types)),
  };
}

function markdownReport(results, jsonPath) {
  const pass = results.filter((item) => item.status === "PASS").length;
  const warn = results.filter((item) => item.status === "WARN").length;
  const fail = results.filter((item) => item.status === "FAIL").length;

  let md = "# Live structured data audit\n\n";
  md += `- Generated: ${new Date().toISOString()}\n`;
  md += `- Source: ${URL_LIST_PATH}\n`;
  md += `- Checked URLs: ${results.length}\n`;
  md += `- PASS: ${pass}\n`;
  md += `- WARN: ${warn}\n`;
  md += `- FAIL: ${fail}\n`;
  md += `- JSON detail: ${jsonPath}\n\n`;

  const attention = results.filter((item) => item.status !== "PASS");
  if (!attention.length) {
    md += "## Kết luận\n\nKhông phát hiện lỗi hoặc cảnh báo structured data trong HTML public đã fetch bằng cache-buster.\n";
    return md;
  }

  md += "## Cần xem\n\n";
  for (const item of attention) {
    md += `### ${item.status}: ${item.slug}\n\n`;
    md += `- URL: ${item.url}\n`;
    md += `- HTTP: ${item.httpStatus ?? "n/a"}\n`;
    md += `- Schema types: ${item.schemaTypes.join(", ") || "None"}\n`;
    if (item.issues.length) md += `- Issues: ${item.issues.join(" | ")}\n`;
    if (item.warnings.length) md += `- Warnings: ${item.warnings.join(" | ")}\n`;
    md += "\n";
  }

  return md;
}

async function auditUrl(item) {
  const page = {
    ...item,
    httpStatus: null,
    scripts: [],
    error: null,
    noindex: false,
  };

  try {
    const response = await fetch(addCacheBuster(item.url), {
      headers: {
        "User-Agent": "Codex structured data audit",
      },
      signal: AbortSignal.timeout(30000),
    });
    page.httpStatus = response.status;
    const html = await response.text();
    page.noindex = hasNoindexRobots(html);
    page.scripts = extractJsonLdScripts(html).map(summarizeJsonLd);
  } catch (error) {
    page.error = error.message;
  }

  return assessPage(page);
}

mkdirSync(REPORT_DIR, { recursive: true });

const urls = loadUrls();
const results = [];
for (const item of urls) {
  const result = await auditUrl(item);
  results.push(result);
  console.log(`${result.status} ${result.slug} ${result.url}`);
}

const stamp = timestamp();
const jsonPath = join(REPORT_DIR, `structured-data-live-audit-${stamp}.json`);
const mdPath = join(REPORT_DIR, `structured-data-live-audit-${stamp}.md`);
writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), "utf8");
writeFileSync(mdPath, markdownReport(results, jsonPath), "utf8");

const fail = results.filter((item) => item.status === "FAIL").length;
const warn = results.filter((item) => item.status === "WARN").length;
const pass = results.filter((item) => item.status === "PASS").length;
console.log(`Report: ${mdPath}`);
console.log(`Summary: PASS ${pass}, WARN ${warn}, FAIL ${fail}`);
