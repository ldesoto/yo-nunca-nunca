import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreRound } from './scoring.js';
import { generateRoomCode, isValidRoomCode } from './roomCode.js';
import { canTransition, nextAfterScore } from './phases.js';
import { canStartGame, sanitizePlayerName } from './validation.js';

describe('scoreRound', () => {
  it('awards minority bonus when few said yes', () => {
    const result = scoreRound({
      questionId: 'Q1',
      questionText: 'test',
      answers: [
        { sessionId: 'a', choice: 'did' },
        { sessionId: 'b', choice: 'never' },
        { sessionId: 'c', choice: 'never' },
        { sessionId: 'd', choice: 'never' },
      ],
    });
    assert.equal(result.specialEvent, 'none');
    assert.equal(result.yesCount, 1);
    assert.ok((result.pointsAwarded.a ?? 0) > (result.pointsAwarded.b ?? 0));
  });

  it('marks nobody special event', () => {
    const result = scoreRound({
      questionId: 'Q1',
      questionText: 'test',
      answers: [
        { sessionId: 'a', choice: 'never' },
        { sessionId: 'b', choice: 'never' },
      ],
    });
    assert.equal(result.specialEvent, 'nobody');
  });

  it('marks everyone special event', () => {
    const result = scoreRound({
      questionId: 'Q1',
      questionText: 'test',
      answers: [
        { sessionId: 'a', choice: 'did' },
        { sessionId: 'b', choice: 'did' },
      ],
    });
    assert.equal(result.specialEvent, 'everyone');
  });
});

describe('roomCode', () => {
  it('generates valid 5-char codes', () => {
    const code = generateRoomCode(5, () => 0.1);
    assert.equal(code.length, 5);
    assert.equal(isValidRoomCode(code), true);
  });
});

describe('phases', () => {
  it('allows lobby to question', () => {
    assert.equal(canTransition('LOBBY', 'QUESTION'), true);
    assert.equal(canTransition('LOBBY', 'REVEAL'), false);
  });

  it('ends when rounds complete', () => {
    assert.equal(nextAfterScore(12, 12), 'GAME_OVER');
    assert.equal(nextAfterScore(3, 12), 'QUESTION');
  });
});

describe('validation', () => {
  it('sanitizes names', () => {
    assert.equal(sanitizePlayerName('  Luis!! '), 'Luis');
    assert.equal(canStartGame(1), false);
    assert.equal(canStartGame(2), true);
  });
});
