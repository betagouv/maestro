import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import type { ProgrammingPlanSampleSetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import { resolveSubstanceKindsLaboratoryId } from 'maestro-shared/schema/Sample/SampleItem';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';

type SampleLaboratory = {
  substanceKinds: SubstanceKind[];
  laboratoryId: string | null;
};

export const groupSubstanceKindsLaboratoriesBySample = (
  samples: Pick<ProgrammingPlanSampleSetting, 'substanceKinds'>[] | null,
  substanceKindsLaboratories: SubstanceKindLaboratory[]
): SampleLaboratory[] => {
  const assignableSubstanceKinds = substanceKindsLaboratories.map(
    ({ substanceKind }) => substanceKind
  );
  const assigned = new Set<SubstanceKind>();
  const groups: SubstanceKind[][] = [];
  for (const substanceKinds of [
    ...(samples ?? []).map((sample) => sample.substanceKinds),
    ...assignableSubstanceKinds.map((substanceKind) => [substanceKind])
  ]) {
    const group = substanceKinds.filter(
      (substanceKind) =>
        assignableSubstanceKinds.includes(substanceKind) &&
        !assigned.has(substanceKind)
    );
    for (const substanceKind of group) {
      assigned.add(substanceKind);
    }
    if (group.length > 0) {
      groups.push(group);
    }
  }

  return groups.map((substanceKinds) => ({
    substanceKinds,
    laboratoryId: resolveSubstanceKindsLaboratoryId(
      substanceKinds,
      substanceKindsLaboratories
    )
  }));
};

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
