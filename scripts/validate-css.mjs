import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import {
  LAYERS,
  BREAKPOINTS,
  SYSTEM_FILES,
  SPACING_PROPERTY,
  propertyOwner,
} from './css-architecture.mjs';

const colorNames = new Set(
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato transparent turquoise violet wheat white whitesmoke yellow yellowgreen currentcolor'.split(
    ' ',
  ),
);

export function validateModule(name, content, importLayer) {
  const ast = postcss.parse(content, { from: `css/${name}` });
  const system = SYSTEM_FILES.has(name);
  if (system === Boolean(importLayer))
    throw new Error(
      `${name}: system imports must be unwrapped; component imports require a layer.`,
    );
  if (importLayer && !LAYERS.includes(importLayer))
    throw new Error(`${name}: unknown import layer.`);
  let previousLayer = -1;
  for (const node of ast.nodes.filter((n) => n.type !== 'comment')) {
    if (!system) continue;
    const index =
      node.type === 'atrule' && node.name === 'layer'
        ? LAYERS.indexOf(node.params)
        : -1;
    if (!node.nodes || index < previousLayer || index < 0)
      throw new Error(
        `${name}: system rules need ordered, named layer blocks.`,
      );
    previousLayer = index;
  }
  ast.walkAtRules((rule) => {
    if (
      ![
        'layer',
        'media',
        'font-face',
        'keyframes',
        '-webkit-keyframes',
        'supports',
        'container',
      ].includes(rule.name)
    )
      throw new Error(`${name}: unsupported at-rule @${rule.name}.`);
    if (rule.name === 'layer' && (!system || rule.parent !== ast))
      throw new Error(
        `${name}: only system files may declare top-level layers.`,
      );
    if (rule.name === 'font-face' && name !== 'typography.css')
      throw new Error(`${name}: @font-face belongs in typography.css.`);
    if (rule.name.includes('keyframes') && name !== 'motion.css')
      throw new Error(`${name}: keyframes belong in motion.css.`);
    if (rule.name === 'media') {
      if (/var\(/i.test(rule.params))
        throw new Error(
          `${name}: CSS variables cannot be used in media conditions.`,
        );
      for (const match of rule.params.matchAll(
        /(?:min|max)-width\s*:\s*([\d.]+)(\w+)/g,
      )) {
        if (match[2] !== 'px' || !BREAKPOINTS.has(Number(match[1])))
          throw new Error(
            `${name}: unregistered width breakpoint ${match[1]}${match[2]}.`,
          );
      }
    }
  });
  ast.walkDecls((d) => {
    const inFontFace =
      d.parent.type === 'atrule' && d.parent.name === 'font-face';
    let inKeyframes = false;
    for (let parent = d.parent; parent; parent = parent.parent) {
      if (parent.type === 'atrule' && parent.name.includes('keyframes'))
        inKeyframes = true;
    }
    const owner = inFontFace ? 'typography.css' : propertyOwner(d.prop);
    const keyframeEffect =
      inKeyframes &&
      name === 'motion.css' &&
      ['motion.css', 'surfaces.css'].includes(owner);
    const allowed = system
      ? keyframeEffect ||
        owner === name ||
        (owner === 'structure' &&
          ['layout.css', 'responsive.css'].includes(name))
      : owner === 'structure';
    if (!allowed)
      throw new Error(
        `${name}: ${d.prop} belongs in ${owner === 'structure' ? 'a layout/component file' : owner}.`,
      );
    if (d.prop.startsWith('--') && d.parent.selector !== ':root')
      throw new Error(`${name}: shared tokens must be defined on :root.`);
    if (!inFontFace && /^(?:font(?:-|$)|line-height$)/.test(d.prop)) {
      if (!d.value.startsWith('var(--font-') && !['inherit', 'normal'].includes(d.value))
        throw new Error(`${name}: typography applications must use central --font-* settings.`);
      const headingSelector = d.parent.selector?.replace(/:not\(\s*:where\(h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\)\s*\)/g, '') || '';
      if (d.parent.type === 'rule' && /\bh[1-6]\b/.test(headingSelector)) {
        const first = d.parent.selector.split(',')[0].trim();
        if (!/^h[1-6]$/.test(first)) throw new Error(`${name}: heading overrides are forbidden; edit the central h1-h6 settings.`);
      }
    }
    if (SPACING_PROPERTY.test(d.prop)) {
      valueParser(d.value).walk((node) => {
        if (
          node.type === 'word' &&
          /^-?(?:\d*\.)?\d+(?:px|rem|em|%|[sd]?v[wh])$/i.test(node.value) &&
          parseFloat(node.value) !== 0
        )
          throw new Error(
            `${name}: ${d.prop} requires a --space-* token (${node.value}).`,
          );
        if (node.type === 'function' && node.value === 'var') {
          const variable = node.nodes[0]?.value;
          // Legacy per-element hooks survive inside the new --space-* fallback.
          const legacyFallback =
            ['--stack-gap', '--button-padding'].includes(variable) &&
            node.nodes.some((n) => n.type === 'div' && n.value === ',');
          if (!variable?.startsWith('--space-') && !legacyFallback)
            throw new Error(`${name}: spacing must use --space-* tokens.`);
        }
      });
    }
    if (owner === 'surfaces.css') {
      valueParser(d.value).walk((node) => {
        if (node.type === 'function' && /^(url|var)$/i.test(node.value))
          return false;
        if (
          (node.type === 'word' &&
            (/^#[\da-f]{3,8}$/i.test(node.value) ||
              colorNames.has(node.value.toLowerCase()))) ||
          (node.type === 'function' &&
            /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)$/i.test(node.value))
        )
          throw new Error(
            `${name}: literal colors belong in base.css (${node.value}).`,
          );
      });
    }
    for (const match of d.value.matchAll(/url\(\s*["']?([^"')\s]+)/g)) {
      if (!/^(?:https?:|data:|\/|#|\.\.\/assets\/(?:fonts|images|videos)\/)/i.test(match[1]))
        throw new Error(`${name}: use an absolute asset URL: ${match[1]}`);
    }
  });
  return ast;
}

export function validateProject(entry, files) {
  const ast = postcss.parse(entry, { from: 'site.css' });
  const statements = ast.nodes.filter((n) => n.type !== 'comment');
  const first = statements.shift();
  if (
    first?.name !== 'layer' ||
    first.nodes ||
    first.params.replaceAll(/\s/g, '') !== LAYERS.join(',')
  )
    throw new Error('site.css must declare the five cascade layers first.');
  const imported = new Map();
  let previousLayer = -1;
  let componentSeen = false;
  for (const statement of statements) {
    const match =
      statement.type === 'atrule' && statement.name === 'import'
        ? statement.params.match(
            /^"\.\/css\/([a-z][a-z0-9-]*\.css)"(?:\s+layer\((\w+)\))?$/,
          )
        : null;
    if (!match)
      throw new Error(`Invalid entry-point statement: ${statement.toString()}`);
    const [, name, layer] = match;
    if (imported.has(name)) throw new Error(`Duplicate import: ${name}`);
    if (!files.has(name)) throw new Error(`Missing stylesheet: ${name}`);
    if (layer) {
      componentSeen = true;
      const index = LAYERS.indexOf(layer);
      if (index < previousLayer || index < 0)
        throw new Error(`Invalid component layer order: ${name}`);
      previousLayer = index;
    } else if (componentSeen)
      throw new Error(`${name}: load system files before components.`);
    imported.set(name, validateModule(name, files.get(name), layer));
  }
  for (const name of [...files.keys(), ...SYSTEM_FILES])
    if (!imported.has(name))
      throw new Error(`Unimported stylesheet: css/${name}`);
  for (let level = 1; level <= 6; level++) {
    const rules = [];
    imported.get('typography.css').walkRules(rule => {
      if (rule.selector.split(',')[0].trim() === `h${level}`) rules.push(rule);
    });
    if (rules.length !== 1) throw new Error(`typography.css: h${level} needs exactly one central rule.`);
    for (const [property, suffix] of [['font-family','family'],['font-weight','weight'],['font-size','size'],['line-height','line-height']]) {
      const declarations = rules[0].nodes.filter(n => n.type === 'decl' && n.prop === property);
      if (declarations.length !== 1 || declarations[0].value !== `var(--font-h${level}-${suffix})`)
        throw new Error(`typography.css: h${level} ${property} must use its own central variable.`);
    }
  }
  const definitions = new Set();
  let declarations = 0;
  for (const module of imported.values())
    module.walkDecls((d) => {
      declarations++;
      if (d.prop.startsWith('--')) definitions.add(d.prop);
    });
  for (const [name, module] of imported)
    module.walkDecls((d) => {
      valueParser(d.value).walk((node) => {
        if (node.type === 'function' && /^(url|format)$/i.test(node.value))
          return false;
        if (node.type === 'function' && node.value === 'var') {
          const variable = node.nodes[0]?.value;
          const hasFallback = node.nodes.some(
            (n) => n.type === 'div' && n.value === ',',
          );
          if (!definitions.has(variable) && !hasFallback)
            throw new Error(`${name}: undefined token ${variable}.`);
        }
      });
    });
  return { modules: imported.size, declarations };
}
