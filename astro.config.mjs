// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import expressiveCode from 'astro-expressive-code';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://docu.adenyrr.me',
  devToolbar: { enabled: false },
  output: 'static',
  build: { format: 'directory' },
  integrations: [
    expressiveCode({
      themes: ['one-dark-pro'],
      defaultProps: { frame: 'none' },
    }),
    mdx(),
    sitemap(),
    robotsTxt({
      policy: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://docu.adenyrr.me/sitemap-index.xml',
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
