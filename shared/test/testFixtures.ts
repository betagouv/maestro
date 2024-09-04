import { fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { Matrix, MatrixList } from '../referential/Matrix/Matrix';
import { RegionList } from '../referential/Region';
import { Stage, StageList } from '../referential/Stage';
import { AnalysisKindList } from '../schema/Analysis/AnalysisKind';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { Prescription } from '../schema/Prescription/Prescription';
import { Substance } from '../schema/Substance/Substance';
import { SubstanceAnalysis } from '../schema/Substance/SubstanceAnalysis';

export const genNumber = (length = 10) => {
  return Number(
    randomstring.generate({
      length,
      charset: 'numeric',
    })
  );
};

export const genBoolean = () => Math.random() < 0.5;

export const genSiret = () =>
  randomstring.generate({
    length: 14,
    charset: '123456789',
  });

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const genPrescriptions = (
  programmingPlanId: string,
  matrix?: Matrix,
  stages?: string[],
  countArray?: number[],
  laboratoryId?: string
): Prescription[] =>
  (countArray ?? new Array(18).fill(genNumber(1))).map((count, index) => ({
    id: uuidv4(),
    programmingPlanId,
    region: RegionList[index],
    matrix: matrix ?? oneOf(MatrixList),
    stages: (stages as Stage[]) ?? [oneOf(StageList)],
    sampleCount: count,
    laboratoryId,
  }));

export const genLaboratory = (): Laboratory => ({
  id: uuidv4(),
  name: randomstring.generate(),
  email: fakerFR.internet.email(),
});

export const genSubstance = (): Substance => ({
  code: randomstring.generate(),
  label: randomstring.generate(),
});

export const genSubstanceAnalysis = (
  data: Partial<SubstanceAnalysis>
): SubstanceAnalysis => ({
  matrix: oneOf(MatrixList),
  substance: genSubstance(),
  kind: oneOf(AnalysisKindList),
  year: 2024,
  ...data,
});
