# ERTNER&SO CSS architecture

## Source and delivery

The short root `site.css` directly imports 30 modules: six system files and 24 structure-only component/section files. Contao continues to load this entry point through GitHub Pages. There is no generated CSS, build step, secondary entry point or nested import chain.

## Exclusive ownership

| File | Owns |
| --- | --- |
| `base.css` | Palette, spacing, radius and shadow custom properties: `--color-*`, `--space-*`, `--radius-*`, `--shadow-*` |
| `typography.css` | All font faces, typography, headings, body text, text alignment/decoration, wrapping, counters and lists, including component and responsive text rules |
| `surfaces.css` | All backgrounds, colors, borders, radii, shadows, masks, filters, overlays, opacity, cursor and visibility states; literal palette values come from base |
| `motion.css` | All transitions, animations, transforms and scroll behavior; shared `--motion-*` values |
| `layout.css` | Element structure, page skeleton, containers, common grids and `--layout-*` values |
| `responsive.css` | Existing cross-component responsive structure; breakpoint inventory in its header |
| Every other file in `css/` | Structure only: positioning, dimensions, grid/flex, overflow, object fit, stacking, pointer behavior, and spacing through `--space-*` |

Components must not contain typography, paint or motion declarations, even when their values use variables. For example, `font-size: var(--font-h1)` still belongs in typography. Optional `--font-*` tokens also belong in typography. Every CSS file is validated against this ownership, including Contao wrappers and page styles. Animation keyframes belong in motion, including their animated opacity/filter effects; their colors still reference the base palette.

`containers.css` holds shared card/list/table structure formerly mixed into surfaces. `media.css` holds cursor/reveal-line/project-media structure formerly mixed into motion. Their positions preserve the structural cascade. No HTML classes were introduced or renamed.

Spacing values are centralized, including legacy exact values required to preserve appearance. The base scale uses `--space-xs` through `--space-6xl`. Additional numeric names denote rem values at a reference root size of 16px; explicit px/em/percentage names retain those units. Complex values have feature names. Do not round or convert existing values as part of an architecture change.

Typography uses direct readable font values in its single owner. There is no separate fonts or variables file. Colors, radii and shadows use shared tokens; transformations and their timing live in motion.

## Cascade preservation

The five existing layers remain ordered as `foundation`, `layout`, `components`, `sections`, `cms`. These priorities are independent of file responsibility.

System files are imported without an additional import layer and contain explicit blocks for their original layers. A system can therefore own both foundation defaults and later section or CMS overrides. Keep original layer ownership and source order within each layer when moving rules, including shorthand/longhand ordering.

Structure-only files are imported with `layer(...)` and contain plain rules. The root imports first the six systems, then the components in their original structural order. Different files own disjoint property groups; system blocks preserve the previous priority of the extracted styles. Do not wrap a system import in an additional layer or append unlayered overrides.

The refactor starts from main commit `313b6aa`. All 2,057 non-custom-property declarations retain their selectors, media contexts, values after token expansion, importance and per-property layer order. Existing token definitions and responsive overrides are preserved, with the documented namespace renames below.

## Responsive rules and runtime hooks

Normal CSS custom properties cannot supply media-query conditions. Existing conditions remain literal, with width thresholds 360, 520, 760/761 and 1000px, height thresholds 720/800px, and user-preference queries. Width registration is checked in `scripts/css-architecture.mjs`. Do not convert max-width rules to min-width without separately verifying boundary behavior.

Typography media rules stay in typography; paint media rules in surfaces; motion preference rules in motion. Shared structural media rules stay in responsive. Feature-specific structural media rules stay in their component.

Preserve every status class, data attribute and JavaScript hook. Runtime `--showreel-scrim` retains its local fallback. Existing optional `--button-height`, `--button-padding` and `--stack-gap` remain supported at the consuming element. New spacing hooks `--space-button-padding` and `--space-stack-gap` take priority and fall back to their legacy equivalents. Legacy spacing hooks are allowed only in these compatibility fallbacks.

Internal shared token names now use consistent namespaces:

| Previous name | Current name |
| --- | --- |
| `--container-max` | `--layout-container-max` |
| `--container-gutter` | `--space-gutter` |
| `--section-space` | `--space-section` |
| `--grid-gap` | `--space-grid` |
| `--column-gap` | `--space-columns` |
| `--content-offset` | `--space-content-offset` |
| `--transition-fast`, `--transition-smooth`, `--transition-slow` | `--motion-fast`, `--motion-smooth`, `--motion-slow` |

## Validation and maintenance

```sh
npm ci
npm run check:css
```

This read-only command runs guardrail tests and validates syntax, all file imports, system/component property ownership, cascade layers, spacing/palette references, registered width breakpoints, defined tokens or runtime fallbacks, and absolute asset URLs. GitHub Actions checks pull requests and main. The checker lives in `scripts/validate-css.mjs`; the property ownership map is in `scripts/css-architecture.mjs`.

During the migration, full-source declaration comparison and browser computed-style comparisons cover breakpoint boundaries, menu/hover/focus states, reduced/default motion, enlarged root fonts, short viewports and runtime hooks. These local regression fixtures do not replace checking the complete authenticated Contao site when changing its design.

Keep `CSS-ANLEITUNG.md` accurate. Add clear German editing-point comments. All imported assets retain their existing absolute URLs. Source-controlled templates and assets still need the separate staging synchronization described in README.
