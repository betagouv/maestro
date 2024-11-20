import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../../server/repositories/regionalPrescriptionRepository';
import { RegionList } from '../../../shared/referential/Region';
import { genPrescription } from '../../../shared/test/prescriptionFixtures';

exports.seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ status: 'Validated' })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  const genRegionalPrescriptions = (
    prescriptionId: string,
    quantities: number[]
  ) =>
    quantities.map((quantity, index) => ({
      prescriptionId,
      region: RegionList[index],
      sampleCount: quantity,
    }));

  const abricotsEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A0DVX',
    stages: ['STADE1'],
  });
  const avocats = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01LB',
    stages: ['STADE1'],
  });
  const avoineEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A000F',
    stages: ['STADE1', 'STADE3'],
  });
  const legumesFeuilles = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00KR',
    stages: ['STADE1'],
  });
  const carottes = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00QH',
    stages: ['STADE1'],
  });
  const celeris = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00RY',
    stages: ['STADE1'],
  });
  const cerisesEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01GG',
    stages: ['STADE1'],
  });
  const chouxVertsEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00GL',
    stages: ['STADE1'],
  });
  const chouxFleurs = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00FR',
    stages: ['STADE1'],
  });
  const endives = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00NE',
    stages: ['STADE1'],
  });
  const fenouils = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00SA',
    stages: ['STADE1'],
  });
  const fevesNonEcossees = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00PH',
    stages: ['STADE1'],
  });
  const figues = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01HG',
    stages: ['STADE1'],
  });
  const jeunesPousses = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00MA',
    stages: ['STADE1'],
  });
  const fruitsACoques = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A014C',
    stages: ['STADE1'],
  });
  const houblon = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00YZ',
    stages: ['STADE3'],
  });
  const laituesEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A0DLB',
    stages: ['STADE1'],
  });
  const legumesSecs = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A012R',
    stages: ['STADE1'],
  });
  const lentilles = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A013Q',
    stages: ['STADE1', 'STADE3'],
  });
  const litchis = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01JV',
    stages: ['STADE1'],
  });
  const maches = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00KT',
    stages: ['STADE1'],
  });
  const mangues = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01LF',
    stages: ['STADE1'],
  });
  const navets = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00RE',
    stages: ['STADE1'],
  });
  const oignons = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A00HC',
    stages: ['STADE1'],
  });
  const orgeEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A0D9Y',
    stages: ['STADE1', 'STADE3'],
  });
  const patatesDouces = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A010C',
    stages: ['STADE1'],
  });
  const pechesEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01GL',
    stages: ['STADE1'],
  });
  const poireauxEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A0DEH',
    stages: ['STADE1'],
  });
  const poires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A01DP',
    stages: ['STADE1'],
  });
  const rizEtSimilaires = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A001C',
    stages: ['STADE2'],
  });
  const fevesDeSoja = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A0DFR',
    stages: ['STADE1', 'STADE3'],
  });
  const graineDeTournesol1 = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control',
    matrix: 'A0DBP',
    stages: ['STADE1', 'STADE3'],
  });
  const graineDeTournesol2 = genPrescription({
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
  });

  await Prescriptions().insert([
    abricotsEtSimilaires,
    avocats,
    avoineEtSimilaires,
    legumesFeuilles,
    carottes,
    celeris,
    cerisesEtSimilaires,
    chouxVertsEtSimilaires,
    chouxFleurs,
    endives,
    fenouils,
    fevesNonEcossees,
    figues,
    jeunesPousses,
    fruitsACoques,
    houblon,
    laituesEtSimilaires,
    legumesSecs,
    lentilles,
    litchis,
    maches,
    mangues,
    navets,
    oignons,
    orgeEtSimilaires,
    patatesDouces,
    pechesEtSimilaires,
    poireauxEtSimilaires,
    poires,
    rizEtSimilaires,
    fevesDeSoja,
    graineDeTournesol1,
    graineDeTournesol2,
  ]);

  await RegionalPrescriptions().insert([
    ...genRegionalPrescriptions(
      abricotsEtSimilaires.id,
      [14, 0, 0, 0, 3, 2, 0, 0, 0, 3, 12, 0, 6, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      avocats.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 3, 3, 2]
    ),
    ...genRegionalPrescriptions(
      avoineEtSimilaires.id,
      [5, 8, 5, 4, 0, 8, 3, 0, 4, 6, 6, 4, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      legumesFeuilles.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 2]
    ),
    ...genRegionalPrescriptions(
      carottes.id,
      [3, 3, 5, 3, 2, 6, 7, 3, 6, 9, 3, 4, 2, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      celeris.id,
      [3, 0, 4, 0, 0, 6, 3, 0, 3, 5, 3, 4, 2, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      cerisesEtSimilaires.id,
      [7, 0, 0, 0, 0, 3, 0, 0, 0, 3, 5, 0, 6, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      chouxVertsEtSimilaires.id,
      [0, 0, 5, 0, 3, 6, 4, 0, 4, 3, 0, 3, 0, 2, 3, 2, 0, 5]
    ),
    ...genRegionalPrescriptions(
      chouxFleurs.id,
      [2, 0, 13, 0, 0, 0, 7, 0, 6, 5, 0, 0, 3, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      endives.id,
      [0, 0, 5, 0, 0, 4, 6, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      fenouils.id,
      [4, 0, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0, 4, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      fevesNonEcossees.id,
      [0, 7, 0, 4, 0, 3, 4, 4, 4, 9, 5, 3, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      figues.id,
      [3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 5, 0, 9, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      jeunesPousses.id,
      [4, 0, 0, 2, 3, 4, 0, 5, 0, 0, 3, 4, 6, 3, 4, 2, 0, 0]
    ),
    ...genRegionalPrescriptions(
      fruitsACoques.id,
      [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      houblon.id,
      [0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      laituesEtSimilaires.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 3, 0, 4]
    ),
    ...genRegionalPrescriptions(
      legumesSecs.id,
      [6, 7, 6, 9, 2, 4, 9, 7, 6, 15, 10, 3, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      lentilles.id,
      [9, 5, 0, 5, 0, 3, 0, 0, 0, 6, 5, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      litchis.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6, 2]
    ),
    ...genRegionalPrescriptions(
      maches.id,
      [0, 0, 3, 0, 0, 0, 3, 0, 4, 4, 0, 5, 3, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      mangues.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 3, 4, 2]
    ),
    ...genRegionalPrescriptions(
      navets.id,
      [3, 0, 6, 0, 0, 0, 5, 3, 4, 4, 0, 3, 3, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      oignons.id,
      [6, 5, 0, 6, 4, 7, 6, 4, 3, 3, 5, 3, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      orgeEtSimilaires.id,
      [5, 6, 6, 5, 2, 8, 4, 3, 5, 8, 5, 7, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      patatesDouces.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 5, 4, 4, 3, 0]
    ),
    ...genRegionalPrescriptions(
      pechesEtSimilaires.id,
      [6, 0, 0, 0, 5, 3, 0, 0, 0, 5, 10, 0, 7, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      poireauxEtSimilaires.id,
      [6, 0, 3, 5, 0, 0, 4, 5, 6, 4, 3, 3, 0, 3, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      poires.id,
      [6, 0, 2, 2, 0, 3, 0, 0, 2, 4, 5, 7, 5, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      rizEtSimilaires.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 8, 0, 0, 6, 0, 0]
    ),
    ...genRegionalPrescriptions(
      fevesDeSoja.id,
      [7, 8, 0, 4, 0, 6, 0, 2, 0, 11, 12, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      graineDeTournesol1.id,
      [0, 6, 0, 0, 0, 4, 4, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      graineDeTournesol2.id,
      [12, 0, 0, 8, 0, 0, 0, 0, 0, 17, 13, 0, 0, 0, 0, 0, 0, 0]
    ),
  ]);
};
