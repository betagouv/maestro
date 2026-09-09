import { describe, expect, test } from 'vitest';
import { isLaboratoryAssignmentComplete } from './LocalPrescription';
import {
  type DiffusedSampleCountChange,
  hasUnviewedChange,
  lastDiffusedSampleCount,
  regionRowNeedsChangeAction
} from './LocalPrescriptionChange';

describe('hasUnviewedChange', () => {
  test('never changed', () => {
    expect(hasUnviewedChange(null)).toBe(false);
    expect(hasUnviewedChange(undefined)).toBe(false);
  });

  test('has a pending change', () => {
    expect(hasUnviewedChange(new Date('2026-01-01'))).toBe(true);
  });
});

describe('isLaboratoryAssignmentComplete', () => {
  test('empty or missing list is incomplete', () => {
    expect(isLaboratoryAssignmentComplete(null)).toBe(false);
    expect(isLaboratoryAssignmentComplete(undefined)).toBe(false);
    expect(isLaboratoryAssignmentComplete([])).toBe(false);
  });

  test('any missing laboratoryId is incomplete', () => {
    expect(
      isLaboratoryAssignmentComplete([
        { substanceKind: 'Mono', laboratoryId: 'lab-1' },
        { substanceKind: 'Multi', laboratoryId: undefined }
      ])
    ).toBe(false);
  });

  test('fully assigned is complete', () => {
    expect(
      isLaboratoryAssignmentComplete([
        { substanceKind: 'Mono', laboratoryId: 'lab-1' },
        { substanceKind: 'Multi', laboratoryId: 'lab-2' }
      ])
    ).toBe(true);
  });
});

describe('regionRowNeedsChangeAction — REGIONAL', () => {
  test('no laboratory assigned -> needs action', () => {
    expect(
      regionRowNeedsChangeAction(
        'REGIONAL',
        { sampleCount: 400, substanceKindsLaboratories: [] },
        []
      )
    ).toBe(true);
  });

  test('laboratory fully assigned -> no action needed', () => {
    expect(
      regionRowNeedsChangeAction(
        'REGIONAL',
        {
          sampleCount: 400,
          substanceKindsLaboratories: [
            { substanceKind: 'Mono', laboratoryId: 'lab-1' }
          ]
        },
        []
      )
    ).toBe(false);
  });
});

describe('regionRowNeedsChangeAction — SLAUGHTERHOUSE', () => {
  const own = { sampleCount: 400, substanceKindsLaboratories: [] };

  test('nothing distributed, no department laboratory -> needs action', () => {
    expect(regionRowNeedsChangeAction('SLAUGHTERHOUSE', own, [])).toBe(true);
  });

  test('fully distributed, even without a laboratory -> no action needed', () => {
    expect(
      regionRowNeedsChangeAction('SLAUGHTERHOUSE', own, [
        { sampleCount: 400, substanceKindsLaboratories: [] }
      ])
    ).toBe(false);
  });

  test('partially distributed but one department has a complete laboratory -> no action needed', () => {
    expect(
      regionRowNeedsChangeAction('SLAUGHTERHOUSE', own, [
        {
          sampleCount: 100,
          substanceKindsLaboratories: [
            { substanceKind: 'Mono', laboratoryId: 'lab-1' }
          ]
        }
      ])
    ).toBe(false);
  });

  test('an undiffused national draft leaves the region alone until diffusion', () => {
    expect(
      regionRowNeedsChangeAction(
        'SLAUGHTERHOUSE',
        {
          sampleCount: 600,
          diffusedSampleCount: 400,
          substanceKindsLaboratories: []
        },
        [{ sampleCount: 400, substanceKindsLaboratories: [] }]
      )
    ).toBe(false);
  });

  test('once diffused, the region has to share out the new volume', () => {
    expect(
      regionRowNeedsChangeAction(
        'SLAUGHTERHOUSE',
        { sampleCount: 600, substanceKindsLaboratories: [] },
        [{ sampleCount: 400, substanceKindsLaboratories: [] }]
      )
    ).toBe(true);
  });

  test('neither distributed nor laboratory-assigned anywhere -> needs action', () => {
    expect(
      regionRowNeedsChangeAction('SLAUGHTERHOUSE', own, [
        {
          sampleCount: 100,
          substanceKindsLaboratories: [
            { substanceKind: 'Mono', laboratoryId: undefined }
          ]
        }
      ])
    ).toBe(true);
  });
});

describe('lastDiffusedSampleCount', () => {
  const regionRow = {
    prescriptionId: '11111111-1111-1111-1111-111111111111',
    region: '52' as const,
    department: undefined,
    companySiret: undefined
  };

  const change = (
    overrides: Partial<DiffusedSampleCountChange>
  ): DiffusedSampleCountChange => ({
    prescriptionId: regionRow.prescriptionId,
    region: regionRow.region,
    department: undefined,
    companySiret: undefined,
    kind: 'sampleCount',
    sampleCount: 0,
    diffusedAt: new Date('2026-01-01'),
    changedAt: new Date('2026-01-01'),
    ...overrides
  });

  test('nothing ever diffused -> no previous value', () => {
    expect(lastDiffusedSampleCount(regionRow, [])).toBeNull();
  });

  test('an undiffused draft is ignored', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [
        change({ sampleCount: 9, diffusedAt: null })
      ])
    ).toBeNull();
  });

  test('a diffused but not yet applied change stands', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [change({ sampleCount: 10 })])
    ).toBe(10);
  });

  test('among several diffused changes, the most recent one wins', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [
        change({ sampleCount: 7, changedAt: new Date('2026-01-02') }),
        change({ sampleCount: 12, changedAt: new Date('2026-01-05') }),
        change({ sampleCount: 9, changedAt: new Date('2026-01-03') })
      ])
    ).toBe(12);
  });

  test('a later draft does not hide the last diffused change', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [
        change({ sampleCount: 10, changedAt: new Date('2026-01-02') }),
        change({
          sampleCount: 42,
          changedAt: new Date('2026-01-09'),
          diffusedAt: null
        })
      ])
    ).toBe(10);
  });

  test('changes belonging to another row are ignored', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [
        change({ sampleCount: 99, region: '44' }),
        change({ sampleCount: 98, department: '85' }),
        change({ sampleCount: 97, companySiret: '54695037900216' }),
        change({
          sampleCount: 96,
          prescriptionId: '22222222-2222-2222-2222-222222222222'
        })
      ])
    ).toBeNull();
  });

  test('a laboratories change carries no sample count', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [
        change({ kind: 'laboratories', sampleCount: null })
      ])
    ).toBeNull();
  });

  test('a slaughterhouse row only keeps its own changes', () => {
    const companyRow = {
      ...regionRow,
      department: '85' as const,
      companySiret: '54695037900216'
    };
    expect(
      lastDiffusedSampleCount(companyRow, [
        change({ sampleCount: 12, department: '85' }),
        change({
          sampleCount: 3,
          department: '85',
          companySiret: '54695037900216'
        })
      ])
    ).toBe(3);
  });

  test('a diffused zero is a real previous value, not the absence of one', () => {
    expect(
      lastDiffusedSampleCount(regionRow, [change({ sampleCount: 0 })])
    ).toBe(0);
  });
});
