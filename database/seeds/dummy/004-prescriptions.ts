import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../../server/repositories/regionalPrescriptionRepository';
import { RegionList } from '../../../shared/referential/Region';
import { genPrescription } from '../../../shared/test/prescriptionFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import { validatedProgrammingPlanId } from '../dummy/003-programming-plans';
import { DummyLaboratoryIds } from './002-laboratories';

export const abricotsEtSimilaires = genPrescription({
  id: '02b1d919-f5e7-4d67-afa6-dc8e7e8f3687',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A0DVX',
  stages: ['STADE1'],
});
export const avocats = genPrescription({
  id: 'b312ebb6-11cc-4fb3-a7e2-19e74fe73e8f',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01LB',
  stages: ['STADE1'],
});
export const avoineEtSimilaires = genPrescription({
  id: 'c2476ab6-53f2-4909-a68f-de3bbbce0bab',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A000F',
  stages: ['STADE1', 'STADE3'],
});
export const legumesFeuilles = genPrescription({
  id: 'd98ca4ed-1404-4f24-8d41-6a027f4e78c5',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00KR',
  stages: ['STADE1'],
});
export const carottes = genPrescription({
  id: 'a9818827-9b11-40d5-a095-3674d71ae9fa',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00QH',
  stages: ['STADE1'],
});
export const celeris = genPrescription({
  id: '940c3185-c61a-49b5-a355-ce41ffee7b8f',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00RY',
  stages: ['STADE1'],
});
export const cerisesEtSimilaires = genPrescription({
  id: 'a31e2e9c-067e-4cd2-8952-56f5316634ee',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01GG',
  stages: ['STADE1'],
});
export const chouxVertsEtSimilaires = genPrescription({
  id: '19f098d7-2873-4ebb-96b7-df13e1084b4e',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00GL',
  stages: ['STADE1'],
});
export const chouxFleurs = genPrescription({
  id: 'f97c3ffa-23ca-4205-a55d-01f1ca76e270',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00FR',
  stages: ['STADE1'],
});
export const endives = genPrescription({
  id: '57d5289b-ca8f-4017-9794-a621f496b72a',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00NE',
  stages: ['STADE1'],
});
export const fenouils = genPrescription({
  id: '8839818d-1820-4f6b-a298-a12cc2f0980e',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00SA',
  stages: ['STADE1'],
});
export const fevesNonEcossees = genPrescription({
  id: 'a9b33e14-56ec-4156-ad32-a06df9dd3d96',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00PH',
  stages: ['STADE1'],
});
export const figues = genPrescription({
  id: '25117f79-6bde-4f66-b4df-631af6495eaf',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01HG',
  stages: ['STADE1'],
});
export const jeunesPousses = genPrescription({
  id: '7f5a4f46-9fbb-4c6f-b6de-ee933707fc40',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00MA',
  stages: ['STADE1'],
});
export const fruitsACoques = genPrescription({
  id: 'a2e5b333-4fff-4f25-823d-2c0aef8d9568',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A014C',
  stages: ['STADE1'],
});
export const houblon = genPrescription({
  id: '8facf692-60d2-43d1-9088-567786b94ccf',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00YZ',
  stages: ['STADE3'],
});
export const laituesEtSimilaires = genPrescription({
  id: 'f3ea9e45-378c-48db-a53e-6001e89d5a77',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A0DLB',
  stages: ['STADE1'],
});
export const legumesSecs = genPrescription({
  id: 'c4eca56b-5b87-4152-a8c8-6e4f27e32e24',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A012R',
  stages: ['STADE1'],
});
export const lentilles = genPrescription({
  id: '74880178-aa79-4a57-85f4-2727ea9ebb1a',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A013Q',
  stages: ['STADE1', 'STADE3'],
});
export const litchis = genPrescription({
  id: 'eb344a0d-e309-44c8-a25a-f75f140faae3',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01JV',
  stages: ['STADE1'],
});
export const maches = genPrescription({
  id: 'e9f62e45-6890-4f2d-80eb-44a93dbb1f07',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00KT',
  stages: ['STADE1'],
});
export const mangues = genPrescription({
  id: 'b101f673-cb3e-4398-81ff-cdae2bd41241',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01LF',
  stages: ['STADE1'],
});
export const navets = genPrescription({
  id: 'd2887e1d-8868-4dd3-bfa0-3b796242dbf6',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00RE',
  stages: ['STADE1'],
});
export const oignons = genPrescription({
  id: '84c8ea38-8a20-42cf-ba10-b9418af4aa51',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A00HC',
  stages: ['STADE1'],
});
export const orgeEtSimilaires = genPrescription({
  id: '904e8eac-b05b-44dd-92b9-c20b82dedef2',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A0D9Y',
  stages: ['STADE1', 'STADE3'],
});
export const patatesDouces = genPrescription({
  id: 'e98c900b-8ae0-40ad-b3cf-d36f6650c9c0',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A010C',
  stages: ['STADE1'],
});
export const pechesEtSimilaires = genPrescription({
  id: 'ba65c645-9bec-49e4-afe0-4bbd12e5a874',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01GL',
  stages: ['STADE1'],
});
export const poireauxEtSimilaires = genPrescription({
  id: 'bbab1f35-439f-4f93-aa8a-bff96c899643',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A0DEH',
  stages: ['STADE1'],
});
export const poires = genPrescription({
  id: '52c53b82-3ffb-43ba-8dd7-805671e84557',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A01DP',
  stages: ['STADE1'],
});
export const rizEtSimilaires = genPrescription({
  id: 'a86ac011-3f12-40e1-adf7-e03bfd66d8cb',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A001C',
  stages: ['STADE2'],
});
export const fevesDeSoja = genPrescription({
  id: 'd4a1ade5-f0a7-4aca-81b0-a15856aabead',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A0DFR',
  stages: ['STADE1', 'STADE3'],
});
export const graineDeTournesol1 = genPrescription({
  id: '8140350b-23df-490d-8e00-95296d24ec6b',
  programmingPlanId: validatedProgrammingPlanId,
  context: 'Control',
  matrix: 'A0DBP',
  stages: ['STADE1', 'STADE3'],
});
export const graineDeTournesol2 = genPrescription({
  id: 'da04a0f4-8a63-4e93-8725-4adf25e3fc3e',
  programmingPlanId: validatedProgrammingPlanId,
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
      laboratoryId: oneOf(DummyLaboratoryIds),
    }));

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
