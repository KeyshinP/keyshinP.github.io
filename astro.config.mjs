import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://keyshinp.github.io',
  base: '/',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      wrap: true
    }
  }
});
