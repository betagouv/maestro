import { departmentsSeed } from './departmentsSeed';
import { initKysely } from '../../../repositories/kysely';
import config from '../../../utils/config';

const launchDepartmentsSeed = async () => {
  initKysely(config.databaseUrl);


  await departmentsSeed()
}

export default launchDepartmentsSeed()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
