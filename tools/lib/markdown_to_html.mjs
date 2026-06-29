const FRONTMATTER_KEYS = [
  "Meta Title:",
  "Meta Description:",
  "Focus Keyword:",
  "Slug:",
  "Search Intent:",
];

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function unescapeMarkdownEntities(input) {
  return String(input)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"');
}

function renderInline(text) {
  const source = String(text ?? "");
  const tokens = [];
  const linkRe = /(?<!\!)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  let match;

  while ((match = linkRe.exec(source))) {
    if (match.index > last) {
      tokens.push({ type: "text", value: source.slice(last, match.index) });
    }
    tokens.push({ type: "link", text: match[1], url: match[2] });
    last = match.index + match[0].length;
  }
  if (last < source.length) tokens.push({ type: "text", value: source.slice(last) });

  return tokens
    .map((token) => {
      if (token.type === "link") {
        return `<a href="${token.url}" rel="noopener">${escapeHtml(token.text)}</a>`;
      }
      let value = escapeHtml(token.value);
      value = value
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
      return value;
    })
    .join("");
}

function isTableSeparator(row) {
  const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitRow(row) {
  const parts = row.split("|").map((cell) => cell.trim());
  if (parts.length > 0 && parts[0] === "") parts.shift();
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function parseTable(lines, startIndex) {
  const rows = [];
  let i = startIndex;
  while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
    rows.push(lines[i].trim());
    i += 1;
  }
  if (rows.length < 2 || !isTableSeparator(rows[1])) return null;

  const headers = splitRow(rows[0]);
  const bodyRows = rows.slice(2).map((row) => splitRow(row));
  const html = ["<table>", "<thead><tr>"];
  for (const header of headers) html.push(`<th>${renderInline(header)}</th>`);
  html.push("</tr></thead>", "<tbody>");
  for (const row of bodyRows) {
    html.push("<tr>");
    for (const cell of row) html.push(`<td>${renderInline(cell)}</td>`);
    html.push("</tr>");
  }
  html.push("</tbody></table>");
  return { html: html.join(""), nextIndex: i - 1 };
}

function flushParagraph(buffer, output) {
  const text = buffer.join(" ").trim();
  if (text) output.push(`<p>${renderInline(text)}</p>`);
  buffer.length = 0;
}

function listBlock(lines, startIndex, ordered = false) {
  const items = [];
  let i = startIndex;
  const regex = ordered ? /^\d+\.\s+(.*)$/ : /^-\s+(.*)$/;
  while (i < lines.length) {
    const match = lines[i].match(regex);
    if (!match) break;
    items.push(match[1]);
    i += 1;
  }
  if (!items.length) return null;
  const tag = ordered ? "ol" : "ul";
  return {
    html: `<${tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`,
    nextIndex: i - 1,
  };
}

function codeBlock(lines, startIndex) {
  const start = lines[startIndex];
  if (!/^```/.test(start.trim())) return null;
  const lang = start.trim().slice(3).trim();
  let i = startIndex + 1;
  const parts = [];
  while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
    parts.push(lines[i]);
    i += 1;
  }
  return {
    html: `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ""}>${escapeHtml(parts.join("\n"))}</code></pre>`,
    nextIndex: i < lines.length ? i : lines.length - 1,
  };
}

export function markdownToHtml(md, opts = {}) {
  const text = String(md ?? "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const out = [];
  const paragraph = [];
  const skipFrontmatter = opts.skipFrontmatter !== false;
  const imageMap = opts.imageMap || null;
  const captionMap = opts.captionMap || null;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushParagraph(paragraph, out);
      continue;
    }

    if (skipFrontmatter && (FRONTMATTER_KEYS.some((key) => line.startsWith(key)) || /^<!--.*-->$/.test(line))) {
      continue;
    }

    if (/^```/.test(line)) {
      flushParagraph(paragraph, out);
      const block = codeBlock(lines, i);
      if (block) {
        out.push(block.html);
        i = block.nextIndex;
        continue;
      }
    }

    if (/^---+$/.test(line)) {
      flushParagraph(paragraph, out);
      out.push("<hr />");
      continue;
    }

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushParagraph(paragraph, out);
      const alt = imgMatch[1];
      const src = imgMatch[2];
      const filename = src.split("/").pop();
      let liveUrl = src;
      if (imageMap) {
        const mapped = imageMap[src] || imageMap[filename] || imageMap[decodeURIComponent(filename)] || null;
        if (mapped) {
          liveUrl = mapped;
        } else if (!src.startsWith("http://") && !src.startsWith("https://")) {
          liveUrl = null;
        }
      }
      if (!liveUrl || liveUrl.startsWith("..") || liveUrl.startsWith(".")) {
        // Bỏ qua thẻ hình ảnh cục bộ không có đường dẫn trực tuyến hợp lệ
        continue;
      }
      let caption = "";
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const captionMatch = nextLine.match(/^[*_](.+)[*_]$/);
        if (captionMatch) {
          caption = captionMatch[1];
          i += 1;
        }
      }
      if (captionMap) {
        caption = captionMap[src] || captionMap[filename] || captionMap[decodeURIComponent(filename)] || caption;
      }
      const figcaptionHtml = caption ? `<figcaption>${renderInline(caption)}</figcaption>` : "";
      out.push(`<figure class="wp-block-image"><img src="${escapeHtml(liveUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />${figcaptionHtml}</figure>`);
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(paragraph, out);
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      flushParagraph(paragraph, out);
      out.push(table.html);
      i = table.nextIndex;
      continue;
    }

    const orderedList = listBlock(lines, i, true);
    if (orderedList) {
      flushParagraph(paragraph, out);
      out.push(orderedList.html);
      i = orderedList.nextIndex;
      continue;
    }

    const bulletList = listBlock(lines, i, false);
    if (bulletList) {
      flushParagraph(paragraph, out);
      out.push(bulletList.html);
      i = bulletList.nextIndex;
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph(paragraph, out);
  return out.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = `Meta Title: Demo\n\n## Bảng giá\n\n| Dịch vụ | Giá |\n|---|---|\n| [bảng giá](https://thongtaccongquangninh.com/bang-gia/) | **Liên hệ** |\n\n- Mục 1\n- Mục 2\n\n\`code\``;
  console.log(markdownToHtml(sample));
}
