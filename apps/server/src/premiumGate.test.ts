import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoomCategories, serverPremiumEntitled } from './premiumGate.js';

describe('premiumGate (server)', () => {
  it('is closed by default', () => {
    assert.equal(serverPremiumEntitled({}), false);
    assert.equal(serverPremiumEntitled({ YNN_PREMIUM_OPEN: '0' }), false);
    assert.equal(serverPremiumEntitled({ YNN_PREMIUM_OPEN: '1' }), true);
  });

  it('strips premium categories when closed', () => {
    const next = resolveRoomCategories(
      ['casual', 'picante', 'sin_filtro'],
      {},
    );
    assert.deepEqual(next, ['casual']);
  });

  it('keeps premium categories when YNN_PREMIUM_OPEN=1', () => {
    const next = resolveRoomCategories(['picante'], {
      YNN_PREMIUM_OPEN: '1',
    });
    assert.deepEqual(next, ['picante']);
  });

  it('falls back to todas when only premium was requested', () => {
    const next = resolveRoomCategories(['picante', 'sin_filtro'], {});
    assert.deepEqual(next, ['todas']);
  });
});
