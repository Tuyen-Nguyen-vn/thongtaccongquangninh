/**
 * Fix /chinh-sach-bao-hanh/ (page 64):
 *  1. Giảm keyword density "bảo hành" (3.96% → mục tiêu ≤ 2.5%)
 *  2. Thêm FAQ block để đạt FAQPage schema
 *  3. Cập nhật title để dài hơn (hiện 45 chars)
 *
 * Usage:
 *   node tools/fix_chinh_sach_bao_hanh.mjs          ← dry-run (hiển thị content hiện tại + plan)
 *   node tools/fix_chinh_sach_bao_hanh.mjs --write  ← apply
 */
import https from "node:https";
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const PAGE_ID   = 64;
const WRITE     = process.argv.includes("--write");

const MARKER     = "ttcqn-author-nguyen-song-hao";
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const AUTHOR_NAME = "Nguyễn Song Hào";

// FAQ block chuẩn cho trang chính sách bảo hành
const FAQ_BLOCK = `<!-- wp:heading {"level":2} -->
<h2>Câu hỏi thường gặp về chính sách bảo hành</h2>
<!-- /wp:heading -->

<!-- wp:yoast/faq-block {"questions":[{"id":"faq-1","question":"Thời gian bảo hành dịch vụ thông tắc cống là bao lâu?","answer":"Chúng tôi bảo hành 12 tháng cho dịch vụ thông tắc cống và thông tắc bồn cầu. Trong thời gian này, nếu tắc nghẽn tái phát do lỗi thi công, đội thợ sẽ quay lại xử lý miễn phí trong vòng 24 giờ."},{"id":"faq-2","question":"Dịch vụ hút bể phốt có được bảo hành không?","answer":"Có. Hút bể phốt được bảo hành 6 tháng: nếu trong thời gian này xuất hiện mùi hôi bất thường hoặc bể phốt đầy sớm hơn dự kiến do lỗi kỹ thuật, chúng tôi sẽ kiểm tra và xử lý bổ sung miễn phí."},{"id":"faq-3","question":"Cần cung cấp gì để được hưởng chính sách bảo hành?","answer":"Khách hàng cần có phiếu bảo hành hoặc hóa đơn dịch vụ có ghi ngày thi công. Gọi hotline 0963.953.533 hoặc 0931.156.756 để được hỗ trợ, đội thợ sẽ xác minh và xử lý trong ngày."},{"id":"faq-4","question":"Bảo hành có áp dụng nếu tôi tự can thiệp vào hệ thống sau khi thông tắc không?","answer":"Bảo hành không áp dụng nếu khách hàng tự sửa, đào, đục phá hoặc dùng hóa chất mạnh vào hệ thống sau khi chúng tôi hoàn thành. Mọi thắc mắc, vui lòng liên hệ hotline trước khi tự xử lý."}]} -->
<div class="schema-faq wp-block-yoast-faq-block"><div class="schema-faq-section"><strong class="schema-faq-question">Thời gian bảo hành dịch vụ thông tắc cống là bao lâu?</strong><p class="schema-faq-answer">Chúng tôi bảo hành 12 tháng cho dịch vụ thông tắc cống và thông tắc bồn cầu. Trong thời gian này, nếu tắc nghẽn tái phát do lỗi thi công, đội thợ sẽ quay lại xử lý miễn phí trong vòng 24 giờ.</p></div><div class="schema-faq-section"><strong class="schema-faq-question">Dịch vụ hút bể phốt có được bảo hành không?</strong><p class="schema-faq-answer">Có. Hút bể phốt được bảo hành 6 tháng: nếu trong thời gian này xuất hiện mùi hôi bất thường hoặc bể phốt đầy sớm hơn dự kiến do lỗi kỹ thuật, chúng tôi sẽ kiểm tra và xử lý bổ sung miễn phí.</p></div><div class="schema-faq-section"><strong class="schema-faq-question">Cần cung cấp gì để được hưởng chính sách bảo hành?</strong><p class="schema-faq-answer">Khách hàng cần có phiếu bảo hành hoặc hóa đơn dịch vụ có ghi ngày thi công. Gọi hotline <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong> để được hỗ trợ, đội thợ sẽ xác minh và xử lý trong ngày.</p></div><div class="schema-faq-section"><strong class="schema-faq-question">Bảo hành có áp dụng nếu tôi tự can thiệp vào hệ thống sau khi thông tắc không?</strong><p class="schema-faq-answer">Bảo hành không áp dụng nếu khách hàng tự sửa, đào, đục phá hoặc dùng hóa chất mạnh vào hệ thống sau khi chúng tôi hoàn thành. Mọi thắc mắc, vui lòng liên hệ hotline trước khi tự xử lý.</p></div></div>
<!-- /wp:yoast/faq-block -->`;

// Title mới — dài hơn 45 chars, không nhồi từ
const NEW_TITLE = "Chính Sách Bảo Hành Dịch Vụ | Môi Trường Đô Thị Số 1 Quảng Ninh";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function request(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function countKeyword(text, kw) {
  return (text.toLowerCase().match(new RegExp(kw.toLowerCase(), "g")) || []).length;
}

function keywordDensity(text, kw) {
  const words = text.split(/\s+/).filter(w => w.length > 1).length;
  return words > 0 ? (countKeyword(text, kw) / words * 100).toFixed(2) : "0";
}

/**
 * Giảm keyword density "bảo hành" bằng cách thay thế một số occurrence thừa
 * bằng từ đồng nghĩa / cụm thay thế:
 *  - "bảo hành" → "cam kết hậu mãi"
 *  - "chính sách bảo hành" → "cam kết dịch vụ"
 *  - "được bảo hành" → "được hỗ trợ sau dịch vụ"
 * Chỉ thay tối đa N occurrences để density xuống ~2%.
 */
function reduceKeywordDensity(content, targetMaxOccurrences) {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = plain.split(/\s+/).filter(w => w.length > 1).length;
  const currentCount = countKeyword(plain, "bảo hành");
  const toRemove = Math.max(0, currentCount - targetMaxOccurrences);

  if (toRemove === 0) return content;

  console.log(`  Cần loại bỏ ${toRemove}/${currentCount} lần "bảo hành" (${words} từ)`);

  // Danh sách thay thế theo thứ tự ưu tiên (thay thế occurrence nào ít "cốt lõi" nhất)
  const replacements = [
    // Thay "được bảo hành" → "được hỗ trợ sau dịch vụ"
    { from: /được bảo hành/gi, to: "được hỗ trợ sau dịch vụ", max: 2 },
    // Thay "điều khoản bảo hành" → "điều khoản cam kết"
    { from: /điều khoản bảo hành/gi, to: "điều khoản cam kết", max: 2 },
    // Thay "thời gian bảo hành" → "thời gian cam kết"
    { from: /thời gian bảo hành/gi, to: "thời gian cam kết", max: 2 },
    // Thay "phạm vi bảo hành" → "phạm vi hỗ trợ"
    { from: /phạm vi bảo hành/gi, to: "phạm vi hỗ trợ", max: 2 },
    // Thay "hết hạn bảo hành" → "hết thời hạn cam kết"
    { from: /hết hạn bảo hành/gi, to: "hết thời hạn cam kết", max: 2 },
    // Thay "yêu cầu bảo hành" → "yêu cầu hỗ trợ"
    { from: /yêu cầu bảo hành/gi, to: "yêu cầu hỗ trợ", max: 2 },
  ];

  let out = content;
  let removed = 0;

  for (const r of replacements) {
    if (removed >= toRemove) break;
    let count = 0;
    out = out.replace(r.from, (match) => {
      if (count >= r.max || removed >= toRemove) return match;
      count++;
      removed++;
      return r.to;
    });
  }

  console.log(`  Đã thay ${removed} lần`);
  return out;
}

function buildByline(modified) {
  const d = new Date(modified);
  const dateStr = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  return [
    `\n<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->`,
    `<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${dateStr}</p>`,
    `<!-- /wp:paragraph -->`,
  ].join("\n");
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Fix /chinh-sach-bao-hanh/ page 64 (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const r = await request("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  if (r.status !== 200) { console.log(`ERROR GET: ${r.status}`); return; }

  const currentTitle  = r.data?.title?.raw ?? "";
  let content = r.data?.content?.raw ?? "";
  const modified = r.data?.modified ?? new Date().toISOString();

  // Phân tích hiện trạng
  const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words     = plainText.split(/\s+/).filter(w => w.length > 1).length;
  const kwCount   = countKeyword(plainText, "bảo hành");
  const density   = keywordDensity(plainText, "bảo hành");
  const hasFaq    = /wp:yoast\/faq|wp:rank-math\/faq|FAQ|Câu hỏi thường gặp/i.test(content);
  const hasByline = content.includes(MARKER);

  console.log(`Title hiện tại (${currentTitle.length} chars): "${currentTitle}"`);
  console.log(`Nội dung: ${words} từ | "bảo hành": ${kwCount} lần | density: ${density}%`);
  console.log(`FAQ: ${hasFaq ? "✓" : "✗"} | Byline: ${hasByline ? "✓" : "✗"}`);

  // Tính target: words * 2.0% = số lần tối đa
  const targetMaxKw = Math.floor(words * 0.020);
  console.log(`\nTarget: density ≤ 2.0% → tối đa ${targetMaxKw} lần "bảo hành" (hiện ${kwCount})\n`);

  if (!WRITE) {
    console.log("[DRY-RUN] Sẽ thực hiện:");
    if (currentTitle.length < 50) console.log(`  ✎ Title: "${currentTitle}" → "${NEW_TITLE}"`);
    if (Number(density) > 2.0) console.log(`  ✎ Giảm keyword density: ${density}% → ≤ 2.0% (bỏ ~${kwCount - targetMaxKw} lần)`);
    if (!hasFaq) console.log(`  ✎ Thêm FAQ block (4 câu hỏi bảo hành)`);
    if (!hasByline) console.log(`  ✎ Thêm author byline`);
    return;
  }

  // === Apply fixes ===
  let newContent = content;

  // 1. Giảm keyword density
  if (Number(density) > 2.0 && kwCount > targetMaxKw) {
    console.log("Fix 1: Giảm keyword density...");
    newContent = reduceKeywordDensity(newContent, targetMaxKw);
  }

  // 2. Thêm FAQ block trước author byline (hoặc cuối)
  if (!hasFaq) {
    console.log("Fix 2: Thêm FAQ block...");
    const idx = newContent.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
    const ins  = "\n" + FAQ_BLOCK + "\n";
    newContent = idx !== -1 ? newContent.slice(0, idx) + ins + newContent.slice(idx) : newContent + ins;
  }

  // 3. Thêm byline nếu thiếu
  if (!hasByline) {
    console.log("Fix 3: Thêm author byline...");
    newContent += buildByline(modified);
  }

  // 4. Cập nhật title + content
  const updateBody = { content: newContent };
  if (currentTitle.length < 50) {
    updateBody.title = NEW_TITLE;
    console.log(`Fix 4: Title → "${NEW_TITLE}"`);
  }

  // Verify density sau fix
  const plainNew = newContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const newCount  = countKeyword(plainNew, "bảo hành");
  const newWords  = plainNew.split(/\s+/).filter(w => w.length > 1).length;
  const newDensity = (newCount / newWords * 100).toFixed(2);
  console.log(`\nDensity sau fix: ${newCount}/${newWords} = ${newDensity}%`);

  const w = await request("POST", `/wp/v2/pages/${PAGE_ID}`, auth, updateBody);
  const ok = w.status === 200;
  console.log(`\nPOST: ${ok ? "✓ 200" : `✗ ${w.status}`}`);

  if (ok) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},FIX-CSB-HANH-${TODAY},seo_fix,fix /chinh-sach-bao-hanh/ keyword stuffing+FAQ,https://thongtaccongquangninh.com/chinh-sach-bao-hanh/,,done,high,,,,,density ${density}%→${newDensity}%; added FAQ block 4Q; title updated,tools/fix_chinh_sach_bao_hanh.mjs,,Re-run audit_seo_full to verify score,,,,,,`,
      "utf8"
    );
    console.log("Logged CSV.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
