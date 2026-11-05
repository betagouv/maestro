import { describe, expect, test } from 'vitest';
import { getAlertEmails } from './alertEmails';

describe('getAlertEmails', () => {
  test('sends no alert email for a PPV sub plan', () => {
    expect(
      getAlertEmails({
        distributionKind: 'REGIONAL',
        region: '84',
        programmingSubPlanNumber: 'PPV01'
      })
    ).toEqual([]);
  });

  test('sends the regional alert email for a regional distribution outside PPV', () => {
    expect(
      getAlertEmails({
        distributionKind: 'REGIONAL',
        region: '84',
        programmingSubPlanNumber: 'DAOA01'
      })
    ).toEqual(['sral.draaf-auvergne-rhone-alpes@agriculture.gouv.fr']);
    expect(
      getAlertEmails({ distributionKind: 'REGIONAL', region: '84' })
    ).toEqual(['sral.draaf-auvergne-rhone-alpes@agriculture.gouv.fr']);
  });

  test('sends the departmental alert email for a slaughterhouse distribution', () => {
    expect(
      getAlertEmails({
        distributionKind: 'SLAUGHTERHOUSE',
        region: '84',
        department: '02'
      })
    ).toEqual(['ddpp@aisne.gouv.fr']);
  });

  test('sends no alert email for a slaughterhouse distribution without a known department', () => {
    expect(
      getAlertEmails({ distributionKind: 'SLAUGHTERHOUSE', region: '84' })
    ).toEqual([]);
    expect(
      getAlertEmails({
        distributionKind: 'SLAUGHTERHOUSE',
        region: '84',
        department: '01'
      })
    ).toEqual([]);
  });

  test('sends no alert email for a departmental distribution', () => {
    expect(
      getAlertEmails({
        distributionKind: 'DEPARTMENTAL',
        region: '84',
        department: '02'
      })
    ).toEqual([]);
  });
});
