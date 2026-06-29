// Auto Backlink Tool - thongtaccongquangninh.com
// Tao template, mo trinh duyet, dien form tu dong

const BRAND = 'Moi Truong Do Thi So 1 Quang Ninh';
const WEBSITE = 'https://thongtaccongquangninh.com/';
const HOTLINE = '0963.953.533 / 0931.156.756';
const EMAIL = 'hutbephothalong@gmail.com';
const AREA = 'Quang Ninh, Hai Phong, mien Bac';

const SHORT = (i) => [
  `${BRAND} cung cap dich vu thong tac cong, hut be phot, thong tac bon cau, nao vet ho ga, xu ly mui hoi tai ${AREA}. Doi ky thuat tiep nhan 05:00-22:00, co mat nhanh, khong duc pha. Hotline: ${HOTLINE}. Website: ${WEBSITE}`,
  `${BRAND} phuc vu hut be phot, thong tac cong va bon cau cho nha dan, nha hang, khach san tai ${AREA}. Goi ${HOTLINE} de duoc kiem tra tinh trang va bao gia truoc khi lam.`,
  `Can ${HOTLINE} de ${BRAND} xu ly tac nghen thoat nuoc? Doi ngu tiep nhan 05:00-22:00, bao hanh theo hang muc, co may lo xo, camera noi soi. ${WEBSITE}`,
][i % 3];

const LONG = (i) => [
  `${BRAND} la don vi xu ly su co thoat nuoc dan dung va cong trinh tai ${AREA}. Dich vu chinh gom thong tac cong, hut be phot, thong tac bon cau, nao vet ho ga va xu ly mui hoi cho nha dan, nha hang, khach san, chung cu.\n\nDoi ky thuat tiep nhan 05:00-22:00 qua hotline ${HOTLINE}. Quy trinh lam viec uu tien kiem tra nguyen nhan, bao gia ro truoc khi xu ly, dung may lo xo, camera noi soi va xe bon chuyen dung. Cam ket 3 Khong: khong duc pha, khong bao gia ao, khong de tai phat. ${WEBSITE}`,
  `${BRAND} hoat dong trong linh vuc ve sinh moi truong va thoat nuoc o ${AREA}. Chung toi co may moc hien dai, ky thuat vien lau nam, tiep nhan ca can xu ly nhanh trong khung 05:00-22:00.\n\nGoi ${HOTLINE} khi gap: nuoc rut cham, mui hoi tu cong, bon cau trao nguoc, ho ga day bun. Uu tien bao thoi gian co mat theo khu vuc, bao hanh theo hang muc, khong duc nen. ${WEBSITE}`,
][i % 2];

const SOURCES = [
  {id:'hotfrog-vn',type:'directory',name:'Hotfrog Vietnam',url:'https://www.hotfrog.com.vn/add',dr:50,captcha:false,priority:1},
  {id:'brownbook',type:'directory',name:'Brownbook',url:'https://www.brownbook.net/add-business',dr:70,captcha:false,priority:1},
  {id:'yellowpages-vn',type:'directory',name:'YellowPages Vietnam',url:'https://www.yellowpages.com.vn/subpages/signup.asp',dr:65,captcha:false,priority:1},
  {id:'danhsachvang',type:'directory',name:'DanhSachVang',url:'https://danhsachvang.vn/huong-dan-them-doanh-nghiep-moi',dr:35,captcha:false,priority:2},
  {id:'cybo',type:'directory',name:'Cybo',url:'https://www.cybo.com/add-business/',dr:70,captcha:false,priority:2},
  {id:'addyp',type:'directory',name:'Addyp',url:'https://addyp.com/user/register',dr:35,captcha:false,priority:2},
  {id:'zipleaf-vn',type:'directory',name:'ZipLeaf Vietnam',url:'https://manage2.zipleaf.com/Create-Listing',dr:35,captcha:true,priority:3},
  {id:'blogger',type:'web2',name:'Blogger',url:'https://www.blogger.com',dr:95,captcha:false,priority:1},
  {id:'wordpress-com',type:'web2',name:'WordPress.com',url:'https://wordpress.com/start/user',dr:95,captcha:false,priority:1},
  {id:'tumblr',type:'web2',name:'Tumblr',url:'https://www.tumblr.com/register',dr:90,captcha:true,priority:2},
  {id:'aboutme',type:'web2',name:'About.me',url:'https://about.me/signup',dr:85,captcha:false,priority:2},
  {id:'gravatar',type:'web2',name:'Gravatar',url:'https://gravatar.com/profile',dr:90,captcha:false,priority:3},
];

const NAP = {
  brand: BRAND, website: WEBSITE, hotline: HOTLINE, email: EMAIL,
  address: '111 Cai Lan, Bai Chay, Ha Long, Quang Ninh',
  category: 'Dich vu ve sinh / Moi truong',
};

// Generate unique profile per source
const results = SOURCES.map((s, i) => ({
  source: s.name,
  url: s.url,
  type: s.type,
  priority: s.priority,
  dr: s.dr,
  captcha: s.captcha ? 'CO CAPTCHA - can giai tay' : 'OK',
  profile_short: SHORT(i),
  profile_long: LONG(i),
  nap: NAP,
  anchor_suggested: i % 5 < 3 ? BRAND : WEBSITE,
  steps: s.type === 'directory' ? [
    `Vao: ${s.url}`,
    `Tim nut "Add Business" / "Them doanh nghiep"`,
    `Dien: Ten=${BRAND}, Web=${WEBSITE}, Phone=${HOTLINE}`,
    `Category: Ve sinh moi truong`,
    `Mo ta: ${SHORT(i)}`,
    `Submit`
  ] : [
    `Vao: ${s.url}`,
    s.id === 'blogger' ? 'Tao blog moi tren Blogger' :
    s.id === 'tumblr' ? 'Dang ky Tumblr blog moi' :
    s.id === 'aboutme' ? 'Tao profile About.me' :
    s.id === 'gravatar' ? 'Cap nhat Gravatar profile' :
    'Dang ky tai khoan WordPress.com',
    `Them link: ${WEBSITE}`,
    `Mo ta: ${SHORT(i)}`,
    `Save/Publish`
  ]
}));

// Output results
console.log(JSON.stringify(results, null, 2));
console.log('\n=== TONG KET ===');
console.log(`Tong nguon: ${results.length}`);
console.log(`Directory: ${results.filter(r=>r.type==='directory').length}`);
console.log(`Web 2.0: ${results.filter(r=>r.type==='web2').length}`);
console.log(`Co captcha (can tay): ${results.filter(r=>r.captcha!=='OK').length}`);

// Write to file
import fs from 'node:fs';
const outPath = process.cwd() + '/../docs/BACKLINK_AUTO_TEMPLATES_2026-05-10.json';
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nDa luu: docs/BACKLINK_AUTO_TEMPLATES_2026-05-10.json`);
