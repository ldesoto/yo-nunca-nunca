import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Carga .env locales sin pisar vars ya exportadas (EAS / shell). */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.join(__dirname, '../../.env.monetization'));
loadEnvFile(path.join(__dirname, '.env'));

const APP_VERSION = '0.1.11';
const BUILD_NUMBER = '13';

/** Bake URLs at build time. Default = public Render (multiplayer across devices). */
const DEFAULT_PUBLIC_HTTP = 'https://yo-nunca-nunca.onrender.com';
const DEFAULT_PUBLIC_WS = 'wss://yo-nunca-nunca.onrender.com';

const serverHttp = process.env.EXPO_PUBLIC_SERVER_URL || DEFAULT_PUBLIC_HTTP;
const serverWs = process.env.EXPO_PUBLIC_WS_URL || DEFAULT_PUBLIC_WS;

const TEST_ADMOB_ANDROID_APP = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_IOS_APP = 'ca-app-pub-3940256099942544~1458002511';

const admobAndroidAppId = (
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || ''
).trim();
const admobIosAppId = (process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || '').trim();

if (process.env.APP_ENV === 'production' || process.env.APP_ENV === 'preview') {
  if (
    !serverHttp ||
    !serverWs ||
    /localhost|127\.0\.0\.1/i.test(serverHttp + serverWs) ||
    serverHttp.startsWith('http://') ||
    serverWs.startsWith('ws://')
  ) {
    throw new Error(
      `${process.env.APP_ENV} build requires EXPO_PUBLIC_SERVER_URL / EXPO_PUBLIC_WS_URL as public https:// and wss:// (not localhost).`,
    );
  }
  if (
    !admobAndroidAppId ||
    admobAndroidAppId === TEST_ADMOB_ANDROID_APP ||
    !admobAndroidAppId.includes('~')
  ) {
    throw new Error(
      `${process.env.APP_ENV} build requires a real EXPO_PUBLIC_ADMOB_ANDROID_APP_ID (not Google sample).`,
    );
  }
}

export default {
  expo: {
    name: 'El Coro',
    slug: 'yo-nunca-nunca',
    version: APP_VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'elcoro',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0B0614',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yonnunca.party',
      buildNumber: BUILD_NUMBER,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
        },
        // Common Google / AdMob SKAdNetwork IDs (subset; update via AdMob console as needed)
        SKAdNetworkItems: [
          { SKAdNetworkIdentifier: 'cstr6suwn9.skadnetwork' },
          { SKAdNetworkIdentifier: '4fzdc2evr5.skadnetwork' },
          { SKAdNetworkIdentifier: '4pfyv79a8a.skadnetwork' },
          { SKAdNetworkIdentifier: '2fnua5tdw4.skadnetwork' },
          { SKAdNetworkIdentifier: 'ydx93a7ass.skadnetwork' },
          { SKAdNetworkIdentifier: '5a6flpkh64.skadnetwork' },
          { SKAdNetworkIdentifier: 'p78axxw29g.skadnetwork' },
          { SKAdNetworkIdentifier: 'v72qych5uu.skadnetwork' },
          { SKAdNetworkIdentifier: 'ludvb6z3bs.skadnetwork' },
          { SKAdNetworkIdentifier: 'cp8zw746q7.skadnetwork' },
          { SKAdNetworkIdentifier: '3sh42y64q3.skadnetwork' },
          { SKAdNetworkIdentifier: 'c6k4g5qg8m.skadnetwork' },
          { SKAdNetworkIdentifier: 's39g8k73mm.skadnetwork' },
          { SKAdNetworkIdentifier: '3qy4746246.skadnetwork' },
          { SKAdNetworkIdentifier: 'f38h382jlk.skadnetwork' },
          { SKAdNetworkIdentifier: 'hs6bdukanm.skadnetwork' },
          { SKAdNetworkIdentifier: 'v4nxqhlyqp.skadnetwork' },
          { SKAdNetworkIdentifier: 'wzmmz9fp6w.skadnetwork' },
          { SKAdNetworkIdentifier: 'yclnxrl5pm.skadnetwork' },
          { SKAdNetworkIdentifier: 't38b2kh725.skadnetwork' },
          { SKAdNetworkIdentifier: '7ug5zh24hu.skadnetwork' },
          { SKAdNetworkIdentifier: 'gta9lk7p23.skadnetwork' },
          { SKAdNetworkIdentifier: 'vutu7akeur.skadnetwork' },
          { SKAdNetworkIdentifier: 'y5ghdn5j9k.skadnetwork' },
          { SKAdNetworkIdentifier: 'n6fk4nfna4.skadnetwork' },
          { SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
          { SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork' },
          { SKAdNetworkIdentifier: '47vhws6wlr.skadnetwork' },
          { SKAdNetworkIdentifier: 'kbd757ywx3.skadnetwork' },
          { SKAdNetworkIdentifier: '9t245vhmpl.skadnetwork' },
          { SKAdNetworkIdentifier: 'eh6fmpgw3l.skadnetwork' },
          { SKAdNetworkIdentifier: 'a2p9lx4jpn.skadnetwork' },
          { SKAdNetworkIdentifier: '22mmun2rn5.skadnetwork' },
          { SKAdNetworkIdentifier: '4468km3ulz.skadnetwork' },
          { SKAdNetworkIdentifier: '2u9pt9hc89.skadnetwork' },
          { SKAdNetworkIdentifier: '8s468mfl3y.skadnetwork' },
          { SKAdNetworkIdentifier: 'klf5c3l5u5.skadnetwork' },
          { SKAdNetworkIdentifier: 'ppxm28t8ap.skadnetwork' },
          { SKAdNetworkIdentifier: 'ecpz2srf59.skadnetwork' },
          { SKAdNetworkIdentifier: 'uw77j35x4d.skadnetwork' },
          { SKAdNetworkIdentifier: 'pwa73g5rt2.skadnetwork' },
          { SKAdNetworkIdentifier: 'mlmmfzh3r3.skadnetwork' },
          { SKAdNetworkIdentifier: '578prtvx9j.skadnetwork' },
          { SKAdNetworkIdentifier: '4dzt52r2t5.skadnetwork' },
          { SKAdNetworkIdentifier: 'e5fvkxwrpn.skadnetwork' },
          { SKAdNetworkIdentifier: '8c4e2ghe7u.skadnetwork' },
          { SKAdNetworkIdentifier: 'zq492l623r.skadnetwork' },
          { SKAdNetworkIdentifier: '3qcr597p9d.skadnetwork' },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0B0614',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      package: 'com.yonnunca.party',
      versionCode: Number(BUILD_NUMBER),
      // Required for AdMob on Android 13+ (Play AD_ID declaration).
      permissions: ['com.google.android.gms.permission.AD_ID'],
      // expo-sensors pulls ACTIVITY_RECOGNITION (Pedometer); we only use Accelerometer.
      blockedPermissions: ['android.permission.ACTIVITY_RECOGNITION'],
      intentFilters: [
        {
          action: 'VIEW',
          category: ['BROWSABLE', 'DEFAULT'],
          data: [{ scheme: 'elcoro' }],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-asset',
      [
        'expo-audio',
        {
          microphonePermission: false,
          recordAudioAndroid: false,
          enableBackgroundPlayback: false,
          enableBackgroundRecording: false,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            buildArchs: ['armeabi-v7a', 'arm64-v8a'],
            enableMinifyInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: admobAndroidAppId || TEST_ADMOB_ANDROID_APP,
          iosAppId: admobIosAppId || TEST_ADMOB_IOS_APP,
          delayAppMeasurementInit: true,
          optimizeInitialization: false,
          optimizeAdLoading: false,
        },
      ],
      // Debe ir DESPUÉS del plugin de AdMob: bloquea init nativo al cold start.
      './plugins/withRemoveMobileAdsInitProvider.js',
      'expo-status-bar',
    ],
    extra: {
      appEnv: process.env.APP_ENV || 'development',
      serverHttp,
      serverWs,
      adsOnly: true,
      eas: {
        projectId:
          process.env.EAS_PROJECT_ID || 'bac8f6f5-5728-484c-bbc4-435fc603066b',
      },
    },
  },
};
