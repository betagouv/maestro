import { v4 as uuidv4 } from 'uuid';
import {
  Analysis,
  AnalysisToCreate,
  PartialAnalysis,
} from '../schema/Analysis/Analysis';
import { PartialResidue, Residue } from '../schema/Analysis/Residue';
import { ResultKindList } from '../schema/Analysis/ResultKind';
import { genNumber, oneOf } from './testFixtures';

export const genAnalysisToCreate = (
  data?: Partial<AnalysisToCreate>
): AnalysisToCreate => ({
  sampleId: uuidv4(),
  documentId: uuidv4(),
  ...data,
});

export const genPartialAnalysis = (
  data?: Omit<Partial<Analysis>, 'residues'> & Pick<PartialAnalysis, 'residues'>
): PartialAnalysis => ({
  ...genAnalysisToCreate(),
  id: uuidv4(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  ...data,
});

export const genPartialResidue = (data?: Partial<Residue>): PartialResidue => ({
  analysisId: uuidv4(),
  residueNumber: genNumber(2),
  kind: oneOf(ResultKindList),
  ...data,
});
