#!/usr/bin/env python3
"""
Generate public/llms-full.txt from the content collections.

llms.txt is a signpost: a curated index of URLs. llms-full.txt is the library:
the entire corpus in one file, so an agent gets everything in a single request
instead of crawling 78 pages.

Run this after content changes, before committing. The output is committed so
the deployed site serves it as a static file.

Usage:
  python3 scripts/build-llms-full.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "src" / "content" / "guides"
CITIES = ROOT / "src" / "content" / "cities"
OUT = ROOT / "public" / "llms-full.txt"

SITE = "https://chinalayoverguide.com"
FRONTMATTER = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)

CATEGORY_TITLES = {
    "transit-visa": "Visa-free transit and entry rules",
    "esim": "eSIM and connectivity",
    "payments": "Payments and apps",
    "cities": "City layover trips",
    "logistics": "Airport transfers and logistics",
}


def parse(path: Path) -> dict:
    """Split one markdown entry into frontmatter fields and body."""
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER.match(text)
    if not match:
        return {"body": text, "fields": {}}

    fields: dict[str, str] = {}
    for line in match.group(1).split("\n"):
        # Only top-level scalar keys; nested lists (sources, faqs) are handled
        # separately by build_sources / build_faqs.
        m = re.match(r"^([a-zA-Z_]+):\s*(.+)$", line)
        if m:
            fields[m.group(1)] = m.group(2).strip().strip('"')

    return {"body": text[match.end() :], "fields": fields, "raw": match.group(1)}


def build_sources(raw: str) -> str:
    """Render the sources: list as markdown bullets."""
    labels = re.findall(
        r'^\s*-\s*label:\s*"?(.*?)"?\s*$', raw, re.MULTILINE
    )
    urls = re.findall(r'^\s*url:\s*"?(.*?)"?\s*$', raw, re.MULTILINE)
    if not labels:
        return ""
    lines = ["**Sources**", ""]
    for i, label in enumerate(labels):
        url = urls[i] if i < len(urls) else ""
        lines.append(f"- {label}" + (f": {url}" if url else ""))
    return "\n".join(lines)


def build_faqs(raw: str) -> str:
    """Render the faqs: list as a Q&A block."""
    qs = re.findall(r'^\s*-\s*question:\s*"?(.*?)"?\s*$', raw, re.MULTILINE)
    ans = re.findall(r'^\s*answer:\s*"?(.*?)"?\s*$', raw, re.MULTILINE)
    if not qs:
        return ""
    lines = ["**Frequently asked questions**", ""]
    for i, q in enumerate(qs):
        a = ans[i] if i < len(ans) else ""
        lines.append(f"### {q}")
        lines.append("")
        lines.append(a)
        lines.append("")
    return "\n".join(lines).rstrip()


def entry_block(path: Path, url: str) -> str:
    parsed = parse(path)
    fields = parsed["fields"]
    raw = parsed.get("raw", "")

    parts = [
        f"## {fields.get('title', path.stem)}",
        "",
        f"Source: {url}",
    ]
    if fields.get("updated"):
        parts.append(f"Last updated: {fields['updated']}")
    parts.append("")
    parts.append(parsed["body"].strip())

    faqs = build_faqs(raw)
    if faqs:
        parts.extend(["", faqs])

    sources = build_sources(raw)
    if sources:
        parts.extend(["", sources])

    return "\n".join(parts)


def main() -> int:
    guides = sorted(GUIDES.glob("*.md"))
    cities = sorted(CITIES.glob("*.md"))

    if not guides:
        print("no guides found", file=sys.stderr)
        return 1

    # Group guides by category so the file reads in a sensible order.
    by_category: dict[str, list[Path]] = {}
    for path in guides:
        parsed = parse(path)
        cat = parsed["fields"].get("category", "other")
        by_category.setdefault(cat, []).append(path)

    chunks: list[str] = [
        "# China Layover Guide — full content",
        "",
        "> Complete text of every guide and city page on chinalayoverguide.com, "
        "for AI assistants and search engines. Visa-free transit rules, eSIM setup, "
        "payments and apps, airport transfers, and city layover itineraries. "
        "Facts are checked against official sources; each page carries a last-updated date.",
        "",
        f"Canonical index: {SITE}/llms.txt",
        f"Page count: {len(guides)} guides, {len(cities)} city pages",
        "",
        "---",
        "",
    ]

    for cat, paths in by_category.items():
        chunks.append(f"# {CATEGORY_TITLES.get(cat, cat.title())}")
        chunks.append("")
        for path in sorted(paths, key=lambda p: p.stem):
            chunks.append(entry_block(path, f"{SITE}/guides/{path.stem}/"))
            chunks.append("")
            chunks.append("---")
            chunks.append("")

    chunks.append("# City layover pages")
    chunks.append("")
    for path in cities:
        parsed = parse(path)
        fields = parsed["fields"]
        block = [
            f"## {fields.get('city', path.stem)}",
            "",
            f"Source: {SITE}/cities/{path.stem}/",
        ]
        if fields.get("updated"):
            block.append(f"Last updated: {fields['updated']}")
        block.append("")
        block.append(parsed["body"].strip())
        chunks.append("\n".join(block))
        chunks.append("")
        chunks.append("---")
        chunks.append("")

    text = "\n".join(chunks).rstrip() + "\n"
    OUT.write_text(text, encoding="utf-8")

    words = len(text.split())
    print(f"wrote {OUT.relative_to(ROOT)}: {len(text):,} bytes, ~{words:,} words")
    return 0


if __name__ == "__main__":
    sys.exit(main())
