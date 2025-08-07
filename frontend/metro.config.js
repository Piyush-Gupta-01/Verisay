// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package.json exports field resolution to fix incompatibility with ws
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
