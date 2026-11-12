import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import {
  groupSubstanceKindsBySample,
  type ProgrammingPlanSampleSetting
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import { resolveSubstanceKindsLaboratoryId } from 'maestro-shared/schema/Sample/SampleItem';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';

type SampleLaboratory = {
  substanceKinds: SubstanceKind[];
  laboratoryId: string | null;
};

export const groupSubstanceKindsLaboratoriesBySample = (
  samples: Pick<ProgrammingPlanSampleSetting, 'substanceKinds'>[] | null,
  substanceKindsLaboratories: SubstanceKindLaboratory[]
): SampleLaboratory[] =>
  groupSubstanceKindsBySample(
    samples,
    substanceKindsLaboratories.map(({ substanceKind }) => substanceKind)
  ).map((substanceKinds) => ({
    substanceKinds,
    laboratoryId: resolveSubstanceKindsLaboratoryId(
      substanceKinds,
      substanceKindsLaboratories
    )
  }));

export const assignSampleLaboratory = (
  substanceKindsLaboratories: SubstanceKindLaboratory[],
  sampleSubstanceKinds: SubstanceKind[],
  laboratoryId: string | undefined
): SubstanceKindLaboratory[] =>
  substanceKindsLaboratories.map((substanceKindLaboratory) =>
    sampleSubstanceKinds.includes(substanceKindLaboratory.substanceKind)
      ? { ...substanceKindLaboratory, laboratoryId }
      : substanceKindLaboratory
  );

export const subPlanSubstanceKindsLaboratories = (
  subPlanSubstanceKinds: SubstanceKind[],
  savedSubstanceKindsLaboratories: SubstanceKindLaboratory[]
): SubstanceKindLaboratory[] =>
  subPlanSubstanceKinds.map((substanceKind) => ({
    substanceKind,
    laboratoryId: savedSubstanceKindsLaboratories.find(
      (saved) => saved.substanceKind === substanceKind
    )?.laboratoryId
  }));
