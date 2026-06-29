import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = "https://thongtaccongquangninh.com";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = join(ROOT, "seo-revisions", `wp-before-slug-normalize-${STAMP}`);
const REPORT_JSON = join(ROOT, "reports", `slug-normalize-${STAMP}.json`);
const REPORT_MD = join(ROOT, "reports", `slug-normalize-${STAMP}.md`);

const TARGETS = [
  ["bon-cau-rut-cham-nguyen-nhan", "bon-cau-rut-cham-nguyen-nhan-3"],
  ["chi-phi-hut-be-phot-quang-ninh", "chi-phi-hut-be-phot-quang-ninh-2"],
  ["chu-ky-hut-be-phot", "chu-ky-hut-be-phot-3"],
  ["hoa-chat-tu-thong-cong", "hoa-chat-tu-thong-cong-3"],
  ["mui-hoi-cong-nguyen-nhan-xu-ly", "mui-hoi-cong-nguyen-nhan-xu-ly-4"],
  ["hut-be-phot-ba-che", "hut-be-phot-ba-che-2"],
  ["hut-be-phot-binh-lieu", "hut-be-phot-binh-lieu-2"],
  ["hut-be-phot-co-to", "hut-be-phot-co-to-2"],
  ["hut-be-phot-dam-ha", "hut-be-phot-dam-ha-2"],
  ["hut-be-phot-hai-ha", "hut-be-phot-hai-ha-2"],
  ["hut-be-phot-tien-yen", "hut-be-phot-tien-yen-2"],
  ["thong-tac-cong-hong-gai", "thong-tac-cong-hong-gai-2"],
];

function parseEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}

function safeFilePart(input) {
  return String(input).replace(/[^a-zA-Z0-9_.-]+/g, "-");
}

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const DRY_RUN = !APPLY;

const env = parseEnv(join(ROOT, ".env"));
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex slug normalizer",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw text payload.
  }
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || text : text;
    throw new Error(`WP ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function findBySlug(slug) {
  const rows = [];
  for (const collection of ["posts", "pages"]) {
    const found = await wp(
      `/wp/v2/${collection}?slug=${encodeURIComponent(slug)}&status=publish,draft,pending,private,future&context=edit&per_page=100`
    );
    for (const item of found) {
      rows.push({
        collection,
        id: item.id,
        slug: item.slug,
        status: item.status,
        title: stripHtml(item.title?.raw || item.title?.rendered || ""),
        link: item.link,
        modified: item.modified,
        raw: item,
      });
    }
  }
  return rows;
}

async function fetchItem(collection, id) {
  return wp(`/wp/v2/${collection}/${id}?context=edit`);
}

async function updateSlug(item, nextSlug) {
  return wp(`/wp/v2/${item.collection}/${item.id}`, {
    method: "POST",
    body: JSON.stringify({ slug: nextSlug }),
  });
}

function backupItem(item, full) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const file = join(BACKUP_DIR, `${item.collection}-${item.id}-${safeFilePart(item.slug || "no-slug")}.json`);
  writeFileSync(file, JSON.stringify(full, null, 2), "utf8");
  return file;
}

async function head(url) {
  const response = await fetch(url, {
    method: "HEAD",
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "Codex slug normalizer verify" },
  });
  return {
    status: response.status,
    location: response.headers.get("location") || "",
  };
}

async function getHtml(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    headers: { "User-Agent": "Codex slug normalizer verify" },
  });
  const html = await response.text();
  const title = stripHtml((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const h1 = stripHtml((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "");
  const canonical = ((html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || "").trim();
  const robots = ((html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) || [])[1] || "").trim();
  return { status: response.status, finalUrl: response.url, title, h1, canonical, robots };
}

async function main() {
  mkdirSync(join(ROOT, "reports"), { recursive: true });

  const results = [];
  for (const [canonicalSlug, currentSlug] of TARGETS) {
    const canonicalItems = await findBySlug(canonicalSlug);
    const currentItems = await findBySlug(currentSlug);
    const live = currentItems.find((item) => item.status === "publish") ||
      canonicalItems.find((item) => item.status === "publish");

    const row = {
      canonicalSlug,
      currentSlug,
      live: live ? { collection: live.collection, id: live.id, slug: live.slug, status: live.status, title: live.title, link: live.link } : null,
      blockers: [],
      actions: [],
      verify: null,
      ok: false,
    };

    if (!live) {
      row.actions.push({ action: "skip", reason: "No published item found for current or canonical slug" });
      results.push(row);
      continue;
    }

    const related = [...canonicalItems, ...currentItems]
      .filter((item, index, all) => all.findIndex((x) => x.collection === item.collection && x.id === item.id) === index);

    for (const item of related) {
      if (item.collection === live.collection && item.id === live.id) continue;
      if (!["draft", "pending", "private", "future"].includes(item.status)) continue;
      const nextSlug = `draft-legacy-${item.id}-${item.slug || canonicalSlug}`;
      row.blockers.push({ collection: item.collection, id: item.id, from: item.slug, to: nextSlug, status: item.status, title: item.title });
      if (DRY_RUN) {
        row.actions.push({ action: "would_move_blocker", collection: item.collection, id: item.id, from: item.slug, to: nextSlug });
      } else {
        const before = await fetchItem(item.collection, item.id);
        const backupPath = backupItem(item, before);
        const updated = await updateSlug(item, nextSlug);
        row.actions.push({
          action: "moved_blocker",
          collection: item.collection,
          id: item.id,
          from: item.slug,
          to: updated.slug,
          backupPath,
        });
      }
    }

    if (live.slug === canonicalSlug) {
      row.actions.push({ action: "already_normalized", collection: live.collection, id: live.id, slug: live.slug });
    } else if (DRY_RUN) {
      row.actions.push({ action: "would_normalize_live", collection: live.collection, id: live.id, from: live.slug, to: canonicalSlug });
    } else {
      const before = await fetchItem(live.collection, live.id);
      const backupPath = backupItem(live, before);
      const updated = await updateSlug(live, canonicalSlug);
      row.actions.push({
        action: "normalized_live",
        collection: live.collection,
        id: live.id,
        from: live.slug,
        to: updated.slug,
        link: updated.link,
        backupPath,
      });
    }

    if (!DRY_RUN) {
      const normalizedUrl = `${baseUrl}/${canonicalSlug}/?nowprocket=1&codex=slug-normalize-${STAMP}`;
      const oldUrl = `${baseUrl}/${currentSlug}/?nowprocket=1&codex=slug-normalize-${STAMP}`;
      row.verify = {
        normalized: await getHtml(normalizedUrl),
        old: await head(oldUrl),
      };
      row.ok =
        row.verify.normalized.status === 200 &&
        row.verify.normalized.canonical.replace(/\/$/, "") === `${baseUrl}/${canonicalSlug}` &&
        !/noindex/i.test(row.verify.normalized.robots || "") &&
        [301, 302, 308, 404].includes(row.verify.old.status);
    } else {
      row.ok = true;
    }

    results.push(row);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    backupDir: APPLY ? BACKUP_DIR : null,
    total: results.length,
    ok: results.filter((row) => row.ok).length,
    failed: results.filter((row) => !row.ok).length,
  };
  const report = { summary, results };
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");

  const lines = [
    `# Slug normalize report - ${STAMP}`,
    "",
    `- Mode: ${summary.mode}`,
    `- Total: ${summary.total}`,
    `- OK: ${summary.ok}`,
    `- Failed: ${summary.failed}`,
    summary.backupDir ? `- Backup: \`${summary.backupDir}\`` : "- Backup: dry-run only",
    "",
    "| Canonical slug | Live ID | Actions | Verify |",
    "|---|---:|---|---|",
  ];
  for (const row of results) {
    const liveId = row.live ? `${row.live.collection}/${row.live.id}` : "";
    const actions = row.actions.map((action) => `${action.action}:${action.from || ""}->${action.to || action.reason || ""}`).join("<br>");
    const verify = row.verify
      ? `new ${row.verify.normalized.status}; old ${row.verify.old.status}; canonical ${row.verify.normalized.canonical}`
      : "dry-run";
    lines.push(`| \`${row.canonicalSlug}\` | ${liveId} | ${actions} | ${verify} |`);
  }
  writeFileSync(REPORT_MD, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ summary, reportJson: REPORT_JSON, reportMd: REPORT_MD }, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
