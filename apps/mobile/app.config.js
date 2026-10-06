const APP_VERSION = '0.1.0';

/** Bake URLs at build time. Store builds must NOT use localhost. */
const serverHttp =
  process.env.EXPO_PUBLIC_SERVER_URL ||
  (process.env.APP_ENV === 'production'
    ? ''
    : 'http://127.0.0.1:2567');

const serverWs =
  process.env.EXPO_PUBLIC_WS_URL ||
  (process.env.APP_ENV === 'production'
    ? ''
    : 'ws://127.0.0.1:2567');

if (process.env.APP_ENV === 'production') {
  if (!serverHttp || !serverWs || /localhost|127\.0\.0\.1/i.test(serverHttp + serverWs)) {
    throw new Error(
      'Production build requires EXPO_PUBLIC_SERVER_URL and EXPO_PUBLIC_WS_URL pointing to a public host (not localhost).',
    );
  }
}

export default {
  expo: {
    name: 'Yo Nunca Nunca',
    slug: 'yo-nunca-nunca',
    version: APP_VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'yonuncannunca',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0B0614',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yonnunca.party',
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
        },
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
      intentFilters: [
        {
          action: 'VIEW',
          category: ['BROWSABLE', 'DEFAULT'],
          data: [{ scheme: 'yonuncannunca' }],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-asset', 'expo-status-bar'],
    extra: {
      appEnv: process.env.APP_ENV || 'development',
      serverHttp,
      serverWs,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || undefined,
      },
    },
  },
};
