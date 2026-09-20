#!/usr/bin/env python3
"""
Ping IndexNow with the site's URLs after a deploy.

IndexNow is a shared protocol (Bing, Yandex, Seznam, Naver) for telling search
engines a URL changed, instead of waiting for them to rediscover it. Bing is the
one that matters most here: Microsoft Copilot answers run entirely on the Bing
index, so a page Bing has not crawled cannot be cited by Copilot.

The key file must already be deployed and reachable before pinging:
  https://chinalayoverguide.com/<key>.txt

Usage:
  python3 scripts/indexnow.py --dry-run        # show what would be sent
  python3 scripts/indexnow.py                  # submit all URLs
  python3 scripts/indexnow.py --urls /a/ /b/   # submit specific paths
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY_FILE = ROOT / ".secrets" / "indexnow-key.txt"
SITEMAP = ROOT / "dist" / "sitemap-0.xml"

HOST = "chinalayoverguide.com"
ENDPOINT = "https://api.indexnow.org/indexnow"
# IndexNow accepts up to 10,000 URLs per request.
BATCH = 10_000


def read_key() -> str:
    if not KEY_FILE.exists():
        sys.exit(f"missing {KEY_FILE.relative_to(ROOT)}")
    key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not key:
        sys.exit("indexnow-key.txt is empty")
    return key


def ensure_key_file(key: str) -> Path:
    """
    IndexNow requires the key file to be served at /<key>.txt, where the filename
    is the key itself. public/indexnow-key.txt is the editable source; this
    mirrors it to the correctly named file that actually gets deployed.
    """
    served = ROOT / "public" / f"{key}.txt"
    if not served.exists() or served.read_text(encoding="utf-8").strip() != key:
        served.write_text(key + "\n", encoding="utf-8")
    return served


def read_sitemap_urls() -> list[str]:
    if not SITEMAP.exists():
        sys.exit(
            f"missing {SITEMAP.relative_to(ROOT)} — run `npm run build` first"
        )
    import re

    xml = SITEMAP.read_text(encoding="utf-8")
    return re.findall(r"<loc>(.*?)</loc>", xml)


def build_payload(key: str, urls: list[str]) -> dict:
    return {
        "host": HOST,
        "key": key,
        "keyLocation": f"https://{HOST}/{key}.txt",
        "urlList": urls,
    }


def post(payload: dict) -> tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "chinalayoverguide-indexnow/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except urllib.error.URLError as e:
        return 0, str(e.reason)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--urls",
        nargs="*",
        help="specific paths to submit, e.g. --urls /guides/240-hour-visa-free-transit/",
    )
    args = parser.parse_args()

    key = read_key()
    ensure_key_file(key)

    if args.urls:
        urls = [
            u if u.startswith("http") else f"https://{HOST}{u}"
            for u in args.urls
        ]
    else:
        urls = read_sitemap_urls()

    if not urls:
        sys.exit("no URLs to submit")

    print(f"key:  {key}")
    print(f"key file: https://{HOST}/{key}.txt")
    print(f"urls: {len(urls)}")
    print()

    # IndexNow returns 200 for success and 202 when it accepts but does not
    # validate every key. 403 means the key file was not reachable.
    if args.dry_run:
        print("dry run — would POST:")
        print(json.dumps(build_payload(key, urls[:5]), indent=2))
        if len(urls) > 5:
            print(f"  ... and {len(urls) - 5} more")
        return 0

    status, body = post(build_payload(key, urls))
    print(f"HTTP {status}")
    if body.strip():
        print(body.strip())

    if status in (200, 202):
        print("\nOK — URLs submitted")
        return 0

    if status == 403:
        print(
            "\n403: the key file is not reachable. Deploy first, then confirm "
            f"https://{HOST}/{key}.txt returns 200."
        )
    elif status == 422:
        print("\n422: the URLs or key did not match the host.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
