import fs from 'node:fs';
import path from 'node:path';

const PROJECT = 'D:\\.thongtaccongquangninh';
const file1 = path.join(PROJECT, 'scratch', 'footer_shared_standard_1df81129f238.html');
const file2 = path.join(PROJECT, 'scratch', 'footer_ha_long_1797c1b054de.html');

function compare() {
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
    console.error("Missing files to compare!");
    return;
  }

  const html1 = fs.readFileSync(file1, 'utf8');
  const html2 = fs.readFileSync(file2, 'utf8');

  console.log(`File 1 Length: ${html1.length}`);
  console.log(`File 2 Length: ${html2.length}`);

  if (html1 === html2) {
    console.log("Files are identical!");
    return;
  }

  // Phân tích dòng hoặc ký tự khác biệt
  const lines1 = html1.split('\n');
  const lines2 = html2.split('\n');

  console.log(`Lines 1: ${lines1.length}, Lines 2: ${lines2.length}`);

  let diffCount = 0;
  for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
    const l1 = lines1[i] || '';
    const l2 = lines2[i] || '';
    if (l1 !== l2) {
      diffCount++;
      console.log(`--- Difference at line ${i + 1} ---`);
      console.log(`Standard: ${l1.trim().slice(0, 120)}`);
      console.log(`Ha Long : ${l2.trim().slice(0, 120)}`);
      if (diffCount >= 10) {
        console.log("Too many differences, stopping comparison.");
        break;
      }
    }
  }
}

compare();
