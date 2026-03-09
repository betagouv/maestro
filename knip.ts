export default {
  ignore: ['types/**/*.d.ts'],
  ignoreDependencies: [
    'vite',
    '@faker-js/faker',
    '@swc-node/register',
    '@swc/core',
    '@gouvfr/dsfr',
    'lint-staged'
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
      ignoreDependencies: [
        'geojson',
        '@vitest/coverage-v8'
      ],
      ignore: ['src/serviceWorker.js']
    },
    shared: {
      entry: [
        //Ces fichiers sont utilisés que par le front, donc d'après Knip ils ne sont pas utilisés dans shared
        'referential/Matrix/MatrixListByKind.ts',
        'schema/Address/AddressSearchResult.ts',
        'schema/Prescription/PrescriptionComments.ts',
        'test/regionalPrescriptionCommentFixture.ts'
      ]
    }
  }
};
