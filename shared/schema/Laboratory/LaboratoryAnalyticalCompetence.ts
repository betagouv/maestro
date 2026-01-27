import { z } from 'zod';
import { OptionalBoolean } from '../../referential/OptionnalBoolean';
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
  isCompleteDefinitionAnalysis: OptionalBoolean.nullish(),
  detectionLimit: z.coerce.number().min(0).nullish(),
  quantificationLimit: z.coerce.number().min(0).nullish(),
  lastUpdatedAt: z.coerce.date()
});

export const LaboratoryAnalyticalCompetenceToSave = z.object({
  ...LaboratoryAnalyticalCompetence.omit({
    id: true,
    laboratoryId: true,
    lastUpdatedAt: true
  }).shape,
  analyteAnalyticalCompetences: z
    .array(
      LaboratoryAnalyticalCompetence.omit({
        laboratoryId: true,
        isCompleteDefinitionAnalysis: true,
        lastUpdatedAt: true
      })
    )
    .nullish()
});

export type LaboratoryAnalyticalCompetence = z.infer<
  typeof LaboratoryAnalyticalCompetence
>;
export type LaboratoryAnalyticalCompetenceToSave = z.infer<
  typeof LaboratoryAnalyticalCompetenceToSave
>;
