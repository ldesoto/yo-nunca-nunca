import type { QuestionCategory } from './types.js';

/** Categorías incluidas en el plan gratis. */
export const FREE_CATEGORIES: QuestionCategory[] = [
  'todas',
  'casual',
  'vergonzoso',
  'fiesta',
  'relaciones',
];

/** Categorías que requieren Premium. */
export const PREMIUM_CATEGORIES: QuestionCategory[] = ['picante', 'sin_filtro'];

export function isPremiumCategory(id: string): boolean {
  return (PREMIUM_CATEGORIES as string[]).includes(id);
}

/** Filtra categorías premium si el jugador no tiene entitlement. */
export function filterCategoriesForEntitlement(
  categories: string[],
  isPremium: boolean,
): QuestionCategory[] {
  const cleaned = categories.filter(Boolean) as QuestionCategory[];
  if (isPremium) return cleaned.length ? cleaned : ['todas'];
  const free = cleaned.filter((c) => !isPremiumCategory(c));
  return free.length ? free : ['todas'];
}
