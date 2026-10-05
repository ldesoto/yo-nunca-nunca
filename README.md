# Yo Nunca Nunca

Juego party multijugador para Android e iOS. Fase 1 MVP.

## Stack

| Capa | Tecnología |
|------|------------|
| App | React Native + Expo + TypeScript + Reanimated |
| Servidor | Node + Colyseus (`@colyseus/core` + WS transport) |
| Reglas | `@ynn/shared` (puntuación, fases, códigos) |
| Preguntas | Postgres (`@ynn/db`, seed ≥300) |

## Estructura

```
apps/mobile          Expo client
apps/server          Colyseus + Express /health
packages/shared      tipos y reglas
packages/db          schema, migrate, seed
```

## Arranque local

### 1. Dependencias

```bash
cd /Users/luisdesoto/yo-nunca-nunca
pnpm install
pnpm --filter @ynn/shared build
pnpm --filter @ynn/db build
```

### 2. Postgres

```bash
docker compose up -d postgres
export DATABASE_URL=postgres://ynn:ynn@127.0.0.1:5433/yo_nunca_nunca
pnpm db:migrate
pnpm db:seed
```

### 3. Servidor

```bash
pnpm dev:server
# health: http://127.0.0.1:2567/health
```

Sin Postgres el servidor arranca igual y usa preguntas fallback.

### 4. App móvil

```bash
pnpm dev:mobile
```

Variables opcionales:

```bash
export EXPO_PUBLIC_SERVER_URL=http://127.0.0.1:2567
export EXPO_PUBLIC_WS_URL=ws://127.0.0.1:2567
```

En dispositivo físico usa la IP de tu Mac, no `127.0.0.1`.

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

- `GET /health`
- `POST /rooms` `{ playerName, rounds?, categories?, solo? }` → `{ roomId, roomCode }`
- `GET /rooms/:code` → `{ roomId, roomCode, clients }`

## Fuera de Fase 1

Modo parejas, preguntas custom, “¿Quién fue?”, eventos, premium, analytics, publicación stores.
