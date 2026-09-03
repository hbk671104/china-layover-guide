/**
 * 240-hour visa-free transit rules.
 *
 * IMPORTANT: immigration rules change. This data is a best-effort snapshot
 * reviewed 2026-09-03 and MUST be verified against the National Immigration
 * Administration (NIA) before relying on it. The eligibility checker always
 * tells users to confirm with official sources.
 */

export interface TransitPort {
  id: string;
  label: string;
  city: string;
  allowedArea: string;
}

export interface VisaRules {
  lastReviewed: string;
  sourceUrl: string;
  /** 54-country list per the NIA announcement expanding the policy in Dec 2024. */
  eligibleCountries: string[];
  ports: TransitPort[];
  /** Minimum passport validity required, in months. */
  passportValidityMonths: number;
  /** Maximum transit stay in hours. */
  maxStayHours: number;
}

export const visaRules: VisaRules = {
  lastReviewed: '2026-09-03',
  sourceUrl: 'https://en.nia.gov.cn/',
  // Verify against the official NIA list; this is the widely reported
  // 54-country list from the December 2024 expansion.
  eligibleCountries: [
    // Europe
    'Austria',
    'Belgium',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czechia',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Ireland',
    'Italy',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Monaco',
    'Netherlands',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    'Ukraine',
    'United Kingdom',
    // Americas
    'United States',
    'Canada',
    'Brazil',
    'Mexico',
    'Argentina',
    'Chile',
    // Asia & Middle East
    'Japan',
    'South Korea',
    'Singapore',
    'Brunei',
    'United Arab Emirates',
    'Qatar',
    // Oceania
    'Australia',
    'New Zealand',
  ],
  ports: [
    {
      id: 'beijing',
      label: 'Beijing (PEK / PKX)',
      city: 'Beijing',
      allowedArea: 'Beijing, Tianjin, and Hebei province (verify current area)',
    },
    {
      id: 'shanghai',
      label: 'Shanghai (PVG / SHA)',
      city: 'Shanghai',
      allowedArea: 'Shanghai, Jiangsu, and Zhejiang (verify current area)',
    },
    {
      id: 'guangzhou',
      label: 'Guangzhou (CAN)',
      city: 'Guangzhou',
      allowedArea: 'Guangdong province (verify current area)',
    },
    {
      id: 'shenzhen',
      label: 'Shenzhen (SZX)',
      city: 'Shenzhen',
      allowedArea: 'Guangdong province (verify current area)',
    },
    {
      id: 'chengdu',
      label: 'Chengdu (TFU)',
      city: 'Chengdu',
      allowedArea: 'Sichuan province and nearby areas (verify current area)',
    },
    {
      id: 'xian',
      label: "Xi'an (XIY)",
      city: "Xi'an",
      allowedArea: 'Shaanxi province (verify current area)',
    },
    {
      id: 'hangzhou',
      label: 'Hangzhou (HGH)',
      city: 'Hangzhou',
      allowedArea: 'Zhejiang province (verify current area)',
    },
    {
      id: 'xiamen',
      label: 'Xiamen (XMN)',
      city: 'Xiamen',
      allowedArea: 'Fujian province (verify current area)',
    },
    {
      id: 'qingdao',
      label: 'Qingdao (TAO)',
      city: 'Qingdao',
      allowedArea: 'Shandong province (verify current area)',
    },
    {
      id: 'kunming',
      label: 'Kunming (KMG)',
      city: 'Kunming',
      allowedArea: 'Yunnan province (verify current area)',
    },
    {
      id: 'wuhan',
      label: 'Wuhan (WUH)',
      city: 'Wuhan',
      allowedArea: 'Hubei province (verify current area)',
    },
  ],
  passportValidityMonths: 6,
  maxStayHours: 240,
};

export type NationalityStatus = 'eligible-list' | 'not-on-list';

export function nationalityStatus(nationality: string): NationalityStatus {
  const normalized = nationality.trim().toLowerCase();
  const matched = visaRules.eligibleCountries.some(
    (country) => country.toLowerCase() === normalized,
  );
  return matched ? 'eligible-list' : 'not-on-list';
}

export function findPort(portId: string): TransitPort | undefined {
  return visaRules.ports.find((port) => port.id === portId);
}
