# China Layover Guide — Shared Agent Instructions

This repository powers **https://chinalayoverguide.com/**, an independent English-language guide for foreign travelers transiting mainland China (240-hour visa-free transit, airline free transit hotels, airport layover hotels, eSIMs, foreign-card payments, and city trips).

## Start Here in Every New Chat

Before making plans or edits, read the relevant local state files so all specialized chats (SEO, Photos, Link Building, Monetization) share one source of truth:

1. **Always check first**: `docs/ops/status.md` (local-only master snapshot of site metrics, recent PRs, and current priorities).
2. **Product & voice context**: `.agents/product-marketing.md` and `docs/content-strategy.md`.
3. **Track-specific local trackers** (all gitignored under `docs/ops/`):
   - SEO / Content / GSC experiments → `docs/ops/seo-experiments.md`
   - Photos & App screenshots → `docs/ops/photo-checklist.md`
   - Link building / Outreach / Reddit → `docs/ops/outreach-tracker.md`

After completing meaningful changes, update the matching `docs/ops/*.md` file and `docs/ops/status.md` so the next chat sees your latest progress.

## Tech Stack & Publishing Workflow

- **Framework**: Astro 7 + React islands + Tailwind CSS v4, static output (`dist/`), hosted on **Cloudflare Pages**.
- **Design tokens** (`src/styles/global.css`): warm paper `#faf7f2`, surface `#fffdf9`, ink `#191311`, muted `#5e544c`, line `#e7dfd4`, lacquer red accent `#b3251b`, tint `#f8e9e6`. Typography: Fraunces (display) + Geist (body).
- **Branches & deploy**:
  - Develop and commit on **`dev`** (never commit untracked `.claude/` or local `docs/ops/`).
  - Push `origin/dev`, open and merge a PR into **`main`** (`gh pr create` + `gh pr merge --merge`) to trigger Cloudflare Pages production deployment.
- **Required checks before pushing content changes**:
  1. Update `public/llms.txt` whenever adding a new guide URL.
  2. Run `python3 scripts/build-llms-full.py` to regenerate `public/llms-full.txt`.
  3. Run `npm test` (Vitest, includes `dates.test.ts` validating `updated` dates) and `npm run build`.
  4. Optionally run `python3 scripts/indexnow.py` after deploy to notify Bing / Copilot.

## Editorial, SEO & Image Standards

- **House style**: crisp, matter-of-fact, Beijing-local voice. **Never use em dashes (`—`)** in frontmatter or prose (use colons or periods instead); use straight apostrophes in YAML frontmatter (normalized by `src/content.config.ts`). Avoid generic AI phrasing ("ultimate", "game-changer", "it's not X, it's Y").
- **Accuracy**: verify immigration, airline, and payment claims against official sources (NIA, airlines, airports) and cite them in `sources[]`. Keep frontmatter `updated` aligned with any in-body review date.
- **Headings**: never add `## Related guides` inside guide Markdown (the template `src/pages/guides/[slug].astro` auto-renders `<h2 id="related-guides">Related guides</h2>`; use `## Further reading` for manual link lists).
- **Images**:
  - Multi-step mobile app walkthroughs: 1200×920 horizontal 3-step strips on `#faf7f2` paper with `#b3251b` callouts (see `public/images/guides/china-eastern-transit-hotel-app.jpg` and `air-china-transit-hotel-app.jpg`). Visually inspect every generated image before committing.
  - Real-world photos: horizontal preferred, 1000–1200px wide, compressed JPG (~100–220 KB), embedded with `<figure><img src="..." width="..." height="..." loading="lazy" decoding="async" alt="..." /><figcaption>...</figcaption></figure>`.

## Monetization & Outreach Guardrails

- **Monetization**: focus on contextual travel affiliates (Travelpayouts: Trip.com, GetYourGuide, Klook, Airalo) on high-intent pages (hotels, tours, eSIMs). **Never place affiliate links on pure visa/transit-rule claims** and always mark affiliate links `rel="sponsored nofollow noopener"`. No display ads at low traffic.
- **Link building & Reddit**: white-hat only (outdated 144h replacements, tool/stats outreach, helpful forum answers). On Reddit, answer completely without requiring a click (~9 in 10 replies carry no link), disclose `"my site"` when linking, pair visa answers with official NIA links, and never use shorteners or UTMs.
