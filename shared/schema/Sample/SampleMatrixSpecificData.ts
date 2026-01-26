import { isNil } from 'lodash-es';
import { z } from 'zod';
import { AnimalKind } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { BreedingMethod } from '../../referential/BreedingMethod';
import { CultureKind } from '../../referential/CultureKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { OutdoorAccess } from '../../referential/OutdoorAccess';
import { ProductionKind } from '../../referential/ProductionKind';
import { Seizure } from '../../referential/Seizure';
import { Species } from '../../referential/Species';
import { SampleMatrixSpecificDataKeys } from '../MatrixSpecificData/MatrixSpecificDataFormInputs';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

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

export const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PPV),
  matrixDetails: z.string().nullish(),
  cultureKind: CultureKind,
  matrixPart: MatrixPart,
  releaseControl: z.boolean().nullish()
});

export const SampleMatrixSpecificDataDAOABreeding = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_BREEDING),
  sampling: z.literal('Aléatoire'),
  animalIdentifier: AnimalIdentifier,
  ageInDays: AnimalAgeInDays,
  species: Species.extract(['ESP7', 'ESP8', 'ESP10', 'ESP20']),
  breedingMethod: BreedingMethod,
  outdoorAccess: OutdoorAccess
});

export const SampleMatrixSpecificDataDAOASlaughter = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_SLAUGHTER),
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
  seizure: Seizure
});

export const SampleMatrixSpecificData = z.discriminatedUnion(
  'programmingPlanKind',
  [
    SampleMatrixSpecificDataPPV,
    SampleMatrixSpecificDataDAOABreeding,
    SampleMatrixSpecificDataDAOASlaughter
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
    SampleMatrixSpecificDataDAOABreeding.partial().required({
      programmingPlanKind: true
    }),
    SampleMatrixSpecificDataDAOASlaughter.partial().required({
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

export const schemasByProgrammingPlanKind = {
  PPV: SampleMatrixSpecificDataPPV,
  DAOA_BREEDING: SampleMatrixSpecificDataDAOABreeding,
  DAOA_SLAUGHTER: SampleMatrixSpecificDataDAOASlaughter
} as const satisfies {
  [P in ProgrammingPlanKind]: z.ZodType<
    Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>
  >;
};

export function getSampleMatrixSpecificDataAttributeValues(
  programmingPlanKind: ProgrammingPlanKind,
  attributeName: SampleMatrixSpecificDataKeys
): string[] {
  const schema = schemasByProgrammingPlanKind[programmingPlanKind];

  const shape = schema.shape;
  const fieldSchema = shape[attributeName as keyof typeof shape];

  if (!fieldSchema) {
    return [];
  }

  if ('options' in fieldSchema && Array.isArray(fieldSchema.options)) {
    return fieldSchema.options;
  }

  return [];
}
