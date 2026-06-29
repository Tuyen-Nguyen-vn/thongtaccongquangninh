import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

console.log("[footer-verify] Debug path: for normal workflow prefer `npm run release:footer-backtop-live`");

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_BIN,
    "/home/dell/.local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
  ].filter(Boolean);

  const existing = candidates.find((candidate) => existsSync(candidate));
  if (existing) return existing;
  throw new Error(`Không tìm thấy Chrome/Chromium. Đã thử: ${candidates.join(", ")}`);
}

const chromePath = resolveChromePath();
const port = 9339;
const outputDir = join(tmpdir(), "ttcqn-footer-verify");
const profileDir = join(tmpdir(), `ttcqn-footer-chrome-${process.pid}`);
mkdirSync(outputDir, { recursive: true });

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

function inspectionExpression() {
  return `(() => {
    const footer = document.querySelector('.home-footer');
    if (!footer) return { error: 'missing-footer' };
    const footerStyle = getComputedStyle(footer);
    const support = footer.querySelector('.footer-support');
    const icon = footer.querySelector('.footer-support-icon .footer-icon');
    const call = footer.querySelector('.footer-call-btn');
    const accordion = footer.querySelector('.footer-accordion-toggle');
    const kicker = footer.querySelector('.footer-support-kicker');
    const backTop = document.querySelector('.footer-back-top');
    const email = footer.querySelector('a[href^="mailto:"]');
    const mapFrame = footer.querySelector('.footer-map-frame');
    const mapOpen = footer.querySelector('.footer-map-open');
    const assistant = [...document.querySelectorAll('button,a')].find((node) =>
      node.textContent.trim() === 'Trợ lý' && getComputedStyle(node).position === 'fixed'
    );
    const rect = footer.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const callRect = call?.getBoundingClientRect();
    const backRect = backTop?.getBoundingClientRect();
    const assistantRect = assistant?.getBoundingClientRect();
    const emailRect = email?.getBoundingClientRect();
    const mapFrameRect = mapFrame?.getBoundingClientRect();
    const overlaps = backRect && assistantRect
      ? !(backRect.right <= assistantRect.left || backRect.left >= assistantRect.right || backRect.bottom <= assistantRect.top || backRect.top >= assistantRect.bottom)
      : false;
    return {
      viewport: { width: innerWidth, height: innerHeight, clientWidth: document.documentElement.clientWidth },
      bodyClass: document.body.classList.contains('ttcqn-shared-footer-active'),
      stylesheetCount: [...document.styleSheets].filter((sheet) => sheet.href?.includes('ttcqn-shared-footer.css')).length,
      footer: { left: rect.left, width: rect.width, height: rect.height, color: footerStyle.color, backgroundImage: footerStyle.backgroundImage },
      supportDisplay: support ? getComputedStyle(support).display : null,
      icon: iconRect ? { width: iconRect.width, height: iconRect.height } : null,
      callHeight: callRect?.height ?? 0,
      emailRight: emailRect?.right ?? 0,
      mapFrame: mapFrameRect ? {
        width: mapFrameRect.width,
        height: mapFrameRect.height,
        src: mapFrame?.getAttribute('src') || '',
        openHref: mapOpen?.getAttribute('href') || '',
      } : null,
      kickerColor: kicker ? getComputedStyle(kicker).color : null,
      accordionDisplay: accordion ? getComputedStyle(accordion).display : null,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      footerOverflow: footer.scrollWidth - footer.clientWidth,
      overflowElements: [...document.querySelectorAll('body *')]
        .map((node) => ({ node, rect: node.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && (rect.right > document.documentElement.clientWidth + 2 || rect.left < -2))
        .slice(0, 8)
        .map(({ node, rect }) => ({
          tag: node.tagName,
          className: typeof node.className === 'string' ? node.className.slice(0, 100) : '',
          left: rect.left,
          right: rect.right,
          inFooter: footer.contains(node),
        })),
      footerOverflowElements: [...footer.querySelectorAll('*')]
        .map((node) => ({ node, rect: node.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && (rect.right > document.documentElement.clientWidth + 2 || rect.left < -2))
        .slice(0, 8)
        .map(({ node, rect }) => ({
          tag: node.tagName,
          className: typeof node.className === 'string' ? node.className.slice(0, 100) : '',
          left: rect.left,
          right: rect.right,
        })),
      assistantOverlap: overlaps,
      footerDocumentRect: { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height },
    };
  })()`;
}

function assertScenario(name, metrics) {
  const mobile = metrics.viewport.width <= 768;
  const failures = [];
  if (name.startsWith("service-") && !metrics.bodyClass) failures.push("thiếu body class footer");
  if (metrics.stylesheetCount !== 1) failures.push(`stylesheet=${metrics.stylesheetCount}`);
  if (metrics.supportDisplay !== "grid") failures.push(`support display=${metrics.supportDisplay}`);
  if (!metrics.footer.backgroundImage || metrics.footer.backgroundImage === "none") failures.push("thiếu nền footer");
  if (Math.abs(metrics.footer.width - metrics.viewport.clientWidth) > 2) failures.push("footer không phủ đủ viewport");
  if (metrics.icon && (metrics.icon.width < 18 || metrics.icon.width > 40)) failures.push(`icon width=${metrics.icon.width}`);
  if (metrics.callHeight < 44) failures.push(`CTA height=${metrics.callHeight}`);
  if (metrics.emailRight > metrics.viewport.clientWidth + 2) failures.push(`email tràn mép=${metrics.emailRight}px`);
  if (!metrics.mapFrame?.src?.includes("www.google.com/maps/embed?pb=!1m18")) failures.push("thiếu iframe Google Maps mới");
  if (!metrics.mapFrame?.openHref?.includes("20.962384198791902")) failures.push("link mở Google Maps sai tọa độ");
  if ((metrics.mapFrame?.width ?? 0) < 260 || (metrics.mapFrame?.height ?? 0) < 240) failures.push("khung bản đồ quá nhỏ");
  if (metrics.footerOverflow > 2) failures.push(`footer tràn ngang=${metrics.footerOverflow}px`);
  if (metrics.footerOverflowElements?.length) failures.push(`child footer tràn mép=${metrics.footerOverflowElements[0].className || metrics.footerOverflowElements[0].tag}`);
  if (mobile && metrics.accordionDisplay !== "flex") failures.push(`accordion mobile=${metrics.accordionDisplay}`);
  if (!mobile && metrics.accordionDisplay !== "none") failures.push(`accordion desktop=${metrics.accordionDisplay}`);
  if (metrics.assistantOverlap) failures.push("nút lên đầu trang chồng nút Trợ lý");
  return { name, ok: failures.length === 0, failures, metrics };
}

function interactionExpression() {
  return `(async () => {
    const footer = document.querySelector('.home-footer');
    const call = footer?.querySelector('.footer-call-btn');
    const areaAccordion = footer?.querySelector('[aria-label="Khu vực phục vụ"][data-footer-accordion]');
    const areaButton = areaAccordion?.querySelector('.footer-accordion-toggle');
    const backTop = document.querySelector('.footer-back-top');
    const beforeAccordion = areaButton?.getAttribute('aria-expanded');
    areaButton?.click();
    const afterAccordion = areaButton?.getAttribute('aria-expanded');
    const accordionOpened = beforeAccordion === 'false' && afterAccordion === 'true' && areaAccordion?.classList.contains('is-open');
    const footerTop = footer ? window.scrollY + footer.getBoundingClientRect().top : 0;
    window.scrollTo({ top: Math.max(0, footerTop - 24), behavior: 'instant' });
    await new Promise((resolve) => setTimeout(resolve, 250));
    const beforeScrollY = window.scrollY;
    backTop?.click();
    await new Promise((resolve) => setTimeout(resolve, 2200));
    return {
      telHref: call?.getAttribute('href') || null,
      accordionOpened,
      backTopWorked: beforeScrollY > 200 && window.scrollY <= 10,
      beforeScrollY,
      afterScrollY: window.scrollY,
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
  { name: "service-1920", width: 1920, height: 1000, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-1366", width: 1366, height: 900, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-768", width: 768, height: 900, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-390", width: 390, height: 844, path: "/hut-be-phot-quang-ninh/" },
  { name: "service-360", width: 360, height: 800, path: "/hut-be-phot-quang-ninh/" },
  { name: "home-1366", width: 1366, height: 900, path: "/" },
  { name: "home-390", width: 390, height: 844, path: "/" },
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
  const url = `https://thongtaccongquangninh.com${scenario.path}?nowprocket=1&codex=footer-visual-${stamp}-${scenario.width}`;
  await client.send("Page.navigate", { url });
  await loaded;
  await sleep(900);
  const evaluated = await client.send("Runtime.evaluate", {
    expression: inspectionExpression(),
    returnByValue: true,
  });
  const metrics = evaluated.result.value;
  const result = metrics?.error
    ? { name: scenario.name, ok: false, failures: [metrics.error], metrics }
    : assertScenario(scenario.name, metrics);

  if (!metrics?.error && scenario.name === "service-390") {
    const interactionEval = await client.send("Runtime.evaluate", {
      expression: interactionExpression(),
      awaitPromise: true,
      returnByValue: true,
    });
    const interactions = interactionEval.result.value;
    result.metrics.interactions = interactions;
    if (interactions?.telHref !== "tel:0931156756") result.failures.push(`CTA tel sai=${interactions?.telHref}`);
    if (!interactions?.accordionOpened) result.failures.push("accordion mobile không mở");
    if (!interactions?.backTopWorked) result.failures.push("nút lên đầu trang không cuộn lên");
    result.ok = result.failures.length === 0;
  }

  results.push(result);

  if (!metrics?.error) {
    await client.send("Runtime.evaluate", {
      expression: "document.querySelector('.home-footer')?.scrollIntoView({ block: 'start' })",
    });
    await sleep(800);
    const clip = metrics.footerDocumentRect;
    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: {
        x: Math.max(0, clip.x),
        y: Math.max(0, clip.y),
        width: Math.min(scenario.width, clip.width),
        height: Math.min(2600, clip.height),
        scale: 1,
      },
    });
    writeFileSync(join(outputDir, `${scenario.name}.png`), Buffer.from(screenshot.data, "base64"));
  }
}

client.close();
chrome.kill();

const summary = {
  outputDir,
  passed: results.filter((item) => item.ok).length,
  total: results.length,
  results,
};
console.log(JSON.stringify(summary, null, 2));
if (summary.passed !== summary.total) process.exitCode = 1;
