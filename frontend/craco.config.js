const { CracoAliasPlugin } = require('react-app-alias-ex');
const { CracoAliasPluginWrapper } = require('./test/CracoAliasPluginWrapper');

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPluginWrapper,
      options: {},
    },
  ],
  jest: {
    configure(config) {
      config.rootDir = '.';
      config.setupFilesAfterEnv = ['<rootDir>/src/setupTests.ts'];
      config.transformIgnorePatterns = [
        '<rootDir>/node_modules/(?!@codegouvfr)/.+\\.js$',
      ];
      return config;
    },
  },
};
