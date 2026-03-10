import { isNil, uniq } from 'lodash-es';
import { z, ZodType } from 'zod';
import { AnimalKind } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { BreedingMethod } from '../../referential/BreedingMethod';
import { CultureKind, CultureKindList } from '../../referential/CultureKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { OutdoorAccess } from '../../referential/OutdoorAccess';
import { ProductionKind } from '../../referential/ProductionKind';
import { Seizure } from '../../referential/Seizure';
import { Species } from '../../referential/Species';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindWithSacha
} from '../ProgrammingPlan/ProgrammingPlanKind';

export const UnknownValue = 'Unknown';
export const UnknownValueLabel = 'Je ne sais pas';

const withUnknown = (
  zodEnum: { options: readonly string[] },
  errorMessage?: string | (() => string)
) =>
  z.enum(
    [...zodEnum.options, UnknownValue] as unknown as [string, ...string[]],
    errorMessage
      ? {
          error:
            typeof errorMessage === 'function'
              ? errorMessage
              : () => errorMessage
        }
      : undefined
  );

const KillingCode = z
  .string({
    error: (issue) =>
      isNil(issue.input) ? 'Veuillez renseigner le code tuerie.' : issue.message
  })
  .min(1, 'Veuillez renseigner le code tuerie.');

const AnimalIdentifier = z
  .string({
    error: (issue) =>
      isNil(issue.input)
        ? "Veuillez renseigner l'identifiant du lot ou de l'animal."
        : issue.message
  })
  .min(1, "Veuillez renseigner l'identifiant du lot ou de l'animal.");

const AnimalAgeInDays = z.coerce
  .number({ error: "Veuillez renseigner l'âge de l'animal." })
  .int()
  .nonnegative();

const AnimalAgeInMonths = z.coerce
  .number({ error: "Veuillez renseigner l'âge de l'animal." })
  .int()
  .nonnegative();

const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PPV),
  matrixDetails: z.string().nullish(),
  cultureKind: CultureKind.nullish(),
  productionKind: ProductionKind.extract(['PD07A', 'PD09A', 'Z0216']),
  matrixPart: MatrixPart,
  releaseControl: z.boolean().nullish()
});

const SampleMatrixSpecificDataDAOAVolaille = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_VOLAILLE),
  sampling: z.literal('Aléatoire'),
  animalIdentifier: AnimalIdentifier,
  ageInDays: AnimalAgeInDays,
  species: Species.extract(['ESP7', 'ESP8', 'ESP10', 'ESP20']),
  breedingMethod: BreedingMethod,
  outdoorAccess: OutdoorAccess
});

const SampleMatrixSpecificDataDAOABovin = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_BOVIN),
  killingCode: KillingCode,
  sampling: z.literal('Aléatoire'),
  animalIdentifier: AnimalIdentifier,
  animalKind: AnimalKind.extract(['TYPEA1', 'TYPEA2', 'TYPEA3', 'TYPEA4']),
  sex: AnimalSex,
  ageInMonths: AnimalAgeInMonths,
  productionKind: ProductionKind.extract([
    'PROD_1',
    'PROD_2',
    'PROD_4',
    'PROD_3'
  ]),
  outdoorAccess: OutdoorAccess,
  seizure: withUnknown(Seizure, 'Veuillez renseigner la saisie.')
});

export const SampleMatrixSpecificData = z.discriminatedUnion(
  'programmingPlanKind',
  [
    SampleMatrixSpecificDataPPV,
    SampleMatrixSpecificDataDAOAVolaille,
    SampleMatrixSpecificDataDAOABovin
  ],
  {
    error: () => 'Veuillez renseigner le type de plan.'
  }
);

export const PartialSampleMatrixSpecificData = z.discriminatedUnion(
  'programmingPlanKind',
  [
    SampleMatrixSpecificDataPPV.partial().required({
      programmingPlanKind: true
    }),
    SampleMatrixSpecificDataDAOAVolaille.partial().required({
      programmingPlanKind: true
    }),
    SampleMatrixSpecificDataDAOABovin.partial().required({
      programmingPlanKind: true
    })
  ],
  {
    error: () => 'Veuillez renseigner le type de plan.'
  }
);

export type SampleMatrixSpecificData = z.infer<typeof SampleMatrixSpecificData>;
export type PartialSampleMatrixSpecificData = z.infer<
  typeof PartialSampleMatrixSpecificData
>;

type UnionKeys<T, O extends string> = T extends any ? keyof Omit<T, O> : never;
export type SampleMatrixSpecificDataKeys = UnionKeys<
  SampleMatrixSpecificData,
  'programmingPlanKind'
>;

const schemasByProgrammingPlanKind = {
  PPV: SampleMatrixSpecificDataPPV,
  DAOA_VOLAILLE: SampleMatrixSpecificDataDAOAVolaille,
  DAOA_BOVIN: SampleMatrixSpecificDataDAOABovin
} as const satisfies {
  [P in ProgrammingPlanKind]: z.ZodType<
    Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>
  >;
};

const unwrapSchema = (zodType: ZodType | undefined): ZodType | undefined => {
  if (!zodType) {
    return zodType;
  }
  if ('unwrap' in zodType) {
    //@ts-expect-error TS18046
    return unwrapSchema(zodType.unwrap());
  }

  return zodType;
};

export const getSampleMatrixSpecificDataAttributeValues = (
  programmingPlanKind: ProgrammingPlanKind,
  attributeName: SampleMatrixSpecificDataKeys
): string[] => {
  const schema = schemasByProgrammingPlanKind[programmingPlanKind];

  const shape = schema.shape;
  let fieldSchema: ZodType | undefined =
    shape[attributeName as keyof typeof shape];

  fieldSchema = unwrapSchema(fieldSchema);

  if (!fieldSchema) {
    return [];
  }

  //FIXME je crois que c'est pour la PPV, elle a différente valeurs en fonction de l'année
  if (attributeName === 'cultureKind') {
    return CultureKindList;
  }

  if ('options' in fieldSchema && Array.isArray(fieldSchema.options)) {
    return fieldSchema.options;
  }

  if (fieldSchema.type === 'literal' && 'values' in fieldSchema) {
    return Array.from(fieldSchema.values as string[]);
  }

  return [];
};
export const getAllSachaAttributes = (): SampleMatrixSpecificDataKeys[] =>
  uniq(
    ProgrammingPlanKindWithSacha.options.flatMap((kind) =>
      Object.keys(schemasByProgrammingPlanKind[kind].shape)
    )
  ).filter(
    (key): key is SampleMatrixSpecificDataKeys => key !== 'programmingPlanKind'
  );
export const getAttributeExpectedValues = (
  attribute: SampleMatrixSpecificDataKeys
): string[] =>
  uniq(
    ProgrammingPlanKindWithSacha.options.flatMap((p) =>
      getSampleMatrixSpecificDataAttributeValues(p, attribute)
    )
  );
