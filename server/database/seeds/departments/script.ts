import { initKysely } from '../../../repositories/kysely';
import config from '../../../utils/config';
import { departmentsSeed } from './departmentsSeed';

const launchDepartmentsSeed = async () => {
  initKysely(config.databaseUrl);

  await departmentsSeed(true);
};

export default launchDepartmentsSeed()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
