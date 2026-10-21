export const SELF_PACKAGE = 'com.yonnunca.party';

export const STORE_URL = `https://play.google.com/store/apps/details?id=${SELF_PACKAGE}`;

export type OdinGame = { id: string; packageName: string };

export const ODIN_GAMES: OdinGame[] = [
  { id: 'escondite', packageName: 'com.odinforge.escondite' },
  { id: 'pintaymiente', packageName: 'com.odinforge.pintaymiente' },
  { id: 'sofa', packageName: 'com.odinforge.sofa' },
  { id: 'dominord', packageName: 'com.luisdesoto.dominord' },
  { id: 'party', packageName: 'com.yonnunca.party' },
];

export const OTHER_GAMES = ODIN_GAMES.filter((g) => g.packageName !== SELF_PACKAGE);

export const REVIEW_MIN_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;
export const REVIEW_MIN_SESSIONS = 2;
