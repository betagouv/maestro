import _ from 'lodash';
import { z } from 'zod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { Region } from '../../referential/Region';
import { Species } from '../../referential/Species';
import { Stage } from '../../referential/Stage';
import { Company } from '../Company/Company';
import { Context } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
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

export const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.Values.PPV),
  matrixDetails: z.string().nullish(),
  matrixPart: MatrixPart,
  stage: Stage,
  cultureKind: CultureKind.nullish(),
  releaseControl: z.boolean().nullish()
});

export const SampleMatrixSpecificDataPFAS = z.object({
  programmingPlanKind: z
    .literal(ProgrammingPlanKind.Values.PFAS_EGGS)
    .or(z.literal(ProgrammingPlanKind.Values.PFAS_MEAT)),
  species: Species,
  targetingCriteria: z.string(),
  notesOnTargetingCriteria: z.string().nullish(),
  animalKind: z.string(),
  productionKind: z.string(),
  identifier: z.string(),
  breedingMethod: z.string(),
  age: z.string(),
  sex: z.string(),
  seizure: z.boolean().nullish(),
  outdoorAccess: z.boolean().nullish()
});

export const SampleMatrixSpecificDataPFASEggs =
  SampleMatrixSpecificDataPFAS.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.Values.PFAS_EGGS),
    stage: Stage
  });

export const SampleMatrixSpecificDataPFASMeat =
  SampleMatrixSpecificDataPFAS.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.Values.PFAS_MEAT),
    killingCode: z.string()
  });

const SampleMatrixSpecificData = z.discriminatedUnion(
  'programmingPlanKind',
  [
    SampleMatrixSpecificDataPPV,
    SampleMatrixSpecificDataPFASEggs,
    SampleMatrixSpecificDataPFASMeat
  ],
  {
    errorMap: () => ({ message: 'Veuillez renseigner le type de plan.' })
  }
);

const PartialSampleMatrixSpecificData = z.discriminatedUnion(
  'programmingPlanKind',
  [
    SampleMatrixSpecificDataPPV.partial().required({
      programmingPlanKind: true
    }),
    SampleMatrixSpecificDataPFASEggs.partial().required({
      programmingPlanKind: true
    }),
    SampleMatrixSpecificDataPFASMeat.partial().required({
      programmingPlanKind: true
    })
  ],
  {
    errorMap: () => ({ message: 'Veuillez renseigner le type de plan.' })
  }
);

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
  status: SampleStatus,
  specificData: PartialSampleMatrixSpecificData
});

export const SampleMatrixData = z.object({
  matrixKind: MatrixKind,
  matrix: Matrix,
  notesOnMatrix: z.string().nullish(),
  prescriptionId: z.string().uuid(),
  laboratoryId: z.string().uuid().nullish(),
  documentIds: z.array(z.string().uuid()).nullish(),
  specificData: SampleMatrixSpecificData
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

export const SampleOwnerData = z.object({
  ownerFirstName: z.string().nullish(),
  ownerLastName: z.string().nullish(),
  ownerEmail: z
    .string()
    .email("L'adresse email du détenteur est invalide.")
    .nullish(),
  ownerAgreement: z.boolean({
    required_error: "Veuillez renseigner l'accord du détenteur."
  }),
  notesOnOwnerAgreement: z.string().nullish()
});

export const PartialSampleToCreate = z.object({
  ...SampleContextData.partial().required({
    id: true,
    programmingPlanId: true,
    status: true
  }).shape,
  sampledAt: SampleContextData.shape.sampledAt.nullish(),
  ...SampleMatrixData.partial().shape,
  specificData: PartialSampleMatrixSpecificData,
  ...SampleItemsData.partial().shape,
  ...SampleAdmissibilityData.partial().shape,
  ...SampleOwnerData.partial().shape,
  items: z.array(PartialSampleItem).nullish()
});

export const SampleToCreate = z.object({
  ...SampleContextData.shape,
  ...SampleMatrixData.shape,
  ...SampleItemsData.shape,
  ...SampleAdmissibilityData.shape,
  ...SampleOwnerData.shape
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
  laboratoryId: z.string().uuid(),
  items: z.array(SampleItem)
});

export type Geolocation = z.infer<typeof Geolocation>;
export type SampleContextData = z.infer<typeof SampleContextData>;
export type SampleMatrixSpecificData = z.infer<typeof SampleMatrixSpecificData>;
export type SampleMatrixData = z.infer<typeof SampleMatrixData>;
export type SampleItemsData = z.infer<typeof SampleItemsData>;
export type SampleOwnerData = z.infer<typeof SampleOwnerData>;
export type CreatedSampleData = z.infer<typeof CreatedSampleData>;
export type PartialSampleToCreate = z.infer<typeof PartialSampleToCreate>;
export type PartialSample = z.infer<typeof PartialSample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type Sample = z.infer<typeof Sample>;
export type PartialSampleMatrixSpecificData = z.infer<
  typeof PartialSampleMatrixSpecificData
>;

export const isCreatedPartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
): partialSample is PartialSample =>
  partialSample !== undefined &&
  CreatedSampleData.safeParse(partialSample).success;

export const isCreatedSample = (
  sample?: Sample | SampleToCreate
): sample is Sample => CreatedSampleData.safeParse(sample).success;
