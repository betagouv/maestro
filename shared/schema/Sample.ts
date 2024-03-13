import { z } from 'zod';
import { Department } from './Department';
import { SampleContext } from './SampleContext';
import { SampleStage } from './SampleStage';
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
  context: SampleContext,
  userLocation: UserLocation,
  locationSiret: z
    .string({
      required_error: 'Veuillez renseigner le SIRET du lieu de prélèvement.',
    })
    .regex(/^[0-9]{14}$/g, 'SIRET invalide.'),
  locationName: z.string().optional().nullable(),
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
  quantity: z.number({
    required_error: 'Veuillez renseigner la quantité.',
  }),
  quantityUnit: z.string({
    required_error: 'Veuillez renseigner l’unité de quantité.',
  }),
  cultureKind: z.string().optional().nullable(),
  compliance200263: z.boolean().optional().nullable(),
  storageCondition: SampleStorageCondition.optional().nullable(),
  pooling: z.boolean().optional().nullable(),
  releaseControl: z.boolean().optional().nullable(),
  sampleCount: z.number({
    required_error: 'Veuillez renseigner le nombre de prélèvements.',
  }),
  temperatureMaintenance: z.boolean().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  sealId: z.number({
    required_error: 'Veuillez renseigner le numéro de scellé.',
  }),
});

export const SampleToCreate = Sample.pick({
  userLocation: true,
  resytalId: true,
  context: true,
  department: true,
});

export const CreatedSample = SampleToCreate.merge(
  Sample.pick({
    id: true,
    reference: true,
    createdAt: true,
    createdBy: true,
  })
);

export const PartialSample = Sample.partial().merge(CreatedSample);

export const SampleUpdate = Sample.pick({
  matrixKind: true,
  matrix: true,
  matrixPart: true,
  stage: true,
  quantity: true,
  quantityUnit: true,
  cultureKind: true,
  compliance200263: true,
  storageCondition: true,
  pooling: true,
  releaseControl: true,
  sampleCount: true,
  temperatureMaintenance: true,
  expiryDate: true,
  locationSiret: true,
  sealId: true,
});

export const PartialSampleUpdate = SampleUpdate.partial();

export type UserLocation = z.infer<typeof UserLocation>;
export type Sample = z.infer<typeof Sample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type CreatedSample = z.infer<typeof CreatedSample>;
export type PartialSample = z.infer<typeof PartialSample>;
export type SampleUpdate = z.infer<typeof SampleUpdate>;
export type PartialSampleUpdate = z.infer<typeof PartialSampleUpdate>;
