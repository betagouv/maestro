import _ from 'lodash';
import { z } from 'zod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixPart } from '../../referential/MatrixPart';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { Company } from '../Company/Company';
import { Context } from '../ProgrammingPlan/Context';
import { User } from '../User/User';
import { PartialSampleItem, SampleItem } from './SampleItem';
import { SampleStatus } from './SampleStatus';

export const Geolocation = z.object(
  {
    x: z.number(),
    y: z.number()
  },
  {
    required_error: 'Veuillez renseigner la localisation.'
  }
);

export const Sampler = User.pick({
  id: true,
  firstName: true,
  lastName: true
});

export const SampleContextData = z.object({
  id: z.string().uuid(),
  sampledAt: z.union([z.string(), z.date()]).pipe(
    z.coerce.date({
      errorMap: () => ({
        message: 'La date de prélèvement est invalide.'
      })
    })
  ),
  department: Department,
  geolocation: Geolocation.nullish(),
  parcel: z.string().nullish(),
  programmingPlanId: z.string().uuid(),
  context: Context,
  legalContext: LegalContext,
  company: Company.nullish(),
  companyOffline: z.string().nullish(),
  resytalId: z.string().nullish(),
  notesOnCreation: z.string().nullish(),
  status: SampleStatus
});

export const SampleMatrixData = z.object({
  matrix: Matrix,
  matrixDetails: z.string().nullish(),
  matrixPart: MatrixPart,
  stage: Stage,
  cultureKind: CultureKind.nullish(),
  releaseControl: z.boolean().nullish(),
  notesOnMatrix: z.string().nullish(),
  prescriptionId: z.string().uuid(),
  laboratoryId: z.string().uuid().nullish()
});

export const SampleItemsData = z.object({
  items: z
    .array(SampleItem)
    .min(1, { message: 'Veuillez renseigner au moins un échantillon.' })
    .refine(
      (items) => _.uniqBy(items, (item) => item.sealId).length === items.length,
      'Les numéros de scellés doivent être uniques.'
    ),
  notesOnItems: z.string().nullish()
});

export const SampleAdmissibilityData = z.object({
  sentAt: z.coerce.date().nullish(),
  receivedAt: z
    .union([z.string(), z.date()])
    .pipe(
      z.coerce.date({
        errorMap: () => ({
          message: 'La date de réception est invalide.'
        })
      })
    )
    .nullish(),
  notesOnAdmissibility: z.string().nullish()
});

export const PartialSampleToCreate = z.object({
  ...SampleContextData.shape,
  ...SampleMatrixData.partial().shape,
  ...SampleItemsData.partial().shape,
  ...SampleAdmissibilityData.partial().shape,
  items: z.array(PartialSampleItem).nullish()
});

export const SampleToCreate = z.object({
  ...SampleContextData.shape,
  ...SampleMatrixData.shape,
  ...SampleItemsData.shape,
  ...SampleAdmissibilityData.shape
});

export const CreatedSampleData = z.object({
  reference: z.string(),
  region: Region,
  createdAt: z.coerce.date(),
  sampler: Sampler,
  lastUpdatedAt: z.coerce.date()
});

export const PartialSample = PartialSampleToCreate.extend({
  ...CreatedSampleData.shape
});

export const Sample = SampleToCreate.extend({
  ...CreatedSampleData.shape,
  geolocation: Geolocation,
  company: Company,
  laboratoryId: z.string().uuid()
});

export type Geolocation = z.infer<typeof Geolocation>;
export type SampleContextData = z.infer<typeof SampleContextData>;
export type SampleMatrixData = z.infer<typeof SampleMatrixData>;
export type SampleItemsData = z.infer<typeof SampleItemsData>;
export type CreatedSampleData = z.infer<typeof CreatedSampleData>;
export type PartialSampleToCreate = z.infer<typeof PartialSampleToCreate>;
export type PartialSample = z.infer<typeof PartialSample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type Sample = z.infer<typeof Sample>;

export const isCreatedPartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
): partialSample is PartialSample =>
  partialSample !== undefined &&
  CreatedSampleData.safeParse(partialSample).success;

export const isCreatedSample = (
  sample?: Sample | SampleToCreate
): sample is Sample => CreatedSampleData.safeParse(sample).success;
