import { describe, expect, test } from 'vitest';
import { Regions } from '../../referential/Region';
import {
  AdminFixture,
  DepartmentalCoordinator,
  NationalCoordinator,
  NationalObserver,
  Region1Fixture,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  SamplerDaoaFixture
} from '../../test/userFixtures';
import { toArray } from '../../utils/utils';
import { buildFindSampleOptions } from './FindSampleOptions';

describe('buildFindSampleOptions', () => {
  const baseQuery = {
    programmingPlanIds: toArray('00000000-0000-0000-0000-000000000000')
  };

  describe('National roles', () => {
    test('NationalCoordinator can access all regions and departments', () => {
      const result = buildFindSampleOptions(
        NationalCoordinator,
        'NationalCoordinator',
        {
          ...baseQuery,
          region: Region1Fixture,
          departments: ['01', '02']
        }
      );

      expect(result.region).toBe(Region1Fixture);
      expect(result.departments).toEqual(['01', '02']);
      expect(result.companySirets).toBeUndefined();
    });

    test('NationalCoordinator without query filters gets all data', () => {
      const result = buildFindSampleOptions(
        NationalCoordinator,
        'NationalCoordinator',
        baseQuery
      );

      expect(result.region).toBeUndefined();
      expect(result.departments).toBeUndefined();
      expect(result.companySirets).toBeUndefined();
    });

    test('NationalCoordinator can filter by specific region', () => {
      const result = buildFindSampleOptions(
        NationalCoordinator,
        'NationalCoordinator',
        {
          ...baseQuery,
          region: '93'
        }
      );

      expect(result.region).toBe('93');
    });

    test('NationalObserver can access all regions and departments', () => {
      const result = buildFindSampleOptions(
        NationalObserver,
        'NationalObserver',
        {
          ...baseQuery,
          region: Region1Fixture,
          departments: ['01', '02']
        }
      );

      expect(result.region).toBe(Region1Fixture);
      expect(result.departments).toEqual(['01', '02']);
      expect(result.companySirets).toBeUndefined();
    });

    test('Administrator can access all regions and departments', () => {
      const result = buildFindSampleOptions(AdminFixture, 'Administrator', {
        ...baseQuery,
        region: Region1Fixture,
        departments: ['01', '02']
      });

      expect(result.region).toBe(Region1Fixture);
      expect(result.departments).toEqual(['01', '02']);
      expect(result.companySirets).toBeUndefined();
    });
  });

  describe('Regional roles', () => {
    test('RegionalCoordinator is restricted to their region', () => {
      const result = buildFindSampleOptions(
        RegionalCoordinator,
        'RegionalCoordinator',
        {
          ...baseQuery,
          region: '52',
          departments: ['01', '02']
        }
      );

      expect(result.region).toBe(RegionalCoordinator.region);
      expect(result.departments).toEqual(['01', '02']);
      expect(result.companySirets).toBeUndefined();
    });

    test('RegionalCoordinator can filter by specific departments in their region', () => {
      const regionDepartments = Regions[RegionalCoordinator.region].departments;
      const result = buildFindSampleOptions(
        RegionalCoordinator,
        'RegionalCoordinator',
        {
          ...baseQuery,
          departments: [regionDepartments[0], regionDepartments[1]]
        }
      );

      expect(result.region).toBe(RegionalCoordinator.region);
      expect(result.departments).toEqual([
        regionDepartments[0],
        regionDepartments[1]
      ]);
    });

    test('RegionalObserver is restricted to their region', () => {
      const result = buildFindSampleOptions(
        RegionalObserver,
        'RegionalObserver',
        {
          ...baseQuery,
          region: '52',
          departments: ['01', '02']
        }
      );

      expect(result.region).toBe(RegionalObserver.region);
      expect(result.departments).toEqual(['01', '02']);
      expect(result.companySirets).toBeUndefined();
    });
  });

  describe('Departmental roles', () => {
    test('DepartmentalCoordinator is restricted to their region and department', () => {
      const result = buildFindSampleOptions(
        DepartmentalCoordinator,
        'DepartmentalCoordinator',
        {
          ...baseQuery,
          region: '52',
          departments: ['01', '02']
        }
      );

      expect(result.region).toBe(DepartmentalCoordinator.region);
      expect(result.departments).toEqual([DepartmentalCoordinator.department]);
      expect(result.companySirets).toBeUndefined();
    });

    test('DepartmentalCoordinator can query with companySirets filter', () => {
      const result = buildFindSampleOptions(
        DepartmentalCoordinator,
        'DepartmentalCoordinator',
        {
          ...baseQuery,
          companySirets: ['12345678901234', '98765432109876']
        }
      );

      expect(result.region).toBe(DepartmentalCoordinator.region);
      expect(result.departments).toEqual([DepartmentalCoordinator.department]);
      expect(result.companySirets).toEqual([
        '12345678901234',
        '98765432109876'
      ]);
    });
  });

  describe('Sampler role', () => {
    test('Sampler PPV is restricted to their region', () => {
      const result = buildFindSampleOptions(Sampler1Fixture, 'Sampler', {
        ...baseQuery,
        region: '52',
        departments: ['01', '02']
      });

      expect(result.region).toBe(Sampler1Fixture.region);
      expect(result.departments).toEqual(['01', '02']);
      expect(result.companySirets).toBeUndefined();
    });

    test('Sampler DAOA is restricted to their region, department and companies', () => {
      const result = buildFindSampleOptions(SamplerDaoaFixture, 'Sampler', {
        ...baseQuery,
        region: '52',
        departments: ['01', '02'],
        companySirets: ['11111111111111', '22222222222222']
      });

      expect(result.region).toBe(SamplerDaoaFixture.region);
      expect(result.departments).toEqual([SamplerDaoaFixture.department]);
      expect(result.companySirets).toEqual(
        SamplerDaoaFixture.companies.map((c) => c.siret)
      );
    });

    test('Sampler DAOA cannot override their companies', () => {
      const otherSirets = ['99999999999999'];
      const result = buildFindSampleOptions(SamplerDaoaFixture, 'Sampler', {
        ...baseQuery,
        companySirets: otherSirets
      });

      expect(result.companySirets).toEqual(
        SamplerDaoaFixture.companies.map((c) => c.siret)
      );
      expect(result.companySirets).not.toEqual(otherSirets);
    });
  });

  describe('Query parameters', () => {
    test('preserves all query parameters', () => {
      const query = {
        ...baseQuery,
        contexts: ['Control' as const],
        statuses: ['Submitted' as const],
        matrices: ['A01BR' as const],
        sampledDate: '2024-01-01',
        reference: 'REF-123',
        compliance: 'Compliant' as const,
        withAtLeastOneResidue: true,
        perPage: 10,
        page: 2
      };

      const result = buildFindSampleOptions(
        NationalCoordinator,
        'NationalCoordinator',
        query
      );

      expect(result).toMatchObject({
        programmingPlanIds: baseQuery.programmingPlanIds,
        contexts: query.contexts,
        statuses: query.statuses,
        matrices: query.matrices,
        sampledDate: query.sampledDate,
        reference: query.reference,
        compliance: query.compliance,
        withAtLeastOneResidue: query.withAtLeastOneResidue,
        perPage: query.perPage,
        page: query.page
      });
    });
  });
});
