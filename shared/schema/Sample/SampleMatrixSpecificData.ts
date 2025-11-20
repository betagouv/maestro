import { isNil } from 'lodash-es';
import { z } from 'zod';
import { AnimalKind } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { CultureKind } from '../../referential/CultureKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { ProductionKind } from '../../referential/ProductionKind';
import { ProductionMethod } from '../../referential/ProductionMethod';
import { Species } from '../../referential/Species';
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

const SampleMatrixSpecificDataDAOA = z.object({
  programmingPlanKind: z
    .literal(ProgrammingPlanKind.enum.DAOA_SLAUGHTER)
    .or(z.literal(ProgrammingPlanKind.enum.DAOA_BREEDING)),
  killingCode: KillingCode,
  animalIdentifier: AnimalIdentifier,
  productionMethod: ProductionMethod
});

const SampleMatrixSpecificDataDAOABreeding =
  SampleMatrixSpecificDataDAOA.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_BREEDING),
    species: Species
  });

const SampleMatrixSpecificDataDAOASlaughter =
  SampleMatrixSpecificDataDAOA.extend({
    programmingPlanKind: z.literal(ProgrammingPlanKind.enum.DAOA_SLAUGHTER),
    animalKind: AnimalKind,
    productionKind: ProductionKind,
    sex: AnimalSex,
    age: AnimalAge
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
