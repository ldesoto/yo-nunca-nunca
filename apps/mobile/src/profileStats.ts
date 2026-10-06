import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ynn.profile.v1';

export type PlayerProfile = {
  name: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  yesAnswers: number;
  /** Premium / avanzada */
  majorityCount: number;
  minorityCount: number;
  totalScore: number;
  bestScore: number;
  winStreak: number;
  bestStreak: number;
  answersTotal: number;
};

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Jugador',
  avatar: '🦊',
  gamesPlayed: 0,
  gamesWon: 0,
  yesAnswers: 0,
  majorityCount: 0,
  minorityCount: 0,
  totalScore: 0,
  bestScore: 0,
  winStreak: 0,
  bestStreak: 0,
  answersTotal: 0,
};

export async function loadProfile(): Promise<PlayerProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function recordGameResult(input: {
  name: string;
  won: boolean;
  yesCount: number;
  majorityCount: number;
  minorityCount: number;
  score: number;
}): Promise<PlayerProfile> {
  const profile = await loadProfile();
  profile.name = input.name || profile.name;
  profile.gamesPlayed += 1;
  if (input.won) {
    profile.gamesWon += 1;
    profile.winStreak += 1;
    profile.bestStreak = Math.max(profile.bestStreak, profile.winStreak);
  } else {
    profile.winStreak = 0;
  }
  profile.yesAnswers += input.yesCount;
  profile.majorityCount += input.majorityCount;
  profile.minorityCount += input.minorityCount;
  profile.totalScore += input.score;
  profile.bestScore = Math.max(profile.bestScore, input.score);
  profile.answersTotal += input.yesCount + Math.max(0, input.majorityCount + input.minorityCount);
  // answersTotal better: use yes + (rounds approximated). Keep additive from yes + maj + min as proxy.
  await saveProfile(profile);
  return profile;
}

export function yesRate(profile: PlayerProfile): number {
  const denom = Math.max(1, profile.yesAnswers + Math.max(0, profile.gamesPlayed * 4));
  // Prefer majority+minority+yes as rough answer volume when available
  const volume = Math.max(
    profile.yesAnswers + profile.majorityCount + profile.minorityCount,
    denom,
  );
  return Math.round((profile.yesAnswers / volume) * 100);
}
