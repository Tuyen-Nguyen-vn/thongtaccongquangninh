#!/usr/bin/env python3
import os
import sys
import json
import argparse
from pathlib import Path

# Thử import thư viện google-ads
try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    GOOGLE_ADS_LIB_AVAILABLE = True
except ImportError:
    GOOGLE_ADS_LIB_AVAILABLE = False


def load_config(config_path):
    """Đọc file cấu hình JSON."""
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_config(config):
    """Kiểm tra cấu hình hợp lệ."""
    print("[INFO] Đang kiểm tra cấu hình...")
    assert "campaign" in config, "Thiếu cấu hình 'campaign'"
    assert "ad_groups" in config, "Thiếu cấu hình 'ad_groups'"
    
    camp = config["campaign"]
    assert "name" in camp, "Thiếu campaign name"
    assert "daily_budget_micros" in camp, "Thiếu campaign budget"
    
    for ag in config["ad_groups"]:
        assert "name" in ag, "Thiếu ad_group name"
        assert "keywords" in ag, f"Thiếu keywords trong nhóm {ag.get('name')}"
        assert "ads" in ag, f"Thiếu ads trong nhóm {ag.get('name')}"
        
    print("[OK] File cấu hình hợp lệ!")


def dry_run_simulation(config):
    """Mô phỏng quá trình tạo chiến dịch khi không có API credentials."""
    print("\n" + "="*50)
    print("MÔ PHỎNG TẠO CHIẾN DỊCH GOOGLE ADS (DRY-RUN MODE)")
    print("="*50)
    
    camp = config["campaign"]
    budget_vnd = camp["daily_budget_micros"] / 1_000_000
    print(f"\n1. Tạo ngân sách chiến dịch (Campaign Budget):")
    print(f"   - Tên: Ngân sách cho {camp['name']}")
    print(f"   - Số tiền: {budget_vnd:,.0f} VND/ngày")
    
    print(f"\n2. Tạo chiến dịch tìm kiếm (Search Campaign):")
    print(f"   - Tên chiến dịch: {camp['name']}")
    print(f"   - Trạng thái: {camp['status']}")
    print(f"   - Mạng quảng cáo: Google Search Network")
    print(f"   - Địa điểm nhắm mục tiêu (Include): {', '.join(camp['geo_targets']['include_names'])}")
    print(f"   - Địa điểm loại trừ (Exclude): {', '.join(camp['geo_targets']['exclude_names'])}")
    print(f"   - Ngôn ngữ: {', '.join(camp['languages'])}")
    
    print(f"\n3. Tạo từ khóa phủ định cấp chiến dịch (Campaign Negative Keywords):")
    print(f"   - Tổng số từ phủ định: {len(config['negative_keywords'])} từ")
    print(f"   - Danh sách: {', '.join(config['negative_keywords'][:10])} ...")

    for i, ag in enumerate(config["ad_groups"], 1):
        print(f"\n4.{i}. Tạo nhóm quảng cáo: {ag['name']}")
        cpc_vnd = ag['cpc_bid_micros'] / 1_000_000
        print(f"   - Giá thầu mặc định (CPC): {cpc_vnd:,.0f} VND")
        
        print(f"   - Danh sách từ khóa ({len(ag['keywords'])} từ):")
        for kw in ag["keywords"]:
            match_style = f"[{kw['text']}]" if kw["match_type"] == "EXACT" else f"\"{kw['text']}\""
            print(f"     * {match_style}")
            
        print(f"   - Mẫu quảng cáo RSA ({len(ag['ads'])} mẫu):")
        for ad in ag["ads"]:
            print(f"     * Final URL: {ad['final_urls'][0]}")
            print(f"     * Tiêu đề (Headlines):")
            for hl in ad["headlines"][:5]:
                pin = f" (Pinned: {hl['pinned_field']})" if "pinned_field" in hl else ""
                print(f"       - {hl['text']}{pin}")
            print(f"       - ... (Tổng cộng {len(ad['headlines'])} tiêu đề)")
            print(f"     * Mô tả (Descriptions):")
            for desc in ad["descriptions"]:
                print(f"       - {desc['text']}")
                
    print("\n" + "="*50)
    print("MÔ PHỎNG HOÀN THÀNH - SẴN SÀNG ĐỂ ĐẨY LÊN LIVE KHI CÓ API KEY")
    print("="*50 + "\n")


def create_google_ads_objects(client, customer_id, config):
    """Thực thi gọi API Google Ads để tạo chiến dịch thực tế."""
    # Lấy các services cần thiết
    campaign_budget_service = client.get_service("CampaignBudgetService")
    campaign_service = client.get_service("CampaignService")
    campaign_criterion_service = client.get_service("CampaignCriterionService")
    ad_group_service = client.get_service("AdGroupService")
    ad_group_criterion_service = client.get_service("AdGroupCriterionService")
    ad_group_ad_service = client.get_service("AdGroupAdService")
    
    camp_data = config["campaign"]
    
    # 1. Tạo ngân sách (Campaign Budget)
    print("[API] Đang tạo ngân sách chiến dịch...")
    budget_operation = client.get_type("CampaignBudgetOperation")
    budget = budget_operation.create
    budget.name = f"Ngân sách {camp_data['name']}"
    budget.amount_micros = camp_data["daily_budget_micros"]
    budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD
    # Đặt loại thầu là MANUAL_CPC nên ngân sách không được là shared
    budget.explicitly_shared = False
    
    budget_response = campaign_budget_service.mutate_campaign_budgets(
        customer_id=customer_id, operations=[budget_operation]
    )
    budget_resource_name = budget_response.results[0].resource_name
    print(f"[API] Đã tạo ngân sách thành công: {budget_resource_name}")
    
    # 2. Tạo chiến dịch (Campaign)
    print("[API] Đang tạo chiến dịch mạng tìm kiếm...")
    campaign_operation = client.get_type("CampaignOperation")
    campaign = campaign_operation.create
    campaign.name = camp_data["name"]
    campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
    campaign.status = client.enums.CampaignStatusEnum.PAUSED
    campaign.campaign_budget = budget_resource_name
    
    # Sử dụng CPC thủ công (Manual CPC) để phòng click ảo giai đoạn đầu
    campaign.manual_cpc.enhanced_cpc_enabled = False
    
    # Cấu hình mạng hiển thị
    campaign.network_settings.target_google_search = True
    campaign.network_settings.target_search_network = True
    campaign.network_settings.target_content_network = False
    campaign.network_settings.target_partner_search_network = False
    
    campaign_response = campaign_service.mutate_campaigns(
        customer_id=customer_id, operations=[campaign_operation]
    )
    campaign_resource_name = campaign_response.results[0].resource_name
    print(f"[API] Đã tạo chiến dịch thành công: {campaign_resource_name}")
    
    # 3. Tạo tiêu chí nhắm ngôn ngữ (Language target)
    print("[API] Đang thiết lập ngôn ngữ Tiếng Việt...")
    for lang in camp_data["languages"]:
        if lang == "vi":
            lang_id = "1056" # Mã ngôn ngữ Tiếng Việt trong Google Ads
            criterion_operation = client.get_type("CampaignCriterionOperation")
            criterion = criterion_operation.create
            criterion.campaign = campaign_resource_name
            criterion.language.language_constant = f"languageConstants/{lang_id}"
            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=customer_id, operations=[criterion_operation]
            )
            
    # 4. Thêm từ khóa phủ định cấp chiến dịch (Campaign Negative Keywords)
    print("[API] Đang đẩy từ khóa phủ định lên chiến dịch...")
    negative_operations = []
    for neg_word in config["negative_keywords"]:
        neg_operation = client.get_type("CampaignCriterionOperation")
        neg_criterion = neg_operation.create
        neg_criterion.campaign = campaign_resource_name
        neg_criterion.negative = True
        neg_criterion.keyword.text = neg_word
        neg_criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
        negative_operations.append(neg_operation)
        
    if negative_operations:
        # Gửi theo batch
        campaign_criterion_service.mutate_campaign_criteria(
            customer_id=customer_id, operations=negative_operations
        )
        print(f"[API] Đã thêm {len(negative_operations)} từ khóa phủ định cấp chiến dịch.")
        
    # 5. Tạo nhóm quảng cáo & Từ khóa & Ad Copy
    for ad_group_data in config["ad_groups"]:
        print(f"\n[API] Đang tạo nhóm quảng cáo: {ad_group_data['name']}...")
        ad_group_operation = client.get_type("AdGroupOperation")
        ad_group = ad_group_operation.create
        ad_group.name = ad_group_data["name"]
        ad_group.campaign = campaign_resource_name
        ad_group.status = client.enums.AdGroupStatusEnum.ENABLED
        ad_group.type = client.enums.AdGroupTypeEnum.SEARCH_STANDARD
        ad_group.cpc_bid_micros = ad_group_data["cpc_bid_micros"]
        
        ad_group_response = ad_group_service.mutate_ad_groups(
            customer_id=customer_id, operations=[ad_group_operation]
        )
        ad_group_resource_name = ad_group_response.results[0].resource_name
        print(f"[API] Đã tạo nhóm quảng cáo thành công: {ad_group_resource_name}")
        
        # 5a. Thêm từ khóa vào nhóm (Keywords)
        print(f"[API] Đang thêm từ khóa cho nhóm {ad_group_data['name']}...")
        keyword_operations = []
        for kw in ad_group_data["keywords"]:
            kw_operation = client.get_type("AdGroupCriterionOperation")
            kw_criterion = kw_operation.create
            kw_criterion.ad_group = ad_group_resource_name
            kw_criterion.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
            kw_criterion.keyword.text = kw["text"]
            
            if kw["match_type"] == "EXACT":
                kw_criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.EXACT
            elif kw["match_type"] == "PHRASE":
                kw_criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
            else:
                kw_criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
                
            keyword_operations.append(kw_operation)
            
        if keyword_operations:
            ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=customer_id, operations=keyword_operations
            )
            print(f"[API] Đã thêm {len(keyword_operations)} từ khóa vào nhóm.")
            
        # 5b. Thêm mẫu Responsive Search Ad (RSA)
        print(f"[API] Đang tạo mẫu quảng cáo RSA cho nhóm {ad_group_data['name']}...")
        for ad_data in ad_group_data["ads"]:
            ad_group_ad_operation = client.get_type("AdGroupAdOperation")
            ad_group_ad = ad_group_ad_operation.create
            ad_group_ad.ad_group = ad_group_resource_name
            ad_group_ad.status = client.enums.AdGroupAdStatusEnum.ENABLED
            
            # Cấu hình ad detail
            ad = ad_group_ad.ad
            ad.final_urls.extend(ad_data["final_urls"])
            
            # Thêm tiêu đề
            for hl_data in ad_data["headlines"]:
                headline = client.get_type("AdTextAsset")
                headline.text = hl_data["text"]
                
                # Cấu hình pin nếu có
                if "pinned_field" in hl_data:
                    pin_val = hl_data["pinned_field"]
                    if pin_val == "HEADLINE_1":
                        headline.pinned_field = client.enums.ServedAssetPositionEnum.HEADLINE_1
                    elif pin_val == "HEADLINE_2":
                        headline.pinned_field = client.enums.ServedAssetPositionEnum.HEADLINE_2
                    elif pin_val == "HEADLINE_3":
                        headline.pinned_field = client.enums.ServedAssetPositionEnum.HEADLINE_3
                        
                ad.headlines.append(headline)
                
            # Thêm mô tả
            for desc_data in ad_data["descriptions"]:
                description = client.get_type("AdTextAsset")
                description.text = desc_data["text"]
                ad.descriptions.append(description)
                
            # Tạo ad
            ad_group_ad_service.mutate_ad_group_ads(
                customer_id=customer_id, operations=[ad_group_ad_operation]
            )
            print(f"[API] Đã tạo thành công mẫu quảng cáo RSA.")


def main():
    parser = argparse.ArgumentParser(description="Tạo chiến dịch Google Ads từ file cấu hình JSON.")
    parser.add_argument(
        "--config", 
        default="google_ads_campaign_config.json", 
        help="Đường dẫn đến file cấu hình JSON."
    )
    parser.add_argument(
        "--customer-id", 
        help="ID khách hàng Google Ads (không chứa dấu gạch ngang, ví dụ: 8272300684)."
    )
    parser.add_argument(
        "--ads-config", 
        default="secrets/google-ads.yaml", 
        help="Đường dẫn đến file credentials google-ads.yaml."
    )
    parser.add_argument(
        "--dry-run", 
        action="store_true", 
        help="Chạy mô phỏng không thực hiện gọi API Google Ads thực sự."
    )
    
    args = parser.parse_args()
    
    # 1. Đọc và kiểm tra cấu hình
    if not os.path.exists(args.config):
        print(f"[ERROR] File cấu hình '{args.config}' không tồn tại.")
        sys.exit(1)
        
    config = load_config(args.config)
    validate_config(config)
    
    # 2. Kiểm tra chế độ chạy
    is_dry_run = args.dry_run
    
    if not is_dry_run:
        # Nếu thư viện không khả dụng hoặc file credentials không có -> tự chuyển sang dry-run
        if not GOOGLE_ADS_LIB_AVAILABLE:
            print("[WARN] Thư viện 'google-ads' không được cài đặt trong môi trường Python. Tự động chuyển sang chế độ DRY-RUN.")
            is_dry_run = True
        elif not os.path.exists(args.ads_config):
            print(f"[WARN] File credentials '{args.ads_config}' không tồn tại. Tự động chuyển sang chế độ DRY-RUN.")
            is_dry_run = True
        elif not args.customer_id:
            print("[WARN] Thiếu tham số --customer-id. Tự động chuyển sang chế độ DRY-RUN.")
            is_dry_run = True

    # 3. Thực thi
    if is_dry_run:
        dry_run_simulation(config)
    else:
        print(f"[INFO] Bắt đầu gọi API đẩy chiến dịch lên ID Khách Hàng: {args.customer_id}...")
        try:
            client = GoogleAdsClient.load_from_storage(args.ads_config)
            create_google_ads_objects(client, args.customer_id, config)
            print("\n[SUCCESS] Đã tạo chiến dịch quảng cáo thành công trên tài khoản Google Ads!")
        except GoogleAdsException as ex:
            print(f"\n[ERROR] Lỗi API Google Ads: {ex.error.message}")
            for error in ex.failure.errors:
                print(f"   - Chi tiết: {error.message}")
            sys.exit(1)
        except Exception as e:
            print(f"\n[ERROR] Đã xảy ra lỗi không mong muốn: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
