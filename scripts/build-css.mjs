import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import postcss from 'postcss';

const root = resolve(import.meta.dirname, '..');
const cssDirectory = resolve(root, 'css');
const entry = resolve(cssDirectory, 'site.css');
const output = resolve(root, 'site.css');
const layers = ['foundation', 'layout', 'components', 'sections', 'cms'];
const check = process.argv.includes('--check');
if (process.argv.slice(2).some(argument => argument !== '--check')) {
  throw new Error('Usage: node scripts/build-css.mjs [--check]');
}

const source = postcss.parse(await readFile(entry, 'utf8'), { from: entry });
const statements = source.nodes.filter(node => node.type !== 'comment');
const first = statements.shift();
if (first?.name !== 'layer' || first.nodes || first.params.replaceAll(/\s/g, '') !== layers.join(',')) {
  throw new Error('css/site.css must declare the five cascade layers first.');
}

const imported = new Set();
let previousLayer = -1;
let declarations = 0;
let generated = '/* GENERATED from css/site.css. Edit the modules in css/, then run npm run build:css. */\n';
generated += `@layer ${layers.join(', ')};\n`;

for (const statement of statements) {
  const match = statement.type === 'atrule' && statement.name === 'import'
    ? statement.params.match(/^"\.\/([a-z][a-z0-9-]*\.css)"\s+layer\((\w+)\)$/)
    : null;
  if (!match) throw new Error(`Invalid entry-point statement: ${statement.toString()}`);
  const [, name, layer] = match;
  const layerIndex = layers.indexOf(layer);
  if (layerIndex < previousLayer || layerIndex < 0) throw new Error(`Invalid layer order: ${name}`);
  if (imported.has(name) || name === 'site.css') throw new Error(`Duplicate or recursive import: ${name}`);
  previousLayer = layerIndex;
  imported.add(name);

  const file = resolve(dirname(entry), name);
  const content = await readFile(file, 'utf8');
  const module = postcss.parse(content, { from: file });
  module.walkAtRules(rule => {
    if (rule.name === 'import' || rule.name === 'charset' || rule.name === 'layer') {
      throw new Error(`${name}: declare imports and layers only in css/site.css.`);
    }
  });
  module.walkDecls(declaration => {
    declarations++;
    // Modules move one directory deeper; preserve absolute asset URLs so that
    // both direct source imports and the root bundle resolve the same assets.
    for (const match of declaration.value.matchAll(/url\(\s*["']?([^"')\s]+)/g)) {
      if (!/^(?:https?:|data:|\/|#)/i.test(match[1])) {
        throw new Error(`${name}: use an absolute asset URL: ${match[1]}`);
      }
    }
  });
  const indented = content.trimEnd().split('\n').map(line => line ? `  ${line}` : '').join('\n');
  generated += `\n/* Module: css/${name} */\n@layer ${layer} {\n${indented}\n}\n`;
}

const files = await readdir(cssDirectory, { withFileTypes: true });
for (const file of files) {
  if (file.isDirectory()) throw new Error(`Unexpected CSS subdirectory: ${file.name}`);
  if (file.name.endsWith('.css') && file.name !== 'site.css' && !imported.has(file.name)) {
    throw new Error(`Unimported stylesheet: css/${file.name}`);
  }
}
postcss.parse(generated, { from: output });
if (check) {
  if (await readFile(output, 'utf8') !== generated) {
    throw new Error('site.css is out of date. Run npm run build:css and commit the result.');
  }
} else {
  await writeFile(output, generated);
}
console.log(`CSS ${check ? 'check' : 'build'} OK: ${imported.size} modules, ${declarations} declarations, one root stylesheet.`);
