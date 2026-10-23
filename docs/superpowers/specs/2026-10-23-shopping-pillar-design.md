# Shopping pillar: giving the Taobao guide a home

**Date:** 2026-10-23
**Status:** approved 2026-10-23, built
**Size:** small. One new hub, one new category wired through existing patterns, one guide, plus copy fixes.

## Intent

Foreigners want to buy from Taobao, and the layover is what makes it possible: for a few days you have a Chinese address. The site has no home for that. Five categories exist (`transit-visa`, `esim`, `payments`, `cities`, `logistics`) and none of them is shopping. Filing the guide under payments or logistics buries the angle and creates a fourth copy of Alipay fee facts.

The play stays inside the layover window: shopping as something a 48-hour-plus stop in one city enables. It is not a general e-commerce guide.

## Goals

- A `/shopping/` hub and a `shopping` category labelled **Shopping**.
- Publish the Taobao guide as the first spoke, linking canonical facts instead of restating them.
- Room for future spokes (markets, duty-free, shipping a haul home) without touching the taxonomy again.

## Non-goals

- Shipping agents, parcel forwarders, or "buy from Taobao without visiting China".
- Per-page OG images. That generator was deleted; every page uses `/og-default.png`.
- New interactive components, or retitles of existing guides.

## Anti-goals

- A second source of truth for visa, fee, or card-limit facts.
- A hub that silently stays at one guide forever.

## Constraints found in the repo

- `category` is a zod enum in `src/content.config.ts`; three label maps already disagree (`GuideList.astro`, `authors.ts`, `search-index.ts`), and `/guides/` keeps a fourth ordered group list.
- `authorForCategory()` falls back to `authors[0]` without warning, so an unassigned category would be bylined Nora Li by accident.
- `llms.txt` is hand-maintained; `llms-full.txt` is generated. Sitemap and search index pick up content automatically, but a new hub needs a `SITE_PAGES` entry.
- `dates.test.ts` requires any in-body review date to equal the frontmatter date.
- The header nav carries six links at the `md` breakpoint; a seventh needs a 768–1024px check.
- Homepage copy says "four things decide whether a China layover works" while listing five pillars.

## Approaches

1. **New pillar plus `/shopping/` hub (picked).** Give the guide a real home and a category of its own. Trades a thin hub for a few weeks and one more nav item against a pillar that can grow.
2. **New `shopping` category rendered inside `/logistics/`.** Cheaper, but produces a category with no hub, so `/guides/` would show a group whose label goes nowhere.
3. **File it under `logistics`, add the hub when a second guide exists.** Zero taxonomy work today, but hides the shopping angle among transfers and luggage, which is the thing we are trying to surface.

## What changes

| File | Change |
|---|---|
| `src/content.config.ts` | `shopping` added to the category enum |
| `src/pages/shopping/index.astro` | New hub, built from the `/logistics/` template (CollectionPage JSON-LD, GuideList) |
| `src/components/Header.astro` | `Shopping` link after Payments |
| `src/components/Footer.astro` | `Order from Taobao before you fly` added to Start here |
| `src/pages/index.astro` | Sixth pillar card; phrasing checked so the list still reads as one system |
| `src/components/GuideList.astro` | `shopping: 'Shopping'` |
| `src/data/authors.ts` | `shopping` label; `shopping` added to Bokang Huang's categories |
| `src/pages/guides/index.astro` | Sixth group: `Shopping & deliveries` |
| `src/lib/search-index.ts` | `CATEGORY_LABELS.shopping`; `/shopping/` in `SITE_PAGES`; homepage body reworded from "four things" |
| `src/content/guides/taobao-for-foreigners.md` | The guide |
| `public/llms.txt` | Hub and guide entries |
| `docs/content-strategy.md` | Pillar 6 and the cluster map |

## The guide

**Slug** `/guides/taobao-for-foreigners/`, **title** "Taobao for Foreigners: Shopping During a China Layover" (head term in the title, layover framing kept).

**Frontmatter:** `category: shopping`, `updated: 2026-10-23`, `sources: []` with NIA, Alipay, and the four customs authorities, `faqs: []` lifted from the draft's FAQ section so the FAQPage schema renders.

**Copy fixes from the fact check:**

- The 48-hour requirement is the draft's own buffer, not a rule. Rewrite as "at least 48 hours in one city, having ordered before you fly", and make the time table about delivery feasibility rather than eligibility.
- "Most orders arrive in 1–3 days" becomes next day within a province, 2–3 days across, allow up to 5. Taobao's own "7–14 business days" figure is international shipping and must not appear.
- Scope the power-bank rule to domestic flights (CAAC, 3C mark, since 2025-06-28); international departures follow the airline, not that rule.
- Drop the visa-rules restatement (57 countries, 65 ports, 24 provinces, third-country rule). Replace with a pointer to the eligibility checker and the 240-hour guide.
- Replace the `[embedded content: sample plan for a 72-hour layover · 6 steps]` placeholder with a real table.
- Verify the customs allowances (US $800, EU €430, UK £390, AU A$900) against each authority before publishing.

**Internal links:** 240-hour transit guide, 30-day vs transit, Alipay setup, hotel registration, luggage storage, and the city pages for the sample plan.

## My calls

- URL and label: `/shopping/`, "Shopping".
- Leave the three existing label maps' other strings alone for now; only the new entry is added.
- Byline: **Nora Li** (the draft's @Nuoya Li is her handle). `shopping` added to her categories, role and bio rather than to a second author.
- Title follows the revised draft, "How to Shop on Taobao While Traveling in China". The slug keeps the head term at `/guides/taobao-for-foreigners/`, and the description carries the layover framing.
- Nav order: after Payments, before City trips.

## Amendments made during the build

- **Nav breakpoint moved from `md` to `lg`.** Seven links overflowed the bar at 800px (header scrolled to 840px and the Search button clipped). The `Sections` menu moved with it, and 360–1280px now renders without horizontal overflow.
- **Homepage heading no longer counts the pillars.** "The five things a layover depends on" became "What a layover depends on", because the list now has six entries.
- **External links resolved as instructed:** travel-site links (trip.com, traveltochina.net, chinaneighbor, fishgoo, the substack, realchinaguide, Wikipedia) are gone. Visa rules point at the internal 240-hour guide, Alipay fees at the internal Alipay guide, and the National Immigration Administration link is kept in both the body and the sources. The power-bank claim now cites CAAC and the US customs figure cites CBP.
- **Sample plan** is a table, matching the city-guide style.

## Verification

`npm test`, a scratch `astro build`, `npm run check:links`, a grep that every guide category has a label, and a rendered check of `/shopping/`, `/guides/`, the guide itself, and a `/taobao` search hit.
