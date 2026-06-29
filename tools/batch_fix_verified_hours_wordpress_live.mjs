import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import https from "node:https";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(ROOT, ".env");
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const PROJECT_TIMEZONE = "Asia/Bangkok";
const WRITE = process.argv.includes("--write");

function getTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");
  return { ...map, millisecond };
}

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

function formatProjectTimestamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.millisecond}+07:00`;
}

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wpFetch(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex batch-verified-hours-fix",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: response.status, text, json };
}

async function fetchCollection(type) {
  const items = [];
  for (let page = 1; page <= 20; page += 1) {
    const res = await wpFetch(`/wp-json/wp/v2/${type}?context=edit&per_page=100&page=${page}&_fields=id,slug,title,content,status,type`);
    if (res.status === 400) break;
    if (res.status !== 200 || !Array.isArray(res.json)) {
      throw new Error(`Failed to fetch ${type} page ${page}: ${res.status}`);
    }
    if (!res.json.length) break;
    items.push(...res.json);
    if (res.json.length < 100) break;
  }
  return items;
}

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex batch-verified-hours-fix" },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("error", (error) => resolve({ status: 0, error: error.message, text: "" }));
    req.setTimeout(45000, () => {
      req.destroy();
      resolve({ status: 0, error: "timeout", text: "" });
    });
    req.end();
  });
}

function count247(text) {
  return (text.match(/24\/7/g) || []).length;
}

function cleanupTitle(title) {
  return title
    .replace(/Phục Vụ\s*24\/7/gi, "Tiếp Nhận 05:00-22:00")
    .replace(/Có Mặt\s*24\/7/gi, "Tiếp Nhận 05:00-22:00")
    .replace(/,\s*24\/7\b/gi, "")
    .replace(/\s*24\/7\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,:;!?])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*[-–]\s*([,:;])/g, " ")
    .replace(/:\s*-/g, ": ")
    .replace(/[,:;\-–]\s*$/g, "")
    .replace(/\s+[-–]\s+$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([–-])/g, " $1")
    .replace(/([–-])([A-Za-zÀ-ỹ0-9])/g, "$1 $2")
    .replace(/\s+([–-])\s+/g, " $1 ")
    .replace(/\s+$/g, "")
    .trim();
}

function transformContent(raw) {
  let content = raw;
  const replacements = [
    [/24\/7 kể cả ngày lễ và đêm muộn/gi, "05:00-22:00 hằng ngày"],
    [/24\/7 kể cả ngày lễ và tết/gi, "05:00-22:00 hằng ngày"],
    [/24\/7, kể cả ngày lễ và tết/gi, "05:00-22:00 hằng ngày"],
    [/24\/7, kể cả ngày nghỉ và lễ tết/gi, "05:00-22:00 hằng ngày, bao gồm cả cuối tuần"],
    [/phục vụ 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/hỗ trợ 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/hoạt động 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/trực 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/túc trực 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/Hotline 24\/7/gi, "Hotline tiếp nhận"],
    [/Liên hệ 24\/7/gi, "Liên hệ 05:00-22:00"],
    [/\(24\/7\)/g, "(05:00-22:00)"],
    [/24\/7/g, "05:00-22:00"],
    [/05:00-22:00, 05:00-22:00/gi, "05:00-22:00"],
    [/tiếp nhận 05:00-22:00 hằng ngày hằng ngày/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/05:00-22:00 hằng ngày, kể cả ngày lễ và đêm muộn/gi, "05:00-22:00 hằng ngày"],
    [/05:00-22:00 hằng ngày, kể cả ngày lễ và tết/gi, "05:00-22:00 hằng ngày"],
  ];
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  return content;
}

function buildUpdate(item) {
  const originalTitle = item.title?.raw || "";
  const originalContent = item.content?.raw || "";
  if (!originalTitle.includes("24/7") && !originalContent.includes("24/7")) {
    return null;
  }
  const title = originalTitle.includes("24/7") ? cleanupTitle(originalTitle) : originalTitle;
  const content = originalContent.includes("24/7") ? transformContent(originalContent) : originalContent;
  const remaining = count247(`${title}\n${content}`);
  return {
    id: item.id,
    type: item.type,
    slug: item.slug,
    originalTitle,
    title,
    content,
    changedTitle: title !== originalTitle,
    changedContent: content !== originalContent,
    remaining,
  };
}

const now = new Date();
const stamp = formatProjectStamp(now);
const mode = WRITE ? "write" : "dry-run";
const backupDir = join(ROOT, "backups", `batch-verified-hours-${mode}-${stamp}`);
const reportPath = join(ROOT, "reports", `batch-verified-hours-${mode}-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(join(ROOT, "reports"), { recursive: true });

async function rescanPublished() {
  const [pages, posts] = await Promise.all([fetchCollection("pages"), fetchCollection("posts")]);
  return [...pages, ...posts].filter((item) => item.status === "publish");
}

async function main() {
  const beforeItems = await rescanPublished();
  const hits = beforeItems
    .map(buildUpdate)
    .filter(Boolean);

  const safe = hits.filter((item) => item.remaining === 0 && (item.changedTitle || item.changedContent));
  const skipped = hits.filter((item) => item.remaining > 0 || (!item.changedTitle && !item.changedContent));

  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    mode,
    before: {
      published: beforeItems.length,
      hits: hits.length,
    },
    safeCount: safe.length,
    skippedCount: skipped.length,
    safe: safe.map((item) => ({
      id: item.id,
      type: item.type,
      slug: item.slug,
      changedTitle: item.changedTitle,
      changedContent: item.changedContent,
      titleBefore: item.originalTitle,
      titleAfter: item.title,
    })),
    skipped: skipped.map((item) => ({
      id: item.id,
      type: item.type,
      slug: item.slug,
      remaining: item.remaining,
      titleBefore: item.originalTitle,
      titleAfter: item.title,
    })),
    writes: [],
    after: null,
    publicSamples: [],
    success: false,
  };

  if (WRITE) {
    for (const item of safe) {
      const backupPath = join(backupDir, `${item.type}-${item.id}-${item.slug}.before.json`);
      writeFileSync(backupPath, JSON.stringify(
        beforeItems.find((source) => source.id === item.id && source.type === item.type),
        null,
        2,
      ), "utf8");

      const endpoint = item.type === "page" ? `/wp-json/wp/v2/pages/${item.id}` : `/wp-json/wp/v2/posts/${item.id}`;
      const write = await wpFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          title: item.title,
          content: item.content,
        }),
      });
      report.writes.push({
        id: item.id,
        type: item.type,
        slug: item.slug,
        status: write.status,
        backupPath,
      });
      if (write.status !== 200) {
        throw new Error(`Write failed for ${item.type} ${item.id}: ${write.status}`);
      }
    }

    const afterItems = await rescanPublished();
    const afterHits = afterItems
      .map((item) => {
        const title = item.title?.raw || "";
        const content = item.content?.raw || "";
        const count = count247(`${title}\n${content}`);
        return count ? { id: item.id, type: item.type, slug: item.slug, title, count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count);
    report.after = {
      published: afterItems.length,
      hits: afterHits.length,
      top: afterHits.slice(0, 40),
    };

    const sampleTargets = safe.slice(0, 12).map((item) => {
      const prefix = item.type === "page" ? "/" : "/";
      return { slug: item.slug, type: item.type, path: `/${item.slug}/` };
    });
    for (const sample of sampleTargets) {
      const page = await fetchPublic(`${sample.path}?nowprocket=1&codex=${Date.now()}`);
      report.publicSamples.push({
        slug: sample.slug,
        type: sample.type,
        status: page.status,
        has247: /24\/7/.test(page.text),
        hasVerifiedHours: page.text.includes("05:00-22:00"),
      });
    }

    report.success = report.writes.every((item) => item.status === 200);
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    reportPath,
    backupDir,
    mode,
    safeCount: report.safeCount,
    skippedCount: report.skippedCount,
    success: report.success,
  }, null, 2));
  if (WRITE && !report.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const failure = {
    generatedAt: formatProjectTimestamp(now),
    mode,
    error: error instanceof Error ? error.message : String(error),
  };
  writeFileSync(reportPath, JSON.stringify(failure, null, 2), "utf8");
  console.error(error);
  process.exitCode = 1;
});
