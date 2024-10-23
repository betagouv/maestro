import { v4 as uuidv4 } from 'uuid';
import { MatrixList } from '../referential/Matrix/Matrix';
import { RegionList } from '../referential/Region';
import { StageList } from '../referential/Stage';
import { Prescription } from '../schema/Prescription/Prescription';
import { ContextList } from '../schema/ProgrammingPlan/Context';
import { genNumber, oneOf } from './testFixtures';

export const genPrescriptions = (
  data?: Partial<Prescription>,
  countArray?: number[]
): Prescription[] =>
  (countArray ?? new Array(18).fill(genNumber(1))).map((count, index) => ({
    id: uuidv4(),
    programmingPlanId: uuidv4(),
    context: oneOf(ContextList),
    region: RegionList[index],
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)],
    sampleCount: count,
    ...data,
  }));
