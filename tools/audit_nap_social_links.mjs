import { writeFileSync } from "node:fs";

const BASE = "https://thongtaccongquangninh.com";
const PAGES = [
  "/",
  "/hut-be-phot-quang-ninh/",
  "/thong-tac-cong-quang-ninh/",
  "/lien-he/",
  "/gioi-thieu/",
  "/bang-gia/",
];

const SOCIAL_EXPECTED = {
  youtube: "https://www.youtube.com/@moitruongdothiso1quangninh",
  facebook: "https://www.facebook.com/thongtacconghalong24h",
  tiktok: "https://www.tiktok.com/@thongtaccongquangninh",
  zalo: "https://zalo.me/0931156756",
};

const OLD_MARKERS = [
  "0981.306.307",
  "Môi Trường Đông Bắc",
  "youtube.com/@hutbephothalong14",
  "youtube.com/@moitruongdongbac",
  "111 Cái Lân",
  "facebook.com/moitruongdothiso1quangninh",
];

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim());
  const parsed = [];
  for (const block of blocks) {
    try {
      parsed.push(JSON.parse(block));
    } catch {
      parsed.push({ parseError: true, rawStart: block.slice(0, 200) });
    }
  }
  return parsed;
}

function flattenGraph(jsonLd) {
  const nodes = [];
  for (const item of jsonLd) {
    if (Array.isArray(item)) {
      nodes.push(...item);
    } else if (Array.isArray(item?.["@graph"])) {
      nodes.push(...item["@graph"]);
    } else if (item) {
      nodes.push(item);
    }
  }
  return nodes;
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "Codex NAP social link audit" },
    });
    return { url, status: response.status, finalUrl: response.url, ok: response.status < 400 };
  } catch (error) {
    return { url, ok: false, error: String(error?.message || error) };
  }
}

const pages = [];
for (const path of PAGES) {
  const url = `${BASE}${path}?nowprocket=1&codex=nap-social-audit-${Date.now()}`;
  const response = await fetch(url, { headers: { "user-agent": "Codex NAP social audit" } });
  const html = await response.text();
  const hrefs = extractHrefs(html);
  const external = [...new Set(hrefs.filter((href) => /^https?:\/\//.test(href) && !href.includes("thongtaccongquangninh.com")))];
  const jsonLd = extractJsonLd(html);
  const graph = flattenGraph(jsonLd);
  const localBusiness = graph.filter((node) => {
    const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
    return types.includes("LocalBusiness") || types.includes("Organization");
  });
  pages.push({
    path,
    status: response.status,
    title: stripTags((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ""),
    h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => stripTags(match[1])),
    phones: {
      hotline0963: (html.match(/0963\.953\.533/g) || []).length,
      hotline0931: (html.match(/0931\.156\.756/g) || []).length,
      tel0963: (html.match(/tel:0963953533/g) || []).length,
      tel0931: (html.match(/tel:0931156756/g) || []).length,
    },
    oldMarkers: OLD_MARKERS.filter((marker) => html.includes(marker)),
    expectedSocialPresent: Object.fromEntries(
      Object.entries(SOCIAL_EXPECTED).map(([key, value]) => [key, html.includes(value)])
    ),
    external,
    jsonLdCount: jsonLd.length,
    localBusiness: localBusiness.map((node) => ({
      type: node["@type"],
      name: node.name,
      url: node.url,
      telephone: node.telephone,
      sameAs: node.sameAs,
      address: node.address,
    })),
  });
}

const socialChecks = [];
for (const url of Object.values(SOCIAL_EXPECTED)) {
  socialChecks.push(await checkUrl(url));
}

for (const videoId of ["DmiPD6WM9Jg", "pXSJIOhrO3Q", "IlNPZHmrYss"]) {
  const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json&cb=${Date.now()}`);
  const payload = await response.json();
  socialChecks.push({
    url: `https://www.youtube.com/watch?v=${videoId}`,
    status: response.status,
    ok: response.status < 400,
    title: payload.title,
    author_name: payload.author_name,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  expectedNap: {
    name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
    phone: ["0963.953.533", "0931.156.756"],
    locality: "Hạ Long",
    region: "Quảng Ninh",
    streetAddress: "Gần Nhà Văn hóa, khu 3, Hà Lầm",
    postalCode: "01111",
  },
  expectedSocial: SOCIAL_EXPECTED,
  pages,
  socialChecks,
};

writeFileSync("reports/nap-social-audit-2026-05-31.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
