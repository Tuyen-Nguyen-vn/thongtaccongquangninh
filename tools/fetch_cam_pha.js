const fs = require('fs');

async function main() {
  const env = {};
  for (const line of fs.readFileSync('C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  
  // Since WAF is disabled in .htaccess, we don't need to spoof IP/Host, just fetch normally
  const r = await fetch(env.WP_BASE_URL + '/wp-json/wp/v2/pages/400?context=edit', {
    headers: {
      Authorization: 'Basic ' + Buffer.from(env.WP_USERNAME + ':' + env.WP_APP_PASSWORD).toString('base64'),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0'
    }
  });
  
  const data = await r.json();
  if (!data.content || !data.content.raw) {
    console.error('Error fetching data:', data);
    return;
  }
  fs.writeFileSync('D:/.thongtaccongquangninh/content-drafts/thong-tac-cong-cam-pha-original.html', data.content.raw);
  console.log('Saved to content-drafts/thong-tac-cong-cam-pha-original.html');
}
main();
