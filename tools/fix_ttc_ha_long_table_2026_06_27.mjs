import https from "node:https";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE_URL = "https://thongtaccongquangninh.com";
const PAGE_ID = 296;
const PAGE_SLUG = "thong-tac-cong-ha-long";
const PAGE_PATH = `/${PAGE_SLUG}/`;
const OPTION_NAMES = [
  "ttcqn_doorway_safe_page_296_content",
  "ttcqn_doorway_safe_page_296_content_v2",
];
const APPLY = process.argv.includes("--apply");
const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-ttc-ha-long-table-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `ttc-ha-long-table-fix-${ts}.json`);
const CSV_PATH = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");

const TARGET_HEADER =
  "<thead><tr><th>Nguyên nhân</th><th>Dấu hiệu nhận biết</th><th>Vị trí thường gặp</th><th>Cách xử lý phù hợp</th></tr></thead>";
const PATCHED_HEADER =
  "<thead><tr><th>Nguyên nhân</th><th>Dấu hiệu nhận biết</th><th>Vị trí thường gặp</th><th>Mức độ nghiêm trọng</th><th>Chi phí dự kiến</th><th>Cách xử lý phù hợp</th></tr></thead>";

const ROW_DATA = [
  {
    needle: "Dầu mỡ tích tụ lâu ngày",
    severity: "Trung bình - nặng",
    cost: "Từ 250.000đ - 650.000đ, chốt sau khảo sát",
  },
  {
    needle: "Rác sinh hoạt",
    severity: "Nhẹ - trung bình",
    cost: "Từ 150.000đ - 350.000đ nếu không phải tháo lắp lớn",
  },
  {
    needle: "Hố ga bị đầy bùn đất",
    severity: "Nặng",
    cost: "Khảo sát theo khối lượng bùn, báo giá trước khi nạo vét",
  },
  {
    needle: "Đường ống sụt lún",
    severity: "Nặng, cần kiểm tra kỹ",
    cost: "Báo giá riêng sau khi xác định điểm gãy, sụt hoặc sai độ dốc",
  },
];

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpRequest(method, route, auth, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${route}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "Codex TTC Ha Long table fix",
          ...(payload ? { "Content-Type": "application/json", "Content-Length": payload.length } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data = text;
          try {
            data = text ? JSON.parse(text) : {};
          } catch {}
          if (res.statusCode >= 400) {
            const message = typeof data === "object" ? data.message ?? text : data;
            reject(new Error(`WP ${res.statusCode} ${route}: ${message}`));
            return;
          }
          resolve(data);
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error(`timeout ${route}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function mcpRpc(auth, sessionId, payload) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload), "utf8");
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: "/wp-json/mcp/mcp-adapter-default-server",
        method: "POST",
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "User-Agent": "Codex TTC Ha Long option sync",
          ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
          "Content-Length": body.length,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const dataLine = raw.match(/data:\s*(\{[\s\S]*\})/);
          const jsonText = dataLine ? dataLine[1] : raw;
          let data = jsonText;
          try {
            data = jsonText ? JSON.parse(jsonText) : {};
          } catch {}
          if (res.statusCode >= 400) {
            reject(new Error(`MCP ${res.statusCode}: ${raw.slice(0, 300)}`));
            return;
          }
          resolve({ data, sessionId: res.headers["mcp-session-id"] || sessionId });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("MCP timeout")));
    req.write(body);
    req.end();
  });
}

async function initMcp(auth) {
  const response = await mcpRpc(auth, null, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "codex-ttc-ha-long-table", version: "1.0.0" },
    },
  });
  if (!response.sessionId) throw new Error("Không lấy được Mcp-Session-Id");
  return response.sessionId;
}

async function optionGet(auth, sessionId, name, id) {
  const response = await mcpRpc(auth, sessionId, {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: { ability_name: "options/get", parameters: { name } },
    },
  });
  const text = response.data?.result?.content?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(text);
    return parsed.data?.value ?? parsed.data ?? parsed.value ?? "";
  } catch {
    return "";
  }
}

async function optionUpdate(auth, sessionId, name, value, id) {
  return mcpRpc(auth, sessionId, {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: { ability_name: "options/update", parameters: { name, value } },
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cellCount(row) {
  return (row.match(/<t[dh]\b/gi) ?? []).length;
}

function patchIssueTable(html) {
  let changed = false;
  let next = String(html ?? "");
  if (next.includes("Mức độ nghiêm trọng") && next.includes("Chi phí dự kiến")) {
    return { html: next, changed: false, reason: "already_patched" };
  }
  if (!next.includes(TARGET_HEADER)) {
    return { html: next, changed: false, reason: "target_header_not_found" };
  }
  next = next.replace(TARGET_HEADER, PATCHED_HEADER);
  next = next.replace(/<tbody>([\s\S]*?)<\/tbody>/, (tbodyMatch, tbodyInner) => {
    const patchedRows = tbodyInner.replace(/<tr>([\s\S]*?)<\/tr>/g, (rowMatch, rowInner) => {
      if (cellCount(rowMatch) !== 4) return rowMatch;
      const firstCell = rowInner.match(/<td>([\s\S]*?)<\/td>/i)?.[1] ?? "";
      const data = ROW_DATA.find((item) => firstCell.includes(item.needle));
      if (!data) return rowMatch;
      changed = true;
      const cells = [...rowInner.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((match) => match[1]);
      return `<tr><td>${cells[0]}</td><td>${cells[1]}</td><td>${cells[2]}</td><td>${escapeHtml(data.severity)}</td><td>${escapeHtml(data.cost)}</td><td>${cells[3]}</td></tr>`;
    });
    return `<tbody>${patchedRows}</tbody>`;
  });
  return { html: next, changed, reason: changed ? "patched" : "rows_not_found" };
}

function inspect(html) {
  const headings = [...String(html).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  }));
  const firstTable = String(html).match(/<table[\s\S]*?<\/table>/i)?.[0] ?? "";
  return {
    hasSeverityColumn: firstTable.includes("Mức độ nghiêm trọng"),
    hasCostColumn: firstTable.includes("Chi phí dự kiến"),
    patchedRowCount: ROW_DATA.filter((item) => firstTable.includes(item.severity)).length,
    h1CountInBody: headings.filter((item) => item.level === 1).length,
    h2Texts: headings.filter((item) => item.level === 2).map((item) => item.text).slice(0, 16),
    hasQcvn: String(html).includes("QCVN 07-2:2016"),
    hasAuthor: String(html).includes("nguyensonghao") || String(html).includes("Nguyễn Song Hào"),
    hasSchemaPerson: String(html).includes('"@type":"Person"') || String(html).includes('"@type": "Person"'),
    hasSchemaLocalBusiness: String(html).includes("LocalBusiness"),
    hasFaqPage: String(html).includes("FAQPage"),
  };
}

function liveGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: pathname,
        method: "GET",
        headers: {
          Host: WP_HOST,
          "User-Agent": "Codex TTC Ha Long live verify",
          "Cache-Control": "no-cache",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("live verify timeout")));
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD trong .env");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const page = await wpRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  const sessionId = await initMcp(auth);

  const pageContent = page.content?.raw ?? page.content?.rendered ?? "";
  const optionValues = [];
  for (const [index, name] of OPTION_NAMES.entries()) {
    optionValues.push({ name, value: await optionGet(auth, sessionId, name, 10 + index) });
  }

  const patchedPage = patchIssueTable(pageContent);
  const patchedOptions = optionValues.map((item) => ({ ...item, patched: patchIssueTable(item.value) }));
  const before = {
    page: inspect(pageContent),
    options: optionValues.map((item) => ({ name: item.name, inspect: inspect(item.value) })),
  };
  const after = {
    page: inspect(patchedPage.html),
    options: patchedOptions.map((item) => ({ name: item.name, inspect: inspect(item.patched.html), reason: item.patched.reason })),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    url: `${BASE_URL}${PAGE_PATH}`,
    pagePatch: { changed: patchedPage.changed, reason: patchedPage.reason },
    optionPatches: patchedOptions.map((item) => ({ name: item.name, changed: item.patched.changed, reason: item.patched.reason })),
    before,
    after,
    backupDir: APPLY ? BACKUP_DIR : null,
    reportPath: REPORT_PATH,
  };

  if (APPLY) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `page-${PAGE_ID}-${PAGE_SLUG}.json`), JSON.stringify(page, null, 2), "utf8");
    for (const item of optionValues) {
      writeFileSync(path.join(BACKUP_DIR, `option-${item.name}.json`), JSON.stringify({ name: item.name, value: item.value }, null, 2), "utf8");
    }
    if (patchedPage.changed) {
      await wpRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, { content: patchedPage.html });
    }
    for (const [index, item] of patchedOptions.entries()) {
      if (item.patched.changed) {
        const update = await optionUpdate(auth, sessionId, item.name, item.patched.html, 30 + index);
        report.optionPatches[index].updateStatus = update.data?.error ? "error" : "ok";
        if (update.data?.error) report.optionPatches[index].updateError = update.data.error;
      }
    }
    const live = await liveGet(`${PAGE_PATH}?nowprocket=1&codex=ttc-ha-long-table-${Date.now()}`);
    report.live = {
      status: live.status,
      ...inspect(live.html),
      h1Count: (live.html.match(/<h1\b/gi) ?? []).length,
      metaDescriptionLength: (live.html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)?.[1] ?? "").length,
    };
    appendFileSync(
      CSV_PATH,
      `\n${today},${time},FIX-TTC-HA-LONG-TABLE-${today},seo_fix,thong tac cong ha long,${BASE_URL}${PAGE_PATH},${PAGE_SLUG},done,low,,,,,Them cot Muc do nghiem trong + Chi phi du kien vao bang nguyen nhan/dau hieu va dong bo post_content + option renderer,tools/fix_ttc_ha_long_table_2026_06_27.mjs,,Theo doi cache neu frontend chua cap nhat ngay,Live verify cache-buster status ${report.live.status}; table columns ${report.live.hasSeverityColumn && report.live.hasCostColumn ? "OK" : "CHECK"},NOT_REQUIRED,Codex,${today},,,,`,
      "utf8",
    );
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  const ok =
    after.page.hasSeverityColumn &&
    after.page.hasCostColumn &&
    after.options.every((item) => item.inspect.hasSeverityColumn && item.inspect.hasCostColumn);
  if (!ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
