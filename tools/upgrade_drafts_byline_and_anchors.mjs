import fs from 'fs';
import path from 'path';

// Helper to convert Vietnamese string to clean lowercase slug without diacritics
function toSlug(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/[^a-z0-9\s-]/g, ""); // Remove special characters
    str = str.replace(/\s+/g, "-"); // Replace spaces with hyphens
    str = str.replace(/-+/g, "-"); // Remove duplicate hyphens
    return str.trim().replace(/^-+|-+$/g, ""); // Trim starting/ending hyphens
}

// Find all .md files in a directory recursively
function getMarkdownFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getMarkdownFiles(filePath));
        } else if (filePath.endsWith('.md')) {
            results.push(filePath);
        }
    });
    return results;
}

// Main logic to upgrade a single draft file
function upgradeDraft(filePath) {
    console.log(`Processing file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // CURRENT TIME METADATA
    const now = new Date();
    // Time formatted as ISO 8601 with +07:00 timezone
    // E.g., 2026-05-23T02:50:00+07:00
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const currentISODate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
    const currentDisplayDate = `${day}/${month}/${year}`;
    
    const bylineText = `*Cập nhật mới nhất ngày: ${currentDisplayDate} bởi Ban biên tập Môi Trường Đô Thị Số 1 Quảng Ninh*`;

    // 1. INSERT VISIBLE BYLINE DATE UNDER H1
    const h1Regex = /^(#\s+.+)$/m;
    const h1Match = content.match(h1Regex);
    if (h1Match) {
        const h1Line = h1Match[1];
        // Check if byline already exists in the file to avoid duplicates
        if (!content.includes('Ban biên tập Môi Trường Đô Thị Số 1 Quảng Ninh')) {
            // Find the position of H1 line and insert byline below it
            const h1Index = content.indexOf(h1Line);
            const afterH1Index = h1Index + h1Line.length;
            
            // Insert byline text with double linebreaks
            content = content.slice(0, afterH1Index) + `\n\n${bylineText}` + content.slice(afterH1Index);
            console.log(`  -> Inserted visible Byline Date.`);
            hasChanges = true;
        }
    }

    // 2. AUTO-GENERATE ANCHOR ID FOR H2 HEADERS
    // Matches "## Content" or "## Content {#existing-id}"
    const h2Regex = /^(##\s+)(.+)$/gm;
    let newContent = content;
    let match;
    
    // We will do replacement using split/replace logic to avoid index issues with global regex replacement
    const lines = content.split('\n');
    let h2Updated = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('## ') && !line.startsWith('###')) {
            // Check if it already has <a id="..."></a>
            if (!line.includes('<a id="')) {
                // Check if it has the markdown custom ID block at the end like "## Title {#some-id}"
                const customIdMatch = line.match(/^##\s+(.+?)\s*\{\s*#([a-zA-Z0-9-]+)\s*\}$/);
                let titleText = '';
                let slugId = '';
                
                if (customIdMatch) {
                    titleText = customIdMatch[1].trim();
                    slugId = customIdMatch[2].trim();
                } else {
                    titleText = line.replace(/^##\s+/, '').trim();
                    slugId = toSlug(titleText);
                }
                
                // Construct beautiful and clean HTML anchor H2
                lines[i] = `## <a id="${slugId}"></a>${titleText}`;
                h2Updated++;
            }
        }
    }
    
    if (h2Updated > 0) {
        content = lines.join('\n');
        console.log(`  -> Upgraded ${h2Updated} H2 headers with clean Anchor IDs.`);
        hasChanges = true;
    }

    // 3. INJECT datePublished AND dateModified TO JSON-LD SCHEMAS
    const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let schemaCount = 0;
    
    content = content.replace(scriptRegex, (match, jsonString) => {
        try {
            const cleanJsonStr = jsonString.trim();
            const jsonObj = JSON.parse(cleanJsonStr);
            
            // Check if this object is BlogPosting, Article, NewsArticle, or Service
            let isApplicableType = false;
            
            // Handle single objects or arrays of objects
            if (Array.isArray(jsonObj)) {
                jsonObj.forEach(item => {
                    if (['BlogPosting', 'Article', 'NewsArticle', 'Service'].includes(item['@type'])) {
                        isApplicableType = true;
                        if (!item.datePublished) item.datePublished = currentISODate;
                        item.dateModified = currentISODate; // Always update dateModified to current run
                    }
                });
            } else if (jsonObj['@type']) {
                if (['BlogPosting', 'Article', 'NewsArticle', 'Service'].includes(jsonObj['@type'])) {
                    isApplicableType = true;
                    if (!jsonObj.datePublished) jsonObj.datePublished = currentISODate;
                    jsonObj.dateModified = currentISODate; // Always update dateModified to current run
                }
            }
            
            if (isApplicableType) {
                schemaCount++;
                hasChanges = true;
                const formattedJson = JSON.stringify(jsonObj, null, 2);
                return `<script type="application/ld+json">\n${formattedJson}\n</script>`;
            }
        } catch (e) {
            console.error(`  -> [Error] Failed to parse/update schema JSON in ${filePath}:`, e.message);
        }
        return match; // Return original if no changes
    });
    
    if (schemaCount > 0) {
        console.log(`  -> Successfully injected datePublished & dateModified into ${schemaCount} JSON-LD Schema(s).`);
    }

    // Write changes back to file if any modification was made
    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  -> [SAVED] Successfully upgraded ${filePath}.\n`);
    } else {
        console.log(`  -> No changes needed for ${filePath}.\n`);
    }
}

// RUN THE WORKFLOW
const draftsDir = 'd:\\.thongtaccongquangninh\\content-drafts';
console.log(`Scanning directory: ${draftsDir} for Markdown drafts...`);
const mdFiles = getMarkdownFiles(draftsDir);
console.log(`Found ${mdFiles.length} draft files.\n`);

mdFiles.forEach(file => {
    try {
        upgradeDraft(file);
    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
});

console.log('--- SYSTEM PROCESS COMPLETE ---');
