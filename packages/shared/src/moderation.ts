/** Filtro básico de lenguaje ofensivo / contenido prohibido (custom questions). */

const OFFENSIVE =
  /\b(puto|puta|mierda|idiota|estupido|estúpido|cabron|cabrón|hijueputa|pendejo|verga|coño)\b/i;

const BLOCKED =
  /\b(menor|niñ[oa]s?|child|pedo(fil)?|kill\s*yourself|suicid|gore)\b/i;

export type CustomQuestionResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'too_short' | 'too_long' | 'offensive' | 'blocked' };

export function containsOffensiveLanguage(text: string): boolean {
  return OFFENSIVE.test(text);
}

export function containsBlockedContent(text: string): boolean {
  return BLOCKED.test(text);
}

/**
 * Normaliza y valida una pregunta personalizada.
 * Por defecto solo vive en la partida (el servidor no la persiste).
 */
export function sanitizeCustomQuestion(raw: string): CustomQuestionResult {
  const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, 140);
  if (cleaned.length < 8) return { ok: false, reason: 'too_short' };
  if (cleaned.length > 140) return { ok: false, reason: 'too_long' };
  if (containsBlockedContent(cleaned)) return { ok: false, reason: 'blocked' };
  if (containsOffensiveLanguage(cleaned)) return { ok: false, reason: 'offensive' };

  const prefixed = cleaned.toLowerCase().startsWith('yo nunca')
    ? cleaned
    : `Yo nunca nunca ${cleaned}`;

  return { ok: true, text: prefixed };
}

export const CUSTOM_QUESTION_REASON_LABEL: Record<
  Exclude<CustomQuestionResult, { ok: true }>['reason'],
  string
> = {
  too_short: 'Escribe una frase más larga',
  too_long: 'Máximo 140 caracteres',
  offensive: 'Lenguaje no permitido. Reformúlala.',
  blocked: 'Ese contenido no está permitido',
};
