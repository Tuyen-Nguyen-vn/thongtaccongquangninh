import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "schema-verify/1.0", "Cache-Control": "no-cache" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout " + path)));
    req.end();
  });
}

function extractSchemas(html) {
  const scripts = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      scripts.push(parsed);
    } catch {}
  }
  return scripts;
}

const res = await fetchPage("/thong-tac-cong-quang-ninh/");
console.log("Status:", res.status);
const schemas = extractSchemas(res.html);
for (const schema of schemas) {
  if (schema["@type"] === "BreadcrumbList") {
    console.log("Direct BreadcrumbList:", JSON.stringify(schema, null, 2));
  }
  if (schema["@graph"]) {
    for (const node of schema["@graph"]) {
      if (node["@type"] === "BreadcrumbList") {
        console.log("Graph BreadcrumbList:", JSON.stringify(node, null, 2));
      }
    }
  }
}
