export default {
  ignore: ['types/**/*.d.ts'],
  ignoreDependencies: [
    'vite',
    '@swc-node/register',
    '@swc/core',
    '@gouvfr/dsfr'
  ],
  ignoreBinaries: ['playwright', 'semantic-release'],
  workspaces: {
    server: {
      ignoreDependencies: ['body-parser', 'superagent', '@types/exceljs'],
      knex: false,
      entry: [
        'database/migrations/*.ts',
        'repositories/kysely.type.ts',
        'scripts/*',
        'services/ediSacha/sftpService.ts'
      ]
    },
    frontend: {
      ignoreDependencies: ['geojson', '@vitest/coverage-v8'],
      ignore: ['src/serviceWorker.js']
    },
    shared: {}
  }
};
