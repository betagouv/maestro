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
import { knexInstance as db } from '../../../repositories/db';

export const seed = async function () {
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

  const DAOAProgrammingPlanIds = [DAOAInProgressProgrammingPlanId];

  const PPVLaboratoryIds = [
    CAP29Id,
    CER30Id,
    GIR49Id,
    LDA66Id,
    LDA72Id,
    SCL34Id,
    SCL91Id
  ];

  const DAOAMonoLaboratoryIds = [ANS94ALnrPestId];
  const DAOAMultiLaboratoryIds = [
    LDA17Id,
    LDA21Id,
    LDA22Id,
    LDA31Id,
    LDA72Id,
    LDA85Id,
    LDA87Id,
    ANS94ALnrPestId
  ];
  const DAOACopperLaboratoryIds = [LDA85Id];

  await db('laboratory_agreements').insert([
    ...PPVProgrammingPlanIds.flatMap((programmingPlanId) =>
      PPVLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        substance_kind: 'Any'
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        substance_kind: 'Mono'
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOAMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        substance_kind: 'Multi'
      }))
    ),
    ...DAOAProgrammingPlanIds.flatMap((programmingPlanId) =>
      DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_plan_id: programmingPlanId,
        substance_kind: 'Copper'
      }))
    )
  ]);
};
