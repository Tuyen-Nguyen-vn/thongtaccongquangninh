import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const BACKUP_DIR = join(ROOT, "backups", "repair-hbp-huyen-drafts-2026-05-20");

const rows = [
  {
    slug: "hut-be-phot-tien-yen",
    area: "Tiên Yên",
    detail:
      "đường đồi, xã xa như Đồng Rui, Hà Lâu, Điền Xá và các khu nhà dân ven trục quốc lộ",
  },
  {
    slug: "hut-be-phot-hai-ha",
    area: "Hải Hà",
    detail:
      "nhà dân vùng ven biển, khu nuôi thủy sản, khu công nghiệp cảng biển và tuyến biên giới",
  },
  {
    slug: "hut-be-phot-ba-che",
    area: "Ba Chẽ",
    detail:
      "đường miền núi, nhà dân xa trung tâm, trường học và công trình có bể tự xây lâu năm",
  },
  {
    slug: "hut-be-phot-dam-ha",
    area: "Đầm Hà",
    detail:
      "khu dân cư nông thôn, nhà hàng nhỏ, trang trại, ao nuôi và tuyến đường huyện hẹp",
    metaDescription:
      "Hút bể phốt Đầm Hà Quảng Ninh 24/7 cho nhà dân, nhà hàng, trang trại. Xe đến tận huyện, hút sạch, báo giá rõ trước khi làm. Gọi 0963.953.533 / 0931.156.756.",
  },
  {
    slug: "hut-be-phot-binh-lieu",
    area: "Bình Liêu",
    detail:
      "địa hình biên giới, bản xa, đường dốc, nhà nghỉ nhỏ và hộ dân vùng cao cần đặt lịch rõ",
  },
  {
    slug: "hut-be-phot-co-to",
    area: "Cô Tô",
    detail:
      "đảo xa, homestay, nhà hàng, resort nhỏ và lịch điều phối phụ thuộc chuyến tàu từ Vân Đồn",
  },
];

function wordCount(text) {
  return (text.match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function focusCount(text, focus) {
  const escaped = focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "giu")) ?? []).length;
}

function field(text, label) {
  const m = text.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

function replaceField(text, label, value) {
  return text.replace(new RegExp(`^${label}:\\s*.+$`, "m"), `${label}: ${value}`);
}

function extraBlock({ area, detail }) {
  const focus = `hút bể phốt ${area}`;
  return `
---

## Lưu ý riêng trước khi đặt lịch hút bể phốt ${area}

Với địa bàn ${area}, thời gian điều xe không chỉ phụ thuộc quãng đường mà còn phụ thuộc loại đường vào nhà, vị trí nắp bể và chiều dài ống cần kéo. Khi gọi **0963.953.533 / 0931.156.756**, khách nên nói rõ nhà ở mặt đường hay trong ngõ, xe bồn có vào sát được không, bể nằm trong sân hay sau nhà. Thông tin càng rõ thì ca **${focus}** càng ít phát sinh thời gian chờ.

Nếu bể đã đầy nặng, không nên tiếp tục xả nước nhiều lần để thử. Việc xả liên tục có thể đẩy chất thải ngược lên bồn cầu, thoát sàn hoặc hố ga, nhất là tại ${detail}. Trường hợp có mùi hôi lan nhanh sau mưa, hãy ưu tiên gọi kiểm tra sớm vì bể có thể đang bị thấm nước hoặc nghẹt ống thông hơi.

Khi cần **${focus}** cho nhà dân, khách nên chuẩn bị sẵn vị trí mở nắp bể, dọn vật chắn quanh nắp và báo trước nếu nắp đã bị lát gạch, đổ bê tông hoặc đặt đồ nặng phía trên. Với nhà hàng, trường học, homestay hoặc cơ sở kinh doanh, nên đặt lịch ngoài giờ cao điểm để xe thao tác gọn hơn và không ảnh hưởng khách đang sử dụng nhà vệ sinh.

## Các tình huống hút bể phốt ${area} thường gặp

- **${focus}** cho nhà dân dùng bể 1-2 m3 đã 2-3 năm chưa hút, mùi hôi xuất hiện từng đợt.
- **${focus}** cho nhà hàng, quán ăn hoặc cơ sở lưu trú có lượng khách tăng vào cuối tuần.
- **${focus}** khi bồn cầu rút chậm, nước xoáy yếu, có tiếng ục ục sau mỗi lần xả.
- **${focus}** cho bể tự xây không có bản vẽ, khó xác định chính xác vị trí nắp bể.
- **${focus}** sau mưa lớn, khi nước ngầm hoặc nước mưa làm mực bể tăng bất thường.
- **${focus}** cho công trình đường nhỏ, cần kéo ống dài từ vị trí xe đỗ vào nắp bể.
- **${focus}** định kỳ để giảm nguy cơ trào ngược, đặc biệt với gia đình đông người.
- **${focus}** trước mùa du lịch, mùa lễ hội hoặc giai đoạn cơ sở kinh doanh phục vụ đông khách.

Các tình huống trên không nên xử lý bằng hóa chất tự đổ xuống bồn cầu. Hóa chất mạnh có thể làm hỏng gioăng, ăn mòn đường ống cũ và tạo mùi nặng hơn. Cách an toàn là kiểm tra đúng nguyên nhân, hút sạch bùn đáy, xả thử dòng thoát và hướng dẫn chu kỳ bảo trì phù hợp.

## Chu kỳ bảo trì sau khi hút bể phốt ${area}

Sau khi **${focus}**, gia đình 3-4 người nên theo dõi lại trong 12-18 tháng nếu bể nhỏ dưới 2 m3. Gia đình 5-7 người hoặc nhà có khách thuê nên kiểm tra sớm hơn, vì lượng nước thải lớn làm bùn đầy nhanh. Với cơ sở kinh doanh ăn uống, cần kiểm tra thêm bẫy mỡ để dầu mỡ không đi thẳng vào bể.

Mỗi lần **${focus}**, thợ cần ghi nhận dung tích ước tính, mức bùn trước khi hút, độ đặc của bùn và tình trạng ống thông hơi. Đây là dữ liệu giúp lần sau báo giá sát hơn, điều xe đúng hơn và tránh phải khảo sát lại từ đầu. Nếu khách giữ được ảnh nắp bể hoặc vị trí xe từng đỗ, lần gọi sau sẽ xử lý nhanh hơn.

Liên kết nội bộ cần đọc thêm:

- [Hút bể phốt Quảng Ninh](https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/)
- [Bảng giá hút bể phốt Quảng Ninh](https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/)
- [Thông tắc cống Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/)
- [Liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh](https://thongtaccongquangninh.com/lien-he/)
`;
}

function napBlock(area) {
  return `
---

## NAP liên hệ

- **Tên đơn vị:** Môi Trường Đô Thị Số 1 Quảng Ninh
- **Dịch vụ:** Hút bể phốt ${area}, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi
- **Khu vực:** ${area}, Quảng Ninh và các khu vực lân cận
- **Hotline 24/7:** **0963.953.533 / 0931.156.756**
- **Cam kết khi nhận ca:** Báo giá trước, xử lý đúng điểm nghẹt, không đục phá khi chưa thống nhất
`;
}

function supplementBlock({ area, detail }) {
  const focus = `hút bể phốt ${area}`;
  return `
---

## Ghi nhớ khi cần hút bể phốt ${area} khẩn cấp

Khi bể đã đầy, việc quan trọng nhất là giữ hiện trường ổn định: hạn chế xả nước, không tự mở nắp nếu có mùi khí nặng, không đổ thêm hóa chất mạnh và gọi thợ để hỏi phương án. Với ${detail}, một cuộc gọi mô tả đúng đường vào, vị trí bể và mức độ trào ngược giúp đội **${focus}** chuẩn bị đúng xe, đúng chiều dài ống và đúng thời gian đến.

Nếu cần **${focus}** vào buổi tối, cuối tuần hoặc trước giờ cơ sở kinh doanh mở cửa, hãy nói rõ khung giờ bắt buộc. Đội điều phối sẽ báo thẳng ca nào làm được, ca nào cần đặt lịch, tránh để khách chờ mơ hồ. Với nhà dân, **${focus}** nên kết hợp kiểm tra bồn cầu, hố ga và đường thông hơi để biết nguyên nhân đến từ bể đầy hay từ đường ống nghẹt.

Sau khi **${focus}**, khách nên ghi lại ngày hút, ước tính dung tích bể, số người sử dụng và ảnh vị trí nắp bể. Những thông tin này giúp lần sau báo giá nhanh hơn, tránh khảo sát lại và hạn chế phát sinh chi phí kéo ống. Nếu bể đầy lại quá nhanh trong vài tháng, cần kiểm tra thấm nước mưa, nứt bể hoặc đấu nối sai đường thoát.
`;
}

function densityBlock({ area }) {
  const focus = `hút bể phốt ${area}`;
  return `
---

## Khi nào nên ưu tiên đặt lịch hút bể phốt ${area}

- **${focus}** khẩn cấp: gọi trước khi trào ngược.
- **${focus}** định kỳ: đặt trước mùa mưa.
- **${focus}** đường hẹp: báo vị trí nắp bể.
- **${focus}** sau mưa lớn: kiểm tra thấm nước.
`;
}

function localizeGenericFocus(text, area, maxReplacements = 6) {
  let count = 0;
  const blocked = "Tiên Yên|Hải Hà|Ba Chẽ|Đầm Hà|Bình Liêu|Cô Tô|Quảng Ninh";
  return text.replace(new RegExp(`hút bể phốt(?!\\s+(?:${blocked}))`, "giu"), (match) => {
    if (count >= maxReplacements) return match;
    count += 1;
    return `${match} ${area}`;
  });
}

function imageLines(slug, pkg) {
  return pkg.images
    .map((img) => {
      const fileName = img.fileName ?? img.fileNameWebP;
      const alt = img.altText ?? `Ảnh minh họa ${slug}`;
      return `![${alt}](${fileName})`;
    })
    .join("\n\n");
}

function insertAfterFirstParagraph(text, snippet) {
  const marker = "\n---\n\n## Khi nào cần gọi";
  if (!text.includes(marker)) return text;
  return text.replace(marker, `\n\n${snippet}\n${marker}`);
}

function insertBeforeHeading(text, headingStart, snippet) {
  const idx = text.indexOf(headingStart);
  if (idx === -1) return text;
  return `${text.slice(0, idx).trimEnd()}\n\n${snippet}\n\n${text.slice(idx)}`;
}

function normalizeFaq(text) {
  return text.replace(/^\*\*([^*\n]+\?)\*\*\s*$/gm, "### $1");
}

function repair(row) {
  const mdPath = join(ROOT, "content-drafts", "hut-be-phot", `${row.slug}-rankmath-90.md`);
  const packagePath = join(ROOT, "image-briefs", `${row.slug}-image-package.json`);
  const original = readFileSync(mdPath, "utf8").replace(/^\uFEFF/, "");
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  const focus = field(original, "Focus Keyword") || `hút bể phốt ${row.area}`;
  mkdirSync(BACKUP_DIR, { recursive: true });
  copyFileSync(mdPath, join(BACKUP_DIR, `${row.slug}-before.md`));

  let text = original;
  if (row.metaDescription) text = replaceField(text, "Meta Description", row.metaDescription);
  text = text
    .replace(/\n---\n\n## Khi nào nên ưu tiên đặt lịch hút bể phốt [\s\S]+?(?=\n## NAP liên hệ)/g, "\n")
    .replaceAll("dịch vụ chuyên nghiệp", "đội xe có thiết bị phù hợp")
    .replaceAll("Dịch vụ chuyên nghiệp", "Đội xe có thiết bị phù hợp")
    .replaceAll("đơn vị uy tín", "đơn vị làm đúng quy trình")
    .replaceAll("Đơn vị uy tín", "Đơn vị làm đúng quy trình")
    .replace(/^## Case study thực tế tại (.+)$/gm, "## Case study E-E-A-T tại $1")
    .replace(/^## Câu hỏi thường gặp$/gm, `## FAQ về ${focus}`);

  if (!text.includes(`## Lưu ý riêng trước khi đặt lịch hút bể phốt ${row.area}`)) {
    text = insertBeforeHeading(text, "\n## Gọi hút bể phốt", extraBlock(row));
  }
  if (!text.includes("## NAP liên hệ")) {
    text = insertBeforeHeading(text, "\n## FAQ", napBlock(row.area));
  }
  const currentBody = text
    .replace(/^Meta Title:.*$/m, "")
    .replace(/^Meta Description:.*$/m, "")
    .replace(/^Slug:.*$/m, "")
    .replace(/^Focus Keyword:.*$/m, "")
    .replace(/^Search Intent:.*$/m, "");
  if (wordCount(currentBody) < 2500 && !text.includes(`## Ghi nhớ khi cần hút bể phốt ${row.area} khẩn cấp`)) {
    text = insertBeforeHeading(text, "\n## NAP liên hệ", supplementBlock(row));
  }
  if (!text.includes(pkg.images[0].fileName)) {
    const imgs = imageLines(row.slug, pkg);
    text = insertAfterFirstParagraph(text, imgs.split("\n\n")[0]);
    text = insertBeforeHeading(text, "\n## Tại sao chọn", imgs.split("\n\n")[1]);
    text = insertBeforeHeading(text, "\n## Case study", imgs.split("\n\n")[2]);
  }
  text = normalizeFaq(text);

  const body = text
    .replace(/^Meta Title:.*$/m, "")
    .replace(/^Meta Description:.*$/m, "")
    .replace(/^Slug:.*$/m, "")
    .replace(/^Focus Keyword:.*$/m, "")
    .replace(/^Search Intent:.*$/m, "");

  const words = wordCount(body);
  const count = focusCount(body, focus);
  let density = words ? (count / words) * 100 : 0;
  if (density < 1) {
    text = localizeGenericFocus(text, row.area);
    const bodyAfterLocalize = text
      .replace(/^Meta Title:.*$/m, "")
      .replace(/^Meta Description:.*$/m, "")
      .replace(/^Slug:.*$/m, "")
      .replace(/^Focus Keyword:.*$/m, "")
      .replace(/^Search Intent:.*$/m, "");
    density = wordCount(bodyAfterLocalize) ? (focusCount(bodyAfterLocalize, focus) / wordCount(bodyAfterLocalize)) * 100 : 0;
  }
  if (density < 1 && !text.includes(`## Khi nào nên ưu tiên đặt lịch hút bể phốt ${row.area}`)) {
    text = insertBeforeHeading(text, "\n## NAP liên hệ", densityBlock(row));
  }
  writeFileSync(mdPath, text.trimEnd() + "\n", "utf8");
  return { slug: row.slug, words: wordCount(text), focusCount: focusCount(text, focus), mdPath };
}

const results = rows.map(repair);
console.log(JSON.stringify({ backupDir: BACKUP_DIR, results }, null, 2));
