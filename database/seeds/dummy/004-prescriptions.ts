import { Knex } from 'knex';
import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { SampleStageList } from '../../../shared/schema/Sample/SampleStage';
import { genPrescriptions, oneOf } from '../../../shared/test/testFixtures';

exports.seed = async function (knex: Knex) {
  const programmingPlan = await ProgrammingPlans()
    .where({ title: 'Plan de surveillance' })
    .first();

  if (!programmingPlan) {
    return;
  }

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions(programmingPlan.id,'Abricots', oneOf(SampleStageList), [14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Avocats', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,0,4,2,3,3,2,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Avoine', oneOf(SampleStageList), [5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Brèdes', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,7,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Carottes', oneOf(SampleStageList), [3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Céleris branches et raves', oneOf(SampleStageList), [3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Cerises', oneOf(SampleStageList), [7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Choux feuillus', oneOf(SampleStageList), [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5]),
    ...genPrescriptions(programmingPlan.id,'Choux-fleurs', oneOf(SampleStageList), [2,0,13,0,0,7,0,6,5,0,0,3,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Endives chicons', oneOf(SampleStageList), [0,0,5,0,0,4,10,0,5,0,0,0,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Fenouil', oneOf(SampleStageList), [4,0,3,0,0,0,0,0,5,0,0,4,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Fèves et fèveroles', oneOf(SampleStageList), [0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Figues', oneOf(SampleStageList), [3,0,0,0,2,0,0,0,5,0,9,0,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Fines herbes', oneOf(SampleStageList), [4,0,0,2,3,4,0,5,0,3,4,6,3,4,2,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Laitues', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,3,4,3,0,0,4,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Légumineuses potagères sèches / graines protéagineuses', oneOf(SampleStageList), [6,7,6,9,2,10,12,7,6,15,10,7,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Lentilles sèches', oneOf(SampleStageList), [9,5,0,5,0,6,0,0,6,5,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Litchis / ramboutans', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,4,6,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Mâche', oneOf(SampleStageList), [0,0,3,0,0,3,0,0,4,4,0,9,3,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Mangues', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,4,0,3,4,2,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Navets', oneOf(SampleStageList), [3,0,6,0,0,5,3,4,4,0,3,3,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Oignons bulbes', oneOf(SampleStageList), [6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Orge', oneOf(SampleStageList), [5,6,6,5,2,8,4,3,5,8,5,5,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Patates douces', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Pavies, pêches, nectarines et brugnons', oneOf(SampleStageList), [6,0,0,5,5,0,0,5,10,0,7,0,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Poireaux et oignons de printemps', oneOf(SampleStageList), [6,0,3,5,0,4,5,6,4,3,6,0,3,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Poires', oneOf(SampleStageList), [6,0,2,2,0,3,0,0,2,4,5,2,5,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Riz', oneOf(SampleStageList), [0,0,0,0,0,3,0,0,8,0,0,6,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Soja', oneOf(SampleStageList), [7,8,0,4,0,6,0,0,2,0,11,12,0,0,0,0,0,0]),
    ...genPrescriptions(programmingPlan.id,'Tournesol', oneOf(SampleStageList), [0,6,0,0,4,0,0,0,0,7,0,0,0,0,0,0,0,0]),
  ]);
};
