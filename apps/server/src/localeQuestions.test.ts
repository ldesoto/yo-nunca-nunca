import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { DbQuestion } from '@ynn/db';
import { normalizeLocale } from '@ynn/shared';
import {
  displayQuestionForLocale,
  questionTextsForState,
} from './localeQuestions.js';
import { FALLBACK_QUESTIONS } from './questions.js';

const seedQ: DbQuestion = {
  id: 'CAS_0001',
  text: 'Yo nunca nunca he inventado una emergencia',
  text_en: 'Never have I ever faked an emergency',
  text_pt: 'Eu nunca inventei uma emergência',
  category: 'casual',
  adult_only: false,
  active: true,
};

const customQ: DbQuestion = {
  id: 'CUSTOM_1',
  text: 'Pregunta custom del host',
  text_en: 'Pregunta custom del host',
  text_pt: 'Pregunta custom del host',
  category: 'casual',
  adult_only: false,
  active: true,
};

describe('question locale serving', () => {
  it('defaults missing locale to Spanish', () => {
    const bundle = questionTextsForState(seedQ);
    assert.equal(normalizeLocale(undefined), 'es');
    assert.equal(displayQuestionForLocale(bundle, undefined), seedQ.text);
    assert.equal(displayQuestionForLocale(bundle, null), seedQ.text);
    assert.equal(displayQuestionForLocale(bundle, ''), seedQ.text);
  });

  it('serves English when locale is en', () => {
    const bundle = questionTextsForState(seedQ);
    assert.equal(displayQuestionForLocale(bundle, 'en'), seedQ.text_en);
  });

  it('serves Portuguese when locale is pt', () => {
    const bundle = questionTextsForState(seedQ);
    assert.equal(displayQuestionForLocale(bundle, 'pt'), seedQ.text_pt);
  });

  it('keeps CUSTOM_ questions identical across locales', () => {
    const bundle = questionTextsForState(customQ);
    assert.equal(displayQuestionForLocale(bundle, 'es'), customQ.text);
    assert.equal(displayQuestionForLocale(bundle, 'en'), customQ.text);
    assert.equal(displayQuestionForLocale(bundle, 'pt'), customQ.text);
  });

  it('fallback bank includes en/pt for every question', () => {
    for (const q of FALLBACK_QUESTIONS) {
      assert.ok(q.text_en.trim().length > 4, q.id);
      assert.ok(q.text_pt.trim().length > 4, q.id);
      const bundle = questionTextsForState(q);
      assert.notEqual(displayQuestionForLocale(bundle, 'en'), '');
      assert.notEqual(displayQuestionForLocale(bundle, 'pt'), '');
    }
  });
});
