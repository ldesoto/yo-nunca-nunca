# Yo Nunca Nunca

Juego party multijugador para Android e iOS. Fase 1 MVP.

## Stack

| Capa | Tecnología |
|------|------------|
| App | React Native + Expo + TypeScript + Reanimated |
| Servidor | Node + Colyseus (`@colyseus/core` + WS transport) |
| Reglas | `@ynn/shared` (puntuación, fases, códigos) |
| Preguntas | **SQLite local** (`@ynn/db`, seed ≥300) — gratis, embebido |

> No usa el Postgres LEADS / CardNexus. Ignora `DATABASE_URL`. Solo `YNN_SQLITE_PATH` (opcional).

## Estructura

```
apps/mobile          Expo client
apps/server          Colyseus + Express /health
packages/shared      tipos y reglas
packages/db          SQLite schema, migrate, seed → data/ynn.sqlite
```

## Producción (Render gratis + EAS)

### Elegir hosting (WebSocket stateful)

| Opción | Coste real hoy | HTTPS/WSS | SQLite MVP | Notas |
|--------|----------------|-----------|------------|--------|
| **Render Hobby free** (default) | $0, 750 h/mes | `*.onrender.com` | Ephemeral (re-seed al despertar) | Sleep 15 min idle; cold start ~60 s; WebSocket en el mismo puerto |
| **Fly.io** (opcional) | ~$2/mo always-on | `*.fly.dev` | Volumen 1 GB | Ya no hay free forever; trial ~2 VM-hours |
| Vercel / Lambda / ngrok | — | — | — | Descartados |

**Target cableado:** `https://yo-nunca-nunca.onrender.com` / `wss://yo-nunca-nunca.onrender.com` (`render.yaml`, `apps/mobile/eas.json` preview+production).

**Estado producción (real):**
- **Listo para jugar online** salvo: `eas submit`, IAP real (RevenueCat / Play Billing / App Store) y cuentas de desarrollador de tiendas.
- Servicio Render **ya existe y está live**: `GET /health` → 200 (`status=ok`, `questions`≈1081). No hace falta crear otro Blueprint.
- Deploy config lista: `render.yaml` (`healthCheckPath: /health`, `PORT` inyectado por Render, `YNN_SQLITE_PATH=/data/ynn.sqlite`, `dockerContext: .`), `apps/server/Dockerfile`, `docker-compose.yml`, perfiles EAS `preview`/`production` → Render.
- **Gate seguridad (servidor):** categorías Premium (`picante` / `sin_filtro`) se filtran en `POST /rooms` + `PartyRoom` (fail-closed). Stub local de Premium en la app **no** abre el mazo online; solo `YNN_PREMIUM_OPEN=1` en el servidor (ops/testing) o IAP futuro. CORS con allowlist + Expo; analytics sin respuestas/nombres; custom questions con `sanitizeCustomQuestion` + `reportQuestion`.
- **Push pendiente (deploy servidor):** working tree local con `premiumGate` + PartyRoom/CORS/WHO_WAS **sin commit**; tras commit + `git push` a `main`, Render auto-redeploya. Sin ese push, producción pública **aún no** aplica el gate Premium del servidor. Cambios solo en `apps/mobile` no tocan Render; bastan commit + `eas build --profile preview|production`.
- Fly (`yo-nunca-nunca.fly.dev`) nunca se desplegó (sin DNS); opcional.

### Checklist readiness

| Ítem | Estado |
|------|--------|
| Render `/health` + mazo SQLite | ✅ |
| Shared / server tests | ✅ |
| Mobile `tsc` + endpoints https/wss en preview/production | ✅ |
| CORS, moderación custom, report, WHO_WAS, reconexión 60s | ✅ |
| Premium fail-closed en servidor | ✅ (código local; **pendiente push/redeploy**) |
| `eas build` preview/production | ⬜ cuando quieras |
| Cuentas Play / Apple Developer | ⬜ |
| IAP real | ⬜ |
| `eas submit` a tiendas | ⬜ |

### Redeploy / Blueprint (servicio ya creado)

El Web Service en Render **ya está** ligado al repo. Solo recrea Blueprint si borras el servicio:

1. Dashboard Render → servicio `yo-nunca-nunca` (o New → Blueprint si partieras de cero).
2. `git push` a `origin/main` → rebuild Docker (~3–5 min). Cold start tras sleep ~60 s.

```bash
cd /Users/luisdesoto/yo-nunca-nunca
./scripts/verify_public_health.sh https://yo-nunca-nunca.onrender.com
```

Sin CLI: `./scripts/deploy_render.sh` imprime los mismos pasos Blueprint. Con CLI: `brew install render`, `render login`, `./scripts/deploy.sh render`.

**Menos sleep en pruebas (gratis):** [cron-job.org](https://cron-job.org) → `GET https://yo-nunca-nunca.onrender.com/health` cada **10 minutos** (no garantiza 100 % awake; respeta ToS Render).

### Fly.io opcional (volumen SQLite persistente)

```bash
./scripts/install_flyctl.sh
export PATH="$HOME/.fly/bin:$PATH"
flyctl auth login
./scripts/deploy.sh fly
./scripts/verify_public_health.sh https://yo-nunca-nunca.fly.dev
```

Si usas Fly en lugar de Render, cambia `eas.json` a `*.fly.dev`. Por defecto la app móvil apunta a Render.

SQLite: en Render es efímero en disco; en Fly vive en **`/data/ynn.sqlite`**. Puerto `2567` local; Render/Fly inyectan `PORT`.

- Health: `GET /health` → `{ "status": "ok", "sqlite": true, ... }`
- Dominio propio: `ALLOWED_ORIGINS` + CORS en servidor; override de URL en app → **Configuración** (solo pruebas).

**Probar imagen local** (misma Dockerfile que producción):

```bash
docker compose up --build -d
curl -s http://127.0.0.1:2567/health | jq .
docker compose down
```

### Tiendas (APK / iOS) — no usar localhost

Las apps de Play Store / App Store **no pueden** apuntar a tu Mac.

1. Despliega el servidor (pasos arriba).
2. Tras el deploy Render, confirma que `apps/mobile/eas.json` sigue en `https://yo-nunca-nunca.onrender.com` (ya viene así). Override temporal en la app: **Configuración → URL servidor**.
3. **Cuenta Expo / EAS** (`npm i -g eas-cli`, `eas login`, `eas init` en `apps/mobile` si falta `projectId`).
4. **Builds** (desde la raíz o `apps/mobile`):

   ```bash
   cd apps/mobile
   eas build -p android --profile preview    # APK interno
   eas build -p android --profile production # AAB Play Store
   eas build -p ios --profile production     # TestFlight / App Store
   ```

5. **Publicación en tiendas** (cuentas de desarrollador, fuera de este repo):
   - **Google Play**: cuenta de desarrollador (pago único), firma de app gestionada por EAS, subir AAB con `eas submit -p android` cuando estés listo.
   - **Apple**: Apple Developer Program (anual), certificados/provisioning vía EAS, `eas submit -p ios` para TestFlight/App Store.

En desarrollo local sigue `127.0.0.1:2567`. En `preview` / `production`, si queda localhost el build **falla a propósito** (`app.config.js` / `config.ts`).

Los jugadores se unen igual: el host ve el código en el lobby y los demás usan **UNIRSE** + código; todos hablan con el **mismo servidor en la nube**.

## Arranque local

### 1. Dependencias

```bash
cd /Users/luisdesoto/yo-nunca-nunca
pnpm install
pnpm --filter @ynn/shared build
pnpm --filter @ynn/db build
```

### 2. Base de preguntas (SQLite)

```bash
pnpm db:migrate
pnpm db:seed
# archivo: packages/db/data/ynn.sqlite
```

### 3. Servidor

```bash
pnpm dev:server
# health: http://127.0.0.1:2567/health
```

Sin SQLite el servidor arranca con preguntas fallback en memoria.

### 4. App móvil

```bash
pnpm dev:mobile
```

```bash
export EXPO_PUBLIC_SERVER_URL=http://127.0.0.1:2567
export EXPO_PUBLIC_WS_URL=ws://127.0.0.1:2567
```

En dispositivo físico usa la IP de tu Mac.

## Tests

```bash
pnpm --filter @ynn/shared test
pnpm --filter @ynn/server test
```

## Checklist E2E manual

1. Crear partida (host) → ver código de 5 caracteres
2. Segundo cliente → Unirse con el código
3. Ambos listos → Host inicia
4. Responder NUNCA / SÍ
5. Ver revelación progresiva y ranking
6. Completar rondas → pantalla de ganador
7. Probar reconexión: matar red ~10s y volver
8. Probar “Jugar solo” (1 jugador, modo demo)

## API útil

- `GET /health` → `{ sqlite, sqlitePath }`
- `POST /rooms` `{ playerName, rounds?, categories?, solo? }` → `{ roomId, roomCode }`
- `GET /rooms/:code` → `{ roomId, roomCode, clients }`

## Fuera de Fase 1 (hecho parcialmente)

- ✅ Modo parejas (crear partida)
- ✅ Preguntas custom (lobby)
- ✅ Eventos `nobody` / `everyone` / doble / mortal
- ✅ **¿Quién fue?** (voto tras responder, +60 si aciertas)
- ✅ **Fase 3 (base)**: analytics locales (§22), Premium stub (Picante / Sin filtro), moderación + report
- ✅ Audio SFX + bed de lobby (respeta Config), stats Premium avanzadas, banner de reconexión
- ⬜ **Al final**: publicación Play Store / App Store (`eas build` + submit) + IAP real
