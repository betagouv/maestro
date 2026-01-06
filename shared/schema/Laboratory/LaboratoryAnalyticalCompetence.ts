import { z } from 'zod';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { AnalysisMethod } from '../Analysis/AnalysisMethod';
import { LaboratoryAnalyticalMethod } from './LaboratoryAnalyticalMethod';
import { LaboratoryValidationMethod } from './LaboratoryValidationMethod';

export const LaboratoryAnalyticalCompetence = z.object({
  id: z.guid(),
  laboratoryId: z.guid(),
  residueReference: SSD2Id,
  analyteReference: SSD2Id.nullish(),
  analyticalMethod: LaboratoryAnalyticalMethod.nullish(),
  validationMethod: LaboratoryValidationMethod.nullish(),
  analysisMethod: AnalysisMethod.nullish(),
  isCompleteDefinitionAnalysis: z.boolean().nullish(),
  detectionLimit: z.coerce.number().min(0).nullish(),
  quantificationLimit: z.coerce.number().min(0).nullish()
});

export type LaboratoryAnalyticalCompetence = z.infer<
  typeof LaboratoryAnalyticalCompetence
>;
