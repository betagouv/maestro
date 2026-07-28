import { describe, expect, test } from 'vitest';
import {
  computeCompleteness,
  computeDisplayStatus,
  hasSentOnward,
  isModifiedSinceSent
} from './ProgrammingPlanDisplayStatus';

describe('hasSentOnward — Regional, REGIONAL distributionKind', () => {
  test('SubmittedToRegion (just received, not yet acted on) does not count as sent', () => {
    expect(hasSentOnward('Regional', 'REGIONAL', 'SubmittedToRegion')).toBe(
      false
    );
  });
});

describe('isModifiedSinceSent', () => {
  test('never sent', () => {
    expect(isModifiedSinceSent(null, null)).toBe(false);
  });

  test('sent, never touched since', () => {
    expect(isModifiedSinceSent(new Date('2026-01-01'), null)).toBe(false);
  });

  test('sent, touched before sentAt', () => {
    expect(
      isModifiedSinceSent(new Date('2026-01-10'), new Date('2026-01-05'))
    ).toBe(false);
  });

  test('sent, touched after sentAt', () => {
    expect(
      isModifiedSinceSent(new Date('2026-01-01'), new Date('2026-01-05'))
    ).toBe(true);
  });
});

describe('computeDisplayStatus — ReadyToSend/modified branch', () => {
  const base = {
    status: 'InProgress' as const,
    hasAnyProgrammedSample: true,
    isComplete: true,
    echelon: 'National' as const,
    distributionKind: 'REGIONAL' as const
  };

  test('never sent, complete -> ReadyToSend, not modified', () => {
    const result = computeDisplayStatus({
      ...base,
      sentAt: null,
      lastModifiedAt: null
    });
    expect(result.value).toBe('ReadyToSend');
    expect(result.modified).toBe(false);
    expect(result.label).toBe('Terminé, à envoyer');
  });

  test('sent then touched again, complete -> ReadyToSend, modified', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'SubmittedToRegion',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: new Date('2026-01-05')
    });
    expect(result.value).toBe('ReadyToSend');
    expect(result.modified).toBe(true);
    expect(result.label).toBe('Modifié, à envoyer');
  });

  test('sent, not touched since -> Submitted', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'SubmittedToRegion',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: null
    });
    expect(result.value).toBe('Submitted');
    expect(result.modified).toBe(false);
  });

  test('sent, then modified into incomplete -> InProgress, not Submitted', () => {
    const result = computeDisplayStatus({
      ...base,
      isComplete: false,
      status: 'SubmittedToRegion',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: new Date('2026-01-05')
    });
    expect(result.value).toBe('InProgress');
  });

  test('Regional, freshly received and never touched, complete -> InProgress, not ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      echelon: 'Regional',
      status: 'SubmittedToRegion',
      sentAt: null,
      lastModifiedAt: null
    });
    expect(result.value).toBe('InProgress');
  });

  test('Regional, received and touched, not sent onward -> ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      echelon: 'Regional',
      status: 'SubmittedToRegion',
      sentAt: null,
      lastModifiedAt: new Date('2026-01-02')
    });
    expect(result.value).toBe('ReadyToSend');
    expect(result.label).toBe('Terminé, à envoyer');
  });
});

describe('computeCompleteness — National: complete only once regions reconcile to the national total', () => {
  const prescriptions = [{ id: 'p1', sampleCount: 40 }];

  test('national sampleCount matches sum of regional allocations -> complete', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 25
        },
        {
          prescriptionId: 'p1',
          region: '02',
          department: null,
          sampleCount: 15
        }
      ],
      'National'
    );
    expect(result.isComplete).toBe(true);
  });

  test('national sampleCount changed without regions catching up -> incomplete', () => {
    const result = computeCompleteness(
      [{ id: 'p1', sampleCount: 50 }],
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 25
        },
        {
          prescriptionId: 'p1',
          region: '02',
          department: null,
          sampleCount: 15
        }
      ],
      'National'
    );
    expect(result.isComplete).toBe(false);
  });

  test('department-level rows are ignored for the national reconciliation (region-level only)', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 40
        },
        {
          prescriptionId: 'p1',
          region: '01',
          department: '75',
          sampleCount: 40
        }
      ],
      'National'
    );
    expect(result.isComplete).toBe(true);
  });
});

describe('computeCompleteness — Regional/Departmental: 0 is a legitimate final allocation', () => {
  const prescriptions = [
    { id: 'p1', sampleCount: 40 },
    { id: 'p2', sampleCount: 10 }
  ];

  test('a distributed count of 0 counts as complete, not missing', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 5
        },
        {
          prescriptionId: 'p2',
          region: '01',
          department: null,
          sampleCount: 0
        }
      ],
      'Regional',
      '01'
    );
    expect(result.isComplete).toBe(true);
  });

  test('a prescription missing entirely for that region is incomplete', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 5
        }
      ],
      'Regional',
      '01'
    );
    expect(result.isComplete).toBe(false);
  });

  test('all-zero region has hasAnyProgrammedSample false (NotApplicable), independent of isComplete', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 0
        },
        {
          prescriptionId: 'p2',
          region: '01',
          department: null,
          sampleCount: 0
        }
      ],
      'Regional',
      '01'
    );
    expect(result.isComplete).toBe(true);
    expect(result.hasAnyProgrammedSample).toBe(false);
  });
});
