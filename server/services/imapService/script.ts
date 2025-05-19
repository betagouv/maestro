import { initKnex } from '../../repositories/db';
import { initKysely } from '../../repositories/kysely.js';
import config from '../../utils/config.js';
import { checkEmails } from './index.js';

const launchExtractEmail = async () => {
  initKnex();
  initKysely(config.databaseUrl);
  await checkEmails();
};

export default launchExtractEmail()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
