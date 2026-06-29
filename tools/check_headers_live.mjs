import https from "node:https";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

function fetchHeaders(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "Cache-Control": "no-cache", Pragma: "no-cache" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

const r = await fetchHeaders("/thong-tac-cong-quang-ninh/");
console.log("Status:", r.status);
const cacheHeaders = ["x-cache", "x-wp-cache-status", "x-rocket-cache-status", "x-varnish", "cf-cache-status", "age", "cache-control", "x-nginx-cache"];
for (const h of cacheHeaders) {
  if (r.headers[h]) console.log(`${h}: ${r.headers[h]}`);
}

const m = r.body.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
console.log("Meta desc live:", m?.[1] ? `[${[...m[1]].length}] ${m[1]}` : "(not found)");
