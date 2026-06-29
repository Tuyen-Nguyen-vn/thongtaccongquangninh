import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const TEMPLATE = join(PROJECT, "content-drafts", "landing-quang-yen-thong-tac-bon-cau-rankmath-90.md");

const profiles = {
  "quang-ninh": {
    from: "Quảng Yên",
    to: "Quảng Ninh",
    fromSlug: "quang-yen",
    toSlug: "quang-ninh",
    fromOfficial: "quangyen.quangninh.gov.vn",
    toOfficial: "quangninh.gov.vn",
    areaList:
      "Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn, Hoành Bồ, Bãi Cháy, Hòn Gai và các khu vực lân cận tại Quảng Ninh",
    caseArea: "Hạ Long",
    output: join(PROJECT, "content-drafts", "landing-quang-ninh-thong-tac-bon-cau-rankmath-90.md"),
  },
  "ha-long": {
    from: "Quảng Yên",
    to: "Hạ Long",
    fromSlug: "quang-yen",
    toSlug: "ha-long",
    fromOfficial: "quangyen.quangninh.gov.vn",
    toOfficial: "halongcity.gov.vn",
    areaList:
      "Hạ Long, Bãi Cháy, Hòn Gai, Cao Xanh, Cao Thắng, Hà Khẩu, Giếng Đáy, Hà Tu, Hà Phong, Tuần Châu, Hoành Bồ và các khu dân cư ven vịnh",
    caseArea: "Bãi Cháy",
    output: join(PROJECT, "content-drafts", "landing-ha-long-thong-tac-bon-cau-rankmath-90.md"),
  },
  "cam-pha": {
    from: "Quảng Yên",
    to: "Cẩm Phả",
    fromSlug: "quang-yen",
    toSlug: "cam-pha",
    fromOfficial: "quangyen.quangninh.gov.vn",
    toOfficial: "campha.gov.vn",
    areaList:
      "Cẩm Phả, Cẩm Trung, Cẩm Thành, Cẩm Thủy, Cẩm Bình, Cẩm Đông, Cẩm Sơn, Quang Hanh, Cửa Ông, Mông Dương và các khu dân cư gần mỏ",
    caseArea: "Cửa Ông",
    output: join(PROJECT, "content-drafts", "landing-cam-pha-thong-tac-bon-cau-rankmath-90.md"),
  },
  "dong-trieu": {
    from: "Quảng Yên",
    to: "Đông Triều",
    fromSlug: "quang-yen",
    toSlug: "dong-trieu",
    fromOfficial: "quangyen.quangninh.gov.vn",
    toOfficial: "dongtrieu.quangninh.gov.vn",
    areaList:
      "Đông Triều, Mạo Khê, Đức Chính, Hồng Phong, Tràng An, Bình Khê, An Sinh, Yên Thọ, Hưng Đạo, Kim Sơn, Hoàng Quế, Nguyễn Huệ",
    caseArea: "Mạo Khê",
    output: join(PROJECT, "content-drafts", "landing-dong-trieu-thong-tac-bon-cau-rankmath-90.md"),
  },
  "mong-cai": {
    from: "Quảng Yên",
    to: "Móng Cái",
    fromSlug: "quang-yen",
    toSlug: "mong-cai",
    fromOfficial: "quangyen.quangninh.gov.vn",
    toOfficial: "mongcai.quangninh.gov.vn",
    areaList:
      "Móng Cái, Trần Phú, Hải Yên, Hải Hòa, Ninh Dương, Bình Ngọc, Vạn Ninh, Hải Xuân, Hải Tiến, Quảng Nghĩa, Hải Đông, Bắc Sơn",
    caseArea: "Hải Yên",
    output: join(PROJECT, "content-drafts", "landing-mong-cai-thong-tac-bon-cau-rankmath-90.md"),
  },
  "van-don": {
    from: "Quảng Yên",
    to: "Vân Đồn",
    fromSlug: "quang-yen",
    toSlug: "van-don",
    fromOfficial: "quangyen.quangninh.gov.vn",
    toOfficial: "vandon.quangninh.gov.vn",
    areaList:
      "Vân Đồn, Cái Rồng, Đông Xá, Hạ Long, Đoàn Kết, Bình Dân, Đài Xuyên, Quan Lạn, Minh Châu, Ngọc Vừng và các khu dân cư ven biển",
    caseArea: "Cái Rồng",
    output: join(PROJECT, "content-drafts", "landing-van-don-thong-tac-bon-cau-rankmath-90.md"),
  },
};

function replaceAll(input, from, to) {
  return input.split(from).join(to);
}

function main() {
  const key = process.argv[2] ?? "dong-trieu";
  const profile = profiles[key];
  if (!profile) {
    throw new Error(`Chưa có profile ${key}. Có: ${Object.keys(profiles).join(", ")}`);
  }
  let md = readFileSync(TEMPLATE, "utf8");
  md = replaceAll(md, profile.from, profile.to);
  md = replaceAll(md, profile.fromSlug, profile.toSlug);
  md = replaceAll(md, profile.fromOfficial, profile.toOfficial);
  md = md.replace(
    /Đông Mai, Minh Thành, Cộng Hòa, Sông Khoai, Tiền An, Liên Hòa, Liên Vị, Phong Hải, Yên Hải, Hoàng Tân/g,
    profile.areaList
  );
  md = md.replace(/Đông Mai/g, profile.caseArea);
  md = md.replace(
    /^Meta Title:.*$/m,
    `Meta Title: Thông tắc bồn cầu ${profile.to} 24/7, không đục phá, có mặt nhanh`
  );
  md = md.replace(
    /^Meta Description:.*$/m,
    `Meta Description: Thông tắc bồn cầu ${profile.to} 24/7, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để thợ xử lý tắc nghẽn ngay trong ngày tại nhà.`
  );
  md = md.replace(
    /^# .*$/m,
    `# Thông tắc bồn cầu ${profile.to} 24/7, có mặt nhanh 15 phút`
  );
  md = md.replace(
    /Cổng thông tin Đông Triều/g,
    `Cổng thông tin ${profile.to}`
  );
  writeFileSync(profile.output, md, "utf8");
  console.log(JSON.stringify({ ok: true, output: profile.output }, null, 2));
}

main();
