import type { DbQuestion } from '@ynn/db';
import { normalizeLocale, pickQuestionText, type Locale } from '@ynn/shared';

export type QuestionTextBundle = {
  questionText: string;
  questionTextEn: string;
  questionTextPt: string;
};

/** All three locales for Colyseus state; clients pick with LANG. */
export function questionTextsForState(q: DbQuestion): QuestionTextBundle {
  const es = q.text;
  const en = (q.text_en || '').trim() || es;
  const pt = (q.text_pt || '').trim() || es;
  return {
    questionText: es,
    questionTextEn: en,
    questionTextPt: pt,
  };
}

/** Resolve display text for a player's locale from a synced bundle. */
export function displayQuestionForLocale(
  bundle: QuestionTextBundle,
  localeRaw: unknown,
): string {
  const locale: Locale = normalizeLocale(localeRaw);
  return pickQuestionText(
    {
      text: bundle.questionText,
      textEn: bundle.questionTextEn,
      textPt: bundle.questionTextPt,
    },
    locale,
  );
}
