import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/*
  Typographic apostrophes, applied at the content boundary.

  Markdown bodies go through Smartypants, which turns `China's` into `China’s`.
  Frontmatter is plain YAML and keeps the straight quote, so the two forms end up
  side by side in the same headline and lead paragraph. Normalising here fixes
  every render site at once and leaves the source files alone.

  Only apostrophes sitting between two letters are converted, so quoted values
  (`'pvg'`) and trailing plurals (`Fridays'`) are untouched.
*/
const displayText = z
  .string()
  .transform((value) => value.replace(/([A-Za-z])'(?=[A-Za-z])/g, '$1\u2019'));

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: displayText,
    description: displayText,
    category: z.enum(['transit-visa', 'esim', 'payments', 'cities', 'logistics']),
    updated: z.coerce.date(),
    sources: z
      .array(
        z.object({
          label: displayText,
          url: z.string().url(),
        }),
      )
      .default([]),
    faqs: z
      .array(
        z.object({
          question: displayText,
          answer: displayText,
        }),
      )
      .default([]),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
    heroCreditUrl: z.string().url().optional(),
  }),
});

const cities = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cities' }),
  schema: z.object({
    city: displayText,
    region: displayText,
    bestFor: displayText,
    layoverWindow: displayText,
    attractions: z.array(displayText),
    route: displayText,
    transportTips: displayText,
    eSimTip: displayText,
    paymentTip: displayText,
    mapLink: z.string().url(),
    updated: z.coerce.date(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
    heroCreditUrl: z.string().url().optional(),
  }),
});

export const collections = { guides, cities };
