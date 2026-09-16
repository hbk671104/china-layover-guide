// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 生产域名：chinalayoverguide.com（DNS 托管在 Cloudflare）
  site: 'https://chinalayoverguide.com',
  output: 'static',
  integrations: [mdx(), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/.reasonix/**', '**/.agents/**'],
      },
    },
  },
});
