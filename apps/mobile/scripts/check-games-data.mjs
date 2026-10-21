import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/data');
const keys = [
  'mostLikely',
  'neverHaveIEver',
  'twoTruthsIdeas',
  'truthOrDrink',
  'charades',
  'bomb',
];

const es = JSON.parse(readFileSync(join(dir, 'gamesData.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(dir, 'gamesData.en.json'), 'utf8'));
const pt = JSON.parse(readFileSync(join(dir, 'gamesData.pt.json'), 'utf8'));

let ok = true;
for (const k of keys) {
  const a = es[k]?.length;
  const b = en[k]?.length;
  const c = pt[k]?.length;
  const line = `${k}: es=${a} en=${b} pt=${c}`;
  if (a !== b || a !== c) {
    console.error('MISMATCH', line);
    ok = false;
  } else {
    console.log(line);
  }
}
if (!ok) process.exit(1);
console.log('OK');
