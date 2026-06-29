import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";

const reportsDir = join(ROOT, "reports");
const reportNames = readdirSync(reportsDir)
  .filter((name) => /^footer-back-top-live-.*\.json$/.test(name))
  .sort();

if (!reportNames.length) {
  console.error("Khong tim thay footer back-top report nao trong reports/");
  process.exit(1);
}

const latestName = reportNames.at(-1);
const reportPath = join(reportsDir, latestName);
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const strictMatches = Array.isArray(report.writes)
  ? report.writes.filter((item) => item.strictMatch).length
  : 0;
const totalWrites = Array.isArray(report.writes) ? report.writes.length : 0;

console.log(JSON.stringify({
  reportPath,
  generatedAt: report.generatedAt,
  timezone: report.timezone ?? null,
  success: report.success === true,
  purge: {
    ok: report.purge?.ok ?? null,
    status: report.purge?.classification?.status ?? report.purge?.status ?? null,
    knownWarning: report.purge?.classification?.knownWarning ?? report.purge?.knownWarning ?? null,
    summary: report.purge?.classification?.summary ?? report.purge?.summary ?? null,
  },
  public: {
    serviceStatus: report.public?.servicePage?.status ?? null,
    serviceHasFooterButton: report.public?.servicePage?.hasFooterButton ?? null,
    homeStatus: report.public?.homePage?.status ?? null,
    homeHasFooterButton: report.public?.homePage?.hasFooterButton ?? null,
  },
  matches: {
    remoteMatches: Array.isArray(report.writes) ? report.writes.every((item) => item.remoteMatches) : null,
    strictMatches: `${strictMatches}/${totalWrites}`,
  },
}, null, 2));
