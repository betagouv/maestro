import { z } from 'zod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixPart } from '../../referential/MatrixPart';
import { Region, RegionList, Regions } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { Company } from '../Company/Company';
import { User } from '../User/User';
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

export const Sampler = User.pick({
  id: true,
  firstName: true,
  lastName: true,
});

export const Sample = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  department: Department,
  resytalId: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  sampler: Sampler,
  lastUpdatedAt: z.coerce.date(),
  sampledAt: z.union([z.string(), z.date()]).pipe(
    z.coerce.date({
      errorMap: () => ({
        message: 'La date de prélèvement est invalide.',
      }),
    })
  ),
  sentAt: z.coerce.date().optional().nullable(),
  receivedAt: z.coerce.date().optional().nullable(),
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
  company: Company,
  matrix: Matrix,
  matrixDetails: z.string().optional().nullable(),
  matrixPart: MatrixPart,
  stage: Stage,
  cultureKind: CultureKind.optional().nullable(),
  releaseControl: z.boolean().optional().nullable(),
  items: z.array(SampleItem).min(1, {
    message: 'Veuillez renseigner au moins un échantillon.',
  }),
  notesOnCreation: z.string().optional().nullable(),
  notesOnMatrix: z.string().optional().nullable(),
  notesOnItems: z.string().optional().nullable(),
  notesOnAdmissibility: z.string().optional().nullable(),
  laboratoryId: z.string().uuid(),
});

export const SampleToCreate = Sample.pick({
  sampledAt: true,
  department: true,
  geolocation: true,
  parcel: true,
  programmingPlanId: true,
  legalContext: true,
  company: true,
  resytalId: true,
  notesOnCreation: true,
});

export const CreatedSample = SampleToCreate.merge(
  Sample.pick({
    id: true,
    reference: true,
    createdAt: true,
    sampler: true,
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
