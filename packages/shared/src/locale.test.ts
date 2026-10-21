import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocale, pickQuestionText } from './locale.js';

describe('normalizeLocale', () => {
  it('defaults missing locale to es', () => {
    assert.equal(normalizeLocale(undefined), 'es');
    assert.equal(normalizeLocale(null), 'es');
    assert.equal(normalizeLocale(''), 'es');
    assert.equal(normalizeLocale('fr'), 'es');
  });

  it('accepts en and pt', () => {
    assert.equal(normalizeLocale('en'), 'en');
    assert.equal(normalizeLocale('pt'), 'pt');
    assert.equal(normalizeLocale('es'), 'es');
  });

  it('normalizes BCP-47 tags', () => {
    assert.equal(normalizeLocale('en-US'), 'en');
    assert.equal(normalizeLocale('pt-BR'), 'pt');
    assert.equal(normalizeLocale('es-MX'), 'es');
  });
});

describe('pickQuestionText', () => {
  const q = {
    text: 'Yo nunca nunca he mentido',
    textEn: 'Never have I ever lied',
    textPt: 'Eu nunca menti',
  };

  it('returns Spanish for es / missing translation locale', () => {
    assert.equal(pickQuestionText(q, 'es'), q.text);
  });

  it('returns English for en', () => {
    assert.equal(pickQuestionText(q, 'en'), q.textEn);
  });

  it('returns Portuguese for pt', () => {
    assert.equal(pickQuestionText(q, 'pt'), q.textPt);
  });

  it('falls back to Spanish when en/pt empty', () => {
    assert.equal(
      pickQuestionText({ text: 'Yo nunca', textEn: '', textPt: '  ' }, 'en'),
      'Yo nunca',
    );
    assert.equal(
      pickQuestionText({ text: 'Yo nunca', textEn: null, textPt: null }, 'pt'),
      'Yo nunca',
    );
  });
});
