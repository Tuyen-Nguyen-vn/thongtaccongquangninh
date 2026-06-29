import { spawn } from "node:child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9341;
const profileDir = `${process.env.TEMP || "C:\\Windows\\Temp"}\\ttcqn-overflow-chrome-${process.pid}`;

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
], { stdio: "ignore", windowsHide: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome DevTools không khởi động");
}

async function newTarget() {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Không tạo được tab kiểm thử: HTTP ${response.status}`);
  return response.json();
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      const queue = this.waiters.get(message.method);
      if (queue?.length) queue.shift()(message.params);
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method) {
    return new Promise((resolve) => {
      const queue = this.waiters.get(method) ?? [];
      queue.push(resolve);
      this.waiters.set(method, queue);
    });
  }

  close() {
    this.socket.close();
  }
}

function inspectExpression() {
  return `(() => {
    const doc = document.documentElement;
    const body = document.body;
    const heroRect = document.querySelector('.ttcqn-seo-hero')?.getBoundingClientRect();
    const pluginMeta = document.querySelector('meta[name="ttcqn-home-emergency-renderer"]')?.content || null;
    const offenders = [...document.querySelectorAll('body *')]
      .map((node) => ({ node, rect: node.getBoundingClientRect(), style: getComputedStyle(node) }))
      .filter(({ rect }) => rect.width > 0 && (rect.right > doc.clientWidth + 1 || rect.left < -1))
      .slice(0, 10)
      .map(({ node, rect, style }) => ({
        tag: node.tagName,
        className: typeof node.className === 'string' ? node.className.slice(0, 120) : '',
        position: style.position,
        overflowX: style.overflowX,
        left: Math.round(rect.left * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
      }));
    return {
      innerWidth,
      clientWidth: doc.clientWidth,
      docScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      horizontalOverflow: Math.max(doc.scrollWidth, body.scrollWidth) - doc.clientWidth,
      heroRect: heroRect ? {
        left: Math.round(heroRect.left * 100) / 100,
        right: Math.round(heroRect.right * 100) / 100,
        width: Math.round(heroRect.width * 100) / 100,
      } : null,
      pluginMeta,
      offenders,
    };
  })()`;
}

await waitForDebugger();
const target = await newTarget();
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.open();
await client.send("Page.enable");
await client.send("Runtime.enable");

const stamp = Date.now();
const scenarios = [
  { name: "home-1366", width: 1366, height: 900, path: "/" },
  { name: "home-390", width: 390, height: 844, path: "/" },
  { name: "service-1920", width: 1920, height: 1000, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-1366", width: 1366, height: 900, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-768", width: 768, height: 900, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-390", width: 390, height: 844, path: "/hut-be-phot-quang-ninh/" },
  { name: "contact-390", width: 390, height: 844, path: "/lien-he/" },
  { name: "blog-390", width: 390, height: 844, path: "/blog/" },
];

const results = [];
for (const scenario of scenarios) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: scenario.width,
    height: scenario.height,
    deviceScaleFactor: 1,
    mobile: scenario.width <= 768,
  });
  const loaded = client.waitFor("Page.loadEventFired");
  await client.send("Page.navigate", {
    url: `https://thongtaccongquangninh.com${scenario.path}?nowprocket=1&codex=overflow-${stamp}-${scenario.width}`,
  });
  await loaded;
  await sleep(1200);
  const evaluated = await client.send("Runtime.evaluate", {
    expression: inspectExpression(),
    returnByValue: true,
  });
  const metrics = evaluated.result.value;
  const failures = [];
  if (metrics.horizontalOverflow > 1) failures.push(`horizontalOverflow=${metrics.horizontalOverflow}`);
  if (scenario.path.includes("hut-be-phot") && metrics.heroRect && Math.abs(metrics.heroRect.width - metrics.clientWidth) > 1) {
    failures.push(`heroWidth=${metrics.heroRect.width}, clientWidth=${metrics.clientWidth}`);
  }
  if (scenario.path === "/" && !String(metrics.pluginMeta || "").includes("2026.06.19.4")) {
    failures.push(`pluginMeta=${metrics.pluginMeta}`);
  }
  results.push({ name: scenario.name, ok: failures.length === 0, failures, metrics });
}

client.close();
chrome.kill();

const summary = {
  passed: results.filter((item) => item.ok).length,
  total: results.length,
  results,
};
console.log(JSON.stringify(summary, null, 2));
if (summary.passed !== summary.total) process.exitCode = 1;
