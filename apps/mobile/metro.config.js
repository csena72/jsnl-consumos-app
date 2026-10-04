const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite en web carga un binario WebAssembly.
config.resolver.assetExts.push('wasm');

// wa-sqlite necesita SharedArrayBuffer, que exige aislamiento de origen (cross-origin isolation).
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  middleware(req, res, next);
};

module.exports = config;
