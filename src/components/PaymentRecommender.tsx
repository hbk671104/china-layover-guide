import { useMemo, useState } from 'react';
import { buildPaymentPlan } from '../lib/payment-recommender';
import type { CardBrand, PhoneOS } from '../data/payment-matrix';

const cardLabels: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  none: 'No foreign card',
};

export default function PaymentRecommender() {
  const [card, setCard] = useState<CardBrand>('visa');
  const [os, setOs] = useState<PhoneOS>('ios');

  const plan = useMemo(() => buildPaymentPlan({ card, os }), [card, os]);

  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
      <p className="eyebrow">Payment setup</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        What to install, in order
      </h2>
      <p className="mt-2 max-w-[40rem] text-sm leading-relaxed text-muted">
        Tell us what you carry and we&rsquo;ll suggest the setup that works offline in China.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Card you carry</span>
          <select
            value={card}
            onChange={(event) => setCard(event.target.value as CardBrand)}
            className="field mt-1.5"
          >
            {(Object.keys(cardLabels) as CardBrand[]).map((brand) => (
              <option key={brand} value={brand}>
                {cardLabels[brand]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Phone</span>
          <select
            value={os}
            onChange={(event) => setOs(event.target.value as PhoneOS)}
            className="field mt-1.5"
          >
            <option value="ios">iPhone</option>
            <option value="android">Android</option>
          </select>
        </label>
      </div>

      <div role="status" aria-live="polite" className="mt-7 rounded-card bg-surface-2 p-5 sm:p-6">
        <p className="font-display text-lg font-semibold tracking-[-0.01em] text-ink">
          {plan.headline}
        </p>
        <ol className="mt-4 space-y-4">
          {plan.steps.map((step, index) => (
            <li key={step.app} className="grid grid-cols-[1.75rem_1fr] gap-x-3">
              <span className="pt-0.5 font-mono text-xs font-semibold text-brand tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-sm text-body">
                  <span className="font-semibold text-ink">{step.app}</span>
                  {': '}
                  {step.action}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-xs leading-relaxed text-faint">
        {plan.warnings.map((warning) => (
          <li key={warning} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-faint" />
            {warning}
          </li>
        ))}
      </ul>
    </section>
  );
}
