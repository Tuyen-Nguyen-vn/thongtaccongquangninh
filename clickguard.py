#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ClickGuard — Công cụ chống click ảo Google Ads, chạy độc lập trên máy.

- Phát hiện IP click quảng cáo nghi vấn (qua tham số gclid/gbraid/wbraid...)
- Báo cáo ra console, file log và Telegram (tuỳ chọn)
- Tự động chặn IP: file danh sách, .htaccess, iptables (Linux),
  Windows Firewall; tự bỏ chặn khi hết hạn
- Không cần Google Ads API. Chỉ cần Python 3 (thư viện chuẩn).

Cách chạy:
    python3 clickguard.py                  # dùng chế độ trong config.json
    python3 clickguard.py --mode log       # đọc access log của nginx/apache
    python3 clickguard.py --mode server    # bật server theo dõi + mã JS
    python3 clickguard.py --simulate       # chạy thử bằng dữ liệu giả lập
    python3 clickguard.py --export-ads     # in danh sách IP để dán vào
                                           # Google Ads > Loại trừ IP
"""

import argparse
import ipaddress
import json
import os
import platform
import re
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
from collections import defaultdict, deque
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

DEFAULT_CONFIG = {
    "mode": "log",
    "server": {"host": "0.0.0.0", "port": 8088, "trust_proxy": True},
    "log": {
        "path": "/var/log/nginx/access.log",
        # "combined": log chuẩn nginx/apache; "track": log do website/track.php ghi
        "format": "combined",
        "from_start": False
    },
    "detection": {
        "ad_params": ["gclid", "gbraid", "wbraid", "fbclid"],
        "ad_clicks_max": 3,
        "ad_window_minutes": 30,
        "pageviews_max": 60,
        "pageview_window_minutes": 5,
        "bot_user_agents": ["curl", "python-requests", "python-urllib", "wget",
                            "httpclient", "headlesschrome", "phantomjs", "scrapy"],
        "ignore_extensions": [".css", ".js", ".png", ".jpg", ".jpeg", ".gif",
                              ".webp", ".svg", ".ico", ".woff", ".woff2",
                              ".ttf", ".map", ".xml", ".txt"]
    },
    # Không bao giờ chặn: IP nội bộ + dải IP Googlebot/Bingbot (bot tìm kiếm
    # bị chặn sẽ làm mất title/index trên Google)
    "whitelist": ["127.0.0.1", "::1",
                  "66.249.64.0/19", "192.178.4.0/22",
                  "34.100.182.96/28", "34.126.212.0/23",
                  "157.55.39.0/24", "207.46.13.0/24", "40.77.167.0/24",
                  "13.66.139.0/24", "52.167.144.0/24"],
    "blocking": {
        "enabled": True,
        "duration_hours": 72,
        # các phương thức: "file", "htaccess", "iptables", "windows_firewall"
        "methods": ["file"],
        "htaccess_path": "",
        "blocklist_file": "data/blocked_ips.txt"
    },
    "report": {
        "log_file": "data/suspicious.log",
        "telegram": {"bot_token": "", "chat_id": ""}
    }
}

COMBINED_RE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<path>\S+)[^"]*" (?P<status>\d{3}) \S+'
    r'(?: "(?P<referer>[^"]*)" "(?P<ua>[^"]*)")?'
)


def now_str(ts=None):
    return datetime.fromtimestamp(ts or time.time()).strftime("%Y-%m-%d %H:%M:%S")


def load_config(path):
    cfg = json.loads(json.dumps(DEFAULT_CONFIG))  # bản sao sâu
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            user_cfg = json.load(f)
        def merge(dst, src):
            for k, v in src.items():
                if isinstance(v, dict) and isinstance(dst.get(k), dict):
                    merge(dst[k], v)
                else:
                    dst[k] = v
        merge(cfg, user_cfg)
    return cfg


# ----------------------------------------------------------------------------
# BÁO CÁO
# ----------------------------------------------------------------------------
class Reporter:
    def __init__(self, cfg):
        self.cfg = cfg["report"]
        os.makedirs(DATA_DIR, exist_ok=True)
        self.log_path = os.path.join(BASE_DIR, self.cfg["log_file"])
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

    def report(self, ip, reason, action):
        line = f"[{now_str()}] IP NGHI VẤN: {ip} | Lý do: {reason} | Xử lý: {action}"
        print("\033[91m" + line + "\033[0m" if sys.stdout.isatty() else line)
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(line + "\n")
        self._telegram(line)

    def info(self, msg):
        print(f"[{now_str()}] {msg}")

    def _telegram(self, text):
        tg = self.cfg.get("telegram", {})
        token, chat_id = tg.get("bot_token"), tg.get("chat_id")
        if not token or not chat_id:
            return
        try:
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            data = urllib.parse.urlencode({"chat_id": chat_id, "text": text}).encode()
            urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=10)
        except Exception as e:
            print(f"[{now_str()}] Không gửi được Telegram: {e}")


# ----------------------------------------------------------------------------
# CHẶN IP
# ----------------------------------------------------------------------------
class Blocker:
    HTACCESS_BEGIN = "# BEGIN ClickGuard"
    HTACCESS_END = "# END ClickGuard"

    def __init__(self, cfg, reporter):
        self.cfg = cfg["blocking"]
        self.reporter = reporter
        self.methods = self.cfg.get("methods", ["file"])
        self.blocklist_file = os.path.join(BASE_DIR, self.cfg["blocklist_file"])
        os.makedirs(os.path.dirname(self.blocklist_file), exist_ok=True)

    def block(self, ip, all_blocked_ips):
        for m in self.methods:
            try:
                if m == "file":
                    self._write_blocklist(all_blocked_ips)
                elif m == "htaccess":
                    self._write_htaccess(all_blocked_ips)
                elif m == "iptables":
                    self._iptables(ip, add=True)
                elif m == "windows_firewall":
                    self._winfw(ip, add=True)
            except Exception as e:
                self.reporter.info(f"Lỗi khi chặn {ip} bằng {m}: {e}")

    def unblock(self, ip, all_blocked_ips):
        for m in self.methods:
            try:
                if m == "file":
                    self._write_blocklist(all_blocked_ips)
                elif m == "htaccess":
                    self._write_htaccess(all_blocked_ips)
                elif m == "iptables":
                    self._iptables(ip, add=False)
                elif m == "windows_firewall":
                    self._winfw(ip, add=False)
            except Exception as e:
                self.reporter.info(f"Lỗi khi bỏ chặn {ip} bằng {m}: {e}")

    def _write_blocklist(self, ips):
        with open(self.blocklist_file, "w", encoding="utf-8") as f:
            f.write("\n".join(sorted(ips)) + ("\n" if ips else ""))

    def _write_htaccess(self, ips):
        path = self.cfg.get("htaccess_path")
        if not path:
            return
        content = ""
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            # bỏ khối ClickGuard cũ
            pattern = re.compile(
                re.escape(self.HTACCESS_BEGIN) + r".*?" + re.escape(self.HTACCESS_END) + r"\n?",
                re.S)
            content = pattern.sub("", content)
        block = [self.HTACCESS_BEGIN]
        if ips:
            block.append("<IfModule mod_authz_core.c>")
            block.append("  <RequireAll>")
            block.append("    Require all granted")
            for ip in sorted(ips):
                block.append(f"    Require not ip {ip}")
            block.append("  </RequireAll>")
            block.append("</IfModule>")
            block.append("<IfModule !mod_authz_core.c>")
            block.append("  Order allow,deny")
            block.append("  Allow from all")
            for ip in sorted(ips):
                block.append(f"  Deny from {ip}")
            block.append("</IfModule>")
        block.append(self.HTACCESS_END)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content.rstrip("\n") + ("\n" if content.strip() else "") +
                    "\n".join(block) + "\n")

    def _iptables(self, ip, add):
        cmd = "ip6tables" if ":" in ip else "iptables"
        check = subprocess.run([cmd, "-C", "INPUT", "-s", ip, "-j", "DROP"],
                               capture_output=True)
        exists = check.returncode == 0
        if add and not exists:
            subprocess.run([cmd, "-I", "INPUT", "-s", ip, "-j", "DROP"], check=True)
        elif not add and exists:
            subprocess.run([cmd, "-D", "INPUT", "-s", ip, "-j", "DROP"], check=True)

    def _winfw(self, ip, add):
        name = f"ClickGuard_{ip}"
        if add:
            subprocess.run(["netsh", "advfirewall", "firewall", "add", "rule",
                            f"name={name}", "dir=in", "action=block",
                            f"remoteip={ip}"], check=True, capture_output=True)
        else:
            subprocess.run(["netsh", "advfirewall", "firewall", "delete", "rule",
                            f"name={name}"], capture_output=True)


# ----------------------------------------------------------------------------
# BỘ PHÁT HIỆN
# ----------------------------------------------------------------------------
class Engine:
    def __init__(self, cfg):
        self.cfg = cfg
        det = cfg["detection"]
        self.ad_params = det["ad_params"]
        self.ad_max = det["ad_clicks_max"]
        self.ad_window = det["ad_window_minutes"] * 60
        self.pv_max = det["pageviews_max"]
        self.pv_window = det["pageview_window_minutes"] * 60
        self.bot_uas = [u.lower() for u in det["bot_user_agents"]]
        self.ignore_ext = tuple(det["ignore_extensions"])
        self.whitelist = []
        for item in cfg.get("whitelist", []):
            try:
                self.whitelist.append(ipaddress.ip_network(item, strict=False))
            except ValueError:
                pass

        self.hits = defaultdict(deque)       # ip -> mốc thời gian truy cập
        self.ad_clicks = defaultdict(deque)  # ip -> mốc thời gian click quảng cáo
        self.blocked = {}                    # ip -> {time, until, reason}
        self.total_hits = 0
        self.total_ad_clicks = 0
        self.lock = threading.Lock()

        self.reporter = Reporter(cfg)
        self.blocker = Blocker(cfg, self.reporter)
        self.state_path = os.path.join(DATA_DIR, "state.json")
        self._load_state()

    # ---------- trạng thái ----------
    def _load_state(self):
        if os.path.exists(self.state_path):
            try:
                with open(self.state_path, "r", encoding="utf-8") as f:
                    self.blocked = json.load(f).get("blocked", {})
            except Exception:
                self.blocked = {}

    def _save_state(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(self.state_path, "w", encoding="utf-8") as f:
            json.dump({"blocked": self.blocked}, f, ensure_ascii=False, indent=2)

    # ---------- xử lý ----------
    def _is_whitelisted(self, ip):
        try:
            addr = ipaddress.ip_address(ip)
        except ValueError:
            return True  # IP không hợp lệ thì bỏ qua
        return any(addr in net for net in self.whitelist)

    def _is_ad_click(self, path):
        query = urllib.parse.urlparse(path).query
        params = urllib.parse.parse_qs(query)
        return any(p in params for p in self.ad_params)

    def process_hit(self, ip, ts, path, ua=""):
        """Ghi nhận một lượt truy cập; trả về lý do nếu IP bị đánh dấu nghi vấn."""
        if self._is_whitelisted(ip):
            return None
        bare_path = urllib.parse.urlparse(path).path.lower()
        if bare_path.endswith(self.ignore_ext):
            return None

        with self.lock:
            if ip in self.blocked:
                return None
            self.total_hits += 1

            hits = self.hits[ip]
            hits.append(ts)
            while hits and hits[0] < ts - self.pv_window:
                hits.popleft()

            is_ad = self._is_ad_click(path)
            ad = self.ad_clicks[ip]
            if is_ad:
                self.total_ad_clicks += 1
                ad.append(ts)
            while ad and ad[0] < ts - self.ad_window:
                ad.popleft()

            reasons = []
            ua_l = (ua or "").lower()
            if ua_l and any(b in ua_l for b in self.bot_uas):
                reasons.append(f"user-agent bot ({ua[:60]})")
            if len(ad) >= self.ad_max:
                reasons.append(
                    f"{len(ad)} click quảng cáo (gclid) trong "
                    f"{self.ad_window // 60} phút")
            if len(hits) >= self.pv_max:
                reasons.append(
                    f"{len(hits)} lượt truy cập trong {self.pv_window // 60} phút")

            if not reasons:
                return None
            reason = "; ".join(reasons)
            self._block(ip, ts, reason)
            return reason

    def _block(self, ip, ts, reason):
        bcfg = self.cfg["blocking"]
        action = "chỉ cảnh báo (blocking.enabled=false)"
        if bcfg["enabled"]:
            hours = bcfg.get("duration_hours", 0)
            until = ts + hours * 3600 if hours else 0
            self.blocked[ip] = {"time": now_str(ts), "until": until, "reason": reason}
            self.blocker.block(ip, list(self.blocked.keys()))
            self._save_state()
            action = ("đã CHẶN " +
                      (f"đến {now_str(until)}" if until else "vĩnh viễn") +
                      f" ({', '.join(bcfg['methods'])})")
        self.reporter.report(ip, reason, action)
        # dọn bộ đếm của IP đã chặn
        self.hits.pop(ip, None)
        self.ad_clicks.pop(ip, None)

    def expire_blocks(self):
        """Bỏ chặn các IP đã hết hạn."""
        now = time.time()
        with self.lock:
            expired = [ip for ip, info in self.blocked.items()
                       if info.get("until") and info["until"] <= now]
            for ip in expired:
                del self.blocked[ip]
                self.blocker.unblock(ip, list(self.blocked.keys()))
                self.reporter.info(f"Đã bỏ chặn IP {ip} (hết hạn)")
            if expired:
                self._save_state()

    def stats(self):
        with self.lock:
            return {
                "tong_luot_truy_cap": self.total_hits,
                "tong_click_quang_cao": self.total_ad_clicks,
                "ip_dang_theo_doi": len(self.hits),
                "ip_dang_chan": len(self.blocked),
                "danh_sach_chan": self.blocked,
            }


# ----------------------------------------------------------------------------
# CHẾ ĐỘ LOG: đọc tiếp diễn access log
# ----------------------------------------------------------------------------
def parse_combined(line):
    m = COMBINED_RE.match(line)
    if not m:
        return None
    try:
        ts = datetime.strptime(m.group("time"), "%d/%b/%Y:%H:%M:%S %z").timestamp()
    except ValueError:
        ts = time.time()
    return m.group("ip"), ts, m.group("path"), m.group("ua") or ""


def parse_track(line):
    # định dạng của website/track.php: ISO_TIME|IP|URI|USER_AGENT
    parts = line.rstrip("\n").split("|", 3)
    if len(parts) < 3:
        return None
    try:
        ts = datetime.fromisoformat(parts[0]).timestamp()
    except ValueError:
        ts = time.time()
    ua = parts[3] if len(parts) > 3 else ""
    return parts[1], ts, parts[2], ua


def run_log_mode(engine, cfg):
    lcfg = cfg["log"]
    path = lcfg["path"]
    parser = parse_track if lcfg.get("format") == "track" else parse_combined
    engine.reporter.info(
        f"Chế độ LOG: theo dõi {path} (định dạng {lcfg.get('format', 'combined')})")
    engine.reporter.info("Nhấn Ctrl+C để dừng.")

    f = None
    inode = None
    while True:
        try:
            if f is None:
                if not os.path.exists(path):
                    time.sleep(2)
                    continue
                f = open(path, "r", encoding="utf-8", errors="replace")
                inode = os.fstat(f.fileno()).st_ino
                if not lcfg.get("from_start"):
                    f.seek(0, os.SEEK_END)
                engine.reporter.info(f"Đã mở log: {path}")

            line = f.readline()
            if line:
                parsed = parser(line)
                if parsed:
                    engine.process_hit(*parsed)
                continue

            # hết dữ liệu: kiểm tra log bị xoay vòng (rotation) không
            try:
                st = os.stat(path)
                if st.st_ino != inode or st.st_size < f.tell():
                    f.close()
                    f = None
                    continue
            except FileNotFoundError:
                f.close()
                f = None
                continue
            engine.expire_blocks()
            time.sleep(1)
        except KeyboardInterrupt:
            engine.reporter.info("Đã dừng.")
            return


# ----------------------------------------------------------------------------
# CHẾ ĐỘ SERVER: nhận tín hiệu từ mã JS gắn trên website
# ----------------------------------------------------------------------------
PIXEL_GIF = (b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00!"
             b"\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00"
             b"\x00\x02\x02D\x01\x00;")


def make_handler(engine, cfg):
    trust_proxy = cfg["server"].get("trust_proxy", True)

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass  # không in log truy cập của chính server theo dõi

        def _client_ip(self):
            if trust_proxy:
                fwd = self.headers.get("X-Forwarded-For")
                if fwd:
                    return fwd.split(",")[0].strip()
            return self.client_address[0]

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/track":
                ip = self._client_ip()
                qs = urllib.parse.parse_qs(parsed.query)
                page = qs.get("page", ["/"])[0]
                # ghép lại URL trang đích kèm tham số quảng cáo để detector xử lý
                extra = {k: v[0] for k, v in qs.items() if k != "page"}
                full = page + ("?" + urllib.parse.urlencode(extra) if extra else "")
                ua = self.headers.get("User-Agent", "")
                engine.process_hit(ip, time.time(), full, ua)
                self.send_response(200)
                self.send_header("Content-Type", "image/gif")
                self.send_header("Content-Length", str(len(PIXEL_GIF)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(PIXEL_GIF)
            elif parsed.path == "/stats":
                body = json.dumps(engine.stats(), ensure_ascii=False, indent=2).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_response(404)
                self.end_headers()

    return Handler


def run_server_mode(engine, cfg):
    host, port = cfg["server"]["host"], cfg["server"]["port"]
    server = ThreadingHTTPServer((host, port), make_handler(engine, cfg))
    engine.reporter.info(f"Chế độ SERVER: đang lắng nghe http://{host}:{port}")
    engine.reporter.info("Gắn mã trong website/snippet.js vào website của bạn.")
    engine.reporter.info(f"Xem trạng thái: http://<ip-máy-này>:{port}/stats")

    def expire_loop():
        while True:
            time.sleep(60)
            engine.expire_blocks()

    threading.Thread(target=expire_loop, daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        engine.reporter.info("Đã dừng.")


# ----------------------------------------------------------------------------
# GIẢ LẬP để chạy thử
# ----------------------------------------------------------------------------
def run_simulation(engine):
    print("=" * 70)
    print("GIẢ LẬP: khách thật truy cập bình thường, đối thủ click quảng cáo 5 lần")
    print("=" * 70)
    t = time.time()
    # khách thật: 1 click quảng cáo rồi xem vài trang
    engine.process_hit("113.160.1.10", t, "/?gclid=KhachThat123",
                       "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")
    engine.process_hit("113.160.1.10", t + 30, "/bang-gia",
                       "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")
    # đối thủ: click quảng cáo lặp lại nhiều lần trong vài phút
    for i in range(5):
        r = engine.process_hit("203.0.113.99", t + i * 60, f"/?gclid=DoiThu{i}",
                               "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        print(f"  Click {i + 1} từ 203.0.113.99: "
              f"{'>>> PHÁT HIỆN: ' + r if r else 'chưa vượt ngưỡng'}")
    # bot dùng công cụ tự động
    engine.process_hit("198.51.100.7", t, "/?gclid=Bot1", "python-requests/2.31")
    print("-" * 70)
    print(json.dumps(engine.stats(), ensure_ascii=False, indent=2))
    print("-" * 70)
    print("Danh sách IP để dán vào Google Ads > Cài đặt > Loại trừ IP:")
    for ip in engine.blocked:
        print("  " + ip)


def export_ads(engine):
    """In danh sách IP đang chặn để dán vào Google Ads > Loại trừ IP."""
    if not engine.blocked:
        print("Chưa có IP nào bị chặn.")
        return
    print("# Dán các IP sau vào Google Ads > Cài đặt chiến dịch > Loại trừ IP")
    for ip, info in sorted(engine.blocked.items()):
        print(f"{ip}  # {info['time']} - {info['reason']}")


def main():
    ap = argparse.ArgumentParser(description="ClickGuard - chống click ảo Google Ads")
    ap.add_argument("--config", default=os.path.join(BASE_DIR, "config.json"))
    ap.add_argument("--mode", choices=["log", "server"],
                    help="ghi đè chế độ trong config.json")
    ap.add_argument("--simulate", action="store_true",
                    help="chạy thử bằng dữ liệu giả lập")
    ap.add_argument("--export-ads", action="store_true",
                    help="in danh sách IP để dán vào Google Ads")
    args = ap.parse_args()

    cfg = load_config(args.config)
    engine = Engine(cfg)

    if args.simulate:
        run_simulation(engine)
        return
    if args.export_ads:
        export_ads(engine)
        return

    mode = args.mode or cfg.get("mode", "log")
    if mode == "server":
        run_server_mode(engine, cfg)
    else:
        run_log_mode(engine, cfg)


if __name__ == "__main__":
    main()
