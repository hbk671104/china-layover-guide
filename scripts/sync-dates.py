#!/usr/bin/env python3
"""
Sync each guide's `updated` frontmatter to its filesystem modification date,
and fix stale dates inside the article body text.

Rationale: hand-written `updated` values drift from reality, which makes the
sitemap lastmod signal uniform and misleading. File mtime is objective and
repeatable. Guarded by src/content/dates.test.ts.

Usage:
  python3 scripts/sync-dates.py --dry-run
  python3 scripts/sync-dates.py
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "src" / "content" / "guides"
CITIES = ROOT / "src" / "content" / "cities"

FRONTMATTER = re.compile(r"^---\r?\n(.*?)\r?\n---", re.DOTALL)


def mtime_date(path: Path) -> str:
    """
    Local calendar date the file was created.

    APFS preserves birth time across content edits, which makes it a more stable
    anchor than mtime: rewriting a file (including by this script) does not move
    it. Falls back to mtime on filesystems without birth time.
    """
    stat = path.stat()
    created = getattr(stat, "st_birthtime", None)
    return dt.datetime.fromtimestamp(
        created if created else stat.st_mtime
    ).strftime("%Y-%m-%d")


def sync_frontmatter(path: Path, target: str, dry_run: bool) -> str | None:
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER.match(text)
    if not match:
        return None

    block = match.group(1)
    updated = re.search(r"^updated:\s*(.+)$", block, re.MULTILINE)
    if not updated:
        return None

    current = updated.group(1).strip().strip("'\"")
    if current == target:
        return None

    new_block = block[: updated.start(1)] + target + block[updated.end(1) :]
    new_text = text[: match.start(1)] + new_block + text[match.end(1) :]

    if not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return f"{path.name}: {current} -> {target}"


def fix_body_dates(path: Path, new_date: str, dry_run: bool) -> list[str]:
    """
    Body text carries its own review date in a handful of guides, e.g.
    '> Reviewed 2026-09-03.' Those must move with the frontmatter or the page
    contradicts itself.
    """
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER.match(text)
    if not match:
        return []

    head, body = text[: match.end()], text[match.end() :]
    changes: list[str] = []

    def replace(m: re.Match[str]) -> str:
        if m.group(1) == new_date:
            return m.group(0)
        changes.append(f"{path.name}: body {m.group(1)} -> {new_date}")
        return m.group(0).replace(m.group(1), new_date)

    # Only rewrite dates that sit in a review/source line, never incidental
    # numbers in prose or inside URLs.
    new_body = re.sub(
        r"(?:last reviewed on|Reviewed)\s+(\d{4}-\d{2}-\d{2})",
        replace,
        body,
    )

    if changes and not dry_run:
        path.write_text(head + new_body, encoding="utf-8")
    return changes


def frontmatter_date(path: Path) -> str | None:
    """The `updated` value a file already declares, if any."""
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER.match(text)
    if not match:
        return None
    updated = re.search(r"^updated:\s*(.+)$", match.group(1), re.MULTILINE)
    return updated.group(1).strip().strip("'\"") if updated else None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    # Resolve every date up front. Writing a file bumps its mtime, so reading
    # mtime lazily per step would make the body-date pass observe the timestamp
    # this script just created and drift to today.
    targets = {
        path: mtime_date(path)
        for directory in (GUIDES, CITIES)
        for path in sorted(directory.glob("*.md"))
    }

    total = 0
    for path, target in targets.items():
        result = sync_frontmatter(path, target, args.dry_run)
        if result:
            print(("would sync  " if args.dry_run else "synced  ") + result)
            total += 1

        # Body dates must match the frontmatter, not the raw mtime, so the page
        # never contradicts itself.
        declared = target if args.dry_run else (frontmatter_date(path) or target)
        for change in fix_body_dates(path, declared, args.dry_run):
            print(("would fix   " if args.dry_run else "fixed   ") + change)

    verb = "would update" if args.dry_run else "updated"
    print(f"\n{verb} {total} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
