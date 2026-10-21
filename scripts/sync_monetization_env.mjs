#!/usr/bin/env node
/**
 * Copia EXPO_PUBLIC_ADMOB_* desde .env.monetization → apps/mobile/.env
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, '.env.monetization');
const dest = path.join(root, 'apps/mobile/.env');

const PUBLIC_KEYS = [
  'EXPO_PUBLIC_ADMOB_ANDROID_APP_ID',
  'EXPO_PUBLIC_ADMOB_IOS_APP_ID',
  'EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID',
  'EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS',
];

function parseEnv(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

if (!fs.existsSync(src)) {
  console.warn(`[sync_monetization_env] Falta ${src} — skip`);
  process.exit(0);
}

const env = parseEnv(fs.readFileSync(src, 'utf8'));
const lines = [
  '# Generado por scripts/sync_monetization_env.mjs — no editar a mano',
  `# Fuente: ${src}`,
];
for (const k of PUBLIC_KEYS) {
  if (env[k]) lines.push(`${k}=${env[k]}`);
}

fs.writeFileSync(dest, `${lines.join('\n')}\n`, 'utf8');
const set = PUBLIC_KEYS.filter((k) => env[k]).length;
console.log(
  `[sync_monetization_env] wrote ${dest} (${set}/${PUBLIC_KEYS.length} keys)`,
);
