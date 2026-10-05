# ERTNER&SO Contao frontend

This repository contains the stylesheet currently maintained by the site owner,
the JavaScript source, fixed frontend assets, and copies of the active Contao
templates for `staging.ertnerundso.de`. It does not contain the Contao database,
CMS-managed content or customer uploads.

## Live delivery

- `site.css` is the owner's published stylesheet. The Contao page template loads
  it directly from this repository's GitHub Pages URL. JavaScript builds must
  never regenerate or overwrite it.
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
