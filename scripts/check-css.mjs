import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcss from 'postcss';

const root = resolve(import.meta.dirname, '..');
const cssDirectory = resolve(root, 'css');
const entry = resolve(root, 'site.css');
const layers = ['foundation', 'layout', 'components', 'sections', 'cms'];
if (process.argv.length > 2) throw new Error('Usage: node scripts/check-css.mjs');

const source = postcss.parse(await readFile(entry, 'utf8'), { from: entry });
const statements = source.nodes.filter(node => node.type !== 'comment');
const first = statements.shift();
if (first?.name !== 'layer' || first.nodes || first.params.replaceAll(/\s/g, '') !== layers.join(',')) {
  throw new Error('site.css must declare the five cascade layers first.');
}

const imported = new Set();
let previousLayer = -1;
let declarations = 0;

for (const statement of statements) {
  const match = statement.type === 'atrule' && statement.name === 'import'
    ? statement.params.match(/^"\.\/css\/([a-z][a-z0-9-]*\.css)"\s+layer\((\w+)\)$/)
    : null;
  if (!match) throw new Error(`Invalid entry-point statement: ${statement.toString()}`);
  const [, name, layer] = match;
  const layerIndex = layers.indexOf(layer);
  if (layerIndex < previousLayer || layerIndex < 0) throw new Error(`Invalid layer order: ${name}`);
  if (imported.has(name) || name === 'site.css') throw new Error(`Duplicate or recursive import: ${name}`);
  previousLayer = layerIndex;
  imported.add(name);

  const file = resolve(cssDirectory, name);
  const content = await readFile(file, 'utf8');
  const module = postcss.parse(content, { from: file });
  module.walkAtRules(rule => {
    if (rule.name === 'import' || rule.name === 'charset' || rule.name === 'layer') {
      throw new Error(`${name}: declare imports and layers only in the root site.css.`);
    }
  });
  module.walkDecls(declaration => {
    declarations++;
    // Existing asset URLs stay absolute when CSS modules load separately.
    for (const match of declaration.value.matchAll(/url\(\s*["']?([^"')\s]+)/g)) {
      if (!/^(?:https?:|data:|\/|#)/i.test(match[1])) {
        throw new Error(`${name}: use an absolute asset URL: ${match[1]}`);
      }
    }
  });
}

const files = await readdir(cssDirectory, { withFileTypes: true });
for (const file of files) {
  if (file.isDirectory()) throw new Error(`Unexpected CSS subdirectory: ${file.name}`);
  if (file.name.endsWith('.css') && !imported.has(file.name)) {
    throw new Error(`Unimported stylesheet: css/${file.name}`);
  }
}
console.log(`CSS check OK: ${imported.size} direct imports, ${declarations} declarations, all modules covered.`);
