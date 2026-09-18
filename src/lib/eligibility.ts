import { findPort, nationalityStatus, visaRules } from '../data/visa-rules';

export type EligibilityStatus = 'eligible' | 'not-eligible' | 'needs-review';

export interface EligibilityInput {
  nationality: string;
  portId: string;
  onwardIsThirdCountry: boolean;
  hasValidVisa: boolean;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  headline: string;
  reasons: string[];
  disclaimers: string[];
}

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const disclaimers = [
  'Rules change, always verify with the National Immigration Administration (NIA) or the 12367 hotline before booking.',
    `This checker is informational, not a guarantee of entry. Last reviewed ${visaRules.lastReviewed}.`,
  ];

  if (input.hasValidVisa) {
    return {
      status: 'eligible',
      headline: 'You already have a valid Chinese visa',
      reasons: [
    'Use your visa for entry, the visa-free transit policy is only relevant if you do not hold a visa.',
      ],
      disclaimers,
    };
  }

  const nationality = nationalityStatus(input.nationality);
  if (nationality === 'not-on-list') {
    const name = input.nationality.trim();
    const subject = name && name.toLowerCase() !== 'other' ? name : 'Your nationality';
    return {
      status: 'not-eligible',
      headline: `${subject} is not on the 55-country list`,
      reasons: [
        'The 240-hour visa-free transit policy only covers citizens of 55 listed countries.',
        'You will likely need a Chinese visa before you travel, unless another visa-free arrangement (for example the 30-day visa-free entry) applies to you.',
      ],
      disclaimers,
    };
  }

  if (!input.onwardIsThirdCountry) {
    return {
      status: 'not-eligible',
      headline: 'A round trip does not qualify',
      reasons: [
    'Your onward destination must be a third country or region, different from the country you arrived from.',
        'Example: London → Shanghai → London does not qualify; London → Shanghai → Tokyo does.',
      ],
      disclaimers,
    };
  }

  const port = findPort(input.portId);
  if (!port) {
    return {
      status: 'needs-review',
      headline: 'Check whether your port is designated',
      reasons: [
        'Only designated ports participate in the 240-hour policy.',
        'Verify your exact airport, train station, or seaport with the NIA.',
      ],
      disclaimers,
    };
  }

  return {
    status: 'eligible',
  headline: 'Looks eligible | with the usual caveats',
    reasons: [
      'Your nationality is on the 55-country list.',
      `${port.label} is a designated transit port.`,
      `Allowed travel area: ${port.allowedArea}.`,
      'You must hold a confirmed onward ticket to a third country or region departing within 240 hours.',
      `Your passport should be valid for at least ${visaRules.passportValidityMonths} months.`,
    ],
    disclaimers,
  };
}
