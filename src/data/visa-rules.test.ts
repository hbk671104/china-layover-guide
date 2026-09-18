import { describe, expect, it } from 'vitest';
import { visaRules } from './visa-rules';
import { allCountries } from './countries';

describe('visaRules', () => {
  it('lists 55 eligible countries', () => {
    expect(visaRules.eligibleCountries).toHaveLength(55);
  });

  it('covers every eligible country in the full nationality list', () => {
    // The checker matches nationality strings exactly, so every eligible
    // country must be selectable in the combobox with the same spelling.
    const missing = visaRules.eligibleCountries.filter(
      (country) => !allCountries.includes(country),
    );
    expect(missing).toEqual([]);
  });

  it('lists 65 designated ports', () => {
    expect(visaRules.ports).toHaveLength(65);
  });

  it('has unique port ids', () => {
    const ids = visaRules.ports.map((port) => port.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every port a permitted area', () => {
    const missing = visaRules.ports.filter((port) => !port.allowedArea.trim());
    expect(missing).toEqual([]);
  });
});
