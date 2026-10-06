import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_ENV, SERVER_HTTP as BAKED_HTTP, SERVER_WS as BAKED_WS } from './config';

export const SERVER_OVERRIDE_KEY = 'ynn.serverOverride.v1';

type Override = { http: string; ws: string };

let runtimeOverride: Override | null = null;
let loaded = false;

function httpToWs(http: string): string {
  if (http.startsWith('https://')) return `wss://${http.slice('https://'.length)}`;
  if (http.startsWith('http://')) return `ws://${http.slice('http://'.length)}`;
  return http;
}

export function normalizeServerBase(raw: string): string {
  return raw.trim().replace(/\/$/, '');
}

function isLoopback(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** preview/production: only https + wss public hosts (no cleartext / loopback). */
export function isStoreSafeServerPair(http: string, ws: string): boolean {
  if (!http || !ws) return false;
  if (isLoopback(http) || isLoopback(ws)) return false;
  if (!http.startsWith('https://')) return false;
  if (!ws.startsWith('wss://')) return false;
  return true;
}

function assertOverrideAllowed(http: string, ws: string) {
  if (APP_ENV !== 'production' && APP_ENV !== 'preview') return;
  if (!isStoreSafeServerPair(http, ws)) {
    throw new Error(
      `Override inseguro para ${APP_ENV}: usa https:// y wss:// públicos (no localhost).`,
    );
  }
}

export function setRuntimeServerOverride(http: string | null, ws?: string | null) {
  if (!http?.trim()) {
    runtimeOverride = null;
    return;
  }
  const httpNorm = normalizeServerBase(http);
  const wsNorm = ws?.trim()
    ? normalizeServerBase(ws).replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
    : httpToWs(httpNorm);
  assertOverrideAllowed(httpNorm, wsNorm);
  runtimeOverride = { http: httpNorm, ws: wsNorm };
}

export async function loadRuntimeServerOverride(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(SERVER_OVERRIDE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { http?: string; ws?: string };
    const http = parsed.http?.trim();
    if (!http) return;
    const ws = parsed.ws?.trim()
      ? normalizeServerBase(parsed.ws)
      : httpToWs(normalizeServerBase(http));
    // Stale / store-unsafe overrides break joins or violate store rules — drop them.
    if (
      isLoopback(http) ||
      isLoopback(ws) ||
      ((APP_ENV === 'production' || APP_ENV === 'preview') &&
        !isStoreSafeServerPair(normalizeServerBase(http), ws))
    ) {
      await AsyncStorage.removeItem(SERVER_OVERRIDE_KEY);
      runtimeOverride = null;
      return;
    }
    setRuntimeServerOverride(http, parsed.ws ?? null);
  } catch {
    // ignore corrupt storage / rejected override
    runtimeOverride = null;
  }
}

export async function saveServerOverride(http: string | null, ws?: string | null): Promise<void> {
  if (!http?.trim()) {
    await AsyncStorage.removeItem(SERVER_OVERRIDE_KEY);
    setRuntimeServerOverride(null);
    return;
  }
  const httpNorm = normalizeServerBase(http);
  const wsNorm = ws?.trim()
    ? normalizeServerBase(ws).replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
    : httpToWs(httpNorm);
  assertOverrideAllowed(httpNorm, wsNorm);
  await AsyncStorage.setItem(
    SERVER_OVERRIDE_KEY,
    JSON.stringify({ http: httpNorm, ws: wsNorm }),
  );
  setRuntimeServerOverride(httpNorm, wsNorm);
}

/** Runtime override (Settings) wins; store builds still assert baked https/wss at startup. */
export function getServerHttp(): string {
  return runtimeOverride?.http ?? BAKED_HTTP;
}

export function getServerWs(): string {
  return runtimeOverride?.ws ?? BAKED_WS;
}

export function getBakedServerHttp(): string {
  return BAKED_HTTP;
}
