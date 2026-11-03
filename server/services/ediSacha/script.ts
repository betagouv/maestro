import { initKnex } from '../../repositories/db';
import { initKysely } from '../../repositories/kysely';
import config from '../../utils/config';
import { doSftp } from './sftpService';

const launchSftp = async () => {
  initKnex();
  initKysely(config.databaseUrl);
  await doSftp();
};

export default launchSftp()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
