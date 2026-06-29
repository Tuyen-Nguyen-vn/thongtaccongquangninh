import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";

const args = new Set(process.argv.slice(2));
const short = args.has("--short");
const NODE = process.execPath;
const VERIFY_SCRIPT = join(ROOT, "tools", "verify_footer_live.mjs");
const REPORT_SCRIPT = join(ROOT, "tools", "show_latest_footer_back_top_report.mjs");

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error("Khong tim thay JSON trong output");
  }
  return JSON.parse(text.slice(start, end + 1));
}

function runNodeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(NODE, [scriptPath], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${scriptPath} thất bại: code=${code ?? "null"} signal=${signal ?? "null"} stderr=${stderr.trim()}`));
    });
  });
}

if (!short) {
  console.log("[footer-postcheck] Bat dau verify + report");
}

const verifyRun = await runNodeScript(VERIFY_SCRIPT);
const verify = extractJson(verifyRun.stdout);
const service390 = verify.results?.find((item) => item.name === "service-390");

const reportRun = await runNodeScript(REPORT_SCRIPT);
const report = extractJson(reportRun.stdout);

const verifyHealthy = verify.passed === verify.total;
const reportHealthy =
  report.success === true &&
  report.public?.serviceStatus === 200 &&
  report.public?.homeStatus === 200;
const backTopHealthy =
  service390?.metrics?.interactions?.backTopWorked === true &&
  service390?.metrics?.interactions?.afterScrollY === 0;
const healthy = verifyHealthy && reportHealthy && backTopHealthy;

const summary = {
  overall: {
    healthy,
    status: healthy ? "ok" : "needs_review",
    summary: healthy
      ? "Footer live dang on: verify 7/7, report success, back-top mobile ok"
      : "Footer live can xem lai: co it nhat 1 dieu kien quan trong khong dat",
  },
  verify: {
    passed: verify.passed,
    total: verify.total,
    outputDir: verify.outputDir,
    service390: service390 ? {
      ok: service390.ok,
      backTopWorked: service390.metrics?.interactions?.backTopWorked ?? null,
      afterScrollY: service390.metrics?.interactions?.afterScrollY ?? null,
    } : null,
  },
  report: {
    reportPath: report.reportPath,
    generatedAt: report.generatedAt,
    success: report.success,
    purgeStatus: report.purge?.status ?? null,
    purgeKnownWarning: report.purge?.knownWarning ?? null,
    strictMatches: report.matches?.strictMatches ?? null,
    serviceStatus: report.public?.serviceStatus ?? null,
    homeStatus: report.public?.homeStatus ?? null,
  },
};

if (short) {
  console.log([
    "FOOTER_STATUS",
    `status=${summary.overall.status}`,
    `healthy=${summary.overall.healthy}`,
    `verify=${summary.verify.passed}/${summary.verify.total}`,
    `backTop=${summary.verify.service390?.backTopWorked ?? "null"}`,
    `afterScrollY=${summary.verify.service390?.afterScrollY ?? "null"}`,
    `reportSuccess=${summary.report.success}`,
    `purge=${summary.report.purgeStatus}`,
    `strict=${summary.report.strictMatches}`,
    `service=${summary.report.serviceStatus}`,
    `home=${summary.report.homeStatus}`,
  ].join(" "));
} else {
  console.log(JSON.stringify(summary, null, 2));
}

if (!short) {
  console.log("[footer-postcheck] Hoan tat verify + report");
}

if (!healthy) {
  process.exitCode = 1;
}
