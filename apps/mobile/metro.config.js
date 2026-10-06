const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const bundledHttpie = path.resolve(projectRoot, 'metro.stubs/httpie-fetch/index.mjs');
const wsStub = path.resolve(projectRoot, 'metro.stubs/ws.js');
const emptyStub = path.resolve(projectRoot, 'metro.stubs/empty.js');

function findHttpieFetch() {
  if (fs.existsSync(bundledHttpie)) return bundledHttpie;
  const candidates = [
    path.resolve(workspaceRoot, 'node_modules/@colyseus/httpie/fetch/index.mjs'),
    path.resolve(projectRoot, 'node_modules/@colyseus/httpie/fetch/index.mjs'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
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
  // Last resort: empty stub so Metro still boots (network will fail at runtime).
  return emptyStub;
}

const httpieFetch = findHttpieFetch();

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'import',
];

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === '@colyseus/httpie' ||
    moduleName === '@colyseus/httpie/node' ||
    moduleName === '@colyseus/httpie/node/index.mjs' ||
    moduleName.startsWith('@colyseus/httpie/')
  ) {
    return { type: 'sourceFile', filePath: httpieFetch };
  }

  if (moduleName === 'ws' && platform !== 'web') {
    return { type: 'sourceFile', filePath: wsStub };
  }

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
