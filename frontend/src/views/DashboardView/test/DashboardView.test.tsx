import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import {
  genAuthUser,
  Region1Fixture,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import { beforeEach } from 'vitest';
import {
  mockRequests,
  programmingPlanByYearRequestMock
} from '../../../../test/requestTestUtils';

vi.mock(import('react-router'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useParams: vi.fn()
  };
});

import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import DashboardView from 'src/views/DashboardView/DashboardView';
import { describe, expect, test, vi } from 'vitest';
import { ProviderTest } from '../../../../test/ProviderTest';
let store: Store;

describe('DashboardView', () => {
  describe('For a sampler', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      store = configureStore({
        reducer: applicationReducer,
        middleware: applicationMiddleware,
        preloadedState: {
          auth: {
            authUser: genAuthUser({
              role: 'Sampler',
              region: Region1Fixture,
              id: Sampler1Fixture.id
            })
          }
        }
      });
    });

    test('should render the current programming plan if validated', async () => {
      const validatedProgrammingPlan = genProgrammingPlan({
        year: new Date().getFullYear(),
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'Validated'
        })),
        contexts: ['Control', 'Surveillance']
      });
      mockRequests([
        programmingPlanByYearRequestMock(
          new Date().getFullYear(),
          validatedProgrammingPlan
        )
      ]);
      render(
        <ProviderTest store={store}>
          <DashboardView />
        </ProviderTest>
      );

      expect(await screen.findByText('Tableau de bord')).toBeInTheDocument();
      expect(
        await screen.findByText(`Plan de contrôle ${new Date().getFullYear()}`)
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          `Plan de surveillance ${new Date().getFullYear()}`
        )
      ).toBeInTheDocument();
    });

    test('should render the previous programming plan of the year if current is not validated', async () => {
      const inProgressProgrammingPlan = undefined;
      const validatedProgrammingPlan = genProgrammingPlan({
        year: new Date().getFullYear() - 1,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'Validated'
        })),
        contexts: ['Control', 'Surveillance']
      });
      mockRequests([
        programmingPlanByYearRequestMock(
          new Date().getFullYear(),
          inProgressProgrammingPlan
        ),
        programmingPlanByYearRequestMock(
          new Date().getFullYear() - 1,
          validatedProgrammingPlan
        )
      ]);
      render(
        <ProviderTest store={store}>
          <DashboardView />
        </ProviderTest>
      );

      expect(await screen.findByText('Tableau de bord')).toBeInTheDocument();
      expect(
        await screen.findByText(
          `Plan de contrôle ${new Date().getFullYear() - 1}`
        )
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          `Plan de surveillance ${new Date().getFullYear() - 1}`
        )
      ).toBeInTheDocument();
    });
  });
});
