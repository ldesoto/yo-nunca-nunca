import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FREE_CATEGORIES,
  PREMIUM_CATEGORIES,
  filterCategoriesForEntitlement,
  isPremiumCategory,
  type QuestionCategory,
} from '@ynn/shared';
import { track } from './analytics';
import { APP_ENV } from './config';

const KEY = 'ynn.premium.v1';

export { FREE_CATEGORIES, PREMIUM_CATEGORIES, isPremiumCategory };

/** Store builds must not offer a free Premium unlock (policy + content gate). */
export function isPremiumStubAllowed(): boolean {
  return APP_ENV !== 'production';
}

type PremiumState = {
  /** Stub local hasta IAP real (RevenueCat / Play Billing). */
  unlocked: boolean;
};

let cached: boolean | null = null;
const listeners = new Set<(unlocked: boolean) => void>();

export async function loadPremium(): Promise<boolean> {
  if (!isPremiumStubAllowed()) {
    cached = false;
    return false;
  }
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      cached = false;
      return false;
    }
    const s = JSON.parse(raw) as PremiumState;
    cached = Boolean(s.unlocked);
    return cached;
  } catch {
    cached = false;
    return false;
  }
}

export function isPremiumUnlocked(): boolean {
  if (!isPremiumStubAllowed()) return false;
  return Boolean(cached);
}

export async function setPremiumUnlocked(unlocked: boolean): Promise<void> {
  if (!isPremiumStubAllowed()) {
    cached = false;
    for (const l of listeners) l(false);
    return;
  }
  cached = unlocked;
  await AsyncStorage.setItem(KEY, JSON.stringify({ unlocked } satisfies PremiumState));
  if (unlocked) track('premium_unlocked', { source: 'settings_stub' });
  for (const l of listeners) l(unlocked);
}

export function subscribePremium(fn: (unlocked: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function gateCategories(
  categories: QuestionCategory[],
  unlocked = isPremiumUnlocked(),
): QuestionCategory[] {
  return filterCategoriesForEntitlement(categories, unlocked);
}

export function requirePremiumForCategory(id: string): boolean {
  if (!isPremiumCategory(id)) return false;
  if (isPremiumUnlocked()) return false;
  track('premium_gate_hit', { category: id });
  return true;
}
