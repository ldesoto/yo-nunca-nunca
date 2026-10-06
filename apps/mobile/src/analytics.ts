import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalyticsEventName, AnalyticsProps } from '@ynn/shared';

const RING_KEY = 'ynn.analytics.ring.v1';
const RING_MAX = 40;

type RingEntry = {
  name: AnalyticsEventName;
  props?: AnalyticsProps;
  at: number;
};

type Sink = (name: AnalyticsEventName, props?: AnalyticsProps) => void;

let sink: Sink = (name, props) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, props ?? {});
  }
};

export function setAnalyticsSink(next: Sink) {
  sink = next;
}

async function pushRing(entry: RingEntry) {
  try {
    const raw = await AsyncStorage.getItem(RING_KEY);
    const list: RingEntry[] = raw ? (JSON.parse(raw) as RingEntry[]) : [];
    list.unshift(entry);
    await AsyncStorage.setItem(RING_KEY, JSON.stringify(list.slice(0, RING_MAX)));
  } catch {
    // ignore storage errors
  }
}

/** Emite evento sin asociar respuestas personales a identidad. */
export function track(name: AnalyticsEventName, props?: AnalyticsProps) {
  const safe = scrub(props);
  sink(name, safe);
  void pushRing({ name, props: safe, at: Date.now() });
}

function scrub(props?: AnalyticsProps): AnalyticsProps | undefined {
  if (!props) return undefined;
  const out: AnalyticsProps = {};
  for (const [k, v] of Object.entries(props)) {
    const key = k.toLowerCase();
    if (
      key.includes('answer') ||
      key.includes('choice') ||
      key.includes('text') ||
      key.includes('name')
    ) {
      continue;
    }
    out[k] = v;
  }
  return out;
}

export async function getRecentAnalytics(limit = 12): Promise<RingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(RING_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RingEntry[];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}
