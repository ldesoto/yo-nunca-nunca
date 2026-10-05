import type cors from 'cors';

const EXPO_ORIGIN = /^exp:\/\//i;
const EXPO_HTTPS = /^https:\/\/([a-z0-9-]+\.)*expo\.(dev|io)$/i;

function parseAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildCorsOptions(): cors.CorsOptions {
  const extra = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (extra.includes(origin)) {
        callback(null, true);
        return;
      }

      if (EXPO_ORIGIN.test(origin) || EXPO_HTTPS.test(origin)) {
        callback(null, true);
        return;
      }

      const flyApp = (process.env.FLY_APP_NAME || 'yo-nunca-nunca').trim();
      if (flyApp && origin === `https://${flyApp}.fly.dev`) {
        callback(null, true);
        return;
      }

      const renderExternal = (process.env.RENDER_EXTERNAL_URL || '').trim().replace(/\/$/, '');
      if (renderExternal && origin === renderExternal) {
        callback(null, true);
        return;
      }

      const renderService = (process.env.RENDER_SERVICE_NAME || flyApp || 'yo-nunca-nunca').trim();
      if (renderService && origin === `https://${renderService}.onrender.com`) {
        callback(null, true);
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  };
}
