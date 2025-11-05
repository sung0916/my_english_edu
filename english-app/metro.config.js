const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
    
  isCSSEnabled: true,
});

config.resolver.sourceExts.unshift('mjs');

module.exports = config;
