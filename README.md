# ERTNER&SO Contao frontend

This repository contains the modular stylesheet maintained by the site owner,
the JavaScript source, fixed frontend assets, and copies of the active Contao
templates for `staging.ertnerundso.de`. It does not contain the Contao database,
CMS-managed content or customer uploads.

## Live delivery

- The root `site.css` is the short, editable stylesheet entry point. It imports
  the 30 thematic files in `css/` directly into their cascade layers.
- The Contao page template continues to load that root `site.css` from GitHub
  Pages. The browser then loads its imported modules from the same repository.
  Edit a module, commit and push: no CSS build or generated bundle is required.
  Allow a few minutes for Pages publishing and browser caching.
- `npm run check:css` checks syntax, import coverage, layer order and asset URLs.
  GitHub Actions runs this read-only check on pull requests and on `main`.
- `src/site.js` and `src/scene.js` are editable source. `npm run build:js`
  produces the bundled JavaScript in `dist/`. A GitHub Action rebuilds and publishes it
  when the source or dependencies change; the Contao template loads that file
  from GitHub Pages. Allow a few minutes for Pages caching after a change.
- `templates/` contains source-controlled copies of the active Contao templates.
  GitHub edits to these files do **not** deploy automatically. Sync a changed
  template to staging's persistent `templates/` directory and clear the Contao
  cache before expecting it to appear on the site.
- `assets/` contains the fixed assets used by the frontend. The site currently
  serves these from `/clean/assets/` on staging. Changing an asset in GitHub
  also requires synchronizing that asset to staging.

Production is not deployed from this repository. Do not put credentials,
customer uploads or CMS database exports here; this repository is public.

## Editing CSS

Change the relevant file in `css/`, then commit and push it. For local
validation, run `npm ci` once and `npm run check:css` after editing. To add a
module, add its import in the root `site.css` at the appropriate position
within its existing layer. Keep asset URLs absolute.

The browser fetches the 30 modules separately, so this delivery uses more CSS
requests than a combined bundle. All imports are direct children of `site.css`;
there is no second entry point or nested import chain. If copying CSS to another
server, copy both `site.css` and the complete `css/` directory, keeping the same
relative paths. Open local previews through an HTTP server, not a file URL.

| Area | Modules in `css/` |
| --- | --- |
| Foundation | `fonts.css`, `variables.css`, `base.css`, `typography.css` |
| Layout | `layout.css`, `responsive.css`, `header.css`, `navigation.css`, `footer.css` |
| Components | `buttons.css`, `cards.css`, `surfaces.css`, `forms.css`, `motion.css` |
| Sections | `hero.css`, `statement.css`, `work.css`, `process.css`, `showreel.css`, `benefits.css`, `testimonials.css`, `journal.css`, `configurator.css`, `contact.css` |
| Contao wrappers in the sections layer | `contao-components.css`, `contao-forms.css` |
| CMS and pages | `pages.css`, `news.css`, `contao.css`, `legal.css` |

The split preserves every selector, declaration, media condition and their
order from commit `2bbaa56`. Shared overrides remain in their existing layers
and order, even where they affect several features. Responsive rules generally
remain next to their feature; existing cross-feature rules live in
`responsive.css`. This change does not rename typography tokens or alter fonts.
See `ARCHITECTURE.md` for the cascade and maintenance rules.
