const RETRYABLE_HTTP = new Set([502, 503, 504, 520, 521, 522, 524]);

export class RenderWakeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderWakeError';
  }
}

export function isRetryableError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  const msg = err instanceof Error ? err.message : String(err);
  if (/network|fetch|timeout|ECONN|socket|failed/i.test(msg)) return true;
  if (/502|503|504|520|522|524/.test(msg)) return true;
  return false;
}

export function isRetryableHttpStatus(status: number): boolean {
  return RETRYABLE_HTTP.has(status) || status === 0;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/** Backoff for Render free-tier cold start (~60s). */
export async function withRenderColdStartRetry<T>(
  label: string,
  fn: () => Promise<T>,
  onProgress?: (message: string) => void,
): Promise<T> {
  const delays = [0, 2_000, 4_000, 8_000, 12_000, 15_000, 15_000, 15_000];
  let last: unknown;
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);
    if (attempt > 0) {
      onProgress?.('Despertando servidor…');
    }
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!isRetryableError(e)) throw e;
    }
  }
  throw new RenderWakeError(
    `No se pudo ${label} tras esperar al servidor. Prueba de nuevo en un momento.`,
  );
}
