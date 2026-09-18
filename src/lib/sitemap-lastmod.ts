import type { AstroIntegration } from 'astro';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Pages that carry no search value. Keeping them out of the sitemap stops
 * Google from spending crawl budget on boilerplate.
 */
const EXCLUDED_PATHS = ['/privacy/', '/terms/'];

/**
 * Content collections mapped to their public URL prefixes, so a page can
 * inherit the `updated` date of the entry it renders.
 */
const CONTENT_PREFIXES: Record<string, string> = {
  guides: '/guides/',
  cities: '/cities/',
};

/**
 * Sitemap support for Google Search Console.
 *
 * The stock @astrojs/sitemap output lists URLs but omits <lastmod>, which is
 * the signal Google weighs most when deciding whether to recrawl. This wrapper
 * adds a per-URL lastmod derived from each entry's `updated` frontmatter, so a
 * corrected visa rule or a re-checked fare actually triggers a recrawl.
 */
export function sitemapWithLastmod(): AstroIntegration {
  const base = sitemap({
    filter: (page) => !EXCLUDED_PATHS.some((path) => page.endsWith(path)),
    serialize(item) {
      return item;
    },
  });

  const baseBuildDone = base.hooks['astro:build:done'];

  return {
    ...base,
    name: 'sitemap-with-lastmod',
    hooks: {
      ...base.hooks,
      // Spread alone is not enough: overriding this key would replace the base
      // integration's writer, so call it explicitly before stamping.
      'astro:build:done': async (options) => {
        await baseBuildDone?.call(base, options);
        await stampLastmod(options);
      },
    },
  };
}

async function stampLastmod(options: {
  dir: URL;
  logger: { info: (message: string) => void; warn: (message: string) => void };
}) {
  const { dir, logger } = options;

  const outDir = fileURLToPath(dir);
  const siteRoot = path.resolve(outDir, '..');
  const contentRoot = path.join(siteRoot, 'src', 'content');

  // Map "/guides/foo/" -> ISO date, read from each entry's `updated` field.
  const dates = new Map<string, string>();

  for (const [collection, prefix] of Object.entries(CONTENT_PREFIXES)) {
    const dirPath = path.join(contentRoot, collection);
    let files: string[];
    try {
      files = await fs.readdir(dirPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!/\.mdx?$/.test(file)) continue;
      const slug = file.replace(/\.mdx?$/, '');
      const raw = await fs.readFile(path.join(dirPath, file), 'utf8');

      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) continue;

      const updated = match[1].match(/^updated:\s*(.+)$/m);
      if (!updated) continue;

      const value = updated[1].trim().replace(/^['"]|['"]$/g, '');
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) continue;

      dates.set(`${prefix}${slug}/`, parsed.toISOString());
    }
  }

  const sitemapDir = path.join(outDir, 'sitemap-0.xml');
  let xml: string;
  try {
    xml = await fs.readFile(sitemapDir, 'utf8');
  } catch {
    logger.warn('sitemap-0.xml not found; skipping lastmod stamping');
    return;
  }

  let stamped = 0;

  xml = xml.replace(/<url><loc>([^<]+)<\/loc><\/url>/g, (whole, loc: string) => {
    let pathname: string;
    try {
      pathname = new URL(loc).pathname;
    } catch {
      return whole;
    }

    const lastmod = dates.get(pathname);
    if (!lastmod) return whole;

    stamped += 1;
    return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  await fs.writeFile(sitemapDir, xml, 'utf8');
  logger.info(
    `stamped lastmod on ${stamped} URL(s) from ${dates.size} content date(s)`,
  );
}

export default sitemapWithLastmod;
