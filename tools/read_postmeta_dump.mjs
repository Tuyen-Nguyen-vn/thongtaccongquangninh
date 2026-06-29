import https from "node:https";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

const r = await new Promise((resolve, reject) => {
  const opts = {
    hostname: SERVER_IP, port: 443, servername: WP_HOST,
    path: "/postmeta_dump.txt", method: "GET",
    headers: { Host: WP_HOST }, rejectUnauthorized: false,
  };
  const req = https.request(opts, (res) => {
    let d = ""; res.on("data", c => d += c);
    res.on("end", () => resolve({ status: res.statusCode, body: d }));
  });
  req.on("error", reject);
  req.setTimeout(10000, () => req.destroy(new Error("timeout")));
  req.end();
});
console.log(`Status: ${r.status}\n${r.body}`);
