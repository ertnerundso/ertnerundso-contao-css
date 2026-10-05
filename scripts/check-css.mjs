import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { validateProject } from './validate-css.mjs';

if (process.argv.length > 2)
  throw new Error('Usage: node scripts/check-css.mjs');
const root = resolve(import.meta.dirname, '..');
const directory = resolve(root, 'css');
const files = new Map();
for (const item of await readdir(directory, { withFileTypes: true })) {
  if (item.isDirectory())
    throw new Error(`Unexpected CSS subdirectory: ${item.name}`);
  if (item.name.endsWith('.css'))
    files.set(item.name, await readFile(resolve(directory, item.name), 'utf8'));
}
try {
  const result = validateProject(
    await readFile(resolve(root, 'site.css'), 'utf8'),
    files,
  );
  for (const content of files.values()) {
    const urls=[];
    postcss.parse(content).walkDecls(d=>{
      for(const match of d.value.matchAll(/url\(\s*["']?(\.\.\/assets\/[^"')\s]+)/g)) urls.push(match[1]);
    });
    for(const url of urls) await readFile(resolve(directory,decodeURIComponent(url)));
  }
  console.log(
    `CSS check OK: ${result.modules} direct imports, ${result.declarations} declarations; system/component ownership, tokens, breakpoints and asset URLs validated.`,
  );
} catch (error) {
  console.error(`CSS check failed: ${error.message}`);
  process.exitCode = 1;
}
