import { getSettings, subscribeSettings } from './settingsStore';

export type SfxName =
  | 'tap'
  | 'yes'
  | 'never'
  | 'reveal'
  | 'who'
  | 'win'
  | 'alert'
  | 'lobby';

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
  lobby: require('../assets/sfx/lobby.wav'),
};

type ExpoAudio = typeof import('expo-audio');

let musicEnabled = true;
let sfxEnabled = true;
let modeReady = false;
let nativeUnavailable = false;
let audioMod: ExpoAudio | null = null;
let audioLoad: Promise<ExpoAudio | null> | null = null;
let bedPlayer: AudioPlayer | null = null;
let bedStarting = false;

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

function waitForLoad(player: AudioPlayer, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (player.isLoaded || Date.now() - start >= timeoutMs) {
        resolve();
        return;
      }
      setTimeout(tick, 40);
    };
    tick();
  });
}

export async function initAudio(): Promise<void> {
  const s = getSettings();
  musicEnabled = s.music;
  sfxEnabled = s.sfx;
  subscribeSettings((next) => {
    musicEnabled = next.music;
    sfxEnabled = next.sfx;
    if (next.music) void playBed();
    else void stopBed();
  });
  // No bloquear el boot: el nativo se prueba en background.
  void ensureAudioMode();
}

export async function playSfx(name: SfxName): Promise<void> {
  if (!sfxEnabled && name !== 'lobby') return;
  if (name === 'lobby' && !musicEnabled) return;
  if (!(await ensureAudioMode())) return;
  const mod = await loadExpoAudio();
  if (!mod) return;

  try {
    const player = mod.createAudioPlayer(SOURCES[name]);
    player.volume = name === 'lobby' ? 0.35 : 0.72;
    player.play();
    releaseLater(player, name === 'win' ? 1200 : name === 'reveal' ? 900 : 450);
  } catch {
    nativeUnavailable = true;
  }
}

export async function playBed(): Promise<void> {
  if (!musicEnabled || bedStarting) return;
  if (bedPlayer?.playing) return;
  if (!(await ensureAudioMode())) return;
  const mod = await loadExpoAudio();
  if (!mod) return;

  bedStarting = true;
  try {
    if (bedPlayer) {
      bedPlayer.play();
      return;
    }
    const player = mod.createAudioPlayer(SOURCES.lobby);
    bedPlayer = player;
    player.loop = true;
    player.volume = 0.55;
    await waitForLoad(player);
    player.play();
  } catch {
    nativeUnavailable = true;
    bedPlayer = null;
  } finally {
    bedStarting = false;
  }
}

export async function stopBed(): Promise<void> {
  if (!bedPlayer) return;
  try {
    bedPlayer.pause();
    bedPlayer.remove();
  } catch {
    // ignore
  }
  bedPlayer = null;
}

export function isAudioNativeAvailable(): boolean {
  return !nativeUnavailable;
}
