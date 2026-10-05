const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length = 5, random = Math.random): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[Math.floor(random() * ALPHABET.length)]!;
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{5}$/.test(code.trim().toUpperCase());
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
}
