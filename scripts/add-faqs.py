#!/usr/bin/env python3
"""
Add `faqs:` frontmatter to guides that lack it, so every guide emits FAQPage
schema and can surface in rich results.

The questions are drawn from what each page already answers, not invented. If a
question is not addressed in the body, fix the body rather than the FAQ.

Usage:
  python3 scripts/add-faqs.py --dry-run
  python3 scripts/add-faqs.py
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "src" / "content" / "guides"

FRONTMATTER = re.compile(r"^---\r?\n(.*?)\r?\n---", re.DOTALL)


def yaml_escape(value: str) -> str:
    """Escape for a double-quoted YAML scalar."""
    return value.replace("\\", "\\\\").replace('"', '\\"')


def build_faqs(pairs: list[tuple[str, str]]) -> str:
    lines = ["faqs:"]
    for question, answer in pairs:
        lines.append(f'  - question: "{yaml_escape(question)}"')
        lines.append(f'    answer: "{yaml_escape(answer)}"')
    return "\n".join(lines)


FAQS: dict[str, list[tuple[str, str]]] = {
    "240-hour-transit-ports-and-permitted-areas": [
        (
            "How many ports can I enter China through under the 240-hour visa-free transit policy?",
            "There are 65 designated ports across 24 provinces, autonomous regions and municipalities. Entry must be at a designated port, so check your arrival city against the current list before booking.",
        ),
        (
            "Can I travel between provinces on 240-hour visa-free transit?",
            "Yes, within the permitted areas. Cross-province travel is allowed between participating regions, so an entry in Beijing can combine with a stay in Shanghai. You still cannot travel anywhere in China, and you must exit through a designated port within 240 hours.",
        ),
        (
            "What counts as a third country or region for China transit?",
            "Your onward destination must differ from where you came from. Hong Kong, Macau and Taiwan each count as a separate region, so London to Shanghai to Hong Kong is generally valid transit, while a round trip back to London is not.",
        ),
        (
            "How do I know which areas I am permitted to visit?",
            "The permitted area depends on your port of entry. Many ports cover a whole province or region, while others are restricted to specific cities. Check the entry for your arrival port before planning any travel beyond the city.",
        ),
    ],
    "30-day-visa-free-vs-240-hour-transit": [
        (
            "Is the 30-day visa-free entry better than 240-hour transit?",
            "For most eligible travelers, yes. It is longer, simpler, and has no third-country requirement, so a round trip qualifies. Use the transit policy only when your nationality is not on the 30-day list, or when you hold a visa already.",
        ),
        (
            "Can I use the 30-day visa-free entry for a transit stop?",
            "Yes. If your nationality is on the 30-day list, you can enter on that instead of the transit policy, and the onward-ticket rule no longer applies to you.",
        ),
        (
            "What disqualifies me from the 240-hour transit policy?",
            "Three things most often: a passport that is not on the 55-country list, an onward ticket that returns to where you came from rather than a third country or region, and entering at a port that is not designated for transit.",
        ),
        (
            "Do I need a visa if I qualify for either scheme?",
            "No. Both are visa-free entry routes. The transit policy is a form of visa-free entry, not a visa, so you do not need a separate visa as long as you meet its conditions.",
        ),
    ],
    "best-esim-for-china": [
        (
            "Which eSIM is best for a China layover?",
            "Any plan that routes data outside the mainland firewall, because that is what keeps Google Maps, WhatsApp and Gmail working. Compare on routing and hotspot support rather than headline price, and install it before you fly.",
        ),
        (
            "How much data do I need for a short layover?",
            "For a layover of a day or two, a modest plan is usually enough. Maps, translation and messaging use little data; video and large uploads are what burn through it. Check whether the plan throttles after a daily cap, since that matters more than the total.",
        ),
        (
            "Do I need a VPN as well as an eSIM?",
            "Usually not. A travel eSIM that routes data outside mainland China already gets you to the apps you need. A VPN is a separate tool for when you are on local Wi-Fi or a local SIM instead.",
        ),
        (
            "Can I install a China eSIM after I land?",
            "Technically yes, but it is a bad plan. You need working internet to download the profile, and airport Wi-Fi in China typically requires an SMS code you may not be able to receive. Install and activate it before departure.",
        ),
    ],
    "can-you-leave-the-airport-during-a-china-layover": [
        (
            "Can I leave the airport during a China layover?",
            "Yes, in most cases. If you hold an eligible passport and a confirmed onward ticket to a third country or region, you can enter visa-free at a designated port and leave the airport. Nationalities on the 30-day visa-free list can use that instead.",
        ),
        (
            "Do I need a visa to leave the airport?",
            "Not if you qualify for visa-free entry. Either the 240-hour transit policy or the 30-day visa-free entry lets you clear immigration and go into the city. Without one of those, you need a visa to leave the transit area.",
        ),
        (
            "How long a layover do I need to leave the airport?",
            "About 7 hours is the practical minimum at most major airports, and 8 or more is comfortable. Below 6 hours, immigration plus the transfer each way and a 2.5-hour return buffer leave no usable time.",
        ),
        (
            "What happens if I miss my onward flight?",
            "You are responsible for it, and the airline is not obliged to rebook you for free. That is why the return buffer matters more than maximizing city time. Build in 2.5 hours before an international departure, and longer if you have bags to check.",
        ),
    ],
    "esim-setup-before-you-land": [
        (
            "Why do I need an eSIM before landing in China?",
            "Because the apps you rely on are blocked on local networks, and you need working data the moment you land for maps, translation and ride-hailing. An eSIM that routes data outside the mainland keeps those apps working.",
        ),
        (
            "When should I install and activate my eSIM?",
            "Install the profile before you fly, at home, on reliable Wi-Fi. Activate it so it is ready on arrival, or set it to activate on landing if your provider supports that.",
        ),
        (
            "Will my regular SIM still work?",
            "Your home SIM keeps working for calls and texts if you leave it enabled, but its data will not bypass the firewall. Use the eSIM for data and keep the physical SIM for receiving verification codes.",
        ),
        (
            "Can I get a Chinese eSIM instead?",
            "Chinese carriers sell local SIMs and eSIMs, but those route through mainland networks, so the apps you need stay blocked without a VPN. For a short layover, a travel eSIM is the simpler choice.",
        ),
    ],
    "great-wall-from-beijing-layover": [
        (
            "Can you see the Great Wall on a Beijing layover?",
            "Yes, but it takes most of a day. You need roughly 10 hours or more, a morning arrival, and a pre-booked private car. Anything less and you are risking your onward flight.",
        ),
        (
            "How long do you need to visit the Great Wall from Beijing?",
            "At least 10 hours, with a morning arrival. That is the minimum that is genuinely worth it: the drive is 1.5 hours each way from PEK and 2.5 hours from PKX, and you get roughly 2 to 3 hours actually on the wall. From Daxing, add 2 to 4 hours to every threshold.",
        ),
        (
            "Which Great Wall section is closest to Beijing airport?",
            "Mutianyu is the closest practical section and the usual choice on a layover. It is restored, less crowded than Badaling, and has a cable car, which matters when you are short on time. The scenic hiking sections like Jinshanling and Simatai are too far for a layover.",
        ),
        (
            "Should I take a taxi or a tour to the Great Wall?",
            "Neither, if you are on a layover. A pre-booked private car or driver for the day is the only realistic option, because you need someone waiting at the wall for the return leg rather than you hunting for a ride.",
        ),
    ],
    "payments-in-china-for-foreigners": [
        (
            "Can I use my Visa or Mastercard in China?",
            "At large hotels and some international chains, yes. Most everyday places, including restaurants, markets and taxis, are QR-payment only, so a card alone will not cover a normal day.",
        ),
        (
            "Do I need Alipay or WeChat Pay as a foreigner?",
            "Yes, if you want to shop and eat where locals do. Both accept foreign cards now. Alipay is the easier setup and the one to do first, with WeChat Pay as backup.",
        ),
        (
            "Can I still use cash in China?",
            "Cash is legal tender and must be accepted, but in practice small vendors often cannot make change, and some are genuinely cashless. Carry a small amount as backup rather than as your main method.",
        ),
        (
            "Which payment app should I set up first?",
            "Alipay. It has the simpler foreign-card flow and broader acceptance at small merchants. Add WeChat Pay afterwards as a second option in case one has an issue with your card.",
        ),
    ],
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    added = 0
    for slug, pairs in FAQS.items():
        path = GUIDES / f"{slug}.md"
        if not path.exists():
            print(f"  MISSING FILE: {slug}")
            continue

        text = path.read_text(encoding="utf-8")
        match = FRONTMATTER.match(text)
        if not match:
            print(f"  NO FRONTMATTER: {slug}")
            continue

        if re.search(r"^faqs:", match.group(1), re.MULTILINE):
            print(f"  already has faqs: {slug}")
            continue

        block = match.group(1)
        new_block = block.rstrip("\n") + "\n" + build_faqs(pairs)
        new_text = text[: match.start(1)] + new_block + text[match.end(1) :]

        if not args.dry_run:
            path.write_text(new_text, encoding="utf-8")

        print(("would add " if args.dry_run else "added ") + f"{len(pairs)} faqs to {slug}")
        added += 1

    verb = "would update" if args.dry_run else "updated"
    print(f"\n{verb} {added} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
