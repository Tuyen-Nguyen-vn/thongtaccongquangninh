import csv
import json
import sqlite3
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

import urllib.parse
import urllib.request


BASE = Path(r"D:\.phanmemmkt\UserData\MKT Page")
APP_DB = BASE / "com.mkt-page.app.db"
PROXY_DB = BASE / "com.mkt-page.app.proxy.db"
REPORT_DIR = Path(r"D:\.thongtaccongquangninh\reports")
TARGET_UIDS = ["100078466495339", "100078294932272"]


def mask_proxy(host, port, username):
    user = (username or "")[:4] + "***" if username else ""
    return f"{host}:{port}:{user}:***"


def proxy_string(row):
    return f"{row['host']}:{row['port']}:{row['username']}:{row['password']}"


def proxy_key_from_string(value):
    if not value:
        return None
    parts = str(value).split(":")
    if len(parts) < 2:
        return None
    try:
        return parts[0], int(parts[1])
    except Exception:
        return None


def curl_test(row, url):
    args = [
        "curl.exe",
        "-sS",
        "--max-time",
        "12",
        "--proxy",
        f"http://{row['host']}:{row['port']}",
        "--proxy-user",
        f"{row['username']}:{row['password']}",
        url,
    ]
    started = time.time()
    cp = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    elapsed = int((time.time() - started) * 1000)
    out = (cp.stdout or cp.stderr).strip()
    return {"rc": cp.returncode, "ms": elapsed, "out": out[:300]}


def read_json_url(url):
    try:
        with urllib.request.urlopen(
            urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 proxy-audit"}),
            timeout=20,
        ) as resp:
            return json.loads(resp.read().decode("utf-8", "replace"))
    except Exception as exc:
        return {"error": f"{type(exc).__name__}: {str(exc)[:160]}"}


def get_reputation(exit_ip):
    ip_api = read_json_url(
        "http://ip-api.com/json/"
        + urllib.parse.quote(exit_ip, safe=":")
        + "?fields=status,message,country,regionName,city,isp,org,as,asname,mobile,proxy,hosting,query"
    )
    pc_resp = read_json_url(
        "https://proxycheck.io/v2/"
        + urllib.parse.quote(exit_ip, safe=":")
        + "?vpn=1&asn=1&risk=1&port=1&seen=1&days=7"
    )
    return ip_api, pc_resp.get(exit_ip, pc_resp)


def rating_for(connect_ok, ip_api, proxycheck, is_282_proxy):
    if is_282_proxy:
        return "XOA_282"
    if not connect_ok:
        return "DIE"
    proxy_yes = str((proxycheck or {}).get("proxy", "")).lower() == "yes"
    risk_raw = str((proxycheck or {}).get("risk", "0"))
    risk = int(risk_raw) if risk_raw.isdigit() else 0
    if proxy_yes or risk >= 66 or bool((ip_api or {}).get("proxy")) or bool((ip_api or {}).get("hosting")):
        return "RUI_RO_CAO"
    if bool((ip_api or {}).get("mobile")) and risk < 33:
        return "TOT_MOBILE"
    if risk < 33 and not bool((ip_api or {}).get("proxy")) and not bool((ip_api or {}).get("hosting")):
        return "TAM_ON_BUSINESS"
    return "CAN_THEO_DOI"


def audit_proxy(row, is_282_proxy=False):
    tests = {
        "https_api64": curl_test(row, "https://api64.ipify.org?format=json"),
        "https_ipify": curl_test(row, "https://api.ipify.org?format=json"),
    }
    exit_ip = ""
    for name in ["https_api64", "https_ipify"]:
        test = tests[name]
        if test["rc"] == 0:
            try:
                exit_ip = json.loads(test["out"]).get("ip", "")
            except Exception:
                exit_ip = test["out"].strip()
            if exit_ip:
                break
    ip_api, proxycheck = ({}, {})
    if exit_ip:
        ip_api, proxycheck = get_reputation(exit_ip)
    rating = rating_for(bool(exit_ip), ip_api, proxycheck, is_282_proxy)
    return {
        "id": row["id"],
        "host": row["host"],
        "port": row["port"],
        "username": row["username"],
        "password": row["password"],
        "proxy_masked": mask_proxy(row["host"], row["port"], row["username"]),
        "status_db": row["status"],
        "protocol": row["protocol"],
        "proxyType": row["proxyType"],
        "profileAssign": row["profileAssign"],
        "lastChecked": row["lastChecked"],
        "is_282_proxy": is_282_proxy,
        "exit_ip": exit_ip,
        "ip_api": ip_api,
        "proxycheck": proxycheck,
        "tests": tests,
        "rating": rating,
    }


def backup_db(src_path, suffix):
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = src_path.with_name(f"{src_path.stem}.before-{suffix}-{stamp}{src_path.suffix}")
    with sqlite3.connect(str(src_path)) as src, sqlite3.connect(str(backup)) as dst:
        src.backup(dst)
    return backup


def main():
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    app_backup = backup_db(APP_DB, "cleanup-282-assign-proxy")
    proxy_backup = backup_db(PROXY_DB, "cleanup-282-assign-proxy")

    app = sqlite3.connect(str(APP_DB), timeout=30)
    app.row_factory = sqlite3.Row
    proxy_con = sqlite3.connect(str(PROXY_DB), timeout=30)
    proxy_con.row_factory = sqlite3.Row
    app.execute("pragma busy_timeout=30000")
    proxy_con.execute("pragma busy_timeout=30000")

    try:
        locked_rows = app.execute(
            """
            select uid, proxy, checkpoint_state, last_action
            from account
            where deletedAt is null and coalesce(checkpoint_state,'') like '%282%'
            """
        ).fetchall()
        locked_keys = {proxy_key_from_string(row["proxy"]) for row in locked_rows if proxy_key_from_string(row["proxy"])}

        proxies = proxy_con.execute(
            """
            select id,host,port,username,password,status,protocol,proxyType,lastChecked,
                   country,timezone,provider,profileAssign,createdAt,updatedAt
            from proxies
            where deletedAt is null
            order by host, port
            """
        ).fetchall()
        proxies = [dict(row) for row in proxies]

        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [
                executor.submit(audit_proxy, row, (row["host"], int(row["port"])) in locked_keys)
                for row in proxies
            ]
            audits = [future.result() for future in as_completed(futures)]
        audits.sort(key=lambda r: (r["host"], int(r["port"])))

        now_local = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        now_utc = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

        deleted = []
        for result in audits:
            if result["is_282_proxy"]:
                proxy_con.execute(
                    """
                    update proxies
                    set deletedAt=?, updatedAt=?, status='Die'
                    where id=? and deletedAt is null
                    """,
                    (now_local, now_local, result["id"]),
                )
                deleted.append(result)
        proxy_con.commit()

        # Recompute current account assignment counts after deleting bad proxies.
        assigned_counts = {}
        for row in app.execute("select uid, proxy from account where deletedAt is null and proxy is not null"):
            key = proxy_key_from_string(row["proxy"])
            if key:
                assigned_counts[key] = assigned_counts.get(key, 0) + 1

        good_order = {
            "TOT_MOBILE": 0,
            "TAM_ON_BUSINESS": 1,
            "CAN_THEO_DOI": 2,
            "RUI_RO_CAO": 3,
            "DIE": 4,
            "XOA_282": 5,
        }
        candidates = [
            r
            for r in audits
            if r["rating"] in {"TOT_MOBILE", "TAM_ON_BUSINESS"}
            and not r["is_282_proxy"]
            and (r["host"], int(r["port"])) not in locked_keys
        ]
        candidates.sort(
            key=lambda r: (
                good_order.get(r["rating"], 9),
                assigned_counts.get((r["host"], int(r["port"])), 0),
                int((r.get("proxycheck") or {}).get("risk") or 0),
                r["host"],
                int(r["port"]),
            )
        )

        if len(candidates) < len(TARGET_UIDS):
            raise RuntimeError(f"Không đủ proxy ổn để gán: cần {len(TARGET_UIDS)}, có {len(candidates)}")

        assignments = []
        used_ids = set()
        for uid in TARGET_UIDS:
            chosen = next(r for r in candidates if r["id"] not in used_ids)
            used_ids.add(chosen["id"])
            px = f"{chosen['host']}:{chosen['port']}:{chosen['username']}:{chosen['password']}"
            cur = app.execute("select uid, proxy, checkpoint_state from account where uid=? and deletedAt is null", (uid,)).fetchone()
            if not cur:
                raise RuntimeError(f"Không tìm thấy UID {uid}")
            app.execute(
                """
                update account
                set proxy=?, updatedAt=?, has_changed=1
                where uid=? and deletedAt is null
                """,
                (px, now_local, uid),
            )
            assignments.append({"uid": uid, "proxy": chosen})

        app.commit()

        # Update profileAssign from account table for active proxies.
        assigned_counts = {}
        for row in app.execute("select proxy from account where deletedAt is null and proxy is not null"):
            key = proxy_key_from_string(row["proxy"])
            if key:
                assigned_counts[key] = assigned_counts.get(key, 0) + 1
        for result in audits:
            if not result["is_282_proxy"]:
                proxy_con.execute(
                    """
                    update proxies
                    set profileAssign=?, lastChecked=?, updatedAt=?
                    where id=? and deletedAt is null
                    """,
                    (
                        assigned_counts.get((result["host"], int(result["port"])), 0),
                        now_utc if result["exit_ip"] else result["lastChecked"],
                        now_local,
                        result["id"],
                    ),
                )
        proxy_con.commit()

        verify_accounts = []
        for row in app.execute(
            "select uid, proxy, checkpoint_state, last_action, status from account where uid in (?,?) order by uid",
            TARGET_UIDS,
        ):
            data = dict(row)
            key = proxy_key_from_string(data["proxy"])
            data["proxy_masked"] = ""
            if key:
                parts = data["proxy"].split(":")
                data["proxy_masked"] = mask_proxy(parts[0], int(parts[1]), parts[2] if len(parts) >= 3 else "")
            data.pop("proxy", None)
            verify_accounts.append(data)

        app_integrity = app.execute("pragma integrity_check").fetchone()[0]
        proxy_integrity = proxy_con.execute("pragma integrity_check").fetchone()[0]
        active_after = proxy_con.execute("select count(*) from proxies where deletedAt is null").fetchone()[0]
    finally:
        app.close()
        proxy_con.close()

    csv_path = REPORT_DIR / f"MKT_PAGE_PROXY_STATUS_AFTER_CLEANUP_{stamp}.csv"
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        fieldnames = [
            "proxy_masked",
            "deleted_282",
            "rating",
            "exit_ip",
            "db_status",
            "protocol",
            "profileAssign_before",
            "isp",
            "org",
            "asn",
            "mobile",
            "ip_api_proxy",
            "hosting",
            "proxycheck_proxy",
            "proxycheck_type",
            "proxycheck_risk",
            "https_api64_ms",
            "https_ipify_ms",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in audits:
            ip_api = r.get("ip_api") or {}
            pc = r.get("proxycheck") or {}
            writer.writerow(
                {
                    "proxy_masked": r["proxy_masked"],
                    "deleted_282": r["is_282_proxy"],
                    "rating": r["rating"],
                    "exit_ip": r["exit_ip"],
                    "db_status": r["status_db"],
                    "protocol": r["protocol"],
                    "profileAssign_before": r["profileAssign"],
                    "isp": ip_api.get("isp", ""),
                    "org": ip_api.get("org", ""),
                    "asn": ip_api.get("as", ""),
                    "mobile": ip_api.get("mobile", ""),
                    "ip_api_proxy": ip_api.get("proxy", ""),
                    "hosting": ip_api.get("hosting", ""),
                    "proxycheck_proxy": pc.get("proxy", ""),
                    "proxycheck_type": pc.get("type", ""),
                    "proxycheck_risk": pc.get("risk", ""),
                    "https_api64_ms": r["tests"]["https_api64"]["ms"],
                    "https_ipify_ms": r["tests"]["https_ipify"]["ms"],
                }
            )

    md_path = REPORT_DIR / f"MKT_PAGE_PROXY_STATUS_AFTER_CLEANUP_{stamp}.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(f"# MKT Page proxy cleanup and assignment - {stamp}\n\n")
        f.write(f"- App DB backup: `{app_backup}`\n")
        f.write(f"- Proxy DB backup: `{proxy_backup}`\n")
        f.write(f"- Active proxies before: `{len(audits)}`\n")
        f.write(f"- Deleted/soft-deleted 282 proxies: `{len(deleted)}`\n")
        f.write(f"- Active proxies after: `{active_after}`\n")
        f.write(f"- App DB integrity: `{app_integrity}`\n")
        f.write(f"- Proxy DB integrity: `{proxy_integrity}`\n\n")

        f.write("## Assignments\n\n")
        for item in assignments:
            r = item["proxy"]
            f.write(f"- UID `{item['uid']}` -> `{r['proxy_masked']}`; rating `{r['rating']}`; exit `{r['exit_ip']}`\n")

        f.write("\n## Deleted 282 proxies\n\n")
        for r in deleted:
            f.write(f"- `{r['proxy_masked']}`; exit `{r['exit_ip']}`; old rating `{r['rating']}`\n")

        f.write("\n## Proxy status\n\n")
        for r in audits:
            ip_api = r.get("ip_api") or {}
            pc = r.get("proxycheck") or {}
            f.write(
                f"- `{r['proxy_masked']}` | deleted_282 `{r['is_282_proxy']}` | rating `{r['rating']}` | "
                f"exit `{r['exit_ip']}` | ISP `{ip_api.get('isp','')}` | AS `{ip_api.get('as','')}` | "
                f"proxycheck `{pc.get('proxy','')}/{pc.get('type','')}/risk {pc.get('risk','')}`\n"
            )

    print(
        json.dumps(
            {
                "app_backup": str(app_backup),
                "proxy_backup": str(proxy_backup),
                "deleted_282": [r["proxy_masked"] for r in deleted],
                "assignments": [
                    {"uid": item["uid"], "proxy": item["proxy"]["proxy_masked"], "rating": item["proxy"]["rating"], "exit_ip": item["proxy"]["exit_ip"]}
                    for item in assignments
                ],
                "verify_accounts": verify_accounts,
                "active_before": len(audits),
                "active_after": active_after,
                "app_integrity": app_integrity,
                "proxy_integrity": proxy_integrity,
                "csv": str(csv_path),
                "report": str(md_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
