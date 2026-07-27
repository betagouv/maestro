import { describe, expect, test } from 'vitest';
import {
  hasUnviewedChange,
  isLaboratoryAssignmentComplete,
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
