module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // 'import.meta' 문제 해결을 위한 핵심 옵션은 남겨둡니다.
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [],
  };
};
