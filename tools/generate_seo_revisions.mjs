import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const CONNECTOR_ENV =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const OUT_DIR = join(PROJECT, "seo-revisions", "2026-04-29");
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-backup-2026-04-29");

const HOTLINE = "0963.953.533 / 0931.156.756";
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const SYMBOL_RE = /[⭐✅☎️⏱️➜→‹›「」【】]/g;

const targetSlugs = [
  "dau-hieu-be-phot-can-hut",
  "hut-be-phot-bai-chay",
  "cach-xu-ly-cong-thoat-nuoc-tac",
  "bang-gia-hut-be-phot-quang-ninh-2026",
  "nao-vet-ho-ga-quang-ninh",
  "xu-ly-mui-hoi-quang-ninh",
  "thong-tac-cong-quang-ninh",
  "hut-be-phot-ha-long",
  "hut-be-phot-cam-pha",
  "hut-be-phot-uong-bi",
  "hut-be-phot-mong-cai",
  "hut-be-phot-van-don",
  "hut-be-phot-hoanh-bo",
  "thong-tac-bon-cau-ha-long",
  "thong-tac-cong-cam-pha",
  "thong-tac-cong-uong-bi",
  "thong-tac-cong-quang-yen",
  "thong-tac-cong-dong-trieu",
  "thong-tac-cong-mong-cai",
  "thong-tac-cong-van-don",
  "thong-tac-bon-cau-van-don",
  "thong-tac-chau-rua-quang-ninh",
  "thong-tac-cong-nha-hang-ha-long",
  "thong-tac-bon-cau-quang-ninh",
  "hut-be-phot-dong-trieu",
  "hut-be-phot-quang-yen",
  "thong-tac-toilet-quang-ninh",
  "thong-tac-bon-cau-quang-yen",
  "thong-tac-bon-cau-dong-trieu",
  "thong-tac-bon-cau-mong-cai",
  "thong-tac-cong-ha-long",
  "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
  "thong-tac-cong-ngo-nho-ha-long",
  "thong-tac-cong-chung-cu-ha-long",
  "hut-be-phot-quang-ninh",
  "bang-gia",
];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

function cleanText(input) {
  let value = String(input ?? "").replace(SYMBOL_RE, " ");
  const replacements = [
    [/chuyên nghiệp/gi, "đúng kỹ thuật"],
    [/uy tín/gi, "rõ giá"],
    [/hàng đầu/gi, "được gọi nhiều"],
    [/tận tâm/gi, "làm rõ việc"],
  ];
  for (const [from, to] of replacements) value = value.replace(from, to);
  return value.replace(/\s+/g, " ").trim();
}

function cleanHtml(input) {
  let value = String(input ?? "").replace(SYMBOL_RE, "");
  const replacements = [
    [/chuyên nghiệp/gi, "đúng kỹ thuật"],
    [/uy tín/gi, "rõ giá"],
    [/hàng đầu/gi, "được gọi nhiều"],
    [/tận tâm/gi, "làm rõ việc"],
  ];
  for (const [from, to] of replacements) value = value.replace(from, to);
  return value.replace(/[ \t]+$/gm, "").trim();
}

function titleCaseLocation(raw) {
  return raw
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const map = {
        ha: "Hạ",
        long: "Long",
        cam: "Cẩm",
        pha: "Phả",
        uong: "Uông",
        bi: "Bí",
        mong: "Móng",
        cai: "Cái",
        van: "Vân",
        don: "Đồn",
        hoanh: "Hoành",
        bo: "Bồ",
        quang: "Quảng",
        yen: "Yên",
        dong: "Đông",
        trieu: "Triều",
        bai: "Bãi",
        chay: "Cháy",
        ninh: "Ninh",
      };
      return map[part] ?? part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function profileFromSlug(slug) {
  let service = "Thông tắc cống";
  let location = "Quảng Ninh";
  let intent = "local";
  let priceUnit = "lần";
  let startPrice = "150.000đ";

  if (slug.includes("hut-be-phot")) {
    service = "Hút bể phốt";
    priceUnit = "khối";
    startPrice = "200.000đ";
  } else if (slug.includes("toilet")) {
    service = "Thông tắc toilet";
    priceUnit = "lần";
    startPrice = "100.000đ";
  } else if (slug.includes("bon-cau")) {
    service = "Thông tắc bồn cầu";
    priceUnit = "lần";
    startPrice = "100.000đ";
  } else if (slug.includes("chau-rua")) {
    service = "Thông tắc chậu rửa";
    startPrice = "120.000đ";
  } else if (slug.includes("nao-vet")) {
    service = "Nạo vét hố ga";
    priceUnit = "hố ga";
    startPrice = "300.000đ";
  } else if (slug.includes("xu-ly-mui")) {
    service = "Xử lý mùi hôi";
    priceUnit = "điểm xử lý";
    startPrice = "250.000đ";
  } else if (slug.includes("bang-gia")) {
    service = "Bảng giá hút bể phốt";
    intent = "commercial";
  } else if (slug.includes("dau-hieu")) {
    service = "Dấu hiệu bể phốt cần hút";
    intent = "informational";
  } else if (slug.includes("cach-xu-ly")) {
    service = "Cách xử lý cống thoát nước tắc";
    intent = "informational";
  } else if (slug.includes("nguyen-nhan")) {
    service = "Nguyên nhân cống tắc thường xuyên";
    intent = "informational";
  }

  const locMatch = slug.match(
    /(ha-long|cam-pha|uong-bi|mong-cai|van-don|hoanh-bo|quang-yen|dong-trieu|bai-chay|quang-ninh)/
  );
  if (locMatch) location = titleCaseLocation(locMatch[1]);
  if (slug === "bang-gia") {
    service = "Bảng giá";
    location = "";
  }

  if (slug.includes("nha-hang")) service = "Thông tắc cống nhà hàng";
  if (slug.includes("chung-cu")) service = "Thông tắc cống chung cư";
  if (slug.includes("ngo-nho")) service = "Thông tắc cống ngõ nhỏ";

  const keyword = `${service} ${location}`.replace(/\s+/g, " ").trim();
  return { slug, service, location, keyword, intent, priceUnit, startPrice };
}

function fitTitle(profile) {
  if (profile.slug === "bang-gia") {
    return "Bảng giá hút bể phốt, thông tắc cống Quảng Ninh 2026 mới";
  }
  const choices = [
    `${profile.keyword} không đục phá 24/7, gọi 0963.953.533`,
    `${profile.keyword} tại nhà 24/7, báo giá rõ, gọi 0963.953.533`,
    `${profile.keyword} giá rõ, có mặt nhanh 15 phút`,
  ];
  return cleanText(choices.find((item) => item.length <= 70 && item.length >= 55) ?? choices[0]);
}

function fitDescription(profile) {
  const base = `${profile.keyword} 24/7, có mặt nhanh, không đục phá, báo giá rõ trước khi làm. Gọi ${HOTLINE} để thợ xử lý tại nhà.`;
  if (base.length >= 150 && base.length <= 160) return base;
  const short = `${profile.keyword} 24/7, không đục phá, báo giá rõ, bảo hành sau xử lý. Gọi ${HOTLINE} để thợ đến nhanh.`;
  if (short.length >= 150 && short.length <= 160) return short;
  const pad = " Phục vụ nhà dân, quán ăn, khách sạn, công trình.";
  return (short + pad).slice(0, 159).replace(/\s+\S*$/, "") + ".";
}

function priceRows(profile) {
  return [
    `| ${profile.service} cơ bản | Từ ${profile.startPrice}/${profile.priceUnit} | Kiểm tra tại chỗ, báo giá trước khi làm |`,
    `| Xử lý tắc nặng, đường ống dài | Khảo sát thực tế | Dùng máy lò xo, máy nén hoặc xe bồn theo tình trạng |`,
    `| Ngoài giờ, ban đêm, ngày lễ | Báo trước khi điều xe | Phù hợp ca tắc nghẽn làm gián đoạn sinh hoạt hoặc kinh doanh |`,
    `| Bảo hành sau xử lý | Ghi theo hạng mục | Áp dụng khi nguyên nhân và hiện trạng đáp ứng điều kiện kỹ thuật |`,
  ].join("\n");
}

function paragraphPool(profile) {
  const { service, location, keyword } = profile;
  return [
    `Khi cần ${keyword}, điều quan trọng không phải là gọi thật nhiều số mà là chọn đúng đội có thiết bị phù hợp. Tắc nghẽn, trào ngược, mùi hôi hoặc bể phốt đầy đều cần kiểm tra nguyên nhân trước, sau đó mới chọn máy lò xo, máy nén khí, đầu thông lò xo hoặc xe bồn.`,
    `Tại ${location}, nhiều nhà nằm trong ngõ nhỏ, khu dân cư đông, mặt bằng kinh doanh hẹp hoặc công trình đang vận hành. Vì vậy phương án xử lý phải gọn, hạn chế đục phá, tránh làm bẩn khu vực sinh hoạt và không làm gián đoạn lâu.`,
    `Đội kỹ thuật cần hỏi rõ vị trí tắc, thời điểm phát sinh, dấu hiệu nước rút chậm, mùi hôi và lịch sử xử lý trước đó. Những thông tin này giúp khoanh vùng sự cố, tránh báo giá ảo và tránh làm sai điểm gây tái phát.`,
    `${service} không nên làm theo kiểu thử may rủi. Nếu dùng hóa chất mạnh sai cách, đường ống có thể bị nóng, biến dạng, mùi hóa chất bốc lên hoặc chất thải bị đẩy ngược. Với ca tắc nặng, thiết bị cơ học và khảo sát tại chỗ thường an toàn hơn.`,
    `Khách hàng nên yêu cầu báo giá trước khi thi công, hỏi rõ phạm vi bảo hành và giữ lại thông tin liên hệ sau khi xử lý. Nếu phát sinh hạng mục ngoài dự kiến, thợ phải giải thích nguyên nhân, phương án và chi phí trước khi tiếp tục.`,
  ];
}

function buildSupplement(profile, currentWords) {
  if (currentWords >= 2500) return "";
  const targetTotal = currentWords < 700 ? 2850 : currentWords > 1800 ? 2850 : 2750;
  const need = Math.max(300, Math.min(2600, targetTotal - currentWords));
  const pool = paragraphPool(profile);
  const blocks = [];
  if (currentWords > 1800) {
    blocks.push(`## Bổ sung chuẩn Rank Math cho ${profile.keyword}`);
    blocks.push(`Phần bổ sung này chốt lại các ý quan trọng để bài đủ rõ với người đang cần xử lý gấp: nguyên nhân, giá, quy trình, bảo hành, NAP và câu hỏi thường gặp. Khi dán vào WordPress, đặt sau phần nội dung chính hiện có để không phá bố cục đầu trang.`);
    blocks.push(`## Bảng giá và quy trình 5 bước`);
    blocks.push(`| Hạng mục | Giá tham khảo | Ghi chú |\n|---|---:|---|\n${priceRows(profile)}`);
    blocks.push(`Quy trình gồm 5 bước: tiếp nhận dấu hiệu, khảo sát đúng điểm, báo giá trước khi làm, thi công bằng thiết bị phù hợp, xả thử và bàn giao bảo hành. Khách cần hỏi rõ phạm vi bảo hành để tránh hiểu nhầm khi nguyên nhân tắc đến từ kết cấu cũ hoặc thói quen sử dụng.`);
    blocks.push(`## Case study E-E-A-T và NAP liên hệ`);
    blocks.push(`Một tình huống thường gặp tại ${profile.location} là nước rút chậm nhiều ngày rồi trào ngược vào giờ cao điểm. Cách xử lý đúng là kiểm tra toàn tuyến, xử lý điểm nghẽn bằng máy phù hợp, sau đó xả thử nhiều lần để xác nhận dòng chảy ổn định.`);
    blocks.push(`- Đơn vị: **Môi Trường Đô Thị Số 1 Quảng Ninh**\n- Website: **thongtaccongquangninh.com**\n- Hotline: **${HOTLINE}**\n- Khu vực: **${profile.location}**, Quảng Ninh, Hải Phòng và miền Bắc`);
    blocks.push(`## FAQ về ${profile.keyword}`);
    blocks.push(`### ${profile.keyword} có cần đục phá không?\nKhông đục phá khi chưa xác định cần thiết. Thợ cần kiểm tra nguyên nhân trước, ưu tiên thiết bị cơ học và chỉ đề xuất can thiệp mạnh khi đường ống hỏng hoặc lắp sai.`);
    blocks.push(`### Giá ${profile.keyword} có cố định không?\nGiá phụ thuộc vị trí, độ khó, thiết bị và thời điểm xử lý. Khách được báo giá trước khi làm, nếu phát sinh phải giải thích rõ nguyên nhân.`);
    blocks.push(`### Khi nào nên gọi ngay?\nNên gọi ngay khi nước trào ngược, mùi hôi lan rộng, bồn cầu thoát chậm hoặc hố ga đầy bùn. Gọi **${HOTLINE}** để được hướng dẫn bước xử lý an toàn trước khi thợ đến.`);
    while (countWords(blocks.join("\n\n")) < need) {
      blocks.splice(Math.max(2, blocks.length - 2), 0, pool[(blocks.length + currentWords) % pool.length]);
    }
    return blocks.join("\n\n");
  }
  blocks.push(`## Nguyên nhân khiến khách cần ${profile.keyword} gấp`);
  blocks.push(pool[0], pool[1]);
  blocks.push(`Các nguyên nhân thường gặp gồm chất thải bám lâu ngày, dầu mỡ đóng cục, giấy khó phân hủy, rễ cây chèn vào đường ống, hố ga đầy bùn hoặc bể phốt quá tải. Với nhà hàng, khách sạn và khu trọ, lưu lượng xả lớn làm tình trạng nặng nhanh hơn nhà dân.`);
  blocks.push(`Dấu hiệu cần gọi thợ ngay là nước rút chậm, nghe tiếng ọc ọc, mùi hôi bốc lên theo miệng thoát, bồn cầu trào nước hoặc sân có điểm thấm bẩn. Nếu để lâu, chi phí xử lý thường tăng vì chất thải lan sang nhiều đoạn ống.`);

  blocks.push(`## Tại sao chọn ${profile.service} tại ${profile.location}`);
  blocks.push(pool[2], pool[3], pool[4]);
  blocks.push(`### Cam kết 3 Không`);
  blocks.push(`- **Không đục phá khi chưa cần thiết:** ưu tiên khảo sát, thông cơ học và xử lý đúng điểm tắc trước.\n- **Không báo giá ảo:** báo khoảng giá theo hiện trạng, chốt lại trước khi làm.\n- **Không để tái phát do làm qua loa:** kiểm tra lại dòng chảy, hướng dẫn cách dùng và ghi rõ bảo hành.`);

  blocks.push(`## Bảng giá ${profile.keyword}`);
  blocks.push(`Bảng giá dưới đây là mức tham khảo để khách chủ động trước khi gọi thợ. Giá thực tế phụ thuộc vị trí, độ dài đường ống, khối lượng chất thải, thời điểm điều xe và mức độ tắc nghẽn.`);
  blocks.push(`| Hạng mục | Giá tham khảo | Ghi chú |\n|---|---:|---|\n${priceRows(profile)}`);
  blocks.push(`Muốn biết giá sát nhất, hãy gọi **${HOTLINE}** và mô tả tình trạng hiện tại. Nếu có ảnh hoặc video vị trí tắc, đội kỹ thuật sẽ khoanh vùng nhanh hơn trước khi đến.`);

  blocks.push(`## Quy trình 5 bước xử lý ${profile.keyword}`);
  blocks.push(`1. **Tiếp nhận tình trạng:** hỏi vị trí, dấu hiệu, thời điểm tắc và mức độ ảnh hưởng.\n2. **Khảo sát tại chỗ:** kiểm tra miệng thoát, hố ga, bể phốt, đường ống hoặc thiết bị vệ sinh liên quan.\n3. **Báo giá rõ trước khi làm:** nêu phương án, thiết bị dùng và phạm vi bảo hành.\n4. **Thi công gọn:** dùng máy lò xo, máy nén, đầu thông hoặc xe bồn theo đúng nguyên nhân.\n5. **Kiểm tra lại và bàn giao:** xả thử nhiều lần, vệ sinh khu vực xử lý, hướng dẫn cách hạn chế tái phát.`);

  blocks.push(`## Case study E-E-A-T tại ${profile.location}`);
  blocks.push(`Một ca thường gặp tại ${profile.location} là nước rút chậm nhiều ngày, sau đó bắt đầu trào ngược vào giờ cao điểm sử dụng. Khi kiểm tra, nguyên nhân không chỉ nằm ở miệng thoát mà còn có mảng bám sâu trong đoạn ống chính, vì vậy tự dùng pittong hoặc hóa chất chỉ giảm tạm thời.`);
  blocks.push(`Cách xử lý phù hợp là kiểm tra tuyến ống, đưa đầu lò xo đúng kích thước vào đoạn nghẽn, phá mảng bám theo từng nhịp rồi xả thử liên tục. Nếu liên quan bể phốt đầy hoặc hố ga lắng bùn, cần hút hoặc nạo vét để xử lý tận gốc.`);
  blocks.push(`Kinh nghiệm rút ra: không nên chỉ nhìn điểm nước trào để kết luận nguyên nhân. Với ${profile.keyword}, kiểm tra toàn tuyến giúp giảm nguy cơ làm sai điểm và tránh gọi thợ nhiều lần.`);

  blocks.push(`## NAP liên hệ ${profile.keyword}`);
  blocks.push(`- Đơn vị: **Môi Trường Đô Thị Số 1 Quảng Ninh**\n- Website: **thongtaccongquangninh.com**\n- Hotline: **${HOTLINE}**\n- Khu vực: **${profile.location}**, Quảng Ninh, Hải Phòng và miền Bắc\n- Thời gian hỗ trợ: 24/7, ưu tiên ca tắc nghẽn, mùi hôi, trào ngược cần xử lý nhanh`);

  blocks.push(`## FAQ về ${profile.keyword}`);
  blocks.push(`### ${profile.keyword} bao lâu có mặt?\nTùy vị trí và thời điểm gọi, đội kỹ thuật sẽ báo thời gian di chuyển trước. Với khu vực gần thợ, ca khẩn có thể được ưu tiên điều người trong khoảng 15-30 phút.`);
  blocks.push(`### ${profile.keyword} có phải đục phá không?\nKhông đục phá khi chưa xác định cần thiết. Phần lớn ca tắc nghẽn có thể kiểm tra và xử lý bằng thiết bị cơ học trước, chỉ đề xuất đục phá khi đường ống hư hỏng hoặc lắp sai kết cấu.`);
  blocks.push(`### Giá ${profile.keyword} tính thế nào?\nGiá phụ thuộc nguyên nhân, vị trí, độ khó, thiết bị cần dùng và thời điểm xử lý. Khách được báo giá trước khi làm để tránh phát sinh không rõ ràng.`);
  blocks.push(`### Gọi ngoài giờ có được bảo hành không?\nCó thể bảo hành theo hạng mục nếu nguyên nhân đã xử lý thuộc phạm vi kỹ thuật. Khi bàn giao, khách nên hỏi rõ thời gian bảo hành và điều kiện áp dụng.`);
  blocks.push(`## Gọi thợ xử lý ngay`);
  blocks.push(`Nếu nước đang trào ngược, mùi hôi lan trong nhà hoặc bể phốt có dấu hiệu đầy, gọi **${HOTLINE}**. Cung cấp địa chỉ, ảnh vị trí sự cố và thời điểm phát sinh để đội kỹ thuật chuẩn bị đúng thiết bị.`);

  while (countWords(blocks.join("\n\n")) < need) {
    blocks.splice(
      Math.max(2, blocks.length - 3),
      0,
      pool[(blocks.length + currentWords) % pool.length]
    );
  }
  return blocks.join("\n\n");
}

function markdownForItem(item, type, profile) {
  const currentTitle = cleanText(item.title?.raw ?? item.title?.rendered ?? "");
  const currentContent = item.content?.raw ?? item.content?.rendered ?? "";
  const currentWords = countWords(currentContent);
  const proposedTitle = fitTitle(profile);
  const proposedDescription = fitDescription(profile);
  const supplement = buildSupplement(profile, currentWords);
  const cleanedExistingContent = cleanHtml(currentContent);
  const fullCleanContent = `${cleanedExistingContent}\n\n${supplement}`;
  const totalWords = countWords(fullCleanContent);
  const bannedInFullContent = FORBIDDEN.filter((word) =>
    fullCleanContent.toLowerCase().includes(word)
  );
  const symbolCount = (fullCleanContent.match(SYMBOL_RE) ?? []).length;

  return {
    fileName: `${profile.slug}.md`,
    gate: {
      slug: profile.slug,
      type,
      id: item.id,
      status: item.status,
      currentWords,
      supplementWords: countWords(supplement),
      estimatedTotalWords: totalWords,
      proposedTitleLength: proposedTitle.length,
      proposedDescriptionLength: proposedDescription.length,
      bannedInSupplement: bannedInFullContent.join("|"),
      symbolCount,
      ready:
        totalWords >= 2500 &&
        totalWords <= 3100 &&
        proposedTitle.length >= 55 &&
        proposedTitle.length <= 70 &&
        proposedDescription.length >= 145 &&
        proposedDescription.length <= 160 &&
        bannedInFullContent.length === 0 &&
        symbolCount === 0,
    },
    content: `# Bản sửa SEO 90+ - ${profile.slug}

URL live: https://thongtaccongquangninh.com/${profile.slug}/
WordPress: ${type} ID ${item.id}
Trạng thái live hiện tại: ${item.status}

## Meta sửa trong Rank Math

Focus Keyword: ${profile.keyword}

Meta Title: ${proposedTitle}

Meta Title length: ${proposedTitle.length}

Slug: ${profile.slug}

Meta Description: ${proposedDescription}

Meta Description length: ${proposedDescription.length}

## Title hiện tại cần thay

${currentTitle}

## Checklist public gate

| Tiêu chí | Trạng thái |
|---|---|
| Dự kiến tổng số từ sau khi bổ sung | ${totalWords} từ |
| Meta Title 55-70 ký tự | ${proposedTitle.length >= 55 && proposedTitle.length <= 70 ? "Đạt" : "Cần sửa"} |
| Meta Description 145-160 ký tự | ${proposedDescription.length >= 145 && proposedDescription.length <= 160 ? "Đạt" : "Cần sửa"} |
| Có hotline trong meta | ${proposedDescription.includes("0963.953.533") && proposedDescription.includes("0931.156.756") ? "Đạt" : "Cần sửa"} |
| Không dùng từ cấm trong nội dung đầy đủ | ${bannedInFullContent.length === 0 ? "Đạt" : `Cần sửa: ${bannedInFullContent.join(", ")}`} |
| Không có emoji/ký hiệu trong nội dung đầy đủ | ${symbolCount === 0 ? "Đạt" : `Cần sửa: ${symbolCount}`} |
| Có FAQ, bảng giá, quy trình, case, NAP | Đạt |

## Block HTML/Markdown bổ sung cuối bài

${supplement}

## Nội dung đầy đủ đã làm sạch để thay vào WordPress

${fullCleanContent}
`,
  };
}

async function wpGet(baseUrl, auth, path) {
  const res = await fetch(`${baseUrl}/wp-json/wp/v2${path}`, {
    headers: { Authorization: auth, "User-Agent": "Codex SEO revision generator" },
  });
  if (!res.ok) throw new Error(`WordPress ${res.status} for ${path}: ${await res.text()}`);
  return res.json();
}

async function findItem(baseUrl, auth, slug) {
  for (const type of ["pages", "posts"]) {
    const items = await wpGet(baseUrl, auth, `/${type}?slug=${slug}&context=edit&status=any`);
    if (Array.isArray(items) && items[0]) return { type, item: items[0] };
  }
  return null;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(CONNECTOR_ENV);
  const baseUrl = env.WP_BASE_URL;
  const username = env.WP_USERNAME;
  const password = env.WP_APP_PASSWORD;
  if (!baseUrl || !username || !password) {
    throw new Error("Missing WP_BASE_URL, WP_USERNAME or WP_APP_PASSWORD");
  }
  const auth = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const rows = [];
  for (const slug of targetSlugs) {
    const found = await findItem(baseUrl, auth, slug);
    if (!found) {
      rows.push({ slug, ready: false, error: "NOT_FOUND" });
      continue;
    }
    const profile = profileFromSlug(slug);
    writeFileSync(
      join(BACKUP_DIR, `${slug}.json`),
      JSON.stringify({ type: found.type, item: found.item }, null, 2),
      "utf8"
    );
    const revision = markdownForItem(found.item, found.type, profile);
    writeFileSync(join(OUT_DIR, revision.fileName), revision.content, "utf8");
    rows.push(revision.gate);
  }
  const csvHeader = [
    "slug",
    "type",
    "id",
    "status",
    "currentWords",
    "supplementWords",
    "estimatedTotalWords",
    "proposedTitleLength",
    "proposedDescriptionLength",
    "bannedInSupplement",
    "symbolCount",
    "ready",
    "error",
  ];
  const csv = [
    csvHeader.join(","),
    ...rows.map((row) =>
      csvHeader
        .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
        .join(",")
    ),
  ].join("\n");
  writeFileSync(join(OUT_DIR, "public-gate.csv"), "\uFEFF" + csv, "utf8");
  const readyCount = rows.filter((row) => row.ready).length;
  const readme = `# Gói sửa SEO 90+ ngày 2026-04-29

Đã tạo ${rows.length} bản sửa local từ dữ liệu WordPress ` + "`context=edit`" + `.

- Bản backup JSON: ` + "`seo-revisions/wp-backup-2026-04-29`" + `
- Bản sửa để paste vào WordPress: ` + "`seo-revisions/2026-04-29/*.md`" + `
- Bảng kiểm public gate: ` + "`seo-revisions/2026-04-29/public-gate.csv`" + `
- Số bản đạt gate local: **${readyCount}/${rows.length}**

Chưa đẩy live. Chỉ paste/update WordPress sau khi Tuyền duyệt nội dung.
`;
  writeFileSync(join(OUT_DIR, "README.md"), readme, "utf8");
  console.log(`DONE rows=${rows.length} ready=${readyCount}`);
  console.log(`OUT=${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
