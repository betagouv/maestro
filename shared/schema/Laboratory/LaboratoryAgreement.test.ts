import { describe, expect, test } from 'vitest';
import { defaultProgrammingPlanSample } from '../ProgrammingPlan/ProgrammingPlanSampleSetting';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';
import type { SubstanceKind } from '../Substance/SubstanceKind';
import {
  type AgreementSubPlan,
  type LaboratoryAgreement,
  subPlanNumbersMissingAgreements
} from './LaboratoryAgreement';

const subPlan = (
  subPlanNumber: string,
  substanceKinds: SubstanceKind[]
): AgreementSubPlan => ({
  id: ProgrammingSubPlanId.parse(crypto.randomUUID()),
  subPlanNumber,
  substanceKinds,
  samples: substanceKinds.map((substanceKind) => ({
    ...defaultProgrammingPlanSample,
    substanceKinds: [substanceKind]
  }))
});

const agreement = (
  target: AgreementSubPlan,
  substanceKind: SubstanceKind,
  fields: Partial<
    Pick<
      LaboratoryAgreement,
      'referenceLaboratory' | 'detectionAnalysis' | 'confirmationAnalysis'
    >
  >
): LaboratoryAgreement => ({
  programmingSubPlanId: target.id,
  substanceKind,
  laboratoryId: crypto.randomUUID(),
  referenceLaboratory: false,
  detectionAnalysis: false,
  confirmationAnalysis: false,
  ...fields
});

describe('subPlanNumbersMissingAgreements', () => {
  test('ne retient pas un sous-plan dont toutes les lignes ont un labo de détection ou de confirmation', () => {
    const covered = subPlan('M01', ['Mono', 'Multi']);

    expect(
      subPlanNumbersMissingAgreements(
        [covered],
        [
          agreement(covered, 'Mono', { detectionAnalysis: true }),
          agreement(covered, 'Multi', { confirmationAnalysis: true })
        ]
      )
    ).toEqual([]);
  });

  test('retient un sous-plan dès qu’une seule de ses lignes est découverte', () => {
    const partial = subPlan('M02', ['Mono', 'Multi']);

    expect(
      subPlanNumbersMissingAgreements(
        [partial],
        [agreement(partial, 'Mono', { detectionAnalysis: true })]
      )
    ).toEqual(['M02']);
  });

  test('ne compte pas le laboratoire national de référence', () => {
    const referenceOnly = subPlan('M03', ['Mono']);

    expect(
      subPlanNumbersMissingAgreements(
        [referenceOnly],
        [agreement(referenceOnly, 'Mono', { referenceLaboratory: true })]
      )
    ).toEqual(['M03']);
  });

  test('ignore les agréments portés par un autre sous-plan', () => {
    const target = subPlan('M04', ['Mono']);
    const other = subPlan('M05', ['Mono']);

    expect(
      subPlanNumbersMissingAgreements(
        [target],
        [agreement(other, 'Mono', { detectionAnalysis: true })]
      )
    ).toEqual(['M04']);
  });
});
