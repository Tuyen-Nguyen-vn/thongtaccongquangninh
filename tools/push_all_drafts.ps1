# Push tat ca drafts len WordPress
# Chay tren PowerShell (Windows)

$ErrorActionPreference = "Stop"

$WP_URL = "https://thongtaccongquangninh.com/wp-json/wp/v2"
$USER = "admin2"
$PASS = "DCcL f1Yh 4fzR svc9 7x39 OFih"
$BASE = "D:\.thongtaccongquangninh"
$DRAFTS = @(
    # Root drafts
    "content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md",
    "content-drafts\thong-tac-cong-cao-xanh-rankmath-draft.md",
    "content-drafts\thong-tac-cong-gieng-day-ha-long-rankmath-draft.md",
    "content-drafts\thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md",
    "content-drafts\trang-faq-tong-hop-thong-tac-cong-rankmath-draft.md",
    # Hut be phot
    "content-drafts\hut-be-phot\hut-be-phot-bai-chay-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-cam-pha-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-dong-trieu-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-ha-long-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-hoanh-bo-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-mong-cai-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-quang-ninh-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-quang-yen-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-uong-bi-rankmath-90.md",
    "content-drafts\hut-be-phot\hut-be-phot-van-don-rankmath-90.md",
    # Thong tac cong
    "content-drafts\thong-tac-cong\thong-tac-cong-cam-pha-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-chung-cu-ha-long-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-dong-trieu-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-ha-long-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-mong-cai-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-ngo-nho-ha-long-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-nha-hang-ha-long-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-quang-ninh-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-quang-yen-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-uong-bi-rankmath-90.md",
    "content-drafts\thong-tac-cong\thong-tac-cong-van-don-rankmath-90.md",
    # Landing thong tac bon cau
    "content-drafts\landing-cam-pha-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-dong-trieu-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-ha-long-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-mong-cai-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-quang-ninh-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-quang-yen-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-uong-bi-thong-tac-bon-cau-rankmath-90.md",
    "content-drafts\landing-van-don-thong-tac-bon-cau-rankmath-90.md",
    # Remaining
    "content-drafts\remaining\bang-gia-hut-be-phot-quang-ninh-2026-rankmath-90.md",
    "content-drafts\remaining\bang-gia-rankmath-90.md",
    "content-drafts\remaining\blog-rankmath-90.md",
    "content-drafts\remaining\cach-xu-ly-cong-thoat-nuoc-tac-rankmath-90.md",
    "content-drafts\remaining\chinh-sach-bao-hanh-rankmath-90.md",
    "content-drafts\remaining\chinh-sach-bao-mat-rankmath-90.md",
    "content-drafts\remaining\dau-hieu-be-phot-can-hut-rankmath-90.md",
    "content-drafts\remaining\gia-thong-tac-cong-ha-long-rankmath-90.md",
    "content-drafts\remaining\gioi-thieu-rankmath-90.md",
    "content-drafts\remaining\hut-be-phot-ha-long-xe-hut-24-7-rankmath-90.md",
    "content-drafts\remaining\lien-he-rankmath-90.md",
    "content-drafts\remaining\nao-vet-ho-ga-quang-ninh-rankmath-90.md",
    "content-drafts\remaining\nguyen-nhan-cong-tac-thuong-xuyen-ha-long-rankmath-90.md",
    "content-drafts\remaining\thong-tac-chau-rua-quang-ninh-rankmath-90.md",
    "content-drafts\remaining\thong-tac-cong-ha-long-ban-dem-rankmath-90.md",
    "content-drafts\remaining\thong-tac-cong-hong-gai-ha-long-rankmath-90.md",
    "content-drafts\remaining\thong-tac-toilet-quang-ninh-rankmath-90.md",
    "content-drafts\remaining\trang-chu-rankmath-90.md",
    "content-drafts\remaining\xu-ly-mui-hoi-quang-ninh-rankmath-90.md"
)

$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${USER}:${PASS}"))
$headers = @{
    "Authorization" = "Basic $auth"
    "Content-Type"  = "application/json"
}

$ok = 0
$fail = 0

foreach ($rel in $DRAFTS) {
    $fp = Join-Path $BASE $rel
    $name = Split-Path $rel -Leaf
    
    Write-Host "`n[$($ok+$fail+1)/$($DRAFTS.Count)] $name" -ForegroundColor Cyan
    
    # Doc file
    $md = Get-Content $fp -Raw -Encoding UTF8
    
    # Parse meta
    $meta = @{}
    $body = ""
    $lines = $md -split "`n"
    $inBody = $false
    foreach ($line in $lines) {
        if (-not $inBody -and $line.Trim() -eq "") {
            $inBody = $true
            continue
        }
        if (-not $inBody -and $line -match "^([^#:]+):\s*(.+)$") {
            $meta[$matches[1].Trim().ToLower()] = $matches[2].Trim()
        } else {
            $inBody = $true
        }
    }
    
    $title = if ($meta.ContainsKey("meta title")) { $meta["meta title"] } else { $name }
    $slug = if ($meta.ContainsKey("slug")) { $meta["slug"] } else { "" }
    $kw = if ($meta.ContainsKey("focus keyword")) { $meta["focus keyword"] } else { "" }
    $excerpt = if ($meta.ContainsKey("meta description")) { $meta["meta description"] } else { "" }
    
    # Convert simple markdown to HTML
    $html = @()
    $inList = $false
    $i = 0
    while ($i -lt $lines.Length) {
        $s = $lines[$i].Trim()
        if ($s -eq "") { $i++; continue }
        
        # Image
        if ($s -match '^!\[([^\]]*)\]\(([^)]+)\)') {
            $alt = $matches[1]; $src = $matches[2]
            $cap = ""
            if ($i+1 -lt $lines.Length) {
                $ns = $lines[$i+1].Trim()
                if ($ns -match '^\*(.+)\*$' -and $ns -notmatch '^\*\*') {
                    $cap = $matches[1]; $i++
                }
            }
            $html += "<p><img src=`"$src`" alt=`"$alt`" /></p>"
            if ($cap) { $html += "<p><em>$cap</em></p>" }
            $i++; continue
        }
        
        # Headers
        if ($s -match '^### (.+)$') { $html += "<h3>$($matches[1])</h3>"; $i++; continue }
        if ($s -match '^## (.+)$') { $html += "<h2>$($matches[1])</h2>"; $i++; continue }
        if ($s -match '^# (.+)$') { 
            if (-not $title -or $title -eq "") { $title = $matches[1] }
            $html += "<h1>$($matches[1])</h1>"; $i++; continue 
        }
        
        # List
        if ($s -match '^- (.+)$' -or $s -match '^\* (.+)$') {
            if (-not $inList) { $html += "<ul>"; $inList = $true }
            $html += "<li>$($matches[1])</li>"
            $i++; continue
        } elseif ($inList) { $html += "</ul>"; $inList = $false }
        
        # Bold + links
        $processed = $s -replace '\*\*([^*]+)\*\*', '<strong>$1</strong>'
        $processed = $processed -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>'
        $html += "<p>$processed</p>"
        $i++
    }
    if ($inList) { $html += "</ul>" }
    
    $content = $html -join "`n"
    
    # Call WordPress REST API
    $bodyData = @{
        title = $title
        content = $content
        slug = $slug
        status = "publish"
    }
    if ($excerpt) { $bodyData.excerpt = $excerpt }
    
    try {
        $resp = Invoke-RestMethod -Uri "$WP_URL/posts" -Method Post -Headers $headers -Body ($bodyData | ConvertTo-Json -Depth 10) -ContentType "application/json"
        Write-Host "  OK ID=$($resp.id) $($resp.link)" -ForegroundColor Green
        
        # Set Rank Math keyword
        if ($kw) {
            $metaBody = @{ meta = @{ rank_math_focus_keyword = $kw } }
            Invoke-RestMethod -Uri "$WP_URL/posts/$($resp.id)" -Method Post -Headers $headers -Body ($metaBody | ConvertTo-Json -Depth 10) -ContentType "application/json" | Out-Null
            Write-Host "     RankMath: $kw" -ForegroundColor Gray
        }
        $ok++
    } catch {
        Write-Host "  FAIL: $_" -ForegroundColor Red
        $fail++
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "KET QUA: OK=$ok | FAIL=$fail" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
