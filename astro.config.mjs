// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { sitemapWithLastmod } from './src/lib/sitemap-lastmod';

// https://astro.build/config
export default defineConfig({
  // 生产域名：chinalayoverguide.com（DNS 托管在 Cloudflare）
  site: 'https://chinalayoverguide.com',
  output: 'static',
  integrations: [mdx(), react(), sitemapWithLastmod()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/.reasonix/**', '**/.agents/**'],
      },
    },
  },
});
