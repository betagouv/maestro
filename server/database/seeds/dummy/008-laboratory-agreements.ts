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
import { DAOAValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
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
  const PPVClosedProgrammingPlanId = 'f5d510ef-ab78-449a-acd6-392895a1994f';
  const PPVValidatedProgrammingPlanId = 'd78fb3eb-1998-482b-9014-282d51ae30b8';
  const PPVInProgressProgrammingPlanId = 'bac693a5-9475-4e24-a775-5532b0117e5b';
  const DAOAInProgressProgrammingPlanId =
    'fafc6f2e-aec5-4998-adeb-84090d971a90';

  const PPVProgrammingPlanIds = [
    PPVClosedProgrammingPlanId,
    PPVValidatedProgrammingPlanId,
    PPVInProgressProgrammingPlanId
  ];

  const DAOAProgrammingPlanIds = [
    DAOAInProgressProgrammingPlanId,
    DAOAValidatedProgrammingPlanFixture.id
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
