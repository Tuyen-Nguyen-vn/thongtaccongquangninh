/**
 * Patch SEO hard-check cho post /thong-tac-cong-bai-chay/.
 *
 * Usage:
 *   node tools/patch_ttc_bai_chay_h1_schema.mjs
 *   node tools/patch_ttc_bai_chay_h1_schema.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const ENV_CANDIDATES = [
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const POST_ID = 2054;
const SLUG = "thong-tac-cong-bai-chay";
const WRITE = process.argv.includes("--write");

const SEO_TITLE = "Thông Tắc Cống Bãi Cháy Hạ Long 24/7 - Không Đục Phá";
const META_DESCRIPTION =
  "Thông tắc cống Bãi Cháy Hạ Long 24/7, không đục phá, báo giá trước. Gọi 0963.953.533, thợ hỗ trợ nhanh tại nhà dân, nhà hàng, khách sạn.";
const FOCUS_KEYWORD = "thông tắc cống Bãi Cháy";
const H1 =
  "Dịch vụ thông tắc cống Bãi Cháy 24/7 - xử lý không đục phá tại Hạ Long";

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function parseEnvFile() {
  let text = "";
  let path = "";
  for (const p of ENV_CANDIDATES) {
    try {
      text = readFileSync(p, "utf8");
      path = p;
      break;
    } catch {
      // Try next path because this repo runs from both WSL and Windows shells.
    }
  }
  if (!text) throw new Error("Không tìm thấy .env WordPress auth");

  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error(`Thiếu WP_USERNAME/WP_APP_PASSWORD trong ${path}`);
  }
  return {
    path,
    auth: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`,
  };
}

function wpRequest(method, wpPath, auth, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuffer = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${wpPath}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "codex-bai-chay-seo/1.0",
          ...(bodyBuffer
            ? {
                "Content-Type": "application/json",
                "Content-Length": bodyBuffer.length,
              }
            : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, data, headers: res.headers });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuffer) req.write(bodyBuffer);
    req.end();
  });
}

function publicGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: urlPath,
        method: "GET",
        headers: {
          Host: WP_HOST,
          "User-Agent": "codex-bai-chay-verify/1.0",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, data }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function getFaqItems(raw) {
  let start = -1;
  for (const m of raw.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)) {
    const text = stripTags(m[0]);
    if (/Câu hỏi thường gặp|FAQ/i.test(text)) {
      start = m.index ?? -1;
      break;
    }
  }
  if (start < 0) return [];
  const endMatch = raw.slice(start + 1).search(/<h2[^>]*>/i);
  const section = raw.slice(start, endMatch > -1 ? start + 1 + endMatch : raw.length);
  const items = [];
  const pattern = /<h3[^>]*>\s*Q:\s*([\s\S]*?)<\/h3>\s*<p>\s*A:\s*([\s\S]*?)<\/p>/gi;
  for (const m of section.matchAll(pattern)) {
    items.push({ q: stripTags(m[1]), a: stripTags(m[2]) });
  }
  return items.slice(0, 8);
}

function schemaBlock(faqItems, modifiedIso) {
  const localBusinessId = `https://${WP_HOST}/#localbusiness`;
  const serviceId = `https://${WP_HOST}/${SLUG}/#service`;
  const pageId = `https://${WP_HOST}/${SLUG}/#webpage`;
  const graph = [
    {
      "@type": "LocalBusiness",
      "@id": localBusinessId,
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: `https://${WP_HOST}/`,
      telephone: ["0963.953.533", "0931.156.756"],
      priceRange: "$$",
      image: `https://${WP_HOST}/wp-content/uploads/2026/05/thong-tac-cong-bai-chay-may-lo-xo.webp`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hạ Long",
        addressRegion: "Quảng Ninh",
        addressCountry: "VN",
      },
      areaServed: [
        { "@type": "AdministrativeArea", name: "Bãi Cháy, Hạ Long, Quảng Ninh" },
        { "@type": "AdministrativeArea", name: "Cái Dăm, Hạ Long, Quảng Ninh" },
        { "@type": "AdministrativeArea", name: "Vườn Đào, Hạ Long, Quảng Ninh" },
        { "@type": "AdministrativeArea", name: "Tuần Châu, Hạ Long, Quảng Ninh" },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "0963.953.533",
          contactType: "customer service",
          areaServed: "VN-QN",
          availableLanguage: "vi",
        },
      ],
      sameAs: ["https://www.facebook.com/moitruongquangninh"],
      hasMap: "https://www.google.com/maps?q=B%C3%A3i%20Ch%C3%A1y%20H%E1%BA%A1%20Long%20Qu%E1%BA%A3ng%20Ninh",
    },
    {
      "@type": "Service",
      "@id": serviceId,
      name: "Thông tắc cống Bãi Cháy",
      serviceType: "Thông tắc cống",
      provider: { "@id": localBusinessId },
      areaServed: [
        "Bãi Cháy",
        "Cái Dăm",
        "Vườn Đào",
        "Phố cổ Bãi Cháy",
        "Hùng Thắng",
        "Tuần Châu",
        "Hạ Long",
      ],
      url: `https://${WP_HOST}/${SLUG}/`,
      description:
        "Dịch vụ thông tắc cống Bãi Cháy Hạ Long 24/7, xử lý cống tắc nhà dân, nhà hàng, khách sạn, homestay bằng thiết bị chuyên dụng, báo giá trước khi làm.",
      offers: {
        "@type": "Offer",
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        url: `https://${WP_HOST}/${SLUG}/`,
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "VND",
          description: "Báo giá theo tình trạng thực tế sau khảo sát, thông báo trước khi thi công.",
        },
      },
      dateModified: modifiedIso,
    },
    {
      "@type": "FAQPage",
      "@id": `https://${WP_HOST}/${SLUG}/#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "WebPage",
      "@id": pageId,
      url: `https://${WP_HOST}/${SLUG}/`,
      name: SEO_TITLE,
      about: { "@id": serviceId },
      isPartOf: { "@id": `https://${WP_HOST}/#website` },
      inLanguage: "vi-VN",
      dateModified: modifiedIso,
    },
  ];
  return `<script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2)}\n</script>`;
}

function patchContent(raw, modifiedIso) {
  let next = raw;
  const changes = [];

  if (!/<h1[\s>]/i.test(next)) {
    next = `<h1>${H1}</h1>\n${next}`;
    changes.push("add_h1");
  }

  if (next.includes("ảnh hưởng nghiêm trọng đến rõ giá kinh doanh")) {
    next = next.replace("ảnh hưởng nghiêm trọng đến rõ giá kinh doanh", "ảnh hưởng nghiêm trọng đến hoạt động kinh doanh");
    changes.push("fix_intro_typo");
  }

  const eeatBlock = `<h2><a id="ve-don-vi"></a>Về đơn vị phụ trách thông tắc cống tại Bãi Cháy</h2>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> phụ trách nhóm dịch vụ hút bể phốt, thông tắc cống, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh. Với trang này, nội dung tập trung riêng vào các ca <strong>thông tắc cống Bãi Cháy</strong> cho nhà dân, nhà hàng, khách sạn, homestay và khu lưu trú du lịch.</p>
<p>Thông tin có thể kiểm chứng ngay trên website: hotline <strong>0963.953.533 / 0931.156.756</strong>, phạm vi phục vụ Bãi Cháy - Hạ Long - Quảng Ninh, thời gian tiếp nhận 24/7, quy trình khảo sát trước khi báo giá và nhóm thiết bị xử lý gồm máy lò xo, máy nén khí, máy phun áp lực, dụng cụ kiểm tra hố ga. Các thông tin như năm thành lập, giấy chứng nhận, giải thưởng hoặc review định danh khách hàng cần có hồ sơ xác minh trước khi công bố công khai.</p>
<p><strong>NAP đang dùng trên trang:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh - Hotline <strong>0963.953.533 / 0931.156.756</strong> - khu vực phục vụ Bãi Cháy, Cái Dăm, Vườn Đào, phố cổ Bãi Cháy, Hùng Thắng, Tuần Châu và TP. Hạ Long.</p>`;
  if (!next.includes('id="ve-don-vi"')) {
    next = next.replace(/<hr>\s*<h2><a id="khi-nao-can-goi"><\/a>/, `<hr>\n${eeatBlock}\n<h2><a id="khi-nao-can-goi"></a>`);
    changes.push("add_safe_eeat_nap_block");
  }

  const mapBlock = `<h2><a id="ban-do-khu-vuc"></a>Bản đồ khu vực phục vụ Bãi Cháy - Hạ Long</h2>
<p>Bản đồ dưới đây dùng để định vị khu vực phục vụ chính quanh Bãi Cháy, Cái Dăm, Vườn Đào, phố cổ Bãi Cháy, Hùng Thắng và các điểm lân cận tại TP. Hạ Long. Khi gọi <strong>0963.953.533</strong>, kỹ thuật viên sẽ xác nhận vị trí cụ thể trước khi điều thợ.</p>
<iframe title="Bản đồ khu vực phục vụ thông tắc cống Bãi Cháy Hạ Long" src="https://www.google.com/maps?q=B%C3%A3i%20Ch%C3%A1y%20H%E1%BA%A1%20Long%20Qu%E1%BA%A3ng%20Ninh&output=embed" width="100%" height="360" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  if (!next.includes('id="ban-do-khu-vuc"')) {
    next = next.replace(/<h2><a id="faq"><\/a>Câu hỏi thường gặp<\/h2>/, `${mapBlock}\n<h2><a id="faq"></a>Câu hỏi thường gặp</h2>`);
    changes.push("add_google_map_embed");
  }

  const faqVisibleReplacements = [
    [
      "Nhờ văn phòng chi nhánh trực chiến ngay tại khu Cái Dăm (Bãi Cháy), thợ của chúng tôi thường sẽ có mặt tại nhà quý khách trong vòng 15 đến 30 phút sau khi tiếp nhận yêu cầu qua điện thoại, tùy thuộc vào tình hình giao thông trên trục đường Hạ Long.",
      "Sau khi tiếp nhận yêu cầu qua điện thoại, đội kỹ thuật sẽ hỏi nhanh vị trí và tình trạng tắc để báo thời gian đến dự kiến. Các điểm gần trung tâm Bãi Cháy, Cái Dăm, Vườn Đào thường được ưu tiên điều thợ gần nhất, thời gian thực tế phụ thuộc giao thông và ca đang xử lý.",
    ],
    [
      "Có. Tất cả các dịch vụ thông tắc cống tiêu chuẩn do chúng tôi thực hiện đều được bảo hành bằng văn bản đóng dấu công ty với thời gian bảo hành lên đến 12 tháng tùy thuộc vào tình trạng đường ống của khách hàng.",
      "Có. Thời gian bảo hành phụ thuộc nguyên nhân tắc, tình trạng đường ống và hạng mục đã xử lý. Kỹ thuật viên sẽ ghi rõ điều kiện bảo hành sau khi khảo sát, tránh hứa quá mức khi đường ống đã gãy, lún hoặc sai độ dốc.",
    ],
  ];
  for (const [from, to] of faqVisibleReplacements) {
    if (next.includes(from)) {
      next = next.replace(from, to);
      changes.push("tighten_unverified_faq_claim");
    }
  }

  const napOld = `<p>Môi Trường Đô Thị Số 1 Quảng Ninh là đơn vị có đầy đủ tư cách pháp nhân, hóa đơn VAT và giấy phép xử lý chất thải theo quy chuẩn của [Bộ Tài nguyên và Môi trường](https://www.monre.gov.vn), đảm bảo mang lại sự yên tâm tuyệt đối cho khách hàng cá nhân và doanh nghiệp kinh doanh dịch vụ tại Bãi Cháy.</p>
<p>*   <strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh (Chi nhánh Bãi Cháy) *   <strong>Địa chỉ văn phòng trực:</strong> Tổ 4, Khu 2, phường Bãi Cháy, TP. Hạ Long, Quảng Ninh (Gần chợ Cái Dăm) *   <strong>Hotline hỗ trợ 24/7:</strong> <strong>0963.953.533 / 0931.156.756</strong> *   <strong>Thời gian phục vụ:</strong> Toàn bộ các ngày trong tuần, làm việc kể cả lễ, Tết *   <strong>Chính sách dịch vụ:</strong> Khảo sát tận nơi miễn phí, báo giá trước thi công, cam kết không đục phá, bảo hành 12 tháng bằng phiếu đóng dấu đỏ.</p>`;
  const napNew = `<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> tiếp nhận yêu cầu thông tắc cống, hút bể phốt, nạo vét hố ga và xử lý mùi hôi tại khu vực Bãi Cháy - Hạ Long. Khi khách gọi, đội kỹ thuật xác nhận địa chỉ, tình trạng tắc, khả năng tiếp cận bằng xe/máy và báo hướng xử lý trước khi đến.</p>
<p><strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh<br>
<strong>Khu vực phục vụ:</strong> Bãi Cháy, Cái Dăm, Vườn Đào, phố cổ Bãi Cháy, Hùng Thắng, Tuần Châu, TP. Hạ Long, Quảng Ninh<br>
<strong>Hotline hỗ trợ 24/7:</strong> <strong>0963.953.533 / 0931.156.756</strong><br>
<strong>Thời gian phục vụ:</strong> 24/7, kể cả cuối tuần và ngày lễ<br>
<strong>Chính sách dịch vụ:</strong> Khảo sát tình trạng, báo giá trước khi thi công, ưu tiên xử lý bằng thiết bị không đục phá khi điều kiện đường ống cho phép.</p>
<p><em>Lưu ý NAP:</em> địa chỉ trụ sở/văn phòng Hạ Long cần được đối chiếu với Google Business Profile và Facebook trước khi công bố dạng street address cố định trên mọi nền tảng.</p>`;
  if (next.includes(napOld)) {
    next = next.replace(napOld, napNew);
    changes.push("replace_unverified_nap_claims");
  }

  const faqItems = getFaqItems(next);
  if (faqItems.length < 3) throw new Error("FAQ visible quá ít, không tạo schema FAQPage");
  const schemas = schemaBlock(faqItems, modifiedIso);
  const withoutSchemas = next.replace(/\s*<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>\s*/gi, "\n");
  next = `${withoutSchemas.trim()}\n\n${schemas}\n`;
  changes.push("replace_json_ld_graph");

  return { content: next, changes, faqCount: faqItems.length };
}

function inspectHtml(html) {
  return {
    h1Count: (html.match(/<h1[\s>]/gi) || []).length,
    hasTargetH1: html.includes(H1),
    hasLocalBusiness: html.includes('"@type":"LocalBusiness"') || html.includes('"@type": "LocalBusiness"'),
    hasFAQPage: html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"'),
    hasService: html.includes('"@type":"Service"') || html.includes('"@type": "Service"'),
    hasMapIframe: html.includes("google.com/maps") && html.includes("output=embed"),
    hasPrimaryPhone: html.includes("0963.953.533"),
    hasMetaDescription: html.includes(META_DESCRIPTION),
    hasSeoTitle: html.includes(SEO_TITLE),
  };
}

async function main() {
  const runStamp = stamp();
  const { auth, path: envPath } = parseEnvFile();
  const postRes = await wpRequest(
    "GET",
    `/wp/v2/posts/${POST_ID}?context=edit&_fields=id,slug,status,modified,link,title,excerpt,content,meta`,
    auth,
  );
  if (postRes.status !== 200) throw new Error(`GET post failed: ${postRes.status}`);

  const raw = postRes.data.content.raw || "";
  const before = {
    id: postRes.data.id,
    slug: postRes.data.slug,
    status: postRes.data.status,
    modified: postRes.data.modified,
    rawLength: raw.length,
    h1Count: (raw.match(/<h1[\s>]/gi) || []).length,
    jsonLdCount: (raw.match(/application\/ld\+json/gi) || []).length,
  };

  const modifiedIso = new Date().toISOString();
  const patched = patchContent(raw, modifiedIso);
  const afterLocal = {
    rawLength: patched.content.length,
    h1Count: (patched.content.match(/<h1[\s>]/gi) || []).length,
    jsonLdCount: (patched.content.match(/application\/ld\+json/gi) || []).length,
    faqCount: patched.faqCount,
    titleLen: [...SEO_TITLE].length,
    metaDescriptionLen: [...META_DESCRIPTION].length,
  };

  const report = {
    runStamp,
    write: WRITE,
    envPathUsed: envPath,
    target: {
      id: POST_ID,
      slug: SLUG,
      url: `https://${WP_HOST}/${SLUG}/`,
    },
    before,
    afterLocal,
    changes: patched.changes,
    updatePost: null,
    updateMeta: null,
    verify: null,
  };

  const backupDir = join(PROJECT, "seo-revisions", `wp-before-bai-chay-h1-schema-${runStamp}`);
  const backupPath = join(backupDir, `posts-${POST_ID}-${SLUG}.json`);
  const reportPath = join(PROJECT, `WORDPRESS_PATCH_TTC_BAI_CHAY_H1_SCHEMA_${runStamp}.json`);

  if (WRITE) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(backupPath, JSON.stringify(postRes.data, null, 2), "utf8");
    report.backupPath = backupPath;

    report.updatePost = await wpRequest("POST", `/wp/v2/posts/${POST_ID}`, auth, {
      content: patched.content,
      title: SEO_TITLE,
      excerpt: META_DESCRIPTION,
    });

    report.updateMeta = await wpRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: POST_ID,
      meta: {
        rank_math_title: SEO_TITLE,
        rank_math_description: META_DESCRIPTION,
        rank_math_focus_keyword: FOCUS_KEYWORD,
      },
    });

    const cb = `bai-chay-h1-schema-${Date.now()}`;
    const publicRes = await publicGet(`/${SLUG}/?nowprocket=1&codex=${cb}`);
    report.verify = {
      url: `https://${WP_HOST}/${SLUG}/?nowprocket=1&codex=${cb}`,
      status: publicRes.status,
      checks: inspectHtml(publicRes.data),
    };
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    write: WRITE,
    before,
    afterLocal,
    changes: patched.changes,
    backupPath: report.backupPath || null,
    reportPath,
    updatePostStatus: report.updatePost?.status || null,
    updateMetaStatus: report.updateMeta?.status || null,
    verify: report.verify,
  }, null, 2));
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
