# China Layover Guide — Implementation Plan

- Date: 2026-09-03
- Spec: `docs/superpowers/specs/2026-09-03-china-layover-guide-design.md`
- Note: `writing-plans` skill not installed; this plan substitutes it.

## Steps

### P0. Scaffold & dependencies
- Write `package.json`, `tsconfig.json`, `astro.config.mjs`, `.gitignore`, `src/styles/global.css`, minimal `src/pages/index.astro`
- Deps: `astro`, `@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/cloudflare`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite`, `vitest`
- Accept: `npm install` succeeds; `npm run build` produces `dist/`

### P1. Layout & design system
- `BaseLayout.astro` with SEO props (title, description, canonical, OG, JSON-LD)
- Header/Footer, mobile-first Tailwind design tokens
- Accept: homepage renders with header/footer; no hydration errors

### P2. SEO plumbing
- `public/robots.txt`, favicon, sitemap integration, custom 404
- Accept: `dist/sitemap-index.xml` and `dist/robots.txt` exist after build

### P3. Content Collections & routes
- `src/content.config.ts` (guides + cities schemas)
- Routes: `/`, `/transit-visa/`, `/esim/`, `/payments/`, `/cities/`, `/cities/[city]/`, `/about/`, `/privacy/`, `/terms/`
- Accept: sample guide + city render via collections

### P4. Rule data
- `src/data/visa-rules.ts`, `src/data/payment-matrix.ts` with typed data
- Accept: `astro check` passes; data imports cleanly

### P5. React islands
- `EligibilityChecker.tsx`, `PaymentRecommender.tsx` (pure function of rule data + disclaimer)
- Accept: widgets render and produce three-state results (符合/不符合/需人工确认)

### P6. Tests
- Vitest config; unit tests for both engines (boundary cases)
- Accept: `npm test` green

### P7. Initial content (draft, user proofreads)
- 4 pillar articles + 3–5 city pages; each with `updated` + `sources`
- Accept: all routes render; sources present

### P8. Verify & polish
- `astro check` + `astro build` + `npm test` all green; Lighthouse spot check; canonical/JSON-LD spot check
- Accept: no build errors, no broken internal links

### P9. Cloudflare Pages
- `wrangler.toml` (pages build output), README deploy notes
- Accept: `wrangler pages dev` not required; config committed with instructions
