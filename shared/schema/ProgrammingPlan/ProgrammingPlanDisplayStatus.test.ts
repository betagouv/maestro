import { describe, expect, test } from 'vitest';

const assignedLaboratories = [
  { substanceKind: 'Any' as const, laboratoryId: 'lab-1' }
];

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
      lastModifiedAt: new Date('2026-01-05'),
      hasPendingChange: true
    });
    expect(result.value).toBe('ReadyToSend');
    expect(result.modified).toBe(true);
    expect(result.label).toBe('Modifié, à envoyer');
  });

  test('sent then touched again but already diffused since (no pending change) -> Submitted, not ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'SubmittedToRegion',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: new Date('2026-01-05'),
      hasPendingChange: false
    });
    expect(result.value).toBe('Submitted');
    expect(result.modified).toBe(false);
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

  test('National, viewed by National itself, still InProgress -> ReadyToSend (their own todo)', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'InProgress',
      sentAt: null,
      lastModifiedAt: null,
      viewerOwnsNationalRow: true
    });
    expect(result.value).toBe('ReadyToSend');
  });

  test('National, viewed by Admin, still InProgress (nothing sent yet) -> Pending, not ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'InProgress',
      sentAt: null,
      lastModifiedAt: null,
      viewerOwnsNationalRow: false
    });
    expect(result.value).toBe('Pending');
    expect(result.label).toBe('En attente');
  });

  test('National, viewed by Admin, status SubmittedToAdmin -> ReadyToSend, "Terminé, à envoyer" (admin\'s own hop)', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'SubmittedToAdmin',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: null,
      viewerOwnsNationalRow: false
    });
    expect(result.value).toBe('ReadyToSend');
    expect(result.label).toBe('Terminé, à envoyer');
  });

  test('National, viewed by National itself, status SubmittedToAdmin -> Submitted, "Soumis à l\'admin" (unaffected by the admin branch)', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'SubmittedToAdmin',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: null,
      hasPendingChange: false,
      viewerOwnsNationalRow: true
    });
    expect(result.value).toBe('Submitted');
    expect(result.label).toBe("Soumis à l'admin");
  });

  test('National, viewed by Admin, status SubmittedToAdmin but incomplete -> InProgress, not ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      isComplete: false,
      status: 'SubmittedToAdmin',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: null,
      viewerOwnsNationalRow: false
    });
    expect(result.value).toBe('InProgress');
  });

  test('National, viewed by Admin, once past SubmittedToAdmin (SubmittedToRegion) -> Submitted, not ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      status: 'SubmittedToRegion',
      sentAt: new Date('2026-01-01'),
      lastModifiedAt: null,
      viewerOwnsNationalRow: false
    });
    expect(result.value).toBe('Submitted');
  });
});

describe('computeDisplayStatus — needsResend (diffused into me since my last send)', () => {
  const base = {
    status: 'Validated' as const,
    hasAnyProgrammedSample: true,
    isComplete: true,
    echelon: 'Regional' as const,
    distributionKind: 'REGIONAL' as const,
    sentAt: new Date('2026-01-01'),
    lastModifiedAt: null
  };

  test('Regional, already sent, needsResend true -> InProgress ("En cours"), not ReadyToSend', () => {
    const result = computeDisplayStatus({
      ...base,
      needsResend: true
    });
    expect(result.value).toBe('InProgress');
    expect(result.label).toBe('En cours');
    expect(result.modified).toBe(true);
  });

  test('Regional, already sent, needsResend false -> Submitted, unaffected', () => {
    const result = computeDisplayStatus({
      ...base,
      needsResend: false
    });
    expect(result.value).toBe('Submitted');
  });

  test('Regional, owner also has their own pending draft -> ReadyToSend wins over needsResend', () => {
    const result = computeDisplayStatus({
      ...base,
      lastModifiedAt: new Date('2026-01-05'),
      hasPendingChange: true,
      needsResend: true
    });
    expect(result.value).toBe('ReadyToSend');
    expect(result.label).toBe('Modifié, à envoyer');
  });

  test('National is exempt from needsResend -> stays Submitted even if true', () => {
    const result = computeDisplayStatus({
      ...base,
      echelon: 'National',
      needsResend: true
    });
    expect(result.value).toBe('Submitted');
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
          sampleCount: 5,
          substanceKindsLaboratories: assignedLaboratories
        },
        {
          prescriptionId: 'p2',
          region: '01',
          department: null,
          sampleCount: 0,
          substanceKindsLaboratories: assignedLaboratories
        }
      ],
      'Regional',
      'REGIONAL',
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
      'REGIONAL',
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
          sampleCount: 0,
          substanceKindsLaboratories: assignedLaboratories
        },
        {
          prescriptionId: 'p2',
          region: '01',
          department: null,
          sampleCount: 0,
          substanceKindsLaboratories: assignedLaboratories
        }
      ],
      'Regional',
      'REGIONAL',
      '01'
    );
    expect(result.isComplete).toBe(true);
    expect(result.hasAnyProgrammedSample).toBe(false);
  });
});

describe('computeCompleteness — SLAUGHTERHOUSE: Regional/Departmental must also reconcile with their children', () => {
  const prescriptions = [{ id: 'p1', sampleCount: 40 }];

  test("REGIONAL plan: a region's own row existing is enough, no department reconciliation expected", () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: null,
          sampleCount: 40,
          substanceKindsLaboratories: assignedLaboratories
        }
      ],
      'Regional',
      'REGIONAL',
      '01'
    );
    expect(result.isComplete).toBe(true);
  });

  test("SLAUGHTERHOUSE: region row exists but departments haven't caught up with the new total -> incomplete", () => {
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
          sampleCount: 10
        }
      ],
      'Regional',
      'SLAUGHTERHOUSE',
      '01'
    );
    expect(result.isComplete).toBe(false);
  });

  test("SLAUGHTERHOUSE: departments reconcile with the region's total -> complete", () => {
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
          sampleCount: 25
        },
        {
          prescriptionId: 'p1',
          region: '01',
          department: '77',
          sampleCount: 15
        }
      ],
      'Regional',
      'SLAUGHTERHOUSE',
      '01'
    );
    expect(result.isComplete).toBe(true);
  });

  test('SLAUGHTERHOUSE: department row exists but abattoirs are only partially split -> incomplete, there is nothing whole to diffuse yet', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        {
          prescriptionId: 'p1',
          region: '01',
          department: '75',
          sampleCount: 40
        },
        {
          prescriptionId: 'p1',
          region: '01',
          department: '75',
          companySiret: '111',
          sampleCount: 10
        }
      ],
      'Departmental',
      'SLAUGHTERHOUSE',
      '01',
      '75'
    );
    expect(result.isComplete).toBe(false);
  });
});

describe('computeCompleteness — Departmental: complete only once abattoirs reconcile', () => {
  const prescriptions = [{ id: 'p1', sampleCount: 40 }];
  const departmentRow = {
    prescriptionId: 'p1',
    region: '01' as const,
    department: '85' as const,
    companySiret: null,
    sampleCount: 12,
    substanceKindsLaboratories: assignedLaboratories
  };

  test('abattoir split matches the department volume -> complete', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        departmentRow,
        {
          prescriptionId: 'p1',
          region: '01' as const,
          department: '85' as const,
          companySiret: 'siret-1',
          sampleCount: 7
        },
        {
          prescriptionId: 'p1',
          region: '01' as const,
          department: '85' as const,
          companySiret: 'siret-2',
          sampleCount: 5
        }
      ],
      'Departmental',
      'SLAUGHTERHOUSE',
      '01',
      '85'
    );
    expect(result.isComplete).toBe(true);
  });

  test('abattoir split still short of the department volume -> incomplete', () => {
    const result = computeCompleteness(
      prescriptions,
      [
        departmentRow,
        {
          prescriptionId: 'p1',
          region: '01' as const,
          department: '85' as const,
          companySiret: 'siret-1',
          sampleCount: 7
        }
      ],
      'Departmental',
      'SLAUGHTERHOUSE',
      '01',
      '85'
    );
    expect(result.isComplete).toBe(false);
  });

  test('a REGIONAL plan has no abattoir level to reconcile -> complete', () => {
    const result = computeCompleteness(
      prescriptions,
      [departmentRow],
      'Departmental',
      'REGIONAL',
      '01',
      '85'
    );
    expect(result.isComplete).toBe(true);
  });
});

describe('computeCompleteness — the terminal echelon must have assigned its laboratories', () => {
  const prescriptions = [{ id: 'p1', sampleCount: 40 }];
  const regionalRow = {
    prescriptionId: 'p1',
    region: '01' as const,
    department: null,
    sampleCount: 40
  };

  test('REGIONAL: a region without laboratories cannot be diffused', () => {
    expect(
      computeCompleteness(
        prescriptions,
        [regionalRow],
        'Regional',
        'REGIONAL',
        '01'
      ).isComplete
    ).toBe(false);
  });

  test('REGIONAL: a half-assigned region is no better', () => {
    expect(
      computeCompleteness(
        prescriptions,
        [
          {
            ...regionalRow,
            substanceKindsLaboratories: [
              { substanceKind: 'Mono' as const, laboratoryId: 'lab-1' },
              { substanceKind: 'Multi' as const, laboratoryId: undefined }
            ]
          }
        ],
        'Regional',
        'REGIONAL',
        '01'
      ).isComplete
    ).toBe(false);
  });

  test('SLAUGHTERHOUSE: the requirement falls on the department, not the region', () => {
    const departmentRow = {
      prescriptionId: 'p1',
      region: '01' as const,
      department: '85' as const,
      companySiret: null,
      sampleCount: 40
    };
    const abattoirRow = {
      prescriptionId: 'p1',
      region: '01' as const,
      department: '85' as const,
      companySiret: 'siret-1',
      sampleCount: 40
    };

    expect(
      computeCompleteness(
        prescriptions,
        [departmentRow, abattoirRow],
        'Departmental',
        'SLAUGHTERHOUSE',
        '01',
        '85'
      ).isComplete
    ).toBe(false);

    expect(
      computeCompleteness(
        prescriptions,
        [
          {
            ...departmentRow,
            substanceKindsLaboratories: assignedLaboratories
          },
          abattoirRow
        ],
        'Departmental',
        'SLAUGHTERHOUSE',
        '01',
        '85'
      ).isComplete
    ).toBe(true);

    // The region hands over to the departments, not to the samplers: it is not
    // the one that assigns laboratories.
    expect(
      computeCompleteness(
        prescriptions,
        [departmentRow, abattoirRow],
        'Regional',
        'SLAUGHTERHOUSE',
        '01'
      ).isComplete
    ).toBe(false);
  });
});
