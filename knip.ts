export default {
  ignore: ['types/**/*.d.ts'],
  ignoreDependencies: ['vite', '@faker-js/faker'],
  workspaces: {
    '.': {
      ignoreBinaries: ['concurrently', 'magenta,blue', 'playwright']
    },
    server: {
      ignoreDependencies: ['body-parser', 'openapi3-ts', 'superagent'],
      entry: ['database/migrations/*.ts', 'repositories/kysely.type.ts']
    },
    frontend: {
      ignoreDependencies: ['geojson'],
      entry: ['src/index.tsx'],
      ignore: ['src/serviceWorker.js']
    }
  }
};
