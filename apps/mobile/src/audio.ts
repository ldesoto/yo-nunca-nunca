import { getSettings, subscribeSettings } from './settingsStore';

export type SfxName =
  | 'tap'
  | 'yes'
  | 'never'
  | 'reveal'
  | 'who'
  | 'win'
  | 'alert';

/** Subset tipado local — evita import estático de expo-audio (crash Expo Go). */
type AudioPlayer = {
  volume: number;
  loop: boolean;
  playing: boolean;
  isLoaded: boolean;
  play: () => void;
  pause: () => void;
  remove: () => void;
};

const SOURCES: Record<SfxName, number> = {
  tap: require('../assets/sfx/tap.wav'),
  yes: require('../assets/sfx/yes.wav'),
  never: require('../assets/sfx/never.wav'),
  reveal: require('../assets/sfx/reveal.wav'),
  who: require('../assets/sfx/who.wav'),
  win: require('../assets/sfx/win.wav'),
  alert: require('../assets/sfx/alert.wav'),
};

type ExpoAudio = typeof import('expo-audio');

let sfxEnabled = true;
let modeReady = false;
let nativeUnavailable = false;
let audioMod: ExpoAudio | null = null;
let audioLoad: Promise<ExpoAudio | null> | null = null;

/** Lazy-load: un `import` estático de expo-audio ejecuta requireNativeModule al boot y tumba Expo Go si el nativo no está. */
async function loadExpoAudio(): Promise<ExpoAudio | null> {
  if (nativeUnavailable) return null;
  if (audioMod) return audioMod;
  if (!audioLoad) {
    audioLoad = import('expo-audio')
      .then((mod) => {
        audioMod = mod;
        return mod;
      })
      .catch(() => {
        nativeUnavailable = true;
        return null;
      });
  }
  return audioLoad;
}

async function ensureAudioMode(): Promise<boolean> {
  if (nativeUnavailable) return false;
  if (modeReady) return true;
  const mod = await loadExpoAudio();
  if (!mod) return false;
  try {
    await mod.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    modeReady = true;
    return true;
  } catch {
    nativeUnavailable = true;
    return false;
  }
}

function releaseLater(player: AudioPlayer, ms: number) {
  setTimeout(() => {
    try {
      player.remove();
    } catch {
      // ignore
    }
  }, ms);
}

export async function initAudio(): Promise<void> {
  const s = getSettings();
  sfxEnabled = s.sfx;
  subscribeSettings((next) => {
    sfxEnabled = next.sfx;
    // Nunca tocar expo-audio aquí: requireNativeModule puede tumbar el proceso
    // (el .catch de JS no atrapa crash nativo). Solo al reproducir.
  });
  // Boot sin cargar módulo nativo. playSfx lo hará bajo demanda.
}

export async function playSfx(name: SfxName): Promise<void> {
  if (!sfxEnabled) return;
  if (!(await ensureAudioMode())) return;
  const mod = await loadExpoAudio();
  if (!mod) return;

  try {
    const player = mod.createAudioPlayer(SOURCES[name]);
    player.volume = 0.72;
    player.play();
    releaseLater(player, name === 'win' ? 1200 : name === 'reveal' ? 900 : 450);
  } catch {
    nativeUnavailable = true;
  }
}

export function isAudioNativeAvailable(): boolean {
  return !nativeUnavailable;
}
