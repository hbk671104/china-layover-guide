import { describe, expect, it } from 'vitest';
import { allCountries, filterCountries } from './countries';

describe('allCountries', () => {
  it('contains at least 190 nationalities', () => {
    expect(allCountries.length).toBeGreaterThanOrEqual(190);
  });

  it('has no duplicates', () => {
    expect(new Set(allCountries).size).toBe(allCountries.length);
  });

  it('is alphabetically sorted', () => {
    expect(allCountries).toEqual([...allCountries].sort());
  });

  it('lets a traveler from a non-eligible country find their own nationality', () => {
    expect(allCountries).toContain('India');
  });
});

describe('filterCountries', () => {
  it('returns the full list for an empty query', () => {
    expect(filterCountries('')).toHaveLength(allCountries.length);
  });

  it('matches case-insensitively', () => {
    expect(filterCountries('india')).toContain('India');
  });

  it('finds prefix matches', () => {
    const results = filterCountries('ind');
    expect(results).toContain('India');
    expect(results).toContain('Indonesia');
  });

  it('returns no results for a query that matches nothing', () => {
    expect(filterCountries('zzzzz')).toHaveLength(0);
  });
});
