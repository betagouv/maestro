import { isNil } from 'lodash-es';
import { z } from 'zod';
import { AnimalKind } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { BreedingMethod } from '../../referential/BreedingMethod';
import { CultureKind } from '../../referential/CultureKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { OutdoorAccess } from '../../referential/OutdoorAccess';
import { ProductionKind } from '../../referential/ProductionKind';
import { Species } from '../../referential/Species';
import { Seizure } from '../../Seizure';
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

const AnimalAge = z.coerce
  .number({ error: "Veuillez renseigner l'âge de l'animal." })
  .int()
  .nonnegative();

const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PPV),
  matrixDetails: z.string().nullish(),
  cultureKind: CultureKind,
  matrixPart: MatrixPart,
  releaseControl: z.boolean().nullish()
});

const SampleMatrixSpecificDataDAOABreeding = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_BREEDING),
  sampling: z.literal('Aléatoire'),
  animalIdentifier: AnimalIdentifier,
  age: AnimalAge,
  species: Species,
  breedingMethod: BreedingMethod,
  outdoorAccess: OutdoorAccess
});

const SampleMatrixSpecificDataDAOASlaughter = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_SLAUGHTER),
  killingCode: KillingCode,
  sampling: z.literal('Aléatoire'),
  animalIdentifier: AnimalIdentifier,
  animalKind: AnimalKind,
  sex: AnimalSex,
  age: AnimalAge,
  productionKind: ProductionKind,
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
