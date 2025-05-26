import { uniqBy } from 'lodash-es';
import { z } from 'zod';
import { AnimalKind } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { BreedingMethod } from '../../referential/BreedingMethod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { OutdoorAccess } from '../../referential/OutdoorAccess';
import { ProductionKind } from '../../referential/ProductionKind';
import { Region } from '../../referential/Region';
import { Seizure } from '../../referential/Seizure';
import { Species } from '../../referential/Species';
import { Stage } from '../../referential/Stage';
import { TargetingCriteria } from '../../referential/TargetingCriteria';
import { Company } from '../Company/Company';
import { Context } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { BaseUser } from '../User/User';
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

export const Sampler = BaseUser.pick({
  id: true,
  firstName: true,
  lastName: true
});

export const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.Values.PPV),
  matrixDetails: z.string().nullish(),
  matrixPart: MatrixPart,
  cultureKind: CultureKind.nullish(),
  releaseControl: z.boolean().nullish()
});

const SampleMatrixSpecificDataPFAS = z.object({
  programmingPlanKind: z
    .literal(ProgrammingPlanKind.Values.PFAS_EGGS)
    .or(z.literal(ProgrammingPlanKind.Values.PFAS_MEAT)),
  species: Species,
  targetingCriteria: TargetingCriteria,
  notesOnTargetingCriteria: z.string().nullish(),
  animalKind: AnimalKind,
  animalIdentifier: z
    .string({
      required_error: "Veuillez renseigner l'identifiant du lot ou de l'animal."
    })
    .min(1, "Veuillez renseigner l'identifiant du lot ou de l'animal."),
  breedingMethod: BreedingMethod,
  age: z.coerce
    .number({
      invalid_type_error: "Veuillez renseigner l'âge de l'animal.",
      required_error: "Veuillez renseigner l'âge de l'animal."
    })
    .int()
    .nonnegative(),
  sex: AnimalSex,
  seizure: Seizure.nullish(),
  outdoorAccess: OutdoorAccess
});

export const SampleMatrixSpecificDataPFASEggs =
  SampleMatrixSpecificDataPFAS.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.Values.PFAS_EGGS)
  });

export const SampleMatrixSpecificDataPFASMeat =
  SampleMatrixSpecificDataPFAS.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.Values.PFAS_MEAT),
    killingCode: z
      .string({
        required_error: 'Veuillez renseigner le code tuerie.'
      })
      .min(1, 'Veuillez renseigner le code tuerie.'),
    productionKind: ProductionKind
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
  geolocation: Geolocation.nullish(),
  department: Department.nullish(),
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
  stage: Stage,
  notesOnMatrix: z.string().nullish(),
  prescriptionId: z.string().uuid(),
  laboratoryId: z.string().uuid().nullish(),
  documentIds: z.array(z.string().uuid()).nullish(),
  specificData: SampleMatrixSpecificData
});

const SampleItemsData = z.object({
  items: z
    .array(SampleItem)
    .min(1, { message: 'Veuillez renseigner au moins un échantillon.' })
    .refine(
      (items) => uniqBy(items, (item) => item.sealId).length === items.length,
      'Les numéros de scellés doivent être uniques.'
    ),
  notesOnItems: z.string().nullish()
});

const SampleAdmissibilityData = z.object({
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

export const PartialSampleMatrixData = z.object({
  ...SampleMatrixData.partial().shape,
  specificData: PartialSampleMatrixSpecificData
});

export const PartialSampleToCreate = z.object({
  ...SampleContextData.partial().required({
    id: true,
    programmingPlanId: true,
    status: true
  }).shape,
  sampledAt: SampleContextData.shape.sampledAt.nullish(),
  ...PartialSampleMatrixData.shape,
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
  department: Department,
  company: Company,
  laboratoryId: z.string().uuid(),
  items: z.array(SampleItem)
});

export type Geolocation = z.infer<typeof Geolocation>;
export type SampleContextData = z.infer<typeof SampleContextData>;
export type SampleMatrixData = z.infer<typeof SampleMatrixData>;
export type SampleOwnerData = z.infer<typeof SampleOwnerData>;
export type CreatedSampleData = z.infer<typeof CreatedSampleData>;
export type PartialSampleMatrixData = z.infer<typeof PartialSampleMatrixData>;
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
