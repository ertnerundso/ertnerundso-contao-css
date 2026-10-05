// Architekturprüfung: kleine Startdatei, vorhandene Modul-/Asset-Verweise, CSS als Quelle für Motion-Werte.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parse } from 'acorn';
import { config } from '../src/config.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const names = (await fs.readdir(root + '/src')).filter((name) => name.endsWith('.js'));
const css = (
  await Promise.all(
    (await fs.readdir(root + '/css')).map((name) =>
      fs.readFile(root + '/css/' + name, 'utf8'),
    ),
  )
).join('\n');
const definitions = new Set(
  [...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
);
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
for (const name of names) {
  const source = await fs.readFile(root + '/src/' + name, 'utf8');
  const ast = parse(source, { sourceType: 'module', ecmaVersion: 'latest' });
  const imports = [];
  walk(ast, (node) => {
    if (node.type === 'ImportDeclaration') imports.push(node.source.value);
    if (node.type === 'ImportExpression') imports.push(node.source.value);
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'motion' &&
      ['value', 'number', 'pixels'].includes(node.callee.property.name)
    ) {
      const token = node.arguments[0]?.value;
      assert(
        definitions.has('--' + token),
        `${name}: undefined CSS setting --${token}`,
      );
    }
    if (
      name !== 'config.js' &&
      node.type === 'Literal' &&
      typeof node.value === 'string'
    ) {
      assert(
        !node.value.startsWith('https://'),
        `${name}: integration URLs belong in config.js`,
      );
      assert(
        !/\((?:min|max)-width:|\(prefers-reduced-motion:/.test(node.value),
        `${name}: media conditions belong in config.js`,
      );
    }
    if (
      node.type === 'Property' &&
      ['duration', 'stagger', 'ease', 'scrub'].includes(node.key.name) &&
      node.value.type === 'Literal' &&
      typeof node.value.value !== 'boolean'
    ) {
      assert(
        name === 'config.js',
        `${name}: animation values must come from motion.css`,
      );
    }
  });
  for (const dependency of imports)
    if (dependency.startsWith('.'))
      await fs.access(path.resolve(root, 'src', dependency));
}
const entry = await fs.readFile(root + '/src/site.js', 'utf8');
assert(
  entry.split('\n').length < 100 && !/querySelector|addEventListener/.test(entry),
  'site.js should only start modules',
);
for (const asset of Object.values(config.assets))
  if (!asset.startsWith('/')) await fs.access(root + '/assets/' + asset);
for (const name of (await fs.readdir(root + '/templates', { recursive: true })).filter(
  (name) => /\.(?:twig|php)$/.test(name),
)) {
  const source = await fs.readFile(root + '/templates/' + name, 'utf8');
  for (const match of source.matchAll(
    /https:\/\/ertnerundso\.github\.io\/ertnerundso-contao-src\/(assets\/[^"'\s>]+)/g,
  ))
    await fs.access(root + '/' + match[1]);
  assert(
    !source.includes('/clean/assets/'),
    `${name}: fixed template assets should use the repository folders`,
  );
}
for (const name of await fs.readdir(root + '/assets'))
  assert(
    ['fonts', 'images', 'videos'].includes(name),
    'Assets need their own type folder: ' + name,
  );
console.log(
  `JavaScript check OK: ${names.length} modules, CSS motion settings, imports and assets validated.`,
);
