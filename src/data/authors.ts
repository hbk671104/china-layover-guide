/**
 * Named authors, so every article carries a real attribution instead of an
 * anonymous "the editorial team".
 *
 * Both authors live in Beijing. That matters for what we can claim:
 *   - Payments and eSIM guides are based on the author testing the apps and
 *     plans on the ground in China.
 *   - Visa and transit rules cannot be self-tested, so those are verified
 *     against official NIA publications instead.
 *
 * Keep `verification` honest per person. Do not upgrade a source check into a
 * claim of first-hand testing.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

export interface Author {
  slug: string;
  name: string;
  /** Short role shown next to the byline. */
  role: string;
  /** One-line summary for cards and the byline tooltip. */
  tagline: string;
  /** Paragraphs for the author page. */
  bio: string[];
  /** Topics this author owns. Rendered as chips. */
  knowsAbout: string[];
  location: string;
  /** External profiles, used for schema.org sameAs. */
  sameAs: string[];
  alumniOf: { name: string; url?: string }[];
  /**
   * Headshot path in /public. Resolved at build time: if the file is missing the
   * templates fall back to a monogram, so a not-yet-uploaded photo never ships
   * a broken <img>.
   */
  avatar?: string;
  /** True when the avatar file is present on disk. */
  hasAvatar: boolean;
  /**
   * What this author can honestly vouch for. Shown on the author page and used
   * to pick the wording of the on-article trust line.
   */
  verification: string;
  /** Content categories this author signs. */
  categories: string[];
}

interface AuthorInput extends Omit<Author, 'hasAvatar'> {
  avatar?: string;
}

/** Does the avatar exist in public/? */
function avatarExists(avatarPath?: string): boolean {
  if (!avatarPath) return false;
  const root = path.resolve(process.cwd(), 'public');
  return existsSync(path.join(root, avatarPath.replace(/^\//, '')));
}

function withAvatarState(input: AuthorInput): Author {
  const hasAvatar = avatarExists(input.avatar);
  return {
    ...input,
    // Drop the path entirely when the file is absent, so nothing can reference it.
    avatar: hasAvatar ? input.avatar : undefined,
    hasAvatar,
  };
}

const authorData: AuthorInput[] = [
  {
    slug: 'nora-li',
    name: 'Nora Li',
    role: 'Transit visas, city trips and planning',
    tagline:
      'American who grew up in Beijing, moved back as an adult, and has used China’s visa-free transit as a foreigner.',
    bio: [
      'Nora grew up in Beijing and moved to New Jersey for high school. She studied economics at UC Berkeley, then spent a year in Chile before settling in North America.',
      'She now lives in Beijing again, this time on a US passport. That combination, someone who knows how China works from the inside but travels it on foreign documents, is exactly the vantage point these guides are written from.',
      'She has used China’s visa-free transit entry herself, which is why the transit guides focus on the parts that actually trip people up: the onward-ticket rule, the transit lane at immigration, and how much of a layover is genuinely usable once you subtract the airport.',
      'She writes our transit-visa, city and planning guides. When a rule changes, she is the one who re-reads the National Immigration Administration publication and updates the page.',
    ],
    knowsAbout: [
      '240-hour visa-free transit',
      'China visa policy',
      'Layover itinerary planning',
      'Beijing and Shanghai city trips',
      'Third-country transit rules',
    ],
    location: 'Beijing, China',
    sameAs: [],
    alumniOf: [
      { name: 'University of California, Berkeley' },
    ],
    avatar: '/images/authors/nora-li.jpg',
    verification:
      'Transit and visa pages are checked line by line against publications from the National Immigration Administration (NIA). Nora has used the visa-free transit entry herself.',
    categories: ['transit-visa', 'cities'],
  },
  {
    slug: 'bokang-huang',
    name: 'Bokang Huang',
    role: 'Payments, eSIM and apps',
    tagline:
      'Software engineer in Beijing who tests the payment apps and eSIM plans on this site before we recommend them.',
    bio: [
      'Bokang grew up in Beijing and studied information science and technology as an undergraduate, then completed a Master of Engineering in computer science at Cornell.',
      'He now lives in Beijing, working as a software engineer. That background shapes how he writes about the technical side of travel here: how a foreign card actually behaves inside Alipay, what a QR code payment does behind the scenes, and why a VPN and an eSIM are not interchangeable.',
      'He is the reason the payments and connectivity guides contain specifics rather than generalities. He sets up each payment app and eSIM plan on a foreign card, tests what works and what fails, and writes up the result. Plans and acceptance rules change often, so he re-tests and updates the pages.',
      'Outside work he travels as much as he can, which is usually where the ideas for these guides come from.',
    ],
    knowsAbout: [
      'Alipay and WeChat Pay with foreign cards',
      'eSIM plans for China',
      'VPN and roaming options',
      'Ride-hailing and transport apps',
      'QR payments and cash',
    ],
    location: 'Beijing, China',
    sameAs: ['https://github.com/hbk671104'],
    alumniOf: [
      { name: 'Penn State University' },
      { name: 'Cornell University' },
    ],
    avatar: '/images/authors/bokang-huang.jpg',
    verification:
      'Payment and eSIM guides are based on first-hand testing in China. Bokang sets up each app and plan on a foreign card and confirms what actually works before it is published.',
    categories: ['payments', 'esim', 'logistics'],
  },
];

export const authors = authorData.map(withAvatarState);

export function findAuthor(slug: string): Author | undefined {
  return authors.find((author) => author.slug === slug);
}

/** Pick the author who owns this content category. */
export function authorForCategory(category: string): Author {
  return (
    authors.find((author) => author.categories.includes(category)) ?? authors[0]
  );
}

/** Human-readable label for a category. */
export const categoryLabels: Record<string, string> = {
  'transit-visa': 'Transit visas',
  esim: 'eSIM and connectivity',
  payments: 'Payments',
  cities: 'City trips',
  logistics: 'Layover logistics',
};
