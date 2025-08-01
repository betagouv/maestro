import { isNil, uniqBy } from 'lodash-es';

import { CheckFn } from 'zod/dist/types/v4/core';
import { z } from 'zod/v4';
import { AnimalKind } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { BreedingMethod } from '../../referential/BreedingMethod';
import { CultureKind } from '../../referential/CultureKind';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix, MatrixList } from '../../referential/Matrix/Matrix';
import {
  MatrixKind,
  OtherMatrixKind
} from '../../referential/Matrix/MatrixKind';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { OutdoorAccess } from '../../referential/OutdoorAccess';
import { ProductionKind } from '../../referential/ProductionKind';
import { Region } from '../../referential/Region';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { Seizure } from '../../referential/Seizure';
import { Species } from '../../referential/Species';
import { Stage } from '../../referential/Stage';
import { TargetingCriteria } from '../../referential/TargetingCriteria';
import { isDefined } from '../../utils/utils';
import { Company } from '../Company/Company';
import {
  Context,
  OutsideProgrammingPlanContext,
  ProgrammingPlanContext
} from '../ProgrammingPlan/Context';
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
    error: (issue) =>
      isNil(issue.input)
        ? 'Veuillez renseigner la localisation.'
        : issue.message
  }
);

const Sampler = BaseUser.pick({
  id: true,
  firstName: true,
  lastName: true
});

export const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PPV),
  matrixDetails: z.string().nullish(),
  matrixPart: MatrixPart,
  cultureKind: CultureKind,
  releaseControl: z.boolean().nullish()
});

const SampleMatrixSpecificDataPFAS = z.object({
  programmingPlanKind: z
    .literal(ProgrammingPlanKind.enum.PFAS_EGGS)
    .or(z.literal(ProgrammingPlanKind.enum.PFAS_MEAT)),
  species: Species,
  targetingCriteria: TargetingCriteria,
  notesOnTargetingCriteria: z.string().nullish(),
  animalKind: AnimalKind,
  animalIdentifier: z
    .string({
      error: (issue) =>
        isNil(issue.input)
          ? "Veuillez renseigner l'identifiant du lot ou de l'animal."
          : issue.message
    })
    .min(1, "Veuillez renseigner l'identifiant du lot ou de l'animal."),
  breedingMethod: BreedingMethod,
  age: z.coerce
    .number({ error: "Veuillez renseigner l'âge de l'animal." })
    .int()
    .nonnegative(),
  sex: AnimalSex,
  seizure: Seizure.nullish(),
  outdoorAccess: OutdoorAccess
});

export const SampleMatrixSpecificDataPFASEggs =
  SampleMatrixSpecificDataPFAS.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PFAS_EGGS)
  });

export const SampleMatrixSpecificDataPFASMeat =
  SampleMatrixSpecificDataPFAS.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PFAS_MEAT),
    killingCode: z
      .string({
        error: (issue) =>
          isNil(issue.input)
            ? 'Veuillez renseigner le code tuerie.'
            : issue.message
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
    error: () => 'Veuillez renseigner le type de plan.'
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
    error: () => 'Veuillez renseigner le type de plan.'
  }
);

export const SampleContextData = z.object({
  id: z.guid(),
  sampledAt: z.union([z.string(), z.date()]).pipe(
    z.coerce.date({
      error: () => 'La date de prélèvement est invalide.'
    })
  ),
  sampler: Sampler,
  geolocation: Geolocation.nullish(),
  department: Department.nullish(),
  parcel: z.string().nullish(),
  programmingPlanId: z.guid(),
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
  matrixKind: z.union([MatrixKind, OtherMatrixKind], {
    error: (issue) =>
      isNil(issue.input)
        ? 'Veuillez renseigner la catégorie de matrice programmée.'
        : issue.message
  }),
  matrix: z.union([Matrix, z.string().nonempty()], {
    error: (issue) =>
      isNil(issue.input) ? 'Veuillez renseigner la matrice.' : issue.message
  }),
  stage: Stage,
  notesOnMatrix: z.string().nullish(),
  prescriptionId: z.guid().nullish(),
  laboratoryId: z.guid().nullish(),
  monoSubstances: z.array(SSD2Id).nullish(),
  multiSubstances: z.array(SSD2Id).nullish(),
  documentIds: z.array(z.guid()).nullish(),
  specificData: SampleMatrixSpecificData
});

export const sampleMatrixCheck: CheckFn<{
  matrixKind: MatrixKind | 'Other';
  matrix: Matrix | string;
}> = (ctx) => {
  if (
    ctx.value.matrixKind !== 'Other' &&
    !Matrix.safeParse(ctx.value.matrix).success
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'invalid_value',
      values: MatrixList,
      path: ['matrix']
    });
  }
};

export const prescriptionSubstancesCheck: CheckFn<{
  prescriptionId?: string | null;
  monoSubstances?: SSD2Id[] | null;
  multiSubstances?: SSD2Id[] | null;
}> = (ctx) => {
  if (!isDefined(ctx.value.prescriptionId)) {
    if (isNil(ctx.value.monoSubstances) && isNil(ctx.value.multiSubstances)) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message:
          'Veuillez préciser les substances mono-résidu et/ou multi-résidus à analyser.',
        path: ['substances']
      });
    }
    if (
      !isNil(ctx.value.monoSubstances) &&
      ctx.value.monoSubstances.length === 0
    ) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: 'Veuillez renseigner au moins une substance mono-résidu.',
        path: ['monoSubstances']
      });
    }
  }
};

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
        error: () => 'La date de réception est invalide.'
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
    error: (issue) =>
      isNil(issue.input)
        ? "Veuillez renseigner l'accord du détenteur."
        : issue.message
  }),
  notesOnOwnerAgreement: z.string().nullish()
});

export const PartialSampleMatrixData = z.object({
  ...SampleMatrixData.partial().shape,
  matrixKind: z.union([MatrixKind, OtherMatrixKind]).nullish(),
  matrix: z.union([Matrix, z.string().nonempty()]).nullish(),
  stage: Stage.nullish(),
  specificData: PartialSampleMatrixSpecificData
});

export const PartialSampleToCreate = z.object({
  ...SampleContextData.partial().required({
    id: true,
    programmingPlanId: true,
    status: true,
    sampler: true
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
  lastUpdatedAt: z.coerce.date()
});

export const PartialSample = PartialSampleToCreate.extend({
  ...CreatedSampleData.shape
});

export const SampleBase = SampleToCreate.extend({
  ...CreatedSampleData.shape,
  geolocation: Geolocation,
  department: Department,
  company: Company,
  laboratoryId: z.guid(),
  items: z.array(SampleItem)
});

export const Sample = SampleBase.check(
  prescriptionSubstancesCheck,
  sampleMatrixCheck
);

export type Sampler = z.infer<typeof Sampler>;
export type Geolocation = z.infer<typeof Geolocation>;
export type SampleContextData = z.infer<typeof SampleContextData>;
export type SampleMatrixData = z.infer<typeof SampleMatrixData>;
export type SampleOwnerData = z.infer<typeof SampleOwnerData>;
export type CreatedSampleData = z.infer<typeof CreatedSampleData>;
export type PartialSampleMatrixData = z.infer<typeof PartialSampleMatrixData>;
export type PartialSampleToCreate = z.infer<typeof PartialSampleToCreate>;
export type PartialSample = z.infer<typeof PartialSample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type SampleBase = z.infer<typeof SampleBase>;
export type Sample = z.infer<typeof Sample>;
export type SampleMatrixSpecificData = z.infer<typeof SampleMatrixSpecificData>;
export type PartialSampleMatrixSpecificData = z.infer<
  typeof PartialSampleMatrixSpecificData
>;

export const isCreatedPartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
): partialSample is PartialSample =>
  partialSample !== undefined &&
  CreatedSampleData.safeParse(partialSample).success;

export const isProgrammingPlanSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => ProgrammingPlanContext.safeParse(partialSample?.context).success;

export const isOutsideProgrammingPlanSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => OutsideProgrammingPlanContext.safeParse(partialSample?.context).success;

export const getSampleMatrixLabel = (
  partialSample: PartialSample | PartialSampleToCreate
) =>
  partialSample.matrixKind === OtherMatrixKind.value
    ? (partialSample.matrix ?? '')
    : MatrixLabels[partialSample.matrix as Matrix];
