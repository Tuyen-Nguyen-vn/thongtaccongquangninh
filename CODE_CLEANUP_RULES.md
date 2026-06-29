# CODE_CLEANUP_RULES

## Phân Loại Trước Khi Xóa

Mọi code/file nghi vấn phải được phân loại:

- REVIEW_REQUIRED: có thể dùng động qua JS, CMS, shortcode, route runtime, plugin hoặc deploy.
- KEEP: đang dùng hoặc là backup/report/media/source vận hành.

## Checklist Trước Khi Xóa

1. Kiểm tra reference toàn repo bằng `rg`.
2. Kiểm tra import/export.
3. Kiểm tra dynamic class/template/shortcode.
4. Kiểm tra WordPress REST content/meta/options nếu liên quan.
5. Kiểm tra plugin active trên live.
6. Kiểm tra route/page thực tế.
7. Backup trước khi sửa/xóa.
8. Nếu chưa chắc, đưa vào `REVIEW_REQUIRED`.
9. Với plugin/asset WordPress, kiểm cả `tools/wp-plugins`, report upload, plugin active list và khả năng rollback.


3. Không tắt plugin live khi chưa có rollback.
4. Không format toàn repo để cleanup.

## Sau Khi Cleanup

1. Chạy syntax/build/lint/test nếu có.
2. Với WordPress live: verify REST + frontend.
3. Với UI: kiểm mobile/desktop nếu sửa giao diện.
4. Ghi file đã sửa, lý do và bằng chứng vào report.
