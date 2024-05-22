import { Prescriptions } from '../../../server/repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { StageList } from '../../../shared/referential/Stage';
import { genPrescriptions, oneOf } from '../../../shared/test/testFixtures';
import { DummyLaboratoryIds } from './002-laboratories';

exports.seed = async function () {
  const validatedSurveyProgrammingPlan = await ProgrammingPlans()
    .where({ title: 'Plan de surveillance', status: 'Validated' })
    .first();

  const inProgressSurveyProgrammingPlan = await ProgrammingPlans()
    .where({ title: 'Plan de surveillance', status: 'InProgress' })
    .first();

  if (!validatedSurveyProgrammingPlan || !inProgressSurveyProgrammingPlan) {
    return;
  }

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01GF', 'STADE2', [14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01LB', oneOf(StageList), [0,0,0,0,0,0,0,0,0,0,4,2,3,3,2,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A000F', 'STADE1', [5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00QH', 'STADE3', [3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00QJ', oneOf(StageList), [3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01GG', 'STADE9', [7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00GE', oneOf(StageList), [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00FR', 'STADE3', [2,0,13,0,0,7,0,6,5,0,0,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00NE', oneOf(StageList), [0,0,5,0,0,4,10,0,5,0,0,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00SA', oneOf(StageList), [4,0,3,0,0,0,0,0,5,0,0,4,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00PH', oneOf(StageList), [0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01HG', oneOf(StageList), [3,0,0,0,2,0,0,0,5,0,9,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00KX', oneOf(StageList), [0,0,0,0,0,0,0,0,0,3,4,3,0,0,4,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A0DFB', 'STADE3', [9,5,0,5,0,6,0,0,6,5,2,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01JV', oneOf(StageList), [0,0,0,0,0,0,0,0,4,6,2,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00KT', oneOf(StageList), [0,0,3,0,0,3,0,0,4,4,0,9,3,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01LF', oneOf(StageList), [0,0,0,0,0,0,0,0,0,4,0,3,4,2,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00RE', oneOf(StageList), [3,0,6,0,0,5,3,4,4,0,3,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A00HC', oneOf(StageList), [6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A0D9Y', oneOf(StageList), [5,6,6,5,2,8,4,3,5,8,5,5,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A010C', oneOf(StageList), [0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01GN', oneOf(StageList), [6,0,0,5,5,0,0,5,10,0,7,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A0DEH', oneOf(StageList), [6,0,3,5,0,4,5,6,4,3,6,0,3,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01DP', oneOf(StageList), [6,0,2,2,0,3,0,0,2,4,5,2,5,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A001C', oneOf(StageList), [0,0,0,0,0,3,0,0,8,0,0,6,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A01BG', 'STADE2', [7,8,0,4,0,6,0,0,2,0,11,12,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(validatedSurveyProgrammingPlan.id,'A170R', oneOf(StageList), [0,6,0,0,4,0,0,0,0,7,0,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
  ]);

  // prettier-ignore
  await Prescriptions().insert([
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01GF', oneOf(StageList), [14,0,0,0,3,2,0,0,0,3,12,0,6,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01LB', oneOf(StageList), [0,0,0,0,0,0,0,0,0,0,4,2,3,3,2,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A000F', oneOf(StageList), [5,8,5,4,0,8,3,0,4,6,6,4,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00QH', oneOf(StageList), [3,3,5,3,2,6,7,3,6,9,3,4,2,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00QJ', oneOf(StageList), [3,0,4,0,0,6,3,0,3,5,3,4,2,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01GG', oneOf(StageList), [7,0,0,0,0,3,0,0,0,3,5,0,6,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00GE', oneOf(StageList), [0,0,5,0,3,6,4,0,4,3,0,3,0,2,3,2,0,5], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00FR', oneOf(StageList), [2,0,13,0,0,7,0,6,5,0,0,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00NE', oneOf(StageList), [0,0,5,0,0,4,10,0,5,0,0,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00SA', oneOf(StageList), [4,0,3,0,0,0,0,0,5,0,0,4,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00PH', oneOf(StageList), [0,7,0,4,0,3,4,4,4,9,5,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01HG', oneOf(StageList), [3,0,0,0,2,0,0,0,5,0,9,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00KX', oneOf(StageList), [0,0,0,0,0,0,0,0,0,3,4,3,0,0,4,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A0DFB', oneOf(StageList), [9,5,0,5,0,6,0,0,6,5,2,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01JV', oneOf(StageList), [0,0,0,0,0,0,0,0,4,6,2,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00KT', oneOf(StageList), [0,0,3,0,0,3,0,0,4,4,0,9,3,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01LF', oneOf(StageList), [0,0,0,0,0,0,0,0,0,4,0,3,4,2,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00RE', oneOf(StageList), [3,0,6,0,0,5,3,4,4,0,3,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A00HC', oneOf(StageList), [6,5,0,6,4,7,6,4,3,3,5,3,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A0D9Y', oneOf(StageList), [5,6,6,5,2,8,4,3,5,8,5,5,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A010C', oneOf(StageList), [0,0,0,0,0,0,0,0,2,0,3,5,4,4,3,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01GN', oneOf(StageList), [6,0,0,5,5,0,0,5,10,0,7,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A0DEH', oneOf(StageList), [6,0,3,5,0,4,5,6,4,3,6,0,3,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01DP', oneOf(StageList), [6,0,2,2,0,3,0,0,2,4,5,2,5,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A001C', oneOf(StageList), [0,0,0,0,0,3,0,0,8,0,0,6,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A01BG', oneOf(StageList), [7,8,0,4,0,6,0,0,2,0,11,12,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
    ...genPrescriptions(inProgressSurveyProgrammingPlan.id,'A170R', oneOf(StageList), [0,6,0,0,4,0,0,0,0,7,0,0,0,0,0,0,0,0], oneOf(DummyLaboratoryIds)),
  ]);
};
