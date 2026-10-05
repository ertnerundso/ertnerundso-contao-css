# ERTNER&SO CSS Design Architecture & Guidelines

This document specifies the official CSS architecture, naming conventions, directory structure, and linting rules for the **ERTNER&SO** web platform. All AI coding assistants (including Codex) and human developers MUST adhere strictly to these rules.

---

## 1. Directory Structure (Clean Modular ITCSS Pattern)

All CSS source files live in `src/styles/` inside the frontend repository. The main entry point is `src/site.css` which only contains `@import` directives using CSS Cascade Layers (`@layer`).

```
src/
├── site.css                          # Primary entry point (imports in exact order below)
└── styles/
    ├── 01-foundation/
    │   ├── fonts.css                 # @font-face declarations
    │   ├── tokens.css                # Global CSS Custom Properties (:root)
    │   ├── reset.css                 # Box-sizing, body defaults, focus-visible, selections
    │   └── typography.css            # Typography hierarchy (h1-h4, .body-copy, .micro)
    │
    ├── 02-layout/
    │   ├── grid.css                  # Container (.shell), grid utilities (.grid-2-col, flex-stack)
    │   ├── header.css                # Site header (.site-header), brand logo, desktop nav
    │   ├── navigation.css            # Mobile toggle button & full-screen overlay panel (.menu-panel)
    │   └── footer.css                # Footer (.site-footer), columns, copyright
    │
    ├── 03-components/
    │   ├── buttons.css               # Buttons (.button), text links (.text-link), interactive states
    │   ├── cards.css                 # Service cards (.service-card), index cards (.index-card), news cards
    │   ├── forms.css                 # Form inputs, labels, fieldsets, checkboxes, status messages
    │   └── motion.css                # Reveal, split-line and reduced-motion states
    │
    ├── 04-sections/
    │   ├── hero.css                  # Hero section composition
    │   ├── statement.css             # Precision / statement grid
    │   ├── work.css                  # Work gallery & assembly montage
    │   ├── process.css               # Process steps (.step)
    │   ├── showreel.css              # Showreel video stage & film copy
    │   ├── benefits.css              # Benefits grid & table
    │   ├── testimonials.css          # Client quotes & testimonial sliders
    │   ├── journal.css               # Journal articles & slider
    │   ├── configurator.css          # Interactive configurator scene
    │   └── contact.css               # Contact grid & conversion band
    │
    └── 05-cms/
        ├── contao.css                # Contao CMS module overrides (.mod_newslist, etc.)
        └── legal.css                 # Imprint, privacy, legal page formatting
```

---

## 2. Mandatory Architectural Rules for Developers & AI (Codex)

### Rule 1: No Duplicate Declarations (Single Source of Truth)

Do NOT define the same property on the same selector across multiple files.

- **Incorrect:** Defining `.site-header { height: 76px; }` in `header-base.css` and `.site-header { height: 68px; }` in `header-editorial.css`.
- **Correct:** Consolidate all `.site-header` rules into `02-layout/header.css`.

### Rule 2: Token Scoping (`01-foundation/tokens.css`)

- All global CSS variables (`:root`) MUST be defined in `01-foundation/tokens.css`.
- Component-specific scoped variables (e.g. `--showreel-scrim`) are allowed inside their respective component/section files.
- Do NOT hardcode loose hex grays/darks in components; use `--color-text-soft` or `--color-muted`.

### Rule 3: Motion & Animation Tokens

Use unified motion tokens for transitions:

- `--transition-fast: 180ms ease;` (Hover colors, quick state changes)
- `--transition-smooth: 450ms cubic-bezier(0.22, 1, 0.36, 1);` (Panel overlays, card arrows)
- `--transition-slow: 750ms cubic-bezier(0.22, 1, 0.36, 1);` (Image scale, smooth reveals)

### Rule 4: Strict Breakpoint Standard

Only the following 5 standard viewport width media query breakpoints are permitted across the codebase:

- `max-width: 360px` (Small mobile)
- `max-width: 520px` (Mobile landscape)
- `max-width: 760px` (Tablet / mobile threshold)
- `min-width: 761px` (Desktop min)
- `max-width: 1000px` (Desktop / tablet transition)

### Rule 5: CSS Cascade Layers (`@layer`)

All `@import` statements in `src/site.css` MUST be scoped with standard CSS Cascade Layers (`@import "..." layer(name);`).
Layer order: `foundation`, `layout`, `components`, `sections`, `cms`.

### Rule 6: Clean Rem Units

- Use `rem` for font sizes, margins, paddings, gaps, and fluid bounds (`clamp`).
- Use `px` ONLY for 1px/2px borders, outlines, dividers, and media query breakpoints.

### Rule 7: Delivery & Export Workflow

1. Edit source CSS in `src/styles/`.
2. Run `npm run audit:css` to verify zero duplicate property warnings or broken tokens.
3. Run `npm run export:staging-css` to build `site.css` into the public delivery repository.

## Reproducible delivery

The private source modules mirror the cleaned CSS introduced in delivery commit
`499ed1a`. Keep both repositories in sibling directories named
`ertnerundso-contao-frontend` and `ertnerundso-contao-css`. Run the source audit,
format check and build before exporting. Commit both generated CSS files.
Never delete previous immutable releases: a Contao template may still use them.

The directory tree above describes feature ownership; the source import order
is authoritative within each cascade layer. Shared media rules currently live
with their sections, and legal page rules live in `05-cms/contao.css`.

## Typography: Major Third

Typography now uses a 1rem base and a 1.25 ratio. `--type-step-*` tokens
define the fixed scale; semantic hero, section, card, small-title, display,
quote and menu roles provide responsive sizes. Heading role bounds are scale
steps; their intermediate values are fluid between 20rem and 90rem viewport
width. Body copy, inputs and buttons use the base; compact labels use the
first smaller step.

This is an intentional typography design change after the structural
refactoring. Font sizes and line wrapping change. Do not restore the old
numeric font-size aliases or the scoped desktop hero override. Keep colors,
spacing, selector names and runtime hooks independent of the type scale.

All h1–h6 headings, section/display headlines and accordion titles use
`--font-headline` with `--font-weight-headline` (700). The real SK Modernist
Bold WOFF2 asset belongs to the private frontend assets and is copied by
the build. The public stylesheet references its staging URL. Deploy that
asset before activating this release; the CSS repository does not contain
the font binary. Preserve the Major Third font sizes when changing weight.
