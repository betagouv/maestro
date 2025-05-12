import { departmentsSeed } from './departmentsSeed';
import { initKysely } from '../../../repositories/kysely';
import config from '../../../utils/config';

const launchDepartementsSeed = async () => {
  initKysely(config.databaseUrl);


  await departmentsSeed()
}


export default launchDepartementsSeed()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
