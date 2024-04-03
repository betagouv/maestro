import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import Router, { BrowserRouter } from 'react-router-dom';
import { RegionList } from 'shared/schema/Region';
import {
  genAuthUser,
  genPrescriptions,
  genProgrammingPlan,
  genUser,
} from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import PrescriptionView from 'src/views/PrescriptionView/PrescriptionView';
import { mockRequests } from '../../../../test/requestUtils.test';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const programmingPlan = genProgrammingPlan();
const prescriptions1 = genPrescriptions(programmingPlan.id);
const prescriptions2 = genPrescriptions(programmingPlan.id);

const prescriptionRequest = {
  pathname: `/api/programming-plans/${programmingPlan.id}/prescriptions`,
  response: {
    body: JSON.stringify([...prescriptions1, ...prescriptions2]),
  },
};
const programmingPlanRequest = {
  pathname: `/api/programming-plans/${programmingPlan.id}`,
  response: {
    body: JSON.stringify(programmingPlan),
  },
};

describe('PrescriptionView', () => {
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
    const nationalCoordinator = {
      ...genUser('NationalCoordinator'),
      id: authUser.userId,
    };
    const userRequest = {
      pathname: `/api/users/${nationalCoordinator.id}/infos`,
      response: { body: JSON.stringify(nationalCoordinator) },
    };
    const regionsRequest = {
      pathname: '/api/regions.geojson',
      response: { body: JSON.stringify({}) },
    };

    test('should display a segmented control to switch between table and map view which defaults to map view', async () => {
      mockRequests([
        programmingPlanRequest,
        prescriptionRequest,
        userRequest,
        regionsRequest,
      ]);
      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ programmingPlanId: programmingPlan.id });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

      expect(
        await screen.findByTestId('prescription-view-segmented-control')
      ).toBeInTheDocument();

      expect(await screen.findByTestId('prescription-map')).toBeInTheDocument();
      expect(
        screen.queryByTestId('prescription-table')
      ).not.toBeInTheDocument();
    });

    test('should render a table with prescriptions with editable cells for all matrix and region when in table view', async () => {
      mockRequests([
        programmingPlanRequest,
        prescriptionRequest,
        userRequest,
        regionsRequest,
      ]);
      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ programmingPlanId: programmingPlan.id });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

      const segmentedControl = await screen.findByTestId(
        'prescription-view-segmented-control'
      );

      await user.click(within(segmentedControl).getByLabelText('Tableau'));

      expect(
        await screen.findByTestId('prescription-table')
      ).toBeInTheDocument();
      expect(screen.queryByTestId('prescription-map')).not.toBeInTheDocument();

      const p1 = prescriptions1[0];
      const p2 = prescriptions2[0];
      expect(
        await screen.findByTestId(`sampleMatrix-${p1.sampleMatrix}`)
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`sampleMatrix-${p2.sampleMatrix}`)
      ).toBeInTheDocument();
      expect(
        await screen.findAllByTestId(`cell-${p1.sampleMatrix}`)
      ).toHaveLength(RegionList.length);

      expect(
        await screen.findByTestId('add-matrix-button')
      ).toBeInTheDocument();
    });
  });

  describe('for regional coordinator', () => {
    const regionalCoordinator = {
      ...genUser('RegionalCoordinator'),
      id: authUser.userId,
    };
    const userRequest = {
      pathname: `/api/users/${regionalCoordinator.id}/infos`,
      response: { body: JSON.stringify(regionalCoordinator) },
    };

    test('should not display a segmented control to switch between table and map view', async () => {
      mockRequests([programmingPlanRequest, prescriptionRequest, userRequest]);
      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ programmingPlanId: programmingPlan.id });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

      expect(
        screen.queryByTestId('prescription-view-segmented-control')
      ).not.toBeInTheDocument();
    });

    test('should render a table with prescriptions with non editable cells for regional coordinator', async () => {
      mockRequests([programmingPlanRequest, prescriptionRequest, userRequest]);

      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ programmingPlanId: programmingPlan.id });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

      expect(
        await screen.findByTestId('prescription-table')
      ).toBeInTheDocument();
      expect(screen.queryByTestId('prescription-map')).not.toBeInTheDocument();

      const p1 = prescriptions1[0];
      const p2 = prescriptions2[0];
      expect(
        await screen.findByTestId(`sampleMatrix-${p1.sampleMatrix}`)
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`sampleMatrix-${p2.sampleMatrix}`)
      ).toBeInTheDocument();
      expect(
        await screen.findAllByTestId(`cell-${p1.sampleMatrix}`)
      ).toHaveLength(1);
    });

    test('should not display the addMatrix button', async () => {
      mockRequests([programmingPlanRequest, prescriptionRequest, userRequest]);
      jest
        .spyOn(Router, 'useParams')
        .mockReturnValue({ programmingPlanId: programmingPlan.id });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

      expect(screen.queryByTestId('add-matrix-button')).not.toBeInTheDocument();
    });
  });
});
