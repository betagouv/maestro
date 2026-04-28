import 'maestro-shared/utils/zodConfig';
import { departmentsSeed } from './database/seeds/departments/departmentsSeed';
import { initKnex } from './repositories/db';
import { initKysely } from './repositories/kysely';
import { createServer } from './server';
import { initGpgForSacha } from './services/gpgService';
import { tryToFixResiduesWithUnknownLabel } from './services/imapService/tryToFixUnknownLabels';
import config from './utils/config';

initKnex();
initKysely(config.databaseUrl);
createServer().start();
await tryToFixResiduesWithUnknownLabel();
await initGpgForSacha();
if (config.environment === 'production') {
  await departmentsSeed(true);
}

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT...');
  process.exit();
});
