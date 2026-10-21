import type { DbQuestion } from '@ynn/db';

const ADULT_CATEGORIES = new Set(['picante', 'sin_filtro']);

function allowsAdult(categories: string[]): boolean {
  if (categories.includes('todas') || categories.length === 0) return false;
  return categories.some((c) => ADULT_CATEGORIES.has(c));
}

function q(
  id: string,
  text: string,
  text_en: string,
  text_pt: string,
  category: string,
  adult_only: boolean,
): DbQuestion {
  return { id, text, text_en, text_pt, category, adult_only, active: true };
}

/** In-memory fallback when SQLite is empty / unavailable. */
export const FALLBACK_QUESTIONS: DbQuestion[] = [
  q(
    'FB_001',
    'Yo nunca nunca he inventado una emergencia familiar para salir de un plan que ya había confirmado',
    "Never have I ever faked a family emergency to bail on plans I'd already confirmed",
    'Eu nunca inventei uma emergência de família pra escapar de um plano que eu já tinha confirmado',
    'casual',
    false,
  ),
  q(
    'FB_002',
    'Yo nunca nunca he dejado en visto a propósito y luego fingido que se me acabó la batería',
    'Never have I ever left someone on read on purpose and then pretended my phone died',
    'Eu nunca deixei alguém no vácuo de propósito e depois fingi que a bateria acabou',
    'casual',
    false,
  ),
  q(
    'FB_003',
    'Yo nunca nunca he dicho "ya casi llego" estando todavía en pijama en la cama',
    'Never have I ever said "I\'m almost there" while still in pajamas in bed',
    'Eu nunca disse "já tô chegando" ainda de pijama na cama',
    'casual',
    false,
  ),
  q(
    'FB_004',
    'Yo nunca nunca he puesto cara de concentración en Zoom mientras compraba online en otra pestaña',
    'Never have I ever looked focused on Zoom while shopping online in another tab',
    'Eu nunca fiz cara de concentração no Zoom enquanto comprava online em outra aba',
    'casual',
    false,
  ),
  q(
    'FB_005',
    'Yo nunca nunca he tropezado en público y fingido que fue un baile improvisado',
    'Never have I ever tripped in public and pretended it was an improvised dance',
    'Eu nunca tropecei em público e fingi que foi uma dança improvisada',
    'vergonzoso',
    false,
  ),
  q(
    'FB_006',
    'Yo nunca nunca he mandado un mensaje al jefe pensando que era el grupo de amigos',
    'Never have I ever texted my boss thinking it was the friends group chat',
    'Eu nunca mandei mensagem pro chefe achando que era o grupo de amigos',
    'vergonzoso',
    false,
  ),
  q(
    'FB_007',
    'Yo nunca nunca he respondido "tú también" a un "feliz cumpleaños"',
    'Never have I ever replied "you too" to a "happy birthday"',
    'Eu nunca respondi "você também" a um "feliz aniversário"',
    'vergonzoso',
    false,
  ),
  q(
    'FB_008',
    'Yo nunca nunca he caído de una silla giratoria en una reunión Zoom con cámara prendida',
    'Never have I ever fallen off a rolling chair on a Zoom call with the camera on',
    'Eu nunca caí da cadeira giratória numa reunião de Zoom com a câmera ligada',
    'vergonzoso',
    false,
  ),
  q(
    'FB_009',
    'Yo nunca nunca he despertado en un sofá desconocido sin recordar cómo llegué',
    "Never have I ever woken up on a stranger's couch with no idea how I got there",
    'Eu nunca acordei num sofá desconhecido sem lembrar como cheguei',
    'fiesta',
    false,
  ),
  q(
    'FB_010',
    'Yo nunca nunca he hecho un shot de algo que no sabía qué era solo por no quedar mal',
    "Never have I ever taken a shot of something I couldn't identify just so I wouldn't look lame",
    'Eu nunca tomei um shot de algo que eu não sabia o que era só pra não ficar mal',
    'fiesta',
    false,
  ),
  q(
    'FB_011',
    'Yo nunca nunca he dicho "última ronda" al menos cuatro veces en la misma noche',
    'Never have I ever said "last round" at least four times in the same night',
    'Eu nunca disse "última rodada" pelo menos quatro vezes na mesma noite',
    'fiesta',
    false,
  ),
  q(
    'FB_012',
    'Yo nunca nunca he organizado una previa "chill" que terminó con vecinos golpeando la pared',
    'Never have I ever hosted a "chill" pregame that ended with neighbors banging on the wall',
    'Eu nunca organizei uma prévia "tranquila" que terminou com vizinhos batendo na parede',
    'fiesta',
    false,
  ),
  q(
    'FB_013',
    'Yo nunca nunca he stalkiado la nueva pareja de mi ex con más dedicación que un detective',
    "Never have I ever stalked my ex's new partner harder than a detective would",
    'Eu nunca stalkeei o novo crush do meu ex com mais dedicação que um detetive',
    'relaciones',
    false,
  ),
  q(
    'FB_014',
    'Yo nunca nunca he leído mensajes ajenos en el teléfono de mi pareja sin permiso',
    "Never have I ever read someone else's messages on my partner's phone without permission",
    'Eu nunca li mensagens alheias no celular do meu parceiro sem permissão',
    'relaciones',
    false,
  ),
  q(
    'FB_015',
    'Yo nunca nunca he dicho "te amo" por miedo a perder a alguien y no porque lo sintiera',
    'Never have I ever said "I love you" out of fear of losing someone, not because I meant it',
    'Eu nunca disse "eu te amo" com medo de perder alguém e não porque sentia',
    'relaciones',
    false,
  ),
  q(
    'FB_016',
    'Yo nunca nunca he mantenido un situationship porque definir asustaba más que sufrir',
    'Never have I ever stayed in a situationship because defining it scared me more than suffering',
    'Eu nunca mantive um situationship porque definir assustava mais do que sofrer',
    'relaciones',
    false,
  ),
  q(
    'FB_017',
    'Yo nunca nunca he tenido sexo en un lugar donde podíamos ser descubiertos en cualquier momento',
    'Never have I ever had sex somewhere we could get caught at any moment',
    'Eu nunca fiz sexo num lugar onde a gente podia ser descoberto a qualquer momento',
    'picante',
    true,
  ),
  q(
    'FB_018',
    'Yo nunca nunca he enviado nudes y luego entré en pánico de arrepentimiento',
    'Never have I ever sent nudes and then panicked with regret',
    'Eu nunca mandei nudes e depois entrei em pânico de arrependimento',
    'picante',
    true,
  ),
  q(
    'FB_019',
    'Yo nunca nunca he tenido un dream sexual con alguien del grupo y me costó mirarlo al día siguiente',
    'Never have I ever had a sex dream about someone in this group and struggled to look at them the next day',
    'Eu nunca tive um sonho erótico com alguém do grupo e fiquei sem jeito no dia seguinte',
    'picante',
    true,
  ),
  q(
    'FB_020',
    'Yo nunca nunca he mandado "estoy aburrido" a las 1 a.m. con intenciones nada aburridas',
    'Never have I ever texted "I\'m bored" at 1 a.m. with anything but boring intentions',
    'Eu nunca mandei "tô entediado" à 1 da manhã com intenções nada chatas',
    'picante',
    true,
  ),
  q(
    'FB_021',
    'Yo nunca nunca he mentido en algo tan grave que, si se supiera aquí, cambiaría cómo me miran',
    'Never have I ever lied about something so serious that if people here knew, it would change how they see me',
    'Eu nunca menti algo tão grave que, se soubessem aqui, mudaria como me olham',
    'sin_filtro',
    true,
  ),
  q(
    'FB_022',
    'Yo nunca nunca he traicionado la confianza de un amigo por un beneficio personal',
    "Never have I ever betrayed a friend's trust for personal gain",
    'Eu nunca traí a confiança de um amigo por benefício pessoal',
    'sin_filtro',
    true,
  ),
  q(
    'FB_023',
    'Yo nunca nunca he usado información íntima de alguien en mi contra en una pelea',
    "Never have I ever used someone's intimate information against them in a fight",
    'Eu nunca usei informação íntima de alguém contra essa pessoa numa briga',
    'sin_filtro',
    true,
  ),
  q(
    'FB_024',
    'Yo nunca nunca he deseado el fracaso de alguien cercano por envidia pura',
    "Never have I ever wished for someone close to fail out of pure envy",
    'Eu nunca desejei o fracasso de alguém próximo por pura inveja',
    'sin_filtro',
    true,
  ),
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
      (item) =>
        !used.has(item.id) &&
        !(item.adult_only && !adultOk) &&
        !picked.some((p) => p.id === item.id),
    );
    shuffled = [...widen].sort(() => Math.random() - 0.5);
    picked = [...picked, ...shuffled.slice(0, count - picked.length)];
  }
  return picked;
}
