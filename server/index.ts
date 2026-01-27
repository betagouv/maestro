import { initKnex } from './repositories/db';
import { initKysely } from './repositories/kysely';
import { createServer } from './server';
import { initSampleSpecificDataAttributes } from './services/ediSacha/specificSampleDataService';
import { initGpgForSacha } from './services/gpgService';
import { tryToFixResiduesWithUnknownLabel } from './services/imapService/tryToFixUnknownLabels';
import { createConsumer } from './services/kafkaService';
import config from './utils/config';

initKnex();
initKysely(config.databaseUrl);
createServer().start();
await tryToFixResiduesWithUnknownLabel();
await initGpgForSacha();
await initSampleSpecificDataAttributes();

const consumer = await createConsumer();

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT...');
  if (consumer) {
    consumer.disconnect().then(() => process.exit());
  } else {
    process.exit();
  }
});
