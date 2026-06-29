# Claude memory - Quy trình AI Web SEO Agent

Claude làm việc trong repo này phải coi `docs/AI_WEB_SEO_AGENT_PROCESS.md` là **quy trình SEO website dùng chung đã hợp nhất** từ:

- `docs/source-materials/SEO Action Plan.docx`;
- `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md`;
- luật dự án hiện hành;
- checklist SEO/content/schema/cleanup của repo.

## Bắt buộc

1. Trước task web/SEO có phạm vi lớn, đọc quy trình chung rồi đọc overlay dự án:
   - `CLAUDE.md`;
   - `AGENTS.md`;
   - `CODEX_CONTEXT.md`;
   - `AI_AGENT_RULES.md`;
   - `SEO_RULES.md`;
   - `CONTENT_RULES.md`;
   - checklist/report/status liên quan.
2. Quy trình chung chỉ là baseline đa dự án; luật dự án hiện tại luôn thắng khi có xung đột.
3. Không publish/live bulk edit/delete khi chưa qua gate dự án.
4. Không bịa business data, review, rating, case, ảnh thực tế hoặc schema visible-content mismatch.
5. Sau sửa phải backup nếu live, test thật, verify rendered output và ghi report/progress.
6. Nếu task đụng Discover, favicon Search, featured snippets, AI features controls, Image SEO, byline date hoặc paywall sampling, đọc module Google tương ứng trước khi làm.

## Dùng cho website khác

Khi chuyển sang website khác, giữ phần baseline trong `docs/AI_WEB_SEO_AGENT_PROCESS.md` và thay phần overlay dự án:

- brand/NAP/hotline;
- site type;
- CMS/deploy workflow;
- media policy;
- publish approval;
- local/entity rules;
- analytics/Search Console access.
