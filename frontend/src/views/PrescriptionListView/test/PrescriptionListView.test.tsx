import { configureStore, Store } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter, useParams } from 'react-router-dom';
import { Region, RegionList } from 'shared/referential/Region';
import {
  genPrescription,
  genRegionalPrescription
} from 'shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'shared/test/programmingPlanFixtures';
import { genCreatedPartialSample } from 'shared/test/sampleFixtures';
import { genAuthUser, genUser } from 'shared/test/userFixtures';
import YearRoute from 'src/components/YearRoute/YearRoute';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import PrescriptionListView from 'src/views/PrescriptionListView/PrescriptionListView';
import { mockRequests } from '../../../../test/requestTestUtils';

import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useParams: vi.fn()
  };
});
const programmingPlan = {
  ...genProgrammingPlan(),
  status: 'InProgress',
  statusDrom: 'InProgress'
};
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control'
});
const prescription2 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control'
});
const sample = genCreatedPartialSample({
  sampler: genUser(),
  programmingPlanId: programmingPlan.id,
  context: 'Control'
});

const programmingPlanRequest = {
  pathname: `/api/programming-plans?`,
  response: {
    body: JSON.stringify([programmingPlan])
  }
};

const prescriptionRequest = (region?: Region) => ({
  pathname: `/api/prescriptions?programmingPlanId=${
    programmingPlan.id
  }&context=Control${
    region ? `&region=${region}` : ''
  }&includes=substanceCount`,
  response: {
    body: JSON.stringify([prescription1, prescription2])
  }
});

const regionalPrescriptionRequest = (region?: Region) => ({
  pathname: `/api/prescriptions/regions?programmingPlanId=${
    programmingPlan.id
  }&context=Control${
    region ? `&region=${region}` : ''
  }&includes=comments%2CrealizedSampleCount`,
  response: {
    body: JSON.stringify(
      region
        ? [
            genRegionalPrescription({
              prescriptionId: prescription1.id,
              region
            })
          ]
        : RegionList.map((region) =>
            genRegionalPrescription({
              prescriptionId: prescription1.id,
              region
            })
          )
    )
  }
});

const sampleRequest = (region?: Region) => ({
  pathname: `/api/samples?programmingPlanId=${
    programmingPlan.id
  }&context=Control${region ? `&region=${region}` : ''}&status=Sent`,
  response: {
    body: JSON.stringify([sample])
  }
});

describe('PrescriptionListView', () => {
  const user = userEvent.setup();
  const authUser = genAuthUser();
  let store: Store;

  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser }
      }
    });
  });

  describe('for national coordinator', () => {
    const nationalCoordinator = genUser({
      roles: ['NationalCoordinator'],
      id: authUser.userId
    });
    const userRequest = {
      pathname: `/api/users/${nationalCoordinator.id}`,
      response: { body: JSON.stringify(nationalCoordinator) }
    };

    test('should render a table with prescriptions with editable cells for all matrix and region when in table view', async () => {
      mockRequests([
        programmingPlanRequest,
        prescriptionRequest(),
        regionalPrescriptionRequest(),
        userRequest,
        sampleRequest()
      ]);
      vi.mocked(useParams).mockReturnValue({
        year: String(programmingPlan.year)
      });
      const searchParams = '?context=Control';

      render(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[
              `/prescriptions/${programmingPlan.year}/${searchParams}`
            ]}
          >
            <YearRoute element={PrescriptionListView} />
          </MemoryRouter>
        </Provider>
      );

      expect(
        await screen.findByTestId('prescriptions-cards-segment')
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId('prescriptions-table-segment')
      ).toBeInTheDocument();

      await act(async () => {
        await user.click(screen.getByTestId('prescriptions-table-segment'));
      });

      expect(
        await screen.findByTestId('prescription-table')
      ).toBeInTheDocument();

      expect(
        await screen.findByTestId(`matrix-${prescription1.matrix}`)
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`matrix-${prescription2.matrix}`)
      ).toBeInTheDocument();
      expect(
        await screen.findAllByTestId(`cell-${prescription1.matrix}`)
      ).toHaveLength(RegionList.length);

      expect(
        await screen.findByTestId('add-matrix-button')
      ).toBeInTheDocument();
    });
  });

  describe('for regional coordinator', () => {
    const regionalCoordinator = genUser({
      roles: ['RegionalCoordinator'],
      id: authUser.userId
    });
    const userRequest = {
      pathname: `/api/users/${regionalCoordinator.id}`,
      response: { body: JSON.stringify(regionalCoordinator) }
    };

    test('should not display the addMatrix button', async () => {
      mockRequests([
        prescriptionRequest(regionalCoordinator.region as Region),
        userRequest
      ]);
      vi.mocked(useParams).mockReturnValue({
        programmingPlanId: programmingPlan.id
      });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionListView />
          </BrowserRouter>
        </Provider>
      );

      expect(screen.queryByTestId('add-matrix-button')).not.toBeInTheDocument();
    });
  });
});
