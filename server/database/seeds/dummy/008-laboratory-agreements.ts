import {
  ANS94ALnrPestId,
  CAP29Id,
  CER30Id,
  GIR49Id,
  LDA17Id,
  LDA21Id,
  LDA22Id,
  LDA31Id,
  LDA66Id,
  LDA72Id,
  LDA85Id,
  LDA87Id,
  SCL34Id,
  SCL91Id
} from 'maestro-shared/schema/User/User';
import {
  DAOAInProgressProgrammingPlanId,
  DAOAValidatedProgrammingPlanId,
  PPVClosedProgrammingPlanId,
  PPVInProgressProgrammingPlanId,
  PPVValidatedProgrammingPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { knexInstance as db } from '../../../repositories/db';

export const DAOAMonoLaboratoryIds = [ANS94ALnrPestId];
export const DAOABovinMultiLaboratoryIds = [ANS94ALnrPestId];
export const DAOAVolailleMultiLaboratoryIds = [
  LDA17Id,
  LDA21Id,
  LDA22Id,
  LDA31Id,
  LDA72Id,
  LDA85Id,
  LDA87Id,
  ANS94ALnrPestId
];
export const DAOACopperLaboratoryIds = [LDA85Id];

export const seed = async () => {
  const PPVProgrammingPlanIds = [
    PPVClosedProgrammingPlanId,
    PPVValidatedProgrammingPlanId,
    PPVInProgressProgrammingPlanId
  ];

  const DAOAProgrammingPlanIds = [
    DAOAInProgressProgrammingPlanId,
    DAOAValidatedProgrammingPlanId
  ];

  const PPVLaboratoryIds = [
    CAP29Id,
    CER30Id,
    GIR49Id,
    LDA66Id,
    LDA72Id,
    SCL34Id,
    SCL91Id
  ];

  await db('laboratory_agreements').insert([
    ...PPVProgrammingPlanIds.flatMap((programmingPlanId) =>
      PPVLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'PPV',
        substance_kind: 'Any',
        detection_analysis: true
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'DAOA_VOLAILLE',
        substance_kind: 'Mono',
        detection_analysis: true
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOAVolailleMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'DAOA_VOLAILLE',
        substance_kind: 'Multi',
        detection_analysis: true
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'DAOA_VOLAILLE',
        substance_kind: 'Copper',
        detection_analysis: true
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'DAOA_BOVIN',
        substance_kind: 'Mono',
        detection_analysis: true
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOABovinMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'DAOA_BOVIN',
        substance_kind: 'Multi',
        detection_analysis: true
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        programming_plan_kind: 'DAOA_BOVIN',
        substance_kind: 'Copper',
        detection_analysis: true
      }))
    )
  ]);
};
