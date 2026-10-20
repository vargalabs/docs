# docs.vargalabs.com

Customer documentation for SIGMA by VargaLABS: getting started, licensing, billing, sigma-aid and sigma-ide.

The site is a static React build (Vite, Tailwind, TypeScript) that uses the same theme as the store.
Pages are Markdown files under `content/`. It is hosted on GitHub Pages.

## Add a page

1. Create `content/<section>/<slug>.md`. The section is `sigma`, `sigma-aid` or `sigma-ide`.
2. Start the file with front matter:

   ```
   ---
   title: Getting started
   order: 10
   summary: One sentence shown in the section index.
   ---
   ```

3. Write plain Markdown. GFM tables and ```` ```mermaid ```` fences work. Do not use raw HTML.
4. The page URL is `/<section>/<slug>/`. `index.md` is the section landing page. `order` sorts the sidebar.
5. Put images in `public/img/<section>/` and link them as `/img/<section>/<file>`.

## Develop

```
pnpm install
pnpm dev      # local server
pnpm lint
pnpm build    # type-check, bundle, then pre-render one index.html per route into dist/
```

Pushes to `release` deploy `dist/` to GitHub Pages (`.github/workflows/site.yml`).
