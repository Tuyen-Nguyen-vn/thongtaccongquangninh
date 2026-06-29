import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

const PATHS = [
  "/dau-hieu-be-phot-bi-day-2026/",
  "/hut-be-phot-quang-ninh/",
  "/thong-tac-cong-chung-cu-ha-long/",
  "/thong-tac-cong-quang-ninh/",
];

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

for (const path of PATHS) {
  const html = await fetchPage(path);
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
         || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const desc = m?.[1] ?? "(không tìm thấy)";
  console.log(`${path}: [${[...desc].length}] ${desc}`);
}
