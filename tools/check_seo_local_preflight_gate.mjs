import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const CHECKLIST_PATH = join(PROJECT, "seo-checklists", "seo-local-preflight-checklist.json");
const SKILL_PATH = join(PROJECT, "skills", "seo-local-audit-strict", "SKILL.md");
const DEFAULT_TASK_TYPE = "audit_only";

function usage() {
  return [
    "Usage:",
    "  node tools/check_seo_local_preflight_gate.mjs <evidence.json>",
    "",
    "Evidence JSON shape:",
    "{",
    '  "task_type": "local_seo_article",',
    '  "read_project_context": true,',
    '  "read_skill": true,',
    '  "...": true',
    "}",
  ].join("\n");
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/u, ""));
}

function isTruthyEvidence(value) {
  if (value === true) return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

function itemApplies(item, taskTypes) {
  if (item.required === true) return true;
  if (!Array.isArray(item.required_for)) return false;
  return item.required_for.some((type) => taskTypes.includes(type));
}

function main() {
  const evidenceArg = process.argv[2];
  if (!evidenceArg) {
    console.error(usage());
    process.exit(2);
  }

  if (!existsSync(CHECKLIST_PATH)) {
    console.error(`BLOCKED: Missing checklist ${CHECKLIST_PATH}`);
    process.exit(1);
  }
  if (!existsSync(SKILL_PATH)) {
    console.error(`BLOCKED: Missing skill ${SKILL_PATH}`);
    process.exit(1);
  }

  const evidencePath = resolve(process.cwd(), evidenceArg);
  if (!existsSync(evidencePath)) {
    console.error(`BLOCKED: Missing evidence file ${evidencePath}`);
    process.exit(1);
  }

  const checklist = loadJson(CHECKLIST_PATH);
  const evidence = loadJson(evidencePath);
  const taskTypes = Array.isArray(evidence.task_types)
    ? evidence.task_types
    : [evidence.task_type || DEFAULT_TASK_TYPE];

  const missing = [];
  const passed = [];

  for (const item of checklist.items ?? []) {
    if (!itemApplies(item, taskTypes)) continue;
    const key = item.evidence_key || item.id;
    if (isTruthyEvidence(evidence[key])) {
      passed.push(item.id);
    } else {
      missing.push({
        id: item.id,
        evidence_key: key,
        description: item.description,
      });
    }
  }

  const result = {
    ok: missing.length === 0,
    taskTypes,
    evidencePath,
    checklistPath: CHECKLIST_PATH,
    skillPath: SKILL_PATH,
    passed,
    missing,
  };

  console.log(JSON.stringify(result, null, 2));

  if (missing.length) {
    console.error(
      `SEO_LOCAL_PREFLIGHT_WARNING: thiếu ${missing.length} mục checklist khuyến nghị. Theo yêu cầu Tuyền, gate này không còn chặn publish/sửa live.`
    );
  }
}

main();
