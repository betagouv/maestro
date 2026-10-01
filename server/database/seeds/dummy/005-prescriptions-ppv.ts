import { countBy, omit } from 'lodash-es';
import {
  type MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { RegionList } from 'maestro-shared/referential/Region';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  type ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { PPVDummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import {
  genLocalPrescriptions,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import {
  genSubPlanMatrices,
  PPVInProgressProgrammingPlanFixture,
  PPVInProgressSubPlanFixture,
  PPVInProgressSubPlanId,
  PPVValidatedProgrammingPlanFixture,
  PPVValidatedSubPlanFixture,
  PPVValidatedSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { v4 as uuidv4 } from 'uuid';
import { LocalPrescriptions } from '../../../repositories/localPrescriptionRepository';
import { LocalPrescriptionSubstanceKindsLaboratories } from '../../../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { toProgrammingPlanSettingsRow } from '../../../repositories/programmingPlanSettingsRow';
import { ProgrammingSubPlansRaw } from '../../../repositories/programmingSubPlanRepository';

type PPVPrescription = Prescription & { matrixKind: MatrixKind };

const genPPVPrescription = ({
  matrixKind,
  ...data
}: Partial<Prescription> & { matrixKind: MatrixKind }): PPVPrescription => ({
  ...genPrescription(data),
  matrixKind
});

export const abricotsEtSimilaires = genPPVPrescription({
  id: '02b1d919-f5e7-4d67-afa6-dc8e7e8f3687',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A0DVX',
  sampleCount: 40
});
export const avocats = genPPVPrescription({
  id: 'b312ebb6-11cc-4fb3-a7e2-19e74fe73e8f',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01LB',
  sampleCount: 14
});
export const avoineEtSimilaires = genPPVPrescription({
  id: 'c2476ab6-53f2-4909-a68f-de3bbbce0bab',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A000F',
  sampleCount: 53
});
export const legumesFeuilles = genPPVPrescription({
  id: 'd98ca4ed-1404-4f24-8d41-6a027f4e78c5',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00KR',
  sampleCount: 9
});
export const carottes = genPPVPrescription({
  id: 'a9818827-9b11-40d5-a095-3674d71ae9fa',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00QH',
  sampleCount: 56
});
export const celeris = genPPVPrescription({
  id: '940c3185-c61a-49b5-a355-ce41ffee7b8f',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00RY',
  sampleCount: 33
});
export const cerisesEtSimilaires = genPPVPrescription({
  id: 'a31e2e9c-067e-4cd2-8952-56f5316634ee',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01GG',
  sampleCount: 24
});
export const chouxVertsEtSimilaires = genPPVPrescription({
  id: '19f098d7-2873-4ebb-96b7-df13e1084b4e',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00GL',
  sampleCount: 40
});
export const chouxFleurs = genPPVPrescription({
  id: 'f97c3ffa-23ca-4205-a55d-01f1ca76e270',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00FR',
  sampleCount: 36
});
export const endives = genPPVPrescription({
  id: '57d5289b-ca8f-4017-9794-a621f496b72a',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00NE',
  sampleCount: 20
});
export const fenouils = genPPVPrescription({
  id: '8839818d-1820-4f6b-a298-a12cc2f0980e',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00SA',
  sampleCount: 16
});
export const fevesNonEcossees = genPPVPrescription({
  id: 'a9b33e14-56ec-4156-ad32-a06df9dd3d96',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00PH',
  sampleCount: 43
});
export const figues = genPPVPrescription({
  id: '25117f79-6bde-4f66-b4df-631af6495eaf',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01HG',
  sampleCount: 19
});
export const jeunesPousses = genPPVPrescription({
  id: '7f5a4f46-9fbb-4c6f-b6de-ee933707fc40',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00MA',
  sampleCount: 40
});
export const fruitsACoques = genPPVPrescription({
  id: 'a2e5b333-4fff-4f25-823d-2c0aef8d9568',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A014C',
  sampleCount: 3
});
export const houblon = genPPVPrescription({
  id: '8facf692-60d2-43d1-9088-567786b94ccf',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00YZ',
  sampleCount: 8
});
export const laituesEtSimilaires = genPPVPrescription({
  id: 'f3ea9e45-378c-48db-a53e-6001e89d5a77',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A0DLB',
  sampleCount: 14
});
const legumesSecs = genPPVPrescription({
  id: 'c4eca56b-5b87-4152-a8c8-6e4f27e32e24',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A012R',
  sampleCount: 84
});
export const lentilles = genPPVPrescription({
  id: '74880178-aa79-4a57-85f4-2727ea9ebb1a',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A013Q',
  sampleCount: 33
});
export const litchis = genPPVPrescription({
  id: 'eb344a0d-e309-44c8-a25a-f75f140faae3',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01JV',
  sampleCount: 12
});
export const maches = genPPVPrescription({
  id: 'e9f62e45-6890-4f2d-80eb-44a93dbb1f07',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00KT',
  sampleCount: 22
});
export const mangues = genPPVPrescription({
  id: 'b101f673-cb3e-4398-81ff-cdae2bd41241',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01LF',
  sampleCount: 13
});
export const navets = genPPVPrescription({
  id: 'd2887e1d-8868-4dd3-bfa0-3b796242dbf6',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00RE',
  sampleCount: 31
});
export const oignons = genPPVPrescription({
  id: '84c8ea38-8a20-42cf-ba10-b9418af4aa51',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A00HC',
  sampleCount: 52
});
export const orgeEtSimilaires = genPPVPrescription({
  id: '904e8eac-b05b-44dd-92b9-c20b82dedef2',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A0D9Y',
  sampleCount: 64
});
export const patatesDouces = genPPVPrescription({
  id: 'e98c900b-8ae0-40ad-b3cf-d36f6650c9c0',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A010C',
  sampleCount: 21
});
export const pechesEtSimilaires = genPPVPrescription({
  id: 'ba65c645-9bec-49e4-afe0-4bbd12e5a874',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01GL',
  sampleCount: 36
});
export const poireauxEtSimilaires = genPPVPrescription({
  id: 'bbab1f35-439f-4f93-aa8a-bff96c899643',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A0DEH',
  sampleCount: 42
});
export const poires = genPPVPrescription({
  id: '52c53b82-3ffb-43ba-8dd7-805671e84557',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A01DP',
  sampleCount: 36
});
export const rizEtSimilaires = genPPVPrescription({
  id: 'a86ac011-3f12-40e1-adf7-e03bfd66d8cb',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A001C',
  sampleCount: 17
});
export const fevesDeSoja = genPPVPrescription({
  id: 'd4a1ade5-f0a7-4aca-81b0-a15856aabead',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A0DFR',
  sampleCount: 50
});
export const graineDeTournesol1 = genPPVPrescription({
  id: '8140350b-23df-490d-8e00-95296d24ec6b',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Control',
  matrixKind: 'A0DBP',
  sampleCount: 24
});
const graineDeTournesol2 = genPPVPrescription({
  id: 'da04a0f4-8a63-4e93-8725-4adf25e3fc3e',
  programmingSubPlanId: PPVValidatedSubPlanId,
  context: 'Surveillance',
  matrixKind: 'A0DBP',
  sampleCount: 50
});
const subPlanLabel = ({ matrixKind }: PPVPrescription): string =>
  MatrixKindLabels[matrixKind];

const buildSubPlans = (
  base: ProgrammingSubPlan,
  prescriptions: PPVPrescription[]
): ProgrammingSubPlan[] => {
  const occurrences = countBy(prescriptions, subPlanLabel);

  return prescriptions.map((prescription, index) => {
    const label = subPlanLabel(prescription);

    return {
      ...base,
      id: index === 0 ? base.id : ProgrammingSubPlanId.parse(uuidv4()),
      subPlanNumber: `PPV${String(index + 1).padStart(2, '0')}`,
      matrices: genSubPlanMatrices(prescription.matrixKind),
      label:
        occurrences[label] > 1
          ? `${label} - ${ContextLabels[prescription.context]}`
          : label
    };
  });
};

const basePrescriptions = [
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
  graineDeTournesol2
];

const baseInProgressPrescriptions = basePrescriptions.map(
  (prescription, index) => ({
    ...prescription,
    id: uuidv4(),
    programmingSubPlanId: PPVInProgressSubPlanId,
    sampleCount:
      index === basePrescriptions.length - 1 ? 0 : prescription.sampleCount
  })
);

const validatedSubPlans = buildSubPlans(
  PPVValidatedSubPlanFixture,
  basePrescriptions
);
const inProgressSubPlans = buildSubPlans(
  PPVInProgressSubPlanFixture,
  baseInProgressPrescriptions
);

const prescriptions = basePrescriptions.map((prescription, index) => ({
  ...prescription,
  programmingSubPlanId: validatedSubPlans[index].id
}));

const inProgressPrescriptions = baseInProgressPrescriptions.map(
  (prescription, index) => ({
    ...prescription,
    programmingSubPlanId: inProgressSubPlans[index].id
  })
);

export const ppvSubPlanIdByPrescriptionId = new Map<
  string,
  ProgrammingSubPlanId
>(
  [...prescriptions, ...inProgressPrescriptions].map(
    ({ id, programmingSubPlanId }) => [id, programmingSubPlanId]
  )
);

const DEFAULT_STAGE_VALUES = ['STADE1'];

const stageValuesByPrescription = new Map<Prescription, string[]>([
  [avoineEtSimilaires, ['STADE1', 'STADE3']],
  [houblon, ['STADE3']],
  [lentilles, ['STADE1', 'STADE3']],
  [orgeEtSimilaires, ['STADE1', 'STADE3']],
  [rizEtSimilaires, ['STADE2']],
  [fevesDeSoja, ['STADE1', 'STADE3']],
  [graineDeTournesol1, ['STADE1', 'STADE3']],
  [
    graineDeTournesol2,
    [
      'STADE1',
      'STADE2',
      'STADE3',
      'STADE4',
      'STADE5',
      'STADE6',
      'STADE7',
      'STADE8',
      'STADE9'
    ]
  ]
]);

export const ppvStageValuesBySubPlanId = new Map<
  ProgrammingSubPlanId,
  string[]
>(
  basePrescriptions.flatMap((basePrescription, index) => {
    const stageValues =
      stageValuesByPrescription.get(basePrescription) ?? DEFAULT_STAGE_VALUES;

    return [
      [validatedSubPlans[index].id, stageValues] as const,
      [inProgressSubPlans[index].id, stageValues] as const
    ];
  })
);

export const seed = async () => {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: PPVValidatedProgrammingPlanFixture.id })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  await ProgrammingSubPlansRaw()
    .whereIn('programmingPlanId', [
      PPVValidatedProgrammingPlanFixture.id,
      PPVInProgressProgrammingPlanFixture.id
    ])
    .delete();

  await ProgrammingSubPlansRaw().insert(
    [...validatedSubPlans, ...inProgressSubPlans].map(
      toProgrammingPlanSettingsRow
    )
  );

  const inProgressDistributions = [
    [14, 0, 0, 0, 3, 2, 0, 0, 0, 3, 12, 0, 6, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 3, 3, 2],
    [5, 8, 5, 4, 0, 8, 3, 0, 4, 6, 6, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 2],
    [3, 3, 5, 3, 2, 6, 7, 3, 6, 9, 3, 4, 2, 0, 0, 0, 0, 0],
    [3, 0, 4, 0, 0, 6, 3, 0, 3, 5, 3, 4, 2, 0, 0, 0, 0, 0],
    [7, 0, 0, 0, 0, 3, 0, 0, 0, 3, 5, 0, 6, 0, 0, 0, 0, 0],
    [0, 0, 5, 0, 3, 6, 4, 0, 4, 3, 0, 3, 0, 2, 3, 2, 0, 5],
    [2, 0, 13, 0, 0, 0, 7, 0, 6, 5, 0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 5, 0, 0, 4, 6, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 0, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0, 4, 0, 0, 0, 0, 0],
    [0, 7, 0, 4, 0, 3, 4, 4, 4, 9, 5, 3, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 5, 0, 9, 0, 0, 0, 0, 0],
    [4, 0, 0, 2, 3, 4, 0, 5, 0, 0, 3, 4, 6, 3, 4, 2, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 3, 0, 4],
    [6, 7, 6, 9, 2, 4, 9, 7, 6, 15, 10, 3, 0, 0, 0, 0, 0, 0],
    [9, 5, 0, 5, 0, 3, 0, 0, 0, 6, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6, 2],
    [0, 0, 3, 0, 0, 0, 3, 0, 4, 4, 0, 5, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 3, 4, 2],
    [3, 0, 6, 0, 0, 0, 5, 3, 4, 4, 0, 3, 3, 0, 0, 0, 0, 0],
    [6, 5, 0, 6, 4, 7, 6, 4, 3, 3, 5, 3, 0, 0, 0, 0, 0, 0],
    [5, 6, 6, 5, 2, 8, 4, 3, 5, 8, 5, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 5, 4, 4, 3, 0],
    [6, 0, 0, 0, 5, 3, 0, 0, 0, 5, 10, 0, 7, 0, 0, 0, 0, 0],
    [6, 0, 3, 5, 0, 0, 4, 5, 6, 4, 3, 3, 0, 3, 0, 0, 0, 0],
    [6, 0, 2, 2, 0, 3, 0, 0, 2, 4, 5, 7, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 8, 0, 0, 6, 0, 0],
    [7, 8, 0, 4, 0, 6, 0, 2, 0, 11, 12, 0, 0, 0, 0, 0, 0, 0],
    [0, 6, 0, 0, 0, 4, 4, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0],
    Array(18).fill(0)
  ];

  await Prescriptions().insert(
    [...prescriptions, ...inProgressPrescriptions].map((prescription) =>
      omit(prescription, 'matrixKind')
    )
  );

  await LocalPrescriptions().insert([
    ...genLocalPrescriptions(
      abricotsEtSimilaires.id,
      [14, 0, 0, 0, 3, 2, 0, 0, 0, 3, 12, 0, 6, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      avocats.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 3, 3, 2]
    ),
    ...genLocalPrescriptions(
      avoineEtSimilaires.id,
      [5, 8, 5, 4, 0, 8, 3, 0, 4, 6, 6, 4, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      legumesFeuilles.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 2]
    ),
    ...genLocalPrescriptions(
      carottes.id,
      [3, 3, 5, 3, 2, 6, 7, 3, 6, 9, 3, 4, 2, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      celeris.id,
      [3, 0, 4, 0, 0, 6, 3, 0, 3, 5, 3, 4, 2, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      cerisesEtSimilaires.id,
      [7, 0, 0, 0, 0, 3, 0, 0, 0, 3, 5, 0, 6, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      chouxVertsEtSimilaires.id,
      [0, 0, 5, 0, 3, 6, 4, 0, 4, 3, 0, 3, 0, 2, 3, 2, 0, 5]
    ),
    ...genLocalPrescriptions(
      chouxFleurs.id,
      [2, 0, 13, 0, 0, 0, 7, 0, 6, 5, 0, 0, 3, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      endives.id,
      [0, 0, 5, 0, 0, 4, 6, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      fenouils.id,
      [4, 0, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0, 4, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      fevesNonEcossees.id,
      [0, 7, 0, 4, 0, 3, 4, 4, 4, 9, 5, 3, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      figues.id,
      [3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 5, 0, 9, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      jeunesPousses.id,
      [4, 0, 0, 2, 3, 4, 0, 5, 0, 0, 3, 4, 6, 3, 4, 2, 0, 0]
    ),
    ...genLocalPrescriptions(
      fruitsACoques.id,
      [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      houblon.id,
      [0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      laituesEtSimilaires.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 3, 0, 4]
    ),
    ...genLocalPrescriptions(
      legumesSecs.id,
      [6, 7, 6, 9, 2, 4, 9, 7, 6, 15, 10, 3, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      lentilles.id,
      [9, 5, 0, 5, 0, 3, 0, 0, 0, 6, 5, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      litchis.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6, 2]
    ),
    ...genLocalPrescriptions(
      maches.id,
      [0, 0, 3, 0, 0, 0, 3, 0, 4, 4, 0, 5, 3, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      mangues.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 3, 4, 2]
    ),
    ...genLocalPrescriptions(
      navets.id,
      [3, 0, 6, 0, 0, 0, 5, 3, 4, 4, 0, 3, 3, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      oignons.id,
      [6, 5, 0, 6, 4, 7, 6, 4, 3, 3, 5, 3, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      orgeEtSimilaires.id,
      [5, 6, 6, 5, 2, 8, 4, 3, 5, 8, 5, 7, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      patatesDouces.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 5, 4, 4, 3, 0]
    ),
    ...genLocalPrescriptions(
      pechesEtSimilaires.id,
      [6, 0, 0, 0, 5, 3, 0, 0, 0, 5, 10, 0, 7, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      poireauxEtSimilaires.id,
      [6, 0, 3, 5, 0, 0, 4, 5, 6, 4, 3, 3, 0, 3, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      poires.id,
      [6, 0, 2, 2, 0, 3, 0, 0, 2, 4, 5, 7, 5, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      rizEtSimilaires.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 8, 0, 0, 6, 0, 0]
    ),
    ...genLocalPrescriptions(
      fevesDeSoja.id,
      [7, 8, 0, 4, 0, 6, 0, 2, 0, 11, 12, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      graineDeTournesol1.id,
      [0, 6, 0, 0, 0, 4, 4, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      graineDeTournesol2.id,
      [12, 0, 0, 8, 0, 0, 0, 0, 0, 17, 13, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...inProgressPrescriptions.flatMap((prescription, index) =>
      genLocalPrescriptions(prescription.id, inProgressDistributions[index])
    )
  ]);

  await LocalPrescriptionSubstanceKindsLaboratories().insert(
    prescriptions.flatMap((prescription) =>
      RegionList.map((region) => ({
        prescriptionId: prescription.id,
        region,
        department: 'None',
        substanceKind: 'Any',
        laboratoryId: oneOf(PPVDummyLaboratoryIds)
      }))
    )
  );
};
