#!/usr/bin/env python3
"""
Fix stale review dates inside article body text so they agree with each entry's
`updated` frontmatter, which is the source of truth.

Why the frontmatter wins: `updated` records when a human last reviewed the page
against official sources. Filesystem timestamps cannot stand in for that — git
rewrites them on clone, rebase and checkout — so they are never read here.

Use this when src/content/dates.test.ts reports that a body review date
contradicts its frontmatter.

Usage:
  python3 scripts/sync-dates.py --dry-run
  python3 scripts/sync-dates.py
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "src" / "content" / "guides"
CITIES = ROOT / "src" / "content" / "cities"

FRONTMATTER = re.compile(r"^---\r?\n(.*?)\r?\n---", re.DOTALL)


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

    total = 0
    for directory in (GUIDES, CITIES):
        for path in sorted(directory.glob("*.md")):
            declared = frontmatter_date(path)
            if not declared:
                print(f"skip  {path.name} (no updated field)")
                continue

            for change in fix_body_dates(path, declared, args.dry_run):
                print(("would fix   " if args.dry_run else "fixed   ") + change)
                total += 1

    verb = "would update" if args.dry_run else "updated"
    print(f"\n{verb} {total} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
