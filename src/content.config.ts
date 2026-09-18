import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['transit-visa', 'esim', 'payments', 'cities', 'logistics']),
    updated: z.coerce.date(),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
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
    city: z.string(),
    region: z.string(),
    bestFor: z.string(),
    layoverWindow: z.string(),
    attractions: z.array(z.string()),
    route: z.string(),
    transportTips: z.string(),
    eSimTip: z.string(),
    paymentTip: z.string(),
    mapLink: z.string().url(),
    updated: z.coerce.date(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
    heroCreditUrl: z.string().url().optional(),
  }),
});

export const collections = { guides, cities };
