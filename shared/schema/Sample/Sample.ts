import { z } from 'zod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixPart } from '../../referential/MatrixPart';
import { Region, RegionList, Regions } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { StorageCondition } from '../../referential/StorageCondition';
import { PartialSampleItem, SampleItemRefinement } from './SampleItem';
import { SampleStatus } from './SampleStatus';

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
  resytalId: z.preprocess(
    (arg) => (arg === '' ? null : arg),
    z.coerce
      .string()
      .regex(
        /^22[0-9]{6}$/g,
        "L'identifiant Resytal doit être au format 22XXXXXX."
      )
      .optional()
      .nullable()
  ),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  lastUpdatedAt: z.coerce.date(),
  sampledAt: z.coerce.date({
    errorMap: () => ({
      message: 'La date de prélèvement est invalide.',
    }),
  }),
  sentAt: z.coerce.date().optional().nullable(),
  status: SampleStatus,
  programmingPlanId: z
    .string({
      required_error: 'Veuillez renseigner le contexte.',
    })
    .uuid(),
  legalContext: LegalContext,
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
  matrix: Matrix,
  matrixDetails: z.string().optional().nullable(),
  matrixPart: MatrixPart,
  stage: Stage,
  cultureKind: CultureKind,
  storageCondition: StorageCondition.optional().nullable(),
  releaseControl: z.boolean().optional().nullable(),
  items: z.array(SampleItemRefinement).min(1, {
    message: 'Veuillez renseigner au moins un échantillon.',
  }),
  temperatureMaintenance: z.boolean().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  comment: z.string().optional().nullable(),
});

export const SampleToCreate = Sample.pick({
  userLocation: true,
  sampledAt: true,
  resytalId: true,
  programmingPlanId: true,
  legalContext: true,
  department: true,
});

export const CreatedSample = SampleToCreate.merge(
  Sample.pick({
    id: true,
    reference: true,
    createdAt: true,
    createdBy: true,
    lastUpdatedAt: true,
    status: true,
  })
);

export const PartialSample = Sample.partial()
  .merge(CreatedSample)
  .merge(
    z.object({
      items: z.array(PartialSampleItem).optional().nullable(),
    })
  );

export type UserLocation = z.infer<typeof UserLocation>;
export type Sample = z.infer<typeof Sample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type CreatedSample = z.infer<typeof CreatedSample>;
export type PartialSample = z.infer<typeof PartialSample>;

export const getSampleRegion = (sample: PartialSample): Region | undefined =>
  RegionList.find((region) =>
    Regions[region].departments.includes(sample.department)
  );
