# China Layover Guide

Content-first site for foreign travelers on a China layover: 240-hour visa-free transit rules, eSIM setup before landing, payments (Alipay / WeChat Pay / TenPayGo), and quick city trips.

Built with **Astro + React islands + Tailwind CSS**, static output, deployed to **Cloudflare Pages**.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # Vitest unit tests for the rule engines
npm run check      # astro check (TypeScript + Astro diagnostics)
npm run build      # static build into dist/
npm run preview    # preview the built site locally
```

## Content

- Articles: `src/content/guides/*.md` (frontmatter: `title`, `description`, `category`, `updated`, `sources[]`)
- Cities: `src/content/cities/*.md` (frontmatter per the `cities` schema in `src/content.config.ts`)
- Rule data for the interactive widgets: `src/data/visa-rules.ts` and `src/data/payment-matrix.ts`

Every factual page carries a `Last updated` date and `Sources`. **Verify immigration and payment facts against official sources before publishing changes.**

## Deploy to Cloudflare Pages

Option A — Git integration (recommended):
1. Push this repo to GitHub/GitLab.
2. In Cloudflare Pages, create a project connected to the repo.
3. Build command: `npm run build`; output directory: `dist`.

Option B — Direct upload:
```bash
npx wrangler pages deploy dist
```

Before going live, set the production domain in `astro.config.mjs` (`site`) so canonical URLs and the sitemap use the real hostname.

## Notes

- `astro` is pinned to `7.2.10`: `astro@7.3.0` fails static builds with `./_internal/logger is not exported` (package regression). Upgrade once a fixed version is published.
- The OG image is a generated 1200×630 PNG (`public/og-default.png`), served as the default social preview.
- Affiliate links are intentionally absent in v1; the content model (`sources[]`) leaves room to add them with disclosures later.

## AI / agent files

| File | Purpose |
|---|---|
| `public/llms.txt` | Curated index of key URLs for AI assistants. Hand-maintained; update when adding a guide. |
| `public/llms-full.txt` | Full text of every guide and city page in one file. **Generated** — run `python3 scripts/build-llms-full.py` after content changes. |
| `public/<indexnow-key>.txt` | IndexNow key file, proving domain ownership for URL submission. |

### IndexNow

Bing powers Microsoft Copilot, so pages Bing has not crawled cannot be cited by Copilot. IndexNow pushes URL changes to Bing/Yandex/Seznam instead of waiting for rediscovery.

```bash
npm run build                    # regenerates dist/sitemap-0.xml
python3 scripts/indexnow.py --dry-run
python3 scripts/indexnow.py      # submit all sitemap URLs
```

The key lives in `.secrets/indexnow-key.txt` (gitignored). The script mirrors it to `public/<key>.txt`, which must be deployed and publicly reachable **before** pinging, or IndexNow returns 403.

To regenerate llms-full.txt and submit after a content change:

```bash
python3 scripts/build-llms-full.py && npm run build && python3 scripts/indexnow.py
```

