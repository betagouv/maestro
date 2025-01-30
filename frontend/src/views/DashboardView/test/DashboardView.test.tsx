import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import {
  genAuthUser,
  Region1Fixture,
  Sampler1Fixture
} from 'shared/test/userFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import { beforeEach } from 'vitest';
import {
  mockRequests,
  programmingPlanByYearRequestMock
} from '../../../../test/requestTestUtils';

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useParams: vi.fn()
  };
});

import { genProgrammingPlan } from 'shared/test/programmingPlanFixtures';
import DashboardView from 'src/views/DashboardView/DashboardView';
import { describe, expect, test, vi } from 'vitest';
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
              roles: ['Sampler'],
              region: Region1Fixture,
              id: Sampler1Fixture.id
            })
          }
        }
      });
    });

    test('should render the current programming plan if validated', async () => {
      const validatedProgrammingPlan = genProgrammingPlan({
        status: 'Validated',
        year: new Date().getFullYear()
      });
      mockRequests([
        programmingPlanByYearRequestMock(
          new Date().getFullYear(),
          validatedProgrammingPlan
        )
      ]);
      render(
        <Provider store={store}>
          <BrowserRouter>
            <DashboardView />
          </BrowserRouter>
        </Provider>
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
        status: 'Validated',
        year: new Date().getFullYear() - 1
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
        <Provider store={store}>
          <BrowserRouter>
            <DashboardView />
          </BrowserRouter>
        </Provider>
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
