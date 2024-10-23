import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { genPrescriptions } from '../../../shared/test/prescriptionFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import { DummyLaboratoryIds } from './002-laboratories';

exports.seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ status: 'Validated' })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  // prettier-ignore
  await Prescriptions().insert([
    //Abricots et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A0DVX',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0]),
    //Avocats
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01LB',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,0,0,0,4,2,3,3,2]),
    //Avoine et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A000F',
      stages: ['STADE1', 'STADE3'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0]),
    //Légumes-feuilles (brèdes)
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00KR',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,2]),
    //Carottes
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00QH',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0]),
    //Céleris
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00RY',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0]),
    //Cerises et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01GG',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0]),
    //Choux verts et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00GL',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    }, [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5]),
    //Choux-fleurs
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00FR',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[2,0,13,0,0,0,7,0,6,5,0,0,3,0,0,0,0,0]),
    //Endives
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00NE',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,5,0,0,4,6,0,5,0,0,0,0,0,0,0,0,0]),
    //Fenouils
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00SA',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[4,0,3,0,0,0,0,0,0,5,0,0,4,0,0,0,0,0]),
    //Fèves (non écossées)
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00PH',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0]),
    //Figues
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01HG',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[3,0,0,0,2,0,0,0,0,0,5,0,9,0,0,0,0,0]),
    //Jeunes pousses (y compris les espèces du genre Brassica) et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00MA',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[4,0,0,2,3,4,0,5,0,0,3,4,6,3,4,2,0,0]),
    //Fruits à coques
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A014C',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0]),
    //Houblon
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00YZ',
      stages: ['STADE3'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,6,2,0,0,0,0,0,0,0,0,0,0,0]),
    //Laitues et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A0DLB',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,3,0,4]),
    //Légumes secs (graines séchées de légumineuse)
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A012R',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[6,7,6,9,2,4,9,7,6,15,10,3,0,0,0,0,0,0]),
    //Lentilles (sèches)
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A013Q',
      stages: ['STADE1', 'STADE3'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[9,5,0,5,0,3,0,0,0,6,5,0,0,0,0,0,0,0]),
    //Litchis
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01JV',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,6,2]),
    //Mâche
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00KT',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,3,0,0,0,3,0,4,4,0,5,3,0,0,0,0,0]),
    //Mangues
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01LF',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,3,4,2]),
    //Navets
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00RE',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[3,0,6,0,0,0,5,3,4,4,0,3,3,0,0,0,0,0]),
    //Oignons
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A00HC',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0]),
    //Orge et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A0D9Y',
      stages: ['STADE1', 'STADE3'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[5,6,6,5,2,8,4,3,5,8,5,7,0,0,0,0,0,0]),
    //Patates douces
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A010C',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0]),
    //Pêches et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01GL',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[6,0,0,0,5,3,0,0,0,5,10,0,7,0,0,0,0,0]),
    //Poireaux et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A0DEH',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[6,0,3,5,0,0,4,5,6,4,3,3,0,3,0,0,0,0]),
    //Poires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A01DP',
      stages: ['STADE1'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[6,0,2,2,0,3,0,0,2,4,5,7,5,0,0,0,0,0]),
    //Riz et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A001C',
      stages: ['STADE2'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,0,0,0,0,0,0,0,0,0,3,0,8,0,0,6,0,0]),
    //Fèves de soja (non écossées)
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A0DFR',
      stages: ['STADE1', 'STADE3'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[7,8,0,4,0,6,0,2,0,11,12,0,0,0,0,0,0,0]),
    //Graines de tournesol et similaires
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Control',
      matrix: 'A0DBP',
      stages: ['STADE1', 'STADE3'],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[0,6,0,0,0,4,4,0,0,0,0,10,0,0,0,0,0,0]),
  ]);

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions({
      programmingPlanId: validatedProgrammingPlan.id,
      context: 'Surveillance',
      matrix: 'A0DBP',
      stages: [
        'STADE1',
        'STADE2',
        'STADE3',
        'STADE4',
        'STADE5',
        'STADE6',
        'STADE7',
        'STADE8',
        'STADE9',
      ],
      laboratoryId: oneOf(DummyLaboratoryIds),
    },[12,0,0,8,0,0,0,0,0,17,13,0,0,0,0,0,0,0]),
  ]);
};
