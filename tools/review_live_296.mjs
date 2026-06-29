import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PATH = "/thong-tac-cong-ha-long/?nowprocket=1&codex=review-request-" + Date.now();

const options = {
  hostname: SERVER_IP,
  port: 443,
  servername: WP_HOST,
  path: PATH,
  headers: {
    Host: WP_HOST,
    "User-Agent": "Codex SEO Review Agent",
    "Cache-Control": "no-cache",
  },
  rejectUnauthorized: false,
};

https.get(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("=== STATUS ===");
    console.log("HTTP Status:", res.statusCode);

    console.log("\n=== TITLE ===");
    const titleMatch = data.match(/<title>([\s\S]*?)<\/title>/i);
    console.log(titleMatch ? titleMatch[1].trim() : "NOT FOUND");

    console.log("\n=== META DESCRIPTION ===");
    const metaMatch = data.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i);
    console.log(metaMatch ? metaMatch[1].trim() : "NOT FOUND");

    console.log("\n=== H1 TAGS ===");
    const h1s = data.match(/<h1[\s>][\s\S]*?<\/h1>/gi) || [];
    h1s.forEach((h, i) => console.log(`${i + 1}:`, h.replace(/<[^>]+>/g, "").trim()));

    console.log("\n=== H2 TAGS ===");
    const h2s = data.match(/<h2[\s>][\s\S]*?<\/h2>/gi) || [];
    h2s.forEach((h, i) => console.log(`${i + 1}:`, h.replace(/<[^>]+>/g, "").trim()));

    console.log("\n=== FORBIDDEN WORDS ===");
    const forbidden = ["uy tín", "chuyên nghiệp", "hàng đầu", "tận tâm"];
    const bodyText = data.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
    forbidden.forEach((word) => {
      const regex = new RegExp(word, "gi");
      const count = (bodyText.match(regex) || []).length;
      console.log(`Word "${word}" count:`, count);
    });

    console.log("\n=== AUTHOR BYLINE ===");
    const authorMatches = data.match(/author\/nguyensonghao/gi) || [];
    console.log("Byline link occurrences:", authorMatches.length);
    const authorLineMatch = data.match(/Tác giả:[\s\S]*?<\/a>/i);
    console.log("Author line snippet:", authorLineMatch ? authorLineMatch[0] : "NOT FOUND");

    console.log("\n=== HOTLINE ===");
    const hotlines = ["0963.953.533", "0931.156.756"];
    hotlines.forEach((h) => {
      console.log(`Hotline "${h}" present:`, data.includes(h));
    });

    console.log("\n=== JSON-LD SCHEMAS ===");
    const schemas = data.match(/<script\s+type="application\/ld\+json"[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
    console.log("Total JSON-LD schemas found:", schemas.length);
    schemas.forEach((s, i) => {
      if (s.includes("FAQPage") || s.includes("Person") || s.includes("LocalBusiness")) {
        console.log(`Schema ${i + 1} matches target type:`, s.slice(0, 150) + "...");
      }
    });
  });
}).on("error", (err) => console.error("Error fetching page:", err));
