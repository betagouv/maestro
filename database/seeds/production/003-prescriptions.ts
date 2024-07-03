import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { genPrescriptions } from '../../../shared/test/testFixtures';

exports.seed = async function () {
  const validatedControlProgrammingPlan = await ProgrammingPlans()
    .where({ kind: 'Control', status: 'Validated' })
    .first();

  const validatedSurveillanceProgrammingPlan = await ProgrammingPlans()
    .where({ kind: 'Surveillance', status: 'Validated' })
    .first();

  if (!validatedControlProgrammingPlan) {
    throw new Error('No validated control programming plan found');
  }

  // prettier-ignore
  await Prescriptions().insert([
    //Abricots et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A0DVX', ['STADE1'], [14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0]),
    //Avocats
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01LB', ['STADE1'], [0,0,0,0,0,0,0,0,0,0,0,0,0,4,2,3,3,2]),
    //Avoine et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A000F', ['STADE1', 'STADE3'], [5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0]),
    //Légumes-feuilles (brèdes)
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00KR', ['STADE1'], [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,2]),
    //Carottes
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00QH', ['STADE1'], [3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0]),
    //Céleris
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00RY', ['STADE1'], [3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0]),
    //Cerises et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01GG', ['STADE1'], [7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0]),
    //Choux verts et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00GL', ['STADE1'], [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5]),
    //Choux-fleurs
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00FR', ['STADE1'], [2,0,13,0,0,0,7,0,6,5,0,0,3,0,0,0,0,0]),
    //Endives
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00NE', ['STADE1'], [0,0,5,0,0,4,10,0,5,0,0,0,0,0,0,0,0,0]),
    //Fenouils
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00SA', ['STADE1'], [4,0,3,0,0,0,0,0,0,5,0,0,4,0,0,0,0,0]),
    //Fèves (non écossées)
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00PH', ['STADE1'], [0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0]),
    //Figues
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01HG', ['STADE1'], [3,0,0,0,2,0,0,0,0,0,5,0,9,0,0,0,0,0]),
    //Jeunes pousses (y compris les espèces du genre Brassica) et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00MA', ['STADE1'], [4,0,0,2,3,4,0,5,0,0,3,4,6,3,4,2,0,0]),
    //Laitues et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A0DLB', ['STADE1'], [0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,3,0,4]),
    //Légumes secs (graines séchées de légumineuse)
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A012R', ['STADE1'], [6,7,6,9,2,10,12,7,6,15,10,7,0,0,0,0,0,0]),
    //Lentilles (sèches)
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A013Q', ['STADE1', 'STADE3'], [9,5,0,5,0,6,0,0,0,6,5,2,0,0,0,0,0,0]),
    //Litchis
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01JV', ['STADE1'], [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,6,2]),
    //Mâche
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00KT', ['STADE1'], [0,0,3,0,0,0,3,0,4,4,0,9,3,0,0,0,0,0]),
    //Mangues
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01LF', ['STADE1'], [0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,3,4,2]),
    //Navets
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00RE', ['STADE1'], [3,0,6,0,0,0,5,3,4,4,0,3,3,0,0,0,0,0]),
    //Oignons
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A00HC', ['STADE1'], [6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0]),
    //Orge et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A0D9Y', ['STADE1', 'STADE3'], [5,6,6,5,2,8,4,3,5,8,5,5,0,0,0,0,0,0]),
    //Patates douces
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A010C', ['STADE1'], [0,0,0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0]),
    //Pêches et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01GL', ['STADE1'], [6,0,0,0,5,5,0,0,0,5,10,0,7,0,0,0,0,0]),
    //Poireaux et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A0DEH', ['STADE1'], [6,0,3,5,0,0,4,5,6,4,3,6,0,3,0,0,0,0]),
    //Poires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A01DP', ['STADE1'], [6,0,2,2,0,3,0,0,2,4,5,2,5,0,0,0,0,0]),
    //Riz et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A001C', ['STADE2'], [0,0,0,0,0,0,0,0,0,0,3,0,8,0,0,6,0,0]),
    //Fèves de soja (non écossées)
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A0DFR', ['STADE1', 'STADE3'], [7,8,0,4,0,6,0,2,0,11,12,0,0,0,0,0,0,0]),
    //Graines de tournesol et similaires
    ...genPrescriptions(validatedControlProgrammingPlan.id,'A0DBP', ['STADE1', 'STADE3'], [0,6,0,0,0,4,0,0,0,0,0,7,0,0,0,0,0,0]),
  ]);

  if (!validatedSurveillanceProgrammingPlan) {
    throw new Error('No validated surveillance programming plan found');
  }

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions(validatedSurveillanceProgrammingPlan.id,'A0DBP', [], [12,0,0,8,0,0,0,0,0,17,13,0,0,0,0,0,0,0]),
  ]);
};
