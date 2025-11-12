const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// workspaceRoot는 watchFolders에만 사용하고, 모듈 해석에는 사용하지 않습니다.
const workspaceRoot = path.resolve(__dirname, '..'); 

const config = getDefaultConfig(projectRoot);

// 1. 코드 감시 폴더는 유지 (모노레포 내 다른 코드 변경 감지를 위해)
//    만약 english-app 외부의 코드를 참조하지 않는다면 이 줄도 삭제 가능합니다.
config.watchFolders = [workspaceRoot];

// 2. 모듈 검색 경로에서 상위 폴더 제거 (가장 중요한 부분)
//    오직 현재 프로젝트의 node_modules만 보도록 명시합니다.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. 상위 폴더로의 검색을 차단
//    Metro가 다른 위치에서 node_modules를 찾는 것을 막아줍니다.
config.resolver.disableHierarchicalLookup = true;

// 4. 원래의 'import.meta' 에러 해결을 위한 설정은 유지
config.resolver.unstable_conditionNames = ['require', 'import', 'browser', 'module', 'node'];
config.resolver.unstable_enablePackageExports = true;

config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(expo|@expo|react-native|@react-native|@react-navigation|zustand)/)',
];

const sourceExts = config.resolver.sourceExts;
if (!sourceExts.includes('mjs')) {
    config.resolver.sourceExts = [...sourceExts, 'mjs', 'cjs'];
}

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

module.exports = config;
