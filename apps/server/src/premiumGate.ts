import {
  filterCategoriesForEntitlement,
  type QuestionCategory,
} from '@ynn/shared';

/**
 * Until IAP receipt verification exists, never trust the client for premium.
 * Ops can temporarily open categories with YNN_PREMIUM_OPEN=1 (never in public prod).
 */
export function serverPremiumEntitled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.YNN_PREMIUM_OPEN === '1';
}

/** Strip picante / sin_filtro unless the server explicitly allows premium. */
export function resolveRoomCategories(
  categories: string[],
  env: NodeJS.ProcessEnv = process.env,
): QuestionCategory[] {
  return filterCategoriesForEntitlement(
    categories,
    serverPremiumEntitled(env),
  );
}
