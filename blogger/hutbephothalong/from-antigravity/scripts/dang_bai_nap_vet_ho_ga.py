import os
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
            print("Loi: Chua co file token.json!")
            return None
    return build('blogger', 'v3', credentials=creds)

def dang_bai_live(blog_id, title, content_html, tags=None):
    try:
        service = get_blogger_service()
        if not service:
            return
            
        body = {
            "kind": "blogger#post",
            "title": title,
            "content": content_html
        }
        if tags:
            body["labels"] = tags
            
        # Xuat ban truc tiep (isDraft=False) vi nguoi dung tin tuong chay tu dong tiep
        request = service.posts().insert(blogId=blog_id, body=body, isDraft=False)
        response = request.execute()
        
        print("\n XUAT BAN BAI VIET TIEP THEO THANH CONG!")
        print(f"Tieu de : {response.get('title')}")
        print(f"Link live: {response.get('url')}")
    except Exception as e:
        print(f"Loi khi dang bai viet: {e}")

if __name__ == '__main__':
    BLOG_ID = "2990849741025760292"
    
    TIEU_DE = "Địa chỉ nạo vét hố ga giá rẻ tại Hạ Long Quảng Ninh - 0963.953.533"
    
    NOI_DUNG_HTML = """
    <p>Đường cống thoát nước chung quanh nhà bạn đang bị ngập úng, nước bẩn không thể thoát sau mỗi trận mưa lớn? Hố ga chứa rác thải sinh hoạt của gia đình bốc mùi hôi thối nồng nặc do lâu năm chưa được nạo vét bùn đất? Dịch vụ <strong>nạo vét hố ga tại Hạ Long</strong> của công ty <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> là giải pháp hoàn hảo giúp anh xử lý dứt điểm sự cố nhanh chóng qua Hotline 0963.953.533.</p>
    
    <!-- Anh dai dien chuan SEO (img src, alt co ten khu vuc) -->
    <div style="text-align: center; margin: 20px 0;">
        <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200" alt="Dich vu nao vet ho ga tai Ha Long Quang Ninh sach se chat luong cao" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>

    <p>Hố ga đóng vai trò là nơi lắng đọng các chất thải rắn, đất cát và rác thải trôi theo dòng nước để tránh làm tắc nghẽn đường ống thoát nước chính. Tuy nhiên, nếu lượng bùn đất tích tụ quá nhiều mà không được nạo vét định kỳ, hố ga sẽ bị mất tác dụng lắng lọc, gây ra tình trạng tắc cống cục bộ và trào ngược nước thải vô cùng mất vệ sinh.</p>

    <h2>Nguyên nhân hố ga thoát nước bị đầy tràn bùn đất</h2>
    <p>Việc hố ga bị đầy hoặc tắc nghẽn thường bắt nguồn từ những nguyên nhân khách quan và chủ quan sau:</p>
    <ul>
        <li><strong>Đất cát trôi theo dòng nước mưa:</strong> Cấu trúc địa hình đồi dốc tại Hạ Long dễ khiến lượng lớn đất đá, bụi than trôi xuống cống và lắng đọng đầy ắp trong lòng hố ga sau mỗi trận mưa lớn.</li>
        <li><strong>Rác thải sinh hoạt bít kín miệng thoát:</strong> Túi nilon, chai nhựa, lá cây khô trôi xuống hố ga tích tụ lại thành một màng chặn lớn ngăn dòng nước chảy tự nhiên.</li>
        <li><strong>Không nạo vét định kỳ:</strong> Nhiều khu dân cư sử dụng hố ga trên 5 năm mà không nạo vét cặn đáy, khiến lòng hố ga bị thu hẹp hoàn toàn thể tích chứa.</li>
    </ul>

    <h2>Tại sao chọn dịch vụ nạo vét hố ga của Môi Trường Đô Thị Số 1 Quảng Ninh?</h2>
    <p>Chúng tôi tự hào mang tới giải pháp vệ sinh đô thị toàn diện cho các hộ gia đình, cơ quan, doanh nghiệp tại Quảng Ninh:</p>
    <h3>Cam kết 3 Không tuyệt đối từ công ty:</h3>
    <ul>
        <li><strong>Không đục phá:</strong> Sử dụng xe hút bùn chuyên dụng và máy cẩu ngoạm cơ học hiện đại, nạo vét sạch sâu tận đáy hố ga mà không làm hư hỏng hay làm nứt vỡ thành hố ga của anh.</li>
        <li><strong>Không báo giá ảo:</strong> Kỹ thuật viên khảo sát thực tế và báo đơn giá rõ ràng trước khi thi công, cam kết không phát sinh phụ phí vô lý.</li>
        <li><strong>Không tái phát nghẽn:</strong> Thu gom và vận chuyển chất thải về đúng nơi quy định của sở tài nguyên, bảo hành dịch vụ dài hạn lên tới 2 năm giúp cống thoát nước trơn tru bền vững.</li>
    </ul>
    
    <p>Anh hãy truy cập website chính thức để tìm hiểu thêm năng lực thông tắc cống ngầm của chúng tôi: <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff; font-weight: bold; text-decoration: underline;">thongtaccongquangninh.com</a>.</p>

        <!-- CTA Hotline o giua bai -->
        <div style="background-color: #f6ffed; border-left: 4px solid #52c41a; padding: 20px; margin: 30px 0; text-align: center; border-radius: 4px;">
            <p style="font-size: 18px; font-weight: bold; margin: 0; color: #1f2937;">HỐ GA BỊ ĐẦY TRÀN NƯỚC THẢI - ĐƯỜNG CỐNG BỊ TẮC NGHẼN?</p>
            <p style="margin: 5px 0; font-size: 15px;">Môi Trường Đô Thị Số 1 Quảng Ninh - Có mặt sau 15 phút tại Hạ Long:</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0;"><a href="tel:0963953533" style="color: #ff4d4f; text-decoration: none;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; text-decoration: none;">0931.156.756</a></p>
        </div>

    <h2>Bảng giá dịch vụ nạo vét hố ga tại Hạ Long mới nhất</h2>
    <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%; margin: 20px 0; border-color: #ddd;">
        <thead>
            <tr style="background-color: #f5f5f5;">
                <th>Loại hình công việc</th>
                <th>Thiết bị áp dụng</th>
                <th>Đơn giá dịch vụ (VNĐ)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Nạo vét bùn đất hố ga hộ gia đình</td>
                <td>Dọn dẹp thủ công + xe gom chuyên dụng</td>
                <td>150.000đ - 250.000đ / hố</td>
            </tr>
            <tr>
                <td>Nạo vét hố ga ngầm khu công nghiệp, cơ quan</td>
                <td>Xe cẩu ngoạm chuyên dụng + xe bồn hút bùn</td>
                <td>300.000đ - 450.000đ / hố</td>
            </tr>
            <tr>
                <td>Nạo vét và làm sạch đường cống ngầm liên thông</td>
                <td>Máy thông tắc phản lực áp lực cao</td>
                <td>Khảo sát báo giá thực tế</td>
            </tr>
        </tbody>
    </table>

    <h2>Quy trình 5 bước nạo vét hố ga chuyên nghiệp đạt chuẩn</h2>
    <ol>
        <li><strong>Bước 1: Tiếp nhận thông tin</strong> khách hàng khẩn cấp qua Hotline 0963.953.533.</li>
        <li><strong>Bước 2: Khảo sát thực tế hiện trường miễn phí</strong> trong vòng 15 phút tại địa bàn Hạ Long.</li>
        <li><strong>Bước 3: Báo đơn giá công khai bằng văn bản</strong> có chữ ký đóng dấu xác nhận trước khi làm.</li>
        <li><strong>Bước 4: Tiến hành nạo vét bùn thải</strong> bằng máy móc chuyên dụng, thu gom sạch sẽ không để vương vãi ra đường phố.</li>
        <li><strong>Bước 5: Bàn giao mặt bằng sạch đẹp</strong>, nghiệm thu cùng khách hàng và xuất phiếu bảo hành 2 năm.</li>
    </ol>

    <h2>Case study thực tế - Thi công nạo vét hố ga tại Phường Cao Xanh</h2>
    <p>Vào tháng 1/2026, chúng tôi thực hiện thi công nạo vét hệ thống 12 hố ga ngầm liên thông cho khu dân cư tại Phường Cao Xanh, Hạ Long. Do bùn cát từ đồi dự án phía sau tràn xuống lấp đầy cống sau đợt mưa bão, nước bẩn ngập úng tràn vào nhà nhiều hộ dân gây mất vệ sinh trầm trọng.</p>
    <p>Đội ngũ kỹ thuật của Môi Trường Đô Thị Số 1 đã điều động 1 xe cẩu ngoạm và 2 xe hút bùn chuyên dụng công nghệ cao đến hiện trường. Sau 3 giờ thi công khép kín sạch sẽ, toàn bộ lượng bùn đất than đã được thu gom triệt để, đường ống cống ngầm liên kết được thông thoát hoàn toàn trơn tru, giúp giải quyết triệt để nỗi lo ngập lụt cho người dân.</p>

    <h2>NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh</h2>
    <p>Mọi vấn đề về hố ga đầy tràn, đường cống tắc nghẽn nghiêm trọng không thể tự xử lý, anh hãy liên hệ ngay chúng tôi:</p>
    <p style="background-color: #fafafa; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <strong>CÔNG TY MÔI TRƯỜNG ĐÔ THỊ SỐ 1 QUẢNG NINH</strong><br>
        🏠 <strong>Trụ sở chính:</strong> Số 124 Đường Nguyễn Văn Cừ, Phường Hồng Hà, TP. Hạ Long, Tỉnh Quảng Ninh<br>
        📞 <strong>Hotline hỗ trợ 24/7:</strong> <a href="tel:0963953533" style="color: #ff4d4f; font-weight: bold;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; font-weight: bold;">0931.156.756</a><br>
        🌐 <strong>Website chính thức:</strong> <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff;">thongtaccongquangninh.com</a>
    </p>

    <h2>Câu hỏi thường gặp (FAQ) về nạo vét hố ga</h2>
    <h3>Bùn đất nạo vét từ hố ga sẽ được công ty vận chuyển xử lý ở đâu?</h3>
    <p>Toàn bộ lượng chất thải rắn, bùn thải sau khi nạo vét từ hố ga sẽ được xe chuyên dụng của Môi Trường Đô Thị Số 1 vận chuyển trực tiếp về nhà máy xử lý chất thải đô thị Quảng Ninh theo đúng quy định bảo vệ môi trường của tỉnh, hoàn toàn không có tình trạng đổ thải trộm bừa bãi.</p>
    
    <h3>Bảo hành 2 năm cho hố ga bao gồm những nội dung gì?</h3>
    <p>Chính sách bảo hành 2 năm cam kết hố ga của gia đình anh hoạt động lắng cặn tốt, không bị trào ngược khí hôi hay gây tắc nghẽn đường cống liên thông. Nếu xảy ra sự cố nghẹt cống liên quan trong thời gian bảo hành, đội ngũ kỹ thuật của chúng tôi sẽ đến xử lý lại hoàn toàn miễn phí.</p>

    <!-- CTA Hotline o cuoi bai -->
    <div style="background-color: #fff2e8; border: 1px dashed #ffbb96; padding: 25px; text-align: center; margin-top: 40px; border-radius: 8px;">
        <h3 style="color: #d4380d; margin: 0 0 10px 0; font-size: 20px;">DỊCH VỤ NẠO VÉT HỐ GA KHÔNG ĐỤC PHÁ UY TÍN TẠI HẠ LONG</h3>
        <p style="margin: 10px 0; font-size: 15px;">Thi công sạch đẹp nhanh gọn - Cam kết thu gom sạch triệt để bùn thải hố ga</p>
        <p style="font-size: 26px; font-weight: bold; margin: 0; color: #d4380d;">Hotline hỗ trợ: 0963.953.533 / 0931.156.756</p>
    </div>
    """
    
    NHAN_TAG = ["Nạo vét hố ga", "Nạo vét hố ga Hạ Long", "Môi Trường Đô Thị Số 1"]
    
    dang_bai_live(BLOG_ID, TIEU_DE, NOI_DUNG_HTML, NHAN_TAG)
