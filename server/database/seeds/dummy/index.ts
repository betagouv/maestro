import { initKnex } from '../../../repositories/db';
import { initKysely } from '../../../repositories/kysely';
import config from '../../../utils/config';
import { departmentsSeed } from '../departments/departmentsSeed';
import { seed as companiesSeed } from './001-companies';
import { seed as laboratoriesSeed } from './002-laboratories';
import { seed as usersSeed } from './003-users';
import { seed as programmingPlansSeed } from './004-programming-plans';
import { seed as daoaPrescriptionsSeed } from './005-prescriptions-daoa';
import { seed as ppvPrescriptionsSeed } from './005-prescriptions-ppv';
import { seed as specificDataFieldsSeed } from './005-specific-data-fields';
import { seed as samplesSeed } from './006-samples';
import { seed as substanceAnalysisSeed } from './007-substance-analysis';
import { seed as laboratoryAgreementsSeed } from './008-laboratory-agreements';
import { seed as documentsSeed } from './009-documents';
import { seed as analysisSeed } from './010-analysis';

const run = async () => {
  initKnex();
  initKysely(config.databaseUrl);

  await companiesSeed();
  await laboratoriesSeed();
  await usersSeed();
  await programmingPlansSeed();
  await specificDataFieldsSeed();
  await ppvPrescriptionsSeed();
  await daoaPrescriptionsSeed();
  await samplesSeed();
  await substanceAnalysisSeed();
  await departmentsSeed();
  await laboratoryAgreementsSeed();
  await documentsSeed();
  await analysisSeed();
};
run()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
