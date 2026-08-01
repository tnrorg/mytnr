#!/usr/bin/env node
/* Catches module-level data constants that are USED but never declared.
 *
 * Why this exists: a Vercel build failed with "ReferenceError: NEWS is not
 * defined" after a data array was deleted while a component still called
 * NEWS.map(...). esbuild does not flag that, there is no ESLint in this
 * project, and a full `next build` is slow.
 *
 * Scope is deliberately narrow rather than broad-and-noisy: it only looks at
 * SCREAMING_CASE identifiers that are used as a *value* — followed by .map(,
 * .filter(, .length, .slice(, [i], etc. Prose inside JSX ("TNR", "PDF") is
 * never followed by those, so it cannot produce a false positive. An earlier
 * attempt tried to strip JSX text with regexes and reported 20 phantom
 * problems; this reports only real ones.
 *
 * Usage:  node scripts/check-undefined.js            (app/ + components/ + lib/)
 *         node scripts/check-undefined.js path/a.js  (specific files)
 *
 * LIMITATION — read before trusting this.
 * It only checks SCREAMING_CASE data constants. A missing camelCase import
 * (e.g. `areaColor` used without importing it) crashed the members page at
 * runtime and this script did NOT catch it. Extending it to camelCase was
 * tried and produced 116 false positives, because without stripping string
 * literals and doing real scope analysis it cannot tell a helper call from
 * a word inside a message. `next build` remains the only complete check.
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.next') walk(p, out);
    } else if (e.name.endsWith('.js') || e.name.endsWith('.jsx')) out.push(p);
  }
  return out;
}

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

/** Names brought into scope by a declaration or an import. */
function declaredIn(src) {
  const d = new Set();

  for (const m of src.matchAll(/\bimport\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?/g)) {
    if (m[1]) d.add(m[1]);
    (m[2] || '').split(',').forEach((x) => {
      const n = x.trim().split(/\s+as\s+/).pop().trim();
      if (n) d.add(n);
    });
  }
  // Multi-declarator support: `const G = '#0B5836', DEEP = '#063D2B'`.
  for (const m of src.matchAll(/\b(?:const|let|var)\s+([A-Z][A-Z0-9_]{2,})\s*=/g)) d.add(m[1]);
  for (const m of src.matchAll(/,\s*([A-Z][A-Z0-9_]{2,})\s*=/g)) d.add(m[1]);
  for (const m of src.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g)) d.add(m[1]);
  // Destructured: const { NAV, FOOTER_LINKS } = ...
  for (const m of src.matchAll(/\{([^}]*)\}\s*=/g)) {
    m[1].split(',').forEach((x) => {
      const n = x.trim().split(':').pop().replace(/=.*/, '').trim();
      if (n) d.add(n);
    });
  }
  return d;
}

/* A constant used as a value: NEWS.map( / NEWS.length / NEWS[0] / ...NEWS
   Requires the usage form, which prose in markup never takes. */
const USED_AS_VALUE = /\b([A-Z][A-Z0-9_]{2,})(?:\s*\.\s*(?:map|filter|forEach|slice|find|some|every|reduce|join|includes|indexOf|length|keys|entries)\b|\s*\[|\.\.\.)/g;

const files = process.argv.length > 2
  ? process.argv.slice(2)
  : [...walk('app'), ...walk('components'), ...walk('lib')];

let failures = 0;
for (const f of files) {
  const src = stripComments(fs.readFileSync(f, 'utf8'));
  const declared = declaredIn(src);
  const missing = [...new Set([...src.matchAll(USED_AS_VALUE)].map((m) => m[1]))]
    .filter((u) => !declared.has(u));
  if (missing.length) {
    failures++;
    console.error(`  ✗ ${f}: ${missing.join(', ')} used but not defined`);
  }
}
if (failures) {
  console.error(`\n${failures} file(s) reference undefined data constants.`);
  process.exit(1);
}
console.log(`  ✓ ${files.length} files checked — no undefined data constants`);
