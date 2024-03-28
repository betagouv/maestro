import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import Router, { BrowserRouter } from 'react-router-dom';
import { RegionList } from 'shared/schema/Region';
import {
  genAuthUser,
  genPrescriptions,
  genUser,
} from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import PrescriptionView from 'src/views/PrescriptionView/PrescriptionView';
import { v4 as uuidv4 } from 'uuid';
import { mockRequests } from '../../../../test/requestUtils.test';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const programmingPlanId = uuidv4();
const prescriptions1 = genPrescriptions(programmingPlanId);
const prescriptions2 = genPrescriptions(programmingPlanId);

const prescriptionRequest = {
  pathname: `/api/programming-plans/${programmingPlanId}/prescriptions`,
  response: {
    body: JSON.stringify([...prescriptions1, ...prescriptions2]),
  },
};
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

    test('should render a table with prescriptions with editable cells for all matrix and region', async () => {
      mockRequests([prescriptionRequest, userRequest]);
      jest.spyOn(Router, 'useParams').mockReturnValue({ programmingPlanId });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

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
    });

    test('should display the addMatrix button', async () => {
      mockRequests([prescriptionRequest, userRequest]);
      jest.spyOn(Router, 'useParams').mockReturnValue({ programmingPlanId });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
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
      mockRequests([prescriptionRequest, userRequest]);

      jest.spyOn(Router, 'useParams').mockReturnValue({ programmingPlanId });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <PrescriptionView />
          </BrowserRouter>
        </Provider>
      );

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
      mockRequests([prescriptionRequest, userRequest]);
      jest.spyOn(Router, 'useParams').mockReturnValue({ programmingPlanId });

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
