import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Share } from 'react-native';
import { t } from './i18n';
import {
  REVIEW_MIN_INTERVAL_MS,
  REVIEW_MIN_SESSIONS,
  STORE_URL,
} from './growthConfig';

const SESSIONS_KEY = 'ynn.growth.sessions.v1';
const REVIEW_KEY = 'ynn.growth.lastReview.v1';

function shareText(): string {
  return t('growth.shareMessage', { url: STORE_URL });
}

export async function shareApp(): Promise<void> {
  try {
    await Share.share({ title: t('growth.shareTitle'), message: shareText() });
  } catch {
    // cancelado o no disponible
  }
}

export async function inviteWhatsApp(): Promise<void> {
  const url = `whatsapp://send?text=${encodeURIComponent(shareText())}`;
  try {
    await Linking.openURL(url);
  } catch {
    await shareApp();
  }
}

export async function openStoreListing(packageName: string): Promise<void> {
  try {
    await Linking.openURL(`market://details?id=${packageName}`);
  } catch {
    await Linking.openURL(
      `https://play.google.com/store/apps/details?id=${packageName}`,
    ).catch(() => {});
  }
}

/** Llamar una vez al iniciar la app. */
export async function trackSession(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    const n = Number(raw);
    await AsyncStorage.setItem(
      SESSIONS_KEY,
      String((Number.isFinite(n) ? n : 0) + 1),
    );
  } catch {
    // ignore
  }
}

type StoreReviewModule = {
  isAvailableAsync: () => Promise<boolean>;
  hasAction: () => Promise<boolean>;
  requestReview: () => Promise<void>;
};

let reviewInFlight = false;

/**
 * Reseña in-app solo tras un momento positivo (ganar): nunca en la 1.ª sesión
 * y máximo 1 vez cada 30 días.
 */
export async function maybeRequestReview(): Promise<void> {
  if (reviewInFlight) return;
  reviewInFlight = true;
  try {
    const sessions = Number(await AsyncStorage.getItem(SESSIONS_KEY));
    if (!Number.isFinite(sessions) || sessions < REVIEW_MIN_SESSIONS) return;
    const last = Number(await AsyncStorage.getItem(REVIEW_KEY));
    if (Number.isFinite(last) && last > 0 && Date.now() - last < REVIEW_MIN_INTERVAL_MS) {
      return;
    }
    // @ts-ignore módulo opcional hasta instalar expo-store-review
    const StoreReview = (await import('expo-store-review')) as unknown as StoreReviewModule;
    if (!(await StoreReview.isAvailableAsync())) return;
    await AsyncStorage.setItem(REVIEW_KEY, String(Date.now()));
    await StoreReview.requestReview();
  } catch {
    // módulo nativo ausente (Expo Go) o fallo: ignorar
  } finally {
    reviewInFlight = false;
  }
}
