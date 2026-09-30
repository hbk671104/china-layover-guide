import { describe, expect, it } from 'vitest';
import {
  queryTerms,
  recentGuides,
  search,
  splitHighlights,
  tokenize,
  type SearchDoc,
  type SearchResult,
} from './search';

const doc = (overrides: Partial<SearchDoc> & Pick<SearchDoc, 'id' | 'title'>): SearchDoc => ({
  url: `/guides/${overrides.id}/`,
  kind: 'Guide',
  description: '',
  headings: [],
  body: '',
  ...overrides,
});

const DOCS: SearchDoc[] = [
  doc({
    id: 'a',
    title: '240-hour visa-free transit',
    category: 'Transit visa',
    description: 'Who qualifies for the 240-hour policy and where you can go.',
    headings: ['Eligible countries'],
    body: 'The 240-hour rule replaced the 144-hour window. Third-country rule required.',
    updated: '2026-09-29',
  }),
  doc({
    id: 'b',
    title: 'Shanghai layover itinerary',
    kind: 'City trip',
    category: 'City trips',
    description: 'What fits in six, eight, or twelve hours in Shanghai.',
    body: 'Take the Maglev from PVG, then Metro Line 2 to the Bund for dumplings.',
    updated: '2026-05-02',
  }),
  doc({
    id: 'c',
    title: 'Payments in China for foreigners',
    category: 'Payments',
    description: 'Linking a Visa card to Alipay and WeChat Pay.',
    body: 'A foreign Visa card works in Alipay. Carry a little cash as backup.',
    updated: '2026-09-20',
  }),
];

const ids = (results: SearchResult[]) => results.map((result) => result.doc.id);

describe('tokenize', () => {
  it('drops punctuation and accents', () => {
    expect(tokenize("Beijing's Zürich, Xi'an")).toEqual(['beijing', 's', 'zurich', 'xi', 'an']);
  });
});

describe('queryTerms', () => {
  it('keeps a single term even when it is a stopword', () => {
    expect(queryTerms('how')).toEqual(['how']);
  });

  it('drops stopwords from multi-word queries but keeps content words', () => {
    expect(queryTerms('how long is the layover')).toEqual(['long', 'layover']);
  });

  it('falls back to the raw terms when every word is a stopword', () => {
    expect(queryTerms('to be or')).toEqual(['to', 'be', 'or']);
  });
});

describe('search', () => {
  it('returns nothing for an empty or punctuation-only query', () => {
    expect(search(DOCS, '   ')).toEqual([]);
    expect(search(DOCS, '?!')).toEqual([]);
  });

  it('ranks a title match above a body-only match', () => {
    expect(ids(search(DOCS, 'payments'))[0]).toBe('c');
  });

  it('finds a term that only appears in the body', () => {
    expect(ids(search(DOCS, 'maglev'))).toEqual(['b']);
  });

  it('matches across the hyphen in a compound term', () => {
    expect(ids(search(DOCS, '240 hour'))).toContain('a');
  });

  it('prefers the document containing every term', () => {
    const results = search(DOCS, 'shanghai bund');
    expect(ids(results)[0]).toBe('b');
  });

  it('treats an airport code as a first-class term', () => {
    expect(ids(search(DOCS, 'pvg'))).toEqual(['b']);
  });

  it('boosts a whole-phrase title match over scattered term matches', () => {
    const results = search(DOCS, 'visa-free transit');
    expect(ids(results)[0]).toBe('a');
  });

  it('orders equally relevant documents by recency', () => {
    const recent = doc({ id: 'recent', title: 'Luggage storage', updated: '2026-09-29' });
    const old = doc({ id: 'old', title: 'Luggage storage', updated: '2024-01-05' });

    expect(ids(search([old, recent], 'luggage', { now: Date.parse('2026-09-30') }))).toEqual([
      'recent',
      'old',
    ]);
  });

  it('never lets recency outrank relevance', () => {
    const relevant = doc({
      id: 'relevant',
      title: 'Alipay setup',
      body: 'Link your Visa card.',
      updated: '2023-01-05',
    });
    const fresh = doc({
      id: 'fresh',
      title: 'Airport wifi',
      body: 'Alipay is mentioned once here.',
      updated: '2026-09-29',
    });

    expect(ids(search([fresh, relevant], 'alipay', { now: Date.parse('2026-09-30') }))[0]).toBe(
      'relevant',
    );
  });

  it('respects the limit', () => {
    const many = Array.from({ length: 5 }, (_, index) =>
      doc({ id: `m${index}`, title: `Storage guide ${index}`, body: 'Left-luggage lockers.' }),
    );

    expect(search(many, 'lockers', { limit: 2 })).toHaveLength(2);
  });

  it('returns a body excerpt around the hit', () => {
    const [result] = search(DOCS, 'dumplings');
    expect(result?.snippet).toContain('dumplings');
  });

  it('leaves the snippet empty when only metadata matched', () => {
    const [result] = search(DOCS, 'for foreigners');
    expect(result?.doc.id).toBe('c');
    expect(result?.snippet).toBe('');
  });
});

describe('splitHighlights', () => {
  it('marks every occurrence, case-insensitively', () => {
    const parts = splitHighlights('Alipay works with Alipay', ['alipay']);
    expect(parts.filter((part) => part.hit)).toHaveLength(2);
    expect(parts.map((part) => part.text).join('')).toBe('Alipay works with Alipay');
  });

  it('returns the text untouched when there is nothing to mark', () => {
    expect(splitHighlights('Shanghai', [])).toEqual([{ text: 'Shanghai', hit: false }]);
  });
});

describe('recentGuides', () => {
  it('lists only guides, newest first', () => {
    const docs = [
      ...DOCS,
      doc({ id: 'hub', title: 'A hub page', kind: 'Page', updated: '2027-01-01' }),
    ];

    expect(recentGuides(docs, 2).map((entry) => entry.id)).toEqual(['a', 'c']);
  });
});
