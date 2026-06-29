import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const steps = [
  {
    script: "deploy:footer-backtop-live",
    description: "Backup-first deploy footer interaction live",
  },
  {
    script: "verify:footer-live",
    description: "Verify public footer interaction on 7 scenarios",
  },
];

function runNpmScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCmd, ["run", script], {
      cwd: ROOT,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`npm run ${script} thất bại: code=${code ?? "null"} signal=${signal ?? "null"}`));
    });
  });
}

if (dryRun) {
  console.log(JSON.stringify({
    root: ROOT,
    dryRun: true,
    steps: steps.map((step) => ({
      script: step.script,
      description: step.description,
      command: `${npmCmd} run ${step.script}`,
    })),
  }, null, 2));
  process.exit(0);
}

console.log("[footer-release] Bắt đầu deploy + verify footer back-top live");

for (const step of steps) {
  console.log(`[footer-release] ${step.description}`);
  await runNpmScript(step.script);
}

console.log("[footer-release] Hoàn tất deploy + verify footer back-top live");
