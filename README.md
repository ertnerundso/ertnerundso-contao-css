# ERTNER&SO Contao frontend

This repository contains the modular stylesheet maintained by the site owner,
the JavaScript source, fixed frontend assets, and copies of the active Contao
templates for `staging.ertnerundso.de`. It does not contain the Contao database,
CMS-managed content or customer uploads.

## Einfach CSS bearbeiten

Die deutsche [CSS-Anleitung](CSS-ANLEITUNG.md) zeigt dir die zuständige Datei.
Alle Schriftregeln stehen in `css/typography.css`; gemeinsame Werte in
`css/base.css`; Flächen in `css/surfaces.css`; Bewegungen in `css/motion.css`.
Komponenten-Dateien enthalten ausschließlich Anordnung und Abstände.

## Live delivery

- The root `site.css` is the short, editable stylesheet entry point. It imports
  six system files and 24 structure-only modules in `css/`, preserving existing cascade priorities.
- The Contao page template continues to load that root `site.css` from GitHub
  Pages. The browser then loads its imported modules from the same repository.
  Edit a module, commit and push: no CSS build or generated bundle is required.
  Allow a few minutes for Pages publishing and browser caching.
- `npm run check:css` checks syntax, full import coverage, property ownership, tokens, breakpoints, layers and asset URLs.
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

| Responsibility | Modules in `css/` |
| --- | --- |
| System: shared values | `base.css` |
| System: all typography | `typography.css` |
| System: all surfaces and paint | `surfaces.css` |
| System: all motion | `motion.css` |
| System: page structure and shared responsive structure | `layout.css`, `responsive.css` |
| Header/footer structure | `header.css`, `navigation.css`, `footer.css` |
| Shared component structure | `buttons.css`, `cards.css`, `containers.css`, `forms.css`, `media.css` |
| Section structure | `hero.css`, `statement.css`, `work.css`, `process.css`, `showreel.css`, `benefits.css`, `testimonials.css`, `journal.css`, `configurator.css`, `contact.css` |
| Contao wrapper structure | `contao-components.css`, `contao-forms.css` |
| Page and CMS structure | `pages.css`, `news.css`, `contao.css`, `legal.css` |

The system/component refactor preserves the appearance of main commit `313b6aa`.
System files contain named blocks for the original five cascade layers.
Components use layered imports and keep their structural order. No existing
HTML classes, JavaScript states, font resources or asset URLs are changed.
`fonts.css` and `variables.css` remain merged into their responsible systems.
Typography uses direct values in its single owner; shared palette, spacing,
radius, shadow and motion values use custom properties.
See [ARCHITECTURE.md](ARCHITECTURE.md) for ownership, token namespaces,
compatibility hooks and verification details.
