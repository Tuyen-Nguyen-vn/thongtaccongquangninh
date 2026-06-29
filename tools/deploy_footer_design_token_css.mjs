import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const DAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
const LOCAL_CSS = join(
  ROOT,
  "tools",
  "wp-plugins",
  "ttcqn-home-emergency-renderer",
  "assets",
  "ttcqn-shared-footer.css",
);
const REMOTE_CSS =
  "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/assets/ttcqn-shared-footer.css";
const BACKUP_DIR = join(ROOT, "backups", `footer-design-token-live-${STAMP}`);
const REPORT_PATH = join(ROOT, "reports", `footer-design-token-live-${STAMP}.json`);
const CSV_PATH = join(ROOT, "docs", "SEO_PROGRESS.csv");
const HOST_RUNNER = join(ROOT, "tools", "_host.mjs");

function hostTool(tool, args) {
  const child = spawnSync(process.execPath, [HOST_RUNNER, tool, JSON.stringify(args)], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const output = `${child.stdout || ""}${child.stderr || ""}`;
  if (child.status !== 0) {
    throw new Error(`${tool} failed with exit ${child.status}: ${output.slice(0, 1000)}`);
  }
  if (/^ERR:/m.test(output)) {
    throw new Error(`${tool} returned error: ${output.slice(0, 1000)}`);
  }
  return output;
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
        headers: { Host: HOST, "User-Agent": "Codex footer token verify" },
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

function assertLocalCss(css) {
  const required = [
    "--footer-bg:var(--ttcqn-color-dark-2);",
    "--footer-green:var(--ttcqn-color-primary-bright);",
    "--footer-green-2:var(--ttcqn-color-primary);",
    "--footer-text:var(--ttcqn-color-on-dark);",
    "--footer-muted:var(--ttcqn-color-on-dark-muted);",
  ];
  const missing = required.filter((item) => !css.includes(item));
  if (missing.length) {
    throw new Error(`Local CSS missing required token refs: ${missing.join(", ")}`);
  }
}

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(dirname(REPORT_PATH), { recursive: true });

const localCss = readFileSync(LOCAL_CSS, "utf8");
assertLocalCss(localCss);

const before = hostTool("read_file", { path: REMOTE_CSS });
const backupPath = join(BACKUP_DIR, "ttcqn-shared-footer.remote.css");
writeFileSync(backupPath, before, "utf8");

const writeText = hostTool("write_file", { path: REMOTE_CSS, content: localCss });
const after = hostTool("read_file", { path: REMOTE_CSS });
const remoteMatches = after.trim() === localCss.trim();

const purgeText = hostTool("purge_wordpress_cache", { domain: HOST });
const marker = `footer-design-token-${Date.now()}`;
const publicHome = await fetchPublic(`/?nowprocket=1&codex=${marker}`);
const publicCss = await fetchPublic(
  `/wp-content/plugins/ttcqn-home-emergency-renderer/assets/ttcqn-shared-footer.css?codex=${marker}`,
);

const publicCssOk =
  publicCss.status === 200 &&
  publicCss.text.includes("--footer-bg:var(--ttcqn-color-dark-2);") &&
  publicCss.text.includes("--footer-text:var(--ttcqn-color-on-dark);");

const report = {
  generatedAt: new Date().toISOString(),
  localCss: LOCAL_CSS,
  remoteCss: REMOTE_CSS,
  backupPath,
  writeText: writeText.slice(0, 1000),
  purgeText: purgeText.slice(0, 1000),
  remoteMatches,
  publicHome: {
    status: publicHome.status,
    hasFooter: publicHome.text.includes("home-footer"),
    hasCriticalError: /critical error|fatal error/i.test(publicHome.text),
  },
  publicCss: {
    status: publicCss.status,
    ok: publicCssOk,
    length: publicCss.text.length,
  },
};
report.success =
  remoteMatches &&
  publicHome.status === 200 &&
  report.publicHome.hasFooter &&
  !report.publicHome.hasCriticalError &&
  publicCssOk;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const status = report.success ? "done" : "needs_review";
const filesChanged = [
  relative(ROOT, LOCAL_CSS),
  relative(ROOT, backupPath),
  relative(ROOT, REPORT_PATH),
  "docs/SEO_PROGRESS.csv",
].join(" ");
const csvLine = [
  DAY,
  TIME,
  "FOOTER-DESIGN-TOKEN-LIVE-2026-06-27",
  "ui_design",
  "footer design token live",
  `https://${HOST}/`,
  "footer-design-token-live",
  status,
  "medium",
  "",
  "",
  "",
  "",
  "Backup remote shared footer CSS; write token-synced CSS; purge cache; verify public home and CSS",
  filesChanged,
  "No full plugin zip overwrite; only shared footer CSS file written via hosting MCP",
  "Keep local zip backup for rollback; deploy full renderer only if later PHP/template changes require it",
  `report=${relative(ROOT, REPORT_PATH)}; publicHome=${publicHome.status}; publicCss=${publicCss.status}; remoteMatches=${remoteMatches}; publicCssOk=${publicCssOk}`,
  report.success ? "PASS" : "NEEDS_REVIEW",
  "Codex",
  DAY,
  relative(ROOT, REPORT_PATH),
  relative(ROOT, REPORT_PATH),
  "",
  "",
].map((value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}).join(",");
writeFileSync(CSV_PATH, `${readFileSync(CSV_PATH, "utf8").replace(/\s*$/, "")}\n${csvLine}\n`, "utf8");

console.log(JSON.stringify({
  success: report.success,
  backupPath,
  reportPath: REPORT_PATH,
  remoteMatches,
  publicHome: report.publicHome,
  publicCss: report.publicCss,
}, null, 2));

if (!report.success) process.exitCode = 1;
