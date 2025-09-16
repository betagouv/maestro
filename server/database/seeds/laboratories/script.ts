import { initKysely } from '../../../repositories/kysely';
import config from '../../../utils/config';
import { laboratoriesSeed } from './laboratoriesSeed';

const launchLaboratoriesSeed = async () => {
  initKysely(config.databaseUrl);

  await laboratoriesSeed();
};

export default launchLaboratoriesSeed()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
