import { v4 as uuidv4 } from 'uuid';
import { OptionalBooleanList } from '../referential/OptionnalBoolean';
import {
  Analysis,
  AnalysisToCreate,
  PartialAnalysis,
} from '../schema/Analysis/Analysis';
import { AnalysisStatusList } from '../schema/Analysis/AnalysisStatus';
import { PartialResidue, Residue } from '../schema/Analysis/Residue/Residue';
import { ResidueComplianceList } from '../schema/Analysis/Residue/ResidueCompliance';
import { ResidueKindList } from '../schema/Analysis/Residue/ResidueKind';
import { genNumber, oneOf } from './testFixtures';

export const genAnalysisToCreate = (
  data?: Partial<AnalysisToCreate>
): AnalysisToCreate => ({
  sampleId: uuidv4(),
  reportDocumentId: uuidv4(),
  ...data,
});

export const genPartialAnalysis = (
  data?: Omit<Partial<Analysis>, 'residues'> & Pick<PartialAnalysis, 'residues'>
): PartialAnalysis => ({
  ...genAnalysisToCreate(),
  id: uuidv4(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  status: oneOf(AnalysisStatusList),
  ...data,
});

export const genPartialResidue = (data?: Partial<Residue>): PartialResidue => ({
  analysisId: uuidv4(),
  residueNumber: genNumber(2),
  kind: oneOf(ResidueKindList),
  result: genNumber(2),
  resultHigherThanArfd: oneOf(OptionalBooleanList),
  substanceApproved: oneOf(OptionalBooleanList),
  substanceAuthorised: oneOf(OptionalBooleanList),
  pollutionRisk: oneOf(OptionalBooleanList),
  compliance: oneOf(ResidueComplianceList),
  ...data,
});
