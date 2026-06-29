<?php
/**
 * Plugin Name: TTCQN Meta Desc Fix
 * Description: Cleanup verified-hours public title, meta, OG/Twitter, and JSON-LD copy for legacy TTCQN URLs.
 * Version: 2026.06.29.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

function ttcqn_meta_desc_map(): array
{
    return [
        25 => 'Blog dịch vụ vệ sinh môi trường Quảng Ninh: kinh nghiệm hút bể phốt, thông tắc cống, xử lý mùi hôi từ đội thợ thực tế. Gọi 0963.953.533 hỗ trợ nhanh 24/7.',
        26 => 'Hút bể phốt Quảng Ninh 24/7 – xe bồn đến nhanh 15 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân, nhà hàng, công trình. Gọi 0963.953.533.',
        35 => 'Thông tắc cống Quảng Ninh 24/7 – thông cống rãnh, thoát sàn, ống nhựa toàn tỉnh. Thợ có mặt 15 phút, máy chuyên dụng, báo giá minh bạch. Gọi 0963.953.533.',
        37 => 'Thông tắc bồn cầu Quảng Ninh 24/7 – thợ có mặt 15 phút, xử lý rút chậm, tắc cứng, trào ngược bồn cầu. Không đục phá, báo giá trước khi làm. Gọi 0963.953.533.',
        38 => 'Nạo vét hố ga Quảng Ninh 24/7 – xử lý bùn rác, mùi hôi, thoát nước kém và chống ngập mùa mưa. Xe chuyên dụng, hỗ trợ nhà dân và doanh nghiệp. Gọi 0963.953.533.',
        52 => 'Hút bể phốt Hạ Long 24/7 – xe bồn có mặt 15 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, khách sạn, nhà hàng tại Hạ Long. Gọi 0963.953.533.',
        53 => 'Hút bể phốt Cẩm Phả 24/7 – xe bồn có mặt 15–30 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân và doanh nghiệp tại Cẩm Phả. Gọi 0963.953.533.',
        54 => 'Hút bể phốt Uông Bí 24/7 – xe bồn có mặt 15–30 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân và doanh nghiệp tại Uông Bí. Gọi 0963.953.533.',
        57 => 'Hút bể phốt Quảng Yên 24/7 – xe bồn có mặt 15–30 phút, hút sạch không mùi, không đục phá bừa. Phục vụ nhà dân và doanh nghiệp tại Quảng Yên. Gọi 0963.953.533.',
        62 => 'Môi Trường Đô Thị Số 1 Quảng Ninh – đơn vị hút bể phốt, thông tắc cống, nạo vét hố ga tại Quảng Ninh với đội xe bồn chuyên dụng, phục vụ 24/7. Gọi 0963.953.533.',
        63 => 'Đặt lịch hút bể phốt, thông tắc cống và nạo vét hố ga tại Quảng Ninh. Gọi hotline 0963.953.533 hoặc 0931.156.756 để được tư vấn và báo giá miễn phí 24/7.',
        380 => 'Thông tắc cống chung cư Hạ Long 24/7 – xử lý tắc ống đứng, ống ngang, hầm thoát tòa nhà. Không đục tường, có mặt nhanh, báo giá rõ ràng. Gọi 0963.953.533.',
        383 => 'Thông tắc cống nhà hàng Hạ Long 24/7 – xử lý tắc bếp, dầu mỡ, bể tách mỡ nhà hàng ven biển. Không gián đoạn kinh doanh, ưu tiên gấp. Gọi 0963.953.533.',
        384 => 'Thông tắc cống ngõ nhỏ Hạ Long 24/7 – xe máy vào tận ngõ sâu 50cm, thợ xử lý tắc rãnh thoát nước và ống nhựa hẹp, không đục phá gạch lát sàn. Gọi 0963.953.533.',
        386 => 'Tìm hiểu nguyên nhân khiến cống tắc thường xuyên tại Hạ Long: rác sinh hoạt, dầu mỡ, bùn cát mùa mưa. Cách phòng tránh và khi nào cần gọi thợ. 0963.953.533.',
        400 => 'Thông tắc cống Cẩm Phả 24/7 – nhà dân, hầm mỏ, khu dân cư thành phố Cẩm Phả. Thợ có mặt 30 phút, máy áp lực cao, không đục phá. Gọi ngay 0963.953.533.',
        405 => 'Thông tắc cống Uông Bí 24/7 – nhà dân, công ty, khu công nghiệp thành phố Uông Bí. Thợ có mặt 30 phút, máy áp lực cao, không đục phá. Gọi 0963.953.533.',
        424 => 'Thông tắc cống Quảng Yên 24/7 – khảo sát nhanh, báo giá trước, không đục phá, bảo hành 6-24 tháng. Gửi ảnh hiện trạng, gọi 0963.953.533 / 0931.156.756.',
        436 => 'Hút bể phốt Bãi Cháy 24/7 – xe bồn có mặt 15 phút, hút sạch không mùi, không đục phá. Nhà dân, khách sạn, nhà hàng tại khu du lịch Bãi Cháy. Gọi 0963.953.533.',
        991 => 'Thông tắc cống Cao Xanh Hạ Long 24/7 – phục vụ nhà dân, chung cư phường Cao Xanh. Thợ 15 phút, máy áp lực cao, báo giá trước khi làm. Gọi 0963.953.533.',
        992 => 'Thông tắc cống Giếng Đáy Hạ Long 24/7 – nhà dân, hộ kinh doanh phường Giếng Đáy. Thợ 15 phút, máy cơ học và áp lực cao, báo giá miễn phí. Gọi 0963.953.533.',
        993 => 'Thông tắc cống Tuần Châu 24/7 – resort, biệt thự, nhà dân đảo Tuần Châu Hạ Long. Thợ có mặt 20 phút, xử lý dứt điểm, không gián đoạn dịch vụ. Gọi 0963.953.533.',
        1367 => 'Thông tắc bồn cầu bị tắc Quảng Ninh – xử lý tắc hoàn toàn, nước không thoát, trào ngược, rút chậm. Thợ có mặt 15–30 phút, báo giá miễn phí. Gọi 0963.953.533.',
        1368 => 'Nạo vét hố ga Quảng Ninh – xử lý bùn rác, mùi hôi, thoát nước kém, chống ngập cục bộ. Xe chuyên dụng, hỗ trợ nhà dân và doanh nghiệp 24/7. Gọi 0963.953.533.',
        1369 => 'Xử lý mùi hôi nhà vệ sinh Quảng Ninh: kiểm tra thoát sàn, lavabo, bồn cầu, bể phốt, hố ga và ống thông khí. Gọi 0963.953.533 / 0931.156.756 để xử lý tận gốc.',
        1481 => 'Thông tắc bồn cầu Đông Triều 24/7 – thợ có mặt 15–30 phút, xử lý nghẹt, trào ngược, rút chậm, không đục phá. Phục vụ nhà dân và doanh nghiệp. Gọi 0963.953.533.',
        1482 => 'Thông tắc bồn cầu Hạ Long 24/7 – thợ có mặt 15 phút, xử lý nghẹt, trào ngược, rút chậm, không đục phá. Phục vụ nhà dân, khách sạn, nhà hàng. Gọi 0963.953.533.',
        1485 => 'Thông tắc bồn cầu Quảng Yên 24/7 – thợ có mặt 15–30 phút, xử lý rút chậm, tắc cứng, trào ngược tại Quảng Yên. Không đục phá, báo giá miễn phí. Gọi 0963.953.533.',
        2045 => 'Hóa chất tự thông cống có hòa tan rác cứng, giấy vệ sinh và dầu mỡ không? Sự thật và giải pháp thay thế đúng kỹ thuật để không làm hỏng ống. Gọi 0963.953.533.',
        2046 => 'Mùi hôi từ cống trong nhà do đâu? Bài viết phân tích 6 nguyên nhân phổ biến và cách xử lý từng trường hợp tại Quảng Ninh. Gọi 0963.953.533.',
        2047 => 'Hút bể phốt Ba Chẽ 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá bừa. Phục vụ nhà dân, khu trọ, nhà hàng. Gọi 0963.953.533.',
        2048 => 'Hút bể phốt Bình Liêu 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, nhà hàng và khu trọ. Gọi 0963.953.533.',
        2049 => 'Hút bể phốt Cô Tô 24/7 – xe bồn chuyên dụng, điều phối từ đất liền, hút sạch không mùi, không đục phá. Phục vụ nhà dân, resort, khu lưu trú. Gọi 0963.953.533.',
        2050 => 'Hút bể phốt Đầm Hà 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, nhà hàng và công trình. Gọi 0963.953.533.',
        2051 => 'Hút bể phốt Hải Hà 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá bừa. Phục vụ nhà dân, nhà hàng, khu trọ. Gọi 0963.953.533.',
        2052 => 'Hút bể phốt Tiên Yên 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, nhà hàng và khu trọ. Gọi 0963.953.533.',
        2053 => 'Thông tắc cống Hồng Gai Hạ Long 24/7 – nhà dân, phố cổ, nhà hàng khu Hồng Gai. Thợ có mặt 15 phút, xử lý dứt điểm, không đục phá sàn. Gọi 0963.953.533.',
        2054 => 'Thông tắc cống Bãi Cháy Hạ Long 24/7 – xử lý cống tắc nhà dân, khách sạn, nhà hàng, homestay trong ngày. Không đục phá, báo giá trước. Gọi 0963.953.533.',
        2332 => 'Cẩm nang thông tắc cống tại Hạ Long: nhận biết dấu hiệu tắc, nguyên nhân theo từng khu vực, bảng giá tham khảo, quy trình xử lý không đục phá và cách chọn thợ đáng tin.',
        2356 => 'Nguyễn Song Hào – kỹ thuật viên vệ sinh môi trường Quảng Ninh, tác giả bài viết thực tế về hút bể phốt và thông tắc cống tại Quảng Ninh. Gọi 0963.953.533.',
        2357 => 'Bảng giá thông tắc bồn cầu Quảng Ninh theo mức độ tắc và loại công trình. Thợ có mặt 15–30 phút, báo giá công khai trước khi làm. Gọi ngay 0963.953.533.',
        2377 => 'Thông tắc bồn cầu khẩn cấp Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca tắc hoàn toàn, rút chậm và trào ngược. Gọi 0963.953.533.',
        2379 => 'Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533.',
        2385 => 'Thông tắc bồn cầu không đục phá Quảng Ninh – dùng máy thông cơ và áp lực cao, bảo toàn gạch men và kết cấu. Báo giá miễn phí trong khung 05:00-22:00 hằng ngày. Gọi 0963.953.533.',
        2407 => 'Thông tắc bồn cầu nhà dân Quảng Ninh – thợ có mặt 15-30 phút, xử lý rút chậm, tắc hoàn toàn, trào ngược, không đục phá. Báo giá miễn phí trong khung 05:00-22:00 hằng ngày. Gọi 0963.953.533.',
        2412 => 'Thông tắc bồn cầu nhà hàng Quảng Ninh – hỗ trợ nhanh giờ cao điểm, thợ có mặt 15 phút, xử lý không ảnh hưởng kinh doanh. Gọi 0963.953.533.',
        2417 => 'Thông tắc bồn cầu khách sạn Quảng Ninh – thợ có mặt 15 phút, xử lý nghẹt không gián đoạn hoạt động, không đục phá, ưu tiên giờ cao điểm. Gọi 0963.953.533.',
        2430 => 'Hút bể phốt khẩn cấp Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca tràn hầm và bể đầy gấp. Gọi 0963.953.533.',
        2439 => 'Hút bể phốt Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca bể đầy, trào mùi, ngõ sâu và công trình cần xử lý gấp. Gọi 0963.953.533.',
        2449 => 'Bảng giá hút bể phốt Quảng Ninh tính theo m³ và loại bể. Báo giá miễn phí, không phát sinh chi phí ẩn, xe bồn có mặt trong 15–30 phút. Gọi 0963.953.533.',
        2559 => 'Hút hầm cầu Quảng Ninh – xe bồn chuyên dụng, có mặt 15 phút, hút bể 1-20 khối, sạch không mùi, không đục phá bừa bãi. Báo giá miễn phí trong khung 05:00-22:00 hằng ngày. Gọi 0963.953.533.',
        2589 => 'Dấu hiệu bể phốt bị đầy không nên bỏ qua: nước rút chậm, mùi hôi lan ra sàn, bồn cầu trào ngược. Xử lý ngay tránh hỏng hệ thống. Gọi 0963.953.533 để hỗ trợ.',
        2687 => 'Hút bể phốt nhà hàng Quảng Ninh – xử lý nhanh không gián đoạn kinh doanh, hút sạch không mùi, xe bồn đủ tải và điều phối linh hoạt trong ngày. Gọi 0963.953.533.',
        2694 => 'Hút bể phốt công ty, nhà máy, khu công nghiệp tại Quảng Ninh. Xe bồn đủ tải trọng, hút sạch không mùi, xuất hóa đơn VAT, ký hợp đồng. Gọi 0963.953.533.',
        2708 => 'Hút bể phốt khu nhà trọ tại Quảng Ninh – xe bồn vào ngõ sâu, hút sạch không mùi, không đục phá, phục vụ chủ trọ và khách thuê. Gọi 0963.953.533.',
        2769 => 'Hút bể phốt khu công nghiệp Quảng Ninh – xe bồn lớn hút sạch nhà xưởng, xí nghiệp, kho bãi. Không mùi, xuất VAT, ký hợp đồng bảo trì. Gọi 0963.953.533.',
        2777 => 'Thông tắc cống khẩn cấp Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nước trào, tắc nặng và mùi hôi. Gọi 0963.953.533.',
        2782 => 'Thông tắc cống Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nước trào, mùi hôi và cống nghẹt nặng. Gọi 0963.953.533.',
        2787 => 'Giá thông tắc cống Quảng Ninh 2026 tại Hạ Long, Cẩm Phả, Uông Bí; có bảng giá, phụ phí, bảo hành rõ ràng, không báo giá ảo. Gọi 0963.953.533 tư vấn trong khung 05:00-22:00 hằng ngày.',
    ];
}

function ttcqn_meta_desc_is_frontend_singular(): bool
{
    $is_json = function_exists('wp_is_json_request') ? wp_is_json_request() : false;
    return !is_admin() && !wp_doing_ajax() && !$is_json && is_singular();
}

function ttcqn_meta_desc_target_post_id(): int
{
    return ttcqn_meta_desc_is_frontend_singular() ? (int) get_queried_object_id() : 0;
}

function ttcqn_meta_desc_contains_legacy_copy(string $text): bool
{
    return stripos($text, '24/7') !== false
        || stripos($text, '00:00-23:59') !== false
        || stripos($text, '00:00') !== false
        || stripos($text, '23:59') !== false;
}

function ttcqn_meta_desc_normalize_text(string $text): string
{
    $charset = get_bloginfo('charset') ?: 'UTF-8';
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, $charset);
    $text = preg_replace('/\s+/u', ' ', $text);
    $text = preg_replace('/\s+([,.;:!?])/u', '$1', $text);
    $text = preg_replace('/([,;!?])([^\s])/u', '$1 $2', $text);
    $text = preg_replace('/(?<!\d)([.:])([^\s])/u', '$1 $2', $text);
    $text = preg_replace('/(\d)\s*([.:])\s*(\d)/u', '$1$2$3', $text);
    $text = preg_replace('/\s+([–-])\s+/u', ' $1 ', $text);
    $text = preg_replace('/\s{2,}/u', ' ', $text);
    return trim((string) $text);
}

function ttcqn_meta_desc_clean_title(string $title): string
{
    if ($title === '') {
        return '';
    }

    $clean = ttcqn_meta_desc_normalize_text($title);
    $clean = preg_replace('/\bphục vụ\s*24\/7\b/iu', '', $clean);
    $clean = preg_replace('/\bcó mặt\s*24\/7\b/iu', '', $clean);
    $clean = preg_replace('/\bhoạt động\s*24\/7\b/iu', '', $clean);
    $clean = preg_replace('/\b24\/7\b/iu', '', $clean);
    $clean = preg_replace('/\s*([|,:;–-])\s*$/u', '', $clean);
    $clean = preg_replace('/\(\s*\)/u', '', $clean);
    $clean = preg_replace('/\s{2,}/u', ' ', $clean);
    $clean = preg_replace('/\s+([,.;:!?])/u', '$1', $clean);
    $clean = preg_replace('/([,.;:!?])([^\s])/u', '$1 $2', $clean);
    $clean = preg_replace('/(\d)\s*:\s*(\d)/u', '$1:$2', $clean);
    $clean = preg_replace('/(\d)\s*-\s*(\d)/u', '$1-$2', $clean);
    return trim((string) $clean);
}

function ttcqn_meta_desc_clean_description(string $text): string
{
    if ($text === '') {
        return '';
    }

    $clean = ttcqn_meta_desc_normalize_text($text);
    $clean = preg_replace('/\b(Hút bể phốt|Thông tắc cống|Thông tắc bồn cầu|Nạo vét hố ga|Hút hầm cầu)([^–—|]{0,120}?)\s+24\/7\b/iu', '$1$2', $clean);
    $clean = preg_replace('/\b(phục vụ|hỗ trợ|hoạt động|tiếp nhận|tư vấn|trực)\s*24\/7\b/iu', '$1 05:00-22:00 hằng ngày', $clean);
    $clean = preg_replace('/\bbáo giá miễn phí\s*24\/7\b/iu', 'báo giá miễn phí trong khung 05:00-22:00 hằng ngày', $clean);
    $clean = preg_replace('/\bdù ban đêm hay ngày lễ\b/iu', 'trong khung giờ làm việc', $clean);
    $clean = preg_replace('/\bngày lễ,?\s*Tết\b/iu', 'cuối tuần', $clean);
    $clean = str_replace('00:00-23:59', '05:00-22:00', $clean);
    $clean = preg_replace('/\b00:00\b/u', '05:00', $clean);
    $clean = preg_replace('/\b23:59\b/u', '22:00', $clean);
    $clean = preg_replace('/\b24\/7\b/iu', '05:00-22:00 hằng ngày', $clean);
    $clean = str_replace('05:00-22:00 hằng ngày hằng ngày', '05:00-22:00 hằng ngày', $clean);
    $clean = str_replace('05:00-22:00 hằng ngày, 05:00-22:00 hằng ngày', '05:00-22:00 hằng ngày', $clean);
    return ttcqn_meta_desc_normalize_text($clean);
}

function ttcqn_meta_desc_source_title(int $post_id, string $fallback = ''): string
{
    if ($post_id <= 0) {
        return ttcqn_meta_desc_clean_title($fallback);
    }

    $stored = (string) get_post_meta($post_id, 'rank_math_title', true);
    $raw = (string) get_post_field('post_title', $post_id);
    $source = $raw !== '' ? $raw : ($stored !== '' ? $stored : $fallback);

    return ttcqn_meta_desc_clean_title($source);
}

function ttcqn_meta_desc_source_description(int $post_id, string $fallback = ''): string
{
    $map = ttcqn_meta_desc_map();
    if (isset($map[$post_id])) {
        return ttcqn_meta_desc_clean_description($map[$post_id]);
    }

    if ($post_id > 0) {
        $stored = (string) get_post_meta($post_id, 'rank_math_description', true);
        if ($stored === '') {
            $stored = (string) get_post_meta($post_id, '_rank_math_description', true);
        }
        if ($stored !== '') {
            return ttcqn_meta_desc_clean_description($stored);
        }
    }

    return ttcqn_meta_desc_clean_description($fallback);
}

function ttcqn_meta_desc_clean_json_ld_node(array $node, string $clean_title, string $clean_desc): array
{
    foreach ($node as $key => $value) {
        if (is_array($value)) {
            $node[$key] = ttcqn_meta_desc_clean_json_ld_node($value, $clean_title, $clean_desc);
            continue;
        }

        if (!is_string($value)) {
            continue;
        }

        if ($key === 'description') {
            $node[$key] = ttcqn_meta_desc_clean_description($value);
            continue;
        }

        if (in_array($key, ['headline', 'name', 'caption', 'alternateName', 'keywords'], true) && ttcqn_meta_desc_contains_legacy_copy($value)) {
            $node[$key] = ttcqn_meta_desc_clean_title($value);
            continue;
        }

        if ($value === 'Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59') {
            $node[$key] = 'Mo,Tu,We,Th,Fr,Sa,Su 05:00-22:00';
            continue;
        }

        if ($value === '00:00') {
            $node[$key] = '05:00';
            continue;
        }

        if ($value === '23:59') {
            $node[$key] = '22:00';
            continue;
        }
    }

    $types = (array) ($node['@type'] ?? []);
    if (array_intersect($types, ['WebPage', 'Article', 'BlogPosting', 'NewsArticle'])) {
        if ($clean_title !== '') {
            $node['name'] = $clean_title;
            if (isset($node['headline'])) {
                $node['headline'] = $clean_title;
            }
        }
        if ($clean_desc !== '') {
            $node['description'] = $clean_desc;
        }
    }

    return $node;
}

add_action('init', function (): void {
    if (get_option('ttcqn_meta_desc_fix_verified_hours_v20260629_1')) {
        return;
    }

    foreach (ttcqn_meta_desc_map() as $post_id => $legacy_desc) {
        $clean_desc = ttcqn_meta_desc_clean_description($legacy_desc);
        update_post_meta($post_id, 'rank_math_description', $clean_desc);
        update_post_meta($post_id, '_rank_math_description', $clean_desc);

        $stored_title = (string) get_post_meta($post_id, 'rank_math_title', true);
        $raw_title = (string) get_post_field('post_title', $post_id);
        $source_title = $stored_title !== '' ? $stored_title : $raw_title;
        $clean_title = ttcqn_meta_desc_clean_title($source_title);
        if ($source_title !== '' && $clean_title !== '' && $clean_title !== $source_title) {
            update_post_meta($post_id, 'rank_math_title', $clean_title);
        }

        wp_cache_delete($post_id, 'post_meta');
        clean_post_cache($post_id);
    }

    update_option('ttcqn_meta_desc_fix_verified_hours_v20260629_1', 1);
}, 1);

add_filter('rank_math/frontend/description', function ($desc): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_description($post_id, (string) $desc) : (string) $desc;
}, 99999);

add_filter('rank_math/opengraph/facebook/description', function ($desc): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_description($post_id, (string) $desc) : (string) $desc;
}, 99999);

add_filter('rank_math/opengraph/twitter/description', function ($desc): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_description($post_id, (string) $desc) : (string) $desc;
}, 99999);

add_filter('pre_get_document_title', function ($title): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_title($post_id, (string) $title) : (string) $title;
}, 99999);

add_filter('document_title_parts', function (array $parts): array {
    $post_id = ttcqn_meta_desc_target_post_id();
    if ($post_id <= 0) {
        return $parts;
    }

    $parts['title'] = ttcqn_meta_desc_source_title($post_id, (string) ($parts['title'] ?? ''));
    return $parts;
}, 99999);

add_filter('rank_math/frontend/title', function ($title): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_title($post_id, (string) $title) : (string) $title;
}, 99999);

add_filter('rank_math/opengraph/facebook/title', function ($title): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_title($post_id, (string) $title) : (string) $title;
}, 99999);

add_filter('rank_math/opengraph/twitter/title', function ($title): string {
    $post_id = ttcqn_meta_desc_target_post_id();
    return $post_id > 0 ? ttcqn_meta_desc_source_title($post_id, (string) $title) : (string) $title;
}, 99999);

add_filter('the_title', function ($title, $post_id = 0) {
    $target_id = ttcqn_meta_desc_target_post_id();
    if ($target_id <= 0 || (int) $post_id !== $target_id) {
        return $title;
    }

    return ttcqn_meta_desc_source_title($target_id, (string) $title);
}, 99999, 2);

add_filter('rank_math/json_ld', function ($data, $jsonld = null) {
    if (!is_array($data)) {
        return $data;
    }

    $post_id = ttcqn_meta_desc_target_post_id();
    if ($post_id <= 0) {
        return $data;
    }

    $clean_title = ttcqn_meta_desc_source_title($post_id);
    $clean_desc = ttcqn_meta_desc_source_description($post_id);
    foreach ($data as $key => $node) {
        if (!is_array($node)) {
            continue;
        }
        $data[$key] = ttcqn_meta_desc_clean_json_ld_node($node, $clean_title, $clean_desc);
    }

    return $data;
}, 99999, 2);

function ttcqn_meta_desc_html_replacements(): array
{
    return [
        55 => [
            'Hút Bể Phốt Móng Cái – Xe Bồn Cửa Khẩu, Tiếp Nhận 05: 00- 22: 00' => 'Hút Bể Phốt Móng Cái – Xe Bồn Cửa Khẩu, Tiếp Nhận 05:00-22:00',
            'Hút bể phốt Móng Cái 24/7 — xe bồn phục vụ khu cửa khẩu, nhà phố, khách sạn. Báo giá rõ trước. Gọi 0963.953.533 / 0931.156.756.' => 'Hút bể phốt Móng Cái cho nhà dân, khách sạn, khu kinh doanh. Tiếp nhận 05:00-22:00, xe bồn hút sạch, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.',
        ],
        56 => [
            'Hút bể phốt Đông Triều 24/7 — xe bồn vào khu công nghiệp, nhà vườn, khu dân cư. Không đục phá, bảo hành. Gọi 0963.953.533.' => 'Hút bể phốt Đông Triều cho nhà dân, trang trại, khu trọ. Tiếp nhận 05:00-22:00, xe bồn vào ngõ sâu, báo giá rõ. Gọi 0963.953.533.',
        ],
        58 => [
            'Hút bể phốt Vân Đồn 24/7 — xe bồn phục vụ resort, nhà dân, khu du lịch Vân Đồn. Có mặt trong ngày. Gọi 0963.953.533.' => 'Hút bể phốt Vân Đồn cho homestay, resort, nhà dân ven biển. Tiếp nhận 05:00-22:00, xe bồn hút sạch, báo giá rõ. Gọi 0963.953.533.',
        ],
        992 => [
            '"openingHours":"Mo-Su 00:00-23:59"' => '"openingHours":"Mo-Su 05:00-22:00"',
            'Dịch vụ thông tắc cống tại Giếng Đáy, Hạ Long 05:00-22:00.' => 'Dịch vụ thông tắc cống tại Giếng Đáy, Hạ Long.',
        ],
        1483 => [
            'Thông tắc bồn cầu Móng Cái 24/7 —' => 'Thông tắc bồn cầu Móng Cái —',
        ],
        450 => [
            'Thông tắc bồn cầu Cẩm Phả 24/7 — xử lý bồn cầu tắc, trào ngược, rút chậm. Có mặt trong ngày. Gọi 0963.953.533.' => 'Thông tắc bồn cầu Cẩm Phả cho nhà dân, nhà trọ, khu mỏ khi nước rút chậm, trào ngược hoặc có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        61 => [
            'Bảng giá hút bể phốt thông tắc cống Quảng Ninh 2026 rõ từng hạng mục, báo giá trước, không ẩn phí, phục vụ 24/7. Gọi ngay 0963.953.533. Thợ có mặt nhanh.' => 'Bảng giá hút bể phốt thông tắc cống Quảng Ninh 2026 rõ từng hạng mục, báo giá trước, không ẩn phí. Gọi ngay 0963.953.533. Thợ có mặt nhanh.',
        ],
        216 => [
            'Cách xử lý cống thoát nước tắc tại nhà Quảng Ninh: dùng lò xo, máy cao áp hoặc gọi thợ đến tận nơi. Hướng dẫn từng bước, hotline 0963.953.533 hỗ trợ 24/7.' => 'Cách xử lý cống thoát nước tắc tại nhà Quảng Ninh: dùng lò xo, máy cao áp hoặc gọi thợ đến tận nơi. Hướng dẫn từng bước, hotline 0963.953.533 tiếp nhận 05:00-22:00 hằng ngày.',
        ],
        215 => [
            'Nhận biết 6 dấu hiệu bể phốt cần hút tại Quảng Ninh: mùi hôi đặc, nước trào sàn, bồn cầu rút chậm. Gọi 0963.953.533 — thợ có mặt trong 15 phút, xử lý 24/7.' => 'Nhận biết 6 dấu hiệu bể phốt cần hút tại Quảng Ninh: mùi hôi đặc, nước trào sàn, bồn cầu rút chậm. Gọi 0963.953.533 để được kiểm tra và xử lý sớm trong ngày.',
        ],
        2445 => [
            'Điều khoản dịch vụ hút bể phốt, thông tắc cống và vệ sinh môi trường của Môi Trường Đô Thị Số 1 Quảng Ninh. Hotline 0963.953.533, phục vụ 24/7.' => 'Điều khoản dịch vụ hút bể phốt, thông tắc cống và vệ sinh môi trường của Môi Trường Đô Thị Số 1 Quảng Ninh. Hotline 0963.953.533, tiếp nhận 05:00-22:00 hằng ngày.',
        ],
        311 => [
            'Xử lý mùi hôi Quảng Ninh 24/7 — tìm đúng nguồn hôi từ cống, bể phốt, hố ga, xử lý hết hẳn không tái phát. Thợ có mặt 15 phút, bảo hành. Gọi 0963.953.533.' => 'Xử lý mùi hôi Quảng Ninh — tìm đúng nguồn hôi từ cống, bể phốt, hố ga, xử lý hết hẳn không tái phát. Thợ có mặt 15 phút, bảo hành. Gọi 0963.953.533.',
        ],
        1486 => [
            'Thông tắc bồn cầu Uông Bí 24/7 — thợ đến nhanh, xử lý bồn cầu tắc, trào ngược, rút chậm, không đục phá. Gọi 0963.953.533.' => 'Thông tắc bồn cầu Uông Bí cho nhà trọ, khu dân cư và nhà ống cũ khi nước rút chậm, trào ngược, có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        1487 => [
            'Thông tắc bồn cầu Vân Đồn 24/7 — xử lý bồn cầu tắc resort, nhà nghỉ, nhà dân tại Vân Đồn. Có mặt trong ngày. Gọi 0963.953.533.' => 'Thông tắc bồn cầu Vân Đồn cho homestay, resort và nhà dân khi nước rút chậm, trào ngược hoặc có mùi hôi. Gọi 0963.953.533 / 0931.156.756 để kiểm tra sớm.',
        ],
        36 => [
            'Thông tắc chậu rửa Quảng Ninh 24/7 — xử lý tắc bồn rửa nhà bếp, nhà tắm nhanh, không đục phá. Gọi 0963.953.533.' => 'Thông tắc chậu rửa Quảng Ninh — xử lý tắc bồn rửa nhà bếp, nhà tắm nhanh, không đục phá. Gọi 0963.953.533.',
        ],
        1369 => [
            'Xử lý mùi hôi nhà vệ sinh Quảng Ninh 24/7 — tìm đúng nguồn hôi từ bể phốt, cống, ron cầu, hết hẳn không quay lại. Gọi 0963.953.533. Thợ có mặt 15 phút.' => 'Xử lý mùi hôi nhà vệ sinh Quảng Ninh: kiểm tra thoát sàn, lavabo, bồn cầu, bể phốt, hố ga và ống thông khí. Gọi 0963.953.533 / 0931.156.756 để xử lý tận gốc.',
        ],
        1377 => [
            'Có mặt hỗ trợ 24/7, anh/chị gọi được bất kỳ lúc nào — ngay khi thấy nước trào ra sàn, bồn cầu không dội được hoặc mùi hôi bốc lên từ thoát sàn.' => 'Tiếp nhận 05:00-22:00 hằng ngày, anh/chị nên gọi ngay khi thấy nước trào ra sàn, bồn cầu không dội được hoặc mùi hôi bốc lên từ thoát sàn.',
            'Có mặt hỗ trợ 24/7' => 'Tiếp nhận 05:00-22:00 hằng ngày',
        ],
        3175 => [
            'Có mặt hỗ trợ 24/7, anh/chị gọi được bất kỳ lúc nào — ngay khi thấy nước trào ra sàn, bồn cầu không dội được hoặc mùi hôi bốc lên từ thoát sàn.' => 'Tiếp nhận 05:00-22:00 hằng ngày, anh/chị nên gọi ngay khi thấy nước trào ra sàn, bồn cầu không dội được hoặc mùi hôi bốc lên từ thoát sàn.',
            'Có mặt hỗ trợ 24/7' => 'Tiếp nhận 05:00-22:00 hằng ngày',
        ],
        426 => [
            'Thông tắc cống Móng Cái 24/7 —' => 'Thông tắc cống Móng Cái —',
            '"openingHours":"Mo-Su 00:00-23:59"' => '"openingHours":"Mo-Su 05:00-22:00"',
            'Thông tắc cống Móng Cái 05:00-22:00 tại Móng Cái' => 'Thông tắc cống Móng Cái tại Móng Cái',
        ],
        425 => [
            'Thông tắc cống Đông Triều 24/7 — xử lý cống tắc nhà vườn, khu công nghiệp Đông Triều. Không đục phá. Gọi 0963.953.533.' => 'Thông tắc cống Đông Triều cho nhà vườn, khu trọ, cơ sở kinh doanh. Xử lý nước trào, mùi hôi, không đục phá khi chưa cần. Gọi 0963.953.533 / 0931.156.756.',
        ],
        2332 => [
            'Cẩm nang thông tắc cống tại Hạ Long: nhận biết dấu hiệu tắc, nguyên nhân theo từng khu vực, bảng giá tham khảo, quy trình xử lý không đục phá và cách chọn thợ đáng tin 24/7.' => 'Cẩm nang thông tắc cống tại Hạ Long: nhận biết dấu hiệu tắc, nguyên nhân theo từng khu vực, bảng giá tham khảo, quy trình xử lý không đục phá và cách chọn thợ đáng tin.',
            'cách chọn thợ đáng tin 24/7.' => 'cách chọn thợ đáng tin.',
        ],
        427 => [
            'Thông tắc cống Vân Đồn 24/7 — xử lý cống nghẹt resort, nhà dân khu đảo. Có mặt trong ngày. Gọi 0963.953.533 / 0931.156.756.' => 'Thông tắc cống Vân Đồn cho nhà hàng, homestay, công trình ven biển. Xử lý cát, mỡ, mùi hôi, báo giá rõ trong ngày. Gọi 0963.953.533 / 0931.156.756.',
        ],
        2439 => [
            'Hút Bể Phốt 24/7 Quảng Ninh tại Quảng Ninh – thợ kỹ thuật xử lý tại nhà' => 'Hút bể phốt khẩn cấp Quảng Ninh tại hiện trường – thợ kỹ thuật xử lý tại nhà',
            'Hút bể phốt 05:00-22:00' => 'Hút bể phốt khẩn cấp',
            'Hút Bể Phốt 05:00-22:00' => 'Hút Bể Phốt Khẩn Cấp',
            'Thợ Môi Trường Đô Thị Số 1 xử lý hút bể phốt khẩn cấp Quảng Ninh tại Quảng Ninh' => 'Thợ Môi Trường Đô Thị Số 1 xử lý hút bể phốt Quảng Ninh tại hiện trường',
            'Kết quả thực tế sau khi xử lý hút bể phốt khẩn cấp Quảng Ninh – Quảng Ninh 2026' => 'Kết quả thực tế sau khi xử lý hút bể phốt Quảng Ninh năm 2026',
            'Hút bể phốt Quảng Ninh – xe bồn trực liên tục, có mặt trong 15–30 phút trong khung giờ làm việc, hút sạch không mùi, không đục phá. Gọi ngay 0963. 953. 533.' => 'Hút bể phốt Quảng Ninh – điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca bể đầy, trào mùi và công trình cần xử lý gấp. Gọi ngay 0963. 953. 533.',
            'Hút bể phốt Quảng Ninh – xe bồn trực liên tục, có mặt trong 15–30 phút trong khung giờ làm việc, hút sạch không mùi, không đục phá. Gọi ngay 0963.953.533.' => 'Hút bể phốt Quảng Ninh – điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca bể đầy, trào mùi và công trình cần xử lý gấp. Gọi ngay 0963.953.533.',
            '<strong>Hút bể phốt khẩn cấp</strong> không có nghĩa là &#8220;chúng tôi nhận điện thoại 05:00-22:00&#8221;. Nó có nghĩa là xe bồn sẵn sàng xuất phát bất kỳ lúc nào – 2 giờ sáng, 11 giờ đêm hay ngày lễ Tết – mà không cần lịch hẹn trước.' => '<strong>Dịch vụ hút bể phốt khẩn cấp</strong> tại đây được ưu tiên điều phối nhanh trong khung 05:00-22:00 hằng ngày, tập trung vào ca bể đầy, trào mùi và công trình cần xử lý gấp trong ngày.',
            'Dịch vụ 05:00-22:00 thật sự cần đáp ứng được ba điều kiện:' => 'Dịch vụ tiếp nhận 05:00-22:00 hằng ngày cần đáp ứng ba điều kiện:',
            'Thợ trực ca 05:00-22:00, phản hồi trong vòng 2 phút.' => 'Tổng đài tiếp nhận 05:00-22:00, phản hồi nhanh trong ngày.',
            '<li>Có thợ trực ca đêm, không chỉ nhận tin nhắn rồi hẹn sáng mai</li>' => '<li>Có tổng đài tiếp nhận và điều phối nhanh trong khung 05:00-22:00 hằng ngày</li>',
            'Môi Trường Đô Thị Số 1 Quảng Ninh vận hành theo đúng ba điều kiện đó. Xe bồn hút 5 khối đậu sẵn tại bãi, thợ ca đêm túc trực. Địa bàn quen thuộc từ Bãi Cháy đến Cẩm Phả, từ các ngõ hẹp khu Giếng Đáy cho đến khu nhà liền kề Hà Khẩu.' => 'Môi Trường Đô Thị Số 1 Quảng Ninh vận hành theo đúng ba điều kiện đó. Xe bồn hút 5 khối sẵn phương án điều phối nhanh, đội kỹ thuật quen địa bàn từ Bãi Cháy đến Cẩm Phả và các ngõ hẹp khu Giếng Đáy đến Hà Khẩu.',
            'Tình huống thường gặp khi hút bể phốt khẩn cấp tại Quảng Ninh' => 'Tình huống thường gặp khi hút bể phốt tại Quảng Ninh',
            'Tình huống thường gặp khi hút bể phốt 05:00-22:00 tại Quảng Ninh' => 'Tình huống thường gặp khi hút bể phốt tại Quảng Ninh',
            'NAP liên hệ và khu vực phục vụ hút bể phốt khẩn cấp tại Quảng Ninh' => 'NAP liên hệ và khu vực phục vụ hút bể phốt tại Quảng Ninh',
            'NAP liên hệ và khu vực phục vụ hút bể phốt 05:00-22:00 tại Quảng Ninh' => 'NAP liên hệ và khu vực phục vụ hút bể phốt tại Quảng Ninh',
            'Gọi được. Đội thợ trực ca đêm 05:00-22:00, sẵn sàng xuất phát ngay sau cuộc gọi. Không thu phụ phí đêm khuya – giá dịch vụ bằng nhau dù gọi lúc 2 giờ sáng hay 10 giờ sáng.' => 'Khách nên gọi trong khung 05:00-22:00 để được điều phối nhanh và báo thời gian có mặt rõ ràng theo từng khu vực.',
            'xe bồn xuất phát trong 15 phút, tiếp nhận 05:00-22:00 hằng ngày khắp Quảng Ninh. Báo giá tại chỗ, không phụ phí đêm khuya, bảo hành 3 tháng.' => 'xe bồn điều phối nhanh trong khung 05:00-22:00 hằng ngày trên toàn Quảng Ninh. Báo giá tại chỗ và bảo hành 3 tháng.',
            'Bể phốt đầy lúc 11 giờ đêm, mùi hôi xộc lên cả nhà, nhà vệ sinh không dùng được nữa – lúc đó bạn gọi ai? Đa phần các đơn vị vệ sinh môi trường chỉ làm giờ hành chính, để bạn chờ đến sáng hôm sau. <strong>Môi Trường Đô Thị Số 1 Quảng Ninh làm khác: gọi hotline 0963.953.533 lúc nào cũng có thợ, không phân biệt đêm hay ngày.</strong>' => 'Bể phốt đầy, mùi hôi xộc lên cả nhà, nhà vệ sinh không dùng được nữa là tình huống cần gọi xử lý sớm. <strong>Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận 05:00-22:00 hằng ngày, điều phối nhanh và báo rõ thời gian có mặt theo khu vực.</strong>',
            'Xe bồn sẵn sàng xuất phát trong 15 phút sau khi nhận cuộc gọi. Không thu thêm phụ phí đêm khuya, không báo giá ảo, không để bạn chờ đợi khi bể phốt đã đến giới hạn.' => 'Xe bồn được điều phối nhanh sau khi tiếp nhận. Không báo giá ảo và luôn chốt phương án xử lý trước khi làm khi bể phốt đã đến giới hạn.',
            'Nguyên nhân bể phốt đầy lúc đêm khuya không thể đợi đến sáng' => 'Nguyên nhân bể phốt đầy cần xử lý sớm',
            '<strong>Dấu hiệu bể phốt đầy cần hút ngay trong đêm:</strong>' => '<strong>Dấu hiệu bể phốt đầy cần hút sớm:</strong>',
            'Đợi đến sáng nghĩa là cả đêm sống trong môi trường có mùi độc hại và nguy cơ nước bẩn trào ngược bất cứ lúc nào.' => 'Để chậm xử lý quá lâu sẽ làm mùi hôi nặng hơn và tăng nguy cơ nước bẩn trào ngược.',
            'Thiết bị hiện đại cho dịch vụ hút bể phốt 05:00-22:00 Quảng Ninh tại Hạ Long' => 'Thiết bị hiện đại cho dịch vụ hút bể phốt Quảng Ninh tại Hạ Long',
            'Phụ phí đêm khuya (sau 22h – trước 6h)' => 'Phụ phí ngoài phạm vi triển khai chuẩn',
            '<strong>Tình huống thường gặp lúc đêm tại Bãi Cháy, Hạ Long</strong>' => '<strong>Tình huống thường gặp tại Bãi Cháy, Hạ Long</strong>',
            'Chi phí đêm khuya: bằng với giá ban ngày. Không phụ phí.' => 'Chi phí được báo theo hiện trạng và khối lượng thực tế, chốt trước khi triển khai.',
            'Phục vụ: 05:00-22:00 – không nghỉ lễ, không nghỉ Tết' => 'Tiếp nhận: 05:00-22:00 hằng ngày',
            'Hút bể phốt khẩn cấp Quảng Ninh, xe bồn tới nhanh khi bể đầy, trào mùi, ngõ sâu hoặc ca đêm. Gọi 0963.953.533 / 0931.156.756 để báo giá rõ trước khi xử lý.' => 'Hút bể phốt Quảng Ninh, điều phối nhanh khi bể đầy, trào mùi, ngõ sâu hoặc công trình cần xử lý gấp trong ngày. Gọi 0963.953.533 / 0931.156.756 để báo giá rõ trước khi xử lý.',
        ],
        2379 => [
            'Thợ thông tắc bồn cầu ban đêm tại nhà dân Hạ Long Quảng Ninh' => 'Thợ thông tắc bồn cầu tại nhà dân Hạ Long Quảng Ninh',
            'Thợ thông tắc bồn cầu ban đêm' => 'Thợ thông tắc bồn cầu',
            'thông tắc bồn cầu ban đêm Quảng Ninh' => 'thông tắc bồn cầu Quảng Ninh',
            'Thông tắc bồn cầu ban đêm Quảng Ninh' => 'Thông tắc bồn cầu Quảng Ninh',
            '"keywords":"thông tắc bồn cầu ban đêm Quảng Ninh"' => '"keywords":"thông tắc bồn cầu Quảng Ninh"',
            '"description":"Thông tắc bồn cầu ban đêm Quảng Ninh – thợ trực đêm, có mặt 15–30 phút, xử lý nghẹt, trào ngược lúc nửa đêm, không phụ thu thêm. Gọi 0963.953.533."' => '"description":"Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533."',
            '"description":"Thông tắc bồn cầu Quảng Ninh – thợ trực đêm, có mặt 15–30 phút, xử lý nghẹt, trào ngược lúc nửa đêm, không phụ thu thêm. Gọi 0963.953.533."' => '"description":"Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533."',
            'Thông tắc bồn cầu ban đêm Quảng Ninh – thợ trực đêm, có mặt 15–30 phút, xử lý nghẹt, trào ngược lúc nửa đêm, không phụ thu thêm. Gọi 0963.953.533.' => 'Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533.',
            'Thông tắc bồn cầu Quảng Ninh – thợ trực đêm, có mặt 15–30 phút, xử lý nghẹt, trào ngược lúc nửa đêm, không phụ thu thêm. Gọi 0963.953.533.' => 'Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533.',
            'Giờ làm việc: <strong>05:00-22:00 – kể cả ngoài khung triển khai chuẩn, cuối tuần, ngày lễ</strong>' => 'Giờ làm việc: <strong>05:00-22:00 hằng ngày</strong>',
        ],
        2417 => [
            'Nhân viên trực đêm báo 4 phòng tầng 3 và tầng 4 cùng bồn cầu rút chậm từ đêm, sáng sớm bắt đầu có mùi từ hành lang.' => 'Nhân viên báo 4 phòng tầng 3 và tầng 4 cùng bồn cầu rút chậm, sáng sớm bắt đầu có mùi từ hành lang.',
            'Được. Môi Trường Đô Thị Số 1 Quảng Ninh làm việc 05:00-22:00, kể cả đêm khuya, ngày lễ và Tết Nguyên Đán. Ca đêm từ 22h–6h có phụ thu 30% – thông báo rõ khi nhận cuộc gọi, không ẩn phí. Gọi <strong>0963.953.533</strong> bất kỳ giờ nào, có thợ trực nhận ca ngay.' => 'Được. Môi Trường Đô Thị Số 1 Quảng Ninh làm việc 05:00-22:00 hằng ngày. Gọi <strong>0963.953.533</strong> trong khung này để được điều phối nhanh và báo rõ thời gian có mặt.',
        ],
        2702 => [
            '"description":"Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh 24/7. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe."' => '"description":"Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe."',
            'Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh 24/7. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe.' => 'Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe.',
            '&quot;openingHours&quot;: &quot;Mo-Su 00:00-24:00&quot;' => '&quot;openingHours&quot;: &quot;Mo-Su 05:00-22:00&quot;',
            'Dịch vụ hút bể phốt khách sạn có làm ban đêm không?' => 'Dịch vụ hút bể phốt khách sạn có điều phối nhanh không?',
            'Có. tiếp nhận 05:00-22:00 hằng ngày. Phụ phí ca đêm (22h–6h) là 200.000đ, thông báo trước khi xe xuất phát.' => 'Có. tiếp nhận 05:00-22:00 hằng ngày và báo rõ phương án xử lý trước khi xe xuất phát.',
            'phục vụ nhanh ngày lễ' => 'điều phối linh hoạt trong ngày',
        ],
        2782 => [
            'Thông tắc cống 05:00-22:00' => 'Thông tắc cống khẩn cấp',
            'Thông Tắc Cống 05:00-22:00' => 'Thông Tắc Cống Khẩn Cấp',
            'Thông tắc cống Quảng Ninh – thợ trực đêm, cuối tuần. Gọi là có mặt trong 15 phút, máy chuyên dụng, không đục phá khi chưa cần. Gọi 0963. 953. 533.' => 'Thông tắc cống Quảng Ninh – điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nước trào, mùi hôi và cống nghẹt nặng. Gọi 0963. 953. 533.',
            'Thông tắc cống Quảng Ninh – thợ trực đêm, cuối tuần. Gọi là có mặt trong 15 phút, máy chuyên dụng, không đục phá khi chưa cần. Gọi 0963.953.533.' => 'Thông tắc cống Quảng Ninh – điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nước trào, mùi hôi và cống nghẹt nặng. Gọi 0963.953.533.',
            '<strong>Dịch vụ thông tắc cống khẩn cấp</strong> là đội kỹ thuật trực liên tục cả ngày nghỉ, ngày lễ, nửa đêm — không phân biệt giờ giấc. Khi nhận cuộc gọi, thợ xuất phát ngay, không phải đặt lịch hẹn sáng hôm sau.' => '<strong>Dịch vụ thông tắc cống khẩn cấp</strong> tại đây tập trung xử lý ca nước trào, mùi hôi và tắc nặng trong khung 05:00-22:00 hằng ngày, ưu tiên điều phối nhanh và báo giá rõ ngay từ đầu.',
            '<li><strong>05:00-22:00 thật sự</strong> — không phải &#8220;05:00-22:00 có nhận tin nhắn&#8221;. Thợ xuất phát ngay khi nhận cuộc gọi.</li>' => '<li><strong>Tiếp nhận 05:00-22:00 hằng ngày</strong> — tổng đài chốt tình trạng, điều phối thợ và xác nhận thời gian có mặt rõ ràng theo khu vực.</li>',
            'Không. Giá thông tắc cống tại Môi Trường Đô Thị Số 1 Quảng Ninh áp dụng đồng nhất 05:00-22:00, không phân biệt giờ hành chính hay ngoài giờ, ngày thường hay ngày lễ. Giá được báo trước khi làm và không có phụ phí phát sinh.' => 'Giá thông tắc cống được báo trước khi làm trong khung tiếp nhận 05:00-22:00 hằng ngày, không tự ý cộng thêm chi phí khi chưa thống nhất với khách.',
            '"serviceType":"Thông tắc cống 05:00-22:00"' => '"serviceType":"Thông tắc cống khẩn cấp"',
            '"description":"Dịch vụ thông tắc cống khẩn cấp tại Quảng Ninh, xử lý nước trào, mùi hôi, cống nghẹt ban đêm, báo giá rõ trước khi làm."' => '"description":"Dịch vụ thông tắc cống khẩn cấp tại Quảng Ninh, xử lý nước trào, mùi hôi và cống nghẹt nặng, báo giá rõ trước khi làm."',
            'Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống 05:00-22:00 Quảng Ninh tại Quảng Ninh' => 'Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống Quảng Ninh tại hiện trường',
            'Kết quả thực tế sau khi xử lý thông tắc cống 05:00-22:00 Quảng Ninh – Quảng Ninh 2026' => 'Kết quả thực tế sau khi xử lý thông tắc cống Quảng Ninh năm 2026',
            'Gọi ngay <strong>0963.953.533</strong> — đường dây trực cả đêm lẫn ngày.' => 'Gọi ngay <strong>0963.953.533</strong> trong khung 05:00-22:00 để được điều phối nhanh và báo rõ thời gian có mặt.',
            '<strong>Dịch vụ thông tắc cống 05:00-22:00</strong> là đội kỹ thuật trực liên tục cả ngày nghỉ, ngày lễ, nửa đêm — không phân biệt giờ giấc. Khi nhận cuộc gọi, thợ xuất phát ngay, không phải đặt lịch hẹn sáng hôm sau.' => '<strong>Dịch vụ thông tắc cống khẩn cấp</strong> tại đây tập trung xử lý ca nước trào, mùi hôi và tắc nặng trong khung 05:00-22:00 hằng ngày, ưu tiên điều phối nhanh và báo giá rõ ngay từ đầu.',
            'Giá niêm yết, không thêm phụ phí đêm khuya hay ngày lễ.' => 'Giá niêm yết, báo rõ trước khi làm và không tự ý cộng thêm chi phí khi chưa thống nhất với khách.',
            'Máy lò xo xử lý cống nghẹt 05:00-22:00 tại Quảng Ninh, hạn chế đục phá nền nhà.' => 'Máy lò xo xử lý cống nghẹt tại Quảng Ninh, hạn chế đục phá nền nhà.',
            '<strong>Ca đêm tại khu dân cư Hà Khánh, Hạ Long (tháng 3/2026)</strong>' => '<strong>Ca xử lý tại khu dân cư Hà Khánh, Hạ Long (tháng 3/2026)</strong>',
            '<strong>Ca khẩn cấp tại nhà hàng hải sản đường Hạ Long, Bãi Cháy (tháng 4/2026)</strong>' => '<strong>Ca xử lý tại nhà hàng hải sản đường Hạ Long, Bãi Cháy (tháng 4/2026)</strong>',
            '<strong>Cống tắc đêm khuya? Gọi ngay 0963.953.533 — thợ xuất phát trong vài phút. Hoặc nhắn Zalo 0963.953.533 nếu không tiện gọi lớn tiếng.</strong> Không cần đặt lịch, không cần chờ đến sáng.' => '<strong>Cống tắc cần xử lý gấp?</strong> Gọi ngay 0963.953.533 trong khung 05:00-22:00 hoặc nhắn Zalo 0963.953.533 để được điều phối nhanh và chốt phương án xử lý.',
            'Không phải ca tắc nào cũng cần gọi thợ giữa đêm.' => 'Không phải ca tắc nào cũng cần gọi thợ ngay lập tức.',
            '<strong>Đêm khuya gọi thông cống có phụ phí không?</strong>' => '<strong>Gọi thông cống có phụ phí ngoài báo giá không?</strong>',
            '"description":"Dịch vụ thông tắc cống 05:00-22:00 tại Quảng Ninh, xử lý nước trào, mùi hôi, cống nghẹt ban đêm, báo giá rõ trước khi làm."' => '"description":"Dịch vụ thông tắc cống tại Quảng Ninh, xử lý nước trào, mùi hôi và cống nghẹt nặng, báo giá rõ trước khi làm."',
        ],
    ];
}

function ttcqn_meta_desc_rewrite_public_html(string $html): string
{
    $html = str_replace(
        'cách chọn thợ đáng tin 24/7.',
        'cách chọn thợ đáng tin.',
        $html
    );

    $post_id = ttcqn_meta_desc_target_post_id();
    if ($post_id <= 0) {
        return $html;
    }

    $maps = ttcqn_meta_desc_html_replacements();
    if (!isset($maps[$post_id])) {
        return $html;
    }

    return str_replace(array_keys($maps[$post_id]), array_values($maps[$post_id]), $html);
}

add_action('template_redirect', function (): void {
    if (!ttcqn_meta_desc_is_frontend_singular()) {
        return;
    }

    ob_start('ttcqn_meta_desc_rewrite_public_html');
}, -2600);
