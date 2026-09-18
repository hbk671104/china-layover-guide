#!/usr/bin/env python3
"""
Replace em dashes in code-owned display strings: page titles, template prose and
the airport data that renders into visible tables.

Kept separate from sweep-em-dashes.py because these replacements are not prose
rewrites. Most are title separators needing one canonical glyph, and the rest
are short data strings where a comma reads correctly.

Rules:
  - Title separators ("Page — Brand") become a pipe "|".
  - Comments are skipped, so documentation keeps its original punctuation.
  - Remaining prose asides become a comma.

Usage:
  python3 scripts/sweep-code-dashes.py --dry-run
  python3 scripts/sweep-code-dashes.py
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EM = "\u2014"

TARGET_FILES = [
    "src/data/airports.ts",
    "src/data/payment-matrix.ts",
    "src/data/countries.ts",
    "src/lib/eligibility.ts",
    "src/components/EligibilityChecker.tsx",
    "src/components/GuideList.astro",
    "src/pages/index.astro",
    "src/pages/404.astro",
    "src/pages/about.astro",
    "src/pages/terms.astro",
    "src/pages/privacy.astro",
    "src/pages/guides/index.astro",
    "src/pages/airports/index.astro",
    "src/pages/airports/[code].astro",
    "src/pages/cities/index.astro",
    "src/pages/cities/[city].astro",
    "src/pages/transit-visa/index.astro",
]


def is_comment(line: str) -> bool:
    """Skip comments so documentation prose keeps its original punctuation."""
    s = line.lstrip()
    return s.startswith(("//", "*", "/*"))


def rewrite_line(line: str) -> str:
    if EM not in line:
        return line

    # A pipe belongs only in a title-like string, where the em dash separates a
    # page name from the brand. Detect that narrowly, or sentence-level asides
    # would end up with a pipe mid-prose.
    is_title = bool(
        re.search(r'\b(title|name)\s*[:=]', line)
        or re.search(r'\bHead|headline\b', line)
    )

    if is_title:
        line = line.replace(f" {EM} ", " | ")
        line = line.replace(f"{EM} ", "| ")
    else:
        # Prose aside: comma reads correctly.
        line = line.replace(f" {EM} ", ", ")
        line = line.replace(f" {EM}", ",")
        line = line.replace(EM, ", ")

    line = line.replace("  ", " ")
    line = line.replace(" ,", ",")
    line = line.replace(" .", ".")
    line = line.replace(", ,", ",")
    return line


def process(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    if EM not in text:
        return 0

    lines = text.split("\n")
    changed = 0
    for i, line in enumerate(lines):
        if EM not in line or is_comment(line):
            continue
        new = rewrite_line(line)
        if new != line:
            changed += line.count(EM)
            lines[i] = new

    if changed and not dry_run:
        path.write_text("\n".join(lines), encoding="utf-8")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    total = 0
    for rel in TARGET_FILES:
        path = ROOT / rel
        if not path.exists():
            print(f"  MISSING: {rel}")
            continue
        n = process(path, args.dry_run)
        if n:
            print(f"  {n:3}  {rel}")
            total += n

    verb = "would rewrite" if args.dry_run else "rewrote"
    print(f"\n{verb} {total} em dash(es) in code display strings")
    return 0


if __name__ == "__main__":
    sys.exit(main())
