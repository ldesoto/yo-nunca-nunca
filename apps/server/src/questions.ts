import type { DbQuestion } from '@ynn/db';

const ADULT_CATEGORIES = new Set(['picante', 'sin_filtro']);

function allowsAdult(categories: string[]): boolean {
  if (categories.includes('todas') || categories.length === 0) return false;
  return categories.some((c) => ADULT_CATEGORIES.has(c));
}

/** In-memory fallback when SQLite is empty / unavailable. */
export const FALLBACK_QUESTIONS: DbQuestion[] = [
  {
    id: 'FB_001',
    text: 'Yo nunca nunca he inventado una emergencia familiar para salir de un plan que ya había confirmado',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_002',
    text: 'Yo nunca nunca he dejado en visto a propósito y luego fingido que se me acabó la batería',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_003',
    text: 'Yo nunca nunca he dicho "ya casi llego" estando todavía en pijama en la cama',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_004',
    text: 'Yo nunca nunca he puesto cara de concentración en Zoom mientras compraba online en otra pestaña',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_005',
    text: 'Yo nunca nunca he tropezado en público y fingido que fue un baile improvisado',
    category: 'vergonzoso',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_006',
    text: 'Yo nunca nunca he mandado un mensaje al jefe pensando que era el grupo de amigos',
    category: 'vergonzoso',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_007',
    text: 'Yo nunca nunca he respondido "tú también" a un "feliz cumpleaños"',
    category: 'vergonzoso',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_008',
    text: 'Yo nunca nunca he caído de una silla giratoria en una reunión Zoom con cámara prendida',
    category: 'vergonzoso',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_009',
    text: 'Yo nunca nunca he despertado en un sofá desconocido sin recordar cómo llegué',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_010',
    text: 'Yo nunca nunca he hecho un shot de algo que no sabía qué era solo por no quedar mal',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_011',
    text: 'Yo nunca nunca he dicho "última ronda" al menos cuatro veces en la misma noche',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_012',
    text: 'Yo nunca nunca he organizado una previa "chill" que terminó con vecinos golpeando la pared',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_013',
    text: 'Yo nunca nunca he stalkiado la nueva pareja de mi ex con más dedicación que un detective',
    category: 'relaciones',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_014',
    text: 'Yo nunca nunca he leído mensajes ajenos en el teléfono de mi pareja sin permiso',
    category: 'relaciones',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_015',
    text: 'Yo nunca nunca he dicho "te amo" por miedo a perder a alguien y no porque lo sintiera',
    category: 'relaciones',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_016',
    text: 'Yo nunca nunca he mantenido un situationship porque definir asustaba más que sufrir',
    category: 'relaciones',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_017',
    text: 'Yo nunca nunca he tenido sexo en un lugar donde podíamos ser descubiertos en cualquier momento',
    category: 'picante',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_018',
    text: 'Yo nunca nunca he enviado nudes y luego entré en pánico de arrepentimiento',
    category: 'picante',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_019',
    text: 'Yo nunca nunca he tenido un dream sexual con alguien del grupo y me costó mirarlo al día siguiente',
    category: 'picante',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_020',
    text: 'Yo nunca nunca he mandado "estoy aburrido" a las 1 a.m. con intenciones nada aburridas',
    category: 'picante',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_021',
    text: 'Yo nunca nunca he mentido en algo tan grave que, si se supiera aquí, cambiaría cómo me miran',
    category: 'sin_filtro',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_022',
    text: 'Yo nunca nunca he traicionado la confianza de un amigo por un beneficio personal',
    category: 'sin_filtro',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_023',
    text: 'Yo nunca nunca he usado información íntima de alguien en mi contra en una pelea',
    category: 'sin_filtro',
    adult_only: true,
    active: true,
  },
  {
    id: 'FB_024',
    text: 'Yo nunca nunca he deseado el fracaso de alguien cercano por envidia pura',
    category: 'sin_filtro',
    adult_only: true,
    active: true,
  },
];

export function pickFallback(
  categories: string[],
  count: number,
  used: Set<string>,
): DbQuestion[] {
  const useAll = categories.includes('todas') || categories.length === 0;
  const adultOk = allowsAdult(categories);
  const pool = FALLBACK_QUESTIONS.filter((q) => {
    if (used.has(q.id)) return false;
    if (q.adult_only && !adultOk) return false;
    if (useAll) return !q.adult_only;
    return categories.includes(q.category);
  });
  let shuffled = [...pool].sort(() => Math.random() - 0.5);
  let picked = shuffled.slice(0, count);
  if (picked.length < count && !useAll) {
    const widen = FALLBACK_QUESTIONS.filter(
      (q) =>
        !used.has(q.id) &&
        !(q.adult_only && !adultOk) &&
        !picked.some((p) => p.id === q.id),
    );
    shuffled = [...widen].sort(() => Math.random() - 0.5);
    picked = [...picked, ...shuffled.slice(0, count - picked.length)];
  }
  return picked;
}
