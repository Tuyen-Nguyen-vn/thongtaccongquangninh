import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { env as shellEnv, platform } from "node:process";

const PROJECT_ROOT = "D:\\.thongtaccongquangninh";
const ENV_PATH = `${PROJECT_ROOT}\\.env`;

function readEnvFile(filePath) {
  try {
    const env = {};
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
    return env;
  } catch { return {}; }
}

const fileEnv = readEnvFile(ENV_PATH);
const WP_BASE_URL = fileEnv.WP_BASE_URL || "https://thongtaccongquangninh.com";
const GA4_MEASUREMENT_ID = fileEnv.GA4_MEASUREMENT_ID;

if (!GA4_MEASUREMENT_ID) {
  console.error("LỖI: Thiếu GA4_MEASUREMENT_ID trong .env. Vui lòng chạy xác thực trước hoặc điền thủ công.");
  process.exit(1);
}

const PLUGIN_SLUG = "ttcqn-google-analytics-tag";
const PLUGIN_DIR = `${PROJECT_ROOT}\\tools\\wp-plugins\\${PLUGIN_SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${PLUGIN_SLUG}.php`;
const ZIP_PATH = `${PROJECT_ROOT}\\tools\\wp-plugins\\${PLUGIN_SLUG}.zip`;

// 1. Tạo thư mục plugin và file PHP
if (!existsSync(PLUGIN_DIR)) {
  mkdirSync(PLUGIN_DIR, { recursive: true });
}

const phpContent = `<?php
/*
Plugin Name: TTCQN Google Analytics Tag
Description: Adds the Google Analytics 4 tracking tag (gtag.js) to every frontend page. Uses WP Option 'ttcqn_ga4_measurement_id'.
Version: 1.0.0
Author: Codex
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

add_action( 'wp_head', 'ttcqn_add_ga4_tag', 1 );
function ttcqn_add_ga4_tag() {
    $measurement_id = get_option( 'ttcqn_ga4_measurement_id' );
    
    if ( ! $measurement_id ) {
        return;
    }
    
    if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        echo "<!-- GA4 Tracking omitted for Admin -->\\n";
        return;
    }
    
    ?>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $measurement_id ); ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '<?php echo esc_js( $measurement_id ); ?>');
    </script>
    <?php
}
`;

writeFileSync(PLUGIN_FILE, phpContent, "utf8");
console.log(`Đã tạo file plugin PHP tại: ${PLUGIN_FILE}`);

// 2. Nén plugin thành file zip bằng Python để đảm bảo phân tách đường dẫn bằng '/' (tương thích Linux host)
console.log("Đang nén plugin thành file zip...");
try {
  if (existsSync(ZIP_PATH)) {
    execSync(`powershell -Command "if (Test-Path '${ZIP_PATH}') { Remove-Item '${ZIP_PATH}' -Force }"`);
  }
  const pythonCmd = `python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${PLUGIN_SLUG}/${PLUGIN_SLUG}.php'); zf.close()"`;
  execSync(pythonCmd);
  console.log(`Đã tạo file zip thành công tại: ${ZIP_PATH}`);
} catch (e) {
  console.error("Lỗi khi nén file zip:", e.message);
  process.exit(1);
}

// 3. Thực hiện upload và activate plugin qua WP MCP Ultimate
const auth = `Basic ${Buffer.from(`${fileEnv.WP_USERNAME}:${fileEnv.WP_APP_PASSWORD}`).toString("base64")}`;
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;

async function rpc(method, params, id, sessionId) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(`${endpoint}`, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const text = await res.text();
  let payload; try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  return { status: res.status, sessionId: res.headers.get("mcp-session-id"), payload };
}

async function callAbility(sessionId, abilityName, parameters, id) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: abilityName, parameters } }, id, sessionId);
}

(async () => {
  console.log("Đang kết nối tới WordPress live...");
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex-ga4-deploy", version: "1" } }, 1);
  if (init.status !== 200 || !init.sessionId) throw new Error(`Init failed: ${JSON.stringify(init.payload)}`);
  
  console.log("Đang upload và kích hoạt plugin...");
  const zipBase64 = readFileSync(ZIP_PATH).toString("base64");
  const upload = await callAbility(init.sessionId, "plugins/upload-base64", { content_base64: zipBase64, filename: `${PLUGIN_SLUG}.zip`, activate: true, overwrite: true }, 2);
  
  console.log("Kết quả upload plugin:", JSON.stringify(upload.payload, null, 2));
  
  console.log(`Đang cập nhật option 'ttcqn_ga4_measurement_id' thành '${GA4_MEASUREMENT_ID}'...`);
  const updateOpt = await callAbility(init.sessionId, "options/update", { name: "ttcqn_ga4_measurement_id", value: GA4_MEASUREMENT_ID }, 3);
  console.log("Kết quả cập nhật option:", updateOpt.status === 200 ? "THÀNH CÔNG" : "THẤT BẠI");
  
  console.log("\nHOÀN THÀNH SETUP GOOGLE ANALYTICS 4!");
  console.log(`- Measurement ID: ${GA4_MEASUREMENT_ID}`);
  console.log(`- Plugin: ${PLUGIN_SLUG} (đã kích hoạt)`);
})().catch(e => {
  console.error("Lỗi khi deploy lên WordPress:", e.message);
  process.exitCode = 1;
});
