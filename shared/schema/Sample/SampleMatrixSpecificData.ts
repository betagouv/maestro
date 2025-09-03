import { isNil } from 'lodash-es';
import { CheckFn } from 'zod/dist/types/v4/core';
import { z } from 'zod/v4';
import { AnimalKind, AnimalKindAgeLimit } from '../../referential/AnimalKind';
import { AnimalSex } from '../../referential/AnimalSex';
import { BreedingMethod } from '../../referential/BreedingMethod';
import { CultureKind } from '../../referential/CultureKind';
import { MatrixPart } from '../../referential/Matrix/MatrixPart';
import { OutdoorAccess } from '../../referential/OutdoorAccess';
import { ProductionKind } from '../../referential/ProductionKind';
import { ProductionMethod } from '../../referential/ProductionMethod';
import { Seizure } from '../../referential/Seizure';
import { Species } from '../../referential/Species';
import { TargetingCriteria } from '../../referential/TargetingCriteria';
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

type AnimalAge = z.infer<typeof AnimalAge>;

const animalKindAgeCheck: CheckFn<{
  animalKind: AnimalKind;
  age: AnimalAge;
}> = (ctx) => {
  const val = ctx.value;
  const ageLimit = AnimalKindAgeLimit[val.animalKind];
  if (
    (ageLimit?.min && Number(val.age) < ageLimit.min) ||
    (ageLimit?.max && Number(val.age) > ageLimit.max)
  ) {
    ctx.issues.push({
      code: 'custom',
      message: `Cet âge n'est pas autorisé pour le type d'animal sélectionné.`,
      path: ['specificData', 'age'],
      input: val
    });
  }
};

const SampleMatrixSpecificDataPPV = z.object({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PPV),
  matrixDetails: z.string().nullish(),
  cultureKind: CultureKind,
  matrixPart: MatrixPart,
  releaseControl: z.boolean().nullish()
});

const SampleMatrixSpecificDataPFAS = z
  .object({
    programmingPlanKind: z
      .literal(ProgrammingPlanKind.enum.PFAS_EGGS)
      .or(z.literal(ProgrammingPlanKind.enum.PFAS_MEAT)),
    species: Species,
    targetingCriteria: TargetingCriteria,
    notesOnTargetingCriteria: z.string().nullish(),
    animalKind: AnimalKind,
    animalIdentifier: AnimalIdentifier,
    breedingMethod: BreedingMethod,
    age: AnimalAge,
    sex: AnimalSex,
    seizure: Seizure.nullish(),
    outdoorAccess: OutdoorAccess
  })
  .check(animalKindAgeCheck);

const SampleMatrixSpecificDataPFASEggs = SampleMatrixSpecificDataPFAS.extend({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PFAS_EGGS)
});

const SampleMatrixSpecificDataPFASMeat = SampleMatrixSpecificDataPFAS.extend({
  programmingPlanKind: z.literal(ProgrammingPlanKind.enum.PFAS_MEAT),
  killingCode: KillingCode,
  productionKind: ProductionKind
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
    SampleMatrixSpecificDataPFASEggs,
    SampleMatrixSpecificDataPFASMeat,
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
    SampleMatrixSpecificDataPFASEggs.partial().required({
      programmingPlanKind: true
    }),
    SampleMatrixSpecificDataPFASMeat.partial().required({
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
