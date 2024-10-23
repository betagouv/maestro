import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { oneOf } from './testFixtures';

export const genProgrammingPlan = (
  data?: Partial<ProgrammingPlan>
): ProgrammingPlan => ({
  id: uuidv4(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  status: oneOf(ProgrammingPlanStatusList),
  year: 2024,
  ...data,
});
