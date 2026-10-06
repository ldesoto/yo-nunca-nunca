import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isOriginAllowed, parseAllowedOrigins } from './corsPolicy.js';

describe('corsPolicy', () => {
  it('parses ALLOWED_ORIGINS', () => {
    assert.deepEqual(parseAllowedOrigins(' https://a.com, ,https://b.com '), [
      'https://a.com',
      'https://b.com',
    ]);
    assert.deepEqual(parseAllowedOrigins(''), []);
  });

  it('allows missing Origin and Expo when allowlist is empty in production', () => {
    const env = { NODE_ENV: 'production' } as NodeJS.ProcessEnv;
    assert.equal(isOriginAllowed(undefined, env), true);
    assert.equal(isOriginAllowed('exp://192.168.1.2:8081', env), true);
    assert.equal(isOriginAllowed('http://localhost:8081', env), true);
    assert.equal(
      isOriginAllowed('https://yo-nunca-nunca.onrender.com', env),
      true,
    );
  });

  it('denies unknown origins in production without throwing', () => {
    const env = { NODE_ENV: 'production' } as NodeJS.ProcessEnv;
    assert.equal(isOriginAllowed('https://evil.example', env), false);
  });

  it('honors explicit ALLOWED_ORIGINS', () => {
    const env = {
      NODE_ENV: 'production',
      ALLOWED_ORIGINS: 'https://app.example',
    } as NodeJS.ProcessEnv;
    assert.equal(isOriginAllowed('https://app.example', env), true);
    // Explicit allowlist disables the empty-list localhost fallback.
    assert.equal(isOriginAllowed('http://localhost:8081', env), false);
  });
});
