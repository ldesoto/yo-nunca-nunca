export type Locale = 'en' | 'es' | 'pt';

/** Missing / unknown locale → Spanish (legacy installed clients). */
export function normalizeLocale(raw: unknown): Locale {
  if (raw === 'en' || raw === 'es' || raw === 'pt') return raw;
  if (typeof raw === 'string') {
    const base = raw.toLowerCase().split(/[-_]/)[0] ?? '';
    if (base === 'en' || base === 'es' || base === 'pt') return base;
  }
  return 'es';
}

export type LocalizedQuestionText = {
  text: string;
  textEn?: string | null;
  textPt?: string | null;
};

/** Pick display text for a locale; fall back to Spanish when a translation is missing. */
export function pickQuestionText(
  q: LocalizedQuestionText,
  locale: Locale,
): string {
  if (locale === 'en') {
    const en = (q.textEn ?? '').trim();
    if (en) return en;
  }
  if (locale === 'pt') {
    const pt = (q.textPt ?? '').trim();
    if (pt) return pt;
  }
  return q.text;
}
