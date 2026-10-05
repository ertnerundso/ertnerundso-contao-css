# ERTNER&SO frontend architecture

The architecture follows the owner's interview decisions recorded in `AGENTS.md`. Main is not modified until an explicit merge approval. Two reviewable stages separate typography/foundations from layout, component consolidation and JavaScript modules.

## CSS ownership

All 30 modules stay directly in `css/`. Root `site.css` imports them directly: six systems and 24 structural files. No CSS compilation or nested imports are introduced.

| System | Exclusive responsibility |
| --- | --- |
| `base.css` | `--color-*`, `--space-*`, `--radius-*`, `--shadow-*` |
| `typography.css` | Font faces, `--font-*`, all typography applications |
| `surfaces.css` | Colors, surfaces, borders, shadows, filters, masks, opacity and visibility |
| `motion.css` | `--motion-*`, effects, animation and transition applications |
| `layout.css` | Page structure, containers, common grids, `--layout-*` |
| `responsive.css` | General responsive structure |

Every other CSS file owns structure only, including section/page/Contao files. Spacing references `--space-*`; typography and paint declarations are rejected even when they reference variables. Specific responsive structure remains with its component. Paint and motion media rules remain in their corresponding systems.

The five existing priority layers remain `foundation`, `layout`, `components`, `sections`, `cms`. Systems contain original named blocks; components have flat layered imports. The layer mechanism preserves the priority of states while permitting deliberate design simplification.

## Global typography

Each heading level has exactly one application rule and its own family, weight, minimum/maximum size, fluid size and line-height settings. All headings start in genuine SK Modernist Bold 700, loaded from the repository. Component heading overrides are forbidden, including overrides in typography itself.

The maximum sizes derive from a 1.33 modular scale anchored to the 1.0625rem body size. Fluid values use clamp; minimum sizes compress the mobile hierarchy while keeping h6 at body size. Each min/max and family/weight can be edited independently. Browser tests check consistency across contexts, actual font loading, the desktop ratio and live changes to h1 settings.

IBM Plex Sans uses the original variable-font source converted to WOFF2, supporting weights 100–700. SK Modernist faces 300/400/700 and IBM Plex Mono 400 retain their supplied webfonts. Library/license files remain in assets/fonts. Relative font URLs resolve against the imported CSS file, so both local previews and Pages delivery use the same repository assets.

Non-heading text variants have explicit roles: lead, small, caption, label, quote and button. Existing semantic classes retain their mapping. Aliases are excluded from real h1–h6 elements, so a text helper cannot override a heading level.

## Validation and deployment

`npm run check:css` tests ownership guardrails and checks all imports, layers, registered breakpoints, token references, exactly one global rule per heading, and repository-relative asset existence. `npm run test:browser` runs local browser fixtures. `npm run build:js` preserves the existing JavaScript compilation workflow.

CI runs checks on pull requests. Browser fixtures are local and do not contact real form/booking services. They do not claim to be a full authenticated Contao rendering test. During the second stage, behavior tests cover the module and layout changes.

Main publishes CSS/JS/assets through Pages after explicit approval. Template copies in templates require separate approved synchronization to staging; repository changes do not update Contao templates or CMS records automatically. Customer uploads and CMS-managed media remain on Contao.
