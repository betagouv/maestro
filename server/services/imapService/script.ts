import { initKnex } from '../../repositories/db';
import { initKysely } from '../../repositories/kysely';
import config from '../../utils/config';
import { checkEmails } from './index';

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
