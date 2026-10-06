import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ynn.settings.v1';

export type AppSettings = {
  music: boolean;
  sfx: boolean;
  haptics: boolean;
};

const DEFAULT: AppSettings = {
  music: true,
  sfx: true,
  haptics: true,
};

let cached: AppSettings = { ...DEFAULT };
const listeners = new Set<(s: AppSettings) => void>();

export function getSettings(): AppSettings {
  return cached;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      cached = {
        music: typeof parsed.music === 'boolean' ? parsed.music : DEFAULT.music,
        sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : DEFAULT.sfx,
        haptics: typeof parsed.haptics === 'boolean' ? parsed.haptics : DEFAULT.haptics,
      };
    }
  } catch {
    cached = { ...DEFAULT };
  }
  return cached;
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  cached = { ...cached, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(cached));
  for (const l of listeners) l(cached);
  return cached;
}

export function subscribeSettings(fn: (s: AppSettings) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
