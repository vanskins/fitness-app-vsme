module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Note: babel-preset-expo auto-adds the react-native-worklets plugin
    // (reanimated 4) when installed, so it must NOT be listed manually.
  };
};
