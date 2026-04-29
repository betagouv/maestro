import { z } from 'zod';
import { laboratoryShortNameValidator } from '../../referential/Laboratory';
import { SachaCommunicationMethod } from './SachaCommunicationMethod';

export const Laboratory = z.object({
  id: z.guid(),
  shortName: laboratoryShortNameValidator,
  name: z.string(),
  address: z.string(),
  postalCode: z.string(),
  city: z.string(),
  emails: z.array(z.email()),
  programmingPlanIds: z.array(z.guid()).nullish()
});

export type Laboratory = z.infer<typeof Laboratory>;

const SachaCommunication = z.discriminatedUnion('method', [
  z.object({
    method: z.literal(SachaCommunicationMethod.enum.EMAIL),
    email: z.email(),
    gpgPublicKey: z.string()
  }),
  z.object({
    method: z.literal(SachaCommunicationMethod.enum.SFTP),
    sftpLogin: z.string()
  })
]);

export const SachaConfig = z.object({
  activated: z.boolean(),
  sigle: z.string().nullable(),
  communication: SachaCommunication.nullable()
});
export type SachaConfig = z.infer<typeof SachaConfig>;

export const LaboratoryWithSacha = z.object({
  ...Laboratory.shape,
  legacyDai: z.boolean(),
  sacha: SachaConfig.nullable()
});

export type LaboratoryWithSacha = z.infer<typeof LaboratoryWithSacha>;

export const getLaboratoryFullName = (laboratory?: Laboratory): string =>
  laboratory
    ? `${laboratory.shortName} - ${laboratory.name}`
    : 'Information non disponible';
