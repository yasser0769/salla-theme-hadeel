export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          removeTitle: false,
          removeDesc: false,
          removeUnknownsAndDefaults: false,
        },
      },
    },
  ],
};
