import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}
const env = readEnv(`${ROOT}/.env`);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function wpFind(slug) {
  for (const type of ["posts", "pages"]) {
    const r = await fetch(`https://${HOST}/wp-json/wp/v2/${type}?slug=${slug}&context=edit`, { headers: { Authorization: auth } });
    const arr = await r.json();
    if (Array.isArray(arr) && arr[0]) return { ...arr[0], _type: type };
  }
  throw new Error(`Khong tim thay ${slug}`);
}
async function wpUpdate(type, id, content) {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/${type}/${id}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return { status: r.status, text: (await r.text()).slice(0, 200) };
}

// ---- 1) Doi ten heading (noi dung NAP/gia da co san, chi thieu tu khoa dung audit regex) ----
const RENAMES = [
  { slug: "hut-be-phot-ha-long", find: "Gọi ngay để được kiểm tra nhanh và báo giá tại Hạ Long", replace: "Liên hệ: Gọi ngay để được kiểm tra nhanh và báo giá tại Hạ Long" },
  { slug: "hut-be-phot-khach-san-quang-ninh", find: "Đặt Lịch Khảo Sát Miễn Phí", replace: "Liên Hệ Đặt Lịch Khảo Sát Miễn Phí" },
  { slug: "hut-be-phot-nha-tro-uong-bi", find: "Thông Tin Đơn Vị Và Bảo Hành", replace: "Thông Tin Liên Hệ, Đơn Vị Và Bảo Hành" },
  { slug: "thong-tac-bon-cau-nha-tro-cam-pha", find: "Thông Tin Đơn Vị Và Bảo Hành", replace: "Thông Tin Liên Hệ, Đơn Vị Và Bảo Hành" },
  { slug: "thong-tac-cong-bep-nha-hang-ha-long", find: "Thông Tin Đơn Vị Và Bảo Hành", replace: "Thông Tin Liên Hệ, Đơn Vị Và Bảo Hành" },
  { slug: "thong-tac-cong-quang-yen", find: "Thông tin đơn vị và tín hiệu E-E-A-T", replace: "Thông tin liên hệ, đơn vị và tín hiệu E-E-A-T" },
  { slug: "xe-hut-be-phot-vao-ngo-sau-cam-pha", find: "Thông Tin Đơn Vị Và Bảo Hành", replace: "Thông Tin Liên Hệ, Đơn Vị Và Bảo Hành" },
  { slug: "hut-be-phot-24-7-quang-ninh", find: "Giá Hút Bể Phốt Ngoài Giờ Quảng Ninh Là Bao Nhiêu?", replace: "Bảng Giá Hút Bể Phốt Ngoài Giờ Quảng Ninh" },
];

// ---- 2) checklist-truoc-khi-goi-tho-thong-tac-cong: bo sung that 3 muc con thieu ----
const CHECKLIST_SLUG = "checklist-truoc-khi-goi-tho-thong-tac-cong";
const CHECKLIST_ANCHOR = "<h2>Thông Tin Đơn Vị Và Liên Hệ</h2>";
const CHECKLIST_NEW_SECTIONS = `
<h2>Vì Sao Chọn Môi Trường Đô Thị Số 1 Quảng Ninh Sau Khi Chuẩn Bị Checklist</h2>
<p>Sau khi đã chuẩn bị đủ ảnh và thông tin theo checklist trên, đội tiếp nhận dùng ngay các dữ liệu đó để tư vấn chính xác thay vì hỏi lại từ đầu. Cam kết 3 Không áp dụng cho mọi ca gọi:</p>
<ul>
<li><strong>Không đục phá khi chưa cần thiết:</strong> ưu tiên tiếp cận qua nắp thăm, hố ga có sẵn dựa trên ảnh khách đã gửi.</li>
<li><strong>Không báo giá ảo:</strong> báo giá dựa trên tình trạng thực tế khách mô tả, nêu rõ yếu tố có thể phát sinh thêm.</li>
<li><strong>Không bàn giao khi chưa xả thử:</strong> kiểm tra dòng thoát sau khi xử lý trước khi kết thúc ca.</li>
</ul>

<h2>Quy Trình 5 Bước Sau Khi Gọi Thợ</h2>
<ol>
<li><strong>Tiếp nhận thông tin:</strong> xác nhận lại các mục trong checklist khách đã chuẩn bị (dấu hiệu, ảnh, vị trí).</li>
<li><strong>Hẹn giờ khảo sát:</strong> báo khung giờ xe có thể tới dựa trên khu vực và mức độ khẩn cấp.</li>
<li><strong>Khảo sát tại chỗ:</strong> đối chiếu ảnh khách gửi với hiện trạng, xác định phương án xử lý.</li>
<li><strong>Báo giá và thi công:</strong> thống nhất giá trước khi làm, chỉ phát sinh thêm khi khách đồng ý.</li>
<li><strong>Kiểm tra và bàn giao:</strong> xả thử, dọn vệ sinh khu vực thao tác, hướng dẫn theo dõi sau xử lý.</li>
</ol>

<h2>Bảng Giá Tham Khảo Theo Từng Tình Trạng</h2>
<p>Chi phí thông tắc cống/hút bể phốt phụ thuộc tình trạng thực tế (mức độ tắc, khoảng cách xe vào, có cần đục phá hay không) nên không có một mức giá chung cho mọi trường hợp. Khách càng chuẩn bị đủ thông tin theo checklist trên, báo giá qua điện thoại càng sát với giá thi công thực tế. Xem bảng giá tham khảo chi tiết theo từng dịch vụ tại <a href="/bang-gia/">trang bảng giá</a>, hoặc gọi <a href="tel:0963953533">0963.953.533</a> để được báo giá theo đúng tình trạng của bạn.</p>
`;

const ONLY_SLUG = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7);

async function main() {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-missing-h2-${stamp}`;
  if (!DRY) mkdirSync(backupDir, { recursive: true });
  const results = [];

  for (const fix of RENAMES) {
    if (ONLY_SLUG && fix.slug !== ONLY_SLUG) continue;
    const post = await wpFind(fix.slug);
    const raw = post.content.raw;
    if (!raw.includes(fix.find)) {
      console.log(`[${post.id}] ${fix.slug} -> KHONG KHOP, bo qua. Tim: "${fix.find}"`);
      results.push({ slug: fix.slug, skipped: true });
      continue;
    }
    const newContent = raw.split(fix.find).join(fix.replace);
    console.log(`[${post.id}] ${fix.slug} -> doi H2 "${fix.find}" -> "${fix.replace}"`);
    if (DRY) { results.push({ slug: fix.slug, dry: true }); continue; }
    writeFileSync(`${backupDir}/${post.id}.json`, JSON.stringify({ id: post.id, slug: fix.slug, title: post.title.raw, content: raw }, null, 2), "utf8");
    const res = await wpUpdate(post._type, post.id, newContent);
    console.log(`  -> status=${res.status}`);
    results.push({ slug: fix.slug, id: post.id, status: res.status });
  }

  if (ONLY_SLUG && ONLY_SLUG !== CHECKLIST_SLUG) {
    if (!DRY) writeFileSync(`${ROOT}/reports/fix-missing-h2-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    return;
  }
  // checklist: chen 3 section moi truoc anchor
  const post = await wpFind(CHECKLIST_SLUG);
  const raw = post.content.raw;
  if (!raw.includes(CHECKLIST_ANCHOR)) {
    console.log(`[checklist] KHONG TIM THAY anchor, bo qua`);
    results.push({ slug: CHECKLIST_SLUG, skipped: true });
  } else {
    const newContent = raw.replace(CHECKLIST_ANCHOR, `${CHECKLIST_NEW_SECTIONS}\n${CHECKLIST_ANCHOR}`);
    console.log(`[${post.id}] ${CHECKLIST_SLUG} -> chen 3 section moi (Tai sao chon, Quy trinh, Bang gia)`);
    if (!DRY) {
      writeFileSync(`${backupDir}/${post.id}.json`, JSON.stringify({ id: post.id, slug: CHECKLIST_SLUG, title: post.title.raw, content: raw }, null, 2), "utf8");
      const res = await wpUpdate(post._type, post.id, newContent);
      console.log(`  -> status=${res.status}`);
      results.push({ slug: CHECKLIST_SLUG, id: post.id, status: res.status });
    } else {
      results.push({ slug: CHECKLIST_SLUG, dry: true });
    }
  }

  if (!DRY) {
    writeFileSync(`${ROOT}/reports/fix-missing-h2-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
