import type { QuestionCategory } from './types.js';

/** Todas las categorías están disponibles (monetización = ads, sin IAP). */
export const FREE_CATEGORIES: QuestionCategory[] = [
  'todas',
  'casual',
  'vergonzoso',
  'fiesta',
  'relaciones',
  'picante',
  'sin_filtro',
];

/** @deprecated Sin gate Pro — siempre vacío. */
export const PREMIUM_CATEGORIES: QuestionCategory[] = [];

export function isPremiumCategory(_id: string): boolean {
  return false;
}

/** Normaliza la lista; ya no filtra por entitlement. */
export function filterCategoriesForEntitlement(
  categories: string[],
  _isPremium = true,
): QuestionCategory[] {
  const cleaned = categories.filter(Boolean) as QuestionCategory[];
  return cleaned.length ? cleaned : ['todas'];
}
