import { existsSync, readdirSync, readFileSync, renameSync } from "node:fs";
import { join } from "node:path";

const DOWNLOADS_DIR_CANDIDATES = [
  "D:\\Downloads",
  "/mnt/d/Downloads",
  "/mnt/c/Users/DELL/Downloads",
];

function firstExistingPath(paths) {
  const found = paths.find((path) => existsSync(path));
  if (!found) {
    throw new Error(`Không tìm thấy thư mục Downloads: ${paths.join(", ")}`);
  }
  return found;
}

function uniquePath(dir, filename) {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  const ext = dot === -1 ? "" : filename.slice(dot);
  let candidate = filename;
  let counter = 2;

  while (existsSync(join(dir, candidate))) {
    candidate = `${base}-${counter}${ext}`;
    counter++;
  }

  return {
    name: candidate,
    path: join(dir, candidate),
  };
}

function extractPngTextChunks(filepath) {
  try {
    const data = readFileSync(filepath);
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4e || data[3] !== 0x47) {
      return "";
    }
    
    let idx = 8;
    let text = "";
    while (idx + 8 <= data.length) {
      const length = data.readUInt32BE(idx);
      const chunkType = data.toString('ascii', idx + 4, idx + 8);
      
      if (idx + 12 + length > data.length) break;
      
      const chunkData = data.subarray ? data.subarray(idx + 8, idx + 8 + length) : data.slice(idx + 8, idx + 8 + length);
      if (chunkType === 'tEXt' || chunkType === 'iTXt') {
        text += chunkData.toString('utf-8') + " ";
      }
      idx += 12 + length;
    }
    return text.toLowerCase();
  } catch (e) {
    return "";
  }
}

function normalize(input) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase();
}

async function main() {
  const DOWNLOADS_DIR = firstExistingPath(DOWNLOADS_DIR_CANDIDATES);
  const files = readdirSync(DOWNLOADS_DIR).filter(f => f.startsWith("ChatGPT Image") && f.endsWith(".png") && f.includes("8 thg 5"));
  
  if (files.length === 0) {
    console.log(`Không tìm thấy ảnh ChatGPT Image nào của ngày hôm nay trong thư mục ${DOWNLOADS_DIR}.`);
    return;
  }

  console.log(`Tìm thấy ${files.length} ảnh ChatGPT trong ${DOWNLOADS_DIR}. Đang phân tích siêu dữ liệu Prompt...\n`);
  
  let renamed = 0;
  for (let i = 0; i < files.length; i++) {
    const oldPath = join(DOWNLOADS_DIR, files[i]);
    const metadata = normalize(extractPngTextChunks(oldPath));
    
    // Đoán dịch vụ
    let service = "thong-tac-cong";
    if (metadata.includes("bon cau") || metadata.includes("toilet") || metadata.includes("bồn cầu")) service = "thong-tac-bon-cau";
    if (metadata.includes("hut be phot") || metadata.includes("xe bon") || metadata.includes("vacuum truck")) service = "hut-be-phot";
    
    // Đoán địa phương
    let location = "quang-ninh";
    if (metadata.includes("ha long") || metadata.includes("hạ long")) location = "ha-long";
    if (metadata.includes("cam pha") || metadata.includes("cẩm phả")) location = "cam-pha";
    if (metadata.includes("uong bi") || metadata.includes("uông bí")) location = "uong-bi";
    if (metadata.includes("mong cai") || metadata.includes("móng cái")) location = "mong-cai";
    if (metadata.includes("quang yen") || metadata.includes("quảng yên")) location = "quang-yen";
    if (metadata.includes("dong trieu") || metadata.includes("đông triều")) location = "dong-trieu";
    if (metadata.includes("van don") || metadata.includes("vân đồn")) location = "van-don";

    const { name: newName, path: newPath } = uniquePath(
      DOWNLOADS_DIR,
      `${service}-${location}-anh-ai-${i + 1}.png`,
    );
    
    renameSync(oldPath, newPath);
    console.log(`[Đã đổi tên] "${files[i]}"  -->  "${newName}"`);
    renamed++;
  }
  
  console.log(`\n✅ Đã đổi tên tự động thành công ${renamed} ảnh dựa trên Prompt của ChatGPT!`);
  console.log(`Bây giờ bạn hãy báo cho Codex biết để Codex tiếp tục xử lý nhé.`);
}

main().catch(e => console.error("Lỗi:", e.message));
