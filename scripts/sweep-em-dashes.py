#!/usr/bin/env python3
"""
Replace em dashes in article body prose with ordinary punctuation.

Em dash density is the most reliable marker of AI-generated text. On a site
about immigration rules, where visible care is part of the trust signal, a page
studded with them undermines the credibility the content is trying to earn.

Scope rules (important):
  - BODY PROSE, plus reader-facing frontmatter prose (see PROSE_KEYS): `title`,
    `description`, `question`, `answer` for guides, and `city`, `region`,
    `bestFor`, `layoverWindow`, `route`, `transportTips`, `eSimTip`,
    `paymentTip` for cities. Those city fields render as page copy, so leaving
    them out meant the gate could report the content as clean while em dashes
    were visible on the page.
  - `sources:` labels are left alone by default: they are citation strings
    rendered into the page and JSON-LD, so rewriting them edits structured data
    rather than a sentence. Pass `--include-sources` to sweep those too.
  - `url:`, dates, category enums and the `attractions` list are never touched.
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

# Frontmatter keys whose values are rendered as reader-facing prose. Everything
# else in the frontmatter (`sources:`, `url:`, dates, category enums, the
# `attractions` list) is structured data and is left byte-for-byte alone.
#
# The `cities` collection was missing here until now: `layoverWindow`,
# `transportTips`, `eSimTip` and `paymentTip` render as page copy, so em dashes
# in them were reader-visible while the gate reported the content as clean.
PROSE_KEYS = (
    # guides collection
    "title",
    "description",
    "question",
    "answer",
    # cities collection
    "city",
    "region",
    "bestFor",
    "layoverWindow",
    "route",
    "transportTips",
    "eSimTip",
    "paymentTip",
)
PROSE_KEY_PATTERN = "|".join(PROSE_KEYS)

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

# Verbs common enough in this content that their presence means "this side of
# the dash is a clause, not a label". Kept explicit rather than pattern-matched
# on word shape, because a false positive here only ever moves us from a colon
# to a full stop, and a false negative is what produces a comma splice.
DISPLAY_VERB = re.compile(
    r"\b(is|are|was|were|be|been|has|have|had|do|does|did|can|could|will|would|must|should|"
    r"activate|add|allow|arrive|block|book|bring|buy|carry|check|confirm|connect|cost|cover|"
    r"get|give|go|install|keep|land|leave|link|matter|mean|need|open|operate|pay|pick|plan|"
    r"publish|reach|require|run|sell|set|show|start|stay|stop|take|use|wait|walk|work)"
    r"(?:s|es|ed|d|ing|n)?\b",
    re.IGNORECASE,
)

# A question tail ("PEK or PKX — which is better?") takes a comma, never a colon.
QUESTION_START = re.compile(
    r"^(which|who|what|when|where|why|how|can|could|do|does|did|is|are|will|would|should)\b",
    re.IGNORECASE,
)


def choose_display(rest: str, before: str) -> str:
    """
    Punctuation for an em dash in a short display string (a city tip, a FAQ
    question, a card label), where a full stop is often too final.

    Two clauses get a full stop, so an imperative followed by an explanation
    never becomes a comma splice. A label followed by an explanation gets a
    colon. A question tail gets a comma.
    """
    rest = rest.lstrip()
    before = before.rstrip()

    if QUESTION_START.match(rest) or rest.endswith("?"):
        return ", "

    first_clause = re.split(r"(?<=[.!?])\s+", rest, maxsplit=1)[0]
    if DISPLAY_VERB.search(before) and DISPLAY_VERB.search(first_clause):
        return ". "

    return ": "


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


def rewrite_frontmatter_prose(head: str, include_sources: bool = False) -> tuple[str, int]:
    """
    Rewrite em dashes in reader-facing frontmatter prose (see PROSE_KEYS).

    `sources:` labels are citation strings that also become structured data, so
    they are left alone by default. Pass `include_sources=True`
    (`--include-sources`) to sweep them as well; that is the only way to reach a
    page with no em dash at all, since label text renders in the source list.

    Em dashes in short display strings are nearly always parenthetical emphasis
    ("Yes — the policy allows..."), so they map to a comma or colon rather than
    to sentence breaks, which would overflow a title or a FAQ answer.
    """
    out: list[str] = []
    changed = 0
    in_sources = False

    for line in head.split("\n"):
        stripped = line.strip()

        if not include_sources:
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

        # `url:` values are addresses, never prose. Citation labels are prose
        # only when the caller opted in.
        if re.match(r"^(sources|url):", stripped) or (
            not include_sources and stripped.startswith("label:")
        ):
            out.append(line)
            continue

        key_match = re.match(rf"^(\s*(?:- )?(?:{PROSE_KEY_PATTERN}):\s*)(.*)$", line)
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

        # Short display strings: a label keeps a colon, two clauses get a full
        # stop, a question tail gets a comma. See choose_display.
        def repl(m: re.Match[str]) -> str:
            inner = m.group(1).strip()
            punct = choose_display(inner, value[: m.start()])
            if punct == ". ":
                inner = inner[:1].upper() + inner[1:] if inner else inner
            return punct + inner

        value = re.sub(rf"\s*{EM}\s*([^{EM}]*)$", repl, value, count=1)
        value = value.replace(EM, ", ")
        value = re.sub(r"[ \t]{2,}", " ", value)
        value = re.sub(r"\s+([,.;:])", r"\1", value)
        value = re.sub(r",\s*,", ",", value)
        value = re.sub(r"\)\s*\)", ")", value)

        out.append(prefix + value)
        changed += n

    return "\n".join(out), changed


def process(path: Path, dry_run: bool, include_sources: bool = False) -> int:
    text = path.read_text(encoding="utf-8")
    head, body = split_frontmatter(text)

    before = body.count(EM)
    fm_head, fm_changed = rewrite_frontmatter_prose(head, include_sources)

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
        help="exit non-zero if any em dash remains in body prose or reader-facing frontmatter",
    )
    parser.add_argument(
        "--include-sources",
        action="store_true",
        help="also rewrite citation labels inside `sources:` (off by default)",
    )
    args = parser.parse_args()

    files = sorted(glob.glob(CONTENT_GLOB, recursive=True))
    total = 0
    touched = 0

    for name in files:
        path = Path(name)
        n = process(path, args.dry_run or args.check, args.include_sources)
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
