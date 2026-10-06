import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPartyDeck } from './deck.js';
import { pickFallback } from './questions.js';
import { canStartGame } from '@ynn/shared';

describe('party deck', () => {
  it('fills deck for picante-only when SQLite is unavailable', () => {
    const deck = buildPartyDeck({
      db: null,
      categories: ['picante'],
      totalRounds: 12,
      customQuestions: [],
    });
    assert.ok(deck.length >= 12);
  });

  it('pickFallback widens categories when the pool is empty', () => {
    const picked = pickFallback(['sin_filtro'], 5, new Set());
    assert.equal(picked.length, 5);
  });

  it('two players can start (shared rule)', () => {
    assert.equal(canStartGame(2), true);
  });

  it('start deck yields a first question (no immediate game over path)', () => {
    const deck = buildPartyDeck({
      db: null,
      categories: ['picante', 'sin_filtro'],
      totalRounds: 6,
      customQuestions: [],
    });
    const first = deck[0];
    assert.ok(first?.text.length > 8);
    assert.ok(first?.id);
  });
});
