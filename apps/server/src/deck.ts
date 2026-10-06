import type { DbQuestion, YnnDb } from '@ynn/db';
import { fetchActiveQuestions } from '@ynn/db';
import { pickFallback } from './questions.js';

export function buildPartyDeck(options: {
  db: YnnDb | null;
  categories: string[];
  totalRounds: number;
  customQuestions: DbQuestion[];
}): DbQuestion[] {
  const cats = options.categories.length ? options.categories : ['todas'];
  const need = options.totalRounds + 5;
  let deck: DbQuestion[] = [];

  try {
    if (options.db) {
      deck = fetchActiveQuestions(options.db, cats, need);
    }
  } catch {
    deck = [];
  }

  if (deck.length < options.totalRounds) {
    const extra = pickFallback(cats, need, new Set());
    deck = [...deck, ...extra];
  }

  if (deck.length < options.totalRounds) {
    const extra = pickFallback(['todas'], need, new Set(deck.map((q) => q.id)));
    deck = [...deck, ...extra];
  }

  return [...options.customQuestions, ...deck];
}
