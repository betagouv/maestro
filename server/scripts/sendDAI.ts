import { initKnex } from '../repositories/db';
import { initKysely } from '../repositories/kysely';
import { analysisDaiProcessor } from '../services/analysisDaiProcessor';
import config from '../utils/config';

const sendDAI = async () => {
  initKnex();
  initKysely(config.databaseUrl);

  console.info('[analysisDaiProcessor] cycle started.');
  try {
    await analysisDaiProcessor.processPending();
  } catch (err) {
    console.error('[analysisDaiProcessor] cycle failed:', err);
  }
  console.info('[analysisDaiProcessor] cycle done.');
};

export default sendDAI()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
