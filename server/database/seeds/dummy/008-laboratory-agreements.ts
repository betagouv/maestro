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
  DAOABovinSubPlanId,
  DAOAInProgressBovinSubPlanId,
  DAOAInProgressVolailleSubPlanId,
  DAOAVolailleSubPlanId,
  PPVClosedSubPlanId,
  PPVInProgressSubPlanId,
  PPVSubPlanId
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
  await db('laboratory_agreements').insert([
    // PPV — un sub-plan par plan
    ...[PPVClosedSubPlanId, PPVSubPlanId, PPVInProgressSubPlanId].flatMap(
      (programmingSubPlanId) =>
        PPVLaboratoryIds.map((laboratoryId) => ({
          laboratory_id: laboratoryId,
          programming_sub_plan_id: programmingSubPlanId,
          substance_kind: 'Any',
          detection_analysis: true
        }))
    ),
    // DAOA Validated — Volaille
    ...[DAOAVolailleSubPlanId].flatMap((programmingSubPlanId) => [
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
    // DAOA Validated — Bovin
    ...[DAOABovinSubPlanId].flatMap((programmingSubPlanId) => [
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
    // DAOA InProgress — Volaille
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
    // DAOA InProgress — Bovin
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
