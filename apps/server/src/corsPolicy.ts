import type cors from 'cors';

const EXPO_ORIGIN = /^exp:\/\//i;
const EXPO_HTTPS = /^https:\/\/([a-z0-9-]+\.)*expo\.(dev|io)$/i;
/** Expo web / Metro when ALLOWED_ORIGINS is unset in production. */
const LOCAL_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

export function parseAllowedOrigins(
  raw: string | undefined = process.env.ALLOWED_ORIGINS,
): string[] {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Pure allowlist check — used by Express cors and unit tests. */
export function isOriginAllowed(
  origin: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!origin) return true;

  const extra = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  if (extra.includes(origin)) return true;

  if (EXPO_ORIGIN.test(origin) || EXPO_HTTPS.test(origin)) return true;

  // Empty allowlist must not lock out Expo web / local clients hitting Render.
  if (extra.length === 0 && LOCAL_DEV_ORIGIN.test(origin)) return true;

  const flyApp = (env.FLY_APP_NAME || 'yo-nunca-nunca').trim();
  if (flyApp && origin === `https://${flyApp}.fly.dev`) return true;

  const renderExternal = (env.RENDER_EXTERNAL_URL || '').trim().replace(/\/$/, '');
  if (renderExternal && origin === renderExternal) return true;

  const renderService = (env.RENDER_SERVICE_NAME || flyApp || 'yo-nunca-nunca').trim();
  if (renderService && origin === `https://${renderService}.onrender.com`) {
    return true;
  }

  if (env.NODE_ENV !== 'production') return true;

  return false;
}

export function buildCorsOptions(
  env: NodeJS.ProcessEnv = process.env,
): cors.CorsOptions {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, env)) {
        callback(null, true);
        return;
      }
      // Deny without throwing — Error callbacks surface as 500s to some clients.
      callback(null, false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  };
}
