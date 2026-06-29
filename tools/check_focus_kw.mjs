import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const BASE_URL = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function checkKws() {
  console.log("Fetching posts and pages to check focus keywords...");
  
  // Fetch posts
  const postsRes = await fetch(`${BASE_URL}/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,title,status`);
  const posts = await postsRes.json();
  
  // Fetch pages
  const pagesRes = await fetch(`${BASE_URL}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,status`);
  const pages = await pagesRes.json();
  
  const allItems = [...posts, ...pages];
  console.log(`Found ${allItems.length} items to check.`);
  
  const queryKeyword = "thông tắc cống Quảng Ninh".toLowerCase();
  
  for (const item of allItems) {
    if (item.status !== "publish") continue;
    try {
      const seoRes = await fetch(`${BASE_URL}/wp-json/rankmath/v1/getObjectSeo?objectType=post&objectID=${item.id}`, {
        headers: { Authorization: AUTH }
      });
      if (seoRes.ok) {
        const seoData = await seoRes.json();
        const focusKw = seoData?.data?.rank_math_focus_keyword ?? "";
        if (focusKw.toLowerCase().includes(queryKeyword)) {
          console.log(`MATCH: [ID ${item.id}] Slug: "${item.slug}" | Status: ${item.status} | Title: "${item.title?.rendered}" | Focus Keyword: "${focusKw}"`);
        }
      }
    } catch (e) {
      console.error(`Error checking ID ${item.id}:`, e.message);
    }
  }
  console.log("Done checking focus keywords.");
}

checkKws().catch(console.error);
