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
  ignoreBinaries: ['playwright'],
  workspaces: {
    server: {
      ignoreDependencies: [
        'body-parser',
        'openapi3-ts',
        'superagent',
        '@types/exceljs'
      ],
      entry: ['database/migrations/*.ts', 'repositories/kysely.type.ts']
    },
    frontend: {
      ignoreDependencies: [
        'geojson',
        'playwright',
        '@vitest/coverage-v8',
        //Pas normal, ce package n'est pas utilisé mais on utilise plusieurs packages de celui-ci
        'workbox-webpack-plugin',
        //Utilisé de façon indirecte par fetch-intercept
        'whatwg-fetch'
      ],
      ignore: ['src/serviceWorker.js']
    },
    shared: {
      ignore: [
        //Je ne comprends pas le problème avec ces fichiers
        'referential/Matrix/MatrixListByKind.ts',
        'schema/Address/AddressSearchResult.ts',
        'schema/Prescription/PrescriptionComments.ts',
        'test/regionalPrescriptionCommentFixture.ts'
      ]
    }
  }
};
