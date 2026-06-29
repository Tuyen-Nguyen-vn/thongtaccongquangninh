import https from "node:https";
const SERVER_IP = "103.57.220.210", WP_HOST = "thongtaccongquangninh.com";

function head(path) {
  return new Promise((res) => {
    const o = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "Mozilla/5.0" }, rejectUnauthorized: false };
    const r = https.request(o, resp => {
      let d = "";
      resp.on("data", c => d += c.toString().slice(0, 0)); // discard body
      resp.on("end", () => res({ status: resp.statusCode, location: resp.headers.location || "" }));
    });
    r.on("error", e => res({ status: "ERR", location: e.message }));
    r.setTimeout(15000, () => { r.destroy(); res({ status: "TIMEOUT", location: "" }); });
    r.end();
  });
}

const urls = [
  "/thong-tac-cong-cao-xanh/",
  "/thong-tac-cong-bai-chay/",
  "/thong-tac-cong-tuan-chau/",
  "/thong-tac-cong-gieng-day/",
];
for (const u of urls) {
  const r = await head(u);
  console.log(`${u} -> ${r.status}${r.location ? " => " + r.location : ""}`);
}
