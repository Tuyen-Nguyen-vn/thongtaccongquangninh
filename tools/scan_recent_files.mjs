import fs from 'fs';
import path from 'path';

// Lấy tham số số ngày từ command line, mặc định là 1 ngày (24h)
const args = process.argv.slice(2);
const DAYS_TO_CHECK = args.length > 0 ? parseFloat(args[0]) : 1;
const PROJECT_DIR = 'D:\\.thongtaccongquangninh';
const EXCLUDE_DIRS = ['.git', 'node_modules', '.agents'];
const NOW = new Date();

function scanDirectory(dir, results) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return;
  }

  for (const file of files) {
    if (EXCLUDE_DIRS.includes(file)) continue;

    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, results);
      } else {
        const diffTime = Math.abs(NOW - stat.mtime);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays <= DAYS_TO_CHECK) {
          results.push({
            file: fullPath.replace(PROJECT_DIR + path.sep, ''),
            mtime: stat.mtime,
          });
        }
      }
    } catch (err) {
      // Bỏ qua lỗi đọc file nếu có
      continue;
    }
  }
}

function main() {
  console.log(`Bắt đầu quét các file thay đổi trong ${DAYS_TO_CHECK} ngày qua tại dự án ${PROJECT_DIR}...`);
  const results = [];
  
  scanDirectory(PROJECT_DIR, results);
  results.sort((a, b) => b.mtime - a.mtime);

  console.log(`\nPhát hiện ${results.length} file có thay đổi:\n`);
  results.forEach(item => {
    console.log(`- [${item.mtime.toLocaleString('vi-VN')}] ${item.file}`);
  });
  
  if (results.length === 0) {
    console.log('Không có file nào mới được tạo hoặc chỉnh sửa.');
  }
  
  console.log('\n✅ Hoàn tất rà soát. (Hotline trực dự án 24/7: 0963.953.533 / 0931.156.756)');
}

main();
