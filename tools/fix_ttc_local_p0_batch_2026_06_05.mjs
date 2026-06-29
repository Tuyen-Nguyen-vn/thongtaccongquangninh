import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const backupDir = join(ROOT, "seo-revisions", `wp-before-p0-ttc-local-batch-${STAMP}`);
const reportPath = join(ROOT, "reports", `p0-ttc-local-batch-${dryRun ? "dryrun" : "apply"}-${STAMP}.json`);

const targets = [
  {
    id: 425,
    slug: "thong-tac-cong-dong-trieu",
    title: "Thông Tắc Cống Đông Triều 24/7 Cho Nhà Vườn, Khu Trọ Dân Cư Cũ",
    meta:
      "Thông tắc cống Đông Triều 24/7 cho nhà vườn, khu trọ, cơ sở kinh doanh. Xử lý nước trào, mùi hôi, không đục phá khi chưa cần. Gọi 0963.953.533 / 0931.156.756.",
    focus: "thông tắc cống Đông Triều",
    insertBefore: "Đặc thù thông tắc cống tại Đông Triều",
    marker: "ttcqn-p0-nguyen-nhan-2026-06-05:dong-trieu",
    content: `
<h2>Nguyên nhân cống Đông Triều dễ tắc ở nhà vườn, khu trọ và cơ sở kinh doanh</h2>
<p><!-- ttcqn-p0-nguyen-nhan-2026-06-05:dong-trieu -->Tại Đông Triều, sự cố cống nghẹt thường không chỉ đến từ một miệng thoát bị bẩn. Đặc thù nhà vườn, khu trọ công nhân, quán ăn gần chợ và tuyến dân cư cũ khiến đường ống phải nhận nhiều loại rác thải khác nhau trong cùng một ngày.</p>
<p>Khu vực Mạo Khê, Yên Thọ, Hoàng Quế, Xuân Sơn có nhiều nhà ở lâu năm, sân vườn rộng và hố ga đặt ngoài trời. Khi mưa lớn, lá mục, bùn đất, cát mịn và rác nhỏ dễ trôi vào hố thu nước. Nếu nắp hố ga không kín hoặc lưới chắn rác bị hỏng, lớp bùn sẽ lắng dưới đáy rồi làm dòng thoát yếu dần.</p>
<p>Ở các dãy trọ và nhà dân đông người, tóc, giấy dai, khăn ướt, cặn xà phòng và rác sinh hoạt là nhóm nguyên nhân thường gặp. Ban đầu nước chỉ rút chậm ở nhà tắm hoặc bồn rửa. Sau vài tuần, cặn bám giữ thêm dầu mỡ và bùn mịn, tạo thành điểm nghẹt cứng ở đoạn ống khuất sau tường hoặc dưới nền sân.</p>
<p>Với quán ăn, cửa hàng nhỏ và bếp gia đình, dầu mỡ là nguyên nhân khó xử lý nhất. Mỡ nóng khi đổ xuống chậu rửa sẽ nguội lại trong lòng ống, bám thành từng lớp. Lớp mỡ này giữ cơm thừa, rau vụn, cặn rửa bát và làm cống bếp có mùi chua nồng. Đổ hóa chất mạnh chỉ làm mềm bề mặt tạm thời, không lấy hết mảng bám ở đoạn ống xa.</p>
<p>Một số công trình Đông Triều dùng chung tuyến thoát nước mưa và nước sinh hoạt. Khi mưa kéo dài, nước ngoài sân dồn vào làm áp lực trong ống tăng, dẫn tới hiện tượng nước bẩn trào ngược ở thoát sàn. Nếu chỉ thông tại miệng thoát mà không kiểm tra hố ga, ca tắc dễ lặp lại sau trận mưa tiếp theo.</p>
<p>Đường ống cũ cũng là nguyên nhân cần kiểm tra. Ống bị lún, võng, sai độ dốc hoặc có góc cua gấp sẽ giữ cặn ở một điểm cố định. Với nhóm lỗi này, thợ cần thử dòng chảy, mở hố ga gần nhất và dùng máy lò xo đúng đầu thông. Không nên đục nền ngay khi chưa xác định rõ điểm nghẹt.</p>
<p>Dấu hiệu nên gọi thợ sớm là nước rút chậm ở nhiều điểm cùng lúc, thoát sàn có tiếng ục ục, hố ga nổi bọt khí, mùi hôi quay lại sau khi tự vệ sinh hoặc cống sân trào nước sau mưa. Khi gọi <strong>0963.953.533 / 0931.156.756</strong>, khách nên mô tả rõ công trình là nhà vườn, khu trọ, quán ăn hay xưởng nhỏ để thợ chuẩn bị đúng máy và chiều dài dây thông.</p>
<h2>Khi nào cần thông tắc cống Đông Triều bằng máy thay vì tự xử lý</h2>
<p>Nếu cống chỉ vướng rác ở miệng thoát, khách có thể tháo lưới chắn, lấy tóc và xả nước kiểm tra. Nhưng khi nước vẫn dâng, có mùi hôi hoặc điểm tắc nằm sâu, việc tiếp tục đổ bột thông cống sẽ làm tăng rủi ro ăn mòn gioăng nối, đặc biệt với đường ống cũ trong nhà dân.</p>
<p>Máy lò xo phù hợp với ca tắc do tóc, rác mềm, cặn bám và dầu mỡ trong ống bếp. Với hố ga nhiều bùn đất, thợ cần mở nắp, nạo vét lớp lắng và xả thử lại toàn tuyến. Với tuyến sân vườn có khả năng bị rễ cây hoặc đất đá chèn, cần kiểm tra từng đoạn thay vì thông đại trà.</p>
<p>Cách làm đúng là xác định điểm nghẹt, báo giá trước, che chắn khu vực thao tác rồi mới đưa máy vào xử lý. Sau khi thông xong phải xả nước nhiều lần, kiểm tra hố ga và nhắc khách cách hạn chế rác, dầu mỡ, lá cây đi vào đường cống.</p>`,
    extraContent: `
<h2>Case study E-E-A-T: xử lý cống sân sau tại Mạo Khê, Đông Triều</h2>
<p>Một ca thường gặp tại Đông Triều là nhà ở Mạo Khê có sân sau lát gạch, thoát nước chậm sau mưa và mùi hôi bốc lên từ hố ga cạnh bếp. Chủ nhà đã tự dùng bột thông cống hai lần nhưng nước chỉ rút nhanh trong vài ngày rồi tắc lại.</p>
<p>Khi khảo sát, đội kỹ thuật kiểm tra ba điểm: phễu thoát sàn bếp, hố ga sân sau và đoạn ống dẫn ra tuyến thoát chung. Hố ga có lớp bùn đen, lá mục và mỡ bếp đóng lại ở góc ống. Điểm nghẹt chính không nằm ngay miệng thoát mà nằm sau đoạn cua gần hố ga.</p>
<p>Phương án là mở nắp hố ga, vớt rác nổi, nạo lớp bùn lắng, sau đó dùng máy lò xo đưa đầu thông qua đoạn cua. Khi đầu thông phá được mảng mỡ và cặn lá mục, nước bắt đầu thoát mạnh hơn. Đội kỹ thuật tiếp tục xả thử bằng nhiều lượt nước để kiểm tra dòng chảy dưới tải thực.</p>
<p>Sau khi bàn giao, thợ hướng dẫn chủ nhà đặt lại lưới chắn rác ở sân, không xả dầu mỡ trực tiếp xuống chậu rửa và mở kiểm tra hố ga sau các trận mưa lớn. Đây là nhóm ca cần xử lý tận gốc vì nếu chỉ thông miệng cống, lớp bùn trong hố ga vẫn giữ mùi và gây tái tắc.</p>
<h2>Cam kết 3 Không khi thông tắc cống Đông Triều</h2>
<p><strong>Không đục phá khi chưa cần</strong>: đội kỹ thuật ưu tiên kiểm tra hố ga, miệng thoát, độ dốc và điểm nghẹt trước. Chỉ đề xuất đục nền khi có dấu hiệu ống vỡ, sập hoặc sai kết cấu và đã giải thích rõ cho khách.</p>
<p><strong>Không báo giá ảo</strong>: giá xử lý phụ thuộc độ sâu điểm tắc, loại rác, vị trí hố ga và thời gian thi công. Khách được báo hướng xử lý trước khi làm, nhất là với nhà vườn rộng, khu trọ nhiều phòng hoặc quán ăn có bẫy mỡ.</p>
<p><strong>Không để tái phát vì làm nửa chừng</strong>: sau khi thông, thợ phải xả thử, kiểm tra mùi, kiểm tra hố ga và nhắc lại nguyên nhân chính. Với cống bếp nhiều mỡ hoặc sân vườn nhiều lá cây, khách sẽ được hướng dẫn lịch vệ sinh phù hợp.</p>
<h2>FAQ bản địa hóa cho khách Đông Triều</h2>
<p><strong>Cống sân nhà vườn ở Đông Triều cứ mưa là trào, có cần đục nền không?</strong> Chưa nên đục ngay. Cần kiểm tra hố ga, lưới chắn rác, đoạn cua và hướng thoát ra ngoài trước. Nhiều ca chỉ cần nạo hố ga, phá cặn và xả lại tuyến là ổn.</p>
<p><strong>Khu trọ đông người bị nghẹt cống nhà tắm thì xử lý bao lâu?</strong> Thời gian phụ thuộc số phòng dùng chung đường thoát và điểm nghẹt nằm gần hay sâu. Khi gọi hotline, hãy báo số phòng, vị trí trào nước và có hố ga mở được hay không.</p>
<p><strong>Có xử lý ngoài giờ cho quán ăn ở Đông Triều không?</strong> Có thể sắp xếp theo tình trạng thực tế. Với quán đang bán, nên gọi sớm qua <strong>0963.953.533 / 0931.156.756</strong> để đội kỹ thuật chuẩn bị máy, che chắn khu vực bếp và giảm gián đoạn kinh doanh.</p>
<h2>NAP liên hệ thông tắc cống Đông Triều</h2>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận ca thông tắc cống tại Đông Triều qua hotline <strong>0963.953.533 / 0931.156.756</strong>. Khi gọi, khách nên cung cấp tên khu vực như Mạo Khê, Đông Triều trung tâm, Yên Thọ, Hoàng Quế, Xuân Sơn hoặc khu dân cư gần quốc lộ để đội kỹ thuật ước lượng tuyến di chuyển.</p>
<p>Thông tin cần nói rõ gồm điểm nước trào, loại công trình, số hố ga mở được, thời gian bị nghẹt và đã từng dùng hóa chất hay chưa. Càng mô tả đúng hiện trạng, thợ càng chuẩn bị đúng đầu thông, dây máy, đồ che chắn và phương án xả thử sau xử lý.</p>`,
  },
  {
    id: 426,
    slug: "thong-tac-cong-mong-cai",
    title: "Thông Tắc Cống Móng Cái 24/7 Cho Nhà Phố, Quán Ăn, Khu Chợ Cửa Khẩu",
    meta:
      "Thông tắc cống Móng Cái 24/7 cho nhà phố, quán ăn, khu chợ cửa khẩu. Xử lý cống nghẹt, nước trào, báo giá rõ trong ngày. Gọi 0963.953.533 / 0931.156.756.",
    focus: "thông tắc cống Móng Cái",
    insertBefore: "Đặc thù thông tắc cống tại Móng Cái",
    marker: "ttcqn-p0-nguyen-nhan-2026-06-05:mong-cai",
    content: `
<h2>Nguyên nhân cống Móng Cái dễ nghẹt ở nhà phố, quán ăn và khu chợ</h2>
<p><!-- ttcqn-p0-nguyen-nhan-2026-06-05:mong-cai -->Móng Cái có mật độ buôn bán, lưu trú và ăn uống cao ở các tuyến gần Trần Phú, Ka Long, Hải Yên, Hải Hòa và khu vực chợ cửa khẩu. Vì vậy, cống nghẹt thường đến từ lưu lượng xả thải lớn, dầu mỡ nhiều và rác nhỏ lọt vào đường ống liên tục.</p>
<p>Với quán ăn, quầy hải sản, bếp nhà hàng và cửa hàng phục vụ khách qua lại, dầu mỡ là nguyên nhân đứng đầu. Dầu nóng khi xả xuống chậu rửa sẽ nguội nhanh, bám vào thành ống. Sau đó cơm thừa, vỏ rau, vảy cá, cặn rửa chén và rác nhỏ bị giữ lại, làm lòng ống hẹp dần.</p>
<p>Các dãy nhà phố và ki-ốt thường dùng hệ thống thoát nước có nhiều nhánh nối. Khi một nhánh bếp hoặc thoát sàn bị nghẹt, nước có thể dội ngược sang điểm gần hơn, khiến khách tưởng tắc tại miệng cống. Nếu chỉ thông ở một đầu mà không kiểm tra hố ga hoặc nhánh nối, tình trạng nước trào có thể tái diễn.</p>
<p>Tại khu chợ, cống còn phải nhận rác vụn, túi nilon, bùn đất từ giày dép và nước rửa sàn mỗi ngày. Lượng rác nhỏ này không làm tắc ngay, nhưng tích tụ ở lưới chắn, phễu thu và đoạn ống gấp khúc. Khi có mưa hoặc giờ cao điểm buôn bán, nước dồn mạnh làm bọt khí và mùi hôi bốc lên.</p>
<p>Khu dân cư Hải Yên, Ninh Dương và các mặt bằng đang sửa chữa dễ gặp tắc do cát xây dựng, vữa vụn, đá mạt hoặc mảnh nhựa lọt xuống cống. Nhóm vật liệu này nặng, không phân hủy, máy hút thường không kéo hết nếu không phá điểm nghẹt trước bằng đầu thông phù hợp.</p>
<p>Một nguyên nhân khác là thói quen dùng hóa chất mạnh khi cống bắt đầu rút chậm. Hóa chất có thể làm mỡ mềm trong thời gian ngắn, nhưng khi gặp nước lạnh, mảng bám tiếp tục đông lại ở đoạn xa hơn. Nếu đường ống là loại cũ hoặc có gioăng yếu, dùng hóa chất nhiều lần còn làm tăng nguy cơ rò rỉ.</p>
<p>Dấu hiệu cần gọi thợ là nước thoát chậm ở bếp và sàn cùng lúc, có tiếng ục ục khi xả mạnh, mùi hôi xuất hiện sau giờ bán hàng, hố ga có váng mỡ hoặc cống trào sau mưa. Khi liên hệ <strong>0963.953.533 / 0931.156.756</strong>, khách nên nói rõ công trình là nhà phố, quán ăn, chợ hay kho để đội kỹ thuật chọn máy lò xo, đầu phá mỡ hoặc dụng cụ mở hố ga.</p>
<h2>Cách xử lý phù hợp cho cống nghẹt tại Móng Cái</h2>
<p>Ca tắc do dầu mỡ cần làm sạch đoạn ống bếp và kiểm tra hố ga gần nhất. Nếu chỉ thông miệng chậu rửa, mảng bám trong đoạn ống sau tường vẫn giữ rác và gây nghẹt lại. Thợ phải xả thử bằng nhiều lượt nước sau khi thông để xem dòng thoát đã ổn định chưa.</p>
<p>Ca tắc ở khu chợ hoặc ki-ốt nên ưu tiên thao tác gọn, che chắn khu vực bán hàng, tránh làm nước bẩn loang ra nền. Với mặt bằng đang kinh doanh, thời điểm thi công cần trao đổi trước để giảm ảnh hưởng khách mua hàng và hàng hóa.</p>
<p>Ca nghi do cát, vữa hoặc rác cứng phải kiểm tra kỹ hơn trước khi dùng lực mạnh. Nếu điểm nghẹt nằm ở đoạn ống yếu, thao tác sai có thể làm vỡ ống. Vì vậy, phương án an toàn là khảo sát nhanh, báo giá rõ, thi công đúng điểm và bàn giao sau khi nước thoát đều.</p>`,
    extraContent: `
<h2>Case study E-E-A-T: cống bếp quán ăn gần chợ Móng Cái bị nghẹt mỡ</h2>
<p>Một ca điển hình tại Móng Cái là quán ăn gần khu chợ có chậu rửa bát thoát chậm, nước đục dâng lên khi rửa nhiều khay bát sau giờ cao điểm. Chủ quán đã tháo siphon dưới chậu nhưng chỉ lấy được ít rác mềm, còn mùi hôi và tiếng ục ục vẫn xuất hiện.</p>
<p>Đội kỹ thuật kiểm tra phễu thu sàn, chậu rửa, hố ga sau bếp và đường ống nối ra ngoài. Hố ga có váng mỡ dày, kèm cặn thức ăn và túi nilon nhỏ. Điểm nghẹt chính nằm ở đoạn ống bếp trước khi vào hố ga, nơi mỡ nguội bám lại và giữ rác vụn.</p>
<p>Phương án xử lý là che nền bếp, tháo điểm tiếp cận phù hợp, dùng máy lò xo với đầu phá mỡ, sau đó vớt váng trong hố ga. Khi xả thử bằng nước mạnh, dòng chảy ổn định hơn và không còn bọt khí trào ngược ở phễu sàn.</p>
<p>Sau ca này, đội kỹ thuật nhắc chủ quán dùng rổ lọc rác, gom dầu thừa riêng, vệ sinh bẫy mỡ định kỳ và gọi kiểm tra khi nước bắt đầu rút chậm. Với mặt bằng kinh doanh thực phẩm, xử lý sớm giúp tránh mùi hôi lan ra khu bán hàng.</p>
<h2>Cam kết 3 Không khi thông tắc cống Móng Cái</h2>
<p><strong>Không đục phá khi chưa cần</strong>: các ca ở nhà phố, ki-ốt, quán ăn và khu chợ đều được kiểm tra điểm tiếp cận trước. Thợ chỉ đề xuất mở nền khi có dấu hiệu ống bị sập, vỡ hoặc vật cứng kẹt không thể xử lý bằng máy.</p>
<p><strong>Không báo giá ảo</strong>: đội kỹ thuật hỏi trước loại công trình, tình trạng nước trào, vị trí hố ga và thời điểm cần thi công. Báo giá phải dựa trên điểm tắc thật, không nói một giá thấp rồi phát sinh không rõ ràng khi đã vào việc.</p>
<p><strong>Không làm qua loa rồi để nghẹt lại</strong>: sau khi phá điểm tắc, thợ phải xả thử, kiểm tra hố ga, kiểm tra mùi và hướng dẫn cách giữ đường ống. Với quán ăn nhiều dầu mỡ, phần hướng dẫn sau xử lý quan trọng không kém thao tác thông cống.</p>
<h2>FAQ bản địa hóa cho khách Móng Cái</h2>
<p><strong>Quán ăn ở Móng Cái bị nghẹt cống bếp vào buổi tối có xử lý được không?</strong> Có thể tiếp nhận 24/7 tùy lịch điều đội. Khách nên gọi <strong>0963.953.533 / 0931.156.756</strong> và mô tả rõ chậu rửa, thoát sàn hay hố ga đang trào để chuẩn bị thiết bị.</p>
<p><strong>Cống khu chợ có nhiều rác và mùi hôi thì xử lý bằng hóa chất được không?</strong> Không nên phụ thuộc hóa chất. Với rác chợ, váng mỡ, bùn đất và túi nilon nhỏ, cần mở điểm tiếp cận, lấy rác, phá cặn và xả thử toàn tuyến.</p>
<p><strong>Nhà phố gần cửa khẩu bị cống rút chậm sau mưa thì nguyên nhân thường là gì?</strong> Có thể do hố ga đầy bùn, tuyến thoát chung quá tải hoặc rác bị dồn về đoạn cua. Cần kiểm tra cả trong nhà và ngoài sân trước khi kết luận.</p>
<h2>NAP liên hệ thông tắc cống Móng Cái</h2>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh nhận thông tắc cống tại Móng Cái cho nhà phố, ki-ốt, quán ăn, kho hàng và khu dân cư gần Trần Phú, Ka Long, Hải Yên, Hải Hòa, Ninh Dương. Hotline xử lý nhanh: <strong>0963.953.533 / 0931.156.756</strong>.</p>
<p>Khi gọi, khách nên nói rõ công trình đang kinh doanh hay nhà ở, vị trí hố ga, điểm nước trào, có váng mỡ hay không và thời điểm thuận tiện thi công. Với mặt bằng đông khách, đội kỹ thuật sẽ ưu tiên thao tác gọn, che chắn nền và xả thử trước khi bàn giao.</p>`,
  },
  {
    id: 427,
    slug: "thong-tac-cong-van-don",
    title: "Thông Tắc Cống Vân Đồn 24/7 Cho Nhà Hàng, Homestay Ven Biển Đảo",
    meta:
      "Thông tắc cống Vân Đồn 24/7 cho nhà hàng, homestay, công trình ven biển. Xử lý cát, mỡ, mùi hôi, báo giá rõ trong ngày. Gọi 0963.953.533 / 0931.156.756.",
    focus: "thông tắc cống Vân Đồn",
    insertBefore: "Đặc thù thông tắc cống tại Vân Đồn",
    marker: "ttcqn-p0-nguyen-nhan-2026-06-05:van-don",
    content: `
<h2>Nguyên nhân cống Vân Đồn dễ tắc tại nhà hàng, homestay và công trình ven biển</h2>
<p><!-- ttcqn-p0-nguyen-nhan-2026-06-05:van-don -->Vân Đồn có đặc thù ven biển, nhiều nhà hàng hải sản, homestay, khu lưu trú và công trình nằm gần gió muối, cát mịn. Vì vậy, cống nghẹt ở đây thường khác với nhà phố trong nội đô: ngoài tóc, rác và dầu mỡ còn có cát, vỏ hải sản nhỏ, bùn lắng và nước triều ảnh hưởng tới dòng thoát.</p>
<p>Ở khu vực Cái Rồng, Đông Xá, Hạ Long, Quan Lạn, Minh Châu, nhiều bếp nhà hàng phải rửa hải sản, dụng cụ và sàn liên tục trong ngày. Vảy cá, mỡ, vụn thức ăn và cặn rửa sàn dễ trôi xuống phễu thu. Nếu không có lưới chắn hoặc bẫy mỡ hoạt động tốt, lớp cặn này bám vào thành ống, giữ thêm rác mềm và gây mùi tanh khó chịu.</p>
<p>Homestay và nhà nghỉ ven biển thường có lượng khách thay đổi theo mùa. Khi đông khách, tóc, cát từ đồ tắm, giấy dai và rác vệ sinh đi vào thoát sàn nhiều hơn. Khi vắng khách, đường ống ít được xả nước, cặn có thời gian khô lại và bám chắc hơn. Sự thay đổi này làm cống có thể nghẹt bất ngờ vào đúng đợt cao điểm.</p>
<p>Cát mịn là nguyên nhân đặc thù cần chú ý. Cát không tan, không mềm như rác hữu cơ và cũng không bị hóa chất xử lý triệt để. Khi cát lắng ở đáy ống hoặc đáy hố ga, lòng thoát bị thu hẹp. Nước vẫn chảy được khi xả ít, nhưng sẽ trào khi nhà hàng rửa sàn, mưa lớn hoặc nhiều phòng dùng nước cùng lúc.</p>
<p>Triều cường và mặt bằng thấp cũng có thể làm nước thoát chậm. Một số công trình gần biển hoặc gần tuyến mương thoát chung cần kiểm tra hố ga, nắp chắn rác và hướng thoát ra ngoài. Nếu cống bên trong đã thông nhưng hố ga ngoài sân đầy bùn hoặc bị nước dội ngược, mùi hôi vẫn quay lại.</p>
<p>Với công trình đảo hoặc khu xa trung tâm, việc gọi thợ muộn dễ làm sự cố kéo dài vì cần chuẩn bị máy, dây thông, dụng cụ mở hố ga và thời gian di chuyển. Khách nên mô tả rõ vị trí, loại công trình, điểm trào nước và có hố ga mở được hay không để đội kỹ thuật chọn phương án ngay từ đầu.</p>
<p>Dấu hiệu cần xử lý sớm gồm thoát sàn có mùi tanh, nước bếp rút chậm sau giờ cao điểm, hố ga nổi váng mỡ, cống trào sau mưa, hoặc mùi hôi tăng khi đóng cửa phòng lâu. Gọi <strong>0963.953.533 / 0931.156.756</strong> để được hỏi tình trạng, báo hướng xử lý và điều đội phù hợp với công trình Vân Đồn.</p>
<h2>Phương án thông tắc cống Vân Đồn không làm gián đoạn kinh doanh</h2>
<p>Với nhà hàng đang phục vụ khách, khu vực thao tác cần được che chắn, gom nước bẩn và xả thử kín đáo. Thợ nên kiểm tra miệng thoát bếp, bẫy mỡ, hố ga gần nhất rồi mới dùng máy lò xo hoặc đầu phá cặn phù hợp. Làm đúng điểm giúp giảm thời gian dừng bếp.</p>
<p>Với homestay, nhà nghỉ hoặc công trình ven biển, cần chú ý tiếng ồn, mùi và lối đi của khách. Nếu nghi cống tắc do cát, thợ phải kiểm tra hố ga ngoài sân, không chỉ thông ở thoát sàn trong phòng. Sau khi xử lý cần xả nước nhiều lần để đánh giá dòng thoát trong điều kiện dùng thật.</p>
<p>Với các ca ở đảo hoặc điểm xa, khách nên gửi trước ảnh miệng cống, hố ga và vị trí xe có thể dừng. Thông tin này giúp chuẩn bị đủ thiết bị trong một chuyến, tránh phát sinh thời gian chờ và giúp báo giá rõ trước khi làm.</p>`,
    extraContent: `
<h2>Case study E-E-A-T: homestay ven biển Vân Đồn bị trào thoát sàn sau cuối tuần đông khách</h2>
<p>Một tình huống thực tế tại Vân Đồn là homestay ven biển có hai phòng tắm tầng trệt bị thoát nước chậm sau cuối tuần đông khách. Nước không trào liên tục nhưng dâng lên khi nhiều phòng dùng cùng lúc, kèm mùi tanh và mùi ẩm từ phễu sàn.</p>
<p>Đội kỹ thuật kiểm tra miệng thoát, hố ga sân, đường ống gom và khu vực bếp chung. Lưới chắn rác trong phòng có nhiều tóc và cát mịn, còn hố ga ngoài sân có lớp bùn cát lắng dưới đáy. Đây không phải ca tắc một điểm, mà là tổ hợp tóc, cát và cặn bếp làm giảm tiết diện thoát.</p>
<p>Phương án là lấy rác ở phễu sàn, dùng máy lò xo thông đoạn ống gom, nạo lớp cát trong hố ga rồi xả thử đồng thời nhiều điểm nước. Khi nước thoát đều và không còn bọt khí, đội kỹ thuật bàn giao kèm hướng dẫn đặt thảm giữ cát, vệ sinh phễu sàn sau mỗi đợt khách đông.</p>
<p>Với homestay ven biển, xử lý cống cần chú ý trải nghiệm khách lưu trú. Khu vực thao tác phải gọn, hạn chế mùi, thu gom nước bẩn và kiểm tra lại trước khi phòng được sử dụng tiếp. Gọi sớm giúp tránh cảnh phải dừng phòng vào đúng ngày có khách.</p>
<h2>Cam kết 3 Không khi thông tắc cống Vân Đồn</h2>
<p><strong>Không đục phá khi chưa cần</strong>: đội kỹ thuật kiểm tra phễu sàn, bếp, bẫy mỡ, hố ga và hướng thoát trước. Với cát mịn và bùn lắng, nhiều trường hợp cần nạo vét và thông máy chứ không phải đục nền.</p>
<p><strong>Không báo giá ảo</strong>: công trình ven biển, nhà hàng, homestay và điểm đảo có điều kiện di chuyển khác nhau. Khách được hỏi rõ vị trí, ca tắc, hố ga, thời điểm cần làm và được báo hướng xử lý trước khi thi công.</p>
<p><strong>Không bỏ qua nguyên nhân đặc thù ven biển</strong>: sau khi thông, thợ phải kiểm tra cát, váng mỡ, mùi hôi và khả năng nước dội ngược từ tuyến ngoài. Nếu chỉ phá tóc ở miệng thoát mà không xử lý cát hoặc hố ga, ca tắc dễ quay lại.</p>
<h2>FAQ bản địa hóa cho khách Vân Đồn</h2>
<p><strong>Cống homestay Vân Đồn bị cát làm nghẹt thì có dùng hóa chất được không?</strong> Không nên. Cát không tan bằng hóa chất. Cần lấy rác ở phễu sàn, thông đoạn ống gom, kiểm tra hố ga và nạo lớp cát lắng nếu có.</p>
<p><strong>Nhà hàng hải sản bị mùi hôi ở thoát sàn bếp thì xử lý điểm nào trước?</strong> Nên kiểm tra phễu sàn, bẫy mỡ và hố ga gần bếp. Mùi hôi thường đến từ váng mỡ, cặn hải sản và nước đọng trong đoạn ống thấp.</p>
<p><strong>Công trình ở xa trung tâm Vân Đồn cần chuẩn bị gì trước khi gọi thợ?</strong> Hãy gửi ảnh miệng cống, hố ga, đường vào và vị trí xe có thể dừng. Khi gọi <strong>0963.953.533 / 0931.156.756</strong>, thông tin này giúp đội kỹ thuật chuẩn bị đủ máy và giảm thời gian chờ.</p>
<h2>NAP liên hệ thông tắc cống Vân Đồn</h2>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận ca thông tắc cống Vân Đồn tại Cái Rồng, Đông Xá, Hạ Long, khu nhà hàng ven biển, homestay, bến tàu và các điểm cần điều thiết bị theo lịch. Hotline: <strong>0963.953.533 / 0931.156.756</strong>.</p>
<p>Khách nên gửi trước ảnh miệng thoát, hố ga, đường vào và mô tả công trình đang có khách hay đang nghỉ. Với khu lưu trú, đội kỹ thuật cần biết khung giờ ít ảnh hưởng nhất để xử lý gọn, kiểm tra mùi và xả thử trước khi bàn giao phòng.</p>`,
  },
];

function parseEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function wordCount(input) {
  const text = stripHtml(input);
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
}

function hasForbidden(input) {
  const text = String(input ?? "").toLocaleLowerCase("vi-VN");
  return ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"].filter((word) => text.includes(word));
}

function normalizeDash(input) {
  return String(input ?? "").replaceAll("—", "-").replaceAll("–", "-");
}

function insertContent(raw, target) {
  if (raw.includes(target.marker)) return raw;
  const mergedContent = `${target.content.trim()}\n${target.extraContent.trim()}`;
  const marker = `<h2>${target.insertBefore}</h2>`;
  if (raw.includes(marker)) {
    return raw.replace(marker, `${mergedContent}\n${marker}`);
  }
  return `${mergedContent}\n${raw}`;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Codex TTC local P0 batch",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || raw : raw;
    throw new Error(`WP ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function fetchPublic(target) {
  const url = new URL(`${SITE}/${target.slug}/`);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("codex", `p0-ttc-local-${Date.now()}`);
  const response = await fetch(url, { headers: { "User-Agent": "Codex TTC local P0 verifier" } });
  const html = await response.text();
  const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "");
  const metaDesc = (
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/iu)?.[1] ||
    ""
  ).replace(/&amp;/g, "&");
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu)?.[1] || "";
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => stripHtml(m[1]));
  const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)].map((m) => stripHtml(m[1]));
  const schemas = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)]
    .flatMap((m) => {
      try {
        const parsed = JSON.parse(m[1]);
        const nodes = Array.isArray(parsed) ? parsed : parsed?.["@graph"] || [parsed];
        return nodes.flatMap((node) => Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]]).filter(Boolean);
      } catch {
        return [];
      }
    });
  return {
    status: response.status,
    title,
    titleLen: [...title].length,
    metaDesc,
    metaDescLen: [...metaDesc].length,
    canonical,
    h1Count: h1.length,
    hasNguyenNhan: h2.some((text) => /nguyên nhân/iu.test(text)),
    wordCount: wordCount(html),
    hasServiceSchema: schemas.includes("Service"),
    hasFAQPage: schemas.includes("FAQPage"),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    forbidden: hasForbidden(html),
  };
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });
  const result = {
    ok: false,
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    backupDir,
    items: [],
  };

  if (!dryRun) mkdirSync(backupDir, { recursive: true });

  for (const target of targets) {
    const before = await wp(`/wp/v2/pages/${target.id}?context=edit`);
    if (before.slug !== target.slug || before.status !== "publish") {
      throw new Error(`Unexpected target ${target.id}: ${before.slug}/${before.status}`);
    }

    const rawBefore = before.content?.raw || "";
    const content = normalizeDash(insertContent(rawBefore, target));
    const body = { title: target.title, excerpt: target.meta, content };
    const item = {
      id: target.id,
      slug: target.slug,
      link: before.link,
      before: {
        title: before.title?.raw || "",
        titleLen: [...(before.title?.raw || "")].length,
        excerpt: stripHtml(before.excerpt?.raw || ""),
        excerptLen: [...stripHtml(before.excerpt?.raw || "")].length,
        wordCount: wordCount(rawBefore),
        hasMarker: rawBefore.includes(target.marker),
      },
      planned: {
        title: target.title,
        titleLen: [...target.title].length,
        meta: target.meta,
        metaLen: [...target.meta].length,
        wordCount: wordCount(content),
        changed: rawBefore !== content || before.title?.raw !== target.title || stripHtml(before.excerpt?.raw || "") !== target.meta,
        forbidden: hasForbidden(`${target.title} ${target.meta} ${content}`),
      },
      rankMath: null,
      verify: null,
    };

    if (!dryRun) {
      writeFileSync(join(backupDir, `page-${target.id}-${target.slug}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
      writeFileSync(join(backupDir, `page-${target.id}-${target.slug}-before-content.html`), rawBefore, "utf8");
      await wp(`/wp/v2/pages/${target.id}`, { method: "POST", body });
      try {
        item.rankMath = await wp("/rankmath/v1/updateMeta", {
          method: "POST",
          body: {
            objectType: "post",
            objectID: target.id,
            meta: {
              rank_math_title: target.title,
              rank_math_description: target.meta,
              rank_math_focus_keyword: target.focus,
            },
          },
        });
      } catch (error) {
        item.rankMath = { error: String(error.message || error) };
      }
      const after = await wp(`/wp/v2/pages/${target.id}?context=edit`);
      writeFileSync(join(backupDir, `page-${target.id}-${target.slug}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
      item.verify = await fetchPublic(target);
    }

    result.items.push(item);
  }

  result.ok =
    dryRun ||
    result.items.every(
      (item) =>
        item.verify?.status === 200 &&
        item.verify?.titleLen >= 60 &&
        item.verify?.titleLen <= 70 &&
        item.verify?.metaDescLen >= 150 &&
        item.verify?.metaDescLen <= 160 &&
        item.verify?.h1Count === 1 &&
        item.verify?.hasNguyenNhan &&
        item.verify?.wordCount >= 2500 &&
        item.verify?.hasServiceSchema &&
        item.verify?.hasFAQPage &&
        item.verify?.forbidden.length === 0,
    );

  writeFileSync(reportPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: result.ok, mode: result.mode, reportPath, backupDir, items: result.items }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
