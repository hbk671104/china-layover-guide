# China Layover Guide — Content Strategy

Last updated: 2026-09-03

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

1. **Factual drift.** `src/data/visa-rules.ts` lists 54 countries (and the array only contains 48). The official NIA policy is **55 countries** (Indonesia added 2025-06-12), **65 designated ports** across **24 provinces**, with **cross-province travel allowed within the permitted areas** (NIA Policy Interpretation, 2025-07-04; earlier announcements cited 60 ports — verify against NIA before publishing). The ports list also needs to be complete.
2. **Thin coverage of the highest-intent searches.** Competitors rank with per-window itineraries ("Shanghai layover 6/8/12 hours") and decision content ("Can I leave the airport?"). This site has one route per city, not per layover window, and does not cover the **30-day visa-free entry vs 240-hour transit** distinction at all.

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
/cities/         ───  Beijing ── 6h / 8h / 12h / 24h · Great Wall run · PEK transfer · luggage
                      Shanghai ─ 6h / 8h / 12h / 24h · Maglev · PVG/SHA transfer · luggage
                      Guangzhou ─ ... · Chengdu ─ ... · Xi'an ─ ...
                      (next) Shenzhen · Hangzhou · Chongqing
```

Every city page links to `/transit-visa/`, `/esim/`, `/payments/` at the relevant moment, and every setup guide links back to a city route. Internal linking between hubs and spokes is the main ranking lever not yet used at scale.

## Editorial calendar (90 days, 60/30/10)

**60% searchable — 13 pieces**

- Weeks 1–2: correctness sprint + rewrite 240h guide; 30-day vs 240h comparison; ports/areas reference (also fixes `visa-rules.ts`).
- Weeks 3–4: Shanghai 6/8/12/24h itinerary series; PVG/SHA transfer guide.
- Weeks 5–6: Beijing 6/8/12/24h series; Great Wall layover guide; PEK/PKX transfer.
- Weeks 7–8: Alipay setup; WeChat Pay + TenPayGo; apps checklist.
- Weeks 9–10: Guangzhou + Chengdu window itineraries (8/12/24h each); CAN/TFU transfer.
- Weeks 11–13: best eSIM comparison; airport Wi-Fi; luggage storage (PVG/PEK).

**30% shareable — 6 pieces**

- 240h mistakes that get you denied
- China layover statistics & facts 2026 (keep fresh)
- "Is a China layover the best stopover deal in travel?" (counterintuitive take)
- First-person case studies: "Shanghai in 8 hours: what we actually saw"
- 30-day visa-free: the rule most travelers don't know they have
- Xi'an window itineraries (Terracotta Army sprint — highly shareable on Reddit/forums)

**10% experimental — 2 bets**

- **Layover window calculator** ("Is my layover long enough?") — input airport + layover hours → recommended plan. Calculators are a 1.38x link format and no competitor has a clean one.
- **Email lead magnet**: "China Layover Cheat Sheet" (visa rules + app checklist + city maps) — captures owned audience for later affiliate launches.

## Distribution (Create Once, Distribute Twice)

- **Flagships:** each city's window-itinerary guide is the flagship. Build it with standalone subheads, lift-out quote boxes (transfer times, minimum windows), and a table of contents. Atomize: 3–5 social posts, one thread/carousel, one checklist graphic per guide.
- **Borrowed (discovery):** answer genuinely useful questions on r/travel, r/Chinavisa, TripAdvisor Beijing/Shanghai forums, and FlyerTalk — linking only when it directly answers the question.
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
