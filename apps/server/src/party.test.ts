import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PartyRoom } from './rooms/PartyRoom.js';
import { canStartGame, scoreRound, generateRoomCode } from '@ynn/shared';

describe('party room helpers', () => {
  it('exports PartyRoom', () => {
    assert.equal(typeof PartyRoom, 'function');
  });

  it('requires at least 2 players to start', () => {
    assert.equal(canStartGame(1), false);
    assert.equal(canStartGame(2), true);
  });

  it('scores a round deterministically for all-yes', () => {
    const r = scoreRound({
      questionId: 'x',
      questionText: 't',
      answers: [
        { sessionId: '1', choice: 'did' },
        { sessionId: '2', choice: 'did' },
      ],
    });
    assert.equal(r.specialEvent, 'everyone');
    assert.ok((r.pointsAwarded['1'] ?? 0) > 0);
  });

  it('generates join codes', () => {
    assert.equal(generateRoomCode().length, 5);
  });
});
