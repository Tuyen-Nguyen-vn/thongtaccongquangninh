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
    """
    Dang bai viet len Blogger theo ID Blog.
    """
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
            
        # Mac dinh dang o che che do "DRAFT" (nhap) de anh Tuyen duyet truoc khi xuat ban
        # Neu muon dang luon thi xoa tham so isDraft=True
        request = service.posts().insert(blogId=blog_id, body=body, isDraft=True)
        response = request.execute()
        
        print("\n DANG BAI VIET NHAP (DRAFT) THANH CONG!")
        print(f"Tieu de   : {response.get('title')}")
        print(f"ID Bai    : {response.get('id')}")
        print(f"Link xem nhap: {response.get('url')}")
        return response
    except Exception as e:
        print(f"Loi khi dang bai viet: {e}")
        return None

if __name__ == '__main__':
    # ID Blog 1 cua anh Tuyen: Hút bể phốt Hạ Long - Quảng Ninh
    BLOG_ID = "2990849741025760292" 
    
    # Tieu de chuan SEO (60-70 ky tu)
    TIEU_DE = "Hút bể phốt tại Hạ Long giá rẻ 100k không đục phá - 0981.306.307"
    
    # Noi dung HTML chuan SEO theo quy tac bat buoc cua anh Tuyen
    NOI_DUNG_HTML = """
    <p>Đường cống thoát nước nhà bạn đang bị tắc nghẽn, bể phốt bị đầy ứ bốc mùi hôi khó chịu ảnh hưởng nghiêm trọng đến sinh hoạt? Môi Trường Đông Bắc là địa chỉ xử lý triệt để sự cố nhanh chóng tại Hạ Long với hotline liên hệ 0981.306.307 phục vụ 24/7.</p>
    
    <!-- Anh dai dien chuan SEO (img src truc tiep, khong dung CSS, alt co ten khu vuc) -->
    <div style="text-align: center;">
        <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200" alt="Dich vu hut be phot tai cac quan huyen thuoc Ha Long Quang Ninh" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>

    <h2>Nguyên nhân bể phốt bị đầy nhanh chóng</h2>
    <p>Bể phốt bị đầy hoặc tắc nghẽn thường do các nguyên nhân chính như: nhu cầu sử dụng quá tải so với thiết kế, thói quen xả chất thải khó phân hủy như khăn ướt, dầu mỡ thừa vào bồn cầu, hoặc do hệ sinh thái vi sinh phân hủy trong bể bị tiêu diệt bởi các hóa chất tẩy rửa mạnh.</p>

    <h2>Tại sao chọn dịch vụ Môi Trường Đông Bắc?</h2>
    <p>Chúng tôi tự hào mang đến giải pháp tối ưu cho hàng nghìn hộ gia đình tại Quảng Ninh với những cam kết rõ ràng:</p>
    <h3>Cam kết 3 Không tuyệt đối:</h3>
    <ul>
        <li><strong>Không đục phá:</strong> Sử dụng công nghệ hút chân không Nhật Bản hiện đại, bảo vệ nguyên vẹn kết cấu công trình.</li>
        <li><strong>Không báo giá ảo:</strong> Báo giá công khai rõ ràng sau khi khảo sát thực tế, không phát sinh chi phí phụ.</li>
        <li><strong>Không tái phát:</strong> Bảo hành dịch vụ dài hạn lên tới 5 năm, xử lý triệt để nguồn gốc vấn đề.</li>
    </ul>

    <!-- CTA Hotline o giua bai -->
    <div style="background-color: #f0f5ff; border-left: 4px solid #1890ff; padding: 15px; margin: 20px 0; text-align: center;">
        <p style="font-size: 18px; font-weight: bold; margin: 0;">GỌI NGAY HOTLINE KHẢO SÁT MIỄN PHÍ: <a href="tel:0981306307" style="color: #ff4d4f; font-size: 22px;">0981.306.307</a></p>
    </div>

    <h2>Bảng giá dịch vụ hút bể phốt tại Hạ Long mới nhất</h2>
    <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%; margin: 20px 0; border-color: #ddd;">
        <thead>
            <tr style="background-color: #f5f5f5;">
                <th>Loại hình xe hút</th>
                <th>Đơn giá (VNĐ)</th>
                <th>Chính sách bảo hành</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Xe hút từ 1 - 3 khối</td>
                <td>250.000đ / khối</td>
                <td>Bảo hành 24 tháng</td>
            </tr>
            <tr>
                <td>Xe hút từ 4 - 7 khối</td>
                <td>200.000đ / khối</td>
                <td>Bảo hành 36 tháng</td>
            </tr>
            <tr>
                <td>Xe hút trên 8 khối</td>
                <td>150.000đ / khối</td>
                <td>Bảo hành 60 tháng</td>
            </tr>
        </tbody>
    </table>

    <h2>Quy trình 5 bước xử lý hút bể phốt đạt chuẩn</h2>
    <ol>
        <li><strong>Bước 1: Tiếp nhận thông tin</strong> qua Hotline 0981.306.307 từ khách hàng.</li>
        <li><strong>Bước 2: Khảo sát hiện trạng miễn phí</strong> trong vòng 15 phút tại địa bàn Hạ Long.</li>
        <li><strong>Bước 3: Tư vấn phương án và Báo giá công khai</strong> cụ thể dựa trên thực tế công trình.</li>
        <li><strong>Bước 4: Tiến hành thi công</strong> bằng xe hút chuyên dụng công nghệ cao không mùi hôi.</li>
        <li><strong>Bước 5: Nghiệm thu cùng khách hàng</strong>, xuất hóa đơn chứng từ và ghi phiếu bảo hành.</li>
    </ol>

    <h2>Case study thực tế - Khách hàng tại Phường Bãi Cháy, Hạ Long</h2>
    <p>Tháng 4/2026, chúng tôi tiếp nhận xử lý sự cố tắc nghẽn nghiêm trọng cho khách sạn 3 sao tại Bãi Cháy. Sử dụng xe hút chân không 10 khối, đội ngũ kỹ thuật của Môi Trường Đông Bắc đã hoàn thành giải tỏa bể phốt trong 45 phút vào ban đêm, không làm gián đoạn kinh doanh và không gây mùi hôi khó chịu cho du khách xung quanh.</p>

    <h2>NAP thông tin liên hệ</h2>
    <p><strong>Môi Trường Đông Bắc - Chi Nhánh Hạ Long Quảng Ninh</strong><br>
    🏠 Địa chỉ: Số 45 Đường Hạ Long, Phường Bãi Cháy, TP. Hạ Long, Quảng Ninh<br>
    📞 Hotline hỗ trợ 24/7: <a href="tel:0981306307">0981.306.307</a><br>
    🌐 Website chính thức: <a href="https://moitruongdongbac.com" target="_blank">moitruongdongbac.com</a></p>

    <!-- CTA Hotline o cuoi bai -->
    <div style="background-color: #fff2e8; border: 1px dashed #ffbb96; padding: 20px; text-align: center; margin-top: 30px; border-radius: 8px;">
        <h3 style="color: #d4380d; margin-top: 0;">Cần hút bể phốt - Gọi ngay Môi Trường Đông Bắc!</h3>
        <p style="margin: 10px 0;">Khảo sát miễn phí - Cam kết không đục phá - Bảo hành 5 năm</p>
        <p style="font-size: 24px; font-weight: bold; margin: 0; color: #d4380d;">Hotline: 0981.306.307</p>
    </div>

    <h2>Câu hỏi thường gặp (FAQ)</h2>
    <h3>Bao lâu thì nên tiến hành hút bể phốt một lần?</h3>
    <p>Đối với hộ gia đình thông thường, chu kỳ hút bể phốt định kỳ lý tưởng là từ 3 đến 5 năm một lần để tránh tình trạng đầy ứ đột ngột gây hỏng hóc hệ thống thoát nước.</p>
    
    <h3>Hút bể phốt công nghệ chân không có gì khác biệt?</h3>
    <p>Công nghệ hút chân không Nhật Bản cho lực hút mạnh gấp 3-4 lần xe thông thường, hút sạch triệt để bùn đặc mà hoàn toàn không cần đục phá nắp bể phốt, đồng thời hệ thống khép kín loại bỏ 99% mùi hôi thoát ra môi trường.</p>
    
    <h3>Môi Trường Đông Bắc có cung cấp dịch vụ ban đêm không?</h3>
    <p>Chúng tôi cung cấp dịch vụ 24/7 kể cả ngày lễ và ban đêm tại khu vực Hạ Long mà không tăng thêm bất kỳ chi phí dịch vụ ngoài giờ nào.</p>
    """
    
    # Cac nhan tag cho bai viet
    NHAN_TAG = ["Hút bể phốt Hạ Long", "Môi Trường Đông Bắc", "Thông tắc cống"]
    
    # Dang thu nghiem bai viet mau
    dang_bai_blogger(BLOG_ID, TIEU_DE, NOI_DUNG_HTML, NHAN_TAG)
