/**
 * Full-text search over the build-time index (`/search-index.json`).
 *
 * Runs entirely in the browser: the index is a static JSON file, so search works
 * on Cloudflare Pages without a function, a third-party widget, or a network
 * round trip per keystroke. `src/lib/search-index.ts` builds the documents at
 * build time; this module only ranks them.
 *
 * Ranking, in order of weight: title, keywords, headings, description, body.
 * A match must land on a word boundary to score at full weight; prefix matches
 * (typeahead) score 0.62x and mid-word substrings 0.32x, so "sha" ranks the
 * Shanghai pages above a page that merely contains "shan". Documents matching
 * more of the query's terms are scaled up, and a decaying recency bonus breaks
 * ties so a re-checked page outranks an otherwise identical stale one.
 */

export type SearchKind = 'Guide' | 'City trip' | 'Airport' | 'Page';

export interface SearchDoc {
  /** Stable identity, e.g. `guide:240-hour-visa-free-transit`. */
  id: string;
  url: string;
  title: string;
  kind: SearchKind;
  /** Short topic flag rendered on the row, e.g. `Transit visa`. */
  category?: string;
  description: string;
  headings: string[];
  /** Plain text of the page body, markdown stripped at build time. */
  body: string;
  /** ISO date; recency is a tiebreaker, never a filter. */
  updated?: string;
  /** High-value tokens that are not in the prose: IATA codes, aliases. */
  keywords?: string[];
}

export interface SearchIndex {
  generated: string;
  docs: SearchDoc[];
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  /** Body excerpt around the first hit; empty when only metadata matched. */
  snippet: string;
}

export interface SearchOptions {
  limit?: number;
  /** Injected clock, so ranking is deterministic in tests. */
  now?: number;
}

/** Function words that carry no signal; dropped once a query has 2+ terms. */
const STOPWORDS: Record<string, true> = {
  a: true, an: true, and: true, are: true, as: true, at: true, be: true, can: true, do: true,
  does: true, for: true, from: true, how: true, i: true, if: true, in: true, is: true, it: true,
  my: true, of: true, on: true, or: true, that: true, the: true, to: true, was: true, what: true,
  when: true, where: true, which: true, with: true, you: true, your: true,
};

const FIELD_WEIGHTS = {
  title: 12,
  keywords: 8,
  headings: 5,
  description: 4,
  body: 2,
} as const;

/** Multipliers for a match that is not a whole word. */
const PREFIX_FACTOR = 0.62;
const SUBSTRING_FACTOR = 0.32;

/**
 * Weight of the topicality term: how much a document is *about* a term, not
 * merely whether it mentions it once. Without it, a query like "esim" scores
 * every page that says the word once identically and the order is decided by
 * recency alone.
 */
const TOPICAL_WEIGHT = 3;
/** Term frequency saturates here, so a 6,000-word reference page cannot win on length. */
const TOPICAL_SATURATION = 4;

const SNIPPET_RADIUS = 96;

/**
 * Casefold, strip accents, and flatten hyphens so `Zürich` matches `zurich` and
 * a title's `240-hour` still contains the phrase `240 hour`.
 */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-–—]/g, ' ');
}

export function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 0);
}

/**
 * Query terms: stopwords are dropped only when enough signal remains, so a
 * one-word query like "how" still searches instead of returning nothing.
 */
export function queryTerms(query: string): string[] {
  const all = tokenize(query);
  if (all.length < 2) return all;
  const kept = all.filter((term) => STOPWORDS[term] !== true);
  return kept.length > 0 ? kept : all;
}

interface PreparedDoc {
  doc: SearchDoc;
  title: string;
  description: string;
  headings: string[];
  body: string;
  keywords: string[];
  /** Normalized title + description + headings + body, for the whole-query bonus. */
  phrase: string;
  /** Word lists for boundary matching, one per field. */
  titleWords: string[];
  keywordWords: string[];
  headingWords: string[];
  descriptionWords: string[];
  bodyWords: string[];
  /** Lowercased body, used to locate a snippet without re-normalizing. */
  bodyLower: string;
}

interface Prepared {
  docs: PreparedDoc[];
}

const preparedCache = new WeakMap<SearchDoc[], Prepared>();

const words = (value: string): string[] => normalize(value).split(/[^a-z0-9]+/).filter(Boolean);

function prepare(docs: SearchDoc[]): Prepared {
  const cached = preparedCache.get(docs);
  if (cached) return cached;

  const prepared = docs.map<PreparedDoc>((doc) => ({
    doc,
    title: normalize(doc.title),
    description: normalize(doc.description),
    headings: (doc.headings ?? []).map(normalize),
    body: normalize(doc.body),
    keywords: (doc.keywords ?? []).map(normalize),
    phrase: normalize([doc.title, doc.description, ...(doc.headings ?? []), doc.body].join(' \n ')),
    titleWords: words(doc.title),
    keywordWords: words((doc.keywords ?? []).join(' ')),
    headingWords: words((doc.headings ?? []).join(' ')),
    descriptionWords: words(doc.description),
    bodyWords: words(doc.body),
    bodyLower: doc.body.toLowerCase(),
  }));

  const value: Prepared = { docs: prepared };
  preparedCache.set(docs, value);
  return value;
}

/**
 * How well one term matches one field: 1 for a whole word, less for a prefix or
 * an interior substring, 0 for no match.
 */
function termMatch(haystack: string, haystackWords: string[], term: string): number {
  if (!haystack.includes(term)) return 0;
  for (const word of haystackWords) {
    if (word === term) return 1;
    if (word.startsWith(term)) return PREFIX_FACTOR;
  }
  return SUBSTRING_FACTOR;
}

function scoreDoc(entry: PreparedDoc, terms: string[], phrase: string): number {
  let matched = 0;
  let score = 0;
  for (const term of terms) {
    const title = termMatch(entry.title, entry.titleWords, term);
    const keywords = termMatch(entry.keywords.join(' '), entry.keywordWords, term);
    const headings = termMatch(entry.headings.join(' '), entry.headingWords, term);
    const description = termMatch(entry.description, entry.descriptionWords, term);
    const body = termMatch(entry.body, entry.bodyWords, term);

    const termScore =
      title * FIELD_WEIGHTS.title +
      keywords * FIELD_WEIGHTS.keywords +
      headings * FIELD_WEIGHTS.headings +
      description * FIELD_WEIGHTS.description +
      body * FIELD_WEIGHTS.body;

    if (termScore > 0) matched += 1;
    score += termScore;
  }

  if (score === 0) return 0;

  // Documents containing more of the query beat documents containing one term.
  score *= 0.3 + 0.7 * (matched / terms.length);

  // Whole-query matches are almost always what the reader meant.
  if (phrase.length > 1) {
    if (entry.title.includes(phrase)) score *= 1.8;
    else if (entry.keywords.join(' ').includes(phrase)) score *= 1.4;
    else if (entry.phrase.includes(phrase)) score *= 1.12;
  }

  return score;
}

/** 0..1, 1 for today, halving roughly every 9 months. */
function recencyBonus(updated: string | undefined, now: number): number {
  if (!updated) return 0;
  const age = now - Date.parse(updated);
  if (!Number.isFinite(age) || age < 0) return 0.3;
  const days = age / 86_400_000;
  return 0.3 * Math.exp(-days / 270);
}

function snippetFor(entry: PreparedDoc, terms: string[]): string {
  const body = entry.doc.body;
  if (!body) return '';

  let hit = -1;
  for (const term of terms) {
    const index = entry.bodyLower.indexOf(term);
    if (index >= 0 && (hit < 0 || index < hit)) hit = index;
  }
  if (hit < 0) return '';

  // Expand to word boundaries, then trim back so the excerpt stays readable.
  let start = hit;
  while (start > 0 && /[\p{L}\p{N}]/u.test(body[start - 1]!)) start -= 1;
  let end = hit;
  while (end < body.length && /[\p{L}\p{N}]/u.test(body[end]!)) end += 1;

  start = Math.max(0, start - SNIPPET_RADIUS);
  end = Math.min(body.length, Math.max(end, hit + SNIPPET_RADIUS));

  const overflowEnd = end < body.length;
  let excerpt = body.slice(start, end).trim();
  if (start > 0) excerpt = `…${excerpt.replace(/^[^\p{L}\p{N}]+/u, '')}`;
  if (overflowEnd) excerpt = `${excerpt.replace(/[^\p{L}\p{N}]+$/u, '')}…`;
  return excerpt;
}

/** Exact whole-word occurrences in a document body. */
function bodyHits(words: string[], term: string): number {
  let hits = 0;
  for (const word of words) if (word === term) hits += 1;
  return hits;
}

/**
 * Rank `docs` against `query`. Empty result when the query has no usable terms.
 */
export function search(docs: SearchDoc[], query: string, options: SearchOptions = {}): SearchResult[] {
  const { limit = 12, now = Date.now() } = options;
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const { docs: prepared } = prepare(docs);
  const phrase = normalize(terms.join(' '));

  // Per term: how common it is (inverse document frequency) and how often each
  // document uses it.
  const stats = terms.map((term) => {
    const hits = prepared.map((entry) => bodyHits(entry.bodyWords, term));
    return { hits, df: hits.filter((count) => count > 0).length };
  });

  const results: SearchResult[] = [];
  for (let index = 0; index < prepared.length; index += 1) {
    const entry = prepared[index]!;
    const base = scoreDoc(entry, terms, phrase);
    if (base === 0) continue;

    let score = base;
    for (let term = 0; term < terms.length; term += 1) {
      const { hits, df } = stats[term]!;
      const count = hits[index]!;
      if (count === 0) continue;
      const frequency = count / (count + TOPICAL_SATURATION);
      const rarity = Math.log(1 + prepared.length / (1 + df));
      score += TOPICAL_WEIGHT * frequency * rarity;
    }

    results.push({
      doc: entry.doc,
      score: score + recencyBonus(entry.doc.updated, now),
      snippet: snippetFor(entry, terms),
    });
  }

  results.sort(
    (a, b) =>
      b.score - a.score ||
      (b.doc.updated ?? '').localeCompare(a.doc.updated ?? '') ||
      a.doc.title.localeCompare(b.doc.title),
  );

  return results.slice(0, limit);
}

export interface HighlightPart {
  text: string;
  hit: boolean;
}

/**
 * Split `text` into plain and matched runs, so a component can render `<mark>`
 * without re-implementing the matching rules.
 */
export function splitHighlights(text: string, terms: string[]): HighlightPart[] {
  const usable = terms.filter((term) => term.length > 0);
  if (usable.length === 0 || text.length === 0) return [{ text, hit: false }];

  const pattern = usable
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const parts: HighlightPart[] = [];
  const regex = new RegExp(pattern, 'gi');
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), hit: false });
    parts.push({ text: match[0], hit: true });
    last = match.index + match[0].length;
    if (match[0].length === 0) regex.lastIndex += 1;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });

  return parts;
}

/** Most recently updated guides, for the search panel's empty state. */
export function recentGuides(docs: SearchDoc[], limit = 4): SearchDoc[] {
  return docs
    .filter((doc) => doc.kind === 'Guide')
    .sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? ''))
    .slice(0, limit);
}
