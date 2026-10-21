/** Configuración legal centralizada (no hardcodear en pantallas). */
export const LEGAL_BASE_URL = 'https://ldesoto.github.io/capicua-privacy';
export const APP_SLUG = 'yo-nunca-nunca';
export const APP_NAME = 'El Coro · Yo Nunca Nunca';
export const CONTACT_EMAIL = 'luismanuelj27@gmail.com';
export const MIN_AGE = 18;
export const AGE_KEY = 'ynn.age_ok.v1';
export type LegalDoc = 'privacidad' | 'terminos' | 'cookies';
export const legalUrl = (doc: LegalDoc) => `${LEGAL_BASE_URL}/${APP_SLUG}/${doc}`;
