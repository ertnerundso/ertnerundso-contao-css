// JavaScript bündeln; alte Hash-Dateien vor jedem Build entfernen.
import { rm } from 'node:fs/promises';
import { build } from 'esbuild';
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await build({
  entryPoints: ['src/site.js'],
  bundle: true,
  splitting: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  outdir: 'dist',
  entryNames: 'site',
  chunkNames: 'chunks/[name]-[hash]',
  logLevel: 'info',
});
