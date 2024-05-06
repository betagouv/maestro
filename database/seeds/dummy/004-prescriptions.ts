import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { SampleStageList } from '../../../shared/schema/Sample/SampleStage';
import { genPrescriptions, oneOf } from '../../../shared/test/testFixtures';

exports.seed = async function () {
  const validatedSurveyProgrammingPlan = await ProgrammingPlans()
    .where({ title: 'Plan de surveillance', status: 'Validated' })
    .first();

  const inProgressSurveyProgrammingPlan = await ProgrammingPlans()
    .where({ title: 'Plan de surveillance', status: 'InProgress' })
    .first();

  if (!validatedSurveyProgrammingPlan || !inProgressSurveyProgrammingPlan) {
    return;
  }

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Abricots', 'Avant récolte', [14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Avocats', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,0,4,2,3,3,2,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Avoine', 'Post récolte', [5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Brèdes', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,7,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Carottes', 'Stockage', [3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Céleris branches et raves', oneOf(SampleStageList), [3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Cerises', 'Autre', [7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Choux feuillus', oneOf(SampleStageList), [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Choux-fleurs', 'Stockage', [2,0,13,0,0,7,0,6,5,0,0,3,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Endives chicons', oneOf(SampleStageList), [0,0,5,0,0,4,10,0,5,0,0,0,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Fenouil', oneOf(SampleStageList), [4,0,3,0,0,0,0,0,5,0,0,4,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Fèves et fèveroles', oneOf(SampleStageList), [0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Figues', oneOf(SampleStageList), [3,0,0,0,2,0,0,0,5,0,9,0,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Fines herbes', oneOf(SampleStageList), [4,0,0,2,3,4,0,5,0,3,4,6,3,4,2,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Laitues', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,3,4,3,0,0,4,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Légumineuses potagères sèches / graines protéagineuses', oneOf(SampleStageList), [6,7,6,9,2,10,12,7,6,15,10,7,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Lentilles sèches', 'Stockage', [9,5,0,5,0,6,0,0,6,5,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Litchis / ramboutans', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,4,6,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Mâche', oneOf(SampleStageList), [0,0,3,0,0,3,0,0,4,4,0,9,3,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Mangues', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,4,0,3,4,2,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Navets', oneOf(SampleStageList), [3,0,6,0,0,5,3,4,4,0,3,3,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Oignons bulbes', oneOf(SampleStageList), [6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Orge', oneOf(SampleStageList), [5,6,6,5,2,8,4,3,5,8,5,5,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Patates douces', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Pavies, pêches, nectarines et brugnons', oneOf(SampleStageList), [6,0,0,5,5,0,0,5,10,0,7,0,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Poireaux et oignons de printemps', oneOf(SampleStageList), [6,0,3,5,0,4,5,6,4,3,6,0,3,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Poires', oneOf(SampleStageList), [6,0,2,2,0,3,0,0,2,4,5,2,5,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Riz', oneOf(SampleStageList), [0,0,0,0,0,3,0,0,8,0,0,6,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Soja', 'Avant récolte', [7,8,0,4,0,6,0,0,2,0,11,12,0,0,0,0,0,0]),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'Tournesol', oneOf(SampleStageList), [0,6,0,0,4,0,0,0,0,7,0,0,0,0,0,0,0,0]),
  ]);

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Abricots', oneOf(SampleStageList), [14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Avocats', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,0,4,2,3,3,2,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Avoine', oneOf(SampleStageList), [5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Brèdes', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,7,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Carottes', oneOf(SampleStageList), [3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Céleris branches et raves', oneOf(SampleStageList), [3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Cerises', oneOf(SampleStageList), [7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Choux feuillus', oneOf(SampleStageList), [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Choux-fleurs', oneOf(SampleStageList), [2,0,13,0,0,7,0,6,5,0,0,3,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Endives chicons', oneOf(SampleStageList), [0,0,5,0,0,4,10,0,5,0,0,0,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Fenouil', oneOf(SampleStageList), [4,0,3,0,0,0,0,0,5,0,0,4,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Fèves et fèveroles', oneOf(SampleStageList), [0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Figues', oneOf(SampleStageList), [3,0,0,0,2,0,0,0,5,0,9,0,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Fines herbes', oneOf(SampleStageList), [4,0,0,2,3,4,0,5,0,3,4,6,3,4,2,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Laitues', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,3,4,3,0,0,4,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Légumineuses potagères sèches / graines protéagineuses', oneOf(SampleStageList), [6,7,6,9,2,10,12,7,6,15,10,7,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Lentilles sèches', oneOf(SampleStageList), [9,5,0,5,0,6,0,0,6,5,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Litchis / ramboutans', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,4,6,2,0,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Mâche', oneOf(SampleStageList), [0,0,3,0,0,3,0,0,4,4,0,9,3,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Mangues', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,0,4,0,3,4,2,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Navets', oneOf(SampleStageList), [3,0,6,0,0,5,3,4,4,0,3,3,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Oignons bulbes', oneOf(SampleStageList), [6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Orge', oneOf(SampleStageList), [5,6,6,5,2,8,4,3,5,8,5,5,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Patates douces', oneOf(SampleStageList), [0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Pavies, pêches, nectarines et brugnons', oneOf(SampleStageList), [6,0,0,5,5,0,0,5,10,0,7,0,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Poireaux et oignons de printemps', oneOf(SampleStageList), [6,0,3,5,0,4,5,6,4,3,6,0,3,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Poires', oneOf(SampleStageList), [6,0,2,2,0,3,0,0,2,4,5,2,5,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Riz', oneOf(SampleStageList), [0,0,0,0,0,3,0,0,8,0,0,6,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Soja', oneOf(SampleStageList), [7,8,0,4,0,6,0,0,2,0,11,12,0,0,0,0,0,0]),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'Tournesol', oneOf(SampleStageList), [0,6,0,0,4,0,0,0,0,7,0,0,0,0,0,0,0,0]),
  ]);
};
