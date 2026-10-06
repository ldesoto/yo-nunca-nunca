import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeCustomQuestion,
  containsOffensiveLanguage,
} from './moderation.js';
import {
  filterCategoriesForEntitlement,
  isPremiumCategory,
} from './premium.js';

describe('sanitizeCustomQuestion', () => {
  it('prefixes yo nunca and accepts clean text', () => {
    const r = sanitizeCustomQuestion('bailado en la mesa del bar');
    assert.equal(r.ok, true);
    if (r.ok) assert.match(r.text, /^Yo nunca nunca /i);
  });

  it('rejects short text', () => {
    const r = sanitizeCustomQuestion('hola');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, 'too_short');
  });

  it('rejects offensive language', () => {
    assert.equal(containsOffensiveLanguage('eres un idiota total'), true);
    const r = sanitizeCustomQuestion('he sido un idiota en público');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, 'offensive');
  });

  it('rejects blocked content', () => {
    const r = sanitizeCustomQuestion('algo sobre un menor de edad');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, 'blocked');
  });
});

describe('premium categories', () => {
  it('marks picante and sin_filtro as premium', () => {
    assert.equal(isPremiumCategory('picante'), true);
    assert.equal(isPremiumCategory('casual'), false);
  });

  it('strips premium cats when free', () => {
    const next = filterCategoriesForEntitlement(
      ['casual', 'picante', 'sin_filtro'],
      false,
    );
    assert.deepEqual(next, ['casual']);
  });

  it('keeps premium cats when entitled', () => {
    const next = filterCategoriesForEntitlement(['picante'], true);
    assert.deepEqual(next, ['picante']);
  });
});
