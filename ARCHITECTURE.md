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

The five existing priority layers remain `foundation`, `layout`, `components`, `sections`, `cms`. Systems contain ordered named blocks; components have flat layered imports. Repeated rules and media blocks are consolidated in their owners. The layer mechanism preserves the priority of states while permitting deliberate design simplification.

## Global typography

Each heading level has exactly one application rule and its own family, weight, minimum/maximum size, fluid size and line-height settings. All headings start in genuine SK Modernist Bold 700, loaded from the repository. Component heading overrides are forbidden, including overrides in typography itself.

The maximum sizes derive from a 1.33 modular scale anchored to the 1.0625rem body size. Fluid values use clamp; minimum sizes compress the mobile hierarchy while keeping h6 at body size. Each min/max and family/weight can be edited independently. Browser tests check consistency across contexts, actual font loading, the desktop ratio and live changes to h1 settings.

IBM Plex Sans uses the original variable-font source converted to WOFF2, supporting weights 100–700. SK Modernist faces 300/400/700 and IBM Plex Mono 400 retain their supplied webfonts. Library/license files remain in assets/fonts. Relative font URLs resolve against the imported CSS file, so both local previews and Pages delivery use the same repository assets.

Non-heading text variants have explicit roles: lead, small, caption, label, quote and button. Existing semantic classes retain their mapping. Aliases are excluded from real h1–h6 elements, so a text helper cannot override a heading level.

## Shared layout and components

`layout.css` owns the content maximum (96rem), header dimensions and layer indices. `base.css` owns the gutter, spacious section spacing and the small xxs–7xl spacing scale. Remaining position tokens describe deliberate percentage/viewport geometry of existing media and scroll scenes. Component files use the scale directly instead of generated compound-spacing tokens.

Shared grids are mobile-first: `grid-2-col`, `grid-3-col`, `grid-sidebar` (1:2), `grid-feature` (2:3), stacking below 761px. Existing section-specific max-width rules remain in their own modules, grouped from broad to narrow. Registered widths are 360, 520, 760/761 and 1000px; media custom properties are not used because browsers do not support ordinary `var()` there.

Filled, outline and text buttons share geometry and typography, including Contao link/form wrappers. `button`, `button.outline`, `btn`, `btn--primary`, `btn--secondary`, `btn--text`, `hero-contact`, `hero-work-link` and `text-link` remain supported. The former underline-only outline variant becomes an actual outline. Common cards share borders, radius and shadows; `card--dark` and `card--plain` are optional named variants. Existing media-card layouts remain.

No existing HTML classes or JS states are renamed. New optional aliases include `.h1`–`.h6`, text variants, grids and card variants. `.display` and `.section-heading` keep their central heading mapping. Runtime layout hooks `--button-height`, `--button-padding`, `--stack-gap` and the animated `--showreel-scrim` remain compatible with fallbacks.

## JavaScript ownership and lifecycle

`src/site.js` starts function modules; `src/config.js` owns technical thresholds, breakpoints, ScrollTrigger bounds and integration settings. Files cover header, navigation, scrolling, work/journal sliders, video, hero/showreel/benefits/configurator effects, reveals, pointer effects, forms, booking and the optional lazy-loaded scene.

`runtime.js` supplies GSAP/ScrollTrigger, CSS readers and disposable listener/observer/media scopes. Visual animation settings come from `motion.css`; branding comes from `base.css`. Named scroll-story phase settings, such as `--motion-showreel-film-copy-start`, are timeline offsets in seconds. Three.js geometry remains technical configuration; point colors, size/opacity and angular speeds use CSS settings.

Viewport and reduced-motion changes revert effect scopes and remove generated videos, split text and inline scroll styles before reinitialization. Listeners and observers are disconnected when a scope ends. Native mobile sliders remain available with reduced motion. Header hiding follows scroll direction, with menu and keyboard focus taking precedence. The menu traps focus, handles Escape and restores its trigger. Native video controls remain available when autoplay is disabled or fails.

Font, image and video files use their type folders. Templates point fixed logo/icon/configurator files to the repository's Pages paths; JS resolves the hero video relative to its delivered bundle. CMS-managed media paths are intentionally left on Contao.

## Validation and deployment

`npm run check:css` tests ownership guardrails and checks all imports, layers, registered breakpoints, token references, exactly one global rule per heading, and repository-relative asset existence. `npm run test:browser` runs local browser fixtures. `npm run check:js` parses all source modules, verifies local imports, CSS motion-token references, centralized integration URLs and asset existence. `npm run build:js` bundles the function modules and removes stale chunks.

CI runs checks on pull requests. Browser fixtures are local and do not contact real form/booking services. They do not claim to be a full authenticated Contao rendering test. Behavior tests cover central typography, shared grids/buttons, menu focus, directional header visibility, sliders, responsive effect cleanup, simulated contact success/failure, video controls and calendar fallback.

Main publishes CSS/JS/assets through Pages after explicit approval. Template copies in templates require separate approved synchronization to staging; repository changes do not update Contao templates or CMS records automatically. Customer uploads and CMS-managed media remain on Contao.
