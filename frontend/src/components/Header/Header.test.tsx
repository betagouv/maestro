import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { genProgrammingPlan } from 'shared/test/programmingPlanFixtures';
import { genAuthUser, genUser } from 'shared/test/userFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import { mockRequests } from '../../../test/requestTestUtils';
import Header from './Header';

import { beforeEach, describe, expect, test } from 'vitest';
const validatedProgrammingPlan = {
  ...genProgrammingPlan(),
  status: 'Validated',
  statusDrom: 'Validated',
  year: new Date().getFullYear()
};
const inProgressProgrammingPlan = {
  ...genProgrammingPlan(),
  status: 'InProgress',
  statusDrom: 'InProgress',
  year: new Date().getFullYear() + 1
};

const programmingPlansRequest = {
  pathname: `/api/programming-plans?`,
  response: {
    body: JSON.stringify([validatedProgrammingPlan, inProgressProgrammingPlan])
  }
};

describe('Header', () => {
  const authUser = genAuthUser();
  let store: Store;

  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser },
        programmingPlan: { programmingPlan: validatedProgrammingPlan }
      }
    });
  });

  describe('when user is not authenticated', () => {
    test('should not display any navigation item', () => {
      const store = configureStore({
        reducer: applicationReducer,
        middleware: applicationMiddleware,
        preloadedState: { auth: { authUser: undefined } }
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText('Prélèvements')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Documents ressources')
      ).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    const user = genUser({
      roles: ['NationalCoordinator'],
      id: authUser.userId
    });

    test('should display navigation items', async () => {
      mockRequests([
        programmingPlansRequest,
        {
          pathname: `/api/users/${user.id}/infos`,
          response: { body: JSON.stringify(user) }
        }
      ]);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const navigation = screen.getByRole('navigation');

      expect(
        await within(navigation).findByText('Tableau de bord')
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Prélèvements')
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Programmation')
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Documents ressources')
      ).toBeInTheDocument();
    });
  });
});
