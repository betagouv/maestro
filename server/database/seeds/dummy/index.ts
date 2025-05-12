import { initKnex } from '../../../repositories/db';
import { initKysely } from '../../../repositories/kysely';
import config from '../../../utils/config';
import { seed as usersSeed } from './001-users';
import { seed as laboratoriesSeed } from './002-laboratories';
import { seed as programmingPlansSeed } from './003-programming-plans';
import { seed as pfasPrescriptionsSeed } from './004-prescriptions-pfas';
import { seed as ppvPrescriptionsSeed } from './004-prescriptions-ppv';
import { seed as companiesSeed } from './005-companies';
import { seed as samplesSeed } from './006-samples';
import { seed as substancesSeed } from './007-substances';
import { seed as substanceAnalysisSeed } from './008-substance-analysis';

const run = async () => {
  initKnex();
  initKysely(config.databaseUrl);

  await usersSeed();
  await laboratoriesSeed();
  await programmingPlansSeed();
  await ppvPrescriptionsSeed();
  await pfasPrescriptionsSeed();
  await companiesSeed();
  await samplesSeed();
  await substancesSeed();
  await substanceAnalysisSeed();
};
run()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
