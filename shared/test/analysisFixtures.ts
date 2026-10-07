import { fakerFR } from '@faker-js/faker';
import { OptionalBooleanList } from '../referential/OptionnalBoolean';
import { AnalyteList } from '../referential/Residue/Analyte';
import type {
  AnalysisToCreate,
  PartialAnalysis
} from '../schema/Analysis/Analysis';
import { AnalysisMethodList } from '../schema/Analysis/AnalysisMethod';
import { AnalysisStatusList } from '../schema/Analysis/AnalysisStatus';
import type { Analyte, PartialAnalyte } from '../schema/Analysis/Analyte';
import type {
  PartialResidue,
  ResidueChecked
} from '../schema/Analysis/Residue/Residue';
import { ResidueComplianceList } from '../schema/Analysis/Residue/ResidueCompliance';
import { oneOf } from './testFixtures';

export const genAnalysisToCreate = (
  data?: Partial<AnalysisToCreate>
): AnalysisToCreate => ({
  sampleId: crypto.randomUUID(),
  itemNumber: 1,
  copyNumber: 1,
  ...data
});

export const genPartialAnalysis = (
  data?: Omit<Partial<PartialAnalysis>, 'residues'> &
    Pick<PartialAnalysis, 'residues'>
): PartialAnalysis => ({
  ...genAnalysisToCreate(),
  id: crypto.randomUUID(),
  createdAt: new Date(),
  createdBy: crypto.randomUUID(),
  status: oneOf(AnalysisStatusList),
  compliance: null,
  notesOnCompliance: null,
  ...data
});

export const genPartialResidue = (
  data?: Partial<Omit<ResidueChecked, 'analytes'>> & {
    analytes?: PartialAnalyte[];
    unknownLabel?: string;
  }
): PartialResidue => ({
  analysisId: crypto.randomUUID(),
  residueNumber: fakerFR.number.int(99),
  analysisMethod: oneOf(AnalysisMethodList),
  result: fakerFR.number.int(99),
  resultKind: 'Q',
  resultHigherThanArfd: oneOf(OptionalBooleanList),
  substanceApproved: oneOf(OptionalBooleanList),
  substanceAuthorised: oneOf(OptionalBooleanList),
  pollutionRisk: oneOf(OptionalBooleanList),
  compliance: oneOf(ResidueComplianceList),
  contaminationSources: [],
  ...data
});

export const genPartialAnalyte = (data?: Partial<Analyte>): PartialAnalyte => ({
  analysisId: crypto.randomUUID(),
  residueNumber: fakerFR.number.int(99),
  analyteNumber: fakerFR.number.int(99),
  reference: oneOf(AnalyteList),
  ...data
});
