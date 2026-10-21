import type { KnipConfig } from 'knip';

export default {
  ignore: ['types/**/*.d.ts'],
  ignoreDependencies: ['@gouvfr/dsfr'],
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
} satisfies KnipConfig;
