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
      ignoreDependencies: [
        'body-parser',
        'openapi3-ts',
        'superagent',
        '@types/exceljs'
      ],
      entry: [
        'database/migrations/*.ts',
        'repositories/kysely.type.ts',
        'scripts/*',
        // FIXME EDI à supprimer
        'services/ediSacha/sachaDAI.ts',
        'services/ediSacha/sftpService.ts'
      ]
    },
    frontend: {
      ignoreDependencies: [
        'geojson',
        '@vitest/coverage-v8',
        //Pas normal, ce package n'est pas utilisé mais on utilise plusieurs packages de celui-ci
        'workbox-webpack-plugin',
        //Utilisé de façon indirecte par fetch-intercept
        'whatwg-fetch'
      ],
      ignore: [
        'src/serviceWorker.js',
        'src/components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModalDAOA.stories.old.tsx'
      ]
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
