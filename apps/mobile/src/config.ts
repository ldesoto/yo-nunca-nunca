import Constants from 'expo-constants';

type Extra = {
  appEnv?: string;
  serverHttp?: string;
  serverWs?: string;
};

const extra = (Constants.expoConfig?.extra || {}) as Extra;

const fromExtraHttp = extra.serverHttp?.trim();
const fromExtraWs = extra.serverWs?.trim();
const fromEnvHttp = process.env.EXPO_PUBLIC_SERVER_URL?.trim();
const fromEnvWs = process.env.EXPO_PUBLIC_WS_URL?.trim();

export const APP_ENV = extra.appEnv || process.env.APP_ENV || 'development';

/** Production target (Render Hobby free). */
export const DEFAULT_PUBLIC_HTTP = 'https://yo-nunca-nunca.onrender.com';
export const DEFAULT_PUBLIC_WS = 'wss://yo-nunca-nunca.onrender.com';

const isStoreEnv = APP_ENV === 'production' || APP_ENV === 'preview';

/** Baked at build time (EAS env). Runtime override lives in serverEndpoints.ts. */
export const SERVER_HTTP =
  fromExtraHttp ||
  fromEnvHttp ||
  (isStoreEnv ? DEFAULT_PUBLIC_HTTP : 'http://127.0.0.1:2567');

export const SERVER_WS =
  fromExtraWs ||
  fromEnvWs ||
  (isStoreEnv ? DEFAULT_PUBLIC_WS : 'ws://127.0.0.1:2567');

export function assertStoreSafeEndpoints() {
  if (APP_ENV !== 'production' && APP_ENV !== 'preview') return;
  const bad =
    !SERVER_HTTP ||
    !SERVER_WS ||
    /localhost|127\.0\.0\.1/i.test(SERVER_HTTP) ||
    /localhost|127\.0\.0\.1/i.test(SERVER_WS) ||
    SERVER_HTTP.startsWith('http://') ||
    SERVER_WS.startsWith('ws://');
  if (bad) {
    throw new Error(
      `Endpoints inseguros para ${APP_ENV}: HTTP=${SERVER_HTTP} WS=${SERVER_WS}. Usa https:// y wss:// públicos.`,
    );
  }
}

assertStoreSafeEndpoints();
