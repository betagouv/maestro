export default {
  ignore: ['types/**/*.d.ts'],
  ignoreDependencies: ['vite', '@gouvfr/dsfr'],
  ignoreBinaries: ['playwright', 'semantic-release'],
  workspaces: {
    '.': {
      entry: ['.github/semanticReleaseTchap.mjs']
    },
    server: {
      ignoreDependencies: ['body-parser', 'superagent'],
      knex: false,
      entry: [
        'database/migrations/*.ts',
        'repositories/kysely.type.ts',
        'scripts/*',
        'services/ediSacha/sftpService.ts'
      ]
    },
    frontend: {
      ignoreDependencies: ['geojson'],
      ignore: ['src/serviceWorker.js']
    },
    shared: {}
  }
};
