import { z } from 'zod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixPart } from '../../referential/MatrixPart';
import { Region, RegionList, Regions } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { Company } from '../Company/Company';
import { PartialSampleItem, SampleItem } from './SampleItem';
import { SampleStatus } from './SampleStatus';

export const Geolocation = z.object(
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
  resytalId: z.string().optional().nullable(),
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
    .string()
    .uuid({
      message: 'Veuillez renseigner le contexte.',
    })
    .optional()
    .nullable(),
  legalContext: LegalContext,
  geolocation: Geolocation,
  parcel: z.string().optional().nullable(),
  company: Company.optional().nullable(),
  matrix: Matrix,
  matrixDetails: z.string().optional().nullable(),
  matrixPart: MatrixPart,
  stage: Stage,
  cultureKind: CultureKind,
  releaseControl: z.boolean().optional().nullable(),
  items: z.array(SampleItem).min(1, {
    message: 'Veuillez renseigner au moins un échantillon.',
  }),
  commentCreation: z.string().optional().nullable(),
  commentCompany: z.string().optional().nullable(),
  commentInfos: z.string().optional().nullable(),
  commentItems: z.string().optional().nullable(),
  laboratoryId: z.string().uuid().optional().nullable(),
});

export const SampleToCreate = Sample.pick({
  geolocation: true,
  sampledAt: true,
  resytalId: true,
  programmingPlanId: true,
  legalContext: true,
  department: true,
  parcel: true,
  commentCreation: true,
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

export type Geolocation = z.infer<typeof Geolocation>;
export type Sample = z.infer<typeof Sample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type CreatedSample = z.infer<typeof CreatedSample>;
export type PartialSample = z.infer<typeof PartialSample>;

export const getSampleRegion = (sample: PartialSample): Region | undefined =>
  RegionList.find((region) =>
    Regions[region].departments.includes(sample.department)
  );
