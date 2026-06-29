import json
import csv

def main():
    # Load config
    with open("google_ads_campaign_config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    camp = config["campaign"]
    budget = camp["daily_budget_micros"] / 1_000_000

    # 1. Export Campaign Settings
    campaign_file = "google_ads_campaign_import.csv"
    with open(campaign_file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Campaign", 
            "Campaign Daily Budget", 
            "Campaign Type", 
            "Campaign Status"
        ])
        writer.writerow([
            camp["name"],
            budget,
            "Search",
            "Paused"
        ])

    # 2. Export Ad Group Keywords
    keywords_file = "google_ads_keywords_import.csv"
    with open(keywords_file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Campaign", 
            "Ad Group", 
            "Max CPC", 
            "Keyword", 
            "Criterion Type", 
            "Keyword Status"
        ])
        
        for ag in config["ad_groups"]:
            cpc = ag["cpc_bid_micros"] / 1_000_000
            for kw in ag["keywords"]:
                writer.writerow([
                    camp["name"],
                    ag["name"],
                    cpc,
                    kw["text"],
                    kw["match_type"].title(),  # Exact, Phrase
                    "Enabled"
                ])

    # 3. Export Campaign Negative Keywords
    negatives_file = "google_ads_campaign_negatives_import.csv"
    with open(negatives_file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Campaign", 
            "Keyword", 
            "Criterion Type"
        ])
        
        for neg in config["negative_keywords"]:
            writer.writerow([
                camp["name"],
                neg,
                "Broad"  # Negative keywords are imported as Broad match negatives by default
            ])

    # 4. Export Ads (Responsive Search Ads - RSA)
    ads_file = "google_ads_ads_import.csv"
    with open(ads_file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        
        # Headers for Google Ads Editor (Responsive Search Ads)
        headers = ["Campaign", "Ad Group", "Final URL"]
        for i in range(1, 16):
            headers.append(f"Headline {i}")
            headers.append(f"Headline {i} position")
        for i in range(1, 5):
            headers.append(f"Description {i}")
            
        writer.writerow(headers)
        
        for ag in config["ad_groups"]:
            for ad in ag["ads"]:
                row = [camp["name"], ag["name"], ad["final_urls"][0]]
                
                # Headlines & Pinning
                hl_list = ad["headlines"]
                for i in range(15):
                    if i < len(hl_list):
                        hl = hl_list[i]
                        row.append(hl["text"])
                        
                        pin = hl.get("pinned_field", "")
                        if pin == "HEADLINE_1":
                            row.append("Headline 1")
                        elif pin == "HEADLINE_2":
                            row.append("Headline 2")
                        elif pin == "HEADLINE_3":
                            row.append("Headline 3")
                        else:
                            row.append("")
                    else:
                        row.append("")
                        row.append("")
                        
                # Descriptions
                desc_list = ad["descriptions"]
                for i in range(4):
                    if i < len(desc_list):
                        row.append(desc_list[i]["text"])
                    else:
                        row.append("")
                        
                writer.writerow(row)

    print("Success: Generated 4 campaign CSV files.")

if __name__ == "__main__":
    main()
