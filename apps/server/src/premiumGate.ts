import {
  filterCategoriesForEntitlement,
  type QuestionCategory,
} from '@ynn/shared';

/** Normaliza categorías de sala (todas libres; monetización solo ads). */
export function resolveRoomCategories(
  categories: string[],
  _env?: NodeJS.ProcessEnv,
  _hostEntitled = true,
): QuestionCategory[] {
  return filterCategoriesForEntitlement(categories, true);
}
