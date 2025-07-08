import { initKnex } from './repositories/db';
import { initKysely } from './repositories/kysely';
import { createServer } from './server';
import { tryToFixResiduesWithUnknownLabel } from './services/imapService/tryToFixUnknownLabels';
import config from './utils/config';

initKnex();
initKysely(config.databaseUrl);
createServer().start();
await tryToFixResiduesWithUnknownLabel();

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  process.exit();
});
