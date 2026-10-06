const APP_VERSION = '0.1.0';

/** Bake URLs at build time. Default = public Render (multiplayer across devices). */
const DEFAULT_PUBLIC_HTTP = 'https://yo-nunca-nunca.onrender.com';
const DEFAULT_PUBLIC_WS = 'wss://yo-nunca-nunca.onrender.com';

const serverHttp = process.env.EXPO_PUBLIC_SERVER_URL || DEFAULT_PUBLIC_HTTP;
const serverWs = process.env.EXPO_PUBLIC_WS_URL || DEFAULT_PUBLIC_WS;

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
    plugins: ['expo-asset', 'expo-audio', 'expo-status-bar'],
    extra: {
      appEnv: process.env.APP_ENV || 'development',
      serverHttp,
      serverWs,
      eas: {
        projectId:
          process.env.EAS_PROJECT_ID || 'bac8f6f5-5728-484c-bbc4-435fc603066b',
      },
    },
  },
};
