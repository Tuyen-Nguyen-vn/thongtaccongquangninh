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
      "User-Agent": "Codex page35-inline-schema-hours-fix",
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

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex page35-inline-schema-hours-fix" },
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

const now = new Date();
const stamp = formatProjectStamp(now);
const backupDir = join(ROOT, "backups", `page35-inline-schema-hours-live-${stamp}`);
const reportPath = join(ROOT, "reports", `page35-inline-schema-hours-live-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(join(ROOT, "reports"), { recursive: true });

async function main() {
  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    backupPath: null,
    updateStatus: null,
    public: {},
    success: false,
  };

  const before = await wpFetch("/wp-json/wp/v2/pages/35?context=edit");
  if (before.status !== 200 || !before.json) {
    throw new Error(`Page 35 fetch failed: ${before.status}`);
  }

  const backupPath = join(backupDir, "page-35-inline-schema.before.json");
  writeFileSync(backupPath, JSON.stringify(before.json, null, 2), "utf8");
  report.backupPath = backupPath;

  const raw = before.json.content?.raw || "";
  const pattern = /"openingHoursSpecification"\s*:\s*\{\s*"@type"\s*:\s*"OpeningHoursSpecification",\s*"dayOfWeek"\s*:\s*\[\s*"Monday",\s*"Tuesday",\s*"Wednesday",\s*"Thursday",\s*"Friday",\s*"Saturday",\s*"Sunday"\s*\],\s*"opens"\s*:\s*"00:00",\s*"closes"\s*:\s*"23:59"\s*\}/;
  if (!pattern.test(raw)) {
    throw new Error("Expected inline schema hours snippet not found in page 35 raw content");
  }
  const updated = raw.replace(
    pattern,
    `"openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday",
          "Friday", "Saturday", "Sunday"
        ],
        "opens": "05:00",
        "closes": "22:00"
      }`,
  );

  const write = await wpFetch("/wp-json/wp/v2/pages/35", {
    method: "POST",
    body: JSON.stringify({ content: updated }),
  });
  report.updateStatus = write.status;
  if (write.status !== 200) {
    throw new Error(`Page 35 update failed: ${write.status} ${write.text}`);
  }

  const qn = await fetchPublic(`/thong-tac-cong-quang-ninh/?nowprocket=1&codex=${Date.now()}`);
  report.public = {
    status: qn.status,
    hasOldHours: qn.text.includes("\"opens\":\"00:00\"") || qn.text.includes("\"closes\":\"23:59\""),
    hasNewHours: qn.text.includes("\"opens\":\"05:00\"") && qn.text.includes("\"closes\":\"22:00\""),
  };
  report.success = Boolean(report.public.status === 200 && report.public.hasNewHours && !report.public.hasOldHours);

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath, backupDir, success: report.success }, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const failure = {
    generatedAt: formatProjectTimestamp(now),
    error: error instanceof Error ? error.message : String(error),
  };
  writeFileSync(reportPath, JSON.stringify(failure, null, 2), "utf8");
  console.error(error);
  process.exitCode = 1;
});
