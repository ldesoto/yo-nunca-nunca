import { Platform, type TextStyle } from 'react-native';
export {
  SERVER_HTTP,
  SERVER_WS,
  APP_ENV,
  assertStoreSafeEndpoints,
  DEFAULT_PUBLIC_HTTP,
} from './config';
export { getServerHttp, getServerWs, getBakedServerHttp } from './serverEndpoints';

export const colors = {
  bg0: '#07040F',
  bg1: '#14082A',
  bg2: '#2A1055',
  neonPink: '#FF2D95',
  neonPinkSoft: 'rgba(255,45,149,0.28)',
  neonCyan: '#2DE2E6',
  neonCyanSoft: 'rgba(45,226,230,0.22)',
  neonLime: '#C8FF4D',
  neonOrange: '#FF8A3D',
  card: 'rgba(255,255,255,0.07)',
  cardStrong: 'rgba(255,255,255,0.12)',
  stroke: 'rgba(255,255,255,0.14)',
  strokeHot: 'rgba(255,45,149,0.55)',
  text: '#FBF7FF',
  muted: 'rgba(251,247,255,0.62)',
  danger: '#FF5A7A',
  yes: '#C8FF4D',
  never: '#8B6CFF',
  shadow: '#000000',
};

export const fonts = {
  display: Platform.select({
    web: 'Outfit, system-ui, sans-serif',
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }) as string,
  body: Platform.select({
    web: 'Outfit, system-ui, sans-serif',
    default: 'System',
  }) as string,
};

export const typography = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 54,
    color: '#FFFFFF',
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.text,
  } satisfies TextStyle,
  kicker: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3.2,
    color: colors.neonCyan,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: colors.muted,
  } satisfies TextStyle,
};

export const CATEGORY_META = [
  { id: 'todas', label: 'Todas', emoji: '🎲', tint: colors.neonCyan },
  { id: 'casual', label: 'Casual', emoji: '😇', tint: '#7CFFB2' },
  { id: 'vergonzoso', label: 'Vergonzoso', emoji: '😂', tint: colors.neonOrange },
  { id: 'fiesta', label: 'Fiesta', emoji: '🍻', tint: colors.neonPink },
  { id: 'relaciones', label: 'Relaciones', emoji: '❤️', tint: '#FF6B9D' },
  { id: 'picante', label: 'Picante', emoji: '🔥', tint: '#FF4D4D' },
  { id: 'sin_filtro', label: 'Sin filtro', emoji: '☠️', tint: '#B388FF' },
] as const;

export type CategoryId = (typeof CATEGORY_META)[number]['id'];
