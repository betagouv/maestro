import { z } from 'zod';
import { laboratoryShortNameValidator } from '../../referential/Laboratory';

export const Laboratory = z.object({
  id: z.guid(),
  shortName: laboratoryShortNameValidator,
  name: z.string(),
  address: z.string(),
  postalCode: z.string(),
  city: z.string(),
  billingAddress: z.string().nullish(),
  billingPostalCode: z.string().nullish(),
  billingCity: z.string().nullish(),
  emails: z.array(z.email()),
  programmingPlanIds: z.array(z.guid()).nullish()
});

export type Laboratory = z.infer<typeof Laboratory>;

export const SachaConfig = z.object({
  activated: z.boolean(),
  sigle: z.string().nullable(),
  recipientEmail: z.email().nullable()
});
export type SachaConfig = z.infer<typeof SachaConfig>;

export const LaboratoryWithSacha = z.object({
  ...Laboratory.shape,
  emailsAnalysisResult: z.array(z.email()),
  legacyDai: z.boolean(),
  sacha: SachaConfig.nullable()
});

export type LaboratoryWithSacha = z.infer<typeof LaboratoryWithSacha>;

const LaboratoryConfigUpdateBase = z.object({
  emails: z.array(z.email()),
  emailsAnalysisResult: z.array(z.email())
});

export const LaboratoryConfigUpdate = z.discriminatedUnion('legacyDai', [
  z.object({
    ...LaboratoryConfigUpdateBase.shape,
    legacyDai: z.literal(true),
    sacha: z.null()
  }),
  z.object({
    ...LaboratoryConfigUpdateBase.shape,
    legacyDai: z.literal(false),
    sacha: SachaConfig.nullable()
  })
]);
export type LaboratoryConfigUpdate = z.infer<typeof LaboratoryConfigUpdate>;

export const getLaboratoryFullName = (laboratory?: Laboratory): string =>
  laboratory
    ? `${laboratory.shortName} - ${laboratory.name}`
    : 'Information non disponible';
