import { describe, expect, it } from 'vitest';
import { linkedGuideIds, pickRelatedGuides, type RelatedCandidate } from './related-guides';

const guide = (id: string, category: string, body = ''): RelatedCandidate => ({
  id,
  body,
  data: { category },
});

const ids = (guides: RelatedCandidate[]) => guides.map((g) => g.id);

describe('linkedGuideIds', () => {
  it('collects guide slugs from Markdown links, with or without a trailing slash', () => {
    const body =
      'See [a](/guides/alpha/) and [b](/guides/beta) and [hub](/transit-visa/) and [c](/guides/alpha/#faq).';
    expect([...linkedGuideIds(body)].sort()).toEqual(['alpha', 'beta']);
  });

  it('handles a missing body', () => {
    expect(linkedGuideIds(undefined).size).toBe(0);
  });
});

describe('pickRelatedGuides', () => {
  const all = [
    guide('a-visa', 'transit-visa'),
    guide('b-visa', 'transit-visa'),
    guide('c-visa', 'transit-visa'),
    guide('d-visa', 'transit-visa'),
    guide('e-visa', 'transit-visa'),
    guide('f-visa', 'transit-visa'),
    guide('rail', 'logistics'),
    guide('itinerary', 'cities'),
    guide('alipay', 'payments'),
    guide('taobao', 'shopping'),
  ];

  it('never includes the current guide', () => {
    for (const current of all) {
      expect(ids(pickRelatedGuides(current, all))).not.toContain(current.id);
    }
  });

  it('takes same-category guides in rotation, starting after the current one', () => {
    const current = all.find((g) => g.id === 'd-visa')!;
    expect(ids(pickRelatedGuides(current, all))).toEqual(['e-visa', 'f-visa', 'a-visa', 'b-visa']);
  });

  it('skips guides the body already links to', () => {
    const current = guide('d-visa', 'transit-visa', 'Read [e](/guides/e-visa/) and [f](/guides/f-visa/).');
    expect(ids(pickRelatedGuides(current, all))).toEqual(['a-visa', 'b-visa', 'c-visa', 'rail']);
  });

  it('fills from nearby categories before the rest of the site', () => {
    const current = all.find((g) => g.id === 'taobao')!;
    // shopping → payments, then esim (none here), then everything else in rotation.
    expect(ids(pickRelatedGuides(current, all, 3))).toEqual(['alipay', 'a-visa', 'b-visa']);
  });

  it('links every guide in a category from at least one neighbour', () => {
    const visa = all.filter((g) => g.data.category === 'transit-visa');
    const linked = new Set(visa.flatMap((current) => ids(pickRelatedGuides(current, all))));
    for (const g of visa) expect(linked).toContain(g.id);
  });

  it('respects the limit', () => {
    expect(pickRelatedGuides(all[0], all, 2)).toHaveLength(2);
  });
});
