import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoomCategories } from './premiumGate.js';

describe('premiumGate (server) — ads-only, no Pro gate', () => {
  it('keeps picante / sin_filtro for everyone', () => {
    const next = resolveRoomCategories(
      ['casual', 'picante', 'sin_filtro'],
      {},
    );
    assert.deepEqual(next, ['casual', 'picante', 'sin_filtro']);
  });

  it('falls back to todas when empty', () => {
    assert.deepEqual(resolveRoomCategories([], {}), ['todas']);
  });
});
