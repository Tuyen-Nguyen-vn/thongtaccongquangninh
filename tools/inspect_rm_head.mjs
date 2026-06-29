import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

const html = await new Promise((resolve, reject) => {
  const opts = {
    hostname: SERVER_IP, port: 443, servername: WP_HOST,
    path: "/thong-tac-cong-quang-ninh/", method: "GET",
    headers: { Host: WP_HOST }, rejectUnauthorized: false,
  };
  const req = https.request(opts, (res) => {
    let d = ""; res.on("data", c => d += c);
    res.on("end", () => resolve(d));
  });
  req.on("error", reject);
  req.setTimeout(15000, () => req.destroy(new Error("timeout")));
  req.end();
});

// Find Rank Math section
const rmStart = html.indexOf("Rank Math");
if (rmStart > -1) {
  console.log("=== Rank Math area ===");
  console.log(html.slice(Math.max(0, rmStart - 100), rmStart + 3000));
} else {
  // Show <head> meta section
  const headEnd = html.indexOf("</head>");
  const metaSection = html.slice(0, headEnd > -1 ? Math.min(headEnd, 5000) : 5000);
  // Only show description-related lines
  const lines = metaSection.split("\n").filter(l =>
    l.includes("description") || l.includes("Rank") || l.includes("og:") || l.includes("twitter:")
  );
  console.log(lines.join("\n"));
}
