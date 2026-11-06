# Frogger

A browser Frogger clone built with TypeScript, HTML canvas and Vite.

## Development

```bash
npm install
npm run dev          # Vite dev server
npm run build        # tsc + production build into dist/
npm run preview      # serve the production build
```

## Testing

```bash
npm run test:run     # unit tests (Vitest)
npm run check        # typecheck + lint + format check + unit tests
npm run test:e2e     # Playwright smoke/interaction/visual tests
npm run test:e2e:update  # update visual baselines (only for intended visual changes)
```

## Deployment (Netlify)

The site is a static build (`publish = "dist"`, see `netlify.toml`) served from the root of its own domain (Vite `base: '/'`). Deploys are run manually by the owner:

```bash
npx netlify-cli deploy --build          # draft preview deploy
npx netlify-cli deploy --build --prod   # production deploy
```
