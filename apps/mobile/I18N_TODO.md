# i18n — pendientes de contenido de juego

## Hecho (UI)

- Locale: `Intl.DateTimeFormat().resolvedOptions().locale` → `en` | `es` | `pt`, fallback `en`.
- Diccionario y `t(key, params?)` en `src/i18n.ts`.
- Pantallas y componentes de UI cableados con `t(...)`.

## Pendiente: packs de preguntas / prompts

El contenido jugable sigue **solo en español**. No hay archivo por idioma todavía (volumen alto y acoplado al servidor/seed).

| Fuente | Uso |
|--------|-----|
| `apps/mobile/src/data/gamesData.json` | Modos locales: mostLikely, truthOrDrink, charades, bomb, twoTruthsIdeas, etc. |
| `packages/db/seed/questions.json` | Preguntas online “Yo Nunca” servidas por el backend |

### Cómo completar (siguiente iteración)

1. Extraer packs a `gamesData.en.json` / `.es.json` / `.pt.json` (o un mapa `{ en, es, pt }` por modo) y seleccionar con `LANG` desde `i18n.ts`.
2. Para online: columnas o filas por locale en seed + API que filtre por idioma del host/sala (sin mezclar idiomas en la misma partida).
3. Traducir también categorías de bomba/charadas (strings del JSON, no solo labels de UI).

Hasta entonces, jugadores en `en`/`pt` ven la UI traducida y el **contenido de cartas en español**.
