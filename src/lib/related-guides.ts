/**
 * Picks the guides listed under "Related guides" at the foot of a guide page.
 *
 * The block exists to add internal links, not repeat them, so guides the body
 * already links to are skipped. Candidates are taken in a fixed rotation
 * (alphabetical by id, starting just after the current guide) rather than by a
 * global ranking: that way every guide in a category is linked from its
 * neighbours, instead of every page pointing at the same top few. Pages Google
 * has discovered but not yet crawled get inbound links this way.
 *
 * Order of preference: same category, then nearby categories, then the rest.
 */

export interface RelatedCandidate {
  id: string;
  body?: string;
  data: { category: string };
}

/** Where to look next when a category runs out of unlinked guides. */
const NEARBY_CATEGORIES: Record<string, string[]> = {
  'transit-visa': ['logistics', 'cities'],
  cities: ['logistics', 'transit-visa'],
  logistics: ['cities', 'esim'],
  esim: ['payments', 'logistics'],
  payments: ['shopping', 'esim'],
  shopping: ['payments', 'esim'],
};

/** Slugs of every `/guides/<slug>/` link in a Markdown body. */
export function linkedGuideIds(body = ''): Set<string> {
  const ids = new Set<string>();
  for (const match of body.matchAll(/\/guides\/([a-z0-9-]+)\/?/g)) {
    ids.add(match[1]);
  }
  return ids;
}

export function pickRelatedGuides<T extends RelatedCandidate>(
  current: T,
  all: T[],
  limit = 4,
): T[] {
  const sorted = [...all].sort((a, b) => a.id.localeCompare(b.id));
  const index = sorted.findIndex((guide) => guide.id === current.id);
  const rotation = [...sorted.slice(index + 1), ...sorted.slice(0, Math.max(index, 0))];

  const alreadyLinked = linkedGuideIds(current.body);
  const candidates = rotation.filter(
    (guide) => guide.id !== current.id && !alreadyLinked.has(guide.id),
  );

  const category = current.data.category;
  const nearby = NEARBY_CATEGORIES[category] ?? [];
  const rank = (guide: T) => {
    if (guide.data.category === category) return 0;
    const near = nearby.indexOf(guide.data.category);
    return near === -1 ? nearby.length + 1 : near + 1;
  };

  // Array.prototype.sort is stable, so the rotation order holds within a rank.
  return candidates.sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}
