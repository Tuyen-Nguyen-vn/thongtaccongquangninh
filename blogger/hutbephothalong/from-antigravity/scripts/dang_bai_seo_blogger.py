import os
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']

def get_blogger_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Loi: Chua xac thuc! Vui long chay file xac_thuc_blogger.py truoc.")
            return None
            
    return build('blogger', 'v3', credentials=creds)

def dang_bai_blogger(blog_id, title, content_html, tags=None):
    try:
        service = get_blogger_service()
        if not service:
            return None
            
        body = {
            "kind": "blogger#post",
            "title": title,
            "content": content_html
        }
        
        if tags:
            body["labels"] = tags
            
        # Luon de o che do DRAFT (Ban nhap) de anh Tuyen duyet truoc khi cong khai
        request = service.posts().insert(blogId=blog_id, body=body, isDraft=True)
        response = request.execute()
        
        print(f"\n DANG BAI VIET NHAP THANH CONG!")
        print(f"Tieu de   : {response.get('title')}")
        print(f"ID Bai    : {response.get('id')}")
        print(f"Link nhap : {response.get('url')}")
        return response
    except Exception as e:
        print(f"Loi khi dang bai viet: {e}")
        return None

if __name__ == '__main__':
    # ID Blog 1 cua anh Tuyen: Hut be phot Ha Long - Quang Ninh
    BLOG_ID = "2990849741025760292" 
    
    TIEU_DE = "Hút bể phốt Hạ Long giá rẻ không đục phá - 0963.953.533"
    
    # Noi dung HTML chuan SEO chu ky tu dai 2500+ tu voi day du thong tin backlink va NAP
    NOI_DUNG_HTML = """
    <p>Đường cống thoát nước nhà bạn đang gặp sự cố tắc nghẽn nghiêm trọng? Bồn cầu bị trào ngược, bốc mùi hôi thối khó chịu làm đảo lộn hoàn toàn sinh hoạt của gia đình bạn? Bạn đang tìm kiếm một đơn vị cung cấp dịch vụ <strong>hút bể phốt Hạ Long</strong> thực sự có năng lực, thi công sạch sẽ mà không đập phá công trình? Hãy để công ty <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> đồng hành giải quyết dứt điểm nỗi lo của bạn qua hotline liên hệ nhanh 0963.953.533 hoặc 0931.156.756.</p>
    
    <!-- Anh dai dien chuan SEO (img src truc tiep, alt co ten khu vuc) -->
    <div style="text-align: center; margin: 20px 0;">
        <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200" alt="Dich vu hut be phot Ha Long thi cong khong duc pha bang cong nghe chan khong" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>

    <p>Hiện nay trên địa bàn Thành phố Hạ Long có rất nhiều đơn vị quảng cáo dịch vụ thông hút bể phốt với mức giá siêu rẻ, chỉ từ vài chục nghìn đồng. Tuy nhiên, phần lớn trong số đó là các cá nhân tự phát, sử dụng xe hút cũ kỹ, công nghệ thô sơ dẫn đến việc phải đục phá nắp bể phốt, gây mùi hôi thối nồng nặc và báo khống khối lượng nhằm trục lợi từ khách hàng. Để bảo vệ quyền lợi của mình, việc lựa chọn một pháp nhân có đầy đủ năng lực hành vi và trang thiết bị hiện đại là vô cùng cần thiết.</p>

    <h2>Nguyên nhân bể phốt bị đầy và tắc nghẽn thường gặp</h2>
    <p>Bể phốt (hay bể tự hoại) là nơi tiếp nhận toàn bộ chất thải sinh hoạt từ bồn cầu, bồn tiểu của gia đình. Trong điều kiện bình thường, các chất thải hữu cơ sẽ được phân hủy bởi hệ vi sinh học yếm khí có sẵn trong bể. Tuy nhiên, sau một thời gian dài sử dụng, bể phốt của bạn sẽ bị đầy ứ do các nguyên nhân chính sau:</p>
    <ul>
        <li><strong>Nhu cầu sử dụng quá tải:</strong> Bể phốt được thiết kế cho số lượng người sử dụng cố định. Khi số lượng thành viên tăng lên đột biến (như nhà hàng, khách sạn đông khách hoặc khu trọ đông người), lượng chất thải nạp vào vượt xa tốc độ phân hủy tự nhiên của vi sinh vật.</li>
        <li><strong>Xả chất thải khó phân hủy vào bồn cầu:</strong> Thói quen vứt băng vệ sinh, bao cao su, đầu lọc thuốc lá, đặc biệt là khăn giấy ướt (loại khăn giấy làm từ sợi polymer không thể phân hủy trong nước) trực tiếp xuống bồn cầu sẽ làm tắc nghẽn đường ống dẫn và tích tụ làm đầy bể tự hoại nhanh chóng.</li>
        <li><strong>Đổ nước xà phòng, hóa chất tẩy rửa mạnh xuống bồn cầu:</strong> Nước xà phòng tắm, nước rửa chén hay các loại nước tẩy bồn cầu có tính sát khuẩn cực mạnh khi trôi xuống bể phốt sẽ tiêu diệt hoàn toàn hệ vi khuẩn yếm khí có lợi. Không còn vi khuẩn phân hủy, chất thải rắn tích tụ lại thành lớp bùn đặc bám chặt đáy bể và gây ra hiện tượng đầy ứ nhanh chóng.</li>
        <li><strong>Lượng mỡ thừa trôi từ bồn rửa bát sang:</strong> Nhiều công trình thiết kế đường ống thoát nước thải chung. Lượng mỡ thừa khi rửa bát trôi xuống gặp lạnh sẽ đông đặc lại thành các mảng bám cứng như đá (saponification), bít kín đường ống thoát của bể tự hoại.</li>
    </ul>
    
    <p>Khi nhận thấy bồn cầu xả nước thoát chậm, có bong bóng khí sủi lên kèm tiếng kêu ọc ọc hoặc mùi hôi thối nồng nặc bốc ra từ nhà vệ sinh, đó chính là dấu hiệu cảnh báo bể phốt nhà bạn đã quá tải và cần được thông hút ngay lập tức để tránh làm hỏng hóc hệ thống đường ống thoát.</p>

    <!-- CTA Hotline o giua bai -->
    <div style="background-color: #f6ffed; border-left: 4px solid #52c41a; padding: 20px; margin: 30px 0; text-align: center; border-radius: 4px;">
        <p style="font-size: 20px; font-weight: bold; margin: 0; color: #1f2937;">MÔI TRƯỜNG ĐÔ THỊ SỐ 1 QUẢNG NINH KHẢO SÁT MIỄN PHÍ 100%</p>
        <p style="margin: 10px 0; font-size: 16px;">Có mặt sau 15 phút tại Hạ Long - Hotline liên hệ hỗ trợ 24/7:</p>
        <p style="font-size: 26px; font-weight: bold; margin: 0;"><a href="tel:0963953533" style="color: #ff4d4f; text-decoration: none;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; text-decoration: none;">0931.156.756</a></p>
    </div>

    <h2>Tại sao chọn dịch vụ hút bể phốt Hạ Long của Môi Trường Đô Thị Số 1 Quảng Ninh?</h2>
    <p>Với hơn 10 năm kinh nghiệm trong lĩnh vực vệ sinh môi trường tại khu vực miền Bắc, công ty chúng tôi là địa chỉ tin cậy hàng đầu được hàng nghìn hộ gia đình, cơ quan, doanh nghiệp tại Quảng Ninh lựa chọn. Chúng tôi cam kết mang lại sự an tâm tuyệt đối cho khách hàng nhờ dịch vụ chất lượng cao vượt trội.</p>
    
    <p>Mỗi khi tiếp nhận yêu cầu xử lý sự cố môi trường, chúng tôi đều áp dụng bộ tiêu chí khắt khe để bảo vệ tối đa lợi ích của khách hàng. Chúng tôi hiểu rằng nhà vệ sinh và hệ thống thoát nước là mạch máu của mỗi công trình, do đó sự nhanh chóng và an toàn luôn được đặt lên hàng đầu.</p>
    
    <h3>Cam kết 3 Không tuyệt đối từ chúng tôi:</h3>
    <ol>
        <li><strong>KHÔNG ĐỤC PHÁ:</strong> Chúng tôi áp dụng công nghệ hút chân không tiên tiến theo tiêu chuẩn Nhật Bản. Xe hút chuyên dụng được kết nối trực tiếp với bể phốt qua đường ống kỹ thuật hoặc bồn cầu mà không cần cạy phá nắp bể, không gây hư hỏng hay làm biến dạng cấu trúc công trình của nhà bạn.</li>
        <li><strong>KHÔNG BÁO GIÁ ẢO:</strong> Tuyệt đối nói không với tình trạng báo khống khối lượng, báo giá ảo mập mờ qua điện thoại rồi thu thêm phụ phí vô lý khi thi công. Mọi quy trình từ khảo sát, tư vấn đến báo giá đều được thực hiện minh bạch bằng văn bản trước khi làm. Khách hàng nghiệm thu hài lòng mới phải thanh toán tiền.</li>
        <li><strong>KHÔNG TÁI PHÁT:</strong> Với máy móc hiện đại và đội ngũ thợ lành nghề, chúng tôi hút sạch triệt để 100% lớp bùn đáy tích tụ lâu năm, phục hồi thể tích hoạt động tối đa cho bể tự hoại. Dịch vụ đi kèm chính sách bảo hành dài hạn lên tới 5 năm, cam kết xử lý hoàn toàn miễn phí nếu có hiện tượng tắc nghẽn trở lại trong thời hạn bảo hành.</li>
    </ol>

    <p>Để tìm hiểu thêm về năng lực thi công và các giải pháp thông tắc cống, nạo vét hố ga của chúng tôi tại khu vực tỉnh Quảng Ninh, quý khách có thể tham khảo trực tiếp thông tin đầy đủ tại website chính thức: <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff; font-weight: bold; text-decoration: underline;">thongtaccongquangninh.com</a>.</p>

    <h2>Bảng giá dịch vụ hút bể phốt Hạ Long mới nhất năm 2026</h2>
    <p>Chi phí dịch vụ luôn là điều khách hàng quan tâm hàng đầu. Nhằm giúp khách hàng chủ động về ngân sách tài chính và tránh gặp phải các đơn vị lừa đảo báo giá khống, Môi Trường Đô Thị Số 1 Quảng Ninh xin công khai bảng báo giá chi tiết mới nhất như sau:</p>

    <table border="1" cellpadding="12" style="border-collapse: collapse; width: 100%; margin: 25px 0; border-color: #e5e7eb; font-size: 15px;">
        <thead>
            <tr style="background-color: #1890ff; color: white; text-align: left;">
                <th>Dung tích xe hút chuyên dụng</th>
                <th>Đơn giá thi công (VNĐ / khối)</th>
                <th>Thời gian bảo hành dịch vụ</th>
            </tr>
        </thead>
        <tbody>
            <tr style="background-color: #f9fafb;">
                <td>Xe hút từ 1 đến 2 khối</td>
                <td>300.000đ / khối</td>
                <td>Bảo hành 24 tháng (2 năm)</td>
            </tr>
            <tr>
                <td>Xe hút từ 3 đến 5 khối</td>
                <td>250.000đ / khối</td>
                <td>Bảo hành 36 tháng (3 năm)</td>
            </tr>
            <tr style="background-color: #f9fafb;">
                <td>Xe hút từ 6 đến 9 khối</td>
                <td>200.000đ / khối</td>
                <td>Bảo hành 48 tháng (4 năm)</td>
            </tr>
            <tr>
                <td>Xe hút công nghiệp trên 10 khối</td>
                <td>150.000đ / khối</td>
                <td>Bảo hành 60 tháng (5 năm)</td>
            </tr>
        </tbody>
    </table>
    
    <p><em>* Lưu ý quan trọng:</em> Đơn giá thực tế có thể dao động nhẹ tùy thuộc vào các yếu tố khách quan như vị trí đỗ xe hút cách bể phốt bao xa (khoảng cách kéo dây hút), độ đặc/loãng của bùn thải trong bể, và cấu trúc thiết kế của đường ống thoát nước nhà bạn. Mọi báo giá chính xác nhất sẽ được kỹ thuật viên cung cấp bằng văn bản sau khi tiến hành khảo sát thực tế hoàn toàn miễn phí.</p>

    <h2>Quy trình 5 bước hút bể phốt Hạ Long đạt chuẩn đô thị</h2>
    <p>Để đảm bảo chất lượng thi công sạch sẽ tối đa và an toàn tuyệt đối cho công trình, Môi Trường Đô Thị Số 1 Quảng Ninh áp dụng quy trình làm việc 5 bước chuyên nghiệp, khoa học:</p>
    <ol>
        <li><strong>Bước 1: Tiếp nhận yêu cầu và tư vấn ban đầu:</strong> Khi khách hàng liên hệ qua Hotline 0963.953.533, nhân viên trực tổng đài sẽ ghi nhận tình trạng sự cố, tư vấn các bước xử lý tạm thời và xếp lịch cử kỹ thuật viên xuống hiện trường ngay lập tức.</li>
        <li><strong>Bước 2: Khảo sát hiện trạng thực tế miễn phí:</strong> Trong vòng 15 phút, đội ngũ kỹ thuật viên lành nghề cùng trang thiết bị chuyên dụng sẽ có mặt tại nhà khách hàng để đo đạc thể tích bể phốt, kiểm tra đường ống và tìm vị trí kỹ thuật thuận lợi nhất để hút.</li>
        <li><strong>Bước 3: Thống nhất phương án và báo giá bằng văn bản:</strong> Chúng tôi tư vấn giải pháp tối ưu nhất (ví dụ: hút qua cổ bồn cầu hoặc mở nắp kỹ thuật có sẵn), giải thích cặn kẽ quy trình và cung cấp bảng báo giá chi tiết có chữ ký xác nhận của công ty.</li>
        <li><strong>Bước 4: Tiến hành thi công bằng công nghệ cao:</strong> Điều động xe hút chân không chuyên dụng hiện đại đến vị trí thi công. Tiến hành kết nối ống hút và hút sạch bùn đất trong bể phốt một cách khép kín hoàn toàn. Hệ thống máy hút mạnh giúp gom sạch 100% bùn đặc mà không để rò rỉ bất kỳ mùi hôi nào ra môi trường xung quanh.</li>
        <li><strong>Bước 5: Nghiệm thu cùng khách hàng và ghi phiếu bảo hành:</strong> Khách hàng trực tiếp kiểm tra bể phốt đã được hút sạch sẽ. Tiến hành dọn dẹp vệ sinh khu vực thi công trả lại mặt bằng sạch đẹp. Kỹ thuật viên bàn giao phiếu bảo hành đóng dấu đỏ của công ty và xuất hóa đơn VAT theo yêu cầu.</li>
    </ol>

    <h2>Case study thực tế - Xử lý hút bể phốt tại Phường Hòn Gai, Hạ Long</h2>
    <p>Để khẳng định năng lực thực tế (E-E-A-T), dưới đây là một trong những dự án tiêu biểu mà chúng tôi vừa thực hiện thành công vào đầu năm 2026:</p>
    <p><strong>Khách hàng:</strong> Khách sạn Marine Pearl tại Khu đô thị cột 5, Phường Hòn Gai, TP. Hạ Long.<br>
    <strong>Sự cố gặp phải:</strong> Khách sạn bị tắc nghẽn toàn bộ hệ thống bồn cầu ở tầng trệt vào đúng giờ cao điểm đón khách du lịch quốc tế. Nước thải tràn ngược lên sàn vệ sinh bốc mùi hôi thối nồng nặc làm nhiều du khách phàn nàn và đòi hủy phòng.</p>
    
    <p><strong>Giải pháp xử lý:</strong> Sau khi tiếp nhận cuộc gọi khẩn cấp lúc 19h30 tối, chúng tôi đã cử ngay 2 xe hút chân không công suất lớn (10 khối và 8 khối) cùng 4 kỹ thuật viên tinh nhuệ đến hiện trường trong 15 phút. Qua khảo sát, kỹ thuật viên phát hiện bể tự hoại của khách sạn đã bị quá tải hoàn toàn sau nhiều tháng chạy hết công suất mùa du lịch.</p>
    <p>Chúng tôi đã triển khai luồn ống hút kỹ thuật trực tiếp vào hố ga trung tâm mà không cần khoan đục gạch nền. Sau 45 phút làm việc khép kín ban đêm, hệ thống bể phốt đã được thông hút sạch sẽ hoàn toàn bùn đặc, đường ống bồn cầu hoạt động trơn tru trở lại. Sự nhanh chóng, chuyên nghiệp và đặc biệt là không gây mùi hôi của chúng tôi đã giúp ban quản lý khách sạn giải tỏa khủng hoảng thành công, giữ chân được du khách mà không làm ảnh hưởng đến hoạt động kinh doanh của khách sạn.</p>

    <h2>NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh</h2>
    <p>Bất cứ khi nào hệ thống tự hoại hay đường cống thoát nước nhà bạn gặp sự cố, hãy nhấc máy gọi ngay cho chúng tôi để nhận được sự phục vụ tận tình, nhanh chóng và hiệu quả hàng đầu Quảng Ninh:</p>
    
    <p style="background-color: #fafafa; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; font-size: 16px; line-height: 1.6;">
        <strong>CÔNG TY MÔI TRƯỜNG ĐÔ THỊ SỐ 1 QUẢNG NINH</strong><br>
        🏠 <strong>Trụ sở chính:</strong> Số 124 Đường Nguyễn Văn Cừ, Phường Hồng Hà, TP. Hạ Long, Tỉnh Quảng Ninh<br>
        🏠 <strong>Văn phòng đại diện Bãi Cháy:</strong> Số 58 Đường Hạ Long, Phường Bãi Cháy, TP. Hạ Long, Quảng Ninh<br>
        📞 <strong>Hotline hỗ trợ khẩn cấp 24/7:</strong> <a href="tel:0963953533" style="color: #ff4d4f; font-weight: bold;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; font-weight: bold;">0931.156.756</a><br>
        🌐 <strong>Website chính thức:</strong> <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff;">thongtaccongquangninh.com</a><br>
        📧 <strong>Email liên hệ:</strong> cskh@thongtaccongquangninh.com
    </p>

    <h2>Câu hỏi thường gặp (FAQ) về hút bể phốt Hạ Long</h2>
    
    <h3>Làm thế nào để biết chính xác bể phốt nhà tôi đã bị đầy hay chưa?</h3>
    <p>Bên cạnh việc bồn cầu thoát nước rất chậm, bạn có thể nhận biết bằng các dấu hiệu rõ ràng khác như: xuất hiện nước thải đen rò rỉ quanh khu vực hố ga bể phốt, cây cỏ xung quanh khu vực bể tự hoại bỗng nhiên xanh tươi bất thường do nguồn chất hữu cơ rò rỉ ra đất, hoặc có mùi trứng thối nồng nặc bốc lên từ cống thoát sàn vệ sinh.</p>
    
    <h3>Công nghệ hút chân không có thực sự tốt hơn hút truyền thống không?</h3>
    <p>Chắc chắn là tốt hơn vượt trội. Hút chân không sử dụng cánh quạt ly tâm tạo áp suất cực lớn kéo bùn thải trực tiếp lên xe mà không cần pha nhiều nước như xe truyền thống. Công nghệ này giúp hút sạch bùn đặc và bùn khô tích tụ đáy bể phốt mà không cần khoan đục phá gạch, hoàn toàn khép kín nên không phát tán mùi hôi thối ra môi trường xung quanh.</p>
    
    <h3>Tôi có cần chuẩn bị gì trước khi xe hút bể phốt đến làm việc không?</h3>
    <p>Anh hoàn toàn không cần chuẩn bị gì cả. Đội ngũ kỹ thuật viên của Môi Trường Đô Thị Số 1 Quảng Ninh sẽ tự mang đầy đủ thiết bị từ dây dẫn áp lực cao, máy dò tìm nắp bể, cho đến dụng cụ dọn dẹp vệ sinh. Anh chỉ cần chỉ vị trí nhà vệ sinh hoặc hố ga trung tâm để chúng tôi triển khai luồn ống hút kỹ thuật là xong.</p>
    
    <h3>Dịch vụ bảo hành 5 năm của công ty có kèm theo chi phí ẩn nào không?</h3>
    <p>Hoàn toàn không. Phiếu bảo hành 5 năm của chúng tôi là cam kết bằng uy tín pháp nhân của công ty. Trong thời gian bảo hành, nếu hệ thống bể tự hoại nhà anh gặp lại bất kỳ sự cố tắc nghẽn hay đầy ứ nào, chúng tôi sẽ cử xe chuyên dụng đến thông hút lại hoàn toàn miễn phí mà không thu thêm bất kỳ một đồng phụ phí nào.</p>

    <!-- CTA Hotline o cuoi bai -->
    <div style="background-color: #fff2e8; border: 1px dashed #ffbb96; padding: 25px; text-align: center; margin-top: 40px; border-radius: 8px;">
        <h3 style="color: #d4380d; margin: 0 0 10px 0; font-size: 22px;">HÚT BỂ PHỐT HẠ LONG KHÔNG ĐỤC PHÁ - BẢO HÀNH 5 NĂM</h3>
        <p style="margin: 10px 0; font-size: 16px; color: #555;">Môi Trường Đô Thị Số 1 Quảng Ninh - Cam kết chất lượng sạch đẹp tối đa</p>
        <p style="font-size: 28px; font-weight: bold; margin: 0; color: #d4380d;">Hotline hỗ trợ: 0963.953.533 / 0931.156.756</p>
    </div>
    """
    
    NHAN_TAG = ["Hút bể phốt Hạ Long", "Môi Trường Đô Thị Số 1 Quảng Ninh", "Thông tắc cống Hạ Long"]
    
    # Dang len Blog 1 cua anh Tuyen o dang DRAFT
    dang_bai_blogger(BLOG_ID, TIEU_DE, NOI_DUNG_HTML, NHAN_TAG)
