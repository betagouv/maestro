import { v4 as uuidv4 } from 'uuid';
import { OptionalBooleanList } from '../referential/OptionnalBoolean';
import { AnalyteList } from '../referential/Residue/Analyte';
import {
  Analysis,
  AnalysisToCreate,
  PartialAnalysis
} from '../schema/Analysis/Analysis';
import { AnalysisMethodList } from '../schema/Analysis/AnalysisMethod';
import { AnalysisStatusList } from '../schema/Analysis/AnalysisStatus';
import { Analyte, PartialAnalyte } from '../schema/Analysis/Analyte';
import { PartialResidue, Residue } from '../schema/Analysis/Residue/Residue';
import { ResidueComplianceList } from '../schema/Analysis/Residue/ResidueCompliance';
import { genNumber, oneOf } from './testFixtures';

export const genAnalysisToCreate = (
  data?: Partial<AnalysisToCreate>
): AnalysisToCreate => ({
  sampleId: uuidv4(),
  reportDocumentId: uuidv4(),
  ...data
});

export const genPartialAnalysis = (
  data?: Omit<Partial<Analysis>, 'residues'> & Pick<PartialAnalysis, 'residues'>
): PartialAnalysis => ({
  ...genAnalysisToCreate(),
  id: uuidv4(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  status: oneOf(AnalysisStatusList),
  ...data
});

export const genPartialResidue = (
  data?: Partial<Omit<Residue, 'analytes'>> & { analytes?: PartialAnalyte[] }
): PartialResidue => ({
  analysisId: uuidv4(),
  residueNumber: genNumber(2),
  analysisMethod: oneOf(AnalysisMethodList),
  result: genNumber(2),
  resultHigherThanArfd: oneOf(OptionalBooleanList),
  substanceApproved: oneOf(OptionalBooleanList),
  substanceAuthorised: oneOf(OptionalBooleanList),
  pollutionRisk: oneOf(OptionalBooleanList),
  compliance: oneOf(ResidueComplianceList),
  ...data
});

export const genPartialAnalyte = (data?: Partial<Analyte>): PartialAnalyte => ({
  analysisId: uuidv4(),
  residueNumber: genNumber(2),
  analyteNumber: genNumber(2),
  reference: oneOf(AnalyteList),
  ...data
});
