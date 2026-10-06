/** Eventos de analytics acordados (§22). Sin payloads de respuesta personal. */

export const ANALYTICS_EVENTS = [
  'game_created',
  'game_joined',
  'game_started',
  'question_displayed',
  'answer_submitted',
  'question_revealed',
  'player_disconnected',
  'player_reconnected',
  'game_completed',
  'category_selected',
  'custom_question_created',
  'question_reported',
  'premium_unlocked',
  'premium_gate_hit',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/** Props permitidas: ids opacos, conteos, flags — nunca choice/texto de respuesta. */
export type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;
