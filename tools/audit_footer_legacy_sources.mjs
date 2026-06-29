import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = existsSync(join(PROJECT, ".env"))
  ? join(PROJECT, ".env")
  : existsSync("/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env")
    ? "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
    : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";

const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const REPORT_DIR = join(PROJECT, "reports", `footer-legacy-source-audit-${STAMP}`);
mkdirSync(REPORT_DIR, { recursive: true });

const NEEDLES = [
  "ai-exit-popup-overlay",
  "Đừng rời đi",
  "Dung roi di",
  "Tôi sẽ quay lại sau",
  "Toi se quay lai sau",
  "ai-pr-block-container",
  "ai-back-to-top",
  "GỌI NGAY",
  "Chat Zalo Tư Vấn",
];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripTags(input) {
  return String(input || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function findHits(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits = [];
  for (const needle of NEEDLES) {
    const index = text.toLowerCase().indexOf(needle.toLowerCase());
    if (index >= 0) {
      hits.push({
        needle,
        snippet: text.slice(Math.max(0, index - 220), Math.min(text.length, index + 420)),
      });
    }
  }
  return hits;
}

async function wp(baseUrl, auth, path, options = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    ...options,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex footer legacy source audit",
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {}
  return { status: response.status, payload, raw };
}

async function rpc(endpoint, auth, method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex footer legacy source audit",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  return { status: response.status, sessionId: response.headers.get("mcp-session-id"), payload, raw };
}

async function callAbility(endpoint, auth, sessionId, abilityName, parameters, id) {
  return rpc(
    endpoint,
    auth,
    "tools/call",
    {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: abilityName, parameters },
    },
    id,
    sessionId
  );
}

function extractText(payload) {
  return payload?.result?.content?.[0]?.text || JSON.stringify(payload);
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const findings = [];

  const routesToScan = [
    { type: "elementor_snippet", path: "/wp-json/wp/v2/elementor_snippet?status=any&context=edit&per_page=100" },
    { type: "elementor_library", path: "/wp-json/wp/v2/elementor_library?status=any&context=edit&per_page=100" },
    { type: "pages", path: "/wp-json/wp/v2/pages?status=any&context=edit&per_page=100" },
    { type: "posts", path: "/wp-json/wp/v2/posts?status=any&context=edit&per_page=100" },
  ];

  for (const route of routesToScan) {
    const result = await wp(baseUrl, auth, route.path);
    const rows = Array.isArray(result.payload) ? result.payload : [];
    for (const row of rows) {
      const haystack = {
        id: row.id,
        status: row.status,
        slug: row.slug,
        title: row.title?.raw || row.title?.rendered,
        content: row.content?.raw || row.content?.rendered || "",
        meta: row.meta || {},
      };
      const hits = findHits(haystack);
      if (hits.length) {
        findings.push({
          source: "rest",
          type: route.type,
          id: row.id,
          status: row.status,
          slug: row.slug,
          title: stripTags(row.title?.raw || row.title?.rendered),
          hits,
          backup: haystack,
        });
      }
    }
  }

  const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;
  const init = await rpc(endpoint, auth, "initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex", version: "1" },
  }, 1);
  let optionFindings = [];
  if (init.status === 200 && init.sessionId) {
    let id = 2;
    for (const needle of NEEDLES) {
      const res = await callAbility(endpoint, auth, init.sessionId, "options/list", {
        search: `%${needle}%`,
        per_page: 20,
      }, id++);
      const text = extractText(res.payload);
      const hits = findHits(text);
      if (hits.length) optionFindings.push({ needle, status: res.status, hits, raw: text.slice(0, 5000) });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    reportDir: REPORT_DIR,
    findingsCount: findings.length,
    findings: findings.map(({ backup, ...rest }) => rest),
    optionFindings,
    backups: findings,
  };
  const reportPath = join(REPORT_DIR, "audit.json");
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    reportPath,
    findingsCount: findings.length,
    findings: report.findings.map((f) => ({ type: f.type, id: f.id, status: f.status, title: f.title, needles: f.hits.map((h) => h.needle) })),
    optionFindings: optionFindings.map((f) => f.needle),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
