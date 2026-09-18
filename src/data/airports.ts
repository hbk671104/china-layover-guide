/**
 * Airport layover data for the city-pair / airport-pair content tier.
 *
 * IMPORTANT: transfer times, fares, and operating hours change. This is a
 * best-effort snapshot reviewed 2026-09-17 and MUST be verified against the
 * airport's own transport page before relying on it.
 *
 * Every number here surfaces on /airports/<code>/ — keep it conservative.
 */

export interface TransferOption {
  mode: string;
  time: string;
  cost: string;
  notes: string;
  /** Traffic-proof options are the ones to trust on a tight layover. */
  trafficProof: boolean;
}

export interface LayoverWindow {
  /** Rough layover length in hours. */
  label: string;
  verdict: string;
  detail: string;
}

export interface Airport {
  /** IATA code, lowercase — also the URL slug. */
  code: string;
  name: string;
  city: string;
  /** City page slug, when one exists. */
  citySlug?: string;
  /** Approximate distance from the city centre. */
  distance: string;
  /** Whether the 240-hour transit policy covers this port. */
  transitEligible: boolean;
  /** Permitted area for visa-free transit travelers. */
  permittedArea: string;
  transfers: TransferOption[];
  windows: LayoverWindow[];
  /** The shortest layover where leaving the airport is genuinely worthwhile. */
  minViableHours: number;
  /** Hours at which the layover becomes comfortable. */
  comfortableHours: number;
  luggage: {
    available: boolean;
    cost: string;
    location: string;
  };
  /** Airport-specific traps worth a callout. */
  gotchas: string[];
}

export const airports: Airport[] = [
  {
    code: 'pvg',
    name: 'Shanghai Pudong International Airport',
    city: 'Shanghai',
    citySlug: 'shanghai',
    distance: '~30 km east of the centre',
    transitEligible: true,
    permittedArea: 'Shanghai municipality',
    minViableHours: 7,
    comfortableHours: 8,
    transfers: [
      {
        mode: 'Maglev + Metro Line 2',
        time: '~40–55 min',
        cost: '¥50 + ¥4 (¥40 Maglev with same-day boarding pass)',
        notes:
          'The fastest route in. The Maglev covers 30 km to Longyang Road in about 8 minutes, then you transfer to Metro Line 2.',
        trafficProof: true,
      },
      {
        mode: 'Metro Line 2 (direct)',
        time: '60–90 min',
        cost: '¥7–9',
        notes:
          'Cheapest, and it runs the whole way without a Maglev transfer — but it stops 20+ times through Pudong.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '45–70 min',
        cost: '¥150–250',
        notes:
          'Door-to-door and best with heavy bags, but traffic-dependent. Metered fare plus any highway tolls.',
        trafficProof: false,
      },
      {
        mode: 'Airport bus',
        time: '60–90 min',
        cost: '¥20–36',
        notes:
          'Fixed routes to specific hubs and hotels. Useful if your destination happens to be on the route.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 6 hours',
        verdict: 'Stay airside',
        detail:
          'PVG immigration alone can take 60–90 minutes at a peak evening arrival bank. You would reach Longyang Road and turn straight around.',
      },
      {
        label: '6–8 hours',
        verdict: 'Doable and worth it',
        detail:
          'Maglev plus Metro Line 2 to the Bund, roughly 2.5–3 hours on the ground, one good meal, and back with a 2.5-hour buffer.',
      },
      {
        label: '8–12 hours',
        verdict: 'The sweet spot',
        detail:
          'A real half-day: the Bund, Yu Garden and the old town, lunch, and a walk up Nanjing Road.',
      },
      {
        label: '12–24 hours',
        verdict: 'A proper stopover',
        detail:
          'Add the French Concession, a river cruise, and unhurried meals. An overnight in Puxi makes this genuinely relaxed.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location:
        'Left-luggage counters (行李寄存) in the arrivals and departures halls; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'PVG and Hongqiao (SHA) are about 70 km apart. A cross-airport connection eats 1.5–2 hours by road — never combine one with sightseeing.',
      'The Maglev stops running around 21:40, and Metro Line 2 around 22:30. Late arrivals are taxi or DiDi only.',
      'The Maglev only reaches Longyang Road, which is not the city centre. You still need a metro transfer.',
    ],
  },
  {
    code: 'can',
    name: 'Guangzhou Baiyun International Airport',
    city: 'Guangzhou',
    citySlug: 'guangzhou',
    distance: '~28 km north of the centre',
    transitEligible: true,
    permittedArea: 'Guangdong province',
    minViableHours: 7,
    comfortableHours: 8,
    transfers: [
      {
        mode: 'Metro Line 3',
        time: '~45–55 min',
        cost: '~¥8',
        notes:
          'Direct from the airport into the Tianhe business district and the city centre. Cheap and traffic-proof.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '45–60 min',
        cost: '¥100–130',
        notes: 'Comfortable with luggage but traffic-dependent, especially in rush hour.',
        trafficProof: false,
      },
      {
        mode: 'Airport bus',
        time: '60–90 min',
        cost: '¥15–30',
        notes: 'Routes to major hotels and railway stations. Slower than the metro in most cases.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 6 hours',
        verdict: 'Stay airside',
        detail: 'Immigration plus the return buffer leaves too little to justify the trip.',
      },
      {
        label: '6–8 hours',
        verdict: 'Dim sum and a walk',
        detail:
          'Metro Line 3 in, a proper dim sum meal, and Shamian Island for an hour. Arrive before 11am for the best dim sum.',
      },
      {
        label: '8–10 hours',
        verdict: 'The classic Guangzhou stop',
        detail:
          'Dim sum, Shamian Island, Canton Tower, and a street-food pass along Beijing Road before heading back.',
      },
      {
        label: '12–24 hours',
        verdict: 'A food trip',
        detail:
          'Add Chen Clan Ancestral Hall, a Pearl River night cruise, and a serious Cantonese dinner. Foshan is 30 minutes by metro.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in the terminal; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'Guangzhou is spread out. Do not try to combine Canton Tower and the old town on a very short layover.',
      'Dim sum is a morning and lunch ritual. Arriving at 3pm means missing the point of the city.',
      'Immigration can be slow at peak hours — leave a real buffer for your onward flight.',
    ],
  },
  {
    code: 'pek',
    name: 'Beijing Capital International Airport',
    city: 'Beijing',
    citySlug: 'beijing',
    distance: '~25 km northeast of the centre',
    transitEligible: true,
    permittedArea: 'Beijing municipality',
    minViableHours: 7,
    comfortableHours: 10,
    transfers: [
      {
        mode: 'Airport Express',
        time: '25–35 min to Dongzhimen / Sanyuanqiao',
        cost: '¥25',
        notes:
          'Runs roughly 06:00–23:00 every ~10 minutes, then metro onward. The most predictable option.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '40–70 min',
        cost: '¥100–200',
        notes: 'Best for late arrivals or heavy bags. Traffic-dependent.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 6 hours',
        verdict: 'Stay airside',
        detail: 'Immigration and the transfer consume almost everything.',
      },
      {
        label: '6–8 hours',
        verdict: 'One sight, done properly',
        detail:
          'About 2.5–3 hours on the ground. Pick Tiananmen Square plus a hutong walk, or the Temple of Heaven — not both.',
      },
      {
        label: '10–12 hours',
        verdict: 'A real Beijing day',
        detail:
          'The Forbidden City (pre-booked) plus Jingshan Park for the view, and a Peking duck lunch. The sweet spot for a first visit.',
      },
      {
        label: '24 hours+',
        verdict: 'Add the Great Wall',
        detail:
          'Mutianyu is roughly 1.5–2 hours each way by pre-booked car. Overnight in the city and go early.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in Terminals 2 and 3; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'PEK and Daxing (PKX) are on opposite sides of the city, roughly 80 km apart. A cross-airport transfer is 1.5–2 hours.',
      'Forbidden City tickets are passport-linked and sell out. Book before you fly.',
      'The Airport Express stops just after 23:00, so late arrivals need a taxi or DiDi.',
    ],
  },
  {
    code: 'pkx',
    name: 'Beijing Daxing International Airport',
    city: 'Beijing',
    citySlug: 'beijing',
    distance: '~50 km south of the centre',
    transitEligible: true,
    permittedArea: 'Beijing municipality',
    minViableHours: 8,
    comfortableHours: 12,
    transfers: [
      {
        mode: 'Daxing Airport Express',
        time: '30–40 min to Caoqiao (Line 10)',
        cost: '¥35',
        notes: 'Then Metro Line 10, 14, or 16 onward. Fast and traffic-proof.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '50–80 min',
        cost: '¥150–250',
        notes: 'The airport is far south, so road transfers are long and traffic-dependent.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 7 hours',
        verdict: 'Stay airside',
        detail: 'Daxing is far enough out that a short layover does not leave usable city time.',
      },
      {
        label: '8–10 hours',
        verdict: 'One downtown sight',
        detail:
          'Temple of Heaven or a hutong walk, with a strict return plan. Not enough for the Forbidden City and a meal.',
      },
      {
        label: '12 hours',
        verdict: 'A real Beijing day',
        detail:
          'The Forbidden City plus Jingshan Park becomes feasible, but the drive is long at both ends.',
      },
      {
        label: '24 hours+',
        verdict: 'A proper stopover',
        detail: 'Overnight in the city. Add Mutianyu for the Great Wall — a private car is the only realistic option.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in the terminal; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'Daxing is roughly twice as far from the centre as Capital Airport. Everything takes longer.',
      'A PEK↔PKX connection is a 1.5–2 hour transfer across the city — do not add sightseeing to one.',
      'Allow 2.5 hours at the airport before an international departure.',
    ],
  },
  {
    code: 'sha',
    name: 'Shanghai Hongqiao International Airport',
    city: 'Shanghai',
    citySlug: 'shanghai',
    distance: '~13 km west of the centre',
    transitEligible: true,
    permittedArea: 'Shanghai municipality',
    minViableHours: 5,
    comfortableHours: 8,
    transfers: [
      {
        mode: 'Metro Lines 2 / 10',
        time: '30–50 min',
        cost: '¥3–7',
        notes:
          'Both lines stop at the terminal. The easiest big-city airport connection in China.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '20–40 min',
        cost: '¥40–100',
        notes: 'Cheap because Hongqiao is close in. Rush hour on the elevated roads can double it.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 5 hours',
        verdict: 'Stay airside',
        detail: 'Even close in, immigration and the return buffer need most of it.',
      },
      {
        label: '5–6 hours',
        verdict: 'A quick taste',
        detail: 'Metro to People’s Square and the Bund, one snack, and straight back. Tight but real.',
      },
      {
        label: '8–12 hours',
        verdict: 'Comfortable',
        detail:
          'The Bund, Yu Garden, and a proper meal without rushing. Hongqiao is the best layover airport in Shanghai.',
      },
      {
        label: '12–24 hours',
        verdict: 'A full city day',
        detail: 'Add the French Concession and a river cruise, and still have time to spare.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in the terminal; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'If your inbound is SHA and your outbound is PVG, that is roughly 70 km across the city — allow 1.5–2 hours.',
      'Terminal 2 connects to Hongqiao Railway Station, which is handy for high-speed rail day trips.',
      'Hongqiao handles many domestic flights, so check which airport your international connection uses.',
    ],
  },
  {
    code: 'szx',
    name: "Shenzhen Bao'an International Airport",
    city: 'Shenzhen',
    citySlug: 'shenzhen',
    distance: '~30 km west of the centre',
    transitEligible: true,
    permittedArea: 'Guangdong province',
    minViableHours: 7,
    comfortableHours: 9,
    transfers: [
      {
        mode: 'Metro Line 11',
        time: '30–50 min',
        cost: '~¥7–10',
        notes: 'Express metro into Futian and Chegongmiao. Modern, cheap, signed in English.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '40–60 min',
        cost: '¥100–150',
        notes: 'Convenient with luggage, slower in rush hour.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 6 hours',
        verdict: 'Stay airside',
        detail: 'Not enough usable city time once immigration and the return buffer are counted.',
      },
      {
        label: '7–8 hours',
        verdict: 'Skyline and a walk',
        detail: 'Line 11 to Futian, the Ping An Finance Centre area, and a walk at Shenzhen Bay.',
      },
      {
        label: '9–12 hours',
        verdict: 'Comfortable',
        detail: 'Add OCT Loft for galleries and cafés, and a proper Cantonese meal.',
      },
      {
        label: '12–24 hours',
        verdict: 'A full day',
        detail: 'Add Dongmen for street food, or cross into Hong Kong if your documents allow it.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in the terminal; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'Shenzhen sits on the Hong Kong border. If you plan to cross, check your visa or entry status for both sides.',
      'The city is long and narrow — allow for distance between the bay, Futian, and the airport.',
      'Line 11 is an express line; not every metro line reaches the airport directly.',
    ],
  },
  {
    code: 'tfu',
    name: 'Chengdu Tianfu International Airport',
    city: 'Chengdu',
    citySlug: 'chengdu',
    distance: '~50 km southeast of the centre',
    transitEligible: true,
    permittedArea: '11 cities in Sichuan (Chengdu, Zigong, Luzhou, Deyang, Suining, Neijiang, Leshan, Yibin, Ya’an, Meishan, Ziyang)',
    minViableHours: 8,
    comfortableHours: 10,
    transfers: [
      {
        mode: 'Metro Line 18',
        time: '35–40 min to the city',
        cost: '¥7–10',
        notes: 'Express metro link. Fast and reliable, though Tianfu is genuinely far out.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '50–70 min',
        cost: '¥120–180',
        notes: 'Worth it if you are heading straight to the panda base outside the centre.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 7 hours',
        verdict: 'Stay airside',
        detail: 'Tianfu is far from the centre, so a short layover leaves no usable time.',
      },
      {
        label: '8–9 hours',
        verdict: 'Pandas, if you land early',
        detail:
          'The Panda Base is the draw and pandas are most active before 10am. This only works with a morning arrival.',
      },
      {
        label: '10–12 hours',
        verdict: 'Pandas plus a teahouse',
        detail:
          'Panda Base in the morning, then People’s Park for tea and Jinli Street for snacks.',
      },
      {
        label: '24 hours',
        verdict: 'A food trip',
        detail:
          'Add Kuanzhai Alley, a serious hotpot dinner, and a Sichuan opera face-changing show.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in the terminal; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'Landing after midday means you will miss the pandas — they sleep through the afternoon.',
      'Tianfu is far from the centre. Do not budget the same as for a close-in airport.',
      'Panda Base tickets are passport-linked and busy; book ahead.',
    ],
  },
  {
    code: 'xiy',
    name: "Xi'an Xianyang International Airport",
    city: "Xi'an",
    citySlug: 'xian',
    distance: '~40 km northwest of the centre',
    transitEligible: true,
    permittedArea: 'Shaanxi province',
    minViableHours: 8,
    comfortableHours: 10,
    transfers: [
      {
        mode: 'Airport bus Line 1',
        time: '~40–50 min to the railway station',
        cost: '~¥25',
        notes: 'Reliable and cheap. Several routes serve different parts of the city.',
        trafficProof: false,
      },
      {
        mode: 'Metro Line 14',
        time: 'Connects to the city network',
        cost: '~¥7',
        notes: 'Links into the metro system; check the current interchange for your destination.',
        trafficProof: true,
      },
      {
        mode: 'Taxi / DiDi',
        time: '40–60 min',
        cost: '¥100–130',
        notes: 'Most efficient if you are heading straight to the Terracotta Army.',
        trafficProof: false,
      },
    ],
    windows: [
      {
        label: 'Under 6 hours',
        verdict: 'Stay airside',
        detail: 'Enough only for a rushed City Wall stop, and not comfortably.',
      },
      {
        label: '8 hours',
        verdict: 'The city',
        detail:
          'The City Wall at the South Gate and the Muslim Quarter. Both are close to the centre and need no long transfer.',
      },
      {
        label: '10–12 hours',
        verdict: 'The Terracotta Army',
        detail:
          'The site is about an hour out and deserves 2–3 hours, so this means a pre-booked driver and no other big stop.',
      },
      {
        label: '24 hours',
        verdict: 'Both, unhurried',
        detail:
          'Terracotta Army in the morning, City Wall in the afternoon, Muslim Quarter for dinner, and the illuminated Bell and Drum Towers at night.',
      },
    ],
    luggage: {
      available: true,
      cost: '¥15–30 per bag per day (indicative)',
      location: 'Left-luggage counters in the terminal; confirm the current location and hours at the airport.',
    },
    gotchas: [
      'The Terracotta Army needs roughly 8–9 hours of layover to be comfortable once immigration, driving, and the return buffer are counted.',
      'Book Terracotta Army tickets online in advance with your passport — they sell in timed waves.',
      'A taxi back from the Terracotta Army site is hard to find. Pre-book your driver for the round trip.',
    ],
  },
];

export function findAirport(code: string): Airport | undefined {
  return airports.find((airport) => airport.code === code.toLowerCase());
}
