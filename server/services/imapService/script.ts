import { initKysely } from '../../repositories/kysely.js';
import config from '../../utils/config.js';
import { checkEmails } from './index.js';
import { mattermostService } from '../mattermostService';

const launchExtractEmail = async () => {
  initKysely(config.databaseUrl);
  try{

    await checkEmails();
  }catch (e){
      console.log('error', e)
    await mattermostService.send('Attention erreur pendant la lecture des emails.')
  }
};

export default launchExtractEmail()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
