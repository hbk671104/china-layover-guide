/**
 * Build-time construction of the search index.
 *
 * Every document here becomes one row in `/search-index.json`. Content comes
 * from the same sources the pages render — the `guides` and `cities`
 * collections and the airport data — so the index cannot drift from the site
 * except for the hand-listed hub pages below, which have no data module.
 *
 * Only pages worth landing on are indexed: `/privacy/` and `/terms/` are left
 * out for the same reason the sitemap excludes them.
 */

import type { Airport } from '../data/airports';
import type { SearchDoc } from './search';

export interface GuideSource {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    category: string;
    updated: Date | string;
    faqs?: { question: string; answer: string }[];
  };
}

export interface CitySource {
  id: string;
  body?: string;
  data: {
    city: string;
    region: string;
    bestFor: string;
    layoverWindow: string;
    attractions: string[];
    route: string;
    transportTips: string;
    eSimTip: string;
    paymentTip: string;
    updated: Date | string;
  };
}

/** Mirrors the flags used on the guide lists. */
const CATEGORY_LABELS: Record<string, string> = {
  'transit-visa': 'Transit visa',
  esim: 'eSIM',
  payments: 'Payments',
  logistics: 'Layover logistics',
  cities: 'City trips',
};

/**
 * Hub pages, hand-listed: they are `.astro` files with no data module to read.
 * Titles and descriptions mirror the props each page passes to `BaseLayout`.
 * Add an entry when a new top-level page appears.
 */
export const SITE_PAGES: SearchDoc[] = [
  {
    id: 'page:home',
    url: '/',
    title: 'China Layover Guide',
    kind: 'Page',
    category: 'Start here',
    description:
      'Leave the airport on your China layover. Check 240-hour visa-free transit eligibility, set up an eSIM, and get hour-by-hour plans for 12 cities.',
    headings: ['Visa-free transit', 'eSIM and connectivity', 'Payments', 'City trips', 'Layover logistics'],
    body:
      'Start here. Four things decide whether a China layover works: whether you qualify for 240-hour visa-free transit, whether your phone connects, whether you can pay, and how much of your window survives the airport transfer. The eligibility checker answers the first in four questions.',
    keywords: ['home', 'start here', 'checklist', 'planning'],
  },
  {
    id: 'page:transit-visa',
    url: '/transit-visa/',
    title: 'Do you need a transit visa for China?',
    kind: 'Page',
    category: 'Transit visa',
    description:
      "How China's 240-hour visa-free transit policy works, who qualifies, and how to use it on your layover.",
    headings: ['Eligibility checker', 'Eligible countries', 'Permitted areas', 'Ports'],
    body:
      'Most layover travelers do not need a transit visa. If your passport is from one of 55 eligible countries and your onward flight goes to a third country, you can stay up to 240 hours and leave the airport. TWOV, the 24-hour rule, and the difference between 144 and 240 hours are covered here, along with the ports and permitted areas that accept visa-free transit.',
    keywords: ['240-hour', '240 hour', '144-hour', 'twov', 'visa-free transit', 'transit without visa', 'eligible', 'requirements'],
  },
  {
    id: 'page:esim',
    url: '/esim/',
    title: 'eSIM setup, before you land',
    kind: 'Page',
    category: 'eSIM',
    description:
      'Why you need an eSIM before landing in China, how to pick a plan, and how to stay connected to the apps you already use.',
    headings: ['Which eSIM to buy', 'Install and test', 'eSIM vs VPN vs roaming'],
    body:
      'China blocks Google Maps, WhatsApp, Instagram, and Gmail the moment you connect. A travel eSIM routes your data around the block, but only if you install and test it before you fly. Covers plan sizes, data-only vs voice plans, and what an eSIM does not fix.',
    keywords: ['esim', 'sim card', 'data plan', 'roaming', 'vpn', 'connectivity', 'wifi'],
  },
  {
    id: 'page:payments',
    url: '/payments/',
    title: 'Payments that actually work',
    kind: 'Page',
    category: 'Payments',
    description:
      'Visa and Mastercard acceptance is limited in China. How to pay with Alipay, WeChat Pay, and TenPayGo using the cards you already have.',
    headings: ['Payment recommender', 'Alipay', 'WeChat Pay', 'TenPayGo', 'Cash'],
    body:
      'China runs on QR codes. Hotels and big stores take a Visa or Mastercard; small shops, restaurants, and taxis mostly do not. Linking your card to Alipay or WeChat Pay covers almost everything, and a little cash is still worth carrying as backup. The recommender picks an app based on your card and phone.',
    keywords: ['alipay', 'wechat pay', 'tenpaygo', 'qr code', 'cash', 'atm', 'credit card', 'apple pay', 'google pay'],
  },
  {
    id: 'page:cities',
    url: '/cities/',
    title: 'City trips that fit your layover window',
    kind: 'Page',
    category: 'City trips',
    description:
      'Twelve Chinese cities where long-haul flights stop: routes, transfer times, and the minimum layover each needs, plus 6, 8, 12, and 24-hour itineraries.',
    headings: ['Cities by layover window', 'Minimum viable windows'],
    body:
      'Twelve cities where long-haul flights stop, each with a route, a transfer plan, and the minimum layover it needs, plus in-depth hour-by-hour plans for Beijing, Shanghai, Guangzhou, Chengdu, and Xi’an.',
    keywords: ['cities', 'itinerary', 'sightseeing', 'things to do', 'stopover'],
  },
  {
    id: 'page:airports',
    url: '/airports/',
    title: 'Airport layover guides',
    kind: 'Page',
    category: 'Airports',
    description:
      "Layover guides for China's major airports: transfer times, the smallest window worth leaving for, luggage storage, and whether you can leave the airport.",
    headings: ['Airport index', 'Transfer times', 'Minimum windows'],
    body:
      'From Shanghai Pudong to Xi’an Xianyang. Each guide covers the transfer into the city, what actually fits in your window, luggage storage, and the mistakes that cost travelers their onward flight.',
    keywords: ['airports', 'iata', 'terminal', 'transfers', 'layover'],
  },
  {
    id: 'page:logistics',
    url: '/logistics/',
    title: 'Layover logistics',
    kind: 'Page',
    category: 'Layover logistics',
    description:
      'The practical side of a China layover: airport-to-city transfers, luggage storage, hotel registration, and what to do when things go wrong.',
    headings: ['Transfers', 'Luggage storage', 'Hotel registration'],
    body:
      'The unglamorous parts that decide whether a layover works: getting in from the airport, dropping your bags, registering your stay, and staying out of trouble.',
    keywords: ['logistics', 'luggage', 'storage', 'hotel registration', 'high-speed rail', 'transfers'],
  },
  {
    id: 'page:guides',
    url: '/guides/',
    title: 'All guides',
    kind: 'Page',
    category: 'All guides',
    description:
      'Every China Layover Guide article, grouped by topic: visa-free transit, eSIM, payments, airport transfers, and city layover itineraries.',
    headings: [
      'Visa-free transit & entry rules',
      'City layover itineraries',
      'Payments & apps',
      'eSIM & connectivity',
      'Airport transfers & logistics',
    ],
    body:
      'Every article on the site, grouped by topic and sorted by how recently it was updated.',
    keywords: ['index', 'browse', 'articles', 'list'],
  },
  {
    id: 'page:about',
    url: '/about/',
    title: 'About China Layover Guide',
    kind: 'Page',
    category: 'About',
    description:
      'Who writes China Layover Guide, how we verify visa rules and payment details, and what we can and cannot check first-hand.',
    headings: ['Who writes this', 'How we verify'],
    body:
      'Who writes this site, how visa rules and payment details are verified against official sources, and what cannot be checked first-hand.',
    keywords: ['about', 'editorial', 'methodology', 'sources', 'who writes'],
  },
  {
    id: 'page:authors',
    url: '/authors/',
    title: 'The people behind the guide',
    kind: 'Page',
    category: 'About',
    description:
      'The people who research and write the China Layover Guide. Both live in Beijing; one has used China’s visa-free transit as a foreigner, one tests the payment apps and eSIMs on this site.',
    headings: ['Authors'],
    body: 'Byline pages for everyone who writes here, with what they can and cannot verify first-hand.',
    keywords: ['authors', 'byline', 'team', 'editor'],
  },
];

/** Strip markdown syntax down to searchable prose. */
export function markdownToText(markdown: string): string {
  return markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\|/gm, ' ')
    .replace(/\|\s*$/gm, ' ')
    .replace(/^\s*[-:| ]{3,}\s*$/gm, ' ')
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    .replace(/(\*\*|__|\*|_|~~)/g, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Section titles of a markdown body, for the heading-weighted field. */
export function extractHeadings(markdown: string): string[] {
  const headings: string[] = [];
  const pattern = /^#{2,4}\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    const text = match[1]!
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();
    if (text.length > 0) headings.push(text);
  }

  return headings;
}

/** Slug words are hand-written keyword trails: `pvg-8-hour-layover` → pvg, hour, layover. */
function slugKeywords(id: string): string[] {
  return id.split('-').filter((word) => word.length > 2);
}

const isoDate = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export interface IndexSources {
  guides: GuideSource[];
  cities: CitySource[];
  airports: Airport[];
}

const guideDocs = (guides: GuideSource[]): SearchDoc[] =>
  guides.map((guide) => {
    const category = CATEGORY_LABELS[guide.data.category] ?? guide.data.category;
    const markdown = guide.body ?? '';
    const faqs = (guide.data.faqs ?? [])
      .map((faq) => `${faq.question} ${faq.answer}`)
      .join(' ');

    return {
      id: `guide:${guide.id}`,
      url: `/guides/${guide.id}/`,
      title: guide.data.title,
      kind: 'Guide',
      category,
      description: guide.data.description,
      headings: extractHeadings(markdown),
      body: [markdownToText(markdown), faqs].filter(Boolean).join(' '),
      updated: isoDate(guide.data.updated),
      keywords: [category, guide.data.category, ...slugKeywords(guide.id)],
    };
  });

const cityDocs = (cities: CitySource[]): SearchDoc[] =>
  cities.map((city) => {
    const { data } = city;
    // Frontmatter fields render as page content (highlights, the brief), so
    // they belong in the searchable text as well.
    const facts = [
      data.region,
      data.bestFor,
      data.layoverWindow,
      data.attractions.join(', '),
      data.route,
      data.transportTips,
      data.eSimTip,
      data.paymentTip,
    ].join(' ');

    return {
      id: `city:${city.id}`,
      url: `/cities/${city.id}/`,
      title: `${data.city} layover guide`,
      kind: 'City trip',
      category: 'City trips',
      description: `How to spend a layover in ${data.city}: ${data.bestFor}`,
      headings: ['The brief', 'Highlights', ...extractHeadings(city.body ?? '')],
      body: [markdownToText(city.body ?? ''), facts].filter(Boolean).join(' '),
      updated: isoDate(data.updated),
      keywords: [data.city, data.region, data.layoverWindow, ...data.attractions, ...slugKeywords(city.id)],
    };
  });

const airportDocs = (airports: Airport[]): SearchDoc[] =>
  airports.map((airport) => {
    const code = airport.code.toUpperCase();
    const transfers = airport.transfers
      .map((transfer) => `${transfer.mode}: ${transfer.time}, ${transfer.cost}. ${transfer.notes}`)
      .join(' ');
    const windows = airport.windows
      .map((window) => `${window.label} — ${window.verdict}: ${window.detail}`)
      .join(' ');

    return {
      id: `airport:${airport.code}`,
      url: `/airports/${airport.code}/`,
      title: `${code} layover guide`,
      kind: 'Airport',
      category: 'Airports',
      description: `How to use a layover at ${code} (${airport.name}): transfer times to ${airport.city}, what fits in 6, 8, 12, and 24 hours, luggage storage, and whether you can leave the airport.`,
      headings: [
        'The short answer',
        `Getting into ${airport.city}`,
        'What fits in each window',
        'Luggage storage',
        `${code} traps to avoid`,
      ],
      body: [
        `${airport.name} is ${airport.distance} of ${airport.city}.`,
        airport.transitEligible
          ? `${code} is covered by 240-hour visa-free transit; the permitted area is ${airport.permittedArea}.`
          : `${code} is not covered by visa-free transit.`,
        `The shortest layover worth leaving the airport is about ${airport.minViableHours} hours; ${airport.comfortableHours} hours is comfortable.`,
        transfers,
        windows,
        airport.luggage.available
          ? `Luggage storage: ${airport.luggage.location} ${airport.luggage.cost}.`
          : 'No luggage storage.',
        airport.gotchas.join(' '),
      ].join(' '),
      updated: isoDate(airport.updated),
      keywords: [
        code,
        airport.code,
        airport.name,
        airport.city,
        airport.permittedArea,
        'iata',
        ...airport.transfers.map((transfer) => transfer.mode),
      ],
    };
  });

/** Every document the search panel can return, in a stable order. */
export function buildSearchDocs({ guides, cities, airports }: IndexSources): SearchDoc[] {
  return [...guideDocs(guides), ...cityDocs(cities), ...airportDocs(airports), ...SITE_PAGES];
}
