#!/usr/bin/env python3
"""
Replace em dashes in article body prose with ordinary punctuation.

Em dash density is the most reliable marker of AI-generated text. On a site
about immigration rules, where visible care is part of the trust signal, a page
studded with them undermines the credibility the content is trying to earn.

Scope rules (important):
  - BODY PROSE ONLY. Em dashes inside YAML frontmatter are left alone: they
    appear in `sources:` labels such as
        - label: "Shanghai Airport — official transport information"
    which are structured data rendered into the page and JSON-LD. Rewriting
    them would corrupt citation labels.
  - Fenced code blocks and inline code spans are skipped.
  - Markdown link destinations are skipped.

Replacement strategy, by role:
  bounded pair  (X — like this — Y)  ->  parentheses: X (like this) Y
  single break  (X — Y)              ->  comma, colon, or full stop, chosen from
                                         the shape of the clause that follows

Usage:
  python3 scripts/sweep-em-dashes.py --dry-run
  python3 scripts/sweep-em-dashes.py --check
  python3 scripts/sweep-em-dashes.py
"""

from __future__ import annotations

import argparse
import glob
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT_GLOB = str(ROOT / "src" / "content" / "**" / "*.md")

EM = "\u2014"
FRONTMATTER = re.compile(r"^---\r?\n(.*?\r?\n)---\r?\n", re.DOTALL)

# A clause that already reads as its own sentence after a break.
SENTENCE_STARTERS = re.compile(
    r"^(it|this|that|they|these|those|you|we|he|she|there|its|the\s+\w+\s+is)\b",
    re.IGNORECASE,
)
# Words that introduce an explanation of what came before.
EXPLANATORY = re.compile(
    r"^(a|an|the|one|two|three|about|roughly|typically|usually|often|most|some|"
    r"both|either|not|no|never|only|just|even|especially|including|such)\b",
    re.IGNORECASE,
)
CONTRASTING = re.compile(r"^(but|yet|however|though|although|instead)\b", re.IGNORECASE)


def split_frontmatter(text: str) -> tuple[str, str]:
    m = FRONTMATTER.match(text)
    if not m:
        return "", text
    return text[: m.end()], text[m.end() :]


def protect(line: str) -> tuple[str, list[str]]:
    """Stash code spans and link targets so they are never rewritten."""
    stash: list[str] = []

    def keep(match: re.Match[str]) -> str:
        stash.append(match.group(0))
        return f"\x00{len(stash) - 1}\x00"

    line = re.sub(r"`[^`]*`", keep, line)
    line = re.sub(r"\]\([^)]*\)", keep, line)
    return line, stash


def restore(line: str, stash: list[str]) -> str:
    for i, original in enumerate(stash):
        line = line.replace(f"\x00{i}\x00", original)
    return line


def choose_single(rest: str, before: str) -> str:
    """
    Pick punctuation for a single em dash break.

    The em dash here is standing in for a real punctuation mark, so the choice
    depends on the grammar of both the clause before and the one after.
    """
    rest = rest.lstrip()
    before = before.rstrip()

    # A clause that stands on its own reads better after a full stop.
    if SENTENCE_STARTERS.match(rest):
        return ". "
    if CONTRASTING.match(rest):
        return ", "
    if EXPLANATORY.match(rest):
        return ": "

    # Two independent clauses must not be joined by a bare comma (splice).
    # "Immigration rules change, always confirm..." is wrong; a colon is right.
    # But never before a coordinating conjunction: "..., and it may be more
    # generous" needs a comma, not a colon.
    if re.match(r"^(and|but|so|or|nor|yet)\b", rest, re.IGNORECASE):
        return ", "

    # A bare imperative following a value or a short clause reads as an
    # instruction about it: "(require 6, carry a buffer)" needs a colon.
    if re.match(r"^(carry|keep|allow|expect|budget|check|confirm|book|add|leave|take)\b",
                rest, re.IGNORECASE):
        return ": "

    before_is_clause = bool(
        re.search(r"\b(is|are|was|were|change|changes|works|work|matters|"
                  r"applies|help|helps|means|takes|needs|requires)\b", before, re.I)
    )
    rest_is_clause = bool(
        re.search(r"^[a-z]+s?\b.{0,40}\b(is|are|was|were|will|can|must|always|"
                  r"never|check|confirm|book|use|take|ask)\b", rest, re.I)
    )
    if before_is_clause and rest_is_clause:
        return ": "

    return ", "


def rewrite_line(line: str) -> str:
    if EM not in line:
        return line

    # Skip pure markdown table separator rows and heading rules.
    if re.match(r"^\s*\|?[\s:|-]+\|?\s*$", line):
        return line

    line, stash = protect(line)

    # Pass 1: bounded pairs become parentheticals.
    #   X — the far airport — and Y   ->   X (the far airport) and Y
    # Skipped when the text before the pair already ends in a parenthesis or
    # asterisk close, where a second bracket reads badly.
    def paired(match: re.Match[str]) -> str:
        inner = match.group(1).strip()
        # A bracket straight after another bracket or a closed emphasis span
        # reads badly, so use commas there instead.
        preceding = line[: match.start()].rstrip()
        if preceding.endswith((")", "*", "`")):
            return f", {inner}, "
        return f" ({inner}) "

    line = re.sub(
        rf"\s*{EM}\s*([^{EM}\n]{{1,220}}?)\s*{EM}\s*",
        paired,
        line,
    )
    # Collapse a duplicate bracket produced by an existing parenthetical.
    line = re.sub(r"\)\s+\((?!.*\))", ") and (", line)

    # Pass 2: any remaining singles become chosen punctuation.
    out: list[str] = []
    for part in line.split(EM):
        out.append(part)
    if len(out) > 1:
        rebuilt = out[0]
        for nxt in out[1:]:
            punct = choose_single(nxt, rebuilt)
            nxt = nxt.lstrip()
            if punct == ". ":
                nxt = nxt[:1].upper() + nxt[1:] if nxt else nxt
            rebuilt += punct + nxt
        line = rebuilt

    # Tidy artifacts: double spaces, space before punctuation, doubled commas,
    # and a doubled full stop when the clause already ends in an abbreviation.
    line = re.sub(r"[ \t]{2,}", " ", line)
    line = re.sub(r"\s+([,.;:!?])", r"\1", line)
    line = re.sub(r",\s*,", ",", line)
    line = re.sub(r":\s*,", ":", line)
    line = re.sub(r"\.\.(?!\.)", ".", line)
    line = re.sub(r"([.!?])\s*\.", r"\1", line)

    return restore(line, stash)


def rewrite_frontmatter_prose(head: str) -> tuple[str, int]:
    """
    Rewrite em dashes in reader-facing frontmatter prose: `title`, `description`,
    `question` and `answer`.

    Deliberately leaves `sources:` labels alone. Those are citation strings and
    become structured data, so editing them would misrepresent the source.

    Em dashes in short display strings are nearly always parenthetical emphasis
    ("Yes — the policy allows..."), so they map to a comma or colon rather than
    to sentence breaks, which would overflow a title or a FAQ answer.
    """
    out: list[str] = []
    changed = 0
    in_sources = False

    for line in head.split("\n"):
        stripped = line.strip()

        # Track entry into and out of the sources list.
        if re.match(r"^sources:\s*$", stripped):
            in_sources = True
            out.append(line)
            continue
        if in_sources and re.match(r"^[a-zA-Z_]+:", stripped) and not stripped.startswith("- "):
            in_sources = False
        if in_sources:
            out.append(line)
            continue

        if EM not in line:
            out.append(line)
            continue

        # Sources can also be written inline on the same line as the key.
        if re.match(r"^(sources|url|label):", stripped):
            out.append(line)
            continue

        key_match = re.match(r"^(\s*(?:title|description|question|answer):\s*)(.*)$", line)
        if not key_match:
            out.append(line)
            continue

        prefix, value = key_match.groups()
        n = value.count(EM)

        # A bounded pair in a display string reads as a parenthetical:
        #   "... or Sanyuanqiao — about 25-35 minutes for ¥25 — then metro ..."
        # becomes "... or Sanyuanqiao (about 25-35 minutes for ¥25) then metro ..."
        value = re.sub(
            rf"\s*{EM}\s*([^{EM}]{{1,120}}?)\s*{EM}\s*",
            lambda m: f" ({m.group(1).strip()}) ",
            value,
        )

        # Short display strings: comma for a light aside, colon when the text
        # after the dash explains or lists.
        def repl(m: re.Match[str]) -> str:
            inner = m.group(1).strip()
            if re.match(r"^(a|an|the|one|two|about|roughly|typically|usually|"
                        r"most|some|both|including|such)\b", inner, re.IGNORECASE):
                return f": {inner}"
            return f", {inner}"

        value = re.sub(rf"\s*{EM}\s*([^{EM}]*)$", repl, value, count=1)
        value = value.replace(EM, ", ")
        value = re.sub(r"[ \t]{2,}", " ", value)
        value = re.sub(r"\s+([,.;:])", r"\1", value)
        value = re.sub(r",\s*,", ",", value)
        value = re.sub(r"\)\s*\)", ")", value)

        out.append(prefix + value)
        changed += n

    return "\n".join(out), changed


def process(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    head, body = split_frontmatter(text)

    before = body.count(EM)
    fm_head, fm_changed = rewrite_frontmatter_prose(head)

    if before == 0 and fm_changed == 0:
        return 0

    lines = body.split("\n")
    in_fence = False
    changed = 0
    for i, line in enumerate(lines):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or EM not in line:
            continue
        new = rewrite_line(line)
        if new != line:
            changed += line.count(EM)
            lines[i] = new

    new_body = "\n".join(lines)
    total = changed + fm_changed
    if total and not dry_run:
        path.write_text(fm_head + new_body, encoding="utf-8")

    return total


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--check",
        action="store_true",
        help="exit non-zero if any body-prose em dash remains",
    )
    args = parser.parse_args()

    files = sorted(glob.glob(CONTENT_GLOB, recursive=True))
    total = 0
    touched = 0

    for name in files:
        path = Path(name)
        n = process(path, args.dry_run or args.check)
        if n:
            total += n
            touched += 1
            print(f"  {n:3}  {path.name}")

    if args.check:
        if total:
            print(f"\nFAIL: {total} em dash(es) remain in body prose across {touched} file(s)")
            return 1
        print("OK: no em dashes in body prose")
        return 0

    verb = "would rewrite" if args.dry_run else "rewrote"
    print(f"\n{verb} {total} em dash(es) across {touched} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
