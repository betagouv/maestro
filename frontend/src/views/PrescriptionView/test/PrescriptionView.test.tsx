import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import Router, { BrowserRouter } from 'react-router-dom';
import { Region, RegionList } from 'shared/referential/Region';
import {
  genAuthUser,
  genPrescriptions,
  genProgrammingPlan,
  genSample,
  genUser,
} from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import PrescriptionView from 'src/views/PrescriptionView/PrescriptionView';
import { mockRequests } from '../../../../test/requestUtils.test';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const programmingPlan = {
  ...genProgrammingPlan(),
  status: 'InProgress',
};
const prescriptions1 = genPrescriptions(programmingPlan.id);
const prescriptions2 = genPrescriptions(programmingPlan.id);
const sample = genSample(genUser(), programmingPlan.id);

const prescriptionRequest = (region?: Region) => ({
  pathname: `/api/programming-plans/${programmingPlan.id}/prescriptions?${
    region ? `region=${region}` : ''
  }`,
  response: {
    body: JSON.stringify([...prescriptions1, ...prescriptions2]),
  },
});
const programmingPlanRequest = {
  pathname: `/api/programming-plans/${programmingPlan.id}`,
  response: {
    body: JSON.stringify(programmingPlan),
  },
};
const sampleRequest = (region?: Region) => ({
  pathname: `/api/samples?programmingPlanId=${programmingPlan.id}&status=Sent${
    region ? `&region=${region}` : ''
  }`,
  response: {
    body: JSON.stringify([sample]),
  },
});

describe('PrescriptionView', () => {
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

    test('should render a table with prescriptions with editable cells for all matrix and region when in table view', async () => {
      mockRequests([
        programmingPlanRequest,
        prescriptionRequest(),
        userRequest,
        regionsRequest,
        sampleRequest(),
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
    const regionalCoordinator = {
      ...genUser('RegionalCoordinator'),
      id: authUser.userId,
    };
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
        programmingPlanRequest,
        prescriptionRequest(regionalCoordinator.region as Region),
        userRequest,
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

      expect(screen.queryByTestId('add-matrix-button')).not.toBeInTheDocument();
    });
  });
});
