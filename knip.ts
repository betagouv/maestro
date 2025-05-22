export default {
  entry: [
    'server/database/migrations/*.ts',
    'server/repositories/kysely.type.ts',
    'frontend/src/index.tsx',
    'frontend/src/serviceWorker.js'
  ],
  ignore: ['types/**/*.d.ts'],
  ignoreBinaries: ['playwright', 'concurrently', 'magenta,blue']
};
