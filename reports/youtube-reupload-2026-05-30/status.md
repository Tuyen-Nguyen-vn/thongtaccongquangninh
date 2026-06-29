# Trạng thái upload lại video sang kênh mới

## Đã làm

- Đã xác minh kênh mới dùng được: `https://www.youtube.com/@moitruongdothiso1quangninh`.
- Đã tải 3 video cũ về local để upload lại:
  - `reports/youtube-reupload-2026-05-30/upload-files/vcVjDZLV_O0.mp4`
  - `reports/youtube-reupload-2026-05-30/upload-files/oWFUTKj4O18.mp4`
  - `reports/youtube-reupload-2026-05-30/upload-files/52u9a3u86uk.mp4`
- Đã tạo script upload:
  - `tools/reupload_youtube_videos_to_new_channel.py`
- Đã chạy syntax check:
  - `python3 -m py_compile tools/reupload_youtube_videos_to_new_channel.py`

## Đang bị chặn

Google OAuth trả lỗi:

`access_denied: The developer hasn't given you access to this app. It's currently being tested and it hasn't been verified by Google.`

Nguyên nhân: OAuth app đang ở chế độ test, tài khoản Google vừa chọn chưa được thêm vào danh sách tester của app.

## Cách mở chặn

Vào Google Cloud Console của OAuth client `308545113635-s0dui02ksv2ho9qgc51cm05jd0hlv8kg.apps.googleusercontent.com`, thêm tài khoản Google đang quản lý kênh mới vào:

`APIs & Services -> OAuth consent screen -> Test users`

Sau đó chạy lại:

```bash
.venv-youtube/bin/python tools/reupload_youtube_videos_to_new_channel.py --manual-oauth --privacy public --apply
```

Script sẽ tự dừng nếu OAuth chọn nhầm kênh cũ.
