import { describe, expect, it } from 'vitest';
import { buildPaymentPlan } from './payment-recommender';

describe('buildPaymentPlan', () => {
  it('recommends TenPayGo for a Visa holder', () => {
    const plan = buildPaymentPlan({ card: 'visa', os: 'ios' });

    expect(plan.steps.map((step) => step.app)).toContain('TenPayGo');
  });

  it('adds an Apple Pay warning for iPhone users', () => {
    const plan = buildPaymentPlan({ card: 'mastercard', os: 'ios' });

    expect(plan.warnings.join(' ')).toContain('Apple Pay');
  });

  it('adds a Google Pay warning for Android users', () => {
    const plan = buildPaymentPlan({ card: 'visa', os: 'android' });

    expect(plan.warnings.join(' ')).toContain('Google Pay');
  });

  it('warns Amex holders to carry more cash', () => {
    const plan = buildPaymentPlan({ card: 'amex', os: 'ios' });

    expect(plan.warnings.join(' ')).toContain('cash');
  });

  it('starts cash-first for travelers without a foreign card', () => {
    const plan = buildPaymentPlan({ card: 'none', os: 'android' });

    expect(plan.steps[0]?.app).toBe('Cash');
  });
});
