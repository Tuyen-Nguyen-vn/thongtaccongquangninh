import { readFileSync, writeFileSync } from "node:fs";

const DRAFT_PATH = "D:\\.thongtaccongquangninh\\content-drafts\\thong-tac-cong-quang-ninh-ai-overview-revision-2026-06-21.md";

const FORBIDDEN = [
  [/chuyên nghiệp/gi, "đúng kỹ thuật"],
  [/uy tín/gi, "rõ giá"],
  [/hàng đầu/gi, "được gọi nhiều"],
  [/tận tâm/gi, "làm rõ việc"]
];

function clean() {
  let content = readFileSync(DRAFT_PATH, "utf8");
  let modified = false;
  
  for (const [from, to] of FORBIDDEN) {
    if (from.test(content)) {
      content = content.replace(from, to);
      console.log(`Replaced matches of ${from} with "${to}"`);
      modified = true;
    }
  }
  
  if (modified) {
    writeFileSync(DRAFT_PATH, content, "utf8");
    console.log("Draft file cleaned and saved.");
  } else {
    console.log("No forbidden words found in draft file.");
  }
}

clean();
