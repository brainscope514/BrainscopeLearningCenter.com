import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL / BASE_PATH are injected by the GitHub Pages workflow (actions/configure-pages).
// With a custom domain, BASE_PATH is empty. Locally they fall back to sensible defaults.
const site = process.env.SITE_URL || 'https://phoenix-falcon001.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      // The root page (src/pages/index.astro) does language detection itself.
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
