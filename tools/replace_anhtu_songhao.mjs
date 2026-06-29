import { readFileSync, writeFileSync } from "node:fs";

const DRAFT_PATH = "D:\\.thongtaccongquangninh\\content-drafts\\thong-tac-cong-quang-ninh-ai-overview-revision-2026-06-21.md";

function run() {
  let content = readFileSync(DRAFT_PATH, "utf8");
  
  // 1. Text Replacements
  content = content.replace(/Về Anh Tú/g, "Về Song Hào");
  content = content.replace(/hành trình chuyên môn của Anh Tú/gi, "Hành trình chuyên môn của Song Hào");
  content = content.replace(/Anh \*\*Nguyễn Văn Tú\*\* \(thường gọi là \*\*Anh Tú\*\*\)/g, "Anh **Nguyễn Song Hào** (thường gọi là **Song Hào**)");
  content = content.replace(/anh Tú/g, "Song Hào");
  content = content.replace(/Anh Tú/g, "Song Hào");
  
  // Clean up any remaining double spaces or formatting
  content = content.replace(/Trưởng bộ phận kỹ thuật/g, "Trưởng bộ phận kỹ thuật");
  
  // 2. Schema Merging
  // Let's remove the Person schema object with id `#anhtu` and update `#person`
  // We can look at the JSON graph array.
  
  // Let's find the Person schema block for Nguyễn Song Hào and Nguyễn Văn Tú
  const songHaoStart = content.indexOf('      "@type": "Person",\n      "@id": "https://thongtaccongquangninh.com/author/nguyensonghao/#person",');
  const anhtuStart = content.indexOf('    {\n      "@type": "Person",\n      "@id": "https://thongtaccongquangninh.com/#anhtu",');
  
  if (songHaoStart > 0 && anhtuStart > 0) {
    console.log("Found both Person schemas. Merging...");
    
    // We will replace the Song Hào description and jobTitle:
    const oldSongHao = `      "@type": "Person",
      "@id": "https://thongtaccongquangninh.com/author/nguyensonghao/#person",
      "name": "Nguyễn Song Hào",
      "url": "https://thongtaccongquangninh.com/author/nguyensonghao/",
      "image": {
        "@type": "ImageObject",
        "url": "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/logo-cong-ty-mobile-optimized.webp"
      },
      "jobTitle": "Chuyên gia Kỹ thuật Môi trường",
      "worksFor": {
        "@id": "https://thongtaccongquangninh.com/#organization"
      },
      "description": "Nguyễn Song Hào là chuyên gia kỹ thuật môi trường với hơn 10 năm kinh nghiệm xử lý thông tắc cống, hút bể phốt tại Quảng Ninh và là người kiểm duyệt nội dung chuyên môn.",
      "sameAs": [
        "https://thongtaccongquangninh.com/author/nguyensonghao/"
      ]`;
      
    const newSongHao = `      "@type": "Person",
      "@id": "https://thongtaccongquangninh.com/author/nguyensonghao/#person",
      "name": "Nguyễn Song Hào",
      "url": "https://thongtaccongquangninh.com/author/nguyensonghao/",
      "image": {
        "@type": "ImageObject",
        "url": "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/logo-cong-ty-mobile-optimized.webp"
      },
      "jobTitle": "Trưởng bộ phận Kỹ thuật & Chuyên gia Môi trường",
      "worksFor": {
        "@id": "https://thongtaccongquangninh.com/#organization"
      },
      "description": "Nguyễn Song Hào là Trưởng bộ phận Kỹ thuật thi công thông tắc cống Quảng Ninh, đồng thời là chuyên gia kỹ thuật môi trường với hơn 10 năm kinh nghiệm trực tiếp xử lý các sự cố tắc nghẽn cầu cống, bể phốt.",
      "sameAs": [
        "https://thongtaccongquangninh.com/author/nguyensonghao/"
      ]`;
      
    content = content.replace(oldSongHao, newSongHao);
    
    // Now remove the Anh Tú block:
    const oldAnhtuBlock = `    {
      "@type": "Person",
      "@id": "https://thongtaccongquangninh.com/#anhtu",
      "name": "Nguyễn Văn Tú",
      "jobTitle": "Đội trưởng Kỹ thuật Thi công",
      "worksFor": {
        "@id": "https://thongtaccongquangninh.com/#organization"
      },
      "description": "Nguyễn Văn Tú (Anh Tú) là Đội trưởng đội kỹ thuật thi công thông tắc cống Quảng Ninh với hơn 10 năm kinh nghiệm trực tiếp xử lý các sự cố tắc nghẽn cầu cống, bể phốt."
    },`;
    
    content = content.replace(oldAnhtuBlock, "");
  } else {
    console.log("Could not find matching schema blocks by exact string, doing fallback replace...");
    content = content.replace(/Nguyễn Văn Tú/g, "Nguyễn Song Hào");
    content = content.replace(/\(Anh Tú\)/g, "(Song Hào)");
    content = content.replace(/Đội trưởng Kỹ thuật Thi công/g, "Trưởng bộ phận Kỹ thuật & Chuyên gia Môi trường");
  }
  
  writeFileSync(DRAFT_PATH, content, "utf8");
  console.log("Successfully replaced Anh Tú with Song Hào throughout the document.");
}

run();
