import test from 'node:test';
import assert from 'node:assert/strict';
import { validateModule, validateProject } from './validate-css.mjs';
import { SYSTEM_FILES } from './css-architecture.mjs';

test('a component can arrange existing state classes with spacing tokens', () => {
  assert.doesNotThrow(() =>
    validateModule(
      'hero.css',
      '.hero { display: grid; gap: var(--space-lg); margin: 0 auto; } @media (max-width: 760px) { .hero.is-active { grid-template-columns: 1fr; } }',
      'sections',
    ),
  );
});

for (const declaration of [
  'color: var(--color-primary)',
  'font-size: var(--font-h1)',
  'line-height: 1.1',
  'border-radius: var(--radius-md)',
  'opacity: 0',
  'transition: var(--motion-fast)',
  'padding: 16px',
  'gap: 1rem',
]) {
  test(`component rejects misplaced styling: ${declaration}`, () => {
    assert.throws(() =>
      validateModule('hero.css', `.hero { ${declaration}; }`, 'sections'),
    );
  });
}

test('surface styling uses palette values, including gradient colors', () => {
  assert.doesNotThrow(() =>
    validateModule(
      'surfaces.css',
      '@layer sections { .hero { background: linear-gradient(var(--color-primary), var(--color-transparent)); } }',
    ),
  );
  for (const color of ['#fff', 'rgb(0, 0, 0)', 'red'])
    assert.throws(
      () =>
        validateModule(
          'surfaces.css',
          `@layer sections { .hero { background: linear-gradient(${color}, var(--color-primary)); } }`,
        ),
      /literal colors/,
    );
});

test('font resources belong to typography and keep absolute URLs', () => {
  const face =
    '@font-face { font-family: Modernist; src: url(https://example.org/regular.woff2); }';
  assert.doesNotThrow(() =>
    validateModule('typography.css', `@layer foundation { ${face} }`),
  );
  assert.throws(
    () => validateModule('cards.css', face, 'components'),
    /font-face/,
  );
  assert.throws(
    () =>
      validateModule(
        'typography.css',
        '@layer foundation { @font-face { src: url(../regular.woff2); } }',
      ),
    /absolute asset URL/,
  );
});

test('new and variable breakpoints require an explicit architecture update', () => {
  for (const width of ['900px', 'var(--breakpoint-mobile)'])
    assert.throws(() =>
      validateModule(
        'hero.css',
        `@media (max-width: ${width}) { .hero { display: block; } }`,
        'sections',
      ),
    );
});

test('animation keyframes can animate opacity in their motion owner', () => {
  const animation =
    '@keyframes reveal { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: none; } }';
  assert.doesNotThrow(() =>
    validateModule('motion.css', `@layer components { ${animation} }`),
  );
  assert.throws(
    () => validateModule('cards.css', animation, 'components'),
    /keyframes/,
  );
});

function project() {
  const files = new Map(
    [...SYSTEM_FILES].map((name) => [name, '@layer foundation {}']),
  );
  files.set('base.css', '@layer foundation { :root { --space-lg: 1.5rem; } }');
  files.set('hero.css', '.hero { gap: var(--space-lg); }');
  const entry =
    '@layer foundation, layout, components, sections, cms;\n' +
    [...SYSTEM_FILES].map((name) => `@import "./css/${name}";`).join('\n') +
    '\n@import "./css/hero.css" layer(sections);';
  return { entry, files };
}

test('project verifies coverage and token definitions while allowing runtime fallbacks', () => {
  const { entry, files } = project();
  assert.equal(validateProject(entry, files).modules, 7);
  files.set('hero.css', '.hero { gap: var(--space-typo); }');
  assert.throws(() => validateProject(entry, files), /undefined token/);
  files.set(
    'hero.css',
    '.hero { gap: var(--space-stack-gap, var(--stack-gap, var(--space-lg))); }',
  );
  assert.doesNotThrow(() => validateProject(entry, files));
  files.set('orphan.css', '.orphan { display: block; }');
  assert.throws(() => validateProject(entry, files), /Unimported stylesheet/);
});

test('entry rejects duplicate imports and incorrect cascade order', () => {
  const { entry, files } = project();
  assert.throws(
    () =>
      validateProject(
        entry + '\n@import "./css/hero.css" layer(sections);',
        files,
      ),
    /Duplicate import/,
  );
  assert.throws(
    () =>
      validateProject(
        entry.replace(
          'foundation, layout, components',
          'components, layout, foundation',
        ),
        files,
      ),
    /five cascade layers/,
  );
});
