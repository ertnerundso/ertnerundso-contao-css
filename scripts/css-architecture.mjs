export const LAYERS = ['foundation', 'layout', 'components', 'sections', 'cms'];
export const BREAKPOINTS = new Set([360, 520, 760, 761, 1000]);
export const SYSTEM_FILES = new Set([
  'base.css',
  'typography.css',
  'surfaces.css',
  'motion.css',
  'layout.css',
  'responsive.css',
]);
export const SPACING_PROPERTY =
  /^(?:margin|padding|scroll-margin|scroll-padding)(?:-|$)|^(?:gap|row-gap|column-gap|inset(?:-.*)?|top|right|bottom|left|border-spacing|outline-offset|text-underline-offset|vertical-align)$/;
export const STRUCTURE_PROPERTIES = new Set([
  'align-items',
  'align-self',
  'aspect-ratio',
  'box-sizing',
  'display',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-wrap',
  'grid-column',
  'grid-row',
  'grid-template-columns',
  'grid-template-rows',
  'height',
  'isolation',
  'justify-content',
  'justify-self',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'object-position',
  'order',
  'overflow',
  'overflow-x',
  'overflow-y',
  'overscroll-behavior-inline',
  'place-items',
  'pointer-events',
  'position',
  'resize',
  'scroll-snap-align',
  'scroll-snap-type',
  'width',
  'z-index',
  '-webkit-box-orient',
  '-webkit-overflow-scrolling',
]);
export function propertyOwner(property) {
  if (/^--(?:color|space|radius|shadow)-/.test(property)) return 'base.css';
  if (/^--layout-/.test(property)) return 'layout.css';
  if (/^--motion-/.test(property)) return 'motion.css';
  if (/^--font-/.test(property)) return 'typography.css';
  if (property.startsWith('--'))
    throw new Error(`Unknown custom property namespace: ${property}`);
  if (
    /^(?:font(?:-|$)|line-height$|letter-spacing$|hyphens$|white-space$|overflow-wrap$|word-break$|list-style(?:-|$)|counter-(?:reset|increment)$|-webkit-font-smoothing$|-webkit-line-clamp$)/.test(
      property,
    )
  )
    return 'typography.css';
  if (property.startsWith('text-') && property !== 'text-shadow')
    return 'typography.css';
  if (
    /^(?:transition(?:-|$)|animation(?:-|$)|transform(?:-|$)|perspective(?:-|$)|will-change$|scroll-behavior$)/.test(
      property,
    )
  )
    return 'motion.css';
  if (
    /^(?:background(?:-|$)|border(?:-|$)|outline(?:-|$)|color$|accent-color$|caret-color$|box-shadow$|text-shadow$|opacity$|filter$|backdrop-filter$|mask(?:-|$)|mix-blend-mode$|clip-path$|content$|cursor$|visibility$|scrollbar-(?:width|color)$|fill$|stroke(?:-|$)|-webkit-(?:mask(?:-|$)|backdrop-filter$))/.test(
      property,
    ) &&
    property !== 'border-spacing' &&
    property !== 'outline-offset'
  )
    return 'surfaces.css';
  if (STRUCTURE_PROPERTIES.has(property) || SPACING_PROPERTY.test(property))
    return 'structure';
  throw new Error(`Unclassified CSS property: ${property}`);
}
