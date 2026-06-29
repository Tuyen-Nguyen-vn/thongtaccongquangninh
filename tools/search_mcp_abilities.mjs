import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("D:\\.thongtaccongquangninh\\WORDPRESS_MCP_ABILITIES_2026-05-10.json", "utf8"));
const abilities = data.discover?.payload?.result?.content?.[0]?.text;
if (abilities) {
  const parsed = JSON.parse(abilities);
  console.log("Parsed keys:", Object.keys(parsed));
  if (parsed.abilities) {
    console.log("Abilities:", Object.keys(parsed.abilities));
  } else {
    console.log("Raw parsed:", parsed);
  }
} else {
  console.log("No abilities field in JSON");
}
