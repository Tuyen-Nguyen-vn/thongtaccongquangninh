import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const JSON_PATH = join(PROJECT, "wp-url-audit-list.json");
const REPORT_PATH = join(PROJECT, "WORDPRESS_PHASE1_FIX_REPORT_2026-05-06.json");

function parseEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const ORPHANED_SLUGS = [
  "cau-hoi-thuong-gap-thong-tac-cong",
  "ve-chung-toi",
  "hut-be-phot-tien-yen",
  "thong-tac-bon-cau-cam-pha",
  "thong-tac-bon-cau-uong-bi",
  "ve-sinh-duong-ong-quang-ninh",
  "gia-thong-tac-cong-ha-long",
  "hut-be-phot-ha-long-xe-hut-24-7",
  "thong-tac-cong-ha-long-ban-dem",
  "thong-tac-cong-hong-gai-ha-long"
];

const REWRITES = {
  "hut-be-phot-cam-pha": { title: "Hút Bể Phốt Cẩm Phả: Xử Lý Tận Gốc Cho Khu Mỏ, Đường Hẹp", excerpt: "Dịch vụ hút bể phốt tại Cẩm Phả với xe bồn chuyên dụng, luồn lách dễ dàng vào các ngõ hẻm khu dân cư mỏ. Không đục phá, sạch 100%." },
  "hut-be-phot-dong-trieu": { title: "Hút Bể Phốt Đông Triều: Hỗ Trợ Hộ Gia Đình, Khu Nông Nghiệp", excerpt: "Chuyên hút bể phốt tại Đông Triều, phục vụ nhanh chóng các hộ gia đình, trang trại, khu vực xa trung tâm với giá công khai, minh bạch." },
  "hut-be-phot-ha-long": { title: "Hút Bể Phốt Hạ Long Cho Khách Sạn, Nhà Hàng, Đồi Dốc", excerpt: "Dịch vụ hút bể phốt đúng kỹ thuật tại Hạ Long. Đội xe bồn mạnh mẽ xử lý triệt để bể phốt nhà hàng, khách sạn trên địa hình đồi dốc phức tạp." },
  "hut-be-phot-mong-cai": { title: "Hút Bể Phốt Móng Cái: Nhanh Chóng Khu Vực Biên Giới", excerpt: "Dịch vụ xử lý bể phốt, hầm cầu tại khu vực Móng Cái, đáp ứng nhanh cho kho bãi, chợ trung tâm và các hộ dân vùng biên." },
  "hut-be-phot-quang-ninh": { title: "Hút Bể Phốt Quảng Ninh 24/7: Xe Bồn Hiện Đại", excerpt: "Dịch vụ hút bể phốt báo giá rõ toàn tỉnh Quảng Ninh. Cam kết không đục phá, bảo hành dài hạn, phục vụ 24/7." },
  "hut-be-phot-quang-yen": { title: "Hút Bể Phốt Quảng Yên: Giải Pháp Cho Khu Công Nghiệp, Nhà Xưởng", excerpt: "Xử lý triệt để sự cố bể phốt đầy tại Quảng Yên. Phù hợp cho công nhân, khu công nghiệp và đô thị mới với dung tích xe hút đa dạng." },
  "hut-be-phot-uong-bi": { title: "Hút Bể Phốt Uông Bí: Phục Vụ Nhanh Khu Nhà Trọ, Đường Xa", excerpt: "Xử lý tắc nghẽn, hút hầm cầu tại Uông Bí. Đội thợ lành nghề khắc phục sự cố tại các khu dân cư cũ, nhà trọ quanh năm." },
  "hut-be-phot-van-don": { title: "Hút Bể Phốt Vân Đồn: Dành Cho Đặc Thù Khu Du Lịch, Biển Đảo", excerpt: "Dịch vụ hút hầm cầu tại Vân Đồn, đáp ứng tiêu chuẩn vệ sinh khắt khe cho resort, homestay và dân cư vùng vịnh." },
  "nao-vet-ho-ga-quang-ninh": { title: "Nạo Vét Hố Ga Quảng Ninh: Tránh Ngập Úng Cục Bộ", excerpt: "Nạo vét, vệ sinh bùn đất hố ga đúng kỹ thuật. Báo giá khối lượng minh bạch." },
  "nguyen-nhan-cong-tac-thuong-xuyen-ha-long": { title: "Giải Mã Nguyên Nhân Cống Tắc Thường Xuyên Tại Hạ Long", excerpt: "Tìm hiểu lý do thực sự khiến hệ thống thoát nước nhà bạn liên tục bị tắc và cách khắc phục tận gốc." },
  "thong-tac-bon-cau-dong-trieu": { title: "Thông Tắc Bồn Cầu Đông Triều Tận Nhà, Giá Rẻ Khởi Điểm", excerpt: "Sửa chữa bồn cầu nghẹt tại Đông Triều nhanh chóng. Đội thợ địa phương am hiểu kết cấu ống nước dân dụng." },
  "thong-tac-bon-cau-ha-long": { title: "Thông Tắc Bồn Cầu Hạ Long: Xử Lý Ngay Sự Cố Nhà Vệ Sinh Khách Sạn", excerpt: "Giải quyết tình huống bồn cầu tắc khẩn cấp tại các cơ sở lưu trú, chung cư Hạ Long. Không làm ảnh hưởng sinh hoạt." },
  "thong-tac-bon-cau-mong-cai": { title: "Thông Tắc Bồn Cầu Móng Cái Tận Nơi, Không Đục Phá", excerpt: "Dịch vụ thông tắc hầm cầu, bồn cầu khu vực Móng Cái. An toàn cho thiết bị vệ sinh cao cấp." },
  "thong-tac-bon-cau-quang-ninh": { title: "Dịch Vụ Thông Tắc Bồn Cầu Quảng Ninh: Dứt Điểm Tái Phát", excerpt: "Khắc phục mọi ca bồn cầu tắc từ nhẹ đến nặng trên địa bàn Quảng Ninh. Bảo hành xử lý mùi hôi đi kèm." },
  "thong-tac-bon-cau-quang-yen": { title: "Thông Tắc Bồn Cầu Quảng Yên Kịp Thời Cho Khu Dân Cư Mới", excerpt: "Hỗ trợ thông tắc vệ sinh tại Quảng Yên. Khắc phục lỗi lắp sai kỹ thuật gây tắc bồn cầu thường xuyên." },
  "thong-tac-bon-cau-van-don": { title: "Thông Tắc Bồn Cầu Vân Đồn Cho Homestay, Resort Nhanh Chóng", excerpt: "Khôi phục hoạt động nhà vệ sinh tại Vân Đồn nhanh nhất để không gián đoạn đón khách du lịch." },
  "thong-tac-chau-rua-quang-ninh": { title: "Thông Tắc Chậu Rửa Bát Quảng Ninh Tận Nơi 15 Phút", excerpt: "Xử lý chậu rửa mặt, bồn rửa bát xả nước không trôi, có tiếng kêu ục ục." },
  "thong-tac-cong-cam-pha": { title: "Thông Tắc Cống Cẩm Phả: Khắc Phục Nghẹt Ống Do Đất Đá Lâu Năm", excerpt: "Vệ sinh đường ống, thông cống rãnh tại Cẩm Phả. Chuyên xử lý cống thoát nước sinh hoạt bị tắc do cặn bùn, dầu mỡ." },
  "thong-tac-cong-chung-cu-ha-long": { title: "Thông Tắc Cống Chung Cư Hạ Long: Xử Lý Trục Đứng Tầng Hầm", excerpt: "Chuyên gia gỡ rối sự cố tắc trục cống chính tại các tòa chung cư Hạ Long. Không gây ồn, sạch sẽ." },
  "thong-tac-cong-dong-trieu": { title: "Thông Tắc Cống Đông Triều: Xử Lý Cống Thoát Nước Sân Vườn", excerpt: "Thông cống nghẹt tại Đông Triều, từ cống ngầm hộ gia đình đến cống nổi khu chăn nuôi." },
  "thong-tac-cong-ha-long": { title: "Thông Tắc Cống Hạ Long Triệt Để Mỡ Đóng Cục Nhà Hàng", excerpt: "Dùng máy đánh mỡ, phun áp lực thông cống nhà hàng tại Hạ Long. Giải quyết dứt điểm mảng bám mỡ thừa." },
  "thong-tac-cong-mong-cai": { title: "Thông Tắc Cống Móng Cái Nhanh Gọn, Khơi Thông Dòng Chảy", excerpt: "Xử lý sự cố cống thoát nước chậm, trào ngược tại Móng Cái. Đội phản ứng nhanh 24/7." },
  "thong-tac-cong-ngo-nho-ha-long": { title: "Thông Tắc Cống Ngõ Nhỏ Hạ Long Dành Cho Nhà Dân", excerpt: "Đội thợ luồn lách thiết bị thông cống vào các con ngõ dốc, hẹp đặc trưng của khu vực Hạ Long." },
  "thong-tac-cong-nha-hang-ha-long": { title: "Thông Tắc Cống Nhà Hàng Hạ Long: Đánh Tan Mỡ Cứng Đầu", excerpt: "Kỹ thuật thông cống dành riêng cho bếp nhà hàng, quán ăn tại Bãi Cháy, Hòn Gai. Giải cứu đường thoát nước mỡ." },
  "thong-tac-cong-quang-ninh": { title: "Dịch Vụ Thông Tắc Cống Quảng Ninh Công Nghệ Cao, Sạch 100%", excerpt: "Tổng hợp dịch vụ thông cống nghẹt toàn Quảng Ninh. Cam kết không đục nền, bảo hành đường ống dài hạn." },
  "thong-tac-cong-quang-yen": { title: "Thông Tắc Cống Quảng Yên: Giải Quyết Cống Ngập Kẹt Rác", excerpt: "Thông thoát đường cống ngầm tại Quảng Yên. Phù hợp cho hạ tầng nhà xưởng và nhà ở xã hội." },
  "thong-tac-cong-uong-bi": { title: "Thông Tắc Cống Uông Bí An Toàn Cho Hệ Thống Cũ", excerpt: "Can thiệp nhẹ nhàng nhưng hiệu quả cho đường ống thoát nước cũ tại khu vực Uông Bí, chống vỡ ống." },
  "thong-tac-cong-van-don": { title: "Thông Tắc Cống Vân Đồn Đảm Bảo Vệ Sinh Môi Trường Biển", excerpt: "Thông nghẹt cống rãnh, đường thoát sàn khu vực Vân Đồn. Hạn chế mùi hôi, bảo vệ nguồn nước xung quanh." },
  "thong-tac-toilet-quang-ninh": { title: "Thông Tắc Toilet Quảng Ninh Bằng Công Nghệ Mới", excerpt: "Xử lý toilet nghẹt giấy, nghẹt vật cứng hiệu quả, an toàn, khử mùi nhà vệ sinh." },
  "xu-ly-mui-hoi-quang-ninh": { title: "Xử Lý Mùi Hôi Nhà Vệ Sinh Quảng Ninh Triệt Để Cống Trào", excerpt: "Thi công lắp đặt thiết bị chống hôi, bẫy mỡ, xử lý dứt điểm mùi cống trào ngược lên nhà tắm." },
  "bang-gia-hut-be-phot-quang-ninh-2026": { title: "Bảng Giá Hút Bể Phốt Quảng Ninh 2026: Cập Nhật Mới Nhất", excerpt: "Chi tiết bảng giá dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh năm 2026. Minh bạch, không phát sinh chi phí." }
};

async function updatePost(baseUrl, authHeaders, id, postType, payload) {
  const restBase = postType === "post" ? "posts" : "pages";
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/${restBase}/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Failed to update ${id}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  const authHeaders = env.WP_USERNAME && env.WP_APP_PASSWORD
      ? { Authorization: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}` }
      : {};

  if (!authHeaders.Authorization) {
    console.error("No auth credentials found");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  const rows = data.rows;

  const results = {
    drafted: [],
    rewritten: [],
    errors: []
  };

  // Draft orphaned URLs
  for (const slug of ORPHANED_SLUGS) {
    const item = rows.find(r => r.slug === slug);
    if (!item) {
      results.errors.push({ slug, error: "Not found in audit list" });
      continue;
    }
    try {
      console.log(`Drafting ${slug}...`);
      await updatePost(baseUrl, authHeaders, item.id, item.post_type, { status: "draft" });
      results.drafted.push(slug);
    } catch (e) {
      results.errors.push({ slug, error: e.message });
    }
  }

  // Rewrite Doorway URLs
  for (const [slug, content] of Object.entries(REWRITES)) {
    const item = rows.find(r => r.slug === slug);
    if (!item) {
      results.errors.push({ slug, error: "Not found in audit list" });
      continue;
    }
    try {
      console.log(`Rewriting ${slug}...`);
      await updatePost(baseUrl, authHeaders, item.id, item.post_type, {
        title: content.title,
        excerpt: content.excerpt
      });
      results.rewritten.push(slug);
    } catch (e) {
      results.errors.push({ slug, error: e.message });
    }
  }

  writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  console.log("Done! Check " + REPORT_PATH);
}

main().catch(console.error);
