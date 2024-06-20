import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import Router, { BrowserRouter } from 'react-router-dom';
import {
  genAuthUser,
  genCreatedSample,
  genPrescriptions,
  genProgrammingPlan,
  genSample,
  genUser,
} from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import SampleView from 'src/views/SampleView/SampleView';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../test/requestUtils.test';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

let store: Store;
const authUser = genAuthUser();
const sampler = {
  ...genUser('Sampler'),
  id: authUser.userId,
};
const userRequest = {
  pathname: `/api/users/${sampler.id}/infos`,
  response: { body: JSON.stringify(sampler) },
};
const programmingPlan1 = genProgrammingPlan();
const programmingPlan2 = genProgrammingPlan();
const programmingPlanRequest = {
  pathname: `/api/programming-plans?status=Validated`,
  response: {
    body: JSON.stringify([programmingPlan1, programmingPlan2]),
  },
};
const prescriptions = genPrescriptions(programmingPlan1.id);
const prescriptionsRequest = {
  pathname: `/api/programming-plans/${programmingPlan1.id}/prescriptions?`,
  response: { body: JSON.stringify(prescriptions) },
};

describe('SampleView', () => {
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

  test('should render the first step for a new sample', async () => {
    mockRequests([userRequest]);
    jest.spyOn(Router, 'useParams').mockReturnValue({ sampleId: undefined });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleView />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(
        screen.getByTestId('draft_sample_creation_form')
      ).toBeInTheDocument();
    });
  });

  test('should render the second step for a draft sample', async () => {
    const createdSample = genCreatedSample(sampler, programmingPlan1.id);
    mockRequests([
      userRequest,
      prescriptionsRequest,
      {
        pathname: `/api/samples/${createdSample.id}`,
        response: { body: JSON.stringify(createdSample) },
      },
    ]);
    jest
      .spyOn(Router, 'useParams')
      .mockReturnValue({ sampleId: createdSample.id });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleView />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(
        screen.getByTestId('draft_sample_maatrix_form')
      ).toBeInTheDocument();
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${createdSample.id}`)
      )
    ).toHaveLength(1);
  });

  test('should render the third step for a sample with status DraftItems', async () => {
    const draftSample = {
      ...genSample(),
      status: 'DraftItems',
    };
    mockRequests([
      userRequest,
      {
        pathname: `/api/samples/${draftSample.id}`,
        response: { body: JSON.stringify(draftSample) },
      },
    ]);
    jest
      .spyOn(Router, 'useParams')
      .mockReturnValue({ sampleId: draftSample.id });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleView />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('draft_sample_items_form')).toBeInTheDocument();
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}`)
      )
    ).toHaveLength(1);
  });

  test('should render the fourth step for a sample with status Submitted', async () => {
    const draftSample = {
      ...genSample(),
      status: 'Submitted',
    };
    mockRequests([
      userRequest,
      programmingPlanRequest,
      {
        pathname: `/api/samples/${draftSample.id}`,
        response: { body: JSON.stringify(draftSample) },
      },
    ]);
    jest
      .spyOn(Router, 'useParams')
      .mockReturnValue({ sampleId: draftSample.id });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleView />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('sample_data')).toBeInTheDocument();
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}`)
      )
    ).toHaveLength(1);
  });
});
