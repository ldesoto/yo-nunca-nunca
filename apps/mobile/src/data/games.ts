import { LANG, type Locale } from '../i18n';
import gamesDataEn from './gamesData.en.json';
import gamesDataEs from './gamesData.json';
import gamesDataPt from './gamesData.pt.json';

export type GamesData = {
  mostLikely: string[];
  neverHaveIEver: string[];
  twoTruthsIdeas: string[];
  truthOrDrink: string[];
  charades: string[];
  bomb: string[];
};

const packs: Record<Locale, GamesData> = {
  en: gamesDataEn as GamesData,
  es: gamesDataEs as GamesData,
  pt: gamesDataPt as GamesData,
};

/** Local game prompts for the app locale (`LANG`); falls back to English. */
export function getGamesData(locale: Locale = LANG): GamesData {
  return packs[locale] ?? packs.en;
}

export const gamesData: GamesData = getGamesData();
