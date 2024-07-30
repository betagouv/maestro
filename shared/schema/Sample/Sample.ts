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

export const SampleToCreate = z.object({
  sampledAt: z.union([z.string(), z.date()]).pipe(
    z.coerce.date({
      errorMap: () => ({
        message: 'La date de prélèvement est invalide.',
      }),
    })
  ),
  department: Department,
  geolocation: Geolocation.nullish(),
  parcel: z.string().nullish(),
  programmingPlanId: z
    .string()
    .uuid({
      message: 'Veuillez renseigner le contexte.',
    })
    .nullish(),
  legalContext: LegalContext,
  company: Company.nullish(),
  companySearch: z.string().nullish(),
  resytalId: z.string().nullish(),
  notesOnCreation: z.string().nullish(),
});

export const CreatedSample = SampleToCreate.extend({
  id: z.string().uuid(),
  reference: z.string(),
  createdAt: z.coerce.date(),
  sampler: Sampler,
  lastUpdatedAt: z.coerce.date(),
  status: SampleStatus,
});

export const Sample = CreatedSample.extend({
  geolocation: Geolocation,
  company: Company,
  sentAt: z.coerce.date().nullish(),
  receivedAt: z
    .union([z.string(), z.date()])
    .pipe(
      z.coerce.date({
        errorMap: () => ({
          message: 'La date de réception est invalide.',
        }),
      })
    )
    .nullish(),
  matrix: Matrix,
  matrixDetails: z.string().nullish(),
  matrixPart: MatrixPart,
  stage: Stage,
  cultureKind: CultureKind.nullish(),
  releaseControl: z.boolean().nullish(),
  items: z.array(SampleItem).min(1, {
    message: 'Veuillez renseigner au moins un échantillon.',
  }),
  notesOnMatrix: z.string().nullish(),
  notesOnItems: z.string().nullish(),
  notesOnAdmissibility: z.string().nullish(),
  laboratoryId: z.string().uuid(),
});

export const PartialSample = Sample.partial()
  .merge(CreatedSample)
  .extend({
    items: z.array(PartialSampleItem).nullish(),
  });

export type Geolocation = z.infer<typeof Geolocation>;
export type Sample = z.infer<typeof Sample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type CreatedSample = z.infer<typeof CreatedSample>;
export type PartialSample = z.infer<typeof PartialSample>;

export const getSampleRegion = (sample: PartialSample): Region | undefined =>
  RegionList.find((region) =>
    Regions[region].departments.includes(sample.department)
  );
