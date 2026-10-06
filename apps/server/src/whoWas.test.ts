import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WHO_WAS_BONUS,
  WHO_WAS_TIMEOUT_MS,
  grantsWhoWasVote,
  canTransition,
} from '@ynn/shared';

describe('WHO_WAS contract', () => {
  it('exposes bonus and timeout', () => {
    assert.equal(WHO_WAS_BONUS, 60);
    assert.equal(WHO_WAS_TIMEOUT_MS, 12_000);
  });

  it('grants vote only to never answers (incl. auto-never)', () => {
    assert.equal(grantsWhoWasVote('never'), true);
    assert.equal(grantsWhoWasVote('did'), false);
    assert.equal(grantsWhoWasVote(undefined), false);
  });

  it('only allows legal phase edges around WHO_WAS', () => {
    assert.equal(canTransition('WAITING_FOR_ANSWERS', 'WHO_WAS'), true);
    assert.equal(canTransition('WHO_WAS', 'REVEAL'), true);
    assert.equal(canTransition('WHO_WAS', 'SCORE'), false);
    assert.equal(canTransition('LOBBY', 'WHO_WAS'), false);
  });
});
