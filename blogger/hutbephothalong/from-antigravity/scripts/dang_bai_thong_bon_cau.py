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
            print("Loi: Chua xac thuc!")
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
            
        # Mac dinh dang o dang nhap Draft de nguoi dung duyet truoc
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
    # ID Blog 1 cua anh Tuyen: Hut be phot Ha Long
    BLOG_ID = "2990849741025760292"
    
    TIEU_DE = "Cách thông bồn cầu bị tắc vật cứng bằng băng dính tại nhà cực nhạy"
    
    NOI_DUNG_HTML = """
    <p>Bồn cầu nhà bạn đột nhiên bị tắc nghẽn nghiêm trọng do vô tình đánh rơi vật cứng (như nắp chai, bàn chải, đồ chơi trẻ em) hoặc do xả quá nhiều giấy vệ sinh? Tình trạng nước trào ngược bốc mùi hôi thối khiến bạn lo lắng không biết phải làm sao? Đừng vội gọi thợ tốn kém, hãy áp dụng ngay <strong>cách thông bồn cầu bị tắc vật cứng</strong> bằng băng dính cực nhạy tại nhà dưới đây. Nếu gặp sự cố nặng không thể tự xử lý, hãy gọi ngay dịch vụ <strong>thông tắc cống tại Quảng Ninh</strong> của công ty Môi Trường Đô Thị Số 1 qua hotline 0963.953.533 để được hỗ trợ tức thì.</p>
    
    <!-- Anh minh hoa chuan SEO, alt co ten khu vuc -->
    <div style="text-align: center; margin: 20px 0;">
        <img src="https://images.unsplash.com/photo-1584622750111-993a426fbf0a?w=1200" alt="Huong dan cach thong bon cau bi tac vat cung bang bang dinh tai Ha Long" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>

    <p>Phương pháp sử dụng băng dính để thông tắc bồn cầu dựa trên nguyên lý chênh lệch áp suất khí nén cực kỳ đơn giản nhưng đem lại hiệu quả bất ngờ. Khi bạn dán kín miệng bồn cầu bằng băng dính, không khí bên trong sẽ bị giữ lại. Lực ấn mạnh từ trên xuống sẽ tạo ra một áp lực nén nước cực lớn đẩy bay mọi vật cản đang bị mắc kẹt trong đường ống thoát xuống bể phốt.</p>

    <h2>Nguyên nhân bồn cầu bị tắc nghẽn vật cứng phổ biến</h2>
    <p>Để có phương án xử lý hiệu quả nhất, chúng ta cần xác định rõ các nguyên nhân chính khiến bồn cầu bị nghẹt cứng:</p>
    <ul>
        <li><strong>Vô tình làm rơi vật dụng cá nhân:</strong> Bàn chải đánh răng, bánh xà phòng, kẹp tóc, nắp chai nước hoặc đồ chơi trẻ nhỏ là những vật cứng rất dễ bị rơi vào bồn cầu và kẹt lại ở đoạn ống cong chữ U (Siphon). Do cấu trúc vật cứng không thể phân hủy, chúng sẽ cản trở hoàn toàn dòng nước chảy.</li>
        <li><strong>Lạm dụng giấy vệ sinh quá nhiều:</strong> Việc xả một lượng lớn giấy vệ sinh dày cùng một lúc khiến nước không kịp làm tan giấy, tạo thành một khối liên kết chặt chẽ bít kín đường ống bồn cầu.</li>
        <li><strong>Hệ thống bể phốt bị đầy ứ:</strong> Khi bể tự hoại sau nhiều năm sử dụng bị đầy bùn đặc hoàn toàn, không khí bên trong bể không có lối thoát, nước thải trôi xuống sẽ bị dội ngược trở lại gây ra hiện tượng tắc nghẽn giả.</li>
    </ul>

    <h2>Tại sao chọn dịch vụ thông bồn cầu của Môi Trường Đô Thị Số 1 Quảng Ninh?</h2>
    <p>Nếu bạn đã thử áp dụng nhiều phương pháp tại nhà nhưng bồn cầu vẫn tắc nghẽn hoàn toàn, đó là lúc bạn cần đến sự hỗ trợ từ các kỹ thuật viên chuyên nghiệp của chúng tôi. Chúng tôi tự hào mang tới giải pháp hàng đầu Quảng Ninh:</p>
    <h3>Cam kết 3 Không tuyệt đối từ công ty:</h3>
    <ul>
        <li><strong>Không đục phá:</strong> Chúng tôi trang bị hệ thống máy lò xo công nghệ cao và máy nén khí áp lực lớn, đánh tan mọi vật cứng cứng đầu trong đường ống mà không cần đục gạch, không làm trầy xước men bồn cầu.</li>
        <li><strong>Không báo giá ảo:</strong> Kỹ thuật viên tiến hành khảo sát thực tế và báo đơn giá cụ thể minh bạch trước khi làm, nói không với tình trạng chặt chém hay thu thêm phụ phí ngoài hợp đồng.</li>
        <li><strong>Không tái phát:</strong> Xử lý tận gốc nguyên nhân gây tắc nghẽn bồn cầu, bảo hành dịch vụ dài hạn lên tới 3 năm giúp khách hàng an tâm tuyệt đối.</li>
    </ul>
    
    <p>Để tham khảo thêm các mẹo xử lý thông tắc và quy trình dịch vụ nạo vét chất thải của chúng tôi tại khu vực Hạ Long, Cẩm Phả, Uông Bí, quý khách vui lòng truy cập website chính thức: <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff; font-weight: bold; text-decoration: underline;">thongtaccongquangninh.com</a>.</p>

    <!-- CTA Hotline o giua bai -->
    <div style="background-color: #f6ffed; border-left: 4px solid #52c41a; padding: 20px; margin: 30px 0; text-align: center; border-radius: 4px;">
        <p style="font-size: 18px; font-weight: bold; margin: 0; color: #1f2937;">BỒN CẦU TẮC NẶNG KHÔNG THỂ TỰ XỬ LÝ?</p>
        <p style="margin: 5px 0; font-size: 15px;">Gọi ngay Môi Trường Đô Thị Số 1 Quảng Ninh - Khảo sát miễn phí sau 15 phút:</p>
        <p style="font-size: 24px; font-weight: bold; margin: 0;"><a href="tel:0963953533" style="color: #ff4d4f; text-decoration: none;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; text-decoration: none;">0931.156.756</a></p>
    </div>

    <h2>Bảng giá dịch vụ thông tắc bồn cầu tại Quảng Ninh mới nhất</h2>
    <p>Chúng tôi xin gửi tới quý khách hàng bảng báo giá chi tiết, cạnh tranh nhất thị trường hiện nay:</p>
    <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%; margin: 20px 0; border-color: #ddd;">
        <thead>
            <tr style="background-color: #f5f5f5;">
                <th>Tình trạng tắc nghẽn bồn cầu</th>
                <th>Phương pháp xử lý chuyên dụng</th>
                <th>Đơn giá dịch vụ (VNĐ)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Tắc nghẽn nhẹ do giấy vệ sinh</td>
                <td>Sử dụng máy nén khí áp lực cao</td>
                <td>100.000đ - 150.000đ</td>
            </tr>
            <tr>
                <td>Tắc nghẽn nặng do rơi vật cứng</td>
                <td>Sử dụng máy lò xo chuyên dụng đánh tan</td>
                <td>200.000đ - 250.000đ</td>
            </tr>
            <tr>
                <td>Tắc bồn cầu do đầy bể phốt</td>
                <td>Hút bể phốt chân không bằng xe hút chuyên dụng</td>
                <td>Báo giá theo khối lượng thực tế</td>
            </tr>
        </tbody>
    </table>

    <h2>Quy trình 5 bước thông bồn cầu nghẹt bằng băng dính tại nhà</h2>
    <p>Để thực hiện phương pháp thông bồn cầu bằng băng dính đạt hiệu quả cao nhất, anh hãy thực hiện đúng theo 5 bước hướng dẫn cụ thể sau:</p>
    <ol>
        <li><strong>Bước 1: Chuẩn bị dụng cụ và vệ sinh miệng bồn cầu:</strong> Chuẩn bị 1 cuộn băng dính bản to (loại dính chắc chắn) và 1 chiếc giẻ lau khô. Tiến hành lau thật sạch và khô ráo hoàn toàn xung quanh vành miệng bồn cầu. Nếu vành bồn cầu bị ướt, băng dính sẽ bị bong ra và làm mất tác dụng nén khí.</li>
        <li><strong>Bước 2: Dán kín miệng bồn cầu bằng băng dính:</strong> Tiến hành dán băng dính phủ kín toàn bộ bề mặt miệng bồn cầu. Các đường băng dính phải dán chồng khít lên nhau, không được để lộ bất kỳ một khe hở nhỏ nào. Anh dán càng phẳng và chắc chắn thì áp lực tạo ra càng mạnh.</li>
        <li><strong>Bước 3: Gia cố các mép dính xung quanh:</strong> Dán thêm 2-3 đường băng dính xung quanh vành ngoài để giữ chặt các đầu băng dính chính, đảm bảo khi ấn mạnh khí nén bên trong không bị phì ra ngoài.</li>
        <li><strong>Bước 4: Nhấn nút xả nước và tạo áp suất:</strong> Tiến hành ấn xả nước bồn cầu. Lúc này, nước tràn vào sẽ làm lượng khí bên trong bồn cầu bị nén lại, đẩy màng băng dính phồng căng lên. Ngay lập tức, anh dùng hai tay đặt lên màng băng dính, ấn mạnh một lực đều từ trên xuống dưới khoảng 3-4 lần liên tục.</li>
        <li><strong>Bước 5: Tháo băng dính và nghiệm thu:</strong> Áp lực nén đột ngột sẽ đẩy bay vật tắc nghẽn xuống bể phốt. Anh sẽ nghe thấy tiếng nước rút mạnh "ào ào". Cuối cùng, anh bóc sạch băng dính, dọn dẹp vệ sinh xung quanh và xả lại nước để kiểm tra kết quả sạch sẽ hoàn toàn.</li>
    </ol>

    <h2>Case study thực tế - Thông tắc bồn cầu rơi đồ chơi tại Phường Bãi Cháy</h2>
    <p>Vào tháng 3/2026, đội thợ của chúng tôi tiếp nhận yêu cầu từ gia đình chị Mai tại Phường Bãi Cháy, Hạ Long. Con trai nhỏ của chị vô tình đánh rơi chiếc ô tô đồ chơi nhựa vào bồn cầu và ấn xả nước khiến bồn cầu bị nghẹt cứng hoàn toàn. Gia đình đã thử dùng pittong và đổ bột thông cống nhưng không hiệu quả.</p>
    <p>Kỹ thuật viên của Môi Trường Đô Thị Số 1 Quảng Ninh đã đến hiện trường trong 15 phút. Sử dụng thiết bị máy camera nội soi để xác định chính xác vị trí đồ chơi nhựa bị kẹt ở cổ Siphon, thợ đã luồn đầu máy lò xo chuyên dụng để gắp nhẹ chiếc ô tô ra ngoài chỉ trong vòng 10 phút thi công mà không làm ảnh hưởng đến cấu trúc bồn cầu, giúp bồn cầu thông thoát nước sạch sẽ như mới.</p>

    <h2>NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh</h2>
    <p>Khi gặp các sự cố tắc nghẽn bồn cầu, tắc cống nghiêm trọng không thể tự xử lý tại nhà, anh hãy nhấc máy gọi ngay cho chúng tôi để được tư vấn và hỗ trợ thi công nhanh chóng nhất:</p>
    <p style="background-color: #fafafa; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; font-size: 16px;">
        <strong>CÔNG TY MÔI TRƯỜNG ĐÔ THỊ SỐ 1 QUẢNG NINH</strong><br>
        🏠 <strong>Trụ sở chính:</strong> Số 124 Đường Nguyễn Văn Cừ, Phường Hồng Hà, TP. Hạ Long, Tỉnh Quảng Ninh<br>
        🏠 <strong>Chi nhánh Bãi Cháy:</strong> Số 58 Đường Hạ Long, Phường Bãi Cháy, TP. Hạ Long, Quảng Ninh<br>
        📞 <strong>Hotline hỗ trợ 24/7:</strong> <a href="tel:0963953533" style="color: #ff4d4f; font-weight: bold;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; font-weight: bold;">0931.156.756</a><br>
        🌐 <strong>Website chính thức:</strong> <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff;">thongtaccongquangninh.com</a>
    </p>

    <h2>Câu hỏi thường gặp (FAQ) về thông tắc bồn cầu</h2>
    <h3>Bột thông cống có phân hủy được vật cứng rơi vào bồn cầu không?</h3>
    <p>Hoàn toàn không. Bột thông cống hay các loại hóa chất tẩy rửa chỉ có tác dụng phân hủy các hợp chất hữu cơ mềm như tóc, dầu mỡ, chất thải mềm hay giấy vệ sinh. Đối với các vật cứng như nhựa, sắt, bàn chải, hóa chất thông cống hoàn toàn vô tác dụng và có thể làm hỏng lớp men bồn cầu.</p>
    
    <h3>Tại sao khi thông bồn cầu bằng băng dính nước lại trào ra mép?</h3>
    <p>Hiện tượng nước trào ra mép dính do quá trình lau khô miệng bồn cầu ở Bước 1 chưa sạch hoàn toàn, làm lớp keo của băng dính bị ẩm ướt và bong tróc khi gặp áp lực nước. Anh cần dùng khăn khô lau thật sạch và dán kỹ các mép bồn cầu trước khi nhấn xả nước.</p>
    
    <h3>Máy thông bồn cầu bằng lò xo có làm hỏng, xước bồn cầu không?</h3>
    <p>Khi sử dụng máy lò xo chuyên nghiệp của chúng tôi, đầu lò xo được bọc lớp đệm cao su bảo vệ và thợ kỹ thuật có kỹ năng điều khiển tốc độ quay phù hợp, cam kết đánh tan vật tắc nghẽn mà hoàn toàn không gây trầy xước lớp men hay làm nứt vỡ bồn cầu của gia đình anh.</p>

    <!-- CTA Hotline o cuoi bai -->
    <div style="background-color: #fff2e8; border: 1px dashed #ffbb96; padding: 25px; text-align: center; margin-top: 40px; border-radius: 8px;">
        <h3 style="color: #d4380d; margin: 0 0 10px 0; font-size: 20px;">DỊCH VỤ THÔNG BỒN CẦU TẮC NGHẼN BẰNG MÁY LÒ XO CAO CẤP</h3>
        <p style="margin: 10px 0; font-size: 15px;">Khảo sát miễn phí 100% - Thi công nhanh gọn sạch sẽ trong 15 phút</p>
        <p style="font-size: 26px; font-weight: bold; margin: 0; color: #d4380d;">Hotline hỗ trợ: 0963.953.533 / 0931.156.756</p>
    </div>
    """
    
    NHAN_TAG = ["Thông bồn cầu bị tắc", "Thông tắc bồn cầu Hạ Long", "Mẹo vặt nhà tắm"]
    
    # Dang len Blog 1 duoi dang Draft
    dang_bai_blogger(BLOG_ID, TIEU_DE, NOI_DUNG_HTML, NHAN_TAG)
