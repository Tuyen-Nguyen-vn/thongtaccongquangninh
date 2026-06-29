import csv
import json
import re
import socket
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path


FILES = [
    Path(r"C:\Users\DELL\Desktop\100426KMZYHCINTQAR.txt"),
    Path(r"C:\Users\DELL\Desktop\100426TZCXFDAKPGJO.txt"),
    Path(r"C:\Users\DELL\Desktop\100426YCENGDFRLVPA.txt"),
]
REPORT_DIR = Path(r"D:\.thongtaccongquangninh\reports")


def parse_proxy_file(path: Path) -> dict:
    lines = [line.strip() for line in path.read_text(encoding="utf-8-sig", errors="replace").splitlines() if line.strip()]
    proxy_line = next(
        (
            line
            for line in lines
            if re.match(r"^[A-Za-z0-9.-]+:\d+:[^:]+:.+$", line)
            and "proxy" in line.split(":", 1)[0].lower()
        ),
        "",
    )
    parts = proxy_line.split(":")
    if len(parts) < 4:
        raise ValueError(f"Không parse được proxy trong {path}")
    return {
        "file": str(path),
        "service": lines[0] if lines else "",
        "host": parts[0].strip(),
        "port": int(parts[1].strip()),
        "username": parts[2].strip(),
        "password": ":".join(parts[3:]).strip(),
    }


def mask_proxy(p: dict) -> str:
    user = p["username"][:3] + "***" if p.get("username") else ""
    return f"{p['host']}:{p['port']}:{user}:***"


def resolve_host(host: str) -> list[str]:
    addrs = []
    try:
        for item in socket.getaddrinfo(host, None):
            ip = item[4][0]
            if ip not in addrs:
                addrs.append(ip)
    except Exception:
        pass
    return addrs


def fetch_url(url: str, proxy: dict | None = None, timeout: int = 15) -> tuple[bool, int, str]:
    opener = urllib.request.build_opener()
    if proxy:
        user = urllib.parse.quote(proxy["username"])
        pwd = urllib.parse.quote(proxy["password"])
        proxy_url = f"http://{user}:{pwd}@{proxy['host']}:{proxy['port']}"
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({"http": proxy_url, "https": proxy_url})
        )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 proxy-audit"})
    start = time.time()
    try:
        with opener.open(req, timeout=timeout) as resp:
            body = resp.read(2000).decode("utf-8", "replace")
            return True, int((time.time() - start) * 1000), body
    except Exception as exc:
        return False, int((time.time() - start) * 1000), f"{type(exc).__name__}: {str(exc)[:180]}"


def json_get(url: str) -> dict:
    ok, _, body = fetch_url(url, None, 20)
    if not ok:
        return {"error": body}
    try:
        return json.loads(body)
    except Exception as exc:
        return {"error": f"json_parse: {exc}", "body": body[:200]}


def classify(result: dict) -> str:
    if not result.get("connect_ok"):
        return "DIE"
    pc = result.get("proxycheck") or {}
    ipapi = result.get("ip_api") or {}
    proxy_yes = str(pc.get("proxy", "")).lower() == "yes"
    risk = int(pc.get("risk") or 0) if str(pc.get("risk") or "0").isdigit() else 0
    hosting = bool(ipapi.get("hosting"))
    proxy_flag = bool(ipapi.get("proxy"))
    mobile = bool(ipapi.get("mobile"))
    if proxy_yes or risk >= 66 or proxy_flag or hosting:
        return "BẨN/RỦI RO CAO"
    if mobile and risk < 33:
        return "TỐT HƠN: MOBILE"
    if risk < 33 and not proxy_flag and not hosting:
        return "TẠM SẠCH NHƯNG KHÔNG PHẢI MOBILE"
    return "CẦN THEO DÕI"


def audit_one(proxy: dict) -> dict:
    resolved = resolve_host(proxy["host"])
    tests = {}
    for label, url in {
        "https_api64": "https://api64.ipify.org?format=json",
        "http_api64": "http://api64.ipify.org?format=json",
        "https_ipify": "https://api.ipify.org?format=json",
        "http_ipify": "http://api.ipify.org?format=json",
    }.items():
        ok, ms, body = fetch_url(url, proxy)
        tests[label] = {"ok": ok, "ms": ms, "body": body[:300]}

    exit_ip = ""
    for test in [tests["https_api64"], tests["http_api64"], tests["https_ipify"], tests["http_ipify"]]:
        if test["ok"]:
            try:
                exit_ip = json.loads(test["body"]).get("ip", "")
                if exit_ip:
                    break
            except Exception:
                pass

    ip_api = {}
    proxycheck = {}
    if exit_ip:
        ip_api = json_get(
            "http://ip-api.com/json/"
            + urllib.parse.quote(exit_ip, safe=":")
            + "?fields=status,message,country,regionName,city,isp,org,as,asname,mobile,proxy,hosting,query"
        )
        pc_resp = json_get(
            "https://proxycheck.io/v2/"
            + urllib.parse.quote(exit_ip, safe=":")
            + "?vpn=1&asn=1&risk=1&port=1&seen=1&days=7"
        )
        proxycheck = pc_resp.get(exit_ip, pc_resp)

    result = {
        "file": proxy["file"],
        "service": proxy["service"],
        "proxy_masked": mask_proxy(proxy),
        "host": proxy["host"],
        "port": proxy["port"],
        "resolved": resolved,
        "connect_ok": bool(exit_ip),
        "exit_ip": exit_ip,
        "tests": tests,
        "ip_api": ip_api,
        "proxycheck": proxycheck,
    }
    result["rating"] = classify(result)
    return result


def main():
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    proxies = [parse_proxy_file(path) for path in FILES]
    results = [audit_one(proxy) for proxy in proxies]

    csv_path = REPORT_DIR / f"DESKTOP_PROXY_AUDIT_{stamp}.csv"
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        fieldnames = [
            "file",
            "proxy_masked",
            "resolved",
            "connect_ok",
            "exit_ip",
            "rating",
            "country",
            "city",
            "isp",
            "org",
            "asn",
            "mobile",
            "ip_api_proxy",
            "hosting",
            "proxycheck_proxy",
            "proxycheck_type",
            "proxycheck_risk",
            "https_ms",
            "http_ms",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            ip_api = r.get("ip_api") or {}
            pc = r.get("proxycheck") or {}
            writer.writerow(
                {
                    "file": r["file"],
                    "proxy_masked": r["proxy_masked"],
                    "resolved": ";".join(r["resolved"]),
                    "connect_ok": r["connect_ok"],
                    "exit_ip": r["exit_ip"],
                    "rating": r["rating"],
                    "country": ip_api.get("country", ""),
                    "city": ip_api.get("city", ""),
                    "isp": ip_api.get("isp", ""),
                    "org": ip_api.get("org", ""),
                    "asn": ip_api.get("as", ""),
                    "mobile": ip_api.get("mobile", ""),
                    "ip_api_proxy": ip_api.get("proxy", ""),
                    "hosting": ip_api.get("hosting", ""),
                    "proxycheck_proxy": pc.get("proxy", ""),
                    "proxycheck_type": pc.get("type", ""),
                    "proxycheck_risk": pc.get("risk", ""),
                    "https_ms": r["tests"]["https_api64"]["ms"],
                    "http_ms": r["tests"]["http_api64"]["ms"],
                }
            )

    md_path = REPORT_DIR / f"DESKTOP_PROXY_AUDIT_{stamp}.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(f"# Kiểm tra proxy Desktop - {stamp}\n\n")
        f.write("Chỉ test endpoint trung lập, không dùng Facebook.\n\n")
        for idx, r in enumerate(results, 1):
            ip_api = r.get("ip_api") or {}
            pc = r.get("proxycheck") or {}
            f.write(f"## {idx}. {Path(r['file']).name}\n")
            f.write(f"- Proxy: `{r['proxy_masked']}`\n")
            f.write(f"- Resolve: `{'; '.join(r['resolved'])}`\n")
            f.write(f"- Kết nối: `{r['connect_ok']}`\n")
            f.write(f"- Exit IP: `{r['exit_ip']}`\n")
            f.write(f"- Đánh giá: **{r['rating']}**\n")
            f.write(
                f"- ip-api: country `{ip_api.get('country','')}`, city `{ip_api.get('city','')}`, "
                f"ISP `{ip_api.get('isp','')}`, org `{ip_api.get('org','')}`, "
                f"AS `{ip_api.get('as','')}`, mobile `{ip_api.get('mobile','')}`, "
                f"proxy `{ip_api.get('proxy','')}`, hosting `{ip_api.get('hosting','')}`\n"
            )
            f.write(
                f"- proxycheck: proxy `{pc.get('proxy','')}`, type `{pc.get('type','')}`, "
                f"risk `{pc.get('risk','')}`, provider `{pc.get('provider','')}`, org `{pc.get('organisation','')}`\n\n"
            )

    print(json.dumps({"csv": str(csv_path), "report": str(md_path), "results": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
