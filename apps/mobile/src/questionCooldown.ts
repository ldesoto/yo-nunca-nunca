import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ynn.questionCooldown.v1';
export const QUESTION_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 horas

type PackHistory = Record<string, number>; // question text → lastShownAt
type Store = Record<string, PackHistory>;

let cache: Store | null = null;
let loadPromise: Promise<Store> | null = null;

async function readStore(): Promise<Store> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        cache = raw ? (JSON.parse(raw) as Store) : {};
      } catch {
        cache = {};
      }
      return cache!;
    })();
  }
  return loadPromise;
}

async function writeStore(next: Store): Promise<void> {
  cache = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

function prunePack(history: PackHistory, now: number): PackHistory {
  const cut = now - QUESTION_COOLDOWN_MS;
  const out: PackHistory = {};
  for (const [text, at] of Object.entries(history)) {
    if (at >= cut) out[text] = at;
  }
  return out;
}

/** Preguntas no vistas en las últimas 2h. Vacío si todo el pack está en cooldown. */
export async function filterAvailable(
  packId: string,
  pool: string[],
  now = Date.now(),
): Promise<string[]> {
  const store = await readStore();
  const history = prunePack(store[packId] ?? {}, now);
  if (Object.keys(history).length !== Object.keys(store[packId] ?? {}).length) {
    await writeStore({ ...store, [packId]: history });
  }
  return pool.filter((q) => history[q] == null);
}

export async function markShown(
  packId: string,
  question: string,
  now = Date.now(),
): Promise<void> {
  const store = await readStore();
  const history = prunePack(store[packId] ?? {}, now);
  history[question] = now;
  await writeStore({ ...store, [packId]: history });
}
