/**
 * Try to inspect Rank Math UI score for WordPress page 52.
 *
 * This script intentionally does not type credentials. It only reuses an
 * existing Chromium/Puppeteer profile if it already has a valid WP session.
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = "/mnt/d/.thongtaccongquangninh";
const PAGE_ID = 52;
const URL = `https://thongtaccongquangninh.com/wp-admin/post.php?post=${PAGE_ID}&action=edit`;
const OUT_DIR = path.join(ROOT, "_tmp", "rankmath-page52-admin-ui");
const REPORT_DIR = path.join(ROOT, "reports");
const CHROME = process.env.CHROME_BIN || "/home/dell/.local/bin/google-chrome";
const USER_DATA_DIR = process.env.PPTR_USER_DATA_DIR || path.join(ROOT, "tools", "puppeteer_profile");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  userDataDir: USER_DATA_DIR,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1440,1200",
  ],
  defaultViewport: { width: 1440, height: 1200 },
});

const page = await browser.newPage();
page.setDefaultTimeout(20000);

let screenshotPath = "";
let report;

try {
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const currentUrl = page.url();
  const loginState = await page.evaluate(() => {
    const userEl = document.querySelector("#user_login");
    const passEl = document.querySelector("#user_pass");
    return {
      isLoginPage: location.href.includes("wp-login.php") || !!userEl,
      hasUserField: !!userEl,
      hasPassField: !!passEl,
      autofilledUser: !!(userEl && userEl.value.trim()),
      autofilledPass: !!(passEl && passEl.value),
    };
  });

  screenshotPath = path.join(OUT_DIR, `page52-admin-${new Date().toISOString().replace(/[:.]/g, "-")}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  if (loginState.isLoginPage) {
    report = {
      checkedAt: new Date().toISOString(),
      pageId: PAGE_ID,
      targetUrl: URL,
      currentUrl,
      status: "blocked_login_required",
      loginState,
      screenshotPath,
      note: "No WP admin UI score was read because the browser profile is not logged in. Script did not type credentials.",
    };
  } else {
    await page.waitForSelector("body", { timeout: 15000 });
    await new Promise((resolve) => setTimeout(resolve, 8000));

    const ui = await page.evaluate(() => {
      const bodyText = document.body?.innerText || "";
      const lines = bodyText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /(rank math|seo|score|\/100|content ai|hút bể phốt hạ long)/i.test(line))
        .slice(0, 120);

      const rankMathNodes = Array.from(document.querySelectorAll('[class*="rank-math"], [id*="rank-math"], [aria-label*="Rank Math"], [data-rank-math]'))
        .slice(0, 120)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: typeof el.className === "string" ? el.className : "",
          ariaLabel: el.getAttribute("aria-label") || "",
          text: (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 300),
        }));

      const scoreLike = [...bodyText.matchAll(/\b(?:score|điểm|seo)\D{0,25}(\d{1,3})\s*\/\s*100\b/gi)].map((m) => m[0]);
      const numericBadges = Array.from(document.querySelectorAll("*"))
        .map((el) => (el.innerText || el.textContent || "").trim())
        .filter((text) => /^([0-9]{1,3})\/100$/.test(text) || /^([0-9]{1,3})$/.test(text))
        .slice(0, 60);

      return { title: document.title, lines, rankMathNodes, scoreLike, numericBadges };
    });

    report = {
      checkedAt: new Date().toISOString(),
      pageId: PAGE_ID,
      targetUrl: URL,
      currentUrl,
      status: currentUrl.includes("wp-admin") ? "admin_opened" : "unknown",
      screenshotPath,
      ui,
      note: "UI score is only confirmed if Rank Math renders a clear score/badge in the extracted UI text or screenshot.",
    };
  }
} finally {
  const reportPath = path.join(REPORT_DIR, `rankmath-page52-admin-ui-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    reportPath,
    status: report?.status,
    currentUrl: report?.currentUrl,
    screenshotPath: report?.screenshotPath,
    scoreLike: report?.ui?.scoreLike || [],
    numericBadges: report?.ui?.numericBadges || [],
  }, null, 2));
  await browser.close();
}
