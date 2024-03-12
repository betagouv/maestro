import { z } from 'zod';
import { SampleContext } from './SampleContext';
export const Sample = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  department: z.string(),
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
  userLocation: z.object(
    {
      x: z.number(),
      y: z.number(),
    },
    {
      required_error: 'Veuillez renseigner la localisation.',
    }
  ),
  locationSiret: z.string(),
  locationName: z.string(),
  locationAddress: z.string(),
  matrix: z.string(),
  matrixKind: z.string(),
  matrixPart: z.string(),
  quantity: z.number(),
  quantityUnit: z.string(),
  cultureKind: z.string().optional(),
  compliance200263: z.boolean().optional(),
  storageCondition: z.string().optional(),
  pooling: z.boolean().optional(),
  releaseControl: z.boolean().optional(),
  sampleCount: z.number().optional(),
  temperatureMaintenance: z.boolean().optional(),
  expiryDate: z.date().optional(),
  sealId: z.number().optional(),
});

export const SampleToCreate = Sample.pick({
  userLocation: true,
  resytalId: true,
  context: true,
});

export type Sample = z.infer<typeof Sample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
