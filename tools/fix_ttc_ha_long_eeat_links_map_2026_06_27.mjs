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
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-ttc-ha-long-eeat-links-map-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `ttc-ha-long-eeat-links-map-${ts}.json`);
const CSV_PATH = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.4385482896339!2d107.05220536959965!3d20.962384198791902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad947ef4a1ff%3A0xb82f0e88497fbc1c!2zSMO6dCBC4buDIFBo4buRdCAtIE3DtGkgdHLGsOG7nW5nIMSRw7QgdGjhu4sgc-G7kSAxIFF14bqjbmcgTmluaA!5e0!3m2!1svi!2s!4v1781835498222!5m2!1svi!2s";
const SXD_URL = "https://www.quangninh.gov.vn/So/soxaydung/trang/default.aspx";
const AUTHOR_URL = `${BASE_URL}/author/nguyensonghao/`;

const LINK_BLOCK = `<h2>Liên kết dịch vụ lân cận tại Hạ Long</h2>
<p>Khi sự cố không chỉ nằm ở một điểm thoát nước, khách có thể xem thêm các trang dịch vụ sát khu vực để chọn đúng đội thợ gần nhất:</p>
<ul>
<li><a href="${BASE_URL}/thong-tac-cong-bai-chay/">Thông tắc cống Bãi Cháy</a> cho khách sạn, nhà hàng, homestay và khu du lịch.</li>
<li><a href="${BASE_URL}/thong-tac-cong-hong-gai/">Thông tắc cống Hồng Gai</a> cho nhà dân, ngõ nhỏ, khu tập thể và công trình cũ.</li>
<li><a href="${BASE_URL}/hut-be-phot-ha-long/">Hút bể phốt Hạ Long</a> khi cống trào ngược liên quan đến bể phốt đầy hoặc hố ga quá tải.</li>
<li>Tham khảo thông tin quản lý hạ tầng đô thị tại <a href="${SXD_URL}" target="_blank" rel="noopener noreferrer">Sở Xây dựng Quảng Ninh</a>.</li>
</ul>`;

const MAP_BLOCK = `<h2>Bản đồ văn phòng phục vụ thông tắc cống Hạ Long</h2>
<p>Điểm điều phối Hạ Long hỗ trợ tiếp nhận yêu cầu tại Bãi Cháy, Hòn Gai, Cao Xanh, Cao Thắng, Giếng Đáy, Tuần Châu và các khu dân cư lân cận. Khách nên gọi trước qua <strong>0963.953.533 / 0931.156.756</strong> để đội kỹ thuật xác nhận vị trí và chuẩn bị thiết bị phù hợp.</p>
<div class="ttcqn-ha-long-map-embed" style="margin:18px 0 26px">
<iframe src="${MAP_EMBED}" title="Bản đồ văn phòng Hạ Long - Môi Trường Đô Thị Số 1 Quảng Ninh" width="100%" height="360" style="border:0;border-radius:8px" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
</div>`;

const AUTHOR_BIO = `<p class="ttcqn-author-bio-final"><strong>Bài viết bởi <a href="${AUTHOR_URL}" rel="author">Nguyễn Song Hào</a></strong> - Chuyên gia thông tắc cống tại Hạ Long, phụ trách kiểm tra kỹ thuật, xác định điểm nghẽn và hướng dẫn phương án xử lý không đục phá cho Môi Trường Đô Thị Số 1 Quảng Ninh.</p>`;

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function requestJson(method, route, auth, body) {
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
          "User-Agent": "Codex TTC Ha Long EEAT fix",
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
            reject(new Error(`WP ${res.statusCode} ${route}: ${typeof data === "object" ? data.message ?? text : data}`));
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
      clientInfo: { name: "codex-ttc-ha-long-eeat", version: "1.0.0" },
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

function patchContent(input) {
  let html = String(input ?? "");
  const changes = [];

  if (!html.includes("/thong-tac-cong-bai-chay/") || !html.includes("/thong-tac-cong-hong-gai/") || !html.includes(SXD_URL)) {
    if (!html.includes("Liên kết dịch vụ lân cận tại Hạ Long")) {
      html = html.replace(/<h2>Liên hệ dịch vụ thông tắc cống Hạ Long \(NAP liên hệ\)<\/h2>/u, `${LINK_BLOCK}\n<h2>Liên hệ dịch vụ thông tắc cống Hạ Long (NAP liên hệ)</h2>`);
      changes.push("links_block");
    }
    if (!html.includes(SXD_URL)) {
      html = html.replace(
        "Sở Xây dựng Quảng Ninh và Quy chuẩn kỹ thuật quốc gia",
        `<a href="${SXD_URL}" target="_blank" rel="noopener noreferrer">Sở Xây dựng Quảng Ninh</a> và Quy chuẩn kỹ thuật quốc gia`,
      );
      changes.push("sxd_anchor");
    }
  }

  if (!html.includes("ttcqn-ha-long-map-embed")) {
    html = html.replace(/<h2>Câu hỏi thường gặp \(FAQ\) về thông tắc cống Hạ Long<\/h2>/u, `${MAP_BLOCK}\n<h2>Câu hỏi thường gặp (FAQ) về thông tắc cống Hạ Long</h2>`);
    changes.push("map_embed");
  }

  if (!html.includes("ttcqn-author-bio-final")) {
    if (/<p>Tác giả:\s*<a\b[^>]*>Nguyễn Song Hào<\/a><\/p>/u.test(html)) {
      html = html.replace(/<p>Tác giả:\s*<a\b([^>]*)>Nguyễn Song Hào<\/a><\/p>/u, `${AUTHOR_BIO}\n<p>Tác giả: <a$1>Nguyễn Song Hào</a></p>`);
    } else {
      html = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][\s\S]*$)/u, `${AUTHOR_BIO}\n$1`);
    }
    changes.push("author_bio_final");
  }

  return { html: html.replace(/\n{3,}/g, "\n\n").trim(), changes };
}

function inspect(html) {
  const text = String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  return {
    hasBaiChay: html.includes("/thong-tac-cong-bai-chay/"),
    hasHongGai: html.includes("/thong-tac-cong-hong-gai/"),
    hasHbpHaLong: html.includes("/hut-be-phot-ha-long/"),
    hasSxd: html.includes(SXD_URL),
    hasMapEmbed: html.includes("ttcqn-ha-long-map-embed") || /<iframe[^>]+google\.com\/maps/i.test(html),
    hasAuthorBioFinal: html.includes("ttcqn-author-bio-final"),
    hasPersonSchema: html.includes('"@type":"Person"') || html.includes('"@type": "Person"'),
    hasLocalBusinessSchema: html.includes("LocalBusiness"),
    hasFaqPage: html.includes("FAQPage"),
    forbidden: ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"].filter((word) => text.includes(word)),
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
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const page = await requestJson("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  const sessionId = await initMcp(auth);
  const pageContent = page.content?.raw ?? page.content?.rendered ?? "";
  const optionValues = [];
  for (const [index, name] of OPTION_NAMES.entries()) {
    optionValues.push({ name, value: await optionGet(auth, sessionId, name, 10 + index) });
  }

  const patchedPage = patchContent(pageContent);
  const patchedOptions = optionValues.map((item) => ({ ...item, patched: patchContent(item.value) }));
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    url: `${BASE_URL}${PAGE_PATH}`,
    before: {
      page: inspect(pageContent),
      options: optionValues.map((item) => ({ name: item.name, inspect: inspect(item.value) })),
    },
    changes: {
      page: patchedPage.changes,
      options: patchedOptions.map((item) => ({ name: item.name, changes: item.patched.changes })),
    },
    after: {
      page: inspect(patchedPage.html),
      options: patchedOptions.map((item) => ({ name: item.name, inspect: inspect(item.patched.html) })),
    },
    backupDir: APPLY ? BACKUP_DIR : null,
    reportPath: REPORT_PATH,
  };

  if (APPLY) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `page-${PAGE_ID}-${PAGE_SLUG}.json`), JSON.stringify(page, null, 2), "utf8");
    for (const item of optionValues) {
      writeFileSync(path.join(BACKUP_DIR, `option-${item.name}.json`), JSON.stringify({ name: item.name, value: item.value }, null, 2), "utf8");
    }
    if (patchedPage.changes.length) {
      await requestJson("POST", `/wp/v2/pages/${PAGE_ID}`, auth, { content: patchedPage.html });
    }
    for (const [index, item] of patchedOptions.entries()) {
      if (item.patched.changes.length) {
        const update = await optionUpdate(auth, sessionId, item.name, item.patched.html, 30 + index);
        report.changes.options[index].updateStatus = update.data?.error ? "error" : "ok";
        if (update.data?.error) report.changes.options[index].updateError = update.data.error;
      }
    }
    const live = await liveGet(`${PAGE_PATH}?nowprocket=1&codex=eeat-map-${Date.now()}`);
    report.live = {
      status: live.status,
      h1Count: (live.html.match(/<h1\b/gi) ?? []).length,
      metaDescriptionLength: live.html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)?.[1]?.length ?? 0,
      ...inspect(live.html),
    };
    appendFileSync(
      CSV_PATH,
      `\n${today},${time},FIX-TTC-HA-LONG-EEAT-LINKS-MAP-${today},seo_fix,thong tac cong ha long,${BASE_URL}${PAGE_PATH},${PAGE_SLUG},done,low,,,,,Them internal link Bai Chay/Hong Gai/HBP Ha Long + external So Xay dung Quang Ninh + map embed trong bai + author bio cuoi bai; khong dung H1 co tu cam,tools/fix_ttc_ha_long_eeat_links_map_2026_06_27.mjs,,Khong doi title/H1 sang ban co chuyen nghiep/uy tin vi bi cam,Live verify status ${report.live.status}; H1 ${report.live.h1Count}; forbidden ${report.live.forbidden.length},NOT_REQUIRED,Codex,${today},,,,`,
      "utf8",
    );
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  const ok = report.after.page.hasBaiChay && report.after.page.hasHongGai && report.after.page.hasSxd && report.after.page.hasMapEmbed && !report.after.page.forbidden.length;
  if (!ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
