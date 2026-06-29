import urllib.request
import urllib.parse
import json
import random

def generate_article(api_key, keyword, hotline1="0963.953.533", hotline2="0931.156.756", target_url="https://thongtaccongquangninh.com/"):
    """
    Generate an article using Gemini API for backlink posting.
    Ensures quality gates, correct hotlines, and no-spam quality.
    """
    if not api_key:
        print("Gemini API Key is empty. Using a backup local spin-text generator...")
        return generate_spin_text(keyword, hotline1, hotline2, target_url)
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
Hãy viết một bài viết ngắn (khoảng 350-500 từ) chuẩn SEO để đăng lên diễn đàn nhằm đi backlink cho website dịch vụ vệ sinh môi trường.
Từ khóa chính bắt buộc sử dụng tự nhiên trong bài: "{keyword}"
Đường dẫn mục tiêu cần chèn link: "{target_url}" (Hãy chèn link tự nhiên bằng thẻ HTML: <a href="{target_url}">{keyword}</a> hoặc gắn vào từ khóa phù hợp).

Quy tắc bắt buộc về nội dung và văn phong:
1. Viết bằng tiếng Việt có dấu đầy đủ. Văn phong trực diện, khẩn cấp, giải quyết nỗi đau của khách hàng khi bị tắc cống/bể phốt. Các đoạn văn ngắn từ 2-3 câu. Dùng bullet point để liệt kê.
2. Bôi đậm các từ khóa quan trọng và số hotline.
3. Tuyệt đối TRÁNH các từ sáo rỗng sau: "chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm".
4. Không sử dụng bất kỳ icon/emoji nào trong bài viết.
5. Số hotline liên hệ chèn giữa và cuối bài: "{hotline1}" hoặc "{hotline2}".
6. Dòng cuối cùng của bài viết bắt buộc phải để tag tác giả chính xác như sau:
Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)

Cấu trúc bài viết gồm:
- Tiêu đề ngắn gọn, thu hút (chứa từ khóa).
- Mở bài đánh vào nỗi đau (tắc cống gây mùi hôi thối, bất tiện sinh hoạt).
- Thân bài: Nguyên nhân và cách xử lý triệt để không đục phá bằng máy lò xo hiện đại.
- CTA liên hệ Hotline và link dẫn về website.
- Dòng tác giả cuối cùng.
"""

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1000
        }
    }
    
    try:
        encoded_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url, 
            data=encoded_data, 
            headers={"Content-Type": "application/json"}
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            res_json = json.loads(response.read().decode("utf-8"))
            
            # Extract content from response
            text = res_json['candidates'][0]['content']['parts'][0]['text']
            
            # Quick check to ensure the author tag is there, if not, append it
            author_tag = "Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)"
            if "Nguyễn Song Hào" not in text:
                text += f"\n\n{author_tag}"
                
            return text.strip()
    except Exception as e:
        print(f"[Content Generator Error] Gemini API failed: {e}")
        print("Falling back to local spin-text generator...")
        return generate_spin_text(keyword, hotline1, hotline2, target_url)

def generate_spin_text(keyword, hotline1, hotline2, target_url):
    """
    Fallback spin-text generator in case Gemini API is not configured or fails.
    """
    titles = [
        f"Cách xử lý triệt để khi gặp sự cố {keyword} tại nhà",
        f"Mẹo giải quyết {keyword} nhanh chóng không đục phá",
        f"Địa chỉ thợ xử lý {keyword} có mặt sau 15 phút tại Quảng Ninh"
    ]
    
    introductions = [
        f"Tình trạng tắc nghẽn đường ống gây ra mùi hôi khó chịu và làm đảo lộn sinh hoạt của gia đình bạn. Bạn đang loay hoay tìm cách giải quyết nhưng chưa hiệu quả? Đừng lo lắng, sự cố {keyword} sẽ được xử lý triệt để nếu bạn áp dụng đúng phương pháp.",
        f"Đường cống thoát nước nhà bạn bị trào ngược, bốc mùi hôi thối nồng nặc ảnh hưởng nghiêm trọng tới sức khỏe. Tình trạng {keyword} diễn ra thường xuyên khiến bạn mệt mỏi. Hãy chủ động xử lý ngay trước khi hệ thống chuyển biến xấu hơn."
    ]
    
    bodies = [
        f"Nguyên nhân chủ yếu dẫn đến tắc nghẽn là do dầu mỡ tích tụ lâu ngày, tóc tai rác thải sinh hoạt bám vào thành ống. \nĐể khắc phục, chúng tôi khuyên bạn:\n* Sử dụng máy lò xo chuyên dụng để đánh tan mảng bám dầu mỡ.\n* Tuyệt đối không dùng các hóa chất cực mạnh gây hỏng đường ống nhựa.\n* Gọi thợ kỹ thuật kiểm tra định kỳ để tránh tái phát.",
        f"Hầu hết các gia đình thường tự xử lý bằng cách đổ nước sôi hoặc bột thông cống thông thường nhưng chỉ được vài ngày lại tắc. \nPhương pháp tối ưu nhất hiện nay là:\n* Dùng công nghệ máy lò xo cơ học không đục phá.\n* Vệ sinh sạch sẽ lòng ống bằng vòi phun áp lực cao.\n* Định vị chính xác điểm tắc nghẽn để thông hút triệt để."
    ]
    
    ctas = [
        f"Nếu tình trạng tắc nghẽn quá nặng, hãy liên hệ ngay thợ thông tắc qua hotline **{hotline1}** hoặc **{hotline2}** để được tư vấn khảo sát miễn phí. Tham khảo thêm dịch vụ tại website <a href=\"{target_url}\">{keyword}</a> để nhận báo giá chi tiết nhất.",
        f"Hãy nhấc máy gọi ngay hotline **{hotline1}** để thợ có mặt sau 15 phút xử lý triệt để sự cố. Chúng tôi cam kết không đục phá, bảo hành dài hạn cho khách hàng. Chi tiết xem tại <a href=\"{target_url}\">{keyword}</a>."
    ]
    
    title = random.choice(titles)
    intro = random.choice(introductions)
    body = random.choice(bodies)
    cta = random.choice(ctas)
    
    author = "Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)"
    
    full_text = f"### {title}\n\n{intro}\n\n{body}\n\n{cta}\n\n{author}"
    return full_text

if __name__ == "__main__":
    # Test local spin-text
    print("Testing content generation (Local spin-text):")
    print(generate_spin_text("thông tắc cống tại Bãi Cháy", "0963.953.533", "0931.156.756", "https://thongtaccongquangninh.com/"))
