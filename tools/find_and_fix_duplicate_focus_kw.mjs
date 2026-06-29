import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const BASE_URL = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function wpPost(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "rm-meta/1.0"
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: response.statusCode || (response.ok ? 200 : 500), data: parsed };
}

async function checkAndFix() {
  console.log("Fetching posts and pages...");
  
  // Fetch posts
  const postsRes = await fetch(`${BASE_URL}/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,title,status`);
  const posts = await postsRes.json();
  
  // Fetch pages
  const pagesRes = await fetch(`${BASE_URL}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,status`);
  const pages = await pagesRes.json();
  
  const allItems = [...posts, ...pages];
  const queryKeyword = "thông tắc cống Quảng Ninh".toLowerCase();
  
  console.log(`Checking ${allItems.length} items for duplicate focus keyword...`);
  
  let fixedCount = 0;
  for (const item of allItems) {
    if (item.id === 35) continue; // Skip the main page 35
    if (item.status !== "publish" && item.status !== "draft") continue;
    
    try {
      const seoRes = await fetch(`${BASE_URL}/wp-json/rankmath/v1/getObjectSeo?objectType=post&objectID=${item.id}`, {
        headers: { Authorization: AUTH }
      });
      if (seoRes.ok) {
        const seoData = await seoRes.json();
        const focusKw = seoData?.data?.rank_math_focus_keyword ?? "";
        if (focusKw.toLowerCase().includes(queryKeyword)) {
          console.log(`[DUPLICATE FOUND] ID ${item.id} (${item.slug}) has focus keyword: "${focusKw}". Clearing it...`);
          
          // Clear rank_math_focus_keyword
          const fixRes = await wpPost("/wp-json/rankmath/v1/updateMeta", {
            objectType: "post",
            objectID: item.id,
            meta: {
              rank_math_focus_keyword: ""
            }
          });
          
          if (fixRes.status === 200) {
            console.log(`  → Successfully cleared focus keyword for ID ${item.id}`);
            fixedCount++;
          } else {
            console.log(`  → Failed to clear: ${JSON.stringify(fixRes.data)}`);
          }
        }
      }
    } catch (e) {
      console.error(`Error checking/fixing ID ${item.id}:`, e.message);
    }
  }
  
  console.log(`Scan and fix complete. Cleared duplicates on ${fixedCount} page(s).`);
  
  // Log results to progress CSV if needed
  if (fixedCount > 0) {
    const now = new Date();
    appendFileSync(
      "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv",
      `\n${now.toISOString().slice(0, 10)},${now.toTimeString().slice(0, 5)},FIX-RANKMATH-DUP-KW-2026-06-25,seo_fix,Clear duplicate Rank Math focus keyword to release exclusivity for page 35,https://thongtaccongquangninh.com/,,done,medium,,,,,Cleared duplicate focus keyword on ${fixedCount} pages,tools/find_and_fix_duplicate_focus_kw.mjs,,Refresh page 35 Rank Math analyzer in WP Admin,,,,,,,`,
      "utf8"
    );
  }
}

checkAndFix().catch(console.error);
