# ERTNER&SO CSS architecture

## Active source and delivery

The root `site.css` is the editable, 30-line entry point. It declares the layer
order and imports 28 thematic modules from `css/`. The active Contao template
continues to load this entry point through GitHub Pages; the browser loads the
modules directly. There is no generated stylesheet and no CSS build step.

The old `src/styles/` layout in the separate frontend repository is not the
source for this delivery. Do not export that older CSS over the owner's current
stylesheet. The modular split starts from this repository's owner-maintained
`site.css` at commit `2bbaa56`.

## Cascade order

The layers are `foundation`, `layout`, `components`, `sections`, `cms`.
Each import in the root `site.css` explicitly names its layer. Modules contain
plain rules; do not put imports or layer wrappers inside them. `@import` applies
each module to its named layer, preserving the original order. Only the root
entry point determines the order within a layer.

Preserve existing layer ownership when moving a rule. For example, the
`contao-components.css` and `contao-forms.css` rules remain in `sections`, while
`contao.css` remains in `cms`. A selector can be overridden in another layer;
combining such rules without checking the cascade can change the design.

## Module ownership

- `typography.css`: `@font-face`, font resources, body text and general headings.
- `base.css`: global colors, spacing and layout settings, followed by element defaults.
  Font families, sizes and line heights use direct CSS values; there is no
  `fonts.css` or `variables.css` indirection. Feature-specific typography stays
  in its feature file, with direct responsive values.
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

1. Edit feature rules in `css/`; edit root `site.css` only to manage imports.
2. Keep shared color, spacing and layout settings at the top of `base.css`.
   Use direct font families, sizes and line heights where the text is styled.
   Keep font resources and general text defaults together in `typography.css`.
   Preserve mobile values and the desktop hero size when moving text rules.
3. Keep existing classes and JavaScript hooks, including `.is-open`, `.is-active`,
   `.js-ready`, `[hidden]` and data attributes.
4. Keep responsive rules with their feature where their cascade permits it.
   Preserve the current breakpoint conditions when reorganizing rules.
5. Use `rem` for new typography and spacing; keep unitless line heights.
   Do not mechanically convert existing values during a structural split.
6. Avoid new duplicate declarations. Existing intentional overrides are
   preserved; consolidation requires checking specificity, layers and order.
7. Keep font and image URLs absolute so the imported modules
   resolve the existing assets correctly.

## Validation and delivery

```sh
npm ci
npm run check:css
```

The check validates CSS syntax, complete module coverage, explicit layer order,
unique direct imports and absolute asset URLs. It does not write any files.
GitHub Actions runs the check on pull requests and on `main`.

Change a module, commit and push. GitHub Pages publishes the source files
directly; no bundling or CSS generation is required. Keep `site.css` and `css/`
together when deploying elsewhere. Local previews require an HTTP server.

Direct imports cause separate requests for the 28 modules. Keep imports flat
and ordered; do not introduce extra import chains. The Contao template URL,
font/image URLs and every existing rule remain unchanged. Template and asset
deployment still follow `README.md`.

## Beginner editing guide

`CSS-ANLEITUNG.md` is the owner-facing guide. Keep its file map and examples
accurate when changing CSS ownership. Add plain German comments at common
editing points instead of introducing another layer of typography aliases.
