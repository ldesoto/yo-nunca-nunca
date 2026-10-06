/**
 * React Native / Expo already expose globalThis.WebSocket.
 * colyseus.js ESM still imports Node's `ws`; stub it so Metro does not pull `stream`.
 */
module.exports = undefined;
