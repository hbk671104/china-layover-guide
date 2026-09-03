import { useMemo, useState } from 'react';
import { checkEligibility, type EligibilityStatus } from '../lib/eligibility';
import { visaRules } from '../data/visa-rules';

const statusStyles: Record<EligibilityStatus, string> = {
  eligible: 'border-green-300 bg-green-50 text-green-900',
  'not-eligible': 'border-red-300 bg-red-50 text-red-900',
  'needs-review': 'border-amber-300 bg-amber-50 text-amber-900',
};

export default function EligibilityChecker() {
  const [nationality, setNationality] = useState('United States');
  const [portId, setPortId] = useState('shanghai');
  const [onwardIsThirdCountry, setOnwardIsThirdCountry] = useState(true);
  const [hasValidVisa, setHasValidVisa] = useState(false);

  const result = useMemo(
    () =>
      checkEligibility({
        nationality,
        portId,
        onwardIsThirdCountry,
        hasValidVisa,
      }),
    [nationality, portId, onwardIsThirdCountry, hasValidVisa],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">240-hour transit eligibility check</h2>
      <p className="mt-1 text-sm text-slate-600">
        A quick first check — not a guarantee. Always confirm with official sources.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Nationality</span>
          <select
            value={nationality}
            onChange={(event) => setNationality(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
          >
            {visaRules.eligibleCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
            <option value="Other">Other / not listed</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Entry port</span>
          <select
            value={portId}
            onChange={(event) => setPortId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
          >
            {visaRules.ports.map((port) => (
              <option key={port.id} value={port.id}>
                {port.label}
              </option>
            ))}
            <option value="other">Other / not listed</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onwardIsThirdCountry}
            onChange={(event) => setOnwardIsThirdCountry(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          My onward ticket is to a third country/region
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={hasValidVisa}
            onChange={(event) => setHasValidVisa(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          I already hold a valid Chinese visa
        </label>
      </div>

      <div className={`mt-5 rounded-xl border p-4 ${statusStyles[result.status]}`}>
        <p className="font-bold">{result.headline}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {result.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <ul className="mt-4 space-y-1 text-xs text-slate-500">
        {result.disclaimers.map((disclaimer) => (
          <li key={disclaimer}>{disclaimer}</li>
        ))}
      </ul>
    </section>
  );
}
