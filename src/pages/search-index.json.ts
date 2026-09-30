import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { airports } from '../data/airports';
import { buildSearchDocs } from '../lib/search-index';

/**
 * The static search index consumed by the header search panel.
 *
 * Prerendered at build time, so searching costs no function invocation: the
 * browser downloads this JSON once (on first open, not on page load) and ranks
 * locally in `src/lib/search.ts`. It is deliberately not in the sitemap and not
 * linked from anywhere except the search UI.
 */
export const prerender = true;

export const GET: APIRoute = async () => {
  const [guides, cities] = await Promise.all([getCollection('guides'), getCollection('cities')]);
  const docs = buildSearchDocs({ guides, cities, airports });

  return new Response(JSON.stringify({ generated: new Date().toISOString(), docs }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
