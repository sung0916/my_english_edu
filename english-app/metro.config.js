const { getDefaultConfig } = require('expo/metro-config');

// Expo의 기본 Metro 설정을 가져옵니다.
const config = getDefaultConfig(__dirname);

// --- GitHub에서 찾으신 바로 그 마법의 코드입니다 ---
// 1. unstable_enablePackageExports 옵션을 활성화합니다.(충돌을 일으켜서 주석 처리)
//config.resolver.unstable_enablePackageExports = true;

// 2. mjs 확장자를 최우선으로 처리하도록 추가합니다.
config.resolver.sourceExts.unshift('mjs');
// ------------------------------------------------

module.exports = config;