import type { DbQuestion } from '@ynn/db';

/** In-memory fallback when Postgres is down (tests / offline demos). */
export const FALLBACK_QUESTIONS: DbQuestion[] = [
  {
    id: 'FB_001',
    text: 'Yo nunca nunca he mentido para no salir',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_002',
    text: 'Yo nunca nunca he stalkeado a mi ex',
    category: 'vergonzoso',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_003',
    text: 'Yo nunca nunca he enviado un mensaje a la persona equivocada',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_004',
    text: 'Yo nunca nunca he fingido estar ocupado',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_005',
    text: 'Yo nunca nunca he hecho algo vergonzoso estando borracho',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_006',
    text: 'Yo nunca nunca he mentido para salir de una cita',
    category: 'relaciones',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_007',
    text: 'Yo nunca nunca he dicho que ya casi llego estando lejos',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_008',
    text: 'Yo nunca nunca he cantado karaoke borracho',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_009',
    text: 'Yo nunca nunca he fingido no estar celoso',
    category: 'relaciones',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_010',
    text: 'Yo nunca nunca he caído en público',
    category: 'vergonzoso',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_011',
    text: 'Yo nunca nunca he reído en un momento serio',
    category: 'casual',
    adult_only: false,
    active: true,
  },
  {
    id: 'FB_012',
    text: 'Yo nunca nunca he dormido en un sofá ajeno',
    category: 'fiesta',
    adult_only: false,
    active: true,
  },
];

export function pickFallback(
  categories: string[],
  count: number,
  used: Set<string>,
): DbQuestion[] {
  const useAll = categories.includes('todas') || categories.length === 0;
  const pool = FALLBACK_QUESTIONS.filter((q) => {
    if (used.has(q.id)) return false;
    if (useAll) return true;
    return categories.includes(q.category);
  });
  let shuffled = [...pool].sort(() => Math.random() - 0.5);
  let picked = shuffled.slice(0, count);
  if (picked.length < count && !useAll) {
    const widen = FALLBACK_QUESTIONS.filter(
      (q) => !used.has(q.id) && !picked.some((p) => p.id === q.id),
    );
    shuffled = [...widen].sort(() => Math.random() - 0.5);
    picked = [...picked, ...shuffled.slice(0, count - picked.length)];
  }
  return picked;
}
