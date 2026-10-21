# i18n — pendientes de contenido de juego

## Hecho (UI)

- Locale: `Intl.DateTimeFormat().resolvedOptions().locale` → `en` | `es` | `pt`, fallback `en`.
- Diccionario y `t(key, params?)` en `src/i18n.ts`.
- Pantallas y componentes de UI cableados con `t(...)`.

## Hecho: packs locales (`gamesData`)

- `src/data/gamesData.json` — español (fuente original).
- `src/data/gamesData.en.json` / `gamesData.pt.json` — mismos keys/orden/conteos.
- Selector: `src/data/games.ts` → `getGamesData()` / `gamesData` según `LANG` (fallback `en`).
- Pantallas locales importan desde `../data/games` (mostLikely, truthOrDrink, twoTruths, charades, bomb).

## Pendiente: preguntas online

| Fuente | Uso |
|--------|-----|
| `packages/db/seed/questions.json` | Preguntas online “Yo Nunca” servidas por el backend |

### Cómo completar (siguiente iteración)

1. Para online: columnas o filas por locale en seed + API que filtre por idioma del host/sala (sin mezclar idiomas en la misma partida).
2. No mezclar idiomas en la misma partida online.

Hasta entonces, jugadores en `en`/`pt` ven UI + **contenido local** en su idioma; el **Yo Nunca online** sigue en español hasta la tarea del servidor/seed.
