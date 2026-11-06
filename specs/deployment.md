# Deployment

## Overview

The production build is hosted as a static site on Netlify at a new, dedicated site URL.

## User Stories

- As a player, I want to open the game at a public URL so that I can play without installing anything.
- As the owner, I want deploys to be repeatable so that shipping a new version is one command.

## Requirements

- [ ] `netlify.toml` at repo root: build command `npm run build`, publish directory `dist`, Node version pinned
- [ ] Security/caching headers in `netlify.toml`: long-lived immutable cache for hashed assets, no-cache for `index.html`, basic security headers (`X-Content-Type-Options`, `Referrer-Policy`)
- [ ] Vite `base` is `/` (site served from the root of its own Netlify domain)
- [ ] `npm run build` output works when served statically (verified with `vite preview`)
- [ ] README section documents deploy steps: `npx netlify-cli deploy --build` (draft preview) and `npx netlify-cli deploy --build --prod`
- [ ] Deploys are run manually by the owner; the Ralph loop must NOT deploy or run Netlify commands

## Acceptance Criteria

- [ ] `netlify.toml` exists and is valid; `npm run build` produces `dist/index.html`
- [ ] Playwright smoke test passes against `vite preview` of the production build

## Out of Scope

- Custom domain
- Netlify Functions, forms or analytics
- Automatic deploys from inside the Ralph loop
