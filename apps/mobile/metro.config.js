const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

function findHttpieFetch() {
  const candidates = [
    path.resolve(
      workspaceRoot,
      'node_modules/.pnpm/@colyseus+httpie@2.0.1/node_modules/@colyseus/httpie/fetch/index.mjs',
    ),
    path.resolve(workspaceRoot, 'node_modules/@colyseus/httpie/fetch/index.mjs'),
    path.resolve(projectRoot, 'node_modules/@colyseus/httpie/fetch/index.mjs'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  // last resort: search under pnpm store for this workspace
  const pnpm = path.resolve(workspaceRoot, 'node_modules/.pnpm');
  if (fs.existsSync(pnpm)) {
    for (const dir of fs.readdirSync(pnpm)) {
      if (!dir.startsWith('@colyseus+httpie@')) continue;
      const hit = path.join(
        pnpm,
        dir,
        'node_modules/@colyseus/httpie/fetch/index.mjs',
      );
      if (fs.existsSync(hit)) return hit;
    }
  }
  throw new Error('Could not locate @colyseus/httpie/fetch for Metro alias');
}

const httpieFetch = findHttpieFetch();
const wsStub = path.resolve(projectRoot, 'metro.stubs/ws.js');
const emptyStub = path.resolve(projectRoot, 'metro.stubs/empty.js');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;

// Prefer browser/RN package conditions over Node "import" → httpie/node.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'import',
];

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force browser/fetch httpie — Node build pulls `https` and crashes on Android/iOS.
  if (
    moduleName === '@colyseus/httpie' ||
    moduleName === '@colyseus/httpie/node' ||
    moduleName === '@colyseus/httpie/node/index.mjs' ||
    moduleName.startsWith('@colyseus/httpie/')
  ) {
    return { type: 'sourceFile', filePath: httpieFetch };
  }

  // colyseus.js ESM imports Node `ws`; RN uses globalThis.WebSocket.
  if (moduleName === 'ws' && platform !== 'web') {
    return { type: 'sourceFile', filePath: wsStub };
  }

  // Hard stubs if anything still asks for Node builtins.
  if (
    platform !== 'web' &&
    (moduleName === 'https' ||
      moduleName === 'http' ||
      moduleName === 'net' ||
      moduleName === 'tls' ||
      moduleName === 'stream' ||
      moduleName === 'url' ||
      moduleName === 'zlib' ||
      moduleName === 'crypto')
  ) {
    return { type: 'sourceFile', filePath: emptyStub };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
