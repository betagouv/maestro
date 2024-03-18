import { z } from 'zod';
import { Department } from '../Department';
import { SampleLegalContext } from './SampleLegalContext';
import { SamplePlanningContext } from './SamplePlanningContext';
import { SampleStage } from './SampleStage';
import { SampleStatus } from './SampleStatus';
import { SampleStorageCondition } from './SampleStorageCondition';

export const UserLocation = z.object(
  {
    x: z.number(),
    y: z.number(),
  },
  {
    required_error: 'Veuillez renseigner la localisation.',
  }
);

export const Sample = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  department: Department,
  resytalId: z.coerce
    .string({
      required_error: "Veuillez renseigner l'identifiant Resytal.",
    })
    .regex(
      /^22[0-9]{6}$/g,
      "L'identifiant Resytal doit être au format 22XXXXXX."
    ),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  sampledAt: z.coerce.date({
    errorMap: () => ({
      message: 'La date de prélèvement est invalide.',
    }),
  }),
  sentAt: z.coerce.date().optional().nullable(),
  status: SampleStatus,
  planningContext: SamplePlanningContext,
  legalContext: SampleLegalContext,
  userLocation: UserLocation,
  locationSiret: z
    .string({
      required_error: 'Veuillez renseigner le SIRET du lieu de prélèvement.',
    })
    .regex(/^[0-9]{14}$/g, 'SIRET invalide.'),
  locationName: z.string({
    required_error: 'Veuillez renseigner le nom du lieu de prélèvement.',
  }),
  locationAddress: z.string().optional().nullable(),
  matrixKind: z.string({
    required_error: 'Veuillez renseigner la catégorie de matrice.',
  }),
  matrix: z.string({
    required_error: 'Veuillez renseigner la matrice.',
  }),
  matrixPart: z.string({
    required_error: 'Veuillez renseigner la partie du végétal.',
  }),
  stage: SampleStage,
  quantity: z
    .number({
      required_error: 'Veuillez renseigner la quantité.',
    })
    .nonnegative('La quantité doit être positive.'),
  quantityUnit: z.string({
    required_error: 'Veuillez renseigner l’unité de quantité.',
  }),
  cultureKind: z.string().optional().nullable(),
  compliance200263: z.boolean().optional().nullable(),
  storageCondition: SampleStorageCondition.optional().nullable(),
  pooling: z.boolean().optional().nullable(),
  releaseControl: z.boolean().optional().nullable(),
  sampleCount: z
    .number({
      required_error: 'Veuillez renseigner le nombre de prélèvements.',
    })
    .nonnegative('Le nombre de prélèvements doit être positif.'),
  temperatureMaintenance: z.boolean().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  sealId: z.coerce.number({
    required_error: 'Veuillez renseigner le numéro de scellé.',
    invalid_type_error: 'Le numéro de scellé doit être un nombre.',
  }),
  comment: z.string().optional().nullable(),
});

export const SampleToCreate = Sample.pick({
  userLocation: true,
  sampledAt: true,
  resytalId: true,
  planningContext: true,
  legalContext: true,
  department: true,
});

export const CreatedSample = SampleToCreate.merge(
  Sample.pick({
    id: true,
    reference: true,
    createdAt: true,
    createdBy: true,
    status: true,
  })
);

export const PartialSample = Sample.partial().merge(CreatedSample);

export type UserLocation = z.infer<typeof UserLocation>;
export type Sample = z.infer<typeof Sample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type CreatedSample = z.infer<typeof CreatedSample>;
export type PartialSample = z.infer<typeof PartialSample>;
