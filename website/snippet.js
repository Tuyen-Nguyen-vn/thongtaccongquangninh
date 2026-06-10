/**
 * ClickGuard - mã theo dõi gắn vào website (dùng với chế độ SERVER)
 *
 * Cách dùng: đổi CLICKGUARD_SERVER thành địa chỉ máy chạy clickguard.py
 * rồi chèn vào trước thẻ </body> của mọi trang:
 *
 *   <script src="/snippet.js"></script>
 *
 * (hoặc dán thẳng nội dung file này vào trong cặp thẻ <script>...</script>)
 *
 * Lưu ý: nếu website chạy HTTPS thì CLICKGUARD_SERVER cũng phải là HTTPS
 * (đặt sau reverse proxy có SSL), nếu không trình duyệt sẽ chặn yêu cầu.
 */
(function () {
  var CLICKGUARD_SERVER = "http://localhost:8088"; // <-- ĐỔI ĐỊA CHỈ NÀY

  try {
    var params = new URLSearchParams(window.location.search);
    var q = ["page=" + encodeURIComponent(window.location.pathname)];
    ["gclid", "gbraid", "wbraid", "fbclid"].forEach(function (k) {
      var v = params.get(k);
      if (v) q.push(k + "=" + encodeURIComponent(v));
    });
    var img = new Image();
    img.src = CLICKGUARD_SERVER + "/track?" + q.join("&");
  } catch (e) { /* không làm ảnh hưởng website */ }
})();
