/**
 * Tạo 2 trang tĩnh: Chính sách bảo mật + Điều khoản dịch vụ
 * Tự thêm vào footer menu nếu có.
 *
 * Chạy: node tools/create_legal_pages.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const LOG_PATH =
  "D:\\.thongtaccongquangninh\\WORDPRESS_LEGAL_PAGES_2026-06-03.json";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wpGet(baseUrl, auth, path) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    headers: { Authorization: auth, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`WP GET ${res.status} ${path}`);
  return res.json();
}

async function wpPost(baseUrl, auth, path, body) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`WP POST ${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

// ─── Nội dung trang ─────────────────────────────────────────────────────────

const PAGES = [
  {
    title: "Chính Sách Bảo Mật",
    slug: "chinh-sach-bao-mat",
    menuLabel: "Chính sách bảo mật",
    content: `<p><strong>Cập nhật lần cuối:</strong> 03/06/2026</p>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh (vận hành website <strong>thongtaccongquangninh.com</strong>) cam kết bảo vệ thông tin cá nhân của khách hàng. Chính sách này giải thích rõ chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn như thế nào khi bạn sử dụng dịch vụ hoặc liên hệ qua website.</p>

<hr>

<h2>1. Thông Tin Chúng Tôi Thu Thập</h2>
<p>Chúng tôi chỉ thu thập thông tin khi bạn chủ động cung cấp, bao gồm:</p>
<ul>
<li><strong>Họ tên</strong> — để xưng hô và xác nhận đặt lịch.</li>
<li><strong>Số điện thoại</strong> — để liên hệ báo giá, xác nhận lịch và hỗ trợ sau dịch vụ.</li>
<li><strong>Địa chỉ</strong> — để điều phối thợ đến đúng nơi, đúng giờ.</li>
<li><strong>Mô tả sự cố</strong> — để chuẩn bị thiết bị và nhân lực phù hợp trước khi đến.</li>
</ul>
<p>Ngoài ra, website tự động ghi nhận dữ liệu kỹ thuật như địa chỉ IP, loại trình duyệt và trang bạn truy cập — chỉ dùng để cải thiện tốc độ và trải nghiệm website, không dùng để nhận dạng cá nhân.</p>

<hr>

<h2>2. Mục Đích Sử Dụng Thông Tin</h2>
<p>Thông tin bạn cung cấp được dùng để:</p>
<ul>
<li>Liên hệ xác nhận lịch và báo giá dịch vụ.</li>
<li>Điều phối thợ đến đúng địa chỉ trong thời gian sớm nhất.</li>
<li>Hỗ trợ bảo hành và chăm sóc sau dịch vụ.</li>
<li>Gửi thông báo về lịch bảo trì định kỳ nếu bạn yêu cầu.</li>
</ul>
<p>Chúng tôi <strong>không</strong> dùng thông tin của bạn để gửi quảng cáo không liên quan hoặc chia sẻ với bên thứ ba vì mục đích thương mại.</p>

<hr>

<h2>3. Chia Sẻ Thông Tin</h2>
<p>Chúng tôi <strong>không bán, không cho thuê</strong> và không trao đổi thông tin cá nhân của bạn với bất kỳ bên nào.</p>
<p>Thông tin chỉ được chia sẻ trong các trường hợp sau:</p>
<ul>
<li><strong>Nhân viên kỹ thuật nội bộ</strong> — để thực hiện dịch vụ bạn đã đặt.</li>
<li><strong>Yêu cầu pháp lý</strong> — khi có văn bản yêu cầu từ cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam.</li>
</ul>

<hr>

<h2>4. Bảo Mật Thông Tin</h2>
<p>Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu của bạn:</p>
<ul>
<li>Website sử dụng giao thức <strong>HTTPS</strong> mã hóa toàn bộ dữ liệu truyền tải.</li>
<li>Thông tin khách hàng chỉ được lưu trong hệ thống nội bộ, giới hạn quyền truy cập.</li>
<li>Nhân viên được huấn luyện về bảo mật thông tin khách hàng.</li>
</ul>
<p>Tuy nhiên, không có hệ thống nào đảm bảo an toàn tuyệt đối 100%. Nếu phát hiện bất thường liên quan đến thông tin của mình, vui lòng liên hệ ngay với chúng tôi.</p>

<hr>

<h2>5. Thời Gian Lưu Trữ</h2>
<p>Thông tin của bạn được lưu trong thời gian cần thiết để hoàn thành dịch vụ và thực hiện nghĩa vụ bảo hành. Sau khi không còn cần thiết, dữ liệu sẽ được xóa hoặc ẩn danh hóa.</p>

<hr>

<h2>6. Quyền Của Bạn</h2>
<p>Bạn có quyền:</p>
<ul>
<li><strong>Truy cập</strong> — yêu cầu xem thông tin chúng tôi đang lưu về bạn.</li>
<li><strong>Chỉnh sửa</strong> — yêu cầu cập nhật thông tin không chính xác.</li>
<li><strong>Xóa</strong> — yêu cầu xóa thông tin sau khi dịch vụ đã hoàn tất.</li>
<li><strong>Từ chối</strong> — yêu cầu không nhận thông báo chăm sóc sau dịch vụ.</li>
</ul>
<p>Để thực hiện các quyền trên, liên hệ trực tiếp với chúng tôi qua hotline hoặc địa chỉ dưới đây.</p>

<hr>

<h2>7. Cookie</h2>
<p>Website sử dụng cookie cơ bản để cải thiện trải nghiệm duyệt web (ghi nhớ thiết bị, phân tích lượt truy cập qua Google Analytics). Bạn có thể tắt cookie trong cài đặt trình duyệt — điều này không ảnh hưởng đến việc đặt lịch hay gọi dịch vụ.</p>

<hr>

<h2>8. Thay Đổi Chính Sách</h2>
<p>Khi có thay đổi, chúng tôi sẽ cập nhật ngày "Cập nhật lần cuối" ở đầu trang. Chính sách mới có hiệu lực ngay khi được đăng tải.</p>

<hr>

<h2>9. Liên Hệ</h2>
<p>Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ:</p>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong><br>
Website: thongtaccongquangninh.com<br>
Hotline: <strong>0963.953.533</strong> — <strong>0931.156.756</strong><br>
Khu vực phục vụ: Quảng Ninh — Hải Phòng và các tỉnh lân cận</p>`,
  },
  {
    title: "Điều Khoản Dịch Vụ",
    slug: "dieu-khoan-dich-vu",
    menuLabel: "Điều khoản dịch vụ",
    content: `<p><strong>Cập nhật lần cuối:</strong> 03/06/2026</p>
<p>Khi sử dụng dịch vụ hoặc liên hệ đặt lịch qua website <strong>thongtaccongquangninh.com</strong>, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi đặt dịch vụ.</p>

<hr>

<h2>1. Đơn Vị Cung Cấp Dịch Vụ</h2>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong><br>
Hotline: <strong>0963.953.533</strong> — <strong>0931.156.756</strong><br>
Website: thongtaccongquangninh.com<br>
Khu vực phục vụ: Quảng Ninh, Hải Phòng và các tỉnh lân cận</p>

<hr>

<h2>2. Phạm Vi Dịch Vụ</h2>
<p>Chúng tôi cung cấp các dịch vụ:</p>
<ul>
<li>Hút bể phốt, hút hầm cầu</li>
<li>Thông tắc cống, thông tắc bồn cầu</li>
<li>Nạo vét hố ga, cống rãnh</li>
<li>Xử lý mùi hôi nhà vệ sinh, khu vực thoát nước</li>
<li>Dịch vụ khẩn cấp 24/7</li>
</ul>
<p>Dịch vụ được thực hiện tại nhà dân, chung cư, văn phòng, nhà hàng, khách sạn, khu công nghiệp và các công trình dân dụng — trong phạm vi địa bàn phục vụ đã công bố.</p>

<hr>

<h2>3. Đặt Lịch và Xác Nhận</h2>
<ul>
<li>Khách hàng đặt lịch qua hotline, form website hoặc Zalo.</li>
<li>Sau khi tiếp nhận, nhân viên sẽ liên hệ xác nhận thời gian và báo giá sơ bộ trong vòng <strong>15–30 phút</strong>.</li>
<li>Lịch được tính là đã xác nhận khi hai bên đồng ý về thời gian và địa chỉ.</li>
<li>Chúng tôi có thể điều chỉnh lịch trong trường hợp bất khả kháng (thời tiết xấu, sự cố kỹ thuật đột xuất) và sẽ thông báo sớm nhất có thể.</li>
</ul>

<hr>

<h2>4. Báo Giá và Thanh Toán</h2>
<ul>
<li>Báo giá được cung cấp <strong>miễn phí</strong> sau khi khảo sát thực tế hoặc qua mô tả của khách hàng.</li>
<li>Giá có thể thay đổi tùy mức độ tắc nghẽn, khối lượng, thiết bị cần dùng và vị trí công trình.</li>
<li>Chúng tôi <strong>không báo giá ảo</strong> — mức phí thực tế sẽ được thống nhất trước khi thi công.</li>
<li>Thanh toán sau khi hoàn thành công việc, trực tiếp bằng tiền mặt hoặc chuyển khoản.</li>
<li>Không phát sinh chi phí ẩn ngoài mức đã báo trừ khi có phát sinh thực tế được hai bên đồng ý.</li>
</ul>

<hr>

<h2>5. Cam Kết Thực Hiện</h2>
<p>Trong quá trình thi công, chúng tôi cam kết:</p>
<ul>
<li><strong>Không đục phá</strong> — ưu tiên phương án kỹ thuật không xâm phạm kết cấu công trình.</li>
<li><strong>Không tái phát</strong> — bảo hành kết quả thi công theo thỏa thuận cụ thể cho từng hạng mục.</li>
<li><strong>Không để lại rác, bùn, nước thải</strong> — dọn dẹp sạch khu vực sau khi hoàn thành.</li>
<li>Nhân viên thi công mang theo thiết bị đúng chủng loại, đúng công suất cho từng loại sự cố.</li>
</ul>

<hr>

<h2>6. Trách Nhiệm Của Khách Hàng</h2>
<p>Để dịch vụ được thực hiện an toàn và hiệu quả, khách hàng cần:</p>
<ul>
<li>Cung cấp thông tin chính xác về địa chỉ, loại sự cố và mức độ nghiêm trọng khi đặt lịch.</li>
<li>Đảm bảo lối vào, cửa ngõ và khu vực thi công thông thoáng khi nhân viên đến.</li>
<li>Không tự ý can thiệp vào quá trình thi công khi nhân viên đang làm việc.</li>
<li>Thanh toán đúng theo mức giá đã thống nhất sau khi hoàn thành.</li>
</ul>

<hr>

<h2>7. Bảo Hành</h2>
<ul>
<li>Mỗi hạng mục có chính sách bảo hành riêng được thông báo cụ thể khi báo giá.</li>
<li>Bảo hành có hiệu lực khi sự cố tái phát do nguyên nhân kỹ thuật từ lần thi công trước — không áp dụng cho hư hỏng phát sinh từ tác nhân bên ngoài hoặc sử dụng sai cách sau khi bàn giao.</li>
<li>Để được bảo hành, khách hàng liên hệ qua hotline và cung cấp thông tin đặt lịch lần trước.</li>
</ul>

<hr>

<h2>8. Giới Hạn Trách Nhiệm</h2>
<p>Chúng tôi không chịu trách nhiệm đối với:</p>
<ul>
<li>Hư hỏng phát sinh từ hệ thống đường ống xuống cấp nghiêm trọng ngoài phạm vi công việc đã thỏa thuận.</li>
<li>Sự cố tái phát do khách hàng hoặc bên thứ ba can thiệp vào hệ thống sau khi thi công xong.</li>
<li>Thiệt hại gián tiếp do chậm trễ vì lý do bất khả kháng (thiên tai, sự cố giao thông, v.v.).</li>
</ul>
<p>Trong mọi trường hợp, mức bồi thường tối đa không vượt quá giá trị hạng mục dịch vụ đã thanh toán.</p>

<hr>

<h2>9. Hủy Lịch</h2>
<ul>
<li>Khách hàng có thể hủy lịch bất cứ lúc nào bằng cách thông báo qua hotline.</li>
<li>Nếu hủy sau khi nhân viên đã di chuyển đến địa chỉ, có thể phát sinh phí di chuyển tùy khoảng cách — sẽ được thông báo trước khi xác nhận lịch.</li>
</ul>

<hr>

<h2>10. Thay Đổi Điều Khoản</h2>
<p>Chúng tôi có quyền cập nhật điều khoản này bất kỳ lúc nào. Phiên bản mới có hiệu lực ngay khi đăng tải và sẽ được ghi nhận qua ngày "Cập nhật lần cuối" ở đầu trang. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi được xem là đồng ý với điều khoản mới.</p>

<hr>

<h2>11. Liên Hệ</h2>
<p>Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ:</p>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong><br>
Website: thongtaccongquangninh.com<br>
Hotline: <strong>0963.953.533</strong> — <strong>0931.156.756</strong></p>`,
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(
    `${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`
  ).toString("base64")}`;

  console.log("🔗 WP Base URL:", baseUrl);

  const log = { createdAt: new Date().toISOString(), pages: [], menuUpdates: [] };

  // 1. Tạo hoặc cập nhật từng trang
  for (const page of PAGES) {
    console.log(`\n📄 Xử lý: ${page.title} (/${page.slug}/)`);

    // Kiểm tra slug đã tồn tại chưa
    let existing = null;
    try {
      const results = await wpGet(baseUrl, auth, `/wp/v2/pages?slug=${page.slug}&status=any`);
      if (results.length > 0) existing = results[0];
    } catch (_) {}

    let result;
    if (existing) {
      console.log(`  ⚠️ Đã tồn tại (ID ${existing.id}), cập nhật nội dung...`);
      result = await wpPost(baseUrl, auth, `/wp/v2/pages/${existing.id}`, {
        title: page.title,
        content: page.content,
        status: "publish",
        slug: page.slug,
      });
    } else {
      console.log("  ✅ Tạo mới...");
      result = await wpPost(baseUrl, auth, "/wp/v2/pages", {
        title: page.title,
        content: page.content,
        status: "publish",
        slug: page.slug,
        template: "",
      });
    }

    console.log(`  → ID: ${result.id} | Link: ${result.link}`);
    log.pages.push({
      action: existing ? "updated" : "created",
      id: result.id,
      title: page.title,
      slug: page.slug,
      link: result.link,
      status: result.status,
    });
  }

  // 2. Tìm footer menu và thêm link
  console.log("\n🗂️ Tìm footer menu...");
  let menus = [];
  try {
    menus = await wpGet(baseUrl, auth, "/wp/v2/menus?per_page=50");
  } catch (_) {
    // thử endpoint cũ
    try {
      menus = await wpGet(baseUrl, auth, "/menus/v1/menus");
    } catch (__) {
      console.log("  ⚠️ Không đọc được danh sách menu — bỏ qua bước menu.");
    }
  }

  const footerMenu = menus.find(
    (m) =>
      m.name?.toLowerCase().includes("footer") ||
      m.slug?.toLowerCase().includes("footer")
  );

  if (footerMenu) {
    console.log(`  → Footer menu: "${footerMenu.name}" (ID ${footerMenu.id})`);

    for (const page of PAGES) {
      const pageData = log.pages.find((p) => p.slug === page.slug);
      if (!pageData) continue;

      // Kiểm tra link đã có trong menu chưa
      let menuItems = [];
      try {
        menuItems = await wpGet(baseUrl, auth, `/wp/v2/menu-items?menus=${footerMenu.id}&per_page=100`);
      } catch (_) {}

      const alreadyExists = menuItems.some(
        (item) => item.url?.includes(page.slug) || item.object_id === pageData.id
      );

      if (alreadyExists) {
        console.log(`  ℹ️ "${page.menuLabel}" đã có trong footer menu.`);
        log.menuUpdates.push({ slug: page.slug, action: "skipped_exists" });
        continue;
      }

      try {
        const menuItem = await wpPost(baseUrl, auth, "/wp/v2/menu-items", {
          title: page.menuLabel,
          url: pageData.link,
          type: "post_type",
          type_label: "Trang",
          object: "page",
          object_id: pageData.id,
          menus: footerMenu.id,
          status: "publish",
        });
        console.log(`  ✅ Đã thêm "${page.menuLabel}" vào footer menu (item ID ${menuItem.id})`);
        log.menuUpdates.push({
          slug: page.slug,
          action: "added",
          menuItemId: menuItem.id,
          menuId: footerMenu.id,
        });
      } catch (err) {
        console.log(`  ❌ Không thêm được vào menu: ${err.message}`);
        log.menuUpdates.push({ slug: page.slug, action: "error", error: err.message });
      }
    }
  } else {
    console.log("  ⚠️ Không tìm thấy footer menu. Bỏ qua bước menu tự động.");
    log.menuUpdates.push({ action: "no_footer_menu_found", available: menus.map((m) => m.name) });
  }

  // 3. Ghi log
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf8");
  console.log(`\n📝 Log ghi vào: ${LOG_PATH}`);
  console.log("\n✅ Hoàn tất!");
  console.log(JSON.stringify(log, null, 2));
}

main().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});
