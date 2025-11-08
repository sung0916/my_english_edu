// 웹팩이 ES 모듈 문법 (import.meta 포함)을 더 잘 이해하고 처리하도록

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {

    const config = await createExpoWebpackConfigAsync(env, argv);

    // ESM 관련 설정('import.meta'를 사용하려면 실험적인 기능 활성화 필요할 수 있음)
    config.experiments = {

        ...config.experiments,
        topLevelAwait: true,  // topLevelAwait도 함께 사용하는 경우가 많아 추가
    };

    // 특정 라이브러리가 CommonJS가 아닌 ES 모듈로만 제공될 때,
    // WebPack이 이를 올바르게 처리하도록 설정
    config.module.rules.push({

        test: /\.m?js$/,
        resolve: {
            fullySpecified: false,  // 파일 확장자 없이 import할 수 있도록 허용
        },
    });

    // ✅ 개발 환경(HMR)일 때만 React Refresh 활성화
    if (env.mode === 'development' || argv.mode === 'development') {
        config.plugins.push(new ReactRefreshWebpackPlugin());

        // babel-loader에 react-refresh 추가 (핵심!)
        const babelLoaderRule = config.module.rules.find(
            (rule) => rule.use && rule.use.loader && rule.use.loader.includes('babel-loader')
        );
        if (babelLoaderRule) {
            babelLoaderRule.use.options.plugins = [
                ...(babelLoaderRule.use.options.plugins || []),
                require.resolve('react-refresh/babel'),
            ];
        }
    }

    return config;
}
