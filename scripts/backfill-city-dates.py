#!/usr/bin/env python3
"""
Insert a missing `updated:` frontmatter field into city entries, seeded from the
file's creation date.

The cities schema now requires `updated` (so city pages carry a lastmod and a
visible review date like guides do). This backfills existing entries once; from
then on scripts/sync-dates.py keeps it accurate.

Usage:
  python3 scripts/backfill-city-dates.py --dry-run
  python3 scripts/backfill-city-dates.py
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CITIES = ROOT / "src" / "content" / "cities"

FRONTMATTER = re.compile(r"^---\r?\n(.*?)\r?\n---", re.DOTALL)


def created_date(path: Path) -> str:
    stat = path.stat()
    created = getattr(stat, "st_birthtime", None) or stat.st_mtime
    return dt.datetime.fromtimestamp(created).strftime("%Y-%m-%d")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    changed = 0
    for path in sorted(CITIES.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        match = FRONTMATTER.match(text)
        if not match:
            print(f"skip  {path.name} (no frontmatter)")
            continue

        block = match.group(1)
        if re.search(r"^updated:", block, re.MULTILINE):
            continue

        date = created_date(path)
        # Place it right after mapLink so ordering matches the guides' shape.
        anchor = re.search(r"^mapLink:.*$", block, re.MULTILINE)
        if anchor:
            new_block = (
                block[: anchor.end()] + f"\nupdated: {date}" + block[anchor.end() :]
            )
        else:
            new_block = block + f"\nupdated: {date}"

        new_text = text[: match.start(1)] + new_block + text[match.end(1) :]

        if not args.dry_run:
            path.write_text(new_text, encoding="utf-8")

        print(("would add  " if args.dry_run else "added  ") + f"{path.name}: updated: {date}")
        changed += 1

    verb = "would backfill" if args.dry_run else "backfilled"
    print(f"\n{verb} {changed} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
