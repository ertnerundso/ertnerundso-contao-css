# ERTNER&SO Contao frontend

This repository contains the modular stylesheet maintained by the site owner,
the JavaScript source, fixed frontend assets, and copies of the active Contao
templates for `staging.ertnerundso.de`. It does not contain the Contao database,
CMS-managed content or customer uploads.

## Live delivery

- `css/` contains the editable CSS modules. `css/site.css` lists them in cascade
  order. Run `npm run build:css` to assemble the root `site.css`, then commit
  both the modules and the generated file. `npm run check:css` checks syntax,
  import coverage, layer order, asset URLs and whether the generated file is current.
- The Contao page template continues to load the root `site.css` from GitHub
  Pages. It contains all rules, with no runtime imports. The CSS workflow
  rebuilds that file after module changes reach `main`; pull requests check it.
  JavaScript builds never regenerate CSS. Allow a few minutes for Pages caching.
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

Run `npm ci` once. Change the relevant file in `css/`, then run
`npm run build:css` and `npm run check:css`. Do not edit the generated root
`site.css`. To add a module, add its import in `css/site.css` at the appropriate
position within its existing layer. Keep asset URLs absolute.

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
