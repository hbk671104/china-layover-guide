# China Layover Guide — Content Strategy

Last updated: 2026-09-24

## Goal & assumptions

- **Primary goal:** organic search traffic and topical authority for the "China layover" niche.
- **Audience:** English-speaking foreign travelers transiting China (US, UK, EU, Canada, Australia) with 6–48 hours on the ground, typically on Europe↔Asia or US↔Asia routes.
- **Monetization:** later, via eSIM / tour / attraction-ticket affiliate links (the `sources[]` content model already leaves room for disclosures).
- **Team:** small/solo — prioritize pieces that reuse the existing content model and interactive tools.

## Current state

| Asset | Status |
|---|---|
| Guide posts | 3 broad posts: `transit-visa`, `esim`, `payments` |
| City pages | 5 (Beijing, Shanghai, Guangzhou, Chengdu, Xi'an), one route each |
| Interactive tools | `EligibilityChecker`, `PaymentRecommender` (real differentiator) |
| Pillar pages | `/transit-visa/`, `/esim/`, `/payments/`, `/cities/` |

**Biggest gaps:**

1. **Factual drift (resolved 2026-09-24).** `src/data/visa-rules.ts` now carries the official **55-country** list (Indonesia added 2025-06-12) and the **65 designated ports** across **24 provinces**, with **cross-province travel allowed within the permitted areas** (NIA Policy Interpretation, 2025-07-04). `visa-rules.test.ts` asserts the 55-country length and unique port ids; re-verify the port list against NIA periodically.
2. **Thin coverage of the highest-intent searches.** Competitors rank with per-window itineraries ("Shanghai layover 6/8/12 hours") and decision content ("Can I leave the airport?"). This site has one route per city, not per layover window, and does not cover the **30-day visa-free entry vs 240-hour transit** distinction at all.

## Keyword demand model (added 2026-09-24)

Demand for this niche was re-measured with the Semrush API (SEO API v3). Two corrections to the original plan:

**1. Semrush has no "global" volume.** It reports per-country databases, so "global" can only be a sum. Because one English page can rank across every English market, prioritize on the **Anglosphere sum (US + UK + CA + AU + IE + NZ)**, not US alone. Singapore and India are large secondary pools; treat them as upside, not the primary target.

| Cluster | Anglosphere monthly volume | KD | Notes |
|---|---|---|---|
| alipay / wechat pay | ~35,000 | 57-59 | brand-dominated; long-term only |
| shanghai airport (+ pudong) | ~23,700 | n/a | biggest winnable target; UK/AU/NZ all contribute |
| china visa / visa free (+ countries) | ~27,000 | 43-56 | UK leads the "visa free" half |
| vpn for china / best vpn for china | ~24,500 | 47 | US-led; a niche competitor ranks #3-5 |
| things to do in shanghai / beijing | ~15,100 | 26 | Shanghai at KD 26 is the best single win |
| esim china / china esim / best esim | ~13,300 | 26-47 | AU/NZ-weighted (AU is ~7x US per capita) |
| china transit visa | ~2,100 | 28 | winnable, low volume |
| **china layover / beijing layover** | **~200** | n/a | effectively zero in every market |

**2. "Layover" is not a search term.** `china layover` is 0/month in the US, UK, Canada, and Australia, and ~190/month worldwide. The demand for this niche sits in the adjacent head terms above. Keep layover framing for long-tail and LLM discovery, but put the head term in the title, H1, and description.

**Market note:** do not build separate UK/AU sites. One English page serves all six markets; the lever is nationality-aware copy (name UK, Australian, Canadian, and EU passport holders explicitly where the rules differ).

### Revised priorities

1. **VPN cluster** — retitle `/guides/esim-vs-vpn-vs-roaming/` onto "vpn for china" / "best vpn for china" (~24,500, KD 47).
2. **City + airport head terms** — city itineraries onto "things to do in {city}"; PVG and Baiyun pages onto the airport names.
3. **New "China visa-free countries" page** — UK-led, feeds the transit cluster.
4. **eSIM** — consolidate the five eSIM pages onto the three head terms, AU/NZ-first.
5. **Alipay / WeChat Pay** — retitle, but treat as long-term (KD 56-59, brand-dominated).
6. **Transit cluster** (`china 240 hour visa free` KD 17, `china transit visa` KD 28) — keep as the topical-authority anchor.
7. **Consolidate** the Shanghai and Guangzhou layover clusters. **Done 2026-09-24:** each city is now one guide that absorbs its N-hour page, its tours page, and its transfer detail; the two "can I leave `<airport>`" pages fold into the national guide, and `pvg-can-luggage-storage` folds into the national luggage guide.

**Status:** 2026-09-24 — retitled 11 guides; added `/guides/china-visa-free-countries/`; consolidated the Shanghai and Guangzhou clusters from 5 guide pages each down to one city guide each. Eight URLs were removed and 301-redirected (`public/_redirects`), with their airport, transfer, and tours detail merged into the two city guides plus the national "can you leave the airport" and luggage-storage guides. Still open: a dedicated `shanghai airport` page.

### GSC signal review (2026-09-29)

Search Console impressions, by cluster. The important finding is that most of the demand GSC surfaced was already served — the gap was **query phrasing**, not missing pages.

| Cluster | Queries (impressions) | Coverage before | Action taken |
|---|---|---|---|
| Airline layover hotel | `does china airlines provide hotel for long layover` (6), `china airlines free transit hotel` (4) | `/guides/china-airline-layover-hotel/` covered the three mainland carriers, but its title answered "Chinese airlines", not the literal "China Airlines" (the Taiwanese carrier, CI) | Retitled to the query; added the CI disambiguation table and a verified CI section (free **half-day tour** on 7–24 h Taipei transits, book 10–45 days ahead; "Discover Taiwan" is a **stopover** hotel, not a transit hotel) |
| Airport / city | `layover in chengdu airport` (6), `shanghai layover tour` (5), `china airport to city` (4), `10 hour layover in guangzhou` (3) | All four already served: `/airports/tfu/`, the tours section of `/guides/shanghai-layover-itinerary/`, `/guides/china-airport-to-city-transfers/`, and the 10-hour plan in `/guides/guangzhou-layover-itinerary/` | Fixed the Guangzhou title, which advertised 6/8/12/24 and omitted the 10-hour plan the body actually contains |
| Payments | `does apple pay work in china` (5), `does google pay work in china` (3) | `/guides/apple-pay-and-google-pay-in-china/` answers both verbatim in FAQ + short answer | None needed — already exact-match |
| Tools | `google maps china` (4) | `/guides/does-google-maps-work-in-china/` had a two-app bullet list | Rebuilt as a map-app comparison table (Amap / Baidu / Apple Maps / Google) plus a "best map app for China" FAQ |

**Decision recorded:** GSC is confirming existing pages rather than requesting new ones. Do **not** create a dedicated Shanghai tours page — the strategy consolidated `shanghai-layover-tours-worth-it` into the city guide on purpose, and a new page would cannibalise it. Strengthen the on-page section instead. Same logic for the Chengdu airport query: `/airports/tfu/` already owns it.

**Open questions for the next pull:** whether `shanghai layover tour` deserves its own URL (only if the city guide's section fails to rank after 4–6 weeks), and whether the third-party carrier list (Hainan, Xiamen, Sichuan) is worth adding to the airline hotel guide.

### GSC signal review (2026-11-06)

Window 2026-09-15 to 11-03: **56 clicks, 4.88K impressions, CTR 1.1%, avg position 12.3**, flat at 7–11 clicks a week. GSC shows **0 external links**, and **20 URLs are "Discovered – currently not indexed"** (never crawled), including `/airports/pvg/`, `best-esim-for-china`, `payments-in-china-for-foreigners` and `beijing-layover-itinerary`. `taobao-for-foreigners` and `/shopping/` are "Crawled – currently not indexed". The bottleneck is domain authority and crawl demand, not missing content: `payments-in-china-for-foreigners` has 12 internal links and still has not been crawled.

| Signal | Action taken |
|---|---|
| `china-airline-layover-hotel` holds 38% of impressions (1,855, pos 8.1) at **0.7% CTR**. The 9-29 retitle lifted it from ~21 to ~45 impressions a day and from 0.34% to 0.75% CTR, but the description gave the answer away and the title omitted China Eastern, which drives half the visible queries | Retitled "Free Hotel on a Long Layover? China Airlines vs China Eastern", teaser description, new "How to apply for China Eastern's transit hotel" section (query `china eastern transit hotel application`) |
| Six guides at pos 5–8 with 0–1.2% CTR: can-you-leave-the-airport, great-wall, apple-pay, airport-wifi, high-speed-rail, apps-checklist | Descriptions rewritten to half-answer plus a hook; the leave-the-airport one now names Shanghai Pudong, which most of its queries ask about |
| Guides carried 1–3 in-body links each; uncrawled pages had few routes in | Guide template now ends with a "Related guides" block (`src/lib/related-guides.ts`): same-category guides in rotation, skipping ones the body already links |
| Visa head terms (`china transit visa` and ~60 variants) sit at pos 70–95 | No on-page action: needs external links first |

**Measure on the next pull (~2026-12-04):** CTR on the seven retitled/redescribed pages against the figures above, and whether the 20 discovered URLs move to crawled. Do not add new pages until they do. Unresolved: China Eastern's hub list disagrees inside the airline guide (body: Shanghai, Beijing, Kunming, Nanjing, Wuxi; table and FAQ: Shanghai, Beijing, Kunming, Xi'an), and the official page could not be read to settle it.

### Keyword demand refresh (2026-11-06)

71 candidate keywords measured through the Semrush MCP server (`phrase_these`) in the US, UK, AU, CA and NZ databases. The full export (`docs/research/semrush-keywords-2026-11-06.csv`) is kept locally and not committed, since this repo is public and raw Semrush data should not be republished. Volumes are monthly and summed across the five markets; KD is the US figure unless noted. Most guides run 370–550 words and the city and airport pages 330–470 visible words, so most of this plan is depth, not new URLs.

| Rank | Cluster | Key terms (5-market volume, KD) | Coverage now | Plan |
|---|---|---|---|---|
| 1 | Shanghai airports | shanghai airport 21,600 (54); shanghai maglev 5,110 (38); shanghai pudong airport 3,880 (45); pudong airport 2,800 (35); pudong airport hotel 1,530 (34) | `/airports/pvg/`, 471 words, never crawled | The largest cluster measured, ~35,000 a month. Rebuild PVG as the full airport guide, with Maglev and airport-hotel sections strong enough to split out later |
| 2 | Things to do in {city} | shanghai 11,780 (26); beijing 5,940 (21); guangzhou 4,820 (31); shenzhen 3,500 (30); chengdu 2,570 (15); chongqing 2,170 (22); hangzhou 1,100 (25); xiamen 490 (17) | Five itinerary guides (410–1,682 words) plus duplicate 330–450-word city pages; no guide for Shenzhen, Chongqing, Hangzhou or Xiamen | Lowest KD for the volume. Deepen the five guides with a full attraction list that gives each stop's time from the airport, merge each duplicate city page into its guide, then build Shenzhen, Chongqing and Hangzhou. Xi'an was not measured |
| 3 | Other hub airports | beijing daxing airport 4,810 (25); guangzhou baiyun airport 2,870 (37); chengdu tianfu airport 1,110 (37); beijing capital airport 680 (44) | Templated airport pages | Same rebuild as PVG; PKX has the lowest KD of any airport term |
| 4 | Visa by nationality | china visa for us citizens 6,710 (53); australians 900; uk citizens 780; indians 560 (41); canadians 510 | `visa-free-vs-visa-china` (498 words) | New pages built on the rule data in `src/data/`. The AU, UK and CA terms each sit almost entirely in their own market at KD 28 or below |
| 5 | Attractions | mutianyu great wall 10,900 (53, navigational); chengdu panda base 8,870 (41) | `great-wall-from-beijing-layover` (808 words); the Chengdu guide (410 words) | Expand the existing guides first; dedicated pages only if they rank |
| 6 | eSIM | esim china 6,190 (56); best esim for china 3,750 (36) | `best-esim-for-china` (882 words, never crawled) | Deepen with first-hand tests; this is the affiliate page |
| 7 | VPN | vpn for china 12,550 (50); best vpn for china 8,640 (52); US CPC $3.87–4.93 | `esim-vs-vpn-vs-roaming` (472 words) | The biggest commercial pool, but only worth doing with real testing and an affiliate decision |
| — | Transit visa | china visa free countries 2,490 (57); china transit visa 2,230 (40); 240 hour visa free china 490 (21) | Hub and guides at position 34–90 | Authority-limited: no new pages |
| — | Payments and maps | google maps in china 1,020; alipay for foreigners 520; wechat pay for foreigners 380; how to use alipay in china 320; amap english 310 | Existing guides | Deepen when convenient |

**Dropped by the data:** separate airline-transit pages (china eastern / air china / china southern transit hotel 140–180 a month each, other "transit" variants 40 or less; keep them as sections of the airport and airline-hotel pages), the legacy 72- and 144-hour names (100 or less), and layover phrasing (shanghai, guangzhou and beijing layover 70–120, layover in china 90), which confirms the September finding. `china transit hotel` and `24 hour transit china` measured zero.

**Runs in parallel, unranked:** link-earning assets, namely the statistics page with a policy-change timeline and an airline free-hotel checker. With zero external links, the KD 35–57 terms above will not move on content alone.

This refines the 11-06 rule against new pages: rebuild existing pages first, and add new URLs only for ranks 2 and 4. Each new page must be a full guide, linked from strong pages and submitted in URL inspection when it ships.

## Content pillars

### Pillar 1 — Visa-free transit & entry rules (`/transit-visa/`)
The reason the site exists; highest trust stakes.

- 240-hour visa-free transit guide (existing — rewrite with 55/65/24 facts)
- 24-hour vs 240-hour visa-free transit: what's the difference?
- **30-day visa-free entry vs 240-hour transit: which applies to you?** ← biggest missing piece
- Complete list of 65 ports + permitted areas (reference page — link magnet, feeds the checker)
- The A→B→C "third country/region" rule (do Hong Kong / Macau / Taiwan count?)
- Eligible countries list (55, kept current)
- Common mistakes that get transit travelers denied (shareable)
- Arrival card & the step-by-step immigration process
- Hotel registration for foreigners (24-hour rule)

### Pillar 2 — Connectivity before you land (`/esim/`)
High commercial intent, natural affiliate fit.

- China eSIM setup before you land (existing)
- Best eSIM for China: 2026 comparison (decision stage, affiliate-ready)
- eSIM vs VPN vs roaming: what actually keeps your apps working
- China airport Wi-Fi: the SMS catch and how to get online
- Does Google Maps / WhatsApp / Instagram work in China?

### Pillar 3 — Payments & apps (`/payments/`)
The `PaymentRecommender` is unique; build content around it.

- How to pay in China (existing hub)
- Alipay for foreigners: step-by-step setup with a foreign card
- WeChat Pay for foreigners + TenPayGo explained
- Do you need cash in China? (high-volume FAQ)
- Apple Pay / Google Pay in China: why tap-to-pay fails
- China apps checklist: what to install before you fly

### Pillar 4 — City layover itineraries (`/cities/`)
The biggest content moat and most searchable long tail.

- 5 city pages (existing — keep as city hubs)
- **Per-window itineraries** for each city: 6 / 8 / 12 / 24 / 48-hour plans ← the core play
- Airport-to-city transfer guides (PVG, SHA, PEK, PKX, CAN, TFU, XIY)
- Great Wall from a Beijing layover: is it possible? (high-emotion query)
- Luggage storage at each major airport
- New cities: Shenzhen, Hangzhou, Chongqing, then Kunming, Xiamen, Qingdao, Nanjing, Guilin

### Pillar 5 (later) — Layover logistics
Airport transfers, luggage storage, DiDi ride-hailing, intercity trains, safety/scams. Only after Pillars 1–4 are strong.

### Pillar 6 — Shopping & deliveries (`/shopping/`)
Layover-window shopping, added 2026-10-23. The window, not the trip length, is what makes it work: order from Taobao before you fly, collect the parcels at your hotel, and carry them home. First spoke is the Taobao guide; likely next spokes are markets, duty-free, and shipping a haul home.

## Priority topics (scored)

Weighting: Customer Impact 40%, Content-Market Fit 30%, Search Potential 20%, Resources 10%.

| # | Topic / title | S/S/B | Type | Target keyword (buyer stage) | CI | CMF | SP | Res | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Can I leave the airport during a China layover? | Searchable | Decision hub + calculator | "can I leave the airport during a layover in china" (awareness) | 10 | 10 | 9 | 8 | **9.6** |
| 2 | Shanghai layover: 6, 8, 12, 24-hour itineraries | Searchable | Use-case series | "shanghai layover things to do" (awareness) | 10 | 10 | 9 | 6 | **9.4** |
| 3 | Great Wall from a Beijing layover | Searchable | Use-case | "great wall from beijing airport layover" (awareness) | 10 | 10 | 8 | 7 | **9.3** |
| 4 | 30-day visa-free entry vs 240-hour transit | Searchable | Comparison | "china 30 day visa free" (consideration) | 9 | 10 | 9 | 7 | **9.1** |
| 5 | Alipay for foreigners: step-by-step | Searchable | How-to | "how to set up alipay as a foreigner" (implementation) | 9 | 10 | 8 | 8 | **9.0** |
| 6 | Best eSIM for China (2026 comparison) | Both | Comparison + affiliate | "best esim for china" (decision) | 9 | 9 | 9 | 7 | **8.8** |
| 7 | 240-hour transit: full list of 65 ports & permitted areas | Searchable | Reference page | "china 240 hour visa free transit ports" (consideration) | 8 | 10 | 8 | 8 | **8.6** |
| 8 | Airport transfer guides (PVG/SHA/PEK/PKX/CAN/TFU/XIY) | Searchable | How-to | "shanghai pudong airport to city" (implementation) | 9 | 9 | 8 | 7 | **8.6** |
| 9 | WeChat Pay + TenPayGo for foreigners | Searchable | How-to | "wechat pay for foreigners" (implementation) | 8 | 10 | 8 | 8 | **8.6** |
| 10 | 240-hour transit mistakes that get you denied | Shareable | Thought leadership | "china transit visa denied" (awareness) | 9 | 9 | 7 | 8 | **8.5** |
| 11 | China apps checklist: install before you fly | Searchable | Template/checklist | "apps to download before china trip" (implementation) | 8 | 9 | 8 | 9 | **8.4** |
| 12 | New city hubs: Shenzhen, Hangzhou, Chongqing | Searchable | Use-case | "shenzhen layover things to do" (awareness) | 8 | 9 | 7 | 6 | **7.9** |

**Link-magnet wildcard:** "China Layover Statistics & Facts" — a maintained stats page (55 countries, 65 ports, 240h = 10 days, airport→city transfer times, minimum layover windows). Curated stat roundups earn ~4x the backlinks of original research, and citable one-liners are exactly what LLMs lift. Low search volume, high compounding value — slot into the 30% shareable bucket.

## Topic cluster map

```
/transit-visa/  ───  240h guide · 24h vs 240h · 30-day vs transit · ports list ·
                      third-country rule · denial mistakes · arrival card · hotel registration
/esim/           ───  setup guide · best eSIM comparison · eSIM vs VPN · airport Wi-Fi ·
                      "do my apps work?"
/payments/       ───  hub · Alipay setup · WeChat Pay/TenPayGo · cash FAQ ·
                      Apple/Google Pay · apps checklist
/shopping/       ───  Taobao guide · (next) markets · duty-free · shipping a haul home
/cities/         ───  Beijing ── 6h / 8h / 12h / 24h · Great Wall run · PEK transfer · luggage
                      Shanghai ─ 6h / 8h / 12h / 24h · Maglev · PVG/SHA transfer · luggage
                      Guangzhou ─ ... · Chengdu ─ ... · Xi'an ─ ...
                      (next) Shenzhen · Hangzhou · Chongqing
```

Every city page links to `/transit-visa/`, `/esim/`, `/payments/` at the relevant moment, and every setup guide links back to a city route. Internal linking between hubs and spokes is the main ranking lever not yet used at scale.

## Operating plan (from 2026-11-09)

Replaces the September 90-day calendar, most of which has shipped. Roughly 5–6 hours a week.

### Rhythm

| How often | What | Time |
|---|---|---|
| Daily | Answer 2 Reddit questions (r/chinatravel and similar); keep a list of good questions as topic ideas | 20 min |
| Weekly | One deep piece, alternating a new page and an upgrade of an existing one. Verify against official sources, add first-hand photos where possible, link from 2–3 strong pages, request indexing on launch | 2–3 h |
| Weekly | GSC check: new queries with impressions, pages entering the top 10 | 15 min |
| Monthly | GSC review like the 11-06 one: CTR, positions, indexing via URL inspection | 1 h |
| Monthly | Outreach with the statistics page to 5–10 writers; check GSC Links for new referring domains | 1 h |
| Monthly | Check the NIA policy pages for list or port changes | 10 min |
| Quarterly | Update the statistics page after each NIA release (mid January, April, July, October; full-year figures late January) | 30 min |
| Quarterly | Re-verify rules pages (visa, airline hotels, payments) | 2 h |
| Quarterly | Semrush keyword refresh through the MCP server (~3,000 units) | 30 min |

### Next 8 weeks

| Week of | Main task | Why |
|---|---|---|
| 2026-11-09 | Shanghai "things to do" long-form, merging `/cities/shanghai/`; turn on Cloudflare Web Analytics | 11,780 searches a month, KD 26 |
| 2026-11-16 | Guangzhou Baiyun (CAN) airport guide | Australian traffic; China Southern hub |
| 2026-11-23 | Beijing "things to do" long-form, with a shopping section and first-hand photos | 5,940, KD 21; shopping terms add ~4,250 |
| 2026-11-30 | CTR review (counted from each page's recrawl, not 11-06); Beijing Capital (PEK) airport guide | PEK pairs with PKX for "beijing airport" (9,580, KD 26) |
| December, first half | Nationality visa pages: Australia, UK, Canada | KD 28 or below |
| December, second half | US citizens visa page | 6,710, KD 53 |
| Late January 2027 | Statistics page update with full-year 2026 NIA figures, then outreach | Fresh data is the best pitch |

Measure leading indicators first: impressions trend, pages in the top 10, referring domains. Clicks will lag by months.

### Later keyword data (2026-11-06 and 11-09)

- **Daxing:** "beijing airport" 9,580 (KD 26), "beijing daxing international airport" 5,640, "daxing airport" 5,500, "beijing daxing airport" 4,810 (KD 25), "pkx airport" 2,220. Long-tail terms such as "daxing airport express" (190) are sections, not pages.
- **Shopping (US+UK+AU):** "taobao for foreigners" is ~60 a month, so the Taobao guide ranks around position 6 but gets ~3 impressions a day. Travel-shopping terms run in the hundreds: Silk Market 950, shopping in Shanghai 600, China souvenirs 440, how to use Taobao 420, shopping in Beijing 400. Decision: no standalone shopping pillar; shopping becomes sections in the Shanghai and Beijing guides. "taobao english" (14,700) is mostly overseas shoppers; only add an English-interface section to the Taobao guide once verified.

### Monetization

- **Now:** Cloudflare Web Analytics; 2–3 affiliate programs matched to the strongest pages (Trip.com for hotels and trains, one eSIM provider actually tested, Klook or GetYourGuide for tours); a disclosure policy first. The About page ("no sponsored rankings") and privacy page ("no advertising trackers") must be updated before any affiliate link goes live, and links carry `rel="sponsored nofollow"`.
- **Not now:** display ads, paid placements, and affiliate links on rules pages (visa, transit, third-country), whose value is trust.
- **At ~1,000 visits a month:** a "policy change alerts" email list; placement tuning from analytics; evaluate a VPN page only with real testing.

### Reddit guidelines

- Answer fully in the comment; a link is extra detail, not the answer. Roughly nine in ten replies carry no link.
- Disclose when linking the site ("my site"), and pair it with the official source (NIA) on rules questions.
- Check each subreddit's rules first; no link-only replies, no new-account links, no vote manipulation, no shorteners or UTM tags.
- Reddit links are nofollow: the value is referrals, brand, forum and AI visibility, and topic ideas, not link equity.

## Distribution (Create Once, Distribute Twice)

- **Flagships:** each city's window-itinerary guide is the flagship. Build it with standalone subheads, lift-out quote boxes (transfer times, minimum windows), and a table of contents. Atomize: 3–5 social posts, one thread/carousel, one checklist graphic per guide.
- **Borrowed (discovery):** answer genuinely useful questions on r/chinatravel, r/travel, TripAdvisor Beijing/Shanghai forums, and FlyerTalk, following the Reddit guidelines above.
- **Rented (engagement):** Pinterest (travel planning), X/LinkedIn threads for shareable pieces.
- **Owned (conversion):** the cheat-sheet email signup is the destination; every hub page should offer it.

## Priority zero — implement first

1. Update `src/data/visa-rules.ts`: 55 countries (add Indonesia + the missing Balkan/Belarus countries), full 65-port list, permitted areas per official NIA, cross-province rule. The checker is wrong on every page until this is fixed.
2. Rewrite `src/content/guides/240-hour-visa-free-transit.md` to match.
3. Add the 30-day visa-free vs 240-hour comparison — the single fastest search win.
4. Extend the `category` enum in `src/content.config.ts` when adding pillars beyond `transit-visa | esim | payments` (e.g., `logistics`).

## Implementation notes

- Every factual page carries a `Last updated` date and `Sources`. **Verify immigration and payment facts against official sources before publishing changes.**
- New guide categories require editing the `category` enum in `src/content.config.ts`.
- New cities require the `cities` collection frontmatter: `city`, `region`, `bestFor`, `layoverWindow`, `attractions[]`, `route`, `transportTips`, `eSimTip`, `paymentTip`, `mapLink`.
- Per-window itineraries can be hand-written city spokes (start with Shanghai/Beijing) or a structured `itineraries` collection later if the matrix grows programmatic.
