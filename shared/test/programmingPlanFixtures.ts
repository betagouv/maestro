import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlanKindList } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { oneOf } from './testFixtures';

export const genProgrammingPlan = (
  data?: Partial<ProgrammingPlan>
): ProgrammingPlan => ({
  id: uuidv4(),
  title: randomstring.generate(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  kind: oneOf(ProgrammingPlanKindList),
  status: oneOf(ProgrammingPlanStatusList),
  ...data,
});
