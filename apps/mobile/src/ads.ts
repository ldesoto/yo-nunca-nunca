import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

const COOLDOWN_KEY = 'ynn.ads.lastInterstitial.v1';
const MIN_GAP_MS = 90 * 1000; // ≥90 s entre anuncios y desde el inicio de la app
const ROUNDS_PER_AD = 3; // tope: 1 intersticial cada 3 rondas
const APP_START = Date.now();
let roundsSinceAd = 0;

/** Registrar rondas/partidas terminadas (pausas naturales). */
export function noteRoundsPlayed(n = 1): void {
  if (Number.isFinite(n) && n > 0) roundsSinceAd += n;
}

function androidUnitId(): string {
  return (
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID?.trim() ||
    'ca-app-pub-3940256099942544/1033173712'
  );
}

function iosUnitId(): string {
  return (
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS?.trim() ||
    'ca-app-pub-3940256099942544/4411468910'
  );
}

/** Expo Go / sin binario nativo → no importar AdMob (evita crash TurboModule). */
function nativeAdsAvailable(): boolean {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return false;
  }
  if (Constants.appOwnership === 'expo') return false;
  try {
    const turbo = TurboModuleRegistry.get?.('RNGoogleMobileAdsModule');
    if (turbo) return true;
    return Boolean(
      (NativeModules as Record<string, unknown>).RNGoogleMobileAdsModule,
    );
  } catch {
    return false;
  }
}

let adsReady = false;
let adsFailed = false;
let initPromise: Promise<void> | null = null;

async function loadAds() {
  if (adsFailed) return null;
  if (!nativeAdsAvailable()) {
    adsFailed = true;
    return null;
  }
  try {
    return await import('react-native-google-mobile-ads');
  } catch {
    adsFailed = true;
    return null;
  }
}

/**
 * Init diferido: MobileAdsInitProvider está removido del manifest.
 * Solo se llama tras el primer frame de UI.
 */
export async function initAds(): Promise<void> {
  if (adsReady || adsFailed) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!nativeAdsAvailable()) {
      adsFailed = true;
      return;
    }
    const mod = await loadAds();
    if (!mod) return;
    try {
      // UMP: consentimiento (GDPR / estados de EE. UU.) antes de inicializar.
      await mod.AdsConsent.gatherConsent().catch(() => null);
      const info = await mod.AdsConsent.getConsentInfo().catch(() => null);
      if (!info?.canRequestAds) {
        initPromise = null;
        return;
      }
      // App 18+: contenido máximo MA, no dirigida a niños.
      await mod.default().setRequestConfiguration({
        maxAdContentRating: mod.MaxAdContentRating.MA,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });
      await mod.default().initialize();
      adsReady = true;
    } catch {
      adsFailed = true;
    }
  })();
  return initPromise;
}

async function canShow(): Promise<boolean> {
  if (roundsSinceAd < ROUNDS_PER_AD) return false;
  if (Date.now() - APP_START < MIN_GAP_MS) return false;
  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
    if (!raw) return true;
    const last = Number(raw);
    if (!Number.isFinite(last)) return true;
    return Date.now() - last >= MIN_GAP_MS;
  } catch {
    return true;
  }
}

async function markShown(): Promise<void> {
  roundsSinceAd = 0;
  await AsyncStorage.setItem(COOLDOWN_KEY, String(Date.now()));
}

/**
 * Intersticial solo en pausas naturales (fin de mano/ronda/partida).
 * Nunca bloquea la navegación si falla el ad.
 */
export async function showInterstitialIfNeeded(): Promise<void> {
  if (!(await canShow())) return;

  await initAds();
  const mod = await loadAds();
  if (!mod) return;

  const { InterstitialAd, AdEventType, TestIds } = mod;
  const unitId = __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.OS === 'ios'
      ? iosUnitId()
      : androidUnitId();

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timeout = setTimeout(finish, 8_000);
    try {
      const interstitial = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubLoaded = interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          void markShown();
          interstitial.show().catch(finish);
        },
      );
      const unsubClosed = interstitial.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubLoaded();
          unsubClosed();
          unsubError();
          clearTimeout(timeout);
          finish();
        },
      );
      const unsubError = interstitial.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unsubLoaded();
          unsubClosed();
          unsubError();
          clearTimeout(timeout);
          finish();
        },
      );

      interstitial.load();
    } catch {
      clearTimeout(timeout);
      finish();
    }
  });
}

/** Salida de un juego local = fin de partida (1 ronda); navega tras el ad. */
export function exitWithOptionalAd(goBack: () => void): void {
  noteRoundsPlayed(1);
  void showInterstitialIfNeeded().finally(goBack);
}

/** Configuración > Privacidad de anuncios (formulario UMP). */
export async function showAdPrivacyOptions(): Promise<void> {
  const mod = await loadAds();
  if (!mod) return;
  await mod.AdsConsent.showPrivacyOptionsForm().catch(() => {});
}
