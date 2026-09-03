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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Payment setup recommender</h2>
      <p className="mt-1 text-sm text-slate-600">
        Tell us what you carry and we&rsquo;ll suggest the setup that works offline in China.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Card you carry</span>
          <select
            value={card}
            onChange={(event) => setCard(event.target.value as CardBrand)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
          >
            {(Object.keys(cardLabels) as CardBrand[]).map((brand) => (
              <option key={brand} value={brand}>
                {cardLabels[brand]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Phone</span>
          <select
            value={os}
            onChange={(event) => setOs(event.target.value as PhoneOS)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
          >
            <option value="ios">iPhone</option>
            <option value="android">Android</option>
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-bold text-slate-900">{plan.headline}</p>
        <ol className="mt-3 space-y-3">
          {plan.steps.map((step) => (
            <li key={step.app} className="text-sm">
              <span className="font-semibold text-slate-900">
                {step.app}
                {': '}
              </span>
              <span className="text-slate-700">{step.action}</span>
              <p className="mt-0.5 text-xs text-slate-500">{step.note}</p>
            </li>
          ))}
        </ol>
      </div>

      <ul className="mt-4 space-y-1 text-xs text-slate-500">
        {plan.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}
