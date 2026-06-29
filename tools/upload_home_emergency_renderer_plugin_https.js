const fs = require('fs');
const https = require('https');
const envStr = fs.readFileSync('C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env', 'utf8');
const env = {};
envStr.split('\n').forEach(l => { const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/); if(m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, ''); });
const auth = 'Basic ' + Buffer.from(env.WP_USERNAME + ':' + env.WP_APP_PASSWORD).toString('base64');
const zipBase64 = fs.readFileSync('D:/.thongtaccongquangninh/tools/wp-plugins/ttcqn-home-emergency-renderer.zip').toString('base64');

function rpc(method, params, id) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    const req = https.request('https://thongtaccongquangninh.com/wp-json/mcp/wp-mcp-ultimate', {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'node-https'
      }
    }, res => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, payload: chunks }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'codex', version: '1' } }, 1);
    console.log('Init:', init.status, init.payload);
    
    const upload = await rpc('tools/call', {
      name: 'wp-mcp-ultimate-execute-ability',
      arguments: {
        ability_name: 'plugins/upload-base64',
        parameters: { content_base64: zipBase64, filename: 'ttcqn-home-emergency-renderer.zip', activate: true, overwrite: true }
      }
    }, 2);
    console.log('Upload:', upload.status, upload.payload.substring(0, 500));
  } catch(e) { console.error(e); }
})();
