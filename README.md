# Tee-Duh — Fashion Website Design

An individual portfolio case study of the CS2024 team project by Michael Joseph Candra, Aisha Tasya Aulia, Celine Emily Wijaya and Muhammad Rizki.

- Case-study repository: https://github.com/michaeljc2605/tee-duh
- Live case study: https://michaeljc2605.github.io/tee-duh/
- Existing live website demo: https://michaeljc2605.github.io/teduh-site/

The case study is separate from the existing demo; the demo repository is not modified.

## Experience

Three selectable design personas show their situation, hesitation, specific design response and proposed shopping journey. Alégor prioritises discovery and fit confidence; Diniyan needs quality/value detail; Andrew values community and independent style. An original-screen gallery shows the homepage, catalogue and product page, while source panels explain the persona mapping and the 19-to-15-page sitemap decision.

The background reuses the exact CSS layers and JavaScript renderer from the live personal portfolio, including its scroll-driven industrial-to-cosmic transitions, mobile particle count and reduced-motion behaviour. A canvas-unavailable fallback preserves CSS colour changes.

## Evidence

The attached project deck is included unchanged in `docs/teeduh-project-deck.pdf`. It is a single, very tall PDF page. The personas are design archetypes; the deck does not establish interview counts or measured customer-segment validation. Salary assumptions are omitted. The 20% marketplace-sales figure is a marketing target, not an achieved result. Michael is listed as a team member; no unverified individual leadership or research ownership is claimed.

## Run and build

Open `index.html`, or serve this folder with `python3 -m http.server 8000`. No package installation is required. With Node 22 or later:

```sh
node scripts/check.mjs
node scripts/build.mjs
```

The build copies the complete static site to `dist/`. All local URLs are relative, so `/tee-duh/` hosting works. The included Pages workflow deploys pushes to `main` once GitHub Pages is configured to use GitHub Actions.

## Files

- `index.html`: case-study content and persona panels.
- `styles.css`: responsive page styling.
- `app.js`: persona/gallery selection, image zoom and chapter progress.
- `background.css`, `background.js`: the portfolio's actual animated scene.
- `assets/`: original project visuals optimised as WebP.
- `docs/`: original deck and source notes.
- `scripts/`: dependency-free build and checks.

## Publication status

Published and verified on **15 November 2026**. The public repository is live, and the GitHub Pages workflow completed successfully. The live case-study page, local assets and source PDF were checked; desktop and mobile layouts and case-study controls were verified in Chrome.

The original demo remains at its separate URL. Marketplace transactions, sign-up fulfillment and sales tracking are not asserted to be operational from these checks.
