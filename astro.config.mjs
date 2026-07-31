import { defineConfig } from 'astro/config';

// Custom integration: make all injected <link rel="stylesheet"> non-blocking
// Uses the media="print" trick: loads CSS asynchronously, then switches to all
function deferCSSIntegration() {
  return {
    name: 'defer-css',
    hooks: {
      'astro:build:done': async ({ pages, dir }) => {
        const { readFile, writeFile } = await import('node:fs/promises');
        const { fileURLToPath } = await import('node:url');
        const path = await import('node:path');

        for (const page of pages) {
          const filePath = path.join(fileURLToPath(dir), page.pathname, 'index.html').replace(/index\.html\/index\.html$/, 'index.html');
          const rootFile = path.join(fileURLToPath(dir), 'index.html');
          
          let htmlPath;
          try {
            await readFile(filePath);
            htmlPath = filePath;
          } catch {
            try {
              await readFile(rootFile);
              htmlPath = rootFile;
            } catch {
              continue;
            }
          }

          let html = await readFile(htmlPath, 'utf8');
          
          // Convert blocking <link rel="stylesheet"> to non-blocking using media="print" trick
          // Add noscript fallback for each
          const noscriptLinks = [];
          html = html.replace(
            /<link rel="stylesheet" href="([^"]+)">/g,
            (match, href) => {
              noscriptLinks.push(`<link rel="stylesheet" href="${href}">`);
              return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
            }
          );

          await writeFile(htmlPath, html, 'utf8');
        }
      }
    }
  };
}

export default defineConfig({
  output: 'static',
  integrations: [deferCSSIntegration()],
  vite: {
    ssr: {
      noExternal: ['astro-fontawesome']
    }
  }
});
