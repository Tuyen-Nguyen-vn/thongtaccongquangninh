const KEY = 'a1b2c3d4e5f6789012345678901234ab';
const HOST = 'thongtaccongquangninh.com';

// 1. Verify key file is served by Rank Math
const keyFileUrl = `https://${HOST}/${KEY}.txt`;
console.log('Checking key file:', keyFileUrl);
const kf = await fetch(keyFileUrl);
console.log('Key file HTTP:', kf.status);
const kfText = await kf.text();
console.log('Key file content:', kfText.trim().slice(0, 100));

const keyOk = kf.status === 200 && kfText.trim().includes(KEY);
console.log('Key file valid:', keyOk);

if (!keyOk) {
  console.log('⚠️ Key file not served — Rank Math may need IndexNow enabled in settings.');
  console.log('Proceeding anyway with submission...');
}

// 2. Submit URLs via IndexNow
const urlList = [
  `https://${HOST}/`,
  `https://${HOST}/thong-tac-cong-ha-long/`,
  `https://${HOST}/thong-tac-cong-cam-pha/`,
  `https://${HOST}/thong-tac-cong-uong-bi/`,
  `https://${HOST}/hut-be-phot-quang-ninh/`,
  `https://${HOST}/hut-be-phot-ha-long/`,
  `https://${HOST}/nao-vet-ho-ga-quang-ninh/`,
  `https://${HOST}/thong-tac-bon-cau-ha-long/`,
];

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: keyFileUrl,
  urlList,
});

const engines = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://search.seznam.cz/indexnow',
];

for (const engine of engines) {
  try {
    const r = await fetch(engine, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload,
    });
    const text = await r.text();
    console.log(`\n${engine}`);
    console.log('  Status:', r.status, r.statusText);
    console.log('  Response:', text.slice(0, 200));
  } catch (e) {
    console.log(`\n${engine} ERROR:`, e.message);
  }
}

console.log('\nDone. URLs submitted:', urlList.length);
