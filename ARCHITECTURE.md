# ERTNER&SO CSS architecture

## Active source and delivery

The editable stylesheet lives in `css/` in this repository.
`css/site.css` is the source entry point: it declares the layer order and imports
30 thematic modules. The root `site.css` is generated and remains the file
loaded by the active Contao template through GitHub Pages.

The old `src/styles/` layout in the separate frontend repository is not the
source for this delivery. Do not export that older CSS over the owner's current
stylesheet. The modular split starts from this repository's owner-maintained
`site.css` at commit `2bbaa56`.

## Cascade order

The layers are `foundation`, `layout`, `components`, `sections`, `cms`.
Each import in `css/site.css` explicitly names its layer. Modules contain plain
rules; do not put imports or layer wrappers inside them. The build wraps each
module in its declared layer without minifying, sorting or deduplicating rules.
Only the source entry point determines the order within a layer.

Preserve existing layer ownership when moving a rule. For example, the
`contao-components.css` and `contao-forms.css` rules remain in `sections`, while
`contao.css` remains in `cms`. A selector can be overridden in another layer;
combining such rules without checking the cascade can change the design.

## Module ownership

- `fonts.css`: `@font-face` and font resources.
- `variables.css`: global `:root` tokens, including their mobile overrides.
- `base.css` and `typography.css`: element defaults, common text rules and headings.
- `layout.css`, `header.css`, `navigation.css`, `footer.css`: structural rules.
- `responsive.css`: existing shared responsive and accessibility overrides.
- `buttons.css`, `cards.css`, `surfaces.css`, `forms.css`, `motion.css`: shared components.
- Named section files such as `hero.css`, `showreel.css`, `work.css`, `journal.css`,
  `configurator.css` and `contact.css`: feature rules and their responsive states.
- `contao-components.css` and `contao-forms.css`: existing section-layer CMS wrappers.
- `pages.css`, `news.css`, `contao.css`, `legal.css`: page and CMS-layer overrides.

The full list is in `README.md`. Some legacy shared selectors intentionally
remain together to preserve their original order. Do not add a new override
file for each small change; edit the existing owner instead.

## Maintenance rules

1. Edit modules in `css/`, never the generated root stylesheet.
2. Define global tokens only in `variables.css`. Scoped feature variables can
   remain in the relevant component. Reuse existing color and motion tokens.
3. Keep existing classes and JavaScript hooks, including `.is-open`, `.is-active`,
   `.js-ready`, `[hidden]` and data attributes.
4. Keep responsive rules with their feature where their cascade permits it.
   Preserve the current breakpoint conditions when reorganizing rules.
5. Use `rem` for new typography and spacing; keep unitless line heights.
   Do not mechanically convert existing values during a structural split.
6. Avoid new duplicate declarations. Existing intentional overrides are
   preserved; consolidation requires checking specificity, layers and order.
7. Keep font and image URLs absolute so both the source imports and root
   stylesheet resolve the same assets.

## Build and validation

```sh
npm ci
npm run build:css
npm run check:css
```

The build validates CSS syntax, module coverage, explicit layer order and
absolute asset URLs. The check also requires the committed root output to match
its source modules. Commit both sources and output. Pull requests run that
check; the CSS workflow assembles and commits the root file after module changes
reach `main`. CSS and JavaScript publication share a concurrency group.

The root bundle has no runtime imports, so splitting source files adds no
stylesheet requests on the website. The template URL and asset paths remain
unchanged. Template and asset deployment still follow `README.md`.
