import { initKysely } from '../../repositories/kysely.js';
import config from '../../utils/config.js';
import { checkEmails } from './index.js';

const launchExtractEmail = async () => {
  initKysely(config.databaseUrl);
  await checkEmails()
}

export default launchExtractEmail().catch((err) => console.error(err));
