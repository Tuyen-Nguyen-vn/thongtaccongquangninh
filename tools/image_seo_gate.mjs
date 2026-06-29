import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT = process.env.TTCQN_PROJECT_ROOT
  ? resolve(process.env.TTCQN_PROJECT_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const IMAGE_BRIEF_DIR = join(PROJECT, "image-briefs");
export const PENDING_STATUS = "PENDING_IMAGE_SEO";
export const READY_STATUS = "READY_FOR_REVIEW";
export const MAX_IMAGE_KB = 450;

const SERVICE_RULES = [
  {
    service: "hút bể phốt",
    pattern: /hút bể phốt/iu,
    shouldUse: ["xe bồn", "ống hút", "hố ga", "bể phốt", "thợ kéo ống"],
    shouldAvoid: ["ảnh chỉ có máy lò xo trong nhà vệ sinh"],
  },
  {
    service: "thông tắc cống",
    pattern: /thông tắc cống/iu,
    shouldUse: ["máy lò xo", "cống", "hố ga", "đường ống", "thợ xử lý ngoài trời/bếp"],
    shouldAvoid: ["ảnh xe hút bể phốt nếu bài không nói đến hút"],
  },
  {
    service: "thông tắc bồn cầu",
    pattern: /thông tắc bồn cầu/iu,
    shouldUse: ["bồn cầu", "máy lò xo", "nhà vệ sinh", "thợ kiểm tra xả nước"],
    shouldAvoid: ["ảnh xe bồn", "ảnh hố ga công nghiệp"],
  },
  {
    service: "thông tắc chậu rửa",
    pattern: /thông tắc chậu rửa|chậu rửa|bồn rửa|lavabo/iu,
    shouldUse: ["chậu rửa", "tủ bếp", "ống thoát", "thợ xử lý dưới lavabo/bồn rửa"],
    shouldAvoid: ["ảnh bể phốt", "xe bồn"],
  },
  {
    service: "nạo vét hố ga",
    pattern: /nạo vét hố ga|nạo vét/iu,
    shouldUse: ["hố ga", "nắp cống", "bùn thải", "xe hút", "ống hút"],
    shouldAvoid: ["ảnh bồn cầu trong nhà vệ sinh"],
  },
];

export function field(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(text).match(new RegExp(`^${escaped}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

export function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

export function slugify(input) {
  return normalize(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractSection(text, startPattern) {
  const match = startPattern.exec(text);
  if (!match) return "";
  const rest = text.slice(match.index + match[0].length);
  const next = /\n##\s+/u.exec(rest);
  return rest.slice(0, next ? next.index : undefined).trim();
}

function cleanMarkdownText(input) {
  return String(input ?? "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionSummary(input, maxLength = 240) {
  const text = cleanMarkdownText(input);
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function detectService(focusKeyword, h1) {
  const source = `${focusKeyword} ${h1}`;
  return SERVICE_RULES.find((rule) => rule.pattern.test(source)) ?? {
    service: focusKeyword.split(/\s+/).slice(0, 3).join(" "),
    shouldUse: ["ảnh đúng dịch vụ", "thiết bị thi công", "thợ xử lý", "bối cảnh địa phương"],
    shouldAvoid: ["ảnh sai dịch vụ", "ảnh sai địa phương"],
  };
}

export function parseMarkdownArticle(markdownPath) {
  const absolutePath = resolve(markdownPath);
  const text = readFileSync(absolutePath, "utf8");
  const focusKeyword = field(text, "Focus Keyword");
  const fileSlug = basename(absolutePath, ".md");
  const focusSlug = slugify(focusKeyword);
  const fileSlugPaths = briefPaths(fileSlug);
  const slug =
    field(text, "Slug") ||
    ((existsSync(fileSlugPaths.md) || existsSync(fileSlugPaths.json) || existsSync(fileSlugPaths.packageJson))
      ? fileSlug
      : focusSlug || fileSlug);
  const searchIntent = field(text, "Search Intent");
  const h1 = (text.match(/^#\s+(.+)$/m) ?? [null, ""])[1].trim();
  const serviceRule = detectService(focusKeyword, h1);
  const area = focusKeyword.replace(new RegExp(`^${serviceRule.service}\\s+`, "iu"), "").trim() || "";
  const caseStudy = extractSection(text, /##\s+Case study/i);
  const serviceAreaSection = sectionSummary(extractSection(text, /##\s+(Khu vực|Phường|Địa bàn|Khu vực phục vụ)/i));
  return {
    markdownPath: absolutePath,
    text,
    slug,
    url: `https://thongtaccongquangninh.com/${slug}/`,
    focusKeyword,
    service: serviceRule.service,
    area,
    subAreas: serviceAreaSection,
    searchIntent,
    h1,
    caseStudy: sectionSummary(caseStudy, 900),
    shouldUse: serviceRule.shouldUse,
    shouldAvoid: serviceRule.shouldAvoid,
  };
}

export function briefPaths(slug) {
  return {
    md: join(IMAGE_BRIEF_DIR, `${slug}-image-brief.md`),
    json: join(IMAGE_BRIEF_DIR, `${slug}-image-brief.json`),
    packageJson: join(IMAGE_BRIEF_DIR, `${slug}-image-package.json`),
    statusJson: join(IMAGE_BRIEF_DIR, `${slug}-image-status.json`),
  };
}

export function createImageSeoBrief(markdownPath) {
  const article = parseMarkdownArticle(markdownPath);
  const paths = briefPaths(article.slug);
  mkdirSync(IMAGE_BRIEF_DIR, { recursive: true });

  const imageSlots = [
    ["Ảnh 1 - Ảnh đầu bài", "sau mở bài", "Xác nhận đúng dịch vụ, đúng địa phương, đúng nhu cầu xử lý gấp."],
    ["Ảnh 2 - Ảnh khu vực phục vụ", "trong phần khu vực phục vụ", "Gợi bối cảnh địa phương/phường/xã phụ, không dùng sai địa bàn."],
    ["Ảnh 3 - Ảnh case study", "trong phần case study", "Bám tình huống case study chính của bài."],
    ["Ảnh 4 - Ảnh quy trình thi công", "trong phần quy trình", "Thể hiện thiết bị, thợ và thao tác xử lý."],
    ["Ảnh 5 - Ảnh CTA/niềm tin", "trước CTA cuối bài", "Tăng niềm tin nhưng không thiết kế kiểu poster."],
  ];

  const brief = {
    status: PENDING_STATUS,
    createdAt: new Date().toISOString(),
    slug: article.slug,
    url: article.url,
    focusKeyword: article.focusKeyword,
    service: article.service,
    area: article.area,
    subAreas: article.subAreas,
    searchIntent: article.searchIntent,
    caseStudy: article.caseStudy,
    shouldUse: article.shouldUse,
    shouldAvoid: article.shouldAvoid,
    imageSlots: imageSlots.map(([name, placement, purpose]) => ({ name, placement, purpose })),
  };

  const md = `# IMAGE BRIEF SEO LOCAL

## 1. Thông tin bài viết
- URL: ${article.url}
- Từ khóa chính: ${article.focusKeyword}
- Dịch vụ: ${article.service}
- Địa phương: ${article.area}
- Khu vực/phường/xã phụ: ${article.subAreas || "Cần Image Agent đọc bài và bám đúng khu vực phụ trong nội dung."}
- Search intent: ${article.searchIntent || "Khách cần xử lý sự cố nhanh tại địa phương."}
- Loại trang: dịch vụ / landing page / trang phường

## 2. Nội dung bài
- Tóm tắt bài: ${article.h1 || article.focusKeyword}
- Case study chính: ${article.caseStudy || "Chưa trích xuất được case study, cần đọc lại bài trước khi thiết kế."}
- Nỗi đau khách hàng: tắc nghẽn, mùi hôi, trào ngược, gián đoạn sinh hoạt/kinh doanh.
- CTA chính: Gọi 0963.953.533 / 0931.156.756.

## 3. Loại ảnh đúng dịch vụ
- Nên có: ${article.shouldUse.join(", ")}
- Không nên dùng: ${article.shouldAvoid.join(", ")}

## 4. Ảnh cần tạo
Tạo bộ 3-5 ảnh SEO cho bài này.

${imageSlots
  .map(
    ([name, placement, purpose]) => `### ${name}
- Mục đích: ${purpose}
- Bối cảnh: công trình thực tế, tự nhiên, đúng dịch vụ ${article.service}
- Nhân vật: thợ đang thao tác, trang phục gọn
- Thiết bị: ${article.shouldUse.join(", ")}
- Địa phương cần thể hiện: ${article.area}
- Tỉ lệ ảnh: 16:9 hoặc 4:3, đủ rộng để dùng trong WordPress
- Vị trí chèn: ${placement}
- Tên file đề xuất: ${article.slug}-${slugify(name)}.webp
- Alt text đề xuất: Ảnh minh họa dịch vụ ${article.service} tại ${article.area}
- Caption AI/chỉnh sửa: Ảnh minh họa dịch vụ ${article.service} tại ${article.area}`
  )
  .join("\n\n")}

## 5. Yêu cầu phong cách ảnh
- Ảnh thực tế, tự nhiên, giống ảnh chụp điện thoại.
- Không thiết kế kiểu poster.
- Không thêm chữ lớn lên ảnh.
- Không thêm logo giả.
- Không làm ảnh quá bóng bẩy như quảng cáo.
- Ưu tiên cảm giác thi công thật, có thiết bị, có thợ, có bối cảnh công trình.
- Nếu dùng ảnh AI/chỉnh sửa thì caption phải ghi là ảnh minh họa.

## 6. Metadata cần trả về
Với mỗi ảnh, trả về:
- Tên file:
- Alt text:
- Caption:
- Trang sử dụng: ${article.url}
- Vị trí chèn:
- Ghi chú: ai / edited_ai / verified_real
`;

  writeFileSync(paths.md, md, "utf8");
  writeFileSync(paths.json, JSON.stringify(brief, null, 2), "utf8");
  const status = {
    status: PENDING_STATUS,
    slug: article.slug,
    briefPath: paths.md,
    briefJsonPath: paths.json,
    packagePath: paths.packageJson,
    nextAction: "Gửi Image Brief sang ChatGPT/Image Agent và nhận lại ảnh + metadata.",
  };
  writeFileSync(paths.statusJson, JSON.stringify(status, null, 2), "utf8");
  return { article, paths, brief, status };
}

function isAsciiFileName(fileName) {
  return /^[a-z0-9._-]+$/u.test(String(fileName ?? ""));
}

function imageSizeKb(image) {
  if (Number.isFinite(Number(image.fileSizeKb))) return Number(image.fileSizeKb);
  if (image.filePath && existsSync(image.filePath)) {
    return Math.round(statSync(image.filePath).size / 1024);
  }
  return null;
}

function hasAnyImage(images, terms) {
  return images.some((image) => {
    const haystack = normalize(
      `${image.slot || ""} ${image.type || ""} ${image.placement || ""} ${image.fileName || ""} ${image.caption || ""}`
    );
    return terms.some((term) => haystack.includes(normalize(term)));
  });
}

export function checkImageSeoPackage(input) {
  const article = input.markdownPath ? parseMarkdownArticle(input.markdownPath) : null;
  const slug = input.slug || article?.slug;
  const paths = briefPaths(slug);
  const issues = [];

  if (!existsSync(paths.md) && !existsSync(paths.json)) issues.push("Chưa có Image Brief.");
  if (!existsSync(paths.packageJson)) {
    return {
      ok: false,
      status: PENDING_STATUS,
      slug,
      packagePath: paths.packageJson,
      issues: [...issues, "Chưa có image package từ ChatGPT/Image Agent."],
    };
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(paths.packageJson, "utf8"));
  } catch (error) {
    return {
      ok: false,
      status: PENDING_STATUS,
      slug,
      packagePath: paths.packageJson,
      issues: [...issues, `Image package JSON lỗi: ${error.message}`],
    };
  }

  if (pkg.status !== READY_STATUS) issues.push(`Package status phải là ${READY_STATUS}.`);
  if (pkg.slug !== slug) issues.push(`Slug package không khớp: ${pkg.slug || ""}.`);

  const service = pkg.service || article?.service || "";
  const area = pkg.area || article?.area || "";
  const images = Array.isArray(pkg.images) ? pkg.images : [];
  if (images.length < 3) issues.push("Cần tối thiểu 3 ảnh cho bài địa phương.");
  if (!hasAnyImage(images, ["đầu bài", "dau bai", "hero", "sau mở bài"])) {
    issues.push("Thiếu ảnh đầu bài.");
  }
  if (!hasAnyImage(images, ["case study", "case", "e-e-a-t"])) {
    issues.push("Thiếu ảnh case study.");
  }
  if (!hasAnyImage(images, ["quy trình", "quy trinh", "process", "thi công"])) {
    issues.push("Thiếu ảnh quy trình thi công.");
  }

  const sourceType = pkg.sourceType || "";
  const sourceIsAi = sourceType === "ai" || sourceType === "edited_ai";
  const usedFileNames = new Set();

  images.forEach((image, index) => {
    const label = `Ảnh ${index + 1}`;
    const fileName = image.fileName || "";
    const altText = image.altText || "";
    const caption = image.caption || "";
    const placement = image.placement || "";
    const pageUrl = image.pageUrl || image.page || image.usedOn || "";
    const note = image.note || image.sourceNote || image.ghiChu || "";
    const joined = `${fileName} ${altText} ${caption}`;

    if (!fileName) issues.push(`${label}: thiếu tên file.`);
    if (fileName && !isAsciiFileName(fileName)) issues.push(`${label}: tên file phải không dấu, chỉ dùng a-z, 0-9, ., _, -.`);
    if (fileName && !/\.(webp|jpe?g)$/iu.test(fileName)) issues.push(`${label}: ảnh phải là WebP/JPG.`);
    if (fileName && usedFileNames.has(fileName)) issues.push(`${label}: trùng tên file trong package.`);
    usedFileNames.add(fileName);
    const sizeKb = imageSizeKb(image);
    if (sizeKb === null) issues.push(`${label}: thiếu fileSizeKb hoặc filePath để kiểm tra dung lượng.`);
    if (sizeKb !== null && sizeKb > MAX_IMAGE_KB) issues.push(`${label}: ảnh quá nặng (${sizeKb}KB > ${MAX_IMAGE_KB}KB).`);
    if (!altText) issues.push(`${label}: thiếu alt text.`);
    if (!caption) issues.push(`${label}: thiếu caption.`);
    if (!placement) issues.push(`${label}: thiếu vị trí chèn.`);
    if (!pageUrl) issues.push(`${label}: thiếu trang sử dụng.`);
    if (!note && !sourceType) issues.push(`${label}: thiếu ghi chú ảnh thật/ảnh minh họa.`);
    if (service && !normalize(joined).includes(normalize(service))) issues.push(`${label}: chưa bám dịch vụ "${service}".`);
    if (area && !normalize(joined).includes(normalize(area))) issues.push(`${label}: chưa bám địa phương "${area}".`);
    if (service && fileName && !fileName.includes(slugify(service))) {
      issues.push(`${label}: tên file chưa chứa dịch vụ.`);
    }
    if (area && fileName && !fileName.includes(slugify(area))) {
      issues.push(`${label}: tên file chưa chứa địa phương.`);
    }
    if (Number(image.reusedAcrossPages ?? 1) > 1) {
      issues.push(`${label}: không dùng cùng 1 ảnh cho quá nhiều trang địa phương.`);
    }
    if (image.duplicateOf || image.duplicatePercent === 100) {
      issues.push(`${label}: ảnh trùng 100% với trang địa phương khác.`);
    }
    if (image.containsPrivateInfo === true || image.privacyOk === false) {
      issues.push(`${label}: ảnh lộ thông tin riêng tư khách hàng hoặc chưa xác nhận privacy.`);
    }
    if (image.customerFaceVisible === true && image.faceConsent !== true) {
      issues.push(`${label}: ảnh lộ mặt khách khi chưa có xác nhận cho phép.`);
    }
    if (image.isPoster === true || /poster quảng cáo|poster/iu.test(note)) {
      issues.push(`${label}: không dùng poster quảng cáo thay cho ảnh thi công.`);
    }
    if (/thực tế|thi công thực tế/iu.test(caption) && sourceIsAi) {
      issues.push(`${label}: ảnh AI/chỉnh sửa không được ghi là thực tế.`);
    }
    if (sourceIsAi && !/^Ảnh minh họa/iu.test(caption)) {
      issues.push(`${label}: caption AI/chỉnh sửa phải bắt đầu bằng "Ảnh minh họa".`);
    }
  });

  return {
    ok: issues.length === 0,
    status: issues.length === 0 ? READY_STATUS : PENDING_STATUS,
    slug,
    packagePath: paths.packageJson,
    imageCount: images.length,
    issues,
  };
}

export function assertImageSeoReadyForPublish(input) {
  const result = checkImageSeoPackage(input);
  if (!result.ok) {
    const error = new Error(`${PENDING_STATUS}: ${result.issues.join(" ")}`);
    error.code = PENDING_STATUS;
    error.result = result;
    throw error;
  }
  return result;
}
