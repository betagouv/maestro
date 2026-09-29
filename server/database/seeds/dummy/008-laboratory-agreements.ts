import { PPVSubPlanNumberPrefix } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
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
  DAOABovinValidatedSubPlanId,
  DAOAInProgressBovinSubPlanId,
  DAOAInProgressVolailleSubPlanId,
  DAOAVolailleValidatedSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { knexInstance as db } from '../../../repositories/db';
import { ProgrammingSubPlansRaw } from '../../../repositories/programmingSubPlanRepository';

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

const PPVLaboratoryIds = [
  CAP29Id,
  CER30Id,
  GIR49Id,
  LDA66Id,
  LDA72Id,
  SCL34Id,
  SCL91Id
];

export const seed = async () => {
  const ppvSubPlans = await ProgrammingSubPlansRaw()
    .select('id')
    .where('subPlanNumber', 'like', `${PPVSubPlanNumberPrefix}%`);

  await db('laboratory_agreements').insert([
    ...ppvSubPlans
      .map((_) => _.id)
      .flatMap((programmingSubPlanId) =>
        PPVLaboratoryIds.map((laboratoryId) => ({
          laboratory_id: laboratoryId,
          programming_sub_plan_id: programmingSubPlanId,
          substance_kind: 'Any',
          detection_analysis: true
        }))
      ),
    ...[DAOAVolailleValidatedSubPlanId].flatMap((programmingSubPlanId) => [
      ...DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Mono',
        detection_analysis: true
      })),
      ...DAOAVolailleMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Multi',
        detection_analysis: true
      })),
      ...DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Copper',
        detection_analysis: true
      }))
    ]),
    ...[DAOABovinValidatedSubPlanId].flatMap((programmingSubPlanId) => [
      ...DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Mono',
        detection_analysis: true
      })),
      ...DAOABovinMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Multi',
        detection_analysis: true
      })),
      ...DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Copper',
        detection_analysis: true
      }))
    ]),
    ...[DAOAInProgressVolailleSubPlanId].flatMap((programmingSubPlanId) => [
      ...DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Mono',
        detection_analysis: true
      })),
      ...DAOAVolailleMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Multi',
        detection_analysis: true
      })),
      ...DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Copper',
        detection_analysis: true
      }))
    ]),
    ...[DAOAInProgressBovinSubPlanId].flatMap((programmingSubPlanId) => [
      ...DAOAMonoLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Mono',
        detection_analysis: true
      })),
      ...DAOABovinMultiLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Multi',
        detection_analysis: true
      })),
      ...DAOACopperLaboratoryIds.map((laboratoryId) => ({
        laboratory_id: laboratoryId,
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Copper',
        detection_analysis: true
      }))
    ])
  ]);
};
