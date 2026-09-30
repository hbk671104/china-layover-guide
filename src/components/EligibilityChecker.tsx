import { useMemo, useState } from 'react';
import { checkEligibility, type EligibilityStatus } from '../lib/eligibility';
import { visaRules } from '../data/visa-rules';
import NationalityCombobox from './NationalityCombobox';

const statusStyles: Record<EligibilityStatus, string> = {
  eligible: 'border-ok/35 bg-ok-bg text-ok',
  'not-eligible': 'border-stop/35 bg-stop-bg text-stop',
  'needs-review': 'border-warn/35 bg-warn-bg text-warn',
};

const statusLabels: Record<EligibilityStatus, string> = {
  eligible: 'Eligible',
  'not-eligible': 'Not eligible',
  'needs-review': 'Needs review',
};

function StatusIcon({ status }: { status: EligibilityStatus }) {
  if (status === 'eligible') {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
        <path
          d="M2.5 8.5l3.5 3.5 7.5-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'not-eligible') {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
        <path
          d="M4 4l8 8M12 4l-8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path
        d="M8 3.5v5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="12.4" r="1.1" fill="currentColor" />
    </svg>
  );
}

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
    <section className="rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
      <p className="eyebrow">Eligibility check</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        240-hour transit eligibility
      </h2>
      <p className="mt-2 max-w-[40rem] text-sm leading-relaxed text-muted">
        A quick first check, not a guarantee. Always confirm with official sources.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <NationalityCombobox value={nationality} onChange={setNationality} />
          <p className="mt-1.5 text-xs leading-relaxed text-faint">
            Search all nationalities, whether or not your country is eligible.
          </p>
        </div>

        <label className="block">
          <span className="field-label">Entry port</span>
          <select
            value={portId}
            onChange={(event) => setPortId(event.target.value)}
            className="field mt-1.5"
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

      <fieldset className="mt-6">
        <legend className="field-label">Your trip</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-paper px-4 py-3 text-sm text-body transition-colors duration-200 hover:border-line-strong hover:bg-surface">
            <input
              type="checkbox"
              checked={onwardIsThirdCountry}
              onChange={(event) => setOnwardIsThirdCountry(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] accent-brand"
            />
            My onward ticket is to a third country/region
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-paper px-4 py-3 text-sm text-body transition-colors duration-200 hover:border-line-strong hover:bg-surface">
            <input
              type="checkbox"
              checked={hasValidVisa}
              onChange={(event) => setHasValidVisa(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] accent-brand"
            />
            I already hold a valid Chinese visa
          </label>
        </div>
      </fieldset>

      <div
        role="status"
        aria-live="polite"
        className={`mt-7 rounded-card border p-5 ${statusStyles[result.status]}`}
      >
        <p className="flex items-start gap-2.5 font-display text-lg font-semibold">
          <span className="mt-1 shrink-0">
            <StatusIcon status={result.status} />
          </span>
          <span>{result.headline}</span>
        </p>
        <p className="mt-2 text-xs font-semibold tracking-[0.08em] uppercase opacity-80">
          {statusLabels[result.status]}
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-body">
          {result.reasons.map((reason) => (
            <li key={reason} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-xs leading-relaxed text-faint">
        {result.disclaimers.map((disclaimer) => (
          <li key={disclaimer}>{disclaimer}</li>
        ))}
      </ul>
    </section>
  );
}
