# Ops monetización — El Coro (solo ads)

Producto app: `com.yonnunca.party` · Modelo: **AdMob intersticial** (sin IAP / sin RevenueCat).

Secrets / env: `.env.monetization` (gitignored) + [`scripts/ops_monetization.sh`](../scripts/ops_monetization.sh).

```bash
./scripts/ops_monetization.sh ready
./scripts/ops_monetization.sh sync-env   # → apps/mobile/.env
./scripts/ops_monetization.sh eas-env
./scripts/ops_monetization.sh build-preview
```

App objetivo: **0.1.6+** (nativo con `react-native-google-mobile-ads`).

## 1) AdMob

1. [AdMob](https://admob.google.com) → App Android `com.yonnunca.party`.
2. Crear unidad **Interstitial**.
3. Copiar a `.env.monetization`:
   - `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` (`ca-app-pub-XXXX~YYYY`)
   - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID` (`ca-app-pub-XXXX/ZZZZ`)
4. Preview/EAS pueden usar **test ids** de Google hasta closed testing.

## 2) Secrets EAS

```bash
./scripts/ops_monetization.sh eas-env
```

| Variable | Uso |
|----------|-----|
| `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` | AdMob app id |
| `EXPO_PUBLIC_ADMOB_IOS_APP_ID` | placeholder test si no hay iOS |
| `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID` | Interstitial |
| `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS` | Interstitial iOS |

## 3) Play Console — Advertising ID

1. Play → Política → **ID de publicidad** → **Sí**.
2. Finalidad: publicidad / medición (AdMob).
3. Data safety: declarar ads.

Privacy: `https://yo-nunca-nunca.onrender.com/privacy`

## 4) Build

```bash
./scripts/ops_monetization.sh build-preview    # APK
./scripts/ops_monetization.sh build-production # AAB
```

OTA **no** incluye el SDK nativo de AdMob.

## Dónde se muestran ads

Intersticial al salir de juegos locales (`exitWithOptionalAd`), con cooldown ~2.5 min. En Expo Go los ads se omiten (sin crash).

## Checklist

- [ ] AdMob app + interstitial (reales o test)
- [ ] EAS env production
- [ ] Play “Usa ID de publicidad” = Sí
- [ ] `eas build` nativo instalado
- [ ] Intersticial visible al salir de un juego local
