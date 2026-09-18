import { describe, expect, it } from 'vitest';
import { checkEligibility } from './eligibility';

describe('checkEligibility', () => {
  it('marks a US traveler via Shanghai with a third-country onward ticket as eligible', () => {
    const result = checkEligibility({
      nationality: 'United States',
      portId: 'shanghai',
      onwardIsThirdCountry: true,
      hasValidVisa: false,
    });

    expect(result.status).toBe('eligible');
    expect(result.reasons.join(' ')).toContain('Shanghai');
  });

  it('marks a nationality not on the 55-country list as not eligible, naming it', () => {
    const result = checkEligibility({
      nationality: 'India',
      portId: 'shanghai',
      onwardIsThirdCountry: true,
      hasValidVisa: false,
    });

    expect(result.status).toBe('not-eligible');
    expect(result.headline).toContain('India');
  });

  it('marks a round trip as not eligible', () => {
    const result = checkEligibility({
      nationality: 'Germany',
      portId: 'shanghai',
      onwardIsThirdCountry: false,
      hasValidVisa: false,
    });

    expect(result.status).toBe('not-eligible');
    expect(result.headline).toContain('round trip');
  });

  it('points visa holders to their visa instead of the transit exemption', () => {
    const result = checkEligibility({
      nationality: 'United Kingdom',
      portId: 'beijing',
      onwardIsThirdCountry: true,
      hasValidVisa: true,
    });

    expect(result.status).toBe('eligible');
    expect(result.headline).toContain('valid Chinese visa');
  });

  it('asks for review when the port is unknown', () => {
    const result = checkEligibility({
      nationality: 'Australia',
      portId: 'other',
      onwardIsThirdCountry: true,
      hasValidVisa: false,
    });

    expect(result.status).toBe('needs-review');
  });

  it('is case-insensitive and trims nationality input', () => {
    const result = checkEligibility({
      nationality: '  united states ',
      portId: 'shanghai',
      onwardIsThirdCountry: true,
      hasValidVisa: false,
    });

    expect(result.status).toBe('eligible');
  });
});
