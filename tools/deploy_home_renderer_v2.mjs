/**
 * Deploy ttcqn-home-emergency-renderer — chỉ cập nhật PHP file chính.
 * Dùng wp-mcp-ultimate + buildZip (1 file) giống redeploy_doorway_schema.mjs
 */
import https from 'node:https';
import fs from 'node:fs';

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";

function parseEnv(p) {
  const env = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const AUTH = 'Basic ' + Buffer.from(env.WP_USERNAME + ':' + env.WP_APP_PASSWORD).toString('base64');
const SERVER_IP = '103.57.220.210';
const WP_HOST = 'thongtaccongquangninh.com';
const SLUG = 'ttcqn-home-emergency-renderer';
const DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

// Tạo ZIP chỉ PHP/CSS/JS (bỏ ảnh/video)
if (fs.existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`, { stdio: 'pipe' });
execSync(`python -c "import zipfile,os; skip={'.png','.jpg','.jpeg','.webp','.mp4','.gif','.ico','.svg'}; zf=zipfile.ZipFile(r'${ZIP_PATH}','w',zipfile.ZIP_DEFLATED); [zf.write(os.path.join(root,f),'${SLUG}/'+os.path.relpath(os.path.join(root,f),r'${DIR}').replace(chr(92),'/')) for root,dirs,files in os.walk(r'${DIR}') for f in files if os.path.splitext(f)[1].lower() not in skip]; zf.close(); print('zip ok',os.path.getsize(r'${ZIP_PATH}'))"`, { stdio: 'pipe' });

const zipB64 = fs.readFileSync(ZIP_PATH).toString('base64');
console.log('ZIP size:', fs.statSync(ZIP_PATH).size, 'bytes');

let SID = null;
function mcpReq(body) {
  return new Promise((res, rej) => {
    const b = Buffer.from(JSON.stringify(body), 'utf8');
    const r = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: '/wp-json/mcp/mcp-adapter-default-server', method: 'POST',
      headers: {
        Host: WP_HOST, Authorization: AUTH,
        'Content-Type': 'application/json', 'Content-Length': b.length,
        ...(SID ? { 'Mcp-Session-Id': SID } : {}),
      },
      rejectUnauthorized: false,
    }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        if (!SID && resp.headers['mcp-session-id']) SID = resp.headers['mcp-session-id'];
        try { res({ s: resp.statusCode, d: JSON.parse(d) }); } catch { res({ s: resp.statusCode, d }); }
      });
    });
    r.on('error', rej);
    r.setTimeout(60000, () => r.destroy());
    r.write(b); r.end();
  });
}

await mcpReq({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: { tools: {} }, clientInfo: { name: 'deploy-home-renderer', version: '1' } } });
await mcpReq({ jsonrpc: '2.0', method: 'notifications/initialized' });

const r = await mcpReq({
  jsonrpc: '2.0', id: 2, method: 'tools/call',
  params: {
    name: 'mcp-adapter-execute-ability',
    arguments: {
      ability_name: 'plugins/upload-base64',
      parameters: { content_base64: zipB64, filename: SLUG + '.zip', activate: true, overwrite: true },
    },
  },
});

console.log('Status:', r.s);
const txt = typeof r.d === 'string' ? r.d : JSON.stringify(r.d);
con