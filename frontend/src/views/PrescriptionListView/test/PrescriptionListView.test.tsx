import { configureStore, Store } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import Router, { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { MatrixList } from 'shared/referential/Matrix/Matrix';
import { Region, RegionList } from 'shared/referential/Region';
import { StageList } from 'shared/referential/Stage';
import { genPrescriptions } from 'shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'shared/test/programmingPlanFixtures';
import { genCreatedPartialSample } from 'shared/test/sampleFixtures';
import { oneOf } from 'shared/test/testFixtures';
import { genAuthUser, genUser } from 'shared/test/userFixtures';
import YearRoute from 'src/components/YearRoute/YearRoute';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import PrescriptionListView from 'src/views/PrescriptionListView/PrescriptionListView';
import { mockRequests } from '../../../../test/requestUtils.test';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const programmingPlan = {
  ...genProgrammingPlan(),
  status: 'InProgress',
};
const prescriptions1 = genPrescriptions({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrix: oneOf(MatrixList),
  stages: [oneOf(StageList)],
});
const prescriptions2 = genPrescriptions({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrix: oneOf(MatrixList),
  stages: [oneOf(StageList)],
});
const sample = genCreatedPartialSample({
  sampler: genUser(),
  programmingPlanId: programmingPlan.id,
  context: 'Control',
});

const programmingPlanRequest = {
  pathname: `/api/programming-plans?`,
  response: {
    body: JSON.stringify([programmingPlan]),
  },
};

const prescriptionRequest = (region?: Region) => ({
  pathname: `/api/prescriptions?programmingPlanId=${
    programmingPlan.id
  }&context=Control${region ? `&region=${region}` : ''}`,
  response: {
    body: JSON.stringify([...prescriptions1, ...prescriptions2]),
  },
});

const sampleRequest = (region?: Region) => ({
  pathname: `/api/samples?programmingPlanId=${
    programmingPlan.id
  }&context=Control${region ? `&region=${region}` : ''}&status=Sent`,
  response: {
    body: JSON.stringify([sample]),
  },
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
        auth: { authUser },
      },
    });
  });

  describe('for national coordinator', () => {
    const nationalCoordinator = genUser({
      roles: ['NationalCoordinator'],
      id: authUser.userId,
    });
    const userRequest = {
      pathname: `/api/users/${nationalCoordinator.id}/infos`,
      response: { body: JSON.stringify(nationalCoordinator) },
    };

    test('should render a table with prescriptions with editable cells for all matrix and region when in table view', async () => {
      mockRequests([
        programmingPlanRequest,
        prescriptionRequest(),
        userRequest,
        sampleRequest(),
      ]);
      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ year: String(programmingPlan.year) });
      const searchParams = '?context=Control';

      render(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[
              `/prescriptions/${programmingPlan.year}/${searchParams}`,
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

      const p1 = prescriptions1[0];
      const p2 = prescriptions2[0];
      expect(
        await screen.findByTestId(`matrix-${p1.matrix}-${p1.stages}`)
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`matrix-${p2.matrix}-${p2.stages}`)
      ).toBeInTheDocument();
      expect(await screen.findAllByTestId(`cell-${p1.matrix}`)).toHaveLength(
        RegionList.length
      );

      expect(
        await screen.findByTestId('add-matrix-button')
      ).toBeInTheDocument();
    });
  });

  describe('for regional coordinator', () => {
    const regionalCoordinator = genUser({
      roles: ['RegionalCoordinator'],
      id: authUser.userId,
    });
    const userRequest = {
      pathname: `/api/users/${regionalCoordinator.id}/infos`,
      response: { body: JSON.stringify(regionalCoordinator) },
    };

    test('should render a table with prescriptions with non editable cells for regional coordinator', async () => {
      mockRequests([
        programmingPlanRequest,
        prescriptionRequest(regionalCoordinator.region as Region),
        userRequest,
        sampleRequest(regionalCoordinator.region as Region),
      ]);

      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ year: String(programmingPlan.year) });

      const searchParams = '?context=Control';

      render(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[
              `/prescriptions/${programmingPlan.year}${searchParams}`,
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

      const p1 = prescriptions1[0];
      const p2 = prescriptions2[0];
      expect(
        await screen.findByTestId(`matrix-${p1.matrix}-${p1.stages}`)
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`matrix-${p2.matrix}-${p2.stages}`)
      ).toBeInTheDocument();
      expect(await screen.findAllByTestId(`cell-${p1.matrix}`)).toHaveLength(1);
    });

    test('should not display the addMatrix button', async () => {
      mockRequests([
        prescriptionRequest(regionalCoordinator.region as Region),
        userRequest,
      ]);
      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ programmingPlanId: programmingPlan.id });

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
