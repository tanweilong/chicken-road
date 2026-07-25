#!/usr/bin/env node
/*
 * embed-assets.js — M7.4 (I1) asset-embedding pipeline.
 *
 * Authoring-time-only tool. Reads the approved asset registry
 * (scripts/asset-registry.json, which must mirror docs/DESIGN.md §10.6.11
 * exactly), base64-inlines each approved PNG from assets/gen/m7.2/final/,
 * and splices the resulting `GENERATED_ASSETS` object literal into
 * index.html between the GENERATED_ASSETS marker comments.
 *
 * This script is NEVER loaded by the shipped game and makes no runtime
 * difference to it — it only regenerates the embedded base64 block ahead
 * of time. index.html remains a single self-contained file with zero
 * runtime network calls (PRD §5); this script is a build-time convenience,
 * not a dependency of the shipped artifact.
 *
 * Usage:  node scripts/embed-assets.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'scripts', 'asset-registry.json');
const INDEX_PATH = path.join(ROOT, 'index.html');

const BEGIN_MARK = '/* GENERATED_ASSETS:BEGIN — do not hand-edit, run `node scripts/embed-assets.js` */';
const END_MARK = '/* GENERATED_ASSETS:END */';

function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const dir = path.join(ROOT, registry.dir);
  const entries = [];
  let totalRaw = 0;

  for (const id of registry.assets) {
    const file = path.join(dir, id + '.png');
    if (!fs.existsSync(file)) {
      throw new Error(`Registry references missing file: ${file} (id=${id})`);
    }
    const buf = fs.readFileSync(file);
    totalRaw += buf.length;
    const b64 = buf.toString('base64');
    entries.push(`  ${JSON.stringify(id)}: "data:image/png;base64,${b64}"`);
  }

  const block =
    `${BEGIN_MARK}\n` +
    `const GENERATED_ASSETS = {\n${entries.join(',\n')}\n};\n` +
    `${END_MARK}`;

  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const beginIdx = html.indexOf(BEGIN_MARK);
  const endIdx = html.indexOf(END_MARK);
  if (beginIdx === -1 || endIdx === -1) {
    throw new Error(
      'GENERATED_ASSETS markers not found in index.html — add them once ' +
      '(see scripts/embed-assets.js BEGIN_MARK/END_MARK) before running this script.'
    );
  }
  const before = html.slice(0, beginIdx);
  const after = html.slice(endIdx + END_MARK.length);
  const next = before + block + after;
  fs.writeFileSync(INDEX_PATH, next, 'utf8');

  const b64Bytes = entries.reduce((n, e) => n + e.length, 0);
  console.log(`Embedded ${registry.assets.length} assets.`);
  console.log(`Raw PNG bytes:    ${totalRaw.toLocaleString()} (${(totalRaw/1024).toFixed(1)} KB)`);
  console.log(`Base64 payload:   ~${b64Bytes.toLocaleString()} chars (~${(b64Bytes/1024).toFixed(1)} KB)`);
}

main();
